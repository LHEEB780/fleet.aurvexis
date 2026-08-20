import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Clock,
  BookOpen,
  CheckCircle2,
  Download,
  Search,
  Sparkles,
  X,
  Flame,
  HelpCircle,
  Video,
  ListVideo,
  Share2,
  ExternalLink,
  Check,
  Wrench,
  ShieldCheck,
  TrendingUp,
  Cpu,
  FileSpreadsheet,
  QrCode,
  Layers,
  CheckCircle,
  PlaySquare,
  Sun,
  Moon,
  LayoutDashboard,
  Truck,
  Boxes,
  CalendarCheck,
  BrainCircuit,
  SlidersHorizontal,
  ChevronRight,
  ArrowUpRight,
  Filter,
  ChevronDown,
  ChevronUp,
  Tag,
  Tags,
  Car,
  Snowflake,
  HardHat,
  Zap,
  Gauge,
  Heart
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';

export type VehicleCategoryType = 
  | 'all'
  | 'heavy_trucks'     // شاحنات ثقيلة ومقطورات
  | 'light_commercial' // فانات وتوصيل تجاري
  | 'heavy_machinery'  // معدات وآليات ثقيلة
  | 'reefer_cold'      // شاحنات التبريد وسلاسل الإمداد
  | 'passenger_fleet'  // بيك أب وسيارات إشراف
  | 'ev_hybrid';       // مركبات كهربائية وهجينة

export type MaintenanceCategoryType =
  | 'all'
  | 'preventative_pm'      // الصيانة الوقائية والجدولة الدورية PM
  | 'corrective_repair'    // أوامر العمل والإصلاحات الورشية
  | 'daily_inspection'     // الفحص اليومي الميداني ورموز QR
  | 'spare_parts_stock'    // قطع الغيار والمستودعات والباركود
  | 'heavy_plant_hours'    // صيانة المعدات الثقيلة وساعات التشغيل
  | 'cold_chain_temp'      // صيانة شاحنات التبريد ومراقبة الحرارة
  | 'ai_diagnostics';      // التحليلات وتكلفة الكيلومتر والتشخيص الذكي

export interface MaintenanceTypeFilterItem {
  id: MaintenanceCategoryType;
  labelAr: string;
  labelEn: string;
  shortLabelAr: string;
  shortLabelEn: string;
  emoji: string;
  iconName: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const MAINTENANCE_TYPE_FILTERS: MaintenanceTypeFilterItem[] = [
  {
    id: 'all',
    labelAr: 'كافة أنواع الصيانة والعمليات',
    labelEn: 'All Maintenance Types',
    shortLabelAr: 'الكل',
    shortLabelEn: 'All',
    emoji: '🔧',
    iconName: 'Wrench',
    descriptionAr: 'جميع شروحات الصيانة والفحوصات والعمليات',
    descriptionEn: 'All maintenance and inspection tutorials'
  },
  {
    id: 'preventative_pm',
    labelAr: 'الصيانة الوقائية والجدولة الدورية (PM)',
    labelEn: 'Preventative PM & Periodic Scheduling',
    shortLabelAr: 'صيانة وقائية PM',
    shortLabelEn: 'Preventative PM',
    emoji: '🛡️',
    iconName: 'ShieldCheck',
    descriptionAr: 'جداول تغيير الزيوت، الفلاتر، المكابح والتنبيهات المسبقة',
    descriptionEn: 'Oil drain intervals, scheduled services & proactive alerts'
  },
  {
    id: 'corrective_repair',
    labelAr: 'أوامر العمل والإصلاحات الورشية (Work Orders)',
    labelEn: 'Work Orders & Corrective Repairs',
    shortLabelAr: 'أوامر العمل والإصلاح',
    shortLabelEn: 'Work Orders',
    emoji: '⚙️',
    iconName: 'Wrench',
    descriptionAr: 'تتبع ساعات الفنيين، تكلفة اليد العاملة، والإصلاحات الطارئة',
    descriptionEn: 'Technician labor hours, repair costs & work orders'
  },
  {
    id: 'daily_inspection',
    labelAr: 'الفحص اليومي الميداني ورموز QR (Walkaround)',
    labelEn: 'Daily Walkaround & QR Code Inspections',
    shortLabelAr: 'فحص يومي QR',
    shortLabelEn: 'QR Inspection',
    emoji: '📱',
    iconName: 'QrCode',
    descriptionAr: 'قوائم التحقق اليومية للسائقين، فحص الأمان، وتوثيق الصور',
    descriptionEn: 'Mobile driver checklists, defect logging & photo audits'
  },
  {
    id: 'spare_parts_stock',
    labelAr: 'إدارة قطع الغيار والمستودعات والباركود',
    labelEn: 'Spare Parts Inventory & Barcode Tracking',
    shortLabelAr: 'قطع الغيار والمستودع',
    shortLabelEn: 'Parts & Stock',
    emoji: '📦',
    iconName: 'Boxes',
    descriptionAr: 'حد الطلب الأدنى، جرد الأرفف بالباركود، وأكواد OEM',
    descriptionEn: 'Reorder limits, warehouse bin barcodes & OEM parts'
  },
  {
    id: 'heavy_plant_hours',
    labelAr: 'صيانة المعدات الثقيلة وساعات التشغيل (Engine Hours)',
    labelEn: 'Plant Machinery & Engine Hours PM',
    shortLabelAr: 'ساعات تشغيل المعدات',
    shortLabelEn: 'Engine Hours PM',
    emoji: '🏗️',
    iconName: 'HardHat',
    descriptionAr: 'صيانة الهيدروليك، تشحيم البنزات، وفترات ساعات الدوران',
    descriptionEn: 'Hydraulic servicing, greasing & runtime hour intervals'
  },
  {
    id: 'cold_chain_temp',
    labelAr: 'صيانة شاحنات التبريد ومراقبة الحرارة (Reefer PM)',
    labelEn: 'Cold Chain Reefer & Temperature PM',
    shortLabelAr: 'صيانة التبريد Reefer',
    shortLabelEn: 'Reefer PM',
    emoji: '❄️',
    iconName: 'Snowflake',
    descriptionAr: 'محركات التبريد ثيرمو كينج، مستشعرات IoT وعوازل الأبواب',
    descriptionEn: 'Reefer engines, IoT temperature curves & door seals'
  },
  {
    id: 'ai_diagnostics',
    labelAr: 'التحليلات المالية والتشخيص الذكي (CPK & AI)',
    labelEn: 'Financial CPK & Predictive AI Diagnostics',
    shortLabelAr: 'تحليلات وتكلفة CPK',
    shortLabelEn: 'AI & CPK',
    emoji: '📊',
    iconName: 'BrainCircuit',
    descriptionAr: 'حساب تكلفة الكيلومتر CPK، اكتشاف الهدر وتنبؤات الأعطال',
    descriptionEn: 'Cost-per-km metrics, lemon asset detection & AI forecasting'
  }
];

export interface VehicleTypeFilterItem {
  id: VehicleCategoryType;
  labelAr: string;
  labelEn: string;
  shortLabelAr: string;
  shortLabelEn: string;
  emoji: string;
  iconName: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const VEHICLE_TYPE_FILTERS: VehicleTypeFilterItem[] = [
  {
    id: 'all',
    labelAr: 'جميع المركبات والأسطول',
    labelEn: 'All Fleet Types',
    shortLabelAr: 'الكل',
    shortLabelEn: 'All',
    emoji: '🌐',
    iconName: 'Layers',
    descriptionAr: 'شروحات شاملة لكافة فئات المركبات والمعدات',
    descriptionEn: 'Universal tutorials for all vehicle classes'
  },
  {
    id: 'heavy_trucks',
    labelAr: 'شاحنات ثقيلة وتريلات',
    labelEn: 'Heavy Trucks & Semis',
    shortLabelAr: 'شاحنات ثقيلة',
    shortLabelEn: 'Heavy Trucks',
    emoji: '🚛',
    iconName: 'Truck',
    descriptionAr: 'مرسيدس أكتروس، فولفو FH، مان، قاطرات ومقطورات',
    descriptionEn: 'Mercedes Actros, Volvo FH, MAN, prime movers'
  },
  {
    id: 'light_commercial',
    labelAr: 'فانات وتوصيل تجاري',
    labelEn: 'Light Vans & Delivery',
    shortLabelAr: 'فانات وتوصيل',
    shortLabelEn: 'Delivery Vans',
    emoji: '🚐',
    iconName: 'Truck',
    descriptionAr: 'فانات بضائع، شاحنات 3.5 طن، أساطيل الميل الأخير',
    descriptionEn: 'Cargo vans, 3.5T trucks, last-mile couriers'
  },
  {
    id: 'heavy_machinery',
    labelAr: 'آليات ومعدات ثقيلة',
    labelEn: 'Heavy Plant & Machinery',
    shortLabelAr: 'معدات ثقيلة',
    shortLabelEn: 'Heavy Plant',
    emoji: '🏗️',
    iconName: 'HardHat',
    descriptionAr: 'حفارات، شيولات، لوادر، ومولدات موقعية بساعات التشغيل',
    descriptionEn: 'Excavators, wheel loaders, cranes & hour-meter assets'
  },
  {
    id: 'reefer_cold',
    labelAr: 'شاحنات التبريد وسلاسل الإمداد',
    labelEn: 'Reefer & Cold Chain',
    shortLabelAr: 'شاحنات مبردة',
    shortLabelEn: 'Cold Chain',
    emoji: '❄️',
    iconName: 'Snowflake',
    descriptionAr: 'وحدات تبريد ثيرمو كينج وكارير لنقل الأغذية والأدوية',
    descriptionEn: 'Thermo King & Carrier temperature-controlled fleets'
  },
  {
    id: 'passenger_fleet',
    labelAr: 'بيك أب وسيارات إشراف',
    labelEn: 'Pickups & Passenger Fleet',
    shortLabelAr: 'بيك أب وسيارات',
    shortLabelEn: 'Pickups & Cars',
    emoji: '🛻',
    iconName: 'Car',
    descriptionAr: 'تويوتا هايلوكس، مركبات الخدمة الميدانية والمشرفين',
    descriptionEn: 'Supervisory pickups, SUVs, and field service fleet'
  },
  {
    id: 'ev_hybrid',
    labelAr: 'مركبات كهربائية وهجينة',
    labelEn: 'EV & Electric Fleets',
    shortLabelAr: 'كهربائية EV',
    shortLabelEn: 'EV & Hybrid',
    emoji: '⚡',
    iconName: 'Zap',
    descriptionAr: 'شاحنات وفانات كهربائية، محطات شحن وبطاريات',
    descriptionEn: 'Zero-emission electric delivery and charging assets'
  }
];

export interface VideoTutorial {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: 'fleet_setup' | 'inspection_qr' | 'work_orders' | 'inventory' | 'pm_schedules' | 'ai_analytics';
  categoryLabelAr: string;
  categoryLabelEn: string;
  duration: string;
  levelAr: 'مبتدئ' | 'متوسط' | 'متقدم' | 'للمدراء والتنفيذيين' | 'فني وميداني';
  levelEn: 'Beginner' | 'Intermediate' | 'Advanced' | 'Executive' | 'Field & Tech';
  badgeAr?: string;
  badgeEn?: string;
  gradient: string;
  accentColor: string;
  iconName: string;
  applicableVehicles: VehicleCategoryType[];
  applicableMaintenanceTypes: MaintenanceCategoryType[];
  tagsAr: string[];
  tagsEn: string[];
  primaryVehicleAr: string;
  primaryVehicleEn: string;
  primaryMaintenanceAr: string;
  primaryMaintenanceEn: string;
  chapters: {
    time: string;
    seconds: number;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
  }[];
  steps: {
    stepNumber: number;
    titleAr: string;
    titleEn: string;
    detailAr: string;
    detailEn: string;
    actionTipAr?: string;
    actionTipEn?: string;
  }[];
  keyTakeawaysAr: string[];
  keyTakeawaysEn: string[];
  faqsAr: { q: string; a: string }[];
  faqsEn: { q: string; a: string }[];
  downloadableTemplate?: {
    nameAr: string;
    nameEn: string;
    fileType: string;
    size: string;
  };
}

export const VIDEO_TUTORIALS_DATA: VideoTutorial[] = [
  {
    id: 'vid-1',
    titleAr: 'دليل البدء السريع: استيراد وتأسيس أسطول المركبات عبر ملفات Excel و CSV',
    titleEn: 'Quick Start: Bulk Fleet Import & Vehicle Setup via Excel / CSV',
    descriptionAr: 'تعلم كيفية استيراد مئات الشاحنات والمركبات في دقائق معدودة، وتعيين السائقين، وضبط قراءات العدادات ومراكز التكلفة تلقائياً.',
    descriptionEn: 'Learn how to bulk import hundreds of fleet assets in minutes, map drivers, and configure initial odometer baselines and cost centers seamlessly.',
    category: 'fleet_setup',
    categoryLabelAr: 'إدارة وتأسيس الأسطول',
    categoryLabelEn: 'Fleet Setup & CSV',
    duration: '06:45',
    levelAr: 'مبتدئ',
    levelEn: 'Beginner',
    badgeAr: 'الأكثر مشاهدة ⭐',
    badgeEn: 'Most Popular ⭐',
    gradient: 'from-purple-950 via-slate-900 to-indigo-950',
    accentColor: '#8b5cf6',
    iconName: 'FileSpreadsheet',
    applicableVehicles: ['heavy_trucks', 'light_commercial', 'heavy_machinery', 'passenger_fleet', 'reefer_cold', 'ev_hybrid'],
    applicableMaintenanceTypes: ['preventative_pm', 'daily_inspection', 'ai_diagnostics'],
    tagsAr: ['شاحنات ثقيلة', 'فانات وتوصيل', 'معدات ثقيلة', 'Excel / CSV', 'تأسيس الأسطول', 'استيراد جماعي'],
    tagsEn: ['Heavy Trucks', 'Delivery Vans', 'Plant Machinery', 'Excel / CSV', 'Fleet Setup', 'Bulk Import'],
    primaryVehicleAr: 'كافة فئات الأسطول والمركبات',
    primaryVehicleEn: 'All Fleet & Vehicle Classes',
    primaryMaintenanceAr: 'تأسيس الأسطول وجداول الصيانة الأولية',
    primaryMaintenanceEn: 'Fleet Setup & Baseline PM Matrices',
    chapters: [
      { time: '00:00', seconds: 0, titleAr: 'مقدمة وتهيئة بيانات الأسطول', titleEn: 'Introduction & Fleet Readiness', descAr: 'نظرة عامة على البيانات المطلوبة لبدء التشغيل.', descEn: 'Overview of required schema and field validation.' },
      { time: '01:30', seconds: 90, titleAr: 'تحميل ومطابقة قالب الاستيراد الموحد', titleEn: 'Downloading & Mapping CSV Template', descAr: 'شرح أعمدة القالب (رقم اللوحة، الهيكل، الطراز، العداد).', descEn: 'Field mapping: Plate, VIN, Model, Odometer.' },
      { time: '03:45', seconds: 225, titleAr: 'التحقق التلقائي ومعالجة التكرار والأخطاء', titleEn: 'Instant Validation & Duplicate Resolver', descAr: 'نظام التدقيق الذكي يكتشف التكرار في أرقام الهياكل.', descEn: 'Smart engine detects VIN duplicates and invalid readings.' },
      { time: '05:10', seconds: 310, titleAr: 'تأكيد الاستيراد وتوليد بطاقات المركبات', titleEn: 'Finalizing Import & Generating Digital Profiles', descAr: 'إنشاء بطاقة رقمية موحدة لكل مركبة مع رمز QR جاهز.', descEn: 'Instant generation of vehicle digital passcards and QR codes.' }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'تنزيل نموذج Excel المعتمد',
        titleEn: 'Download Certified CSV Template',
        detailAr: 'انقر على زر "تحميل القالب المرفق" للحصول على الملف الجاهز مع أمثلة للتعبئة.',
        detailEn: 'Click the download template button to retrieve the standardized structure with sample assets.',
        actionTipAr: 'لا تقم بتعديل أسماء الأعمدة في السطر الأول لضمان المطابقة الآلية.',
        actionTipEn: 'Do not rename header columns to ensure flawless automated column mapping.'
      },
      {
        stepNumber: 2,
        titleAr: 'إسقاط الملف في نافذة الاستيراد الذكي',
        titleEn: 'Drag & Drop into Smart Import Wizard',
        detailAr: 'اسحب الملف إلى لوحة الاستيراد، وسيقوم النظام بمطابقة الحقول تلقائياً والتحقق من صحة أرقام الهياكل VIN.',
        detailEn: 'Drag your file into the importer; our AI parser validates VIN formats and mileage anomalies in seconds.',
        actionTipAr: 'يدعم النظام حتى 5,000 مركبة في العملية الواحدة.',
        actionTipEn: 'Supports up to 5,000 vehicle records per bulk upload.'
      },
      {
        stepNumber: 3,
        titleAr: 'الموافقة على المعاينة وتفعيل الأسطول',
        titleEn: 'Review Audit Preview & Activate Fleet',
        detailAr: 'راجع جدول المعاينة واضغط "تأكيد الاستيراد" لتصبح المركبات متاحة فوراً للتشغيل وإسناد السائقين.',
        detailEn: 'Audit verified records and click Confirm Import to make vehicles immediately active for dispatching.',
        actionTipAr: 'ستصل إشعارات تلقائية للسائقين المعينين عبر التطبيق الميداني.',
        actionTipEn: 'Assigned drivers receive instant SMS and push alerts to link their handsets.'
      }
    ],
    keyTakeawaysAr: [
      'توفير أكثر من 80% من الوقت المستغرق في إدخال بيانات الأسطول يدوياً.',
      'تجنب الأخطاء الشائعة في تسجيل أرقام اللوحات والعدادات الابتدائية.',
      'تجهيز ملفات الصيانة الوقائية والضمان لكل مركبة من اليوم الأول.'
    ],
    keyTakeawaysEn: [
      'Save over 80% of onboarding time compared to manual record entry.',
      'Eliminate human typos across VIN numbers and initial odometers.',
      'Instantly bootstrap warranty and preventative maintenance profiles.'
    ],
    faqsAr: [
      { q: 'ماذا يحدث إذا كان رقم الهيكل مكرراً في النظام؟', a: 'يقوم النظام بتنبيهك ويمنحك خيار تحديث المركبة الحالية أو تجاهل السطر المكرر بأمان.' },
      { q: 'هل يمكن استيراد المعدات الثقيلة بدون لوحات مرورية؟', a: 'نعم، يمكنك استخدام الرقم التسلسلي للمعدة كرقم تعريفي بديل للوحة.' }
    ],
    faqsEn: [
      { q: 'What happens if a duplicate VIN is detected?', a: 'The system highlights the row with options to merge, overwrite, or skip safely.' },
      { q: 'Can heavy plant machinery without road plates be imported?', a: 'Yes, unit serial numbers or asset IDs can replace standard license plates.' }
    ],
    downloadableTemplate: {
      nameAr: 'نموذج_استيراد_الأسطول_المعتمد.csv',
      nameEn: 'FleetAurvexis_Fleet_Import_Template.csv',
      fileType: 'CSV / Excel',
      size: '24 KB'
    }
  },
  {
    id: 'vid-2',
    titleAr: 'تطبيق الفحص اليومي بالهاتف ورموز QR الذكية على المركبات',
    titleEn: 'Digital Daily Walkaround Inspections & QR Asset Scanning',
    descriptionAr: 'كيف يقوم السائق بمسح رمز QR الملصق على الشاحنة، وتعبئة قائمة الفحص الميداني والتقاط صور للأضرار والأعطال خلال 60 ثانية.',
    descriptionEn: 'See how field drivers scan QR codes on vehicles to execute rapid 60-second walkaround inspections and attach photo evidence of defects.',
    category: 'inspection_qr',
    categoryLabelAr: 'الفحوصات ورموز QR',
    categoryLabelEn: 'Inspections & QR',
    duration: '05:30',
    levelAr: 'فني وميداني',
    levelEn: 'Field & Tech',
    badgeAr: 'ميداني وسريع 📱',
    badgeEn: 'Mobile Field 📱',
    gradient: 'from-blue-950 via-slate-900 to-purple-950',
    accentColor: '#3b82f6',
    iconName: 'QrCode',
    applicableVehicles: ['heavy_trucks', 'light_commercial', 'reefer_cold', 'passenger_fleet'],
    applicableMaintenanceTypes: ['daily_inspection', 'corrective_repair', 'cold_chain_temp'],
    tagsAr: ['شاحنات ثقيلة', 'فانات وتوصيل', 'شاحنات تبريد', 'فحص يومي QR', 'سائقين', 'سلامة الطرق'],
    tagsEn: ['Heavy Trucks', 'Delivery Vans', 'Cold Chain Reefer', 'QR Inspection', 'Field Drivers', 'Road Safety'],
    primaryVehicleAr: 'شاحنات وفانات وسلاسل التبريد',
    primaryVehicleEn: 'Trucks, Delivery Vans & Reefer Units',
    primaryMaintenanceAr: 'فحص يومي رقمي وتوثيق الأعطال الحرجة',
    primaryMaintenanceEn: 'Daily Digital Walkaround & Critical Defect Triage',
    chapters: [
      { time: '00:00', seconds: 0, titleAr: 'طباعة وتثبيت ملصقات الـ QR المقاومة للظروف الجوية', titleEn: 'Printing & Affixing Weatherproof QR Badges', descAr: 'طريقة تثبيت الرمز على باب السائق أو الزجاج الأمامي.', descEn: 'Placing scannable NFC/QR tags on vehicle door jambs.' },
      { time: '01:15', seconds: 75, titleAr: 'بدء الفحص بالهاتف بدون الحاجة لتثبيت برامج معقدة', titleEn: 'Instant Mobile Launch via Browser PWA', descAr: 'فتح نموذج الفحص فوري بكاميرا الهاتف أو التطبيق.', descEn: 'Zero-install camera launch to instant inspection form.' },
      { time: '02:45', seconds: 165, titleAr: 'توثيق العيوب والملاحظات بالصور والصوت', titleEn: 'Capturing Photo Evidence & Voice Notes', descAr: 'تصوير الإطارات والخدوش وتسجيل ملاحظات السائق.', descEn: 'Photographing tire tread wear and recording notes.' },
      { time: '04:10', seconds: 250, titleAr: 'التحويل التلقائي للعطل الحرج إلى أمر صيانة فوري', titleEn: 'Auto-Triggering Emergency Work Orders', descAr: 'إذا فشل عنصر الأمان، يتم إيقاف المركبة وفتح تذكرة صيانة.', descEn: 'Safety failures automatically ground the asset.' }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'توليد وطباعة رمز QR للمركبة',
        titleEn: 'Generate & Print Vehicle QR Placard',
        detailAr: 'من شاشة تفاصيل المركبة، اضغط "طباعة رمز QR" لإنشاء ملصق عالي الوضوح يتضمن رقم اللوحة وطراز الشاحنة.',
        detailEn: 'From asset management, select Print QR Placard to create a branded, durable scanning label.',
        actionTipAr: 'ننصح بطباعة الرموز على ملصقات مقاومة للحرارة والمياه.',
        actionTipEn: 'We recommend laminating QR decals for heavy outdoor logistics wear.'
      },
      {
        stepNumber: 2,
        titleAr: 'مسح الرمز بكاميرا هاتف السائق',
        titleEn: 'Scan via Driver Smartphone Camera',
        detailAr: 'يقوم السائق بفتح كاميرا هاتفه ومسح الرمز لتفتح له قائمة الفحص المخصصة لفئة مركبته فوراً.',
        detailEn: 'Driver scans code; system opens vehicle-specific safety checklist adapted to truck or light van.',
        actionTipAr: 'يعمل النظام في المناطق الضعيفة بدون إنترنت مع مزامنة لاحقة.',
        actionTipEn: 'Full offline mode enables caching data until cellular connectivity restores.'
      },
      {
        stepNumber: 3,
        titleAr: 'إكمال نقاط الفحص والإرسال الرقمي',
        titleEn: 'Complete Checklist & Submit with GPS Stamp',
        detailAr: 'التحقق من ضغط الإطارات، الزيوت، الإنارة والمكابح، والتقاط صور لأي خلل مع توقيع إلكتروني وختم الموقع الجغرافي GPS.',
        detailEn: 'Check tires, fluid levels, brakes, snap pictures of defects, sign digitally with GPS location lock.',
        actionTipAr: 'الأعطال الحرجة ترسل تنبيهاً فورياً للمشرف على تطبيق الواتساب واللوحة الرئيسية.',
        actionTipEn: 'Critical defects immediately dispatch urgent SMS and WhatsApp alerts to workshop.'
      }
    ],
    keyTakeawaysAr: [
      'التخلص بنسبة 100% من الأوراق المفقودة ونماذج الفحص اليدوية.',
      'إثبات الحضور الفعلي للسائق بجانب المركبة بالوقت والتاريخ وإحداثيات GPS.',
      'اكتشاف الأعطال الصغيرة قبل تحولها إلى حوادث أو توقفات مكلفة على الطرق السريعة.'
    ],
    keyTakeawaysEn: [
      '100% paperless audit trails with zero missing walkaround inspection sheets.',
      'GPS and timestamp verification proves driver was physically present at vehicle.',
      'Catch minor wear early before it causes costly highway towing and dispatch delays.'
    ],
    faqsAr: [
      { q: 'هل يحتاج السائق لإنشاء حساب معقد لاستخدام الفحص؟', a: 'لا، بمجرد مسح رمز QR يتم التحقق من السائق برقم الجوال أو الرمز السريع بسهولة.' },
      { q: 'هل يمكن تخصيص أسئلة الفحص للشاحنات المبردة؟', a: 'نعم، يوفر النظام قوالب فحص مخصصة لدرجات حرارة التبريد ومولدات الطاقة.' }
    ],
    faqsEn: [
      { q: 'Do drivers need complex logins to submit inspections?', a: 'No, scanning the code authenticates them with a 4-digit PIN or phone number.' },
      { q: 'Can checklists be customized for refrigerated reefer units?', a: 'Yes, tailor checklist items for temperature monitors, reefer engines, and seals.' }
    ]
  },
  {
    id: 'vid-3',
    titleAr: 'إدارة أوامر العمل في الورشة وفوترة الصيانة الخارجية والداخلية',
    titleEn: 'Work Order Management: In-House Workshops & External Vendors',
    descriptionAr: 'دورة عمل متكاملة لأمر الصيانة: من تشخيص العطل، صرف قطع الغيار، احتساب ساعات عمل الفنيين، وحتى إغلاق التكلفة وإصدار الفاتورة.',
    descriptionEn: 'End-to-end work order execution: diagnostics, spare parts requisition, technician labor tracking, and supplier billing closeout.',
    category: 'work_orders',
    categoryLabelAr: 'أوامر الصيانة والورش',
    categoryLabelEn: 'Work Orders & Repairs',
    duration: '08:15',
    levelAr: 'متوسط',
    levelEn: 'Intermediate',
    badgeAr: 'شرح فني متقدم 🔧',
    badgeEn: 'Master Technician 🔧',
    gradient: 'from-amber-950 via-slate-900 to-indigo-950',
    accentColor: '#f59e0b',
    iconName: 'Wrench',
    applicableVehicles: ['heavy_trucks', 'heavy_machinery', 'light_commercial', 'passenger_fleet'],
    applicableMaintenanceTypes: ['corrective_repair', 'spare_parts_stock', 'preventative_pm'],
    tagsAr: ['شاحنات ثقيلة', 'معدات ثقيلة', 'فانات وتوصيل', 'أوامر العمل', 'ساعات الفنيين', 'قطع غيار', 'الورشة'],
    tagsEn: ['Heavy Trucks', 'Machinery', 'Delivery Vans', 'Work Orders', 'Labor Hours', 'Spare Parts', 'Workshop'],
    primaryVehicleAr: 'الشاحنات الثقيلة والمعدات والفانات',
    primaryVehicleEn: 'Heavy Trucks, Plant & Commercial Vans',
    primaryMaintenanceAr: 'أوامر العمل وإصلاحات الورشة المعتمدة',
    primaryMaintenanceEn: 'Work Orders & Certified Workshop Repairs',
    chapters: [
      { time: '00:00', seconds: 0, titleAr: 'إنشاء أمر صيانة جديد وتحديد نوع العطل', titleEn: 'Creating Work Orders & Defect Triage', descAr: 'صيانة وقائية، إصلاح طارئ، أو فحص دوري.', descEn: 'Preventative, corrective repair, or warranty claim.' },
      { time: '02:00', seconds: 120, titleAr: 'إسناد الفنيين والربط مع المستودع لصرف القطع', titleEn: 'Assigning Technicians & Parts Requisition', descAr: 'صرف الفلاتر والزيوت وتحديث المخزون آلياً.', descEn: 'Deducting filters and fluids from live inventory.' },
      { time: '04:30', seconds: 270, titleAr: 'أوامر العمل الخارجية للوكالات والورش المعتمدة', titleEn: 'Managing External Vendor Service Orders', descAr: 'إرفاق عروض الأسعار وفواتير الضريبة المعتمدة.', descEn: 'Attaching tax invoices and supplier purchase orders.' },
      { time: '06:45', seconds: 405, titleAr: 'إغلاق أمر العمل واحتساب تكلفة الكيلومتر CPK', titleEn: 'Closing Orders & Updating Asset CPK', descAr: 'تحديث سجل المركبة وإعادة إدراجها في جاهزية الحركة.', descEn: 'Logging downtime hours and updating vehicle availability.' }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'فتح أمر العمل وتحديد بنود الإصلاح',
        titleEn: 'Create Order & Select Repair Operations',
        detailAr: 'حدد المركبة أو اختر العطل المرحل من الفحص اليومي، ثم أضف بنود المهام المطلوبة (مثال: تغيير بطانات الفرامل الأمامية).',
        detailEn: 'Select asset or import flagged defect from daily inspection, then add labor tasks (e.g., front brake pad overhaul).',
        actionTipAr: 'يقترح النظام أوقات الإصلاح القياسية بناءً على المعايير المصنعية.',
        actionTipEn: 'System suggests standard repair times based on OEM industry guides.'
      },
      {
        stepNumber: 2,
        titleAr: 'صرف قطع الغيار وحجزها من المستودع',
        titleEn: 'Allocate & Issue Spare Parts from Inventory',
        detailAr: 'اختر القطع المطلوبة من قائمة المخزون، وسيقوم النظام بخصم الكمية وحساب تكلفتها على أمر العمل فوراً.',
        detailEn: 'Pick required SKUs; live stock balance decrements automatically with weighted-average costing applied.',
        actionTipAr: 'في حال عدم توفر القطعة، يمكن إنشاء طلب شراء مستعجل بنقرة واحدة.',
        actionTipEn: 'If out of stock, trigger an instant purchase requisition to approved suppliers.'
      },
      {
        stepNumber: 3,
        titleAr: 'الفحص النهائي وإغلاق أمر الصيانة',
        titleEn: 'Quality Control Audit & Order Closeout',
        detailAr: 'يقوم مشرف الورشة بتسجيل ملاحظات التجربة وتوقيع الاستلام، لتتحول حالة المركبة فوراً إلى "جاهزة للتشغيل".',
        detailEn: 'Shop supervisor conducts quality check, signs off, and vehicle state automatically flips to "Active / Road Ready".',
        actionTipAr: 'يتم حفظ كافة الفواتير والقطع في السجل التاريخي الدائم للمركبة.',
        actionTipEn: 'All labor hours and parts are permanently logged to the vehicle lifetime ledger.'
      }
    ],
    keyTakeawaysAr: [
      'ضبط دقيق لتكاليف أجور اليد العاملة وأسعار قطع الغيار دون تسريب مالي.',
      'مقارنة كفاءة الفنيين وزمن إنجاز الإصلاحات الفعلي مقابل المعياري.',
      'تتبع الضمان على قطع الغيار المستبدلة للمطالبة بها عند التلف المبكر.'
    ],
    keyTakeawaysEn: [
      'Accurate control of technician labor rates and parts expenditure with zero leakage.',
      'Benchmark technician efficiency: actual repair duration vs standard labor times.',
      'Track replacement part warranty windows to claim refunds on premature failures.'
    ],
    faqsAr: [
      { q: 'هل يمكن ربط أمر العمل بورشة خارجية ومتابعة الفاتورة الضريبية؟', a: 'نعم، يدعم النظام أوامر العمل الخارجية مع رفع الفواتير وضريبة القيمة المضافة.' },
      { q: 'كيف يتم احتساب ساعات عمل الفني؟', a: 'يمكن للفني الضغط على زر "بدء العمل" و"إيقاف مؤقت" لتسجيل الزمن الدقيق بالدقائق.' }
    ],
    faqsEn: [
      { q: 'Can work orders track external third-party dealership repairs?', a: 'Yes, upload supplier quotes, work authorizations, and VAT invoices directly.' },
      { q: 'How is technician labor clocked?', a: 'Technicians can start and pause real-time digital job timers on mobile.' }
    ]
  },
  {
    id: 'vid-4',
    titleAr: 'إدارة مستودع قطع الغيار، الجرد بالباركود ومراقبة حد الطلب الأدنى',
    titleEn: 'Spare Parts Inventory Control, Barcode Auditing & Reorder Alerts',
    descriptionAr: 'تنظيم المستودع المركزي ومستودعات الفروع، إدارة أكواد القطع OEM، التنبيه التلقائي لنقص الزيوت والفلاتر، والجرد السريع بالباركود.',
    descriptionEn: 'Organize central and branch depots, manage OEM part cross-references, configure automated min/max reorder alerts, and speed up counts via barcode.',
    category: 'inventory',
    categoryLabelAr: 'المستودع وقطع الغيار',
    categoryLabelEn: 'Inventory & Parts',
    duration: '06:10',
    levelAr: 'متوسط',
    levelEn: 'Intermediate',
    badgeAr: 'تحكم بالمخزون 📦',
    badgeEn: 'Inventory Control 📦',
    gradient: 'from-emerald-950 via-slate-900 to-indigo-950',
    accentColor: '#10b981',
    iconName: 'Layers',
    applicableVehicles: ['heavy_trucks', 'heavy_machinery', 'light_commercial', 'passenger_fleet'],
    applicableMaintenanceTypes: ['spare_parts_stock', 'corrective_repair', 'preventative_pm'],
    tagsAr: ['شاحنات ثقيلة', 'معدات ثقيلة', 'فانات وتوصيل', 'أكواد OEM', 'باركود الأرفف', 'جرد المخزون'],
    tagsEn: ['Heavy Trucks', 'Plant Machinery', 'Vans', 'OEM Cross-Ref', 'Shelf Barcodes', 'Depot Audit'],
    primaryVehicleAr: 'مستودعات قطع الشاحنات والمعدات',
    primaryVehicleEn: 'Truck & Heavy Machinery Parts Depots',
    primaryMaintenanceAr: 'مستودع قطع الغيار وحد الطلب الأدنى',
    primaryMaintenanceEn: 'Spare Parts Inventory & Minimum Buffers',
    chapters: [
      { time: '00:00', seconds: 0, titleAr: 'هيكلة المستودع وتعيين الأرفف والمواقع', titleEn: 'Warehouse Bin & Aisle Location Setup', descAr: 'ترقيم المواقع (A-01, B-04) لسرعة الوصول.', descEn: 'Organizing bin locations for instant picking.' },
      { time: '01:40', seconds: 100, titleAr: 'إدخال القطع وتحديد أرقام OEM البديلة', titleEn: 'Part Cataloging & OEM Interchange Cross-Ref', descAr: 'ربط القطعة الأصلية ببدائلها التجارية المعتمدة.', descEn: 'Mapping OEM part numbers with certified aftermarket substitutes.' },
      { time: '03:15', seconds: 195, titleAr: 'ضبط حد الطلب الأدنى والتنبيهات التلقائية', titleEn: 'Min/Max Thresholds & Auto-Replenishment', descAr: 'إرسال إشعار عند انخفاض رصيد فلاتر الزيت عن 10 حبات.', descEn: 'Triggering notifications when oil filter inventory drops below buffer.' },
      { time: '04:50', seconds: 290, titleAr: 'الجرد السريع بمسح الباركود عبر الهاتف', titleEn: 'Mobile Barcode Stock-Count Auditing', descAr: 'مطابقة الجرد الفعلي مع الرصيد الدفتري بدون توقيف الورشة.', descEn: 'Reconciling physical shelf stock against system ledger in real time.' }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'إضافة أصناف القطع وتحديد حد إعادة الطلب',
        titleEn: 'Define Part SKUs & Minimum Stock Buffer',
        detailAr: 'أدخل اسم القطعة، رقم OEM، تكلفة الشراء، والحد الأدنى (مثال: 5 قطع). سيقوم النظام بمراقبة الاستهلاك تلقائياً.',
        detailEn: 'Enter part nomenclature, OEM part code, unit cost, and min buffer (e.g. 5 units). System automatically tracks burn rate.',
        actionTipAr: 'يمكنك إرفاق صورة القطعة ومواصفاتها الفنية لتسهيل مطابقتها.',
        actionTipEn: 'Upload clear part photos and specifications to guide workshop apprentices.'
      },
      {
        stepNumber: 2,
        titleAr: 'توليد وطباعة ملصقات الباركود للأرفف',
        titleEn: 'Print Barcode Labels for Warehouse Shelves',
        detailAr: 'اطبع ملصقات الباركود الموحدة وثبتها على الصناديق والأرفف لسرعة الصرف والبحث.',
        detailEn: 'Generate adhesive barcode labels and apply them to bins and storage racks for quick scanning.',
        actionTipAr: 'يدعم النظام قراءة الباركود عبر كاميرا الهاتف العادية بدون أجهزة إضافية.',
        actionTipEn: 'Compatible with standard smartphone cameras and industrial Zebra scanners.'
      },
      {
        stepNumber: 3,
        titleAr: 'إجراء الجرد الميداني وتصحيح الفروقات',
        titleEn: 'Execute Mobile Stocktake & Post Adjustments',
        detailAr: 'امسح الصنف وأدخل الكمية الفعلية الموجودة على الرف، وسيقوم النظام بتسجيل الفروقات وإعداد تقرير التسوية.',
        detailEn: 'Scan bin, enter on-shelf count, and system logs variance with instant adjustment ledger creation.',
        actionTipAr: 'يتم احتساب قيمة المخزون الإجمالية وفق طريقة المتوسط المرجح المعتمدة محاسبياً.',
        actionTipEn: 'Inventory valuation complies with weighted average cost accounting standards.'
      }
    ],
    keyTakeawaysAr: [
      'القضاء على توقف الشاحنات بسبب نفاد قطع الصيانة الدورية البسيطة.',
      'منع سرقة أو فقدان قطع الغيار من خلال تتبع كل صنف بأمر العمل المخصص له.',
      'تخفيض رأس المال المجمد في المخزون الراكد بنسبة تصل إلى 25%.'
    ],
    keyTakeawaysEn: [
      'Eliminate vehicle downtime caused by stockouts of routine maintenance parts.',
      'Prevent parts shrinkage by strictly linking every issue to a verified work order.',
      'Reduce dead capital tied up in slow-moving inventory by up to 25%.'
    ],
    faqsAr: [
      { q: 'هل يدعم النظام نقل قطع الغيار بين فروع الشركة المختلفة؟', a: 'نعم، يوجد نظام متكامل لأوامر التحويل بين المستودعات مع إثبات الشحن والاستلام.' },
      { q: 'هل يمكن ربط المخزون بالموردين لطلب الأسعار تلقائياً؟', a: 'نعم، يمكن تصدير طلبات الشراء تلقائياً وإرسالها للموردين المعتمدين.' }
    ],
    faqsEn: [
      { q: 'Can parts be transferred between regional depots?', a: 'Yes, full inter-depot transfer orders with transit tracking and receipt confirmation.' },
      { q: 'Does it support automated RFQs to suppliers?', a: 'Yes, export purchase requisitions and email approved vendors automatically.' }
    ]
  },
  {
    id: 'vid-5',
    titleAr: 'جدولة الصيانة الوقائية (PM) بالمسافة وساعات العمل والتنبيهات المسبقة',
    titleEn: 'Preventative Maintenance (PM) Scheduling by Mileage & Operating Hours',
    descriptionAr: 'شرح احترافي لبرمجة خطط الصيانة الدورية (تغيير الزيوت، فحص الفرامل، صيانة الهيدروليك) وتلقي التنبيهات المسبقة قبل استحقاق الصيانة.',
    descriptionEn: 'Learn how to automate preventative maintenance matrices (oil changes, brake overhauls, hydraulic service) with proactive alerts before due dates.',
    category: 'pm_schedules',
    categoryLabelAr: 'الصيانة الوقائية PM',
    categoryLabelEn: 'Preventative PM',
    duration: '07:50',
    levelAr: 'متوسط',
    levelEn: 'Intermediate',
    badgeAr: 'أساسي لكل أسطول 🛡️',
    badgeEn: 'Essential PM 🛡️',
    gradient: 'from-purple-950 via-slate-950 to-indigo-950',
    accentColor: '#9333ea',
    iconName: 'ShieldCheck',
    applicableVehicles: ['heavy_trucks', 'heavy_machinery', 'reefer_cold', 'light_commercial'],
    applicableMaintenanceTypes: ['preventative_pm', 'heavy_plant_hours', 'cold_chain_temp'],
    tagsAr: ['شاحنات ثقيلة', 'معدات ثقيلة (ساعات عمل)', 'شاحنات تبريد', 'صيانة وقائية PM', 'تنبيهات مسبقة'],
    tagsEn: ['Heavy Trucks', 'Machinery (Hours)', 'Reefer Units', 'Preventative PM', 'Proactive Alerts'],
    primaryVehicleAr: 'شاحنات ومعدات ثقيلة وساعات التشغيل',
    primaryVehicleEn: 'Heavy Trucks, Plant & Engine Hours Assets',
    primaryMaintenanceAr: 'جدولة الصيانة الوقائية PM والتنبيهات المسبقة',
    primaryMaintenanceEn: 'Preventative PM Scheduling & Proactive Alerts',
    chapters: [
      { time: '00:00', seconds: 0, titleAr: 'مفهوم الصيانة الوقائية vs الصيانة العلاجية المكلفة', titleEn: 'Preventative vs Costly Reactive Maintenance', descAr: 'لماذا توفر الصيانة المبرمجة 40% من تكاليف الأعطال الكبرى.', descEn: 'Why programmed PM programs save 40% over emergency towing.' },
      { time: '01:50', seconds: 110, titleAr: 'ضبط معايير الاستحقاق (كيلومتر، ساعات، أو أيام)', titleEn: 'Setting PM Triggers: Mileage, Engine Hours, or Days', descAr: 'تحديد فترات التكرار (مثال: كل 10,000 كم أو كل 3 أشهر).', descEn: 'Configuring recurring triggers (e.g. every 10,000 km or 90 days).' },
      { time: '03:40', seconds: 220, titleAr: 'التنبيهات الاستباقية والمحاكاة التنبؤية', titleEn: 'Proactive Alert Thresholds & Predictive Forecasting', descAr: 'إرسال إشعار للمشرف قبل 500 كم من استحقاق الخدمة لحجز موعد بالورشة.', descEn: 'Sending notifications 500 km prior to due date to book bay time.' },
      { time: '05:30', seconds: 330, titleAr: 'التحويل التلقائي لخطة الـ PM إلى أمر عمل جاهز', titleEn: 'Auto-Generating Work Orders from PM Due Triggers', descAr: 'فتح أمر العمل بجميع القطع والمهام المحددة مسبقاً بنقرة زر واحدة.', descEn: 'Opening pre-configured task lists and parts requisitions instantly.' }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'إنشاء باقة صيانة دورية مخصصة لفئة محددة من المركبات',
        titleEn: 'Create PM Service Package for Specific Vehicle Models',
        detailAr: 'حدد اسم الباقة (مثال: صيانة الـ 10,000 كم لشاحنات مرسيدس)، وأضف قائمة المهام والقطع الافتراضية المطلوبة.',
        detailEn: 'Name the package (e.g. 10k KM Service for Mercedes Actros) and attach default checklist tasks.',
        actionTipAr: 'يمكنك تطبيق الباقة الواحدة على 100 مركبة في نفس الوقت.',
        actionTipEn: 'You can link a single PM template across 100+ vehicles simultaneously.'
      },
      {
        stepNumber: 2,
        titleAr: 'متابعة عداد الاستحقاق على لوحة التحكم الرئيسية',
        titleEn: 'Monitor Real-Time PM Health Barometers on Dashboard',
        detailAr: 'يعرض النظام شريطاً ملوناً (أخضر: سليم، أصفر: اقترب الاستحقاق، أحمر: متأخر) لكل مركبة لضمان التدخل الفوري.',
        detailEn: 'Color-coded gauges (Green: OK, Yellow: Approaching, Red: Overdue) provide instant status visibility.',
        actionTipAr: 'يتم تحديث العدادات تلقائياً مع كل رحلة أو فحص يومي.',
        actionTipEn: 'Odometers update automatically from daily driver walkaround logs.'
      }
    ],
    keyTakeawaysAr: [
      'إطالة العمر الافتراضي لمحركات وهياكل الأسطول بنسبة 35%.',
      'تجنب حوادث الطرق وتوقف الشاحنات المحملة بالبضائع أثناء الرحلات الطويلة.',
      'الحفاظ على شروط الضمان المصنعي للوكالات.'
    ],
    keyTakeawaysEn: [
      'Extend asset powertrain lifespan by up to 35% with strict PM adherence.',
      'Prevent catastrophic on-highway breakdowns with commercial loads.',
      'Maintain factory warranty compliance across all manufacturer agreements.'
    ],
    faqsAr: [
      { q: 'هل يمكن ضبط الصيانة بناءً على ساعات عمل المولدات والمعدات الثقيلة؟', a: 'نعم، يدعم النظام بالكامل ساعات التشغيل (Engine Hours) للمعدات الثقيلة والمولدات.' },
      { q: 'ماذا يحدث إذا تجاوز السائق موعد الصيانة؟', a: 'يتم وسم المركبة كـ "متأخرة في الصيانة" وتصعيد التنبيه لمدير العمليات.' }
    ],
    faqsEn: [
      { q: 'Does it support Engine Operating Hours for heavy excavators?', a: 'Yes, full hour-meter tracking is built-in for construction and plant machinery.' },
      { q: 'What happens if a vehicle exceeds its due PM mark?', a: 'The asset is flagged as "Overdue" and automated escalations alert the operations director.' }
    ]
  },
  {
    id: 'vid-6',
    titleAr: 'التحليلات المالية، تكلفة الكيلومتر (CPK) وتقارير الهدر التشغيلي',
    titleEn: 'Financial Analytics, Cost-Per-Kilometer (CPK) & Waste Reduction',
    descriptionAr: 'كيفية قراءة لوحات القيادة التنفيذية، استخراج تكلفة الكيلومتر الواحد لكل شاحنة، واكتشاف المركبات ذات الاستهلاك الشاذ للوقود أو الصيانة المتكررة.',
    descriptionEn: 'Learn how to interpret executive analytics, calculate true cost-per-kilometer, and identify rogue vehicles with abnormal fuel or maintenance drain.',
    category: 'ai_analytics',
    categoryLabelAr: 'التحليلات والذكاء الاصطناعي',
    categoryLabelEn: 'AI & Executive Analytics',
    duration: '10:20',
    levelAr: 'للمدراء والتنفيذيين',
    levelEn: 'Executive',
    badgeAr: 'لصناع القرار 📊',
    badgeEn: 'For Decision Makers 📊',
    gradient: 'from-slate-900 via-indigo-950 to-purple-950',
    accentColor: '#6366f1',
    iconName: 'TrendingUp',
    applicableVehicles: ['heavy_trucks', 'light_commercial', 'heavy_machinery', 'passenger_fleet', 'reefer_cold', 'ev_hybrid'],
    applicableMaintenanceTypes: ['ai_diagnostics', 'preventative_pm', 'corrective_repair'],
    tagsAr: ['شاحنات ثقيلة', 'فانات وتوصيل', 'معدات إنشائية', 'تكلفة الكيلومتر CPK', 'ذكاء اصطناعي', 'لوحات قيادة'],
    tagsEn: ['Heavy Trucks', 'Delivery Vans', 'Machinery', 'CPK Analytics', 'AI Diagnostics', 'Executive Dashboards'],
    primaryVehicleAr: 'كافة أصول النقل واللوجستيات',
    primaryVehicleEn: 'Complete Transport & Fleet Portfolio',
    primaryMaintenanceAr: 'تحليلات تكلفة الكيلومتر CPK والتشخيص الذكي',
    primaryMaintenanceEn: 'CPK Financial Analytics & AI Diagnostics',
    chapters: [
      { time: '00:00', seconds: 0, titleAr: 'مؤشرات الأداء الرئيسية KPI لإدارة أساطيل النقل', titleEn: 'Executive Fleet Management KPIs & Benchmarks', descAr: 'معدل التوفر التشغيلي، تكلفة الكيلومتر، وزمن التوقف.', descEn: 'Fleet availability, CPK metrics, and mean-time-to-repair (MTTR).' },
      { time: '02:30', seconds: 150, titleAr: 'حساب معادلة تكلفة الكيلومتر الفعلي CPK', titleEn: 'Calculating the True Cost-Per-Kilometer Equation', descAr: 'جمع تكاليف الصيانة + الوقود + الإطارات وقسمتها على المسافة المقطوعة.', descEn: 'Summing maintenance + fuel + tires against total distance logged.' },
      { time: '05:15', seconds: 315, titleAr: 'اكتشاف المركبات المسببة للهدر ونزيف الأرباح', titleEn: 'Pinpointing Lemon Assets & Chronic Money Drains', descAr: 'تحديد متى يكون قرار بيع المركبة واستبدالها أجدى اقتصادياً من صيانتها.', descEn: 'Determining exact replacement inflection points vs endless repair costs.' },
      { time: '08:00', seconds: 480, titleAr: 'تصدير التقارير التنفيذية والملخصات لمجلس الإدارة', titleEn: 'Exporting Board-Ready PDF & Excel Reports', descAr: 'توليد تقارير مالية مدققة ومخططات بيانية بنقرة واحدة.', descEn: 'Generating audited fiscal statements and management charts in seconds.' }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'فتح مركز التقارير المتقدمة واختيار الفترة الزمنية',
        titleEn: 'Access Advanced Reports Center and Select Reporting Window',
        detailAr: 'اختر الربع السنوي أو الشهر المطلوب لتحليل الأداء المالي، وافرز حسب الأقسام التشغيلية أو الفروع الجغرافية.',
        detailEn: 'Select reporting period (monthly, quarterly, annual) and segment by branches or business units.',
        actionTipAr: 'يمكنك مقارنة أداء الفروع المختلفة لاكتشاف الفجوات التشغيلية.',
        actionTipEn: 'Compare cross-depot performance to identify regional operational variance.'
      },
      {
        stepNumber: 2,
        titleAr: 'تفعيل تنبؤات الذكاء الاصطناعي الاستباقية',
        titleEn: 'Enable Predictive AI Forecasting Modules',
        detailAr: 'يقوم محرك الذكاء الاصطناعي بمراجعة أنماط الأعطال والتنبؤ بالأعطال المتوقع حدوثها خلال الـ 90 يوماً القادمة وتقدير ميزانيتها.',
        detailEn: 'The AI engine scans historical patterns to forecast likely 90-day maintenance expenditures.',
        actionTipAr: 'تساعد التنبؤات في حجز ميزانيات الصيانة السنوية بدقة تفوق 92%.',
        actionTipEn: 'Achieves over 92% accuracy in annual CAPEX/OPEX maintenance budget planning.'
      }
    ],
    keyTakeawaysAr: [
      'رؤية شاملة ولحظية لجميع بنود الإنفاق المالي دون انتظار تقارير المحاسبة الشهرية.',
      'تحديد السائقين والمسارات الأكثر استهلاكاً للوقود لتوجيه التدريب.',
      'اتخاذ قرارات استبدال الأصول القديمة بناءً على بيانات مالية رقمية دقيقة.'
    ],
    keyTakeawaysEn: [
      'Real-time financial visibility without waiting for monthly end-of-period reconciliations.',
      'Identify heavy-foot driver behaviors and inefficient routes to coach staff.',
      'Make data-backed asset retirement and replacement choices confidently.'
    ],
    faqsAr: [
      { q: 'هل تشمل الحسابات استهلاك الإطارات والزيوت الدورية؟', a: 'نعم، يتم تفصيل كافة بنود الصيانة، الإطارات، الزيوت، وأجور الأيدي العاملة في تقرير الـ CPK.' },
      { q: 'هل يمكن إرسال التقرير تلقائياً لبريد الإدارة أسبوعياً؟', a: 'نعم، يدعم النظام جدولة التقارير الآلية عبر البريد الإلكتروني.' }
    ],
    faqsEn: [
      { q: 'Does CPK include tire wear, lubricants, and labor rates?', a: 'Yes, line items break down lubricants, tires, wear parts, and technician labor.' },
      { q: 'Can automated executive summaries be emailed every Monday?', a: 'Yes, scheduled digests can be dispatched to leadership automatically.' }
    ]
  },
  {
    id: 'vid-7',
    titleAr: 'فحص وصيانة شاحنات التبريد (Reefer Units) ومراقبة درجات الحرارة وسلاسل الإمداد',
    titleEn: 'Reefer Cold-Chain Inspection, Temperature Monitoring & PM Protocols',
    descriptionAr: 'شرح متخصص لضبط قراءات درجات حرارة شاحنات التبريد، فحص محركات ثيرمو كينج، فحص عزل الأبواب، والتنبيه التلقائي لتجاوز درجات الحرارة المسموحة للأغذية والأدوية.',
    descriptionEn: 'Dedicated protocols for refrigerated fleet: reefer engine checks, multi-temp sensor telemetry, thermal door seals, and automated cold-chain excursion alarms.',
    category: 'pm_schedules',
    categoryLabelAr: 'شاحنات التبريد وسلاسل الإمداد',
    categoryLabelEn: 'Cold Chain & Reefer PM',
    duration: '08:40',
    levelAr: 'فني وميداني',
    levelEn: 'Field & Tech',
    badgeAr: 'سلاسل التبريد ❄️',
    badgeEn: 'Cold Chain ❄️',
    gradient: 'from-cyan-950 via-slate-900 to-blue-950',
    accentColor: '#06b6d4',
    iconName: 'Snowflake',
    applicableVehicles: ['reefer_cold', 'heavy_trucks', 'light_commercial'],
    applicableMaintenanceTypes: ['cold_chain_temp', 'preventative_pm', 'daily_inspection'],
    tagsAr: ['شاحنات مبردة', 'سلاسل الإمداد', 'ثيرمو كينج', 'مراقبة الحرارة IoT', 'فحص الأغذية والأدوية'],
    tagsEn: ['Reefer Trucks', 'Cold Chain', 'Thermo King', 'IoT Temperature', 'Food & Pharma Safety'],
    primaryVehicleAr: 'شاحنات التبريد وفانات نقل الأغذية',
    primaryVehicleEn: 'Reefer Trucks & Cold Transport Vans',
    primaryMaintenanceAr: 'صيانة وحدات التبريد ومراقبة درجات الحرارة',
    primaryMaintenanceEn: 'Reefer Unit PM & Cold Chain Telemetry',
    chapters: [
      { time: '00:00', seconds: 0, titleAr: 'مقدمة في معايير نقل الأغذية والأدوية المبردة', titleEn: 'Cold Chain Standards for Food & Pharma', descAr: 'متطلبات سلامة الشحنات ومستشعرات الحرارة.', descEn: 'Temperature compliance and telemetry sensor placement.' },
      { time: '02:10', seconds: 130, titleAr: 'فحص محرك التبريد المستقل وساعات عمل الكمبروسور', titleEn: 'Reefer Engine & Compressor Hours Check', descAr: 'صيانة سيور التبريد وزيت محرك وحدة التبريد.', descEn: 'Checking auxiliary diesel engine, drive belts, and Freon.' },
      { time: '04:45', seconds: 285, titleAr: 'فحص عوازل الأبواب والستائر الهوائية', titleEn: 'Thermal Seals & Air Curtain Audit', descAr: 'منع تسرب البرودة أثناء التفريغ والتحميل المتكرر.', descEn: 'Verifying gasket integrity to prevent temperature loss during multi-drop.' },
      { time: '06:50', seconds: 410, titleAr: 'إعداد تنبيهات الانحراف الحراري الفورية بالـ IoT', titleEn: 'Real-Time Temperature Excursion Alerts', descAr: 'إرسال إشعار فوري في حال ارتفاع الحرارة فوق الحد المسموح.', descEn: 'Automated SMS/Email when cargo temp deviates from setpoint.' }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'تثبيت نقطة الفحص المبردة في قائمة السائق',
        titleEn: 'Configure Reefer Checklist Template',
        detailAr: 'أضف بنود فحص وحدة التبريد (درجة حرارة الكابينة، مستوى وقود التبريد، سلامة عوازل الباب الخلفي) في تطبيق السائق.',
        detailEn: 'Attach specialized cold-chain parameters (target setpoint, reefer fuel level, door gasket seal) to mobile checklist.',
        actionTipAr: 'يمكن تحديد نطاقات حرارية مختلفة للسلع المجمدة (-18°C) والمبردة (+4°C).',
        actionTipEn: 'Configure multi-zone setpoints for frozen (-18°C) vs chilled (+4°C) goods.'
      },
      {
        stepNumber: 2,
        titleAr: 'متابعة قراءات أجهزة التتبع IoT الحية',
        titleEn: 'Live Telemetry & Temperature Sensor Feeds',
        detailAr: 'تظهر درجات الحرارة الحية على خريطة التتبع مع سجل زمني كامل يثبت الالتزام بسلسلة التبريد طوال مسار الرحلة.',
        detailEn: 'Live temp curves stream directly onto the route map, generating an audited temperature integrity certificate.',
        actionTipAr: 'يمكن للعميل استلام شهادة الالتزام الحراري تلقائياً مع إشعار التسليم.',
        actionTipEn: 'Send automated temperature certificates to receivers with digital proof of delivery.'
      }
    ],
    keyTakeawaysAr: [
      'حماية الشحنات الحساسة من التلف وتفادي الخسائر المالية الضخمة.',
      'الامتثال الكامل لاشتراطات هيئة الغذاء والدواء والجهات الرقابية.',
      'توفير استهلاك وقود وحدات التبريد عبر الصيانة الوقائية للكمبروسور.'
    ],
    keyTakeawaysEn: [
      'Protect perishable loads against costly thermal spoilage and claims.',
      'Ensure strict regulatory compliance with Food & Drug transport rules.',
      'Optimize reefer diesel consumption through proactive compressor tuning.'
    ],
    faqsAr: [
      { q: 'هل يدعم النظام وحدات التبريد الكهربائية المتصلة بالشاحنة؟', a: 'نعم، يدعم وحدات التبريد الكهربائية المستقلة وتلك المتصلة بالمحرك الرئيسي PTO.' },
      { q: 'كيف يتم توثيق درجات الحرارة عند استلام الشحنة؟', a: 'يقوم السائق بطباعة أو مشاركة تقرير الـ PDF الحراري مباشرة من التطبيق للعميل المستلم.' }
    ],
    faqsEn: [
      { q: 'Does it support electric standby reefer units?', a: 'Yes, tracks both independent diesel engines and electric standby plug-ins.' },
      { q: 'How is temperature compliance verified upon drop-off?', a: 'Drivers can instantly share digital temperature trip logs to customer handsets.' }
    ]
  },
  {
    id: 'vid-8',
    titleAr: 'إدارة المعدات الثقيلة والآليات الإنشائية بساعات التشغيل (Engine Hours)',
    titleEn: 'Heavy Machinery & Plant Management by Engine Operating Hours',
    descriptionAr: 'كيفية إدارة الحفارات، الشيولات والمولدات في المواقع الإنشائية والمشاريع، جدولة صيانة الهيدروليك كل 250 و 500 ساعة، وتتبع استهلاك الديزل بالساعة.',
    descriptionEn: 'Manage excavators, wheel loaders, and site generators via hour meters, hydraulic maintenance cycles (250h/500h), and hourly fuel burn rates.',
    category: 'pm_schedules',
    categoryLabelAr: 'المعدات الثقيلة والإنشائية',
    categoryLabelEn: 'Heavy Plant & Machinery',
    duration: '09:15',
    levelAr: 'متوسط',
    levelEn: 'Intermediate',
    badgeAr: 'معدات ثقيلة 🏗️',
    badgeEn: 'Heavy Plant 🏗️',
    gradient: 'from-yellow-950 via-slate-900 to-amber-950',
    accentColor: '#eab308',
    iconName: 'HardHat',
    applicableVehicles: ['heavy_machinery', 'heavy_trucks'],
    applicableMaintenanceTypes: ['heavy_plant_hours', 'preventative_pm', 'corrective_repair'],
    tagsAr: ['معدات ثقيلة', 'حفارات وشيولات', 'ساعات التشغيل', 'صيانة هيدروليك', 'مشاريع إنشائية', 'مولدات'],
    tagsEn: ['Heavy Machinery', 'Excavators & Loaders', 'Engine Hours', 'Hydraulics PM', 'Construction Sites', 'Generators'],
    primaryVehicleAr: 'المعدات والآليات الإنشائية والمولدات',
    primaryVehicleEn: 'Heavy Machinery, Earthmovers & Generators',
    primaryMaintenanceAr: 'صيانة المعدات الثقيلة بساعات التشغيل والهيدروليك',
    primaryMaintenanceEn: 'Plant Machinery PM by Engine Hours & Hydraulics',
    chapters: [
      { time: '00:00', seconds: 0, titleAr: 'الفرق بين صيانة الكيلومترات وصيانة ساعات التشغيل', titleEn: 'Mileage vs Engine Operating Hours Matrix', descAr: 'لماذا تقاس معدات الإنشاء بساعات دوران المحرك.', descEn: 'Why plant machinery maintenance is anchored on engine runtime.' },
      { time: '02:00', seconds: 120, titleAr: 'برمجة دورات الصيانة (50h, 250h, 500h, 1000h)', titleEn: 'Setting PM Intervals for Heavy Earthmovers', descAr: 'تغيير فلاتر الهيدروليك، تشحيم البنزات، وصيانة التروس.', descEn: 'Hydraulic filter replacement, pin greasing, and final drive gear oil.' },
      { time: '04:30', seconds: 270, titleAr: 'تتبع استهلاك الوقود بالساعة وحساب الهدر', titleEn: 'Tracking Liters-per-Hour & Idle Time Fuel Burn', descAr: 'اكتشاف وقت الخمول الزائد (Idle Time) الذي يهدر الديزل.', descEn: 'Analyzing idle vs working hours to curb excessive fuel wastage.' },
      { time: '07:15', seconds: 435, titleAr: 'نقل المعدات بين المشاريع وتوثيق ساعات الموقع', titleEn: 'Inter-Site Plant Dispatch & Machine Hours Allocation', descAr: 'توزيع تكاليف المعدة بدقة على المشروع أو مركز التكلفة المستفيد.', descEn: 'Billing plant runtime precisely to specific project cost codes.' }
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'تفعيل نمط ساعات التشغيل (Engine Hours) للمعدة',
        titleEn: 'Enable Operating Hours Tracking for Asset',
        detailAr: 'عند إضافة حفارة أو معدة، حدد وحدة القياس "ساعات تشغيل" وأدخل القراءة الحالية لعداد الساعات.',
        detailEn: 'In asset profile, set meter type to "Hours" and calibrate initial hour-meter reading.',
        actionTipAr: 'يقوم النظام بحساب متوسط ساعات العمل اليومية لتقدير موعد الصيانة بدقة.',
        actionTipEn: 'The system forecasts PM due dates based on average 14-day daily utilization rates.'
      },
      {
        stepNumber: 2,
        titleAr: 'ربط جدول صيانة الهيدروليك والشحوم الدورية',
        titleEn: 'Attach Hydraulic & Greasing Service Schedules',
        detailAr: 'اختر باقة صيانة المعدات الثقيلة الجاهزة لتلقي تنبيهات تلقائية قبل 25 ساعة من استحقاق تبديل الزيوت الهيدروليكية.',
        detailEn: 'Assign OEM heavy plant templates to receive auto-alerts 25 hours before oil drain intervals.',
        actionTipAr: 'إرسال أوامر الصيانة المتنقلة لفنيي الميدان في موقع المشروع مباشرة.',
        actionTipEn: 'Dispatch mobile lubrication service vans directly to job site GPS coordinates.'
      }
    ],
    keyTakeawaysAr: [
      'حماية الأنظمة الهيدروليكية والمحركات الثقيلة من التلف المبكر المفاجئ.',
      'تخفيض استهلاك الديزل في فترات التوقف والتشغيل غير المنتج.',
      'تحميل تكلفة كل معدة بدقة على المشروع الإنشائي المخصص لها.'
    ],
    keyTakeawaysEn: [
      'Prevent catastrophic failure in high-pressure hydraulic pumps and drivetrains.',
      'Curb unproductive diesel idling waste across active construction zones.',
      'Accurately charge plant equipment costs to relevant project accounts.'
    ],
    faqsAr: [
      { q: 'هل يمكن إدخال ساعات عمل المعدة يدوياً أو عبر مستشعرات CAN-bus؟', a: 'نعم، يدعم النظام الإدخال اليدوي عبر الهاتف أو القراءة الآلية عبر أجهزة التتبع CAN-bus.' },
      { q: 'هل يدعم المولدات الثابتة في المواقع النائية؟', a: 'نعم، يتم تتبع المولدات الثابتة وساعات تشغيلها وجداول الصيانة الوقائية بنفس الكفاءة.' }
    ],
    faqsEn: [
      { q: 'Can hour meters be logged manually or via CAN-bus IoT?', a: 'Supports both manual mobile operator logging and automatic CAN-bus IoT telemetry.' },
      { q: 'Does it support stationary generators at remote workcamps?', a: 'Yes, full preventative maintenance and runtime tracking for stationary generator banks.' }
    ]
  }
];

export const TUTORIAL_MENU_SECTIONS = [
  {
    id: 'strategic',
    titleAr: 'القيادة والتحكم الإستراتيجي',
    titleEn: 'Strategic Command & Control',
    categoryIds: ['fleet_setup', 'ai_analytics']
  },
  {
    id: 'operations',
    titleAr: 'إدارة العمليات والأسطول',
    titleEn: 'Fleet & Field Operations',
    categoryIds: ['inspection_qr']
  },
  {
    id: 'maintenance',
    titleAr: 'أوامر الصيانة والورشة',
    titleEn: 'Work Orders & Repairs',
    categoryIds: ['work_orders']
  },
  {
    id: 'inventory_pm',
    titleAr: 'المستودع والصيانة الوقائية',
    titleEn: 'Inventory & Preventative PM',
    categoryIds: ['inventory', 'pm_schedules']
  }
];

export const getSectionIdForVideo = (video: VideoTutorial) => {
  return TUTORIAL_MENU_SECTIONS.find(s => s.categoryIds.includes(video.category))?.id || TUTORIAL_MENU_SECTIONS[0].id;
};

interface VideoTutorialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'ar' | 'en';
  onNavigateToSaaS?: (trial?: boolean) => void;
  brandName?: string;
  initialVideoId?: string;
}

export default function VideoTutorialsModal({
  isOpen,
  onClose,
  language: propLanguage,
  onNavigateToSaaS,
  brandName = 'FleetAurvexis',
  initialVideoId
}: VideoTutorialsModalProps) {
  const { language: contextLang } = useLanguage();
  const lang = propLanguage || contextLang || 'ar';
  const isRtl = lang === 'ar';

  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial>(() => {
    if (initialVideoId) {
      const found = VIDEO_TUTORIALS_DATA.find(v => v.id === initialVideoId);
      if (found) return found;
    }
    return VIDEO_TUTORIALS_DATA[0];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleCategoryType>('all');
  const [selectedMaintenanceType, setSelectedMaintenanceType] = useState<MaintenanceCategoryType>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filterSubTab, setFilterSubTab] = useState<'maintenance' | 'vehicle' | 'tags'>('maintenance');
  const [isFilterBoxCollapsed, setIsFilterBoxCollapsed] = useState(false);
  const [autoCollapseCategories, setAutoCollapseCategories] = useState(true);
  const [expandedSectionIds, setExpandedSectionIds] = useState<string[]>(() => {
    const initialSec = getSectionIdForVideo(selectedVideo);
    return [initialSec];
  });
  const [activeTab, setActiveTab] = useState<'steps' | 'chapters' | 'faqs'>('steps');

  // Favorites System State & Persistence
  const [favoriteVideoIds, setFavoriteVideoIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fms_favorite_tutorials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved favorites:', e);
    }
    return ['fleet_setup_intro', 'qr_inspection_guide'];
  });
  const [isFavoritesSectionExpanded, setIsFavoritesSectionExpanded] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem('fms_favorite_tutorials', JSON.stringify(favoriteVideoIds));
    } catch (e) {
      console.error('Failed to save favorite tutorials to localStorage:', e);
    }
  }, [favoriteVideoIds]);

  const toggleFavoriteVideo = (videoId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setFavoriteVideoIds(prev => {
      if (prev.includes(videoId)) {
        return prev.filter(id => id !== videoId);
      } else {
        return [...prev, videoId];
      }
    });
  };

  const isVideoFavorite = (videoId: string) => favoriteVideoIds.includes(videoId);

  const favoriteVideos = useMemo(() => {
    return VIDEO_TUTORIALS_DATA.filter(v => favoriteVideoIds.includes(v.id));
  }, [favoriteVideoIds]);

  // Interactive Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(405);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);
  const playerTopRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // Sync initial video if prop changes
  useEffect(() => {
    if (initialVideoId) {
      const found = VIDEO_TUTORIALS_DATA.find(v => v.id === initialVideoId);
      if (found) {
        setSelectedVideo(found);
        setCurrentTime(0);
        setIsPlaying(false);
      }
    }
  }, [initialVideoId]);

  // Video duration string to seconds helper
  useEffect(() => {
    if (selectedVideo) {
      const parts = selectedVideo.duration.split(':');
      if (parts.length === 2) {
        const total = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        setDuration(total || 300);
      }
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [selectedVideo]);

  // Playback timer simulation
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration, playbackSpeed]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
  };

  const jumpToChapter = (seconds: number) => {
    setCurrentTime(seconds);
    setIsPlaying(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // When a video is selected from sidebar or index, return immediately to the video player view
  const handleSelectVideo = (video: VideoTutorial) => {
    setSelectedVideo(video);
    setCurrentTime(0);
    setIsPlaying(true);
    setIsMobileDrawerOpen(false);

    // Auto-collapse: Automatically collapse other categories and focus on the section containing this video
    if (autoCollapseCategories) {
      const targetSec = getSectionIdForVideo(video);
      setExpandedSectionIds([targetSec]);
    }
    
    // Smoothly scroll the main viewport back to top of the video player
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (playerTopRef.current) {
      playerTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Sync section expansion when selectedVideo changes with auto-collapse enabled
  useEffect(() => {
    if (autoCollapseCategories && selectedVideo) {
      const targetSec = getSectionIdForVideo(selectedVideo);
      setExpandedSectionIds([targetSec]);
    }
  }, [selectedVideo.id, autoCollapseCategories]);

  // Section Accordion Toggles
  const toggleSectionCollapse = (sectionId: string) => {
    setExpandedSectionIds(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        if (autoCollapseCategories) {
          return [sectionId];
        }
        return [...prev, sectionId];
      }
    });
  };

  const handleExpandAllSections = () => {
    setAutoCollapseCategories(false);
    setExpandedSectionIds(TUTORIAL_MENU_SECTIONS.map(s => s.id));
  };

  const handleCollapseAllSections = () => {
    setExpandedSectionIds([]);
  };

  const handleToggleAutoCollapse = () => {
    setAutoCollapseCategories(prev => {
      const next = !prev;
      if (next && selectedVideo) {
        setExpandedSectionIds([getSectionIdForVideo(selectedVideo)]);
      }
      return next;
    });
  };

  const handleDownloadTemplate = () => {
    setDownloadSuccess(true);
    const csvContent = "data:text/csv;charset=utf-8,PlateNumber,AssetType,MakeModel,Year,CurrentOdometer,Department,FuelType,Status\n1234-KSA,Heavy Truck,Mercedes Actros 1845,2023,124500,Logistics,Diesel,Active\n5678-KSA,Pickup Van,Toyota Hilux 4x4,2022,68200,Maintenance,Gasoline,Active\n9012-KSA,Excavator,CAT 320D,2021,4300,Construction,Diesel,Under_Maintenance";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", selectedVideo.downloadableTemplate?.nameEn || "FleetAurvexis_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Filter videos with vehicle classification, maintenance classification, tags, category and search
  const filteredVideos = useMemo(() => {
    return VIDEO_TUTORIALS_DATA.filter(v => {
      const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
      const matchesVehicleType = selectedVehicleType === 'all' || 
        (v.applicableVehicles && v.applicableVehicles.includes(selectedVehicleType));
      
      const matchesMaintenanceType = selectedMaintenanceType === 'all' ||
        (v.applicableMaintenanceTypes && v.applicableMaintenanceTypes.includes(selectedMaintenanceType));

      const matchesTag = !selectedTag 
        ? true 
        : selectedTag === '__favorites__'
          ? favoriteVideoIds.includes(v.id)
          : ((v.tagsAr && v.tagsAr.includes(selectedTag)) || (v.tagsEn && v.tagsEn.includes(selectedTag)));

      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory && matchesVehicleType && matchesMaintenanceType && matchesTag;

      const matchesSearch = 
        v.titleAr.toLowerCase().includes(query) ||
        v.titleEn.toLowerCase().includes(query) ||
        v.descriptionAr.toLowerCase().includes(query) ||
        v.descriptionEn.toLowerCase().includes(query) ||
        v.categoryLabelAr.toLowerCase().includes(query) ||
        v.categoryLabelEn.toLowerCase().includes(query) ||
        (v.primaryVehicleAr && v.primaryVehicleAr.toLowerCase().includes(query)) ||
        (v.primaryVehicleEn && v.primaryVehicleEn.toLowerCase().includes(query)) ||
        (v.primaryMaintenanceAr && v.primaryMaintenanceAr.toLowerCase().includes(query)) ||
        (v.primaryMaintenanceEn && v.primaryMaintenanceEn.toLowerCase().includes(query)) ||
        (v.tagsAr && v.tagsAr.some(t => t.toLowerCase().includes(query))) ||
        (v.tagsEn && v.tagsEn.some(t => t.toLowerCase().includes(query)));

      return matchesCategory && matchesVehicleType && matchesMaintenanceType && matchesTag && matchesSearch;
    });
  }, [selectedCategory, selectedVehicleType, selectedMaintenanceType, selectedTag, searchQuery, favoriteVideoIds]);

  // Extract all unique popular tags
  const allPopularTags = useMemo(() => {
    const tagCountMap = new Map<string, number>();
    VIDEO_TUTORIALS_DATA.forEach(v => {
      const list = lang === 'ar' ? v.tagsAr : v.tagsEn;
      list?.forEach(t => {
        tagCountMap.set(t, (tagCountMap.get(t) || 0) + 1);
      });
    });
    return Array.from(tagCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [lang]);

  // Count helper for vehicle filter pills
  const getVehicleTypeCount = (vType: VehicleCategoryType) => {
    if (vType === 'all') return VIDEO_TUTORIALS_DATA.length;
    return VIDEO_TUTORIALS_DATA.filter(v => v.applicableVehicles && v.applicableVehicles.includes(vType)).length;
  };

  // Count helper for maintenance type filter pills
  const getMaintenanceTypeCount = (mType: MaintenanceCategoryType) => {
    if (mType === 'all') return VIDEO_TUTORIALS_DATA.length;
    return VIDEO_TUTORIALS_DATA.filter(v => v.applicableMaintenanceTypes && v.applicableMaintenanceTypes.includes(mType)).length;
  };

  const categories = [
    { id: 'all', labelAr: 'جميع الشروحات', labelEn: 'All Tutorials', icon: Layers },
    { id: 'fleet_setup', labelAr: 'تأسيس الأسطول', labelEn: 'Fleet Setup', icon: Truck },
    { id: 'inspection_qr', labelAr: 'فحوصات QR', labelEn: 'QR Inspections', icon: QrCode },
    { id: 'work_orders', labelAr: 'أوامر العمل', labelEn: 'Work Orders', icon: Wrench },
    { id: 'inventory', labelAr: 'قطع الغيار', labelEn: 'Inventory', icon: Boxes },
    { id: 'pm_schedules', labelAr: 'الصيانة الوقائية', labelEn: 'Preventative PM', icon: CalendarCheck },
    { id: 'ai_analytics', labelAr: 'الذكاء الاصطناعي', labelEn: 'AI Analytics', icon: BrainCircuit }
  ];

  const menuSections = TUTORIAL_MENU_SECTIONS;

  const renderSidebarContent = () => (
    <div className="space-y-3.5">
      {/* Brand & Section Header (matches the dashboard sidebar screenshot) */}
      <div className={`p-3 rounded-2xl border flex items-center justify-between ${
        isDarkMode ? 'bg-slate-950/80 border-purple-500/20' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Video size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className={`text-xs font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {brandName}
              </h3>
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full border ${
                isDarkMode ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                AI FLEET SUITE
              </span>
            </div>
            <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'}`}>
              {lang === 'ar' ? 'أكاديمية شروحات المنصة' : 'Interactive Academy'}
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${
          isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
        }`}>
          {filteredVideos.length}/{VIDEO_TUTORIALS_DATA.length}
        </span>
      </div>

      {/* Instant Search Bar */}
      <div className="relative w-full">
        <Search size={14} className={`absolute top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} ${isRtl ? 'right-3' : 'left-3'}`} />
        <input
          id="input-search-tutorials-sidebar"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === 'ar' ? 'بحث في الفيديوهات، الوسوم، ونوع المركبة...' : 'Search tutorials, tags, vehicles...'}
          className={`w-full border rounded-xl py-2 text-xs focus:outline-none transition ${
            isDarkMode 
              ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500' 
              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs'
          } ${isRtl ? 'pr-8 pl-8' : 'pl-8 pr-8'}`}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className={`absolute top-1/2 -translate-y-1/2 p-1 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} ${isRtl ? 'left-2' : 'right-2'}`}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Tag & Category Classification Filter (Maintenance, Vehicle Type, and Tags) */}
      <div className={`p-2.5 rounded-2xl border transition ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800/90' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/40">
          <div className="flex items-center gap-1.5">
            <Filter size={13} className={isDarkMode ? 'text-purple-400' : 'text-indigo-600'} />
            <span className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              {lang === 'ar' ? 'التصنيف والفلترة الذكية' : 'Smart Category Filters'}
            </span>
            {(selectedMaintenanceType !== 'all' || selectedVehicleType !== 'all' || selectedTag !== null) && (
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                isDarkMode ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
              }`}>
                {[
                  selectedMaintenanceType !== 'all',
                  selectedVehicleType !== 'all',
                  selectedTag !== null
                ].filter(Boolean).length} {lang === 'ar' ? 'مفعل' : 'active'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {(selectedMaintenanceType !== 'all' || selectedVehicleType !== 'all' || selectedTag !== null) && (
              <button
                id="btn-clear-all-filters"
                onClick={() => {
                  setSelectedMaintenanceType('all');
                  setSelectedVehicleType('all');
                  setSelectedTag(null);
                }}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded hover:underline cursor-pointer ${
                  isDarkMode ? 'text-purple-300' : 'text-indigo-600'
                }`}
              >
                {lang === 'ar' ? 'إلغاء الكل' : 'Clear All'}
              </button>
            )}
            <button
              onClick={() => setIsFilterBoxCollapsed(!isFilterBoxCollapsed)}
              className={`p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer ${
                isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}
              title={isFilterBoxCollapsed ? 'Expand' : 'Collapse'}
            >
              {isFilterBoxCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            </button>
          </div>
        </div>

        {/* Active Filter Chips Summary Bar (If any active) */}
        {(selectedMaintenanceType !== 'all' || selectedVehicleType !== 'all' || selectedTag !== null) && (
          <div className="flex items-center gap-1 flex-wrap pb-2 mb-2 border-b border-slate-800/30">
            {selectedMaintenanceType !== 'all' && (
              <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                isDarkMode ? 'bg-purple-950/80 text-purple-200 border-purple-500/50' : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}>
                <span>🔧</span>
                <span className="truncate max-w-[110px]">
                  {lang === 'ar'
                    ? MAINTENANCE_TYPE_FILTERS.find(m => m.id === selectedMaintenanceType)?.shortLabelAr
                    : MAINTENANCE_TYPE_FILTERS.find(m => m.id === selectedMaintenanceType)?.shortLabelEn}
                </span>
                <button 
                  onClick={() => setSelectedMaintenanceType('all')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            )}

            {selectedVehicleType !== 'all' && (
              <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                isDarkMode ? 'bg-purple-950/80 text-purple-200 border-purple-500/50' : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}>
                <span>🚛</span>
                <span className="truncate max-w-[110px]">
                  {lang === 'ar'
                    ? VEHICLE_TYPE_FILTERS.find(v => v.id === selectedVehicleType)?.shortLabelAr
                    : VEHICLE_TYPE_FILTERS.find(v => v.id === selectedVehicleType)?.shortLabelEn}
                </span>
                <button 
                  onClick={() => setSelectedVehicleType('all')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            )}

            {selectedTag !== null && (
              <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                selectedTag === '__favorites__'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : (isDarkMode ? 'bg-indigo-950/80 text-indigo-200 border-indigo-500/50' : 'bg-slate-100 text-slate-800 border-slate-300')
              }`}>
                {selectedTag === '__favorites__' ? <Heart size={10} className="fill-current" /> : <span>#</span>}
                <span className="truncate max-w-[100px]">
                  {selectedTag === '__favorites__' ? (lang === 'ar' ? 'المفضلة' : 'Favorites') : selectedTag}
                </span>
                <button 
                  onClick={() => setSelectedTag(null)}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        )}

        {!isFilterBoxCollapsed && (
          <div className="space-y-2.5">
            {/* Filter Category Segmented Switcher Tabs */}
            <div className={`p-0.5 rounded-xl border flex items-center gap-0.5 ${
              isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                id="tab-filter-maintenance"
                onClick={() => setFilterSubTab('maintenance')}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  filterSubTab === 'maintenance'
                    ? (isDarkMode ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-indigo-900 shadow-xs border border-slate-200/60')
                    : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <span>🔧</span>
                <span className="truncate">{lang === 'ar' ? 'نوع الصيانة' : 'Maintenance'}</span>
                {selectedMaintenanceType !== 'all' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
              </button>

              <button
                id="tab-filter-vehicle"
                onClick={() => setFilterSubTab('vehicle')}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  filterSubTab === 'vehicle'
                    ? (isDarkMode ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-indigo-900 shadow-xs border border-slate-200/60')
                    : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <span>🚛</span>
                <span className="truncate">{lang === 'ar' ? 'نوع المركبة' : 'Vehicle'}</span>
                {selectedVehicleType !== 'all' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
              </button>

              <button
                id="tab-filter-tags"
                onClick={() => setFilterSubTab('tags')}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  filterSubTab === 'tags'
                    ? (isDarkMode ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-indigo-900 shadow-xs border border-slate-200/60')
                    : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                <span>🏷️</span>
                <span className="truncate">{lang === 'ar' ? 'الوسوم' : 'Tags'}</span>
                {selectedTag !== null && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />}
              </button>
            </div>

            {/* TAB 1: Maintenance Category Filter Options */}
            {filterSubTab === 'maintenance' && (
              <div className="space-y-1.5">
                <div className="grid grid-cols-1 gap-1 max-h-[190px] overflow-y-auto pr-0.5">
                  {MAINTENANCE_TYPE_FILTERS.map((mFilter) => {
                    const count = getMaintenanceTypeCount(mFilter.id);
                    const isSelected = selectedMaintenanceType === mFilter.id;
                    return (
                      <button
                        key={mFilter.id}
                        id={`filter-maintenance-${mFilter.id}`}
                        onClick={() => setSelectedMaintenanceType(isSelected && mFilter.id !== 'all' ? 'all' : mFilter.id)}
                        className={`px-2 py-1.5 rounded-xl text-start transition flex items-center justify-between gap-1.5 border text-xs cursor-pointer ${
                          isSelected
                            ? (isDarkMode 
                                ? 'bg-purple-600 text-white border-purple-500 font-bold shadow-xs' 
                                : 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs')
                            : (isDarkMode
                                ? 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800/80 hover:border-slate-700'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300')
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs shrink-0">{mFilter.emoji}</span>
                          <div className="min-w-0">
                            <p className="text-[10.5px] truncate font-medium">
                              {lang === 'ar' ? mFilter.shortLabelAr : mFilter.shortLabelEn}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-mono px-1 rounded-md shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600')
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Vehicle Type Category Filter Options */}
            {filterSubTab === 'vehicle' && (
              <div className="grid grid-cols-2 gap-1.5">
                {VEHICLE_TYPE_FILTERS.map((vFilter) => {
                  const count = getVehicleTypeCount(vFilter.id);
                  const isSelected = selectedVehicleType === vFilter.id;
                  return (
                    <button
                      key={vFilter.id}
                      id={`filter-vehicle-${vFilter.id}`}
                      onClick={() => setSelectedVehicleType(isSelected && vFilter.id !== 'all' ? 'all' : vFilter.id)}
                      className={`px-2 py-1.5 rounded-xl text-start transition flex items-center justify-between gap-1.5 border text-xs cursor-pointer ${
                        isSelected
                          ? (isDarkMode 
                              ? 'bg-purple-600 text-white border-purple-500 font-bold shadow-xs' 
                              : 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs')
                          : (isDarkMode
                              ? 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800/80 hover:border-slate-700'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300')
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs shrink-0">{vFilter.emoji}</span>
                        <span className="text-[10.5px] truncate font-medium">
                          {lang === 'ar' ? vFilter.shortLabelAr : vFilter.shortLabelEn}
                        </span>
                      </div>
                      <span className={`text-[9px] font-mono px-1 rounded-md shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600')
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB 3: Operational Tags & Favorites */}
            {filterSubTab === 'tags' && (
              <div className="space-y-2">
                {/* Favorites Quick Button */}
                {favoriteVideos.length > 0 && (
                  <button
                    id="btn-filter-favorites-tab-pill"
                    onClick={() => setSelectedTag(selectedTag === '__favorites__' ? null : '__favorites__')}
                    className={`w-full text-xs px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-1.5 ${
                      selectedTag === '__favorites__'
                        ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-xs'
                        : (isDarkMode
                            ? 'bg-rose-950/40 text-rose-300 border-rose-500/30 hover:border-rose-500/60'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-300')
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Heart size={12} className="fill-current text-current" />
                      <span className="font-bold">{lang === 'ar' ? 'عرض الفيديوهات المفضلة فقط' : 'Show Favorite Videos Only'}</span>
                    </div>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
                      {favoriteVideos.length}
                    </span>
                  </button>
                )}

                {/* Popular Tags List */}
                <div className="flex flex-wrap gap-1 max-h-[140px] overflow-y-auto pr-0.5">
                  {allPopularTags.map((tag) => {
                    const isTagActive = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(isTagActive ? null : tag)}
                        className={`text-[10px] px-2 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                          isTagActive
                            ? (isDarkMode ? 'bg-indigo-600 text-white border-indigo-500 font-bold' : 'bg-indigo-700 text-white border-indigo-700 font-bold')
                            : (isDarkMode 
                                ? 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-purple-300 hover:border-purple-500/40' 
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-indigo-700 hover:border-indigo-300')
                        }`}
                      >
                        <Tag size={9} />
                        <span>{tag}</span>
                        {isTagActive && <X size={9} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Categories Auto-Collapse Controls Header */}
      <div className={`p-2 rounded-2xl border flex items-center justify-between transition ${
        isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-1.5">
          <Layers size={13} className={isDarkMode ? 'text-purple-400' : 'text-indigo-600'} />
          <span className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            {lang === 'ar' ? 'أقسام ودورات المنصة' : 'Platform Modules'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Smart Auto-Collapse Toggle Button */}
          <button
            id="btn-toggle-auto-collapse"
            onClick={handleToggleAutoCollapse}
            title={lang === 'ar' ? 'تبديل خاصية الطي التلقائي للأقسام عند فتح الفيديو' : 'Toggle smart auto-collapse when opening video'}
            className={`text-[10px] px-2 py-0.5 rounded-lg border transition flex items-center gap-1 font-bold cursor-pointer ${
              autoCollapseCategories
                ? (isDarkMode 
                    ? 'bg-purple-950/90 text-purple-200 border-purple-500/60 shadow-xs shadow-purple-900/30' 
                    : 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-xs')
                : (isDarkMode 
                    ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200' 
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900')
            }`}
          >
            <Sparkles size={11} className={autoCollapseCategories ? (isDarkMode ? 'text-purple-300 animate-pulse' : 'text-indigo-600') : 'opacity-40'} />
            <span>
              {lang === 'ar' 
                ? (autoCollapseCategories ? 'الطي التلقائي: مفعّل 🎯' : 'الطي التلقائي: معطّل') 
                : (autoCollapseCategories ? 'Auto-Collapse: ON 🎯' : 'Auto-Collapse: OFF')}
            </span>
          </button>

          {/* Quick Expand / Collapse All Toggle */}
          <button
            onClick={expandedSectionIds.length === TUTORIAL_MENU_SECTIONS.length ? handleCollapseAllSections : handleExpandAllSections}
            className={`text-[10px] p-1 rounded-lg border transition cursor-pointer ${
              isDarkMode ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200' : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
            title={expandedSectionIds.length === TUTORIAL_MENU_SECTIONS.length ? (lang === 'ar' ? 'طي جميع الأقسام' : 'Collapse All') : (lang === 'ar' ? 'توسيع جميع الأقسام' : 'Expand All')}
          >
            {expandedSectionIds.length === TUTORIAL_MENU_SECTIONS.length ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Dedicated Favorites Section */}
      <div 
        className={`rounded-2xl border transition overflow-hidden ${
          isDarkMode 
            ? 'border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-slate-900/60 to-slate-950/70 shadow-xs' 
            : 'border-rose-200 bg-gradient-to-br from-rose-50/50 via-white to-slate-50/50 shadow-xs'
        }`}
      >
        <button
          id="btn-toggle-favorites-section"
          onClick={() => setIsFavoritesSectionExpanded(prev => !prev)}
          className={`w-full flex items-center justify-between p-2.5 transition cursor-pointer text-start ${
            isDarkMode ? 'hover:bg-rose-950/30' : 'hover:bg-rose-50/60'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/30">
              <Heart size={12} className="fill-rose-500 text-rose-500" />
            </div>
            <span className={`text-[11.5px] font-black tracking-wide ${
              isDarkMode ? 'text-rose-200' : 'text-slate-900'
            }`}>
              {lang === 'ar' ? 'الفيديوهات المفضلة' : 'Favorite Tutorials'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
              favoriteVideos.length > 0
                ? 'bg-rose-500 text-white shadow-xs'
                : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600')
            }`}>
              {favoriteVideos.length}
            </span>
            <div className={`p-0.5 rounded text-slate-400 transition-transform duration-200 ${
              isFavoritesSectionExpanded ? 'rotate-180 text-rose-400' : ''
            }`}>
              <ChevronDown size={13} />
            </div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isFavoritesSectionExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="p-2 pt-0.5 space-y-1.5 border-t border-rose-500/20">
                {favoriteVideos.length > 0 ? (
                  favoriteVideos.map((video) => {
                    const isCurrent = video.id === selectedVideo.id;
                    return (
                      <div
                        key={`fav-card-${video.id}`}
                        onClick={() => handleSelectVideo(video)}
                        className={`w-full text-start p-2 rounded-xl border transition flex items-center justify-between gap-2 cursor-pointer group ${
                          isCurrent
                            ? (isDarkMode
                                ? 'bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border-purple-500 text-white shadow-sm'
                                : 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-xs')
                            : (isDarkMode
                                ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800'
                                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs')
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? (isDarkMode ? 'bg-purple-600 text-white' : 'bg-indigo-600 text-white')
                              : (isDarkMode ? 'bg-slate-800 text-rose-400' : 'bg-rose-50 text-rose-600')
                          }`}>
                            <Play size={10} className={isRtl ? 'rotate-180' : ''} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold truncate">
                              {lang === 'ar' ? video.titleAr : video.titleEn}
                            </p>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                              <span className="font-mono">{video.duration}</span>
                              <span>•</span>
                              <span className="truncate">{lang === 'ar' ? video.categoryLabelAr : video.categoryLabelEn}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => toggleFavoriteVideo(video.id, e)}
                          className="p-1 text-rose-500 hover:bg-rose-500/20 rounded-md transition cursor-pointer shrink-0"
                          title={lang === 'ar' ? 'إزالة من المفضلة' : 'Remove from Favorites'}
                        >
                          <Heart size={12} className="fill-rose-500 text-rose-500" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 text-center space-y-1">
                    <Heart size={16} className="mx-auto text-rose-400/50" />
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {lang === 'ar'
                        ? 'لم تقم بحفظ أي فيديو في المفضلة بعد. انقر على أيقونة ❤️ لحفظ الشروحات والرجوع إليها بسرعة.'
                        : 'No favorites saved yet. Click the ❤️ icon on any video to save it for quick access.'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categorized Video List (Accordion Sections with Auto-Collapse Support) */}
      <div className="space-y-2.5">
        {menuSections.map((section) => {
          const sectionVideos = filteredVideos.filter(v => section.categoryIds.includes(v.category));
          if (sectionVideos.length === 0) return null;

          const isExpanded = expandedSectionIds.includes(section.id);
          const containsCurrentVideo = sectionVideos.some(v => v.id === selectedVideo.id);

          return (
            <div 
              key={section.id} 
              className={`rounded-2xl border transition overflow-hidden ${
                containsCurrentVideo
                  ? (isDarkMode ? 'border-purple-500/40 bg-purple-950/20 shadow-xs shadow-purple-900/10' : 'border-indigo-200 bg-indigo-50/30 shadow-xs')
                  : (isDarkMode ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-200/80 bg-slate-50/50')
              }`}
            >
              {/* Section Header Accordion Trigger */}
              <button
                id={`btn-toggle-section-${section.id}`}
                onClick={() => toggleSectionCollapse(section.id)}
                className={`w-full flex items-center justify-between p-2.5 transition cursor-pointer text-start ${
                  containsCurrentVideo
                    ? (isDarkMode ? 'hover:bg-purple-900/30' : 'hover:bg-indigo-100/50')
                    : (isDarkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100/80')
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    containsCurrentVideo
                      ? 'bg-purple-500 shadow-xs shadow-purple-500 ring-2 ring-purple-500/30 animate-pulse'
                      : (isDarkMode ? 'bg-slate-600' : 'bg-slate-400')
                  }`} />
                  <span className={`text-[11.5px] font-black tracking-wide truncate ${
                    containsCurrentVideo
                      ? (isDarkMode ? 'text-purple-200 font-black' : 'text-indigo-950 font-black')
                      : (isDarkMode ? 'text-slate-300' : 'text-slate-700')
                  }`}>
                    {lang === 'ar' ? section.titleAr : section.titleEn}
                  </span>

                  {/* Active indicator pill if this section contains currently selected video */}
                  {containsCurrentVideo && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md shrink-0 border ${
                      isDarkMode ? 'bg-purple-900/70 text-purple-200 border-purple-600/40' : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                    }`}>
                      {lang === 'ar' ? 'القسم النشط' : 'Active'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    containsCurrentVideo
                      ? (isDarkMode ? 'bg-purple-800/60 text-purple-200' : 'bg-indigo-200 text-indigo-900')
                      : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700')
                  }`}>
                    {sectionVideos.length}
                  </span>
                  <div className={`p-0.5 rounded text-slate-400 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-purple-400' : ''
                  }`}>
                    <ChevronDown size={13} />
                  </div>
                </div>
              </button>

              {/* Videos under this section (Animated Accordion Body) */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-2 pt-0.5 space-y-1.5 border-t border-slate-800/30">
                      {sectionVideos.map((video) => {
                        const isCurrent = video.id === selectedVideo.id;
                        return (
                          <div
                            key={video.id}
                            id={`sidebar-video-${video.id}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectVideo(video)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSelectVideo(video);
                              }
                            }}
                            className={`w-full text-start p-2.5 rounded-2xl border transition flex items-start gap-2.5 cursor-pointer relative overflow-hidden group ${
                              isCurrent
                                ? (isDarkMode
                                    ? 'bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border-purple-500 text-white shadow-md shadow-purple-900/20'
                                    : 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-xs')
                                : (isDarkMode
                                    ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800/80 hover:border-slate-700'
                                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 shadow-xs')
                            }`}
                          >
                            {/* Active Indicator Strip */}
                            {isCurrent && (
                              <div className={`absolute top-0 bottom-0 w-1 bg-purple-500 ${isRtl ? 'right-0' : 'left-0'}`} />
                            )}

                            <div className={`p-2 rounded-xl shrink-0 mt-0.5 transition ${
                              isCurrent
                                ? (isDarkMode ? 'bg-purple-600 text-white shadow-xs' : 'bg-indigo-600 text-white shadow-xs')
                                : (isDarkMode ? 'bg-slate-800 text-purple-400 group-hover:bg-slate-700' : 'bg-slate-100 text-indigo-600 group-hover:bg-indigo-50')
                            }`}>
                              {video.iconName === 'FileSpreadsheet' && <FileSpreadsheet size={15} />}
                              {video.iconName === 'QrCode' && <QrCode size={15} />}
                              {video.iconName === 'Wrench' && <Wrench size={15} />}
                              {video.iconName === 'Layers' && <Boxes size={15} />}
                              {video.iconName === 'ShieldCheck' && <ShieldCheck size={15} />}
                              {video.iconName === 'TrendingUp' && <TrendingUp size={15} />}
                              {video.iconName === 'Truck' && <Truck size={15} />}
                              {video.iconName === 'Snowflake' && <Snowflake size={15} />}
                              {video.iconName === 'HardHat' && <HardHat size={15} />}
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  isCurrent
                                    ? (isDarkMode ? 'bg-purple-800/80 text-purple-200' : 'bg-indigo-200 text-indigo-900')
                                    : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600')
                                }`}>
                                  {lang === 'ar' ? video.categoryLabelAr : video.categoryLabelEn}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-mono text-[10px] flex items-center gap-1 shrink-0 ${
                                    isCurrent ? (isDarkMode ? 'text-purple-300 font-bold' : 'text-indigo-700 font-bold') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')
                                  }`}>
                                    <Clock size={10} /> {video.duration}
                                  </span>
                                  <button
                                    id={`btn-fav-card-${video.id}`}
                                    type="button"
                                    onClick={(e) => toggleFavoriteVideo(video.id, e)}
                                    className={`p-1 rounded-md transition cursor-pointer shrink-0 ${
                                      isVideoFavorite(video.id)
                                        ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20'
                                        : (isDarkMode ? 'text-slate-500 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100')
                                    }`}
                                    title={
                                      isVideoFavorite(video.id)
                                        ? (lang === 'ar' ? 'إزالة من المفضلة' : 'Remove from Favorites')
                                        : (lang === 'ar' ? 'إضافة إلى المفضلة' : 'Add to Favorites')
                                    }
                                  >
                                    <Heart
                                      size={12}
                                      className={isVideoFavorite(video.id) ? 'fill-rose-500 text-rose-500' : ''}
                                    />
                                  </button>
                                </div>
                              </div>

                              <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${
                                isCurrent
                                  ? (isDarkMode ? 'text-white font-black' : 'text-indigo-950 font-black')
                                  : (isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-800 group-hover:text-indigo-600')
                              }`}>
                                {lang === 'ar' ? video.titleAr : video.titleEn}
                              </h4>

                              {/* Primary Maintenance & Vehicle Badges */}
                              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                {video.primaryMaintenanceAr && (
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold border flex items-center gap-1 ${
                                    isCurrent
                                      ? (isDarkMode ? 'bg-amber-900/40 text-amber-200 border-amber-600/40' : 'bg-amber-50 text-amber-800 border-amber-300')
                                      : (isDarkMode ? 'bg-slate-950/80 text-amber-300 border-slate-800' : 'bg-amber-50/70 text-amber-800 border-amber-200')
                                  }`}>
                                    <span>🔧</span>
                                    <span className="truncate max-w-[120px]">
                                      {lang === 'ar' ? video.primaryMaintenanceAr : video.primaryMaintenanceEn}
                                    </span>
                                  </span>
                                )}

                                {video.primaryVehicleAr && (
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold border flex items-center gap-1 ${
                                    isCurrent
                                      ? (isDarkMode ? 'bg-purple-900/60 text-purple-200 border-purple-600/50' : 'bg-indigo-100 text-indigo-800 border-indigo-300')
                                      : (isDarkMode ? 'bg-slate-950/80 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200')
                                  }`}>
                                    <Truck size={8.5} />
                                    <span className="truncate max-w-[120px]">
                                      {lang === 'ar' ? video.primaryVehicleAr : video.primaryVehicleEn}
                                    </span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-[10px] pt-0.5">
                                <span className={`font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {lang === 'ar' ? video.levelAr : video.levelEn}
                                </span>
                                {isCurrent ? (
                                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                    <span>{lang === 'ar' ? 'قيد العرض الآن' : 'Playing'}</span>
                                  </span>
                                ) : (
                                  <span className={`flex items-center gap-0.5 font-bold ${isDarkMode ? 'text-purple-400' : 'text-indigo-600'}`}>
                                    <span>{lang === 'ar' ? 'تشغيل' : 'Play'}</span>
                                    <Play size={10} className={isRtl ? 'rotate-180' : ''} />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredVideos.length === 0 && (
          <div className={`text-center py-8 px-3 space-y-2 border border-dashed rounded-2xl ${
            isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}>
            <Search size={20} className="mx-auto opacity-60" />
            <p className="text-xs">
              {lang === 'ar' ? 'لم يتم العثور على شروحات مطابقة للفلتر المحدد.' : 'No tutorial matches selected filters.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedVehicleType('all');
                setSelectedMaintenanceType('all');
                setSelectedTag(null);
              }}
              className={`text-xs font-bold hover:underline cursor-pointer ${
                isDarkMode ? 'text-purple-400' : 'text-indigo-600'
              }`}
            >
              {lang === 'ar' ? 'إعادة ضبط كافة الفلاتر والوسوم' : 'Reset All Filters & Tags'}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Custom Training Banner */}
      <div className={`p-3 rounded-2xl border space-y-1.5 text-center ${
        isDarkMode 
          ? 'bg-gradient-to-br from-purple-950/40 to-slate-950 border-purple-500/20' 
          : 'bg-indigo-50/80 border-indigo-200'
      }`}>
        <Flame size={16} className={`mx-auto ${isDarkMode ? 'text-purple-400' : 'text-indigo-600'}`} />
        <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {lang === 'ar' ? 'تدريب مخصص لفريقك الميداني' : 'Custom Team Training'}
        </h4>
        <p className={`text-[10px] leading-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          {lang === 'ar' 
            ? 'جلسات تدريبية مباشرة لورش العمل ومشرفي الحركة' 
            : 'Live onboarding sessions for your operations team'}
        </p>
        {onNavigateToSaaS && (
          <button
            onClick={() => {
              onClose();
              onNavigateToSaaS(true);
            }}
            className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer shadow-xs"
          >
            {lang === 'ar' ? 'طلب جلسة تجريبية' : 'Request Demo'}
          </button>
        )}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="video-tutorials-library-modal"
        className={`fixed inset-0 z-50 overflow-y-auto backdrop-blur-md flex items-center justify-center p-0 sm:p-3 md:p-6 ${
          isDarkMode ? 'bg-slate-950/85' : 'bg-slate-900/60'
        }`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`border-0 sm:border sm:rounded-3xl w-full max-w-7xl h-full sm:h-auto sm:max-h-[94vh] flex flex-col shadow-2xl overflow-hidden relative font-sans transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-slate-900 border-purple-500/30 text-slate-100' 
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Top Header Bar */}
          <div className={`px-4 sm:px-6 py-3 border-b flex items-center justify-between gap-3 shrink-0 transition-colors ${
            isDarkMode ? 'border-slate-800/90 bg-slate-950/90' : 'border-slate-200 bg-slate-50/95'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
                <Video size={19} className="text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className={`text-base sm:text-lg font-black tracking-tight truncate ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {lang === 'ar' ? 'أكاديمية الشروحات والفيديوهات الميدانية' : 'Video & Practical Tutorials Academy'}
                  </h2>
                  <span className={`hidden md:inline-flex text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    isDarkMode 
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {brandName} Masterclass
                  </span>
                </div>
                <p className={`text-xs truncate hidden sm:block ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {lang === 'ar' 
                    ? 'أدلة مرئية تطبيقية وشروحات خطوة بخطوة لإتقان إدارة الأسطول والورش الذكية' 
                    : 'Interactive video walkthroughs and operational manuals for total fleet mastery'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile Drawer Button to browse other videos */}
              <button
                id="btn-toggle-mobile-video-drawer"
                onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
                className={`lg:hidden px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border cursor-pointer ${
                  isMobileDrawerOpen
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : (isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-slate-700'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-xs')
                }`}
                title={lang === 'ar' ? 'فهرس وقائمة الفيديوهات' : 'Videos Playlist'}
              >
                <ListVideo size={14} />
                <span>{lang === 'ar' ? 'فهرس الفيديوهات' : 'Videos'}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isMobileDrawerOpen 
                    ? 'bg-white/20 text-white' 
                    : (isDarkMode ? 'bg-purple-900/60 text-purple-200' : 'bg-indigo-200 text-indigo-800')
                }`}>
                  {VIDEO_TUTORIALS_DATA.length}
                </span>
              </button>

              {/* Theme Toggle (Light / Dark Mode) */}
              <button
                id="btn-toggle-video-theme"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
                }`}
                title={isDarkMode 
                  ? (lang === 'ar' ? 'التبديل إلى الوضع الفاتح' : 'Switch to Light Mode') 
                  : (lang === 'ar' ? 'التبديل إلى الوضع المظلم' : 'Switch to Dark Mode')}
              >
                {isDarkMode ? (
                  <>
                    <Sun size={14} className="text-amber-400" />
                    <span className="hidden sm:inline">{lang === 'ar' ? 'وضع فاتح' : 'Light'}</span>
                  </>
                ) : (
                  <>
                    <Moon size={14} className="text-indigo-600" />
                    <span className="hidden sm:inline">{lang === 'ar' ? 'وضع مظلم' : 'Dark'}</span>
                  </>
                )}
              </button>

              <button
                id="btn-share-video-library"
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
                }`}
                title={lang === 'ar' ? 'نسخ رابط المكتبة' : 'Copy link'}
              >
                {copiedLink ? (
                  <>
                    <Check size={13} className="text-emerald-500" />
                    <span className="text-emerald-600 text-xs font-bold">{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Share2 size={13} />
                    <span className="text-xs">{lang === 'ar' ? 'مشاركة' : 'Share'}</span>
                  </>
                )}
              </button>

              <button
                id="btn-close-video-modal"
                onClick={onClose}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition border cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-800/90 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 text-slate-400 border-slate-700' 
                    : 'bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 border-slate-200 shadow-xs'
                }`}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Main Body Grid */}
          <div className={`flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:rtl:divide-x-reverse ${
            isDarkMode ? 'divide-slate-800' : 'divide-slate-200'
          }`}>
            
            {/* Left Column (Video Player + Guides + Details) - 8 cols */}
            <div 
              ref={mainScrollRef}
              className={`lg:col-span-8 p-3 sm:p-5 space-y-4 overflow-y-auto ${
                isDarkMode ? 'bg-slate-900/90' : 'bg-slate-50/50'
              }`}
            >
              
              <div ref={playerTopRef} />

              {/* Interactive Simulated Video Player Container */}
              <div 
                ref={playerRef}
                className={`relative rounded-2xl overflow-hidden shadow-2xl group select-none aspect-video w-full flex flex-col justify-between border ${
                  isDarkMode ? 'bg-slate-950 border-purple-500/30' : 'bg-slate-900 border-indigo-200'
                }`}
              >
                {/* Visual Canvas Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden pointer-events-none">
                  <div className={`absolute inset-0 bg-gradient-to-br ${selectedVideo.gradient} opacity-35 mix-blend-overlay`} />
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f108_1px,transparent_1px),linear-gradient(to_bottom,#6366f108_1px,transparent_1px)] bg-[size:16px_16px] sm:bg-[size:24px_24px]" />
                  
                  {/* High-Tech Demo Simulation Screen */}
                  <div className="absolute inset-2 sm:inset-4 rounded-xl border border-purple-500/20 bg-slate-900/85 p-2.5 sm:p-4 flex flex-col justify-between backdrop-blur-xs">
                    {/* Simulated App Topbar */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 sm:pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-mono text-slate-400 ms-1.5 hidden sm:inline">{brandName} OS / {selectedVideo.categoryLabelEn}</span>
                      </div>
                      <span className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        isPlaying 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {isPlaying ? '● LIVE DEMO' : '❚❚ PAUSED'}
                      </span>
                    </div>

                    {/* Active Topic Banner in Center */}
                    <div className="my-auto py-1 sm:py-2 text-center sm:text-start space-y-1">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                        <Sparkles size={11} className="text-purple-400" />
                        <span>{lang === 'ar' ? selectedVideo.categoryLabelAr : selectedVideo.categoryLabelEn}</span>
                      </div>
                      <h3 className="text-xs sm:text-sm md:text-base font-black text-white line-clamp-1">
                        {lang === 'ar' ? selectedVideo.titleAr : selectedVideo.titleEn}
                      </h3>
                      
                      {/* Active chapter text */}
                      <div className="inline-flex items-center gap-1.5 text-xs text-indigo-200/90 font-medium">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
                          {formatSeconds(currentTime)}
                        </span>
                        <span className="truncate max-w-[220px] sm:max-w-md">
                          {(() => {
                            const currentChap = [...selectedVideo.chapters].reverse().find(c => currentTime >= c.seconds) || selectedVideo.chapters[0];
                            return lang === 'ar' ? currentChap?.titleAr : currentChap?.titleEn;
                          })()}
                        </span>
                      </div>
                    </div>

                    {/* Simulated Screen Footer */}
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-500 border-t border-slate-800/60 pt-1">
                      <span>4K Ultra HD • 60 FPS</span>
                      <span className="font-mono text-purple-400/80">{brandName} Interactive Studio</span>
                    </div>
                  </div>
                </div>

                {/* Top Floating Badge Bar */}
                <div className="relative z-10 p-2 sm:p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      <span>{lang === 'ar' ? 'تطبيق عملي' : 'Practical'}</span>
                    </span>
                    {selectedVideo.badgeAr && (
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-600/80 backdrop-blur-md text-white text-[10px] font-bold">
                        {lang === 'ar' ? selectedVideo.badgeAr : selectedVideo.badgeEn}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      id="btn-player-quick-fav"
                      type="button"
                      onClick={(e) => toggleFavoriteVideo(selectedVideo.id, e)}
                      className={`p-1.5 rounded-full backdrop-blur-md border transition cursor-pointer ${
                        isVideoFavorite(selectedVideo.id)
                          ? 'bg-rose-500 text-white border-rose-400 shadow-xs'
                          : 'bg-slate-950/80 text-slate-300 hover:text-rose-400 border-white/10'
                      }`}
                      title={
                        isVideoFavorite(selectedVideo.id)
                          ? (lang === 'ar' ? 'إزالة من المفضلة' : 'Remove from Favorites')
                          : (lang === 'ar' ? 'إضافة إلى المفضلة' : 'Add to Favorites')
                      }
                    >
                      <Heart size={12} className={isVideoFavorite(selectedVideo.id) ? 'fill-white text-white' : ''} />
                    </button>
                    <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-slate-300 font-mono text-xs border border-white/10">
                      {formatSeconds(currentTime)} / {selectedVideo.duration}
                    </span>
                  </div>
                </div>

                {/* Center Play Button Overlay */}
                <div className="relative z-10 flex items-center justify-center my-auto">
                  <button
                    id="btn-main-play-pause"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md ${
                      isPlaying 
                        ? 'bg-purple-600/80 hover:bg-purple-600 opacity-0 group-hover:opacity-100 ring-4 ring-purple-500/20' 
                        : 'bg-purple-600 hover:bg-purple-500 opacity-100 ring-6 sm:ring-8 ring-purple-500/30'
                    }`}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} className={isRtl ? 'rotate-180' : 'ms-0.5'} />}
                  </button>
                </div>

                {/* Bottom Controls Bar Overlay */}
                <div className="relative z-10 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent p-2.5 sm:p-3.5 pt-4 space-y-1.5">
                  {/* Progress Scrubber Slider */}
                  <div className="relative w-full flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Buttons Row */}
                  <div className="flex items-center justify-between gap-2 text-white text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-1 hover:text-purple-300 transition cursor-pointer"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} className={isRtl ? 'rotate-180' : ''} />}
                      </button>

                      <button
                        onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                        className="p-1 hover:text-purple-300 transition cursor-pointer text-slate-300"
                        title={lang === 'ar' ? 'تراجع 10 ثوانٍ' : 'Rewind 10s'}
                      >
                        <RotateCcw size={14} />
                      </button>

                      <button
                        onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                        className="p-1 hover:text-purple-300 transition cursor-pointer text-slate-300"
                        title={lang === 'ar' ? 'تقديم 10 ثوانٍ' : 'Forward 10s'}
                      >
                        <RotateCw size={14} />
                      </button>

                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1 hover:text-white transition cursor-pointer text-slate-300"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                      </button>

                      <span className="font-mono text-xs text-slate-300 ps-1">
                        {formatSeconds(currentTime)} / {selectedVideo.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Playback speed selector */}
                      <div className="flex items-center bg-slate-800/90 rounded-md border border-slate-700/80 text-[10px] font-mono p-0.5">
                        {[1, 1.5, 2].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => setPlaybackSpeed(spd)}
                            className={`px-1.5 py-0.5 rounded ${playbackSpeed === spd ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>

                      {/* Fullscreen Button */}
                      <button
                        onClick={() => {
                          if (playerRef.current) {
                            if (!document.fullscreenElement) {
                              playerRef.current.requestFullscreen?.();
                              setIsFullscreen(true);
                            } else {
                              document.exitFullscreen?.();
                              setIsFullscreen(false);
                            }
                          }
                        }}
                        className="p-1 hover:text-purple-300 transition cursor-pointer text-slate-300"
                        title="Fullscreen"
                      >
                        {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Title & Actions Bar */}
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap text-xs">
                      <span className={`font-bold uppercase tracking-wider text-xs ${
                        isDarkMode ? 'text-purple-400' : 'text-indigo-600'
                      }`}>
                        {lang === 'ar' ? selectedVideo.categoryLabelAr : selectedVideo.categoryLabelEn}
                      </span>
                      <span className={isDarkMode ? 'text-slate-600' : 'text-slate-300'}>•</span>
                      <span className={`flex items-center gap-1 text-xs ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        <Clock size={12} /> {selectedVideo.duration}
                      </span>
                      <span className={isDarkMode ? 'text-slate-600' : 'text-slate-300'}>•</span>
                      <span className={`font-semibold text-xs ${
                        isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
                      }`}>
                        {lang === 'ar' ? selectedVideo.levelAr : selectedVideo.levelEn}
                      </span>
                    </div>
                    <h1 className={`text-base sm:text-xl font-black leading-snug ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {lang === 'ar' ? selectedVideo.titleAr : selectedVideo.titleEn}
                    </h1>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* Favorite Toggle Button */}
                    <button
                      id="btn-toggle-favorite-active-video"
                      onClick={(e) => toggleFavoriteVideo(selectedVideo.id, e)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                        isVideoFavorite(selectedVideo.id)
                          ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/20'
                          : (isDarkMode
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:text-rose-400 hover:border-rose-500/40'
                              : 'bg-white hover:bg-rose-50 text-slate-800 border-slate-200 hover:border-rose-200 hover:text-rose-600 shadow-xs')
                      }`}
                      title={
                        isVideoFavorite(selectedVideo.id)
                          ? (lang === 'ar' ? 'إزالة من المفضلة' : 'Remove from Favorites')
                          : (lang === 'ar' ? 'إضافة إلى المفضلة' : 'Add to Favorites')
                      }
                    >
                      <Heart 
                        size={14} 
                        className={`transition-transform duration-200 ${
                          isVideoFavorite(selectedVideo.id) ? 'fill-white text-white scale-110' : 'text-rose-500'
                        }`} 
                      />
                      <span>
                        {isVideoFavorite(selectedVideo.id) 
                          ? (lang === 'ar' ? 'في المفضلة ❤️' : 'In Favorites ❤️') 
                          : (lang === 'ar' ? 'إضافة للمفضلة' : 'Add to Favorites')}
                      </span>
                    </button>

                    {selectedVideo.downloadableTemplate && (
                      <button
                        id="btn-download-attached-template"
                        onClick={handleDownloadTemplate}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                          isDarkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                            : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'
                        }`}
                      >
                        <Download size={14} className={downloadSuccess ? 'text-emerald-500' : (isDarkMode ? 'text-purple-400' : 'text-indigo-600')} />
                        <span>
                          {downloadSuccess 
                            ? (lang === 'ar' ? 'تم التنزيل!' : 'Downloaded!') 
                            : (lang === 'ar' ? 'تحميل القالب المرفق' : 'Download Template')}
                        </span>
                      </button>
                    )}

                    {onNavigateToSaaS && (
                      <button
                        id="btn-try-feature-in-saas"
                        onClick={() => {
                          onClose();
                          onNavigateToSaaS(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <span>{lang === 'ar' ? 'تطبيق في المنصة' : 'Try in Console'}</span>
                        <ExternalLink size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <p className={`text-xs leading-relaxed ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {lang === 'ar' ? selectedVideo.descriptionAr : selectedVideo.descriptionEn}
                </p>

                {/* Classification (Maintenance Type, Vehicle Fleet Classes, and Operational Tags) Card */}
                <div className={`p-3.5 rounded-2xl border space-y-2.5 transition ${
                  isDarkMode 
                    ? 'bg-slate-950/60 border-purple-500/20' 
                    : 'bg-indigo-50/60 border-indigo-100 shadow-xs'
                }`}>
                  {/* Row 1: Maintenance Classification */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
                        <span className="text-amber-500">🔧</span>
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                          {lang === 'ar' ? 'نوع الصيانة والعمليات:' : 'Maintenance & Operations:'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {selectedVideo.applicableMaintenanceTypes?.map(mType => {
                          const mObj = MAINTENANCE_TYPE_FILTERS.find(f => f.id === mType);
                          if (!mObj) return null;
                          const isSelected = selectedMaintenanceType === mType;
                          return (
                            <button
                              key={mType}
                              onClick={() => setSelectedMaintenanceType(isSelected ? 'all' : mType)}
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? (isDarkMode ? 'bg-amber-600 text-white border-amber-500 font-bold shadow-xs' : 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs')
                                  : (isDarkMode ? 'bg-slate-900 text-amber-300 border-slate-800 hover:border-amber-500/50' : 'bg-white text-amber-900 border-amber-200 hover:border-amber-400')
                              }`}
                              title={lang === 'ar' ? `تصفية القائمة حسب ${mObj.labelAr}` : `Filter playlist by ${mObj.labelEn}`}
                            >
                              <span>{mObj.emoji}</span>
                              <span>{lang === 'ar' ? mObj.shortLabelAr : mObj.shortLabelEn}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Fleet Classes Compatibility */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/20">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
                        <Truck size={14} className={isDarkMode ? 'text-purple-400' : 'text-indigo-600'} />
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                          {lang === 'ar' ? 'فئات الأسطول المتوافقة:' : 'Compatible Fleet Classes:'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {selectedVideo.applicableVehicles?.map(vType => {
                          const vObj = VEHICLE_TYPE_FILTERS.find(f => f.id === vType);
                          if (!vObj) return null;
                          const isSelected = selectedVehicleType === vType;
                          return (
                            <button
                              key={vType}
                              onClick={() => setSelectedVehicleType(isSelected ? 'all' : vType)}
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? (isDarkMode ? 'bg-purple-600 text-white border-purple-500 font-bold' : 'bg-indigo-600 text-white border-indigo-600 font-bold')
                                  : (isDarkMode ? 'bg-slate-900 text-purple-300 border-slate-800 hover:border-purple-500/50' : 'bg-white text-indigo-900 border-slate-200 hover:border-indigo-300')
                              }`}
                              title={lang === 'ar' ? `تصفية القائمة حسب ${vObj.labelAr}` : `Filter playlist by ${vObj.labelEn}`}
                            >
                              <span>{vObj.emoji}</span>
                              <span>{lang === 'ar' ? vObj.shortLabelAr : vObj.shortLabelEn}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Operational Tags */}
                  {(selectedVideo.tagsAr?.length > 0 || selectedVideo.tagsEn?.length > 0) && (
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/20">
                      <div className="flex items-center gap-1 text-[11px] font-bold shrink-0">
                        <Tag size={12} className={isDarkMode ? 'text-purple-400' : 'text-indigo-600'} />
                        <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                          {lang === 'ar' ? 'الوسوم التشغيلية:' : 'Operational Tags:'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {(lang === 'ar' ? selectedVideo.tagsAr : selectedVideo.tagsEn)?.map((tag, idx) => {
                          const isTagActive = selectedTag === tag;
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedTag(isTagActive ? null : tag)}
                              className={`text-[10.5px] px-2 py-0.5 rounded-md border transition cursor-pointer flex items-center gap-1 ${
                                isTagActive
                                  ? (isDarkMode ? 'bg-indigo-600 text-white border-indigo-500 font-bold' : 'bg-indigo-700 text-white border-indigo-700 font-bold')
                                  : (isDarkMode ? 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:text-indigo-600 hover:border-indigo-200')
                              }`}
                            >
                              <span>#{tag}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Tabs for Deep Breakdown */}
              <div className={`border-t pt-3.5 space-y-3 ${
                isDarkMode ? 'border-slate-800/80' : 'border-slate-200'
              }`}>
                <div className={`flex items-center gap-1.5 border-b pb-2 overflow-x-auto scrollbar-none ${
                  isDarkMode ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <button
                    id="tab-btn-steps"
                    onClick={() => setActiveTab('steps')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      activeTab === 'steps' 
                        ? (isDarkMode ? 'bg-purple-600 text-white shadow-sm' : 'bg-indigo-600 text-white shadow-sm') 
                        : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60')
                    }`}
                  >
                    <BookOpen size={13} />
                    <span>{lang === 'ar' ? 'الشرح العملي والخطوات' : 'Practical Guide'}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeTab === 'steps' ? 'bg-white/20 text-white' : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700')
                    }`}>
                      {selectedVideo.steps.length}
                    </span>
                  </button>

                  <button
                    id="tab-btn-chapters"
                    onClick={() => setActiveTab('chapters')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      activeTab === 'chapters' 
                        ? (isDarkMode ? 'bg-purple-600 text-white shadow-sm' : 'bg-indigo-600 text-white shadow-sm') 
                        : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60')
                    }`}
                  >
                    <ListVideo size={13} />
                    <span>{lang === 'ar' ? 'فصول وتوقيتات الفيديو' : 'Video Chapters'}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeTab === 'chapters' ? 'bg-white/20 text-white' : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700')
                    }`}>
                      {selectedVideo.chapters.length}
                    </span>
                  </button>

                  <button
                    id="tab-btn-faqs"
                    onClick={() => setActiveTab('faqs')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      activeTab === 'faqs' 
                        ? (isDarkMode ? 'bg-purple-600 text-white shadow-sm' : 'bg-indigo-600 text-white shadow-sm') 
                        : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60')
                    }`}
                  >
                    <HelpCircle size={13} />
                    <span>{lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQs'}</span>
                  </button>
                </div>

                {/* Tab Content */}
                <div>
                  {/* Step-by-Step Guide */}
                  {activeTab === 'steps' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-2.5">
                        {selectedVideo.steps.map((step) => (
                          <div
                            key={step.stepNumber}
                            className={`border rounded-2xl p-3.5 space-y-1.5 transition ${
                              isDarkMode 
                                ? 'bg-slate-950/60 border-slate-800/80 hover:border-purple-500/40 text-slate-200' 
                                : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                                {step.stepNumber}
                              </span>
                              <h4 className={`text-xs sm:text-sm font-bold ${
                                isDarkMode ? 'text-white' : 'text-slate-900'
                              }`}>
                                {lang === 'ar' ? step.titleAr : step.titleEn}
                              </h4>
                            </div>
                            <p className={`text-xs leading-relaxed ps-7 sm:ps-8 ${
                              isDarkMode ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              {lang === 'ar' ? step.detailAr : step.detailEn}
                            </p>
                            {(step.actionTipAr || step.actionTipEn) && (
                              <div className={`ms-7 sm:ms-8 p-2.5 rounded-xl border text-xs flex items-center gap-1.5 ${
                                isDarkMode 
                                  ? 'bg-purple-950/30 border-purple-500/20 text-purple-200' 
                                  : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                              }`}>
                                <Sparkles size={13} className={isDarkMode ? 'text-purple-400' : 'text-indigo-600'} />
                                <span>{lang === 'ar' ? step.actionTipAr : step.actionTipEn}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Key Takeaways */}
                      <div className={`p-4 rounded-2xl border space-y-2 ${
                        isDarkMode 
                          ? 'bg-indigo-950/25 border-indigo-500/30' 
                          : 'bg-indigo-50/70 border-indigo-200'
                      }`}>
                        <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          isDarkMode ? 'text-indigo-300' : 'text-indigo-900'
                        }`}>
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          <span>{lang === 'ar' ? 'أبرز مخرجات هذا الدرس' : 'Key Outcomes'}</span>
                        </h4>
                        <ul className={`space-y-1 text-xs ps-4 list-disc ${
                          isDarkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {(lang === 'ar' ? selectedVideo.keyTakeawaysAr : selectedVideo.keyTakeawaysEn).map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Chapters Tab */}
                  {activeTab === 'chapters' && (
                    <div className="space-y-2">
                      {selectedVideo.chapters.map((chap, idx) => {
                        const isCurrentChapter = currentTime >= chap.seconds && (idx === selectedVideo.chapters.length - 1 || currentTime < selectedVideo.chapters[idx + 1].seconds);
                        return (
                          <div
                            key={idx}
                            onClick={() => jumpToChapter(chap.seconds)}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                              isCurrentChapter
                                ? (isDarkMode ? 'bg-purple-900/40 border-purple-500/60 shadow-sm' : 'bg-indigo-50 border-indigo-400 shadow-sm')
                                : (isDarkMode ? 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50' : 'bg-white border-slate-200 hover:bg-slate-50')
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border shrink-0 ${
                                isDarkMode 
                                  ? 'bg-slate-800 text-purple-300 border-slate-700' 
                                  : 'bg-slate-100 text-indigo-700 border-slate-200'
                              }`}>
                                {chap.time}
                              </span>
                              <div className="min-w-0">
                                <h5 className={`text-xs font-bold truncate ${
                                  isDarkMode ? 'text-white' : 'text-slate-900'
                                }`}>
                                  {lang === 'ar' ? chap.titleAr : chap.titleEn}
                                </h5>
                                <p className={`text-[11px] truncate ${
                                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  {lang === 'ar' ? chap.descAr : chap.descEn}
                                </p>
                              </div>
                            </div>
                            <Play size={13} className={`${isDarkMode ? 'text-purple-400' : 'text-indigo-600'} shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* FAQs Tab */}
                  {activeTab === 'faqs' && (
                    <div className="space-y-2.5">
                      {(lang === 'ar' ? selectedVideo.faqsAr : selectedVideo.faqsEn).map((faq, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-xl border space-y-1 ${
                            isDarkMode 
                              ? 'bg-slate-950/50 border-slate-800/80' 
                              : 'bg-white border-slate-200 shadow-xs'
                          }`}
                        >
                          <div className={`flex items-center gap-1.5 text-xs font-bold ${
                            isDarkMode ? 'text-purple-300' : 'text-indigo-700'
                          }`}>
                            <HelpCircle size={13} className={isDarkMode ? 'text-purple-400' : 'text-indigo-600'} />
                            <span>{faq.q}</span>
                          </div>
                          <p className={`text-xs ps-4 leading-relaxed ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            {faq.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Dashboard-Style Navigation Sidebar (Desktop 4 cols) */}
            <div className={`hidden lg:block lg:col-span-4 p-3 sm:p-4 space-y-4 overflow-y-auto ${
              isDarkMode ? 'bg-slate-950/70' : 'bg-slate-50/90'
            }`}>
              {renderSidebarContent()}
            </div>

          </div>

          {/* Mobile Overlay Sidebar Drawer */}
          <AnimatePresence>
            {isMobileDrawerOpen && (
              <div className="fixed inset-0 z-50 lg:hidden flex">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
                />

                {/* Sliding Drawer Container */}
                <motion.div
                  initial={{ x: isRtl ? '100%' : '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: isRtl ? '100%' : '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className={`relative z-10 w-4/5 max-w-sm h-full overflow-y-auto p-4 shadow-2xl flex flex-col border-e ${
                    isDarkMode 
                      ? 'bg-slate-900 border-purple-500/30 text-white' 
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
                    <span className="text-xs font-bold">{lang === 'ar' ? 'فهرس الشروحات' : 'Lessons Playlist'}</span>
                    <button
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="p-1 rounded-lg border border-slate-700 text-slate-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {renderSidebarContent()}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Modal Footer */}
          <div className={`px-4 sm:px-6 py-2.5 border-t flex items-center justify-between text-xs flex-wrap gap-2 shrink-0 transition-colors ${
            isDarkMode 
              ? 'bg-slate-950/90 border-slate-800/80 text-slate-400' 
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium">
                {lang === 'ar' ? 'أكاديمية تدريب FleetAurvexis - متجددة باستمرار' : 'FleetAurvexis Video Academy - Continuously Updated'}
              </span>
            </div>
            <button
              onClick={onClose}
              className={`px-3.5 py-1 rounded-xl font-semibold text-xs transition border cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
              }`}
            >
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
