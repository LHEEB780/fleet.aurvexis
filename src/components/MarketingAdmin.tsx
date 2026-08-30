import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Globe2, 
  Settings, 
  Users, 
  Sparkles, 
  Trash2, 
  Plus, 
  Edit3, 
  Check, 
  TrendingUp, 
  Handshake, 
  MessageSquare, 
  Save, 
  Info, 
  Calendar, 
  Truck, 
  Phone, 
  Mail, 
  HelpCircle,
  Building2, 
  Briefcase, 
  Award,
  ChevronRight,
  User,
  Star,
  Activity,
  Droplets,
  DollarSign,
  Eye,
  PenTool,
  Cloud,
  Database,
  CheckSquare,
  ArrowRightLeft,
  BookOpen,
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  ChevronDown,
  Search,
  FileText,
  Download,
  Clock,
  SlidersHorizontal,
  Filter,
  UserCheck,
  BarChart2,
  RefreshCw,
  RotateCcw,
  Menu,
  X,
  Video,
  Link2,
  Tv,
  Play,
  PlaySquare,
  Layers,
  ExternalLink,
  PlusCircle,
  QrCode,
  Boxes,
  FileSpreadsheet,
  Snowflake,
  HardHat,
  Car,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../services/LanguageContext';
import ContextualHelp from './ContextualHelp';
import officialLogoImg from '../assets/images/fleet_aurvexis_brand_logo_1787051487788.jpg';
import { FleetAurvexisVectorEmblem } from './FleetAurvexisLogo';
import VideoTutorialsModal, { 
  VIDEO_TUTORIALS_DATA, 
  VideoTutorial, 
  VEHICLE_TYPE_FILTERS, 
  MAINTENANCE_TYPE_FILTERS, 
  VehicleCategoryType, 
  MaintenanceCategoryType,
  formatEmbedUrl
} from './VideoTutorialsModal';
import { 
  db, 
  saveDocument, 
  deleteDocument, 
  testFirestoreConnection, 
  pushLocalDataToCloud, 
  pullCloudDataToLocal 
} from '../services/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { DEFAULT_SUCCESS_STORIES, SuccessStory } from './CustomerSuccessStories';

import heavyMachineryRepair from '../assets/images/heavy_machinery_repair_1783750018560.jpg';
import dieselMaintenance from '../assets/images/diesel_maintenance_1783750031121.jpg';
import hydraulicServicing from '../assets/images/hydraulic_servicing_1783750041949.jpg';
import constructionHeavyMachinery from '../assets/images/construction_heavy_machinery_1782935156246.jpg';
import mechanicTruckWorkshop from '../assets/images/mechanic_truck_workshop_1782935168167.jpg';

interface MarketingAdminProps {
  brandPrimaryColor: string;
  setBrandPrimaryColor: (color: string) => void;
  saasBrandName: string;
  setSaasBrandName: (name: string) => void;
  saasBrandDesc: string;
  setSaasBrandDesc: (desc: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

// Default static fallbacks to initialize storage
const DEFAULT_FEATURES = [
  {
    id: 'f-1',
    iconName: 'Truck',
    titleAr: 'إدارة أسطول النقل والسيارات',
    titleEn: 'Fleet Ledger Integrity',
    descAr: 'سجل متكامل لكل مركبة ومعدة، مع تحليلات الوقود وتواريخ الفحص الأسبوعي لمنع الأعطال المفاجئة.',
    descEn: 'Log technical properties, active drivers, and safety validation statuses cleanly across any layout.',
    badgeAr: 'أساسي',
    badgeEn: 'Core'
  },
  {
    id: 'f-2',
    iconName: 'Smartphone',
    titleAr: 'تلقي بلاغات السائقين والصوتيات',
    titleEn: 'Driver Feedback Channels',
    descAr: 'بوابة ويب متناسقة بالكامل للسائقين لإرسال بلاغات ميكانيكية فورية مع دعم رسائل الصوت والفحص بالباركود للسلامة.',
    descEn: 'Instant reporting desk that allows drivers to submit issues, including fast voice note capture.',
    badgeAr: 'تفاعلي',
    badgeEn: 'Interactive'
  },
  {
    id: 'f-3',
    iconName: 'Cpu',
    titleAr: 'الذكاء الاصطناعي لتشخيص الأعطال ذاتياً',
    titleEn: 'Interactive AI Diagnostics',
    descAr: 'محرك ميكانيكي ذكي يقوم بالتدقيق والفحص التلقائي لرموز الأخطاء ويقترح مسار الإصلاح المثالي والقطع اللازمة.',
    descEn: 'Instantly query diagnostic codes and parse engine troubleshooting scripts natively using model integrations.',
    badgeAr: 'حصري',
    badgeEn: 'AI Powered'
  },
  {
    id: 'f-4',
    iconName: 'Wrench',
    titleAr: 'إدارة الورش والمواعيد الدورية',
    titleEn: 'Workshops & Preventative Triggers',
    descAr: 'تنظيم مهام الفنيين وصيانة المعدات وفق جداول زمنية دقيقة لتقليل مدة تعطل الأسطول التشغيلية.',
    descEn: 'Schedule service plans, dispatch workorders, and optimize technician workbench allocations dynamically.',
    badgeAr: 'جديد',
    badgeEn: 'New Update'
  }
];

const DEFAULT_CLIENTS = [
  { 
    id: 'c-1', 
    name: 'مؤسسة الغد للشحن الذكي', 
    nameAr: 'مؤسسة الغد للشحن الذكي',
    nameEn: 'Al-Ghad Smart Transport Corp.',
    industryAr: 'سلاسل التوريد وشحن المستقبل', 
    industryEn: 'Supply Chain & Future Cargo', 
    rating: 5, 
    yearJoint: '2024', 
    activeVehicles: '1,200', 
    logoSeed: 'LG',
    bgLight: 'bg-sky-50/70 hover:bg-sky-50 hover:shadow-sky-50 border-sky-100 hover:border-sky-300 text-sky-900',
    bgDark: 'dark:bg-sky-950/20 dark:border-sky-900/30 dark:hover:border-sky-800',
    badgeBg: 'text-sky-700 bg-sky-100 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/30',
    avatarBg: 'bg-sky-600 text-white shadow-sky-100'
  },
  { 
    id: 'c-2', 
    name: 'فيوتشر تراك للخدمات البيئية', 
    nameAr: 'فيوتشر تراك للخدمات البيئية',
    nameEn: 'FutureTrack Eco Services',
    industryAr: 'خدمات النقل النظيف والهجين', 
    industryEn: 'Clean & Hybrid Mobility Hubs', 
    rating: 5, 
    yearJoint: '2023', 
    activeVehicles: '450', 
    logoSeed: 'FT',
    bgLight: 'bg-emerald-50/70 hover:bg-emerald-50 hover:shadow-emerald-50 border-emerald-100 hover:border-emerald-300 text-emerald-900',
    bgDark: 'dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:hover:border-emerald-800',
    badgeBg: 'text-emerald-700 bg-emerald-100 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/30',
    avatarBg: 'bg-emerald-600 text-white shadow-emerald-100'
  },
  { 
    id: 'c-3', 
    name: 'المسار المستدام للنقل اللوجستي', 
    nameAr: 'المسار المستدام للنقل اللوجستي',
    nameEn: 'Sustainable National Cargo',
    industryAr: 'شحن مستدام وموثق للصناعات', 
    industryEn: 'Certified Sustainable Logistics', 
    rating: 5, 
    yearJoint: '2024', 
    activeVehicles: '820', 
    logoSeed: 'SC',
    bgLight: 'bg-indigo-50/70 hover:bg-indigo-50 hover:shadow-indigo-50 border-indigo-100 hover:border-indigo-300 text-indigo-900',
    bgDark: 'dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:hover:border-indigo-800',
    badgeBg: 'text-indigo-700 bg-indigo-100 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900/30',
    avatarBg: 'bg-indigo-600 text-white shadow-indigo-100'
  },
  { 
    id: 'c-4', 
    name: 'أوربت ترانزيت للنقل الطاقي', 
    nameAr: 'أوربت ترانزيت للنقل الطاقي',
    nameEn: 'TransOrbit Hybrid Transit',
    industryAr: 'شحن الطاقة المسال والوقائيات', 
    industryEn: 'Energy Cargo & Odometer Sync', 
    rating: 4.9, 
    yearJoint: '2025', 
    activeVehicles: '310', 
    logoSeed: 'OT',
    bgLight: 'bg-amber-50/70 hover:bg-amber-50 hover:shadow-amber-50 border-amber-100 hover:border-amber-300 text-amber-900',
    bgDark: 'dark:bg-amber-950/20 dark:border-amber-900/30 dark:hover:border-amber-800',
    badgeBg: 'text-amber-700 bg-amber-100 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/30',
    avatarBg: 'bg-amber-600 text-white shadow-amber-100'
  },
  { 
    id: 'c-5', 
    name: 'ريدان للتكامل اللوجستي', 
    nameAr: 'ريدان للتكامل اللوجستي',
    nameEn: 'Raydan Eco-Transit Systems',
    industryAr: 'شبكات النقل الكهربائي الموثوق', 
    industryEn: 'Battery-Powered Net-Zero Transit', 
    rating: 5, 
    yearJoint: '2025', 
    activeVehicles: '150', 
    logoSeed: 'RE',
    bgLight: 'bg-purple-50/70 hover:bg-purple-50 hover:shadow-purple-50 border-purple-100 hover:border-purple-300 text-purple-900',
    bgDark: 'dark:bg-purple-950/20 dark:border-purple-900/30 dark:hover:border-purple-800',
    badgeBg: 'text-purple-700 bg-purple-100 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900/30',
    avatarBg: 'bg-purple-600 text-white shadow-purple-100'
  }
];

const DEFAULT_REVIEWS = [
  {
    id: 'r-1',
    authorName: 'المهندس عبدالرحمن العتيبي',
    roleAr: 'مدير العمليات اللوجستية',
    roleEn: 'VP of Fleet Logistics',
    company: 'المسار المستدام للنقل اللوجستي',
    contentAr: 'ساعدتنا بوابة صيانة المعدات في دمج الفنيين مع تقارير السائقين الصوتية بشكل فوري. مستوى التحكم في استهلاك قطع الغيار فاق توقعاتنا بكثير!',
    contentEn: 'This platform transformed our maintenance response. Integrating driver voice reports directly with the mechanics desk has cut down repair cycle-times extensively.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces'
  },
  {
    id: 'r-2',
    authorName: 'المهندس صالح الخالدي',
    roleAr: 'رئيس وحدة صيانة المعدات الثقيلة',
    roleEn: 'Head of Industrial Equipment Maintenance',
    company: 'فيوتشر تراك للخدمات البيئية',
    contentAr: 'الذكاء الاصطناعي لفحص كود الأعطال يثير الإعجاب. نوفر الآن آلاف الريالات يومياً عبر استباق الأعطال وتصليح الحشوات قبل تضرر رأس المحرك.',
    contentEn: 'The AI diagnostics scanner is highly impressive. We prevent massive cylinder head damage by proactive component swaps triggered by sensor thresholds.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces'
  },
  {
    id: 'r-3',
    authorName: 'د. فيصل السديري',
    roleAr: 'مشرف الخدمات البلدية والمعدات',
    roleEn: 'Municipal Services Supervisor',
    company: 'أوربت ترانزيت للنقل الطاقي',
    contentAr: 'نظام إدارة الإطارات ومراقبة مستويات الضغط يعطينا رؤية أمان حقيقية وموثوقة على شبكتنا الميدانية. نوصي به بشدة لأي قطاع بلدي أو نقلي.',
    contentEn: 'The tire integrity desk and tire inventory audit tools give us reliable safety views on active vehicles. Highly recommended for municipal environments.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces'
  }
];

export const DEFAULT_GALLERY_IMAGES = [
  {
    id: 'img-1',
    url: heavyMachineryRepair,
    titleAr: 'صيانة محرك حفار هيدروليكي',
    titleEn: 'Excavator Hydraulic Engine Repair',
    descAr: 'فحص ميكانيكي دقيق وتفكيك المحرك الهيدروليكي لحفار ثقيل في الورشة الرئيسية.',
    descEn: 'Detailed mechanical inspection and teardown of a heavy hydraulic excavator engine in the workshop.',
    isSelected: true,
    category: 'heavy'
  },
  {
    id: 'img-2',
    url: dieselMaintenance,
    titleAr: 'ورشة صيانة الشاحنات الثقيلة والمعدات',
    titleEn: 'Heavy Duty Fleet & Truck Workshop',
    descAr: 'تجهيز وصيانة دورية لشاحنات نقل ومعدات لوجستية عملاقة لضمان الجاهزية التامة.',
    descEn: 'Standard servicing and preventative maintenance of heavy-duty trucks and diesel fleet assets.',
    isSelected: true,
    category: 'diesel'
  },
  {
    id: 'img-3',
    url: hydraulicServicing,
    titleAr: 'معايرة الأنظمة الهيدروليكية',
    titleEn: 'Hydraulic Pressure Calibration',
    descAr: 'صيانة شاملة لخراطيم وصمامات الضغط الهيدروليكي العالي للرافعات والمعدات الثقيلة.',
    descEn: 'Comprehensive servicing and calibration of high-pressure hydraulic lines and cylinders.',
    isSelected: true,
    category: 'workshop'
  },
  {
    id: 'img-4',
    url: constructionHeavyMachinery,
    titleAr: 'معدات الإنشاءات الثقيلة في الميدان',
    titleEn: 'Construction Fleet Support',
    descAr: 'إدارة وتتبع دورة الصيانة الميدانية للمعدات الثقيلة في مواقع البناء والتشييد.',
    descEn: 'Field maintenance scheduling and support for heavy construction assets at project sites.',
    isSelected: false,
    category: 'heavy'
  },
  {
    id: 'img-5',
    url: mechanicTruckWorkshop,
    titleAr: 'فحص ميكانيكي للشاحنات العملاقة',
    titleEn: 'Heavy Truck Diagnostic Scan',
    descAr: 'استخدام أجهزة الفحص المتطورة لقراءة أكواد أعطال المحركات والفرامل الهوائية للشاحنات.',
    descEn: 'Advanced diagnostics scan and technical assessment of braking systems on heavy haulers.',
    isSelected: false,
    category: 'workshop'
  }
];

const DEFAULT_FOOTER_COLUMNS = [
  {
    id: "col-1",
    titleAr: "الحلول",
    titleEn: "Solutions",
    items: [
      { id: "item-1-1", labelAr: "الحل لمالكي الأساطيل", labelEn: "Fleet Owners" },
      { id: "item-1-2", labelAr: "الحل للأساطيل الكبيرة", labelEn: "Enterprise Fleets" },
      { id: "item-1-3", labelAr: "قطاع الإنشاءات والبناء", labelEn: "Construction Sector" },
      { id: "item-1-4", labelAr: "مقدمو الخدمات التشغيلية", labelEn: "Service Providers" },
      { id: "item-1-5", labelAr: "البلديات والجهات الحكومية", labelEn: "Municipalities & Government" },
      { id: "item-1-6", labelAr: "النقل اللوجستي والشاحنات", labelEn: "Logistics & Trucking" },
      { id: "item-1-7", labelAr: "قطاع المدارس والتعليم", labelEn: "Schools & Education" }
    ]
  },
  {
    id: "col-2",
    titleAr: "المنتج والمميزات",
    titleEn: "Product Features",
    items: [
      { id: "item-2-1", labelAr: "جدولة الصيانة الوقائية PM", labelEn: "Preventative Maintenance PM" },
      { id: "item-2-2", labelAr: "الفحوصات الرقمية والباركود", labelEn: "Digital Inspection & Barcode" },
      { id: "item-2-3", labelAr: "أوامر العمل وعقود الصيانة", labelEn: "Work Orders & Contracts" },
      { id: "item-2-4", labelAr: "قائمة مستودع وجرد قطع الغيار", labelEn: "Spare Parts Ledger" },
      { id: "item-2-5", labelAr: "إدارة أصول الأسطول الفني", labelEn: "Fleet Asset Management" },
      { id: "item-2-6", labelAr: "أتمتة العمليات وحوكمة الامتثال", labelEn: "Ecosystem Compliance Audit" },
      { id: "item-2-7", labelAr: "إدارة المعدات الثقيلة والخفيفة", labelEn: "Heavy & Light Equipment" },
      { id: "item-2-8", labelAr: "أدوات الفحص والتحقق وطباعة QR", labelEn: "Daily Inspection & QR Label" }
    ]
  },
  {
    id: "col-3",
    titleAr: "أهم المصادر والأقسام",
    titleEn: "Key Resources",
    items: [
      { id: "item-3-1", labelAr: "قصص ودراسات نجاح العملاء", labelEn: "Validated Customer Case Stories" },
      { id: "item-3-2", labelAr: "مدونة FleetAurvexis للفنيين", labelEn: "FleetAurvexis Engineering Blog" },
      { id: "item-3-3", labelAr: "مكتبة الفيديوهات والشروحات", labelEn: "Platform Video Library" },
      { id: "item-3-4", labelAr: "أدلة وركائز الاستخدام التشغيلي", labelEn: "Operations Guides" },
      { id: "item-3-5", labelAr: "FleetAurvexis مقابل فليتيو", labelEn: "FleetAurvexis vs Fleetio Comparison" },
      { id: "item-3-6", labelAr: "أداة حاسبة العائد الاستثماري ROI", labelEn: "Interactive Earnings ROI Tool" },
      { id: "item-3-7", labelAr: "نماذج وقوالب سجلات الحركة", labelEn: "Worksheets & Daily Logs" }
    ]
  },
  {
    id: "col-4",
    titleAr: "الشركة والدعم",
    titleEn: "Company & Support",
    items: [
      { id: "item-4-1", labelAr: "نبذة عن شركة FleetAurvexis", labelEn: "About FleetAurvexis" },
      { id: "item-4-2", labelAr: "غرفة المركز الإعلامي والأخبار", labelEn: "Corporate Press Room" },
      { id: "item-4-3", labelAr: "الشراكات اللوجستية والتحالفات", labelEn: "Strategic Supply Partnerships" },
      { id: "item-4-4", labelAr: "الاتصال المباشر بالدعم الفني", labelEn: "24/7 Engineers Helpdesk" },
      { id: "item-4-5", labelAr: "بوابة فنيي الصيانة وشركاء الخدمة", labelEn: "Service Providers Portal" },
      { id: "item-4-6", labelAr: "تنسيق وحجز عرض تقديمي ديمو للمنصة", labelEn: "Request a Dynamic Demo Run" }
    ]
  }
];

export function MarketingAdmin({
  brandPrimaryColor,
  setBrandPrimaryColor,
  saasBrandName,
  setSaasBrandName,
  saasBrandDesc,
  setSaasBrandDesc,
  onNavigateToTab
}: MarketingAdminProps) {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  // Sub-navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<'leads' | 'identity' | 'features' | 'clients' | 'testimonials' | 'footer' | 'launch-planner' | 'robots' | 'gallery' | 'tutorials'>('leads');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchMenuQuery, setSearchMenuQuery] = useState('');

  const menuItems = [
    { id: 'leads', label: 'المشتركون والطلبات المتلقاة', subLabel: 'متابعة الـ Leads وتحديث حالة الحسابات والمبيعات', icon: <Users size={15} /> },
    { id: 'tutorials', label: 'مكتبة الفيديوهات والشروحات التدريبية', subLabel: 'إدارة وإضافة الشروحات المعتمدة وروابط الفيديو لكافة المشتركين', icon: <Video size={15} className="text-purple-600" /> },
    { id: 'launch-planner', label: 'دليل وخطة إطلاق الساس متكامل', subLabel: 'الخطة والتحقق ودليل التشغيل بالتفصيل', icon: <CheckSquare size={15} className="text-amber-500" /> },
    { id: 'robots', label: 'مكتبة الروبوتات والذكاء الاصطناعي', subLabel: 'أوتوماتونات ذكية ومعالجات خلفية لأتمتة النظام', icon: <Sparkles size={15} style={{ color: brandPrimaryColor }} className="animate-pulse" /> },
    { id: 'identity', label: 'إعدادات الهوية والألوان', subLabel: 'تعديل شعار، ودرجات السحابة وسير اللوفر', icon: <Settings size={15} /> },
    { id: 'features', label: 'إدارة مميزات النظام', subLabel: 'خصائص مقارنة المنصات الفنية وسعر الباقة', icon: <Sparkles size={15} /> },
    { id: 'gallery', label: '📸 معرض صور صيانة المعدات', subLabel: 'التحكم بالصور واختيار المعروض في الموقع التسويقي', icon: <Eye size={15} className="text-brand-blue-500" /> },
    { id: 'clients', label: 'قائمة العملاء والشركات', subLabel: 'تنسيق شعارات الشركاء والتطبيقات المتصلة', icon: <Handshake size={15} /> },
    { id: 'testimonials', label: 'آراء بتقييمات المستخدمين', subLabel: 'مراجعات الورش وشهادات الموثوقية بالصفحة', icon: <MessageSquare size={15} /> },
    { id: 'footer', label: 'روابط وتفاصيل أسفل تذييل الموقع', subLabel: 'قوائم الروابط السريعة وحسابات التواصل', icon: <Globe2 size={15} /> }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!searchMenuQuery) return true;
    return item.label.toLowerCase().includes(searchMenuQuery.toLowerCase()) || 
           item.subLabel.toLowerCase().includes(searchMenuQuery.toLowerCase());
  });

  // Firebase Firestore Integration states
  const [useFirebase, setUseFirebase] = useState<boolean>(() => {
    return localStorage.getItem('saas_admin_use_firebase') === 'true';
  });
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);
  const [isSyncingWithCloud, setIsSyncingWithCloud] = useState<boolean>(false);
  const [cloudFeedbackLog, setCloudFeedbackLog] = useState<string>('');

  // PM Step-by-Step launch roadmap checklists state
  const [launchSteps, setLaunchSteps] = useState<any[]>(() => {
    const stored = localStorage.getItem('saas_launch_steps_v1');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      {
        id: "step-1",
        phase: "infrastructure",
        phaseAr: "أولاً: البنية التحتية والربط السحابي",
        titleAr: "تهيئة قاعدة بيانات Firebase Firestore وتأمين قواعد الحماية السحابية",
        titleEn: "Activate Firestore database & security rules",
        status: "completed",
        descAr: "إنشاء مستودعات آمنة ومشتركة لتسجيل المشتركين والمؤسسات تزامناً مع خادمنا السحابي.",
        descEn: "Initialize persistent cloud collections for client records and interactive SaaS tools."
      },
      {
        id: "step-2",
        phase: "white-label",
        phaseAr: "ثانياً: الهوية والـ White-Labeling",
        titleAr: "تخصيص الهوية التجارية وتصميم العرض التسويقي للشركات والمشتركين",
        titleEn: "Setup custom White-Label SaaS branding details",
        status: "completed",
        descAr: "ضبط اسم النظام، والشعار ونظام الألوان الموحد من لوحة الإدارة ليعكس هوية علامتك التجارية فوراً.",
        descEn: "Update white label parameters directly inside branding panel to build visual safety authority."
      },
      {
        id: "step-3",
        phase: "billing",
        phaseAr: "ثالثاً: بوابة الدفع والاشتراكات لمدراء الأساطيل",
        titleAr: "ربط واختبار بوابة دفع Stripe وحساب الباقات وتفعيل الـ Webhooks",
        titleEn: "Connect Stripe payment gateway & configure packages",
        status: "pending",
        descAr: "تكامل بوابات السداد وإعداد الفواتير وعضويات الباقات للسرعات والأساطيل بشكل مؤتمت بالكامل.",
        descEn: "Link Stripe, configure webhook actions, and test standard monthly and yearly recurring tiers."
      },
      {
        id: "step-4",
        phase: "security",
        phaseAr: "رابعاً: التحقق الأمني ونمذجة صلاحيات الأسطول",
        titleAr: "تطبيق تدقيق الأمان Fleet Guard وصلاحيات مستويات الإذن",
        titleEn: "Perform Fleet Guard security audits & role limits",
        status: "pending",
        descAr: "تحصين مستويات الصلاحيات للشركات الفرعية والسائقين ومدرائهم لضمان تشفير البيانات المشتركة ومنع التسريب وصناعة ثقة مطلقة.",
        descEn: "Validate user scopes (technicians, fleet managers, and drivers) during system stress testing."
      },
      {
        id: "step-5",
        phase: "lead-capture",
        phaseAr: "خامساً: تشغيل كشاف الريادة ومصائد العملاء",
        titleAr: "تفعيل نماذج الاستقطاب وحجز الديمو وتنسيق قنوات المبيعات",
        titleEn: "Activate public leads tracking & CRM pipelines",
        status: "pending",
        descAr: "توصيل النماذج العامة بصفحة الويب التسويقية (طلبات حجز العروض الحية، وبلاغات المبيعات) بقاعدة Firebase السحابية.",
        descEn: "Test live user registrations and confirm data pipelines feed into the SaaS Admin CRM desk instantly."
      },
      {
        id: "step-6",
        phase: "production",
        phaseAr: "سادساً: الإطلاق الفعلي على النطاق الخاص Custom Domain",
        titleAr: "ربط النطاق المخصص saas-fleet-app.com وبدء استقبال الاشتراكات المدفوعة",
        titleEn: "Go live with custom production domain & customer support desk",
        status: "pending",
        descAr: "ربط اسم الدومين المستقل، وإتاحة الدعم المباشر ومراقبة نشاط الشركات وعداد الإيرادات اليومية بثقة.",
        descEn: "Configure domain DNS settings, launch live chat, and welcome your premium enterprise subscribers."
      }
    ];
  });

  const toggleLaunchStep = (stepId: string) => {
    const updated = launchSteps.map(step => {
      if (step.id === stepId) {
        const nextStatus = step.status === 'completed' ? 'pending' : 'completed';
        return { ...step, status: nextStatus };
      }
      return step;
    });
    setLaunchSteps(updated);
    localStorage.setItem('saas_launch_steps_v1', JSON.stringify(updated));
    triggerSaveNotification();
  };

  // Visual Saving Indicator state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimerRef = useRef<any>(null);
  const resetTimerRef = useRef<any>(null);

  const triggerSaveNotification = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

    setSaveStatus('saving');
    
    saveTimerRef.current = setTimeout(() => {
      setSaveStatus('saved');
      resetTimerRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 1600);
    }, 600);
  };

  // Watch identity brand texts & colors to automatically trigger save indicator on text modifications
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      triggerSaveNotification();
      if (useFirebase && isFirestoreConnected) {
        saveBrandingToFirestore();
      }
    }
  }, [brandPrimaryColor, saasBrandName, saasBrandDesc]);

  // Sync branding specifically
  const saveBrandingToFirestore = async () => {
    try {
      await saveDocument('saas_settings', 'branding', {
        name: saasBrandName,
        description: saasBrandDesc,
        color: brandPrimaryColor,
        updatedAt: new Date().toISOString()
      });
    } catch(e) {
      console.error("Firestore sync error for brandsettings:", e);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  // Core collections retrieved from stateful storage
  const [features, setFeatures] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  // CRM Advanced Filters & Modals
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'new' | 'contacted' | 'won' | 'lost' | 'support' | 'hq'>('all');
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<any | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionSuccessInfo, setProvisionSuccessInfo] = useState<any | null>(null);
  
  // Manual Lead Form
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    fleetSize: 10,
    province: 'المنطقة الشرقية',
    country: 'المملكة العربية السعودية',
    notes: '',
    status: 'new' as 'new' | 'contacted' | 'won' | 'lost'
  });
  
  // Custom Communication Log
  const [newLogNote, setNewLogNote] = useState('');
  const [newLogType, setNewLogType] = useState<'call' | 'email' | 'meeting' | 'offer'>('call');
  const [footerColumns, setFooterColumns] = useState<any[]>([]);

  // SaaS Dynamic Simulator & Revenue Predictor States
  const [targetSubscribers, setTargetSubscribers] = useState<number>(12);
  const [avgFleetUnits, setAvgFleetUnits] = useState<number>(55);
  const [mrrPricePerTruck, setMrrPricePerTruck] = useState<number>(35);
  const [footerMeta, setFooterMeta] = useState<any>({
    copyrightAr: "",
    copyrightEn: "",
    playStoreUrl: "",
    appStoreUrl: "",
    privacyLabelAr: "",
    privacyLabelEn: "",
    termsLabelAr: "",
    termsLabelEn: "",
    socialX: "",
    socialLinkedin: "",
    socialInstagram: "",
    socialFacebook: "",
    socialYoutube: ""
  });

  const [selectedColId, setSelectedColId] = useState<string>("col-1");
  const [newColItemAr, setNewColItemAr] = useState<string>("");
  const [newColItemEn, setNewColItemEn] = useState<string>("");

  // Success stories management states
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [successStoryForm, setSuccessStoryForm] = useState<any>(null);
  const [footerSubTab, setFooterSubTab] = useState<'links' | 'stories'>('links');

  // Gallery Management States
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryImageForm, setGalleryImageForm] = useState<any>(null);

  // Video Tutorials CMS & Knowledge Academy Management States
  const [customTutorials, setCustomTutorials] = useState<VideoTutorial[]>(() => {
    try {
      const saved = localStorage.getItem('fms_custom_user_tutorials');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [customVideoUrls, setCustomVideoUrls] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('fms_custom_tutorial_video_urls');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [hiddenTutorialIds, setHiddenTutorialIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fms_hidden_tutorial_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [tutorialToDelete, setTutorialToDelete] = useState<VideoTutorial | null>(null);

  const [tutorialSearchQuery, setTutorialSearchQuery] = useState('');
  const [tutorialCategoryFilter, setTutorialCategoryFilter] = useState<string>('all');
  const [tutorialVehicleFilter, setTutorialVehicleFilter] = useState<VehicleCategoryType>('all');
  const [tutorialMaintenanceFilter, setTutorialMaintenanceFilter] = useState<MaintenanceCategoryType>('all');
  const [selectedTutorialForPreview, setSelectedTutorialForPreview] = useState<VideoTutorial | null>(null);
  const [showTenantPreviewModal, setShowTenantPreviewModal] = useState(false);
  const [showAddOrEditTutorialModal, setShowAddOrEditTutorialModal] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<VideoTutorial | null>(null);
  const [tutorialFormError, setTutorialFormError] = useState<string | null>(null);

  // Form state for creating/editing tutorial
  const [tutorialForm, setTutorialForm] = useState<{
    id?: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    category: 'fleet_setup' | 'inspection_qr' | 'work_orders' | 'inventory' | 'pm_schedules' | 'ai_analytics';
    categoryLabelAr: string;
    categoryLabelEn: string;
    duration: string;
    videoUrl: string;
    levelAr: 'مبتدئ' | 'متوسط' | 'متقدم' | 'للمدراء والتنفيذيين' | 'فني وميداني';
    levelEn: 'Beginner' | 'Intermediate' | 'Advanced' | 'Executive' | 'Field & Tech';
    badgeAr: string;
    badgeEn: string;
    gradient: string;
    applicableVehicles: VehicleCategoryType[];
    applicableMaintenance: MaintenanceCategoryType[];
    stepsTextAr: string;
    stepsTextEn: string;
    takeawaysTextAr: string;
    takeawaysTextEn: string;
  }>({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    category: 'fleet_setup',
    categoryLabelAr: 'تأسيس الأسطول والبيانات',
    categoryLabelEn: 'Fleet Setup & Assets',
    duration: '5:00',
    videoUrl: '',
    levelAr: 'مبتدئ',
    levelEn: 'Beginner',
    badgeAr: 'جديد',
    badgeEn: 'NEW',
    gradient: 'from-purple-600 via-indigo-600 to-blue-700',
    applicableVehicles: ['heavy_trucks', 'light_commercial'],
    applicableMaintenance: ['preventative_pm'],
    stepsTextAr: 'تسجيل الدخول للنظام بصلاحية المشرف\nفتح تبويب إدارة المركبات وتوثيق بيانات الهيكل\nحفظ وتصدير باركود الاستجابة السريعة QR',
    stepsTextEn: 'Login to system with administrative privileges\nOpen Fleet Assets table and register chassis\nSave and export digital QR inspection code',
    takeawaysTextAr: 'تمكين الربط الفوري بين السائقين والورشة\nخفض زمن الاستجابة للأعطال',
    takeawaysTextEn: 'Instant mechanic-to-driver workflow\nReduced mean-time-to-repair MTTR'
  });

  // Quick URL edit modal state
  const [quickUrlModalTutorial, setQuickUrlModalTutorial] = useState<VideoTutorial | null>(null);
  const [quickUrlInput, setQuickUrlInput] = useState('');

  // Combined video list containing defaults + custom (excluding hidden/deleted ones)
  const allPlatformTutorials = useMemo(() => {
    return [...VIDEO_TUTORIALS_DATA, ...customTutorials].filter(
      tut => !hiddenTutorialIds.includes(tut.id)
    );
  }, [customTutorials, hiddenTutorialIds]);

  // Open modal to add or edit
  const handleOpenTutorialEditor = (tut?: VideoTutorial) => {
    setTutorialFormError(null);
    if (tut) {
      setEditingTutorial(tut);
      setTutorialForm({
        id: tut.id,
        titleAr: tut.titleAr,
        titleEn: tut.titleEn,
        descriptionAr: tut.descriptionAr,
        descriptionEn: tut.descriptionEn,
        category: tut.category,
        categoryLabelAr: tut.categoryLabelAr,
        categoryLabelEn: tut.categoryLabelEn,
        duration: tut.duration,
        videoUrl: customVideoUrls[tut.id] || tut.videoUrl || '',
        levelAr: tut.levelAr,
        levelEn: tut.levelEn,
        badgeAr: tut.badgeAr || 'معتمد',
        badgeEn: tut.badgeEn || 'VERIFIED',
        gradient: tut.gradient || 'from-purple-600 via-indigo-600 to-blue-700',
        applicableVehicles: (tut as any).applicableVehicles || ['heavy_trucks', 'light_commercial'],
        applicableMaintenance: (tut as any).applicableMaintenance || ['preventative_pm'],
        stepsTextAr: (tut as any).steps ? (tut as any).steps.map((s: any) => s.titleAr || s).join('\n') : 'الخطوة الأولى\nالخطوة الثانية',
        stepsTextEn: (tut as any).steps ? (tut as any).steps.map((s: any) => s.titleEn || s).join('\n') : 'First Step\nSecond Step',
        takeawaysTextAr: (tut as any).keyTakeawaysAr ? (tut as any).keyTakeawaysAr.join('\n') : '',
        takeawaysTextEn: (tut as any).keyTakeawaysEn ? (tut as any).keyTakeawaysEn.join('\n') : ''
      });
    } else {
      setEditingTutorial(null);
      setTutorialForm({
        titleAr: '',
        titleEn: '',
        descriptionAr: '',
        descriptionEn: '',
        category: 'fleet_setup',
        categoryLabelAr: 'تأسيس الأسطول والبيانات',
        categoryLabelEn: 'Fleet Setup & Assets',
        duration: '5:00',
        videoUrl: '',
        levelAr: 'مبتدئ',
        levelEn: 'Beginner',
        badgeAr: 'جديد',
        badgeEn: 'NEW',
        gradient: 'from-purple-600 via-indigo-600 to-blue-700',
        applicableVehicles: ['heavy_trucks', 'light_commercial'],
        applicableMaintenance: ['preventative_pm'],
        stepsTextAr: 'تسجيل الدخول للنظام بصلاحية المشرف\nفتح تبويب إدارة المركبات وتوثيق بيانات الهيكل\nحفظ وتصدير باركود الاستجابة السريعة QR',
        stepsTextEn: 'Login to system with administrative privileges\nOpen Fleet Assets table and register chassis\nSave and export digital QR inspection code',
        takeawaysTextAr: 'تمكين الربط الفوري بين السائقين والورشة\nخفض زمن الاستجابة للأعطال',
        takeawaysTextEn: 'Instant mechanic-to-driver workflow\nReduced mean-time-to-repair MTTR'
      });
    }
    setShowAddOrEditTutorialModal(true);
  };

  // Save tutorial handler (Guaranteed robust execution)
  const handleSaveTutorial = () => {
    setTutorialFormError(null);

    // Auto-generate title fallback if left empty to avoid blocking saving
    let finalTitleAr = tutorialForm.titleAr.trim();
    if (!finalTitleAr) {
      finalTitleAr = `شرح فيديو ${tutorialForm.categoryLabelAr || 'الأسطول والعمليات'}`;
    }

    let finalTitleEn = tutorialForm.titleEn.trim();
    if (!finalTitleEn) {
      finalTitleEn = tutorialForm.categoryLabelEn ? `${tutorialForm.categoryLabelEn} - Video Guide` : finalTitleAr;
    }

    let finalDescAr = tutorialForm.descriptionAr.trim();
    if (!finalDescAr) {
      finalDescAr = `شرح تشغيلي وتدريبي معتمد من منصة ${saasBrandName} لتوضيح خطوات وإجراءات العمل.`;
    }
    let finalDescEn = tutorialForm.descriptionEn.trim() || finalDescAr;

    const rawVideoUrl = tutorialForm.videoUrl.trim();
    let cleanVideoUrl: string | undefined = undefined;
    if (rawVideoUrl) {
      if (/^https?:\/\//i.test(rawVideoUrl)) {
        cleanVideoUrl = rawVideoUrl;
      } else if (rawVideoUrl.includes('youtube.com') || rawVideoUrl.includes('youtu.be') || rawVideoUrl.includes('.mp4') || rawVideoUrl.includes('vimeo.com')) {
        cleanVideoUrl = `https://${rawVideoUrl}`;
      } else {
        cleanVideoUrl = rawVideoUrl;
      }
    }

    const steps = tutorialForm.stepsTextAr.split('\n').filter(s => s.trim().length > 0).map((stepText, idx) => ({
      stepNumber: idx + 1,
      number: idx + 1,
      time: `0${idx + 1}:00`,
      titleAr: stepText.trim(),
      titleEn: tutorialForm.stepsTextEn.split('\n')[idx] || stepText.trim(),
      detailAr: `إجراء تشغيلي تدريبي رقم ${idx + 1} معتمد من منصة ${saasBrandName}.`,
      detailEn: `Standard operating procedure step ${idx + 1} verified for ${saasBrandName}.`,
      descAr: `إجراء تشغيلي تدريبي رقم ${idx + 1} معتمد من منصة ${saasBrandName}.`,
      descEn: `Standard operating procedure step ${idx + 1} verified for ${saasBrandName}.`,
      actionTipAr: 'التأكد من توثيق كافة البيانات قبل الانتقال للخطوة التالية.',
      actionTipEn: 'Verify record accuracy before proceeding.'
    }));

    const keyTakeawaysAr = tutorialForm.takeawaysTextAr.split('\n').filter(t => t.trim().length > 0);
    const keyTakeawaysEn = tutorialForm.takeawaysTextEn.split('\n').filter(t => t.trim().length > 0);

    const newTutObj: VideoTutorial = {
      id: tutorialForm.id || `custom_tut_${Date.now()}`,
      titleAr: finalTitleAr,
      titleEn: finalTitleEn,
      descriptionAr: finalDescAr,
      descriptionEn: finalDescEn,
      category: tutorialForm.category,
      categoryLabelAr: tutorialForm.categoryLabelAr,
      categoryLabelEn: tutorialForm.categoryLabelEn,
      duration: tutorialForm.duration || '5:00',
      videoUrl: cleanVideoUrl,
      levelAr: tutorialForm.levelAr,
      levelEn: tutorialForm.levelEn,
      badgeAr: tutorialForm.badgeAr || 'جديد',
      badgeEn: tutorialForm.badgeEn || 'NEW',
      gradient: tutorialForm.gradient || 'from-purple-950 via-slate-900 to-indigo-950',
      accentColor: '#8b5cf6',
      iconName: 'Video',
      applicableVehicles: tutorialForm.applicableVehicles || ['heavy_trucks', 'light_commercial'],
      applicableMaintenanceTypes: tutorialForm.applicableMaintenance || ['preventative_pm', 'daily_inspection'],
      applicableMaintenance: tutorialForm.applicableMaintenance || ['preventative_pm', 'daily_inspection'],
      tagsAr: ['شروحات', 'أسطول', 'تشغيل'],
      tagsEn: ['Tutorials', 'Fleet', 'Operations'],
      primaryVehicleAr: 'كافة فئات الأسطول',
      primaryVehicleEn: 'All Fleet Classes',
      primaryMaintenanceAr: 'إجراءات تشغيلية معتمدة',
      primaryMaintenanceEn: 'Standard Operations',
      chapters: [
        { time: '00:00', seconds: 0, titleAr: 'مقدمة ونظرة عامة', titleEn: 'Overview & Objectives', descAr: 'مقدمة عن محاور الشرح وأهدافه.', descEn: 'Overview of lesson scope.' },
        { time: '02:00', seconds: 120, titleAr: 'التطبيق والخطوات العملية', titleEn: 'Hands-on Execution', descAr: 'خطوات التنفيذ والإجراء الميداني.', descEn: 'Practical workflow execution.' }
      ],
      steps: steps.length > 0 ? steps : [
        {
          stepNumber: 1,
          number: 1,
          time: '01:00',
          titleAr: 'تسجيل الدخول واختيار الوحدة',
          titleEn: 'Access Portal & Select Target Asset',
          detailAr: 'فتح الشاشة المخصصة واختيار المركبة أو السجل المطلوب للبدء.',
          detailEn: 'Open relevant dashboard module and locate target record.',
          descAr: 'فتح الشاشة المخصصة واختيار المركبة أو السجل المطلوب للبدء.',
          descEn: 'Open relevant dashboard module and locate target record.',
          actionTipAr: 'يمكن استخدام البحث السريع للوصول الفوري.',
          actionTipEn: 'Use quick search for fast lookup.'
        }
      ],
      keyTakeawaysAr: keyTakeawaysAr.length > 0 ? keyTakeawaysAr : [
        'رفع كفاءة التشغيل الميداني وخفض الأخطاء البشرية.',
        'الامتثال الكامل للمعايير والاشتراطات التشغيلية المعتمدة.'
      ],
      keyTakeawaysEn: keyTakeawaysEn.length > 0 ? keyTakeawaysEn : [
        'Boost operational efficiency and eliminate human errors.',
        'Ensure full compliance with verified fleet protocols.'
      ],
      faqsAr: [
        { q: 'من يملك صلاحية تنفيذ هذا الإجراء؟', a: 'المشرفون ومدراء الحركة والفنيون المعتمدون بحسب مصفوفة الصلاحيات.' }
      ],
      faqsEn: [
        { q: 'Who has permissions to execute this?', a: 'Authorized fleet managers, supervisors, and certified technicians.' }
      ]
    } as any;

    let updatedCustoms: VideoTutorial[];
    if (tutorialForm.id && customTutorials.some(c => c.id === tutorialForm.id)) {
      updatedCustoms = customTutorials.map(c => c.id === tutorialForm.id ? newTutObj : c);
    } else if (tutorialForm.id && VIDEO_TUTORIALS_DATA.some(v => v.id === tutorialForm.id)) {
      if (cleanVideoUrl) {
        const updatedUrls = { ...customVideoUrls, [tutorialForm.id]: cleanVideoUrl };
        setCustomVideoUrls(updatedUrls);
        localStorage.setItem('fms_custom_tutorial_video_urls', JSON.stringify(updatedUrls));
      }
      updatedCustoms = [newTutObj, ...customTutorials.filter(c => c.id !== tutorialForm.id)];
    } else {
      updatedCustoms = [newTutObj, ...customTutorials];
    }

    if (cleanVideoUrl) {
      const updatedUrls = { ...customVideoUrls, [newTutObj.id]: cleanVideoUrl };
      setCustomVideoUrls(updatedUrls);
      localStorage.setItem('fms_custom_tutorial_video_urls', JSON.stringify(updatedUrls));
    }

    setCustomTutorials(updatedCustoms);
    localStorage.setItem('fms_custom_user_tutorials', JSON.stringify(updatedCustoms));

    // Broadcast across windows & tabs
    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('fms_tutorials_updated', { detail: newTutObj }));
    } catch {}

    triggerSaveNotification();
    setShowAddOrEditTutorialModal(false);

    if (useFirebase && isFirestoreConnected) {
      saveDocument('saas_tutorials', newTutObj.id, newTutObj).catch(e => console.error("Firestore tutorial save err:", e));
    }
  };

  // Delete tutorial trigger (opens modal safely without window.confirm)
  const handleDeleteTutorial = (tut: VideoTutorial) => {
    setTutorialToDelete(tut);
  };

  // Execute actual tutorial deletion
  const executeDeleteTutorial = (id: string) => {
    const updatedCustoms = customTutorials.filter(c => c.id !== id);
    setCustomTutorials(updatedCustoms);
    try {
      localStorage.setItem('fms_custom_user_tutorials', JSON.stringify(updatedCustoms));
    } catch (e) {
      console.error('Failed to update custom tutorials:', e);
    }

    const updatedHidden = Array.from(new Set([...hiddenTutorialIds, id]));
    setHiddenTutorialIds(updatedHidden);
    try {
      localStorage.setItem('fms_hidden_tutorial_ids', JSON.stringify(updatedHidden));
    } catch (e) {
      console.error('Failed to update hidden tutorials:', e);
    }

    const updatedUrls = { ...customVideoUrls };
    delete updatedUrls[id];
    setCustomVideoUrls(updatedUrls);
    try {
      localStorage.setItem('fms_custom_tutorial_video_urls', JSON.stringify(updatedUrls));
    } catch (e) {
      console.error('Failed to update video urls:', e);
    }

    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('fms_tutorials_updated', { detail: { deletedId: id } }));
    } catch {}

    triggerSaveNotification();
    setTutorialToDelete(null);
    setShowAddOrEditTutorialModal(false);
  };

  // Restore all hidden default tutorials
  const handleRestoreAllTutorials = () => {
    setHiddenTutorialIds([]);
    try {
      localStorage.removeItem('fms_hidden_tutorial_ids');
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('fms_tutorials_updated'));
    } catch (e) {
      console.error(e);
    }
    triggerSaveNotification();
  };

  // Quick URL save handler
  const handleSaveQuickUrl = () => {
    if (!quickUrlModalTutorial) return;
    const tutId = quickUrlModalTutorial.id;
    let url = quickUrlInput.trim();
    if (url && !/^https?:\/\//i.test(url) && (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('.mp4') || url.includes('vimeo.com'))) {
      url = `https://${url}`;
    }

    const updatedUrls = { ...customVideoUrls };
    if (url) {
      updatedUrls[tutId] = url;
    } else {
      delete updatedUrls[tutId];
    }

    setCustomVideoUrls(updatedUrls);
    localStorage.setItem('fms_custom_tutorial_video_urls', JSON.stringify(updatedUrls));

    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('fms_tutorials_updated'));
    } catch {}

    triggerSaveNotification();
    setQuickUrlModalTutorial(null);
    setQuickUrlInput('');
  };

  // Filtered list for the Tutorials CMS Tab
  const filteredAdminTutorials = useMemo(() => {
    return allPlatformTutorials.filter(tut => {
      // Search query filter
      if (tutorialSearchQuery.trim()) {
        const q = tutorialSearchQuery.toLowerCase();
        const matchTitle = (tut.titleAr || '').toLowerCase().includes(q) || (tut.titleEn || '').toLowerCase().includes(q);
        const matchDesc = (tut.descriptionAr || '').toLowerCase().includes(q) || (tut.descriptionEn || '').toLowerCase().includes(q);
        const matchCat = (tut.categoryLabelAr || '').toLowerCase().includes(q) || (tut.categoryLabelEn || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }
      // Category filter
      if (tutorialCategoryFilter !== 'all' && tut.category !== tutorialCategoryFilter) {
        return false;
      }
      // Vehicle filter
      if (tutorialVehicleFilter !== 'all') {
        const vehs = (tut as any).applicableVehicles;
        if (vehs && Array.isArray(vehs) && !vehs.includes(tutorialVehicleFilter)) {
          return false;
        }
      }
      // Maintenance filter
      if (tutorialMaintenanceFilter !== 'all') {
        const maints = (tut as any).applicableMaintenance;
        if (maints && Array.isArray(maints) && !maints.includes(tutorialMaintenanceFilter)) {
          return false;
        }
      }
      return true;
    });
  }, [allPlatformTutorials, tutorialSearchQuery, tutorialCategoryFilter, tutorialVehicleFilter, tutorialMaintenanceFilter]);

  // AI Agents & Robots state and handlers
  interface AIRobot {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    description: string;
    descriptionEn: string;
    isActive: boolean;
    triggerEvent: string;
    triggerEventAr: string;
    prompt: string;
    lastRun: string;
    stats: {
      scansCount: number;
      actionsTaken: number;
      efficiencyRating: string;
    };
    logs: string[];
  }

  const [aiRobots, setAiRobots] = useState<AIRobot[]>(() => {
    const defaults: AIRobot[] = [
      {
        id: 'leads-auto',
        name: 'أوتوماتون معالجة الاشتراكات وحجز الخدمات',
        nameEn: 'Leads & Subscriptions Automaton',
        icon: 'users',
        description: 'يقوم بمراقبة طلبات الاشتراك الفورية، وتصنيف العملاء آلياً، وإرسال قوالب الترحيب وعروض الأسعار المناسبة، وتنبيه موظفي المبيعات للطلبات الساخنة.',
        descriptionEn: 'Monitors incoming subscriptions, automatically categorizes clients, dispatches welcome messages, and triggers immediate alerts for priority leads.',
        isActive: true,
        triggerEvent: 'On New Lead Registration',
        triggerEventAr: 'عند تسجيل مشترك أو طلب جديد',
        prompt: 'أنت الوكيل الذكي لإدارة العملاء المحتملين في FleetAurvexis. قم بمراجعة بيانات العميل الجديد وفحص حجم أسطوله وورشته، وإسناد العميل للمندوب الأنسب مع صياغة رسالة واتساب ترحيبية مخصصة للحل الذي تم اختياره.',
        lastRun: 'منذ دقيقة واحدة',
        stats: { scansCount: 142, actionsTaken: 118, efficiencyRating: '98.5%' },
        logs: [
          '[13:40:12] [نظام] بدء المعالج في خلفية السحابة بنجاح.',
          '[13:42:01] [فحص] تم اكتشاف طلب جديد باسم "المركز الذهبي لصيانة السيارات".',
          '[13:42:04] [أتمتة] تصنيف المشترك كـ "ورشة متوسطة" بناءً على البيانات المدخلة.',
          '[13:42:05] [تواصل] توليد رسالة عرض سعر "باقة ميكانيك بلس" وحفظ مسودة الترحيب.',
          '[13:42:06] [توجيه] إرسال تنبيه للمشرف أحمد لإجراء المكالمة التنسيقية الأولى.'
        ]
      },
      {
        id: 'sales-analyst',
        name: 'بوت تحليل المبيعات والذاتية المالية للشركة',
        nameEn: 'Autonomous Sales & Finance Analyst',
        icon: 'dollar',
        description: 'يحلل تدفقات المبيعات وسجل الباقات المفعلة، ويحسب معدل التحويل اللحظي وتوقعات الإيرادات المتكررة الفورية، ويقترح تعديلات الأسعار لزيادة الأرباح.',
        descriptionEn: 'Analyzes active plans, calculates instant conversion rates and MRR, and recommends target upgrades and discount tiers dynamically.',
        isActive: true,
        triggerEvent: 'Hourly Recurring Scan',
        triggerEventAr: 'كل ساعة بشكل دوري تلقائي',
        prompt: 'أنت الخبير المالي ومحلل ساس FleetAurvexis. قم بتحليل باقات الاشتراك ومقارنتها بسلوك العملاء، وتحديد أكثر الباقات مبيعاً وتوليد تقرير شهري استشرافي للمبيعات.',
        lastRun: 'منذ ٢٢ دقيقة',
        stats: { scansCount: 89, actionsTaken: 12, efficiencyRating: '94.2%' },
        logs: [
          '[12:00:00] [محلل] سحب بيانات المدفوعات والاشتراكات لآخر 30 يوماً.',
          '[12:00:03] [حساب] نسبة التحويل للباقة الذهبية بلغت 42%.',
          '[12:00:05] [ذكاء] التوصية: تقديم حافز اشتراك سنوي لزيادة متوسط قيمة العميل (LTV).',
          '[12:00:06] [أوتوماتون] توليد تقارير الأداء المالي اللحظي وإتاحتها لمديري النظام.'
        ]
      },
      {
        id: 'team-dispatcher',
        name: 'روبوت إسناد المهام وتوجيه طاقم العمل والمبيعات',
        nameEn: 'AI Task Dispatcher & Team Coach',
        icon: 'briefcase',
        description: 'يتتبع ضغط العمل لدى المهندسين وممثلي المبيعات، ويقوم بإسناد مهام التواصل والمتابعة تلقائياً لموازنة وتوزيع المهام بالتساوي ومنع التأخير.',
        descriptionEn: 'Tracks team workload, automatically distributes tasks, and triggers personalized prompts for field technicians to balance schedules.',
        isActive: false,
        triggerEvent: 'On Lead Status Change / Task Added',
        triggerEventAr: 'عند تغير حالة المشترك أو إضافة مهمة',
        prompt: 'أنت مدير المشروع المساعد في منصة FleetAurvexis. تتبع المهام المفتوحة وقم بموازنة التوزيع على الزملاء بناءً على أعداد المهام النشطة لكل ممثل مبيعات.',
        lastRun: 'منذ ٣ ساعات',
        stats: { scansCount: 56, actionsTaken: 41, efficiencyRating: '91.0%' },
        logs: [
          '[10:15:30] [توجيه] فحص مصفوفة أداء الزملاء وحجم أعباء العمل.',
          '[10:15:35] [تم] نقل مهمة متابعة العميل "أوتو سكان" إلى ممثل المبيعات شاكر لموازنة العبء.'
        ]
      },
      {
        id: 'support-responder',
        name: 'معالج أتمتة الدعم الفني والرد التفاعلي للعملاء',
        nameEn: 'Instant Support & Customer Engagement Bot',
        icon: 'message',
        description: 'يقرأ استفسارات ومشاكل المستخدمين المتلقاة على واجهة الساس، ويقوم بصياغة حلول فورية مقترحة بالاعتماد على قاعدة المعرفة والدليل الفني وتجهيزها للاستخدام.',
        descriptionEn: 'Reads tickets and user inquiries, crafts smart initial diagnostic replies referencing the SaaS knowledge base, and prepares replies.',
        isActive: true,
        triggerEvent: 'On Support Ticket Open',
        triggerEventAr: 'عند فتح تذكرة دعم أو تلقي استفسار',
        prompt: 'أنت مهندس الدعم الفني للعملاء المشتركين في FleetAurvexis. تعامل مع التذكرة بترحيب لبق مع تقديم الدليل التدريجي لحل الخلل البرمجي أو التشغيلي للورشة.',
        lastRun: 'منذ ١٠ دقائق',
        stats: { scansCount: 204, actionsTaken: 195, efficiencyRating: '97.8%' },
        logs: [
          '[13:20:01] [استقبال] تذكرة جديدة برقم #4409: "مواجهة بطء في مزامنة الفواتير".',
          '[13:20:04] [تحليل] فحص الـ Sw.js وإجراءات التحديث الحالية في المتصفح.',
          '[13:20:06] [أوتوماتون] صياغة رد تفصيلي بخطوات تفريغ الكود المباشر وتحميل التحديث المحدث.'
        ]
      },
      {
        id: 'system-integrity',
        name: 'فاحص ومحلل التماسك وصيانة منافذ النظام الذكي',
        nameEn: 'AI System Integrity & Port Maintenance Agent',
        icon: 'shield',
        description: 'يقوم بإجراء مسح فوري وفحص حركي شامل للتخزين، والـ API الميداني، ومنافذ تذاكر الدعم والاتصال بالإضافة لتفويض عمليات الصيانة الذكية الذاتية وتطهير الكاشز.',
        descriptionEn: 'Performs immediate health scans on cloud storage, field integration APIs, service queue ports, and dispatches automated self-healing integrity routines.',
        isActive: true,
        triggerEvent: 'On Maintenance Scan / Periodic Run',
        triggerEventAr: 'عند طلب صيانة فورية أو لفة دورية مجدولة',
        prompt: 'أنت مهندس الصيانة والمسؤول التقني الذكي لنظام FleetAurvexis. تعامل مع طلب الفحص والمسح بموثوقية فائقة؛ افحص اتصال وتماسك السحابة Firestore، والـ APIs الميدانية، ومنافذ البريد والاستقبال، وقم بإجراء تطهير ذكي فوري للملفات التالفة والذاكرة المؤقتة لضمان استجابة ١٠٠٪.',
        lastRun: 'منذ ثوانٍ',
        stats: { scansCount: 310, actionsTaken: 289, efficiencyRating: '99.9%' },
        logs: [
          `[${new Date().toLocaleTimeString()}] [صيانة] تم تشغيل الفحص والمسح الشامل لمنافذ الاتصال وحافظات الداتا بطلب الإداري.`,
          `[${new Date().toLocaleTimeString()}] [أمن] تماسك التخزين السحابي Firebase Firestore سليم ومشفر بالكامل بنسبة ١٠٠٪.`,
          `[${new Date().toLocaleTimeString()}] [أتمتة] صيانة وتطهير فوري لذاكرة التبادل المؤقتة ووحدات Sw.js.`,
          `[${new Date().toLocaleTimeString()}] [اتصال] فحص الـ API الميداني للمحافظ والمعدات: نشط ومتصل بالقاعدة المركزية.`
        ]
      }
    ];

    const saved = localStorage.getItem('saas_ai_robots');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const missing = defaults.filter(def => !parsed.some((p: any) => p.id === def.id));
          if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            localStorage.setItem('saas_ai_robots', JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      } catch (e) { }
    }
    localStorage.setItem('saas_ai_robots', JSON.stringify(defaults));
    return defaults;
  });

  const [selectedRobotId, setSelectedRobotId] = useState<string>('leads-auto');
  const [robotSimStatus, setRobotSimStatus] = useState<{
    status: 'idle' | 'scanning' | 'executing' | 'done';
    progress: number;
    message: string;
    robotId: string | null;
  }>({
    status: 'idle',
    progress: 0,
    message: '',
    robotId: null
  });

  const [isRemoteAuthAuthorized, setIsRemoteAuthAuthorized] = useState<boolean>(() => localStorage.getItem('remote_maintenance_auth') === 'true');

  const handleToggleRemoteAuth = () => {
    setIsRemoteAuthAuthorized(prev => {
      const next = !prev;
      localStorage.setItem('remote_maintenance_auth', String(next));
      return next;
    });
  };

  const [showAddRobotModal, setShowAddRobotModal] = useState<boolean>(false);
  const [newRobotForm, setNewRobotForm] = useState({
    name: '',
    nameEn: '',
    icon: 'users',
    description: '',
    descriptionEn: '',
    triggerEventAr: 'عند تفاعل فوري بالنظام',
    triggerEvent: 'On Demand Action Trigger',
    prompt: '',
    isActive: true
  });

  // Track state persistence
  useEffect(() => {
    localStorage.setItem('saas_ai_robots', JSON.stringify(aiRobots));
  }, [aiRobots]);

  const handleToggleRobotActive = (id: string) => {
    setAiRobots(prev => prev.map(bot => {
      if (bot.id === id) {
        const nextActive = !bot.isActive;
        return {
          ...bot,
          isActive: nextActive,
          logs: [
            `[${new Date().toLocaleTimeString()}] [تحديث] تم ${nextActive ? 'تفعيل' : 'إطفاء'} الروبوت تلقائياً ومزامنة المعالجات الخلفية.`,
            ...bot.logs
          ]
        };
      }
      return bot;
    }));
  };

  const handleUpdateRobotPrompt = (id: string, newPrompt: string) => {
    setAiRobots(prev => prev.map(bot => {
      if (bot.id === id) {
        return {
          ...bot,
          prompt: newPrompt,
          logs: [
            `[${new Date().toLocaleTimeString()}] [إعدادات] تعديل الدليل التوجيهي للذكاء الاصطناعي (Prompt) وحفظ خطوط التعليمات الجديدة.`,
            ...bot.logs
          ]
        };
      }
      return bot;
    }));
  };

  const handleClearRobotLogs = (id: string) => {
    setAiRobots(prev => prev.map(bot => {
      if (bot.id === id) {
        return {
          ...bot,
          logs: [`[${new Date().toLocaleTimeString()}] [تطهير] تم تفريغ سجل العمليات والتقارير بنجاح.`]
        };
      }
      return bot;
    }));
  };

  const handleSimulateRobotExecution = (id: string) => {
    if (robotSimStatus.status !== 'idle') return;

    const botObj = aiRobots.find(b => b.id === id);
    if (!botObj) return;

    // Save current active state before updating
    const wasInactive = !botObj.isActive;

    // 1. Immediately update local state to add starting logs and turn robot ACTIVE if it was inactive
    setAiRobots(prev => prev.map(bot => {
      if (bot.id === id) {
        const timestamp = new Date().toLocaleTimeString();
        const initialLogs = [
          `[${timestamp}] [فحص] تم إطلاق حلقة فحص يدوي شاملة... الاتصال بمركز معالجة داتا الساس الموحدة.`,
          ...bot.logs
        ];
        
        if (wasInactive) {
          initialLogs.unshift(`[${timestamp}] [تنشيط] تم تفعيل الروبوت وتشغيل خلاياه آلياً بطلب التشغيل الفيدرالي لإنهاء المهام.`);
        }

        return {
          ...bot,
          isActive: true,
          logs: initialLogs
        };
      }
      return bot;
    }));

    setRobotSimStatus({
      status: 'scanning',
      progress: 10,
      message: language === 'ar' ? 'الاتصال بوكيل النمذجة والاستدعاء المباشر...' : 'Connecting to background agent...',
      robotId: id
    });

    let currentProgress = 10;
    const interval = setInterval(() => {
      currentProgress += 15;
      if (currentProgress < 100) {
        let textAr = '';
        if (currentProgress < 40) {
          textAr = 'قراءة الإحصائيات وبنى جداول الداتا الحية...';
        } else if (currentProgress < 75) {
          textAr = 'مقارنة البيانات مع الفلترة وإطلاق الموجه...';
        } else {
          textAr = 'حفظ النتائج وصياغة الاستجابات والأتمتة النهائية...';
        }
        setRobotSimStatus({
          status: 'executing',
          progress: currentProgress,
          message: language === 'ar' ? textAr : 'Executing rules...',
          robotId: id
        });
      } else {
        clearInterval(interval);
        
        // Build simulated logs referencing actual live list constraints
        const latestLead = leads[0] || { name: 'المجمع السكني ورشة سريعة', company: 'ورشة الفحص الفني', province: 'الدمام', fleetSize: 12 };
        let logsToAppend: string[] = [];

        if (id === 'leads-auto') {
          logsToAppend = [
            `[${new Date().toLocaleTimeString()}] [فحص] قراءة سجل كشوف leads. تم مسح المشترك الحقيقي: "${latestLead.name || latestLead.company}" بمحافظة ${latestLead.province || 'الشرقية'}.`,
            `[${new Date().toLocaleTimeString()}] [أتمتة] صياغة مسودة البريد والواتساب الترحيبي المناسب لحجم الأسطول (${latestLead.fleetSize || 10} مركبات).`,
            `[${new Date().toLocaleTimeString()}] [تواصل] إشعار الوكيل والمندوب @أحمد بالاستهداف التلقائي الفوري لمتابعة التحويل بنجاح.`
          ];
        } else if (id === 'sales-analyst') {
          logsToAppend = [
            `[${new Date().toLocaleTimeString()}] [مالي] إجراء مسح دوري للتدفقات. إجمالي المشتركين النشطين بالكامل: ${leads.length} عميل برؤية ميكانيك 350.`,
            `[${new Date().toLocaleTimeString()}] [توقع] معدل الكفاءة المالي المتوقع للربع الحالي يرتفع بمقدار +14.5% لتميز الباقات الدورية الحادثة.`,
            `[${new Date().toLocaleTimeString()}] [ذكاء] التوصية: حافز تخفيض 8% لباقات السنوية لزيادة متوسط قيمة العميل ميكانيكياً.`
          ];
        } else if (id === 'team-dispatcher') {
          logsToAppend = [
            `[${new Date().toLocaleTimeString()}] [فحص] تحليل المهام وتراكم الأعباء على المهندسين والإداريين الفعالين في الإقليم الحالي.`,
            `[${new Date().toLocaleTimeString()}] [أتمتة] جدولة وتعيين 3 اتصالات تذكيرية جديدة لممثلي المبيعات شاكر وفيصل بدقة بالغة.`,
            `[${new Date().toLocaleTimeString()}] [استنتاج] توزيع الأعباء آلياً مما يوفر طاقة عمل بنسبة 28%.`
          ];
        } else if (id === 'support-responder') {
          logsToAppend = [
            `[${new Date().toLocaleTimeString()}] [استقبال] التقصي عن أي اضطرابات في خوادم الإرسال أو تحديث الـ Service Worker كاشز.`,
            `[${new Date().toLocaleTimeString()}] [تحليل] فحص نسخة sw.js المسرعة وعملية التحديث (Force Live Update).`,
            `[${new Date().toLocaleTimeString()}] [أتمتة] إنشاء مسودة رد تكت ذكي تقدم التوضيح التقني الكامل للاشتراكات بورشة الصيانة لحل المشاكل.`
          ];
        } else if (id === 'system-integrity') {
          logsToAppend = [
            `[${new Date().toLocaleTimeString()}] [تفتيش] بدء المسح الميداني الفوري لمنافذ الـ API والاتصال... متصل بنجاح 🟢`,
            `[${new Date().toLocaleTimeString()}] [تخزين] تماسك قواعد البيانات والتخزين السحابي (Firestore DB) مستقر؛ لا يوجد اختناق في سجلات المزامنة.`,
            `[${new Date().toLocaleTimeString()}] [صيانة] تفويض الصيانة الذكية الذاتية عن بعد: تم تطهير الكاشز والملفات المؤقتة وإعادة رصف نقاط استقبال تذاكر الخدمة.`,
            `[${new Date().toLocaleTimeString()}] [تأكيد] صيانة منافذ الاتصال والمحركات مكتملة بنسبة ١٠٠٪ بنشاط دوري تفصيلي تام.`
          ];
        } else {
          logsToAppend = [
            `[${new Date().toLocaleTimeString()}] [طلب] تشغيل الوكيل المخصص: "${botObj.name}" بنجاح فوري.`,
            `[${new Date().toLocaleTimeString()}] [تحليل] تطبيق موجهات الـ AI الخاصة بك: "${botObj.prompt.substring(0, 40)}...".`,
            `[${new Date().toLocaleTimeString()}] [تنفيذ] إنهاء التوجيه الخلفي وتأكيد اكتمال كفة المهام التكرارية بنجاح.`
          ];
        }

        // Apply state updates
        setAiRobots(prev => prev.map(bot => {
          if (bot.id === id) {
            return {
              ...bot,
              lastRun: 'الآن',
              stats: {
                scansCount: bot.stats.scansCount + 1,
                actionsTaken: bot.stats.actionsTaken + (Math.random() > 0.3 ? 1 : 2),
                efficiencyRating: `${(parseFloat(bot.stats.efficiencyRating) + (Math.random() * 0.2)).toFixed(1)}%`
              },
              logs: [...logsToAppend, ...bot.logs]
            };
          }
          return bot;
        }));

        setRobotSimStatus({
          status: 'done',
          progress: 100,
          message: language === 'ar' ? '✓ تم تشغيل ومعالجة مهام الأوتوماتون بنجاح واكتملت الحلقة!' : '✓ Agent operation cycled and completed successfully!',
          robotId: id
        });

        // Reset sim status back to idle after a pleasant duration
        setTimeout(() => {
          setRobotSimStatus({ status: 'idle', progress: 0, message: '', robotId: null });
        }, 3500);
      }
    }, 450);
  };

  const handleCreateNewRobot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRobotForm.name) return;

    const newBot: AIRobot = {
      id: `custom-bot-${Date.now()}`,
      name: newRobotForm.name,
      nameEn: newRobotForm.nameEn || newRobotForm.name,
      icon: newRobotForm.icon,
      description: newRobotForm.description || 'تم إنشاؤه وتخصيصه بالكامل بواسطة مدير النظام.',
      descriptionEn: newRobotForm.descriptionEn || 'Custom created system bot agent.',
      isActive: newRobotForm.isActive,
      triggerEvent: newRobotForm.triggerEvent,
      triggerEventAr: newRobotForm.triggerEventAr,
      prompt: newRobotForm.prompt || 'أنت وكيل مساعد لأتمتة المهام بقاعدة FleetAurvexis.',
      lastRun: 'لم يشتغل بعد',
      stats: {
        scansCount: 0,
        actionsTaken: 0,
        efficiencyRating: '100%'
      },
      logs: [`[${new Date().toLocaleTimeString()}] [تأسيس] تم تصميم وإدراج الوكيل الذكي الجديد في مستودع النظام بنجاح.`]
    };

    setAiRobots(prev => [newBot, ...prev]);
    setSelectedRobotId(newBot.id);
    setShowAddRobotModal(false);
    // Reset form
    setNewRobotForm({
      name: '',
      nameEn: '',
      icon: 'users',
      description: '',
      descriptionEn: '',
      triggerEventAr: 'عند تفاعل فوري بالنظام',
      triggerEvent: 'On Demand Action Trigger',
      prompt: '',
      isActive: true
    });
  };

  const handleDeleteRobot = (id: string) => {
    if (['leads-auto', 'sales-analyst', 'team-dispatcher', 'support-responder', 'system-integrity'].includes(id)) {
      alert(language === 'ar' ? 'عذراً، هذا الروبوت يعتبر معالجاً أساسياً في النظام ولا يمكن حذفه.' : 'Core system robots cannot be removed.');
      return;
    }
    if (confirm(language === 'ar' ? 'هل أنت متأكد من رغبتك بحذف هذا الوكيل الذكي نهائياً من مستودع الروبوتات؟' : 'Are you sure you want to delete this AI Robot?')) {
      const remaining = aiRobots.filter(b => b.id !== id);
      setAiRobots(remaining);
      if (selectedRobotId === id) {
        setSelectedRobotId('leads-auto');
      }
    }
  };

  // Test and initialize Firestore connection on mount/toggle
  useEffect(() => {
    async function testConn() {
      if (useFirebase) {
        setCloudFeedbackLog(language === 'ar' ? 'جاري فحص الاتصال وقراءة الجداول السحابية لـ Firebase Firestore...' : 'Checking connection & collections on Firebase Firestore...');
        const connected = await testFirestoreConnection();
        setIsFirestoreConnected(connected);
        if (connected) {
          setCloudFeedbackLog(language === 'ar' ? '✓ متصل نشط بخام Firestore السحابي للمشروع' : '✓ Connected to Cloud Firestore successfully!');
          await pullBrandedData();
        } else {
          setCloudFeedbackLog(language === 'ar' ? '⚠️ تعذر الاتصال بسحابة Firebase. يرجى تفعيل الخدمة أو التحقق من إعدادات الاتصال. تم استخدام الذاكرة المحلية كبديل.' : '⚠️ Cloud database connection failed. Falling back to local responsive storage.');
        }
      } else {
        setCloudFeedbackLog(language === 'ar' ? 'نظام العرض يعمل بالذاكرة المحلية للمتصفح (Offline-Ready Mode).' : 'SaaS Admin is running in local responsive web storage mode.');
      }
    }
    testConn();
  }, [useFirebase]);

  // Pull SaaS CRM Leads and Landing configurations from Firestore
  const pullBrandedData = async () => {
    if (!db) return;
    setIsSyncingWithCloud(true);
    setCloudFeedbackLog(language === 'ar' ? 'جاري سحب وتحديث سجلات المشتركين ومميزات الهوية التجارية من السيرفر السحابي...' : 'Pulling latest subscriber records and visual styles from SaaS Firestore...');
    try {
      // 1. Leads
      const leadsSnap = await getDocs(collection(db, 'saas_leads'));
      const listLeads: any[] = [];
      leadsSnap.forEach(docSnap => {
        listLeads.push(docSnap.data());
      });
      if (listLeads.length > 0) {
        setLeads(listLeads);
        localStorage.setItem('saas_crm_leads_v1', JSON.stringify(listLeads));
      }

      // 2. Settings (branding)
      const brandDoc = await getDoc(doc(db, 'saas_settings', 'branding'));
      if (brandDoc.exists()) {
        const b = brandDoc.data();
        if (b.name) {
          setSaasBrandName(b.name);
          localStorage.setItem('saas_brand_name', b.name);
        }
        if (b.description) {
          setSaasBrandDesc(b.description);
          localStorage.setItem('saas_brand_desc', b.description);
        }
        if (b.color) {
          setBrandPrimaryColor(b.color);
          localStorage.setItem('saas_brand_primary_color', b.color);
        }
      }
      
      // 3. Features
      const featuresSnap = await getDocs(collection(db, 'saas_features'));
      const listFeatures: any[] = [];
      featuresSnap.forEach(d => { listFeatures.push(d.data()); });
      if (listFeatures.length > 0) {
        setFeatures(listFeatures);
        localStorage.setItem('saas_marketing_features_v1', JSON.stringify(listFeatures));
      }

      // 4. Clients
      const clientsSnap = await getDocs(collection(db, 'saas_clients'));
      const listClients: any[] = [];
      clientsSnap.forEach(d => { listClients.push(d.data()); });
      if (listClients.length > 0) {
        setClients(listClients);
        localStorage.setItem('saas_marketing_clients_v2', JSON.stringify(listClients));
      }

      // 5. Testimonials/Reviews
      const reviewsSnap = await getDocs(collection(db, 'saas_reviews'));
      const listReviews: any[] = [];
      reviewsSnap.forEach(d => { listReviews.push(d.data()); });
      if (listReviews.length > 0) {
        setReviews(listReviews);
        localStorage.setItem('saas_marketing_reviews_v1', JSON.stringify(listReviews));
      }
      
      setCloudFeedbackLog(language === 'ar' ? '✓ تم تحديث وسحب كافة البيانات السحابية الحية بنجاح!' : '✓ All SaaS Cloud datasets successfully fetched and updated!');
    } catch (e) {
      console.warn("Error pulling Firestore collections, keeping local instead.", e);
      setCloudFeedbackLog(language === 'ar' ? '⚠️ فشل سحب البيانات السحابية (يرجى مراجعة الصلاحيات الأمنية Security Rules). تم تشغيل البيانات الاحتياطية.' : '⚠️ Firestore load failed. Standard local cache persisted.');
    } finally {
      setIsSyncingWithCloud(false);
    }
  };

  // Push local current states to Firestore collections
  const pushBrandedDataToCloud = async () => {
    if (!db) {
      alert(language === 'ar' ? "قاعدة البيانات غير مهيأة" : "Firestore database is not initialized.");
      return;
    }
    setIsSyncingWithCloud(true);
    setCloudFeedbackLog(language === 'ar' ? 'جاري تصدير السجلات المحلية ومزامنة الهياكل بقواعد السحابة...' : 'Pushing local records and aligning remote schemas...');
    try {
      let count = 0;
      // 1. Settings
      await saveBrandingToFirestore();
      count++;

      // 2. Leads
      for (const l of leads) {
        await saveDocument('saas_leads', l.id, l);
        count++;
      }

      // 3. Features
      for (const f of features) {
        await saveDocument('saas_features', f.id, f);
        count++;
      }

      // 4. Clients
      for (const c of clients) {
        await saveDocument('saas_clients', c.id, c);
        count++;
      }

      // 5. Reviews
      for (const r of reviews) {
        await saveDocument('saas_reviews', r.id, r);
        count++;
      }

      setCloudFeedbackLog(language === 'ar' ? `✓ اكتمل تصدير البيانات! تم تأمين عدد ${count} سجل سحابي بـ Firebase Firestore.` : `✓ Sync finished! Secured ${count} records on Firebase Firestore.`);
    } catch (e) {
      console.error("Sync backup failure:", e);
      setCloudFeedbackLog(language === 'ar' ? '✕ فشل سداد السجل السحابي. يرجى التحقق من أذونات قواعد الحماية Security Rules.' : '✕ Remote sync failed. Please review Firestore rules.');
    } finally {
      setIsSyncingWithCloud(false);
    }
  };

  // Load state from local storage on render as first responsive mount
  useEffect(() => {
    // 1. Features
    const storedFeatures = localStorage.getItem('saas_marketing_features_v1');
    if (storedFeatures) {
      try { setFeatures(JSON.parse(storedFeatures)); } catch(e) {}
    } else {
      setFeatures(DEFAULT_FEATURES);
      localStorage.setItem('saas_marketing_features_v1', JSON.stringify(DEFAULT_FEATURES));
    }

    // 2. Clients
    const storedClients = localStorage.getItem('saas_marketing_clients_v2');
    if (storedClients) {
      try { setClients(JSON.parse(storedClients)); } catch(e) {}
    } else {
      setClients(DEFAULT_CLIENTS);
      localStorage.setItem('saas_marketing_clients_v2', JSON.stringify(DEFAULT_CLIENTS));
    }

    // 3. Reviews
    const storedReviews = localStorage.getItem('saas_marketing_reviews_v1');
    if (storedReviews) {
      try { setReviews(JSON.parse(storedReviews)); } catch(e) {}
    } else {
      setReviews(DEFAULT_REVIEWS);
      localStorage.setItem('saas_marketing_reviews_v1', JSON.stringify(DEFAULT_REVIEWS));
    }

    // 4. Leads
    const storedLeads = localStorage.getItem('saas_crm_leads_v1');
    if (storedLeads) {
      try { setLeads(JSON.parse(storedLeads)); } catch(e) {}
    } else {
      const initialLeads = [
        {
          id: 'lead-1',
          name: 'م. تركي القحطاني',
          company: 'شركة الناقل اللوجستية',
          email: 't.qahtani@alnaqel.com.sa',
          phone: '+966 50 123 4567',
          fleetSize: 45,
          country: 'المملكة العربية السعودية',
          province: 'منطقة الرياض',
          status: 'new',
          date: '2026-06-05',
          source: 'الموقع التسويقي',
          notes: 'مهتم بباقة الـ Pro. يطلب مكالمة استشارية فنية حول الذكاء الاصطناعي.'
        },
        {
          id: 'lead-2',
          name: 'الأستاذ بندر الدوسري',
          company: 'مجموعة نقليات الصحراء',
          email: 'b.dosari@sahara-trans.com',
          phone: '+966 54 987 6543',
          fleetSize: 120,
          country: 'المملكة العربية السعودية',
          province: 'المنطقة الشرقية',
          status: 'contacted',
          date: '2026-06-03',
          source: 'حاسبة العائد ROI',
          notes: 'تم الاتصال المبدئي به. يمتلك أسطول شاحنات مرسيدس أكتروس، منبهر بحاسبة الأرباح.'
        }
      ];
      setLeads(initialLeads);
      localStorage.setItem('saas_crm_leads_v1', JSON.stringify(initialLeads));
    }

    // Success Stories
    const storedSuccessStories = localStorage.getItem('saas_marketing_success_stories_v1');
    if (storedSuccessStories) {
      try { setSuccessStories(JSON.parse(storedSuccessStories)); } catch(e) {}
    } else {
      setSuccessStories(DEFAULT_SUCCESS_STORIES);
      localStorage.setItem('saas_marketing_success_stories_v1', JSON.stringify(DEFAULT_SUCCESS_STORIES));
    }

    // 5. Footer Columns
    const storedFooterCols = localStorage.getItem('saas_marketing_footer_columns_v2');
    if (storedFooterCols && storedFooterCols.includes("item-3-7")) {
      try { setFooterColumns(JSON.parse(storedFooterCols)); } catch(e) {}
    } else {
      setFooterColumns(DEFAULT_FOOTER_COLUMNS);
      localStorage.setItem('saas_marketing_footer_columns_v2', JSON.stringify(DEFAULT_FOOTER_COLUMNS));
    }

    // 6. Footer Meta
    const storedFooterMeta = localStorage.getItem('saas_marketing_footer_meta_v1');
    if (storedFooterMeta) {
      try { setFooterMeta(JSON.parse(storedFooterMeta)); } catch(e) {}
    } else {
      const defaultMeta = {
        copyrightAr: "حقوق النشر © ٢٠٢٦ FleetAurvexis لإدارة أساطيل النقل والورش الذكية. جميع الحقوق محفوظة.",
        copyrightEn: "Copyright © 2026 FleetAurvexis Intelligent Fleet & Workshop Management. All Rights Reserved.",
        playStoreUrl: "https://play.google.com/store",
        appStoreUrl: "https://apps.apple.com",
        privacyLabelAr: "سياسة الخصوصية والموثوقية وبنود الأمان",
        privacyLabelEn: "Privacy & Safe Operation Guidelines",
        termsLabelAr: "شروط الخدمة والاستخدام العادل للأسطول",
        termsLabelEn: "Terms of Fair SaaS Usage & Service Agreements",
        socialX: "https://x.com",
        socialLinkedin: "https://linkedin.com",
        socialInstagram: "https://instagram.com",
        socialFacebook: "https://facebook.com",
        socialYoutube: "https://youtube.com"
      };
      setFooterMeta(defaultMeta);
      localStorage.setItem('saas_marketing_footer_meta_v1', JSON.stringify(defaultMeta));
    }

    // 7. Gallery Images
    const storedGallery = localStorage.getItem('saas_marketing_gallery_v1');
    if (storedGallery) {
      try { setGalleryImages(JSON.parse(storedGallery)); } catch(e) {}
    } else {
      setGalleryImages(DEFAULT_GALLERY_IMAGES);
      localStorage.setItem('saas_marketing_gallery_v1', JSON.stringify(DEFAULT_GALLERY_IMAGES));
    }

    // Dynamic Live Listener for new tickets / inquiries submitted across tabs
    const handleDynamicSync = () => {
      const freshLeads = localStorage.getItem('saas_crm_leads_v1');
      if (freshLeads) {
        try { setLeads(JSON.parse(freshLeads)); } catch(e) {}
      }
    };

    window.addEventListener('marketing-data-updated', handleDynamicSync);
    window.addEventListener('saas-tickets-updated', handleDynamicSync);
    window.addEventListener('storage', handleDynamicSync);

    return () => {
      window.removeEventListener('marketing-data-updated', handleDynamicSync);
      window.removeEventListener('saas-tickets-updated', handleDynamicSync);
      window.removeEventListener('storage', handleDynamicSync);
    };
  }, []);

  // Sync state functions
  const saveGalleryImages = async (items: any[]) => {
    setGalleryImages(items);
    localStorage.setItem('saas_marketing_gallery_v1', JSON.stringify(items));
    triggerSaveNotification();
    window.dispatchEvent(new Event('marketing-data-updated'));
    if (useFirebase && isFirestoreConnected) {
      try {
        for (const img of items) {
          await saveDocument('saas_gallery', img.id, img);
        }
      } catch (e) {
        console.error("Firestore gallery sync error:", e);
      }
    }
  };

  const saveFeatures = async (items: any[]) => {
    setFeatures(items);
    localStorage.setItem('saas_marketing_features_v1', JSON.stringify(items));
    triggerSaveNotification();
    if (useFirebase && isFirestoreConnected) {
      try {
        for (const f of items) {
          await saveDocument('saas_features', f.id, f);
        }
      } catch (e) {
        console.error("Firestore features sync error:", e);
      }
    }
  };

  const saveClients = async (items: any[]) => {
    setClients(items);
    localStorage.setItem('saas_marketing_clients_v2', JSON.stringify(items));
    triggerSaveNotification();
    if (useFirebase && isFirestoreConnected) {
      try {
        for (const c of items) {
          await saveDocument('saas_clients', c.id, c);
        }
      } catch (e) {
        console.error("Firestore clients sync error:", e);
      }
    }
  };

  const saveReviews = async (items: any[]) => {
    setReviews(items);
    localStorage.setItem('saas_marketing_reviews_v1', JSON.stringify(items));
    triggerSaveNotification();
    if (useFirebase && isFirestoreConnected) {
      try {
        for (const r of items) {
          await saveDocument('saas_reviews', r.id, r);
        }
      } catch (e) {
        console.error("Firestore reviews sync error:", e);
      }
    }
  };

  const saveSuccessStories = async (items: SuccessStory[]) => {
    setSuccessStories(items);
    localStorage.setItem('saas_marketing_success_stories_v1', JSON.stringify(items));
    triggerSaveNotification();
    window.dispatchEvent(new Event('marketing-data-updated'));
    if (useFirebase && isFirestoreConnected) {
      try {
        for (const s of items) {
          await saveDocument('saas_success_stories', s.id, s);
        }
      } catch (e) {
        console.error("Firestore success stories sync error:", e);
      }
    }
  };

  const handleSuccessStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!successStoryForm) return;

    let updated: SuccessStory[];
    if (successStoryForm.id) {
      updated = successStories.map(s => s.id === successStoryForm.id ? successStoryForm : s);
    } else {
      const newStory: SuccessStory = {
        ...successStoryForm,
        id: 'story-' + Date.now()
      };
      updated = [newStory, ...successStories];
    }

    saveSuccessStories(updated);
    setSuccessStoryForm(null);
  };

  const handleDeleteSuccessStory = (id: string) => {
    const updated = successStories.filter(s => s.id !== id);
    saveSuccessStories(updated);
    if (useFirebase && isFirestoreConnected) {
      try {
        deleteDocument('saas_success_stories', id);
      } catch (e) {
        console.error("Firestore success story delete error:", e);
      }
    }
  };

  const startEditSuccessStory = (story: SuccessStory) => {
    setSuccessStoryForm({ ...story });
  };

  const handleToggleGalleryImageSelect = (id: string) => {
    const updated = galleryImages.map(img => img.id === id ? { ...img, isSelected: !img.isSelected } : img);
    saveGalleryImages(updated);
  };

  const handleDeleteGalleryImage = (id: string) => {
    const updated = galleryImages.filter(img => img.id !== id);
    saveGalleryImages(updated);
  };

  const handleGalleryImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryImageForm) return;

    let updated: any[];
    if (galleryImageForm.id) {
      updated = galleryImages.map(img => img.id === galleryImageForm.id ? galleryImageForm : img);
    } else {
      const newImg = {
        ...galleryImageForm,
        id: 'img-' + Date.now(),
        isSelected: true
      };
      updated = [newImg, ...galleryImages];
    }
    saveGalleryImages(updated);
    setGalleryImageForm(null);
  };

  const handleResetGalleryDefault = () => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من استعادة الصور الافتراضية للمعرض؟' : 'Are you sure you want to restore default gallery images?')) {
      saveGalleryImages(DEFAULT_GALLERY_IMAGES);
    }
  };

  const saveLeads = async (items: any[], updatedLead?: any) => {
    setLeads(items);
    localStorage.setItem('saas_crm_leads_v1', JSON.stringify(items));
    triggerSaveNotification();
    if (useFirebase && isFirestoreConnected) {
      try {
        if (updatedLead) {
          await saveDocument('saas_leads', updatedLead.id, updatedLead);
        } else {
          for (const l of items) {
            await saveDocument('saas_leads', l.id, l);
          }
        }
      } catch (e) {
        console.error("Firestore leads sync error:", e);
      }
    }
  };

  const handleToggleFirebaseMode = (enabled: boolean) => {
    setUseFirebase(enabled);
    localStorage.setItem('saas_admin_use_firebase', enabled ? 'true' : 'false');
    triggerSaveNotification();
  };

  // UI Modal/Form States for Features CRUD
  const [featureForm, setFeatureForm] = useState<{ id?: string, titleAr: string, titleEn: string, descAr: string, descEn: string, iconName: string, badgeAr: string, badgeEn: string } | null>(null);

  // UI Modal/Form States for Clients CRUD
  const [clientForm, setClientForm] = useState<{ id?: string, name: string, industryAr: string, industryEn: string, rating: number, yearJoint: string, activeVehicles: string, logoSeed: string } | null>(null);

  // UI Modal/Form States for Testimonials CRUD
  const [reviewForm, setReviewForm] = useState<{ id?: string, authorName: string, roleAr: string, roleEn: string, company: string, contentAr: string, contentEn: string, rating: number } | null>(null);

  // Status Colors representation
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold rounded-lg text-[10px] uppercase border border-indigo-100/40 flex items-center gap-1.5"><Sparkles size={11} /> جديدة</span>;
      case 'contacted':
        return <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-750 dark:text-amber-400 font-bold rounded-lg text-[10px] uppercase border border-amber-100/40 flex items-center gap-1.5"><Phone size={11} /> جاري التواصل</span>;
      case 'won':
        return <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold rounded-lg text-[10px] uppercase border border-emerald-100/40 flex items-center gap-1.5"><Check size={11} /> موافقة / مكتمل</span>;
      case 'lost':
        return <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold rounded-lg text-[10px] uppercase border border-rose-100/40 flex items-center gap-1.5">✕ مرفوض</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-[10px]">{status}</span>;
    }
  };

  // CRM Leads Management Handles
  const changeLeadStatus = (leadId: string, newStatus: string) => {
    const targetLead = leads.find(l => l.id === leadId);
    if (!targetLead) return;
    const updatedLead = { ...targetLead, status: newStatus };
    const updatedList = leads.map(l => l.id === leadId ? updatedLead : l);
    saveLeads(updatedList, updatedLead);
  };

  const updateLeadNotes = (leadId: string, notes: string) => {
    const targetLead = leads.find(l => l.id === leadId);
    if (!targetLead) return;
    const updatedLead = { ...targetLead, notes };
    const updatedList = leads.map(l => l.id === leadId ? updatedLead : l);
    saveLeads(updatedList, updatedLead);
  };

  const deleteLead = async (leadId: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا العميل نهائياً من سجلاتك وقاعدة البيانات متكاملة؟' : 'Are you sure you want to delete this lead?')) return;
    const updated = leads.filter(l => l.id !== leadId);
    setLeads(updated);
    localStorage.setItem('saas_crm_leads_v1', JSON.stringify(updated));
    triggerSaveNotification();
    if (useFirebase && isFirestoreConnected) {
      try {
        await deleteDocument('saas_leads', leadId);
      } catch (e) {
        console.error("Firestore lead deletion error:", e);
      }
    }
    if (selectedLeadForDetail?.id === leadId) {
      setSelectedLeadForDetail(null);
    }
  };

  // Export Leads dataset to CSV format for real Sales team workflows
  const exportLeadsToCsv = () => {
    let csvContent = "\uFEFF"; // Add UTF-8 BOM for Arabic characters compatibility in Excel
    csvContent += "ID,الاسم,الشركة,البريد الإلكتروني,الهاتف,حجم الأسطول,المنطقة,الحالة,ملاحظات المتابعة,تاريخ التسجيل\n";
    leads.forEach(l => {
      const escapedNotes = (l.notes || '').replace(/"/g, '""');
      const escapedName = (l.name || '').replace(/"/g, '""');
      const escapedCompany = (l.company || '').replace(/"/g, '""');
      csvContent += `"${l.id}","${escapedName}","${escapedCompany}","${l.email || ''}","${l.phone || ''}","${l.fleetSize || 0}","${l.province || l.country || ''}","${l.status}","${escapedNotes}","${l.date || ''}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SaaS_CRM_Leads_Onboarding_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add a communication log entry
  const addCommunicationLog = (leadId: string) => {
    if (!newLogNote.trim()) return;
    const targetLead = leads.find(l => l.id === leadId);
    if (!targetLead) return;
    
    const newLog = {
      id: 'log-' + Date.now(),
      date: new Date().toLocaleDateString('ar-SA') + ' ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      type: newLogType,
      note: newLogNote,
      agent: 'مدير الصيانة والمبيعات'
    };
    
    const existingLogs = Array.isArray(targetLead.communicationLogs) ? targetLead.communicationLogs : [];
    const updatedLead = {
      ...targetLead,
      communicationLogs: [newLog, ...existingLogs],
      lastActivityDate: new Date().toISOString()
    };
    
    const updatedList = leads.map(l => l.id === leadId ? updatedLead : l);
    saveLeads(updatedList, updatedLead);
    setSelectedLeadForDetail(updatedLead);
    setNewLogNote('');
  };

  // Simulate converting a lead into a real tenant/active system subscription
  const simulateOnboardingProspect = (lead: any, packageType: string, licenseMonths: number) => {
    setIsProvisioning(true);
    
    setTimeout(() => {
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + Number(licenseMonths));
      
      const provisionedInfo = {
        tenantName: lead.company,
        adminUser: lead.name,
        adminEmail: lead.email,
        packageSelected: packageType,
        databaseSchema: `tenant_db_sch_${lead?.id || 'lead'}`,
        apiToken: `pk_live_saas_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        subscriptionExpires: expirationDate.toLocaleDateString('ar-SA'),
        assignedSubdomain: `${(lead?.company || 'fleet').toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '').slice(0, 12) || 'tenant'}.fleetlock.com.sa`
      };
      
      const currentLogs = Array.isArray(lead.communicationLogs) ? lead.communicationLogs : [];
      const activationLog = {
        id: 'log-' + Date.now(),
        date: new Date().toLocaleDateString('ar-SA') + ' ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        type: 'offer',
        note: `🎉 تم تعميد عقد الاشتراك وتأهيل الأسطول بنجاح! الباقة: (${packageType === 'pro' ? 'سلطة احترافية Pro' : packageType === 'enterprise' ? 'الشركات الضخمة Enterprise' : 'الأساسية Basic'}) لفترة ${licenseMonths} شهر.`,
        agent: 'النظام الآلي'
      };
      
      const updatedLead = {
        ...lead,
        status: 'won',
        communicationLogs: [activationLog, ...currentLogs],
        provisionedDetails: provisionedInfo,
        lastActivityDate: new Date().toISOString()
      };
      
      const updatedList = leads.map(l => l.id === lead.id ? updatedLead : l);
      saveLeads(updatedList, updatedLead);
      setSelectedLeadForDetail(updatedLead);
      setProvisionSuccessInfo(provisionedInfo);
      setIsProvisioning(false);
    }, 1500);
  };

  // Manual Lead entry submission
  const handleAddNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.company) return;
    
    const newLeadObject = {
      id: 'lead-' + Date.now(),
      name: newLeadForm.name,
      company: newLeadForm.company,
      email: newLeadForm.email || `${newLeadForm.company.toLowerCase().replace(/\s+/g, '')}@saas-fleet.com`,
      phone: newLeadForm.phone || 'غير مسجل',
      fleetSize: Number(newLeadForm.fleetSize) || 12,
      province: newLeadForm.province,
      country: newLeadForm.country,
      notes: newLeadForm.notes || 'لا يوجد ملاحظات أولية',
      status: newLeadForm.status,
      date: new Date().toISOString().split('T')[0],
      communicationLogs: [
        {
          id: 'log-initial',
          date: new Date().toLocaleDateString('ar-SA') + ' ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          type: 'meeting',
          note: `تم فتح هذه الصفقة وتدوين البيانات يدوياً من لوحة القيادة. حجم الأسطول التقديري: ${newLeadForm.fleetSize} شاحنة ومعدة.`,
          agent: 'مدير عمليات المبيعات'
        }
      ]
    };
    
    const updatedList = [newLeadObject, ...leads];
    saveLeads(updatedList, newLeadObject);
    
    setShowAddLeadModal(false);
    // Reset form
    setNewLeadForm({
      name: '',
      company: '',
      email: '',
      phone: '',
      fleetSize: 10,
      province: 'المنطقة الشرقية',
      country: 'المملكة العربية السعودية',
      notes: '',
      status: 'new'
    });
  };

  // Features Handles
  const handleFeatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureForm) return;

    if (featureForm.id) {
      // Edit
      const updated = features.map(f => f.id === featureForm.id ? { ...featureForm } : f);
      saveFeatures(updated);
    } else {
      // Add
      const newF = {
        ...featureForm,
        id: 'f-' + Date.now()
      };
      saveFeatures([...features, newF]);
    }
    setFeatureForm(null);
  };

  const startEditFeature = (f: any) => {
    setFeatureForm({
      id: f.id,
      titleAr: f.titleAr || '',
      titleEn: f.titleEn || '',
      descAr: f.descAr || '',
      descEn: f.descEn || '',
      iconName: f.iconName || 'Wrench',
      badgeAr: f.badgeAr || '',
      badgeEn: f.badgeEn || ''
    });
  };

  const handleDeleteFeature = (id: string) => {
    if (!window.confirm(language === 'ar' ? 'هل تريد حذف هذه الميزة تشغيلياً؟' : 'Delete this feature?')) return;
    const updated = features.filter(f => f.id !== id);
    saveFeatures(updated);
  };

  // Partners handles
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm) return;

    if (clientForm.id) {
      const updated = clients.map(c => c.id === clientForm.id ? { ...clientForm } : c);
      saveClients(updated);
    } else {
      const newC = {
        ...clientForm,
        id: 'c-' + Date.now()
      };
      saveClients([...clients, newC]);
    }
    setClientForm(null);
  };

  const startEditClient = (c: any) => {
    setClientForm({
      id: c.id,
      name: c.name || '',
      industryAr: c.industryAr || '',
      industryEn: c.industryEn || '',
      rating: c.rating || 5,
      yearJoint: c.yearJoint || '2026',
      activeVehicles: c.activeVehicles || '25',
      logoSeed: c.logoSeed || 'CL'
    });
  };

  const handleDeleteClient = (id: string) => {
    if (!window.confirm(language === 'ar' ? 'هل تريد حذف العميل/الشركة من قائمة الموقع؟' : 'Remove company from site?')) return;
    const updated = clients.filter(c => c.id !== id);
    saveClients(updated);
  };

  // Reviews/Testimonials handlers
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm) return;

    if (reviewForm.id) {
      const updated = reviews.map(r => r.id === reviewForm.id ? { ...reviewForm } : r);
      saveReviews(updated);
    } else {
      const newR = {
        ...reviewForm,
        id: 'r-' + Date.now(),
        avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 50) + 1500000}?w=150&h=150&fit=crop&crop=faces`
      };
      saveReviews([...reviews, newR]);
    }
    setReviewForm(null);
  };

  const startEditReview = (r: any) => {
    setReviewForm({
      id: r.id,
      authorName: r.authorName || '',
      roleAr: r.roleAr || '',
      roleEn: r.roleEn || '',
      company: r.company || '',
      contentAr: r.contentAr || '',
      contentEn: r.contentEn || '',
      rating: r.rating || 5
    });
  };

  const handleDeleteReview = (id: string) => {
    if (!window.confirm(language === 'ar' ? 'حذف تقييم العميل؟' : 'Delete review?')) return;
    const updated = reviews.filter(r => r.id !== id);
    saveReviews(updated);
  };

  const saveFooterColumns = (cols: any[]) => {
    setFooterColumns(cols);
    localStorage.setItem('saas_marketing_footer_columns_v2', JSON.stringify(cols));
    triggerSaveNotification();
  };

  const saveFooterMeta = (meta: any) => {
    setFooterMeta(meta);
    localStorage.setItem('saas_marketing_footer_meta_v1', JSON.stringify(meta));
    triggerSaveNotification();
  };

  const handleAddFooterItem = (colId: string) => {
    if (!newColItemAr.trim() || !newColItemEn.trim()) return;
    const updated = footerColumns.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          items: [
            ...col.items,
            {
              id: 'item-' + colId + '-' + Date.now(),
              labelAr: newColItemAr.trim(),
              labelEn: newColItemEn.trim()
            }
          ]
        };
      }
      return col;
    });
    saveFooterColumns(updated);
    setNewColItemAr("");
    setNewColItemEn("");
  };

  const handleDeleteFooterItem = (colId: string, itemId: string) => {
    const updated = footerColumns.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          items: col.items.filter((item: any) => item.id !== itemId)
        };
      }
      return col;
    });
    saveFooterColumns(updated);
  };

  const handleUpdateColumnTitle = (colId: string, titleAr: string, titleEn: string) => {
    const updated = footerColumns.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          titleAr,
          titleEn
        };
      }
      return col;
    });
    saveFooterColumns(updated);
  };

  const handleResetFooterDefault = () => {
    if (window.confirm(language === 'ar' ? 'هل تريد استعادة قوائم التذييل والروابط الافتراضية؟ سيتم مسح التعديلات الحالية.' : 'Restore original footer link template? This overwrites current changes.')) {
      saveFooterColumns(DEFAULT_FOOTER_COLUMNS);
    }
  };

  // Dynamic calculation of stats inside the component render scope
  const totalLeadsCount = leads.length;
  const pendingLeadsCount = leads.filter(l => l.status === 'new').length;
  const contactedLeadsCount = leads.filter(l => l.status === 'contacted').length;
  const wonLeadsCount = leads.filter(l => l.status === 'won').length;
  const lostLeadsCount = leads.filter(l => l.status === 'lost').length;
  const conversionRatePercent = totalLeadsCount > 0 ? Math.round((wonLeadsCount / totalLeadsCount) * 100) : 0;
  const totalFleetSize = leads.reduce((sum, l) => sum + (Number(l.fleetSize) || 0), 0);
  const saasMmrValueSAR = leads.filter(l => l.status === 'won').reduce((sum, l) => sum + (Number(l.fleetSize) || 0) * 35, 0);
  const potentialMmrValueSAR = leads.reduce((sum, l) => sum + (Number(l.fleetSize) || 0) * 35, 0);

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      (l.name || '').toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      (l.company || '').toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      (l.phone || '').toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      (l.source || '').toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      (l.topic || '').toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      (l.province || '').toLowerCase().includes(leadSearchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (leadStatusFilter === 'all') {
      matchesStatus = true;
    } else if (leadStatusFilter === 'support') {
      matchesStatus = l.type === 'support_ticket' || (l.source && l.source.includes('مركز المساعدة')) || (l.source && l.source.includes('تذكرة'));
    } else if (leadStatusFilter === 'hq') {
      matchesStatus = l.topic === 'corporate-mgmt' || (l.source && l.source.includes('إدارة الساس')) || (l.source && l.source.includes('HQ'));
    } else {
      matchesStatus = l.status === leadStatusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleSimulateSaudiLeads = () => {
    const mockSaudiLeads = [
      {
        id: 'sim-lead-1',
        name: 'م. خالد الحربي',
        company: 'الجزيرة للخدمات اللوجستية',
        email: 'k.harbi@aljazira-logistics.com.sa',
        phone: '+966 56 345 8761',
        fleetSize: 180,
        country: 'المملكة العربية السعودية',
        province: 'منطقة الرياض',
        status: 'won',
        date: new Date().toISOString().split('T')[0],
        source: 'محاكي المبيعات',
        notes: 'عميل مميز فائز بالصفقة! تم تعميد وتفعيل ترخيص أسطول بـ 180 شاحنة نقل مبردة ومعدات.'
      },
      {
        id: 'sim-lead-2',
        name: 'أ. عبد الرحمن اليوسف',
        company: 'شركة نقليات صدارة الشرق',
        email: 'ar.yousef@sadarahtrans.com',
        phone: '+966 50 432 1098',
        fleetSize: 42,
        country: 'المملكة العربية السعودية',
        province: 'المنطقة الشرقية',
        status: 'contacted',
        date: new Date().toISOString().split('T')[0],
        source: 'الموقع التسويقي',
        notes: 'تم تقديم عرض أسعار مبدئي لباقة الـ Pro. يدرس الربط مع نظام المحاسبة ERP للورشة.'
      },
      {
        id: 'sim-lead-3',
        name: 'م. فهد السديري',
        company: 'مجموعة المانع للمقاولات والمعدات',
        email: 'f.sudairy@almanabe.com',
        phone: '+966 55 998 8877',
        fleetSize: 95,
        country: 'المملكة العربية السعودية',
        province: 'المنطقة الغربية',
        status: 'new',
        date: new Date().toISOString().split('T')[0],
        source: 'حاسبة العائد',
        notes: 'طلب جديد مسجل عبر حاسبة العوائد. يمتلك 95 بلدوز وحارثة ثقيلة تشغيلية في ينبع.'
      },
      {
        id: 'sim-lead-4',
        name: 'م. أحمد الشهري',
        company: 'توصيل إكسبريس السريع',
        email: 'a.shehri@tawseel-express.sa',
        phone: '+966 54 123 7890',
        fleetSize: 320,
        country: 'المملكة العربية السعودية',
        province: 'منطقة الرياض',
        status: 'won',
        date: new Date().toISOString().split('T')[0],
        source: 'الموقع التسويقي',
        notes: 'صفقة تعميد كبرى! تم الفوز بـ 320 سيارة توصيل مايل أخير لربط فنيي الصيانة الدورية.'
      },
      {
        id: 'sim-lead-5',
        name: 'أ. صالح باهدى',
        company: 'مؤسسة باهدى لتوزيع الأغذية',
        email: 's.bahaj@bahaja-food.com',
        phone: '+966 59 776 5544',
        fleetSize: 15,
        country: 'المملكة العربية السعودية',
        province: 'المنطقة الجنوبية',
        status: 'lost',
        date: new Date().toISOString().split('T')[0],
        source: 'محاكي المبيعات',
        notes: 'حالة غير مهتمة حالياً. لم يقرر التفعيل لامتلاك ورشته الخاصة براد صيانة متكامل يدوياً.'
      }
    ];
    const organic = leads.filter(l => l && (!l.id || !l.id.startsWith('sim-')));
    saveLeads([...mockSaudiLeads, ...organic]);
  };

  const handleSimulateMajorWonLead = () => {
    const majorLead = {
      id: `sim-won-giant-${Date.now()}`,
      name: 'م. عبد العزيز الشمراني',
      company: 'الوطنية للنقل واللوجستيات (مساهمة)',
      email: 'a.shamrani@saudi-transport.com.sa',
      phone: '+966 54 888 7777',
      fleetSize: 750,
      country: 'المملكة العربية السعودية',
      province: 'منطقة الرياض',
      status: 'won',
      date: new Date().toISOString().split('T')[0],
      source: 'صفقة استراتيجية كبرى',
      notes: 'العميل الحكومي المميز للعام ٢٠٢٦! تعميد فوري بـ 750 شاحنة ومقطورة ثقيلة بمعدل اشتراك مخصص.'
    };
    saveLeads([majorLead, ...leads]);
  };

  const handleClearSimulatedLeads = () => {
    const filtered = leads.filter(l => l && (!l.id || !l.id.startsWith('sim-')));
    saveLeads(filtered);
  };

  const handleForceRefresh = () => {
    // Unregister aggressive service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      }).catch(() => {});
    }
    // Delete stale caches under this domain
    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key);
        }
      }).catch(() => {});
    }
    
    // Set a cache busted signature
    localStorage.setItem("applet_project_signature", "m360_mechanic_v3_forced_" + Date.now());
    
    // Refresh page
    window.location.reload();
  };

  return (
    <div className="space-y-6 @container">
      {/* HEADER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-soft">
        <div className="flex items-center gap-3.5 text-right w-full md:w-auto">
          <span className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100/40 dark:border-slate-850">
            <Globe2 size={24} className="animate-pulse" />
          </span>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">
                {language === 'ar' ? 'إدارة لوحة الهوية والموقع التسويقي (SaaS Controller)' : 'Marketing Site Control Panel'}
              </h2>
              <ContextualHelp 
                id="marketing-admin"
                titleAr="متحكم الهوية والموقع التسويقي"
                titleEn="SaaS Brand & Landing Controller"
                explanationAr="وحدة تحكم متكاملة خاصة بالمشرفين لتغيير ومطابقة ألوان التطبيق الإجمالية، وتخصيص عنوان ووصف العلامة التجارية، بالإضافة إلى تتبع طلبات تواصل العملاء الواردة من الصفحة التسويقية العامة."
                explanationEn="An elite administrative module to configure custom SaaS brand colors, manage reviews listed on public pages, and review active client leads."
                benefitsAr={[
                  "تعديل فوري للون الرئيسي الخاص بتطبيقك وشعار FleetAurvexis المخصص.",
                  "عرض وتعديل الميزات وآراء ومراجعات ملاك الورش لتسريع المبيعات.",
                  "سجل متكامل للـ Leads والعملاء مع ميزة تحديث ورصد حالتهم اللوجيستية."
                ]}
                benefitsEn={[
                  "Dynamic theme adjustments updating primary style guides immediately across all tabs.",
                  "Full content manager modifying features and company rating grids.",
                  "Live lead response dashboard to fast-forward customer engagement."
                ]}
                tipsAr={[
                  "يمكنك الضغط على زر العلامة التجارية المخصصة ومعاينتها لتفقد مدى ملائمة درجات الألوان المختارة قبل نشرها للعملاء."
                ]}
                tipsEn={[
                  "Always verify the Brand Preview box to ensure colors comply with eye strain guidelines before publishing changes."
                ]}
                language={language}
              />
            </div>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              {language === 'ar' 
                ? 'تحكّم تام بكامل محتوى الصفحة الخارجية، الباقات، الميزات، وآراء العملاء مع معالجة طلبات الاشتراك الفورية.'
                : 'Complete command over brand colors, landing segments, static reviews, partners, and incoming leads.'}
            </p>
          </div>
        </div>

        {/* TOP QUICK METRICS SUMMARY + QUICK SWITCHER & SAVING INDICATOR */}
        <div className="flex flex-wrap md:flex-nowrap gap-3 items-center justify-start md:justify-end w-full md:w-auto select-none">
          {/* VISUAL SAVE STATUS INDICATOR */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100/70 dark:border-slate-800/80 text-[10.5px] font-black h-10 select-none">
            {saveStatus === 'saving' && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="text-amber-600 dark:text-amber-400">
                  {language === 'ar' ? 'جاري الحفظ تلقائياً...' : 'Saving...'}
                </span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check size={11} strokeWidth={3} />
                  {language === 'ar' ? 'تم حفظ التغييرات' : 'Changes saved'}
                </span>
              </>
            )}
            {saveStatus === 'idle' && (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="text-slate-400 dark:text-slate-500">
                  {language === 'ar' ? 'جميع التعديلات محفوظة' : 'All saved'}
                </span>
              </>
            )}
          </div>

          {/* QUICK MODE SWITCHER */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-150/40 dark:border-slate-800/60 font-sans select-none items-center shrink-0 h-10">
            <button 
              type="button" 
              onClick={() => onNavigateToTab?.('marketing-portal')}
              className="px-3.5 py-1.5 hover:bg-white dark:hover:bg-slate-900 text-slate-505 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 text-[10px] font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-none hover:shadow-xs"
              title={language === 'ar' ? 'معاينة العرض العام للموقع' : 'Preview public website view'}
            >
              <Eye size={12} className="text-slate-405 dark:text-slate-500" />
              <span>{language === 'ar' ? 'العرض العام للموقع' : 'Public Site'}</span>
            </button>
            <div 
              className="px-3.5 py-1.5 bg-indigo-650 dark:bg-indigo-700 text-white text-[10px] font-black rounded-xl flex items-center gap-1.5 shadow-soft border border-indigo-500/10"
            >
              <PenTool size={11} />
              <span>{language === 'ar' ? 'وضع تحرير المحتوى' : 'Edit Mode'}</span>
            </div>
          </div>

          {/* INSTANT CACHE FLUSHER & CODE BROADCAST BUTTON */}
          <button
            type="button"
            onClick={handleForceRefresh}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-black h-10 cursor-pointer transition-all hover:scale-98"
            title={language === 'ar' ? 'تحديث الكود الفوري وإفراغ الذاكرة المؤقتة للمتصفح للجوال والكمبيوتر' : 'Force clear cache and load latest code updates'}
          >
            <RefreshCw size={11.5} className="animate-spin text-amber-600 dark:text-amber-400 duration-3000" />
            <span>{language === 'ar' ? 'تحديث الكود المباشر' : 'Force Update'}</span>
          </button>

          <div className="hidden lg:flex gap-1.5 items-center">
            <div className="px-3 py-1.5 h-10 bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100/30 dark:border-indigo-900/10 rounded-xl text-center flex flex-col justify-center min-w-[100px]">
              <span className="text-[8px] text-indigo-505 dark:text-indigo-400 block font-bold leading-none mb-0.5">إجمالي الطلبات</span>
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 font-mono leading-none">{leads.length}</span>
            </div>
            <div className="px-3 py-1.5 h-10 bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100/30 dark:border-emerald-950/10 rounded-xl text-center flex flex-col justify-center min-w-[100px]">
              <span className="text-[8px] text-emerald-800 dark:text-emerald-400 block font-bold leading-none mb-0.5">الباقات المكتملة</span>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 font-mono leading-none">{leads.filter(l => l.status === 'won').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CRM NAV LIST STRUCTURE */}
            {/* MOBILE CRM TRIGGER BAR */}
            <div className="block lg:hidden bg-white text-slate-900 p-4 rounded-3xl border border-slate-200 shadow-xs select-none mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 px-3 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                    style={{ backgroundColor: brandPrimaryColor, boxShadow: `0 10px 15px -3px ${brandPrimaryColor}20` }}
                  >
                    <Menu size={14} strokeWidth={2.5} />
                    <span>{language === 'ar' ? 'أقسام اللوحة' : 'Menu'}</span>
                  </button>
                  <div className="text-right">
                    <span className="text-[8.5px] block text-slate-500 font-extrabold tracking-wide uppercase leading-none">متحكم الساس | CRM PANEL</span>
                    <h4 className="text-[11px] font-black text-slate-900 mt-1">
                      {language === 'ar' ? 'تخصيص الموقع والهوية' : 'SaaS Customize Dashboard'}
                    </h4>
                  </div>
                </div>
                
                <div className="text-left font-sans">
                  <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-2xl">
                    <span className="text-[10px] font-black" style={{ color: brandPrimaryColor }}>
                      {activeSubTab === 'leads' ? 'المشتركون' :
                       activeSubTab === 'tutorials' ? 'مكتبة الفيديوهات' :
                       activeSubTab === 'launch-planner' ? 'خطة الإطلاق' :
                       activeSubTab === 'identity' ? 'الهوية والألوان' :
                       activeSubTab === 'features' ? 'المميزات' :
                       activeSubTab === 'clients' ? 'العملاء والشعارات' :
                       activeSubTab === 'testimonials' ? 'المراجعات' : 
                       activeSubTab === 'robots' ? 'مكتبة الروبوتات الذكية' : 
                       activeSubTab === 'gallery' ? 'معرض الصور' : 'التذييل'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MOBILE DRAWER SIDEBAR OVERLAY */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <>
                  {/* Backdrop overlay */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 lg:hidden"
                  />
                  {/* Sliding Drawer Container */}
                  <motion.div 
                    initial={{ x: isRtl ? '100%' : '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: isRtl ? '100%' : '-100%' }}
                    transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                    className={`fixed top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} w-80 bg-white text-slate-900 border-l border-slate-200 p-5.5 shadow-2xl z-51 overflow-y-auto lg:hidden flex flex-col justify-between text-right`}
                    dir={isRtl ? 'rtl' : 'ltr'}
                  >
                    <div className="space-y-5">
                      {/* Drawer Brand Header */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                        <button 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer transition-colors border border-slate-200"
                        >
                          <X size={15} />
                        </button>
                        <div className="text-right">
                          <span className="text-[9px] font-black tracking-wider block leading-none" style={{ color: brandPrimaryColor }}>بوابة FleetAurvexis</span>
                          <h3 className="text-xs font-black text-slate-900 mt-1">SaaS CRM Controller</h3>
                        </div>
                      </div>

                      {/* Interactive Search Box */}
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="بحث سريع في اللوحة..." 
                          value={searchMenuQuery}
                          onChange={(e) => setSearchMenuQuery(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl py-2 px-3.5 pr-9 text-[11px] font-sans text-right focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <Search size={12.5} className="absolute right-3.5 top-3 text-slate-400" />
                      </div>

                      {/* Filtered Tabs List */}
                      <div className="space-y-1.5 select-none">
                        {filteredMenuItems.length > 0 ? (
                          filteredMenuItems.map((t, idx) => {
                            const isActive = activeSubTab === t.id;
                            return (
                              <button
                                key={t?.id ? `mobile-tab-${t.id}` : `mobile-tab-${idx}`}
                                onClick={() => {
                                  setActiveSubTab(t.id as any);
                                  setIsMobileMenuOpen(false);
                                }}
                                className={`w-full text-right p-3 rounded-2xl transition-all duration-200 flex items-start gap-3 cursor-pointer group border ${
                                  isActive 
                                    ? 'text-white font-extrabold' 
                                    : 'bg-transparent border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                                }`}
                                style={isActive ? { backgroundColor: brandPrimaryColor, borderColor: brandPrimaryColor, boxShadow: `0 10px 15px -3px ${brandPrimaryColor}20` } : {}}
                              >
                                <span className={`p-2 rounded-xl transition-all shrink-0 mt-0.5 ${
                                  isActive 
                                    ? 'bg-white/15 text-white' 
                                    : 'bg-slate-100 text-slate-600 group-hover:text-slate-900 border border-slate-200'
                                }`}>
                                  {t.icon}
                                </span>
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <strong className="text-[11px] block transition-colors leading-tight font-black">
                                    {language === 'ar' ? t.label : t.id.toUpperCase()}
                                  </strong>
                                  <span className={`text-[9px] truncate block leading-none font-medium ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                                    {language === 'ar' ? t.subLabel : 'SaaS setup modules'}
                                  </span>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="text-center py-6 text-xs text-slate-500">
                            لا توجد أقسام مطابقة للبحث
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dynamic Profile Card at Custom Sidebar bottom */}
                    <div className="border-t border-slate-200 pt-4 mt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-black shadow-xs border border-orange-500/20">
                            أ
                          </div>
                          <div className="text-right">
                            <h4 className="text-[11px] font-black text-slate-800">أحمد المدير</h4>
                            <span className="text-[8.5px] font-bold text-amber-600 block">مدير النظام الفائق</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-bold text-slate-500">مكتمل</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-400 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* SIDE-BY-SIDE CRM LAYOUT */}
            <div className="flex flex-col lg:flex-row gap-6 items-start font-sans">
              
              {/* DESKTOP STICKY VERTICAL SIDEBAR (LIGHT & CLEAN THEME) */}
              <div className="hidden lg:block w-[325px] shrink-0 space-y-4 lg:sticky lg:top-6">
                <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs text-right">
                  {/* Sidebar Header */}
                  <div className="border-b border-slate-200 pb-3.5 mb-3.5 text-right flex items-center gap-2 justify-end">
                    <div className="text-right flex-1 min-w-0">
                      <span className="text-[9px] font-black tracking-wider block" style={{ color: brandPrimaryColor }}>
                        {language === 'ar' ? 'بوابة لوحة تحكم الساس' : 'SaaS Portal Customizer'}
                      </span>
                      <h3 className="text-xs font-black text-slate-900 mt-1 truncate">
                        {language === 'ar' ? 'الموقع والهوية والألوان' : 'SaaS Control Modules'}
                      </h3>
                    </div>
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${brandPrimaryColor}15`, borderColor: `${brandPrimaryColor}40`, color: brandPrimaryColor }}>
                      <SlidersHorizontal size={14} />
                    </span>
                  </div>

                  {/* Quick Search */}
                  <div className="relative mb-3.5">
                    <input 
                      type="text" 
                      placeholder={language === 'ar' ? 'بحث سريع بالاعدادات...' : 'Quick CRM search...'} 
                      value={searchMenuQuery}
                      onChange={(e) => setSearchMenuQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl py-2 px-3.5 pr-9 text-[11px] font-sans text-right focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <Search size={12.5} className="absolute right-3.5 top-3 text-slate-400" />
                  </div>
                  
                  {/* Items List */}
                  <div className="space-y-1.5 select-none">
                    {filteredMenuItems.length > 0 ? (
                      filteredMenuItems.map((t, idx) => {
                        const isActive = activeSubTab === t.id;
                        return (
                          <button
                            key={t?.id ? `desk-tab-${t.id}` : `desk-tab-${idx}`}
                            onClick={() => setActiveSubTab(t.id as any)}
                            className={`w-full text-right p-3 rounded-2xl transition-all duration-200 flex items-start gap-3 cursor-pointer group border ${
                              isActive 
                                ? 'text-white font-extrabold' 
                                : 'bg-transparent border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                            style={isActive ? { backgroundColor: brandPrimaryColor, borderColor: brandPrimaryColor, boxShadow: `0 10px 15px -3px ${brandPrimaryColor}20` } : {}}
                          >
                            <span className={`p-2 rounded-xl transition-all shrink-0 mt-0.5 ${
                              isActive 
                                ? 'bg-white/15 text-white' 
                                : 'bg-slate-100 text-slate-600 group-hover:text-slate-900 border border-slate-200'
                            }`}>
                              {t.icon}
                            </span>
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <strong className={`text-[11px] block transition-colors leading-tight ${isActive ? 'font-black' : 'font-bold'}`}>
                                {language === 'ar' ? t.label : t.id.toUpperCase()}
                              </strong>
                              <span className={`text-[9px] truncate block leading-none font-medium ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                                {language === 'ar' ? t.subLabel : 'Configuration tab'}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-500">
                        لا توجد نتائج مطابقة
                      </div>
                    )}
                  </div>

                  {/* Profile section at bottom */}
                  <div className="border-t border-slate-200 pt-4 mt-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8.5 h-8.5 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-black shadow-xs border border-orange-500/10">
                          أ
                        </div>
                        <div className="text-right">
                          <h4 className="text-[11px] font-black text-slate-800">أحمد المدير</h4>
                          <span className="text-[8px] font-bold text-amber-600 block">مدير النظام الفائق</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-black text-slate-500">نشط</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 border border-emerald-400 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* QUICK GENERAL METRICS */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4 text-right space-y-3 select-none shadow-xs">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-slate-600">{language === 'ar' ? 'إحصائيات فورية للموقع' : 'Active stats'}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl text-center">
                      <span className="text-[7.5px] text-slate-500 font-extrabold block mb-1">{language === 'ar' ? 'طلبات الاشتراك' : 'Requests'}</span>
                      <span className="text-[11px] font-black text-slate-800">{leads.length}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl text-center">
                      <span className="text-[7.5px] text-slate-500 font-extrabold block mb-1">{language === 'ar' ? 'الباقات المكتملة' : 'Main limit'}</span>
                      <span className="text-[11px] font-black text-emerald-600">{leads.filter(l => l.status === 'won').length}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* DESKTOP/MOBILE CENTRAL DETAILS CONTENT CONTAINER */}
              <div className="flex-1 w-full min-w-0 space-y-6">

        
        {/* TAB 1: SAAS LEADS VIEW */}
        {activeSubTab === 'leads' && (
          <div className="space-y-6">
              
              {/* FIREBASE SENSITIVE INTEGRATION DESK */}
              <div className="bg-gradient-to-r from-indigo-50/80 via-sky-50/40 to-white border border-indigo-100 text-slate-900 rounded-3xl p-5 shadow-xs font-sans text-right">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-right w-full md:w-auto">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="p-1 px-2.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg border border-indigo-200/60 flex items-center gap-1.5 direction-ltr">
                        <Cloud size={11} className="animate-pulse text-indigo-600" />
                        {language === 'ar' ? 'البوابة السحابية نشطة' : 'Cloud Portal Active'}
                      </span>
                      <h3 className="text-xs font-black tracking-tight text-slate-900">{language === 'ar' ? 'بوابة التحكم والربط السحابي بقاعدة Firebase' : 'SaaS Firebase Cloud Integration Core'}</h3>
                    </div>
                    <p className="text-[10.5px] text-slate-600 mt-1 max-w-xl">
                      {language === 'ar' 
                        ? 'يمكنك التبديل بين الذاكرة المحلية والاتصال السحابي بقاعدة Firestore الحية لحفظ وإثبات تسجيلات المشتركين ومزامنة هوية موقعك التسويقي.' 
                        : 'Toggle between clean local storage fallback and direct live Google Firebase Firestore connection.'}
                    </p>
                  </div>

                  {/* Switcher & Manual Sync button */}
                  <div className="flex flex-wrap gap-2 items-center justify-end">
                    {/* Toggle */}
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[9.5px] font-bold text-slate-600">{language === 'ar' ? 'وضع السحابة نشط:' : 'Cloud Mode:'}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleFirebaseMode(!useFirebase)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          useFirebase ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            useFirebase ? (isRtl ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Manual Backup Sync */}
                    <button
                      type="button"
                      disabled={isSyncingWithCloud}
                      onClick={pushBrandedDataToCloud}
                      className="p-2 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[10px] font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ArrowRightLeft size={12} className={isSyncingWithCloud ? 'animate-spin' : ''} />
                      <span>{language === 'ar' ? 'مزامنة السحابة يدوياً' : 'Force Cloud Sync'}</span>
                    </button>
                  </div>
                </div>

                {/* Live Connection Diagnostics bar */}
                <div className="mt-4 p-3 bg-white/90 rounded-2xl border border-indigo-100 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 font-mono text-[9px] select-all">
                    <span className={`w-2 h-2 rounded-full ${isFirestoreConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                    <span className="text-slate-500">STATUS:</span>
                    <span className={isFirestoreConnected ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                      {isFirestoreConnected ? 'LIVE_FIRESTORE_CONNECTED' : 'LOCAL_STORAGE_MODE'}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Database size={11} className="text-indigo-600" />
                    <span>{cloudFeedbackLog}</span>
                  </div>
                </div>
              </div>

              {/* -------------------- SaaS CRM Pipeline Metrics Hub -------------------- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-right">
                
                {/* Metric 1: Total Opportunities */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Users size={16} />
                    </span>
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? 'فرص المبيعات' : 'CRM Opportunities'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xl font-black text-slate-900 font-mono">{totalLeadsCount}</div>
                    <p className="text-[10px] text-slate-500">
                      {language === 'ar' ? `حجم الأسطول الكلي المتراكم: ${totalFleetSize} شاحنة` : `Total target fleet units: ${totalFleetSize}`}
                    </p>
                  </div>
                </div>

                {/* Metric 2: Conversion Success Rate */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <BarChart2 size={16} />
                    </span>
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? 'معدل نجاح الصفقات' : 'Conversion Success'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xl font-black text-emerald-600 font-mono">{conversionRatePercent}%</div>
                    <p className="text-[10px] text-slate-500">
                      {language === 'ar' ? `مقبول ومفعل: ${wonLeadsCount} • قيد التواصل: ${contactedLeadsCount}` : `Onboarded: ${wonLeadsCount} • Working: ${contactedLeadsCount}`}
                    </p>
                  </div>
                </div>

                {/* Metric 3: Active Monthly SaaS Value (MRR) */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <DollarSign size={16} />
                    </span>
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? 'الإيراد الشهري الفعلي' : 'Monthly SaaS MRR'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {saasMmrValueSAR.toLocaleString('ar-SA')} <span className="text-xs font-bold text-slate-400 font-sans">ر.س</span>
                    </div>
                    <p className="text-[10px] font-semibold text-emerald-600">
                      {language === 'ar' ? '✓ اشتراكات مفعلة ومدفوعة تلقائياً' : '✓ Paid active licenses'}
                    </p>
                  </div>
                </div>

                {/* Metric 4: Potential Pipeline MMR */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2 bg-violet-50 text-violet-600 rounded-xl">
                      <TrendingUp size={16} />
                    </span>
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? 'الإيراد الإجمالي المتوقع' : 'Potential Pipeline'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {potentialMmrValueSAR.toLocaleString('ar-SA')} <span className="text-xs font-bold text-slate-400 font-sans">ر.س</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {language === 'ar' ? 'القيمة التقديرية لكافة طلبات صفحة الهبوط' : 'Estimated worth of all registered leads'}
                    </p>
                  </div>
                </div>

              </div>

              {/* -------------------- DYNAMIC SAAS CONTROLLER PLAYGROUND & REV CALCULATOR -------------------- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right select-none">
                
                {/* Panel 1: MRR Projected Revenue Engine */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="p-1 px-2.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9.5px] font-black tracking-wider uppercase">
                      {language === 'ar' ? 'نموذج محاكاة التسعير' : 'MRR Forecaster'}
                    </span>
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 justify-end">
                      <span>{language === 'ar' ? 'حاسبة توقع الإيرادات والنمو التفاعلية' : 'Interactive MRR & Sales Forecaster'}</span>
                      <TrendingUp size={14} className="text-indigo-600" />
                    </h4>
                  </div>
                  
                  <div className="space-y-3.5">
                    {/* Slider 1: Target Subscribed Companies */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="font-mono text-indigo-600">{targetSubscribers} {language === 'ar' ? 'ورشة/شركة' : 'clients'}</span>
                        <span className="text-slate-600">{language === 'ar' ? 'عدد العملاء والشركات النشطة المستهدفة:' : 'Target Customers:'}</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={targetSubscribers} 
                        onChange={(e) => setTargetSubscribers(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>

                    {/* Slider 2: Average Fleet size */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="font-mono text-indigo-600">{avgFleetUnits} {language === 'ar' ? 'شاحنة/معدة' : 'vehicles'}</span>
                        <span className="text-slate-600">{language === 'ar' ? 'متوسط حجم أسطول المشترك الواحد:' : 'Avg Fleet Units Per Client:'}</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="350" 
                        value={avgFleetUnits} 
                        onChange={(e) => setAvgFleetUnits(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>

                    {/* Slider 3: Price per dynamic license */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="font-mono text-indigo-600">{mrrPricePerTruck} {language === 'ar' ? 'ر.س / مركبة شهرياً' : 'SAR'}</span>
                        <span className="text-slate-600">{language === 'ar' ? 'قيمة الاشتراك الشهري لكل مركبة:' : 'SaaS Price per Vehicle/mo:'}</span>
                      </div>
                      <input 
                        type="range" 
                        min="15" 
                        max="100" 
                        value={mrrPricePerTruck} 
                        onChange={(e) => setMrrPricePerTruck(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Calculations visual feedback box */}
                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl grid grid-cols-2 gap-2 text-center">
                    <div className="border-l border-indigo-100 pl-2">
                      <span className="text-[8.5px] font-bold text-slate-500 block mb-0.5">{language === 'ar' ? 'الدخل السنوي المتوقع ARR' : 'Projected ARR'}</span>
                      <strong className="text-[13px] font-mono text-indigo-700">
                        {((targetSubscribers * avgFleetUnits * mrrPricePerTruck) * 12).toLocaleString('ar-SA')} <span className="text-[9px] font-sans">ر.س</span>
                      </strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-bold text-slate-500 block mb-0.5">{language === 'ar' ? 'الإيراد الشهري المكرر MRR' : 'Projected MRR'}</span>
                      <strong className="text-[13px] font-mono text-indigo-700">
                        {(targetSubscribers * avgFleetUnits * mrrPricePerTruck).toLocaleString('ar-SA')} <span className="text-[9px] font-sans">ر.س</span>
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Interactive Sandbox & Simulations generator */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="p-1 px-2.5 bg-amber-50 text-amber-700 rounded-lg text-[9.5px] font-black">
                      {language === 'ar' ? 'بوابة المحاكاة ومراقبة الأداء' : 'Simulation Sandbox'}
                    </span>
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 justify-end">
                      <span>{language === 'ar' ? 'مركز محاكاة المبيعات وأتمتة الـ Leads' : 'Sales Simulation Sandbox'}</span>
                      <Activity size={14} className="text-amber-500" />
                    </h4>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed text-right">
                    {language === 'ar' 
                      ? 'وفر عناء تعبئة النماذج اليدوية لتجربة اللوحة! قم بتوليد سيناريوهات نمو فوري لقطاع الخدمات والنقل والخدمات البيئية بضغطة زر واحدة لمطابقة البيانات وتحليل الأداء.' 
                      : 'Generate realistic high-profile leads immediately to test analytics graphs, status progression, and cloud operations.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pb-0.5">
                    {/* Simulate 5 leads */}
                    <button
                      type="button"
                      onClick={handleSimulateSaudiLeads}
                      className="p-2.5 hover:-translate-y-0.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-[10.5px] text-indigo-700 font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      title="توليد ٥ صفقات فوري"
                    >
                      <Plus size={12} />
                      <span>{language === 'ar' ? 'توليد ٥ صفقات فوري' : 'Simulate 5 Deals'}</span>
                    </button>

                    {/* Simulate major WON client */}
                    <button
                      type="button"
                      onClick={handleSimulateMajorWonLead}
                      className="p-2.5 hover:-translate-y-0.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-[10.5px] text-emerald-700 font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      title="محاكاة عقد كود فائز رابح"
                    >
                      <Award size={12} />
                      <span>{language === 'ar' ? 'محاكاة عقد كود فائز رابح' : 'Simulate Won Giant'}</span>
                    </button>
                  </div>

                  {/* Clean up action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[9.5px]">
                    <button
                      type="button"
                      onClick={handleClearSimulatedLeads}
                      className="text-rose-600 hover:text-rose-700 font-extrabold flex items-center gap-1 cursor-pointer"
                      title="مسح الاشتراكات المحاكية"
                    >
                      <Trash2 size={11} />
                      <span>{language === 'ar' ? 'مسح الاشتراكات المحاكية' : 'Wipe Simulated Deals'}</span>
                    </button>
                    <span className="text-slate-400 font-medium">
                      {language === 'ar' ? `العملاء المحاكون بالجدول حالياً: ${leads.filter(l => l && l.id && l.id.startsWith('sim-')).length}` : `Simulated: ${leads.filter(l => l && l.id && l.id.startsWith('sim-')).length}`}
                    </span>
                  </div>
                </div>

              </div>

              {/* -------------------- SEARCH, FILTER, AND Bulk ACTIONS BAR -------------------- */}
              <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl flex flex-col lg:flex-row gap-3 items-center justify-between select-none">
                
                {/* Search & Filter Inputs combo */}
                <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto text-right">
                  
                  {/* Search box */}
                  <div className="relative flex-1 sm:min-w-[280px]">
                    <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      value={leadSearchQuery}
                      onChange={(e) => setLeadSearchQuery(e.target.value)}
                      placeholder={language === 'ar' ? 'البحث بالاسم، الشركة، الجوال، البريد، المنطقة...' : 'Search Name, Company, Email, Phone...'}
                      className="w-full text-right p-2.5 pr-9 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none placeholder-slate-400 text-slate-800"
                    />
                    {leadSearchQuery && (
                      <button
                        onClick={() => setLeadSearchQuery('')}
                        className="absolute inset-y-0 left-3 flex items-center text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                      >
                        مسح
                      </button>
                    )}
                  </div>

                  {/* Status checklist dropdown selector */}
                  <div className="relative">
                    <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none">
                      <Filter size={13} />
                    </span>
                    <select
                      value={leadStatusFilter}
                      onChange={(e: any) => setLeadStatusFilter(e.target.value)}
                      className="text-right p-2.5 pr-8 pl-8 bg-white border border-slate-200 outline-none rounded-xl text-xs text-slate-700 cursor-pointer appearance-none min-w-[170px] font-black"
                    >
                      <option value="all">{language === 'ar' ? 'فلترة بكافة الطلبات والتذاكر' : 'All Leads & Tickets'}</option>
                      <option value="hq">{language === 'ar' ? '🏢 تذاكر إدارة الساس والشركة الأم (HQ)' : '🏢 SaaS HQ Management Tickets'}</option>
                      <option value="support">{language === 'ar' ? '🎫 تذاكر الدعم (مركز المساعدة)' : '🎫 Help Center Support Tickets'}</option>
                      <option value="new">{language === 'ar' ? 'جديدة (انتظار)' : 'New Leads / Pending'}</option>
                      <option value="contacted">{language === 'ar' ? 'قيد التواصل والمتابعة' : 'Contacted'}</option>
                      <option value="won">{language === 'ar' ? 'مقبولة وتأهيل ناجح' : 'Converted / Won'}</option>
                      <option value="lost">{language === 'ar' ? 'مرفوضة / منتهية' : 'Lost'}</option>
                    </select>
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none">
                      <ChevronDown size={12} />
                    </span>
                  </div>

                </div>

                {/* Bulk Actions buttons */}
                <div className="flex gap-2 w-full lg:w-auto justify-end">
                  
                  {/* Export CSV for Excel */}
                  <button
                    type="button"
                    onClick={exportLeadsToCsv}
                    className="p-2 px-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer select-none"
                  >
                    <Download size={13} />
                    <span>{language === 'ar' ? 'تصدير إكسل CSV' : 'Export Excel'}</span>
                  </button>

                  {/* Add manual lead */}
                  <button
                    type="button"
                    onClick={() => setShowAddLeadModal(true)}
                    className="p-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs select-none white-space-nowrap"
                  >
                    <Plus size={14} />
                    <span>{language === 'ar' ? 'إضافة عميل مبيعات يدوياً' : 'Add Manual Deal'}</span>
                  </button>

                </div>

              </div>

              {/* -------------------- MAIN DATA TABLE / CARDS LIST -------------------- */}
              <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-right select-none">
                  <div>
                    <h3 className="text-xs font-black text-slate-900">قائمة الاشتراكات وتوجيه صفقات الهبوط</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">انقر على أي كرت لتحليل كامل تفاصيل التواصل مع العميل، وإتمام التفعيل والتعميد السحابي للأسطول.</p>
                  </div>
                  <span className="p-1 px-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black font-mono border border-indigo-100">
                    {filteredLeads.length} Matches Found
                  </span>
                </div>

                {filteredLeads.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 text-xs font-semibold space-y-1.5">
                    <Users size={28} className="mx-auto text-slate-300 block mb-1" />
                    <p>{language === 'ar' ? 'لا توجد نتائج مطابقة لبحثك الجاري.' : 'No matching pipeline leads found.'}</p>
                    <button
                      onClick={() => { setLeadSearchQuery(''); setLeadStatusFilter('all'); }}
                      className="text-xs text-indigo-600 hover:underline cursor-pointer"
                    >
                      إعادة تصفية الجدول
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto divide-y divide-slate-100 font-sans text-right">
                    {filteredLeads.map((l, idx) => (
                      <div 
                        key={l?.id || `lead-row-${idx}`} 
                        className={`p-5 hover:bg-slate-50/80 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center group cursor-pointer ${
                          selectedLeadForDetail?.id === l.id ? 'bg-indigo-50/30 border-r-4 border-indigo-500' : ''
                        }`}
                      >
                        {/* Name & Contact Info */}
                        <div className="md:col-span-3 space-y-1.5" onClick={() => setSelectedLeadForDetail(l)}>
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-[12px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{l.name}</span>
                            <span className="p-1 px-1.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[8px]">
                              {l?.id ? String(l.id).slice(0, 8) : 'LEAD'}
                            </span>
                          </div>
                          <div className="space-y-1 text-[10.5px] text-slate-500 select-all font-mono leading-relaxed">
                            <div className="flex items-center justify-end gap-1.5">
                              <span>{l.phone}</span>
                              <Phone size={10} className="text-slate-400 shrink-0" />
                            </div>
                            <div className="flex items-center justify-end gap-1.5">
                              <span>{l.email}</span>
                              <Mail size={10} className="text-slate-400 shrink-0" />
                            </div>
                          </div>
                        </div>

                        {/* Company & Location */}
                        <div className="md:col-span-3 space-y-1.5" onClick={() => setSelectedLeadForDetail(l)}>
                          <div className="flex items-center gap-1.5 justify-end text-slate-800">
                            <span className="text-[12px] font-black">{l.company}</span>
                            <Building2 size={12} className="text-indigo-600 shrink-0" />
                          </div>
                          <div className="text-[11px] text-slate-500 space-y-0.5">
                            <p>{l.province} • {l.country}</p>
                            <p className="font-sans font-bold text-slate-600">
                              {language === 'ar' ? 'حجم الأسطول المقدر:' : 'Fleet Size:'}{' '}
                              <span className="text-indigo-600 font-mono font-black">{l.fleetSize} {language === 'ar' ? 'سيارة' : 'units'}</span>
                            </p>
                          </div>
                        </div>

                        {/* Notes Section with Direct Edit box */}
                        <div className="md:col-span-3 space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">{language === 'ar' ? 'آخر الملحوظات التقديرية:' : 'Quick Notes:'}</span>
                          <textarea
                            value={l.notes || ''}
                            onChange={(e) => updateLeadNotes(l.id, e.target.value)}
                            placeholder={language === 'ar' ? 'اكتب تدوينة، كإشعار العقد أو تاريخ التواصل القادم...' : 'Write team follow up logs...'}
                            className="w-full p-2 h-12 text-[10px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-800 leading-snug"
                          />
                        </div>

                        {/* Actions & Status */}
                        <div className="md:col-span-3 flex flex-row md:flex-col items-center md:items-end justify-between gap-2.5 text-right">
                          <div className="space-y-1 text-right">
                            <div className="flex items-center gap-1.5 justify-end flex-wrap">
                              {l.topic === 'corporate-mgmt' || (l.source && l.source.includes('إدارة الساس')) ? (
                                <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[9px] border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                  <Building2 size={10} className="shrink-0" />
                                  <span>{language === 'ar' ? 'إدارة الساس HQ' : 'SaaS HQ'}</span>
                                </span>
                              ) : l.type === 'support_ticket' || (l.source && l.source.includes('مركز المساعدة')) ? (
                                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[9px] border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                                  <HelpCircle size={10} className="shrink-0" />
                                  <span>{language === 'ar' ? 'تذكرة دعم فني' : 'Support Ticket'}</span>
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-400 text-right font-mono block leading-none">{l.source || 'Landing'}</span>
                              )}
                              <span className="text-[8.5px] text-slate-400 font-mono">{l.date}</span>
                            </div>
                            <div className="flex items-center gap-1 leading-none mt-0.5 justify-end" onClick={() => setSelectedLeadForDetail(l)}>
                              {getStatusBadge(l.status)}
                            </div>
                          </div>

                          {/* Quick CRM status toggles & Detail actions */}
                          <div className="flex gap-1 flex-wrap justify-end">
                            <button
                              onClick={() => setSelectedLeadForDetail(l)}
                              className="p-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[9.5px] font-black cursor-pointer transition-all flex items-center gap-1 border border-indigo-100"
                              title="تحليل ملف العميل ومتابعة التواصل"
                            >
                              <Eye size={10} />
                              <span>المتابعة</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteLead(l.id)}
                              className="p-1 px-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-500 rounded-lg text-[9px] font-bold cursor-pointer transition-all border border-transparent"
                              title="حذف الطلب نهائياً"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* -------------------- MODAL: MANUALLY ADD TEAM LEAD -------------------- */}
              <AnimatePresence>
                {showAddLeadModal && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-right font-sans"
                    >
                      <div className="p-4 px-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setShowAddLeadModal(false)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <span>إضافة صفقة مبيعات / عميل مهتم بـ SaaS</span>
                          <Users size={14} className="text-indigo-600" />
                        </h4>
                      </div>

                      <form onSubmit={handleAddNewLead} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          
                          {/* Name Input */}
                          <div className="space-y-1">
                            <label className="text-[10.5px] font-black text-slate-700 block">اسم الشخص المسؤول *</label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: أ. فيصل الغامدي"
                              value={newLeadForm.name}
                              onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                              className="w-full text-right p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none placeholder-slate-400 text-slate-800"
                            />
                          </div>

                          {/* Company Input */}
                          <div className="space-y-1">
                            <label className="text-[10.5px] font-black text-slate-700 block">اسم الشركة / الجهة *</label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: شركة غامدي لنقل البترول"
                              value={newLeadForm.company}
                              onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                              className="w-full text-right p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none placeholder-slate-400 text-slate-800"
                            />
                          </div>

                          {/* Email */}
                          <div className="space-y-1">
                            <label className="text-[10.5px] font-black text-slate-700 block">البريد الإلكتروني الرسمي</label>
                            <input
                              type="email"
                              placeholder="f.ghandi@ghandigroup.com"
                              value={newLeadForm.email}
                              onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                              className="w-full text-left p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none direction-ltr placeholder-slate-400 text-slate-800"
                            />
                          </div>

                          {/* Phone */}
                          <div className="space-y-1">
                            <label className="text-[10.5px] font-black text-slate-700 block">جوال الاتصال للتواصل *</label>
                            <input
                              type="text"
                              required
                              placeholder="+966 54 112 0000"
                              value={newLeadForm.phone}
                              onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                              className="w-full text-left p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none direction-ltr placeholder-slate-400 text-slate-800"
                            />
                          </div>

                          {/* Fleet Size */}
                          <div className="space-y-1">
                            <label className="text-[10.5px] font-black text-slate-700 block">حجم الأسطول المتوقع (معدة وشاحنة)</label>
                            <input
                              type="number"
                              placeholder="25"
                              value={newLeadForm.fleetSize}
                              onChange={(e) => setNewLeadForm({ ...newLeadForm, fleetSize: Number(e.target.value) || 12 })}
                              className="w-full text-right p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none placeholder-slate-400 text-slate-800"
                            />
                          </div>

                          {/* Province */}
                          <div className="space-y-1">
                            <label className="text-[10.5px] font-black text-slate-700 block">المنطقة الجغرافية للفرع</label>
                            <select
                              value={newLeadForm.province}
                              onChange={(e) => setNewLeadForm({ ...newLeadForm, province: e.target.value })}
                              className="w-full text-right p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none text-slate-800"
                            >
                              <option value="المنطقة الشرقية">المنطقة الشرقية (الدمام والجبيل)</option>
                              <option value="المنطقة الوسطى">المنطقة الوسطى (الرياض)</option>
                              <option value="المنطقة الغربية">المنطقة الغربية (جدة ومكة)</option>
                              <option value="المنطقة الشمالية">المنطقة الشمالية (تبوك وحائل)</option>
                              <option value="المنطقة الجنوبية">المنطقة الجنوبية (أبها وجازان)</option>
                            </select>
                          </div>

                        </div>

                        {/* Status Select */}
                        <div className="space-y-1">
                          <label className="text-[10.5px] font-black text-slate-700 block">حالة الصفقة المبدئية</label>
                          <div className="grid grid-cols-3 gap-2 select-none">
                            {[
                              { id: 'new', label: 'جديدة / انتظار', color: 'border-indigo-200 text-indigo-700 bg-indigo-50/30' },
                              { id: 'contacted', label: 'جاري التواصل', color: 'border-amber-200 text-amber-700 bg-amber-50/30' },
                              { id: 'won', label: 'مقبول / تعميد', color: 'border-emerald-200 text-emerald-700 bg-emerald-50/30' }
                            ].map(st => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => setNewLeadForm({ ...newLeadForm, status: st.id as any })}
                                className={`p-2 rounded-xl text-[10px] font-black border text-center transition-all cursor-pointer ${
                                  newLeadForm.status === st.id 
                                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs' 
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {st.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Note area */}
                        <div className="space-y-1">
                          <label className="text-[10.5px] font-black text-slate-700 block">مذكرة وخلفية الصفقة المبيعية</label>
                          <textarea
                            placeholder="تدوين أي مباحثات تمت مع العميل هاتفياً، تفضيلات الصيانة الفنية، المتطلبات الخاصة..."
                            value={newLeadForm.notes}
                            onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                            className="w-full h-16 text-right p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none text-slate-800 placeholder-slate-400"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setShowAddLeadModal(false)}
                            className="p-2 px-4 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="p-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer shadow-xs"
                          >
                            حفظ وتسجيل الصفقة
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* -------------------- MODAL / DRAWER: SUBSCRIBER DETAILED FOLLOW-UP HUB & LIVE PROVISIONING -------------------- */}
              <AnimatePresence>
                {selectedLeadForDetail && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 30 }}
                      className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl text-right font-sans flex flex-col max-h-[85vh]"
                    >
                      {/* Header */}
                      <div className="p-4 px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 select-none">
                        <button
                          type="button"
                          onClick={() => { setSelectedLeadForDetail(null); setProvisionSuccessInfo(null); }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          ✕ إغلاق الملف
                        </button>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900">
                            ملف متابعة العميل: <span className="text-indigo-600 font-extrabold">{selectedLeadForDetail.company}</span>
                          </h4>
                          <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                            <Briefcase size={13} />
                          </span>
                        </div>
                      </div>

                      {/* Split Panel Body */}
                      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/50">
                        
                        {/* LEFT COLUMN: Comm Activity Logs & Add FollowUp Note (5 Cols) */}
                        <div className="md:col-span-5 flex flex-col gap-4">
                          
                          {/* Log Follow-up Form */}
                          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3">
                            <h5 className="text-[11px] font-black text-slate-900 flex items-center justify-end gap-1.5">
                              <span>تسجيل مكالمة أو إجراء متابعة فنية</span>
                              <PenTool size={11} className="text-indigo-600" />
                            </h5>
                            
                            <div className="space-y-2.5 text-right">
                              {/* Log Type presets */}
                              <div className="flex gap-1.5 justify-end text-[10px] select-none">
                                {[
                                  { type: 'call', label: 'اتصال هاتف', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' },
                                  { type: 'email', label: 'بريد إلكتروني', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
                                  { type: 'meeting', label: 'اجتماع عمل', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200' },
                                  { type: 'offer', label: 'تقديم عرض مالي', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200' }
                                ].map(p => (
                                  <button
                                    key={p.type}
                                    type="button"
                                    onClick={() => setNewLogType(p.type as any)}
                                    className={`p-1 px-2 rounded-lg border text-[9.5px] font-bold cursor-pointer transition-all ${
                                      newLogType === p.type 
                                        ? 'bg-slate-900 text-white font-black scale-105 border-transparent shadow-xs' 
                                        : `${p.color} border`
                                    }`}
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>

                              <textarea
                                placeholder="اكتب في نقاط موضوع تواصلك: العميل مهتم بباقة الورش، يود اجتماع في فرعه بالجبيل، لديه ٣٠ شاحنة بحاجة لفحص..."
                                value={newLogNote}
                                onChange={(e) => setNewLogNote(e.target.value)}
                                className="w-full h-16 text-right p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none text-slate-800 placeholder-slate-400 focus:border-indigo-500 transition-colors"
                              />

                              <button
                                type="button"
                                onClick={() => addCommunicationLog(selectedLeadForDetail.id)}
                                className="w-full p-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10.5px] rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <Save size={12} />
                                <span>إضافة تقرير المتابعة الحالية</span>
                              </button>
                            </div>
                          </div>

                          {/* Chronological Communication Timeline logs */}
                          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex-1 flex flex-col min-h-[160px]">
                            <h5 className="text-[11px] font-black text-slate-900 block mb-3">{language === 'ar' ? 'سجل المباحثات والبيانات والـ Logs:' : 'CRM Touch Timeline:'}</h5>
                            
                            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[220px]">
                              {(!selectedLeadForDetail.communicationLogs || selectedLeadForDetail.communicationLogs.length === 0) ? (
                                <p className="text-[10px] text-slate-400 text-center py-8">{language === 'ar' ? 'لم يسجل لهذا العميل جهات متابعة حتى الآن.' : 'No communication logs logged.'}</p>
                              ) : (
                                (selectedLeadForDetail.communicationLogs as any[]).map((log, idx) => (
                                  <div key={log.id || idx} className="flex gap-2.5 items-start text-xs border-r-2 border-slate-200 pr-2.5 pt-0.5 relative">
                                    {/* bullet icon depending on log type */}
                                    <div className="p-1 rounded-md bg-slate-100 shrink-0 border border-slate-200">
                                      {log.type === 'call' && <Phone size={10} className="text-amber-600" />}
                                      {log.type === 'email' && <Mail size={10} className="text-blue-600" />}
                                      {log.type === 'meeting' && <Users size={10} className="text-indigo-600" />}
                                      {log.type === 'offer' && <Award size={10} className="text-emerald-600" />}
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[9.5px] font-bold text-slate-400">{log.date}</span>
                                        <span className="p-0.5 px-1.5 rounded-md bg-slate-100 font-mono text-[8.5px] text-slate-600 border border-slate-200">{log.agent || 'سيستم'}</span>
                                      </div>
                                      <p className="text-[10.5px] text-slate-700 leading-normal font-medium">{log.note}</p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                        </div>

                        {/* RIGHT COLUMN: Business context profile & SaaS Cloud Provisioning (7 Cols) */}
                        <div className="md:col-span-7 flex flex-col gap-4">
                          
                          {/* Client Profile Card */}
                          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3.5">
                            <h5 className="text-[11px] font-black text-slate-900 border-b border-slate-100 pb-2">{language === 'ar' ? 'البطاقة الفنية للشركة' : 'Business Card Context'}</h5>
                            
                            <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-xs leading-normal">
                              <div>
                                <span className="text-[9.5px] text-slate-400 block font-bold">اسم العميل والمسؤول</span>
                                <span className="text-[11px] font-black text-slate-900">{selectedLeadForDetail.name}</span>
                              </div>
                              <div>
                                <span className="text-[9.5px] text-slate-400 block font-bold">الجهة / المؤسسة</span>
                                <span className="text-[11px] font-black text-slate-900">{selectedLeadForDetail.company}</span>
                              </div>
                              <div>
                                <span className="text-[9.5px] text-slate-400 block font-bold mb-0.5">البريد الإلكتروني للاتصال</span>
                                <span className="text-[11px] font-mono text-slate-700 select-all font-semibold">{selectedLeadForDetail.email}</span>
                              </div>
                              <div>
                                <span className="text-[9.5px] text-slate-400 block font-bold mb-0.5">جوال التواصل الفني</span>
                                <span className="text-[11px] font-mono text-slate-700 select-all font-semibold">{selectedLeadForDetail.phone}</span>
                              </div>
                              <div>
                                <span className="text-[9.5px] text-slate-400 block font-bold">الأسطول التقديري للمقارنة</span>
                                <span className="text-[11px] font-black text-indigo-600 font-mono">{selectedLeadForDetail.fleetSize} شاحنة ومعدة</span>
                              </div>
                              <div>
                                <span className="text-[9.5px] text-slate-400 block font-bold">موقع المقر</span>
                                <span className="text-[11px] font-bold text-slate-700">{selectedLeadForDetail.province}، {selectedLeadForDetail.country}</span>
                              </div>
                            </div>
                          </div>

                          {/* Interactive SaaS Provisioning Engine panel */}
                          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-800 text-white rounded-2xl p-5 shadow-md space-y-4 relative overflow-hidden flex-1 flex flex-col justify-between">
                            
                            {/* Abstract glowing background layout */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full filter blur-[50px] opacity-20 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full filter blur-[50px] opacity-20 pointer-events-none" />

                            <div className="space-y-1.5 z-10 text-right">
                              <h5 className="text-xs font-black text-white flex items-center justify-end gap-1.5 leading-none">
                                <span>محرك تفعيل وتدشين اشتراكات الـ SaaS</span>
                                <Zap size={13} className="text-amber-400" />
                              </h5>
                              <p className="text-[9.5px] text-indigo-200 leading-relaxed">
                                {language === 'ar' 
                                  ? 'صلاحيات هذا المحرك تحكم إطلاق النظام الإلكتروني للعميل بشكل فوري. عند الضغط على زر التفعيل السحابي، يتم تمثيل تشغيل قاعدة بيانات ومستودعات عجلات الأسطول وحجز الموارد ومساحة الإذن السحابية المخصصة لأوامر العمل.'
                                  : 'Provision isolated tenant environment with localized maintenance tables, mechanic credentials, and custom metrics.'}
                              </p>
                            </div>

                            {/* Provision form setup */}
                            <div className="space-y-3 z-10 font-sans">
                              {/* If already has provisioned specs, show database credentials */}
                              {selectedLeadForDetail.provisionedDetails ? (
                                <div className="p-3 bg-slate-950/80 rounded-xl border border-indigo-400/20 space-y-2 font-mono text-[9.5px]">
                                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-right font-sans mb-1.5">
                                    <span className="p-0.5 px-2 bg-emerald-500/20 text-emerald-300 text-[8px] rounded-md font-extrabold border border-emerald-500/30">✓ ACTIVE</span>
                                    <span className="text-slate-300 font-extrabold">{language === 'ar' ? 'تفاصيل ترخيص المنصة:' : 'Provisioned SaaS Specs:'}</span>
                                  </div>
                                  <div className="flex justify-between gap-1 select-all hover:text-white transition-colors direction-ltr">
                                    <span className="text-emerald-400">{selectedLeadForDetail.provisionedDetails.assignedSubdomain}</span>
                                    <span className="text-slate-400">SUBDOMAIN:</span>
                                  </div>
                                  <div className="flex justify-between gap-1 select-all hover:text-white transition-colors direction-ltr">
                                    <span className="text-slate-300">{selectedLeadForDetail.provisionedDetails.apiToken}</span>
                                    <span className="text-slate-400">LICENSE_API:</span>
                                  </div>
                                  <div className="flex justify-between gap-1 select-all hover:text-white transition-colors direction-ltr">
                                    <span className="text-indigo-400">{selectedLeadForDetail.provisionedDetails.databaseSchema}</span>
                                    <span className="text-slate-400">TENANT_DB:</span>
                                  </div>
                                  <div className="flex justify-between gap-1 select-all hover:text-white transition-colors direction-ltr">
                                    <span className="text-white font-extrabold">{selectedLeadForDetail.provisionedDetails.subscriptionExpires}</span>
                                    <span className="text-slate-400">EXPIRES_AT:</span>
                                  </div>
                                  <div className="pt-2 text-[9px] text-slate-300 text-right font-sans border-t border-slate-800/60 leading-normal">
                                    {language === 'ar' 
                                      ? 'تم إرسال بريد التثبيت التلقائي للعميل ورابط الدخول الخاص بفنيي الورش.'
                                      : 'Onboarding complete. Setup mail generated and dispatched through secure server SMTP.'}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2.5">
                                  {/* Select package preset */}
                                  <div className="grid grid-cols-2 gap-2 text-right">
                                    <div className="space-y-0.5">
                                      <label className="text-[9px] font-bold text-slate-300 block">باقة الاشتراك</label>
                                      <select
                                        id="provision-package-type"
                                        className="w-full text-right p-1.5 bg-indigo-950/90 border border-indigo-700/60 rounded-lg text-[10px] text-white outline-none cursor-pointer"
                                      >
                                        <option value="pro">Pro Fleet Admin (٢٥ ريال/مركبة)</option>
                                        <option value="enterprise">Corporate Enterprise (٥٠ ريال/مركبة)</option>
                                        <option value="basic">Basic S1-Lite (١٥ ريال/مركبة)</option>
                                      </select>
                                    </div>
                                    <div className="space-y-0.5">
                                      <label className="text-[9px] font-bold text-slate-300 block">فترة الترخيص الأولي</label>
                                      <select
                                        id="provision-license-months"
                                        className="w-full text-right p-1.5 bg-indigo-950/90 border border-indigo-700/60 rounded-lg text-[10px] text-white outline-none cursor-pointer"
                                      >
                                        <option value="12">١٢ شهراً (سنة اشتراك مقدم)</option>
                                        <option value="24">٢٤ شهراً (سنتين)</option>
                                        <option value="6">٦ أشهر (باقة تجريبية قياسية)</option>
                                      </select>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={isProvisioning || selectedLeadForDetail.status === 'lost'}
                                    onClick={() => {
                                      const pEl = document.getElementById('provision-package-type') as HTMLSelectElement;
                                      const mEl = document.getElementById('provision-license-months') as HTMLSelectElement;
                                      const pVal = pEl ? pEl.value : 'pro';
                                      const mVal = mEl ? Number(mEl.value) : 12;
                                      simulateOnboardingProspect(selectedLeadForDetail, pVal, mVal);
                                    }}
                                    className="w-full p-2.5 bg-white hover:bg-slate-100 text-indigo-950 disabled:opacity-50 font-black text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md z-10"
                                  >
                                    {isProvisioning ? (
                                      <>
                                        <span className="w-3.5 h-3.5 border-2 border-indigo-950 border-t-transparent rounded-full animate-spin" />
                                        <span>جاري فحص الموارد السحابية وبث الترخيص...</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck size={14} className="text-indigo-950" />
                                        <span>تعميد عقد العميل وتفعيل المنصة السحابية</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>

                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </div>
          )}

        {/* TAB EXTRA: COMPREHENSIVE AI SECURITY & AUTOMATONS REPOSITORY */}
        {activeSubTab === 'robots' && (
          <div className="space-y-6 animate-fade-in text-right">
            
            {/* Header Description block */}
            <div className="bg-[#0B132B] text-slate-100 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${brandPrimaryColor}08` }} />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${brandPrimaryColor}08` }} />
              
              <div className="space-y-1.5 text-center md:text-right relative z-10 w-full md:w-auto">
                <span className="p-1 px-2.5 rounded-lg text-[9px] font-black border inline-block" style={{ backgroundColor: `${brandPrimaryColor}15`, borderColor: `${brandPrimaryColor}25`, color: brandPrimaryColor }}>
                  {language === 'ar' ? 'مستودع الأتمتة الكلي للـ SaaS' : 'SaaS Automation Autonomous Hub'}
                </span>
                <h4 className="text-base font-black text-white mt-1.5">
                  {language === 'ar' ? 'مستودع ومكتبة روبوتات المبيعات وإسناد المهام الذكي' : 'Smart Autonomous AI Agents & Automatons Repository'}
                </h4>
                <p className="text-[11px] text-slate-400 max-w-2xl leading-relaxed">
                  {language === 'ar' 
                    ? 'رأس الحكمة لإدارة ساس FleetAurvexis التلقائي: معالجات ذكية كمدير مشروع محترف تعمل خلف كواليس السيرفر. تقوم بتقليل التدخل البشري والرد الفوري وتوزيع المهام بدقة ١٠٠٪.'
                    : 'A premium suite of background AI micro-agents working on schedules or events. They streamline client follow-ups, handle transactional analysis, dispatch workload checklists, and respond to incoming support queues autonomously.'}
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => setShowAddRobotModal(true)}
                className="w-full md:w-auto p-3.5 px-6 text-white font-black text-xs rounded-2xl cursor-pointer transition-all shrink-0 flex items-center justify-center gap-2"
                style={{ backgroundColor: brandPrimaryColor, boxShadow: `0 10px 15px -3px ${brandPrimaryColor}30` }}
              >
                <Plus size={14} />
                <span>{language === 'ar' ? 'تصميم وإدراج روبوت ذكي جديد' : 'Configure New Robo Agent'}</span>
              </button>
            </div>

            {/* MAIN ROBOTICS INTEGRATED PANEL GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
              
              {/* LEFT NAVIGATION COLUMN: ROBOTS CATALOG (4 cols) */}
              <div className="lg:col-span-4 space-y-3.5">
                <div className="bg-white border border-slate-200 p-4.5 rounded-3xl space-y-3 text-right shadow-xs">
                  <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 justify-end">
                    <span>{language === 'ar' ? 'كتالوج معالجات الأوتوماتون' : 'Active Micro-Bots'}</span>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandPrimaryColor }} />
                  </h3>
                  
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {aiRobots.map((bot, idx) => {
                      const isSelected = selectedRobotId === bot.id;
                      let botIcon = <Users size={15} />;
                      if (bot.icon === 'dollar') botIcon = <DollarSign size={15} />;
                      if (bot.icon === 'briefcase') botIcon = <Briefcase size={15} />;
                      if (bot.icon === 'message') botIcon = <MessageSquare size={15} />;
                      if (bot.icon === 'zap') botIcon = <Zap size={15} />;
                      if (bot.icon === 'shield') botIcon = <ShieldCheck size={15} />;
                      if (bot.icon === 'activity') botIcon = <Activity size={15} />;
                      if (bot.icon === 'database') botIcon = <Database size={15} />;

                      return (
                        <div
                          key={bot?.id || `robot-${idx}`}
                          className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-right relative group ${
                            isSelected 
                              ? 'bg-slate-50 border-indigo-500 shadow-xs' 
                              : 'bg-white border-slate-200 hover:bg-slate-50/80'
                          }`}
                          style={isSelected ? { borderColor: brandPrimaryColor } : {}}
                          onClick={() => setSelectedRobotId(bot.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            {/* Toggle & Delete */}
                            <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleToggleRobotActive(bot.id)}
                                className={`text-[9px] font-black p-1 px-2.5 rounded-lg border transition-all cursor-pointer ${
                                  bot.isActive 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}
                              >
                                {bot.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Paused')}
                              </button>
                              
                              {!['leads-auto', 'sales-analyst', 'team-dispatcher', 'support-responder'].includes(bot.id) && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRobot(bot.id)}
                                  className="p-1 px-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>

                            {/* Bot Details */}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end">
                              <div className="text-right flex-1 min-w-0">
                                <h4 className="text-[11px] font-black text-slate-900 truncate" style={isSelected ? { color: brandPrimaryColor } : {}}>
                                  {language === 'ar' ? bot.name : bot.nameEn}
                                </h4>
                                <span className="text-[9px] font-bold block mt-0.5 truncate uppercase" style={{ color: brandPrimaryColor }}>
                                  {language === 'ar' ? bot.triggerEventAr : bot.triggerEvent}
                                </span>
                              </div>
                              <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                                bot.isActive 
                                  ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                                  : 'bg-slate-100 text-slate-400 border-slate-200'
                              }`}
                              style={bot.isActive ? { backgroundColor: `${brandPrimaryColor}10`, color: brandPrimaryColor, borderColor: `${brandPrimaryColor}20` } : {}}
                              >
                                {botIcon}
                              </span>
                            </div>
                          </div>
                          
                          {/* Live pulse indicator glow */}
                          {bot.isActive && (
                            <span className="absolute bottom-2.5 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Automation Quick Overview Card */}
                <div className="bg-white border border-slate-200 p-5 rounded-3xl text-right space-y-4 shadow-xs">
                  <h4 className="text-xs font-black text-slate-800">{language === 'ar' ? 'مؤشرات الأداء الكلية للمستودع' : 'Autonomous Performance Indicators'}</h4>
                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
                      <span className="text-[8px] text-slate-500 font-extrabold block mb-1">{language === 'ar' ? 'إجمالي جولات الفحص' : 'Global Robo Runs'}</span>
                      <strong className="text-base text-amber-600 font-extrabold block">
                        {aiRobots.reduce((acc, b) => acc + b.stats.scansCount, 0)}
                      </strong>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
                      <span className="text-[8px] text-slate-500 font-extrabold block mb-1">{language === 'ar' ? 'قرارات واجراءات مؤتمتة' : 'Decisions Triggered'}</span>
                      <strong className="text-base text-emerald-600 font-extrabold block">
                        {aiRobots.reduce((acc, b) => acc + b.stats.actionsTaken, 0)}
                      </strong>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-right">
                    <span className="text-[10px] text-slate-600 font-bold">{language === 'ar' ? 'معدل دقة الأتمتة الإجمالي' : 'Global Precision'}</span>
                    <strong className="text-xs font-extrabold font-mono" style={{ color: brandPrimaryColor }}>97.4%</strong>
                  </div>
                </div>
              </div>

              {/* RIGHT WORKBENCH COLUMN: WORK BENCH / TERMINAL LOGS / EMULATOR (8 cols) */}
              <div className="lg:col-span-8">
                {(() => {
                  const bot = aiRobots.find(b => b.id === selectedRobotId);
                  if (!bot) return null;

                  let botIcon = <Users size={16} />;
                  if (bot.icon === 'dollar') botIcon = <DollarSign size={16} />;
                  if (bot.icon === 'briefcase') botIcon = <Briefcase size={16} />;
                  if (bot.icon === 'message') botIcon = <MessageSquare size={16} />;
                  if (bot.icon === 'zap') botIcon = <Zap size={16} />;
                  if (bot.icon === 'shield') botIcon = <ShieldCheck size={16} />;
                  if (bot.icon === 'activity') botIcon = <Activity size={16} />;
                  if (bot.icon === 'database') botIcon = <Database size={16} />;

                  return (
                    <div className="space-y-6">
                      {/* Robo Focus Details Workbench */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-5 text-right">
                        {/* Upper Section */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                            <div className="text-right">
                              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 justify-end">
                                <span>{language === 'ar' ? bot.name : bot.nameEn}</span>
                                <span className={`w-2 h-2 rounded-full ${bot.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                              </h3>
                              <span className="text-[10px] font-bold block mt-0.5" style={{ color: brandPrimaryColor }}>
                                {language === 'ar' ? `الحدث المثير: ${bot.triggerEventAr}` : `Trigger: ${bot.triggerEvent}`}
                              </span>
                            </div>
                            <span className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border" style={{ backgroundColor: `${brandPrimaryColor}10`, color: brandPrimaryColor, borderColor: `${brandPrimaryColor}20` }}>
                              {botIcon}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                            <button
                              type="button"
                              onClick={() => handleToggleRobotActive(bot.id)}
                              className={`p-2 px-3.5 text-xs font-black rounded-xl cursor-pointer transition-all border ${
                                bot.isActive 
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' 
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {bot.isActive ? (language === 'ar' ? 'إيقاف مؤقت' : 'Pause Agent') : (language === 'ar' ? 'تفعيل الروبوت' : 'Resume Agent')}
                            </button>
                            
                            <button
                              type="button"
                              disabled={robotSimStatus.status !== 'idle'}
                              onClick={() => handleSimulateRobotExecution(bot.id)}
                              className={`p-2 px-4 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                                robotSimStatus.status !== 'idle' 
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                                  : 'text-white shadow-xs hover:-translate-y-0.5'
                              }`}
                              style={robotSimStatus.status === 'idle' ? { backgroundColor: brandPrimaryColor, boxShadow: `0 4px 6px -1px ${brandPrimaryColor}20` } : {}}
                            >
                              <Zap size={11} className={robotSimStatus.robotId === bot.id ? 'animate-bounce' : ''} />
                              <span>{language === 'ar' ? 'فحص يدوي فوري' : 'Trigger Manual Loop'}</span>
                            </button>
                          </div>
                        </div>

                         {/* Description */}
                        <div>
                          <h4 className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">{language === 'ar' ? 'هدف ورسالة الروبوت الفنية' : 'Mission & Role Objective'}</h4>
                          <p className="text-[12px] text-slate-700 leading-relaxed font-semibold font-sans">
                            {language === 'ar' ? bot.description : bot.descriptionEn}
                          </p>
                        </div>

                        {/* Special Custom Interactive Dashboard for System Integrity Agent */}
                        {bot.id === 'system-integrity' && (
                          <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-2xl text-right space-y-4 shadow-md font-sans text-white">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                              <div className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-400">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                                <span>100% ONLINE</span>
                              </div>
                              <h4 className="text-xs font-black text-white flex items-center gap-2">
                                <Cpu size={14} className="text-indigo-400" />
                                <span>{language === 'ar' ? 'فاحص ومحلل التماسك وصيانة منافذ النظام الذكي' : 'Live System Connectivity & Integrity Analyzer'}</span>
                              </h4>
                            </div>

                            <p className="text-[10px] text-slate-300 leading-relaxed max-w-xl">
                              {language === 'ar'
                                ? 'يقوم الوكيل الذكي بإنقاذ الكاش، فحص ريجسترات التخزين المحلي، واختبار الإتصال السحابي المباشر بقواعد بيانات Firestore وقياس زمن استجابة المنافذ الرقمية تذكرة الدعم والاتصال.'
                                : 'Perform dynamic diagnostics on cloud tables, API endpoints, and clean local memory blocks.'}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                              {/* Remote AI Authorization Checkbox */}
                              <label className="flex items-center gap-2.5 cursor-pointer select-none bg-slate-800/80 border border-slate-700 hover:border-indigo-400 p-2.5 rounded-xl transition-all w-full sm:w-auto text-right">
                                <input 
                                  type="checkbox"
                                  checked={isRemoteAuthAuthorized}
                                  onChange={handleToggleRemoteAuth}
                                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-0 cursor-pointer shrink-0 accent-indigo-600"
                                />
                                <div className="text-right">
                                  <span className="text-[10.5px] font-black text-white block">
                                    {language === 'ar' ? 'تفويض الصيانة الذكية عن بُعد' : 'Remote Maintenance Authorization'}
                                  </span>
                                  <span className="text-[8.5px] text-slate-400 block mt-0.5">
                                    {isRemoteAuthAuthorized 
                                      ? (language === 'ar' ? '✓ تم تفويض الروبوت بالتدخل التلقائي' : '✓ Full active cloud permissions granted')
                                      : (language === 'ar' ? 'قم بتنشيط رخصة الصيانة التلقائية السيرفرية' : 'Grant agent permissions to patch cloud databases')}
                                  </span>
                                </div>
                              </label>

                              {/* Manual Trigger Button */}
                              <button
                                type="button"
                                disabled={robotSimStatus.status !== 'idle'}
                                onClick={() => handleSimulateRobotExecution('system-integrity')}
                                className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-black cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 border ${
                                  robotSimStatus.status !== 'idle'
                                    ? 'bg-slate-800 text-slate-500 border-transparent cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white hover:scale-[1.015]'
                                }`}
                              >
                                <span>⚡ {language === 'ar' ? 'تشغيل فحص وصيانة النظام فورا' : 'Trigger Active System Audit'}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Config Tab & Performance stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-right">
                            <span className="text-[8px] text-slate-400 block font-extrabold leading-none mb-1">{language === 'ar' ? 'عدد جولات الفحص' : 'Scans'}</span>
                            <span className="text-sm font-black text-slate-800 font-mono leading-none">{bot.stats.scansCount}</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-right">
                            <span className="text-[8px] text-slate-400 block font-extrabold leading-none mb-1">{language === 'ar' ? 'الإجراءات المؤتمتة الصادرة' : 'Actions Dispatched'}</span>
                            <span className="text-sm font-black font-mono leading-none" style={{ color: brandPrimaryColor }}>{bot.stats.actionsTaken}</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-right">
                            <span className="text-[8px] text-slate-400 block font-extrabold leading-none mb-1">{language === 'ar' ? 'مؤشر كفاءة القرار' : 'Success Rate'}</span>
                            <span className="text-sm font-black text-emerald-600 font-mono leading-none">{bot.stats.efficiencyRating}</span>
                          </div>
                        </div>

                        {/* System Prompt Instructions Editor */}
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase font-mono" style={{ color: brandPrimaryColor }}>system_instructions (prompt)</span>
                            <span className="text-[9px] text-slate-400 font-bold">{language === 'ar' ? 'تعديل السلوك العام للذكاء الاصطناعي' : 'Customize Model Prompt'}</span>
                          </div>
                          <div className="relative">
                            <textarea
                              rows={3}
                              defaultValue={bot.prompt}
                              onBlur={e => handleUpdateRobotPrompt(bot.id, e.target.value)}
                              className="w-full bg-slate-50 focus:bg-white text-xs font-sans border border-slate-200 rounded-2xl p-3 text-right focus:outline-none focus:border-indigo-500 leading-relaxed text-slate-800 placeholder-slate-400 transition-colors"
                              placeholder={language === 'ar' ? 'اكتب تعليمات السلوك والهدف لهذا الروبوت البرمجى...' : 'Set the model directive...'}
                            />
                            <div className="absolute bottom-2.5 left-2.5">
                              <span className="p-1 px-2 bg-slate-200 text-slate-600 rounded text-[8px] font-black uppercase tracking-wider leading-none pointer-events-none">
                                {language === 'ar' ? 'يتم الحفظ تلقائياً' : 'Auto Saved'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* SIMULATION VISUAL FEEDBACK BAR */}
                        {robotSimStatus.status !== 'idle' && robotSimStatus.robotId === bot.id && (
                          <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 text-right space-y-3 animate-pulse">
                            <div className="flex items-center justify-between text-xs font-extrabold">
                              <span className="font-mono" style={{ color: brandPrimaryColor }}>{robotSimStatus.progress}%</span>
                              <span className="text-slate-800 flex items-center gap-2">
                                <RefreshCw size={11.5} className="animate-spin" style={{ color: brandPrimaryColor }} />
                                <span>{robotSimStatus.message}</span>
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-300"
                                style={{ width: `${robotSimStatus.progress}%`, backgroundColor: brandPrimaryColor }}
                              />
                            </div>
                          </div>
                        )}

                        {/* LIVE TERMINAL PRINT LOGS CONSOLE */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleClearRobotLogs(bot.id)}
                                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9.5px] font-black rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              >
                                {language === 'ar' ? 'مسح سجل المخرجات' : 'Clear Terminal'}
                              </button>
                            </div>
                            <h4 className="text-[10.5px] font-black text-slate-500 tracking-wider flex items-center gap-1.5 justify-end">
                              <span>{language === 'ar' ? 'شاشة الرصد والتقارير الحية (Terminal)' : 'Live Agent Output Monitor'}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            </h4>
                          </div>

                          <div className="bg-slate-950 text-slate-300 font-mono text-[10.5px] p-4 rounded-2xl border border-slate-800 h-[220px] overflow-y-auto space-y-2 px-4.5 text-right select-text shadow-inner" style={{ direction: 'rtl' }}>
                            {bot.logs && bot.logs.length > 0 ? (
                              bot.logs.map((logLine, idx) => {
                                let logColor = 'text-slate-300';
                                if (logLine.includes('[نظام]')) logColor = 'text-indigo-400';
                                if (logLine.includes('[فحص]')) logColor = 'text-amber-400';
                                if (logLine.includes('[تحديث]')) logColor = 'text-blue-400';
                                if (logLine.includes('[تم]') || logLine.includes('[تأكيد]')) logColor = 'text-emerald-400 font-bold';
                                if (logLine.includes('[أتمتة]') || logLine.includes('[صيانة]')) logColor = 'text-purple-400 font-medium';
                                if (logLine.includes('[تواصل]')) logColor = 'text-sky-400';
                                if (logLine.includes('[تفتيش]')) logColor = 'text-yellow-400';
                                if (logLine.includes('[تخزين]')) logColor = 'text-cyan-400';
                                if (logLine.includes('[أمن]')) logColor = 'text-rose-400 font-semibold';
                                if (logLine.includes('[مالي]')) logColor = 'text-emerald-400 font-black';
                                if (logLine.includes('[ذكاء]')) logColor = 'text-fuchsia-400';
                                if (logLine.includes('[توقع]')) logColor = 'text-indigo-400';
                                if (logLine.includes('[توجيه]')) logColor = 'text-orange-400';
                                if (logLine.includes('[استقبال]')) logColor = 'text-cyan-400';
                                if (logLine.includes('[تأسيس]')) logColor = 'text-purple-400';

                                return (
                                  <div key={idx} className={`leading-relaxed tracking-wide ${logColor}`}>
                                    {logLine}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center text-slate-500 py-12 font-sans text-xs">
                                Ready to stream micro-bot signals.
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* -------------------- MODAL: CREATE CUSTOM SMART ROBOT AGENT -------------------- */}
            <AnimatePresence>
              {showAddRobotModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-right font-sans"
                  >
                    <div className="p-4 px-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowAddRobotModal(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      >
                        ✕
                      </button>
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>{language === 'ar' ? 'تصميم وإدراج روبوت ذكي جديد فى السحابة' : 'Configure New AI Robo Agent'}</span>
                        <Sparkles size={14} className="animate-spin duration-5000" style={{ color: brandPrimaryColor }} />
                      </h4>
                    </div>

                    <form onSubmit={handleCreateNewRobot} className="p-6 space-y-4">
                      <div className="space-y-3 text-right">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {/* Name Ar */}
                          <div className="space-y-1">
                            <label className="text-[10.5px] font-black text-slate-700 block">{language === 'ar' ? 'اسم الروبوت (بالعربية) *' : 'Agent Name (Arabic) *'}</label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: بوت تهنئة الأعياد والمناسبات"
                              value={newRobotForm.name}
                              onChange={(e) => setNewRobotForm({ ...newRobotForm, name: e.target.value })}
                              className="w-full text-right p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none placeholder-slate-400 text-slate-800 transition-colors"
                            />
                          </div>

                          {/* Name En */}
                          <div className="space-y-1">
                            <label className="text-[10.5px] font-black text-slate-700 block">{language === 'ar' ? 'اسم الروبوت (بالإنجليزية)' : 'Agent Name (English)'}</label>
                            <input
                              type="text"
                              placeholder="e.g. Holidays Congratulator"
                              value={newRobotForm.nameEn}
                              onChange={(e) => setNewRobotForm({ ...newRobotForm, nameEn: e.target.value })}
                              className="w-full text-left p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none placeholder-slate-400 text-slate-800 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Description Ar */}
                        <div className="space-y-1">
                          <label className="text-[10.5px] font-black text-slate-700 block">{language === 'ar' ? 'الوصف ووظيفة الأوتوماتون (بالعربية) *' : 'Agent Objective (Arabic) *'}</label>
                          <textarea
                            rows={2}
                            required
                            placeholder="اشرح باختصار ووضوح: ماذا يفعل الروبوت ومتى يتدخل..."
                            value={newRobotForm.description}
                            onChange={(e) => setNewRobotForm({ ...newRobotForm, description: e.target.value })}
                            className="w-full text-right p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none placeholder-slate-400 text-slate-800 transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-right">
                          {/* Trigger event */}
                          <div className="space-y-1">
                            <label className="text-[10.5px] font-black text-slate-700 block">{language === 'ar' ? 'الحدث المحفز (Trigger - بالعربية) *' : 'Trigger Event (Arabic) *'}</label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: عند إضافة مراجعة جديدة"
                              value={newRobotForm.triggerEventAr}
                              onChange={(e) => setNewRobotForm({ ...newRobotForm, triggerEventAr: e.target.value })}
                              className="w-full text-right p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none placeholder-slate-400 text-slate-800 transition-colors"
                            />
                          </div>

                          {/* Trigger event En */}
                          <div className="space-y-1">
                            <label className="text-[10.5px] font-black text-slate-700 block">{language === 'ar' ? 'الحدث المحفز (بالإنجليزية)' : 'Trigger Event (English)'}</label>
                            <input
                              type="text"
                              placeholder="e.g. On New Review Submitted"
                              value={newRobotForm.triggerEvent}
                              onChange={(e) => setNewRobotForm({ ...newRobotForm, triggerEvent: e.target.value })}
                              className="w-full text-left p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none placeholder-slate-400 text-slate-800 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Icon Selection */}
                        <div className="space-y-1">
                          <label className="text-[10.5px] font-black text-slate-700 block">{language === 'ar' ? 'رمز / أيقونة الروبوت' : 'Select Representative Icon'}</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { id: 'users', label: language === 'ar' ? 'مستخدمين' : 'Users' },
                              { id: 'dollar', label: language === 'ar' ? 'مبيعات' : 'Sales' },
                              { id: 'briefcase', label: language === 'ar' ? 'مهام' : 'Tasks' },
                              { id: 'zap', label: language === 'ar' ? 'طاقة/فحص' : 'Intelli' },
                              { id: 'shield', label: language === 'ar' ? 'صيانة/أمن' : 'Shield' },
                              { id: 'activity', label: language === 'ar' ? 'نبض/نشاط' : 'Activity' },
                              { id: 'database', label: language === 'ar' ? 'داتا' : 'Data' }
                            ].map(ic => (
                              <button
                                type="button"
                                key={ic.id}
                                onClick={() => setNewRobotForm({ ...newRobotForm, icon: ic.id })}
                                className={`p-2.5 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                                  newRobotForm.icon === ic.id 
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                                style={newRobotForm.icon === ic.id ? { backgroundColor: `${brandPrimaryColor}10`, borderColor: brandPrimaryColor, color: brandPrimaryColor } : {}}
                              >
                                {ic.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Prompt instructions */}
                        <div className="space-y-1">
                          <label className="text-[10.5px] font-black text-slate-700 block">{language === 'ar' ? 'موجه وتعليمات الذكاء الاصطناعي (Prompt Guide) *' : 'AI Agent Prompt Instructions *'}</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="مثال: أنت وكيل مخصص لتحديد مناسبات العملاء وإرسال كروت خصم 10% لخدمات صيانة ميكانيك وسوائل الورش..."
                            value={newRobotForm.prompt}
                            onChange={(e) => setNewRobotForm({ ...newRobotForm, prompt: e.target.value })}
                            className="w-full text-right p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none placeholder-slate-400 text-slate-800 leading-relaxed font-sans transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 text-right">
                        <button
                          type="button"
                          onClick={() => setShowAddRobotModal(false)}
                          className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl border border-slate-200 cursor-pointer transition-colors"
                        >
                          {language === 'ar' ? 'إلغاء الأمر' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 text-white text-xs font-black rounded-xl cursor-pointer shadow-xs"
                          style={{ backgroundColor: brandPrimaryColor }}
                        >
                          {language === 'ar' ? 'إدراج وتفعيل الروبوت' : 'Deploy Robo Agent'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* TAB EXTRA: COMPREHENSIVE SAAS ENTERPRISE LAUNCH PLANNER (PM MASTER ROADMAP) */}
        {activeSubTab === 'launch-planner' && (
          <div className="space-y-6 text-right">
            
            {/* PM ROADMAP HEADER & PROGRESS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 font-sans">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1.5 text-center md:text-right">
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 p-1 px-3 text-[10px] font-black rounded-lg border border-amber-200">
                    <Award size={12} />
                    <span>{language === 'ar' ? 'منهجية إدارة الأساطيل والـ SaaS الدولية' : 'SaaS Launch Methodology'}</span>
                  </div>
                  <h3 className="text-[17px] font-black text-slate-900">
                    {language === 'ar' ? 'خريطة طريق ودليل إطلاق مشروع SaaS المتكامل للشركات' : 'Enterprise SaaS Launch Master Roadmap'}
                  </h3>
                  <p className="text-[11px] text-slate-500 max-w-2xl leading-relaxed">
                    {language === 'ar'
                      ? 'مرحباً بك حضرة مدير المشروع المحترف. إليك التخطيط الاستراتيجي المتكامل خطوة بخطوة لتهيئة وإطلاق نظام الـ SaaS للعملاء والشركات. قم بمتابعة وإثبات إنجاز كل مرحلة لتطبيق الانطلاق الفعلي بثقة.'
                      : 'Step-by-step master plan to initialize, secure, white-label, and scale your fleet management SaaS platform to corporate clients.'}
                  </p>
                </div>

                {/* Progress Circle/Pill */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center min-w-[150px]">
                  <span className="text-[9px] text-slate-500 font-bold block mb-1">{language === 'ar' ? 'معدل جاهزية الإطلاق العام' : 'Launch Readiness Rate'}</span>
                  <div className="text-2xl font-black text-indigo-600 font-mono">
                    {Math.round((launchSteps.filter(s => s.status === 'completed').length / launchSteps.length) * 100)}%
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(launchSteps.filter(s => s.status === 'completed').length / launchSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* FIRST STEP & KEY CONTEXT ADVICE */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex flex-col md:flex-row gap-4 items-start">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl shrink-0">
                  <BookOpen size={18} />
                </div>
                <div className="space-y-1.5 leading-relaxed">
                  <h4 className="text-xs font-black text-indigo-900">{language === 'ar' ? 'نصيحة المدير التنفيذي للمشروع لرفع الحصة السوقية:' : 'Executive PM Strategy Directive:'}</h4>
                  <p className="text-[10px] text-slate-700">
                    {language === 'ar'
                      ? 'لجعل الشركات تثق بمنتجك وتدفع اشتراكات سنوية عالية، ركّز على تقديم فحص الأمان الذكي للورش عبر نظام "الذكاء الاصطناعي" و "تحصين الأساطيل". هذا ما يبحث عنه صناع القرار ومسؤولو الصيانة. تأكد من تفعيل الاتصال بقاعدة بيانات Firebase لتوفير تجربة ديمو تفاعلية فورية خالية من فترات الانتظار لتجربتها أمام المسؤولين.'
                      : 'To win large logistics contracts, focus on demonstrating predictive workshop scheduling and enterprise security. Real-time Firebase synchronization ensures customer managers experience direct zero-latency fleet coordination on demo runs.'}
                  </p>
                </div>
              </div>
            </div>

            {/* INTERACTIVE PM CHECKS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {launchSteps.map((s, index) => {
                const isDone = s.status === 'completed';
                return (
                  <div 
                    key={s?.id || `launch-step-${index}`}
                    className={`bg-white border transition-all rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-5 relative overflow-hidden ${
                      isDone 
                        ? 'border-emerald-200 bg-emerald-50/20' 
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Phase Banner */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 font-mono">STAGE {index + 1} / {launchSteps.length}</span>
                        <button
                          type="button"
                          onClick={() => toggleLaunchStep(s.id)}
                          className={`p-1 px-2.5 rounded-lg text-[9px] font-black cursor-pointer transition-all flex items-center gap-1.5 border ${
                            isDone 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <Check size={10} strokeWidth={3} />
                          <span>{isDone ? (language === 'ar' ? 'مكتمل' : 'Done') : (language === 'ar' ? 'انتظار...' : 'Pending')}</span>
                        </button>
                      </div>

                      <h4 className="text-[12px] font-black text-slate-900 leading-snug">
                        {language === 'ar' ? s.titleAr : s.titleEn}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold">
                        {language === 'ar' ? s.phaseAr : s.phase}
                      </p>
                      
                      <div className="h-px bg-slate-100 my-2.5" />

                      <p className="text-[10.5px] text-slate-600 leading-relaxed">
                        {language === 'ar' ? s.descAr : s.descEn}
                      </p>
                    </div>

                    {/* Action Guideline details inside the bento item */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[9.5px] text-slate-600 leading-normal flex items-start gap-2">
                      <Info size={12} className="text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        {index === 0 && (language === 'ar' ? 'الوضع السحابي لـ Firebase معد وجاهز للعمل بمجرد تكوينه ليكون العقد الفعلي آمن ومستدام.' : 'Firebase backend config is ready and fully tested inside local server configuration for production.')}
                        {index === 1 && (language === 'ar' ? 'عدّل اسم علامتك التجارية ونظام الألوان من التبويب المجاور للتحكم بما يظهر للمشتركين بصفحة الهبوط.' : 'Branding updates dynamically on public pages, establishing premium White-label authority immediately.')}
                        {index === 2 && (language === 'ar' ? 'يتكامل نظام السداد مع Stripe SDK لتوفير تتبع الإيرادات مباشرة للشركات.' : 'Subscriptions map through checkout routes; webhooks handle auto-provisioning of premium accounts.')}
                        {index === 3 && (language === 'ar' ? 'تدريع صلاحيات أصحاب الأساطيل ومسؤولي الصيانة يمنع تداخل الورش ويحمي الخصوصية.' : 'Robust policy layers ensure separation of tenant environments in mutli-fleet setups.')}
                        {index === 4 && (language === 'ar' ? 'أي تجربة تسجيل أو حاسبة ROI ناجحة من موقعك التسويقي تغذي وتغذي هذا الجدول سحابياً.' : 'Public landing registrations and calculators write to Firebase collections directly for full CRM follow-ups.')}
                        {index === 5 && (language === 'ar' ? 'اربط نطاقك المخصص عبر إعدادات DNS الموجهة لخادم Cloud Run بثوان معدودة.' : 'Simply configure DNS records pointing to the proxy router on container server side.')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* STRATEGIC STEP BY STEP ACTION PLAN (A TO Z ADVICE FOR SAAS COMPANIES) */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-sm space-y-6 text-right font-sans">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2 justify-end">
                  <span>{language === 'ar' ? 'خطة تفعيل وإطلاق نموذج الساس (SaaS Go-To-Market Guide)' : 'SaaS Go-To-Market Execution Steps'}</span>
                  <Zap size={14} className="text-amber-400" />
                </h3>
                <p className="text-[10px] text-slate-300 mt-1">
                  {language === 'ar' ? 'الخطوات التشغيلية لمدير المشروع لإطلاق الخدمة للشركات الأخرى وإدارتها واحدةً تلو الأخرى:' : 'Chronological operational manual for managers to successfully onboard business clients.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans leading-relaxed">
                {/* Step 1 Advice */}
                <div className="p-4 bg-slate-950/80 rounded-2xl space-y-2 border border-slate-800">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[10px] font-black text-indigo-400">الخطوة الأولى / Step 1</span>
                    <span className="w-5 h-5 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                  </div>
                  <h4 className="text-[11.5px] font-black text-slate-200">{language === 'ar' ? 'اعتماد الهوية والاسم التجاري الفريد' : 'Finalize the Custom Identity'}</h4>
                  <p className="text-[10px] text-slate-400">
                    {language === 'ar'
                      ? 'قبل أي شيء، حدد مسمى المنتج اللائق بفئة الشركات المستهدفة (مثال: أساطيل الخليج، ناقل ٣٦٠). غيّر المسمى السحابي من لوحة الهوية هنا ليتغير الشعار وجميع النصوص على الموقع واللوحة بشكل مؤتمت.'
                      : 'Define and lock your target brand first. Update it in the Custom Branding panel next to this tab, which automatically replaces layout text and values everywhere.'}
                  </p>
                </div>

                {/* Step 2 Advice */}
                <div className="p-4 bg-slate-950/80 rounded-2xl space-y-2 border border-slate-800">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[10px] font-black text-indigo-400">الخطوة الثانية / Step 2</span>
                    <span className="w-5 h-5 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                  </div>
                  <h4 className="text-[11.5px] font-black text-slate-200">{language === 'ar' ? 'تفعيل الاتصال السحابي بقاعدة البيانات' : 'Enable Firebase Cloud Mode'}</h4>
                  <p className="text-[10px] text-slate-400">
                    {language === 'ar'
                      ? 'قم بالانتقال إلى وضع السحابة السحابي. ستتصل لوحة تحكمك بقاعدة Firebase Firestore السحابية فورياً لكافة السجلات (المشتركين، العملاء، التقييمات، مميزات الخدمة)، وهي نفس السلة الآمنة التي يتصل بها نموذج الويب التسويقي.'
                      : 'Switch to Cloud Mode. Your admin dashboard links instantly to Firebase cloud collections. Any demo request or audit lead submitted securely feeds into your central desk.'}
                  </p>
                </div>

                {/* Step 3 Advice */}
                <div className="p-4 bg-slate-950/80 rounded-2xl space-y-2 border border-slate-800">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[10px] font-black text-indigo-400">الخطوة الثالثة / Step 3</span>
                    <span className="w-5 h-5 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                  </div>
                  <h4 className="text-[11.5px] font-black text-slate-200">{language === 'ar' ? 'تنفيذ عروض ديمو للمهتمين الميدانيين' : 'Execute Pilot Demos & Follow-up'}</h4>
                  <p className="text-[10px] text-slate-400">
                    {language === 'ar'
                      ? 'عند قدوم أي عميل مهتم بصفحة الهبوط (زيادة حجم الأسطول)، يمكنك تتبع بياناته، هاتف، بريد، حجم الأسطول من جدول المشتركين، وكتابة تدوينات الدعم الفني، وتحديد نوع الباقة، والتواصل الفردي لتوقيع العقد الرسمي.'
                      : 'Once potential subscriber leads land here, track Fleet size, email, phone, and write team notes inside the CRM. Directly convert contacts to paid enterprises on custom terms.'}
                  </p>
                </div>

                {/* Step 4 Advice */}
                <div className="p-4 bg-slate-950/80 rounded-2xl space-y-2 border border-slate-800">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[10px] font-black text-indigo-400">الخطوة الرابعة / Step 4</span>
                    <span className="w-5 h-5 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-[10px] font-bold">4</span>
                  </div>
                  <h4 className="text-[11.5px] font-black text-slate-200">{language === 'ar' ? 'ربط وإعلان بوابات الدفع الإلكتروني' : 'Deploy Stripe Checkout & Go Public'}</h4>
                  <p className="text-[10px] text-slate-400">
                    {language === 'ar'
                      ? 'ادمج بوابة Stripe لتلقي الأموال آلياً. ثم اربط الدومين المخصص لشركتك، ومبارك عليك! لقد أسست مشروع ساس (SaaS) تجاري متكامل لإدارة الورش والأساطيل قابل للتوسع عالمياً وجني أرباح الاشتراكات الدورية.'
                      : 'Onboard Stripe directly for global recurring bills, connect your custom commercial domain name, and hit start. You are now running an automated enterprise SaaS business!'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: GENERAL IDENTITY SIZING BRAND SETTINGS */}
        {activeSubTab === 'identity' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right">
            <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl space-y-5 shadow-xs">
              <h3 className="text-xs font-black text-slate-900">إعداد هوية وشعار منظومة الـ SaaS للورش</h3>
              <p className="text-[10px] text-slate-500 -mt-3.5">هذه الخيارات تحكم مسمى وألوان المنصة في الموقع الخارجي وبوابة الفنيين المجمعة.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 block">اسم المنصة (العربية)</label>
                  <input
                    type="text"
                    value={saasBrandName}
                    onChange={(e) => setSaasBrandName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-sans text-slate-800 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 block">نوع ومستوى اللون الأساسي للماركة</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={brandPrimaryColor}
                      onChange={(e) => setBrandPrimaryColor(e.target.value)}
                      className="w-12 h-9 p-0.5 border border-slate-200 bg-white rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandPrimaryColor}
                      onChange={(e) => setBrandPrimaryColor(e.target.value)}
                      className="flex-1 p-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 text-center transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-700 block">وصف أو شعار المنصة التسويقي القصير</label>
                <textarea
                  value={saasBrandDesc}
                  onChange={(e) => setSaasBrandDesc(e.target.value)}
                  className="w-full p-2.5 h-16 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 transition-colors"
                  placeholder="شركة موثوقة لحل صيانة سيارات وأسطول ومخازن المؤسسات التجارية والصناعية..."
                />
              </div>

              {/* Sample standard presets for color styling */}
              <div className="space-y-1.5 select-none">
                <span className="text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block">مجموعات ألوان مفترضة مقترحة:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { name: 'الملكي الأزرق', val: '#1e53e4' },
                    { name: 'الفيروزي الحديث', val: '#0d9488' },
                    { name: 'الميكانيكي القرمزي', val: '#dc2626' },
                    { name: 'البركاني الفخم', val: '#f97316' },
                    { name: 'البنفسجي الإمبريالي', val: '#6d28d9' },
                    { name: 'منت غلاسيه', val: '#059669' }
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBrandPrimaryColor(p.val)}
                      className="p-1 px-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-[10px] text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-white"
                    >
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: p.val }} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-900">معاينة العلامة المخصصة</h3>
                <p className="text-[10px] text-slate-500">كيف تظهر الهوية في ترويسة وعناصر النظام الإلكتروني:</p>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-center">
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl overflow-hidden border border-indigo-400/50 shadow-xs bg-[#090D16] shrink-0 p-0.5">
                      <FleetAurvexisVectorEmblem className="w-full h-full" />
                    </div>
                    <span className="text-sm font-black text-slate-900">{saasBrandName || 'FleetAurvexis'}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 font-semibold truncate px-3">{saasBrandDesc || 'المنظومة السحابية الذكية المتكاملة لحوكمة صيانة المركبات والمعدات الثقيلة'}</p>
                  <button 
                    className="w-full py-1.5 text-[10px] font-black text-white rounded-lg cursor-pointer"
                    style={{ backgroundColor: brandPrimaryColor }}
                  >
                    أريد تجربة مجانية
                  </button>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-[10px] text-indigo-900 space-y-2 select-text font-semibold">
                <div className="flex gap-1 justify-end items-center">
                  <span>تم تفعيل ميزة مزامنة الهوية الحية مع صفحة التسويق</span>
                  <Info size={11} className="shrink-0 text-indigo-600" />
                </div>
                <p className="leading-normal text-indigo-700">عند تغيير الهوية أو تعديل منسوب التدرجات هنا، يتم تطبيق التناسق على صفحة الهبوط العمومية تلقائياً دون الحاجة لإعادة كتابة الأكواد برمجياً!</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FEATURES INVENTORY MANAGEMENT */}
        {activeSubTab === 'features' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
              <span className="text-[10.5px] text-slate-600 font-bold text-right w-full sm:w-auto">أضف أو عدّل الميزات والعناصر الفنية المعروضة في الموقع التسويقي للمقارنة</span>
              <button
                onClick={() => setFeatureForm({ titleAr: '', titleEn: '', descAr: '', descEn: '', iconName: 'Wrench', badgeAr: '', badgeEn: '' })}
                className="p-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Plus size={14} />
                <span>إضافة ميزة فنية</span>
              </button>
            </div>

            {/* Editing Segment popup/div */}
            <AnimatePresence>
              {featureForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm text-right"
                >
                  <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2">
                    {featureForm.id ? 'تعديل ميزة قائمة' : 'صياغة ميزة جديدة بالموقع'}
                  </h4>

                  <form onSubmit={handleFeatureSubmit} className="space-y-4 font-sans text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Titles */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">العنوان في الموقع (عربي)</label>
                        <input
                          type="text"
                          required
                          value={featureForm.titleAr}
                          onChange={(e) => setFeatureForm({ ...featureForm, titleAr: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 text-slate-800 rounded-xl transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">العنوان في الموقع (English)</label>
                        <input
                          type="text"
                          required
                          value={featureForm.titleEn}
                          onChange={(e) => setFeatureForm({ ...featureForm, titleEn: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 text-slate-800 rounded-xl transition-colors"
                        />
                      </div>

                      {/* Icons & Badge */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">أيقونة العرض (الرمز الفني لـ Lucide)</label>
                        <select
                          value={featureForm.iconName}
                          onChange={(e) => setFeatureForm({ ...featureForm, iconName: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 text-slate-800 rounded-xl transition-colors"
                        >
                          <option value="Truck">شاحنة / Truck</option>
                          <option value="Wrench">ميكانيكي / Wrench</option>
                          <option value="Smartphone">شاشة هاتف / Smartphone</option>
                          <option value="Cpu">معالج ذكي / Cpu</option>
                          <option value="Activity">نبض الأسر / Activity</option>
                          <option value="ShieldCheck">أمان وامتثال / ShieldCheck</option>
                          <option value="Gauge">عداد وقود / Gauge</option>
                          <option value="Droplets">إضاءة إطارات ومصارف / Droplets</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">وسام تشريفي (أمثلة: جديد، حصري، أساسي)</label>
                        <input
                          type="text"
                          value={featureForm.badgeAr}
                          onChange={(e) => setFeatureForm({ ...featureForm, badgeAr: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 text-slate-800 rounded-xl transition-colors"
                          placeholder="مثال: جديد بالكامل"
                        />
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">الوصف بالتفصيل (عربي)</label>
                        <textarea
                          required
                          value={featureForm.descAr}
                          onChange={(e) => setFeatureForm({ ...featureForm, descAr: e.target.value })}
                          className="w-full p-2.5 h-16 bg-slate-50 focus:bg-white border border-slate-200 text-slate-800 rounded-xl transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">الوصف بالتفصيل (English)</label>
                        <textarea
                          required
                          value={featureForm.descEn}
                          onChange={(e) => setFeatureForm({ ...featureForm, descEn: e.target.value })}
                          className="w-full p-2.5 h-16 bg-slate-50 focus:bg-white border border-slate-200 text-slate-800 rounded-xl transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => setFeatureForm(null)}
                        className="p-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                      >
                        إلغاء الأمر
                      </button>
                      <button
                        type="submit"
                        className="p-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl cursor-pointer flex items-center gap-1.5"
                      >
                        <Save size={13} />
                        <span>حفظ ومزامنة</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Real Grid Loop of Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((f, idx) => (
                <div key={f.id || idx} className="bg-white border border-slate-200 p-4.5 rounded-2xl flex items-start justify-between gap-3 text-right shadow-xs">
                  <div className="flex items-start gap-3 justify-end flex-row-reverse text-right">
                    <span className="p-3 bg-slate-50 text-indigo-600 rounded-xl border border-slate-200 uppercase shrink-0">
                      {f.iconName}
                    </span>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 justify-end">
                        <h4 className="text-[12.5px] font-black text-slate-900">{f.titleAr}</h4>
                        {f.badgeAr && (
                          <span className="px-1.5 py-0.5 bg-indigo-50 text-[8.5px] text-indigo-700 font-bold border border-indigo-200 rounded">
                            {f.badgeAr}
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-semibold">{f.titleEn}</p>
                      <p className="text-[10.5px] text-slate-600 leading-normal line-clamp-2">{f.descAr}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => startEditFeature(f)}
                      className="p-1 px-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-lg text-[10px] cursor-pointer transition-colors"
                      title="تعديل الميزة"
                    >
                      <Edit3 size={11} />
                    </button>
                    <button
                      onClick={() => handleDeleteFeature(f.id)}
                      className="p-1 px-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded-lg text-[10px] cursor-pointer transition-colors"
                      title="حذف تشغيلي"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CLIENT COMPANIES CRUD */}
        {activeSubTab === 'clients' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
              <span className="text-[10.5px] text-slate-600 font-bold text-right w-full sm:w-auto">أضف الشعارات والشركات والبلديات الكبرى المستفيدة والمعتمدة للموقع</span>
              <button
                onClick={() => setClientForm({ name: '', industryAr: '', industryEn: '', rating: 5, yearJoint: '2026', activeVehicles: '25', logoSeed: 'CL' })}
                className="p-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Plus size={14} />
                <span>إضافة شعار عميل</span>
              </button>
            </div>

            {/* Editor client popup section */}
            <AnimatePresence>
              {clientForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm text-right"
                >
                  <h4 className="text-xs font-black text-slate-900">
                    {clientForm.id ? 'تعديل بيانات العميل الحالي' : 'إدراج عميل جديد للشركاء'}
                  </h4>

                  <form onSubmit={handleClientSubmit} className="space-y-4 font-sans text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">اسم الشركة/الهيئة التجارية</label>
                        <input
                          type="text"
                          required
                          value={clientForm.name}
                          onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl transition-colors"
                          placeholder="مثال: أرامكو للخدمات الأرضية"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">رمز الاختصار الثنائي (لشعار اللوتس التجريدي)</label>
                        <input
                          type="text"
                          required
                          maxLength={2}
                          value={clientForm.logoSeed}
                          onChange={(e) => setClientForm({ ...clientForm, logoSeed: e.target.value.toUpperCase() })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 text-center font-bold text-slate-800 rounded-xl transition-colors"
                          placeholder="مثال: AR"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">القطاع الصناعي (عربي)</label>
                        <input
                          type="text"
                          required
                          value={clientForm.industryAr}
                          onChange={(e) => setClientForm({ ...clientForm, industryAr: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">القطاع الصناعي (English)</label>
                        <input
                          type="text"
                          required
                          value={clientForm.industryEn}
                          onChange={(e) => setClientForm({ ...clientForm, industryEn: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">سنة الانضمام للتطبيق</label>
                        <input
                          type="text"
                          value={clientForm.yearJoint}
                          onChange={(e) => setClientForm({ ...clientForm, yearJoint: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl font-mono text-center transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">حجم المعدات/الشاحنات النشط لديهم</label>
                        <input
                          type="text"
                          value={clientForm.activeVehicles}
                          onChange={(e) => setClientForm({ ...clientForm, activeVehicles: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl font-mono text-center transition-colors"
                          placeholder="مثال: 320 سيارة"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => setClientForm(null)}
                        className="p-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                      >
                        إلغاء الأمر
                      </button>
                      <button
                        type="submit"
                        className="p-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                      >
                        <Save size={13} />
                        <span>حفظ الشريك</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Client Lists elements */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {clients.map((c, idx) => (
                <div key={c.id || idx} className="bg-white border border-slate-200 p-4 rounded-2xl text-center space-y-3 shadow-xs relative group">
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => startEditClient(c)}
                      className="p-1 bg-white hover:bg-indigo-600 hover:text-white border border-slate-200 text-slate-600 rounded-md cursor-pointer text-[9px]"
                      title="تحرير"
                    >
                      <Edit3 size={10} />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(c.id)}
                      className="p-1 bg-white hover:bg-rose-600 hover:text-white border border-slate-200 text-slate-600 rounded-md cursor-pointer text-[9px]"
                      title="إزالة"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="w-11 h-11 rounded-full bg-indigo-50 text-indigo-700 font-extrabold mx-auto flex items-center justify-center border border-indigo-100 font-mono text-sm leading-none shrink-0 select-none shadow-xs">
                    {c.logoSeed}
                  </div>

                  <div className="space-y-0.5">
                    <h5 className="text-[11.5px] font-black text-slate-900 truncate px-1">{c.name}</h5>
                    <p className="text-[9px] text-slate-500 truncate">{c.industryAr}</p>
                  </div>

                  <div className="p-1.5 bg-slate-50 rounded-xl border border-slate-100 text-[9px] text-slate-600 font-mono space-y-0.5">
                    <div className="flex justify-between flex-row-reverse">
                      <span>المركبات:</span>
                      <span className="font-bold text-indigo-600">{c.activeVehicles}</span>
                    </div>
                    <div className="flex justify-between flex-row-reverse">
                      <span>انضمام:</span>
                      <span className="font-bold text-slate-700">{c.yearJoint}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: TESTIMONIALS / REVIEWS EDITORS & LISTING */}
        {activeSubTab === 'testimonials' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
              <span className="text-[10.5px] text-slate-600 font-bold text-right w-full sm:w-auto">أضف وأدر التقييمات وآراء مهندسي أساطيل العملاء الفعليين المعتمدة</span>
              <button
                onClick={() => setReviewForm({ authorName: '', roleAr: '', roleEn: '', company: '', contentAr: '', contentEn: '', rating: 5 })}
                className="p-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Plus size={14} />
                <span>إضافة رأي عميل</span>
              </button>
            </div>

            {/* Testimonial Form editing div */}
            <AnimatePresence>
              {reviewForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm text-right"
                >
                  <h4 className="text-xs font-black text-slate-900">
                    {reviewForm.id ? 'تحرير تقييم العميل المعتمد' : 'إنشاء تقييم فني وإضافته للواجهة'}
                  </h4>

                  <form onSubmit={handleReviewSubmit} className="space-y-4 font-sans text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">اسم المهندس/العميل المقيم</label>
                        <input
                          type="text"
                          required
                          value={reviewForm.authorName}
                          onChange={(e) => setReviewForm({ ...reviewForm, authorName: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl transition-colors"
                          placeholder="مثال: م. فهد عسيري"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">اسم المنشأة/الشركة التابع لها</label>
                        <input
                          type="text"
                          required
                          value={reviewForm.company}
                          onChange={(e) => setReviewForm({ ...reviewForm, company: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">المسمى الوظيفي للمقيم (عربي)</label>
                        <input
                          type="text"
                          required
                          value={reviewForm.roleAr}
                          onChange={(e) => setReviewForm({ ...reviewForm, roleAr: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">المسمى الوظيفي (English)</label>
                        <input
                          type="text"
                          required
                          value={reviewForm.roleEn}
                          onChange={(e) => setReviewForm({ ...reviewForm, roleEn: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">تصنيف النجوم (1 - 5)</label>
                        <select
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: parseFloat(e.target.value) })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl transition-colors"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ 5 نجوم كاملة</option>
                          <option value="4.5">⭐⭐⭐⭐ 4.5 نجمة</option>
                          <option value="4">⭐⭐⭐⭐ 4 نجوم</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">محتوى التقييم والقول المأثور (عربي)</label>
                        <textarea
                          required
                          value={reviewForm.contentAr}
                          onChange={(e) => setReviewForm({ ...reviewForm, contentAr: e.target.value })}
                          className="w-full p-2.5 h-20 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl leading-normal transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">محتوى التقييم والقول المأثور (English)</label>
                        <textarea
                          required
                          value={reviewForm.contentEn}
                          onChange={(e) => setReviewForm({ ...reviewForm, contentEn: e.target.value })}
                          className="w-full p-2.5 h-20 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl leading-normal transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => setReviewForm(null)}
                        className="p-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                      >
                        إلغاء الأمر
                      </button>
                      <button
                        type="submit"
                        className="p-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                      >
                        <Save size={13} />
                        <span>إضافة التقييم</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Render Reviews grid lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((r, idx) => (
                <div key={r.id || idx} className="bg-white border border-slate-200 p-5 rounded-3xl space-y-4 text-right shadow-xs relative flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-row">
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => startEditReview(r)}
                          className="p-1 px-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-lg text-[9px] cursor-pointer"
                          title="تحرير"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-1 px-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded-lg text-[9px] cursor-pointer"
                          title="حذف"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-row-reverse text-right">
                        <img
                          src={r.avatar || 'https://picsum.photos/seed/face/150/150'}
                          alt={r.authorName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full border border-slate-200 shadow-xs object-cover"
                        />
                        <div>
                          <strong className="text-[12px] font-black text-slate-900 block">{r.authorName}</strong>
                          <span className="text-[9.5px] text-slate-500 block font-semibold">{r.roleAr} ({r.company})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-0.5 justify-end text-amber-500 font-bold text-[10.5px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={11} fill={i < Math.floor(r.rating) ? 'currentColor' : 'none'} />
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-600 italic leading-relaxed text-right">
                      &ldquo;{r.contentAr}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: DYNAMIC FOOTER COLUMNS & LINKS */}
        {activeSubTab === 'footer' && (
          <div className="space-y-6 animate-fade-in text-right">
            
            {/* Header Description block */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="space-y-1">
                <span className="p-1 px-2.5 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] font-bold">إقرار وتحكم فوري</span>
                <h4 className="text-xs font-black text-slate-900 mt-1">تخصيص كامل تذييل المظهر وقوائم ومصادر أسفل الموقع الإلكتروني</h4>
                <p className="text-[10px] text-slate-600">مقسمة طبقًا للقوائم المعروضة بمصادر الأنظمة الكبرى مع القدرة على تعديل النصوص بالعربية والإنجليزية.</p>
              </div>
              <button
                type="button"
                onClick={handleResetFooterDefault}
                className="p-2 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10.5px] font-black rounded-xl border border-rose-200 cursor-pointer transition-all"
              >
                استعادة القوائم والروابط الافتراضية للشركة
              </button>
            </div>

            {/* Sub-tab selection menu */}
            <div className="flex justify-end border-b border-slate-200 pb-2 gap-2">
              <button
                type="button"
                onClick={() => setFooterSubTab('stories')}
                className={`p-2 px-4 text-xs font-black rounded-xl cursor-pointer transition-all ${
                  footerSubTab === 'stories'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>قصص ودراسات نجاح العملاء</span>
              </button>
              <button
                type="button"
                onClick={() => setFooterSubTab('links')}
                className={`p-2 px-4 text-xs font-black rounded-xl cursor-pointer transition-all ${
                  footerSubTab === 'links'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>روابط وقوائم التذييل العامة</span>
              </button>
            </div>

            {footerSubTab === 'links' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Footer Meta (Inputs for Copyrights, Badges, Legal, Socials) */}
              <div className="lg:col-span-12 xl:col-span-5 space-y-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 flex-row-reverse justify-between">
                    <span className="p-1 px-2 bg-slate-100 text-slate-700 rounded-lg text-[9.5px] font-black">العلاقات العامة والهوية برمجياً</span>
                    <strong className="text-[11px] font-black text-slate-900">تفاصيل وملحقات التذييل العامة</strong>
                  </div>

                  <div className="space-y-3 font-sans text-xs">
                    
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">نص حقوق الحفظ والنشر (عربي)</label>
                      <textarea
                        rows={2}
                        value={footerMeta.copyrightAr || ""}
                        onChange={(e) => saveFooterMeta({ ...footerMeta, copyrightAr: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl leading-normal text-right focus:ring-1 focus:ring-indigo-500 animate-none transition-colors"
                        placeholder="حقوق النشر © ميكانيك ٣٦٠"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Copyright Legal Text (English)</label>
                      <textarea
                        rows={2}
                        value={footerMeta.copyrightEn || ""}
                        onChange={(e) => saveFooterMeta({ ...footerMeta, copyrightEn: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl leading-normal text-left focus:ring-1 focus:ring-indigo-500 animate-none transition-colors"
                        placeholder="Copyright © FleetAurvexis"
                      />
                    </div>

                    <hr className="border-slate-100" />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-right">ملصق سياسة الخصوصية (عربي)</label>
                        <input
                          type="text"
                          value={footerMeta.privacyLabelAr || ""}
                          onChange={(e) => saveFooterMeta({ ...footerMeta, privacyLabelAr: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-right font-black transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-left">Privacy Label (English)</label>
                        <input
                          type="text"
                          value={footerMeta.privacyLabelEn || ""}
                          onChange={(e) => saveFooterMeta({ ...footerMeta, privacyLabelEn: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-left font-black transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-right">ملصق شروط الخدمة (عربي)</label>
                        <input
                          type="text"
                          value={footerMeta.termsLabelAr || ""}
                          onChange={(e) => saveFooterMeta({ ...footerMeta, termsLabelAr: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-right font-black transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-left">Terms Label (English)</label>
                        <input
                          type="text"
                          value={footerMeta.termsLabelEn || ""}
                          onChange={(e) => saveFooterMeta({ ...footerMeta, termsLabelEn: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-left font-black transition-colors"
                        />
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-right">بوابة تطبيقات Google Play</label>
                        <input
                          type="text"
                          value={footerMeta.playStoreUrl || ""}
                          onChange={(e) => saveFooterMeta({ ...footerMeta, playStoreUrl: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl select-all text-left font-mono text-[9px] font-black transition-colors"
                          placeholder="https://play.google.com/..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-left">بوابة iOS App Store</label>
                        <input
                          type="text"
                          value={footerMeta.appStoreUrl || ""}
                          onChange={(e) => saveFooterMeta({ ...footerMeta, appStoreUrl: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl select-all text-left font-mono text-[9px] font-black transition-colors"
                          placeholder="https://apps.apple.com/..."
                        />
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    <h5 className="font-black text-[10px] text-slate-900 flex items-center justify-end gap-1.5 pt-1 font-sans">
                      <span>روابط التواصل الاجتماعي وشركاء الأساطيل</span>
                      <Settings size={12} className="text-indigo-600" />
                    </h5>

                    <div className="space-y-2">
                      <div className="flex gap-2 items-center flex-row">
                        <input
                          type="text"
                          value={footerMeta.socialX || ""}
                          onChange={(e) => saveFooterMeta({ ...footerMeta, socialX: e.target.value })}
                          className="flex-1 p-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-left text-[11px] font-mono transition-colors"
                          placeholder="https://x.com/..."
                        />
                        <span className="p-2 px-3 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold min-w-[70px] text-center">X (Twitter)</span>
                      </div>

                      <div className="flex gap-2 items-center flex-row">
                        <input
                          type="text"
                          value={footerMeta.socialLinkedin || ""}
                          onChange={(e) => saveFooterMeta({ ...footerMeta, socialLinkedin: e.target.value })}
                          className="flex-1 p-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-left text-[11px] font-mono transition-colors"
                          placeholder="https://linkedin.com/company/..."
                        />
                        <span className="p-2 px-3 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold min-w-[70px] text-center">LinkedIn</span>
                      </div>

                      <div className="flex gap-2 items-center flex-row">
                        <input
                          type="text"
                          value={footerMeta.socialInstagram || ""}
                          onChange={(e) => saveFooterMeta({ ...footerMeta, socialInstagram: e.target.value })}
                          className="flex-1 p-2 bg-slate-50 focus:bg-white border border-slate-200 text-left text-[11px] font-mono rounded-lg transition-colors"
                          placeholder="https://instagram.com/..."
                        />
                        <span className="p-2 px-3 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold min-w-[70px] text-center">Instagram</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Columns Links Editor */}
              <div className="lg:col-span-12 xl:col-span-7 space-y-4">
                
                {/* Column tabs select */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-row-reverse">
                    <span className="text-[11px] font-black text-slate-900">أعمدة روابط أسفل الموقع ({footerColumns.length} قوائم)</span>
                    <span className="text-[9.5px] p-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold">بنية مرنة بالكامل</span>
                  </div>

                  <div className="flex flex-row-reverse gap-1 overflow-x-auto pb-1 border-b border-slate-100 select-none">
                    {footerColumns.map((col, idx) => (
                      <button
                        key={col?.id || `footer-col-${idx}`}
                        type="button"
                        onClick={() => setSelectedColId(col.id)}
                        className={`p-2 px-3 text-[11px] font-black whitespace-nowrap cursor-pointer rounded-xl transition-all ${
                          selectedColId === col.id 
                            ? 'bg-indigo-600 text-white shadow-xs' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ar' ? col.titleAr : col.titleEn}
                        <span className="mx-1 p-0.5 px-1 bg-black/10 rounded text-[9px] font-mono leading-none">{col.items.length}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active Selected Column Editing Form */}
                  {footerColumns.filter(c => c.id === selectedColId).map((activeCol, acIdx) => (
                    <div key={activeCol?.id || `active-col-${acIdx}`} className="space-y-4 pt-1">
                      
                      {/* Column Title inputs */}
                      <div className="grid grid-cols-2 gap-3 text-right">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 text-xs block">اسم هذه القائمة بالعربية</label>
                          <input
                            type="text"
                            value={activeCol.titleAr}
                            onChange={(e) => handleUpdateColumnTitle(activeCol.id, e.target.value, activeCol.titleEn)}
                            className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-right font-black text-xs transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 text-xs block">Column Title (English)</label>
                          <input
                            type="text"
                            value={activeCol.titleEn}
                            onChange={(e) => handleUpdateColumnTitle(activeCol.id, activeCol.titleAr, e.target.value)}
                            className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-left font-black text-xs transition-colors"
                          />
                        </div>
                      </div>

                      {/* Add link Item to active column inline */}
                      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
                        <strong className="text-[10.5px] font-black text-indigo-900 block">إضافة رابط فرعي جديد للقائمة النشطة</strong>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans">
                          <div className="space-y-1 text-right">
                            <label className="text-[10px] text-slate-600 font-bold block">عنوان الرابط (عربي)</label>
                            <input
                              type="text"
                              value={newColItemAr}
                              onChange={(e) => setNewColItemAr(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-right text-xs"
                              placeholder="مثال: ورش المنطقة الوسطى"
                            />
                          </div>
                          <div className="space-y-1 text-right">
                            <label className="text-[10px] text-slate-600 font-bold block">Link Label (English)</label>
                            <input
                              type="text"
                              value={newColItemEn}
                              onChange={(e) => setNewColItemEn(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-left text-xs"
                              placeholder="e.g. Riyadh Central Workshop"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleAddFooterItem(activeCol.id)}
                            className="p-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 transition-all"
                          >
                            <Plus size={12} />
                            <span>أضف للعمود النشط</span>
                          </button>
                        </div>
                      </div>

                      {/* Display items of active selected column list with delete keys */}
                      <div className="space-y-2 select-none font-sans">
                        <span className="text-[10px] text-slate-500 block font-bold">الروابط المضافة والمنشورة حالياً ({activeCol.items.length} روابط):</span>
                        <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                          {activeCol.items.length === 0 ? (
                            <div className="p-8 text-center text-[11px] text-slate-500 font-semibold bg-slate-50">
                              لا توجد روابط مضافة في هذا العمود حالياً. أضف روابط جديدة في الأعلى.
                            </div>
                          ) : (
                            activeCol.items.map((item: any, itemIdx: number) => (
                              <div key={item.id || itemIdx} className="p-3 bg-white flex items-center justify-between hover:bg-slate-50 transition-all flex-row-reverse">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFooterItem(activeCol.id, item.id)}
                                  className="p-1 px-2 border border-rose-200 hover:bg-rose-600 hover:text-white rounded-lg text-rose-600 text-[10px] cursor-pointer transition-colors"
                                  title="حذف هذا الرابط"
                                >
                                  ✕
                                </button>
                                <div className="text-right flex items-center gap-3 flex-row-reverse">
                                  <div className="p-1 px-1.5 bg-slate-100 text-[9px] text-slate-500 font-mono rounded">
                                    {itemIdx + 1}
                                  </div>
                                  <div className="text-right">
                                    <strong className="text-xs text-slate-800 block text-right">{item.labelAr}</strong>
                                    <span className="text-[10px] text-slate-500 block font-mono text-right">{item.labelEn}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>
                  ))}

                </div>
              </div>

            </div>
            ) : (
              /* TAB 6-B: CUSTOMER SUCCESS STORIES CRUD PANEL */
              <div className="space-y-4 animate-fade-in text-right">
                <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                  <span className="text-[10.5px] text-slate-600 font-bold text-right w-full sm:w-auto">أضف وأدر دراسات وحالات النجاح المترجمة لعملائنا في تذييل الموقع</span>
                  <button
                    type="button"
                    onClick={() => setSuccessStoryForm({ titleAr: '', titleEn: '', contentAr: '', contentEn: '', companyAr: '', companyEn: '', metricAr: '', metricEn: '', imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800' })}
                    className="p-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Plus size={14} />
                    <span>إضافة قصة نجاح جديدة</span>
                  </button>
                </div>

                {/* Edit/Create form */}
                <AnimatePresence>
                  {successStoryForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm text-right"
                    >
                      <h4 className="text-xs font-black text-slate-900">
                        {successStoryForm.id ? 'تحرير بيانات قصة النجاح الحالية' : 'إدراج حالة دراسة نجاح جديدة للعملاء'}
                      </h4>

                      <form onSubmit={handleSuccessStorySubmit} className="space-y-4 font-sans text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">اسم الجهة/الشركة المستفيدة (عربي)</label>
                            <input
                              type="text"
                              required
                              value={successStoryForm.companyAr || ''}
                              onChange={(e) => setSuccessStoryForm({ ...successStoryForm, companyAr: e.target.value })}
                              className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-right transition-colors"
                              placeholder="مثال: الشركة الوطنية للخدمات اللوجستية"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">Beneficiary Company Name (English)</label>
                            <input
                              type="text"
                              required
                              value={successStoryForm.companyEn || ''}
                              onChange={(e) => setSuccessStoryForm({ ...successStoryForm, companyEn: e.target.value })}
                              className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-left transition-colors"
                              placeholder="e.g. National Logistics Services Corp."
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">عنوان قصة النجاح (عربي)</label>
                            <input
                              type="text"
                              required
                              value={successStoryForm.titleAr || ''}
                              onChange={(e) => setSuccessStoryForm({ ...successStoryForm, titleAr: e.target.value })}
                              className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-right transition-colors"
                              placeholder="عنوان المبادرة والتحول الرقمي"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">Success Story Title (English)</label>
                            <input
                              type="text"
                              required
                              value={successStoryForm.titleEn || ''}
                              onChange={(e) => setSuccessStoryForm({ ...successStoryForm, titleEn: e.target.value })}
                              className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-left transition-colors"
                              placeholder="Digital Transformation and Fleet PM"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">الرقم القياسي أو الإنجاز الهام (عربي)</label>
                            <input
                              type="text"
                              required
                              value={successStoryForm.metricAr || ''}
                              onChange={(e) => setSuccessStoryForm({ ...successStoryForm, metricAr: e.target.value })}
                              className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-right transition-colors"
                              placeholder="مثال: تقليل تكاليف الصيانة بنسبة 25%"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">Key Metric Highlighted (English)</label>
                            <input
                              type="text"
                              required
                              value={successStoryForm.metricEn || ''}
                              onChange={(e) => setSuccessStoryForm({ ...successStoryForm, metricEn: e.target.value })}
                              className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-left transition-colors"
                              placeholder="e.g. 25% Preventive PM Cost Savings"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="font-bold text-slate-700">رابط صورة احترافية معبرة (صورة عالية الدقة)</label>
                            <input
                              type="text"
                              required
                              value={successStoryForm.imageUrl || ''}
                              onChange={(e) => setSuccessStoryForm({ ...successStoryForm, imageUrl: e.target.value })}
                              className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-left font-mono transition-colors"
                              placeholder="https://images.unsplash.com/photo-..."
                            />
                            {successStoryForm.imageUrl && (
                              <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 max-w-xs aspect-video">
                                <img src={successStoryForm.imageUrl} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">تفاصيل وسرد القصة (عربي)</label>
                            <textarea
                              required
                              rows={4}
                              value={successStoryForm.contentAr || ''}
                              onChange={(e) => setSuccessStoryForm({ ...successStoryForm, contentAr: e.target.value })}
                              className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl leading-normal text-right transition-colors"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">Full Case Content (English)</label>
                            <textarea
                              required
                              rows={4}
                              value={successStoryForm.contentEn || ''}
                              onChange={(e) => setSuccessStoryForm({ ...successStoryForm, contentEn: e.target.value })}
                              className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl leading-normal text-left transition-colors"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-3">
                          <button
                            type="button"
                            onClick={() => setSuccessStoryForm(null)}
                            className="p-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                          >
                            إلغاء الأمر
                          </button>
                          <button
                            type="submit"
                            className="p-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                          >
                            <Save size={13} />
                            <span>حفظ قصة النجاح</span>
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Grid Loop of stories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {successStories.map((story, idx) => (
                    <div key={story.id || idx} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between text-right border-t-2 border-t-indigo-600">
                      
                      <div className="relative aspect-video">
                        <img src={story.imageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                        <div className="absolute top-2 right-2 bg-indigo-900/90 text-indigo-100 text-[9px] font-bold p-1 px-2.5 rounded-lg border border-indigo-400/30">
                          {story.metricAr}
                        </div>
                      </div>

                      <div className="p-4.5 space-y-2 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="text-[10px] text-indigo-600 font-extrabold">
                            {story.companyAr}
                          </div>
                          <h5 className="text-[12px] font-black text-slate-900 leading-snug">
                            {story.titleAr}
                          </h5>
                          <p className="text-[10.5px] text-slate-600 leading-relaxed line-clamp-3">
                            {story.contentAr}
                          </p>
                        </div>

                        <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => startEditSuccessStory(story)}
                            className="p-1 px-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-lg text-[10px] cursor-pointer flex items-center gap-1 transition-colors"
                          >
                            <Edit3 size={11} />
                            <span>تعديل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSuccessStory(story.id)}
                            className="p-1 px-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded-lg text-[10px] cursor-pointer flex items-center gap-1 transition-colors"
                          >
                            <Trash2 size={11} />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB: HEAVY MACHINERY GALLERY & IMAGES */}
        {activeSubTab === 'gallery' && (
          <div className="space-y-6 animate-fade-in text-right">
            
            {/* Header description block */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="space-y-1">
                <span className="p-1 px-2.5 bg-indigo-50 text-indigo-700 rounded-lg text-[9px] font-bold">📸 معرض صيانة المعدات الثقيلة</span>
                <h4 className="text-xs font-black text-slate-900 mt-1">تخصيص معرض الصور وإدارة المظاهر الفنية المعروضة</h4>
                <p className="text-[10px] text-slate-600">إضافة صور صيانة المعدات الهيدروليكية، الديزل والأساطيل وتفعيلها لتظهر فورا بالموقع التسويقي.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetGalleryDefault}
                  className="p-2 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10.5px] font-black rounded-xl border border-rose-200 cursor-pointer transition-all"
                >
                  استعادة الافتراضي
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryImageForm({
                    url: '',
                    titleAr: '',
                    titleEn: '',
                    descAr: '',
                    descEn: '',
                    category: 'heavy'
                  })}
                  className="p-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Plus size={13} />
                  <span>إضافة صورة مخصصة</span>
                </button>
              </div>
            </div>

            {/* AI Image Generation Simulator Box */}
            <div className="bg-indigo-50/60 border border-indigo-100 p-5 rounded-3xl space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-600 animate-pulse" size={18} />
                <h4 className="text-xs font-black text-slate-900">مولد الصور الذكي المدمج (صيانة المعدات الثقيلة)</h4>
              </div>
              <p className="text-[10.5px] text-slate-600 leading-relaxed">
                اكتب تفاصيل المعدات الثقيلة أو نوع الصيانة لتوليد صور فوتوغرافية احترافية فائقة الدقة وإدراجها فوراً في لوحة المعرض التسويقي.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="مثال: صيانة نظام الفرامل لشاحنة التعدين العملاقة في ورشة حديثة..."
                  id="ai-image-prompt"
                  className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    const promptVal = (document.getElementById('ai-image-prompt') as HTMLInputElement)?.value;
                    if (!promptVal) return;
                    
                    const btn = document.getElementById('ai-gen-btn');
                    if (btn) {
                      btn.innerHTML = language === 'ar' ? 'جاري توليد الصورة الذكية...' : 'Generating image...';
                      btn.setAttribute('disabled', 'true');
                    }
                    
                    setTimeout(() => {
                      const urls = [
                        heavyMachineryRepair,
                        dieselMaintenance,
                        hydraulicServicing,
                        constructionHeavyMachinery,
                        mechanicTruckWorkshop
                      ];
                      const randomUrl = urls[Math.floor(Math.random() * urls.length)];
                      
                      const newImg = {
                        id: 'img-gen-' + Date.now(),
                        url: randomUrl,
                        titleAr: promptVal.length > 30 ? promptVal.substring(0, 30) + '...' : promptVal,
                        titleEn: 'AI Generated Maintenance Scene',
                        descAr: 'تم توليد هذه الصورة باحترافية للتعبير عن: ' + promptVal,
                        descEn: 'AI professionally crafted machinery visual representing: ' + promptVal,
                        isSelected: true,
                        category: 'heavy'
                      };
                      
                      saveGalleryImages([newImg, ...galleryImages]);
                      
                      if (btn) {
                        btn.innerHTML = language === 'ar' ? 'تم التوليد بنجاح! 🚀' : 'Generated! 🚀';
                        btn.removeAttribute('disabled');
                        setTimeout(() => {
                          btn.innerHTML = language === 'ar' ? 'توليد الصورة' : 'Generate Image';
                        }, 2000);
                      }
                      const promptInput = document.getElementById('ai-image-prompt') as HTMLInputElement;
                      if (promptInput) promptInput.value = '';
                    }, 1800);
                  }}
                  id="ai-gen-btn"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xs shrink-0"
                >
                  <Sparkles size={13} />
                  <span>توليد الصورة</span>
                </button>
              </div>
            </div>

            {/* Editing / Adding Dialog Overlay Form */}
            <AnimatePresence>
              {galleryImageForm && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="bg-white border border-slate-200 p-6 rounded-3xl shadow-lg space-y-4 text-right"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-black text-indigo-700">
                      {galleryImageForm.id ? 'تعديل تفاصيل صورة المعرض' : 'إضافة صورة جديدة للمعرض'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setGalleryImageForm(null)}
                      className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <form onSubmit={handleGalleryImageSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-slate-700">رابط الصورة (URL)</label>
                        <input
                          type="text"
                          required
                          value={galleryImageForm.url || ''}
                          onChange={(e) => setGalleryImageForm({ ...galleryImageForm, url: e.target.value })}
                          placeholder="مثال: /src/assets/images/... أو رابط خارجي"
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl leading-normal text-left font-mono text-[10.5px] transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-slate-700">تصنيف الصورة</label>
                        <select
                          value={galleryImageForm.category || 'heavy'}
                          onChange={(e) => setGalleryImageForm({ ...galleryImageForm, category: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-[11px] font-bold transition-colors"
                        >
                          <option value="heavy">معدات ثقيلة هيدروليكية (Heavy)</option>
                          <option value="diesel">محركات ديزل وصيانة (Diesel)</option>
                          <option value="workshop">الورشة والتشغيل فني (Workshop)</option>
                          <option value="fleet">أساطيل ومركبات عامة (Fleet)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-slate-700">عنوان الصورة (عربي)</label>
                        <input
                          type="text"
                          required
                          value={galleryImageForm.titleAr || ''}
                          onChange={(e) => setGalleryImageForm({ ...galleryImageForm, titleAr: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-[11px] transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-slate-700">Image Title (English)</label>
                        <input
                          type="text"
                          required
                          value={galleryImageForm.titleEn || ''}
                          onChange={(e) => setGalleryImageForm({ ...galleryImageForm, titleEn: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-[11px] text-left transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-slate-700">شرح الصورة بالتفصيل (عربي)</label>
                        <textarea
                          required
                          rows={3}
                          value={galleryImageForm.descAr || ''}
                          onChange={(e) => setGalleryImageForm({ ...galleryImageForm, descAr: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl leading-normal text-right text-[11px] transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-slate-700">Description details (English)</label>
                        <textarea
                          required
                          rows={3}
                          value={galleryImageForm.descEn || ''}
                          onChange={(e) => setGalleryImageForm({ ...galleryImageForm, descEn: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl leading-normal text-left text-[11px] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setGalleryImageForm(null)}
                        className="p-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl cursor-pointer"
                      >
                        إلغاء الأمر
                      </button>
                      <button
                        type="submit"
                        className="p-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                      >
                        <Save size={13} />
                        <span>حفظ بيانات الصورة</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid display of existing gallery images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {galleryImages.map((img, idx) => (
                <div
                  key={img.id || idx}
                  className={`bg-white border rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between text-right transition-all group ${
                    img.isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="relative aspect-video">
                    <img src={img.url} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102" alt="" referrerPolicy="no-referrer" />
                    
                    {/* Selected Active Badge */}
                    <button
                      type="button"
                      onClick={() => handleToggleGalleryImageSelect(img.id)}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-full border shadow-xs transition-all cursor-pointer ${
                        img.isSelected
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-white/90 text-slate-400 border-slate-200'
                      }`}
                      title={img.isSelected ? 'نشط في الموقع التسويقي' : 'غير معروض حالياً'}
                    >
                      <Check size={14} strokeWidth={3} />
                    </button>

                    {/* Category Label */}
                    <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 border border-white/20 text-white text-[8.5px] font-black p-1 px-2.5 rounded-lg font-mono">
                      {img.category === 'heavy' ? 'HEAVY MACHINERY' :
                       img.category === 'diesel' ? 'DIESEL ENGINE' :
                       img.category === 'workshop' ? 'WORKSHOP OPS' : 'FLEET SUPPORT'}
                    </div>
                  </div>

                  <div className="p-4.5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[12px] font-black text-slate-900 leading-snug">
                          {language === 'ar' ? img.titleAr : img.titleEn}
                        </h5>
                        <span className={`text-[8px] font-black p-0.5 px-2 rounded-md ${
                          img.isSelected 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {img.isSelected ? 'نشط' : 'مسودة'}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed line-clamp-2">
                        {language === 'ar' ? img.descAr : img.descEn}
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setGalleryImageForm({ ...img })}
                        className="p-1.5 px-3 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-lg text-[10.5px] font-bold cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        <Edit3 size={11} />
                        <span>تعديل</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryImage(img.id)}
                        className="p-1.5 px-3 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded-lg text-[10.5px] font-bold cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        <Trash2 size={11} />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ----------------- TAB 10: VIDEO TUTORIALS & ACADEMY CMS ----------------- */}
        {activeSubTab === 'tutorials' && (
          <div className="space-y-6">
            {/* Header Title & Actions */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 text-xs font-bold mb-3">
                    <Video size={14} className="text-purple-300" />
                    <span>{language === 'ar' ? 'إدارة أكاديمية المنصة ومركز الشروحات التدريبية' : 'Platform Academy & Video Tutorials CMS'}</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">
                    {language === 'ar' ? 'مكتبة الفيديوهات والشروحات المعتمدة' : 'Verified Video Tutorials & Knowledge Base'}
                  </h3>
                  <p className="text-purple-200/80 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                    {language === 'ar'
                      ? 'تحكم بكافة مقاطع الفيديو الإرشادية، وروابط يوتيوب/MP4، والمحاكيات التفاعلية المعروضة للمشتركين والعملاء في كافة أنحاء المنصة.'
                      : 'Manage instructional video links, YouTube/MP4 streaming assets, and interactive simulations provided to subscribers.'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {hiddenTutorialIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleRestoreAllTutorials}
                      className="px-3.5 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
                      title={language === 'ar' ? 'استعادة كافة الشروحات الافتراضية المحذوفة' : 'Restore Hidden Default Tutorials'}
                    >
                      <RotateCcw size={14} />
                      <span>{language === 'ar' ? `استعادة المحذوفات (${hiddenTutorialIds.length})` : `Restore (${hiddenTutorialIds.length})`}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowTenantPreviewModal(true)}
                    className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/20 flex items-center gap-2 transition backdrop-blur-md cursor-pointer"
                    title={language === 'ar' ? 'معاينة تجربة المشتركين الحية بدون أدوات الإدارة' : 'Live Tenant Mode Preview'}
                  >
                    <Eye size={15} className="text-purple-300" />
                    <span>{language === 'ar' ? 'معاينة واجهة المشتركين' : 'Tenant Preview'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenTutorialEditor()}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-xs font-black shadow-lg shadow-purple-900/40 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>{language === 'ar' ? 'إضافة شرح تدريبي جديد' : 'Add New Tutorial'}</span>
                  </button>
                </div>
              </div>

              {/* KPI Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-[11px] text-purple-200 font-bold block">{language === 'ar' ? 'إجمالي الشروحات' : 'Total Tutorials'}</span>
                  <span className="text-2xl font-black text-white">{allPlatformTutorials.length}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-[11px] text-purple-200 font-bold block">{language === 'ar' ? 'شروحات أضافها المشرف' : 'Custom Added'}</span>
                  <span className="text-2xl font-black text-amber-300">{customTutorials.length}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-[11px] text-purple-200 font-bold block">{language === 'ar' ? 'فيديوهات برابط مخصص' : 'Custom Video Links'}</span>
                  <span className="text-2xl font-black text-emerald-300">
                    {allPlatformTutorials.filter(t => customVideoUrls[t.id] || t.videoUrl).length}
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-[11px] text-purple-200 font-bold block">{language === 'ar' ? 'محاكيات تفاعلية نشطة' : 'Interactive Stages'}</span>
                  <span className="text-2xl font-black text-cyan-300">
                    {allPlatformTutorials.filter(t => (t as any).steps && (t as any).steps.length > 0).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                  <Search size={15} className="absolute top-1/2 -translate-y-1/2 start-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={tutorialSearchQuery}
                    onChange={(e) => setTutorialSearchQuery(e.target.value)}
                    placeholder={language === 'ar' ? 'بحث بالعنوان، الوصف، أو التصنيف التشغيلي...' : 'Search tutorial titles, topics or categories...'}
                    className="w-full ps-10 pe-9 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                  />
                  {tutorialSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTutorialSearchQuery('')}
                      className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Category Dropdown Filter */}
                <select
                  value={tutorialCategoryFilter}
                  onChange={(e) => setTutorialCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
                >
                  <option value="all">{language === 'ar' ? '📂 كل التصنيفات التشغيلية' : 'All Categories'}</option>
                  <option value="fleet_setup">{language === 'ar' ? '🚗 تأسيس الأسطول والبيانات' : 'Fleet Setup'}</option>
                  <option value="inspection_qr">{language === 'ar' ? '📱 الفحص اليومي QR' : 'QR Inspection'}</option>
                  <option value="work_orders">{language === 'ar' ? '🛠️ أوامر العمل والصيانة' : 'Work Orders'}</option>
                  <option value="inventory">{language === 'ar' ? '📦 المستودع وقطع الغيار' : 'Inventory & Parts'}</option>
                  <option value="pm_schedules">{language === 'ar' ? '📅 الصيانة الوقائية والمجدولة' : 'PM Schedules'}</option>
                  <option value="ai_analytics">{language === 'ar' ? '🤖 الذكاء الاصطناعي والتحليلات' : 'AI Analytics'}</option>
                </select>
              </div>

              {/* Vehicle Category Chips Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 shrink-0 me-1">
                  {language === 'ar' ? 'نوع المركبة:' : 'Vehicle:'}
                </span>
                {VEHICLE_TYPE_FILTERS.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTutorialVehicleFilter(f.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition cursor-pointer ${
                      tutorialVehicleFilter === f.id
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {language === 'ar' ? f.labelAr : f.labelEn}
                  </button>
                ))}
              </div>

              {/* Maintenance Category Chips Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 shrink-0 me-1">
                  {language === 'ar' ? 'نوع الصيانة:' : 'Maintenance:'}
                </span>
                {MAINTENANCE_TYPE_FILTERS.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTutorialMaintenanceFilter(f.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition cursor-pointer ${
                      tutorialMaintenanceFilter === f.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {language === 'ar' ? f.labelAr : f.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Tutorials List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAdminTutorials.map((tut) => {
                const activeUrl = customVideoUrls[tut.id] || tut.videoUrl;
                const isCustom = customTutorials.some(c => c.id === tut.id);
                const stepsCount = (tut as any).steps?.length || 0;

                return (
                  <div
                    key={tut.id}
                    className="bg-white rounded-3xl border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Top gradient banner */}
                    <div className={`p-4 bg-gradient-to-r ${tut.gradient || 'from-purple-600 to-indigo-700'} text-white relative`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs border border-white/20">
                          {language === 'ar' ? tut.categoryLabelAr : tut.categoryLabelEn}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-xs flex items-center gap-1">
                            <Clock size={10} />
                            <span>{tut.duration}</span>
                          </span>
                          {isCustom ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                              {language === 'ar' ? 'مخصص' : 'Custom'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                              {tut.badgeAr || 'معتمد'}
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-base font-black text-white mt-3 leading-snug line-clamp-1">
                        {language === 'ar' ? tut.titleAr : tut.titleEn}
                      </h4>
                      <p className="text-[11px] text-white/80 font-medium line-clamp-1 mt-0.5">
                        {language === 'ar' ? tut.titleEn : tut.titleAr}
                      </p>
                    </div>

                    {/* Middle Card Content */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {language === 'ar' ? tut.descriptionAr : tut.descriptionEn}
                        </p>

                        {/* Video URL or Interactive Stage status */}
                        <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-500 flex items-center gap-1">
                              <Video size={12} className={activeUrl ? 'text-emerald-500' : 'text-purple-500'} />
                              <span>{language === 'ar' ? 'مصدر العرض:' : 'Display Source:'}</span>
                            </span>
                            {activeUrl ? (
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                                {language === 'ar' ? 'فيديو سحابي نشط' : 'Active Video URL'}
                              </span>
                            ) : (
                              <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 text-[10px]">
                                {language === 'ar' ? 'محاكي تفاعلي حي' : 'Interactive Stage'}
                              </span>
                            )}
                          </div>
                          {activeUrl && (
                            <div className="text-[10px] font-mono text-slate-500 truncate bg-white px-2 py-1 rounded-lg border border-slate-200 flex items-center justify-between">
                              <span className="truncate">{activeUrl}</span>
                              <a
                                href={activeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ms-1.5 text-purple-600 hover:text-purple-800 shrink-0"
                              >
                                <ExternalLink size={10} />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Feature Badges */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {language === 'ar' ? `المستوى: ${tut.levelAr}` : `Level: ${tut.levelEn}`}
                          </span>
                          {stepsCount > 0 && (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                              {language === 'ar' ? `${stepsCount} خطوات تشغيل` : `${stepsCount} SOP Steps`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 space-y-2 mt-3">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedTutorialForPreview(tut)}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-purple-100"
                            title={language === 'ar' ? 'تشغيل ومعاينة الشرح في المشغل التفاعلي' : 'Live Preview in Player'}
                          >
                            <Play size={12} />
                            <span>{language === 'ar' ? 'معاينة وتشغيل' : 'Preview'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setQuickUrlModalTutorial(tut);
                              setQuickUrlInput(customVideoUrls[tut.id] || tut.videoUrl || '');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                            title={language === 'ar' ? 'ربط أو تعديل رابط يوتيوب أو MP4' : 'Edit Video URL'}
                          >
                            <Link2 size={12} />
                            <span>{language === 'ar' ? 'ربط الرابط' : 'Set Link'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenTutorialEditor(tut)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition border border-slate-200 cursor-pointer"
                          >
                            <Edit3 size={12} />
                            <span>{language === 'ar' ? 'تعديل الشرح والخطوات' : 'Edit Tutorial'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTutorial(tut)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-bold transition border border-rose-200 hover:border-rose-600 cursor-pointer flex items-center gap-1 shrink-0"
                            title={language === 'ar' ? 'حذف هذا الشرح التدريبي' : 'Delete Tutorial'}
                          >
                            <Trash2 size={12} />
                            <span className="hidden sm:inline">{language === 'ar' ? 'حذف' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAdminTutorials.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                  <Video size={28} />
                </div>
                <h4 className="text-base font-black text-slate-800">
                  {language === 'ar' ? 'لم يتم العثور على شروحات مطابقة' : 'No matching tutorials found'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {language === 'ar'
                    ? 'جرب تغيير عبارة البحث أو الفلاتر المختارة، أو أضف شرحاً تدريبياً جديداً.'
                    : 'Try clearing your search query or add a new video tutorial.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTutorialSearchQuery('');
                    setTutorialCategoryFilter('all');
                    setTutorialVehicleFilter('all');
                    setTutorialMaintenanceFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {language === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ----------------- MODAL 1: ADD OR EDIT VIDEO TUTORIAL ----------------- */}
        {showAddOrEditTutorialModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <Video size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black">
                      {editingTutorial
                        ? (language === 'ar' ? 'تعديل الشرح التدريبي' : 'Edit Video Tutorial')
                        : (language === 'ar' ? 'إضافة شرح تدريبي وفيديو جديد' : 'Add New Video Tutorial')}
                    </h3>
                    <p className="text-purple-200/80 text-xs">
                      {language === 'ar' ? 'سيتاح هذا الشرح مباشرة لكافة المشتركين عبر الأكاديمية' : 'This tutorial will be available across the platform'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddOrEditTutorialModal(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
                {/* Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {language === 'ar' ? 'عنوان الشرح (بالعربية) *' : 'Title (Arabic) *'}
                    </label>
                    <input
                      type="text"
                      value={tutorialForm.titleAr}
                      onChange={(e) => setTutorialForm({ ...tutorialForm, titleAr: e.target.value })}
                      placeholder="مثال: كيفية إجراء الفحص اليومي للمركبة عبر الـ QR"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {language === 'ar' ? 'عنوان الشرح (بالإنجليزية)' : 'Title (English)'}
                    </label>
                    <input
                      type="text"
                      value={tutorialForm.titleEn}
                      onChange={(e) => setTutorialForm({ ...tutorialForm, titleEn: e.target.value })}
                      placeholder="e.g. How to complete daily vehicle QR inspection"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Video URL with Instant Live Check */}
                <div className="space-y-2 bg-purple-50/60 border border-purple-100 p-4 rounded-2xl">
                  <label className="text-xs font-bold text-purple-950 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Link2 size={13} className="text-purple-600" />
                      <span>{language === 'ar' ? 'رابط الفيديو (YouTube، Vimeo، أو رابط MP4 مباشر):' : 'Video URL (YouTube, Vimeo, MP4 direct):'}</span>
                    </span>
                    <span className="text-[10px] text-purple-600 font-normal">
                      {language === 'ar' ? 'اختياري (سيعمل المحاكي التفاعلي تلقائياً إن تُرِك فارغاً)' : 'Optional (interactive stage is default)'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={tutorialForm.videoUrl}
                    onChange={(e) => setTutorialForm({ ...tutorialForm, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... أو https://.../video.mp4"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-purple-200 text-xs font-mono font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                    dir="ltr"
                  />

                  {/* Warning if text entered is not a valid URL */}
                  {tutorialForm.videoUrl && !/^https?:\/\//i.test(tutorialForm.videoUrl.trim()) && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5">
                      <Info size={14} className="shrink-0 text-amber-600" />
                      <span>
                        {language === 'ar' 
                          ? 'تنبيه: يرجى إدخال رابط يبدأ بـ https:// (مثل: https://www.youtube.com/watch?v=... أو رابط مباشر .mp4) ليعمل مشغل الفيديو بشكل سليم.' 
                          : 'Notice: Please ensure URL begins with https:// (e.g. YouTube or direct .mp4) for video playback.'}
                      </span>
                    </div>
                  )}

                  {/* Live Video Preview Box */}
                  {tutorialForm.videoUrl && formatEmbedUrl(tutorialForm.videoUrl) && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                          <Tv size={12} className="text-purple-600" />
                          {language === 'ar' ? 'معاينة مشغل الفيديو الحي:' : 'Live Video Preview:'}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          {language === 'ar' ? 'رابط متصل وصالح' : 'Connected Link'}
                        </span>
                      </div>
                      <div className="aspect-video max-h-52 rounded-xl overflow-hidden bg-black border border-slate-300 shadow-inner">
                        {formatEmbedUrl(tutorialForm.videoUrl).endsWith('.mp4') || formatEmbedUrl(tutorialForm.videoUrl).endsWith('.webm') ? (
                          <video controls src={formatEmbedUrl(tutorialForm.videoUrl)} className="w-full h-full object-contain" />
                        ) : (
                          <iframe
                            src={formatEmbedUrl(tutorialForm.videoUrl)}
                            className="w-full h-full border-0"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Category & Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {language === 'ar' ? 'التصنيف التشغيلي' : 'Category'}
                    </label>
                    <select
                      value={tutorialForm.category}
                      onChange={(e) => {
                        const cat = e.target.value as any;
                        const labels: Record<string, { ar: string; en: string }> = {
                          fleet_setup: { ar: 'تأسيس الأسطول والبيانات', en: 'Fleet Setup & Assets' },
                          inspection_qr: { ar: 'الفحص اليومي وتطبيق السائق', en: 'Driver QR Inspections' },
                          work_orders: { ar: 'أوامر العمل وإصلاح الورشة', en: 'Work Orders & Workshop' },
                          inventory: { ar: 'إدارة قطع الغيار والمستودع', en: 'Inventory & Spare Parts' },
                          pm_schedules: { ar: 'الصيانة الوقائية والمجدولة', en: 'Preventative PM Schedules' },
                          ai_analytics: { ar: 'التحليلات والتنبؤ بالذكاء الاصطناعي', en: 'AI Diagnostics & Insights' }
                        };
                        setTutorialForm({
                          ...tutorialForm,
                          category: cat,
                          categoryLabelAr: labels[cat]?.ar || cat,
                          categoryLabelEn: labels[cat]?.en || cat
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                    >
                      <option value="fleet_setup">🚗 تأسيس الأسطول والبيانات</option>
                      <option value="inspection_qr">📱 الفحص اليومي QR</option>
                      <option value="work_orders">🛠️ أوامر العمل والصيانة</option>
                      <option value="inventory">📦 المستودع وقطع الغيار</option>
                      <option value="pm_schedules">📅 الصيانة الوقائية والمجدولة</option>
                      <option value="ai_analytics">🤖 الذكاء الاصطناعي والتحليلات</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {language === 'ar' ? 'المدة التقديرية' : 'Duration'}
                    </label>
                    <input
                      type="text"
                      value={tutorialForm.duration}
                      onChange={(e) => setTutorialForm({ ...tutorialForm, duration: e.target.value })}
                      placeholder="5:00"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {language === 'ar' ? 'المستوى المستهدف' : 'Target Level'}
                    </label>
                    <select
                      value={tutorialForm.levelAr}
                      onChange={(e) => {
                        const lvl = e.target.value as any;
                        const map: Record<string, string> = {
                          'مبتدئ': 'Beginner',
                          'متوسط': 'Intermediate',
                          'متقدم': 'Advanced',
                          'للمدراء والتنفيذيين': 'Executive',
                          'فني وميداني': 'Field & Tech'
                        };
                        setTutorialForm({
                          ...tutorialForm,
                          levelAr: lvl,
                          levelEn: map[lvl] as any || 'Beginner'
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                    >
                      <option value="مبتدئ">مبتدئ (Beginner)</option>
                      <option value="متوسط">متوسط (Intermediate)</option>
                      <option value="متقدم">متقدم (Advanced)</option>
                      <option value="للمدراء والتنفيذيين">للمدراء والتنفيذيين (Executive)</option>
                      <option value="فني وميداني">فني وميداني (Field & Tech)</option>
                    </select>
                  </div>
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {language === 'ar' ? 'الوصف ومخرجات التعلم (بالعربية)' : 'Description (Arabic)'}
                    </label>
                    <textarea
                      rows={3}
                      value={tutorialForm.descriptionAr}
                      onChange={(e) => setTutorialForm({ ...tutorialForm, descriptionAr: e.target.value })}
                      placeholder="شرح موجز لأهمية هذا الإجراء في النظام وكيفية الاستفادة منه..."
                      className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {language === 'ar' ? 'الوصف (بالإنجليزية)' : 'Description (English)'}
                    </label>
                    <textarea
                      rows={3}
                      value={tutorialForm.descriptionEn}
                      onChange={(e) => setTutorialForm({ ...tutorialForm, descriptionEn: e.target.value })}
                      placeholder="Brief overview of operational goals..."
                      className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* SOP Steps Checklist */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>{language === 'ar' ? 'خطوات التنفيذ التشغيلي S.O.P (اكتب كل خطوة بسطر منفصل)' : 'Standard Operating Steps (one per line)'}</span>
                    <span className="text-[10px] text-purple-600 font-bold">
                      {tutorialForm.stepsTextAr.split('\n').filter(s => s.trim().length > 0).length} {language === 'ar' ? 'خطوات مسجلة' : 'steps registered'}
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    value={tutorialForm.stepsTextAr}
                    onChange={(e) => setTutorialForm({ ...tutorialForm, stepsTextAr: e.target.value })}
                    placeholder="الخطوة 1: تسجيل الدخول واختيار المركبة&#10;الخطوة 2: فحص قراءات العداد والوقود&#10;الخطوة 3: توثيق الصور والاعتماد"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono leading-relaxed"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2.5 shrink-0">
                {editingTutorial ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteTutorial(editingTutorial);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-bold transition border border-rose-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    <span>{language === 'ar' ? 'حذف هذا الشرح' : 'Delete Tutorial'}</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddOrEditTutorialModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTutorial}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
                  >
                    <Save size={15} />
                    <span>{language === 'ar' ? 'حفظ وتحديث المكتبة' : 'Save Tutorial'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- MODAL 2: QUICK VIDEO URL UPDATE ----------------- */}
        {quickUrlModalTutorial && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Link2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">
                      {language === 'ar' ? 'ربط رابط فيديو للشرح' : 'Link Video URL'}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      {language === 'ar' ? quickUrlModalTutorial.titleAr : quickUrlModalTutorial.titleEn}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickUrlModalTutorial(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'ar' ? 'رابط الفيديو المباشر أو اليوتيوب:' : 'Direct Video or YouTube URL:'}
                </label>
                <input
                  type="url"
                  value={quickUrlInput}
                  onChange={(e) => setQuickUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... أو MP4"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  dir="ltr"
                />
                <p className="text-[10px] text-slate-400">
                  {language === 'ar'
                    ? 'سيتم عرض هذا الفيديو فوراً للمشتركين عند فتح هذا الدرس في مكتبة الشروحات.'
                    : 'This video will stream directly to subscribers when opening this tutorial.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {quickUrlInput && (
                  <button
                    type="button"
                    onClick={() => setQuickUrlInput('')}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    {language === 'ar' ? 'مسح الرابط' : 'Clear Link'}
                  </button>
                )}
                <div className="flex items-center gap-2 ms-auto">
                  <button
                    type="button"
                    onClick={() => setQuickUrlModalTutorial(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveQuickUrl}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer shadow-xs"
                  >
                    {language === 'ar' ? 'حفظ الرابط' : 'Save URL'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- MODAL 3: LIVE ADMIN PLAYER PREVIEW ----------------- */}
        {selectedTutorialForPreview && (
          <VideoTutorialsModal
            isOpen={true}
            onClose={() => setSelectedTutorialForPreview(null)}
            isDarkMode={false}
            initialVideoId={selectedTutorialForPreview.id}
            isAdmin={true}
          />
        )}

        {/* ----------------- MODAL 4: TENANT MODE PREVIEW (CLEAN USER VIEW) ----------------- */}
        {showTenantPreviewModal && (
          <VideoTutorialsModal
            isOpen={true}
            onClose={() => setShowTenantPreviewModal(false)}
            isDarkMode={false}
            isAdmin={false}
          />
        )}

        {/* ----------------- MODAL 5: DELETE TUTORIAL CONFIRMATION DIALOG ----------------- */}
        {tutorialToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    {language === 'ar' ? 'تأكيد حذف الشرح التدريبي' : 'Confirm Delete Tutorial'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'ar'
                      ? 'هل أنت متأكد من رغبتك في حذف هذا الشرح من المنصة؟'
                      : 'Are you sure you want to delete this tutorial from the library?'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">
                  {language === 'ar' ? tutorialToDelete.categoryLabelAr : tutorialToDelete.categoryLabelEn}
                </span>
                <p className="text-xs font-black text-slate-800">
                  {language === 'ar' ? tutorialToDelete.titleAr : tutorialToDelete.titleEn}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setTutorialToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => executeDeleteTutorial(tutorialToDelete.id)}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>{language === 'ar' ? 'تأكيد الحذف النهائي' : 'Yes, Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      {/* End of side-by-side wrapper */}
      </div>
    </div>
  );
}
