import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, Sparkles, Target, Compass, 
  Award, TrendingUp, Users, Truck, Cpu, CheckCircle2, 
  Layers, BarChart2, Globe, HeartHandshake, CheckSquare, 
  Wrench, Fuel, Mail, Phone, ArrowRight, ArrowLeft,
  Lock, Server, FileText, ChevronDown, Check, Star
} from 'lucide-react';
import enterpriseFleetDepot from '../assets/images/enterprise_fleet_depot_1782935136613.jpg';
import officialLogoImg from '../assets/images/fleet_aurvexis_brand_logo_1787051487788.jpg';
import { FleetAurvexisVectorEmblem } from './FleetAurvexisLogo';

interface AboutCompanyViewProps {
  language: 'ar' | 'en';
  brandName?: string;
  onStartTrial: () => void;
}

export default function AboutCompanyView({
  language,
  brandName = 'FleetAurvexis',
  onStartTrial
}: AboutCompanyViewProps) {
  const isRtl = language === 'ar';
  const effectiveName = brandName || 'FleetAurvexis';
  const [activePillarTab, setActivePillarTab] = useState<number>(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadProfile = () => {
    // Generate and download a sleek structured text/PDF summary
    const content = `
=====================================================
          ${effectiveName.toUpperCase()} CORPORATE PROFILE
=====================================================
Enterprise Smart Fleet & Preventive Maintenance Ecosystem
Official System Release • 2026

ABOUT US:
${effectiveName} is a deep-tech enterprise software company specializing in 
cloud-native Fleet Operations, Preventive Maintenance (PM), IoT Telematics, 
and AI-Powered Diagnostic Systems. 

MISSION:
To eradicate unexpected mechanical downtime and cut total cost of ownership (TCO)
by up to 30% through intelligent automation, barcode walkarounds, and multi-branch governance.

VISION:
To become the benchmark standard operating system for fleet transport, 
heavy construction machinery, and maintenance workshops across the region.

KEY NUMBERS:
- 45,000+ Active Monitored Assets & Heavy Vehicles
- 1,250,000+ Executed Digital Work Orders
- 30% Average Operating Cost Reduction
- 99.4% Spare Parts Leakage Prevention Rate
- 99.99% Enterprise Cloud Uptime SLA

CONTACT & SALES:
Direct Sales: sales@fleetaurvexis.com | Toll-Free: +966 800 123 4567
=====================================================
    `;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${effectiveName}_Company_Profile.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const coreValues = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      titleAr: 'النزاهة والشفافية المالية',
      titleEn: 'Financial Transparency',
      descAr: 'حوكمة صرف كل ريال مخصص للوقود أو قطع الغيار وربطه مباشرة بالرقم التسلسلي للمركبة لمنع الهدر والازدواجية.',
      descEn: 'Allocating every single expense directly to specific asset serials to guarantee zero duplication and full auditability.'
    },
    {
      icon: <Cpu className="w-6 h-6 text-purple-600" />,
      titleAr: 'الابتكار والذكاء الاصطناعي',
      titleEn: 'AI-Driven Innovation',
      descAr: 'استثمار خوارزميات الذكاء الاصطناعي لتحويل أكواد الأعطال والبلاغات الصوتية إلى إجراءات صيانة موجهة ودقيقة.',
      descEn: 'Leveraging AI diagnostic engines to parse engine fault codes and field voice dispatches into instant work orders.'
    },
    {
      icon: <Target className="w-6 h-6 text-emerald-600" />,
      titleAr: 'الاستباقية والسلامة أولاً',
      titleEn: 'Proactive Safety First',
      descAr: 'تحويل ثقافة الصيانة من ردة الفعل بعد حدوث العطل إلى جداول استباقية صارمة تضمن سلامة السائقين وحماية الأصول.',
      descEn: 'Shifting maintenance culture from reactive fixes to strictly scheduled proactive intervals that protect lives.'
    },
    {
      icon: <Globe className="w-6 h-6 text-sky-600" />,
      titleAr: 'الاستدامة والكفاءة التشغيلية',
      titleEn: 'Eco-Sustainability',
      descAr: 'خفض الانبعاثات وتحسين كفاءة استهلاك المحركات للوقود لدعم مبادرات الاستدامة البيئية والتحول الأخضر.',
      descEn: 'Reducing carbon footprints and optimizing engine fuel consumption in alignment with national green initiatives.'
    }
  ];

  const pillars = [
    {
      id: 0,
      titleAr: 'محرك الذكاء الاصطناعي التشخيصي',
      titleEn: 'Predictive AI Diagnostic Engine',
      badgeAr: 'تشخيص فوري 24/7',
      badgeEn: 'Instant Diagnostics',
      descAr: 'نظام متقدم يستقبل أكواد الأعطال القياسية (OBD-II / CAN-bus) والبلاغات الصوتية من السائقين بالميدان، ويترجمها فورياً إلى دليل صيانة مفصل يحدد قطع الغيار المطلوبة وساعات العمل المتوقعة للإصلاح.',
      descEn: 'A state-of-the-art copilot parsing standard OBD-II fault codes and driver voice notes into comprehensive diagnostic workflows with exact spare parts estimations.',
      metricsAr: 'دقة تشخيص تصل إلى 98.6% وخفض زمن الانتظار بنسبة 50%',
      metricsEn: '98.6% diagnostic accuracy with 50% repair turnaround reduction'
    },
    {
      id: 1,
      titleAr: 'الفحص الميداني بباركود QR المقاوم للعوامل الجوية',
      titleEn: 'Field QR & Digital Walkarounds',
      badgeAr: 'صفر أوراق',
      badgeEn: '100% Paperless',
      descAr: 'ملصقات ذكية مقاومة لدرجات الحرارة العالية والغبار تثبت على أبواب المركبات وخزانات الوقود. يقوم السائق بمسح الرمز بهاتفه الذكي لإجراء فحص السلامة اليومي وتوثيق قراءات العداد والوقود بلحظات معدودة.',
      descEn: 'Rugged weather-proof QR code stickers mounted on vehicle chassis, enabling drivers to complete certified morning walkarounds directly from mobile web.',
      metricsAr: 'التزام 100% بالفحص الصباحي ورصد فوري للملاحظات الميكانيكية',
      metricsEn: '100% daily walkaround adherence with live telemetry updates'
    },
    {
      id: 2,
      titleAr: 'حوكمة مخازن وقطع الغيار وسلاسل الإمداد',
      titleEn: 'Smart Parts Inventory & Supply Chain',
      badgeAr: 'ربط بالرقم التسلسلي VIN',
      badgeEn: 'VIN-Bound Tracking',
      descAr: 'جرد إلكتروني مستمر يربط خروج أي قطعة غيار (فلاتر، فرامل، إطارات، بطاريات) برقم أمر العمل وهيكل المركبة مباشرة، مع إشعارات ذكية فورية عند وصول المخزون لحد الأمان التكتيكي.',
      descEn: 'Continuous inventory auditing linking spare parts disbursements directly to work orders and vehicle chassis numbers, with automated re-order thresholds.',
      metricsAr: 'منع تسريب وخلط قطع الغيار بنسبة 99.4%',
      metricsEn: '99.4% elimination of parts slippage and warehouse mismatch'
    },
    {
      id: 3,
      titleAr: 'إدارة التكلفة الإجمالية للملكية TCO والوقود',
      titleEn: 'Total Cost of Ownership (TCO) & Fuel Intelligence',
      badgeAr: 'رؤية مالية متكاملة',
      badgeEn: 'Full Financial Visibility',
      descAr: 'احتساب مؤتمت ودقيق لكافة تكاليف التشغيل والصيانة والوقود طوال دورة حياة المركبة، مما يمنح الإدارة العليا بيانات حاسمة لاتخاذ قرارات استبدال الآليات أو تمديد خدمتها بأعلى عائد استثماري.',
      descEn: 'Automated lifecycle tracking measuring depreciation, maintenance spend, and fuel consumption to support high-conviction fleet replacement decisions.',
      metricsAr: 'توفير مالي موثق يصل إلى 30% من إجمالي ميزانية الأسطول',
      metricsEn: 'Documented 30% operational savings across total asset fleet'
    }
  ];

  return (
    <div className="animate-fade-in py-8 px-4 max-w-6xl mx-auto space-y-12" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 🌟 1. HERO BANNER - CORPORATE PROFILE */}
      <div className="relative rounded-[2.5rem] bg-[#0b1120] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-indigo-950/70 z-10" />
        <img 
          src={enterpriseFleetDepot} 
          alt={`${effectiveName} Headquarters and Fleet System`} 
          className="absolute inset-0 w-full h-full object-cover opacity-25 select-none"
          referrerPolicy="no-referrer"
        />

        <div className="relative z-20 p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex-1 text-right space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-[10px] font-black uppercase font-mono tracking-wider">
                <Sparkles size={12} className="text-indigo-400" />
                <span>{isRtl ? 'الملف التعريفي الرسمي • FleetAurvexis Ecosystem' : 'OFFICIAL CORPORATE PROFILE'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 rounded-full text-[10px] font-bold font-mono">
                <ShieldCheck size={12} />
                <span>{isRtl ? 'إصدار معتمد 2026' : 'Enterprise Certified 2026'}</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {isRtl ? (
                <>
                  نبذة عن شركة <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300">{effectiveName}</span>
                </>
              ) : (
                <>
                  About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300">{effectiveName}</span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
              {isRtl 
                ? 'شركة رائدة ومتخصصة في ابتكار برمجيات الحوسبة السحابية (SaaS) وأنظمة الذكاء الاصطناعي لإدارة الأساطيل، الورش الميكانيكية، وسلاسل إمداد قطع الغيار للمؤسسات الكبرى والجهات الحكومية والقطاع اللوجستي.'
                : 'A leading deep-tech SaaS enterprise specializing in cloud fleet maintenance, AI diagnostic mechanics, and multi-branch warehouse supply chain governance for mission-critical organizations.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onStartTrial}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <span>{isRtl ? 'طلب عرض تقديمي للمنصة' : 'Request Corporate Demo'}</span>
                {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </button>

              <button
                type="button"
                onClick={handleDownloadProfile}
                className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors cursor-pointer flex items-center gap-2"
              >
                <FileText size={14} className="text-indigo-400" />
                <span>
                  {downloadSuccess 
                    ? (isRtl ? 'تم التحميل بنجاح ✓' : 'Downloaded Successfully ✓') 
                    : (isRtl ? 'تحميل البروفايل التعريفي' : 'Download Company Brief')}
                </span>
              </button>
            </div>

          </div>

          {/* Graphic Emblem Card */}
          <div className="w-full md:w-80 shrink-0 bg-slate-900/90 border border-indigo-500/30 p-6 rounded-3xl backdrop-blur-md text-right space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl overflow-hidden border border-indigo-400/50 shadow-md bg-[#090D16] shrink-0 p-0.5">
                  <FleetAurvexisVectorEmblem className="w-full h-full" />
                </div>
                <span className="text-[11px] font-black text-indigo-400 uppercase font-mono">
                  {isRtl ? 'الهوية والشعار الرسمي' : 'OFFICIAL BRAND LOGO'}
                </span>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>{isRtl ? 'الاسم التجاري:' : 'Brand Name:'}</span>
                <span className="text-white font-black font-mono">{effectiveName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>{isRtl ? 'القطاع التكنولوجي:' : 'Tech Sector:'}</span>
                <span className="text-slate-200 font-bold">{isRtl ? 'Fleet Tech & AI SaaS' : 'Fleet Tech & AI SaaS'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>{isRtl ? 'مستوى الأمان:' : 'Security Grade:'}</span>
                <span className="text-emerald-400 font-bold">AES-256 Cloud Bank Grade</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>{isRtl ? 'المركبات المدارة:' : 'Monitored Assets:'}</span>
                <span className="text-indigo-300 font-mono font-bold">+45,000</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 leading-normal">
              {isRtl 
                ? 'مرخصة ومطابقة لمعايير الهيئة العامة للنقل واشتراطات الأمن السيبراني وإدارة الأصول.'
                : 'Fully aligned with National Transport Authority regulations and cybersecurity data governance.'}
            </div>
          </div>

        </div>
      </div>

      {/* 🌟 2. OUR STORY & WHO WE ARE (من نحن وقصة الانطلاق) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm space-y-8">
        
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          
          <div className="flex-1 space-y-4 text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase font-mono">
              <Building2 size={12} />
              <span>{isRtl ? 'من نحن • الهوية والنشأة' : 'WHO WE ARE'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
              {isRtl ? (
                <>
                  إعادة ابتكار إدارة الأساطيل والصيانة وفق معايير <span className="text-indigo-650">الجيل الرابع للصناعة</span>
                </>
              ) : (
                <>
                  Redefining Fleet Maintenance Through <span className="text-indigo-650">Industry 4.0 Standard</span>
                </>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {isRtl 
                ? `انطلقت شركة ${effectiveName} برؤية هندسية واضحة تهدف إلى القضاء على الفجوة الكبيرة بين العمل الميداني للورش والإدارة المالية واللوجستية للأساطيل. لاحظنا أن مئات الشركات اللوجستية والمقاولات تفقد ملايين الريالات سنوياً بسبب السجلات الورقية الضائعة، غياب تتبع قطع الغيار المستهلكة، وتأخر اكتشاف أعطال المحركات حتى تصل لمرحلة التلف الكامل.`
                : `${effectiveName} was founded with a rigorous engineering vision: to bridge the critical operational chasm between frontline workshop mechanics and boardroom financial executives. We recognized that heavy transport and contracting organizations bleed millions annually in manual paperwork, untracked spare parts, and late fault detection.`}
            </p>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {isRtl 
                ? `صممنا ${effectiveName} لتكون نظام تشغيل سحابي متكامل فائق السلاسة، يدمج بين سهولة الاستخدام للسائق والفني عبر الهواتف الذكية، وقوة التحليل الإحصائي والمالي لمدراء الأساطيل والإدارة العليا.`
                : `We engineered ${effectiveName} as a cohesive operating ecosystem—unifying drivers, field mechanics, warehouse keepers, and executive dispatchers on a single encrypted platform.`}
            </p>
          </div>

          {/* Key Metric Highlights Box */}
          <div className="w-full md:w-96 grid grid-cols-2 gap-3.5 shrink-0">
            <div className="p-5 bg-gradient-to-br from-indigo-50/60 to-purple-50/30 border border-indigo-100 rounded-2xl text-center space-y-1 shadow-3xs">
              <span className="text-2xl sm:text-3xl font-black text-indigo-700 font-mono block">+45,000</span>
              <span className="text-[11px] font-bold text-slate-600">{isRtl ? 'مركبة وآلية نشطة' : 'Active Heavy Assets'}</span>
            </div>
            <div className="p-5 bg-gradient-to-br from-emerald-50/60 to-teal-50/30 border border-emerald-100 rounded-2xl text-center space-y-1 shadow-3xs">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono block">30% ↓</span>
              <span className="text-[11px] font-bold text-slate-600">{isRtl ? 'متوسط وفر التشغيل' : 'Avg TCO Cost Cut'}</span>
            </div>
            <div className="p-5 bg-gradient-to-br from-amber-50/60 to-yellow-50/30 border border-amber-100 rounded-2xl text-center space-y-1 shadow-3xs">
              <span className="text-2xl sm:text-3xl font-black text-amber-700 font-mono block">99.4%</span>
              <span className="text-[11px] font-bold text-slate-600">{isRtl ? 'ضبط مخزون الورش' : 'Parts Ledger Accuracy'}</span>
            </div>
            <div className="p-5 bg-gradient-to-br from-sky-50/60 to-blue-50/30 border border-sky-100 rounded-2xl text-center space-y-1 shadow-3xs">
              <span className="text-2xl sm:text-3xl font-black text-sky-700 font-mono block">+1.2M</span>
              <span className="text-[11px] font-bold text-slate-600">{isRtl ? 'أمر عمل منجز' : 'Digital Work Orders'}</span>
            </div>
          </div>

        </div>

      </div>

      {/* 🌟 3. VISION & MISSION CARDS (الرؤية والرسالة) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Vision Card */}
        <div className="bg-gradient-to-br from-white to-indigo-50/40 border border-indigo-100 rounded-3xl p-8 text-right space-y-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Compass size={24} />
          </div>
          <span className="text-[10.5px] font-black text-indigo-600 uppercase font-mono tracking-wider block">
            {isRtl ? 'رؤيتنا المستقبلية • Our Vision' : 'OUR VISION'}
          </span>
          <h3 className="text-xl font-black text-slate-900">
            {isRtl ? 'المعيار المعياري الأول لحوسبة الأساطيل' : 'The Definitive Operating Standard'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            {isRtl 
              ? `أن نكون المنظومة الرقمية السحابية الأولى المعتمدة في الشرق الأوسط والعالم لإدارة صيانة وحوكمة الأساطيل، بتمكين المؤسسات من التحول الكامل إلى بيئة ذكية خالية من الأعطال المفاجئة ومنضبطة مالياً وتشغيلياً بنسبة 100%.`
              : `To establish ${effectiveName} as the undisputed benchmark cloud ecosystem across the globe for smart transport, heavy assets resilience, and zero-waste workshop maintenance.`}
          </p>
        </div>

        {/* Mission Card */}
        <div className="bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-100 rounded-3xl p-8 text-right space-y-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Target size={24} />
          </div>
          <span className="text-[10.5px] font-black text-emerald-600 uppercase font-mono tracking-wider block">
            {isRtl ? 'رسالتنا التشغيلية • Our Mission' : 'OUR MISSION'}
          </span>
          <h3 className="text-xl font-black text-slate-900">
            {isRtl ? 'تمكين القيادات من التحكم التام وخفض التكاليف' : 'Empowering Operations with Control & Precision'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            {isRtl 
              ? `تزويد مدراء الأساطيل والمهندسين بأدوات تكنولوجية استباقية بالذكاء الاصطناعي وإنترنت الأشياء، تضمن استمرار تشغيل كل شاحنة ومعدة ثقيلة بأعلى درجات الأمان والفاعلية، مع حماية أصول الشركة وخفض تكلفة الملكية (TCO).`
              : `To empower engineering dispatchers and fleet executives with intelligent predictive tools that guarantee maximum asset uptime, absolute safety, and measurable operational savings.`}
          </p>
        </div>

      </div>

      {/* 🌟 3.5. OFFICIAL LOGO & DESIGN SYSTEM SHOWCASE */}
      <div className="bg-gradient-to-b from-[#0b1120] to-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl text-white space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4 text-right">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-indigo-400/60 shadow-[0_0_30px_rgba(99,102,241,0.35)] shrink-0 bg-[#090D16] p-1">
              <FleetAurvexisVectorEmblem className="w-full h-full" />
            </div>
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-black uppercase font-mono">
                <Sparkles size={11} />
                <span>{isRtl ? 'الهوية البصرية الرسمية' : 'OFFICIAL BRAND EMBLEM'}</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">شعار FleetAurvexis المعتمد (Ultra Sharp Vector)</h3>
              <p className="text-xs text-slate-300">تصميم هندسي متكامل بدقة متناهية يجمع بين انسيابية حركة الأساطيل، الدقة الميكانيكية، وشبكات الذكاء الاصطناعي السحابية.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const a = document.createElement('a');
              a.href = officialLogoImg;
              a.download = 'FleetAurvexis-Official-Logo.jpg';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>{isRtl ? 'تحميل الشعار بدقة فائقة' : 'Download High-Res Logo'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold">اللون الرئيسي (Royal Indigo):</span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#4F46E5] shadow-xs" />
            </div>
            <span className="font-mono text-indigo-300 font-bold block text-sm">#4F46E5</span>
            <p className="text-[10px] text-slate-400">يرمز للموثوقية المؤسسية والصلابة الهندسية.</p>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold">اللون التكنولوجي (Electric Violet):</span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#8B5CF6] shadow-xs" />
            </div>
            <span className="font-mono text-purple-300 font-bold block text-sm">#8B5CF6</span>
            <p className="text-[10px] text-slate-400">يرمز لخوارزميات الذكاء الاصطناعي والتشخيص التنبؤي.</p>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold">لون الاتصال (Cyber Teal):</span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#06B6D4] shadow-xs" />
            </div>
            <span className="font-mono text-cyan-300 font-bold block text-sm">#06B6D4</span>
            <p className="text-[10px] text-slate-400">يرمز للتليماتكس المباشر وإنترنت الأشياء (IoT).</p>
          </div>
        </div>
      </div>

      {/* 🌟 4. CORE VALUES (القيم والمبادئ التشغيلية) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm space-y-8 text-right">
        
        <div className="space-y-2 max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase font-mono">
            <Award size={12} />
            <span>{isRtl ? 'قيمنا ومبادئنا الجوهرية' : 'OUR CORE VALUES'}</span>
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900">
            {isRtl ? 'الركائز الأخلاقية والمهنية التي تقود قراراتنا' : 'The Pillars That Guide Our Innovation'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {coreValues.map((val, idx) => (
            <div 
              key={idx} 
              className="p-6 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3 text-right hover:bg-white hover:border-indigo-200 transition-all shadow-3xs"
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shadow-xs">
                {val.icon}
              </div>
              <h4 className="font-black text-sm text-slate-900">
                {isRtl ? val.titleAr : val.titleEn}
              </h4>
              <p className="text-[11.5px] text-slate-500 font-medium leading-relaxed">
                {isRtl ? val.descAr : val.descEn}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* 🌟 5. THE 4 TECHNOLOGICAL PILLARS (الركائز التكنولوجية والهندسية لـ FleetAurvexis) */}
      <div className="bg-gradient-to-b from-[#FAF9F6] to-white border border-slate-200 rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm space-y-8 text-right">
        
        <div className="space-y-2 max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase font-mono">
            <Cpu size={12} />
            <span>{isRtl ? 'الابتكار والتقنيات العميقة' : 'PROPRIETARY TECHNOLOGY'}</span>
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900">
            {isRtl ? `الركائز التكنولوجية الأربع لمنظومة ${effectiveName}` : `The 4 Technological Pillars of ${effectiveName}`}
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-200 pb-4">
          {pillars.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePillarTab(p.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activePillarTab === p.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{isRtl ? p.titleAr : p.titleEn}</span>
            </button>
          ))}
        </div>

        {/* Active Pillar Card */}
        {pillars.map((p) => {
          if (p.id !== activePillarTab) return null;
          return (
            <div key={p.id} className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h4 className="text-lg font-black text-indigo-700">
                  {isRtl ? p.titleAr : p.titleEn}
                </h4>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black">
                  {isRtl ? p.badgeAr : p.badgeEn}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {isRtl ? p.descAr : p.descEn}
              </p>

              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center gap-3">
                <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
                <span className="text-xs font-black text-indigo-950 font-mono">
                  {isRtl ? p.metricsAr : p.metricsEn}
                </span>
              </div>
            </div>
          );
        })}

      </div>

      {/* 🌟 6. SECURITY, CLOUD & COMPLIANCE (الأمان والبنية السحابية) */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-6 text-right relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-indigo-400 uppercase font-mono tracking-wider">
              {isRtl ? 'حوكمة البيانات والأمن السحابي' : 'ENTERPRISE DATA GOVERNANCE'}
            </span>
            <h3 className="text-2xl font-black text-white">
              {isRtl ? 'حماية فائقة للأصول والبيانات التشغيلية' : 'Bank-Grade Data Security & Protection'}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
              <Lock size={20} className="text-indigo-400" />
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
              <Server size={20} className="text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs text-slate-300">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
            <strong className="text-white block font-black">{isRtl ? 'تشفير AES-256' : 'AES-256 Encryption'}</strong>
            <p className="text-[11px] text-slate-400 leading-normal">
              {isRtl ? 'تشفير كامل لكافة قواعد البيانات وتفاصيل الفواتير والقطع في وضع السكون وأثناء النقل.' : 'Full encryption at rest and in transit across all active nodes.'}
            </p>
          </div>
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
            <strong className="text-white block font-black">{isRtl ? 'تواجدية سحابية 99.99%' : '99.99% Uptime SLA'}</strong>
            <p className="text-[11px] text-slate-400 leading-normal">
              {isRtl ? 'بنية تحتية موزعة تضمن استمرارية الوصول للمنظومة وإصدار أوامر العمل على مدار 24 ساعة.' : 'Distributed multi-zone failover guaranteeing continuous dispatch.'}
            </p>
          </div>
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
            <strong className="text-white block font-black">{isRtl ? 'التوافق التنظيمي' : 'Regulatory Compliance'}</strong>
            <p className="text-[11px] text-slate-400 leading-normal">
              {isRtl ? 'مطابقة كاملة لاشتراطات السلامة ولوائح النقل العام وإدارة السجلات الرقمية.' : 'Engineered to comply with regional transportation governance frameworks.'}
            </p>
          </div>
        </div>

      </div>

      {/* 🌟 7. CALL TO ACTION & CONTACT (تواصل مع الفريق) */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative">
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {isRtl ? `ابدأ شراكتك الاستراتيجية مع ${effectiveName} اليوم` : `Partner with ${effectiveName} Today`}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            {isRtl 
              ? 'انضم إلى نخبة الشركات والمؤسسات اللوجستية التي تدير عملياتها بكفاءة أعلى وأمان متكامل. استشر مهندسينا الآن لاختيار الباقة الأنسب لأسطولك.'
              : 'Join forward-thinking enterprise fleets transforming their operations with complete visibility and peace of mind.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={onStartTrial}
            className="px-8 py-3.5 bg-white text-slate-950 hover:bg-slate-100 font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {isRtl ? 'حجز جلسة استشارية وعرض حي' : 'Book a Dedicated Live Demo'}
          </button>
          
          <div className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-xl text-xs font-mono">
            <Mail size={14} className="text-indigo-300" />
            <span className="font-bold text-white">sales@fleetaurvexis.com</span>
          </div>
        </div>
      </div>

    </div>
  );
}
