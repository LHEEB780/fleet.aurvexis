import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Check, 
  Cpu, 
  Globe2, 
  Sparkles, 
  ChevronRight, 
  Users, 
  Activity, 
  Clock, 
  Download, 
  FileCheck, 
  Info, 
  Layers, 
  Shield, 
  Code, 
  Grid, 
  Terminal, 
  Sliders, 
  RefreshCw, 
  FileText, 
  ExternalLink,
  Lock,
  Bookmark,
  Share2,
  Copy,
  Zap,
  HardDrive,
  Truck,
  Smartphone,
  Wrench,
  Star,
  Menu,
  X,
  Building2,
  Phone,
  Mail,
  ChevronDown,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../services/LanguageContext';
import { saveDocument } from '../services/firebase';
import FleetManagersShowcaseModal from './FleetManagersShowcaseModal';
import CustomerSuccessStories from './CustomerSuccessStories';

interface MarketingLandingPageProps {
  onNavigateToCRM?: () => void;
  onNavigateToSaaS: (autoLogin?: boolean) => void;
  brandPrimaryColor?: string;
  brandName?: string;
  brandDesc?: string;
  isInsideApp?: boolean;
  onNavigateToTab?: (tab: string) => void;
  portalMode?: 'marketing' | 'saas';
}

// Reconstructed high-fidelity default lists from MarketingAdmin
const DEFAULT_FEATURES = [
  {
    id: 'f-1',
    icon: 'Truck',
    titleAr: 'إدارة أسطول النقل والسيارات',
    titleEn: 'Fleet Ledger Integrity',
    descAr: 'سجل متكامل لكل مركبة ومعدة، مع تحليلات الوقود وتواريخ الفحص الأسبوعي لمنع الأعطال المفاجئة.',
    descEn: 'Log technical properties, active drivers, and safety validation statuses cleanly across any layout.',
    badgeAr: 'أساسي',
    badgeEn: 'Core',
    image: '/src/assets/images/highway_logistics_truck_1782935190395.jpg'
  },
  {
    id: 'f-2',
    icon: 'Smartphone',
    titleAr: 'تلقي بلاغات السائقين والصوتيات',
    titleEn: 'Driver Feedback Channels',
    descAr: 'بوابة ويب متناسقة بالكامل للسائقين لإرسال بلاغات ميكانيكية فورية مع دعم رسائل الصوت والفحص بالباركود للسلامة.',
    descEn: 'Instant reporting desk that allows drivers to submit issues, including fast voice note capture.',
    badgeAr: 'تفاعلي',
    badgeEn: 'Interactive',
    image: '/src/assets/images/driver_truck_inspection_1786784371761.jpg'
  },
  {
    id: 'f-3',
    icon: 'Cpu',
    titleAr: 'الذكاء الاصطناعي لتشخيص الأعطال ذاتياً',
    titleEn: 'Interactive AI Diagnostics',
    descAr: 'محرك ميكانيكي ذكي يقوم بالتدقيق والفحص التلقائي لرموز الأخطاء ويقترح مسار الإصلاح المثالي والقطع اللازمة.',
    descEn: 'Instantly query diagnostic codes and parse engine troubleshooting scripts natively using model integrations.',
    badgeAr: 'حصري',
    badgeEn: 'AI Powered',
    image: '/src/assets/images/ai_fleet_diagnostics_1786785439472.jpg'
  },
  {
    id: 'f-4',
    icon: 'Wrench',
    titleAr: 'إدارة الورش والمواعيد الدورية',
    titleEn: 'Workshops & Preventative Triggers',
    descAr: 'تنظيم مهام الفنيين وصيانة المعدات وفق جداول زمنية دقيقة لتقليل مدة تعطل الأسطول التشغيلية.',
    descEn: 'Schedule service plans, dispatch workorders, and optimize technician workbench allocations dynamically.',
    badgeAr: 'جديد',
    badgeEn: 'New Update',
    image: '/src/assets/images/mechanic_truck_workshop_1782935168167.jpg'
  }
];

const DEFAULT_CLIENTS = [
  { 
    id: 'c-1', 
    nameAr: 'مؤسسة الغد للشحن الذكي',
    nameEn: 'Al-Ghad Smart Transport Corp.',
    industryAr: 'سلاسل التوريد وشحن المستقبل', 
    industryEn: 'Supply Chain & Future Cargo', 
    rating: 5, 
    yearJoint: '2024', 
    activeVehicles: '1,200', 
    logoSeed: 'LG',
    colorClass: 'text-brand-blue-600 bg-brand-blue-50 border-brand-blue-100 dark:bg-brand-blue-950/30'
  },
  { 
    id: 'c-2', 
    nameAr: 'فيوتشر تراك للخدمات البيئية',
    nameEn: 'FutureTrack Eco Services',
    industryAr: 'خدمات النقل النظيف والهجين', 
    industryEn: 'Clean & Hybrid Mobility Hubs', 
    rating: 5, 
    yearJoint: '2023', 
    activeVehicles: '450', 
    logoSeed: 'FT',
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30'
  },
  { 
    id: 'c-3', 
    nameAr: 'المسار المستدام للنقل اللوجستي',
    nameEn: 'Sustainable National Cargo',
    industryAr: 'شحن مستدام وموثق للصناعات', 
    industryEn: 'Certified Sustainable Logistics', 
    rating: 5, 
    yearJoint: '2024', 
    activeVehicles: '820', 
    logoSeed: 'SC',
    colorClass: 'text-sky-600 bg-sky-50 border-sky-100 dark:bg-sky-950/30'
  },
  { 
    id: 'c-4', 
    nameAr: 'أوربت ترانزيت للنقل الطاقي',
    nameEn: 'TransOrbit Hybrid Transit',
    industryAr: 'شحن الطاقة المسال والوقائيات', 
    industryEn: 'Energy Cargo & Odometer Sync', 
    rating: 4.9, 
    yearJoint: '2025', 
    activeVehicles: '310', 
    logoSeed: 'OT',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/30'
  },
  { 
    id: 'c-5', 
    nameAr: 'ريدان للتكامل اللوجستي',
    nameEn: 'Raydan Eco-Transit Systems',
    industryAr: 'شبكات النقل الكهربائي الموثوق', 
    industryEn: 'Battery-Powered Net-Zero Transit', 
    rating: 5, 
    yearJoint: '2025', 
    activeVehicles: '150', 
    logoSeed: 'RE',
    colorClass: 'text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-950/30'
  }
];

const DEFAULT_REVIEWS = [
  {
    id: 'r-1',
    authorNameAr: 'المهندس عبدالرحمن العتيبي',
    authorNameEn: 'Eng. Abdulrahman Al-Otaibi',
    roleAr: 'مدير العمليات اللوجستية',
    roleEn: 'VP of Fleet Logistics',
    companyAr: 'المسار المستدام للنقل اللوجستي',
    companyEn: 'Sustainable National Cargo',
    contentAr: 'ساعدتنا بوابة صيانة المعدات في دمج الفنيين مع تقارير السائقين الصوتية بشكل فوري. مستوى التحكم في استهلاك قطع الغيار فاق توقعاتنا بكثير!',
    contentEn: 'This platform transformed our maintenance response. Integrating driver voice reports directly with the mechanics desk has cut down repair cycle-times extensively.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces'
  },
  {
    id: 'r-2',
    authorNameAr: 'المهندس صالح الخالدي',
    authorNameEn: 'Eng. Saleh Al-Khaldi',
    roleAr: 'رئيس وحدة صيانة المعدات الثقيلة',
    roleEn: 'Head of Heavy Equipment Maintenance',
    companyAr: 'فيوتشر تراك للخدمات البيئية',
    companyEn: 'FutureTrack Eco Services',
    contentAr: 'الذكاء الاصطناعي لفحص كود الأعطال يثير الإعجاب. نوفر الآن آلاف الريالات يومياً عبر استباق الأعطال وتصليح الحشوات قبل تضرر رأس المحرك.',
    contentEn: 'The AI diagnostics scanner is highly impressive. We prevent massive cylinder head damage by proactive component swaps triggered by sensor thresholds.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces'
  },
  {
    id: 'r-3',
    authorNameAr: 'د. فيصل السديري',
    authorNameEn: 'Dr. Faisal Al-Sudairy',
    roleAr: 'مشرف الخدمات البلدية والمعدات',
    roleEn: 'Municipal Services Supervisor',
    companyAr: 'أوربت ترانزيت للنقل الطاقي',
    companyEn: 'TransOrbit Hybrid Transit',
    contentAr: 'نظام إدارة الإطارات ومراقبة مستويات الضغط يعطينا رؤية أمان حقيقية وموثوقة على شبكتنا الميدانية. نوصي به بشدة لأي قطاع بلدي أو نقلي.',
    contentEn: 'The tire integrity desk and tire inventory audit tools give us reliable safety views on active vehicles. Highly recommended for municipal environments.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces'
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
      { id: "item-1-6", labelAr: "النقل اللوجستي والشاحنات", labelEn: "Logistics & Trucking" }
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
      { id: "item-2-6", labelAr: "أتمتة العمليات وحوكمة الامتثال", labelEn: "Ecosystem Compliance Audit" }
    ]
  },
  {
    id: "col-3",
    titleAr: "أهم المصادر والأقسام",
    titleEn: "Key Resources",
    items: [
      { id: "item-3-1", labelAr: "قصص ودراسات نجاح العملاء", labelEn: "Validated Customer Case Stories" },
      { id: "item-3-2", labelAr: "مدونة Axoventra للفنيين", labelEn: "Axoventra Engineering Blog" },
      { id: "item-3-3", labelAr: "مكتبة الفيديوهات والشروحات", labelEn: "Platform Video Library" },
      { id: "item-3-4", labelAr: "أدلة وركائز الاستخدام التشغيلي", labelEn: "Operations Guides" }
    ]
  },
  {
    id: "col-4",
    titleAr: "الشركة والدعم",
    titleEn: "Company & Support",
    items: [
      { id: "item-4-1", labelAr: "نبذة عن شركة Axoventra", labelEn: "About Axoventra" },
      { id: "item-4-2", labelAr: "غرفة المركز الإعلامي والأخبار", labelEn: "Corporate Press Room" },
      { id: "item-4-3", labelAr: "الاتصال المباشر بالدعم الفني", labelEn: "24/7 Engineers Helpdesk" },
      { id: "item-4-4", labelAr: "تنسيق وحجز عرض تقديمي ديمو للمنصة", labelEn: "Request a Dynamic Demo Run" }
    ]
  }
];

const getReviewInitials = (name: string) => {
  if (!name) return '??';
  const clean = name.replace(/(المهندس|المهندسة|الدكتور|الدكتورة|الأستاذ|الأستاذة|الشيخ|م\.|د\.)/g, '').trim();
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`;
  }
  return parts[0] ? parts[0].substring(0, 2) : '??';
};

export default function MarketingLandingPage({
  onNavigateToSaaS,
  brandPrimaryColor = '#6d28d9',
  brandName = '',
  brandDesc = '',
  isInsideApp = false,
  onNavigateToTab,
  portalMode
}: MarketingLandingPageProps) {
  
  const { language, setLanguage, dir, t } = useLanguage();
  const isRtl = dir === 'rtl';

  const effectivePortalMode = portalMode || (localStorage.getItem('saas_portal_mode') as 'marketing' | 'saas') || 'marketing';

  // Helper to migrate legacy/broken feature image URLs to reliable local assets
  const migrateFeatures = (features: typeof DEFAULT_FEATURES) => {
    return features.map((feat) => {
      if (feat.id === 'f-1' && (!feat.image || feat.image.includes('unsplash.com'))) {
        return { ...feat, image: '/src/assets/images/highway_logistics_truck_1782935190395.jpg' };
      }
      if (feat.id === 'f-2' && (!feat.image || feat.image.includes('unsplash.com'))) {
        return { ...feat, image: '/src/assets/images/driver_truck_inspection_1786784371761.jpg' };
      }
      if (feat.id === 'f-3' && (!feat.image || feat.image.includes('unsplash.com') || feat.image.includes('photo-1486006920555'))) {
        return { ...feat, image: '/src/assets/images/ai_fleet_diagnostics_1786785439472.jpg' };
      }
      if (feat.id === 'f-4' && (!feat.image || feat.image.includes('unsplash.com'))) {
        return { ...feat, image: '/src/assets/images/mechanic_truck_workshop_1782935168167.jpg' };
      }
      return feat;
    });
  };

  // Dynamic states initialized from localStorage with robust fallbacks
  const [featuresList, setFeaturesList] = useState(() => {
    const stored = localStorage.getItem('saas_marketing_features_v1');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return migrateFeatures(parsed);
        }
      } catch (e) {}
    }
    return DEFAULT_FEATURES;
  });

  const [clientsList, setClientsList] = useState(() => {
    const stored = localStorage.getItem('saas_marketing_clients_v2');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return DEFAULT_CLIENTS;
  });

  const [reviewsList, setReviewsList] = useState(() => {
    const stored = localStorage.getItem('saas_marketing_reviews_v1');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return DEFAULT_REVIEWS;
  });

  const [footerColumnsList, setFooterColumnsList] = useState(() => {
    const stored = localStorage.getItem('saas_marketing_footer_columns_v2');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return DEFAULT_FOOTER_COLUMNS;
  });

  // Keep states in sync with any modifications in the Admin panel
  useEffect(() => {
    const handleStorageChange = () => {
      const storedFeatures = localStorage.getItem('saas_marketing_features_v1');
      if (storedFeatures) {
        try { 
          const parsed = JSON.parse(storedFeatures);
          if (Array.isArray(parsed)) {
            setFeaturesList(migrateFeatures(parsed));
          }
        } catch (e) {}
      }
      const storedClients = localStorage.getItem('saas_marketing_clients_v2');
      if (storedClients) {
        try { setClientsList(JSON.parse(storedClients)); } catch (e) {}
      }
      const storedReviews = localStorage.getItem('saas_marketing_reviews_v1');
      if (storedReviews) {
        try { setReviewsList(JSON.parse(storedReviews)); } catch (e) {}
      }
      const storedFooter = localStorage.getItem('saas_marketing_footer_columns_v2');
      if (storedFooter) {
        try { setFooterColumnsList(JSON.parse(storedFooter)); } catch (e) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom trigger for same-window updates
    window.addEventListener('marketing-data-updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('marketing-data-updated', handleStorageChange);
    };
  }, []);

  // Helper to resolve high-fidelity default images if none are supplied customly
  const getFeatureImage = (id: string, customImage?: string) => {
    if (customImage && !customImage.includes('unsplash.com')) return customImage;
    switch (id) {
      case 'f-1': return '/src/assets/images/highway_logistics_truck_1782935190395.jpg';
      case 'f-2': return '/src/assets/images/driver_truck_inspection_1786784371761.jpg';
      case 'f-3': return '/src/assets/images/ai_fleet_diagnostics_1786785439472.jpg';
      case 'f-4': return '/src/assets/images/mechanic_truck_workshop_1782935168167.jpg';
      default: return '/src/assets/images/ai_fleet_diagnostics_1786785439472.jpg';
    }
  };

  // State elements
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);
  const [selectedShowcaseTab, setSelectedShowcaseTab] = useState<string>('owners');
  const [selectedReview, setSelectedReview] = useState(0);
  const [isReviewHovered, setIsReviewHovered] = useState(false);
  const [reviewImageError, setReviewImageError] = useState(false);

  // Auto play reviews slider
  useEffect(() => {
    if (isReviewHovered) return;
    const interval = setInterval(() => {
      setReviewsList(prevReviews => {
        if (prevReviews.length === 0) return prevReviews;
        setSelectedReview(prev => (prev + 1) % prevReviews.length);
        return prevReviews;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [isReviewHovered]);

  // Reset image error whenever selectedReview changes
  useEffect(() => {
    setReviewImageError(false);
  }, [selectedReview]);
  
  // Pricing/ROI Calculator states
  const [calcVehicles, setCalcVehicles] = useState(25);
  const [calcCostPerVehicle, setCalcCostPerVehicle] = useState(150); // monthly maintenance cost

  // Leads submission states
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    fleetSize: '20-50'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Dynamic branding computations
  const effectiveBrandName = brandName || 'Axoventra';
  const effectiveBrandDesc = brandDesc || (language === 'ar' 
    ? 'المنظومة السحابية الذكية المتكاملة لحوكمة صيانة المركبات والمعدات الثقيلة للمؤسسات والشركات الكبرى.' 
    : 'The ultimate digital ecosystem for fleet vehicle maintenance, preventative PM tracking, and AI-enabled diagnostics.');

  // Simulated live automation logs for the landing sandbox
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msgAr: string; msgEn: string; status: 'ok' | 'info' | 'warning' }>>([
    { id: '1', time: '11:45:02', msgAr: 'تأكيد سلامة اتصال الخادم السحابي بالمنطقة الشرقية', msgEn: 'SaaS Core connectivity established in Node-West-1', status: 'ok' },
    { id: '2', time: '11:45:15', msgAr: 'أتمتة: تسجيل فحص وقائي تلقائي للشاحنة رقم #0438', msgEn: 'Automation rule [fleet.pm_routine] registered for Truck #0438', status: 'info' },
    { id: '3', time: '11:45:30', msgAr: 'محرك الذكاء الاصطناعي: تم فحص وتحليل كود العطل P0301 بنجاح', msgEn: 'AI Diagnostics: Code P0301 misfire scanned & diagnostic recommended', status: 'ok' }
  ]);
  const [activeBayLoad, setActiveBayLoad] = useState(48);
  const [scannedQRsCount, setScannedQRsCount] = useState(142);
  const userTouchedSlider = React.useRef(false);

  // Maintain ref to activeBayLoad so background telemetry log generator always has latest user-adjusted values
  const activeBayLoadRef = React.useRef(activeBayLoad);
  useEffect(() => {
    activeBayLoadRef.current = activeBayLoad;
  }, [activeBayLoad]);

  // Background logging effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const currentLoad = activeBayLoadRef.current;

      const logTemplates = [
        { 
          msgAr: 'مزامنة مستشعرات الإطارات ومستوى ضغط الهواء للمقطورة #0992', 
          msgEn: 'Synced tire pressure telemetry for trailer asset #0992', 
          status: 'ok' as const 
        },
        { 
          msgAr: 'تنبيه: الكشف عن انخفاض في مستوى سائل تبريد المحرك للرافعة الكاتربيلر', 
          msgEn: 'Warning: Coolant levels near minimum safety threshold on CAT Forklift', 
          status: 'warning' as const 
        },
        { 
          msgAr: 'تسجيل طلب فحص دوري جديد وارد من هاتف السائق الفني شاكر', 
          msgEn: 'New driver inspection report received from field tech Shaker', 
          status: 'info' as const 
        },
        { 
          msgAr: 'توليد كود واستجابة QR Code لملصق المركبة رقم #0112 للطباعة', 
          msgEn: 'Generated system QR tag for high-speed printer sync on Asset #0112', 
          status: 'ok' as const 
        }
      ];
      
      let chosen;
      // If the workshop bay load is critically high, dynamically trigger warning logs reflecting that state!
      if (currentLoad > 80 && Math.random() > 0.3) {
        chosen = {
          msgAr: `تنبيه حرج: تجاوزت ورشة العمل نسبة إشغال آمنة بقيمة (${currentLoad}%)`,
          msgEn: `Critical warning: Workshop has exceeded safe capacity at (${currentLoad}%)`,
          status: 'warning' as const
        };
      } else {
        chosen = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      }

      setLogs(prev => [
        { id: Date.now().toString(), time: timeStr, ...chosen },
        ...prev.slice(0, 5)
      ]);

      // Gently drift/fluctuate activeBayLoad around the current value (+/- 1) to simulate real-time live updates
      if (!userTouchedSlider.current) {
        setActiveBayLoad(prev => {
          const drift = Math.random() > 0.5 ? 1 : -1;
          const nextVal = prev + drift;
          return Math.max(10, Math.min(100, nextVal));
        });
      }

      setScannedQRsCount(prev => prev + 1);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.phone) {
      alert(language === 'ar' ? 'الرجاء تعبئة جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveDocument('saas_leads', Date.now().toString(), {
        ...signupForm,
        submittedAt: new Date().toISOString(),
        brand: effectiveBrandName,
        status: 'new'
      });
      setSubmitSuccess(true);
      setSignupForm({ name: '', email: '', phone: '', company: '', fleetSize: '20-50' });
    } catch (err) {
      console.error('Error saving lead:', err);
      // Fallback to localStorage
      const localLeads = JSON.parse(localStorage.getItem('saas_local_leads') || '[]');
      localLeads.push({
        ...signupForm,
        submittedAt: new Date().toISOString(),
        brand: effectiveBrandName,
        status: 'new'
      });
      localStorage.setItem('saas_local_leads', JSON.stringify(localLeads));
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Re-sync brand to localStorage for consistent identity
  const syncLocalBranding = () => {
    localStorage.setItem('saas_brand_name', effectiveBrandName);
    localStorage.setItem('saas_brand_desc', effectiveBrandDesc);
    localStorage.setItem('saas_brand_primary_color', brandPrimaryColor);
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    syncLocalBranding();
  }, [effectiveBrandName, effectiveBrandDesc, brandPrimaryColor]);

  // Icons mapper for local features list
  const renderFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'Truck': return <Truck className="w-5 h-5 text-white" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5 text-white" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-white" />;
      case 'Wrench': return <Wrench className="w-5 h-5 text-white" />;
      default: return <Sparkles className="w-5 h-5 text-white" />;
    }
  };

  // ROI computations
  const estimatedSavings = Math.round(calcVehicles * calcCostPerVehicle * 12 * 0.28); // 28% typical efficiency saving
  const calculatedDowntimeDays = Math.round(calcVehicles * 4.5);

  return (
    <div className={`min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col selection:bg-brand-blue-500/10 selection:text-brand-blue-500 transition-colors duration-300`}>
      
      {/* Live Preview Banner if inside app */}
      {isInsideApp && (
        <div className="bg-amber-500 text-slate-950 font-bold text-xs px-6 py-2.5 flex items-center justify-between border-b border-amber-600 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-pulse"></span>
            <span>
              {language === 'ar'
                ? 'معاينة حية للموقع التسويقي: جميع التعديلات في لوحة الإدارة تنعكس هنا مباشرة.'
                : 'Live Marketing Preview: All updates made in your Admin panel reflect here in real-time.'}
            </span>
          </div>
          <button
            onClick={() => onNavigateToTab?.('dashboard')}
            className="px-3 py-1 bg-slate-950 text-white font-bold text-[11px] rounded hover:bg-slate-800 transition cursor-pointer"
          >
            {language === 'ar' ? 'الرجوع للوحة التحكم ↩' : 'Back to Dashboard ↩'}
          </button>
        </div>
      )}
      
      {/* Top Professional Accent Bar */}
      <div 
        style={{ backgroundColor: brandPrimaryColor }}
        className="text-white text-xs py-2.5 px-6 font-medium flex items-center justify-between shadow-sm overflow-hidden"
      >
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-400 animate-pulse" />
            <span className="font-semibold text-white/95">
              {language === 'ar' 
                ? 'مرحباً بك في Axoventra - تم دمج نظام الهوية والخطوط الجديد باحترافية تامة'
                : 'Welcome to Axoventra - Premium typography & colors fully active'}
            </span>
          </span>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-white/80 font-mono tracking-wider">
              {language === 'ar' ? 'الحالة الفنية: ممتاز' : 'Operations Standing: Excellent 🟢'}
            </span>
            <button 
              onClick={() => {
                syncLocalBranding();
                onNavigateToSaaS(true);
              }}
              className="bg-white/15 hover:bg-white/25 transition-all duration-200 px-3 py-1 rounded-md font-bold uppercase tracking-wider text-[11px]"
            >
              {language === 'ar' ? 'دخول الكونسول' : 'Console Login'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Responsive Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8EAF1] shadow-xs">
        <div className="max-w-7xl mx-auto px-6 min-h-20 py-3 md:py-0 md:h-20 flex items-center justify-between gap-4">
          
          {/* Logo Brand with Geometric Icon */}
          <div className="flex items-center gap-3.5">
            <div 
              style={{ backgroundColor: brandPrimaryColor }}
              className="shrink-0 flex items-center justify-center p-2 rounded-xl shadow-md transform hover:rotate-6 transition-all duration-300"
            >
              {/* Distinct Geometric Logo Icon representing connectivity, AI and mechanical alignment */}
              <svg width="24" height="24" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="240" height="240" rx="64" fill="transparent" />
                <path d="M70 70 L120 120 L70 170" stroke="white" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M170 70 L120 120 L170 170" stroke="white" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                <circle cx="120" cy="120" r="32" fill={brandPrimaryColor} stroke="white" strokeWidth="10" />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <span className="font-extrabold text-[16px] tracking-[0.05em] text-[#202124] font-sans">
                {effectiveBrandName}
              </span>
              <span className="text-[10px] font-bold text-[#5F6368] tracking-widest uppercase">
                {language === 'ar' ? 'إدارة صيانة الأساطيل' : 'Connectivity & Maintenance Suite'}
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              {language === 'ar' ? 'الميزات الأساسية' : 'Platform Pillars'}
            </a>
            <a href="#simulator" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              {language === 'ar' ? 'المحاكي المباشر' : 'Live Sandbox'}
            </a>
            <a href="#clients" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              {language === 'ar' ? 'عملاؤنا' : 'Enterprise Partners'}
            </a>
            <a href="#roi" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              {language === 'ar' ? 'حاسبة الوفورات' : 'ROI Tool'}
            </a>
          </nav>

          {/* Actions & Multilingual Toggle */}
          <div className="flex items-center gap-3.5">
            {/* Arabic / English Toggle */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 border border-[#E8EAF1] rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Globe2 size={14} className="text-slate-500" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Launch Console */}
            <button
              onClick={() => {
                syncLocalBranding();
                onNavigateToSaaS(true);
              }}
              className="px-4.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-200 cursor-pointer"
            >
              {language === 'ar' ? 'دخول النظام' : 'Launch System'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50/40 via-slate-50/40 to-white py-16 md:py-24 border-b border-purple-100/50">
        {/* Ambient Purple Backdrop Glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-400/6 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-300/8 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Left Info */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue-50 border border-brand-blue-100/50 rounded-full text-xs font-semibold text-brand-blue-700 mx-auto lg:mx-0">
              <Sparkles size={13} style={{ color: brandPrimaryColor }} />
              <span>
                {language === 'ar' 
                  ? 'برمجة ذكية ومعاينة فورية بهوية صيانة معتمدة' 
                  : 'Enterprise connectivity with sub-second telemetry'}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {language === 'ar' 
                ? 'منظومة صيانة وحركة الأساطيل الرقمية بموثوقية فائقة'
                : 'Unified Telemetry & Intelligent Diagnostics for Modern Fleets'}
            </h1>

            <p className="text-slate-600 text-base md:text-lg max-w-2xl leading-relaxed">
              {effectiveBrandDesc}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <button
                onClick={() => setShowSignupModal(true)}
                style={{ backgroundColor: brandPrimaryColor }}
                className="w-full sm:w-auto px-8 py-3.5 text-white font-bold rounded-xl shadow-md hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{language === 'ar' ? 'ابدأ تجربة مجانية الآن' : 'Start Free Trial'}</span>
                <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
              </button>

              <button
                onClick={() => setIsShowcaseOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-white border border-[#E8EAF1] text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-950 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <FileCheck size={16} className="text-slate-500" />
                <span>{language === 'ar' ? 'تصفح الحلول والأقسام' : 'Browse Solutions Map'}</span>
              </button>
            </div>

            {/* Quick trust proofs */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#E8EAF1] max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-right">
                <span className="block text-xl font-bold text-slate-900 font-mono">1,840+</span>
                <span className="text-[11px] text-slate-500">{language === 'ar' ? 'مركبة تحت الإدارة' : 'Managed Vehicles'}</span>
              </div>
              <div className="text-center lg:text-right">
                <span className="block text-xl font-bold text-slate-900 font-mono">24.3K</span>
                <span className="text-[11px] text-slate-500">{language === 'ar' ? 'أمر صيانة مكتمل' : 'PM Tasks Processed'}</span>
              </div>
              <div className="text-center lg:text-right">
                <span className="block text-xl font-bold text-slate-900 font-mono">99.9%</span>
                <span className="text-[11px] text-slate-500">{language === 'ar' ? 'جاهزية تشغيلية' : 'System Uptime'}</span>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Mockup with layered real-world photo & live dashboard */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-3xl blur-xl opacity-20 transition duration-1000"></div>
            
            <div className="relative space-y-4">
              {/* Primary High-fidelity Work-field Image */}
              <div className="relative h-48 rounded-3xl overflow-hidden border border-slate-200/80 shadow-md group">
                <img 
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80" 
                  alt="Modern Fleet Operations Depot"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 right-4 left-4 flex justify-between items-center">
                  <span className="text-white text-[10px] font-bold bg-slate-950/75 px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    {language === 'ar' ? 'التحليلات الميدانية النشطة' : 'Active Field Analytics'}
                  </span>
                </div>
              </div>

              {/* Live Telemetry Floating Terminal Card */}
              <div className="bg-slate-900 rounded-3xl p-4 shadow-xl border border-slate-800">
                {/* Header inside mockup */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  </div>
                  <span className="text-[9px] font-sans text-slate-400 tracking-wider">
                    {language === 'ar' ? 'بوابة Axoventra التشخيصية' : 'AXOVENTRA DIAGNOSTIC GATEWAY'}
                  </span>
                  <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[9px] font-bold">SECURE SSL</span>
                </div>

                {/* Simulated parameters */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase block">{language === 'ar' ? 'الآلية النشطة حالياً' : 'Active Live Telemetry'}</span>
                    <div className="flex justify-between items-center text-slate-200">
                      <span className="font-bold flex items-center gap-1 text-slate-200">
                        <Truck size={14} className="text-brand-blue-400" />
                        Toyota Hilux 4x4 [Plate #0932]
                      </span>
                      <span className="text-green-400 font-bold animate-pulse text-[11px]">● Connected</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] text-slate-500 block">{language === 'ar' ? 'حرارة المحرك' : 'Coolant Temp'}</span>
                      <span className="text-xs font-bold text-emerald-400">89°C (Normal)</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] text-slate-500 block">{language === 'ar' ? 'عداد الكيلومترات' : 'Odometer Reading'}</span>
                      <span className="text-xs font-bold text-slate-200">142,390 km</span>
                    </div>
                  </div>

                  {/* Live running diagnostic visual bar */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-slate-400">{language === 'ar' ? 'ضغط الإطارات الإجمالي' : 'Aggregated Tire Pressure'}</span>
                      <span className="text-slate-300">32 PSI / 34 PSI</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-blue-500 rounded-full w-[88%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-slate-50/50 via-white to-purple-50/20 border-b border-slate-100 relative overflow-hidden">
        {/* Ambient Purple Blur */}
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-700 bg-purple-50/70 border border-purple-100/60 px-3 py-1 rounded-full">
              {language === 'ar' ? 'القدرات الهندسية للمنصة' : 'Engineered for Performance'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {language === 'ar' 
                ? 'الحلول الأربعة الكبرى للسيطرة على حركة وصيانة أسطولك'
                : 'Four Key Pillars to Completely Control Your Fleet Lifecycle'}
            </h2>
            <p className="text-slate-600">
              {language === 'ar' 
                ? 'توفر منصتنا بنية تحتية رقمية حية تمنح الفنيين والمدراء والمدراء التنفيذيين لوحة تحكم واحدة خالية من الفوضى.'
                : 'Our platform provides professional technicians and executives with absolute control over parts, diagnostics, and repairs.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {featuresList.map((feat) => (
              <div 
                key={feat.id}
                className="border border-slate-200/80 p-8 rounded-2xl hover:border-purple-200 hover:shadow-md transition-all duration-300 bg-white space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Feature Image */}
                  <div className="h-48 w-full rounded-xl overflow-hidden mb-4 relative group bg-slate-900 shadow-inner">
                    <img 
                      src={getFeatureImage(feat.id, feat.image)} 
                      alt={language === 'ar' ? feat.titleAr : feat.titleEn} 
                      className="w-full h-full object-cover transform hover:scale-105 transition-all duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/images/ai_fleet_diagnostics_1786785439472.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
                  </div>

                  {/* Icon and Title */}
                  <div className="flex items-center gap-3">
                    <div 
                      style={{ backgroundColor: brandPrimaryColor }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0"
                    >
                      {renderFeatureIcon(feat.icon)}
                    </div>
                    <div className="space-y-0.5">
                      <span className="px-1.5 py-0.5 bg-purple-50/80 text-purple-700 text-[9px] font-black rounded uppercase border border-purple-100/60">
                        {language === 'ar' ? feat.badgeAr : feat.badgeEn}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                        {language === 'ar' ? feat.titleAr : feat.titleEn}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'ar' ? feat.descAr : feat.descEn}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[11px] font-mono text-slate-500">
                    CODE: {feat.id.toUpperCase()}
                  </span>
                  <button 
                    onClick={() => {
                      let mappedTab = "owners";
                      if (feat.id === "f-1") mappedTab = "item-2-5";
                      else if (feat.id === "f-2") mappedTab = "item-2-2";
                      else if (feat.id === "f-3") mappedTab = "item-2-6";
                      else if (feat.id === "f-4") mappedTab = "item-2-1";
                      setSelectedShowcaseTab(mappedTab);
                      setIsShowcaseOpen(true);
                    }}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{language === 'ar' ? 'اقرأ المزيد' : 'Learn More'}</span>
                    <ChevronRight size={13} className={isRtl ? 'rotate-180' : ''} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Interactive Telemetry & Operations Sandbox Simulator */}
      <section id="simulator" className="py-20 bg-gradient-to-b from-slate-50/40 via-white to-white border-b border-slate-100 relative overflow-hidden">
        {/* Ambient Purple Backdrop */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-400/6 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Simulator Left Intro */}
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue-500">
              {language === 'ar' ? 'محاكاة البيانات الحية' : 'Live Data Simulator'}
            </span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {language === 'ar' ? 'فحص وصيانة افتراضية للأصول في الوقت الفعلي' : 'Interactive Telemetry & Operations Sandbox'}
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              {language === 'ar' 
                ? 'جرّب بنفسك طريقة تلقي بلاغات الحركة وصيانات الورش في السحابة. يتم إرسال إشارات التشخيص دورياً ومطابقتها بملصقات الباركود QR.'
                : 'See how our cloud architecture ingests live fleet status codes, processes driver feedback, and manages workshop bay congestion on the fly.'}
            </p>

            <div className="bg-white p-5 rounded-2xl border border-[#E8EAF1] space-y-4">
              <span className="text-xs font-bold text-slate-900 block">{language === 'ar' ? 'تعديل أحمال الصيانة الافتراضية' : 'Configure Sandbox Load'}</span>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>{language === 'ar' ? 'نسبة إشغال مسارات الورش' : 'Workshop Bay Congestion'}</span>
                  <span className="font-mono">{activeBayLoad}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={activeBayLoad}
                  onChange={(e) => {
                    userTouchedSlider.current = true;
                    const val = Number(e.target.value);
                    setActiveBayLoad(val);
                    
                    // Live manual telemetry trigger to make the simulator extremely immersive and reactive!
                    const now = new Date();
                    const timeStr = now.toTimeString().split(' ')[0];
                    const msgAr = val > 80 
                      ? `[تحذير الأحمال] تم ضبط نسبة إشغال المسارات يدوياً إلى مستوى حرج (${val}%)`
                      : `[تحديث السحابة] تم ضبط أحمال الصيانة الافتراضية للورش إلى (${val}%)`;
                    const msgEn = val > 80
                      ? `[LOAD ALERT] Workshop congestion level manually set to critical (${val}%)`
                      : `[CLOUD INTEGRATION] Sandbox maintenance loads updated to (${val}%)`;
                      
                    setLogs(prev => [
                      { id: Date.now().toString() + "-manual", time: timeStr, msgAr, msgEn, status: val > 80 ? 'warning' : 'info' },
                      ...prev.slice(0, 5)
                    ]);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-blue-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E8EAF1]/70">
                <span className="text-slate-500">{language === 'ar' ? 'إجمالي ملصقات QR الممسوحة' : 'Simulated QR Scans'}</span>
                <span className="font-mono font-bold text-brand-blue-500">{scannedQRsCount} scans</span>
              </div>
            </div>
          </div>

          {/* Simulator Right Interactive Screen Mockup */}
          <div className="lg:col-span-7">
            <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-mono text-slate-200">{language === 'ar' ? 'سجل العمليات المركزي للـ SaaS' : 'SaaS Operation Telemetry Stream'}</span>
                </div>
                <button 
                  onClick={() => setScannedQRsCount(prev => prev + 10)}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 transition rounded text-[10px] font-mono text-slate-300"
                >
                  Force Trigger Scan
                </button>
              </div>

              {/* Logs Stream */}
              <div className="space-y-2.5 h-64 overflow-y-auto font-mono text-[11px] leading-relaxed pr-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-2.5 border-b border-slate-900/50 pb-2">
                    <span className="text-slate-500 shrink-0">{log.time}</span>
                    <span className={`px-1 rounded text-[9px] shrink-0 ${
                      log.status === 'ok' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      log.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    }`}>
                      {log.status.toUpperCase()}
                    </span>
                    <span className="text-slate-300">
                      {language === 'ar' ? log.msgAr : log.msgEn}
                    </span>
                  </div>
                ))}
              </div>

              {/* Simulation indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3 border-t border-slate-900 font-mono text-center">
                <div className="bg-slate-900 p-2.5 rounded-xl">
                  <span className="text-[9px] text-slate-500 block uppercase">Ingress Buffer</span>
                  <span className="text-xs font-bold text-slate-200">12,401 msgs/sec</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl">
                  <span className="text-[9px] text-slate-500 block uppercase">Error Ratio</span>
                  <span className="text-xs font-bold text-emerald-400">0.00%</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl">
                  <span className="text-[9px] text-slate-500 block uppercase">DB Sync Status</span>
                  <span className="text-xs font-bold" style={{ color: brandPrimaryColor }}>100% Consistent</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Enterprise Partners Section */}
      <section id="clients" className="py-20 bg-gradient-to-b from-slate-50/40 via-white to-white border-b border-slate-100 relative overflow-hidden">
        {/* Ambient Purple Backdrop */}
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-700 bg-purple-50/80 border border-purple-100/60 px-3 py-1.5 rounded-full select-none">
              {language === 'ar' ? 'العملاء والشركاء المعتمدين' : 'Enterprise & Trust Network'}
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {language === 'ar' ? 'مؤسسات وشركات كبرى تدير أعمالها اليومية معنا' : 'SaaS Infrastructure Powering Leading Logistical Units'}
            </h2>
            <p className="text-slate-550 text-xs max-w-2xl mx-auto leading-relaxed">
              {language === 'ar' 
                ? 'ندير باعتزاز تماسك وأمان صيانة الأساطيل لأكبر الكيانات التجارية والحكومية بمرونة فائقة وحوكمة تشغيلية ١٠٠٪.'
                : 'From environmental services to high-capacity energy transit, our multi-tenant SaaS guarantees uncompromised reliability.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {clientsList.map((client) => {
              // Determine elegant color matching based on client seed or color class
              const isIndigo = client.colorClass?.includes('brand-blue') || client.colorClass?.includes('indigo') || client.id === 'c-1';
              const isEmerald = client.colorClass?.includes('emerald') || client.id === 'c-2';
              const isSky = client.colorClass?.includes('sky') || client.id === 'c-3';
              const isAmber = client.colorClass?.includes('amber') || client.id === 'c-4';
              const isPurple = client.colorClass?.includes('purple') || client.id === 'c-5';

              let barBg = 'bg-brand-blue-500';
              let badgeBg = 'bg-brand-blue-500/10 text-brand-blue-700 border-brand-blue-500/20';
              let shadowAccent = 'hover:shadow-brand-blue-500/5 hover:border-brand-blue-200';

              if (isEmerald) {
                barBg = 'bg-emerald-500';
                badgeBg = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
                shadowAccent = 'hover:shadow-emerald-500/5 hover:border-emerald-200';
              } else if (isSky) {
                barBg = 'bg-sky-500';
                badgeBg = 'bg-sky-500/10 text-sky-700 border-sky-500/20';
                shadowAccent = 'hover:shadow-sky-500/5 hover:border-sky-200';
              } else if (isAmber) {
                barBg = 'bg-amber-500';
                badgeBg = 'bg-amber-500/10 text-amber-700 border-amber-500/20';
                shadowAccent = 'hover:shadow-amber-500/5 hover:border-amber-200';
              } else if (isPurple) {
                barBg = 'bg-purple-500';
                badgeBg = 'bg-purple-500/10 text-purple-700 border-purple-500/20';
                shadowAccent = 'hover:shadow-purple-500/5 hover:border-purple-200';
              }

              return (
                <div 
                  key={client.id}
                  className={`group relative border border-slate-150/90 p-5 rounded-2xl bg-white space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${shadowAccent}`}
                >
                  {/* Decorative top colored border line */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${barBg} opacity-80 group-hover:opacity-100 transition-opacity`} />

                  <div className="flex items-center justify-between">
                    {/* Visual Avatar Placeholder */}
                    <div className={`w-11 h-11 rounded-xl font-bold flex items-center justify-center text-xs shadow-3xs border transition-transform duration-300 group-hover:scale-105 ${client.colorClass}`}>
                      {client.logoSeed}
                    </div>

                    {/* Active verified badge */}
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {language === 'ar' ? 'معتمد' : 'Verified'}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-grow text-right pt-1">
                    <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1 group-hover:text-slate-950 transition-colors">
                      {language === 'ar' ? client.nameAr : client.nameEn}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-semibold block truncate">
                      {language === 'ar' ? client.industryAr : client.industryEn}
                    </span>
                  </div>

                  {/* Divider line */}
                  <div className="border-t border-dashed border-slate-100 pt-3 flex items-center justify-between text-[10px] font-mono">
                    {/* Asset count badge */}
                    <div className={`px-2 py-0.5 rounded-lg border text-[9.5px] font-black ${badgeBg}`}>
                      <span className="font-mono">{client.activeVehicles}</span>{' '}
                      <span className="font-sans text-[8.5px] font-bold">{language === 'ar' ? 'آلية' : 'Assets'}</span>
                    </div>

                    {/* Rating badge */}
                    <div className="flex items-center gap-1 text-[9.5px] font-black text-amber-600 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-lg">
                      <Star size={9} fill="currentColor" className="text-amber-500" />
                      <span>{client.rating}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ROI & Price Calculator Section */}
      <section id="roi" className="py-20 bg-gradient-to-b from-slate-50/50 via-white to-white border-b border-slate-100 relative overflow-hidden">
        {/* Ambient Purple Backdrop */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Calculator Left Description */}
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-700 bg-purple-50/80 border border-purple-100/60 px-2.5 py-1 rounded-full">
              {language === 'ar' ? 'تقدير العائد المالي' : 'ROI Estimation Calculator'}
            </span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {language === 'ar' ? 'حاسبة التوفير المباشرة من Axoventra' : 'Predict Your Fleet Savings & ROI with Axoventra'}
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">
              {language === 'ar' 
                ? 'قم بتحريك المؤشرات لحساب إجمالي الوفورات المالية المتوقعة سنوياً بناءً على حجم أسطولك والحد من الأعطال الطارئة بنسبة 28%.'
                : 'Adjust your vehicle volume and monthly maintenance spend parameters to see how much preventative care can save your company annually.'}
            </p>

            {/* Slider Inputs */}
            <div className="space-y-4 pt-2">
              <div className="space-y-2 bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{language === 'ar' ? 'عدد مركبات الأسطول' : 'Total Vehicles'}</span>
                  <span className="font-mono text-purple-700 font-bold">{calcVehicles} {language === 'ar' ? 'مركبة' : 'Assets'}</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="500" 
                  value={calcVehicles}
                  onChange={(e) => setCalcVehicles(Number(e.target.value))}
                  className="w-full h-1.5 bg-purple-50 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div className="space-y-2 bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{language === 'ar' ? 'متوسط تكلفة الصيانة شهرياً للمركبة' : 'Monthly Maintenance Cost / Asset'}</span>
                  <span className="font-mono text-purple-700 font-bold">${calcCostPerVehicle}</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="1000" 
                  step="50"
                  value={calcCostPerVehicle}
                  onChange={(e) => setCalcCostPerVehicle(Number(e.target.value))}
                  className="w-full h-1.5 bg-purple-50 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Calculator Right Visual Result */}
          <div className="lg:col-span-7">
            <div className="bg-gradient-to-br from-slate-950 via-[#1e0e33] to-[#110720] text-white rounded-3xl p-8 shadow-xl border border-purple-900/30 space-y-6">
              <div className="space-y-1 text-center lg:text-right">
                <span className="text-[11px] font-mono uppercase tracking-widest text-purple-300/90">{language === 'ar' ? 'الوفورات المالية السنوية التقديرية' : 'Estimated Annual Financial Savings'}</span>
                <h3 className="text-4xl md:text-5xl font-black text-white font-mono">
                  ${estimatedSavings.toLocaleString()}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-900/40">
                <div className="text-center lg:text-right space-y-1">
                  <span className="text-[10px] text-purple-200/70 block uppercase">{language === 'ar' ? 'معدل تقليص أيام التعطل' : 'Downtime Days Reduced'}</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">-{calculatedDowntimeDays} {language === 'ar' ? 'يوم/سنة' : 'Days/Year'}</span>
                </div>
                <div className="text-center lg:text-right space-y-1">
                  <span className="text-[10px] text-purple-200/70 block uppercase">{language === 'ar' ? 'معدل الكفاءة التشغيلية' : 'Expected ROI Efficiency Factor'}</span>
                  <span className="text-xl font-bold font-mono text-purple-300">28% Growth</span>
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-purple-400/15 rounded-2xl flex items-start gap-3 text-xs leading-relaxed text-purple-100/90">
                <Info size={16} className="shrink-0 mt-0.5 text-purple-300" />
                <p>
                  {language === 'ar'
                    ? 'يتم تقدير هذه الحسابات بناءً على معدلات الفحص الوقائي والباركود ومحرك تشخيص الأعطال لتفادي تلف المحركات المكلف.'
                    : 'ROI estimates are calculated using active telemetric warning parameters, reducing overall repair cycles and component failures.'}
                </p>
              </div>

              <button
                onClick={() => setShowSignupModal(true)}
                className="w-full py-4 bg-white text-slate-950 hover:bg-purple-50 font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{language === 'ar' ? 'احجز عرضاً تجريبياً واحمِ أسطولك' : 'Lock In Your Free Evaluation'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Verified Reviews Section */}
      <section id="reviews-section" className="py-20 bg-white border-b border-slate-100 relative overflow-hidden">
        {/* Ambient Purple Backdrop */}
        <div className="absolute top-1/2 right-10 w-72 h-72 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 space-y-10 relative z-10">
          
          <div className="text-center space-y-3">
            <span id="reviews-badge" className="text-xs font-bold uppercase tracking-widest text-purple-700 bg-purple-50/80 border border-purple-100/60 px-3 py-1 rounded-full">
              {language === 'ar' ? 'شهادات وقصص النجاح' : 'SaaS Customer Reviews'}
            </span>
            <h2 id="reviews-title" className="text-3xl font-bold text-slate-900 tracking-tight">
              {language === 'ar' ? 'ماذا يقول مدراء الأساطيل والمهندسون عنا؟' : 'Endorsed by Top Industry Operations Leaders'}
            </h2>
          </div>

          <div 
            id="reviews-slider-card"
            className="bg-slate-50/50 border border-slate-200/80 rounded-3xl p-8 relative space-y-6 transition-all duration-300 hover:shadow-md hover:border-purple-200 group"
            onMouseEnter={() => setIsReviewHovered(true)}
            onMouseLeave={() => setIsReviewHovered(false)}
          >
            {/* Quote marks */}
            <span id="quote-decorator" className="absolute top-4 right-6 text-slate-200 text-7xl font-serif select-none pointer-events-none">“</span>

            <div className="min-h-[140px] md:min-h-[100px] flex items-center">
              <AnimatePresence mode="wait">
                {reviewsList[selectedReview] && (
                  <motion.p
                    key={`review-text-${selectedReview}`}
                    initial={{ opacity: 0, x: language === 'ar' ? 15 : -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: language === 'ar' ? -15 : 15 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="text-slate-700 text-sm md:text-base leading-relaxed italic relative z-10 text-right w-full"
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' 
                      ? (reviewsList[selectedReview].contentAr || reviewsList[selectedReview].contentEn)
                      : (reviewsList[selectedReview].contentEn || reviewsList[selectedReview].contentAr)}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between border-t border-[#E8EAF1] pt-6 flex-wrap gap-4">
              <AnimatePresence mode="wait">
                {reviewsList[selectedReview] && (() => {
                  const r = reviewsList[selectedReview];
                  const authorName = language === 'ar'
                    ? (r.authorNameAr || r.authorName)
                    : (r.authorNameEn || r.authorName || r.authorNameAr);
                  
                  const companyName = language === 'ar'
                    ? (r.companyAr || r.company)
                    : (r.companyEn || r.company || r.companyAr);

                  const roleName = language === 'ar' ? r.roleAr : r.roleEn;

                  return (
                    <motion.div 
                      key={`review-meta-${selectedReview}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-3 text-right"
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                    >
                      <div id="review-avatar-container" className="relative w-12 h-12 rounded-full shrink-0 overflow-hidden border border-[#E8EAF1] shadow-3xs bg-slate-100">
                        {!reviewImageError && r.avatar ? (
                          <img 
                            id="review-avatar-img"
                            src={r.avatar} 
                            alt={authorName} 
                            className="w-full h-full object-cover"
                            onError={() => setReviewImageError(true)}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div 
                            id="review-fallback-avatar"
                            className="w-full h-full bg-gradient-to-tr from-brand-blue-500 to-brand-blue-700 text-white font-extrabold flex items-center justify-center text-xs select-none"
                          >
                            {getReviewInitials(authorName)}
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h4 id="review-author-name" className="font-bold text-sm text-slate-900">
                          {authorName}
                        </h4>
                        <span id="review-author-role" className="text-[10px] text-slate-500 block">
                          {language === 'ar' 
                            ? `${roleName} - ${companyName}` 
                            : `${roleName} at ${companyName}`}
                        </span>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* Slider Controls (Arrow Buttons & Dots) */}
              <div id="reviews-controls" className="flex items-center gap-4" dir="ltr">
                {/* Previous Slide Button */}
                <button
                  id="review-prev-btn"
                  onClick={() => setSelectedReview(prev => (prev - 1 + reviewsList.length) % reviewsList.length)}
                  className="w-8 h-8 rounded-full border border-[#E8EAF1] bg-white hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 transition active:scale-95 cursor-pointer shadow-3xs"
                  aria-label="Previous Review"
                >
                  <ChevronLeft size={16} className={language === 'ar' ? 'rotate-180' : ''} />
                </button>

                {/* Navigation Dots */}
                <div id="review-dots" className="flex gap-2">
                  {reviewsList.map((review, idx) => (
                    <button
                      id={`review-dot-${idx}`}
                      key={review.id || idx}
                      onClick={() => setSelectedReview(idx)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${selectedReview === idx ? 'bg-brand-blue-500 scale-110 w-4' : 'bg-slate-200 hover:bg-slate-350'}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    ></button>
                  ))}
                </div>

                {/* Next Slide Button */}
                <button
                  id="review-next-btn"
                  onClick={() => setSelectedReview(prev => (prev + 1) % reviewsList.length)}
                  className="w-8 h-8 rounded-full border border-[#E8EAF1] bg-white hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 transition active:scale-95 cursor-pointer shadow-3xs"
                  aria-label="Next Review"
                >
                  <ChevronRight size={16} className={language === 'ar' ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Trial Signup Modal */}
      <AnimatePresence>
        {showSignupModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full border border-[#E8EAF1] shadow-2xl relative space-y-6"
            >
              <button 
                onClick={() => {
                  setShowSignupModal(false);
                  setSubmitSuccess(false);
                }}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>

              {!submitSuccess ? (
                <div className="space-y-4">
                  <div className="space-y-1 text-center lg:text-right">
                    <h3 className="font-bold text-xl text-slate-900">
                      {language === 'ar' ? 'ابدأ تجربتك المجانية لمدة 14 يوماً' : 'Start Your 14-Day Free Evaluation'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {language === 'ar' 
                        ? 'احصل على وصول فوري للوحة الإدارة ومحاكي البث الميداني بلا قيود.' 
                        : 'Instant access to active dashboards, fleet ledger tools, and reporting.'}
                    </p>
                  </div>

                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase block">{language === 'ar' ? 'الاسم الكريم' : 'Full Name'}</label>
                      <input 
                        type="text" 
                        required
                        value={signupForm.name}
                        onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                        placeholder={language === 'ar' ? 'الاسم الثنائي...' : 'Your full name...'}
                        className="w-full px-4 py-3 bg-slate-50 border border-[#E8EAF1] rounded-xl text-xs focus:ring-1 focus:ring-brand-blue-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase block">{language === 'ar' ? 'البريد الإلكتروني المهني' : 'Work Email'}</label>
                        <input 
                          type="email" 
                          required
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                          placeholder="name@company.com"
                          className="w-full px-4 py-3 bg-slate-50 border border-[#E8EAF1] rounded-xl text-xs focus:ring-1 focus:ring-brand-blue-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase block">{language === 'ar' ? 'رقم الجوال للاتصال' : 'Phone Number'}</label>
                        <input 
                          type="tel" 
                          required
                          value={signupForm.phone}
                          onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                          placeholder="+966 50 000 0000"
                          className="w-full px-4 py-3 bg-slate-50 border border-[#E8EAF1] rounded-xl text-xs focus:ring-1 focus:ring-brand-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase block">{language === 'ar' ? 'اسم المؤسسة/الشركة' : 'Company Name'}</label>
                        <input 
                          type="text" 
                          value={signupForm.company}
                          onChange={(e) => setSignupForm({...signupForm, company: e.target.value})}
                          placeholder={language === 'ar' ? 'اسم شركة الشحن/المقاولات...' : 'Cargo Corp...'}
                          className="w-full px-4 py-3 bg-slate-50 border border-[#E8EAF1] rounded-xl text-xs focus:ring-1 focus:ring-brand-blue-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase block">{language === 'ar' ? 'حجم أسطول المركبات' : 'Fleet Size'}</label>
                        <select 
                          value={signupForm.fleetSize}
                          onChange={(e) => setSignupForm({...signupForm, fleetSize: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-[#E8EAF1] rounded-xl text-xs focus:ring-1 focus:ring-brand-blue-500 outline-none"
                        >
                          <option value="1-10">1 - 10 {language === 'ar' ? 'مركبات' : 'Vehicles'}</option>
                          <option value="11-50">11 - 50 {language === 'ar' ? 'مركبة' : 'Vehicles'}</option>
                          <option value="51-200">51 - 200 {language === 'ar' ? 'مركبة' : 'Vehicles'}</option>
                          <option value="200+">200+ {language === 'ar' ? 'مركبة' : 'Vehicles'}</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      style={{ backgroundColor: brandPrimaryColor }}
                      className="w-full py-4 text-white font-bold rounded-xl shadow-md hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting 
                        ? (language === 'ar' ? 'جاري إعداد حسابك...' : 'Registering...')
                        : (language === 'ar' ? 'احصل على الباقة التجريبية مجاناً' : 'Get Started Now')}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-100 shadow-sm">
                    <Check size={30} />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900">
                    {language === 'ar' ? 'تهانينا! تم تفعيل اشتراكك التجريبي بنجاح' : 'Success! Free Trial Instantiated'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    {language === 'ar' 
                      ? 'تم تسجيل طلبك وحجز لوحة التحكم المؤقتة. سيتواصل معك أحد مستشاري صيانة الأساطيل لإرشادك.' 
                      : 'We registered your lead. Launch the system console anytime to configure diagnostic sensors.'}
                  </p>
                  <button
                    onClick={() => {
                      setShowSignupModal(false);
                      setSubmitSuccess(false);
                      onNavigateToSaaS(true);
                    }}
                    style={{ backgroundColor: brandPrimaryColor }}
                    className="px-6 py-2.5 text-white font-bold rounded-xl shadow-xs hover:brightness-110 transition cursor-pointer"
                  >
                    {language === 'ar' ? 'التوجه إلى لوحة الساس' : 'Launch Console'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standard Showcase Modal from System */}
      {isShowcaseOpen && (
        <FleetManagersShowcaseModal 
          isOpen={isShowcaseOpen}
          onClose={() => setIsShowcaseOpen(false)}
          language={language}
          initialTab={selectedShowcaseTab}
          onStartTrial={() => {
            setIsShowcaseOpen(false);
            setShowSignupModal(true);
          }}
        />
      )}

      {/* Customer Success Stories & Case Studies */}
      <CustomerSuccessStories />

      {/* Comprehensive Standard Footer with Brighter Vibrant Purple Gradient */}
      <footer className="bg-gradient-to-b from-[#4c1d95] via-[#3b0764] to-[#2e1065] text-purple-100/90 text-xs py-16 border-t border-purple-400/30 mt-auto relative overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {footerColumnsList.map((col) => (
              <div key={col.id} className="space-y-4">
                <h4 className="font-extrabold text-white text-[11.5px] uppercase tracking-wider flex items-center gap-1.5 drop-shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-purple-300 shadow-xs shadow-purple-300/50"></span>
                  <span>{language === 'ar' ? col.titleAr : col.titleEn}</span>
                </h4>
                <ul className="space-y-2 text-[11px] leading-relaxed">
                  {col.items.map((item) => (
                    <li key={item.id}>
                      <a 
                        href="#/" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (item.id === "item-3-1") {
                            const elem = document.getElementById('success-stories-section');
                            if (elem) {
                              elem.scrollIntoView({ behavior: 'smooth' });
                              return;
                            }
                          }

                          // Map footer item IDs to activeTab inside FleetManagersShowcaseModal
                          let mappedTab: string | null = null;
                          if (item.id === "item-1-1") mappedTab = "owners";
                          else if (item.id === "item-1-2") mappedTab = "large-fleets";
                          else if (item.id === "item-1-3") mappedTab = "construction";
                          else if (item.id === "item-1-4") mappedTab = "service-providers";
                          else if (item.id === "item-1-5") mappedTab = "municipalities";
                          else if (item.id === "item-1-6") mappedTab = "logistics";
                          else if (item.id.startsWith("item-2-")) mappedTab = item.id; // e.g. item-2-1, item-2-2...
                          else if (item.id === "item-3-1") mappedTab = "large-fleets"; // Validated Customer Case Stories -> map to Enterprise
                          else if (item.id === "item-3-2") mappedTab = "item-2-6";      // Blog -> map to Compliance Audit
                          else if (item.id === "item-3-3") mappedTab = "item-2-8";      // Video Library -> map to QR / Walkaround demo
                          else if (item.id === "item-3-4") mappedTab = "item-2-1";      // Operations Guides -> map to Preventative PM
                          else if (item.id === "item-4-1") mappedTab = "owners";        // About M360 -> map to Fleet Owners
                          else if (item.id === "item-4-2") mappedTab = "item-2-6";      // Press Room -> map to Compliance Audit
                          else if (item.id === "item-4-3") mappedTab = "item-2-5";      // Helpdesk -> map to Asset Management
                          else if (item.id === "item-4-4") mappedTab = "item-2-8";      // Demo Request -> map to QR label printing & checkup demo
                          
                          if (mappedTab) {
                            setSelectedShowcaseTab(mappedTab);
                            setIsShowcaseOpen(true);
                          } else {
                            setShowSignupModal(true);
                          }
                        }}
                        className="text-purple-200 hover:text-white hover:translate-x-0.5 rtl:hover:-translate-x-0.5 transition-all inline-block font-medium"
                      >
                        {language === 'ar' ? item.labelAr : item.labelEn}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-purple-500/30 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap text-[10.5px] text-purple-200/90 font-medium">
            <div className="flex items-center gap-3">
              <span className="font-mono text-white tracking-widest font-black text-xs">
                {effectiveBrandName.toUpperCase()}
              </span>
              <span>
                © {new Date().getFullYear()} {effectiveBrandName}. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
              </span>
            </div>

            <div className="flex gap-4 items-center">
              <a 
                href="#/" 
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateToSaaS();
                }} 
                style={{ display: effectivePortalMode === 'saas' ? 'inline-block' : 'none' }}
                className="hover:text-white transition-all font-extrabold text-purple-100 border border-purple-300/40 rounded-full px-3.5 py-1 bg-purple-700/60 hover:bg-purple-600/80 shadow-xs"
              >
                {language === 'ar' ? 'لوحة التحكم للمنشأة' : 'Organization Control Panel'}
              </a>
              <a href="#/" onClick={(e) => {e.preventDefault(); setShowSignupModal(true);}} className="hover:text-white transition">{language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</a>
              <a href="#/" onClick={(e) => {e.preventDefault(); setShowSignupModal(true);}} className="hover:text-white transition">{language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
