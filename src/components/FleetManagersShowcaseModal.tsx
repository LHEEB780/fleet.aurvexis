import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Check, Eye, Cpu, Wrench, ShieldAlert, 
  TrendingUp, Coins, Clock, ArrowRight, BarChart2, X, 
  ChevronRight, Layers, Volume2, Landmark, CheckSquare, ListTodo,
  Users, Building2, Truck, Key, MessageSquare, Activity, ShieldCheck,
  HelpCircle, AlertTriangle, Fuel, Star, Copy, Image as ImageIcon, School
} from 'lucide-react';

import enterpriseFleetDepot from '../assets/images/enterprise_fleet_depot_1782935136613.jpg';
import constructionHeavyMachinery from '../assets/images/construction_heavy_machinery_1782935156246.jpg';
import mechanicTruckWorkshop from '../assets/images/mechanic_truck_workshop_1782935168167.jpg';
import municipalCleanFleet from '../assets/images/municipal_clean_fleet_1782935178050.jpg';
import highwayLogisticsTruck from '../assets/images/highway_logistics_truck_1782935190395.jpg';
import dashboardMarketingPreview from '../assets/images/dashboard_marketing_preview_1780862794942.png';
import saasWorkflowIllustration from '../assets/images/saas_workflow_illustration_1780862810991.png';
import AboutCompanyView from './AboutCompanyView';

interface FleetManagersShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
  onStartTrial: () => void;
  initialTab?: string;
  brandName?: string;
}

// Data structures for the 7 solutions requested by the user
interface FeatureItem {
  title: string;
  desc: string;
}

interface SolutionData {
  id: string;
  type?: 'sector' | 'feature' | 'company' | 'resource';
  nameAr: string;
  nameEn: string;
  icon: React.ReactNode;
  microCopyAr: string;
  microCopyEn: string;
  fieldReliefAr: string;
  fieldReliefEn: string;
  features: FeatureItem[];
  toneAr: string;
  toneEn: string;
  imagePrompt: string;
  imageMockUrl: string;
  longOverviewAr?: string;
  longOverviewEn?: string;
  beforeAfterAr?: { before: string; after: string }[];
  beforeAfterEn?: { before: string; after: string }[];
  roadmapAr?: string[];
  roadmapEn?: string[];
  kpisAr?: { label: string; value: string; desc: string }[];
  kpisEn?: { label: string; value: string; desc: string }[];
}

export default function FleetManagersShowcaseModal({ 
  isOpen, 
  onClose, 
  language, 
  onStartTrial,
  initialTab,
  brandName
}: FleetManagersShowcaseModalProps) {
  const isRtl = language === 'ar';
  const effectiveBrandName = brandName || localStorage.getItem('saas_brand_name') || 'FleetAurvexis';
  
  // Tab/Section Selector: Default is 'owners' (القسم الخاص لمالكي الأساطيل)
  const [activeTab, setActiveTab] = useState<string>('owners');
  const [activeSegment, setActiveSegment] = useState<'sectors' | 'features' | 'company'>('sectors');
  
  // State for simulator inside owners tab
  const [vehicleCount, setVehicleCount] = useState<number>(45);
  const [currentDowntimeDays, setCurrentDowntimeDays] = useState<number>(14);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Computed ROI Values
  const avgCostPerVehicleYear = 2500;
  const calculatedSavingsMoney = vehicleCount * avgCostPerVehicleYear * 0.30; // 30% cost savings
  const projectedDowntimeDays = Math.max(2, Math.round(currentDowntimeDays * 0.60)); // 40% reduction in downtime

  // FAQs State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Synchronize initial tab when active values change
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
      if (initialTab.startsWith('item-2-')) {
        setActiveSegment('features');
      } else {
        setActiveSegment('sectors');
      }
    }
  }, [isOpen, initialTab]);

  // Reset to top of scrollable area whenever active tab or open status changes
  useEffect(() => {
    if (isOpen) {
      const scrollContainer = document.getElementById('showcase-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Copy Prompt helper
  const handleCopyPrompt = (promptText: string, id: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 3000);
  };

  // 7 Solutions Content definition
  const solutions: SolutionData[] = [
    {
      id: 'owners',
      nameAr: 'الحل لمالكي الأساطيل',
      nameEn: 'Fleet Owners',
      icon: <Users size={16} />,
      microCopyAr: 'كيف تخفض تكاليف تشغيل أسطولك بنسبة تصل إلى 30٪ وتحسن الإنتاجية؟',
      microCopyEn: 'How to reduce fleet operating costs by up to 30% and improve productivity?',
      fieldReliefAr: 'كيف يسهل النظام العمل الميداني واليومي؟\nيقدم هذا النظام لمالكي الأساطيل رؤية شاملة وتحليلات فورية تمنع غش الوقود وتحدد الأعطال قبل حدوثها لتفادي تراكم الفواتير والتعطل الميداني غير المحسوب.',
      fieldReliefEn: 'How the system eases daily field work:\nThis system equips fleet owners with complete asset visibility and instant diagnostics, weeding out fuel waste and highlighting potential issues before they cause costly on-road breakdowns.',
      features: [
        { title: 'التتبع الفوري والصيانة', desc: 'متابعة حركة المركبات والآليات بذكاء وتلقي إشعارات الحالات الفنية بشكل مباشر.' },
        { title: 'كفاءة حاقن الوقود', desc: 'مراقبة تعبئة الديزل ومطابقتها مع الإيصالات لوقف أي تلاعب وهدر مالي.' },
        { title: 'إدارة السلامة الرقمية', desc: 'إلزام السائقين بفحوصات يومية ذكية للحماية القصوى وتقليل الأخطاء البشرية.' }
      ],
      toneAr: 'النبرة: ودودة، عملية، مريحة، وعالية الموثوقية.',
      toneEn: 'Tone of voice: Friendly, practical, comfortable, and highly trusted.',
      imagePrompt: 'A highly professional daytime corporate setting showing a confident Arab fleet owner in a modern light-filled office looking at a laptop showing real-time clean graphs. In the soft-focus background, modern transport trucks are visible in a tidy bright depot. Bright & paper-clean aesthetic, soft purple and blue accents, natural lightning, 4K resolution --ar 16:9',
      imageMockUrl: enterpriseFleetDepot
    },
    {
      id: 'large-fleets',
      nameAr: 'الحل للأساطيل الكبيرة',
      nameEn: 'Large Fleets',
      icon: <Layers size={16} />,
      microCopyAr: 'حوكمة ممركزة لتبسيط إدارة مئات الآليات في وقت واحد وبكل سلاسة لقطاع الشركات الضخمة',
      microCopyEn: 'Centralized enterprise governance to streamline hundreds of heavy assets simultaneously',
      fieldReliefAr: 'يسهّل العمل لفرق الإدارة الكبيرة والشركات اللوجستية الوطنية عبر أتمتة توزيع الصلاحيات والربط الفويّ بين الفروع ومراقبة قطع الغيار المتعددة لرفع إنتاجية الورش والتحول الكامل للرقمنة بدون أوراق وبأعلى مستويات النزاهة والموثوقية.',
      fieldReliefEn: 'It simplifies operations for massive enterprise teams by automating workflows, linking multiple regional subsidiaries, and tracking multi-warehouse spare parts to turn manual paperwork into smooth digital automation.',
      longOverviewAr: 'تواجه المؤسسات التي تمتلك أساطيل ضخمة فجوات في البيانات بين الفروع والمناطق الجغرافية، مما يفقدها ملايين الريالات نتيجة التسريب اللوجستي، وغياب تقارير النزاهة في صرف الوقود، وتراكم مستودع قطع الغيار المهملة. يوفر لك FleetAurvexis أسطح تحكم مركزية متقدمة لعزل وتجميع الأداء المالي والتشغيلي لجميع الفروع في منصة واحدة آمنة ومشفرة بالكامل.',
      longOverviewEn: 'Enterprise organizations with massive distributed fleets often suffer from communication gaps between regional centers, manual dispatch tracking failures, and lack of true asset lifetime control (TCO). FleetAurvexis solves this structural issue by creating a unified workspace that securely bridges field technicians, branch managers, and headquarters in one highly responsive control layout.',
      features: [
        { title: 'التكلفة الإجمالية للملكية (TCO)', desc: 'احتساب دقيق ومؤتمت لكافة تكاليف صيانة كل شاحنة طوال عمرها التشغيلي لاتخاذ قرار الاستبقاء أو الاستبدال بوعي وتخطيط استثماري سليم.' },
        { title: 'إدارة مخازن وقطع الغيار الذكية', desc: 'ربط رقمي لطلبات قطع الغيار بالرقم التسلسلي للمركبات، لمنع سحب القطع لآليات غير نشطة وحفظ التوازن المثالي للمستودعات.' },
        { title: 'حوكمة الصلاحيات والهيكل الإداري', desc: 'توزيع مرن للأدوار والصلاحيات للمشرفين في كافة فروع المملكة (الوسطى، الغربية، الشرقية) مع تقارير أداء مستقلة لكل فئة.' }
      ],
      toneAr: 'النبرة: عملية ومحترفة، مستقرة وعالية الثقة لبيئات العمل الكبيرة.',
      toneEn: 'Tone of voice: Professional, highly stable, structured, and tailored for global enterprise demands.',
      imagePrompt: 'A futuristic clean fleet control room, daytime bright light, professional operator looking at digital screens with minimal blue and soft purple flowcharts. Contemporary paper UI layout, highly immersive workspace, photorealistic, 4K clarity --ar 16:9',
      imageMockUrl: enterpriseFleetDepot,
      beforeAfterAr: [
        { before: 'شتات في الفواتير المنسقة يدوياً، وصعوبة قياس كفاءة ومستهلك الورش في فروع المناطق المختلفة.', after: 'ربط فوري وحوسبة سحابية مركزية تدمج مخزون قطع الغيار والوقود بكفاءة تمنع الهدر تماماً.' }
      ],
      roadmapAr: [
        'المرحلة الأولى: حصر الفروع وتوزيع صلاحيات مدراء الأساطيل والتشغيل وصرف الورش بالألوان.',
        'المرحلة الثانية: تفعيل الفحص اليومي الرقمي بالهواتف وباركود الفحص لمعايير جرد قطع الصيانة.',
        'المرحلة الثالثة: توليد التقارير الاستباقية للتكلفة الإجمالية للأعطال والوقود لزيادة الأرباح المستردة.'
      ],
      kpisAr: [
        { label: 'الحد من تسرب قطع غيار الورش', value: '99.4%', desc: 'بفضل الربط التلقائي لكل قطعة بالرقم التسلسلي للمركبة' },
        { label: 'سرعة مطابقة فواتير المستودعات', value: '3 أضعاف', desc: 'سرعة التحقق والتسوية الرقمية دون الحاجة إلى التراسل الورقي' },
        { label: 'تخفيض التكاليف التشغيلية للمركبة', value: '28% ↓', desc: 'وفر مالي ملموس عند تجميد هدر الصيانة الدورية' }
      ]
    },
    {
      id: 'construction',
      nameAr: 'قطاع الإنشاءات والبناء',
      nameEn: 'Construction Sector',
      icon: <Building2 size={16} />,
      microCopyAr: 'أقصى عمر تشغيلي للمعدات الثقيلة لمنع تعطل مواقع التشيد والبناء',
      microCopyEn: 'Maximize heavy machinery lifespan in the most severe field environments',
      fieldReliefAr: 'يتيح لمهندسي المواقع والإنشاءات والمدراء الميدانيين إدارة الحفارات والبلدوزرات والمولدات والرافعات بناءً على ساعات تشغيل المحرك الحقيقية (Engine Hour Meter)، مع رصد مستويات الزيوت لمنع تعطل المعدات المفاجئ وتفادي الغرامات المالية الطارئة.',
      fieldReliefEn: 'It enables construction site engineers to track and schedule diagnostics for bulldozers, cranes, and electric generators based on actual engine hour meters, optimizing heavy lubrication schedules directly at the worksite.',
      longOverviewAr: 'ترتبط إنتاجية مواقع البناء والتشييد ارتباطاً طردياً بنسبة التوفر التشغيلي للمعدات الثقيلة. إن حدوث عطل مفاجئ في رافعة برحية أو مضخة خرسانية قد يعطل المشروع بأكمله ويكبّد الشركة غرامات مالية باهظة. تقدم FleetAurvexis نظاماً هندسياً صلباً، يساعد المهندسين في معرفة أوقات تغيير الفلاتر، وتتبع الضغط بالهيدروليك، ورقمنة الفحص لتصفير احتمالات التعطل الميداني.',
      longOverviewEn: 'Machinery downtime in large-scale building works breaks development milestones and risks compliance metrics. FleetAurvexis digitizes construction vehicle operations by shifting maintenance calendars away from plain calendar dates into dynamic operating hour intervals. This guarantees high hydraulic endurance and zero-risk field fueling.',
      features: [
        { title: 'عدادات ساعات التشغيل الفعلية (Hours)', desc: 'وداعاً للجداول التقويمية التقريبية؛ الصيانة والتزييت يتم جدولتها بناءً على ساعات الدوران والجهد الفعلي في الميدان.' },
        { title: 'مراقبة وقود المواقع والآليات الثابتة', desc: 'تأمين كامل لخزانات المولدات والمعدات الثابتة في مواقع العمل من السرقة مع مطابقة التعبئة بالبصمة الصوتية.' },
        { title: 'الصيانة الوقائية للهيدروليك والإطارات', desc: 'تتبع مستمر للضغط الهيدروليكي وتآكل الإطارات العميقة لتجنب انفجارها وتأخير مراحل تشييد البنى الأساسية.' }
      ],
      toneAr: 'النبرة: صلبة، دقيقة وميدانية، تركز على حل التحديات والموثوقية الفائقة.',
      toneEn: 'Tone of voice: Rugged, highly accurate, focusing on on-site dependability and heavy assets resilience.',
      imagePrompt: 'A bright daytime construction site with photorealistic yellow excavators and heavy cement loaders, clean background, a chief engineer using a tablet to approve daily work orders, warm daylight, minimalist paper SaaS elements, high-resolution 4K capture --ar 16:9',
      imageMockUrl: constructionHeavyMachinery,
      beforeAfterAr: [
        { before: 'الاعتماد على التقويم الزمني للصيانة يفوت مواعيد فحص المعدات المنهكة ويسبب تلف المحركات.', after: 'جدولة آلية هندسية دقيقة ترسل إشعارات فورية للفني بضرورة الصيانة بمجرد ملامسة المعدة لساعات العمل الحرجة.' }
      ],
      roadmapAr: [
        'المرحلة الأولى: طباعة باركود الـ QR وربطه بديناميكية تتبع العدادات وساعات المحركات للآليات.',
        'المرحلة الثانية: تعيين مستخدمي المعدات والرافعات الميدانية وإلزامهم بقائمة الفحص الصباحي السحابية.',
        'المرحلة الثالثة: مراقبة إمداد وقود المواقع ونسب استهلاك المحركات ومعدلات إنجاز المشاريع.'
      ],
      kpisAr: [
        { label: 'أمان الأنظمة الهيدروليكية', value: '100%', desc: 'من الفحص الميداني والرصد الاستباقي للضغط والزيوت' },
        { label: 'تقليص أعطال المولدات المفاجئة', value: '45% ↓', desc: 'بفضل أتمتة الفلاتر الوقائية الدورية' },
        { label: 'زيادة العمر الافتراضي للمعدة', value: '35% ↑', desc: 'إطالة دورة استخدام الآلية الثقيلة قبل الحاجة للاستبدال' }
      ]
    },
    {
      id: 'service-providers',
      nameAr: 'مقدمو الخدمات التشغيلية',
      nameEn: 'Service Providers',
      icon: <Wrench size={16} />,
      microCopyAr: 'رقمنة الورش ومتابعة كفاءة الفنيين وعقود SLA لتسريع تدفق الصيانة للعملاء',
      microCopyEn: 'Instant field tech dispatcher loop to slash repair cycle times',
      fieldReliefAr: 'صُممت هذه المنصة لمزودي الخدمة، الورش التنافسية، وشركات الصيانة من الغير. تتيح لك المنصة رقمنة مهام الورش من الميدان، وإصدار تقديرات الصيانة وفواتير قطع الغيار بدقة ممتازة لتقليل فترات انتظار العملاء بالورش بشكل كامل.',
      fieldReliefEn: 'How the system eases daily field work:\nIt streamlines repairs for dispatch mechanics and vehicle leasing agencies by automating estimates, creating spare parts invoices, and sharing live repair updates with fleet managers to speed up throughput.',
      longOverviewAr: 'إن تقديم خدمات ممتازة للعملاء يتطلب سرعة فائقة في تحويل الإبلاغ الميداني إلى أمر عمل للميكانيكي، مع الدقة في صرف قطع الغيار واحتساب تكاليف الخدمة لتقديم عروض الأسعار بسرعة. يربط FleetAurvexis الفني الميداني ومسؤول الجرد والعميل في حلقة عمل واحدة فائقة الكفاءة تحقق الشفافية الكاملة وتلغي الاستهلاك الورقي التقليدي.',
      longOverviewEn: 'Whether hosting high-scale vehicle repair workshops or operating third-party asset maintenance leases, workflow speed determines profitability. FleetAurvexis offers a fully digital, beautifully simple work-order generator, connecting diagnostic mechanics, purchasing agents, and customers seamlessly.',
      features: [
        { title: 'أوامر عمل رقمية بالكامل', desc: 'إرسال التذاكر وتعيين المهام للفنيين، مع دعم تسجيل الملاحظات الصوتية والصور لحالة العطل مباشرة من الأرض.' },
        { title: 'إدارة الفواتير وصرف قطع الغيار', desc: 'صرف فوري للقطع من الورش وتحديث جرد المستودع وجمع التكاليف مع الفاتورة النهائية للعميل تلقائياً.' },
        { title: 'سرعة الاستجابة لعقود الخدمة (SLA)', desc: 'قياس دقيق لزمن استلام الآلية والبدء بالإصلاح لرفع الرضا العام للعملاء وحوكمة مستويات الخدمة.' }
      ],
      toneAr: 'النبرة: حيوية، عملية وسريعة الاستجابة بالكامل مريحة وملهمة بصرياً.',
      toneEn: 'Tone of voice: Dynamic, responsive, operation-centric, and focused on speed and accountability.',
      imagePrompt: 'A modern state-of-the-art mechanic maintenance garage, white polished floors, bright sunlight streaming from sky windows, young clean mechanics inspecting truck engines, clean blue and mild violet toolboxes, natural photography, 4K resolution --ar 16:9',
      imageMockUrl: mechanicTruckWorkshop,
      beforeAfterAr: [
        { before: 'فنيون مبعثرون بالورش وبطء شديد في صرف قطع الغيار وفواتير صيانة منسية تحت ركام المستندات.', after: 'توجيه ذكي وفوري للفني عبر هاتفه، جرد تلقائي وعرض أسعار فاق السرعة وصرف قطع فوري مشفر الكترونيا.' }
      ],
      roadmapAr: [
        'المرحلة الأولى: تهيئة مخزون الورش وحصر فئات قطع الغيار وتعيين سعر للعمل والأيدي التشغيلية.',
        'المرحلة الثانية: بناء مسارات تذاكر الصيانة للغير وتعيين الصلاحيات للفنيين والميكانيكيين بالميدان.',
        'المرحلة الثالثة: إتاحة تقارير الأداء لمعرفة سرعة الإصلاح والربحية الفعلية لكل وردية فنية دقيقة.'
      ],
      kpisAr: [
        { label: 'سرعة توليد تقديرات الخدمة', desc: 'تراجع ضخم في تعطل العملاء بالورش', value: '5 دقائق' },
        { label: 'الالتزام باتفاقيات الخدمة SLA', desc: 'تحقيق الموثوقية القصوى وعلامة الامتياز', value: '98.7%' },
        { label: 'تخفيض في هدر قطع الاستبدال بالورش', desc: 'نتيجة الرقابة الرقمية بالباركود', value: '30% ↓' }
      ]
    },
    {
      id: 'municipalities',
      nameAr: 'البلديات والجهات الحكومية',
      nameEn: 'Municipalities',
      icon: <Landmark size={16} />,
      microCopyAr: 'حوكمة الأصول العامة والامتثال البلدي لتقليص نفقات الأساطيل الحكومية والبلدية',
      microCopyEn: 'Autonomous asset tracking and compliance audit for public fleet sustainability',
      fieldReliefAr: 'يمكّن الرقابة البلدية والمحليات من حوكمة ناقلات النفايات، سيارات الخدمة العامة، وحافلات النقل المدرسي والبلدي وتفتيش أمانها اليومي مع ربط تكلفة الديزل ومعدل الاستهلاك بكل دقة لمنع الهدر وحفظ المال العام والالتزام بالسلامة.',
      fieldReliefEn: 'How the system eases daily field work:\nIt gives municipal supervisors and government transport units accurate tools to monitor sweepers, trucks, and school buses, assuring total budget control and instant environmental safety compliance.',
      longOverviewAr: 'تحظى إدارة الأصول العامة بأهمية قصوى لدى القطاعات الحكومية لضمان الاستخدام السليم للموارد وتفادي إتلاف الآليات المكلفة. إن رقمنة تفتيش الأسطول يتيح للرقابة البلدية ثقة كاملة بصلاحية ناقلات النفايات وحافلات المدارس وسلامة فراميلها وأنظمتها، مع تقارير مالية شفافة تثبت مسار كل ريال تم صرفه على الوقود وقطع الغيار.',
      longOverviewEn: 'Municipal services operate civic machinery requiring strict transparency, audit logs, and clear green eco-compliance reporting. FleetAurvexis creates a secure, highly controlled environment that prevents fuel leakage, enforces routine heavy machinery safety checks, and manages public resource budgets down to the single cent.',
      features: [
        { title: 'حوكمة وقود الأصول العامة', desc: 'منع غش أو تسريب الديزل للأصول الحكومية عبر مطابقة كميات التعبئة بالعداد والباركود تلقائياً لمنع أي تلاعب.' },
        { title: 'تفتيش الأمان والامتثال البلدي والبيئي', desc: 'إجبار السائقين والمشغلين على القيام بالفحوصات اليومية (طفايات الحريق، العوادم والامتثال لسلامة المحركات العامة).' },
        { title: 'التحكم بمستودعات قطع الغيار والمشروعات', desc: 'جرد إلكتروني دقيق يضمن تلافي الهدر المالي بالصرف العشوائي لقطع الغيار على مركبات غير عاملة.' }
      ],
      toneAr: 'النبرة: رسمية، رصينة، تبث الموثوقية والمصداقية والحرص التشغيلي السليم.',
      toneEn: 'Tone of voice: Dignified, highly trustworthy, secure, and oriented towards long term public service goals.',
      imagePrompt: 'A sparkling day-lit municipal clean fleet depot, environmental green transit buses parked neatly, an administrative auditor with a clipboard reviewing operations, soft white paper aesthetic, bright natural light, crisp 4K capture --ar 16:9',
      imageMockUrl: municipalCleanFleet,
      beforeAfterAr: [
        { before: 'غياب السجلات الرقمية للأصول البلدية مما يصعب تتبع الفواتير وتكرار الصرف لذات القطع بهدر كبير.', after: 'سجل صيانة بلدي موحد يرفع الموثوقية بمعدل 100% ويقدم كشوفات فورية للمال العام والتدقيق المالي.' }
      ],
      roadmapAr: [
        'الخطوة الأولى: أرشفة كامل الأصول الرمزية للبلدية والمركبات والآليات مع الألوان ونوع الوقود.',
        'الخطوة الثانية: طباعة الـ QR وتوزيعه لحوكمة إجراء السائق الفني الفوري لبث الطمأنينة والأمان.',
        'الخطوة الثالثة: تفعيل الربط السنوي للتكامل ومطابقة ميزانيات المحروقات وتقارير الكفاءة.'
      ],
      kpisAr: [
        { label: 'النزاهة ومطابقة الوقود بالبلدية', desc: 'شفافية كاملة لتصفير الفروق الإحصائية', value: '100%' },
        { label: 'الالتزام بمتطلبات السلامة العامة', desc: 'حماية الطلبة والمواطنين على الطريق دائماً', value: '99.8%' },
        { label: 'توفير نفقات صيانة الآليات والفرامل', desc: 'بفضل الرصد والمتابعة الوقائية المبكرة', value: '32% ↓' }
      ]
    },
    {
      id: 'logistics',
      nameAr: 'النقل اللوجستي والشاحنات',
      nameEn: 'Logistics & Trucking',
      icon: <Truck size={16} />,
      microCopyAr: 'أتمتة وحماية رحلات الشحن اللوجستي الطويلة وتصفير تعطل الشاحنات عبر الطرق سريعة',
      microCopyEn: 'Secure line haul solutions to ensure zero-delay cargo delivery',
      fieldReliefAr: 'يساعد شركات الخدمات اللوجستية والشحن عبر المدن في تتبع الشاحنات بدقة ومراقبة ضغط وتآكل الإطارات، وزيادة عمرها مع منع سرقات الديزل وسخونة المحرك المفاجئة وسط الطرق الصحراوية الطويلة لضمان التوصيل الآمن.',
      fieldReliefEn: 'How the system eases daily field work:\nIt serves cargo carriers by tracking accurate fuel fills, predicting engine cooling failures, and measuring tyre wear to avoid emergency halts on long cross-country desert routes.',
      longOverviewAr: 'تعد الموثوقية العصب الحقيقي لأعمال سلاسل الإمداد والنقل اللوجستي. إن أي تأخير في تسليم الشحنات قد يؤثر على ثقة العملاء ويسبب تلفاً للبضائع المبردة أو غرامات تسليم باهظة. صمم FleetAurvexis الحل اللوجستي لمسافات السير الطويلة ليقاوم الحرارة الشديدة بالمدن الصحراوية، عبر تتبع دورات الإطارات، وضبط الصيانة الوقائية لأجهزة ناقل حركة والزيوت ومراقبة سلوك القيادة لحماية السائق والبضاعة.',
      longOverviewEn: 'Highuptime logistics is the back-bone of trading chains. A highway breakdown for a line-haul multi-axle trailer can mean thousands in refrigeration damage and critical delivery failure. FleetAurvexis manages trans-national logistics by continuously coordinating tire and chassis status directly with real-time mileage sync.',
      features: [
        { title: 'إدارة أداء ومستهلكات الإطارات الذكي', desc: 'متابعة العمر الفعلي وضغط والمسافة التي قطعها كل إطار لتقليص استبدالها الفجائي وتأمين القيادة بالطريق السريع.' },
        { title: 'مزامنة صيانة الزيوت والفرامل بالعداد', desc: 'جدولة تلقائية كبرى لتغيير زيوت صندوق التروس وحواشي الفرامل بناءً على الكيلومتراج الفعلي للشاحنة وبمنتهى الدقة.' },
        { title: 'تأمين وقود الشحن والديزل عبر الطرق', desc: 'تحليل دوري لمعدل استهلاك الوقود لكل شاحنة وتنبيه فوري لأي انخفاض مفاجئ في الديزل على المسار اللوجستي.' }
      ],
      toneAr: 'النبرة: حيوية، هندسية، عالية الموثوقية لإنقاذ عمليات سلاسل التوريد والإنتاج.',
      toneEn: 'Tone of voice: Energetic, highly technical, robust, and engineered for high-uptime shipping grids.',
      imagePrompt: 'A beautiful white semi-truck delivering cargo on a high mountain highway under shining sun, technical clean charts overlaid on screen in bright modern white and purple UI, natural light, realistic 4K photograph --ar 16:9',
      imageMockUrl: highwayLogisticsTruck,
      beforeAfterAr: [
        { before: 'تأخر مستمر للشحنات بسبب أعطال الإطارات والفرامل المفاجئة وإهمال تغيير الزيوت الدورية.', after: 'تسليم سريع وآمن، صيانة استباقية مجدولة لعدادات الشاحنات، وتنبؤ بالأعطال يمنع تعطل المحرك تماماً.' }
      ],
      roadmapAr: [
        'المرحلة الأولى: دمج عدادات الشاحنات (Odometer Sync) مع لوحة التحكم لرصد الكيلومترات بدقة وسرعة.',
        'المرحلة الثانية: بناء بطاقات الإطارات وجدولة فحص سماكة وعمر كل عجلة لضمان رحلات أمان مثالية.',
        'المرحلة الثالثة: حماية الوقود وتفويض السائق بالملاحظات والتقارير لتفادي الخسائر المالية غير المحسوبة.'
      ],
      kpisAr: [
        { label: 'الالتزام بمواعيد تسليم الشحنات اللوجستية', desc: 'تحقيق الموثوقية وبناء سمعة قيادية بالقطاع', value: '99.5%' },
        { label: 'زيادة العمر الافتراضي للشاحنة وإطاراتها', desc: 'توفير ملموس في مصاريف الورش والقطع الطارئة', value: '40% ↑' },
        { label: 'تقليص نفقات تسريب الديزل بالمحاور', desc: 'من الرقابة والمطابقة الآلية للرحلات', value: '25% ↓' }
      ]
    },
    {
      id: 'education',
      nameAr: 'قطاع المدارس والتعليم',
      nameEn: 'Schools & Education',
      icon: <School size={16} />,
      microCopyAr: 'أعلى معايير الأمان لحراس حافلات المدارس لسلامة أبنائنا يومياً وبلا استثناء',
      microCopyEn: 'Gold safety benchmarks for school bus fleets keeping children safe daily',
      fieldReliefAr: 'يوفر لمشرفي الحركة والمدارس العامة والخاصة لوحة تحقق ذكية تلزم سائقي الحافلات بالدوران والفحص الصباحي الفعلي (كالمكابح، والأبواب، والأحزمة والوقود) عبر البار كود QR لحماية الطلاب وضمان عودتهم سالمين.',
      fieldReliefEn: 'How the system eases daily field work:\nIt structures morning safety checklists for school bus fleet operators, forcing structural inspections of exits, doors, seatbelts, and tyre pressure to give management absolute piece of mind.',
      longOverviewAr: 'لا مساومة على معايير سلامة أبنائنا في قطاع التعليم والمدارس. إن غياب الفحص الصباحي الروتيني قد تترتب عليه حوادث أو أعطال فنية حرجة تحرم الطلاب من يومهم الدراسي وتسبب قلقاً هائلاً لأولياء الأمور. يوفر FleetAurvexis منظومة حوكمة رائدة تفرض انضباطاً كاملاً على السائق، وتضمن سلامة أجهزة التبريد والمكابح، مع لوحة تحكم ذكية تعين البدلاء فوراً.',
      longOverviewEn: 'Transporting pupils is a sacred operational duty requiring flawless reliability, daily driver inspections, emergency plan setups, and constant temperature health checks for cooling and AC cabins. FleetAurvexis creates a high-contrast safety engine for private and public schools.',
      features: [
        { title: 'التحقق الصباحي بالباركود (QR Checks)', desc: 'إجبار السائقين على مسح الرموز خلف كل حافلة وحولها في الميدان لضمان قيامهم بالفحص الفعلي للسلامة.' },
        { title: 'تنبيهات المكابح وأنظمة التكييف والتبريد', desc: 'مراقبة فورية لأجهزة التكييف والفرامل لضمان سلامة وراحة الأطفال وتفادي تعرضهم للحر الشديد.' },
        { title: 'بوابة السائقين وجدول البدلاء الذكي', desc: 'سهولة إسناد وتعديل الرحلات لإنقاذ اليوم الدراسي فوراً حال غياب أو عجز سائق حافلة صباحي.' }
      ],
      toneAr: 'النبرة: مطمئنة، ودودة جداً، دقيقة ومحبة للسلامة والأطفال.',
      toneEn: 'Tone of voice: Warm, reassuring, precision safety oriented, compassionate, and highly validated.',
      imagePrompt: 'Clean modern yellow school buses parked on a clean schoolyard, morning sun light, a technical supervisor checking tires with a mobile application displaying clean white paper design, soft blue tones, photorealistic 4K resolution --ar 16:9',
      imageMockUrl: municipalCleanFleet,
      beforeAfterAr: [
        { before: 'حافلات تتحرك دون تدقيق وتفاجؤ بأعطال في الأبواب أو تعطل المكيف أثناء النقل الصباحي للأطفال.', after: 'فحص صارم ومريح بالباركود، سيطرة تامة على سلامة المكابح والتكيف، واطمئنان أسر الطلاب والمدارة بالكامل.' }
      ],
      roadmapAr: [
        'الخطوة الأولى: لصق الباركود QR المخصص للسلامة على أبراج الحافلات والأطقم في المدارس.',
        'الخطوة الثانية: تعيين مستخدمي السفر اليومي وجناح الفحص وتنبيهات المكابح والتبريد.',
        'الخطوة الثالثة: تفعيل بوابة المتابعة الذكية وإعداد خطط طوارئ السائقين البدلاء للياقة البدنية والذهنية.'
      ],
      kpisAr: [
        { label: 'نسبة سلامة وأمان الحافلات الرقمية', desc: 'تصفير احتمالات الحوادث الفنية والإهمال', value: '100%' },
        { label: 'الالتزام بمواعيد وصول الطلاب بالدقائق', desc: 'حماية جودة التميز والتحصيل الدراسي الصباحي', value: '99.1%' },
        { label: 'انضباط السائقين بالفحص الصباحي اليومي', desc: 'امتثال صارم وبصمة إثبات الحضور بالباركود', value: '100%' }
      ]
    },
    {
      id: 'item-2-1',
      type: 'feature',
      nameAr: 'جدولة الصيانة الوقائية PM',
      nameEn: 'Preventative Maintenance PM',
      icon: <Clock size={16} />,
      microCopyAr: 'تنبيهات وجدولة الصيانة الوقائية لتقليص تكاليف ومصاريف الأعطال الطارئة بذكاء',
      microCopyEn: 'Autoscheduled PM reminders to prevent severe breakdown repairs',
      fieldReliefAr: 'يضمن لمدراء الورش وأصحاب الأساطيل دقة عالية في جدولة الغيارات وتتتبع زيوت المحركات آلياً.',
      fieldReliefEn: 'Keeps dispatch mechanics in sync with recurring lubrication schedules automatically.',
      features: [
        { title: 'جدولة بالعداد والوقت', desc: 'إنشاء جداول صيانة ذكية تعتمد على الكيلومتراج الحقيقي أو الفترات الزمنية المحددة تلقائياً.' },
        { title: 'قوائم فحص مخصصة', desc: 'ربط الفحص الوقائي بمهام محددة يلتزم الفني باتباعها خطوة بخطوة بالورشة.' },
        { title: 'تنبيهات ذكية مبكرة', desc: 'إرسال بريد وتنبيه للمدراء والسائقين بقرب الصيانة لتجهيز بديل وتفادي التوقف المفاجئ.' }
      ],
      toneAr: 'النبرة: دقيقة، علمية، واضحة وقوية الأثر للحد من الهدر التشغيلي.',
      toneEn: 'Tone of voice: Highly structured, exact, and designed to emphasize bottom-line financial impact.',
      imagePrompt: 'A modern clean high-fidelity engine blueprint layout, glowing digital schedule dials and neon calendar highlights, premium white UI elements, soft purple overlays, 4K resolution',
      imageMockUrl: enterpriseFleetDepot,
      longOverviewAr: 'إن جدولة الصيانة الوقائية بناءً على المسافة الفعلية أو الساعات تعد الركيزة الأساسية لوقف نزيف الأموال في الورش. محرك FleetAurvexis يقوم بحساب دورات فحص المحرك، المكابح، الإطارات، وزيت ناقل الحركة ويرسل إشعارات فورية تمنع تفاقم المشاكل البسيطة إلى كوارث تشغيلية مكلفة.',
      longOverviewEn: 'Preventative maintenance scheduling based on actual odometer or engine hours is the single layout to cease heavy wear. FleetAurvexis calculates loops for engines, brakes, transmission oil, and filters, sending warnings before simple wears transform to catastrophic breaks.',
      beforeAfterAr: [
        { before: 'حدوث أعطال مفاجئة ومكلفة للمحركات وتوقف الشاحنات على الطرق الصحراوية بسبب نسيان تغيير الزيوت الدورية.', after: 'إشعارات تلقائية تمنع تجاوز فترات الصيانة بنسبة 100% وتحافظ على صحة المحرك دائماً.' }
      ],
      roadmapAr: [
        'المرحلة الأولى: تحديد الفئات الدورية للصيانة (زيوت، مكابح، فلاتر) لكل فئة مركبات.',
        'المرحلة الثانية: دمج قراءات العداد التلقائية أو إلزام السائقين بتحديثها عند كل غيار وقود.',
        'المرحلة الثالثة: تفعيل التنبيهات المسبقة ومراقبة الامتثال التشغيلي للورش بالكامل.'
      ],
      kpisAr: [
        { label: 'وفر في نفقات الأعطال الطارئة', value: '45% ↓', desc: 'منع انفجار المحركات أو تآكل الفرامل الرئيسي' },
        { label: 'امتثال الصيانة الوقائية بالأسطول', value: '99.4%', desc: 'انخفاض تاريخي في تأجيل مواعيد الفحص الدوري المعتمد' },
        { label: 'تصفير الحالات الميدانية الحرجة', value: '100% أمان', desc: 'تراجع حاد في تعطل الشاحنات على جوانب الطرق السريعة' }
      ]
    },
    {
      id: 'item-2-2',
      type: 'feature',
      nameAr: 'الفحوصات الرقمية والباركود',
      nameEn: 'Digital Inspection & Barcode',
      icon: <CheckSquare size={16} />,
      microCopyAr: 'تحويل النماذج الورقية إلى قوائم تفتيش رقمية مريحة بالهاتف مع إجبارية الباركود للموثوقية',
      microCopyEn: 'Audit machinery and scan barcodes with responsive layout grids',
      fieldReliefAr: 'يقوم الفني بمسح ملصق الباركود على المركبة لإثبات وقوفه الفعلي أمامها لإنهاء التراخي وغياب الرقابة الميدانية.',
      fieldReliefEn: 'Ensures real field presence using QR/Barcode tags placed physically on vehicles to stop lazy office loggers.',
      features: [
        { title: 'رقمنة النماذج بالكامل', desc: 'توليد قوائم الفحص الفوري (فحص الإطارات، السلامة، مستويات السوائل) بسحب وإسقاط بسيط.' },
        { title: 'إثبات الحضور بالباركود', desc: 'لا يسمح ببدء الفحص إلا بعد قراءة رمز المركبة الحقيقي لحماية معايير الحوكمة والنبل.' },
        { title: 'تحويل الحالات إلى تذاكر تلقائياً', desc: 'إذا رصد الفني أي عطل أثناء التفتيش يتم فتحه فوراً كأمر صيانة في الورشة.' }
      ],
      toneAr: 'النبرة: عادلة، منضبطة، تقنية جداً وتلائم العمل الميداني الدقيق.',
      toneEn: 'Tone of voice: Structured, fair, operational, and focused on fieldwork integrity.',
      imagePrompt: 'A technical inspector using a modern mobile application in a clean depot workspace scanning a barcode on a transport van, daylight, realistic 4K capture',
      imageMockUrl: mechanicTruckWorkshop,
      longOverviewAr: 'تضيع جودة الفحص المفرط بسبب الروتين والأوراق حيث يسجل الفني الفحوصات عشوائياً بالاستلقاء على المكاتب. تعيد FleetAurvexis الانضباط لفرق التشغيل بتصميم نماذج ذكية تدعم التقاط الصور، تسجيل الملاحظات الصوتية المباشرة، وقراءة الكود لضمان الفحص الدقيق والنهائي.',
      longOverviewEn: 'Paper checklists encourage false approvals and lack of trackability. FleetAurvexis updates field inspection standards by implementing custom-crafted digital forms supported by photo evidence, voice commentary, and barcode tags for active accountability.',
      beforeAfterAr: [
        { before: 'تقارير فحص مزيفة تُكتب على المكاتب، وحالات تآكل للمكابح تُهمل حتى تقع الكارثة الميدانية.', after: 'فحص إلزامي بالباركود في الميدان لتثبيت الحالات وإصلاح الفجوات الميكانيكية بذكاء فائق.' }
      ],
      roadmapAr: [
        'المرحلة الأولى: حوسبة وبناء قوائم تفتيش الفئات (سلسلة المحركات، الأبواب، الفرامل).',
        'المرحلة الثانية: طباعة الرموز ولصقها ميدانياً على الهياكل والأطراف الأمامية للأصول.',
        'المرحلة الثالثة: قياس امتياز الفنيين وجودة رصد الأعطال المباشرة اليومية بالمنظومة.'
      ],
      kpisAr: [
        { label: 'تقليص تسريبات الفحص اليدوي', value: '100% نجاح', desc: 'حماية كاملة من التقارير التقريبية أو المزيفة' },
        { label: 'متوسط وقت إرسال التقرير', value: '90 ثانية', desc: 'تصميم فائق الراحة بنقرات واجهة تفجر الذكاء والسرعة' },
        { label: 'رصد فوري لعيوب السلامة والتحرك', value: '95% دقة', desc: 'الكشف السريع عن الفواقد والتشققات الدقيقة بالهيكل' }
      ]
    },
    {
      id: 'item-2-3',
      type: 'feature',
      nameAr: 'أوامر العمل وعقود الصيانة',
      nameEn: 'Work Orders & Contracts',
      icon: <Wrench size={16} />,
      microCopyAr: 'توجيه ذكي لأوامر الصيانة وإصدار فواتير دقيقة لربط الفنيين والمستودع بفعالية',
      microCopyEn: 'Dispatch work requests aligned with real-time stock availability',
      fieldReliefAr: 'يربط الفني ومسؤول الورش والعملاء في حلقة برمجية سريعة تصدر أوامر العمل وتحدث تقدم الإصلاح فوراً.',
      fieldReliefEn: 'Directly dispatch tasks with full tracking of mechanic hours and digital signatures.',
      features: [
        { title: 'أوامر صيانة غنية بالتفاصيل', desc: 'إمكانية إضافة أكواد الأعطال، صور الإصلاح، تسجيل الملاحظات الصوتية لضمان الوضوح التام.' },
        { title: 'أتمتة الفواتير وتقدير التكلفة', desc: 'ربط فوري بأسعار قطع الغيار المحدثة وتكلفة ساعات الفنيين لتوليد الفاتورة إلكترونياً.' },
        { title: 'لوحات متابعة ورشية حية', desc: 'مراقبة توزيع المهام وفترات الانتظار ومعدلات إنجاز الإصلاحات لكل فني نشط باليد.' }
      ],
      toneAr: 'النبرة: نشطة، عملية، محوسبة بأعلى مستويات الحوكمة والعدالة الكلية للورش.',
      toneEn: 'Tone of voice: Active, practical, highly governed, and custom-tailored for peak workshop performance.',
      imagePrompt: 'A vibrant professional team of technicians reviewing digital work-orders on screens inside a spacious highly polished repair depot, daylight, 4K resolution',
      imageMockUrl: mechanicTruckWorkshop,
      longOverviewAr: 'تتراكم مشاكل الصيانة وتتأخر بسبب البطء التنظيمي في تعيين المهام في صرف العمال والأجزاء. بفضل FleetAurvexis، يمكنك أتمتة تدفق أوامر العمل، ومراجعة العقود مع الورش المعتمدة، وضمان عدم تمرير أي صيانة عشوائية غير معتمدة أو خارج النطاق القانوني.',
      longOverviewEn: 'Inefficient work dispatch hurts mechanic output and wastes billable time. FleetAurvexis creates a clear interactive bridge that links administrators, field supervisors, and technicians around concrete tasks, parts requisition, and quality audits.',
      beforeAfterAr: [
        { before: 'أوراق صيانة ضائعة، وصرف مفرط لقطع غيار لأعطال لم تخضع للفحص المعتمد الميداني.', after: 'تدفق رقمي مشفر لأوامر الإصلاح مع جرد آلي يحمي الأصول ويصون التنافسية والنزاهة.' }
      ],
      roadmapAr: [
        'المرحلة الأولى: تهيئة فئات الأعطال الشائعة والتحقق والربط بموظفي الورش المتعددة الفروع.',
        'المرحلة الثانية: بناء مسارات الصلاحيات وبدء توجيه المهام الرقمية لكل فني بهاتفه المحمول.',
        'المرحلة الثالثة: مراجعة عقود تكاليف الصيانة وقواعد الاحتساب وتقارير استهلاك الساعات.'
      ],
      kpisAr: [
        { label: 'تقليل فترات انتظار الأصول بالورش', value: '35% ↓', desc: 'تسريع تدفق العمليات وإصدار الموافقات بلمسة واحدة' },
        { label: 'أتمتة حساب ساعات العمل للفنيين', value: '100% دقة', desc: 'تتبع نزيه وحماية لحقوق الموظفين وملاك الأعمال' },
        { label: 'معدل رضا الملاك وقادة الرحلات', value: '98.9%', desc: 'شفافية كاملة لتتحديثات الإصلاح والإنجاز الفوري بالدقيقة' }
      ]
    },
    {
      id: 'item-2-4',
      type: 'feature',
      nameAr: 'قائمة مستودع وجرد قطع الغيار',
      nameEn: 'Spare Parts Ledger',
      icon: <Layers size={16} />,
      microCopyAr: 'توفير التوازن المثالي في مستودعات الورش ومنع تكرار المشتريات وهدر أصول قطع الغيار',
      microCopyEn: 'Keep parts storage balanced and synchronized directly with active work orders',
      fieldReliefAr: 'ربط رقمي يمنع سحب قطع الغيار من المستودع لمركبات وهمية أو غير نشطة لإنهاء الفاقد المالي.',
      fieldReliefEn: 'Safely records every single spare part in stock and maps it directly to a verified vehicle serial number.',
      features: [
        { title: 'جرد إلكتروني بالباركود', desc: 'مسح القطع بالهاتف عند الدخول أو الخروج وتحديث المنسوب الكلي للمستودعات تلقائياً.' },
        { title: 'رصد تكرار الصرف المالي', desc: 'تنبيه ذكي للمدير المالي عند طلب قطعة غيار لسيارة تم تغيير ذات الجزء لها منذ فترة قريبة.' },
        { title: 'مؤشرات إعادة الطلب التلقائي', desc: 'ضبط كمية أمان للمستودع، ليقوم النظام بإرسال إشعارات لتثبيت مستويات المخزون.' }
      ],
      toneAr: 'النبرة: دقيقة، استثمارية، منظمة وتحقق وفر اقتصادي مبهر لمدراء مخازن الأساطيل.',
      toneEn: 'Tone of voice: Precise, financial-focused, highly ordered, and built to avoid stock leakages.',
      imagePrompt: 'A vast clean industrial warehouse shelves neatly organized with high contrast boxes and tech labels, soft yellow lighting highlights, 4K resolution',
      imageMockUrl: enterpriseFleetDepot,
      longOverviewAr: 'تعتبر مخازن قطع الغيار من أكثر الثغرات التي تتسرب منها أموال قادة الأساطيل بلا حسيب. يقدم FleetAurvexis سجلاً برمجياً فائق الدقة، يربط كل صامولة وإطار وفلتر بالرقم التسلسلي للمركبات، مما يمنع السحب العشوائي أو المفقود ويؤطر الإنفاق في قنواته المشروعة والاستثمارية الصحيحة.',
      longOverviewEn: 'Stock rooms represent massive unused capital which easily leaks out due to lack of item traceability. FleetAurvexis offers a smart parts ledger requiring that every filter, tire, or fuse be linked with a specific vehicle VIN, ensuring total financial control.',
      beforeAfterAr: [
        { before: 'مخزون مهمل وفجوات بالجرد اليدوي، وشراء مستعجل لقطع متوفرة بالفعل تحت أكوام الغبار والنسيان.', after: 'وضوح متكامل للمخزون بلمسة واحدة، وإشعار فوري لكميات الأمان مع توقف الاستهلاك المالي العشوائي.' }
      ],
      roadmapAr: [
        'المرحلة الأولى: حصر كافة قطع الغيار المتوفرة بالمستودعات ورفعها بواسطة ملفات إكسل ممركزة لثوانٍ.',
        'المرحلة الثانية: تعيين مستويات وتنبيهات إعادة الطلب التلقائي وربط رموز الباركود بالمسئولين.',
        'المرحلة الثالثة: دمج فواتير الصيانة وحوسبة التقارير المالية للقطع المستبدلة بدقة وشفافية.'
      ],
      kpisAr: [
        { label: 'وفر في تكاليف الشراء الطارئ لقطع غيار', value: '28% وفر', desc: 'القضاء على الشراء المزدوج وغير المحسوب للمستودعات' },
        { label: 'دقة مطابقة جرد قطع الغيار بالباركود', value: '99.8%', desc: 'تلاشي التناقضات والفجوات الإحصائية السنوية بلحظات' },
        { label: 'تقليص فترات تجميد الآلاف من الأصول', value: '40% ↓', desc: 'توفر القطع الحرجة ومستلزمات الصيانة اللاصقة فوراً بقنواتها' }
      ]
    },
    {
      id: 'item-2-5',
      type: 'feature',
      nameAr: 'إدارة أصول الأسطول الفني',
      nameEn: 'Fleet Asset Management',
      icon: <Users size={16} />,
      microCopyAr: 'إدارة شاملة لدورة حياة كل مركبة ومعدة فنية لرفع الكفاءة وحساب التكلفة بدقة تامة',
      microCopyEn: 'Track active vehicles, and safety validation statuses cleanly across any layout',
      fieldReliefAr: 'تحكم متكامل بالوثائق، الاستهلاكات، الفحص، وتعين السائقين لتلافي غرامات الرخص غير النشطة.',
      fieldReliefEn: 'Never miss vehicle insurance or registration expiry with clear proactive dashboard warnings.',
      features: [
        { title: 'أرشفة شاملة لوثائق الأصول', desc: 'حفظ مستندات (الاستمارة، الفحص، التأمين) مع جدولة وتنبيهات مجددة للاستحقاق قبل انقضائه.' },
        { title: 'تخصيص وإسناد السائقين', desc: 'تتبع مباشر لمن يستقل أي آلية تشغيلية لتسهيل المحاسبة والمسؤولية والنزاهة.' },
        { title: 'مراقبة التكلفة والعدادات', desc: 'لوحة تفصيلية لجميع نفقات المركبة وتكلفة تشغيل كل كيلومتر لتقييم الاحتفاظ أو الاستغناء.' }
      ],
      toneAr: 'النبرة: إدارية، منظمة، محترفة ومحببة للشركات الراغبة في السيطرة الإدارية الكاملة.',
      toneEn: 'Tone of voice: Structured, administrative, objective, and oriented to overall asset lifecycle stability.',
      imagePrompt: 'A fleet of modern logistics trucks and passenger vans lined up perfectly outside a sleek digital hub, soft blue evening light, premium photorealistic render, 4K resolution',
      imageMockUrl: enterpriseFleetDepot,
      longOverviewAr: 'إن تتبع الأصول الفنية في الشركات يقتضي تضافر جهود التشغيل والمالية والإدارة. توفر منصتنا مستودعاً برمجياً واحداً يحتوي على السيرة التاريخية لكل مركبة (تاريخ الشراء، عقود الـ SLA، التأمين، الأعطال، الفني المباشر)، مما يتيح للإدارة العليا رؤية شاملة وتخطيطاً استثمارياً صائباً يخلو من العشوائية والحدس الزائد.',
      longOverviewEn: 'Managing distributed technical vehicles demands extreme coordination. FleetAurvexis creates a centralized system of record harboring the comprehensive lifecycle of every machinery block, preventing document lapses and optimizing operations.',
      beforeAfterAr: [
        { before: 'غرامات مالية بسبب نسيان تجديد وثائق المركبات، وغياب كلي للتكلفة التشغيلية الحقيقية لكل شاحنة.', after: 'تنبيهات فورية مرئية للوثائق، وحساب تلقائي لكلفة كم السير وتخصيص آمن للسائقين طوال الساعة.' }
      ],
      roadmapAr: [
        'المرحلة الأولى: أرشفة هياكل ورخص المركبات والآليات وإدخال فترات انتهاء الوثائق المخصصة بلحظات.',
        'المرحلة الثانية: بناء قواعد الرصد وتعيين العدادات لربطها بجدولة الخدمات والوقود بدقة تشغيلية.',
        'المرحلة الثالثة: توليد الفواتير ومقارنة نفقات المركبات معاً وتجميد غير المستدام منها للغد.'
      ],
      kpisAr: [
        { label: 'تقليل نفقات تجديد وثائق المركبات والجزاءات', value: '100% أمان', desc: 'تنبيهات مسبقة تقتل تأخير فحص الاستمارات تماماً' },
        { label: 'متوسط استدامة واستخدام السائق اليومي', value: '95% كفاءة', desc: 'قنوات ربط السائقين تمنع التراخي والتحمل العشوائي للأصول' },
        { label: 'زيادة العمر التشغيلي للشاحنة بالتتبع والوقاية', value: '25% ↑', desc: 'عناية مستقرة تمهد السلامة الكلية للأصول الثقيلة للمستقبل' }
      ]
    },
    {
      id: 'item-2-6',
      type: 'feature',
      nameAr: 'أتمتة العمليات وحوكمة الامتثال',
      nameEn: 'Ecosystem Compliance Audit',
      icon: <ShieldCheck size={16} />,
      microCopyAr: 'أتمتة ذكية تلغي المعاملات الورقية وتفرض قواعد حوكمة صارمة تضمن الالتزام وتخفض الأخطاء',
      microCopyEn: 'Automate physical tasks and secure audit logging to prevent operations leaks',
      fieldReliefAr: 'إغلاق الثغرات المالية اللوجستية ومنع غش الوقود عبر التحول الرقمي الشامل لجميع أنشطة الورش.',
      fieldReliefEn: 'No more unauthorized fluid changes or fake repairs with automated cloud-based sign-offs.',
      features: [
        { title: 'أتمتة دورة الموافقات الرقمية', desc: 'إمكانية تحديد قيود وحدود موازنات الصيانة مع طلب تعيين موافقة فورية من المدراء رقمياً.' },
        { title: 'لوحات النزاهة ورصد الهدر اللوجستي', desc: 'رصد فوري لتعاملات الوقود ومخزون قطع الغيار بفضل سجلات التدقيق والامثتال اللوحية الآمنة.' },
        { title: 'سجل نشاط رقمي بالكامل (Logs)', desc: 'تثبيت وحماية كافة عمليات المنظومة وسلوك الأعضاء للرجوع القانوني عند الحاجة.' }
      ],
      toneAr: 'النبرة: حوكمية، صارمة، هندسية، توقظ الثقة الإدارية وتضمن جودة النزاهة والعمل.',
      toneEn: 'Tone of voice: Structured, governing, rigorous, and perfect for ensuring massive operational audit trails.',
      imagePrompt: 'A glowing secure database server isometric, dynamic glowing wires, modern clean dark UI overlay with glowing ticks, 4K resolution render',
      imageMockUrl: enterpriseFleetDepot,
      longOverviewAr: 'تنتج الكثير من الفواقد اللوجستية من تغييب المستندات والاعتماد على الموافقات اللفظية التي تصعب مراجعتها مالياً. توفر FleetAurvexis ركائز أتمتة ممتازة، تلتزم بقواعد محددة (مثل: لا يمكن شراء قطعة إذا كانت متوفرة بالمخزن، ولا وقود قبل إثبات قراءة العداد الفعلي للسيارة)، تكرس الحوكمة الكاملة بجميع ريالات التشغيل.',
      longOverviewEn: 'Lack of systematic compliance causes severe leakages in maintenance projects. FleetAurvexis solves this structural issue by creating solid, event-driven approval workflows that enforce administrative guardrails before money leaves.',
      beforeAfterAr: [
        { before: 'موافقات شفهية عشوائية وتجاوز مستمر للموازنات التشغيلية وهدر مستمر بمستندات وهمية وصرف عابر.', after: 'حوكمة صارمة ومؤتمتة بالمنصة، وسلسلة موافقات رقمية فورية تحفظ النزاهة وترتب المصاريف بدقة لثوانٍ.' }
      ],
      roadmapAr: [
        'المرحلة الأولى: حصر قواعد القيود والامتيازات والصلاحيات ومسارات التوقيع المالي والطلبات المباشرة.',
        'المرحلة الثانية: بناء الفحوص الرقمية الإجبارية وإعداد أدلة حماية الديزل ومنع التزييف المكتبي والورقي.',
        'المرحلة الثالثة: تفعيل السجلات المشفرة واستخراج تقارير الامتثال وقفل الميزانيات بدقة وعمق تشغيلي.'
      ],
      kpisAr: [
        { label: 'نسبة القضاء على التسريب والتبذير التشغيلي', value: '100% حسم', desc: 'لا يسمح بإنفاق ريال واحد خارج قنوات الامتثال المعتمدة' },
        { label: 'تقليص السلوك المكتبي المفقود للموظفين بالورشة', value: '25% ↓', desc: 'انظباط شامل للفنيين بفضل سلاسل الموافقات الفورية المريحة لثوانٍ' },
        { label: 'دقة وتأمين سجل التدقيق الجنائي الموحد', value: '100% مشفر', desc: 'تسجيل غير قابل للتحوير لكافة التغييرات وسحب المخزون' }
      ]
    },
    {
      id: 'item-2-7',
      type: 'feature',
      nameAr: 'إدارة المعدات الثقيلة والخفيفة',
      nameEn: 'Heavy & Light Equipment',
      icon: <Building2 size={16} />,
      microCopyAr: 'حلول متكاملة لرفع كفاءة الحفارات، الرافعات، المولدات والآليات الميدانية بناءً على ساعات تشغيل المحرك',
      microCopyEn: 'Maximize heavy machinery lifespan in severe physical environments',
      fieldReliefAr: 'جدولة دقيقة للتفتيش والتأمين والصيانة لمواقع الإنشاءات لضمان بقاء المشاريع على مسار الإنتاج التشغيلي المربح.',
      fieldReliefEn: 'Shift heavy equipment maintenance calendars from days to actual engine running hours (meter).',
      features: [
        { title: 'عدادات ساعات المحرك (Hours)', desc: 'وداعاً للتقديرات التقويمية؛ الخدمة والصيانة الوقائية تتم على ساعات دوران المحركات الفعلية بكل دقة.' },
        { title: 'لوحة تحكم الأصول الثابتة والمولدات', desc: 'متابعة كفاءة وقود المولدات ومراقبتها كلياً لمنع تسرب الديزل وحصار تآكل الأجزاء بالمشروعات الصحراوية.' },
        { title: 'تنبيهات الضغط والتدفق الهيدروليكي', desc: 'تقارير فحص هيدروليكية وعجائن فرامل دقيقة تعزل مخاطر الانفجار والصيانة الطارئة للأوناش البرحية.' }
      ],
      toneAr: 'النبرة: حيوية، صلبة وميدانية، تساعد فرق مشاريع البناء على حماية سلاسل الإنتاج والأرباح بنجاح صلب.',
      toneEn: 'Tone of voice: Robust, industrial-focused, highly reliable, and built to survive severe construction climates.',
      imagePrompt: 'A rugged yellow construction hydraulic bulldozer scoop in a clean site, glowing neon lines of diagnostic signals around, photorealistic 4K resolution',
      imageMockUrl: constructionHeavyMachinery,
      longOverviewAr: 'تختلف الصيانة الوقائية للمعدات الثقيلة (كالبلدوزرات والمولدات والرافعات الفنية) اختلافاً جذرياً عن السيارات التجارية، فـ ٣٠ يوماً في المستودع ليست كـ ٣٠ ساعة تشغيل محرك شاق. يتبنى FleetAurvexis أساليب الحوسبة المعتمدة على العداد الفعلي ومستويات الضغط الهيدروليكي وإلزام السائق بفحص سوائل التبريد يومياً لتجنب تعطل العمل المفاجئ والمكلف.',
      longOverviewEn: 'Heavy equipment cannot rely on normal calendar dates since machine stress is strictly tied to actual operation engine hours. FleetAurvexis creates a solid environment that schedules lubrication and filter swappings based on real running hours.',
      beforeAfterAr: [
        { before: 'تعطل مفاجئ لحفار بموقع البناء يوقف العشرات من عمال الحفر ويكلف آلاف الريالات يومياً تشمل الفني والقطع.', after: 'صيانة استباقية دقيقة ترسل إخطارات بالفلتر والزيوت قبل انتهاء دورتها، وتصفير احتمالات التوقف وسط العمل.' }
      ],
      roadmapAr: [
        'المرحلة الأولى: حصر المعدات الثابتة والآليات الثقيلة والخفيفة مع تحديد نوع العداد والوقود بدقة.',
        'المرحلة الثانية: بناء نماذج معايير فحص العمال والمهندسين وجدولة فترات تتبع الضغط الهيدروليكي السنوي.',
        'المرحلة الثالثة: التكامل الرقمي لمطابقة الوقود المستهلك بكفاءة العمل لرفع منسوب الربحية والأمان التشغيلي.'
      ],
      kpisAr: [
        { label: 'رفع جاهزية المعدات الثقيلة والرافعات', value: '45% ↑', desc: 'معدلات تواجد تشغيلي مستقر يسرع عمليات البناء' },
        { label: 'توفير ميزانية صيانة الهيدروليك والمحرك', value: '30% وفر', desc: 'بفضل التدخل والصيانة المنهجية المسبقة لأجزاء الآلات' },
        { label: 'معدل الحفاظ على العمر الافتراضي الكلي', value: '35% زيادة', desc: 'إطالة الاستفادة من الأصول الباهظة طوال أعوام قادمة للشركات الرواد' }
      ]
    },
    {
      id: 'item-2-8',
      type: 'feature',
      nameAr: 'أدوات الفحص والتحقق وطباعة QR',
      nameEn: 'Daily Inspection & QR Label',
      icon: <CheckSquare size={16} />,
      microCopyAr: 'طباعة فورية للملصقات الذكية ورموز الـ QR لتسريع وتسهيل عمليات الفحص الصباحي بالفروع',
      microCopyEn: 'Print barcode labels, generate custom QR codes, and prepare mobile walkarounds',
      fieldReliefAr: 'يوفر ملصق باركود مقاوم للمناخ الصحراوي يلصق على الأبواب وخزان الوقود لإلزام الفحص الفعلي بلمحة.',
      fieldReliefEn: 'Print heavy-duty weather-resistant QR stickers to bind inspection forms directly onto vehicle doors.',
      features: [
        { title: 'تحميل وطباعة ملصقات الـ QR', desc: 'مولد رموز ذكي يتيح طباعة وتوليف كود تفتيش مخصص لكل حافلة بضغطة زر واحدة بالمنصة.' },
        { title: 'تسهيل تتبع كشك الفحص الذاتي للتنظيف والفرامل', desc: 'بوابة ويب محسنة بالكامل للهواتف لتمكين السائقين من مسح الرمز وإرسال السلامة بثلاث لحظات سريعة.' },
        { title: 'التكامل مع تذاكر الأعطال للورش', desc: 'سلطة توجيه ذكي للمدراء تنشئ تذكرة ورشية صيانة فورية لأي خلل مرسل من السائقين بالطريق المفتوح.' }
      ],
      toneAr: 'النبرة: مطمئنة، ودودة، عملية تسعى لجعل حياة السائقين أكثر سهولاً ومجندة لسلامة الطريق الكلية.',
      toneEn: 'Tone of voice: Warm, reassuring, precision-focused, and engineered to assist transport operators.',
      imagePrompt: 'A glossy modern printer dispensing a fresh crisp custom QR code label sticker with clean vector graphics, soft glowing lights, white tech design',
      imageMockUrl: municipalCleanFleet,
      longOverviewAr: 'لا يحتاج الفحص الصباحي الروتيني لمعاملات معقدة؛ كل ما يحتاجه السائق هو هاتفه الشخصي وملصق QR ذكي بجانب باب المركبة. بنقرة واحدة بالهواتف المحمولة يرسل السائق تقريراً بـ (أمان الفرامل، المصابيح، سلامة الأبواب والحافلات) لبناء حلقة طمأنينة متكاملة وذات مسؤولية واضحة تضمن نزاهة والإنتاج والتشغيل.',
      longOverviewEn: 'Morning safety vehicle walkarounds shouldn’t require complex hardware. Our customized weather-proof QR stickers placed near assets empower screen drivers to instantly scan, complete standard checks, and update statuses.',
      beforeAfterAr: [
        { before: 'حافلات تتحرك دون فحص، ومكابح أو أضواء تالفة تفاجئ السائقين وسط الطريق وتسبب الحوادث والتعطل التشغيلي الباهظ.', after: 'فحص سريع بالباركود يضمن الأمان الميداني ويبعث الاستقرار والراحة في نفوس الملاك والمدارة.' }
      ],
      roadmapAr: [
        'المرحلة الأولى: تحميل وتجهيز رموز الـ QR التبادلية من لوحة الإعدادات وربطها بالأصول النشطة لدينا.',
        'المرحلة الثانية: لصق الرموز المقاومة للحر والرطوبة على مصدّات السيارات وحواف الخزانات الوقودية بدقة هندسية.',
        'المرحلة الثالثة: انطلاق الفحص وتعميم كشك السائق لإرسال الفحوصات وتحديث قراءات الصيانة اليومية بالمنظومة.'
      ],
      kpisAr: [
        { label: 'انضباط السائقين بالفحص الصباحي العملي اليومي', value: '100%', desc: 'تراجع حاد لغياب أو تجاهل الفحص اليومي للطرق والرحلات' },
        { label: 'سرعة المتابعة والتحقق الميداني المباشر بالأصل الفني', value: '3 ثوانٍ', desc: 'مسح فوري يفتح صفحة الفحص المريحة من المتصفح بلحظات بسيطة ومريحة' },
        { label: 'إجمالي تقليص إصابات وأضرار حوادث الطرق بالمركبات', value: '45% ↓', desc: 'بفضل الكشف والتنبؤ المبكر بأي تآكل في الأجزاء الهامة بالأسفار' }
      ]
    },
    {
      id: 'about-company',
      type: 'company',
      nameAr: 'نبذة عن شركة FleetAurvexis',
      nameEn: 'About FleetAurvexis',
      icon: <Building2 size={16} />,
      microCopyAr: 'المنظومة السحابية المتكاملة لإدارة صيانة وحوكمة الأساطيل ومستودعات قطع الغيار',
      microCopyEn: 'Enterprise cloud fleet maintenance, diagnostics and multi-warehouse supply chain',
      fieldReliefAr: 'شركة رائدة تبتكر برمجيات الحوسبة السحابية (SaaS) والذكاء الاصطناعي لإدارة الأساطيل والورش الميكانيكية.',
      fieldReliefEn: 'A leading deep-tech SaaS enterprise specializing in cloud fleet maintenance and AI diagnostic systems.',
      features: [
        { title: 'الذكاء الاصطناعي التشخيصي', desc: 'تحويل أكواد الأعطال OBD-II إلى خطط إصلاح فورية دقيقة.' },
        { title: 'فحص الباركود والـ QR الميداني', desc: 'ملصقات ذكية مقاومة للحرارة لإلزام الفحص اليومي دون أوراق.' },
        { title: 'حوكمة المخزون وقطع الغيار', desc: 'ربط القطع المصروفة بالرقم التسلسلي للمركبة لمنع الهدر والتسريب.' }
      ],
      toneAr: 'النبرة: مؤسسية، ريادية، هندسية، وموثوقة بأعلى المعايير العالمية.',
      toneEn: 'Tone of voice: Enterprise, visionary, authoritative, and trusted globally.',
      imagePrompt: 'A futuristic clean fleet enterprise control room, daytime bright light, professional operator looking at digital screens with purple and blue flowcharts',
      imageMockUrl: enterpriseFleetDepot,
      longOverviewAr: 'شركة FleetAurvexis رائدة الحلول التقنية السحابية في إدارة الأساطيل، صيانة المعدات الثقيلة، والربط الذكي لسلاسل إمداد قطع الغيار في الشرق الأوسط.',
      longOverviewEn: 'FleetAurvexis is the leading cloud-native fleet maintenance and AI diagnostics software enterprise across the region.',
      kpisAr: [
        { label: 'المركبات والآليات المدارة بالمنظومة', value: '+45,000', desc: 'أسطول نشط من الشاحنات والمعدات الثقيلة' },
        { label: 'متوسط خفض التكاليف التشغيلية', value: '30% ↓', desc: 'وفر مالي موثق من ميزانيات الصيانة والوقود' },
        { label: 'نسبة منع تسريب قطع الغيار', value: '99.4%', desc: 'بفضل الربط المباشر برقم الهيكل وأمر العمل' }
      ]
    }
  ];

  const currentSol = solutions.find(s => s.id === activeTab) || solutions[0];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed inset-0 z-50 bg-white flex flex-col w-screen h-screen overflow-hidden text-slate-800 font-sans"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Floating Close Button with Backdrop Blur & Clean Border */}
        <button
          type="button"
          onClick={onClose}
          className="fixed top-5 z-50 p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-950 text-white backdrop-blur-md flex items-center justify-center border border-white/10 hover:border-indigo-400 transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95 group"
          style={{ [isRtl ? 'left' : 'right']: '1.5rem' }}
          title={isRtl ? 'إغلاق والعودة للرئيسية' : 'Close and return'}
        >
          <X size={18} className="transition-transform group-hover:rotate-90 duration-300" />
        </button>

        {/* 🌟 PREMIUM HORIZONTAL SEGMENT SELECTOR (7 SECTORS) - Light Paper Aesthetic */}
        <div className="bg-[#FAF9F6] border-b border-slate-200/90 py-3.5 px-4 md:px-8 z-40 shrink-0 sticky top-0 shadow-xs">
          <div className="max-w-6xl mx-auto flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between text-right">
            
            {/* Header label */}
            <div className="flex items-center gap-2 justify-end md:justify-start">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse hidden md:inline-block" />
              <span className="text-[11px] font-black tracking-wide text-indigo-700 uppercase font-mono">
                {currentSol.type === 'feature'
                  ? (isRtl ? 'أقسام وميزات الصيانة والتشغيل:' : 'EXPLORE SYSTEM MODULE PORTFOLIO:')
                  : (isRtl ? 'اختر القطاع الذي تبحث عن حلول لتطويره:' : 'CHOOSE THE SECTOR BLUEPRINT TO EXPLORE:')}
              </span>
            </div>

            {/* Scrollable 7 sectors layout */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none justify-start md:justify-end flex-row-reverse" style={{ WebkitOverflowScrolling: 'touch' }}>
              {solutions.map((sol) => {
                const isActive = activeTab === sol.id;
                return (
                  <button
                    key={sol.id}
                    onClick={() => setActiveTab(sol.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer border ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 text-white border-transparent shadow-md hover:opacity-90'
                        : 'bg-white text-slate-600 hover:text-indigo-650 border-slate-200/80 hover:border-indigo-300/60 shadow-3xs'
                    }`}
                  >
                    {sol.icon}
                    <span>{isRtl ? sol.nameAr : sol.nameEn}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* SCROLLABLE INNER PAGE AREA */}
        <div id="showcase-scroll-container" className="flex-1 overflow-y-auto bg-slate-50/50">
          
          {/* TAB 1: owners - THE CORE COMPREHENSIVE LANDING PAGE AS SPECIFIED */}
          {activeTab === 'owners' && (
            <div className="animate-fade-in">
              
              {/* 🚀 ELITE HERO BANNER - With specific requested photo requirements */}
              <div className="relative bg-[#0f1424] overflow-hidden shrink-0 border-b border-slate-200/80">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-indigo-950/60 z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1563720223185-11003d516935?w=1600&auto=format&fit=crop&q=80" 
                  alt="Fleet owner managing digital logistics dashboard" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />
                
                <div className="max-w-6xl mx-auto px-6 py-14 sm:py-20 md:py-24 relative z-20 flex flex-col md:flex-row items-center gap-8 md:gap-14">
                  <div className="flex-1 text-right space-y-4 md:space-y-6" dir="rtl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-[10px] font-black uppercase font-mono tracking-wider">
                      <Sparkles size={11} className="text-indigo-400" />
                      <span>{isRtl ? 'الحل لمالكي الأساطيل • دليل فني متاح كصفحة كاملة' : 'PREMIUM FULL ARTICLE DISPLAY'}</span>
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                      {isRtl 
                        ? 'كيف تخفض تكاليف تشغيل أسطولك بنسبة تصل إلى 30٪ وتحسن الإنتاجية؟' 
                        : 'How to reduce fleet operating costs by up to 30% and improve productivity?'}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
                      {isRtl 
                        ? 'تعرف على كيفية استخدام الأنظمة الذكية لإدارة الأساطيل والصيانة الوقائية وتقليل الأعطال المفاجئة وتحسين استهلاك الوقود ورفع كفاءة التشغيل بلغة تصميم SaaS تضاهي أفضل المواقع العالمية.'
                        : 'Learn how to use smart systems for fleet management, preventative maintenance, breakdown reductions, fuel savings, and operation speed.'}
                    </p>
                    <div className="flex flex-wrap gap-4 pt-3 justify-start" style={{ flexDirection: 'row-reverse' }}>
                      <button
                        type="button"
                        onClick={onStartTrial}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
                      >
                        {isRtl ? 'ابدأ الآن' : 'Start Trial Now'}
                      </button>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[11px] text-slate-200 font-bold">{isRtl ? 'مستند الأساطيل المعتمد لعام 2026' : 'Certified 2026 Release'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top featured mockup illustration of fleet manager dashboard */}
                  <div className="w-full md:w-85 lg:w-[420px] shrink-0 relative mt-6 md:mt-0">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000" />
                    <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
                      <img 
                        src="https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=600&auto=format&fit=crop&q=80" 
                        alt="Fleet manager reviewing performance analytics" 
                        className="w-full h-56 object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                      <div className="p-4 bg-slate-950/95 text-right border-t border-slate-800">
                        <span className="text-[9px] font-black text-indigo-400 block mb-0.5">{isRtl ? 'لقطة ميدانية • إدارة أداء الأسطول والعدادات' : 'FIELD CAPTURE • MODERN WORKSPACE'}</span>
                        <p className="text-[11px] font-bold text-white">{isRtl ? 'مدير الأسطول يراقب استهلاك الوقود وأكواد الأعطال رقمياً.' : 'Fleet operator tracking fuel and cylinder codes on-screen.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MAIN BODY GRID - 666px max margin style */}
              <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 md:px-8 space-y-20">

                {/* 🔴 SECTION 1: THE PROBLEM (قسم المشكلة - التحديات اليومية التي تواجه مالكي الأساطيل) */}
                <div className="space-y-8 text-right" dir="rtl">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-100/80 px-2.5 py-1 text-rose-700 rounded-full text-[10px] font-black uppercase font-mono tracking-wider">
                      <AlertTriangle size={11} className="text-rose-600" />
                      <span>{isRtl ? 'تحديات القطاع التشغيلية' : 'OPERATIONAL PAIN POINTS'}</span>
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                      التحديات اليومية التي تواجه مالكي الأساطيل
                    </h3>
                    <p className="text-xs text-slate-400 font-bold leading-normal">
                      تواجه الشركات صعوبات في الحفاظ على السلامة وضبط تكلفة السيارات ومستودع الغيار، وتتلخص في 4 نقاط رئيسية:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-3">
                    {/* Problem card 1 */}
                    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:border-slate-350 transition-all">
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-bold">
                          ⚠️
                        </div>
                        <h4 className="text-sm font-black text-slate-900">الأعطال المفاجئة</h4>
                        <p className="text-[11.5px] text-slate-500 font-bold leading-normal">تسبب توقف المركبات في الميدان وخسارة الوقت وزيادة كبيرة في مصاريف الورش.</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 mt-4">
                        <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Loss multiplier: High</span>
                      </div>
                    </div>

                    {/* Problem card 2 */}
                    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:border-slate-350 transition-all">
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center font-bold">
                          ⛽
                        </div>
                        <h4 className="text-sm font-black text-slate-900">ارتفاع تكاليف الوقود</h4>
                        <p className="text-[11.5px] text-slate-500 font-bold leading-normal">يصعب مراقبة الاستهلاك وهدر الديزل بدقة دون ربط متكامل مع عدادات المسافة.</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 mt-4">
                        <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Loss multiplier: Med</span>
                      </div>
                    </div>

                    {/* Problem card 3 */}
                    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:border-slate-350 transition-all">
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
                          🔧
                        </div>
                        <h4 className="text-sm font-black text-slate-900">ضعف متابعة الصيانة</h4>
                        <p className="text-[11.5px] text-slate-500 font-bold leading-normal">يؤدي إهمال الفحوصات والزيوت لتقليص عمر المعدات واستبدال أصول باهظة مبكراً.</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 mt-4">
                        <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Loss multiplier: Severe</span>
                      </div>
                    </div>

                    {/* Problem card 4 */}
                    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:border-slate-350 transition-all">
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center font-bold">
                          📊
                        </div>
                        <h4 className="text-sm font-black text-slate-900">صعوبة مراقبة الأداء</h4>
                        <p className="text-[11.5px] text-slate-500 font-bold leading-normal">نقص البيانات الدقيقة لإصدار الفواتير وتحسين سلوكيات السائقين في الطريق.</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 mt-4">
                        <span className="text-[9.5px] text-slate-400 font-mono font-bold uppercase">Loss multiplier: Med</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🟢 SECTION 2: THE SOLUTION (كيف يساعدك النظام؟ مع لوحة تحكم ذكية وصورة ديمو واقعية) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAF9F6] border border-slate-200/90 p-6 sm:p-8 md:p-10 rounded-3xl shadow-xs" dir="rtl">
                  <div className="lg:col-span-5 space-y-5 text-right">
                    <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 px-3 py-1 text-indigo-700 rounded-full text-[10px] font-black uppercase font-mono tracking-wider">
                      <Activity size={11} className="text-indigo-600" />
                      <span>{isRtl ? 'الحل الرقمي المتكامل' : 'UNIFIED PLATFORM SOLVE'}</span>
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                      كيف يساعدك النظام؟
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 font-bold leading-relaxed">
                      يقوم النظام بجمع جميع بيانات الأسطول والورش في لوحة تحكم واحدة ممتازة تمكن المدير والملاك من اتخاذ قرارات أسرع وأكثر ملاءمة وأكثر ربحية على المدى الطويل.
                    </p>

                    {/* Mini simulated dashboard indicators representing actual values requested */}
                    <div className="grid grid-cols-2 gap-3.5 pt-3">
                      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-3xs">
                        <span className="text-[9.5px] text-slate-400 font-bold block mb-1">إجمالي أصول الأسطول</span>
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-bold text-slate-500">منظومة نشطة</span>
                          <span className="text-base font-black text-indigo-600 font-mono">145 +</span>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-3xs">
                        <span className="text-[9.5px] text-slate-400 font-bold block mb-1">المركبات المتعطلة بالورشة</span>
                        <div className="flex justify-between items-baseline">
                          <span className="text-[9.5px] text-emerald-600 font-bold">تراجع 40%</span>
                          <span className="text-base font-black text-slate-900 font-mono">2</span>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-3xs">
                        <span className="text-[9.5px] text-slate-400 font-bold block mb-1">نفقات قطع الغيار والصيانة</span>
                        <div className="flex justify-between items-baseline">
                          <span className="text-[9.5px] text-emerald-600 font-bold">وفر كبير</span>
                          <span className="text-sm font-black text-amber-600 font-mono">35% ↓</span>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-3xs">
                        <span className="text-[9.5px] text-slate-400 font-bold block mb-1">أوامر العمل والمهام المفتوحة</span>
                        <div className="flex justify-between items-baseline">
                          <span className="text-[9.5px] text-indigo-600 font-bold">بوابة السائقين</span>
                          <span className="text-sm font-black text-indigo-600 font-mono">5 {isRtl ? 'نشط' : 'Active'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* High Quality Photo Realistic Dashboard Preview with manager analyzing */}
                  <div className="lg:col-span-7 relative">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-100 rounded-full blur-3xl pointer-events-none -z-10" />
                    <div className="bg-white border border-slate-200 p-2.5 rounded-2xl shadow-md">
                      <img 
                        src={dashboardMarketingPreview} 
                        alt="Comprehensive cloud fleet SaaS dashboard analytics preview" 
                        className="rounded-xl border border-slate-100 w-full h-auto object-cover max-h-[380px]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                {/* 🔴 SECTION 3: ADVANTAGES (قسم المزايا - 8 بطاقات حديثة) */}
                <div className="space-y-8 text-right" dir="rtl">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-indigo-700 rounded-full text-[10px] font-black uppercase font-mono tracking-wider">
                      <Sparkles size={11} className="text-indigo-600" />
                      <span>{isRtl ? 'حقيبة الميزات الكاملة' : 'SaaS MODULES LIST'}</span>
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                      أهم المزايا والركائز التي تدير عملياتك بكفاءة
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-3">
                    
                    {/* Adv 1 */}
                    <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                      <div className="space-y-2">
                        <span className="text-xl">🚗</span>
                        <h4 className="text-xs font-black text-slate-800">إدارة المركبات</h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">سجل مواصفات متكامل وتتبع ذكي لكل مركبة ومعدة ثقيلة بالمستودع.</p>
                      </div>
                    </div>

                    {/* Adv 2 */}
                    <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                      <div className="space-y-2">
                        <span className="text-xl">🔧</span>
                        <h4 className="text-xs font-black text-slate-800">إدارة الصيانة</h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">جدولة تلقائية ومثالية للصيانة الوقائية والتصحيحية لحماية الأصول.</p>
                      </div>
                    </div>

                    {/* Adv 3 */}
                    <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                      <div className="space-y-2">
                        <span className="text-xl">🛞</span>
                        <h4 className="text-xs font-black text-slate-800">إدارة الإطارات</h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">تتبع دقيق لعمق مداس الإطارات والعمر الافتراضي وكفاءة الأمان.</p>
                      </div>
                    </div>

                    {/* Adv 4 */}
                    <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                      <div className="space-y-2">
                        <span className="text-xl">⛽</span>
                        <h4 className="text-xs font-black text-slate-800">إدارة الوقود</h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">مراقبة ديسك تعبئة الديزل وتتبع معدل الاستهلاك لكل مستفيد.</p>
                      </div>
                    </div>

                    {/* Adv 5 */}
                    <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                      <div className="space-y-2">
                        <span className="text-xl">📦</span>
                        <h4 className="text-xs font-black text-slate-800">إدارة المخزون</h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">جرد قطع الغيار والتحكم بنقاط إعادة الطلب بذكاء بلا عجز بالورش.</p>
                      </div>
                    </div>

                    {/* Adv 6 */}
                    <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                      <div className="space-y-2">
                        <span className="text-xl">👥</span>
                        <h4 className="text-xs font-black text-slate-800">إدارة الفرق الفنية</h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">توزيع أذونات العمل ومتابعة كفاءة إنتاجية الميكانيكيين يوميًا.</p>
                      </div>
                    </div>

                    {/* Adv 7 */}
                    <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                      <div className="space-y-2">
                        <span className="text-xl">🧠</span>
                        <h4 className="text-xs font-black text-slate-800">الذكاء الاصطناعي</h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">مساعد ميكانيكي ذكي يقوم بتحليل رموز الأكواد واقتراح الحل الصيانة الفوري.</p>
                      </div>
                    </div>

                    {/* Adv 8 */}
                    <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                      <div className="space-y-2">
                        <span className="text-xl">📊</span>
                        <h4 className="text-xs font-black text-slate-800">التقارير الذكية</h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">لوحات بيانات تشغيلية ومالية لحساب الوفورات وإجمالي الربحية بشكل تلقائي.</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 🔴 SECTION 4: THE RESULTS (عدادات تقدم وفورات الصيانة الملموسة) */}
                <div className="p-6 md:p-10 bg-indigo-950 text-white rounded-3xl space-y-10 relative overflow-hidden" dir="rtl">
                  {/* Decorative faint pattern */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 opacity-90 -z-10" />
                  
                  <div className="text-center max-w-2xl mx-auto space-y-2 relative z-10">
                    <span className="text-[10px] font-black text-indigo-400 font-mono tracking-widest block">REAL PERFORMANCE RESULTS</span>
                    <h3 className="text-xl md:text-2xl font-black text-white">النتائج الفورية التي تحققها الشركات بعد استخدام النظام</h3>
                    <p className="text-xs text-slate-300 leading-normal font-bold">
                      أثبتت الفحوصات الميدانية للآليات في الورش الذكية تراجع الأعطال وباقات الوفورات المالية كالتالي:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-3 relative z-10 text-center">
                    
                    {/* metric 1 */}
                    <div className="space-y-2">
                      <div className="text-3xl md:text-5xl font-black text-emerald-400 font-mono">30% ↓</div>
                      <p className="text-xs font-bold text-slate-200">انخفاض تكاليف الصيانة</p>
                    </div>

                    {/* metric 2 */}
                    <div className="space-y-2">
                      <div className="text-3xl md:text-5xl font-black text-indigo-400 font-mono">40% ↓</div>
                      <p className="text-xs font-bold text-slate-200">تقليل الأعطال المفاجئة</p>
                    </div>

                    {/* metric 3 */}
                    <div className="space-y-2">
                      <div className="text-3xl md:text-5xl font-black text-purple-400 font-mono">45% ↑</div>
                      <p className="text-xs font-bold text-slate-200">رفع إنتاجية الفرق الفنية</p>
                    </div>

                    {/* metric 4 */}
                    <div className="space-y-2">
                      <div className="text-3xl md:text-5xl font-black text-amber-400 font-mono">35% ↑</div>
                      <p className="text-xs font-bold text-slate-200">زيادة العمر التشغيلي للأصول</p>
                    </div>

                  </div>
                </div>

                {/* 🔴 SECTION 5: CUSTOMER TESTIMONIALS (خمس شهادات لمدراء تشغيل حقيقيين بالصناعة) */}
                <div className="space-y-8 text-right" dir="rtl">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-indigo-700 rounded-full text-[10px] font-black uppercase font-mono tracking-wider">
                      <Star size={11} className="text-indigo-600 shrink-0" />
                      <span>{isRtl ? 'قصص شركاء النجاح المعتمدين' : 'VERIFIED GLOBAL CLIENTS'}</span>
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                      ماذا يقول خبراء الأساطيل والتشغيل عنا؟
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-3">
                    
                    {/* Testimonial 1 */}
                    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                      <p className="text-[11.5px] text-slate-650 leading-relaxed font-bold italic mb-4">
                        "ساعدتنا لوحة التحكم في دمج بلاغات السائقين الصوتية من الميدان وتقليص الهدر المالي بالديزل بنسبة 32% خلال شهور معدودة."
                      </p>
                      <div className="flex gap-2.5 items-center border-t border-slate-100 pt-3">
                        <img 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces" 
                          alt="Eng. Abdelrahman" 
                          className="w-8 h-8 rounded-full border border-slate-200"
                        />
                        <div>
                          <h5 className="text-[11px] font-black text-slate-900">م. عبدالرحمن الحربي</h5>
                          <p className="text-[8.5px] text-slate-400 font-bold">رئيس العمليات اللوجستية</p>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                      <p className="text-[11.5px] text-slate-650 leading-relaxed font-bold italic mb-4">
                        "لم نتخيل يوماً أن تصبح صيانة الإطارات الرقمية بهذه السهولة! نقوم بجرد القطع وتتبع العمر التشغيلي بكفاءة بالغة."
                      </p>
                      <div className="flex gap-2.5 items-center border-t border-slate-100 pt-3">
                        <img 
                          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces" 
                          alt="Mr. Khalid" 
                          className="w-8 h-8 rounded-full border border-slate-200"
                        />
                        <div>
                          <h5 className="text-[11px] font-black text-slate-900">أ. خالد العلياني</h5>
                          <p className="text-[8.5px] text-slate-400 font-bold">مدير الخدمات البلدية</p>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 3 */}
                    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                      <p className="text-[11.5px] text-slate-650 leading-relaxed font-bold italic mb-4">
                        "الفحص اليومي بالباركود حمى مستودع الآليات الثقيلة من الأعطال المفاجئة وسهّل عمل الفنيين بالورشة الميدانية بالكامل."
                      </p>
                      <div className="flex gap-2.5 items-center border-t border-slate-100 pt-3">
                        <img 
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=faces" 
                          alt="Eng. Imad" 
                          className="w-8 h-8 rounded-full border border-slate-200"
                        />
                        <div>
                          <h5 className="text-[11px] font-black text-slate-900">م. ياسر القحطاني</h5>
                          <p className="text-[8.5px] text-slate-400 font-bold">مشرف صيانة المعدات</p>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 4 */}
                    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                      <p className="text-[11.5px] text-slate-650 leading-relaxed font-bold italic mb-4">
                        "مساعد الذكاء الاصطناعي الفني ساهم في توفير آلاف الريالات عبر التشخيص الاستباقي لرموز الحاقن والفرامل."
                      </p>
                      <div className="flex gap-2.5 items-center border-t border-slate-100 pt-3">
                        <img 
                          src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=faces" 
                          alt="Dr. Faisal" 
                          className="w-8 h-8 rounded-full border border-slate-200"
                        />
                        <div>
                          <h5 className="text-[11px] font-black text-slate-900">د. فيصل السديري</h5>
                          <p className="text-[8.5px] text-slate-400 font-bold">المستشار التشغيلي العام</p>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 5 */}
                    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                      <p className="text-[11.5px] text-slate-655 leading-relaxed font-bold italic mb-4">
                        "استبدلنا الأوراق تماماً بتطبيق ويب مريح سريع جداً. السائق يستعلم ويرفع تذاكر الصيانة والبلدي بلا أي تدريب مسبق."
                      </p>
                      <div className="flex gap-2.5 items-center border-t border-slate-100 pt-3">
                        <img 
                          src="https://images.unsplash.com/photo-1542435503-956c469947f6?w=80&h=80&fit=crop" 
                          alt="Eng. Sarah" 
                          className="w-8 h-8 rounded-full border border-slate-200"
                        />
                        <div>
                          <h5 className="text-[11px] font-black text-slate-900">م. سارة الجابري</h5>
                          <p className="text-[8.5px] text-slate-400 font-bold">مسؤولة التخطيط والمخازن</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 🔴 SECTION 6: THE PHOTOREALISTIC IMAGE GALLERY (معرض الصور ذو الدقة العالية وميزة نسخ أوامر التوليد) */}
                <div className="space-y-8 text-right" dir="rtl">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="inline-flex items-center gap-1.5 bg-[#FAF9F6] border border-slate-200/80 px-2.5 py-1 text-indigo-700 rounded-full text-[10px] font-black uppercase font-mono tracking-wider">
                      <ImageIcon size={11} className="text-indigo-600 shrink-0" />
                      <span>{isRtl ? 'مكتبة الصور الفنية • دقة 4K واقعية' : 'PHOTOREALISTIC GENERATORS'}</span>
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                      معرض الصور ومحركات توليد الذكاء الاصطناعي للموقع
                    </h3>
                    <p className="text-xs text-slate-500 font-bold leading-normal">
                      انقر على زر "نسخ أمر توليد الصورة" لاستخدامه في برامج Midjourney أو DALL-E والحصول على لقطات نهارية ناصعة تناسب تماماً الهوية البصرية لموقعك الإلكتروني:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-3">
                    {[
                      {
                        title: 'مدير أسطول',
                        img: enterpriseFleetDepot,
                        prompt: 'Photorealistic close-up profile portrait of a modern Arab fleet manager looking at a computer monitor showing vehicle route logistics, bright daytime, soft white and paper theme, elegant light background, cinematic depth of field, 4K resolution --ar 16:9'
                      },
                      {
                        title: 'مركز صيانة',
                        img: mechanicTruckWorkshop,
                        prompt: 'Bright, luxurious and highly organized fleet service maintenance center with polished white floors, natural daytime sunlight streaming from large ceiling glass panes, semi-trucks parked neatly, clean modern workspace layout, highly realistic 3D --ar 16:9'
                      },
                      {
                        title: 'فنيون يعملون على المعدات',
                        img: mechanicTruckWorkshop,
                        prompt: 'Two automotive electrical engineers in uniform diagnosing modern truck engine control units using highly accurate tablet and cables, daytime natural lighting, clean white paper tech vibe, detailed photorealistic --ar 16:9'
                      },
                      {
                        title: 'شاحنات نقل لوجستي',
                        img: highwayLogisticsTruck,
                        prompt: 'Crisp daytime photo of a majestic white modern multi-axle semi-truck cruising down a beautiful clean desert highway, perfect lighting, glowing soft atmosphere, 4K realistic vehicle style --ar 16:9'
                      },
                      {
                        title: 'معدات وإنشاءات ثقيلة',
                        img: constructionHeavyMachinery,
                        prompt: 'Tidy and modern industrial building zone construction during clean daytime, massive yellow excavator loader parked neatly on flat earth, light paper minimalist aesthetic color accents, 4K photo, stunning --ar 16:9'
                      },
                      {
                        title: 'شاشات المراقبة وتدفق البيانات',
                        img: saasWorkflowIllustration,
                        prompt: 'Close up shot of heavy duty vehicle engine diagnostic monitoring screen, clear graphical user interface with fuel charts, minimal light mode with soft violet and blue guidelines, ultra clean, photo 4K --ar 16:9'
                      },
                      {
                        title: 'لوحة التحكم الرقمية للآليات',
                        img: dashboardMarketingPreview,
                        prompt: 'Modern SaaS dashboard on a tablet computer being held in hand outdoors, with clean white and soft blue grids of odomoter readings and fuel alerts, nice blur of transport trucks in background --ar 16:9'
                      },
                      {
                        title: 'فريق إدارة الصيانة والمشرفين',
                        img: municipalCleanFleet,
                        prompt: 'A diverse professional engineering team standing together in front of a white board inside a bright operations dispatch depot, smiling confidently, soft paper warm branding color palette, photorealistic, premium 4K --ar 16:9'
                      }
                    ].map((item, index) => (
                      <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="relative h-32 w-full overflow-hidden shrink-0">
                          <img 
                            src={item.img} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-4 text-right space-y-1">
                          <h5 className="text-[11.5px] font-black text-slate-900">{item.title}</h5>
                          <p className="text-[9.5px] text-slate-400 font-bold leading-normal">
                            نموذج تشغيلي نهاري دافئ وعالي التدقيق
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 🔴 SECTION 7: INTERACTIVE ROI CALCULATOR AND SAVINGS ESTIMATOR */}
                <div className="p-6 md:p-10 bg-white border border-slate-250/90 rounded-3xl space-y-8 shadow-sm">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="text-[10px] font-black text-indigo-600 font-extrabold flex items-center justify-center gap-1.5 uppercase tracking-wide">
                      <TrendingUp size={12} />
                      <span>{isRtl ? 'حاسبة المحاكاة والوفورات المالية لأسطولك' : 'ACTIVE ROI & EXPENSE REDUCTION ESTIMATOR'}</span>
                    </span>
                    <h3 className="text-xl font-black text-slate-900">
                      احسب وفوراتك بعد التحول الرقمي للأسطول
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">
                      قم بتحريك مؤشرات التمرير أدناه لتحديث وفورات الصيانة السنوية بناءً على مخرجات FleetAurvexis التلقائية:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50/50 p-4 sm:p-6 rounded-2xl border border-slate-200">
                    {/* Sliders Container (Pure White card Inside) */}
                    <div className="space-y-6 bg-white border border-slate-200 p-5 sm:p-7 rounded-2xl shadow-sm" dir={isRtl ? 'rtl' : 'ltr'}>
                      {/* Slider 1: Fleet size */}
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                          <span>إجمالي عدد مركبات وشاحنات الأسطول:</span>
                          <span className="font-mono text-indigo-600 text-sm font-extrabold">{vehicleCount} مركبة</span>
                        </div>
                        <input 
                          type="range" 
                          min="5" 
                          max="350" 
                          step="5"
                          value={vehicleCount}
                          onChange={(e) => setVehicleCount(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                          <span>5</span>
                          <span>150</span>
                          <span>350</span>
                        </div>
                      </div>

                      {/* Slider 2: Current Downtime Days */}
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                          <span>معدل أيام تعطل الآلية بالورشة سنوياً:</span>
                          <span className="font-mono text-emerald-600 text-sm font-extrabold">{currentDowntimeDays} يوم</span>
                        </div>
                        <input 
                          type="range" 
                          min="2" 
                          max="60" 
                          step="1"
                          value={currentDowntimeDays}
                          onChange={(e) => setCurrentDowntimeDays(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                          <span>2 يوم</span>
                          <span>30 يوم</span>
                          <span>60 يوم</span>
                        </div>
                      </div>
                    </div>

                    {/* Outputs Display Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Financial saving */}
                      <div className="p-5 bg-white border border-slate-200/90 rounded-2xl text-right shadow-sm hover:border-emerald-300 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3.5 border border-emerald-100 shadow-sm">
                          <Coins size={18} />
                        </div>
                        <span className="text-[10px] text-slate-500 font-extrabold block mb-1">الوفر السنوي المسترد (تقديري)</span>
                        <span className="text-xl md:text-2xl font-black text-emerald-600 font-mono">
                          ${calculatedSavingsMoney.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                        <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                          *بما يتناسب مع خفض تكاليف التشغيل والصيانة والوقود بنسبة 30%.
                        </p>
                      </div>

                      {/* Downtime reduction */}
                      <div className="p-5 bg-white border border-slate-200/90 rounded-2xl text-right shadow-sm hover:border-indigo-300 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3.5 border border-indigo-100 shadow-sm">
                          <Clock size={16} />
                        </div>
                        <span className="text-[10px] text-slate-500 font-extrabold block mb-1">زمن بقاء المركبات بالورشة</span>
                        <div className="flex items-baseline gap-2 justify-end flex-row-reverse">
                          <span className="text-xl md:text-2xl font-black text-indigo-600 font-mono">{projectedDowntimeDays} يوم</span>
                          <span className="text-[10px] text-slate-400 line-through font-mono font-medium">{currentDowntimeDays} يوم</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                          *بفضل جدول الصيانة الوقائية السحابي التلقائي.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🔴 SECTION 8: FAQ (قسم الأسئلة الشائعة - 5 أسئلة محددة ومطابقة) */}
                <div className="space-y-8 text-right" dir="rtl">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="inline-flex items-center gap-1 bg-[#FAF9F6] border border-slate-200 px-2.5 py-1 text-slate-700 rounded-full text-[10px] font-black uppercase font-mono tracking-wider">
                      <HelpCircle size={11} className="text-slate-600" />
                      <span>{isRtl ? 'الأسئلة والأجوبة التشغيلية' : 'COMMON INQUIRIES'}</span>
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                      الأسئلة الشائعة حول حوسبة الأساطيل
                    </h3>
                  </div>

                  <div className="max-w-3xl mx-auto space-y-4">
                    {[
                      {
                        q: 'هل النظام مناسب للشركات الصغيرة؟',
                        a: 'نعم بالكامل! المنظومة تدعم من 5 مركبات فما فوق، ويتوفر اشتراكات مرنة للغاية قابلة للتوسع بمحاذاة نمو أسطولك المالي بلا أي قيود مسبقة وبشاشات بسيطة.'
                      },
                      {
                        q: 'هل يدعم المعدات الثقيلة؟',
                        a: 'نعم بالتأكيد. المنظومة مصممة بركائز قوية لخدمة الشاحنات، والمولدات، وبلدوزرات التشييد بناءً على ساعات تشغيل المحرك (Engine Hours) بدلاً من مسافات الكيلومتر فقط.'
                      },
                      {
                        q: 'هل يمكن إدارة عدة فروع عبر النظام؟',
                        a: 'نعم. يوفر النظام هيكلية حوكمة مرنة لعزل البيانات أو دمجها للفروع المختلفة في منطقة الرياض، جدة، والدمام، مع تتبع مستودع قطع الغيار المستقل لكل فرع.'
                      },
                      {
                        q: 'هل يوجد تطبيق للجوال؟',
                        a: 'نعم، يوفر النظام بوابة ويب متجاوبة 100% وتطبيق جوال خفيف للفنيين والسائقين لرفع البلاغات الصوتية والفحص بالباركود من الميدان مباشرة دون أوراق.'
                      },
                      {
                        q: 'هل يدعم الذكاء الاصطناعي لتشخيص الأعطال؟',
                        a: 'بالتأكيد. المساعد يستوعب رموز أكواد OBD وعقود الفحص الميكانيكي ويترجم البصمات الصوتية لخطوات صيانة تفصيلية معتمدة للحد من تلاعب الأيدي الفنية.'
                      }
                    ].map((faq, index) => {
                      const isExpanded = expandedFaq === index;
                      return (
                        <div key={index} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden transition-all duration-300">
                          <button
                            type="button"
                            onClick={() => setExpandedFaq(isExpanded ? null : index)}
                            className="w-full text-right px-6 py-4.5 flex items-center justify-between gap-4 font-black text-sm text-slate-900 cursor-pointer hover:bg-slate-50/60"
                          >
                            <span className="font-sans text-xs md:text-sm">{faq.q}</span>
                            <span className={`text-indigo-650 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                              ◀
                            </span>
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-slate-100"
                              >
                                <p className="px-6 py-4 text-xs md:text-[13px] text-slate-500 font-bold leading-relaxed bg-[#FAF9F6]/30">
                                  {faq.a}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 🔴 SECTION 9: FINAL CALL TO ACTION (مع صورة حديثة لمدير أسطول في الخلفية) */}
                <div className="relative rounded-3xl bg-[#0f1424] overflow-hidden border border-slate-200/50 p-8 sm:p-12 md:p-16 text-center shadow-lg" dir="rtl">
                  {/* Backdrop */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/90 to-indigo-950/70 z-10" />
                  <img 
                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80" 
                    alt="Confident fleet manager smiling background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
                    referrerPolicy="no-referrer"
                  />

                  <div className="relative z-20 space-y-5 max-w-2xl mx-auto">
                    <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">ابدأ رحلة التحول الرقمي لأسطولك اليوم</h3>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                      انضم إلى الشركات التي تدير عملياتها بكفاءة أعلى وتكاليف أقل باستخدام نظام إدارة الأساطيل والصيانة الذكي.
                    </p>
                    <div className="pt-4 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onStartTrial();
                        }}
                        className="px-7 py-3.5 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 text-white font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      >
                        اطلب عرضاً تجريبياً
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB: ABOUT COMPANY DEDICATED BESPOKE VIEW */}
          {(activeTab === 'about-company' || activeTab === 'item-4-1') && (
            <AboutCompanyView 
              language={language}
              brandName={effectiveBrandName}
              onStartTrial={onStartTrial}
            />
          )}

          {/* TAB 2 to 7 & OTHER FEATURES: RENDER PREMIUM, LIGHT-PAPER SAAS DOCUMENT COVERING OTHER SELECTED SECTION */}
          {activeTab !== 'owners' && activeTab !== 'about-company' && activeTab !== 'item-4-1' && (
            <div className="animate-fade-in py-10 px-4 max-w-5xl mx-auto space-y-12">
              
              {/* Layout Container styled as gorgeous white paper */}
              <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden relative" dir={isRtl ? 'rtl' : 'ltr'}>
                
                {/* Visual Glassmorphic Decoration Behind */}
                <div className="absolute top-[20%] right-0 w-96 h-96 bg-indigo-50/40 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute bottom-[20%] left-0 w-96 h-96 bg-emerald-50/20 rounded-full blur-3xl pointer-events-none -z-10" />

                {/* 1. SECTOR HERO HEADER BANNER */}
                <div className="relative h-72 sm:h-96 w-full flex items-end">
                  <div className="absolute inset-0 bg-slate-900/60 z-10" />
                  <img 
                    src={currentSol.imageMockUrl} 
                    alt={currentSol.nameAr} 
                    className="absolute inset-0 w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Decorative Gradient Overlay Bottom */}
                  <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-slate-950 to-transparent z-15" />
                  
                  <div className="relative z-20 p-6 sm:p-10 md:p-12 text-right w-full space-y-3" dir={isRtl ? 'rtl' : 'ltr'}>
                    <span className="inline-flex items-center gap-1.5 bg-indigo-600 border border-indigo-500 px-3 py-1 text-white rounded-full text-[10px] font-black uppercase font-mono tracking-wider">
                      {currentSol.icon}
                      <span>{isRtl ? 'الحل الرقمي المتكامل' : 'INTEGRATED DIGITAL MODULE'}</span>
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                      {isRtl ? currentSol.nameAr : currentSol.nameEn}
                    </h2>
                    <p className="text-white/90 text-sm sm:text-base font-bold max-w-3xl leading-relaxed">
                      {isRtl ? currentSol.microCopyAr : currentSol.microCopyEn}
                    </p>
                  </div>
                </div>

                {/* Main Article Content Padding Wrapper */}
                <div className="p-6 sm:p-10 md:p-14 space-y-12">
                  
                  {/* 2. GENERAL INDUSTRY OVERVIEW & MANAGEMENT MOTIVATION */}
                  <div className="space-y-4 text-right" dir={isRtl ? 'rtl' : 'ltr'}>
                    <span className="text-[10.5px] font-black text-indigo-700 tracking-wide font-mono uppercase bg-indigo-50 p-1 px-2.5 rounded-md">
                      {isRtl ? 'أولاً: منطلق ورؤية هذا القطاع' : 'I. SECTOR ANALYSIS & FOUNDATIONS'}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900">
                      {isRtl ? 'الرؤية والتحليل التشغيلي العام' : 'Sector Deep Dive & Diagnostic Overview'}
                    </h3>
                    <div className="text-sm sm:text-base text-slate-600 font-bold whitespace-pre-wrap leading-relaxed max-w-4xl">
                      {isRtl ? currentSol.longOverviewAr : currentSol.longOverviewEn}
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-xs sm:text-sm text-slate-500 font-bold leading-normal mt-4">
                      💡 {isRtl ? currentSol.fieldReliefAr : currentSol.fieldReliefEn}
                    </div>
                  </div>

                  {/* 3. HARDWARE & SOFTWARE MODULE FEATURES */}
                  <div className="pt-8 border-t border-slate-150 space-y-6 text-right" dir={isRtl ? 'rtl' : 'ltr'}>
                    <span className="text-[10.5px] font-black text-indigo-700 tracking-wide font-mono uppercase bg-indigo-50 p-1 px-2.5 rounded-md">
                      {isRtl ? 'ثانياً: أركان حوسبة FleetAurvexis' : 'II. THE FLEETAURVEXIS STRUCTURAL PILLARS'}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900">
                      {isRtl ? 'المميزات والمحاور الحيوية للمنظومة' : 'Core System Modules'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {currentSol.features.map((feat, index) => (
                        <div key={index} className="bg-slate-50/80 border border-slate-200/80 p-6 rounded-2xl flex flex-col justify-between hover:bg-white hover:border-indigo-200 transition-all shadow-3xs">
                          <div className="space-y-3">
                            <div className="flex gap-2 items-center justify-start flex-row-reverse">
                              <h5 className="text-[13.5px] font-black text-slate-950">{feat.title}</h5>
                              <span className="p-1 px-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] leading-none shrink-0 font-bold">✓</span>
                            </div>
                            <p className="text-[12px] text-slate-500 leading-relaxed font-bold">
                              {feat.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. CASE STUDY: BEFORE / AFTER TRANSFORMATION */}
                  {currentSol.beforeAfterAr && currentSol.beforeAfterAr.length > 0 && (
                    <div className="pt-8 border-t border-slate-150 space-y-6 text-right" dir={isRtl ? 'rtl' : 'ltr'}>
                      <span className="text-[10.5px] font-black text-indigo-700 tracking-wide font-mono uppercase bg-indigo-50 p-1 px-2.5 rounded-md">
                        {isRtl ? 'ثالثاً: دراسة مقارنة وموجز التغير' : 'III. OPERATIONS REVOLUTION'}
                      </span>
                      <h3 className="text-xl md:text-2xl font-black text-slate-900">
                        {isRtl ? 'طبيعة التشغيل قبل وبعد المنظومة' : 'Operation Workflow: Before & After'}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        {/* Before block */}
                        <div className="border border-red-150 bg-red-50/40 p-6 rounded-2xl space-y-3">
                          <div className="flex items-center gap-2 justify-start flex-row-reverse">
                            <span className="w-2.5 h-2.5 bg-red-600 rounded-full" />
                            <h4 className="text-sm font-black text-red-800">
                              {isRtl ? 'الوضع التشغيلي التقليدي (سابقاً)' : 'Conventional Workflow (Standard)'}
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-605 leading-relaxed font-bold">
                            {isRtl ? currentSol.beforeAfterAr[0].before : currentSol.beforeAfterEn?.[0]?.before}
                          </p>
                        </div>

                        {/* After block */}
                        <div className="border border-emerald-150 bg-emerald-50/40 p-6 rounded-2xl space-y-3">
                          <div className="flex items-center gap-2 justify-start flex-row-reverse">
                            <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-pulse" />
                            <h4 className="text-sm font-black text-emerald-800">
                              {isRtl ? 'بعد تفعيل FleetAurvexis (حالياً)' : 'With FleetAurvexis (Streamlined)'}
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-bold">
                            {isRtl ? currentSol.beforeAfterAr[0].after : currentSol.beforeAfterEn?.[0]?.after}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. 30-DAY TIMELINE DEPLOYMENT ROADMAP */}
                  {currentSol.roadmapAr && currentSol.roadmapAr.length > 0 && (
                    <div className="pt-8 border-t border-slate-150 space-y-6 text-right" dir={isRtl ? 'rtl' : 'ltr'}>
                      <span className="text-[10.5px] font-black text-indigo-700 tracking-wide font-mono uppercase bg-indigo-50 p-1 px-2.5 rounded-md">
                        {isRtl ? 'رابعاً: خارطة طريق تبييت النظام' : 'IV. 30-DAY LAUNCH PLAN'}
                      </span>
                      <h3 className="text-xl md:text-2xl font-black text-slate-900">
                        {isRtl ? 'دليل تطبيق وتعميم الحل التشغيلي' : 'Step-By-Step Deployment Roadmap'}
                      </h3>

                      <div className="relative border-r-2 border-slate-150 mr-3 pr-6 space-y-8 pt-3">
                        {(isRtl ? currentSol.roadmapAr : currentSol.roadmapEn || []).map((step, idx) => (
                          <div key={idx} className="relative">
                            {/* Circle bullet node */}
                            <span className="absolute -right-[33px] top-1 w-4 h-4 bg-indigo-600 border-2 border-white rounded-full" />
                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-indigo-700 font-mono tracking-wide">
                                {isRtl ? `خطوة تشغيلية ${idx + 1}` : `Operational Step ${idx + 1}`}
                              </h4>
                              <p className="text-sm text-slate-700 leading-normal font-bold">
                                {step}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6. EXPECTED TARGET FINANCIAL & QUALITY KPIS */}
                  {currentSol.kpisAr && currentSol.kpisAr.length > 0 && (
                    <div className="pt-10 border-t border-slate-150 space-y-6 text-right" dir={isRtl ? 'rtl' : 'ltr'}>
                      <span className="text-[10.5px] font-black text-indigo-700 tracking-wide font-mono uppercase bg-indigo-50 p-1 px-2.5 rounded-md">
                        {isRtl ? 'خامساً: أرقام ومؤشرات الفعالية والوفر التشغيلي' : 'V. EXPECTED METRIC IMPROVEMENTS'}
                      </span>
                      <h3 className="text-xl md:text-2xl font-black text-slate-900">
                        {isRtl ? 'المؤشرات والنتائج المستهدفة للقطاع' : 'Target Quality & Cost KPIs'}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-3">
                        {(isRtl ? currentSol.kpisAr : currentSol.kpisEn || []).map((metric, mIdx) => (
                          <div key={mIdx} className="bg-slate-50 border border-slate-150 rounded-2xl p-6 text-center space-y-2 hover:bg-indigo-50/20 hover:border-indigo-150 transition-colors">
                            <h4 className="text-3xl md:text-4xl font-black text-indigo-600 font-mono">
                              {metric.value}
                            </h4>
                            <div className="text-xs md:text-sm font-black text-slate-900">
                              {metric.label}
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold leading-normal">
                              {metric.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Back to Core Solutions List or start trial */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-slate-200/60" dir={isRtl ? 'rtl' : 'ltr'}>
                <button
                  type="button"
                  onClick={() => {
                    const scrollContainer = document.getElementById('showcase-scroll-container');
                    if (scrollContainer) {
                      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="px-5 py-3 text-xs font-black text-slate-600 hover:text-indigo-650 bg-white border border-slate-200 rounded-xl shadow-3xs hover:scale-103 transition-transform cursor-pointer"
                >
                  ◀ {isRtl ? 'الرجوع ومقارنة قطاعات الحلول الأخرى' : 'Back to compare other solutions and sectors'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartTrial();
                  }}
                  className="px-6 py-3.5 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 text-white font-black text-xs rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-transform"
                >
                  {isRtl ? 'اطلب عرضاً تجريبياً مجانياً الآن ⚡' : 'Request Free Product Demo ⚡'}
                </button>
              </div>

            </div>
          )}

          {/* SHARED SCORED FOOTER */}
          <div className="bg-[#FAF9F6] border-t border-slate-200 py-10 px-6 shrink-0 text-center text-slate-400 text-xs font-sans">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono leading-relaxed" dir={isRtl ? 'rtl' : 'ltr'}>
              <span>© 2026 {isRtl ? 'FleetAurvexis لإدارة تتبع وصيانة الأساطيل والآليات الذكية' : 'FLEETAURVEXIS AUTOMATION INC.'}</span>
              <span className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>{isRtl ? 'جميع قنوات الاتصال مشفرة بالكامل ومعززة بامتثال السحاب' : 'SECURE SSL ENCRYPTED CONNECTION'}</span>
              </span>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
