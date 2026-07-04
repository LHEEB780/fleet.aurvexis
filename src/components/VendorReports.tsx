import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  DollarSign, 
  HelpCircle, 
  ArrowUpRight, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles,
  Info,
  ChevronRight,
  Calculator,
  ThumbsUp
} from 'lucide-react';
import { Vendor, SupplyOrder } from '../types';

interface VendorReportsProps {
  vendors: Vendor[];
  supplyOrders: SupplyOrder[];
}

export default function VendorReports({ vendors, supplyOrders }: VendorReportsProps) {
  const [selectedVendorId, setSelectedVendorId] = useState<string>('all');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // --- 1. DEFINE LAST 12 MONTHS ---
  const months = useMemo(() => {
    const list = [];
    // Anchor Date is May 26, 2026
    const currentDate = new Date('2026-05-26');
    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      // Generate keys like '2025-06'
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      // Arabic short month format
      const label = d.toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' });
      list.push({ key, label });
    }
    return list;
  }, []);

  // --- 2. AGGREGATE SPENDING OVER LAST 12 MONTHS ---
  const spendingTrendData = useMemo(() => {
    return months.map(m => {
      const row: any = { name: m.label, key: m.key };
      let totalInMonth = 0;
      
      vendors.forEach(v => {
        const monthlyOrders = supplyOrders.filter(o => 
          o.vendorId === v.id && 
          o.status === 'delivered' && 
          o.actualDeliveryDate && 
          o.actualDeliveryDate.startsWith(m.key)
        );
        const spend = monthlyOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        
        row[v.name] = spend;
        totalInMonth += spend;
      });
      
      row['الإجمالي'] = totalInMonth;
      return row;
    });
  }, [months, vendors, supplyOrders]);

  // Specific single vendor trend mapping
  const singleVendorTrendData = useMemo(() => {
    if (selectedVendorId === 'all') return [];
    const matchedVendor = vendors.find(v => v.id === selectedVendorId);
    if (!matchedVendor) return [];

    return months.map(m => {
      const monthlyOrders = supplyOrders.filter(o => 
        o.vendorId === selectedVendorId && 
        o.status === 'delivered' && 
        o.actualDeliveryDate && 
        o.actualDeliveryDate.startsWith(m.key)
      );
      
      const spend = monthlyOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      const ordersCount = monthlyOrders.length;
      const avgPrice = ordersCount > 0 ? spend / ordersCount : 0;

      return {
        name: m.label,
        'حجم الإنفاق (ر.س)': spend,
        'عدد الطلبيات المستلمة': ordersCount,
        'متوسط سعر الطلب': avgPrice
      };
    });
  }, [months, selectedVendorId, vendors, supplyOrders]);

  // --- 3. COST TO RELIABILITY RATIO ANALYSIS ---
  // We formulate a derived index to highlight performance:
  // Reliability Score = vendor.reliability (1-5)
  // Total Spent = Sum of delivered orders totalPrice
  // Average Unit Price = Sum of delivered unit prices / delivered count
  // Value Ratio = Reliability * 10 / (Average Unit Price / 100) -> Higher is better!
  // Cost-to-Reliability Ratio = Avg Unit Price / Reliability -> Lower is better! (lower cost per unit of reliability)
  const vendorPerformanceData = useMemo(() => {
    return vendors.map(vendor => {
      const deliveredOrders = supplyOrders.filter(o => o.vendorId === vendor.id && o.status === 'delivered');
      
      const totalSpendStr = deliveredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      const totalPartsCount = deliveredOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
      const avgUnitCost = deliveredOrders.length > 0 
        ? deliveredOrders.reduce((sum, o) => sum + (o.unitPrice || 0), 0) / deliveredOrders.length 
        : 0;
      
      // Cost to Reliability Ratio: Cost (Average Unit Price) divided by Reliability (1 to 5)
      // Representing how much we pay relative to their reliability star. Lower is better!
      const costToReliability = vendor.reliability > 0 
        ? Math.round((avgUnitCost / vendor.reliability) * 10) / 10 
        : avgUnitCost;

      // Quality Value Efficiency Index: (Reliability * 100) / (avgUnitCost || 1)
      // Representing how much reliability we get per unit cost. Higher is better!
      const valueEfficiencyIndex = avgUnitCost > 0 
        ? Math.round((vendor.reliability * 100) / (avgUnitCost / 100)) / 10
        : vendor.reliability * 10;

      // Classify vendor into quadrants
      // Limit thresholds
      const avgPriceThreshold = 350; // Middle price threshold
      const reliabilityThreshold = 4.0; // Middle reliability stars
      
      let classification = '';
      let badgeColor = '';
      let textExplanation = '';
      
      if (vendor.reliability >= reliabilityThreshold && avgUnitCost <= avgPriceThreshold) {
        classification = 'ممتاز (قيمة قصوى وتكلفة مثالية)';
        badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        textExplanation = 'يقدم أعلى المعايير الفنية مقابل تكاليف توريد اقتصادية ومنافسة للغاية.';
      } else if (vendor.reliability >= reliabilityThreshold && avgUnitCost > avgPriceThreshold) {
        classification = 'جودة فاخرة (موثوقية متميزة ولكن مكلفة)';
        badgeColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        textExplanation = 'أداء احترافي ممتاز وشحن متقن، لكن الأسعار وسعر الوحدات مرتفع نسبياً.';
      } else if (vendor.reliability < reliabilityThreshold && avgUnitCost <= avgPriceThreshold) {
        classification = 'اقتصادي (تكلفة منخفضة ومخاطر شحن)';
        badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        textExplanation = 'أسعار تنافسية جداً ومنخفضة، لكن الموثوقية ومعدلات الالتزام بالمواعيد متذبذبة.';
      } else {
        classification = 'غير مجدي (مخاطرة تشغيلية وتكلفة عالية)';
        badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
        textExplanation = 'تكلفة توريد مرتفعة مصحوبة بنسب توريد متأخرة أو جودة متدنية في الالتزام.';
      }

      return {
        id: vendor.id,
        name: vendor.name,
        reliability: vendor.reliability,
        totalSpend: totalSpendStr,
        totalQty: totalPartsCount,
        avgUnitCost: Math.round(avgUnitCost * 100) / 100,
        costToReliability,
        valueEfficiencyIndex,
        classification,
        badgeColor,
        textExplanation,
        ordersCount: deliveredOrders.length
      };
    }).sort((a, b) => b.valueEfficiencyIndex - a.valueEfficiencyIndex); // Sort by highest value score first!
  }, [vendors, supplyOrders]);

  // Dynamic colors for each vendor bar
  const vendorColors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ec4899', // pink
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f43f5e'  // rose
  ];

  const totalTwelveMonthSpend = useMemo(() => {
    return vendorPerformanceData.reduce((sum, v) => sum + v.totalSpend, 0);
  }, [vendorPerformanceData]);

  // Find the overall best value vendor
  const bestValueVendor = useMemo(() => {
    if (vendorPerformanceData.length === 0) return null;
    // Highlight vendors that are active and have highest efficiency index
    const activeData = vendorPerformanceData.filter(v => {
      const original = vendors.find(ov => ov.id === v.id);
      return original && original.status === 'active';
    });
    if (activeData.length === 0) return vendorPerformanceData[0];
    return activeData.reduce((best, current) => 
      current.valueEfficiencyIndex > best.valueEfficiencyIndex ? current : best
    , activeData[0]);
  }, [vendorPerformanceData, vendors]);

  return (
    <div className="space-y-6">
      
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Spend KPI */}
        <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex shadow-sm items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">إجمالي التوريدات (آخر 12 شهراً)</span>
            <h3 className="text-xl font-black text-slate-850 dark:text-white font-mono">
              {totalTwelveMonthSpend.toLocaleString()} ر.س
            </h3>
            <p className="text-[9px] text-slate-500">مجموع قيم عمليات الشراء المؤرشفة بالرفوف</p>
          </div>
          <div className="w-10 h-10 bg-brand-blue-500/10 rounded-xl flex items-center justify-center text-brand-blue-500">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Best Performance Supplier */}
        {bestValueVendor && (
          <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex items-center justify-between col-span-1 md:col-span-2">
            <div className="space-y-1 w-full">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                <Award size={12} className="animate-bounce" />
                <span>أعلى كفاءة توريد معتمدة (أفضل نسبة تكلفة للموثوقية)</span>
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    🏢 {bestValueVendor.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    معدل موثوقية مرتفع <strong className="text-amber-500">({bestValueVendor.reliability} نجوم)</strong> مقابل متوسط سعر توريد <strong className="text-emerald-600 font-mono">{bestValueVendor.avgUnitCost} ر.س</strong> للوحدة.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-xl">
                  <span>مؤشر الكفاءة: </span>
                  <span className="font-mono text-sm">{bestValueVendor.valueEfficiencyIndex}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spending Trend Chart Card */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-blue-500" />
                <span>تحليل تفصيلي لمسحوبات المشتريات والإنفاق (آخر 12 شهراً)</span>
              </h3>
              <p className="text-[10px] text-slate-500">تتبع حجم الإنفاق بالريال السعودي شهرياً لمعرفة سلوك التدفقات النقدية.</p>
            </div>
            
            {/* Selector to switch from All vendors representation to Single vendor detail */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">عزل العرض:</span>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-[10px] px-2.5 py-1.5 rounded-xl font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="all">كل الموردين (رسم تراكمي)</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>🏢 {v.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Recharts Render Container */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {selectedVendorId === 'all' ? (
                // Stacked Bar Chart for Cumulative Spend Per Month
                <BarChart
                  data={spendingTrendData}
                  margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-900" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} 
                    axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                    tickFormatter={(val) => `${val.toLocaleString()} ر.س`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px',
                      direction: 'rtl',
                      textAlign: 'right',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any, name: any) => [`${value.toLocaleString()} ر.س`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                  {vendors.map((v, index) => (
                    <Bar 
                      key={v.id} 
                      dataKey={v.name} 
                      stackId="spend" 
                      fill={vendorColors[index % vendorColors.length]} 
                      radius={index === vendors.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              ) : (
                // Single Vendor Specific Analysis Chart
                <ComposedChart
                  data={singleVendorTrendData}
                  margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-900" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} 
                    axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                    tickFormatter={(val) => `${val.toLocaleString()} ر.س`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#3b82f6', fontSize: 9, fontWeight: 'bold' }}
                    axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                    tickFormatter={(val) => `${val} طلبية`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px',
                      direction: 'rtl',
                      textAlign: 'right',
                      border: 'none',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Bar 
                    yAxisId="left"
                    dataKey="حجم الإنفاق (ر.س)" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    barSize={30}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="عدد الطلبيات المستلمة" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }} 
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost vs Reliability Multi-Index Info Panel */}
        <div className="p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator size={16} className="text-amber-500" />
              <span>مصفوفة التكلفة مقابل الالتزام والاعتماد</span>
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              تقييم استراتيجي يرسم علاقات أسعار المشتريات للقطع بمستوى التزام مواعيد التوريد والنقاط الفنية للموردين.
            </p>
          </div>

          {/* Quick Explanation Toggle */}
          <div className="p-3.5 bg-slate-500/5 rounded-xl border border-slate-150 dark:border-slate-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-800 dark:text-slate-200 font-extrabold flex items-center gap-1">
                <Info size={12} className="text-brand-blue-500" />
                <span>كيف يتم الحساب العلمي للمصفوفة؟</span>
              </span>
              <button 
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-[9px] text-brand-blue-500 dark:text-brand-blue-400 font-extrabold hover:underline"
              >
                {showExplanation ? 'إغلاق التوضيح' : 'عرض التفاصيل'}
              </button>
            </div>
            {showExplanation && (
              <p className="text-[9px] text-slate-500 leading-relaxed transition-all">
                يتم قياس العلاقة بقسمة متوسط كلفة الشحنات على حاصل نجوم الموثوقية (Cost-to-Reliability). القيمة الأقل تعني جدوى عالية ورفاهية تسليم مثالية بأرخص الأتعاب.
              </p>
            )}
            
            {/* Value scale pointers */}
            <div className="grid grid-cols-2 gap-2 text-[9px] pt-1">
              <div className="bg-white dark:bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col">
                <span className="text-slate-400">معدل التكلفة الأفضل</span>
                <span className="font-extrabold text-emerald-600 mt-0.5">أقل كلفة للمقاس الواحد</span>
              </div>
              <div className="bg-white dark:bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col">
                <span className="text-slate-400">كفاءة الأرصدة والرفوف</span>
                <span className="font-extrabold text-[#38bdf8] mt-0.5">موثوقية شحن متقنة (★5)</span>
              </div>
            </div>
          </div>

          {/* Mini Quadrants Status Bar view */}
          <div className="space-y-2 pt-2">
            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">تقييم النطاق الاستراتيجي للموردين:</span>
            <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1">
              {vendorPerformanceData.map((v, i) => (
                <div key={v.id} className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-100 dark:border-slate-900 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-900 dark:text-white text-[10px] block">
                      {i + 1}. {v.name}
                    </span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black tracking-tight ${v.badgeColor}`}>
                      {v.classification}
                    </span>
                  </div>
                  
                  {/* Score circle badge */}
                  <div className="text-left">
                    <span className="font-mono font-bold text-slate-500 text-[9px] block">نقاط القيمة</span>
                    <span className="font-mono text-xs font-black text-brand-blue-600 dark:text-[#3a9df8]">{v.valueEfficiencyIndex}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* cost to reliability quadrant and detailed metrics table */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Table/Matrix Header */}
        <div className="p-5 border-b border-slate-105 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-500 animate-pulse" />
              <span>جدول المقارنة الفنية واللوجستية الشاملة للموردين</span>
            </h3>
            <p className="text-[10px] text-slate-500">حساب تفصيلي للعقود والارتباط بالقطع، متوسط السعر، ومؤشرات الجدوى الاقتصادية.</p>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/30 dark:bg-slate-900/20 text-[10px] font-black text-slate-450 uppercase border-b border-slate-100 dark:border-slate-900">
                <th className="py-3 px-4">اسم المورّد المعتمد</th>
                <th className="py-3 px-4 text-center">الالتزام بمواعيد الشحن (الموثوقية)</th>
                <th className="py-3 px-4 text-center">عدد شحنات التوريد الناجحة</th>
                <th className="py-3 px-4 text-center">متوسط الفاتورة الفعلي (ر.س)</th>
                <th className="py-3 px-4 text-center">إجمالي التدفق المالي (ر.س)</th>
                <th className="py-3 px-4 text-center">تكلفة النجمة من الموثوقية (ر.س)*</th>
                <th className="py-3 px-4 text-center">كفاءة الإنفاق الكلية</th>
                <th className="py-3 px-4 text-center">تصنيف الجدوى التشغيلية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-xs text-slate-700 dark:text-slate-300">
              {vendorPerformanceData.map((perf) => {
                return (
                  <tr key={perf.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                    
                    {/* Name */}
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                      <span className="text-slate-400">🏢</span>
                      <span>{perf.name}</span>
                    </td>

                    {/* Reliability Progress */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 text-amber-500 font-bold">
                        <span className="font-mono">{perf.reliability} / 5</span>
                        <span className="text-xs">★</span>
                      </div>
                    </td>

                    {/* Delivered Count */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      {perf.ordersCount} طلبات
                    </td>

                    {/* Average unit price */}
                    <td className="py-3.5 px-4 text-center font-mono font-extrabold text-slate-900 dark:text-slate-200">
                      {perf.avgUnitCost.toLocaleString()} ر.س
                    </td>

                    {/* Total spent */}
                    <td className="py-3.5 px-4 text-center font-mono font-semibold">
                      {perf.totalSpend.toLocaleString()} ر.س
                    </td>

                    {/* Cost PER reliability point (Avg Cost / Reliability) -> lower is better! */}
                    <td className="py-3.5 px-4 text-center font-mono font-black text-slate-900 dark:text-white">
                      <div className="space-y-1">
                        <span>{perf.costToReliability.toLocaleString()} ر.س</span>
                        {perf.ordersCount > 0 && perf.costToReliability <= 100 && (
                          <span className="block text-[8px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/5 py-0.5 rounded">
                            جدوى اقتصادية ممتازة
                          </span>
                        )}
                        {perf.ordersCount > 0 && perf.costToReliability > 100 && perf.costToReliability <= 250 && (
                          <span className="block text-[8px] text-sky-650 dark:text-sky-450 font-extrabold bg-sky-500/5 py-0.5 rounded">
                            قيمة متزنة
                          </span>
                        )}
                        {perf.ordersCount > 0 && perf.costToReliability > 250 && (
                          <span className="block text-[8px] text-red-500 dark:text-red-400 font-extrabold bg-rose-500/5 py-0.5 rounded">
                            تكلفة نسبية عالية
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Score coefficient represented as small progress bar */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono text-xs font-black text-brand-blue-500 dark:text-brand-blue-400">
                          {perf.valueEfficiencyIndex}
                        </span>
                        {/* small styled meter bar */}
                        <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-blue-500 rounded-full" 
                            style={{ width: `${Math.min(100, perf.valueEfficiencyIndex * 15)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Strategic Advice */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-black border ${perf.badgeColor}`}>
                        {perf.classification}
                      </span>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Footnote */}
        <div className="p-4 bg-slate-500/5 border-t border-slate-100 dark:border-slate-900 text-[10px] text-slate-450 leading-relaxed">
          * يتم احتساب <strong>"تكلفة النجمة من الموثوقية"</strong> كنسبة بين متوسط أسعار الوحدات وعلامة موثوقية المورّد الكلية. يساعد المؤشر على معرفة ما إذا كانت الأسعار العالية تضمن فعلاً التزاماً أكبر أم تشكل عبئاً على ميزانية المنشأة دون نفع تشغيلي ملموس.
        </div>

      </div>

    </div>
  );
}
