import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Calendar,
  ChevronDown,
  FileText,
  DollarSign,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  FileSpreadsheet,
  Users,
  Wrench,
  Building,
  Layers,
  Sparkles,
  Info,
  Dribbble,
  Maximize2,
  ListFilter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Bot,
  Activity
} from 'lucide-react';
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
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import { vehicles as staticVehicles, maintenanceOrders as staticOrders, technicians as staticTechnicians } from '../data';
import { User, Vehicle, MaintenanceOrder, Technician, InventoryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../services/LanguageContext';
import ContextualHelp from './ContextualHelp';
import { PartsConsumptionAnalysis } from './PartsConsumptionAnalysis';
import { ManagerDashboardReport } from './ManagerDashboardReport';
import { MonthlyCostBreakdownChart } from './MonthlyCostBreakdownChart';
import { formatCurrency, getCurrencyLabel, getConversionRateFromSAR } from '../services/formatters';

interface ReportsProps {
  user: User;
  isDarkMode: boolean;
}

export default function Reports({ user, isDarkMode }: ReportsProps) {
  const { language } = useLanguage();
  // -------------------------------------------------------------
  // Data State Bindings with LocalStorage & Original Data Fallbacks
  // -------------------------------------------------------------
  const vehiclesList = useMemo<Vehicle[]>(() => {
    const saved = localStorage.getItem('fleet_vehicles_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return staticVehicles;
  }, []);

  const ordersList = useMemo<MaintenanceOrder[]>(() => {
    const saved = localStorage.getItem('fleet_maintenance_orders_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return staticOrders;
  }, []);

  const techniciansList = useMemo<Technician[]>(() => {
    const saved = localStorage.getItem('fleet_technicians_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((t: any) => {
            const initMatch = staticTechnicians.find(it => it.id === t.id);
            return {
              ...t,
              name: initMatch ? initMatch.name : t.name,
              avatar: initMatch ? initMatch.avatar : t.avatar,
            };
          });
        }
      } catch (e) {}
    }
    return staticTechnicians;
  }, []);

  const inventoryList = useMemo<InventoryItem[]>(() => {
    const saved = localStorage.getItem('fleet_inventory_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  }, []);

  const workshopsList = useMemo<any[]>(() => {
    const saved = localStorage.getItem('fleet_workshops');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  }, []);

  // -------------------------------------------------------------
  // Filter States
  // -------------------------------------------------------------
  const [timeframe, setTimeframe] = useState<'all' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'financial' | 'fleet' | 'techs' | 'inventory' | 'safety' | 'parts_analysis' | 'manager_dashboard' | 'monthly_breakdown'>('manager_dashboard');
  const [selectedInspectionDetails, setSelectedInspectionDetails] = useState<any | null>(null);
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [isBotMaximized, setIsBotMaximized] = useState(false);
  const [comparisonFilter, setComparisonFilter] = useState<'all' | 'internal' | 'external'>('all');

  const safetyInspectionsList = useMemo(() => {
    const saved = localStorage.getItem('fleet_safety_inspections');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  }, [activeSubTab]);

  // Human Readable Categories translater
  const categoryNames: Record<string, string> = {
    all: 'جميع الفئات الفنية',
    mechanical: 'ميكانيكا وصيانة عامة',
    electrical: 'كهرباء وإلكترونيات',
    cooling: 'أنظمة تبريد وتكييف',
    hydraulic: 'أنظمة هيدروليكية',
    bodywork: 'سمكرة وتعديل هيكل'
  };

  // Convert vehicle status type
  const vehicleStatusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'نشط وتشغيلي', color: '#10B981' },
    maintenance: { label: 'تحت أعمال الصيانة', color: '#F59E0B' },
    stopped: { label: 'خارج الخدمة / متوقف', color: '#EF4444' }
  };

  // -------------------------------------------------------------
  // Dynamic Analytical Calculations (Memoized for peak React performance)
  // -------------------------------------------------------------
  const analysis = useMemo(() => {
    // Basic date parsing logic
    const filteredOrders = ordersList.filter(o => {
      // Category filter match
      if (selectedCategoryFilter !== 'all' && o.category !== selectedCategoryFilter) return false;
      
      // Vehicle specs filter match
      if (selectedVehicleType !== 'all') {
        const parentVehicle = vehiclesList.find(v => v.id === o.vehicleId);
        if (!parentVehicle || parentVehicle.type !== selectedVehicleType) return false;
      }

      // Timeframe sorting
      if (timeframe === 'custom') {
        if (startDate && o.date && o.date < startDate) return false;
        if (endDate && o.date && o.date > endDate) return false;
      } else if (timeframe === 'weekly') {
        if (o.date) {
          const oDate = new Date(o.date);
          const limitDate = new Date('2026-07-06');
          limitDate.setDate(limitDate.getDate() - 7);
          if (oDate < limitDate || oDate > new Date('2026-07-06')) return false;
        } else {
          return false;
        }
      } else if (timeframe === 'monthly') {
        if (o.date) {
          const oDate = new Date(o.date);
          const limitDate = new Date('2026-07-06');
          limitDate.setDate(limitDate.getDate() - 30);
          if (oDate < limitDate || oDate > new Date('2026-07-06')) return false;
        } else {
          return false;
        }
      } else if (timeframe === 'yearly') {
        if (o.date) {
          const oDate = new Date(o.date);
          const limitDate = new Date('2026-07-06');
          limitDate.setFullYear(limitDate.getFullYear() - 1);
          if (oDate < limitDate || oDate > new Date('2026-07-06')) return false;
        } else {
          return false;
        }
      }
      return true;
    });

    const completed = filteredOrders.filter(o => o.status === 'completed');
    const inProgress = filteredOrders.filter(o => o.status === 'in-progress');
    const pending = filteredOrders.filter(o => o.status === 'pending');

    // Financial calculations
    const totalExpenditures = completed.reduce((sum, o) => sum + (o.cost || 0), 0);
    const averageRepairCost = completed.length > 0 ? Math.round(totalExpenditures / completed.length) : 0;

    // Expenditures over time (Months distribution)
    const monthlyAllocations: Record<string, number> = {
      'يناير': 0, 'فبراير': 0, 'مارس': 0, 'أبريل': 0, 'مايو': 0, 'يونيو': 0,
      'يوليو': 0, 'أغسطس': 0, 'سبتمبر': 0, 'أكتوبر': 0, 'نوفمبر': 0, 'ديسمبر': 0
    };

    // Populate actual order costs based on monthly dates (e.g., "2024-05-06")
    completed.forEach(o => {
      if (o.date && o.cost) {
        const monthIndex = parseInt(o.date.split('-')[1]);
        const monthsInArabic = [
          'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        if (monthIndex >= 1 && monthIndex <= 12) {
          const monthName = monthsInArabic[monthIndex - 1];
          monthlyAllocations[monthName] += o.cost;
        }
      }
    });

    const monthlyChartData = Object.entries(monthlyAllocations).map(([name, sum]) => ({
      name,
      'تكلفة الصيانة (ر.س)': sum
    }));

    // Category distribution cost audit
    const categoryTotals: Record<string, number> = {
      mechanical: 0, electrical: 0, cooling: 0, hydraulic: 0, bodywork: 0
    };
    completed.forEach(o => {
      if (o.category && o.cost) {
        categoryTotals[o.category] = (categoryTotals[o.category] || 0) + o.cost;
      }
    });

    const categoryCostChartData = Object.entries(categoryTotals).map(([key, value]) => ({
      name: categoryNames[key] || key,
      'إجمالي التكلفة': value
    }));

    // Cost per vehicle database
    const vehicleCostAssoc = vehiclesList.map(v => {
      const parentOrders = completed.filter(o => o.vehicleId === v.id);
      const totalCost = parentOrders.reduce((sum, o) => sum + (o.cost || 0), 0);
      return {
        id: v.id,
        name: v.name,
        plate: v.plateNumber,
        type: v.type,
        ordersCount: parentOrders.length,
        totalCost
      };
    }).sort((a, b) => b.totalCost - a.totalCost);

    // Spare parts used frequencies counter
    const partsFrequency: Record<string, number> = {};
    completed.forEach(o => {
      o.partsUsed?.forEach(p => {
        const normalized = p.trim();
        partsFrequency[normalized] = (partsFrequency[normalized] || 0) + 1;
      });
    });

    const topPartsRanking = Object.entries(partsFrequency)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Fleet status distribution count
    const statusCounts = {
      active: vehiclesList.filter(v => v.status === 'active').length,
      maintenance: vehiclesList.filter(v => v.status === 'maintenance').length,
      stopped: vehiclesList.filter(v => v.status === 'stopped').length,
    };

    const statusPieData = [
      { name: 'نشط وتشغيلي', value: statusCounts.active, color: '#10B981' },
      { name: 'ورش الصيانة حالياً', value: statusCounts.maintenance, color: '#F59E0B' },
      { name: 'متوقف لخلل فني', value: statusCounts.stopped, color: '#EF4444' },
    ];

    // Workload of Technicians distribution
    const technicianWorkload = techniciansList.map(t => {
      const activeTasks = ordersList.filter(o => o.technicianId === t.id && o.status !== 'completed').length;
      const finishedTasks = ordersList.filter(o => o.technicianId === t.id && o.status === 'completed').length;
      return {
        name: t.name,
        special: t.specialization,
        'المهام الجارية': activeTasks,
        'المهام المنجزة': finishedTasks
      };
    });

    // Inventory metrics
    const totalInventoryValue = inventoryList.reduce((sum, i) => sum + (i.quantity * (i.price || 0)), 0);
    const criticalUnderstock = inventoryList.filter(i => i.quantity <= i.minQuantity).length;

    // Compare internal vs external costs
    const externalCompleted = completed.filter(o => {
      const isExternalWorkshop = workshopsList.some(ws => ws.id === o.workshopId && ws.isExternal);
      const hasExternalInvoice = !!(o.externalInvoiceNo || o.externalInvoiceStatus || o.externalInvoiceImage || o.externalInvoiceImages?.length);
      return isExternalWorkshop || hasExternalInvoice;
    });
    const internalCompleted = completed.filter(o => !externalCompleted.includes(o));

    const totalExternalCost = externalCompleted.reduce((sum, o) => sum + (o.cost || 0), 0);
    const totalInternalCost = internalCompleted.reduce((sum, o) => sum + (o.cost || 0), 0);

    const externalCount = externalCompleted.length;
    const internalCount = internalCompleted.length;

    const avgExternalCost = externalCount > 0 ? Math.round(totalExternalCost / externalCount) : 0;
    const avgInternalCost = internalCount > 0 ? Math.round(totalInternalCost / internalCount) : 0;

    // Monthly comparison structure
    const monthlyComparison: Record<string, { internal: number; external: number }> = {
      'يناير': { internal: 0, external: 0 },
      'فبراير': { internal: 0, external: 0 },
      'مارس': { internal: 0, external: 0 },
      'أبريل': { internal: 0, external: 0 },
      'مايو': { internal: 0, external: 0 },
      'يونيو': { internal: 0, external: 0 },
      'يوليو': { internal: 0, external: 0 },
      'أغسطس': { internal: 0, external: 0 },
      'سبتمبر': { internal: 0, external: 0 },
      'أكتوبر': { internal: 0, external: 0 },
      'نوفمبر': { internal: 0, external: 0 },
      'ديسمبر': { internal: 0, external: 0 }
    };

    completed.forEach(o => {
      if (o.date && o.cost) {
        const monthIndex = parseInt(o.date.split('-')[1]);
        const monthsInArabic = [
          'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        if (monthIndex >= 1 && monthIndex <= 12) {
          const monthName = monthsInArabic[monthIndex - 1];
          const isExternal = workshopsList.some(ws => ws.id === o.workshopId && ws.isExternal) || 
                             !!(o.externalInvoiceNo || o.externalInvoiceStatus || o.externalInvoiceImage || o.externalInvoiceImages?.length);
          if (isExternal) {
            monthlyComparison[monthName].external += o.cost;
          } else {
            monthlyComparison[monthName].internal += o.cost;
          }
        }
      }
    });

    const comparisonChartData = Object.entries(monthlyComparison).map(([name, data]) => ({
      name,
      'صيانة داخلية': data.internal,
      'صيانة خارجية': data.external,
      'إجمالي': data.internal + data.external
    }));

    return {
      filteredOrders,
      totalOrders: filteredOrders.length,
      completedCount: completed.length,
      inProgressCount: inProgress.length,
      pendingCount: pending.length,
      totalExpenditures,
      averageRepairCost,
      monthlyChartData,
      categoryCostChartData,
      vehicleCostAssoc,
      topPartsRanking,
      statusCounts,
      statusPieData,
      technicianWorkload,
      totalInventoryValue,
      criticalUnderstock,
      externalCount,
      internalCount,
      totalExternalCost,
      totalInternalCost,
      avgExternalCost,
      avgInternalCost,
      comparisonChartData
    };
  }, [vehiclesList, ordersList, techniciansList, inventoryList, workshopsList, timeframe, selectedCategoryFilter, selectedVehicleType]);

  const fleetHealth6MonthData = useMemo(() => {
    // January to June 2026
    const months = [
      { key: '2026-01', nameAr: 'يناير 2026', nameEn: 'Jan 2026', monthNum: 1, yearNum: 2026, baseCost: 1450, baseDowntime: 3.2 },
      { key: '2026-02', nameAr: 'فبراير 2026', nameEn: 'Feb 2026', monthNum: 2, yearNum: 2026, baseCost: 1950, baseDowntime: 4.5 },
      { key: '2026-03', nameAr: 'مارس 2026', nameEn: 'Mar 2026', monthNum: 3, yearNum: 2026, baseCost: 1200, baseDowntime: 2.8 },
      { key: '2026-04', nameAr: 'أبريل 2026', nameEn: 'Apr 2026', monthNum: 4, yearNum: 2026, baseCost: 2400, baseDowntime: 5.4 },
      { key: '2026-05', nameAr: 'مايو 2026', nameEn: 'May 2026', monthNum: 5, yearNum: 2026, baseCost: 1850, baseDowntime: 4.1 },
      { key: '2026-06', nameAr: 'يونيو 2026', nameEn: 'Jun 2026', monthNum: 6, yearNum: 2026, baseCost: 3100, baseDowntime: 7.5 },
    ];

    return months.map(m => {
      const completedOrders = ordersList.filter(o => {
        if (o.status !== 'completed' || !o.date) return false;
        const parts = o.date.split('-');
        if (parts.length < 2) return false;
        const oYear = parseInt(parts[0]);
        const oMonth = parseInt(parts[1]);
        if (oYear !== m.yearNum || oMonth !== m.monthNum) return false;

        // Apply filters
        if (selectedCategoryFilter !== 'all' && o.category !== selectedCategoryFilter) return false;
        if (selectedVehicleType !== 'all') {
          const v = vehiclesList.find(vh => vh.id === o.vehicleId);
          if (!v || v.type !== selectedVehicleType) return false;
        }
        return true;
      });

      const actualCost = completedOrders.reduce((sum, o) => sum + (o.cost || 0), 0);
      const actualDowntime = completedOrders.reduce((sum, o) => {
        const priorityDays = o.priority === 'high' ? 4 : o.priority === 'medium' ? 2.5 : 1;
        const costAddition = o.cost ? (o.cost / 250) : 0;
        return sum + Math.min(10, priorityDays + costAddition);
      }, 0);

      const finalCost = m.baseCost + actualCost;
      const finalDowntime = Math.round((m.baseDowntime + actualDowntime) * 10) / 10;

      return {
        monthKey: m.key,
        name: language === 'ar' ? m.nameAr : m.nameEn,
        cost: finalCost,
        downtime: finalDowntime,
        ordersCount: completedOrders.length
      };
    });
  }, [ordersList, vehiclesList, selectedCategoryFilter, selectedVehicleType, language]);

  const fleetHealthStats = useMemo(() => {
    const totalCost = fleetHealth6MonthData.reduce((sum, d) => sum + d.cost, 0);
    const totalDowntime = fleetHealth6MonthData.reduce((sum, d) => sum + d.downtime, 0);
    const avgCostPerDay = totalDowntime > 0 ? Math.round(totalCost / totalDowntime) : 0;
    const totalOrders = fleetHealth6MonthData.reduce((sum, d) => sum + d.ordersCount, 0);

    return {
      totalCost,
      totalDowntime,
      avgCostPerDay,
      totalOrders
    };
  }, [fleetHealth6MonthData]);

  // Unique vehicle types for dropdown lists
  const allianceVehicleTypes = useMemo(() => {
    return ['all', ...Array.from(new Set(vehiclesList.map(v => v.type)))];
  }, [vehiclesList]);

  // -------------------------------------------------------------
  // Simulated Export Spreadsheet Handler
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    // Header schema
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include UTF-8 BOM for Excel support in Arabic
    csvContent += "المؤشر الفني،القيمة الإحصائية،ملاحظة الجودة\n";
    csvContent += `إجمالي مصروفات الصيانة,${formatCurrency(analysis.totalExpenditures, language, 'SAR')},منجز بالكامل بالأسطول\n`;
    csvContent += `متوسط تكلفة الإصلاح لكل أمر,${formatCurrency(analysis.averageRepairCost, language, 'SAR')},معدل الربع السنوي المالي\n`;
    csvContent += `إجمالي أوامر التشغيل المسجلة,${analysis.totalOrders} أمر,نطاق البحث المحدد\n`;
    csvContent += `الأوامر المنجزة,${analysis.completedCount} أمر مفرغ,كفاءة الورشة\n`;
    csvContent += `الأوامر الجارية,${analysis.inProgressCount} تحت الفحص والتركيب,تحميل العمل المباشر\n`;
    csvContent += `قطع الغيار المهددة بالنقص الحرج,${analysis.criticalUnderstock} أطقم,تنبيه المستودعات الذكي\n`;
    csvContent += `وقيمة رأس المال الحالي للبضائع بالمخازن,${formatCurrency(analysis.totalInventoryValue, language, 'SAR')},قيمة تقديرية على الرف\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير_معدل_صيانة_المجمع_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('تم توليد وتنزيل ملف التقرير بتنسيق Excel CSV متوافق بالكامل.');
  };

  const handleExportPDF = () => {
    const activeBrandName = localStorage.getItem('saas_brand_name') || 'FleetAurvexis';
    const tabLabels: Record<string, string> = {
      financial: 'مركز التحليل المالي والنفقات',
      manager_dashboard: 'لوحة مؤشرات المديرين (الكلفة والجاهزية)',
      fleet: 'كفاءة الحركة وحالة الأسطول',
      techs: 'أداء المهندسين وحصاد الورش',
      inventory: 'صحة وجودة تموين المستودعات',
      parts_analysis: 'تحليل استهلاك قطع الغيار للمركبات',
      monthly_breakdown: 'توزيع تكاليف الصيانة الشهرية (قطع غيار، أجور، صيانة خارجية)',
      safety: 'تدقيق الأمان وضمان جودة الصيانة',
    };

    const activeTabName = tabLabels[activeSubTab] || activeSubTab;
    let timeframeLabel = '';
    if (timeframe === 'all') {
      timeframeLabel = 'جميع الأوقات';
    } else if (timeframe === 'weekly') {
      timeframeLabel = 'آخر 7 أيام (أسبوعي)';
    } else if (timeframe === 'monthly') {
      timeframeLabel = 'آخر 30 يوماً (شهري)';
    } else if (timeframe === 'yearly') {
      timeframeLabel = 'آخر 365 يوماً (سنوي)';
    } else if (timeframe === 'custom') {
      timeframeLabel = `فترة مخصصة من: ${startDate || 'البداية'} إلى: ${endDate || 'اليوم'}`;
    }
    const categoryLabel = categoryNames[selectedCategoryFilter] || selectedCategoryFilter;
    const vehicleTypeLabel = selectedVehicleType === 'all' ? 'جميع الفئات' : selectedVehicleType;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('الرجاء السماح بفتح النوافذ المنبثقة لتوليد ملف الـ PDF الشامل.');
      return;
    }

    let tabSpecificContentHtml = '';

    if (activeSubTab === 'financial') {
      tabSpecificContentHtml = `
        <div class="section-title">📊 تفاصيل النفقات التشغيلية والتكلفة الفئوية</div>
        <table class="report-table">
          <thead>
            <tr>
              <th>اسم الفئة الفنية</th>
              <th style="text-align: left;">إجمالي كلفة الصيانة المعتمدة</th>
            </tr>
          </thead>
          <tbody>
            ${analysis.categoryCostChartData.map(c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td style="text-align: left; font-family: monospace; font-weight: bold; color: #b91c1c;">${formatCurrency(c['إجمالي التكلفة'] || 0, language, 'SAR')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title" style="margin-top: 30px;">🏆 تصنيف المركبات الأكثر استنزافاً للميزانية (أغلى 5 مركبات)</div>
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>المركبة</th>
              <th>اللوحة</th>
              <th>النوع</th>
              <th style="text-align: center;">عدد الأوامر</th>
              <th style="text-align: left;">إجمالي الإنفاق</th>
            </tr>
          </thead>
          <tbody>
            ${analysis.vehicleCostAssoc.slice(0, 5).map((v, i) => `
              <tr>
                <td style="text-align: center; width: 40px; font-weight: bold; background: #f8fafc;">${i + 1}</td>
                <td><strong>${v.name}</strong></td>
                <td style="font-family: monospace; color: #475569;">${v.plate}</td>
                <td><span class="badge badge-info">${v.type}</span></td>
                <td style="text-align: center; font-family: monospace;">${v.ordersCount} أمر</td>
                <td style="text-align: left; font-family: monospace; font-weight: bold; color: #ef4444;">${formatCurrency(v.totalCost, language, 'SAR')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeSubTab === 'monthly_breakdown') {
      tabSpecificContentHtml = `
        <div class="section-title">📊 توزيع تكاليف الصيانة الشهرية (قطع غيار، أجور عمالة، صيانة خارجية)</div>
        <table class="report-table">
          <thead>
            <tr>
              <th>الشهر</th>
              <th style="text-align: left;">قطع الغيار</th>
              <th style="text-align: left;">أجور العمالة</th>
              <th style="text-align: left;">صيانة خارجية</th>
              <th style="text-align: left;">إجمالي التكلفة</th>
            </tr>
          </thead>
          <tbody>
            ${analysis.monthlyChartData.map(m => `
              <tr>
                <td><strong>${m.month}</strong></td>
                <td style="text-align: left; font-family: monospace; color: #d97706;">${formatCurrency(m.cost * 0.5, language, 'SAR')}</td>
                <td style="text-align: left; font-family: monospace; color: #2563eb;">${formatCurrency(m.cost * 0.3, language, 'SAR')}</td>
                <td style="text-align: left; font-family: monospace; color: #7c3aed;">${formatCurrency(m.cost * 0.2, language, 'SAR')}</td>
                <td style="text-align: left; font-family: monospace; font-weight: bold; color: #059669;">${formatCurrency(m.cost, language, 'SAR')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeSubTab === 'fleet') {
      tabSpecificContentHtml = `
        <div class="section-title">🚛 حالة جاهزية الأسطول ومعدلات الكفاءة</div>
        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
          <div style="flex: 1; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; text-align: center; background: #f0fdf4;">
            <div style="font-size: 11px; font-weight: bold; color: #15803d; margin-bottom: 5px;">نشط وتشغيلي</div>
            <div style="font-size: 24px; font-weight: 950; color: #166534; font-family: monospace;">${analysis.statusCounts.active}</div>
          </div>
          <div style="flex: 1; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; text-align: center; background: #fffbeb;">
            <div style="font-size: 11px; font-weight: bold; color: #b45309; margin-bottom: 5px;">أعمال صيانة جارية</div>
            <div style="font-size: 24px; font-weight: 955; color: #92400e; font-family: monospace;">${analysis.statusCounts.maintenance}</div>
          </div>
          <div style="flex: 1; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; text-align: center; background: #fef2f2;">
            <div style="font-size: 11px; font-weight: bold; color: #b91c1c; margin-bottom: 5px;">متوقف لخلل فني كلي</div>
            <div style="font-size: 24px; font-weight: 955; color: #991b1b; font-family: monospace;">${analysis.statusCounts.stopped}</div>
          </div>
        </div>

        <div class="section-title">📁 تصنيف ونسب توزيع الآليات بالأسطول</div>
        <table class="report-table">
          <thead>
            <tr>
              <th>الفئة</th>
              <th style="text-align: center;">العدد الكلي للآليات</th>
              <th style="text-align: left;">نسبة الاستحواذ بالأسطول</th>
            </tr>
          </thead>
          <tbody>
            ${Array.from(new Set(vehiclesList.map(v => v.type))).map(type => {
              const count = vehiclesList.filter(v => v.type === type).length;
              const pct = vehiclesList.length > 0 ? Math.round((count / vehiclesList.length) * 100) : 0;
              return `
                <tr>
                  <td><strong>${type}</strong></td>
                  <td style="text-align: center; font-family: monospace; font-weight: bold;">${count} مركبة</td>
                  <td style="text-align: left;">
                    <span style="font-family: monospace; font-weight: bold;">${pct}%</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="section-title" style="margin-top: 30px;">📋 كشف تفصيلي بمركبات الأسطول والوضعية التشغيلية</div>
        <table class="report-table">
          <thead>
            <tr>
              <th>اسم المركبة</th>
              <th>رقم اللوحة</th>
              <th>التصنيف</th>
              <th style="text-align: left;">الحالة التشغيلية الحالية</th>
            </tr>
          </thead>
          <tbody>
            ${vehiclesList.map(v => `
              <tr>
                <td><strong>${v.name}</strong></td>
                <td style="font-family: monospace; font-weight: bold; color: #1e293b;">${v.plateNumber}</td>
                <td><span class="badge badge-info">${v.type}</span></td>
                <td style="text-align: left;">
                  <span class="status-indicator" style="background-color: ${
                    v.status === 'active' ? '#10b981' : v.status === 'maintenance' ? '#f59e0b' : '#ef4444'
                  };"></span>
                  <strong>${
                    v.status === 'active' ? 'جاهزية تشغيلية كاملة' : v.status === 'maintenance' ? 'قيد الصيانة بالورش' : 'متوقف للخلل الفني'
                  }</strong>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeSubTab === 'techs') {
      tabSpecificContentHtml = `
        <div class="section-title">🔧 كفاءة الكادر الفني وتحميل المهام المباشر بالورش</div>
        <table class="report-table">
          <thead>
            <tr>
              <th>المهندس الفني</th>
              <th>التخصص الأساسي المعتمد</th>
              <th style="text-align: center;">المهام منجزة بالكامل</th>
              <th style="text-align: center;">المهام جارية الآن</th>
              <th style="text-align: left;">الحالة الحالية</th>
            </tr>
          </thead>
          <tbody>
            ${analysis.technicianWorkload.map(t => {
              const matchedTech = techniciansList.find(x => x.name === t.name);
              const statusAr = matchedTech && matchedTech.status === 'available' ? 'متاح للاستلام' : 'منشغل ومكلف بحالة صيانة';
              return `
                <tr>
                  <td><strong>${t.name}</strong></td>
                  <td><span class="badge badge-info">${categoryNames[t.special] || t.special}</span></td>
                  <td style="text-align: center; font-family: monospace; color: #15803d; font-weight: bold;">${t['المهام المنجزة']} مهمة</td>
                  <td style="text-align: center; font-family: monospace; color: #b45309; font-weight: bold;">${t['المهام الجارية']} تحت التدخل</td>
                  <td style="text-align: left;">
                    <span class="status-indicator" style="background-color: ${
                      matchedTech && matchedTech.status === 'available' ? '#10b981' : '#f59e0b'
                    };"></span>
                    <strong>${statusAr}</strong>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else if (activeSubTab === 'inventory') {
      tabSpecificContentHtml = `
        <div class="section-title">📦 صحة وجودة تموين المستودعات وقطع الغيار</div>
        <table class="report-table">
          <thead>
            <tr>
              <th>العنصر / الجزء الفني</th>
              <th>الرقم المميز SKU</th>
              <th style="text-align: center;">المخزون الحالي</th>
              <th style="text-align: center;">الحد الأدنى الآمن</th>
              <th style="text-align: left;">الوضعية وقيمة رأس المال</th>
            </tr>
          </thead>
          <tbody>
            ${inventoryList.map(item => {
              const isLow = item.quantity <= item.minQuantity;
              const totalVal = item.quantity * (item.price || 0);
              return `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td style="font-family: monospace; color: #64748b;">${item.partNumber || 'N/A'}</td>
                  <td style="text-align: center; font-family: monospace; font-weight: bold; color: ${isLow ? '#ef4444' : '#1e293b'}">${item.quantity} وحدة</td>
                  <td style="text-align: center; font-family: monospace; color: #64748b;">${item.minQuantity} وحدة</td>
                  <td style="text-align: left; font-family: monospace;">
                    ${isLow ? '<span class="badge badge-danger">عجز حرج!</span>' : '<span class="badge badge-success">مستقر بالرف</span>'}
                    <strong>${formatCurrency(totalVal, language, 'SAR')}</strong>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="section-title" style="margin-top: 30px;">🔥 قائمة قطع الغيار الأكثر طلباً واستهلاكاً</div>
        <table class="report-table">
          <thead>
            <tr>
              <th>العنصر الفني</th>
              <th style="text-align: left;">معدل سحب القطعة بالأسطول</th>
            </tr>
          </thead>
          <tbody>
            ${analysis.topPartsRanking.map(part => `
              <tr>
                <td><strong>${part.name}</strong></td>
                <td style="text-align: left; font-family: monospace; font-weight: bold; color: #4f46e5;">استخدمت عدد ${part.count} مرات</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeSubTab === 'safety') {
      tabSpecificContentHtml = `
        <div class="section-title">🛡️ سجل وتقارير الفحص الرقمي وضمان جودة الصيانة</div>
        <table class="report-table">
          <thead>
            <tr>
              <th>رقم الأمر</th>
              <th>المفتش الفني</th>
              <th>تاريخ الفحص</th>
              <th style="text-align: center;">النوع</th>
              <th style="text-align: left;">شهادة السلامة</th>
            </tr>
          </thead>
          <tbody>
            ${safetyInspectionsList.map((insp: any) => `
              <tr>
                <td style="font-family: monospace; font-weight: bold;">#${insp.orderId}</td>
                <td><strong>${insp.checkedBy || 'مشرف الجودة'}</strong></td>
                <td style="font-family: monospace; color: #64748b;">${insp.timestamp ? insp.timestamp.replace('T', ' ').substring(0, 16) : 'N/A'}</td>
                <td style="text-align: center;">
                  <span class="badge badge-info">${insp.type === 'before' ? 'قبل الصيانة' : 'بعد الصيانة'}</span>
                </td>
                <td style="text-align: left;">
                  <span class="status-indicator" style="background-color: ${
                    insp.overallStatus === 'safe' ? '#10b981' : insp.overallStatus === 'warn' ? '#f59e0b' : '#ef4444'
                  };"></span>
                  <strong>${
                    insp.overallStatus === 'safe' ? 'آمن كلياً' : insp.overallStatus === 'warn' ? 'ملاحظات طفيفة' : 'غير آمن / توقف'
                  }</strong>
                </td>
              </tr>
            `).join('')}
            ${safetyInspectionsList.length === 0 ? `
              <tr>
                <td colspan="5" style="text-align: center; color: #94a3b8; padding: 30px;">لا يوجد سجل فحوصات جودة رقمية حتى الآن.</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>تقرير صيانة الأسطول الشامل - ${activeTabName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
          
          body {
            font-family: 'Cairo', sans-serif;
            background-color: #ffffff;
            color: #1e293b;
            margin: 0;
            padding: 40px;
            direction: rtl;
          }
          
          .print-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 4px double #4f46e5;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .brand-logo {
            font-size: 24px;
            font-weight: 900;
            color: #4f46e5;
          }
          
          .brand-tag {
            font-size: 11px;
            font-weight: 750;
            color: #6366f1;
            border: 1px solid #e0e7ff;
            background: #eef2ff;
            padding: 2px 8px;
            border-radius: 4px;
            margin-right: 6px;
          }
          
          .document-title {
            text-align: left;
          }
          
          .document-title h1 {
            font-size: 18px;
            font-weight: 950;
            margin: 0;
            color: #0f172a;
          }
          
          .document-title p {
            font-size: 11px;
            color: #475569;
            margin: 4px 0 0 0;
            font-weight: bold;
          }

          .meta-grid {
            display: grid;
            grid-template-cols: repeat(4, 1fr);
            gap: 15px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 15px;
            margin-bottom: 30px;
          }
          
          .meta-card {
            text-align: right;
          }
          
          .meta-card label {
            font-weight: bold;
            font-size: 10px;
            color: #64748b;
            display: block;
            margin-bottom: 4px;
          }
          
          .meta-card span {
            font-weight: 800;
            font-size: 12px;
            color: #0f172a;
          }
          
             .badge-success {
            background-color: #dcfce7;
            color: #166534;
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div class="brand-logo">
            ${activeBrandName} <span class="brand-tag">صيانة والأسطول الذك�        </div>            <div class="desc">أصناف قطع الغيار: ${inventoryList.length} نوعاً</div>
          </div>
          <div class="kpi-card" style="border-right: 4px solid #ef4444;">
            <label>أصناف حرجة النقص بالرف</label>
            <div class="val" style="color: #ef4444;">${analysis.criticalUnderstock} أصناف</div>
            <div class="desc">تطلب تعبئة تموينية فورية</div>
          </div>
        </div>� والأسطول الذكي</span>
          </div>
          <div class="document-title">
            <h1>تقرير جودة وأداء الصيانة الدوري - لجان الصيانة</h1>
            <p>مفرغ رسمياً لقرارات الإدارة والاجتماعات القيادية</p>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-card">
            <label>سياق وقسم التقرير</label>
            <span>${activeTabName}</span>
          </div>
          <div class="meta-card">
            <label>تاريخ التدقيق والتصدير</label>
            <span>${new Date().toISOString().split('T')[0]} - ${new Date().toLocaleTimeString('ar-SA')}</span>
          </div>
          <div class="meta-card">
            <label>المسؤول التقني المصدر</label>
            <span>${user.name} (${user.role === 'admin' ? 'المدير العام' : 'المشرف'})</span>
          </div>
          <div class="meta-card">
            <label>معايير التصفية المطبقة</label>
            <span>${timeframeLabel} | ${categoryLabel} | ${vehicleTypeLabel}</span>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card" style="border-right: 4px solid #10b981;">
            <label>إجمالي نفقات الصيانة</label>
            <div class="val" style="color: #10b981;">${formatCurrency(analysis.totalExpenditures, language, 'SAR')}</div>
            <div class="desc">متوسط للأمر: ${formatCurrency(analysis.averageRepairCost, language, 'SAR')}</div>
          </div>
          <div class="kpi-card" style="border-right: 4px solid #4f46e5;">
            <label>معدل إنجاز وإغلاق الأوامر</label>
            <div class="val" style="color: #4f46e5;">${analysis.completedCount} أمر مغلق</div>
            <div class="desc">مرتبط بـ ${analysis.totalOrders} إجمالي البلاغات</div>
          </div>
          <div class="kpi-card" style="border-right: 4px solid #f59e0b;">
            <label>رأس المال السلعي بالمخزن</label>
            <div class="val" style="color: #f59e0b;">${formatCurrency(analysis.totalInventoryValue, language, 'SAR')}</div>
            <div class="desc">أصناف قطع الغيار: ${inventoryList.length} نوعاً</div>
          </div>
          <div class="kpi-card" style="border-right: 4px solid #ef4444;">
            <label>أصناف حرجة النقص بالرف</label>
            <div class="val" style="color: #ef4444;">${analysis.criticalUnderstock} أصناف</div>
            <div class="desc">تطلب تعبئة تموينية فورية</div>
          </div>
        </div>

        ${tabSpecificContentHtml}

        <div style="background-color: #f1f5f9; border-radius: 16px; padding: 20px; font-size: 11px; margin-top: 40px; border-left: 5px solid #4f46e5;">
          <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 900; color: #1e1b4b;">💡 الملخص التنفيذي وتوصيات لجنة الصيانة والأسطول (منشأ تلقائياً):</h4>
          <p style="margin: 0; line-height: 1.6; color: #334155; font-weight: 600;">
            بناءً على تفريغ ${analysis.totalOrders} من طلبات العمل المبرهنة وأنشطة المستودعات؛ يوصى مجلس الصيانة بالدراسة الإستراتيجية لنفقات "صيانة ${categoryLabel}" لتقوية مؤشر الفحص الوقائي وتقليص تكاليف الأعطال الحرجة المفاجئة. نوصي بمجابهة التحديات مع الموردين لحل عجز ${analysis.criticalUnderstock} من المستلزمات المخزنية الهامة لتقديم أفضل جاهزية بالأسطول والحد من هدر الوقت الفني لشركائنا وعملائنا.
          </p>
        </div>

        <div class="meeting-signatures">
          <div class="signature-box">
            <strong>معد ومراجع التقرير</strong>
            <div class="line"></div>
            <span>الاسم والتوقيع</span>
          </div>
          <div class="signature-box">
            <strong>رئيس قسم الجودة والصيانة</strong>
            <div class="line"></div>
            <span>الاسم والتوقيع</span>
          </div>
          <div class="signature-box">
            <strong>المدير التنفيذي للأسطول والعمليات</strong>
            <div class="line"></div>
            <span>الاسم والتوقيع</span>
          </div>
        </div>

        <div class="print-footer">
          سجل صيانة الأسطول الذكي ${activeBrandName} © 2026 | أوراق عمل معاصرة معتمدة
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-xl text-xs font-bold font-sans">
          <p className="text-slate-900 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-800 pb-1.5 font-black">{label}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-6">
              <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                {language === 'ar' ? 'إجمالي تكلفة الصيانة:' : 'Total Maintenance Cost:'}
              </span>
              <span className="font-mono text-slate-850 dark:text-slate-105">
                {formatCurrency(payload[0].value, language, 'SAR')}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {language === 'ar' ? 'أيام التعطل والوقوف:' : 'Downtime Days:'}
              </span>
              <span className="font-mono text-slate-850 dark:text-slate-105">
                {payload[1].value} {language === 'ar' ? 'يوم' : 'Days'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-450" />
                {language === 'ar' ? 'أوامر الصيانة المنجزة:' : 'Completed Orders:'}
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                {payload[0].payload.ordersCount}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Upper Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <BarChart3 size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 id="reports-main-title" className="text-xl font-black text-slate-900 dark:text-white">ذكاء الأعمال والتقارير الشاملة</h1>
                <ContextualHelp 
                  id="reports"
                  titleAr="مركز ذكاء الأعمال والتقارير الشاملة"
                  titleEn="Business Intelligence & Analytics Center"
                  explanationAr="وحدة إحصائية متكاملة لاستعراض التكاليف المالية الإجمالية، ونسب الأداء للآليات والورش، وتوليد الرسوم البيانية التفاعلية للقطع والفرامل والمحركات."
                  explanationEn="A unified analytical terminal calculating exact maintenance costs, workshops workloads, visual spend ratios, and comprehensive printable data audits."
                  benefitsAr={[
                    "تصدير البيانات اللوجستية والمالية إلى جداول CSV بلمسة واحدة.",
                    "سهولة المقارنة الجرافيكية بين ميزانيات الصيانة الوقائية والتصحيحية لكشف الهدر المالي.",
                    "تحصيل إحصائيات دقيقة عن استهلاك وتكلفة الورش والعمالة."
                  ]}
                  benefitsEn={[
                    "Instant CSV spreadsheet exporting for any internal custom audit workflow.",
                    "Provides beautiful side-by-side bar and curve charts dividing active workshop categories.",
                    "Visualizes spare-part usage ratios alongside driver-specific wear metrics."
                  ]}
                  tipsAr={[
                    "يمكنك الضغط على زر طباعة الفحص الدوري في الأعلى للحصول على ورقة منسقة رسمية مجهزة لتقديمها للجهات المعنية."
                  ]}
                  tipsEn={[
                    "Use the Print/Export button at the top to compile clean audit documents formatted directly for paper."
                  ]}
                  language={language}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                مؤشرات أداء الأسطول التراكمية، تتبع النفقات التشغيلية، ومطابقتها دقيقة للقطع اللوجستية كلياً.
              </p>
            </div>
          </div>
        </div>

        {/* Action Triggers: Export, Print */}
        <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap md:flex-nowrap">
          <button
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet size={15} />
            <span>تصدير البيانات (CSV)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <FileText size={15} />
            <span>تصدير تقرير PDF منظم</span>
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Printer size={15} />
            <span>طباعة الشاشة الحالية</span>
          </button>
        </div>
      </div>

      {/* Dynamic Advanced Filter Panels */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-705 shadow-soft">
        <div className="flex items-center gap-1.5 mb-3 text-slate-400 dark:text-slate-500">
          <ListFilter size={14} />
          <span className="text-[10px] font-black uppercase tracking-wider">مرشحات تحجيم نطاق ذكاء الأعمال:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Timeframe selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 block">فترة تدقيق الأوراق:</label>
            <div className="grid grid-cols-5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'weekly', label: 'أسبوعي' },
                { id: 'monthly', label: 'شهري' },
                { id: 'yearly', label: 'سنوي' },
                { id: 'custom', label: 'مخصص' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTimeframe(t.id as any)}
                  className={`py-1 rounded-md text-[9px] font-bold text-center cursor-pointer transition-all ${
                    timeframe === t.id 
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-black' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 block font-medium">حسب فئة صيانة العطل:</label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none cursor-pointer"
            >
              <option value="all">جميع تخصصات الورش</option>
              <option value="mechanical">الميكانيكا والصيانة العامة</option>
              <option value="electrical">الكهرباء والإلكترونيات الغامرة</option>
              <option value="cooling">أنظمة التبريد والتكييف والتكييف</option>
              <option value="hydraulic">أنظمة الهيدروليك والروافع للمعدات</option>
              <option value="bodywork">سمكرة وتعديل الهياكل والشواصي</option>
            </select>
          </div>

          {/* Vehicle Type Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 block">فئة وتصنيف المركبات بالأسطول:</label>
            <select
              value={selectedVehicleType}
              onChange={(e) => setSelectedVehicleType(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none cursor-pointer"
            >
              <option value="all">جميع درجات وموديلات الآليات في الأسطول</option>
              {allianceVehicleTypes.filter(t => t !== 'all').map(typeStr => (
                <option key={typeStr} value={typeStr}>{typeStr}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Custom Date Range selector with smooth slide-down animation */}
        <AnimatePresence>
          {timeframe === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 block">تاريخ البدء:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-750 rounded-xl text-xs font-bold dark:text-white outline-none cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 block">تاريخ الانتهاء:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-750 rounded-xl text-xs font-bold dark:text-white outline-none cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main KPI Statistical cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'إجمالي نفقات الصيانة المعتمدة', 
            val: formatCurrency(analysis.totalExpenditures, language, 'SAR'), 
            desc: `متوسط للأمر: ${formatCurrency(analysis.averageRepairCost, language, 'SAR')}`, 
            icon: <DollarSign size={18} />,
            bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/10 border-emerald-300 dark:border-emerald-800 border-r-4 border-r-emerald-500 dark:border-r-emerald-400',
            text: 'text-emerald-955 dark:text-emerald-50',
            labelColor: 'text-emerald-900 dark:text-emerald-200',
            descColor: 'text-emerald-800 dark:text-emerald-355',
            iconBg: 'bg-white dark:bg-emerald-900/80 shadow-xs border border-emerald-150 dark:border-emerald-850',
            iconColor: 'text-emerald-700 dark:text-emerald-300'
          },
          { 
            label: 'معدل إنجاز وإغلاق البلاغات', 
            val: `${analysis.completedCount} أمر مغلق`, 
            desc: `من أصل ${analysis.totalOrders} إجمالي الأوامر`, 
            icon: <CheckCircle2 size={18} />,
            bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/10 border-indigo-300 dark:border-indigo-800 border-r-4 border-r-indigo-500 dark:border-r-indigo-400',
            text: 'text-indigo-955 dark:text-indigo-50',
            labelColor: 'text-indigo-900 dark:text-indigo-200',
            descColor: 'text-indigo-800 dark:text-indigo-355',
            iconBg: 'bg-white dark:bg-indigo-900/80 shadow-xs border border-indigo-150 dark:border-indigo-855',
            iconColor: 'text-indigo-700 dark:text-indigo-300'
          },
          { 
            label: 'رصيد أصول قطع الغيار بالمخازن', 
            val: formatCurrency(analysis.totalInventoryValue, language, 'SAR'), 
            desc: `تنوع بالأصناف: ${inventoryList.length} نوعاً مستقلاً`, 
            icon: <Layers size={18} />,
            bg: 'bg-gradient-to-br from-amber-50 to-amber-100/55 dark:from-amber-950/30 dark:to-amber-900/10 border-amber-300 dark:border-amber-800 border-r-4 border-r-amber-500 dark:border-r-amber-400',
            text: 'text-amber-955 dark:text-amber-50',
            labelColor: 'text-amber-905 dark:text-amber-200',
            descColor: 'text-amber-800 dark:text-amber-355',
            iconBg: 'bg-white dark:bg-amber-900/80 shadow-xs border border-amber-150 dark:border-amber-855',
            iconColor: 'text-amber-700 dark:text-amber-300'
          },
          { 
            label: 'عوائق سلسلة التوريد (حرج)', 
            val: `${analysis.criticalUnderstock} أصناف مخزنية`, 
            desc: 'تتجاوز الحد الأدنى الآمن في الرف', 
            icon: <AlertTriangle size={18} />,
            pulse: analysis.criticalUnderstock > 0,
            bg: 'bg-gradient-to-br from-rose-50 to-rose-100/55 dark:from-rose-950/30 dark:to-rose-900/10 border-rose-300 dark:border-rose-800 border-r-4 border-r-rose-500 dark:border-r-rose-400',
            text: 'text-rose-955 dark:text-rose-50',
            labelColor: 'text-rose-900 dark:text-rose-200',
            descColor: 'text-rose-800 dark:text-rose-355',
            iconBg: 'bg-white dark:bg-rose-900/80 shadow-xs border border-rose-150 dark:border-rose-855',
            iconColor: 'text-rose-700 dark:text-rose-300'
          }
        ].map((kpi, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${kpi.bg} shadow-md hover:shadow-lg transition-all duration-300 -translate-y-[1px] hover:-translate-y-[3px] flex items-center justify-between group`}>
            <div className="space-y-1 text-right">
              <span className={`text-[10px] font-black block tracking-wide ${kpi.labelColor}`}>{kpi.label}</span>
              <span className={`text-base lg:text-lg font-black font-mono leading-none block py-1 ${kpi.text}`}>{kpi.val}</span>
              <span className={`text-[8.5px] font-bold block ${kpi.descColor}`}>{kpi.desc}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${kpi.iconBg} ${kpi.iconColor} ${kpi.pulse ? 'animate-bounce border border-rose-300 text-rose-500' : ''}`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Analytical Tab Selection */}
      <div className="bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 flex flex-wrap gap-1.5 justify-start">
        {[
          { id: 'manager_dashboard', label: '📈 لوحة مؤشرات المديرين', desc: 'تحليل تكاليف الصيانة وجاهزية الأسطول' },
          { id: 'financial', label: '💰 مركز التحليل المالي والنفقات', desc: 'تتبع تكاليف الإصلاح الدورية' },
          { id: 'monthly_breakdown', label: '📊 توزيع التكاليف الشهرية', desc: 'قطع غيار، أجور عمالة، صيانة خارجية' },
          { id: 'fleet', label: '🚛 كفاءة الحركة وحالة الأسطول', desc: 'توزيع فئات وأقسام الآليات والسيارات' },
          { id: 'techs', label: '🔧 أداء المهندسين وحصاد الورش', desc: 'تتبع ضغط العمل وتخصص الكادر الفني' },
          { id: 'inventory', label: '📦 صحة وجودة تموين المستودعات', desc: 'القطع الأكثر طلباً ومعدلات استهلاكها' },
          { id: 'parts_analysis', label: '📊 تحليل استهلاك قطع الغيار للمركبات', desc: 'القطع الأكثر استهلاكاً وتحليلها لكل آلية' },
          { id: 'safety', label: '🛡️ تدقيق الأمان وجودة الصيانة', desc: 'سجل الفحوصات الرقمية ومعايير السلامة' },
        ].map(subTab => (
          <button
            key={subTab.id}
            onClick={() => setActiveSubTab(subTab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-start gap-1 cursor-pointer w-full sm:w-auto ${
              activeSubTab === subTab.id 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border-l-2 sm:border-l-0 sm:border-b-2 border-indigo-600 dark:border-indigo-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>{subTab.label}</span>
            <span className="text-[8px] font-normal opacity-70 leading-none">{subTab.desc}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Content Visualizers Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >

          {/* ==================== TAB 0: MANAGER KPI DASHBOARD ==================== */}
          {activeSubTab === 'manager_dashboard' && (
            <ManagerDashboardReport 
              vehicles={vehiclesList}
              orders={ordersList}
              language={language}
              isDarkMode={isDarkMode}
            />
          )}

          {/* ==================== TAB 1: FINANCIAL METRICS ==================== */}
          {activeSubTab === 'financial' && (
            <div className="space-y-6">
              {/* Featured Recharts Monthly Cost Breakdown (Spare parts, Labor wages, External maintenance) */}
              <MonthlyCostBreakdownChart
                orders={ordersList}
                workshops={workshopsList}
                vehicles={vehiclesList}
                inventory={inventoryList}
                language={language}
                isDarkMode={isDarkMode}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Monthly Cumulative Cost Area Chart */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">منحنى النفقات التراكمي الشامل</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">جدول إنفاق الورش المالي الممتد على أشهر السنة الحالية.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-mono">
                    تحديث فوري تلقائي
                  </span>
                </div>

                <div className="h-64 text-xs font-bold font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analysis.monthlyChartData}>
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} unit=" ر.س" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                          borderRadius: '16px', 
                          border: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9',
                          textAlign: 'right',
                          direction: 'rtl',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                        }}
                        itemStyle={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}
                      />
                      <Area type="monotone" dataKey="تكلفة الصيانة (ر.س)" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cost Category distribution donut or Bar */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft">
                <div className="mb-4">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">توزيع الكلفة حسب البنية التصنيفية</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">إجمالي التكاليف مصنفة حسب فئات المشاكل بالورشة.</p>
                </div>

                <div className="h-64 text-xs font-bold leading-none" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis.categoryCostChartData} layout="vertical" margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748B' }} width={90} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                          borderRadius: '12px',
                          border: 'none',
                          color: isDarkMode ? '#f1f5f9' : '#1e293b'
                        }}
                      />
                      <Bar dataKey="إجمالي التكلفة" fill="#4285F4" radius={[0, 6, 6, 0]} barSize={16}>
                        {analysis.categoryCostChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Vehicle Expense Leaderboard table */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft lg:col-span-3">
                <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">جدول المركبات الأكثر استنزافاً للمصروفات</h3>
                    <p className="text-[10px] text-slate-500">معدلات الاستهلاك الفردي وحجم الميزانيات المخصصة للإصلاح.</p>
                  </div>
                  <span className="text-[10px] text-indigo-500 font-bold">إجمالي المركبات المسجلة: {vehiclesList.length}</span>
                </div>

                <div className="overflow-x-auto text-xs font-bold">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="text-slate-400 font-black h-8">
                        <th className="pb-2">اسم الآلية بالأسطول</th>
                        <th className="pb-2">الرقم التسلسلي للوحة</th>
                        <th className="pb-2">تصنيف النقل</th>
                        <th className="pb-2 text-center">أوامر الصيانة المنجزة</th>
                        <th className="pb-2 text-left">إجمالي الإنفاق التراكمي في الورش</th>
                        <th className="pb-2 text-left pr-4">نسبة الاستحواذ المالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.vehicleCostAssoc.slice(0, 5).map((v, i) => {
                        const totalPercent = analysis.totalExpenditures > 0 
                          ? Math.round((v.totalCost / analysis.totalExpenditures) * 100) 
                          : 0;
                        return (
                          <tr key={i} className="border-t border-slate-100 dark:border-slate-800/60 h-10 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                            <td className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 py-2">
                              <span className="w-5 h-5 rounded-full text-[9px] font-black text-indigo-600 bg-indigo-50 flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              {v.name}
                            </td>
                            <td className="font-mono text-slate-500">{v.plate}</td>
                            <td>
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-extrabold text-[9px] text-slate-600 dark:text-slate-300">
                                {v.type}
                              </span>
                            </td>
                            <td className="text-center font-mono text-slate-655 dark:text-slate-350">{v.ordersCount} أمر</td>
                            <td className="text-left py-2 font-mono font-black text-rose-600 dark:text-rose-400">
                              {formatCurrency(v.totalCost, language, 'SAR')}
                            </td>
                            <td className="text-left py-2 pr-4">
                              <div className="flex items-center gap-1.5 justify-end">
                                <span className="font-mono text-[10px] text-slate-400">{totalPercent}%</span>
                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-650 rounded-full" style={{ width: `${totalPercent}%` }} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Internal vs External Comparative Analysis Block */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft lg:col-span-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-700/50 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                        <TrendingUp size={18} />
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        التحليل المقارن: تكاليف الصيانة الداخلية ضد الصيانة الخارجية
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-2xl leading-relaxed">
                      تفصيل مالي دقيق يقارن بين المصاريف المدفوعة داخلياً (الفنيين والقطع) والمصاريف الخارجية المسددة للورش والمراكز الخارجية المعتمدة.
                    </p>
                  </div>
                  
                  {/* Interactive Toggle Filters */}
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => setComparisonFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        comparisonFilter === 'all'
                          ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-soft'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      المقارنة الشاملة
                    </button>
                    <button
                      onClick={() => setComparisonFilter('internal')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        comparisonFilter === 'internal'
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-soft'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      صيانة داخلية فقط
                    </button>
                    <button
                      onClick={() => setComparisonFilter('external')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        comparisonFilter === 'external'
                          ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-soft'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      صيانة خارجية فقط
                    </button>
                  </div>
                </div>

                {/* KPI Overview Cards for Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  
                  {/* Internal Total */}
                  <div className="p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/40 dark:border-indigo-900/30">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">
                      إجمالي تكاليف الصيانة الداخلية
                    </span>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono block">
                      {formatCurrency(analysis.totalInternalCost, language, 'SAR')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold block mt-1">
                      عدد الأوامر: {analysis.internalCount} صيانة داخلية
                    </span>
                  </div>

                  {/* Internal Average */}
                  <div className="p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/40 dark:border-indigo-900/30">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">
                      متوسط كلفة الصيانة الداخلية للأمر
                    </span>
                    <span className="text-xl font-black text-indigo-700 dark:text-indigo-350 font-mono block">
                      {formatCurrency(analysis.avgInternalCost, language, 'SAR')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold block mt-1">
                      الإنفاق الموزع على الكادر والقطع
                    </span>
                  </div>

                  {/* External Total */}
                  <div className="p-4 rounded-2xl bg-purple-50/30 dark:bg-purple-950/10 border border-purple-100/40 dark:border-purple-900/30">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">
                      إجمالي نفقات الصيانة الخارجية
                    </span>
                    <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono block">
                      {formatCurrency(analysis.totalExternalCost, language, 'SAR')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold block mt-1">
                      عدد الأوامر: {analysis.externalCount} صيانة خارجية
                    </span>
                  </div>

                  {/* External Average */}
                  <div className="p-4 rounded-2xl bg-purple-50/30 dark:bg-purple-950/10 border border-purple-100/40 dark:border-purple-900/30">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">
                      متوسط كلفة الصيانة الخارجية للأمر
                    </span>
                    <span className="text-xl font-black text-purple-700 dark:text-purple-350 font-mono block">
                      {formatCurrency(analysis.avgExternalCost, language, 'SAR')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold block mt-1">
                      الفواتير والذمم المستحقة للمراكز
                    </span>
                  </div>

                </div>

                {/* Comparative Chart */}
                <div className="h-[320px] w-full text-xs font-bold leading-none select-none relative mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis.comparisonChartData} margin={{ top: 10, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                      <XAxis 
                        dataKey="name" 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748B', fontWeight: 'bold' }} 
                      />
                      <YAxis 
                        tickLine={false} 
                        tickFormatter={(val) => `${Math.round(val * getConversionRateFromSAR()).toLocaleString()}`}
                        tick={{ fontSize: 10, fill: '#64748B', fontWeight: 'bold' }} 
                        unit={` ${getCurrencyLabel()}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                          borderRadius: '16px', 
                          border: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9',
                          textAlign: 'right',
                          direction: 'rtl',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                        }}
                        itemStyle={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={40} 
                        content={() => (
                          <div className="flex justify-center gap-6 text-xs font-bold font-sans pb-4">
                            {(comparisonFilter === 'all' || comparisonFilter === 'internal') && (
                              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                                <span className="w-3 h-3 rounded bg-indigo-500 inline-block" />
                                صيانة داخلية
                              </span>
                            )}
                            {(comparisonFilter === 'all' || comparisonFilter === 'external') && (
                              <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                                <span className="w-3 h-3 rounded bg-purple-500 inline-block" />
                                صيانة خارجية
                              </span>
                            )}
                            {comparisonFilter === 'all' && (
                              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                <span className="w-3 h-0.5 bg-slate-400 inline-block" />
                                إجمالي الكلفة
                              </span>
                            )}
                          </div>
                        )}
                      />
                      {/* Conditional rendering based on comparisonFilter toggle */}
                      {(comparisonFilter === 'all' || comparisonFilter === 'internal') && (
                        <Bar dataKey="صيانة داخلية" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={comparisonFilter === 'all' ? 14 : 24} />
                      )}
                      {(comparisonFilter === 'all' || comparisonFilter === 'external') && (
                        <Bar dataKey="صيانة خارجية" fill="#A855F7" radius={[4, 4, 0, 0]} barSize={comparisonFilter === 'all' ? 14 : 24} />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Analytical Insight Box comparing internal and external efficiency */}
                <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100/40 dark:border-violet-800/20 text-xs flex items-start gap-2.5">
                  <Sparkles size={16} className="text-violet-500 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <span className="font-black text-slate-850 dark:text-slate-200">
                      رؤية تحليلية ذكية لأداء الصيانة:
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed font-sans">
                      {analysis.totalExternalCost > analysis.totalInternalCost ? (
                        <span>
                          نفقات <strong>الصيانة الخارجية</strong> تشكل الحصة الأكبر من ميزانيتك المالية بنسبة {Math.round((analysis.totalExternalCost / (analysis.totalExpenditures || 1)) * 100)}% من إجمالي الإنفاق. يُوصى بتجهيز الورشة الداخلية بقطع الغيار السريعة ودعم أجور الكادر الفني لترحيل الأعمال البسيطة وتقليل الاعتماد على الورش الخارجية التي ترفع من كلفة الإصلاح بنسبة تقارب {Math.round(analysis.avgExternalCost / (analysis.avgInternalCost || 1))} أضعاف الصيانة الداخلية.
                        </span>
                      ) : (
                        <span>
                          تُدار ميزانية الصيانة بكفاءة تشغيلية ممتازة حيث تشكل <strong>الصيانة الداخلية</strong> العبء الأوفر من التكاليف بنسبة {Math.round((analysis.totalInternalCost / (analysis.totalExpenditures || 1)) * 100)}%. هذا يعزز الاستخدام الأمثل لمستودع القطع الخاص بك وقدرات الفنيين لديكم لتفادي الأسعار المرتفعة للورش الخارجية.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
          )}

          {/* ==================== TAB: DEDICATED MONTHLY COST BREAKDOWN ==================== */}
          {activeSubTab === 'monthly_breakdown' && (
            <MonthlyCostBreakdownChart
              orders={ordersList}
              workshops={workshopsList}
              vehicles={vehiclesList}
              inventory={inventoryList}
              language={language}
              isDarkMode={isDarkMode}
            />
          )}

          {/* ==================== TAB 2: FLEET KNOWLEDGE ==================== */}
          {activeSubTab === 'fleet' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Fleet status gauge pie chart */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft flex flex-col items-center justify-center">
                <div className="w-full text-right mb-6">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">جاهزية وكفاءة الأسطول العام</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">درجة توافر الآليات للتشغيل كلياً.</p>
                </div>

                <div className="w-full max-w-[200px] aspect-square relative my-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysis.statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {analysis.statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Central total stats */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-mono font-black text-slate-850 dark:text-white leading-none">
                      {vehiclesList.length}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">آلية مسجلة</span>
                  </div>
                </div>

                {/* Custom list and count indicators */}
                <div className="w-full space-y-2 mt-4 text-xs font-bold font-mono">
                  {analysis.statusPieData.map((item, idx) => {
                    const pct = vehiclesList.length > 0 
                      ? Math.round((item.value / vehiclesList.length) * 100) 
                      : 0;
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100/40 dark:border-slate-800/30">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-655 dark:text-slate-400 font-bold">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-850 dark:text-slate-200 font-black">{item.value} مركبة</span>
                          <span className="text-slate-400 text-[10px] font-medium">({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vehicle categories type breakdown and count */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">نوع وتصنيف المركبات بالقسم</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">تعداد الآليات الثقيلة والخفيفة والمشتركة بالأسطول.</p>
                  </div>
                  <Calendar size={14} className="text-slate-400" />
                </div>

                <div className="space-y-4 pt-2">
                  {Array.from(new Set(vehiclesList.map(v => v.type))).map((type, idx) => {
                    const matchedCount = vehiclesList.filter(v => v.type === type).length;
                    const stopPercentage = vehiclesList.length > 0 ? (matchedCount / vehiclesList.length) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-1.5">
                            <Truck size={12} className="text-indigo-500" />
                            <span className="text-slate-800 dark:text-white">{type}</span>
                          </div>
                          <span className="font-mono">{matchedCount} آلية ({Math.round(stopPercentage)}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-violet-600 rounded-full transition-all duration-500" 
                            style={{ width: `${stopPercentage}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Important tips or insights about high workload */}
                <div className="mt-8 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-400 text-xs flex items-start gap-2 border border-amber-200/20">
                  <Info size={16} className="text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                  <div className="space-y-0.5 font-bold">
                    <span>ملاحظة أداء الأسطول الذكية:</span>
                    <p className="text-[10px] text-amber-800 dark:text-amber-400 font-medium">
                      هناك تصنيفات من "معدات هندسية" و "نقل جماعي" تتطلب تكراراً في الفحص الوقائي كل 60 يوماً نظراً لارتفاع ساعات التشغيل المفرطة مقارنة بالسيارات العادية.
                    </p>
                  </div>
                </div>
              </div>

              {/* ==================== Fleet Health (Maintenance Cost vs. Downtime) ==================== */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft lg:col-span-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-700/50 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Activity size={18} />
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {language === 'ar' ? 'مؤشر صحة الأسطول: تكلفة الصيانة مقابل فترات التوقف' : 'Fleet Health Index: Maintenance Cost vs. Downtime'}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-2xl leading-relaxed">
                      {language === 'ar' 
                        ? 'تحليل الارتباط الزمني التراكمي على مدار الـ 6 أشهر الماضية لتحديد العلاقة بين الإنفاق المالي وتأثيره المباشر على خروج المركبات من الخدمة.' 
                        : 'Chronological correlation analysis over the last 6 months showcasing the direct relationship between financial spending and operational asset availability.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 self-start md:self-center px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {language === 'ar' ? 'تحليل مباشر متزامن مع الفلاتر' : 'Live Filter-Reactive Analytics'}
                  </div>
                </div>

                {/* Micro KPIs Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">
                      {language === 'ar' ? 'إجمالي نفقات الصيانة' : 'Total Maintenance Cost'}
                    </span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      {formatCurrency(fleetHealthStats.totalCost, language, 'SAR')}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">
                      {language === 'ar' ? 'إجمالي أيام التعطل' : 'Accumulated Downtime'}
                    </span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                      {fleetHealthStats.totalDowntime}
                      <span className="text-[10px] font-bold text-slate-400 ml-1 font-sans">{language === 'ar' ? 'يوم' : 'Days'}</span>
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">
                      {language === 'ar' ? 'معدل التكلفة لكل يوم تعطل' : 'Cost Per Downtime Day'}
                    </span>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-105 font-mono">
                      {formatCurrency(fleetHealthStats.avgCostPerDay, language, 'SAR')}
                      <span className="text-[10px] font-bold text-slate-400 ml-1 font-sans"> / {language === 'ar' ? 'يوم' : 'Day'}</span>
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">
                      {language === 'ar' ? 'أوامر الصيانة المنجزة' : 'Closed Workorders'}
                    </span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {fleetHealthStats.totalOrders}
                      <span className="text-[10px] font-bold text-slate-400 ml-1 font-sans">{language === 'ar' ? 'أمر' : 'Orders'}</span>
                    </span>
                  </div>
                </div>

                {/* Recharts Dual-Axis Chart Container */}
                <div className="h-[340px] w-full text-xs font-bold leading-none select-none relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={fleetHealth6MonthData} margin={{ top: 10, right: 5, left: 5, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                      <XAxis 
                        dataKey="name" 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748B', fontWeight: 'bold' }} 
                      />
                      <YAxis 
                        yAxisId="left" 
                        orientation={language === 'ar' ? 'right' : 'left'}
                        tickLine={false} 
                        tickFormatter={(val) => `${Math.round(val * getConversionRateFromSAR()).toLocaleString()}`}
                        tick={{ fontSize: 10, fill: '#4F46E5', fontWeight: 'bold' }} 
                        label={{ 
                          value: language === 'ar' ? `التكلفة (${getCurrencyLabel('ar')})` : `Maintenance Cost (${getCurrencyLabel('en')})`, 
                          angle: language === 'ar' ? 90 : -90, 
                          position: 'insideLeft',
                          offset: -5,
                          style: { textAnchor: 'middle', fill: '#4F46E5', fontSize: 10, fontWeight: 'bold' }
                        }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation={language === 'ar' ? 'left' : 'right'}
                        tickLine={false} 
                        tickFormatter={(val) => `${val} ${language === 'ar' ? 'يوم' : 'd'}`}
                        tick={{ fontSize: 10, fill: '#D97706', fontWeight: 'bold' }} 
                        label={{ 
                          value: language === 'ar' ? 'أيام التعطل' : 'Downtime Days', 
                          angle: language === 'ar' ? -90 : 90, 
                          position: 'insideRight',
                          offset: -5,
                          style: { textAnchor: 'middle', fill: '#D97706', fontSize: 10, fontWeight: 'bold' }
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="top" 
                        height={40} 
                        content={(props) => {
                          return (
                            <div className="flex justify-center gap-6 text-xs font-bold font-sans select-none pb-4">
                              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                                <span className="w-3 h-3 rounded bg-indigo-500 opacity-80 inline-block" />
                                {language === 'ar' ? `تكاليف الصيانة (${getCurrencyLabel('ar')})` : `Maintenance Cost (${getCurrencyLabel('en')})`}
                              </span>
                              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                <span className="w-3 h-0.5 bg-amber-500 inline-block" />
                                {language === 'ar' ? 'أيام التعطل الكلية' : 'Total Downtime Days'}
                              </span>
                            </div>
                          );
                        }}
                      />
                      <Area 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="cost" 
                        fill="url(#colorCost)" 
                        stroke="#4F46E5" 
                        strokeWidth={2.5} 
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="downtime" 
                        stroke="#D97706" 
                        strokeWidth={3} 
                        dot={{ r: 4, strokeWidth: 1.5, stroke: '#FFFFFF', fill: '#D97706' }} 
                        activeDot={{ r: 6 }} 
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Analytical Insight Bottom Box */}
                <div className="mt-6 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100/40 dark:border-indigo-800/20 text-xs flex items-start gap-2.5">
                  <Sparkles size={16} className="text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <span className="font-black text-slate-850 dark:text-slate-200">
                      {language === 'ar' ? 'تحليل الارتباط الاستراتيجي (مؤشر صحة الأسطول):' : 'Strategic Correlation Insight (Fleet Health):'}
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed font-sans">
                      {language === 'ar' 
                        ? 'يُظهر التوزيع التاريخي علاقة طردية قوية بين تزايد فترات التعطل والإنفاق المالي الإجمالي، وخصوصاً في شهر يونيو 2026 نتيجة تكثيف أعمال الصيانة الطارئة للأعطال الحرجة. يُوصى بجدولة الصيانة الوقائية الاستباقية لتقليل التكاليف الإجمالية وتجنب خروج الآليات خارج الخدمة بشكل مفاجئ.' 
                        : 'The historical distribution demonstrates a strong direct correlation between increased downtime and overall financial expenditures, peaking in June 2026 due to urgent emergency repairs of critical issues. We highly recommend intensifying preventive maintenance schedules to curb peak downtime and flatten resource overhead.'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB 3: TECHNICIANS & WORKSHOPS ==================== */}
          {activeSubTab === 'techs' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Technicians workload graph */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft lg:col-span-2">
                <div className="mb-4">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">توزيع مهام الكارد الفني (لوحة المراقبة)</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">مقارنة بين المهام المنجزة كلياً والمهام الجارية حالياً تحت التنفيذ للفنيين.</p>
                </div>

                <div className="h-64 text-xs font-bold leading-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis.technicianWorkload}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                      <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} contentStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                      <Bar dataKey="المهام المنجزة" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="المهام الجارية" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Technicians specialization status summary panel */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-700/60 mb-3">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">طاقم الكوادر الميكانيكية</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">مستويات الإتاحة والتوزيع التخصصي المعتمد.</p>
                </div>

                <div className="space-y-3">
                  {techniciansList.map((tech, idx) => {
                    const specLabel = categoryNames[tech.specialization] || tech.specialization;
                    return (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/40">
                        <div className="flex items-center gap-2">
                          <img 
                            src={tech.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'} 
                            alt={tech.name} 
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full border border-slate-200"
                          />
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-900 dark:text-white block">{tech.name}</span>
                            <span className="text-[9px] text-indigo-500 font-bold block">{specLabel}</span>
                          </div>
                        </div>

                        <div className="text-left">
                          {tech.status === 'available' && (
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[9px] font-black rounded-md block">
                              ● متاح بالورشة
                            </span>
                          )}
                          {tech.status === 'busy' && (
                            <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[9px] font-black rounded-md block">
                              ● منشغل بتصليح
                            </span>
                          )}
                          {tech.status === 'away' && (
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-505 dark:text-slate-400 text-[9px] font-black rounded-md block">
                              خارج العمل (إجازة)
                            </span>
                          )}
                          <span className="text-[8px] text-slate-400 block mt-0.5 font-bold">مهام: {tech.activeTasks}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB 4: INVENTORY HEALTH ==================== */}
          {activeSubTab === 'inventory' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Critical stock items indicators */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft lg:col-span-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-905 dark:text-white">القطع الأكثر استعمالاً في أوامر الصيانة (دليل جرد المجمع)</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">تتبع سحب البضاعة للتأكد من تفضيلات التوريد المستقبلية.</p>
                  </div>
                  <Layers size={15} className="text-indigo-600" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {analysis.topPartsRanking.map((p, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-right flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-slate-800 dark:text-white block">{p.name}</span>
                        <span className="text-[9px] text-slate-400 block font-bold">تكرر السحب في الأوامر المنجزة</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-black text-sm">
                        {p.count}x
                      </div>
                    </div>
                  ))}
                  {analysis.topPartsRanking.length === 0 && (
                     <div className="col-span-2 text-center py-10 font-bold text-slate-400 text-xs">لم يتم تسجيل استعمال أي من قطع الرف في صيانة الأوامر المنتهية بعد.</div>
                  )}
                </div>
              </div>

              {/* Warehouse valuation list and space */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft">
                <div className="mb-4">
                  <h3 className="text-sm font-black text-slate-920 dark:text-white">تقرير الإمداد الآلي للأقسام الميكانيكية</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">صحة الجرد ومعدلات التغطية.</p>
                </div>

                <div className="space-y-3 font-bold text-xs">
                  <div className="p-3 bg-indigo-50/40 dark:bg-slate-900 rounded-2xl flex items-center justify-between text-right">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] block">إجمالي تنوع أصناف المخازن</span>
                      <span className="text-sm font-black text-slate-800 dark:text-white block">{inventoryList.length} صنفاً مسجلاً</span>
                    </div>
                    <Layers size={18} className="text-indigo-600" />
                  </div>

                  <div className="p-3 bg-emerald-50/40 dark:bg-slate-900 rounded-2xl flex items-center justify-between text-right">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] block">رأس مال البضاعة في الرفوف</span>
                      <span className="text-sm font-black text-slate-800 dark:text-white block">{formatCurrency(analysis.totalInventoryValue, language, 'SAR')}</span>
                    </div>
                    <DollarSign size={18} className="text-emerald-600" />
                  </div>

                  <div className="p-3 bg-rose-50/40 dark:bg-slate-900 rounded-2xl flex items-center justify-between text-right">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] block">أصناف تحت الحد السليم</span>
                      <span className="text-sm font-black text-rose-600 dark:text-rose-400 block">{analysis.criticalUnderstock} أصناف مخزنية</span>
                    </div>
                    <AlertCircle size={18} className="text-rose-600" />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB 4B: PARTS CONSUMPTION ANALYSIS ==================== */}
          {activeSubTab === 'parts_analysis' && (
            <PartsConsumptionAnalysis 
              vehicles={vehiclesList}
              orders={ordersList}
              inventory={inventoryList}
              language={language}
            />
          )}

          {/* ==================== TAB 5: SAFETY & QUALITY DIGITAL INSPECTIONS ==================== */}
          {activeSubTab === 'safety' && (() => {
            const insps = safetyInspectionsList;
            const preCount = insps.filter((i: any) => i.type === 'before').length;
            const postCount = insps.filter((i: any) => i.type === 'after').length;
            const safeCount = insps.filter((i: any) => i.overallStatus === 'safe').length;
            const warnCount = insps.filter((i: any) => i.overallStatus === 'warn').length;
            const unsafeCount = insps.filter((i: any) => i.overallStatus === 'fail').length;

            const safetyPercent = insps.length > 0 ? Math.round((safeCount / insps.length) * 100) : 100;

            const failMemos: Record<string, number> = {};
            insps.forEach((i: any) => {
              if (i.items && Array.isArray(i.items)) {
                i.items.forEach((item: any) => {
                  if (item.status === 'fail') {
                    const label = item.nameAr || item.nameEn || item.id;
                    failMemos[label] = (failMemos[label] || 0) + 1;
                  }
                });
              }
            });

            const topFails = Object.entries(failMemos)
              .map(([label, count]) => ({ label, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 4);

            return (
              <div className="space-y-6">
                
                {/* Stats Summary Panel */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-soft">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-extrabold block">معدل السلامة العام بالأسطول</span>
                      <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 block">{safetyPercent}% سليم</span>
                      <span className="text-[8.5px] text-slate-400 font-bold block">{safeCount} فحص آمن كلياً</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center font-black">
                      🛡️
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-soft">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-extrabold block">إجمالي الفحوصات المنجزة</span>
                      <span className="text-xl font-mono font-black text-slate-800 dark:text-white block">{insps.length} تقارير رقمية</span>
                      <span className="text-[8.5px] text-slate-400 font-bold block">{preCount} قبل الصيانة / {postCount} بعدها</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black">
                      📝
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-soft">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-extrabold block">مركبات خاضعة للتنبيه</span>
                      <span className="text-xl font-mono font-black text-amber-500 block">{warnCount} ملاحظات</span>
                      <span className="text-[8.5px] text-slate-400 font-bold block">ملاحظات طفيفة مسموحة بالتشغيل</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center font-black">
                      ⚠️
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-soft">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-extrabold block">حظر تشغيل (توقف حرج)</span>
                      <span className="text-xl font-mono font-black text-rose-600 dark:text-rose-450 block">{unsafeCount} غير آمنة</span>
                      <span className="text-[8.5px] text-slate-400 font-bold block">فشل اختبار الأمان رقمياً</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center font-black">
                      🛑
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Historical Inspect Logs */}
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft lg:col-span-2">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-slate-800 mb-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">سجل تدقيق الأمان وضوابط جودة الصيانة الرقمية</h3>
                        <p className="text-[10px] text-slate-500">الفحوصات المقيدة من الفنيين والمشرفين قبل وبعد دورات التشغيل.</p>
                      </div>
                      <span className="text-[10px] text-indigo-500 font-bold">إجمالي التقارير: {insps.length}</span>
                    </div>

                    <div className="overflow-x-auto text-xs font-bold">
                      {insps.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                          <span className="block text-2xl mb-2">👁️‍عون</span>
                          <span className="text-xs font-extrabold">لا توجد سجلات تدقيق أمان أو فحص جودة مسجلة في النظام بعد.</span>
                          <p className="text-[10px] text-slate-400 mt-1">الرجاء إدخال الفحص من نافذة أوامر الصيانة (بدء التدقيق الرقمي).</p>
                        </div>
                      ) : (
                        <table className="w-full text-right animate-fade-in">
                          <thead>
                            <tr className="text-slate-400 font-black h-8">
                              <th className="pb-2">أمر الصيانة</th>
                              <th className="pb-2">بوابة الفحص</th>
                              <th className="pb-2">تاريخ القيد</th>
                              <th className="pb-2 text-center">حالة جاهزية السلامة</th>
                              <th className="pb-2 text-left">التوقيع والاعتماد</th>
                              <th className="pb-2 text-left pr-4">عرض التقرير</th>
                            </tr>
                          </thead>
                          <tbody>
                            {insps.map((insp: any, idx: number) => {
                              const matchedOrder = ordersList.find(o => o.id === insp.orderId);
                              return (
                                <tr key={idx} className="border-t border-slate-100 dark:border-slate-800/60 h-12 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                                  <td className="font-extrabold text-slate-900 dark:text-slate-100 py-3">
                                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[9px]">
                                      #{insp.orderId}
                                    </span>
                                    <span className="block text-[9.5px] font-bold text-slate-500 dark:text-slate-400 mt-1 max-w-[120px] truncate">
                                      {matchedOrder ? matchedOrder.description : "بلاغ صيانة عام"}
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] ${
                                      insp.type === 'before' 
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-105' 
                                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-105'
                                    }`}>
                                      {insp.type === 'before' ? 'قبل الصيانة (استلام)' : 'بعد الصيانة (تسليم)'}
                                    </span>
                                  </td>
                                  <td className="font-mono text-slate-500 text-[10px]">
                                    {insp.timestamp ? insp.timestamp.replace('T', ' ').substring(0, 16) : ''}
                                  </td>
                                  <td className="text-center">
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black inline-block ${
                                      insp.overallStatus === 'safe' 
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-400' 
                                        : insp.overallStatus === 'warn' 
                                        ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/45 dark:text-amber-400' 
                                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/45 dark:text-rose-450'
                                    }`}>
                                      {insp.overallStatus === 'safe' ? '✓ آمن ومعتمد' : insp.overallStatus === 'warn' ? '⚠️ تنبيهات طفيفة' : '✗ غير آمن مجهول'}
                                    </span>
                                  </td>
                                  <td className="text-left font-bold text-slate-700 dark:text-slate-200">
                                    <span className="text-[10px] block font-black text-slate-800 dark:text-slate-200">
                                      {insp.checkedBy || 'مشرف الجودة'}
                                    </span>
                                    {insp.signature && (
                                      <span className="text-[8px] text-slate-400 block font-mono">
                                        توقيع: {insp.signature}
                                      </span>
                                    )}
                                  </td>
                                  <td className="text-left pr-4 py-3">
                                    <button
                                      onClick={() => setSelectedInspectionDetails(insp)}
                                      className="px-2.5 py-1 text-[9px] font-bold text-indigo-650 hover:text-white bg-indigo-50 hover:bg-indigo-600 dark:bg-slate-900 rounded-lg border border-indigo-200/50 hover:border-indigo-600 transition-all cursor-pointer"
                                    >
                                      معاينة التفاصيل الرقمية
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Right Column: High Risk / Broken Checklist Items Frequency */}
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-750 shadow-soft">
                    <div className="mb-4">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">الأعطال التشغيلية الأكثر تكراراً (فحص الأمان)</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">ترتيب تنازلي لأكثر العناصر فشلاً في فحص السلامة البدني.</p>
                    </div>

                    <div className="space-y-4">
                      {topFails.map((item, idx) => {
                        const countPercent = Math.min((item.count / insps.length) * 100, 100);
                        return (
                          <div key={idx} className="space-y-1.5 font-bold">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-slate-800 dark:text-slate-200">{item.label}</span>
                              <span className="font-mono text-rose-500 text-[10px]">{item.count} حوادث فشل</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                                style={{ width: `${countPercent}%` }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                      {topFails.length === 0 && (
                        <div className="text-center py-10 font-bold text-slate-400 text-xs text-slate-500 dark:text-slate-400">لا يوجد أي فشل تشغيلي مقيد للسلامة، الأسطول يبدي كفاءة عالية.</div>
                      )}
                    </div>

                    <div className="mt-8 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-900/30 space-y-1">
                      <span className="block text-indigo-955 dark:text-indigo-200 font-black">💡 إرشاد وقائي ذكي:</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                        الفحوصات الرقمية المستدامة تعينكم على معرفة معدلات اهتراء القطع كالعجلات ومستوى الفرامل والزيوت الهيدروليكية مسبقاً قبل الإقلاع على الخط لضمان حياة مشغليكم وأرباح مجمعكم اللوجستي.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            );
          })()}

        </motion.div>
      </AnimatePresence>

      {/* Static Summary / Expert Advisor analysis (Real AI Insights Simulator in Arabic with high details) */}
      <div className="bg-gradient-to-r from-violet-500/5 to-indigo-500/5 dark:from-violet-950/10 dark:to-indigo-950/10 p-5 rounded-3xl border border-violet-100/30 dark:border-indigo-900/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Sparkles size={18} className="animate-spin-slow" />
          </div>
          <div className="space-y-1.5 text-right w-full">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-indigo-950 dark:text-indigo-200">موصي الأسطول الذكي ومستشار الجودة (رؤية فنية)</h3>
              <span className="text-[10px] font-mono font-black text-indigo-400">توصية مايو 2026</span>
            </div>
            
            <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed font-semibold">
              بناءً على تتبع {analysis.totalOrders} من أوامر الصيانة وأنشطة المخزن؛ يلاحظ أن معدل الصيانة الطارئة للأعطال الميكانيكية يستولي على <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{analysis.totalExpenditures > 0 ? 'نسبة مرتفعة' : 'أجزاء'}</span> من الميزانية الربعية. يوصى فريق العمل بتكثيف فترات "الصيانة الوقائية الدورية" بمقدار <span className="font-mono">15%</span> إضافية شهرياً للآليات والمعدات الثقيلة، لتقليل حدوث الانشغال في الخطوط التشغيلية وتجنيب الشركة التكاليف المرتفعة للإصلاحات الشاملة للمحركات.
            </p>

            <div className="pt-2 flex items-center gap-4 text-[10px] text-slate-400 font-bold">
              <span>● مستوى جاهزية الأسطول التقديري: {analysis.statusCounts.active > 0 ? Math.round((analysis.statusCounts.active / vehiclesList.length) * 100) : 0}%</span>
              <span>● معدل تكرار الشحنات المستلمة: مستقر ومبرهن</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Inspection Checklist Modal */}
      <AnimatePresence>
        {selectedInspectionDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInspectionDetails(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white dark:bg-slate-850 w-full max-w-2xl rounded-3xl shadow-2xl relative border border-slate-200/60 dark:border-slate-705 overflow-hidden z-10 p-6 space-y-4"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  <div className="text-right">
                    <h3 className="text-sm font-black text-slate-950 dark:text-white">
                      تقرير الفحص الفني وتحقق الأمان للأمر #{selectedInspectionDetails.orderId}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      قيد بالمنصة في: {selectedInspectionDetails.timestamp ? selectedInspectionDetails.timestamp.replace('T', ' ').substring(0, 16) : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInspectionDetails(null)}
                  className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg text-xs font-black text-slate-500 cursor-pointer border border-slate-150 dark:border-slate-800"
                >
                  إغلاق (X)
                </button>
              </div>

              {/* Meta information */}
              <div className="grid grid-cols-3 gap-3 text-[10px] font-black bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl">
                <div className="text-right">
                  <span className="text-slate-400 block shrink-0">مسار الفحص:</span>
                  <span className="text-slate-850 dark:text-slate-200 font-extrabold text-[11px]">
                    {selectedInspectionDetails.type === 'before' ? 'قبل الصيانة (استلام)' : 'بعد الصيانة (تسليم)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block shrink-0">حالة السلامة:</span>
                  <span className={`text-[11px] font-black ${
                    selectedInspectionDetails.overallStatus === 'safe' ? 'text-emerald-500' :
                    selectedInspectionDetails.overallStatus === 'warn' ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {selectedInspectionDetails.overallStatus === 'safe' ? 'آمن كلياً' :
                     selectedInspectionDetails.overallStatus === 'warn' ? 'ملاحظات طفيفة' : 'غير آمن / توقف'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block shrink-0">المعتمِد والمفتش:</span>
                  <span className="text-slate-850 dark:text-slate-200 font-extrabold text-[11px]">
                    {selectedInspectionDetails.checkedBy || 'مشرف الجودة'}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                <span className="text-[10px] font-black text-slate-400 block pb-1 text-right">بنود التدقيق والفحص الحسي:</span>
                {selectedInspectionDetails.items && selectedInspectionDetails.items.map((item: any, idx: number) => (
                  <div 
                    key={idx}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 flex items-center justify-between text-xs font-bold"
                  >
                    <span>{item.nameAr || item.nameEn}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                        item.status === 'pass' 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
                          : item.status === 'warn' 
                          ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400' 
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-450'
                      }`}>
                        {item.status === 'pass' ? 'مطابق وسليم' : item.status === 'warn' ? 'ملاحظات' : 'فاشل / معطوب'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Signature Section */}
              {selectedInspectionDetails.notes && (
                <div className="space-y-1 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs font-bold text-right font-semibold">
                  <span className="text-slate-400 text-[10px] block">ملاحظات المفتش الإضافية:</span>
                  <p className="text-slate-755 dark:text-slate-300 leading-relaxed">{selectedInspectionDetails.notes}</p>
                </div>
              )}

              {selectedInspectionDetails.signature && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block font-bold">التوقيع الرقمي للمسؤول</span>
                    <span className="text-sm font-black font-mono text-indigo-500 italic pr-1">
                      {selectedInspectionDetails.signature}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-705 rounded-lg text-xs font-black cursor-pointer align-middle flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    طباعة بطاقة الأمان
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
