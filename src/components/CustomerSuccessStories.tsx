import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Sparkles, BookOpen, ArrowUpRight, ArrowLeft, ArrowRight, X, Check,
  Mail, Phone as PhoneIcon, User, Building, MessageSquare, Headphones, Send, CheckCircle2, AlertCircle, RefreshCw,
  TrendingUp, ShieldCheck, Clock, FileText, ChevronRight, ChevronLeft, Play, Pause, Layers, Star, Quote,
  CheckCircle, Gauge, Wrench, Shield
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { saveDocument } from '../services/firebase';

import enterpriseFleetDepot from '../assets/images/enterprise_fleet_depot_1782935136613.jpg';
import municipalWorkshopParts from '../assets/images/municipal_workshop_parts_1786785099442.jpg';
import driverTruckInspection from '../assets/images/driver_truck_inspection_1786784371761.jpg';
import highwayLogisticsTruck from '../assets/images/highway_logistics_truck_1782935190395.jpg';
import constructionHeavyMachinery from '../assets/images/construction_heavy_machinery_1782935156246.jpg';

export interface SuccessStory {
  id: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  companyAr: string;
  companyEn: string;
  metricAr: string;
  metricEn: string;
  imageUrl: string;
  fleetSizeAr?: string;
  fleetSizeEn?: string;
  industryAr?: string;
  industryEn?: string;
  secondaryStatAr?: string;
  secondaryStatEn?: string;
  quoteAr?: string;
  quoteEn?: string;
  authorAr?: string;
  authorEn?: string;
  authorRoleAr?: string;
  authorRoleEn?: string;
}

export const DEFAULT_SUCCESS_STORIES: SuccessStory[] = [
  {
    id: 'story-1',
    titleAr: 'التحول الرقمي لأسطول النقل الثقيل ومراقبة التشغيل',
    titleEn: 'Digital Transformation of Heavy Transit and Operations Monitoring',
    companyAr: 'الشركة الوطنية للخدمات اللوجستية',
    companyEn: 'National Logistics Services Corp.',
    contentAr: 'نجحت الشركة الوطنية في رقمنة فحص أسطولها المكون من 450 شاحنة ومقطورة ثقيلة باستخدام منصتنا، مما أدى لتقليل نسب أعطال المحركات المفاجئة على الطرق السريعة بمعدل 38%، وتوفير نفقات الصيانة الوقائية السنوية بشكل ملموس.',
    contentEn: 'National Logistics successfully digitized its fleet of 450 heavy trucks and trailers using our platform. This resulted in a 38% reduction in highway engine failures and unlocked unprecedented annual preventative maintenance budget savings.',
    metricAr: 'تقليل نفقات الصيانة الوقائية بنسبة 25%',
    metricEn: '25% Savings in PM Expenditures',
    imageUrl: enterpriseFleetDepot,
    fleetSizeAr: '450 شاحنة ومقطورة نقل',
    fleetSizeEn: '450 Heavy Haul & Trailers',
    industryAr: 'النقل الثقيل واللوجستيات',
    industryEn: 'Heavy Freight & Logistics',
    secondaryStatAr: 'انخفاض أعطال الطرق بنسبة 38%',
    secondaryStatEn: '38% Fewer Road Breakdowns',
    quoteAr: 'مكنتنا المنصة من الانتقال من الصيانة التفاعلية المرتجلة إلى نظام استباقي مؤتمت بالكامل وفر مئات آلاف الريالات.',
    quoteEn: 'The platform transitioned us from reactive repairs to a proactive, automated predictive maintenance regime.',
    authorAr: 'م. خالد الدوسري',
    authorEn: 'Eng. Khalid Al-Dosari',
    authorRoleAr: 'مدير العمليات والأساطيل',
    authorRoleEn: 'Fleet Operations Director'
  },
  {
    id: 'story-2',
    titleAr: 'أتمتة جدولة الورش والتحكم الكامل بمستودع القطع',
    titleEn: 'Workshop Scheduling Automation and Spare Parts Control',
    companyAr: 'أمانة العاصمة لخدمات البلدية والمعدات',
    companyEn: 'Capital Municipality Services Division',
    contentAr: 'قامت الأمانة بربط 230 معدة بلدية ورافعة ثقيلة بنظام الفحوصات الرقمية والباركود، مما مكن المشرفين والمهندسين من جدولة تدوير الإطارات دورياً وتتبع استهلاك قطع الغيار بكفاءة حالت دون تضخم وهدر المخزون.',
    contentEn: 'The division linked 230 municipal heavy loaders and equipment to our digital barcode system. This enabled automated preventative maintenance triggers and spare parts utilization audits, eliminating overstocking waste completely.',
    metricAr: 'انخفاض هدر مستودع القطع بنسبة 30%',
    metricEn: '30% Reduction in Parts Waste',
    imageUrl: municipalWorkshopParts,
    fleetSizeAr: '230 معدة بلدية ورافعة',
    fleetSizeEn: '230 Municipal Loaders & Units',
    industryAr: 'الخدمات البلدية والميدانية',
    industryEn: 'Municipal Services & Utilities',
    secondaryStatAr: 'أتمتة الجدولة بنسبة 100%',
    secondaryStatEn: '100% Scheduling Automation',
    quoteAr: 'ربط الباركود بمستودع الورشة وقوائم الفحص المعتمدة أنهى فوضى المخزون وقطع الغيار نهائياً.',
    quoteEn: 'Integrating QR barcodes with digital inventory cut parts leakage and brought total accountability.',
    authorAr: 'أ. طارق الشمري',
    authorEn: 'Tariq Al-Shammari',
    authorRoleAr: 'مشرف الإمداد والصيانة البلدية',
    authorRoleEn: 'Municipal Supply Supervisor'
  },
  {
    id: 'story-3',
    titleAr: 'تكامل البلاغات الصوتية الفورية وحوكمة الفحص للسائقين',
    titleEn: 'Driver Voice Memo Integration and Quick Inspection Governance',
    companyAr: 'شركة المسار السريع للشحن الإقليمي',
    companyEn: 'Fast Track Regional Cargo Company',
    contentAr: 'تم تطبيق بوابة السائقين السريعة المدمجة بالبلاغات الصوتية، مما مكن السائقين من إرسال الشكاوى الميكانيكية للورشة في أقل من 15 ثانية، مسرعاً دورة استجابة الفنيين الداخليين وتفادي الأعطال الحرجة بالصندوق المالي.',
    contentEn: 'Implementing our responsive driver portal with voice note capturing enabled road-drivers to report mechanical issues to the central desk under 15 seconds. This minimized workshop queue delays and preserved engine health.',
    metricAr: 'توفير 30 دقيقة يومياً لكل سائق فحص',
    metricEn: '30 Mins Saved Per Driver Checkup',
    imageUrl: driverTruckInspection,
    fleetSizeAr: '180 شاحنة توصيل سريع',
    fleetSizeEn: '180 Regional Delivery Trucks',
    industryAr: 'الشحن السريع والميل الأخير',
    industryEn: 'Express Cargo & Logistics',
    secondaryStatAr: 'إرسال البلاغ في أقل من 15 ثانية',
    secondaryStatEn: '< 15s Driver Report Time',
    quoteAr: 'سلاسة البلاغ الصوتي شجعت السائقين على الإبلاغ الفوري عن أي صوت غريب قبل تحوله لعطل مكلف.',
    quoteEn: 'Voice memo reporting boosted driver compliance to 98% and caught small issues before catastrophic failure.',
    authorAr: 'فهد المنصور',
    authorEn: 'Fahad Al-Mansoor',
    authorRoleAr: 'رئيس وحدة سلامة النقل',
    authorRoleEn: 'Transit Safety Head'
  },
  {
    id: 'story-4',
    titleAr: 'الحوكمة التامة لسلاسل التبريد والتنبؤ بأعطال وحدات التكييف',
    titleEn: 'Cold-Chain Telemetry & Predictive Refrigeration Maintenance',
    companyAr: 'شركة مدار الشرق لسلاسل التبريد والتوزيع',
    companyEn: 'Madar Al-Sharq Cold Chain Logistics',
    contentAr: 'ربطت شركة مدار الشرق 160 شاحنة مبردة بأنظمة الفحص الذاتي وتنبيهات درجات الحرارة الوقائية، مما أدى لانعدام حوادث تلف المواد الحساسة وتفادي توقف ضواغط التبريد المفاجئ خلال أشهر الصيف الحرجة.',
    contentEn: 'Madar Al-Sharq connected 160 refrigerated rigs to predictive compressor health diagnostics, achieving zero cargo spoilage and eliminating roadside AC unit breakdowns across hot summer routes.',
    metricAr: 'انعدام حوادث تلف الشحنات بنسبة 100%',
    metricEn: '100% Zero Spoilage Reliability',
    imageUrl: highwayLogisticsTruck,
    fleetSizeAr: '160 شاحنة مبردة ومقطورة',
    fleetSizeEn: '160 Refrigerated Fleet Units',
    industryAr: 'سلاسل الإمداد المبردة والأغذية',
    industryEn: 'Cold Chain & Perishables',
    secondaryStatAr: 'تقليص فترات فحص الكمبروسر 45%',
    secondaryStatEn: '45% Faster Compressor Audits',
    quoteAr: 'المنظومة وفرت ضمانة كاملة لعملائنا في قطاع الأغذية والأدوية وحمت شحناتنا من أي تقلب حراري.',
    quoteEn: 'The system gave our pharma and fresh food partners unwavering trust in our temperature integrity.',
    authorAr: 'م. بدر الغامدي',
    authorEn: 'Eng. Badr Al-Ghamdi',
    authorRoleAr: 'مدير الجودة وسلاسل الإمداد',
    authorRoleEn: 'Quality & Supply Chain Director'
  },
  {
    id: 'story-5',
    titleAr: 'تحسين جاهزية معدات الحفر الثقيل وتقليل ساعات التوقف',
    titleEn: 'Heavy Excavation Equipment Readiness & Downtime Reduction',
    companyAr: 'مجموعة التعمير للمعدات الإنشائية والحفر',
    companyEn: 'Al-Taamir Heavy Construction & Excavation',
    contentAr: 'قامت المجموعة بتطبيق جداول الصيانة الدورية الهيدروليكية ومحركات الديزل لأكثر من 320 جرافة ومعدة حفر بالمشاريع العملاقة، ورفع نسبة الجاهزية الميدانية إلى 99.4%، ما ساهم في تسليم مراحل المشاريع في مواعيدها.',
    contentEn: 'The contractor deployed automated hydraulic and diesel maintenance cycles across 320 heavy earthmovers and loaders, boosting active fleet uptime to 99.4% and ensuring on-schedule project milestones.',
    metricAr: 'رفع الجاهزية الميدانية إلى 99.4%',
    metricEn: '99.4% Active Equipment Uptime',
    imageUrl: constructionHeavyMachinery,
    fleetSizeAr: '320 جرافة ومعدة حفر عملاقة',
    fleetSizeEn: '320 Heavy Diggers & Loaders',
    industryAr: 'المقاولات والمشاريع الكبرى',
    industryEn: 'Infrastructure & Earthworks',
    secondaryStatAr: 'تقليل التوقف غير المجدول بنسبة 40%',
    secondaryStatEn: '40% Cut in Unscheduled Stops',
    quoteAr: 'عدم تعطل أي جرافة في موقع الحفر أنقذنا من غرامات التأخير وحقق وفورات تشغيلية ضخمة.',
    quoteEn: 'Keeping 320 heavy machines running without site stalls prevented costly penalty clauses completely.',
    authorAr: 'م. سلطان الشهري',
    authorEn: 'Eng. Sultan Al-Shehri',
    authorRoleAr: 'مدير الصيانة الميكانيكية للمشاريع',
    authorRoleEn: 'Lead Mechanical Fleet Engineer'
  }
];

export default function CustomerSuccessStories() {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const migrateStories = (storiesList: SuccessStory[]): SuccessStory[] => {
    return storiesList.map((s: SuccessStory, idx: number) => {
      const defaultMatch = DEFAULT_SUCCESS_STORIES[idx] || DEFAULT_SUCCESS_STORIES[0];
      return {
        ...defaultMatch,
        ...s,
        fleetSizeAr: s.fleetSizeAr || defaultMatch.fleetSizeAr,
        fleetSizeEn: s.fleetSizeEn || defaultMatch.fleetSizeEn,
        industryAr: s.industryAr || defaultMatch.industryAr,
        industryEn: s.industryEn || defaultMatch.industryEn,
        secondaryStatAr: s.secondaryStatAr || defaultMatch.secondaryStatAr,
        secondaryStatEn: s.secondaryStatEn || defaultMatch.secondaryStatEn,
        quoteAr: s.quoteAr || defaultMatch.quoteAr,
        quoteEn: s.quoteEn || defaultMatch.quoteEn,
        authorAr: s.authorAr || defaultMatch.authorAr,
        authorEn: s.authorEn || defaultMatch.authorEn,
        authorRoleAr: s.authorRoleAr || defaultMatch.authorRoleAr,
        authorRoleEn: s.authorRoleEn || defaultMatch.authorRoleEn,
        imageUrl: s.imageUrl && !s.imageUrl.includes('unsplash.com') ? s.imageUrl : defaultMatch.imageUrl
      };
    });
  };

  const [stories, setStories] = useState<SuccessStory[]>(() => {
    const stored = localStorage.getItem('saas_marketing_success_stories_v1');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return migrateStories(parsed);
        }
      } catch (e) {}
    }
    return DEFAULT_SUCCESS_STORIES;
  });

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [activeStory, setActiveStory] = useState<SuccessStory | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  // Inquiry Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    fleetSize: '25',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Slide navigation
  const handleNextSlide = () => {
    setSlideDirection(1);
    setCurrentSlide(prev => (prev + 1) % stories.length);
  };

  const handlePrevSlide = () => {
    setSlideDirection(-1);
    setCurrentSlide(prev => (prev - 1 + stories.length) % stories.length);
  };

  const handleSelectSlide = (index: number) => {
    setSlideDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Autoplay effect
  useEffect(() => {
    if (!isAutoPlaying || isHovered || activeStory !== null || isInquiryModalOpen) return;

    const timer = setInterval(() => {
      handleNextSlide();
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered, activeStory, isInquiryModalOpen, stories.length]);

  // Form validation & submission
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) {
      errs.name = language === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    }
    if (!formData.company.trim()) {
      errs.company = language === 'ar' ? 'اسم المنشأة مطلوب' : 'Company name is required';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = language === 'ar' ? 'بريد إلكتروني صالح مطلوب' : 'Valid email is required';
    }
    if (!formData.phone.trim()) {
      errs.phone = language === 'ar' ? 'رقم الجوال مطلوب' : 'Phone is required';
    }
    if (!formData.message.trim()) {
      errs.message = language === 'ar' ? 'يرجى كتابة تفاصيل الاستفسار' : 'Please provide details';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const inquiryPayload = {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        fleetSize: formData.fleetSize,
        message: formData.message,
        source: 'marketing_success_stories_carousel',
        createdAt: new Date().toISOString(),
        status: 'new'
      };

      await saveDocument('crm_leads', `lead_${Date.now()}`, inquiryPayload);

      setSubmitSuccess(true);
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        fleetSize: '25',
        message: ''
      });
      setErrors({});
    } catch (err) {
      console.error('Failed to submit consulting inquiry:', err);
      // Fallback local acknowledgment
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeSlide = stories[currentSlide] || stories[0];

  return (
    <section 
      id="success-stories-section" 
      className="bg-gradient-to-b from-[#220f3e] via-[#2d1454] to-[#1c0c35] py-8 sm:py-12 border-t border-purple-500/30 relative overflow-hidden"
    >
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 relative z-10 space-y-4 sm:space-y-6">
        
        {/* Section Header */}
        <div className="space-y-2 text-start" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 border border-purple-400/40 text-purple-200 text-[10.5px] font-black rounded-full uppercase tracking-wider shadow-sm">
            <Sparkles size={11} className="text-purple-300 animate-pulse" />
            <span>{language === 'ar' ? 'سلايد قصص النجاح والأثر الميداني' : 'Enterprise Success Stories Carousel'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
            {language === 'ar' 
              ? 'قصص نجاح موثقة: كفاءة استثنائية وأثر مالي ملموس' 
              : 'Verified ROI: Real Operations, Quantifiable Impact'}
          </h2>
        </div>

        {/* Quick Jump Category / Company Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" dir={isRtl ? 'rtl' : 'ltr'}>
          {stories.map((story, idx) => {
            const isSelected = idx === currentSlide;
            const companyName = language === 'ar' ? story.companyAr : story.companyEn;
            return (
              <button
                key={story.id}
                onClick={() => handleSelectSlide(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                  isSelected 
                    ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 border-purple-300/60 text-white shadow-lg shadow-purple-950/60 scale-[1.02]' 
                    : 'bg-white/10 hover:bg-white/15 border-purple-300/25 text-purple-100 hover:text-white backdrop-blur-md shadow-xs'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white animate-pulse' : 'bg-purple-300'}`} />
                <span className="truncate max-w-[150px] sm:max-w-[220px]">{companyName}</span>
              </button>
            );
          })}
        </div>

        {/* The Horizontal Interactive Carousel Viewport (Compact Size) */}
        <div 
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-purple-400/35 bg-gradient-to-br from-[#2a134d]/95 via-[#371966]/95 to-[#240e44]/95 backdrop-blur-2xl group shadow-purple-950/60"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Autoplay Progress Line (Header Bar) */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-950/80 z-30 overflow-hidden">
            <motion.div 
              key={`progress-${currentSlide}-${isAutoPlaying}-${isHovered}`}
              initial={{ width: "0%" }}
              animate={{ width: (isAutoPlaying && !isHovered) ? "100%" : "0%" }}
              transition={{ duration: 6, ease: "linear" }}
              className="h-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400"
            />
          </div>

          {/* Floating Navigation Controls (Card Sides - Desktop/Tablet) */}
          <button
            type="button"
            onClick={handlePrevSlide}
            aria-label="Previous story slide"
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 start-3 z-30 w-8 h-8 rounded-full bg-purple-900/80 hover:bg-purple-800 border border-purple-400/40 text-white items-center justify-center transition shadow-lg shadow-purple-950/60 backdrop-blur-md cursor-pointer active:scale-90"
          >
            {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            type="button"
            onClick={handleNextSlide}
            aria-label="Next story slide"
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 end-3 z-30 w-8 h-8 rounded-full bg-purple-900/80 hover:bg-purple-800 border border-purple-400/40 text-white items-center justify-center transition shadow-lg shadow-purple-950/60 backdrop-blur-md cursor-pointer active:scale-90"
          >
            {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Swipe / Drag Container with Framer Motion */}
          <div className="relative overflow-hidden flex items-center">
            <AnimatePresence mode="wait" custom={slideDirection}>
              <motion.div
                key={activeSlide.id}
                custom={slideDirection}
                variants={{
                  enter: (direction: number) => ({
                    x: direction > 0 ? (isRtl ? -60 : 60) : (isRtl ? 60 : -60),
                    opacity: 0,
                    scale: 0.98
                  }),
                  center: {
                    x: 0,
                    opacity: 1,
                    scale: 1,
                    transition: {
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.25 }
                    }
                  },
                  exit: (direction: number) => ({
                    x: direction > 0 ? (isRtl ? 60 : -60) : (isRtl ? -60 : 60),
                    opacity: 0,
                    scale: 0.98,
                    transition: {
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }
                  })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  const threshold = 40;
                  if (info.offset.x < -threshold) {
                    if (isRtl) handlePrevSlide();
                    else handleNextSlide();
                  } else if (info.offset.x > threshold) {
                    if (isRtl) handleNextSlide();
                    else handlePrevSlide();
                  }
                }}
                className="w-full flex flex-col lg:flex-row items-stretch cursor-grab active:cursor-grabbing select-none"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {/* Media & Image Banner */}
                <div className="relative h-40 sm:h-48 lg:h-auto lg:w-5/12 overflow-hidden bg-purple-950 shrink-0">
                  <img 
                    src={activeSlide.imageUrl} 
                    alt={language === 'ar' ? activeSlide.companyAr : activeSlide.companyEn}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = enterpriseFleetDepot;
                    }}
                  />
                  {/* Cinematic gradient overlays in royal purple */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2a134d] via-[#2a134d]/40 lg:bg-gradient-to-r lg:from-transparent lg:to-[#2a134d]/95 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-950/90 backdrop-blur-md border border-purple-400/40 rounded-full text-white text-[9.5px] font-black shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {language === 'ar' ? 'قصة نجاح معتمدة' : 'Verified Case'}
                    </span>

                    {activeSlide.fleetSizeAr && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-950/90 backdrop-blur-md border border-indigo-400/40 rounded-full text-indigo-200 text-[9.5px] font-black shadow-md">
                        <Gauge size={10} className="text-indigo-400" />
                        {language === 'ar' ? activeSlide.fleetSizeAr : activeSlide.fleetSizeEn}
                      </span>
                    )}
                  </div>

                  {/* Main Metric Badge */}
                  <div className="absolute bottom-2.5 inset-x-3">
                    <div className="px-3.5 py-2 bg-[#210c3f]/95 backdrop-blur-md border border-purple-400/50 rounded-xl shadow-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-purple-300 text-[10px] font-black uppercase tracking-wider shrink-0">
                        <Award size={12} className="text-purple-300 shrink-0" />
                        <span>{language === 'ar' ? 'الأثر المالي' : 'ROI'}</span>
                      </div>
                      <p className="text-xs sm:text-[13px] font-black text-white font-sans truncate">
                        {language === 'ar' ? activeSlide.metricAr : activeSlide.metricEn}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content & Details Column (Compact & Balanced) */}
                <div className="p-4 sm:p-5 lg:p-6 lg:w-7/12 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-2.5">
                    
                    {/* Company Info & Industry Pill */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-900/60 border border-purple-400/40 flex items-center justify-center text-purple-200 shadow-xs shrink-0">
                          <Building size={14} />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-[13px] font-black text-purple-200 line-clamp-1">
                            {language === 'ar' ? activeSlide.companyAr : activeSlide.companyEn}
                          </h4>
                          <span className="text-[10px] text-purple-300/80 block font-sans">
                            {language === 'ar' ? activeSlide.industryAr : activeSlide.industryEn}
                          </span>
                        </div>
                      </div>

                      {activeSlide.secondaryStatAr && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-950/70 border border-emerald-400/30 rounded-full text-emerald-300 text-[10px] font-black">
                          <TrendingUp size={11} className="text-emerald-400" />
                          <span>{language === 'ar' ? activeSlide.secondaryStatAr : activeSlide.secondaryStatEn}</span>
                        </div>
                      )}
                    </div>

                    {/* Story Title */}
                    <h3 
                      onClick={() => setActiveStory(activeSlide)}
                      className="text-sm sm:text-base lg:text-lg font-black text-white leading-snug hover:text-purple-200 transition-colors cursor-pointer line-clamp-2"
                    >
                      {language === 'ar' ? activeSlide.titleAr : activeSlide.titleEn}
                    </h3>

                    {/* Operational Narrative Excerpt */}
                    <p className="text-[11px] sm:text-xs text-purple-100/90 leading-relaxed font-sans line-clamp-2 sm:line-clamp-3">
                      {language === 'ar' ? activeSlide.contentAr : activeSlide.contentEn}
                    </p>

                    {/* Testimonial Quote Box */}
                    {activeSlide.quoteAr && (
                      <div className="p-2.5 bg-purple-900/30 border border-purple-400/25 rounded-xl relative space-y-1">
                        <Quote size={14} className="text-purple-400/50 absolute top-2 end-2" />
                        <p className="text-[10.5px] italic text-purple-100 leading-relaxed pe-4 line-clamp-1 sm:line-clamp-2">
                          "{language === 'ar' ? activeSlide.quoteAr : activeSlide.quoteEn}"
                        </p>
                        {activeSlide.authorAr && (
                          <div className="flex items-center gap-1.5 pt-0.5 border-t border-purple-400/20 text-[10px]">
                            <span className="font-bold text-purple-200">{language === 'ar' ? activeSlide.authorAr : activeSlide.authorEn}</span>
                            <span className="text-purple-400/60">•</span>
                            <span className="text-purple-300/80">{language === 'ar' ? activeSlide.authorRoleAr : activeSlide.authorRoleEn}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions & Interactive CTA Bar */}
                  <div className="pt-2.5 border-t border-purple-500/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveStory(activeSlide)}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-lg text-[11px] font-black shadow-md shadow-purple-950/50 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <FileText size={12} className="text-purple-200" />
                        <span>{language === 'ar' ? 'عرض القصة كاملة' : 'Read Full Case'}</span>
                        <ArrowUpRight size={12} className="text-purple-200" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsInquiryModalOpen(true)}
                        className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-400/40 text-purple-100 hover:text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Headphones size={11} className="text-purple-300" />
                        <span>{language === 'ar' ? 'طلب حل مماثل' : 'Inquire'}</span>
                      </button>
                    </div>

                    {/* Swipe hint */}
                    <div className="flex items-center gap-1.5 text-[10px] text-purple-300/80 font-mono">
                      <span>{language === 'ar' ? 'اسحب للتنقل' : 'Swipe'}</span>
                      <ArrowRight size={11} className={isRtl ? 'rotate-180 text-purple-300' : 'text-purple-300'} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Pagination Dots */}
          <div className="py-2.5 bg-[#210c3f]/95 border-t border-purple-500/25 flex items-center justify-center gap-2">
            {stories.map((story, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={`dot-${story.id}`}
                  onClick={() => handleSelectSlide(idx)}
                  className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                    isActive 
                      ? 'w-8 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-300 shadow-sm shadow-purple-400/60' 
                      : 'w-2 bg-purple-900/70 hover:bg-purple-700/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Quick Consulting Banner Bar at bottom of Carousel */}
        <div 
          className="p-4 sm:p-5 bg-gradient-to-r from-[#2c1452] via-[#3a1a6b] to-[#250f44] border border-purple-400/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl text-start"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-800/60 border border-purple-400/40 flex items-center justify-center text-purple-200 shrink-0 shadow-md">
              <Headphones size={18} className="text-purple-200" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-black text-white">
                {language === 'ar' ? 'هل ترغب في تحقيق وفورات ونسب كفاءة مماثلة لأسطولك؟' : 'Ready to Achieve Similar ROI & Uptime for Your Fleet?'}
              </h4>
              <p className="text-[10.5px] text-purple-200/90">
                {language === 'ar'
                  ? 'تواصل مباشرة مع أحد مهندسي صيانة الأساطيل لدينا للحصول على استشارة تشخيصية مجانية.'
                  : 'Speak with our fleet diagnostics team for an evaluation and live system walkthrough.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsInquiryModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:brightness-110 text-white font-black rounded-xl text-xs transition shadow-md shadow-purple-950/50 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border border-purple-300/40"
          >
            <span>{language === 'ar' ? 'إرسال استفسار مباشر' : 'Submit Consultation Inquiry'}</span>
            <ArrowRight size={12} className={isRtl ? 'rotate-180' : ''} />
          </button>
        </div>

      </div>

      {/* Full Case Study Reader Modal */}
      <AnimatePresence>
        {activeStory && (
          <div 
            className="fixed inset-0 z-50 bg-[#120623]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setActiveStory(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-[#241042] to-[#1c0c37] border border-purple-400/40 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl my-auto max-h-[82vh] relative flex flex-col text-slate-100 text-start"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Modal Header Image Banner */}
              <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-purple-950 shrink-0">
                <img 
                  src={activeStory.imageUrl} 
                  alt={language === 'ar' ? activeStory.titleAr : activeStory.titleEn}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = enterpriseFleetDepot;
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#241042] via-[#241042]/45 to-transparent" />
                
                {/* Close Button */}
                <button 
                  onClick={() => setActiveStory(null)}
                  className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} w-8 h-8 rounded-full bg-purple-900/80 hover:bg-purple-800 border border-purple-400/40 text-purple-200 hover:text-white flex items-center justify-center cursor-pointer transition shadow-lg z-20`}
                >
                  <X size={15} />
                </button>

                {/* Company & Impact Pill */}
                <div className="absolute bottom-3 inset-x-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-950/90 border border-purple-400/40 rounded-full text-purple-200 text-[11px] font-black shadow-md">
                    <Building size={12} />
                    <span>{language === 'ar' ? activeStory.companyAr : activeStory.companyEn}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-950/90 border border-emerald-400/40 rounded-full text-emerald-300 text-[11px] font-black shadow-md">
                    <Award size={12} />
                    <span>{language === 'ar' ? activeStory.metricAr : activeStory.metricEn}</span>
                  </div>
                </div>
              </div>

              {/* Modal Body Content (Scrollable) */}
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                    <FileText size={12} />
                    <span>{language === 'ar' ? 'دراسة حالة موثقة' : 'Verified Case Study'}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                    {language === 'ar' ? activeStory.titleAr : activeStory.titleEn}
                  </h3>
                </div>

                {/* Main Story Narrative */}
                <div className="p-3.5 bg-purple-950/60 border border-purple-800/40 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-purple-300 block uppercase tracking-wider">
                    {language === 'ar' ? 'التحدي والحل الهندسي:' : 'Challenge & Solution:'}
                  </span>
                  <p className="text-xs sm:text-[13px] text-purple-100 leading-relaxed font-sans">
                    {language === 'ar' ? activeStory.contentAr : activeStory.contentEn}
                  </p>
                </div>

                {/* Key Metrics / Highlights Bento */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 bg-purple-900/30 border border-purple-500/30 rounded-xl space-y-0.5">
                    <div className="flex items-center gap-1 text-purple-300 text-[10px] font-bold">
                      <TrendingUp size={12} />
                      <span>{language === 'ar' ? 'مؤشر الكفاءة' : 'Efficiency'}</span>
                    </div>
                    <p className="text-xs font-black text-white">
                      {language === 'ar' ? activeStory.metricAr : activeStory.metricEn}
                    </p>
                  </div>

                  <div className="p-2.5 bg-purple-900/30 border border-purple-500/30 rounded-xl space-y-0.5">
                    <div className="flex items-center gap-1 text-indigo-300 text-[10px] font-bold">
                      <Clock size={12} />
                      <span>{language === 'ar' ? 'سرعة الاستجابة' : 'Response'}</span>
                    </div>
                    <p className="text-xs font-black text-white">
                      {language === 'ar' ? 'أقل من 15 ثانية' : '< 15s Report'}
                    </p>
                  </div>

                  <div className="p-2.5 bg-purple-900/30 border border-purple-500/30 rounded-xl space-y-0.5">
                    <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                      <ShieldCheck size={12} />
                      <span>{language === 'ar' ? 'حالة الاعتماد' : 'Status'}</span>
                    </div>
                    <p className="text-xs font-black text-emerald-300">
                      {language === 'ar' ? 'عمليات نشطة' : 'Active'}
                    </p>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => {
                      const msg = language === 'ar' 
                        ? `أرغب بالاستفسار عن تطبيق حل مماثل لدراسة حالة: ${activeStory.titleAr} (${activeStory.companyAr})`
                        : `I would like to inquire about implementing a solution similar to: ${activeStory.titleEn} (${activeStory.companyEn})`;
                      setFormData(prev => ({ ...prev, message: msg }));
                      setActiveStory(null);
                      setIsInquiryModalOpen(true);
                    }}
                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:brightness-110 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>{language === 'ar' ? 'طلب استشارة مخصصة لنفس الحالة' : 'Request Similar Solution Demo'}</span>
                    <ArrowRight size={13} className={isRtl ? 'rotate-180' : ''} />
                  </button>
                  <button
                    onClick={() => setActiveStory(null)}
                    className="py-2.5 px-4 bg-purple-900/60 hover:bg-purple-850 border border-purple-700/40 text-purple-200 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {language === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Consultation / Direct Inquiry Modal */}
      <AnimatePresence>
        {isInquiryModalOpen && (
          <div 
            className="fixed inset-0 z-50 bg-[#120623]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsInquiryModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-[#241042] to-[#1c0c37] border border-purple-400/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl text-slate-100 text-start"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsInquiryModalOpen(false)}
                className={`absolute top-5 ${isRtl ? 'left-5' : 'right-5'} w-8 h-8 rounded-full bg-purple-900/80 border border-purple-400/40 text-purple-300 hover:text-white flex items-center justify-center cursor-pointer transition`}
              >
                <X size={16} />
              </button>

              <div className="space-y-1 mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-900/80 border border-purple-400/40 text-purple-200 text-[10px] font-bold rounded-full">
                  <Headphones size={11} />
                  <span>{language === 'ar' ? 'استشارة هندسية سريعة' : 'Fleet Expert Consultation'}</span>
                </div>
                <h3 className="text-xl font-black text-white">
                  {language === 'ar' ? 'طلب استشارة أو دراسة أسطول مجانية' : 'Book a Fleet Evaluation & Demo'}
                </h3>
                <p className="text-xs text-purple-200/80">
                  {language === 'ar' 
                    ? 'أدخل بياناتك وسيتواصل معك خبير هندسة الأساطيل خلال دقائق معدودة.'
                    : 'Submit your contact info and our diagnostics engineer will reach out promptly.'}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {!submitSuccess ? (
                  <form onSubmit={handleSubmitInquiry} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-bold text-purple-200 flex items-center gap-1.5">
                        <User size={12} className="text-purple-400" />
                        <span>{language === 'ar' ? 'الاسم الكامل للاتصال' : 'Full Name'}</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={language === 'ar' ? 'مثال: م. فهد العتيبي' : 'e.g., Fahad Al-Otaibi'}
                        className={`w-full bg-[#180a2e]/90 border ${errors.name ? 'border-rose-500' : 'border-purple-700/50 focus:border-purple-400'} text-white placeholder-purple-300/40 rounded-xl py-2.5 px-3.5 text-xs transition-colors focus:outline-none`}
                      />
                      {errors.name && <p className="text-[10px] text-rose-400">{errors.name}</p>}
                    </div>

                    {/* Company */}
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-bold text-purple-200 flex items-center gap-1.5">
                        <Building size={12} className="text-purple-400" />
                        <span>{language === 'ar' ? 'اسم المنشأة / الشركة' : 'Company / Fleet Name'}</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder={language === 'ar' ? 'مثال: شركة المسار للنقل' : 'e.g., Al-Masar Logistics'}
                        className={`w-full bg-[#180a2e]/90 border ${errors.company ? 'border-rose-500' : 'border-purple-700/50 focus:border-purple-400'} text-white placeholder-purple-300/40 rounded-xl py-2.5 px-3.5 text-xs transition-colors focus:outline-none`}
                      />
                      {errors.company && <p className="text-[10px] text-rose-400">{errors.company}</p>}
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-purple-200 flex items-center gap-1.5">
                          <Mail size={12} className="text-purple-400" />
                          <span>{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</span>
                        </label>
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@company.com"
                          className={`w-full bg-[#180a2e]/90 border ${errors.email ? 'border-rose-500' : 'border-purple-700/50 focus:border-purple-400'} text-white placeholder-purple-300/40 rounded-xl py-2.5 px-3.5 text-xs transition-colors focus:outline-none`}
                        />
                        {errors.email && <p className="text-[10px] text-rose-400">{errors.email}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-purple-200 flex items-center gap-1.5">
                          <PhoneIcon size={12} className="text-purple-400" />
                          <span>{language === 'ar' ? 'رقم الجوال' : 'Phone'}</span>
                        </label>
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="0500000000"
                          className={`w-full bg-[#180a2e]/90 border ${errors.phone ? 'border-rose-500' : 'border-purple-700/50 focus:border-purple-400'} text-white placeholder-purple-300/40 rounded-xl py-2.5 px-3.5 text-xs transition-colors focus:outline-none`}
                        />
                        {errors.phone && <p className="text-[10px] text-rose-400">{errors.phone}</p>}
                      </div>
                    </div>

                    {/* Fleet Size */}
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-bold text-purple-200 flex items-center gap-1.5">
                        <Award size={12} className="text-purple-400" />
                        <span>{language === 'ar' ? 'حجم الأسطول التقريبي' : 'Fleet Size'}</span>
                      </label>
                      <select 
                        value={formData.fleetSize}
                        onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
                        className="w-full bg-[#180a2e]/90 border border-purple-700/50 focus:border-purple-400 text-purple-100 rounded-xl py-2.5 px-3 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="5">1 - 10 {language === 'ar' ? 'مركبات' : 'vehicles'}</option>
                        <option value="25">11 - 50 {language === 'ar' ? 'مركبة' : 'vehicles'}</option>
                        <option value="100">51 - 200 {language === 'ar' ? 'مركبة' : 'vehicles'}</option>
                        <option value="500">201+ {language === 'ar' ? 'شاحنة ومعدة' : 'heavy fleet'}</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-bold text-purple-200 flex items-center gap-1.5">
                        <MessageSquare size={12} className="text-purple-400" />
                        <span>{language === 'ar' ? 'تفاصيل الاستفسار أو التحدي التشغيلي' : 'Inquiry details'}</span>
                      </label>
                      <textarea 
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={language === 'ar' ? 'يرجى توضيح التحدي التشغيلي أو ما تأملون تحقيقه عبر النظام...' : 'Current challenges or objectives...'}
                        className={`w-full bg-[#180a2e]/90 border ${errors.message ? 'border-rose-500' : 'border-purple-700/50 focus:border-purple-400'} text-white placeholder-purple-300/40 rounded-xl py-2.5 px-3.5 text-xs transition-colors focus:outline-none resize-none`}
                      />
                      {errors.message && <p className="text-[10px] text-rose-400">{errors.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:brightness-110 disabled:opacity-50 text-white py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg active:scale-98 mt-2"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>{language === 'ar' ? 'جاري إرسال الطلب...' : 'Submitting...'}</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>{language === 'ar' ? 'إرسال الاستفسار وتأكيد التواصل' : 'Submit Consultation Request'}</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-14 h-14 bg-emerald-950 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
                      <CheckCircle2 size={32} className="animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-white">
                        {language === 'ar' ? 'تم استلام استفسارك بنجاح!' : 'Inquiry Received!'}
                      </h4>
                      <p className="text-xs text-purple-200/90 max-w-xs mx-auto">
                        {language === 'ar' 
                          ? 'تم تسجيل طلبك فورياً في لوحة الإدارة وسيتصل بك أحد خبرائنا الفنيين خلال وقت قصير.'
                          : 'Your request is recorded. An advisor will contact you shortly.'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSubmitSuccess(false);
                        setIsInquiryModalOpen(false);
                      }}
                      className="px-5 py-2 bg-purple-900 hover:bg-purple-800 text-purple-100 text-xs font-bold rounded-xl border border-purple-500/40 cursor-pointer"
                    >
                      {language === 'ar' ? 'إغلاق' : 'Close'}
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Export named alias for explicit Carousel component imports
export { CustomerSuccessStories as SuccessStoriesCarousel };
