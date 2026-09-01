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
  SlidersHorizontal
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

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
      severity: 'low' | 'medium' | 'high' | 'critical';
      category: string;
      type: 'preventative_report' | 'normal_wear' | 'breakdown';
      status: string;
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
  weaknesses: string[];
  aiActionRecommendations: string[];
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
      severity: 'low' as const,
      category: 'فرامل ومكابح',
      type: 'preventative_report' as const,
      status: 'مكتمل ومعالج'
    },
    {
      id: `m-issue-2-${driverId}`,
      date: '2026-05-02',
      vehicleName: linkedVehicle?.name || 'مركبة الأسطول المخصصة',
      description: 'فحص وتغيير فلتر الهواء وزيت المحرك الدوري',
      severity: 'low' as const,
      category: 'صيانة دورية',
      type: 'normal_wear' as const,
      status: 'معتمد'
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
  const weaknesses: string[] = [];
  const aiActionRecommendations: string[] = [];

  if (handoverScore >= 85) {
    strengths.push('انضباط عالي في بروتوكول تسليم واستلام الآليات ونظافة الكابينة');
  } else {
    weaknesses.push('ضرورة الالتزام بإعادة الآلية بمستوى وقود كافٍ وعدم ترك ملاحظات نظافة');
  }

  if (maintenanceScore >= 85) {
    strengths.push('رصد استباقي للأعطال الطفيفة مما يحمي المحرك من الأعطال الجسيمة');
  } else {
    weaknesses.push('تأخر في الإبلاغ المبكر عن المؤشرات التحذيرية للمركبة');
  }

  if (inspectionScore >= 88) {
    strengths.push('التزام مثالي بجدول الفحص اليومي وقبل انطلاق الرحلات');
  } else {
    weaknesses.push('تسجيل تأخير في إتمام الفحص الدوري لمركبة الأسطول');
  }

  // AI recommendations
  if (tier === 'elite') {
    aiActionRecommendations.push('ترشيح السائق للحصول على مكافأة السلامة والتميز التشغيلي ربع السنوية.');
    aiActionRecommendations.push('تعيين السائق كمدرب ومشرف ميداني على السائقين الجدد في مسار التسليم والاستلام.');
  } else if (tier === 'pro') {
    aiActionRecommendations.push('مواصلة الالتزام الحالي مع التركيز على توثيق الفحص الرقمي قبل نصف ساعة من الموعد.');
    aiActionRecommendations.push('تشجيع السائق على الحفاظ على مستويات استهلاك الوقود المثالية.');
  } else if (tier === 'standard') {
    aiActionRecommendations.push('عقد جلسة توجيهية حول أهمية توثيق حالة المركبة فور استلامها لتجنب نسب الأعطال.');
    aiActionRecommendations.push('تفعيل التنبيهات المباشرة على تطبيق السائق لتذكيره بمواعيد الفحص الدوري.');
  } else {
    aiActionRecommendations.push('إلزام السائق بدورة تدريبية مكثفة في الفحص الوقائي وبروتوكولات التسليم.');
    aiActionRecommendations.push('مراقبة المركبة المخصصة ميدانياً عبر أجهزة التتبع للحد من القيادة القاسية.');
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
    weaknesses,
    aiActionRecommendations
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

  // Export Driver Scorecard PDF
  const handleExportScorecardPDF = async (card: DriverScorecardData) => {
    try {
      setIsExportingPDF(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Generate QR Code verification string
      const qrData = `AURVEXIS-SCORECARD:${card.driver.id}:${card.overallScore}:${new Date().toISOString()}`;
      const qrDataUrl = await QRCode.toDataURL(qrData, { width: 100, margin: 1 });

      // Header Colors
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 40, 'F');

      // Title & Branding
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('AURVEXIS FLEET INTELLIGENCE', 14, 18);
      doc.setFontSize(10);
      doc.setTextColor(192, 132, 252);
      doc.text('OFFICIAL DRIVER EFFICIENCY SCORECARD & AUDIT REPORT', 14, 25);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${new Date().toLocaleDateString()} | System Anchor: 2026-05-30`, 14, 32);

      // Add QR Code
      doc.addImage(qrDataUrl, 'PNG', 170, 6, 28, 28);

      // Driver Profile Summary Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 48, 182, 35, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 48, 182, 35, 3, 3, 'S');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.text(`Driver: ${card.driver.name}`, 20, 58);
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`ID: ${card.driver.identityNumber}  |  License: ${card.driver.licenseNumber} (${card.driver.licenseType})`, 20, 66);
      doc.text(`Department: ${card.driver.department || 'Operations'}  |  Phone: ${card.driver.phone}`, 20, 74);

      // Overall Score Badge
      doc.setFillColor(109, 40, 217);
      doc.roundedRect(145, 52, 45, 26, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('OVERALL SCORE', 152, 60);
      doc.setFontSize(16);
      doc.text(`${card.overallScore}/100`, 152, 70);
      doc.setFontSize(10);
      doc.text(`Grade: ${card.grade}`, 174, 70);

      // 3 Core Pillars Summary Table
      autoTable(doc, {
        startY: 90,
        head: [['Pillar Dimension', 'Assigned Weight', 'Performance Score', 'Evaluation Status']],
        body: [
          ['1. Vehicle Handover History', '35%', `${card.handoverScore} / 100`, card.handoverScore >= 85 ? 'Excellent (Clean Custody)' : 'Acceptable'],
          ['2. Reported Maintenance & Care', '35%', `${card.maintenanceScore} / 100`, card.maintenanceScore >= 85 ? 'Proactive Defect Care' : 'Needs Follow-up'],
          ['3. Inspection Schedule Adherence', '30%', `${card.inspectionScore} / 100`, card.inspectionScore >= 85 ? 'Strictly Compliant' : 'Occasional Delays']
        ],
        theme: 'striped',
        headStyles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3.5 }
      });

      // Detailed Metrics Table
      const finalY = (doc as any).lastAutoTable.finalY || 135;
      autoTable(doc, {
        startY: finalY + 8,
        head: [['Key Metric Indicator', 'Logged Metric Value', 'Operational Target', 'Compliance']],
        body: [
          ['Clean Handover Rate', `${Math.round((card.handoverMetrics.cleanHandovers / (card.handoverMetrics.totalHandovers || 1)) * 100)}%`, '>= 90%', card.handoverMetrics.handoversWithDamage === 0 ? 'Pass' : 'Warning'],
          ['Average Fuel Level at Return', `${card.handoverMetrics.avgFuelReturnPct}%`, '>= 70%', card.handoverMetrics.avgFuelReturnPct >= 70 ? 'Pass' : 'Attention'],
          ['On-Time Inspection Rate', `${card.inspectionMetrics.adherenceRate}%`, '>= 95%', card.inspectionMetrics.adherenceRate >= 95 ? 'Pass' : 'Delayed'],
          ['Early Defect Reporting Index', `${card.maintenanceMetrics.earlyReportedRate}%`, '>= 80%', 'Pass'],
          ['Critical Negligence Breakdowns', `${card.maintenanceMetrics.criticalBreakdownsCount}`, '0 Incidents', card.maintenanceMetrics.criticalBreakdownsCount === 0 ? 'Zero' : 'Flagged']
        ],
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], textColor: 255 },
        styles: { fontSize: 8.5, cellPadding: 3 }
      });

      // AI Recommendations Box
      const recY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFillColor(243, 232, 255);
      doc.roundedRect(14, recY, 182, 36, 3, 3, 'F');
      doc.setDrawColor(216, 180, 254);
      doc.roundedRect(14, recY, 182, 36, 3, 3, 'S');

      doc.setTextColor(109, 40, 217);
      doc.setFontSize(10);
      doc.text('FLEET AI OPERATIONAL RECOMMENDATIONS:', 20, recY + 8);

      doc.setTextColor(51, 65, 85);
      doc.setFontSize(8.5);
      card.aiActionRecommendations.slice(0, 2).forEach((rec, idx) => {
        doc.text(`* ${rec}`, 20, recY + 17 + (idx * 8));
      });

      // Signature Area
      const sigY = recY + 45;
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('Operational Fleet Director Signature: _______________________', 14, sigY);
      doc.text('Safety Officer Attestation: _______________________', 120, sigY);

      doc.save(`Driver_Scorecard_${card.driver.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating scorecard PDF:', error);
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

  return (
    <div className="space-y-6" dir={dir}>
      {/* KPI Stats Widgets Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 - Fleet Average Score */}
        <div className="p-5 rounded-2xl border shadow-xs bg-purple-50/40 dark:bg-purple-950/15 border-purple-200/80 dark:border-purple-900 hover:border-purple-300/80 flex items-center justify-between group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="space-y-1.5 text-right">
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
          <div className="space-y-1.5 text-right">
            <p className="text-[11px] font-black tracking-wide uppercase text-emerald-800 dark:text-emerald-300">
              {isAr ? 'السائق المتصدر (المركز الأول)' : 'Top Ranked Driver'}
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black leading-snug tracking-tight text-emerald-950 dark:text-emerald-100 truncate max-w-[140px]">
                {topDriver?.driver.name || 'سالم عبد الرحمن'}
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
          <div className="space-y-1.5 text-right">
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
          <div className="space-y-1.5 text-right">
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
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              className="w-full pr-10 pl-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 focus:border-purple-500 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-white transition-all placeholder-slate-400"
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
                  <option key={d} value={d}>{d}</option>
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

                      <div className="text-right min-w-0">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {card.driver.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold block truncate">
                          {card.driver.department || 'قسم الآليات'}
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
                className="absolute top-5 left-5 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-full cursor-pointer transition-all z-10"
              >
                <X size={16} />
              </button>

              {/* Modal Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-800 pb-5 mb-6 text-right">
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
                      {selectedScorecard.driver.department} | {selectedScorecard.driver.licenseType} ({selectedScorecard.driver.licenseNumber})
                    </p>
                  </div>
                </div>

                {/* Big Score Card */}
                <div className="flex items-center gap-3 self-start md:self-auto">
                  <div className="text-right">
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
                    <div className="lg:col-span-5 space-y-4 text-right">
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
                      <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block text-right">
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
                  <div className="space-y-4 text-right">
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
                                {item.damageNotes}
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
                  <div className="space-y-4 text-right">
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
                                  {issue.category}
                                </span>
                                <span className="text-xs font-black text-slate-900 dark:text-white">{issue.description}</span>
                              </div>
                              <span className="text-[9.5px] text-slate-400">{issue.vehicleName} - {issue.status}</span>
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
                  <div className="space-y-4 text-right">
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
                  <div className="space-y-5 text-right">
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
                              <span>{s}</span>
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
                              <span>{w}</span>
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
                            <span className="leading-relaxed">{rec}</span>
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
    </div>
  );
}
