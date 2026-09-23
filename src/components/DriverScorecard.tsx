import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Wrench, 
  CalendarCheck, 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Truck, 
  FileText, 
  Download, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  RefreshCw, 
  User, 
  Droplet, 
  Gauge, 
  Fuel, 
  Star, 
  ArrowUpRight,
  Info,
  Check,
  X,
  Printer,
  BarChart3,
  SlidersHorizontal,
  Bug,
  Terminal,
  Copy
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../services/LanguageContext';
import { Driver, Vehicle, User as AppUser } from '../types';
import { exportDriverScorecardPDF } from '../utils/scorecardPdfGenerator';

export interface DriverScorecardData {
  driver: Driver;
  overallScore: number; // 0 to 100
  tier: 'elite' | 'pro' | 'standard' | 'critical';
  grade: string;
  rank: number;
  
  // Pillar 1: Handover History Score (35%)
  handoverScore: number;
  handoverMetrics: {
    totalHandovers: number;
    cleanHandovers: number;
    handoversWithDamage: number;
    avgFuelReturnPct: number;
    cleanlinessComplianceRate: number; // %
    onTimeHandoverRate: number; // %
    history: Array<{
      id: string;
      date: string;
      vehicleName: string;
      vehiclePlate: string;
      type: 'incoming' | 'outgoing';
      fuelLevel: number;
      hasDamage: boolean;
      damageNotes?: string;
      damageNotesEn?: string;
      passedItems: number;
      totalItems: number;
    }>;
  };

  // Pillar 2: Reported Maintenance Issues & Care (35%)
  maintenanceScore: number;
  maintenanceMetrics: {
    totalReportedIssues: number;
    earlyReportedRate: number; // % preventative reporting
    criticalBreakdownsCount: number;
    negligenceIncidentsCount: number;
    careEfficiencyRate: number; // %
    recentIssues: Array<{
      id: string;
      date: string;
      vehicleName: string;
      description: string;
      descriptionEn?: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      category: string;
      categoryEn?: string;
      type: 'preventative_report' | 'normal_wear' | 'breakdown';
      status: string;
      statusEn?: string;
    }>;
  };

  // Pillar 3: Adherence to Inspection Schedules (30%)
  inspectionScore: number;
  inspectionMetrics: {
    scheduledCount: number;
    completedOnTimeCount: number;
    missedOrLateCount: number;
    adherenceRate: number; // %
    safetyPassRate: number; // %
    inspections: Array<{
      id: string;
      scheduledDate: string;
      completedDate: string;
      vehicleName: string;
      type: 'pre_trip' | 'periodic' | 'safety' | 'technical';
      status: 'passed' | 'warning' | 'failed';
      isLate: boolean;
      score: number;
    }>;
  };

  radarData: Array<{ subject: string; subjectEn: string; score: number }>;
  strengths: string[];
  strengthsEn?: string[];
  weaknesses: string[];
  weaknessesEn?: string[];
  aiActionRecommendations: string[];
  aiActionRecommendationsEn?: string[];
}

interface DriverScorecardProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  user: AppUser;
  onSelectDriverForEdit?: (driver: Driver) => void;
  onViewDriverDetails?: (driver: Driver) => void;
}

// Deterministic mock and real calculation generator for each driver
export function calculateDriverScorecard(
  driver: Driver, 
  vehicles: Vehicle[], 
  rankIndex: number = 1
): DriverScorecardData {
  const driverId = driver.id;
  const driverName = driver.name;
  const linkedVehicle = vehicles.find(v => v.id === driver.assignedVehicleId) || vehicles[0];

  // Try reading real localStorage records
  let savedHandovers: any[] = [];
  try {
    const raw = localStorage.getItem('fleet_driver_handovers_v1');
    if (raw) savedHandovers = JSON.parse(raw);
  } catch (e) {}

  let savedMaintenance: any[] = [];
  try {
    const raw = localStorage.getItem('fleet_maintenance_orders_v2');
    if (raw) savedMaintenance = JSON.parse(raw);
  } catch (e) {}

  let savedInspections: any[] = [];
  try {
    const raw = localStorage.getItem('fleet_safety_inspections');
    if (raw) savedInspections = JSON.parse(raw);
  } catch (e) {}

  // Filter records related to this driver
  const driverHandovers = savedHandovers.filter((h: any) => h.driverId === driverId || h.driverName === driverName);
  const driverMaintenance = savedMaintenance.filter((m: any) => m.vehicleId === driver.assignedVehicleId);

  // Compute deterministic seed based on driver properties for stable baseline stats
  const nameHash = (driverId + driverName).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseSeed = nameHash % 100;

  // 1. Handover History Calculations
  const totalHandovers = driverHandovers.length > 0 ? driverHandovers.length : 8 + (baseSeed % 14);
  const handoversWithDamage = driverHandovers.length > 0 
    ? driverHandovers.filter((h: any) => h.damageNotes && h.damageNotes.trim().length > 0).length
    : (baseSeed % 5 === 0 ? 2 : baseSeed % 3 === 0 ? 1 : 0);
  const cleanHandovers = Math.max(0, totalHandovers - handoversWithDamage);
  const cleanRatio = cleanHandovers / (totalHandovers || 1);
  const avgFuelReturnPct = driverHandovers.length > 0
    ? Math.round(driverHandovers.reduce((acc, h) => acc + (h.fuelLevel || 75), 0) / driverHandovers.length)
    : 70 + (baseSeed % 28);
  const onTimeHandoverRate = 85 + (baseSeed % 15);
  const cleanlinessComplianceRate = 80 + (baseSeed % 20);

  // Handover score: (Cleanliness * 0.4) + (Fuel compliance * 0.3) + (Punctuality * 0.3)
  const handoverScore = Math.min(100, Math.max(45, Math.round(
    (cleanRatio * 100) * 0.45 + (avgFuelReturnPct >= 60 ? 100 : avgFuelReturnPct * 1.4) * 0.25 + onTimeHandoverRate * 0.30
  )));

  // Generate Handover History list items
  const handoverHistoryList = driverHandovers.length > 0 
    ? driverHandovers.slice(0, 5).map((h, i) => ({
        id: h.id || `h-${i}`,
        date: h.date || '2026-05-15',
        vehicleName: h.vehicleName || linkedVehicle?.name || 'شاحنة مرسيدس أكتروس',
        vehiclePlate: h.vehiclePlate || linkedVehicle?.plateNumber || 'أ ب ج 1234',
        type: (h.type || 'incoming') as 'incoming' | 'outgoing',
        fuelLevel: h.fuelLevel || 75,
        hasDamage: Boolean(h.damageNotes && h.damageNotes.trim()),
        damageNotes: h.damageNotes || 'لا توجد أي أضرار، فحص سليم 100%',
        passedItems: 7,
        totalItems: 7
      }))
    : [
        {
          id: `h-seed-1-${driverId}`,
          date: '2026-05-24',
          vehicleName: linkedVehicle?.name || 'مرسيدس أكتروس 1845',
          vehiclePlate: linkedVehicle?.plateNumber || 'ر ق م 4821',
          type: 'incoming' as const,
          fuelLevel: avgFuelReturnPct,
          hasDamage: handoversWithDamage > 0,
          damageNotes: handoversWithDamage > 0 ? 'خدش سطحي خفيف بالصدام الأمامي' : 'استلام وتسليم مطابق للمواصفات بدون ملاحظات',
          damageNotesEn: handoversWithDamage > 0 ? 'Minor surface scratch on front bumper' : 'Compliant handover with no remarks',
          passedItems: handoversWithDamage > 0 ? 6 : 7,
          totalItems: 7
        },
        {
          id: `h-seed-2-${driverId}`,
          date: '2026-05-18',
          vehicleName: linkedVehicle?.name || 'مرسيدس أكتروس 1845',
          vehiclePlate: linkedVehicle?.plateNumber || 'ر ق م 4821',
          type: 'outgoing' as const,
          fuelLevel: 85,
          hasDamage: false,
          damageNotes: 'تم فحص الإطارات ومستوى الزيوت - حالة ممتازة',
          damageNotesEn: 'Tires and fluids inspected - excellent condition',
          passedItems: 7,
          totalItems: 7
        },
        {
          id: `h-seed-3-${driverId}`,
          date: '2026-05-10',
          vehicleName: linkedVehicle?.name || 'مرسيدس أكتروس 1845',
          vehiclePlate: linkedVehicle?.plateNumber || 'ر ق م 4821',
          type: 'incoming' as const,
          fuelLevel: Math.max(50, avgFuelReturnPct - 5),
          hasDamage: false,
          damageNotes: 'تم توقيع الفحص الرقمي بدون ملاحظات',
          damageNotesEn: 'Digital inspection signed without remarks',
          passedItems: 7,
          totalItems: 7
        }
      ];

  // 2. Maintenance Issues & Vehicle Care Calculations
  const totalReportedIssues = driverMaintenance.length > 0 ? driverMaintenance.length : 1 + (baseSeed % 4);
  const criticalBreakdownsCount = baseSeed % 6 === 0 ? 1 : 0;
  const negligenceIncidentsCount = baseSeed % 7 === 0 ? 1 : 0;
  const earlyReportedRate = 80 + (baseSeed % 18);
  const careEfficiencyRate = Math.min(100, Math.max(40, 100 - (criticalBreakdownsCount * 25) - (negligenceIncidentsCount * 20)));

  // Maintenance Score: (Early detection rate * 0.4) + (Care Efficiency * 0.6)
  const maintenanceScore = Math.min(100, Math.max(40, Math.round(
    (earlyReportedRate * 0.4) + (careEfficiencyRate * 0.6)
  )));

  const recentIssuesList = [
    {
      id: `m-issue-1-${driverId}`,
      date: '2026-05-20',
      vehicleName: linkedVehicle?.name || 'مركبة الأسطول المخصصة',
      description: 'إبلاغ مبكر عن اهتزاز خفيف ببطانات الفرامل قبل تآكل الهوب',
      descriptionEn: 'Early report of mild brake pad vibration prior to rotor wear',
      severity: 'low' as const,
      category: 'فرامل ومكابح',
      categoryEn: 'Brakes & Hydraulics',
      type: 'preventative_report' as const,
      status: 'مكتمل ومعالج',
      statusEn: 'Resolved & Repaired'
    },
    {
      id: `m-issue-2-${driverId}`,
      date: '2026-05-02',
      vehicleName: linkedVehicle?.name || 'مركبة الأسطول المخصصة',
      description: 'فحص وتغيير فلتر الهواء وزيت المحرك الدوري',
      descriptionEn: 'Routine air filter replacement and engine oil service',
      severity: 'low' as const,
      category: 'صيانة دورية',
      categoryEn: 'Scheduled Service',
      type: 'normal_wear' as const,
      status: 'معتمد',
      statusEn: 'Approved'
    }
  ];

  // 3. Adherence to Inspection Schedules Calculations
  const scheduledCount = 12 + (baseSeed % 8);
  const missedOrLateCount = baseSeed % 5 === 0 ? 2 : baseSeed % 3 === 0 ? 1 : 0;
  const completedOnTimeCount = Math.max(0, scheduledCount - missedOrLateCount);
  const adherenceRate = Math.round((completedOnTimeCount / (scheduledCount || 1)) * 100);
  const safetyPassRate = 88 + (baseSeed % 12);

  // Inspection Score: (Adherence Rate * 0.6) + (Safety Pass Rate * 0.4)
  const inspectionScore = Math.min(100, Math.max(50, Math.round(
    (adherenceRate * 0.65) + (safetyPassRate * 0.35)
  )));

  const inspectionsList = [
    {
      id: `insp-1-${driverId}`,
      scheduledDate: '2026-05-28',
      completedDate: '2026-05-28',
      vehicleName: linkedVehicle?.name || 'شاحنة الأسطول',
      type: 'pre_trip' as const,
      status: 'passed' as const,
      isLate: false,
      score: 98
    },
    {
      id: `insp-2-${driverId}`,
      scheduledDate: '2026-05-21',
      completedDate: '2026-05-21',
      vehicleName: linkedVehicle?.name || 'شاحنة الأسطول',
      type: 'safety' as const,
      status: 'passed' as const,
      isLate: false,
      score: 95
    },
    {
      id: `insp-3-${driverId}`,
      scheduledDate: '2026-05-14',
      completedDate: missedOrLateCount > 0 ? '2026-05-15' : '2026-05-14',
      vehicleName: linkedVehicle?.name || 'شاحنة الأسطول',
      type: 'periodic' as const,
      status: missedOrLateCount > 0 ? 'warning' as const : 'passed' as const,
      isLate: missedOrLateCount > 0,
      score: missedOrLateCount > 0 ? 80 : 96
    }
  ];

  // Composite Weighted Score: (Handover 35% + Maintenance 35% + Inspection 30%)
  const overallScore = Math.min(100, Math.max(40, Math.round(
    (handoverScore * 0.35) + (maintenanceScore * 0.35) + (inspectionScore * 0.30)
  )));

  let tier: 'elite' | 'pro' | 'standard' | 'critical' = 'standard';
  let grade = 'B';

  if (overallScore >= 90) {
    tier = 'elite';
    grade = 'A+';
  } else if (overallScore >= 80) {
    tier = 'pro';
    grade = 'A';
  } else if (overallScore >= 68) {
    tier = 'standard';
    grade = 'B';
  } else {
    tier = 'critical';
    grade = 'C';
  }

  // Strengths and Weaknesses derivation
  const strengths: string[] = [];
  const strengthsEn: string[] = [];
  const weaknesses: string[] = [];
  const weaknessesEn: string[] = [];
  const aiActionRecommendations: string[] = [];
  const aiActionRecommendationsEn: string[] = [];

  if (handoverScore >= 85) {
    strengths.push('انضباط عالي في بروتوكول تسليم واستلام الآليات ونظافة الكابينة');
    strengthsEn.push('High compliance with vehicle handover protocols and cabin cleanliness.');
  } else {
    weaknesses.push('ضرورة الالتزام بإعادة الآلية بمستوى وقود كافٍ وعدم ترك ملاحظات نظافة');
    weaknessesEn.push('Must ensure adequate fuel level upon return and maintain cabin hygiene.');
  }

  if (maintenanceScore >= 85) {
    strengths.push('رصد استباقي للأعطال الطفيفة مما يحمي المحرك من الأعطال الجسيمة');
    strengthsEn.push('Proactive early reporting of minor defects, preventing major engine breakdowns.');
  } else {
    weaknesses.push('تأخر في الإبلاغ المبكر عن المؤشرات التحذيرية للمركبة');
    weaknessesEn.push('Delays in early reporting of vehicle warning indicators.');
  }

  if (inspectionScore >= 88) {
    strengths.push('التزام مثالي بجدول الفحص اليومي وقبل انطلاق الرحلات');
    strengthsEn.push('Exemplary adherence to daily and pre-trip inspection schedules.');
  } else {
    weaknesses.push('تسجيل تأخير في إتمام الفحص الدوري لمركبة الأسطول');
    weaknessesEn.push('Delays logged in completing scheduled fleet inspections.');
  }

  // AI recommendations
  if (tier === 'elite') {
    aiActionRecommendations.push('ترشيح السائق للحصول على مكافأة السلامة والتميز التشغيلي ربع السنوية.');
    aiActionRecommendations.push('تعيين السائق كمدرب ومشرف ميداني على السائقين الجدد في مسار التسليم والاستلام.');
    aiActionRecommendationsEn.push('Nominate driver for the quarterly safety and operational excellence bonus.');
    aiActionRecommendationsEn.push('Assign driver as field mentor for new recruits on handover procedures.');
  } else if (tier === 'pro') {
    aiActionRecommendations.push('مواصلة الالتزام الحالي مع التركيز على توثيق الفحص الرقمي قبل نصف ساعة من الموعد.');
    aiActionRecommendations.push('تشجيع السائق على الحفاظ على مستويات استهلاك الوقود المثالية.');
    aiActionRecommendationsEn.push('Maintain current performance with emphasis on logging digital inspections 30 mins early.');
    aiActionRecommendationsEn.push('Encourage continued optimization of vehicle fuel economy.');
  } else if (tier === 'standard') {
    aiActionRecommendations.push('عقد جلسة توجيهية حول أهمية توثيق حالة المركبة فور استلامها لتجنب نسب الأعطال.');
    aiActionRecommendations.push('تفعيل التنبيهات المباشرة على تطبيق السائق لتذكيره بمواعيد الفحص الدوري.');
    aiActionRecommendationsEn.push('Conduct coaching on thorough vehicle custody check-in to avoid attributed damages.');
    aiActionRecommendationsEn.push('Enable real-time push alerts on driver mobile app for scheduled inspection deadlines.');
  } else {
    aiActionRecommendations.push('إلزام السائق بدورة تدريبية مكثفة في الفحص الوقائي وبروتوكولات التسليم.');
    aiActionRecommendations.push('مراقبة المركبة المخصصة ميدانياً عبر أجهزة التتبع للحد من القيادة القاسية.');
    aiActionRecommendationsEn.push('Enroll driver in mandatory refresher course on preventive maintenance and handovers.');
    aiActionRecommendationsEn.push('Monitor telematics driving patterns closely to mitigate harsh braking and speeding.');
  }

  // Radar chart representation
  const radarData = [
    { subject: 'سلامة الاستلام والتسليم', subjectEn: 'Handover Integrity', score: handoverScore },
    { subject: 'العناية بالمركبة والأعطال', subjectEn: 'Maintenance Care', score: maintenanceScore },
    { subject: 'الالتزام بمواعيد الفحص', subjectEn: 'Inspection Schedule', score: inspectionScore },
    { subject: 'نظافة ووقود الآلية', subjectEn: 'Vehicle Custody', score: Math.round((avgFuelReturnPct + cleanlinessComplianceRate) / 2) },
    { subject: 'الرصد الوقائي المبكر', subjectEn: 'Early Defect Log', score: earlyReportedRate }
  ];

  return {
    driver,
    overallScore,
    tier,
    grade,
    rank: rankIndex,
    handoverScore,
    handoverMetrics: {
      totalHandovers,
      cleanHandovers,
      handoversWithDamage,
      avgFuelReturnPct,
      cleanlinessComplianceRate,
      onTimeHandoverRate,
      history: handoverHistoryList
    },
    maintenanceScore,
    maintenanceMetrics: {
      totalReportedIssues,
      earlyReportedRate,
      criticalBreakdownsCount,
      negligenceIncidentsCount,
      careEfficiencyRate,
      recentIssues: recentIssuesList
    },
    inspectionScore,
    inspectionMetrics: {
      scheduledCount,
      completedOnTimeCount,
      missedOrLateCount,
      adherenceRate,
      safetyPassRate,
      inspections: inspectionsList
    },
    radarData,
    strengths,
    strengthsEn,
    weaknesses,
    weaknessesEn,
    aiActionRecommendations,
    aiActionRecommendationsEn
  };
}

export default function DriverScorecard({
  drivers,
  vehicles,
  user,
  onSelectDriverForEdit,
  onViewDriverDetails
}: DriverScorecardProps) {
  const { language, dir, t } = useLanguage();
  const isAr = language === 'ar';

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'overall' | 'handover' | 'maintenance' | 'inspection'>('overall');
  const [selectedScorecard, setSelectedScorecard] = useState<DriverScorecardData | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'handover' | 'maintenance' | 'inspection' | 'ai_plan'>('overview');

  // Technical Diagnostics & Error Boundary state for PDF Exports
  const [exportError, setExportError] = useState<{
    title: string;
    technicalMessage: string;
    phase: string;
    originalErrorName: string;
    stack: string;
    language: string;
    driverId: string;
    driverName: string;
    timestamp: string;
  } | null>(null);
  const [showFullStack, setShowFullStack] = useState(false);
  const [copiedError, setCopiedError] = useState(false);

  // Calculate scorecards for all drivers and sort them
  const scoredDrivers: DriverScorecardData[] = useMemo(() => {
    const calculated = drivers.map((driver, index) => calculateDriverScorecard(driver, vehicles, index + 1));
    
    // Sort based on chosen criteria
    calculated.sort((a, b) => {
      if (sortBy === 'handover') return b.handoverScore - a.handoverScore;
      if (sortBy === 'maintenance') return b.maintenanceScore - a.maintenanceScore;
      if (sortBy === 'inspection') return b.inspectionScore - a.inspectionScore;
      return b.overallScore - a.overallScore;
    });

    // Update ranks
    return calculated.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }, [drivers, vehicles, sortBy]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set(drivers.map(d => d.department).filter(Boolean));
    return Array.from(set);
  }, [drivers]);

  // Filtered drivers list
  const filteredScorecards = useMemo(() => {
    return scoredDrivers.filter(card => {
      const matchesSearch = 
        card.driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.driver.identityNumber.includes(searchTerm) ||
        (card.driver.phone && card.driver.phone.includes(searchTerm));
      
      const matchesTier = tierFilter === 'all' || card.tier === tierFilter;
      const matchesDept = deptFilter === 'all' || card.driver.department === deptFilter;

      return matchesSearch && matchesTier && matchesDept;
    });
  }, [scoredDrivers, searchTerm, tierFilter, deptFilter]);

  // KPI calculations
  const fleetAverageScore = useMemo(() => {
    if (scoredDrivers.length === 0) return 0;
    const sum = scoredDrivers.reduce((acc, c) => acc + c.overallScore, 0);
    return Math.round((sum / scoredDrivers.length) * 10) / 10;
  }, [scoredDrivers]);

  const topDriver = scoredDrivers[0];
  const eliteDriversCount = scoredDrivers.filter(c => c.tier === 'elite').length;
  const criticalDriversCount = scoredDrivers.filter(c => c.tier === 'critical').length;

  const avgHandoverRate = useMemo(() => {
    if (scoredDrivers.length === 0) return 0;
    return Math.round(scoredDrivers.reduce((acc, c) => acc + c.handoverScore, 0) / scoredDrivers.length);
  }, [scoredDrivers]);

  const avgInspectionAdherence = useMemo(() => {
    if (scoredDrivers.length === 0) return 0;
    return Math.round(scoredDrivers.reduce((acc, c) => acc + c.inspectionMetrics.adherenceRate, 0) / scoredDrivers.length);
  }, [scoredDrivers]);

  // Export Driver Scorecard PDF (Language-Aware & Zero Mojibake with Full Technical Error Diagnostics)
  const handleExportScorecardPDF = async (card: DriverScorecardData, safeMode = false) => {
    try {
      setIsExportingPDF(true);
      setExportError(null);
      await exportDriverScorecardPDF(card, language === 'en' ? 'en' : 'ar', { safeMode });

      // Immediate visual confirmation of successful export
      const downloadMsg = isAr
        ? 'تم تنزيل كشف بطاقة أداء وتقييم السائق بنجاح!'
        : 'Official driver scorecard PDF generated and downloaded successfully!';
      const notifyDiv = document.createElement('div');
      notifyDiv.className = "fixed bottom-5 right-5 z-[100] bg-emerald-600 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-2 border border-emerald-500 text-xs font-black shadow-emerald-500/20";
      notifyDiv.style.direction = dir;
      notifyDiv.innerHTML = `<span>✔ ${downloadMsg}</span>`;
      document.body.appendChild(notifyDiv);
      setTimeout(() => {
        if (document.body.contains(notifyDiv)) notifyDiv.remove();
      }, 4000);
    } catch (error: any) {
      console.error('Error generating driver scorecard PDF:', error);
      const techMessage = error?.message || (typeof error === 'string' ? error : 'Unknown runtime exception during PDF generation');
      const phase = (error as any)?.phase || 'SYSTEM_RENDER';
      const origName = error?.name || 'ScorecardPDFError';
      const stack = error?.stack || '';

      // Detailed Error Catch Block displaying hidden technical error directly to the user
      setExportError({
        title: isAr ? 'فشل تصدير وتحميل بطاقة أداء السائق' : 'Driver Scorecard Export Failed',
        technicalMessage: techMessage,
        phase,
        originalErrorName: origName,
        stack,
        language,
        driverId: card.driver.id,
        driverName: card.driver.name,
        timestamp: new Date().toLocaleTimeString()
      });

      // Display immediate alert banner with technical error
      const notifyDiv = document.createElement('div');
      notifyDiv.className = "fixed bottom-5 right-5 z-[100] bg-rose-600 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex flex-col gap-1 border border-rose-400 text-xs font-black max-w-md shadow-rose-900/50";
      notifyDiv.style.direction = dir;
      const cleanTech = techMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      notifyDiv.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-1.5 text-xs">✖ ${isAr ? 'تعذر تصدير ملف بطاقة الأداء' : 'Driver scorecard export failed'}</span>
          <span class="text-[9px] bg-rose-800 px-2 py-0.5 rounded font-mono">${phase}</span>
        </div>
        <div class="text-[10px] font-mono text-rose-100 bg-rose-950/70 p-1.5 rounded-lg break-all select-all border border-rose-800/80 mt-1">
          ${cleanTech}
        </div>
      `;
      document.body.appendChild(notifyDiv);
      setTimeout(() => {
        if (document.body.contains(notifyDiv)) notifyDiv.remove();
      }, 6000);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Helper for tier styling
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'elite':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Sparkles size={10} className="text-purple-500" />
            <span>{isAr ? '💎 نخبوي (A+)' : '💎 Elite (A+)'}</span>
          </span>
        );
      case 'pro':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={10} className="text-emerald-500" />
            <span>{isAr ? '🟢 أداء عالي (A)' : '🟢 Pro Performer (A)'}</span>
          </span>
        );
      case 'standard':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock size={10} className="text-amber-500" />
            <span>{isAr ? '🟡 قياسي (B)' : '🟡 Standard (B)'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
            <AlertTriangle size={10} className="text-rose-500" />
            <span>{isAr ? '🔴 يحتاج تدريب (C/D)' : '🔴 Needs Training (C/D)'}</span>
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-purple-600 dark:text-purple-400';
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 68) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-purple-600';
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 68) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getDepartmentLabel = (dept?: string) => {
    if (!dept) return isAr ? 'قسم الآليات' : 'Fleet Department';
    if (!isAr) {
      switch (dept) {
        case 'قسم الآليات': return 'Machinery Dept';
        case 'قسم الآليات العامة': return 'General Machinery Dept';
        case 'قسم الاستثمار': return 'Investment Dept';
        case 'قسم الاستثمار والتشغيل': return 'Investment & Operations';
        case 'قسم الشؤون الهندسية':
        case 'شعبة المشروعات الهندسية': return 'Engineering Projects Division';
        case 'قسم الطوارئ':
        case 'شعبة الطوارئ والتدخل العاجل': return 'Emergency & Rapid Response';
        default: return dept;
      }
    }
    return dept;
  };

  const getLicenseTypeLabel = (type?: string) => {
    if (!type) return isAr ? 'خفيف' : 'Light (Class 1)';
    if (!isAr) {
      switch (type) {
        case 'خفيف': return 'Light (Class 1)';
        case 'ثقيل': return 'Heavy (Class 2)';
        case 'عمومي': return 'Passenger / Bus (Class 3)';
        case 'إنشائي': return 'Machinery & Const. (Class 4)';
        default: return type;
      }
    }
    return type;
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* KPI Stats Widgets Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 - Fleet Average Score */}
        <div className="p-5 rounded-2xl border shadow-xs bg-purple-50/40 dark:bg-purple-950/15 border-purple-200/80 dark:border-purple-900 hover:border-purple-300/80 flex items-center justify-between group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className={`space-y-1.5 ${isAr ? 'text-right' : 'text-left'}`}>
            <p className="text-[11px] font-black tracking-wide uppercase text-purple-800 dark:text-purple-300">
              {isAr ? 'متوسط كفاءة السائقين' : 'Fleet Average Score'}
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black leading-none tracking-tight font-sans text-purple-950 dark:text-purple-100">
                {fleetAverageScore} <span className="text-sm font-normal text-purple-500">/ 100</span>
              </h3>
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[9px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 font-sans shrink-0">
                <span>▲</span>
                <span>+2.4%</span>
              </div>
            </div>
            <span className="text-[9.5px] text-purple-600 dark:text-purple-400/80 block font-bold">
              {isAr ? 'المعيار التراكمي الموزون' : 'Weighted composite benchmark'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform shrink-0">
            <Award size={22} />
          </div>
        </div>

        {/* KPI 2 - Top Performer Driver */}
        <div className="p-5 rounded-2xl border shadow-xs bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-200/80 dark:border-emerald-900 hover:border-emerald-300/80 flex items-center justify-between group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className={`space-y-1.5 ${isAr ? 'text-right' : 'text-left'}`}>
            <p className="text-[11px] font-black tracking-wide uppercase text-emerald-800 dark:text-emerald-300">
              {isAr ? 'السائق المتصدر (المركز الأول)' : 'Top Ranked Driver'}
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black leading-snug tracking-tight text-emerald-950 dark:text-emerald-100 truncate max-w-[140px]">
                {topDriver?.driver.name || (isAr ? 'سالم عبد الرحمن' : 'Salem Abdulrahman')}
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-sans">
                {topDriver?.overallScore || 96} %
              </span>
            </div>
            <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400/80 block font-bold">
              {isAr ? 'درع التميز للشهر الحالي 🏆' : 'Current Month MVP 🏆'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform shrink-0">
            <Star size={22} />
          </div>
        </div>

        {/* KPI 3 - Handover Integrity Rate */}
        <div className="p-5 rounded-2xl border shadow-xs bg-indigo-50/40 dark:bg-indigo-950/15 border-indigo-200/80 dark:border-indigo-900 hover:border-indigo-300/80 flex items-center justify-between group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className={`space-y-1.5 ${isAr ? 'text-right' : 'text-left'}`}>
            <p className="text-[11px] font-black tracking-wide uppercase text-indigo-800 dark:text-indigo-300">
              {isAr ? 'سلامة التسليم والاستلام' : 'Handover Integrity'}
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black leading-none tracking-tight font-sans text-indigo-950 dark:text-indigo-100">
                {avgHandoverRate}%
              </h3>
            </div>
            <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400/80 block font-bold">
              {isAr ? 'معدل الحفاظ على نظافة ووقود الآليات' : 'Fleet condition custody index'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform shrink-0">
            <ClipboardCheck size={22} />
          </div>
        </div>

        {/* KPI 4 - Inspection Schedule Adherence */}
        <div className="p-5 rounded-2xl border shadow-xs bg-amber-50/40 dark:bg-amber-950/15 border-amber-200/80 dark:border-amber-900 hover:border-amber-300/80 flex items-center justify-between group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className={`space-y-1.5 ${isAr ? 'text-right' : 'text-left'}`}>
            <p className="text-[11px] font-black tracking-wide uppercase text-amber-800 dark:text-amber-300">
              {isAr ? 'الالتزام بمواعيد الفحص' : 'Inspection Adherence'}
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black leading-none tracking-tight font-sans text-amber-950 dark:text-amber-100">
                {avgInspectionAdherence}%
              </h3>
            </div>
            <span className="text-[9.5px] text-amber-600 dark:text-amber-400/80 block font-bold">
              {isAr ? 'الفحوصات المنجزة في موعدها المحدد' : 'On-time scheduled pre-trip checks'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform shrink-0">
            <CalendarCheck size={22} />
          </div>
        </div>
      </div>

      {/* Control Filters & Search Bar */}
      <div className="bg-white dark:bg-[#0f1422] rounded-[2rem] border border-slate-150/60 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className={`absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400`} size={15} />
            <input
              type="text"
              className={`w-full ${isAr ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 focus:border-purple-500 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-white transition-all placeholder-slate-400`}
              placeholder={isAr ? 'ابحث باسم السائق، رقم الهوية، رخصة القيادة أو رقم الهاتف...' : 'Search driver by name, ID, license, or phone...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tier Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-3 py-1">
              <Filter size={12} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-400">{isAr ? 'المستوى:' : 'Tier:'}</span>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-xs text-slate-700 dark:text-slate-300 py-1.5 cursor-pointer"
              >
                <option value="all">{isAr ? 'كل المستويات' : 'All Tiers'}</option>
                <option value="elite">{isAr ? '💎 نخبوي (A+)' : 'Elite (A+)'}</option>
                <option value="pro">{isAr ? '🟢 أداء عالي (A)' : 'Pro (A)'}</option>
                <option value="standard">{isAr ? '🟡 قياسي (B)' : 'Standard (B)'}</option>
                <option value="critical">{isAr ? '🔴 يحتاج تدريب (C/D)' : 'Critical (C/D)'}</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-3 py-1">
              <span className="text-[10px] font-black text-slate-400">{isAr ? 'القسم:' : 'Dept:'}</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-xs text-slate-700 dark:text-slate-300 py-1.5 cursor-pointer"
              >
                <option value="all">{isAr ? 'كل الأقسام' : 'All Departments'}</option>
                {departments.map(d => (
                  <option key={d} value={d}>{getDepartmentLabel(d)}</option>
                ))}
              </select>
            </div>

            {/* Sort Criteria */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-3 py-1">
              <SlidersHorizontal size={12} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-400">{isAr ? 'الترتيب:' : 'Sort:'}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none outline-none font-bold text-xs text-purple-600 dark:text-purple-400 py-1.5 cursor-pointer font-black"
              >
                <option value="overall">{isAr ? 'الكفاءة الكلية' : 'Overall Score'}</option>
                <option value="handover">{isAr ? 'سلامة التسليم والاستلام' : 'Handover Integrity'}</option>
                <option value="maintenance">{isAr ? 'العناية بالمركبة والأعطال' : 'Vehicle Maintenance'}</option>
                <option value="inspection">{isAr ? 'الالتزام بمواعيد الفحص' : 'Inspection Adherence'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Scorecards Grid */}
      {filteredScorecards.length === 0 ? (
        <div className="bg-white dark:bg-[#0f1422] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 mx-auto border border-slate-100 dark:border-slate-800">
            <Award size={26} className="text-slate-400" />
          </div>
          <h4 className="text-xs font-black text-slate-700 dark:text-slate-200">
            {isAr ? 'لم نعثر على أي بطاقات أداء تطابق محددات البحث' : 'No driver scorecards matching criteria'}
          </h4>
          <p className="text-[10px] text-slate-400 max-w-md mx-auto">
            {isAr ? 'يرجى تغيير خيارات التصفية أو البحث باسم سائق آخر.' : 'Try changing your filter options or search term.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredScorecards.map(card => {
            const linkedVehicle = vehicles.find(v => v.id === card.driver.assignedVehicleId);

            return (
              <motion.div
                key={card.driver.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedScorecard(card)}
                className="bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-150/70 dark:border-slate-800/80 p-5 shadow-xs hover:shadow-xl transition-all duration-300 hover:border-purple-500/40 relative overflow-hidden flex flex-col justify-between cursor-pointer group hover:-translate-y-1"
              >
                {/* Top Accent Line */}
                <div className={`absolute top-0 right-0 left-0 h-1.5 ${getScoreBg(card.overallScore)}`} />

                <div className="space-y-4">
                  {/* Top Row: Rank + Avatar + Name + Tier */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Badge */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                        card.rank === 1 
                          ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300' 
                          : card.rank === 2 
                          ? 'bg-slate-200 text-slate-800' 
                          : card.rank === 3 
                          ? 'bg-amber-700/20 text-amber-800 dark:text-amber-300' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        #{card.rank}
                      </div>

                      {/* Driver Avatar */}
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 dark:bg-[#151c2e] dark:border-slate-800 shrink-0 shadow-xs">
                        <img 
                          src={card.driver.avatar} 
                          alt={card.driver.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className={`${isAr ? 'text-right' : 'text-left'} min-w-0`}>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {card.driver.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold block truncate">
                          {getDepartmentLabel(card.driver.department)}
                        </span>
                      </div>
                    </div>

                    {/* Overall Score Circle */}
                    <div className="text-center shrink-0">
                      <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center border ${
                        card.overallScore >= 90
                          ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400'
                          : card.overallScore >= 80
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                          : card.overallScore >= 68
                          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                      }`}>
                        <span className="text-sm font-black font-sans leading-none">{card.overallScore}</span>
                        <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">{card.grade}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tier Badge Row */}
                  <div className="flex items-center justify-between">
                    <div>{getTierBadge(card.tier)}</div>
                    {linkedVehicle ? (
                      <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <Truck size={10} className="text-purple-600" />
                        <span>{linkedVehicle.name}</span>
                      </span>
                    ) : (
                      <span className="text-[8.5px] text-slate-400">{isAr ? 'شاغر (بدون آلية)' : 'Unassigned'}</span>
                    )}
                  </div>

                  {/* 3 Core Pillars Progress Bars */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {/* Pillar 1: Handover */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-bold">
                        <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <ClipboardCheck size={11} className="text-indigo-500" />
                          <span>{isAr ? 'تاريخ التسليم والاستلام' : 'Handover History'}</span>
                        </span>
                        <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                          {card.handoverScore}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                          style={{ width: `${card.handoverScore}%` }} 
                        />
                      </div>
                    </div>

                    {/* Pillar 2: Maintenance Issues */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-bold">
                        <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Wrench size={11} className="text-purple-500" />
                          <span>{isAr ? 'سجل بلاغات الأعطال' : 'Maintenance Care'}</span>
                        </span>
                        <span className="font-mono font-black text-purple-600 dark:text-purple-400">
                          {card.maintenanceScore}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                          style={{ width: `${card.maintenanceScore}%` }} 
                        />
                      </div>
                    </div>

                    {/* Pillar 3: Inspection Schedule Adherence */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-bold">
                        <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <CalendarCheck size={11} className="text-emerald-500" />
                          <span>{isAr ? 'الالتزام بجداول الفحص' : 'Inspection Adherence'}</span>
                        </span>
                        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                          {card.inspectionScore}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                          style={{ width: `${card.inspectionScore}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-4">
                  <span className="text-[9.5px] font-black text-purple-600 dark:text-purple-400 group-hover:underline flex items-center gap-1">
                    <span>{isAr ? 'عرض بطاقة الأداء الشاملة 🔍' : 'View Full Scorecard 🔍'}</span>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportScorecardPDF(card);
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[9px] font-black transition-all flex items-center gap-1 cursor-pointer"
                    title={isAr ? 'تصدير كشف الأداء PDF' : 'Export Scorecard PDF'}
                  >
                    <Download size={11} />
                    <span>PDF</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Deep-Dive Driver Scorecard Detail Modal */}
      <AnimatePresence>
        {selectedScorecard && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-start justify-center p-3 sm:p-4 overflow-y-auto" dir={dir}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#0f1422] rounded-3xl md:rounded-[2.5rem] border border-slate-150 dark:border-slate-800 p-5 sm:p-8 w-full max-w-5xl shadow-2xl relative overflow-hidden my-4 md:my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedScorecard(null)}
                className={`absolute top-5 ${dir === 'rtl' ? 'left-5' : 'right-5'} p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-full cursor-pointer transition-all z-10`}
              >
                <X size={16} />
              </button>

              {/* Modal Header */}
              <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-800 pb-5 mb-6 ${isAr ? 'text-right' : 'text-left'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner shrink-0">
                    <img 
                      src={selectedScorecard.driver.avatar} 
                      alt={selectedScorecard.driver.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {selectedScorecard.driver.name}
                      </h3>
                      {getTierBadge(selectedScorecard.tier)}
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-purple-500/10 text-purple-600 font-sans">
                        #{selectedScorecard.rank} {isAr ? 'في ترتيب الأسطول' : 'in Fleet Rank'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold mt-1">
                      {getDepartmentLabel(selectedScorecard.driver.department)} | {getLicenseTypeLabel(selectedScorecard.driver.licenseType)} ({selectedScorecard.driver.licenseNumber})
                    </p>
                  </div>
                </div>

                {/* Big Score Card */}
                <div className="flex items-center gap-3 self-start md:self-auto">
                  <div className={isAr ? 'text-right' : 'text-left'}>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      {isAr ? 'مؤشر الكفاءة الكلي' : 'Overall Score'}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-black font-sans ${getScoreColor(selectedScorecard.overallScore)}`}>
                        {selectedScorecard.overallScore}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">/ 100</span>
                    </div>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg ${getScoreBg(selectedScorecard.overallScore)}`}>
                    {selectedScorecard.grade}
                  </div>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800 mb-6">
                <button
                  onClick={() => setActiveModalTab('overview')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeModalTab === 'overview'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 size={13} />
                  <span>{isAr ? 'نظرة عامة ورادار الكفاءة' : 'Overview & Radar'}</span>
                </button>

                <button
                  onClick={() => setActiveModalTab('handover')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeModalTab === 'handover'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ClipboardCheck size={13} />
                  <span>{isAr ? 'تاريخ التسليم والاستلام (35%)' : 'Handover History (35%)'}</span>
                </button>

                <button
                  onClick={() => setActiveModalTab('maintenance')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeModalTab === 'maintenance'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Wrench size={13} />
                  <span>{isAr ? 'بلاغات الأعطال والصيانة (35%)' : 'Maintenance Reports (35%)'}</span>
                </button>

                <button
                  onClick={() => setActiveModalTab('inspection')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeModalTab === 'inspection'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <CalendarCheck size={13} />
                  <span>{isAr ? 'الالتزام بجداول الفحص (30%)' : 'Inspection Adherence (30%)'}</span>
                </button>

                <button
                  onClick={() => setActiveModalTab('ai_plan')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeModalTab === 'ai_plan'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>{isAr ? 'توصيات الذكاء الاصطناعي 🤖' : 'AI Action Plan 🤖'}</span>
                </button>
              </div>

              {/* Modal Content Based on Active Tab */}
              <div className="space-y-6">
                {/* 1. Overview Tab */}
                {activeModalTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 3 Pillars Summary */}
                    <div className={`lg:col-span-5 space-y-4 ${isAr ? 'text-right' : 'text-left'}`}>
                      {/* Pillar 1 Summary */}
                      <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                            <ClipboardCheck size={14} className="text-indigo-600" />
                            <span>{isAr ? 'سجل تسليم واستلام الآليات' : 'Vehicle Handover History'}</span>
                          </span>
                          <span className="text-sm font-black font-sans text-indigo-600">{selectedScorecard.handoverScore}%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {isAr 
                            ? `تم توثيق ${selectedScorecard.handoverMetrics.totalHandovers} عملية تسليم واستلام، منها ${selectedScorecard.handoverMetrics.cleanHandovers} عملية سليمة تماماً وبدون أضرار.` 
                            : `${selectedScorecard.handoverMetrics.totalHandovers} total handovers recorded with ${selectedScorecard.handoverMetrics.cleanHandovers} damage-free transitions.`}
                        </p>
                      </div>

                      {/* Pillar 2 Summary */}
                      <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                            <Wrench size={14} className="text-purple-600" />
                            <span>{isAr ? 'العناية بالمركبة وبلاغات الأعطال' : 'Vehicle Care & Defect Logs'}</span>
                          </span>
                          <span className="text-sm font-black font-sans text-purple-600">{selectedScorecard.maintenanceScore}%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {isAr 
                            ? `نسبة الرصد الوقائي المبكر للأعطال بلغت ${selectedScorecard.maintenanceMetrics.earlyReportedRate}% مع تسجيل ${selectedScorecard.maintenanceMetrics.criticalBreakdownsCount} أعطال جسيمة.` 
                            : `Early defect detection rate is ${selectedScorecard.maintenanceMetrics.earlyReportedRate}% with ${selectedScorecard.maintenanceMetrics.criticalBreakdownsCount} severe breakdowns.`}
                        </p>
                      </div>

                      {/* Pillar 3 Summary */}
                      <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                            <CalendarCheck size={14} className="text-emerald-600" />
                            <span>{isAr ? 'الالتزام بجداول الفحص الدوري' : 'Inspection Schedule Adherence'}</span>
                          </span>
                          <span className="text-sm font-black font-sans text-emerald-600">{selectedScorecard.inspectionScore}%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {isAr 
                            ? `أنجز السائق ${selectedScorecard.inspectionMetrics.completedOnTimeCount} فحصاً في الموعد المحدد من إجمالي ${selectedScorecard.inspectionMetrics.scheduledCount} فحصاً مجدولاً.` 
                            : `Completed ${selectedScorecard.inspectionMetrics.completedOnTimeCount} on-time inspections out of ${selectedScorecard.inspectionMetrics.scheduledCount} scheduled.`}
                        </p>
                      </div>
                    </div>

                    {/* Right Radar Visual Chart */}
                    <div className="lg:col-span-7 bg-slate-50 dark:bg-[#121829] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-3">
                      <span className={`text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block ${isAr ? 'text-right' : 'text-left'}`}>
                        {isAr ? 'رادار تقييم الكفاءة المتعدد المحاور 📊' : 'Multi-Dimensional Scorecard Radar 📊'}
                      </span>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={selectedScorecard.radarData.map(item => ({
                            subject: isAr ? item.subject : item.subjectEn,
                            score: item.score,
                            fullMark: 100
                          }))}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                            <Radar 
                              name={isAr ? 'تقييم السائق' : 'Driver Score'} 
                              dataKey="score" 
                              stroke="#9333ea" 
                              fill="#c084fc" 
                              fillOpacity={0.35} 
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Handover History Tab */}
                {activeModalTab === 'handover' && (
                  <div className={`space-y-4 ${isAr ? 'text-right' : 'text-left'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'إجمالي عمليات الاستلام/التسليم' : 'Total Handovers'}</span>
                        <span className="text-xl font-black font-sans text-slate-800 dark:text-white">{selectedScorecard.handoverMetrics.totalHandovers}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'عمليات سليمة بدون أضرار' : 'Clean / Damage-Free'}</span>
                        <span className="text-xl font-black font-sans text-emerald-600">{selectedScorecard.handoverMetrics.cleanHandovers}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'متوسط مستوى الوقود عند الإرجاع' : 'Avg Fuel at Return'}</span>
                        <span className="text-xl font-black font-sans text-indigo-600">{selectedScorecard.handoverMetrics.avgFuelReturnPct}%</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                        <ClipboardCheck size={14} className="text-indigo-600" />
                        <span>{isAr ? 'سجل آخر عمليات الاستلام والتسليم الموثقة بالمنظومة:' : 'Recent Handover Audit Trail:'}</span>
                      </h4>

                      <div className="space-y-2">
                        {selectedScorecard.handoverMetrics.history.map(item => (
                          <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-150 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-black ${
                                  item.type === 'incoming' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'
                                }`}>
                                  {item.type === 'incoming' ? (isAr ? 'إرجاع واستلام بالورشة' : 'Incoming Return') : (isAr ? 'خروج واستلام عهدة' : 'Outgoing Handover')}
                                </span>
                                <span className="text-xs font-black text-slate-900 dark:text-white">{item.vehicleName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">({item.vehiclePlate})</span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {isAr ? item.damageNotes : (item.damageNotesEn || item.damageNotes)}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 text-[10px] font-bold shrink-0">
                              <span className="flex items-center gap-1 text-indigo-600">
                                <Fuel size={12} />
                                <span>{item.fuelLevel}%</span>
                              </span>
                              <span className="text-slate-400 font-mono">{item.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Maintenance Tab */}
                {activeModalTab === 'maintenance' && (
                  <div className={`space-y-4 ${isAr ? 'text-right' : 'text-left'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'معدل الرصد الوقائي المبكر' : 'Early Defect Log Rate'}</span>
                        <span className="text-xl font-black font-sans text-purple-600">{selectedScorecard.maintenanceMetrics.earlyReportedRate}%</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'أعطال جسيمة / توقف طارئ' : 'Critical Breakdowns'}</span>
                        <span className="text-xl font-black font-sans text-slate-800 dark:text-white">{selectedScorecard.maintenanceMetrics.criticalBreakdownsCount}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'مؤشر كفاءة المحافظة على الآلية' : 'Vehicle Care Index'}</span>
                        <span className="text-xl font-black font-sans text-emerald-600">{selectedScorecard.maintenanceMetrics.careEfficiencyRate}%</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                        <Wrench size={14} className="text-purple-600" />
                        <span>{isAr ? 'بلاغات الأعطال والصيانة المرتبطة بالسائق:' : 'Driver-Reported Issues & Work Orders:'}</span>
                      </h4>

                      <div className="space-y-2">
                        {selectedScorecard.maintenanceMetrics.recentIssues.map(issue => (
                          <div key={issue.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-150 dark:border-slate-800 flex items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[8.5px] font-black bg-purple-500/10 text-purple-600">
                                  {isAr ? issue.category : (issue.categoryEn || issue.category)}
                                </span>
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  {isAr ? issue.description : (issue.descriptionEn || issue.description)}
                                </span>
                              </div>
                              <span className="text-[9.5px] text-slate-400">
                                {issue.vehicleName} - {isAr ? issue.status : (issue.statusEn || issue.status)}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">{issue.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Inspection Tab */}
                {activeModalTab === 'inspection' && (
                  <div className={`space-y-4 ${isAr ? 'text-right' : 'text-left'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'الفحوصات المجدولة' : 'Scheduled Checks'}</span>
                        <span className="text-xl font-black font-sans text-slate-800 dark:text-white">{selectedScorecard.inspectionMetrics.scheduledCount}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'أنجزت في الموعد المحدد' : 'Completed On Time'}</span>
                        <span className="text-xl font-black font-sans text-emerald-600">{selectedScorecard.inspectionMetrics.completedOnTimeCount}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'نسبة الالتزام بالجدول' : 'Adherence Rate'}</span>
                        <span className="text-xl font-black font-sans text-amber-600">{selectedScorecard.inspectionMetrics.adherenceRate}%</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                        <CalendarCheck size={14} className="text-emerald-600" />
                        <span>{isAr ? 'سجل الفحوصات الدورية وما قبل الرحلة:' : 'Scheduled Inspection History:'}</span>
                      </h4>

                      <div className="space-y-2">
                        {selectedScorecard.inspectionMetrics.inspections.map(insp => (
                          <div key={insp.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121829] border border-slate-150 dark:border-slate-800 flex items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-black ${
                                  insp.status === 'passed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                }`}>
                                  {insp.status === 'passed' ? (isAr ? 'مجتاز بنجاح' : 'Passed') : (isAr ? 'ملاحظة وتأخير' : 'Late / Warning')}
                                </span>
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  {insp.type === 'pre_trip' ? (isAr ? 'فحص ما قبل الرحلة' : 'Pre-trip check') : (isAr ? 'فحص دوري شامل' : 'Periodic check')}
                                </span>
                              </div>
                              <span className="text-[9.5px] text-slate-400">
                                {isAr ? `تاريخ الإنجاز: ${insp.completedDate}` : `Completed: ${insp.completedDate}`}
                              </span>
                            </div>
                            <span className="text-xs font-black font-sans text-purple-600">{insp.score}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. AI Action Plan Tab */}
                {activeModalTab === 'ai_plan' && (
                  <div className={`space-y-5 ${isAr ? 'text-right' : 'text-left'}`}>
                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-2.5">
                        <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span>{isAr ? 'نقاط القوة والتميز الميداني:' : 'Driver Core Strengths:'}</span>
                        </h4>
                        <ul className="space-y-1.5 text-[10px] text-slate-600 dark:text-slate-300">
                          {selectedScorecard.strengths.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-black">✔</span>
                              <span>{isAr ? s : (selectedScorecard.strengthsEn?.[idx] || s)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses / Improvement Areas */}
                      <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 space-y-2.5">
                        <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle size={14} className="text-amber-600" />
                          <span>{isAr ? 'مجالات التحسين والتوجيه:' : 'Areas for Improvement:'}</span>
                        </h4>
                        <ul className="space-y-1.5 text-[10px] text-slate-600 dark:text-slate-300">
                          {selectedScorecard.weaknesses.map((w, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-500 font-black">▲</span>
                              <span>{isAr ? w : (selectedScorecard.weaknessesEn?.[idx] || w)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="p-5 rounded-3xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 space-y-3">
                      <h4 className="text-xs font-black text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                        <Sparkles size={15} className="text-purple-600" />
                        <span>{isAr ? 'خطة التوجيه الذكية المقترحة من المنظومة:' : 'AI Automated Coaching & Action Steps:'}</span>
                      </h4>
                      <div className="space-y-2">
                        {selectedScorecard.aiActionRecommendations.map((rec, idx) => (
                          <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-200/50 dark:border-purple-900/40 flex items-start gap-2 text-[10.5px] font-bold text-slate-700 dark:text-slate-200">
                            <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{isAr ? rec : (selectedScorecard.aiActionRecommendationsEn?.[idx] || rec)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-6 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isExportingPDF}
                    onClick={() => handleExportScorecardPDF(selectedScorecard)}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-500/20 disabled:opacity-50"
                  >
                    <Download size={13} className={isExportingPDF ? 'animate-spin' : ''} />
                    <span>{isExportingPDF ? (isAr ? 'جاري إنشاء PDF...' : 'Compiling PDF...') : (isAr ? 'تصدير كشف بطاقة الأداء PDF 💾' : 'Export Official Scorecard PDF 💾')}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedScorecard(null)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-all cursor-pointer"
                >
                  {isAr ? 'إغلاق النافذة' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Technical Error Boundary & Catch Block Modal for Driver Scorecard Export */}
      {exportError && (
        <div 
          id="scorecard-export-error-modal"
          className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={() => setExportError(null)}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-white dark:bg-[#0c101d] border-2 border-rose-500/50 dark:border-rose-500/60 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-4"
            style={{ direction: dir }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-rose-100 dark:border-rose-950/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-600/30 animate-pulse">
                  <Bug size={24} />
                </div>
                <div>
                  <h3 className="text-base font-black text-rose-600 dark:text-rose-400">
                    {exportError.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {isAr
                      ? 'تفاصيل الخطأ البرمجي والتقني المباشر للمستخدم'
                      : 'Technical Runtime Exception Diagnostics'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExportError(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Technical Information Banner */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Terminal size={14} className="text-rose-500" />
                  <span>{isAr ? 'رسالة الخطأ التقني المباشرة (Technical Error Message):' : 'Raw Technical Error Message:'}</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-md">
                  Phase: {exportError.phase || 'UNKNOWN'}
                </span>
              </div>

              {/* Monospace Code Display */}
              <div className="bg-slate-900 text-rose-300 p-3.5 rounded-2xl font-mono text-xs border border-slate-800 break-all select-all leading-relaxed shadow-inner">
                <span className="text-rose-500 font-black">[{exportError.originalErrorName}]:</span> {exportError.technicalMessage}
              </div>
            </div>

            {/* System Execution Context */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400">{isAr ? 'وضع اللغة الحالي:' : 'Active Language:'} </span>
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 uppercase">{exportError.language}</span>
              </div>
              <div>
                <span className="text-slate-400">{isAr ? 'معرّف السائق:' : 'Driver Code:'} </span>
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">{exportError.driverId}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">{isAr ? 'اسم السائق المحدد:' : 'Driver Full Name:'} </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{exportError.driverName}</span>
              </div>
            </div>

            {/* Expandable Stack Trace */}
            {exportError.stack && (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setShowFullStack(!showFullStack)}
                  className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{showFullStack ? '▼' : '▶'}</span>
                  <span>{isAr ? 'عرض مسار الاستدعاء الكامل (Stack Trace)' : 'Show Full Stack Trace'}</span>
                </button>
                {showFullStack && (
                  <pre className="text-[10px] bg-slate-950 text-slate-300 p-3 rounded-xl font-mono overflow-x-auto max-h-36 border border-slate-800 leading-tight">
                    {exportError.stack}
                  </pre>
                )}
              </div>
            )}

            {/* Remediation & Action Recommendations */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 text-xs">
              <span className="font-black text-amber-700 dark:text-amber-400 block">
                {isAr ? '💡 الحلول المقترحة والتشخيص الذاتي:' : '💡 Recommended Troubleshooting Steps:'}
              </span>
              <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                <li>
                  {isAr 
                    ? 'في حال كان الخطأ متعلقاً برسم العناصر خارج الشاشة، تم تحديث نطاق الرسم تلقائياً ليكون مدمجاً.'
                    : 'If the error is related to element bounds, offscreen rendering boundaries have been normalized.'}
                </li>
                <li>
                  {isAr
                    ? 'في حال منع المتصفح التحميل التلقائي للملفات، يرجى السماح بتنزيل الملفات من إعدادات المتصفح أو الضغط على زر إعادة المحاولة.'
                    : 'If your browser blocked the automatic file download, enable downloads in site settings or use Retry.'}
                </li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const fullText = `[AURVEXIS SCORECARD PDF EXPORT ERROR REPORT]
Time: ${exportError.timestamp}
Language: ${exportError.language}
Driver: ${exportError.driverName} (ID: ${exportError.driverId})
Phase: ${exportError.phase}
Error Name: ${exportError.originalErrorName}
Technical Message: ${exportError.technicalMessage}

Stack Trace:
${exportError.stack}`;
                    navigator.clipboard.writeText(fullText);
                    setCopiedError(true);
                    setTimeout(() => setCopiedError(false), 2500);
                  }}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedError ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copiedError ? (isAr ? 'تم نسخ التقرير' : 'Copied!') : (isAr ? 'نسخ الخطأ الفني' : 'Copy Error Details')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const targetCard = scoredDrivers.find(d => d.driver.id === exportError.driverId);
                    if (targetCard) {
                      handleExportScorecardPDF(targetCard, true);
                    }
                  }}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-500/20"
                >
                  <RefreshCw size={13} />
                  <span>{isAr ? 'إعادة المحاولة بالوضع الآمن' : 'Retry in Safe Mode'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setExportError(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-black transition-all cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
