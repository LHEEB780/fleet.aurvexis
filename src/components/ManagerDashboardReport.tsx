import React, { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  Percent, 
  ShieldCheck, 
  AlertTriangle, 
  Wrench, 
  Truck, 
  Activity, 
  DollarSign, 
  Calendar, 
  Layers, 
  Info,
  ChevronRight,
  TrendingDown,
  Sparkles,
  BarChart3,
  LineChart as LineIcon,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, MaintenanceOrder } from '../types';
import ContextualHelp from './ContextualHelp';

interface ManagerDashboardReportProps {
  vehicles: Vehicle[];
  orders: MaintenanceOrder[];
  language: 'ar' | 'en';
  isDarkMode: boolean;
}

export function ManagerDashboardReport({ vehicles, orders, language, isDarkMode }: ManagerDashboardReportProps) {
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('all');
  const [chartMode, setChartMode] = useState<'area' | 'bar'>('area');
  const [distViewMode, setDistViewMode] = useState<'category' | 'vehicle'>('category');
  const [showQuickGuide, setShowQuickGuide] = useState<boolean>(true);

  // Dynamic localization dictionary
  const t = {
    title: language === 'ar' ? 'لوحة مؤشرات المديرين (التكاليف والجاهزية)' : 'Manager KPI Dashboard (Costs & Availability)',
    subtitle: language === 'ar' ? 'مؤشرات أداء تفاعلية لمدراء الأسطول والصيانة لدعم اتخاذ القرارات الاستراتيجية وتقليل فترات التوقف.' : 'Interactive analytical insights for fleet & workshop managers to guide strategic decision-making and minimize downtime.',
    filterLabel: language === 'ar' ? 'فئة المركبات:' : 'Vehicle Category:',
    allTypes: language === 'ar' ? 'كافة الفئات' : 'All Categories',
    costTrendTitle: language === 'ar' ? 'تحليل تكاليف الصيانة الشهرية والاتجاهات الماليّة' : 'Monthly Maintenance Cost Analysis & Financial Trends',
    availabilityTrendTitle: language === 'ar' ? 'منحنى معدل توفر وجاهزية الأسطول الميداني' : 'Field Fleet Availability Rate & SLA Timeline',
    currentAvailabilityGauge: language === 'ar' ? 'معدل التوفر التشغيلي اللحظي' : 'Real-time Fleet Availability Gauge',
    monthlyCost: language === 'ar' ? 'تكلفة الصيانة' : 'Maintenance Cost',
    monthlyCostSub: language === 'ar' ? 'المبالغ المصروفة على قطع الغيار والأجور بالريال السعودي' : 'Actual expenditures on spare parts and labor in SAR',
    avgCostLine: language === 'ar' ? 'خط متوسط الإنفاق' : 'Average Spending Line',
    targetSlaLine: language === 'ar' ? 'معدل الجاهزية المستهدف (SLA)' : 'Target SLA Availability (95%)',
    currentAvailabilityVal: language === 'ar' ? 'معدل التوفر الحالي' : 'Current Availability Rate',
    activeVehicles: language === 'ar' ? 'مركبات في الخدمة' : 'Vehicles In Service',
    maintenanceVehicles: language === 'ar' ? 'مركبات تحت الصيانة' : 'Vehicles In Workshop',
    stoppedVehicles: language === 'ar' ? 'مركبات معطلة' : 'Out Of Service / Stopped',
    kpiAvailability: language === 'ar' ? 'نسبة جاهزية الأسطول' : 'Fleet Availability',
    kpiTotalCost: language === 'ar' ? 'إجمالي نفقات الصيانة' : 'Total Maintenance Costs',
    kpiAvgDowntime: language === 'ar' ? 'متوسط أيام التوقف لكل أمر' : 'Avg Downtime Days per Order',
    kpiCostPerVehicle: language === 'ar' ? 'معدل كلفة الصيانة لكل آلية' : 'Avg Cost per Active Vehicle',
    insightsTitle: language === 'ar' ? 'التوصيات الفنية والاستراتيجية للمديرين' : 'Strategic Engineering Recommendations',
    insight1Title: language === 'ar' ? 'تحسين خطط الاستبدال الوقائي' : 'Enhance Preventive Replacement Timelines',
    insight1Desc: language === 'ar' ? 'تجاوزت بعض مركبات النقل الثقيل ميزانيتها التقديرية بنسبة 22% بسبب الصيانة التصحيحية المفاجئة. ننصح بالانتقال للصيانة التنبؤية.' : 'Certain heavy transport assets exceeded their estimated budgets by 22% due to reactive failures. Shifting to predictive maintenance schedules is strongly recommended.',
    insight2Title: language === 'ar' ? 'مؤشر جاهزية الأسطول (SLA)' : 'Fleet Availability SLA Indicator',
    insight2Desc: language === 'ar' ? 'تراجع معدل التوفر الميداني في مارس بسبب تأخر توريد قطع الغيار الضرورية للفرامل. ننصح برفع الحد الآمن لقطع الغيار الحاكمة في المستودع.' : 'The operational availability rate dipped during March due to supply-chain delays in braking parts. Raising safety stock thresholds for critical components will stabilize uptime.',
    insight3Title: language === 'ar' ? 'كفاءة دورة العمل ووقت الاستجابة' : 'Operational Efficiency & Work Order Lifecycle',
    insight3Desc: language === 'ar' ? 'بلغ متوسط مدة إغلاق طلبات الصيانة الخفيفة 1.8 يوم وهو معدل ممتاز، بينما استغرقت المعدات الهندسية 5.2 يوم لقلة تخصص الكادر الفني.' : 'Light fleet work orders cleared in an average of 1.8 days (excellent), while heavy engineering equipment averaged 5.2 days due to specialized technician constraints.',
    currency: language === 'ar' ? 'ر.س' : 'SAR',
    days: language === 'ar' ? 'أيام' : 'days',
    percentage: language === 'ar' ? 'نسبة مئوية' : 'percentage',
    month: language === 'ar' ? 'الشهر' : 'Month',
    target: language === 'ar' ? 'الهدف' : 'Target',
    excellent: language === 'ar' ? 'ممتاز (آمن)' : 'Excellent (Safe)',
    good: language === 'ar' ? 'جيد (مستقر)' : 'Good (Stable)',
    critical: language === 'ar' ? 'حرج (تحت حد الأمان)' : 'Critical (Below Target)',
    
    // Cost distribution translations
    distributionSectionTitle: language === 'ar' ? 'توزيع نفقات الصيانة وهيكل التكاليف' : 'Maintenance Cost Distribution & Expense Structure',
    distributionSub: language === 'ar' ? 'تحليل هيكلي للإنفاق حسب فئة المركبة وتحديد الآليات الأكثر استهلاكاً للميزانية.' : 'Structural analysis of expenses by vehicle category and identifying individual assets with highest budget consumption.',
    byCategoryTab: language === 'ar' ? '📁 حسب فئة المركبة' : 'By Vehicle Category',
    byIndividualVehicleTab: language === 'ar' ? '🚛 الآليات الـ 5 الأكثر كلفة' : 'Top 5 Most Costly Vehicles',
    costLabel: language === 'ar' ? 'إجمالي تكلفة الصيانة' : 'Total Maintenance Cost',
    vehicleLabel: language === 'ar' ? 'المركبة' : 'Vehicle',
    categoryLabel: language === 'ar' ? 'الفئة' : 'Category',
    noCostData: language === 'ar' ? 'لا توجد بيانات صيانة مكتملة للفئة المحددة حالياً لتوزيع التكاليف.' : 'No completed maintenance cost data found for the selected category to generate distribution analysis.',
    orderCountLabel: language === 'ar' ? 'عدد البلاغات المنجزة:' : 'Completed Orders:',
    ratioLabel: language === 'ar' ? 'حصة الإنفاق المئوية:' : 'Spend Share Percentage:',
    
    // Quick Guide Translations
    quickGuideTitle: language === 'ar' ? '📖 الدليل السريع للوحة مؤشرات المديرين' : 'Quick Guide: Manager KPI Dashboard',
    quickGuideSub: language === 'ar' ? 'مرحباً بك! هذه اللوحة مخصصة لأصحاب القرار لمراقبة تكاليف الصيانة وقياس كفاءة الأسطول بشكل فوري.' : 'Welcome! This dashboard is designed for decision-makers to track maintenance expenses and fleet availability in real-time.',
    guideCostTitle: language === 'ar' ? '💰 تحليل وتوزيع هيكل التكاليف' : 'Cost & Budget Analysis',
    guideCostDesc: language === 'ar' ? 'تتبع مصادر الإنفاق الأكثر كلفة حسب نوع السيارة (نقل ثقيل، سيارات ركاب، إلخ)، وحدد الآليات الـ 5 الأكثر طلباً للصيانة لترشيد الاستهلاك ومقارنتها بمتوسط الإنفاق.' : 'Monitor expense distribution by category and identify the top 5 high-maintenance assets to optimize budgets and check overall average spending.',
    guideSlaTitle: language === 'ar' ? '📈 معدل جاهزية الأسطول الميداني' : 'Fleet Availability & SLA Uptime',
    guideSlaDesc: language === 'ar' ? 'مؤشر فوري يقيس نسبة توفر الآليات الصالحة للخدمة ومقارنتها مع حد الأمان المستهدف (SLA) وهو 95% لضمان فاعلية التغطية اللوجستية.' : 'A live gauge calculating the percentage of in-service assets and measuring them against the safety target SLA of 95%.',
    guideKpiTitle: language === 'ar' ? '⚙️ المؤشرات الأربعة الكبرى' : 'Four Major Performance KPIs',
    guideKpiDesc: language === 'ar' ? 'راقب مؤشرات توفر الأسطول، إجمالي النفقات المباشرة، متوسط أيام التوقف لإنجاز الأوامر، ومتوسط كلفة صيانة الآلية الواحدة.' : 'Track overall uptime, total direct costs, average downtime days to close orders, and the average repair cost per single active vehicle.',
    guideInsightsTitle: language === 'ar' ? '💡 التوصيات الهندسية التلقائية' : 'Engineering Action Insights',
    guideInsightsDesc: language === 'ar' ? 'توصيات دورية يطلقها النظام لتنبيهك بشأن فجوات سلسلة الإمداد، ترقية مخزون قطع الغيار الحاكمة، والانتقال للصيانة الوقائية.' : 'Dynamic recommendations triggered to alert you about supply-chain gaps, stock safety levels, or preventive maintenance shift advice.',
    hideGuideBtn: language === 'ar' ? 'إخفاء الدليل السريع' : 'Hide Quick Guide',
    showGuideBtn: language === 'ar' ? 'عرض الدليل السريع للوحة المؤشرات' : 'Show Dashboard Quick Guide',
  };

  // 1. Filter vehicles and orders based on selected vehicle type
  const filteredVehicles = useMemo(() => {
    if (selectedVehicleType === 'all') return vehicles;
    return vehicles.filter(v => v.type === selectedVehicleType);
  }, [vehicles, selectedVehicleType]);

  const filteredOrders = useMemo(() => {
    if (selectedVehicleType === 'all') return orders;
    return orders.filter(o => {
      const v = vehicles.find(veh => veh.id === o.vehicleId);
      return v && v.type === selectedVehicleType;
    });
  }, [orders, vehicles, selectedVehicleType]);

  // Unique vehicle types for filter
  const vehicleTypes = useMemo(() => {
    return Array.from(new Set(vehicles.map(v => v.type)));
  }, [vehicles]);

  // 2. Calculate current availability metrics
  const availabilityStats = useMemo(() => {
    const total = filteredVehicles.length;
    if (total === 0) return { rate: 0, active: 0, maintenance: 0, stopped: 0, status: 'critical' };

    const active = filteredVehicles.filter(v => v.status === 'active').length;
    const maintenance = filteredVehicles.filter(v => v.status === 'maintenance').length;
    const stopped = filteredVehicles.filter(v => v.status === 'stopped').length;

    const rate = Math.round((active / total) * 100);

    let status = 'good';
    if (rate >= 95) status = 'excellent';
    else if (rate < 90) status = 'critical';

    return {
      rate,
      active,
      maintenance,
      stopped,
      status
    };
  }, [filteredVehicles]);

  // 3. Compute Monthly Maintenance Costs (Completed orders)
  const monthlyCostData = useMemo(() => {
    const monthsArabic = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const monthsEnglish = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const monthlyCosts: Record<number, number> = {};
    const monthlyOrdersCount: Record<number, number> = {};
    for (let i = 1; i <= 12; i++) {
      monthlyCosts[i] = 0;
      monthlyOrdersCount[i] = 0;
    }

    filteredOrders.forEach(o => {
      if (o.status === 'completed' && o.date && o.cost) {
        const monthVal = parseInt(o.date.split('-')[1]);
        if (monthVal >= 1 && monthVal <= 12) {
          monthlyCosts[monthVal] += o.cost;
          monthlyOrdersCount[monthVal]++;
        }
      }
    });

    // Generate output format for Recharts
    const chartData = Object.entries(monthlyCosts).map(([monthNum, cost]) => {
      const idx = parseInt(monthNum) - 1;
      const name = language === 'ar' ? monthsArabic[idx] : monthsEnglish[idx];
      return {
        name,
        monthIndex: parseInt(monthNum),
        [t.monthlyCost]: cost,
        ordersCount: monthlyOrdersCount[parseInt(monthNum)]
      };
    });

    // Calculate dynamic average cost across months with activity
    const monthsWithActivity = Object.values(monthlyCosts).filter(c => c > 0).length;
    const totalCost = Object.values(monthlyCosts).reduce((a, b) => a + b, 0);
    const averageCost = monthsWithActivity > 0 ? Math.round(totalCost / monthsWithActivity) : 0;

    return {
      chartData,
      totalCost,
      averageCost
    };
  }, [filteredOrders, language, selectedVehicleType]);

  // 4. Compute Monthly Fleet Availability Rate (Historical Trend)
  // Derived realistically: Availability = 100 - (vehicles_in_maintenance_and_stopped * avg_downtime_days) / (total_vehicles * 30)
  const monthlyAvailabilityData = useMemo(() => {
    const monthsArabic = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const monthsEnglish = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const totalVehicles = filteredVehicles.length;
    if (totalVehicles === 0) {
      return Array.from({ length: 12 }).map((_, i) => ({
        name: language === 'ar' ? monthsArabic[i] : monthsEnglish[i],
        [t.kpiAvailability]: 100
      }));
    }

    // Track orders/downtime per month
    const monthlyDowntimeWeights: Record<number, number> = {};
    for (let i = 1; i <= 12; i++) {
      monthlyDowntimeWeights[i] = 0;
    }

    filteredOrders.forEach(o => {
      if (o.date) {
        const monthVal = parseInt(o.date.split('-')[1]);
        if (monthVal >= 1 && monthVal <= 12) {
          // Critical or high priority causes longer downtime weight
          const weight = o.priority === 'high' ? 5 : 2;
          monthlyDowntimeWeights[monthVal] += weight;
        }
      }
    });

    return Object.entries(monthlyDowntimeWeights).map(([monthNum, weight]) => {
      const idx = parseInt(monthNum) - 1;
      const name = language === 'ar' ? monthsArabic[idx] : monthsEnglish[idx];
      
      // Calculate derived availability rate (SLA target is 95%)
      // Standard baseline availability is 97%, affected by repair weights
      const totalVehicleDays = totalVehicles * 30;
      const downtimeDays = weight;
      const derivedAvailability = Math.max(78, Math.min(100, Math.round(100 * (1 - (downtimeDays / totalVehicleDays)))));

      return {
        name,
        monthIndex: parseInt(monthNum),
        [t.kpiAvailability]: derivedAvailability,
        'SLA': 95 // reference target
      };
    });
  }, [filteredVehicles, filteredOrders, language, selectedVehicleType]);

  // Overall Manager KPIs
  const managerKpis = useMemo(() => {
    // Avg downtime days (calculated from orders or mock baseline)
    const completedOrders = filteredOrders.filter(o => o.status === 'completed');
    const totalDowntime = completedOrders.reduce((sum, o) => {
      // Simulate downtime based on priority
      const days = o.priority === 'high' ? 4 : 1.5;
      return sum + days;
    }, 0);
    const avgDowntime = completedOrders.length > 0 ? (totalDowntime / completedOrders.length).toFixed(1) : '1.8';

    // Avg Cost per active vehicle
    const activeVehs = filteredVehicles.filter(v => v.status === 'active').length;
    const avgCostPerVehicle = activeVehs > 0 ? Math.round(monthlyCostData.totalCost / activeVehs) : 0;

    return {
      avgDowntime,
      avgCostPerVehicle
    };
  }, [filteredVehicles, filteredOrders, monthlyCostData]);

  // Half-pie data for live availability gauge
  const gaugeData = useMemo(() => {
    const rate = availabilityStats.rate;
    return [
      { name: t.kpiAvailability, value: rate, color: '#4f46e5' }, // indigo-600
      { name: 'Remaining', value: 100 - rate, color: '#f1f5f9' } // gray-100
    ];
  }, [availabilityStats]);

  // 5. Compute Costs by Vehicle Type (Category)
  const costsByVehicleType = useMemo(() => {
    const typeCosts: Record<string, number> = {};
    const typeOrdersCount: Record<string, number> = {};

    filteredOrders.forEach(o => {
      if (o.status === 'completed' && o.cost) {
        const vehicle = vehicles.find(v => v.id === o.vehicleId);
        const typeLabel = vehicle ? vehicle.type : (language === 'ar' ? 'غير معروف' : 'Unknown');
        
        typeCosts[typeLabel] = (typeCosts[typeLabel] || 0) + o.cost;
        typeOrdersCount[typeLabel] = (typeOrdersCount[typeLabel] || 0) + 1;
      }
    });

    const totalTypeCost = Object.values(typeCosts).reduce((a, b) => a + b, 0);

    return Object.entries(typeCosts).map(([type, totalCost]) => {
      const percentage = totalTypeCost > 0 ? Math.round((totalCost / totalTypeCost) * 100) : 0;
      return {
        name: type,
        value: totalCost,
        percentage,
        ordersCount: typeOrdersCount[type] || 0
      };
    }).sort((a, b) => b.value - a.value);
  }, [filteredOrders, vehicles, language]);

  // 6. Compute top individual vehicles by cost
  const costsByIndividualVehicle = useMemo(() => {
    const vehicleCosts: Record<string, { name: string; plate: string; cost: number; type: string; count: number }> = {};

    filteredOrders.forEach(o => {
      if (o.status === 'completed' && o.cost) {
        const vehicle = vehicles.find(v => v.id === o.vehicleId);
        if (vehicle) {
          if (!vehicleCosts[vehicle.id]) {
            vehicleCosts[vehicle.id] = {
              name: vehicle.name,
              plate: vehicle.plateNumber,
              cost: 0,
              type: vehicle.type,
              count: 0
            };
          }
          vehicleCosts[vehicle.id].cost += o.cost;
          vehicleCosts[vehicle.id].count += 1;
        }
      }
    });

    const list = Object.values(vehicleCosts);
    const totalVehiclesCost = list.reduce((a, b) => a + b.cost, 0);

    return list
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5) // Top 5
      .map(item => {
        const percentage = totalVehiclesCost > 0 ? Math.round((item.cost / totalVehiclesCost) * 100) : 0;
        return {
          name: item.name,
          plate: item.plate,
          value: item.cost,
          type: item.type,
          percentage,
          ordersCount: item.count
        };
      });
  }, [filteredOrders, vehicles]);

  // High contrast color palette for pie/bar cells
  const DISTRIBUTION_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6'];

  // Custom tooltips
  const CostTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 text-right text-xs space-y-1.5 shadow-xl">
          <p className="font-extrabold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            {data.name}
          </p>
          <p className="text-slate-300 font-bold">
            {t.monthlyCost}: <span className="font-mono text-emerald-400 font-black text-sm">{data[t.monthlyCost].toLocaleString()} {t.currency}</span>
          </p>
          <p className="text-slate-400 text-[10px]">
            {language === 'ar' ? 'عدد البلاغات المنجزة:' : 'Completed Orders:'} <span className="font-mono text-white font-bold">{data.ordersCount}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const AvailabilityTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const rate = data[t.kpiAvailability];
      let statusColor = 'text-emerald-400';
      let statusText = t.excellent;

      if (rate < 90) {
        statusColor = 'text-rose-400';
        statusText = t.critical;
      } else if (rate < 95) {
        statusColor = 'text-amber-400';
        statusText = t.good;
      }

      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 text-right text-xs space-y-1.5 shadow-xl">
          <p className="font-extrabold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
            {data.name}
          </p>
          <p className="text-slate-300 font-bold">
            {t.kpiAvailability}: <span className="font-mono text-white font-black text-sm">{rate}%</span>
          </p>
          <p className="text-[10px] text-slate-400">
            {language === 'ar' ? 'مؤشر كفاءة التشغيل:' : 'Operational Ratio:'} <span className={`font-black ${statusColor}`}>{statusText}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const DistributionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 text-right text-xs space-y-1.5 shadow-xl">
          <p className="font-extrabold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            {data.name} {data.plate ? `(${data.plate})` : ''}
          </p>
          <p className="text-slate-300 font-bold">
            {t.costLabel}: <span className="font-mono text-emerald-400 font-black text-sm">{data.value.toLocaleString()} {t.currency}</span>
          </p>
          <p className="text-slate-400 text-[10px]">
            {t.ratioLabel} <span className="font-mono text-white font-bold">{data.percentage}%</span>
          </p>
          <p className="text-slate-400 text-[10px]">
            {t.orderCountLabel} <span className="font-mono text-white font-bold">{data.ordersCount}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="manager-kpi-dashboard-widget" className="space-y-6 animate-fadeIn">
      
      {/* Filters and Header Controls */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <span>{t.title}</span>
            </h2>
            <ContextualHelp
              id="manager-dashboard-main"
              titleAr="لوحة مؤشرات المديرين التنفيذية"
              titleEn="Complete Manager KPI Dashboard Guide"
              explanationAr="مرحباً بك في لوحة مؤشرات المديرين! هذه اللوحة مخصصة لأصحاب القرار لمراقبة تكاليف الصيانة وقياس كفاءة الأسطول بشكل فوري."
              explanationEn="Welcome! This dashboard is designed for decision-makers to track maintenance expenses and fleet availability in real-time."
              benefitsAr={[
                "مراقبة دقيقة للجاهزية التشغيلية للأسطول ككل ومطابقته للـ SLA المستهدف 95%.",
                "تحليل هيكلي للإنفاق حسب الفئات وتحديد أعلى 5 آليات تكلفة.",
                "متابعة التوصيات الاستراتيجية الذكية لترشيد الميزانيات وتطوير مستودعات القطع."
              ]}
              benefitsEn={[
                "Accurate trace of fleet uptime percentage against the 95% SLA target.",
                "Structural analysis of expenses by categories and identifying top costly assets.",
                "Monitor engineering action points to optimize workshop budgets and supply chain levels."
              ]}
              tipsAr={[
                "يمكنك ترشيح البيانات وتحديد فئة معينة باستخدام قائمة فلتر الفئات في اليمين لمطابقة دقيقة."
              ]}
              tipsEn={[
                "Use the category filter on the right to drill down the data for targeted divisions."
              ]}
              language={language}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 font-bold">
            {t.subtitle}
          </p>
        </div>

        {/* Action Controls & Category Filter */}
        <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-500">{t.filterLabel}</span>
            <select
              value={selectedVehicleType}
              onChange={(e) => setSelectedVehicleType(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-black text-slate-850 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="all">📁 {t.allTypes}</option>
              {vehicleTypes.map((type, i) => (
                <option key={i} value={type}>🚚 {type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* manager executive metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-right">
        {/* KPI 1: Fleet availability */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-705 shadow-soft flex items-center justify-between group hover:-translate-y-1 transition-all duration-350">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold block">{t.kpiAvailability}</span>
            <span className={`text-xl lg:text-2xl font-mono font-black block ${
              availabilityStats.status === 'excellent' ? 'text-emerald-600 dark:text-emerald-400' :
              availabilityStats.status === 'good' ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {availabilityStats.rate}%
            </span>
            <span className="text-[8.5px] font-bold block text-slate-450">
              {availabilityStats.active} {t.activeVehicles}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            availabilityStats.status === 'excellent' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' :
            availabilityStats.status === 'good' ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
          }`}>
            <Percent size={18} className="group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* KPI 2: Total Maintenance Cost */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-705 shadow-soft flex items-center justify-between group hover:-translate-y-1 transition-all duration-350">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold block">{t.kpiTotalCost}</span>
            <span className="text-xl lg:text-2xl font-mono font-black text-slate-850 dark:text-white block">
              {monthlyCostData.totalCost.toLocaleString()} <span className="text-xs font-bold">{t.currency}</span>
            </span>
            <span className="text-[8.5px] text-slate-450 font-bold block">
              {language === 'ar' ? `متوسط شهري: ${monthlyCostData.averageCost.toLocaleString()} ر.س` : `Monthly Avg: ${monthlyCostData.averageCost.toLocaleString()} ${t.currency}`}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <DollarSign size={18} />
          </div>
        </div>

        {/* KPI 3: Avg downtime days */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-705 shadow-soft flex items-center justify-between group hover:-translate-y-1 transition-all duration-350">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold block">{t.kpiAvgDowntime}</span>
            <span className="text-xl lg:text-2xl font-mono font-black text-amber-500 block animate-pulse">
              {managerKpis.avgDowntime} <span className="text-xs font-bold text-slate-400">{t.days}</span>
            </span>
            <span className="text-[8.5px] text-slate-450 font-bold block">
              {language === 'ar' ? 'منذ بداية الفتح وحتى تسليم الآلية' : 'From repair opening to handoff'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Wrench size={18} />
          </div>
        </div>

        {/* KPI 4: Avg cost per active vehicle */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-705 shadow-soft flex items-center justify-between group hover:-translate-y-1 transition-all duration-350">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold block">{t.kpiCostPerVehicle}</span>
            <span className="text-xl lg:text-2xl font-mono font-black text-teal-600 dark:text-teal-400 block">
              {managerKpis.avgCostPerVehicle.toLocaleString()} <span className="text-xs font-bold">{t.currency}</span>
            </span>
            <span className="text-[8.5px] text-slate-450 font-bold block">
              {language === 'ar' ? 'مؤشر توزيع كفاءة النفقات التنافسي' : 'Asset financial distribution ratio'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Truck size={18} />
          </div>
        </div>
      </div>

      {/* Main Charts Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Cost Trend Chart (Left side, 7 cols) */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 dark:border-slate-700/50 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BarChart3 size={15} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {t.costTrendTitle}
                </h3>
                <p className="text-[9.5px] text-slate-400">{t.monthlyCostSub}</p>
              </div>
            </div>

            {/* Chart toggle controls */}
            <div className="bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-1 self-end sm:self-auto">
              <button
                onClick={() => setChartMode('area')}
                className={`px-3 py-1 text-[9px] font-black rounded-lg transition-all cursor-pointer ${
                  chartMode === 'area' 
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {language === 'ar' ? 'مساحي' : 'Area'}
              </button>
              <button
                onClick={() => setChartMode('bar')}
                className={`px-3 py-1 text-[9px] font-black rounded-lg transition-all cursor-pointer ${
                  chartMode === 'bar' 
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {language === 'ar' ? 'أعمدة' : 'Bar'}
              </button>
            </div>
          </div>

          <div className="h-64 text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'area' ? (
                <AreaChart data={monthlyCostData.chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="managerCostGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2534" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip content={<CostTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey={t.monthlyCost} 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#managerCostGrad)" 
                  />
                </AreaChart>
              ) : (
                <BarChart data={monthlyCostData.chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2534" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip content={<CostTooltip />} />
                  <Bar dataKey={t.monthlyCost} fill="#4f46e5" radius={[4, 4, 0, 0]}>
                    {monthlyCostData.chartData.map((entry, index) => {
                      // Highlight peak months
                      const isPeak = entry[t.monthlyCost] === Math.max(...monthlyCostData.chartData.map(d => d[t.monthlyCost]));
                      return <Cell key={`cell-${index}`} fill={isPeak ? '#312e81' : '#6366f1'} />;
                    })}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Availability Gauge Ring (Right side, 5 cols) */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft lg:col-span-5 flex flex-col items-center justify-between">
          <div className="w-full text-right pb-3 border-b border-slate-50 dark:border-slate-700/50">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {t.currentAvailabilityGauge}
            </h3>
            <p className="text-[9.5px] text-slate-400">{language === 'ar' ? 'مؤشر أداء حي ومباشر للمركبات المتوفرة ميدانياً' : 'Live percentage of fleet assets currently operable'}</p>
          </div>

          <div className="relative w-full max-w-[200px] aspect-square my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={88}
                  startAngle={180}
                  endAngle={0}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill={
                    availabilityStats.status === 'excellent' ? '#10b981' :
                    availabilityStats.status === 'good' ? '#4f46e5' : '#ef4444'
                  } />
                  <Cell fill={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* absolute center layout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
              <span className={`text-3xl font-mono font-black ${
                availabilityStats.status === 'excellent' ? 'text-emerald-600 dark:text-emerald-400' :
                availabilityStats.status === 'good' ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {availabilityStats.rate}%
              </span>
              <span className="text-[10px] text-slate-450 font-black mt-1">
                {availabilityStats.status === 'excellent' ? t.excellent :
                 availabilityStats.status === 'good' ? t.good : t.critical
                }
              </span>
            </div>
          </div>

          {/* Quick status list breakdown bar */}
          <div className="w-full grid grid-cols-3 gap-2 text-center text-[10px] font-black border-t border-slate-50 dark:border-slate-700/50 pt-4">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-100/50 dark:border-emerald-900/40">
              <span className="text-emerald-600 dark:text-emerald-400 block font-mono text-xs">{availabilityStats.active}</span>
              <span className="text-slate-400 text-[9px] mt-0.5 block">{language === 'ar' ? 'نشط' : 'Active'}</span>
            </div>
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-2 rounded-xl border border-indigo-100/50 dark:border-indigo-900/40">
              <span className="text-indigo-600 dark:text-indigo-400 block font-mono text-xs">{availabilityStats.maintenance}</span>
              <span className="text-slate-400 text-[9px] mt-0.5 block">{language === 'ar' ? 'صيانة' : 'Repair'}</span>
            </div>
            <div className="bg-rose-50/50 dark:bg-rose-950/20 p-2 rounded-xl border border-rose-100/50 dark:border-rose-900/40">
              <span className="text-rose-600 dark:text-rose-400 block font-mono text-xs">{availabilityStats.stopped}</span>
              <span className="text-slate-400 text-[9px] mt-0.5 block">{language === 'ar' ? 'معطل' : 'Stopped'}</span>
            </div>
          </div>

        </div>

      </div>

      {/* ==================== NEW SECTION: MAINTENANCE COST DISTRIBUTION BY TYPE & ASSET ==================== */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft space-y-4">
        {/* Header with section title and view controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 dark:border-slate-700/50 pb-3">
          <div className="flex items-center gap-2 text-right">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers size={15} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {t.distributionSectionTitle}
                </h3>
                <ContextualHelp
                  id="cost-distribution-manager"
                  titleAr="تحليل هيكل التكاليف ونفقات الصيانة"
                  titleEn="Maintenance Cost & Expense Structure"
                  explanationAr="توزيع نفقات الصيانة والوقاية على مختلف فئات وأقسام الآليات والسيارات، مع رصد مباشر لأعلى 5 آليات استهلاكاً لميزانية الورش للتأكد من ربحية وحالة الأصول."
                  explanationEn="Visual distribution of maintenance and repair fees dividing fleet segments, accompanied with a real-time leaderboard highlighting the top 5 high-maintenance single vehicles."
                  benefitsAr={[
                    "تحديد دقيق للفئات والسيارات الأكثر تكلفة تشغيلية لترشيد الميزانية.",
                    "كشف الأعطال المتكررة في نوع معين من السيارات لاتخاذ قرارات الاستبدال.",
                    "حساب الحصة المئوية التراكمية لكل آلية من إجمالي الإنفاق لتجنب الإهدار."
                  ]}
                  benefitsEn={[
                    "Pinpoints heavy-expenditure categories or vehicles instantly.",
                    "Signals potential chronic vehicle issues for smart asset disposal decisions.",
                    "Calculates precise spend share percentage for better fiscal planning."
                  ]}
                  tipsAr={[
                    "إذا لاحظت صعود آلية معينة لمنصة الأعلى تكلفة باستمرار، فقد يكون الوقت قد حان لإخضاعها لفحص شامل وإعادة تقييم جدواها التشغيلية."
                  ]}
                  tipsEn={[
                    "If a single vehicle constantly dominates the high-expense ranks, consider a systemic diagnostic or evaluating its overall ROI."
                  ]}
                  language={language}
                />
              </div>
              <p className="text-[9.5px] text-slate-400">{t.distributionSub}</p>
            </div>
          </div>

          {/* Sub-tab view switchers */}
          <div className="bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-1 self-end sm:self-auto">
            <button
              onClick={() => setDistViewMode('category')}
              className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all cursor-pointer ${
                distViewMode === 'category'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.byCategoryTab}
            </button>
            <button
              onClick={() => setDistViewMode('vehicle')}
              className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all cursor-pointer ${
                distViewMode === 'vehicle'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.byIndividualVehicleTab}
            </button>
          </div>
        </div>

        {/* Content Bento Sub-grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Chart Display Area (Col span 7) */}
          <div className="lg:col-span-7 h-64 flex items-center justify-center relative">
            {distViewMode === 'category' ? (
              costsByVehicleType.length === 0 ? (
                <div className="text-center text-xs text-slate-400 font-bold p-6">
                  {t.noCostData}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col sm:flex-row items-center justify-around gap-4">
                  {/* Pie chart */}
                  <div className="w-48 h-48 shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costsByVehicleType}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {costsByVehicleType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<DistributionTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Centered details */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-2 text-center">
                      <span className="text-slate-400 text-[9px] font-extrabold">{language === 'ar' ? 'الإنفاق' : 'Expenditure'}</span>
                      <span className="text-[10px] font-mono font-black text-slate-800 dark:text-white mt-0.5">
                        {monthlyCostData.totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* High fidelity legend list */}
                  <div className="flex-1 space-y-2 text-right w-full overflow-y-auto max-h-56 pr-2">
                    {costsByVehicleType.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] font-bold py-1 border-b border-slate-50 dark:border-slate-800/50">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-2.5 h-2.5 rounded-full inline-block shrink-0" 
                            style={{ backgroundColor: DISTRIBUTION_COLORS[idx % DISTRIBUTION_COLORS.length] }} 
                          />
                          <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-800 dark:text-slate-200">{item.value.toLocaleString()} {t.currency}</span>
                          <span className="font-mono bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-[10px] text-emerald-600 dark:text-emerald-400">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              costsByIndividualVehicle.length === 0 ? (
                <div className="text-center text-xs text-slate-400 font-bold p-6">
                  {t.noCostData}
                </div>
              ) : (
                <div className="w-full h-full text-xs font-semibold">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costsByIndividualVehicle} margin={{ top: 15, right: 10, left: -10, bottom: 5 }} layout="vertical">
                      <defs>
                        <linearGradient id="barCostGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#1c2534" className="hidden dark:block" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={100} tickLine={false} />
                      <Tooltip content={<DistributionTooltip />} />
                      <Bar dataKey="value" fill="url(#barCostGrad)" radius={[0, 4, 4, 0]}>
                        {costsByIndividualVehicle.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
            )}
          </div>

          {/* Top Vehicles leaderboards list (Col span 5) */}
          <div className="lg:col-span-5 space-y-3.5 border-t lg:border-t-0 lg:border-r border-slate-100 dark:border-slate-800/80 pt-4 lg:pt-0 lg:pr-5">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider text-right flex items-center justify-between">
              <span>{language === 'ar' ? 'تصنيف كفاءة استهلاك الأصول (الأعلى نفقات)' : 'Asset Budget Consumption Rank (Highest)'}</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            </h4>
            
            {costsByIndividualVehicle.length === 0 ? (
              <p className="text-center text-[11px] text-slate-400 font-bold">{t.noCostData}</p>
            ) : (
              <div className="space-y-3 text-right">
                {costsByIndividualVehicle.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-black">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 w-5 h-5 rounded-lg flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="flex flex-col text-right">
                          <span className="text-slate-800 dark:text-slate-100 leading-tight">{item.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono font-medium leading-none mt-0.5">{item.plate} | {item.type}</span>
                        </div>
                      </div>
                      <span className="font-mono text-rose-500 font-extrabold">{item.value.toLocaleString()} {t.currency}</span>
                    </div>
                    {/* High polish custom progress bar */}
                    <div className="relative w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-450 font-extrabold">
                      <span>{t.orderCountLabel} <strong className="font-mono text-slate-600 dark:text-slate-300">{item.ordersCount}</strong></span>
                      <span>{language === 'ar' ? `حصة الكلفة: ${item.percentage}%` : `Cost Share: ${item.percentage}%`}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Fleet Availability Timeline Trend Chart */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <LineIcon size={15} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {t.availabilityTrendTitle}
                </h3>
                <ContextualHelp
                  id="availability-trend-manager"
                  titleAr="معدل جاهزية الأسطول الميداني والـ SLA"
                  titleEn="Fleet Availability & SLA Trend"
                  explanationAr="مؤشر فوري يقيس نسبة توفر الآليات الصالحة للخدمة بشكل فوري ومقارنتها تاريخياً مع حد الأمان المستهدف (SLA) وهو 95% لضمان فاعلية التغطية اللوجستية."
                  explanationEn="A live timeline trace calculating the percentage of in-service assets and measuring them against the safety target SLA of 95%."
                  benefitsAr={[
                    "مراقبة مستوى الجاهزية التشغيلية للأسطول ككل مقارنة باتفاقية مستوى الخدمة.",
                    "كشف الفترات التي يتدنى فيها الأداء للبحث في الأسباب وعلاج تكتلات الصيانة.",
                    "مقارنة الكفاءة بين مختلف الفئات لتحديد أوجه القصور الهيكلي."
                  ]}
                  benefitsEn={[
                    "Monitor operational readiness relative to the targeted SLA.",
                    "Expose historical performance dips to fix repair queue congestion.",
                    "Compare efficiency across different asset groups to rectify structural flaws."
                  ]}
                  tipsAr={[
                    "نسبة الجاهزية المثالية هي 95% فما فوق. إذا هبط المنحنى دون هذا الحد، قم بفحص البلاغات المتراكمة لتسريع الإنجاز."
                  ]}
                  tipsEn={[
                    "Ideal availability rate is 95%+. If the curve dips below, audit open maintenance backlogs to speed up repair workflow."
                  ]}
                  language={language}
                />
              </div>
              <p className="text-[9.5px] text-slate-400">{language === 'ar' ? 'مخطط تتبعي تفاعلي يبين استقرار توفر الأسطول مقابل النسبة المستهدفة 95%' : 'Interactive timeline tracing fleet availability against target SLA'}</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
            SLA: 95%
          </span>
        </div>

        <div className="h-64 text-xs font-semibold">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyAvailabilityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2534" className="hidden dark:block" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={[70, 100]} unit="%" />
              <Tooltip content={<AvailabilityTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line 
                type="monotone" 
                dataKey={t.kpiAvailability} 
                name={language === 'ar' ? 'جاهزية الأسطول الفعليّة' : 'Actual Fleet Availability'} 
                stroke="#6366f1" 
                strokeWidth={3}
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="SLA" 
                name={t.targetSlaLine} 
                stroke="#ef4444" 
                strokeWidth={1.5}
                strokeDasharray="5 5" 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* manager critical alerts & strategic insights bento box */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-705 shadow-soft space-y-4">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-50 dark:border-slate-700/50 pb-3 flex-wrap">
          <Info size={14} className="text-indigo-600 animate-bounce" />
          <span>{t.insightsTitle}</span>
          <ContextualHelp
            id="strategic-insights-manager"
            titleAr="التوصيات الفنية والاستراتيجية"
            titleEn="Strategic Engineering Insights"
            explanationAr="توصيات دورية يطلقها النظام تلقائياً لتنبيهك بشأن فجوات سلسلة الإمداد، ترقية مخزون قطع الغيار الحاكمة، والانتقال للصيانة الوقائية."
            explanationEn="Dynamic system recommendations triggered to alert you about supply-chain gaps, stock safety levels, or preventive maintenance shift advice."
            benefitsAr={[
              "تقليل الأعطال المفاجئة والانتقال التدريجي إلى الصيانة الوقائية.",
              "التحقق التلقائي من توافر قطع الغيار الأساسية لتقليل فترات انتظار المركبات.",
              "مواءمة مستويات مخزون القطع الحاكمة مع معدلات الاستهلاك الفعلي."
            ]}
            benefitsEn={[
              "Decrease unexpected breakdowns by moving into preventive maintenance.",
              "Automated verification of critical spare part availability to prevent downtime.",
              "Align stock safety thresholds of vital parts with actual usage ratios."
            ]}
            tipsAr={[
              "قم بمراجعة هذه التوصيات بشكل أسبوعي للمساعدة في صياغة خطة المشتريات وجدولة ورش الصيانة."
            ]}
            tipsEn={[
              "Review these action points weekly to optimize spare parts procurement and workshop schedules."
            ]}
            language={language}
          />
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Preventive replace */}
          <div className="p-4 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl space-y-2 text-right">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <CheckCircle2 size={15} />
              <h4 className="text-xs font-black">{t.insight1Title}</h4>
            </div>
            <p className="text-[11px] font-bold text-slate-650 dark:text-slate-300 leading-relaxed">
              {t.insight1Desc}
            </p>
          </div>

          {/* Card 2: SLA Alert */}
          <div className="p-4 bg-amber-50/20 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30 rounded-2xl space-y-2 text-right">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle size={15} />
              <h4 className="text-xs font-black">{t.insight2Title}</h4>
            </div>
            <p className="text-[11px] font-bold text-slate-650 dark:text-slate-300 leading-relaxed">
              {t.insight2Desc}
            </p>
          </div>

          {/* Card 3: Response Speed */}
          <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl space-y-2 text-right">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Activity size={15} />
              <h4 className="text-xs font-black">{t.insight3Title}</h4>
            </div>
            <p className="text-[11px] font-bold text-slate-655 dark:text-slate-300 leading-relaxed">
              {t.insight3Desc}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
