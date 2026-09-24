import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Sparkles, 
  Clock, 
  Tag, 
  ArrowRight, 
  CheckCircle2, 
  Share2, 
  Copy, 
  Download, 
  X, 
  Calendar, 
  ChevronRight,
  Filter,
  Eye,
  Check,
  Globe2,
  FileDown,
  Printer,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { ArticleShareModal } from './ArticleShareModal';
import { downloadArticleAsPDF } from '../utils/articlePdfGenerator';

// Import high-fidelity local assets for fleet articles
import highwayLogisticsTruck from '../assets/images/highway_logistics_truck_1782935190395.jpg';
import driverTruckInspection from '../assets/images/driver_truck_inspection_1786784371761.jpg';
import aiFleetDiagnostics from '../assets/images/ai_fleet_diagnostics_1786785439472.jpg';
import mechanicTruckWorkshop from '../assets/images/mechanic_truck_workshop_1782935168167.jpg';
import dieselMaintenance from '../assets/images/diesel_maintenance_1783750031121.jpg';
import hydraulicServicing from '../assets/images/hydraulic_servicing_1783750041949.jpg';
import enterpriseFleetDepot from '../assets/images/enterprise_fleet_depot_1782935136613.jpg';
import schoolBusFleet from '../assets/images/school_bus_fleet_1789852878362.jpg';
import operationsControlHub from '../assets/images/operations_playbook_command_hub_1789855182819.jpg';
import corporatePressMediaCenter from '../assets/images/corporate_press_media_center_1789856295995.jpg';
import logisticsPartnershipsAlliances from '../assets/images/logistics_partnerships_alliances_1789856307803.jpg';

export interface MarketingArticle {
  id: string;
  title: string;
  titleEn?: string;
  category: string;
  categoryEn?: string;
  readTime: string;
  date: string;
  tags: string[];
  summary: string;
  content: string;
  author: string;
  status: 'published' | 'draft';
  isPublishedToMarketingSite?: boolean;
  image?: string;
  imageUrl?: string;
  imageSource?: string;
  imageCaption?: string;
  imageModel?: string;
  imagePrompt?: string;
}

export const CURATED_ARTICLE_IMAGES: { id: string; labelAr: string; labelEn: string; url: string }[] = [
  { id: 'img-highway', labelAr: 'شاحنات النقل اللوجستي السريع', labelEn: 'Highway Fleet Logistics', url: highwayLogisticsTruck },
  { id: 'img-school-bus', labelAr: 'أساطيل حافلات المدارس والتعليم', labelEn: 'School Bus & Educational Fleets', url: schoolBusFleet },
  { id: 'img-inspection', labelAr: 'الفحص الميداني للشاحنات وQR', labelEn: 'Driver & QR Fleet Inspection', url: driverTruckInspection },
  { id: 'img-ai-diag', labelAr: 'تشخيص الأعطال بالذكاء الاصطناعي', labelEn: 'AI Fleet Diagnostics & Telemetry', url: aiFleetDiagnostics },
  { id: 'img-workshop', labelAr: 'ورشة صيانة الشاحنات الثقيلة', labelEn: 'Heavy Commercial Workshop', url: mechanicTruckWorkshop },
  { id: 'img-diesel', labelAr: 'صيانة محركات الديزل والحواقن', labelEn: 'Diesel Engine Diagnostics', url: dieselMaintenance },
  { id: 'img-hydraulic', labelAr: 'معايرة الأنظمة الهيدروليكية', labelEn: 'Hydraulic Systems Servicing', url: hydraulicServicing },
  { id: 'img-depot', labelAr: 'مستودعات ومركز انطلاق الأسطول', labelEn: 'Enterprise Logistics Depot', url: enterpriseFleetDepot },
  { id: 'img-operations', labelAr: 'أدلة الاستخدام والتشغيل الميداني', labelEn: 'Operations Command & Playbook', url: operationsControlHub },
  { id: 'img-press-room', labelAr: 'المركز الإعلامي وأخبار الشركة', labelEn: 'Corporate Press Room & Media Center', url: corporatePressMediaCenter },
  { id: 'img-partnerships', labelAr: 'الشراكات والتحالفات اللوجستية', labelEn: 'Logistics Strategic Alliances', url: logisticsPartnershipsAlliances },
];

export const DEFAULT_MARKETING_ARTICLES: MarketingArticle[] = [
  {
    id: 'art-1',
    title: 'الدليل الشامل للصيانة الوقائية للشاحنات والمعدات الثقيلة: خطة الـ 5 خطوات لتفادي الأعطال المفاجئة',
    titleEn: 'Comprehensive Preventive Maintenance Guide for Heavy Trucks & Fleet Assets',
    category: 'صيانة وقائية وأساطيل',
    categoryEn: 'Preventive Fleet Maintenance',
    readTime: '4 دقائق قراءة',
    date: '2026-09-12',
    tags: ['صيانة_الشاحنات', 'إدارة_الأساطيل', 'فحص_وقائي', 'محركات_الديزل'],
    summary: 'تعد الصيانة الوقائية الركيزة الأولى لاستدامة أساطيل النقل والمعدات الثقيلة؛ حيث توفر ما يزيد عن 35% من تكاليف الإصلاحات الطارئة وترفع العمر التشغيلي للمركبات.',
    content: `### مقدمة: لماذا تعد الصيانة الوقائية استثماراً وليست تكلفة؟
في قطاع النقل البري والمقاولات، يعني توقف شاحنة واحدة خسائر تشغيلية تتجاوز تكلفة الإصلاح الميكانيكي. الصيانة الوقائية المبرمجة تضمن جاهزية الأسطول بنسبة تتجاوز 95%.

#### المحور الأول: الفحص اليومي ما قبل الانطلاق (Pre-trip Inspection)
- قياس منسوب الزيوت وسوائل التبريد وفحص مضخة الهيدروليك.
- فحص ضغط الإطارات وعمق المداس لمنع الانفجارات الحرارية على الطرق السريعة.
- اختبار ضغط الهواء لمنظومة المكابح الهوائية (Air Brake System) والتأكد من عدم وجود تسريب.

#### المحور الثاني: دورات الصيانة المجدولة بناءً على الكيلومترات وساعات التشغيل
- كل 10,000 كم: استبدال زيت المحرك وفلاتر الوقود وفلتر الهواء الأساسي.
- كل 40,000 كم: فحص منظومة التعليق، ميزان الدوران، وتشحيم محاور الكردان.
- كل 80,000 كم: فحص كامل لناقل الحركة (القيربوكس) وسائل التوجيه الهيدروليكي واستبدال سائل الفرامل.

#### المحور الثالث: دور الرقمنة ونظام FleetAurvexis في حماية الأسطول
بفضل تفعيل بطاقة الفحص الفني الرقمية بنظام باركود QR، يستطيع السائق أو الفني إتمام الفحص في أقل من دقيقتين مع توثيق الصور والبيانات الحية، وتنبيه مدير الصيانة فوراً لأي خلل طارئ قبل تفاقمه.

#### الخلاصة ودعوة للعمل:
استدامة الأسطول تبدأ من الالتزام بالجدول الدوري. انضم إلى المنظومة الرقمية وارفع أمان أسطولك اليوم.`,
    author: 'بوت كتابة المقالات - FleetAurvexis AI',
    status: 'published',
    isPublishedToMarketingSite: true,
    image: highwayLogisticsTruck
  },
  {
    id: 'art-2',
    title: 'كيف ترفع مراكز الصيانة إنتاجيتها بنسبة 40% عبر الفحص الرقمي بنظام QR الذكي',
    titleEn: 'Boosting Workshop Productivity by 40% with Intelligent QR Digital Inspections',
    category: 'التحول الرقمي للورش',
    categoryEn: 'Workshop Digital Transformation',
    readTime: '3 دقائق قراءة',
    date: '2026-09-10',
    tags: ['فحص_رقمي', 'إدارة_الورش', 'باركود_QR', 'إنتاجية_الصيانة'],
    summary: 'استبدال النماذج الورقية بنظام بطاقات QR الممسوحة ذكياً يقضي على أخطاء الفحص ويسرع تسليم أوامر العمل وربط الفنيين بقطع الغيار الفورية.',
    content: `### التحول من الورق إلى الأتمتة الميدانية
عانت الورش التقليدية لسنوات من ضياع أوراق الفحص وبطء وصول التقارير للمشرفين، مما يتسبب في تأخر تسليم المركبات لأيام إضافية.

#### مزايا بطاقة الفحص الرقمية بـ QR:
1. مسح فوري بهاتف الفني دون الحاجة لتثبيت برامج معقدة.
2. تسجيل الأعطال وتصويرها حياً لرفع الموثوقية مع العميل.
3. الربط الفوري بمستودع قطع الغيار لتقليل زمن الانتظار.

#### النتائج الميدانية:
أظهرت النتائج ارتفاع سرعة معالجة أوامر العمل بنسبة 40%، وتقليص النزاعات مع ملاك المركبات بنسبة 85% بفضل التوثيق المصور الشفاف.`,
    author: 'بوت كتابة المقالات - FleetAurvexis AI',
    status: 'published',
    isPublishedToMarketingSite: true,
    image: driverTruckInspection
  },
  {
    id: 'art-3',
    title: '5 استراتيجيات مجربة لخفض استهلاك الوقود وتكاليف التشغيل لأساطيل النقل',
    titleEn: '5 Proven Strategies to Cut Fuel Consumption and Fleet Operational Costs',
    category: 'كفاءة الطاقة والتشغيل',
    categoryEn: 'Energy & Fuel Efficiency',
    readTime: '5 دقائق قراءة',
    date: '2026-09-08',
    tags: ['استهلاك_الوقود', 'تكاليف_التشغيل', 'أساطيل_النقل', 'سلوك_السائق'],
    summary: 'يشكل الوقود أكثر من 30% من تكاليف تشغيل الأساطيل. استعرض أهم الخطوات التقنية لتقليل هذا العبء المالي باستخدام مستشعرات الصيانة والتدريب الذكي.',
    content: `### تكلفة الوقود: التحدي الأكبر لمديري الأساطيل
مع ارتفاع تكاليف الوقود، تصبح أي نسبة توفير عاملاً حاسماً في ربحية الشركة واستمراريتها.

#### الاستراتيجيات الخمس الأساسية:
1. معايرة ضغط الإطارات بدقة لتفادي زيادة استهلاك الوقود واهتراء المداس بنسبة 10%.
2. مراقبة سلوك القيادة والتسارع العنيف وتجنب فترات التوقف مع تشغيل المحرك المفرط (Idling).
3. الصيانة الدورية لفلاتر الهواء وشمعات الاحتراق وحواقن الديزل.
4. تخطيط المسارات الذكي وتفادي الاختناقات المرورية وأوقات الذروة.
5. استخدام زيوت محركات تخليقية ذات لزوجة محسنة وشهادات جودة معتمدة.`,
    author: 'بوت كتابة المقالات - FleetAurvexis AI',
    status: 'published',
    isPublishedToMarketingSite: true,
    image: dieselMaintenance
  },
  {
    id: 'art-4',
    title: 'دور خوارزميات الذكاء الاصطناعي في التنبؤ المبكر بأعطال المحركات الهيدروليكية',
    titleEn: 'Predicting Hydraulic Failures in Heavy Equipment Using Telemetry & AI',
    category: 'فحص وتشخيص الذكاء الاصطناعي',
    categoryEn: 'AI Diagnostics & Sensors',
    readTime: '4 دقائق قراءة',
    date: '2026-09-05',
    tags: ['ذكاء_اصطناعي', 'تشخيص_الأعطال', 'هيدروليك', 'إنترنت_الأشياء'],
    summary: 'كيف تساهم تحليلات الحساسات الرقمية ونماذج الذكاء الاصطناعي في توقع انخفاض ضغط الزيت وانسداد فلاتر الضغط قبل توقف الآلية أثناء العمل.',
    content: `### عصر الصيانة التنبؤية في أساطيل المعدات الثقيلة
لم يعد مجدياً الانتظار حتى يتعطل النظام الهيدروليكي في موقع الإنشاء. تقنيات التنبؤ المبكر تمنح المهندسين إشعارات استباقية دقيقة.

#### كيف يعمل الفحص التنبؤي الذكي؟
- جمع نبضات الضغط ودرجات حرارة الزيت عبر حساسات الـ IoT.
- مقارنة القراءات ببيانات المصنع الأصلية لكل طراز رافعة أو شاحنة.
- إصدار أمر صيانة فوري للمستودع لحجز الفلاتر والقطع المناسبة.`,
    author: 'بوت كتابة المقالات - FleetAurvexis AI',
    status: 'published',
    isPublishedToMarketingSite: true,
    image: aiFleetDiagnostics
  },
  {
    id: 'art-5',
    title: 'دليل حوكمة وسلامة حافلات المدارس والنقل التعليمي: بروتوكول الفحص الصباحي الذكي بـ QR ومعايير تصفير الأعطال المفاجئة',
    titleEn: 'School Bus Fleet Governance & Safety Guide: Smart QR Morning Inspections & Zero-Breakdown Protocols',
    category: 'النقل المدرسي والتعليم',
    categoryEn: 'Schools & Educational Fleets',
    readTime: '4 دقائق قراءة',
    date: '2026-09-18',
    tags: ['نقل_مدرسي', 'سلامة_الطلاب', 'فحص_الحافلات', 'باركود_QR', 'قطاع_التعليم', 'صيانة_وقائية'],
    summary: 'يمثل نقل الطلاب أمانة ومسؤولية تشغيلية لا تحتمل أي هامش للخطأ أو الإهمال. يستعرض هذا الدليل منظومة الفحص الصباحي الرقمي بنظام باركود QR، والتحقق الإلزامي من أحزمة الأمان والمكابح وأجهزة التكييف، مع خطة طوارئ السائقين البدلاء لضمان رحلات مدرسية آمنة وموثوقة 100%.',
    content: `### مقدمة: قدسية سلامة الطلاب في النقل المدرسي والتعليمي
يمثل نقل الطلاب والتلاميذ صباحاً ومساءً إحدى أدق العمليات اللوجستية وأعلاها حساسية؛ حيث لا يتعلق الأمر بمجرد نقل ركاب، بل بأمانة أرواح أبنائنا واستقرار يومهم الدراسي. إن حدوث عطل مفاجئ في مكابح الحافلة، أو توقف نظام التكييف في ذروة الصيف، أو تأخر وصول الحافلة، لا يربك الجدول المدرسي فحسب، بل يثير قلقاً بالغاً لدى أولياء الأمور وإدارات المدارس.

---

### المحور الأول: بروتوكول الدوران والفحص الصباحي الإلزامي (Pre-Trip Inspection) عبر باركود QR
تعتمد المدارس الحديثة والأساطيل التعليمية المتقدمة بروتوكول الفحص الميداني الفعلي قبل انطلاق أي حافلة من نقطة التجمع:
1. **مسح باركود الـ QR عند محيط الحافلة**: يلزم السائق بمسح الرموز الملصقة في مقدمة ومؤخرة وجوانب الحافلة للتأكد من قيامه بالدوران الفعلي حول المركبة.
2. **فحص أجهزة التكييف والتهوية المسبق**: تشغيل وحدات التكييف قبل صعود الطلاب للتأكد من تبريد المقصورة، وتجنب الإجهاد الحراري للأطفال في الأجواء الحارة.
3. **التأكد من أحزمة الأمان ومخارج الطوارئ**: فحص تثبيت جميع أحزمة المقاعد وسلامة مزاليج الأبواب وذراع الطوارئ الخلفي، مع التأكد من وجود حقيبة إسعافات متكاملة وطفايات حريق صالحة ومختومة.
4. **فحص عمق مداس الإطارات وضغط الهواء**: لمنع أي انزلاق أو انفجار مفاجئ أثناء نقل الطلاب على الطرق والمحاور الحيوية.

---

### المحور الثاني: الرقابة الصارمة على منظومة المكابح ونظام التوجيه
تخضع حافلات المدارس لأعلى درجات التدقيق الفني الميكانيكي:
- **دائرة المكابح الهوائية والهيدروليكية**: اختبار ضغط الهواء وسرعة استجابة دواسة الفرامل وتفريغ خزانات الهواء من الرطوبة يومياً.
- **تنبيهات الاستهلاك المبكر لتيل المكابح**: تتبع الكيلومترات وربط مؤشرات التآكل بجدول الصيانة الوقائية (PM) لاستبدال القطع قبل بلوغ حد الأمان الأدنى.
- **منظومة التوجيه والتعليق (Suspension & Steering)**: فحص أذرع التوجيه ومساعدات التوازن لضمان ثبات تام للحافلة مع الحمولات الطلابية الكاملة.

---

### المحور الثالث: نظام السائقين البدلاء وإدارة رحلات الطوارئ
في قطاع التعليم، لا يمكن تعطيل رحلة طلاب بسبب ظرف صحي أو طارئ لسائق الحافلة:
- **إسناد فوري للبديل المعتمد**: توفر المنظومة الرقمية جدول مناوبة معتمد للسائقين البدلاء المؤهلين والمدربين على مسارات الحي والمدرسة للتدخل الفوري دون تأخير اليوم الدراسي.
- **بوابة إشعار فوري لمدير الحركة والمدرسة**: تنبيه تلقائي لإدارة المدرسة عند بدء وانتهاء الفحص الصباحي، وعند وصول الحافلة بأمان إلى بوابات الحرم المدرسي.

---

### المحور الرابع: كيف تحقق منصة FleetAurvexis أعلى درجات الأمان لأساطيل المدارس؟
1. **لوحة تحكم ذكية لمديري حركة النقل التعليمي**: تتيح للمشرفين رؤية فورية لحالة كل حافلة، وجاهزيتها، ونتائج الفحص الصباحي للسائقين في شاشة مركزية واحدة.
2. **سجل امتثال رقمي معتمد**: توثيق كامل لكل عملية صيانة، وفحص دوري، وتغيير قطع غيار، مما يسهل الامتثال لمتطلبات هيئات النقل ووزارات التعليم.
3. **تنبيهات استباقية بالصيانة الوقائية**: تذكير آلي قبل استحقاق الصيانة الدورية، وفحص أنظمة التبريد قبل بداية كل فصل دراسي.

---

### الخلاصة ودعوة للعمل:
إن الاستثمار في حوكمة وصيانة أساطيل المدارس تقنياً ليس مجرد إجراء تشغيلي؛ بل هو التزام أخلاقي ومجتمعي يحمي أبناءنا ويوفر راحة البال التامة لكل أسرة ومؤسسة تعليمية.`,
    author: 'فريق التحرير الهندسي - FleetAurvexis AI',
    status: 'published',
    isPublishedToMarketingSite: true,
    image: schoolBusFleet
  },
  {
    id: 'art-6',
    title: 'أدلة وركائز الاستخدام التشغيلي: الدليل الميداني الشامل لحوكمة الأساطيل وأتمتة مسارات الصيانة والرقابة الرقمية',
    titleEn: 'Operational Guides & Core Pillars: Comprehensive Field Playbook for Fleet Governance & Maintenance Automation',
    category: 'أدلة وركائز الاستخدام التشغيلي',
    categoryEn: 'Operations Guides & Core Pillars',
    readTime: '5 دقائق قراءة',
    date: '2026-09-19',
    tags: ['أدلة_تشغيلية', 'حوكمة_الأساطيل', 'إدارة_العمليات', 'إجراءات_قياسية_SOP', 'الصيانة_الرقمية', 'مؤشرات_الأداء_KPIs'],
    summary: 'الدليل المرجعي المتكامل لمديري العمليات، مسؤولي الحركة، وفنيي الصيانة. يستعرض الركائز الخمس الجوهرية لبناء منظومة تشغيلية منضبطة تقضي على الهدر، تؤتمت أوامر العمل ومسارات الصيانة، وتضمن الامتثال الصارم لأعلى معايير السلامة والجودة.',
    content: `### مقدمة: لماذا تعد حوكمة العمليات ركيزة البقاء للأساطيل الحديثة؟
تواجه إدارات الأساطيل والخدمات اللوجستية تحديات متسارعة؛ فبين ضغوط مواعيد التسليم وارتفاع تكاليف التشغيل وصيانة المركبات، يصبح الاعتماد على الاجتهادات الفردية أو المتابعات الشفهية مجازفة كبرى تقود إلى استنزاف الميزانيات وتكرار الأعطال الحرجة.

يقدم هذا الدليل الميداني **الركائز الخمس الأساسية للاستخدام والتشغيل المعياري (Standard Operating Procedures - SOP)** التي تضمن تشغيلاً موثوقاً وخالياً من المفاجآت، ومبنياً على بيانات حية قابلة للقياس والمساءلة.

---

### الركيزة الأولى: حوكمة بدء الحركة والتسليم اليومي (Pre-trip Dispatch & Driver Check-in)
تبدأ سلامة الأسطول قبل دوران عجلة المركبة بركائز فحص ملزمة:
1. **بروتوكول مسح باركود QR الإلزامي**: إلزام السائق أو الفني بمسح الباركود المثبت على محيط الشاحنة/المركبة وتوثيق الفحص بالصور الحية (سوائل المحرك، ضغط الإطارات، تسريبات الزيوت، ومصابيح الإشارة).
2. **التحقق من جاهزية السائق ورخص القيادة**: الربط الآلي بين جدول الحركة وسجلات السائقين المعتمدين والتأكد من سريان التراخيص والتأمين قبل السماح بالانطلاق.
3. **تنبيه الإدارة اللحظي بأي ملحوظة فنية**: تحويل أي خلل يُرصد أثناء الفحص الصباحي إلى بلاغ صيانة فوري (Defect Alert) لمنع تحرك المركبة بحالة غير آمنة.

---

### الركيزة الثانية: هندسة دورة حياة أمر العمل الرقمي (Digital Work Order Lifecycle)
إلغاء المعاملات الورقية واعتماد تسلسل رقمي شفاف لكل أمر عمل:
- **إنشاء الطلب وتحديد الأولوية (Priority Triage)**: تصنيف الأعطال إلى (حرجة - عاجلة - دورية مجدولة) لتوجيه الموارد الميكانيكية بالشكل الأمثل.
- **إسناد الفنيين وتحديد الوقت المعياري (Standard Labor Hours)**: احتساب الساعات المتوقعة لكل مهمة صيانة ومقارنتها بالزمن الفعلي للإنجاز لقياس كفاءة الفنيين.
- **الفحص المزدوج والاعتماد الفني (Quality Sign-off)**: لا يُغلق أمر العمل إلا بعد اختبار المركبة وتوقيع المشرف رقمياً ورفع تقرير فحص خروج سليم.

---

### الركيزة الثالثة: حوكمة قطع الغيار والمخزون الحرج (Inventory Control & Critical Par Levels)
التحكم الدقيق في سلاسل إمداد الورش والمستودعات:
1. **مستويات إعادة الطلب الآلية (Auto-Reorder Triggers)**: ضبط حدود دنيا لقطع الغيار الاستهلاكية السريعة (الفلاتر، تيل المكابح، السيور، الزيوت) لتفادي توقف المركبات بانتظار الشراء.
2. **ربط القطع برقم الشاسيه (VIN Linking)**: تتبع سجل كل قطعة تم تركيبها على المركبة لتحديد القطع الرديئة أو المطالبة بالضمان (Warranty Claims).
3. **الجرد الدوري ومطابقة الأرصدة**: القضاء التام على الفاقد واختفاء الأدوات والعدد عبر سجلات صرف رقمية مربوطة بباركود الفني وأمر العمل.

---

### الركيزة الرابعة: معايير السلامة الميدانية وحوكمة سلوك القيادة (Driver Telemetry & Safety Audits)
تعد القيادة الآمنة خط الدفاع الأول لحماية أصول المنشأة:
- **مراقبة التجاوزات الفنية والتشغيلية**: متابعة التسارع المفاجئ، الفرملة الحادة، والتوقف الطويل مع تشغيل المحرك (Engine Idling) الذي يستنزف الوقود.
- **بطاقة تقييم السائق الدورية (Driver Scorecard)**: ربط الحوافز والمكافآت بمعدلات القيادة الاقتصادية والالتزام بمواعيد الفحص الصباحي.
- **بروتوكول التعامل مع الحوادث والأعطال الطارئة**: تدريب السائقين على الإبلاغ الفوري عبر المنظومة وتحديد الموقع الجغرافي الدقيق لطلب فرق الدعم والسطحات المعتمدة.

---

### الركيزة الخامسة: لوحات قياس الأداء التشغيلي (Operations KPIs & Real-time Insights)
لا يمكن إدارة ما لا يمكن قياسه بدقة. ترتكز الإدارة الناجحة على 4 مؤشرات أساسية:
1. **معدل الجاهزية التشغيلية (Fleet Availability %)**: الحفاظ على نسبة جاهزية تفوق 95% من إجمالي المركبات.
2. **زمن دوران أمر العمل (Mean Time to Repair - MTTR)**: تقليص مدة بقاء المركبة داخل الورشة من أيام إلى ساعات محددة.
3. **التكلفة التشغيلية لكل كيلومتر (Cost Per Kilometer / Mile)**: احتساب شامل للوقود والصيانة وقطع الغيار لتحليل ربحية كل خط سير.
4. **نسبة الامتثال للصيانة الوقائية (PM Compliance Ratio)**: التأكد من إتمام 100% من الصيانات المجدولة في مواعيدها المحددة دون تأجيل.

---

### الخلاصة ودعوة للعمل:
إن تطبيق أدلة وركائز الاستخدام التشغيلي عبر منصة FleetAurvexis يحول إدارة الأسطول من مجرد إطفاء يومي للحرائق ومواجهة الأعطال المفاجئة، إلى منظومة مؤسسية ذكية ترفع الأرباح، تطيل أعمار المعدات، وتضمن أعلى درجات السلامة المهنية.`,
    author: 'فريق التحرير التشغيلي - FleetAurvexis AI',
    status: 'published',
    isPublishedToMarketingSite: true,
    image: operationsControlHub
  },
  {
    id: 'art-7',
    title: 'غرفة المركز الإعلامي والأخبار: التوسع المؤسسي، إطلاقات المنظومة الهندسية، وبيانات التحول الرقمي للأساطيل',
    titleEn: 'Corporate Press Room & Newsroom: Enterprise Expansion, System Releases & Fleet Digital Transformation',
    category: 'المركز الإعلامي والأخبار',
    categoryEn: 'Press Room & Corporate News',
    readTime: '4 دقائق قراءة',
    date: '2026-09-19',
    tags: ['المركز_الإعلامي', 'أخبار_الشركة', 'إطلاقات_المنظومة', 'التحول_الرقمي_اللوجستي', 'بيانات_صحفية'],
    summary: 'النافذة الرسمية المعتمدة لبيانات شركة FleetAurvexis الصحفية، التحديثات التقنية لإصدارات أنظمة الذكاء الاصطناعي، وتقارير الشراكات الإقليمية في الشرق الأوسط وشمال أفريقيا.',
    content: `### المركز الإعلامي الرسمي لمنظومة FleetAurvexis
مرحباً بكم في غرفة الأخبار والمركز الإعلامي المعتمد لشركة FleetAurvexis. هنا تجدون كافة البيانات الصحفية، الإعلانات التشغيلية، وملفات التغطية الإعلامية المتعلقة بتطورات منظومتنا السحابية وإنجازات شركائنا في قطاعات النقل، المقاولات، والخدمات اللوجستية.

---

### أحدث البيانات الصحفية والإعلانات الرسمية:

#### 1. إطلاق محرك الذكاء الاصطناعي التنبؤي للتشخيص المسبق للأعطال (FleetAurvexis AI 4.0)
أعلنت شركة FleetAurvexis رسمياً عن الإطلاق العام للجيل الرابع من محرك التنبؤ بالأعطال. يعتمد التحديث الجديد على خوارزميات التعلم الآلي المتقدمة لتحليل بيانات الحساسات (OBD-II / CAN-Bus) واكتشاف الانحرافات الدقيقة في ضغط حقن الوقود، حرارة الزيوت، واهتزازات المحاور قبل وقوع العطل بمتوسط 14 يوماً، مما يقلل فترات التوقف غير المخطط لها بنسبة تصل إلى 42%.

#### 2. التوسع الإقليمي وافتتاح مراكز دعم العمليات في المملكة العربية السعودية والإمارات
ضمن خطتنا الاستراتيجية لتغطية كبرى الأسواق الإقليمية، دشنت المنصة مكاتب الدعم الفني الميداني ومراكز مساعدة العملاء على مدار الساعة (24/7) لخدمة أكثر من 180 أسطولاً تجارياً وحكومياً في الرياض وجدة ودبي وأبوظبي، مع تخصيص فرق متخصصة لمواءمة المنظومة مع اللوائح والأنظمة المحلية كمنصات "وصل" و"تتبع".

#### 3. اعتماد المعيار الأمني ISO/IEC 27001 لحماية بيانات الأساطيل وسلاسل الإمداد
نجحت المنظومة في اجتياز كافة متطلبات التدقيق الأمني الدولي والحصول على شهادة الآيزو لأمن وسرية المعلومات، مؤكدة التزامها المطلق بحماية بيانات التشغيل، سجلات السائقين، والمسارات الجغرافية للشركات المتعاقدة بأعلى معايير التشفير المصرفي المتقدم (AES-256).

---

### ملف المصادر والمواد الصحفية المعتمدة (Media Kit):
- **الهوية البصرية والعلامة التجارية**: حزم الشعارات الرسمية المتجهة (SVG/PNG) وكتيب إرشادات استخدام العلامة التجارية.
- **التصريحات التنفيذية**: مقابلات القيادات التنفيذية وفرق التطوير الهندسي حول مستقبل حوسبة الأساطيل.
- **قصص التغطية الميدانية**: إحصائيات واقعية ودراسات حالة موثقة مع كبرى شركات المقاولات والنقل السريع.

---

### قنوات التواصل الإعلامي والصحفي:
يرحب المكتب الإعلامي بالتواصل مع الصحفيين، وكالات الأنباء، والجهات الأكاديمية الراغبة في الحصول على بيانات تحليلية أو تصريحات حصرية:
- **البريد الإلكتروني للصحافة**: press@aurvexis.com
- **فريق العلاقات العامة والمؤسسية**: media-relations@aurvexis.com`,
    author: 'المكتب الإعلامي والعلاقات المؤسسية - FleetAurvexis',
    status: 'published',
    isPublishedToMarketingSite: true,
    image: corporatePressMediaCenter
  },
  {
    id: 'art-8',
    title: 'الشراكات اللوجستية والتحالفات الاستراتيجية: بناء شبكة تكامل موحدة مع كبرى شركات الشحن والتوريد وورش الصيانة المعتمدة',
    titleEn: 'Logistics Partnerships & Strategic Alliances: Unified Ecosystem with Freight Carriers, Suppliers & Certified Depots',
    category: 'الشراكات والتحالفات اللوجستية',
    categoryEn: 'Logistics Partnerships & Alliances',
    readTime: '5 دقائق قراءة',
    date: '2026-09-19',
    tags: ['الشراكات_اللوجستية', 'تحالفات_الأساطيل', 'سلاسل_الإمداد', 'شبكة_الورش_المعتمدة', 'التكامل_التقني_API'],
    summary: 'استعراض استراتيجية التحالفات الموسعة لمنصة FleetAurvexis مع مزودي قطع الغيار الأصلية، شركات الشحن البري الكبرى، ومراكز الفحص الميكانيكي لتمكين عملائنا من الحصول على خدمات متكاملة وأسعار تفضيلية موحدة.',
    content: `### مقدمة: قوة المنظومة في ترابط شبكاتها اللوجستية
في الاقتصاد المعاصر، لا تعمل الأساطيل بمعزل عن محيطها اللوجستي؛ فالنجاح الحقيقي يتطلب ترابطاً سلساً وفورياً بين ملاك الأساطيل، مستوردي قطع الغيار، شبكات الورش الميكانيكية المعتمدة، ومنصات الشحن والتوزيع الكبرى.

تؤسس **FleetAurvexis** نموذجاً متقدماً للتحالفات الاستراتيجية المفتوحة التي تمنح المشتركين ميزة تنافسية استثنائية من خلال دمج الخدمات عبر برمجيات متكاملة وآمنة.

---

### الركائز الأربع لبرنامج التحالفات اللوجستية في FleetAurvexis:

#### 1. تحالف شبكة الورش ومراكز الصيانة المعتمدة (Certified Workshop Alliance)
- **اعتماد المراكز الفنية المرموقة**: انضمام أكثر من 350 مركز صيانة وورشة متخصصة للمنظومة لتقديم خدمات الإصلاح السريع والفحص الشامل للأساطيل العابرة.
- **أوامر عمل إلكترونية موحدة**: توجيه السائقين لأقرب ورشة معتمدة عبر التطبيق مع إصدار أمر عمل رقمي فوري بأسعار تفضيلية متفق عليها مسبقاً دون الحاجة للدفع النقدي الميداني.
- **ضمان جودة الإصلاح**: إلزام الورش المعتمدة بتوثيق خطوات الإصلاح ورفع صور القطع المستبدلة قبل اعتماد إغلاق الفاتورة.

#### 2. الربط المباشر مع كبار موردي قطع الغيار الأصلية (OEM Supply Integration)
- **مكتبة قطع غيار موحدة بأسعار الجملة**: ربط المستودعات الميدانية لعملائنا بكتالوجات أكبر وكلاء وموزعي قطع الشاحنات والمعدات (مرسيدس، مان، فولفو، إيسوزو، كاتربيلر).
- **الشراء التلقائي الذكي**: عندما يصل مخزون ورشة العميل إلى الحد الأدنى، يقوم النظام بإصدار أمر شراء آلي للمورد المعتمد بأفضل سعر تسليم في السوق، مما يمنع توقف المركبات.

#### 3. التكامل مع أجهزة التتبع وعتاد إنترنت الأشياء (IoT & Telematics Partners)
- التوافق الكامل دون وسيط برمجي مع كبرى شركات تصنيع عتاد الـ GPS وحساسات الوقود والوزن (مثل Teltonika, Ruptela, Queclink).
- قراءة آنية لدرجات حرارة المبردات للشاحنات المبردة، وأوزان الحمولات لتقليل مخاطر المخالفات المرورية وحماية البنية التحتية.

#### 4. جسور الربط مع منصات الشحن والتوجيه اللوجستي (Freight Exchanges & TMS)
- مزامنة مسارات التوزيع مع أنظمة الـ TMS الكبرى لتقليل الرحلات الفارغة (Empty Return Miles) ورفع ربحية الأسطول.
- إتاحة شاشات تتبع حية للعميل النهائي بمواعيد الوصول المتوقعة (Dynamic ETA) دون الحاجة للاتصالات الهاتفية المتكررة.

---

### كيف تنضم لمنظومة شركاء FleetAurvexis؟
نرحب بكافة الجهات الفاعلة في سلاسل الإمداد والنقل البري للارتقاء بقطاع الخدمات اللوجستية:
1. **وكلاء قطع الغيار والمعدات**: لإدراج كتالوجاتكم الرقمية وخدمة آلاف المركبات النشطة.
2. **مراكز الصيانة والفحص الدوري**: للتأهيل ضمن شبكة الورش المعتمدة وتلقي أوامر عمل رقمية مستمرة.
3. **مطورو الأنظمة اللوجستية**: للاستفادة من واجهات برمجة التطبيقات المفتوحة (FleetAurvexis Open APIs).

لتقديم طلب الشراكة أو التواصل المباشر مع إدارة التحالفات:
**البريد المباشر**: alliances@aurvexis.com`,
    author: 'إدارة التحالفات وتطوير الأعمال اللوجستية - FleetAurvexis',
    status: 'published',
    isPublishedToMarketingSite: true,
    image: logisticsPartnershipsAlliances
  }
];

interface MarketingArticlesSectionProps {
  onStartTrial?: () => void;
  brandPrimaryColor?: string;
}

export default function MarketingArticlesSection({
  onStartTrial,
  brandPrimaryColor = '#6d28d9'
}: MarketingArticlesSectionProps) {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [articles, setArticles] = useState<MarketingArticle[]>(() => {
    const saved = localStorage.getItem('saas_articles_catalog');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge missing defaults such as art-5
          const existingIds = new Set(parsed.map((a: any) => a.id));
          const missing = DEFAULT_MARKETING_ARTICLES.filter(def => !existingIds.has(def.id));
          const combined = [...parsed, ...missing];
          if (missing.length > 0) {
            localStorage.setItem('saas_articles_catalog', JSON.stringify(combined));
          }
          return combined.map((art: any, index: number) => {
            const fallbackImg = CURATED_ARTICLE_IMAGES[index % CURATED_ARTICLE_IMAGES.length].url;
            return {
              ...art,
              image: art.image || art.imageUrl || fallbackImg,
              isPublishedToMarketingSite: art.isPublishedToMarketingSite !== false
            };
          });
        }
      } catch (e) {}
    }
    return DEFAULT_MARKETING_ARTICLES;
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAllArticles, setShowAllArticles] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<MarketingArticle | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [actionToast, setActionToast] = useState<string>('');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const handleSaveArticlePdf = async (article: MarketingArticle) => {
    if (!article || isExportingPdf) return;
    try {
      setIsExportingPdf(true);
      setActionToast(language === 'ar' ? '⏳ جاري تنزيل ملف PDF مباشرة في جهازك...' : '⏳ Downloading PDF file directly to device...');
      await downloadArticleAsPDF(article, language);
      setActionToast(
        language === 'ar' 
          ? '✓ تم تنزيل ملف PDF مباشرة في جهازك بترميز UTF-8 سليم' 
          : '✓ PDF file downloaded directly to your device!'
      );
      setTimeout(() => setActionToast(''), 4500);
    } catch (error) {
      console.error('Failed to export article PDF:', error);
      setActionToast(language === 'ar' ? '⚠️ تعذر تحميل ملف PDF، يرجى المحاولة لاحقاً' : '⚠️ Failed to download PDF, please try again');
      setTimeout(() => setActionToast(''), 4500);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Sync with Admin panel articles updates
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('saas_articles_catalog');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const existingIds = new Set(parsed.map((a: any) => a.id));
            const missing = DEFAULT_MARKETING_ARTICLES.filter(def => !existingIds.has(def.id));
            const combined = [...parsed, ...missing];
            setArticles(combined.map((art: any, index: number) => {
              const fallbackImg = CURATED_ARTICLE_IMAGES[index % CURATED_ARTICLE_IMAGES.length].url;
              return {
                ...art,
                image: art.image || art.imageUrl || fallbackImg,
                isPublishedToMarketingSite: art.isPublishedToMarketingSite !== false
              };
            }));
          }
        } catch (e) {}
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('marketing-data-updated', handleSync);
    window.addEventListener('articles-catalog-updated', handleSync);

    const handleOpenArticleEvent = (e: any) => {
      const { articleId, category } = e.detail || {};
      if (category) {
        setActiveCategory(category);
      }
      if (articleId) {
        setArticles(currentArticles => {
          const found = currentArticles.find(a => a.id === articleId) || DEFAULT_MARKETING_ARTICLES.find(a => a.id === articleId);
          if (found) {
            setSelectedArticle(found);
          }
          return currentArticles;
        });
      }
    };
    window.addEventListener('open-article', handleOpenArticleEvent);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('marketing-data-updated', handleSync);
      window.removeEventListener('articles-catalog-updated', handleSync);
      window.removeEventListener('open-article', handleOpenArticleEvent);
    };
  }, []);

  // Filter only articles marked for public marketing display
  const publishedArticles = articles.filter(a => a.isPublishedToMarketingSite !== false && a.status !== 'draft');

  // Categories list
  const categories = [
    { id: 'all', labelAr: 'كافة المقالات', labelEn: 'All Articles' },
    { id: 'المركز الإعلامي والأخبار', labelAr: 'المركز الإعلامي والأخبار', labelEn: 'Press Room & News' },
    { id: 'الشراكات والتحالفات اللوجستية', labelAr: 'الشراكات اللوجستية والتحالفات', labelEn: 'Logistics Partnerships' },
    { id: 'أدلة وركائز الاستخدام التشغيلي', labelAr: 'أدلة الاستخدام التشغيلي', labelEn: 'Operations Guides' },
    { id: 'النقل المدرسي والتعليم', labelAr: 'المدارس والتعليم', labelEn: 'Schools & Education' },
    { id: 'صيانة وقائية وأساطيل', labelAr: 'صيانة وقائية', labelEn: 'Preventive PM' },
    { id: 'التحول الرقمي للورش', labelAr: 'التحول الرقمي والـ QR', labelEn: 'Digital Inspections' },
    { id: 'كفاءة الطاقة والتشغيل', labelAr: 'كفاءة الوقود', labelEn: 'Fuel Efficiency' },
    { id: 'فحص وتشخيص الذكاء الاصطناعي', labelAr: 'الذكاء الاصطناعي', labelEn: 'AI Diagnostics' }
  ];

  const filteredArticles = publishedArticles.filter(art => {
    if (activeCategory === 'all') return true;
    return art.category === activeCategory || (art.categoryEn && art.categoryEn.toLowerCase().includes(activeCategory.toLowerCase()));
  });

  // Default to 4 articles unless expanded or a specific category filter is active
  const isAllCategory = activeCategory === 'all';
  const displayedArticles = isAllCategory && !showAllArticles 
    ? filteredArticles.slice(0, 4) 
    : filteredArticles;

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return publishedArticles.length;
    return publishedArticles.filter(art => 
      art.category === catId || (art.categoryEn && art.categoryEn.toLowerCase().includes(catId.toLowerCase()))
    ).length;
  };

  // Native apps share trigger (WhatsApp, WA Business, Telegram, Messenger, Facebook, X, Gmail, Device)
  const handleShareArticle = async (art: MarketingArticle) => {
    setSelectedArticle(art);
    // Try native share sheet first (supported on standalone mobile browsers)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: art.title,
          text: `${art.title}\n\n${art.summary || ''}\n\nمنصة FleetAurvexis`,
          url: window.location.href
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        // If browser iframe restricts native share, fall through to our apps share modal
      }
    }
    // Open dedicated apps share drawer with direct WhatsApp, WA Business, Telegram, Messenger, X, Gmail links
    setIsShareModalOpen(true);
  };

  return (
    <section id="articles-section" className="py-14 sm:py-20 bg-slate-50/60 border-b border-purple-100/50 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-bold shadow-xs">
            <BookOpen size={13} className="text-purple-600" />
            <span>{language === 'ar' ? 'المدونة الهندسية والأدلة التشغيلية' : 'Engineering Blog & Technical Guides'}</span>
            <Sparkles size={12} className="text-amber-500 animate-pulse" />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {language === 'ar' 
              ? 'رؤى هندسية متخصصة لصيانة وإدارة أساطيل النقل' 
              : 'Actionable Technical Insights for Fleet Operations & Maintenance'}
          </h2>

          <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed">
            {language === 'ar'
              ? 'مقالات فنية وأدلة تطبيقية دورية مدعومة بالذكاء الاصطناعي مع صور احترافية لرفع جاهزية الأسطول، وترشيد استهلاك الوقود، وحوكمة الورش.'
              : 'Curated technical articles and field-tested playbooks drafted with AI assistance to optimize vehicle uptime, spare parts logistics, and maintenance audits.'}
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap pb-1">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            const count = getCategoryCount(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setShowAllArticles(false);
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 scale-[1.02]'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <span>{language === 'ar' ? cat.labelAr : cat.labelEn}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Articles Grid (4 Columns Layout, Displaying 4 Articles) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {displayedArticles.map((art, idx) => (
            <motion.article
              key={art.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => setSelectedArticle(art)}
              className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col group text-right cursor-pointer hover:-translate-y-1"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Image Container with Hover Zoom */}
              <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={art.image || highwayLogisticsTruck}
                  alt={art.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                
                {/* Category & Read Time Pills */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCategory(art.category);
                      setShowAllArticles(false);
                    }}
                    className="px-2 py-0.5 bg-purple-900/85 hover:bg-purple-800 backdrop-blur-md text-purple-200 text-[10px] font-bold rounded-md border border-purple-300/30 transition-colors"
                  >
                    {language === 'ar' ? art.category : (art.categoryEn || art.category)}
                  </button>
                </div>

                <div className="absolute bottom-2.5 right-3 left-3 flex items-center justify-between text-white text-[10px] font-medium">
                  <div className="flex items-center gap-1 bg-slate-900/70 backdrop-blur-md px-2 py-0.5 rounded-md">
                    <Clock size={11} className="text-purple-300" />
                    <span>{art.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-900/70 backdrop-blur-md px-2 py-0.5 rounded-md">
                    <Calendar size={11} className="text-purple-300" />
                    <span>{art.date}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  {/* SEO Tags */}
                  {art.tags && art.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {art.tags.slice(0, 2).map((tag, tIdx) => (
                        <span key={tIdx} className="text-[9.5px] text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded font-mono font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-sm sm:text-[15px] leading-snug group-hover:text-purple-700 transition-colors line-clamp-2">
                    {art.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                    {art.summary}
                  </p>
                </div>

                {/* Card Footer: Author & Read CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[10.5px] text-slate-500">
                    <Sparkles size={11} className="text-purple-500" />
                    <span className="line-clamp-1">{art.author}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 group-hover:text-purple-800 transition-colors">
                    <span>{language === 'ar' ? 'قراءة المقال' : 'Read'}</span>
                    <ArrowRight size={13} className={`${isRtl ? 'rotate-180' : ''} transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform`} />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View More / View Less Button if 'all' category has more than 4 articles */}
        {isAllCategory && filteredArticles.length > 4 && (
          <div className="flex items-center justify-center pt-2">
            <button
              type="button"
              onClick={() => setShowAllArticles(prev => !prev)}
              className="px-6 py-2.5 bg-white hover:bg-purple-50 text-purple-700 hover:text-purple-800 border border-purple-200/80 rounded-2xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>
                {showAllArticles 
                  ? (language === 'ar' ? 'عرض أقل (إظهار 4 مقالات فقط)' : 'Show Less (4 Articles Only)')
                  : (language === 'ar' ? `تصفح باقي المقالات (${filteredArticles.length - 4} مقالات إضافية)` : `View Remaining Articles (+${filteredArticles.length - 4} more)`)}
              </span>
              <ChevronDown size={14} className={`transform transition-transform duration-300 ${showAllArticles ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
            <BookOpen size={36} className="mx-auto text-purple-400 opacity-60" />
            <h4 className="text-base font-bold text-slate-800">
              {language === 'ar' ? 'لا توجد مقالات منشورة في هذا التصنيف حالياً' : 'No articles available in this category yet'}
            </h4>
            <p className="text-xs text-slate-500">
              {language === 'ar' ? 'يمكنك تصفح كافة التصنيفات الأخرى أو توليد مقالات جديدة عبر استوديو المقالات في لوحة الإدارة.' : 'Check back soon or generate new articles via the Admin Studio.'}
            </p>
          </div>
        )}

      </div>

      {/* Interactive Full Article Reader Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-xl w-full max-h-[82vh] overflow-hidden flex flex-col border border-purple-100 shadow-2xl relative my-auto"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Modal Header Cover Image (Compact & Elegant) */}
              <div className="relative h-36 sm:h-44 w-full bg-slate-900 overflow-hidden shrink-0">
                <img
                  src={selectedArticle.image || highwayLogisticsTruck}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer z-20 border border-white/20`}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>

                {/* Article Header Metadata */}
                <div className="absolute bottom-3 inset-x-4 space-y-1 text-white text-right">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-purple-600/95 text-white text-[10.5px] font-bold rounded-lg backdrop-blur-xs">
                      {selectedArticle.category}
                    </span>
                    <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-mono rounded-lg backdrop-blur-xs flex items-center gap-1">
                      <Clock size={11} />
                      <span>{selectedArticle.readTime}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-mono rounded-lg backdrop-blur-xs flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{selectedArticle.date}</span>
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-black leading-snug text-white drop-shadow-sm line-clamp-2">
                    {selectedArticle.title}
                  </h2>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-right">
                
                {/* Toolbar (Share Article Only) */}
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      {/* Apps Share Button */}
                      <button
                        type="button"
                        onClick={() => handleShareArticle(selectedArticle)}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        title={language === 'ar' ? 'مشاركة مقال عبر التطبيقات والروابط' : 'Share article'}
                      >
                        <Share2 size={13} />
                        <span>{language === 'ar' ? 'مشاركة مقال' : 'Share Article'}</span>
                      </button>

                      {/* Direct PDF Download Button */}
                      <button
                        type="button"
                        disabled={isExportingPdf}
                        onClick={() => handleSaveArticlePdf(selectedArticle)}
                        className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-700 hover:text-purple-800 border border-purple-200 hover:border-purple-300 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        title={language === 'ar' ? 'تحميل PDF مباشرة في جهازك بترميز UTF-8' : 'Download PDF directly to your device'}
                      >
                        {isExportingPdf ? (
                          <Loader2 size={13} className="animate-spin text-purple-600" />
                        ) : (
                          <FileDown size={13} className="text-purple-600" />
                        )}
                        <span>
                          {isExportingPdf
                            ? (language === 'ar' ? 'جاري التحميل...' : 'Downloading...')
                            : (language === 'ar' ? 'تحميل PDF' : 'Download PDF')}
                        </span>
                      </button>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-purple-600" />
                      <span>{language === 'ar' ? 'الناشر الرسمي:' : 'Author:'}</span>
                      <strong className="text-slate-800">{selectedArticle.author}</strong>
                    </div>
                  </div>

                  {/* Feedback Toast Notification Banner */}
                  {actionToast && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs"
                    >
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                      <span>{actionToast}</span>
                    </motion.div>
                  )}
                </div>

                {/* Executive Summary Callout */}
                <div className="bg-purple-50/70 border-r-4 border-purple-600 p-4 rounded-xl text-slate-700 text-xs sm:text-sm leading-relaxed">
                  <span className="font-black text-purple-900 block mb-1 text-xs">
                    {language === 'ar' ? '💡 ملخص ومستخلص المقال:' : 'Executive Abstract:'}
                  </span>
                  {selectedArticle.summary}
                </div>

                {/* Full Article Text */}
                <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed whitespace-pre-line font-sans space-y-3">
                  {selectedArticle.content}
                </div>

                {/* SEO Tags */}
                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400 font-bold">{language === 'ar' ? 'الوسوم والكلمات المفتاحية:' : 'Tags:'}</span>
                    {selectedArticle.tags.map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-purple-700 rounded-lg text-xs font-mono font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Conversion In-Article CTA Banner */}
                <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white rounded-2xl p-6 text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <h4 className="font-black text-base md:text-lg text-white">
                      {language === 'ar' ? 'هل ترغب في تطبيق هذه المعايير على أسطولك؟' : 'Ready to apply these practices to your fleet?'}
                    </h4>
                    <p className="text-xs text-purple-200/90 leading-relaxed">
                      {language === 'ar' 
                        ? 'احجز عرضاً تجريبياً مجانياً واكتشف كيف يساعدك نظام FleetAurvexis في حوكمة الصيانة وخفض التكاليف.' 
                        : 'Schedule a dynamic demo and see FleetAurvexis diagnostics in real-world action.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedArticle(null);
                      if (onStartTrial) onStartTrial();
                    }}
                    className="px-6 py-3 bg-white text-purple-900 hover:bg-purple-50 font-black rounded-xl text-xs shadow-md transition cursor-pointer shrink-0"
                  >
                    {language === 'ar' ? 'ابدأ تجربة مجانية الآن' : 'Start Free Trial'}
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apps Sharing Sheet (WhatsApp, WA Business, Telegram, Messenger, Facebook, X, Gmail, Device) */}
      <ArticleShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        article={selectedArticle}
        language={language}
      />
    </section>
  );
}
