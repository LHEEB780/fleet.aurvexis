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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { 
  Wrench, 
  Truck, 
  TrendingUp, 
  AlertTriangle, 
  Layers, 
  Search, 
  DollarSign, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  BarChart3, 
  PieChart as PieIcon, 
  Info, 
  SlidersHorizontal, 
  Sparkles,
  ArrowUpRight,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, MaintenanceOrder, InventoryItem } from '../types';

interface PartsConsumptionAnalysisProps {
  vehicles: Vehicle[];
  orders: MaintenanceOrder[];
  inventory: InventoryItem[];
  language: 'ar' | 'en';
}

interface VehicleSummaryItem {
  vehicleId: string;
  vehicleName: string;
  plateNumber: string;
  type: string;
  partsCount: number;
  partsList: { name: string; count: number; estCost: number }[];
  totalEstCost: number;
  ordersCount: number;
}

interface AggregatedPartItem {
  name: string;
  count: number;
  estCost: number;
  sku: string;
  currentStock: number;
  minStock: number;
}

export function PartsConsumptionAnalysis({ vehicles, orders, inventory, language }: PartsConsumptionAnalysisProps) {
  // Filter and search states
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'count' | 'estCost'>('count');

  // Human readable labels
  const t = {
    title: language === 'ar' ? 'تحليل استهلاك قطع الغيار لكل مركبة' : 'Spare Parts Consumption Analysis per Vehicle',
    subtitle: language === 'ar' ? 'تحليل مفصل لاستهلاك القطع والمستلزمات في الصيانة للمساعدة في تخطيط المخزون والتموين' : 'Detailed breakdown of spare parts usage to optimize stocking levels and forecast procurement requirements',
    searchPlaceholder: language === 'ar' ? 'البحث باسم المركبة أو لوحتها...' : 'Search by vehicle name or plate...',
    allVehicles: language === 'ar' ? 'كل المركبات (نظرة شاملة)' : 'All Vehicles (Fleet Overview)',
    selectVehicle: language === 'ar' ? 'تصفية حسب المركبة' : 'Filter by Vehicle',
    totalPartsUsed: language === 'ar' ? 'إجمالي القطع المستهلكة' : 'Total Parts Consumed',
    estimatedCost: language === 'ar' ? 'التكلفة الإجمالية التقديرية' : 'Estimated Total Cost',
    avgPartsPerOrder: language === 'ar' ? 'متوسط القطع لكل أمر' : 'Avg Parts per Work Order',
    mostConsumedPart: language === 'ar' ? 'القطعة الأكثر طلباً' : 'Most In-Demand Part',
    partName: language === 'ar' ? 'اسم القطعة الصنف' : 'Part Name / Item',
    partNumber: language === 'ar' ? 'رقم القطعة' : 'Part Number',
    timesConsumed: language === 'ar' ? 'مرات الاستهلاك' : 'Times Consumed',
    currentStock: language === 'ar' ? 'الرصيد الحالي بالمخزن' : 'Current Stock Balance',
    status: language === 'ar' ? 'الحالة والمؤشر' : 'Status / Alert',
    lowStockWarning: language === 'ar' ? 'مخزون حرج! بحاجة لإعادة طلب' : 'Critical Stock! Needs Reorder',
    healthyStock: language === 'ar' ? 'مخزون كافٍ وسليم' : 'Healthy Stock Level',
    noData: language === 'ar' ? 'لم يتم العثور على أي قطع غيار مستهلكة بناءً على الفلاتر المحددة.' : 'No consumed parts found matching the selected filters.',
    chartsTitle: language === 'ar' ? 'الرسوم البيانية وتوزيع الاستهلاك' : 'Consumption Visualizations & Trends',
    partsUsageQty: language === 'ar' ? 'كمية الاستهلاك (حبة)' : 'Consumed Quantity (Units)',
    monthlyTrend: language === 'ar' ? 'معدل سحب القطع الشهري' : 'Monthly Parts Withdrawal Trend',
    vehicleRanking: language === 'ar' ? 'ترتيب المركبات الأكثر استهلاكاً للقطع' : 'Highest Parts Consuming Vehicles',
    costCurrency: language === 'ar' ? 'ر.س' : 'SAR',
    vehicleDetails: language === 'ar' ? 'بيانات تفصيلية للمركبة المختارة' : 'Selected Vehicle Breakdown',
    plateNumber: language === 'ar' ? 'رقم اللوحة' : 'Plate Number',
    vehicleType: language === 'ar' ? 'نوع المركبة' : 'Vehicle Type',
    ordersCount: language === 'ar' ? 'أوامر الصيانة المنفذة' : 'Maintenance Orders Executed',
    criticalPartsNotice: language === 'ar' ? 'إشعار فوري: قطع غيار ذات استهلاك عالٍ وتحت حد الأمان' : 'Live Notice: Highly consumed parts that are under safety threshold',
    recommendation: language === 'ar' ? 'التوصية الذكية للمخزون' : 'Smart Stock Recommendation',
    recommendationText: language === 'ar' ? 'ينصح برفع الحد الأدنى لإعادة الطلب لهذه القطعة نظراً لكثرة استهلاكها مؤخراً.' : 'Recommended to raise the minimum safety stock level due to high consumption rates.'
  };

  // 1. Build a map of prices and details from our inventory list for easy lookup
  const inventoryMap = useMemo(() => {
    const map: Record<string, { price: number; sku: string; quantity: number; minQuantity: number }> = {};
    inventory.forEach(item => {
      const normName = item.name.trim().toLowerCase();
      map[normName] = {
        price: item.price || 150, // default fallback price
        sku: item.partNumber || item.sku || 'N/A',
        quantity: item.quantity,
        minQuantity: item.minQuantity
      };
    });
    return map;
  }, [inventory]);

  // Helper to resolve price, SKU and quantity for a part
  const getPartDetails = (partName: string) => {
    const norm = partName.trim().toLowerCase();
    // Try exact match or loose substring match
    let match = inventoryMap[norm];
    if (!match) {
      const key = Object.keys(inventoryMap).find(k => k.includes(norm) || norm.includes(k));
      if (key) match = inventoryMap[key];
    }
    return match || { price: 150, sku: 'GEN-' + Math.floor(Math.random() * 9000 + 1000), quantity: 15, minQuantity: 5 };
  };

  // 2. Filter orders to only completed/in-progress ones containing partsUsed
  const validOrders = useMemo(() => {
    return orders.filter(o => o.partsUsed && Array.isArray(o.partsUsed) && o.partsUsed.length > 0);
  }, [orders]);

  // 3. Extract parts consumed per vehicle
  const vehiclePartsSummary = useMemo<Record<string, VehicleSummaryItem>>(() => {
    const summary: Record<string, VehicleSummaryItem> = {};

    vehicles.forEach(v => {
      summary[v.id] = {
        vehicleId: v.id,
        vehicleName: v.name,
        plateNumber: v.plateNumber,
        type: v.type,
        partsCount: 0,
        partsList: [],
        totalEstCost: 0,
        ordersCount: 0
      };
    });

    validOrders.forEach(o => {
      const vId = o.vehicleId;
      if (!summary[vId]) {
        // Fallback if vehicle is not in main list
        summary[vId] = {
          vehicleId: vId,
          vehicleName: language === 'ar' ? 'مركبة غير مسجلة' : 'Unregistered Vehicle',
          plateNumber: 'N/A',
          type: 'Other',
          partsCount: 0,
          partsList: [],
          totalEstCost: 0,
          ordersCount: 0
        };
      }

      summary[vId].ordersCount++;

      o.partsUsed?.forEach(pName => {
        summary[vId].partsCount++;
        const details = getPartDetails(pName);
        summary[vId].totalEstCost += details.price;

        const existingPart = summary[vId].partsList.find(p => p.name.trim().toLowerCase() === pName.trim().toLowerCase());
        if (existingPart) {
          existingPart.count++;
          existingPart.estCost += details.price;
        } else {
          summary[vId].partsList.push({
            name: pName,
            count: 1,
            estCost: details.price
          });
        }
      });
    });

    return summary;
  }, [vehicles, validOrders, language, inventoryMap]);

  // 4. Calculate aggregate parts frequency (for the selected vehicle or overall)
  const aggregatedParts = useMemo<AggregatedPartItem[]>(() => {
    const freq: Record<string, AggregatedPartItem> = {};

    const targetVehicleIds = selectedVehicleId === 'all' 
      ? Object.keys(vehiclePartsSummary) 
      : [selectedVehicleId];

    targetVehicleIds.forEach(vId => {
      const vSum = vehiclePartsSummary[vId];
      if (!vSum) return;

      vSum.partsList.forEach(p => {
        const details = getPartDetails(p.name);
        const norm = p.name.trim();
        if (freq[norm]) {
          freq[norm].count += p.count;
          freq[norm].estCost += p.estCost;
        } else {
          freq[norm] = {
            name: p.name,
            count: p.count,
            estCost: p.estCost,
            sku: details.sku,
            currentStock: details.quantity,
            minStock: details.minQuantity
          };
        }
      });
    });

    return Object.values(freq).sort((a, b) => b[sortBy] - a[sortBy]);
  }, [selectedVehicleId, vehiclePartsSummary, sortBy]);

  // 5. Monthly parts consumption trend
  const monthlyTrendData = useMemo(() => {
    const monthsArabic = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const monthsEnglish = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const counts: Record<number, number> = {};
    for (let i = 1; i <= 12; i++) counts[i] = 0;

    validOrders.forEach(o => {
      if (selectedVehicleId !== 'all' && o.vehicleId !== selectedVehicleId) return;
      if (o.date) {
        const partsCount = o.partsUsed?.length || 0;
        const monthIndex = parseInt(o.date.split('-')[1]);
        if (monthIndex >= 1 && monthIndex <= 12) {
          counts[monthIndex] += partsCount;
        }
      }
    });

    return Object.entries(counts).map(([monthNum, totalParts]) => {
      const idx = parseInt(monthNum) - 1;
      return {
        name: language === 'ar' ? monthsArabic[idx] : monthsEnglish[idx],
        [language === 'ar' ? 'القطع المستهلكة' : 'Consumed Parts']: totalParts
      };
    });
  }, [selectedVehicleId, validOrders, language]);

  // 6. Top vehicles consuming parts ranking (For Bar Chart & Cards)
  const topPartsConsumingVehicles = useMemo(() => {
    return (Object.values(vehiclePartsSummary) as VehicleSummaryItem[])
      .filter(v => v.partsCount > 0)
      .sort((a, b) => b.partsCount - a.partsCount)
      .slice(0, 8)
      .map(v => ({
        id: v.vehicleId,
        name: v.vehicleName,
        plate: v.plateNumber,
        type: v.type,
        count: v.partsCount,
        cost: v.totalEstCost
      }));
  }, [vehiclePartsSummary]);

  // Filter vehicles for dropdown based on search
  const filteredVehiclesList = useMemo(() => {
    return vehicles.filter(v => {
      const text = `${v.name} ${v.plateNumber}`.toLowerCase();
      return text.includes(searchTerm.toLowerCase());
    });
  }, [vehicles, searchTerm]);

  // KPI Calculations
  const kpis = useMemo(() => {
    let totalParts = 0;
    let totalCost = 0;
    let ordersWithParts = 0;

    if (selectedVehicleId === 'all') {
      (Object.values(vehiclePartsSummary) as VehicleSummaryItem[]).forEach(v => {
        totalParts += v.partsCount;
        totalCost += v.totalEstCost;
        ordersWithParts += v.ordersCount;
      });
    } else {
      const vSum = vehiclePartsSummary[selectedVehicleId];
      if (vSum) {
        totalParts = vSum.partsCount;
        totalCost = vSum.totalEstCost;
        ordersWithParts = vSum.ordersCount;
      }
    }

    const avgParts = ordersWithParts > 0 ? (totalParts / ordersWithParts).toFixed(1) : '0';
    const topPart = aggregatedParts[0]?.name || (language === 'ar' ? 'لا يوجد' : 'None');

    return {
      totalParts,
      totalCost,
      avgParts,
      topPart
    };
  }, [selectedVehicleId, vehiclePartsSummary, aggregatedParts, language]);

  // Highly consumed parts that are low in stock
  const criticalLowStockAlerts = useMemo(() => {
    return aggregatedParts
      .filter(p => p.currentStock <= p.minStock && p.count >= 2)
      .slice(0, 3);
  }, [aggregatedParts]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Notice for low stock of highly used parts */}
      <AnimatePresence>
        {criticalLowStockAlerts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert size={18} className="animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs font-black text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <span>{t.criticalPartsNotice}</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                </h4>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] font-bold text-rose-700 dark:text-rose-450">
                  {criticalLowStockAlerts.map((part, i) => (
                    <span key={i}>
                      ⚠️ {part.name} ({language === 'ar' ? 'تم استهلاك' : 'consumed'} {part.count}x - {language === 'ar' ? 'المتبقي:' : 'remaining:'} {part.currentStock})
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/30 px-3 py-1 rounded-lg">
                {t.recommendation}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header and Vehicle Selector */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Left part: Selection and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Main selection input dropdown */}
          <div className="relative shrink-0 w-full sm:w-64">
            <span className="text-[10px] text-slate-450 font-black block mb-1.5">{t.selectVehicle}</span>
            <div className="flex items-center gap-2">
              <select
                value={selectedVehicleId}
                onChange={(e) => {
                  setSelectedVehicleId(e.target.value);
                }}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-black text-slate-850 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">{t.allVehicles}</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    🚗 {v.name} ({v.plateNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick search input to filter long vehicle lists */}
          <div className="relative w-full sm:w-60">
            <span className="text-[10px] text-slate-450 font-black block mb-1.5">{language === 'ar' ? 'بحث سريع' : 'Quick Search'}</span>
            <div className="relative">
              <Search size={14} className="absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Auto reset to 'all' if searching to find vehicles
                  if (selectedVehicleId !== 'all') setSelectedVehicleId('all');
                }}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-9 py-1.5 text-xs font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Sort and Actions */}
        <div className="flex items-center gap-2.5 self-end md:self-auto mt-4 md:mt-0">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-250/40 dark:border-slate-800 px-2 py-1 rounded-xl">
            <SlidersHorizontal size={12} className="text-slate-450" />
            <span className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'ترتيب حسب:' : 'Sort by:'}</span>
            <button
              onClick={() => setSortBy('count')}
              className={`px-2 py-0.5 text-[9.5px] font-black rounded-md cursor-pointer transition-all ${
                sortBy === 'count' 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                  : 'text-slate-400 hover:text-slate-650'
              }`}
            >
              {language === 'ar' ? 'الكمية' : 'Quantity'}
            </button>
            <button
              onClick={() => setSortBy('estCost')}
              className={`px-2 py-0.5 text-[9.5px] font-black rounded-md cursor-pointer transition-all ${
                sortBy === 'estCost' 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                  : 'text-slate-400 hover:text-slate-650'
              }`}
            >
              {language === 'ar' ? 'التكلفة' : 'Cost'}
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/55 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200/50 dark:border-slate-800 flex items-center justify-center cursor-pointer shadow-sm transition-all"
            title={language === 'ar' ? 'طباعة التقرير الفني' : 'Print Technical Report'}
          >
            <Printer size={15} />
          </button>
        </div>

      </div>

      {/* KPI Stats Widgets Bento Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-right">
        {/* Total parts consumed */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-705 shadow-soft flex items-center justify-between group hover:-translate-y-1 transition-all duration-350">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold block">{t.totalPartsUsed}</span>
            <span className="text-xl lg:text-2xl font-mono font-black text-slate-850 dark:text-white block">
              {kpis.totalParts} <span className="text-xs font-bold text-slate-400">{language === 'ar' ? 'قطعة' : 'pcs'}</span>
            </span>
            <span className="text-[8.5px] text-indigo-500 font-bold block">
              {selectedVehicleId === 'all' 
                ? (language === 'ar' ? 'لكافة أسطول النقل بالشركة' : 'Across all company fleet')
                : (language === 'ar' ? 'إجمالي مسحوبات هذه المركبة' : 'Total withdrawals for this car')
              }
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Wrench size={18} className="group-hover:rotate-45 transition-transform duration-300" />
          </div>
        </div>

        {/* Estimated cost */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-705 shadow-soft flex items-center justify-between group hover:-translate-y-1 transition-all duration-350">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold block">{t.estimatedCost}</span>
            <span className="text-xl lg:text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 block">
              {kpis.totalCost.toLocaleString()} <span className="text-xs font-bold">{t.costCurrency}</span>
            </span>
            <span className="text-[8.5px] text-slate-400 font-bold block">
              {language === 'ar' ? 'تكلفة تقديرية بناءً على المخزون' : 'Estimated asset procurement price'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign size={18} />
          </div>
        </div>

        {/* Average parts used */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-705 shadow-soft flex items-center justify-between group hover:-translate-y-1 transition-all duration-350">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold block">{t.avgPartsPerOrder}</span>
            <span className="text-xl lg:text-2xl font-mono font-black text-amber-500 block">
              {kpis.avgParts} <span className="text-xs font-bold text-slate-400">{language === 'ar' ? 'قطع/أمر' : 'parts/WO'}</span>
            </span>
            <span className="text-[8.5px] text-slate-400 font-bold block">
              {language === 'ar' ? 'معدل السحب لكل بطاقة صيانة' : 'Average items used per repair'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
        </div>

        {/* Most consumed part */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-705 shadow-soft flex items-center justify-between group hover:-translate-y-1 transition-all duration-350">
          <div className="space-y-1 w-[70%]">
            <span className="text-[10px] text-slate-400 font-extrabold block">{t.mostConsumedPart}</span>
            <span className="text-sm font-black text-slate-800 dark:text-white block truncate leading-tight mt-1" title={kpis.topPart}>
              {kpis.topPart}
            </span>
            <span className="text-[8.5px] text-slate-450 font-bold block">
              {aggregatedParts[0]?.count 
                ? (language === 'ar' ? `تكررت ${aggregatedParts[0].count} مرات` : `Requested ${aggregatedParts[0].count} times`)
                : (language === 'ar' ? 'لا توجد سحوبات' : 'No records yet')
              }
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <TrendingUp size={18} />
          </div>
        </div>
      </div>

      {/* Visualizations Container Bento Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recharts Parts Consumption Distribution Bar Chart */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 pb-3">
            <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={15} className="text-indigo-600" />
              <span>{language === 'ar' ? 'القطع الأكثر استهلاكاً وفقاً للفلاتر' : 'Most Consumed Spare Parts Distribution'}</span>
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{sortBy === 'count' ? t.timesConsumed : t.estimatedCost}</span>
          </div>

          <div className="h-64">
            {aggregatedParts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                <AlertTriangle size={30} className="mb-2 text-slate-300" />
                <span>{t.noData}</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aggregatedParts.slice(0, 7)} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2534" className="hidden dark:block" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={120} tickLine={false} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 text-right text-xs space-y-1">
                            <p className="font-extrabold">{data.name}</p>
                            <p className="text-slate-350">{language === 'ar' ? 'عدد السحوبات:' : 'Withdrawals count:'} <span className="font-mono text-white font-black">{data.count}</span></p>
                            <p className="text-slate-400">{language === 'ar' ? 'التكلفة الإجمالية:' : 'Total Cost:'} <span className="font-mono text-emerald-400 font-bold">{data.estCost.toLocaleString()} {t.costCurrency}</span></p>
                            <p className="text-[10px] text-slate-450">{language === 'ar' ? 'الرصيد بالرفوف:' : 'In stock:'} {data.currentStock}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey={sortBy === 'count' ? 'count' : 'estCost'} fill="#4f46e5" radius={[0, 4, 4, 0]}>
                    {aggregatedParts.slice(0, 7).map((entry, index) => {
                      const isLowStock = entry.currentStock <= entry.minStock;
                      return <Cell key={`cell-${index}`} fill={isLowStock ? '#ef4444' : '#6366f1'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Trend Chart / Vehicle Comparison Panel */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 pb-3 mb-4">
              <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar size={15} className="text-indigo-650" />
                <span>{t.monthlyTrend}</span>
              </h3>
            </div>
            
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="partsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2534" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey={language === 'ar' ? 'القطع المستهلكة' : 'Consumed Parts'} 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#partsGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-2xl text-right">
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black block mb-1">
              💡 {language === 'ar' ? 'رؤية ميكانيكية استباقية' : 'Proactive Fleet Insight'}
            </span>
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'ar' 
                ? 'معدلات تكرار الاستبدال توضح أن المجموعات الأكثر استهلاكاً تتركز في الفرامل وأنظمة التعليق، ويفضل الحفاظ على فترات فحص وقائي مبكر لتقليل الاستبدال الكامل للقطع.'
                : 'Replacement rates demonstrate that suspension components and braking systems have high attrition. Instituting preventive inspections reduces total failure rates.'
              }
            </p>
          </div>
        </div>

      </div>

      {/* Grid: Breakdown Details Table per item & Top Vehicles List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: List of Detailed Consumed Spare Parts with Stock Alerts */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft lg:col-span-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60 mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {language === 'ar' ? 'تفاصيل استهلاك قطع الغيار المعينة والمطابقة' : 'Detailed Stock Utilization & Health Status'}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {language === 'ar' ? 'مستويات سحب وتوفر القطع ومقدار توافقها مع مستويات إعادة الطلب' : 'Overview of inventory withdrawals, stock quantities, and warning indicators.'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/80 text-slate-400 font-extrabold pb-2">
                  <th className="py-2.5 px-3">{t.partName}</th>
                  <th className="py-2.5 px-3">{t.partNumber}</th>
                  <th className="py-2.5 px-3 text-center">{t.timesConsumed}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'ar' ? 'إجمالي التكلفة' : 'Est. Cost'}</th>
                  <th className="py-2.5 px-3 text-center">{t.currentStock}</th>
                  <th className="py-2.5 px-3 text-center">{t.status}</th>
                </tr>
              </thead>
              <tbody>
                {aggregatedParts.map((part, index) => {
                  const isLowStock = part.currentStock <= part.minStock;
                  return (
                    <tr key={index} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 font-bold transition-all">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span className="text-slate-850 dark:text-slate-150 font-black">{part.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] text-slate-450">{part.sku}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-black text-slate-900 dark:text-white">
                        {part.count}x
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                        {part.estCost.toLocaleString()} {t.costCurrency}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={isLowStock ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-700 dark:text-slate-300'}>
                          {part.currentStock} / <span className="text-slate-400 text-[10px]">{part.minStock} {language === 'ar' ? 'الحد الأدنى' : 'min'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                            <AlertTriangle size={10} />
                            {t.lowStockWarning}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                            <CheckCircle2 size={10} />
                            {t.healthyStock}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {aggregatedParts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-xs font-bold">
                      {t.noData}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Fleet-wide consumption top-chart list ranking */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft lg:col-span-4 space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Truck size={14} className="text-indigo-600" />
              <span>{t.vehicleRanking}</span>
            </h3>
            <p className="text-[9.5px] text-slate-400 mt-0.5">
              {language === 'ar' ? 'أكثر المركبات تطلباً لقطع الغيار والصيانة بالأسطول' : 'Vehicles with the highest parts consumption volume'}
            </p>
          </div>

          <div className="space-y-3">
            {topPartsConsumingVehicles.map((veh, index) => {
              const isSelected = selectedVehicleId === veh.id;
              return (
                <div 
                  key={veh.id}
                  onClick={() => setSelectedVehicleId(veh.id)}
                  className={`p-3 rounded-2xl border transition-all duration-200 text-right cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-xs' 
                      : 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800 hover:border-slate-250 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-black text-slate-850 dark:text-white block">
                      {veh.name}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                      <span>🚗 {veh.type}</span>
                      <span>•</span>
                      <span>🆔 {veh.plate}</span>
                    </div>
                  </div>

                  <div className="text-left space-y-1 shrink-0">
                    <span className="inline-block text-[10.5px] font-black font-sans px-2.5 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                      {veh.count} {language === 'ar' ? 'قطع' : 'parts'}
                    </span>
                    <span className="block text-[10px] font-bold text-slate-500 font-mono">
                      ~ {veh.cost.toLocaleString()} {t.costCurrency}
                    </span>
                  </div>
                </div>
              );
            })}

            {topPartsConsumingVehicles.length === 0 && (
              <div className="py-10 text-center font-bold text-slate-400 text-xs">
                {language === 'ar' ? 'لا توجد بيانات صيانة منجزة بعد.' : 'No maintenance data completed yet.'}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
