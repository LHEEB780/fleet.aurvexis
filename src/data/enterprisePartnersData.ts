import highwayLogisticsTruck from '../assets/images/highway_logistics_truck_1782935190395.jpg';
import enterpriseFleetDepot from '../assets/images/enterprise_fleet_depot_1782935136613.jpg';
import driverTruckInspection from '../assets/images/driver_truck_inspection_1786784371761.jpg';
import dieselMaintenance from '../assets/images/diesel_maintenance_1783750031121.jpg';
import mechanicTruckWorkshop from '../assets/images/mechanic_truck_workshop_1782935168167.jpg';
import hydraulicServicing from '../assets/images/hydraulic_servicing_1783750041949.jpg';
import aiFleetDiagnostics from '../assets/images/ai_fleet_diagnostics_1786785439472.jpg';
import constructionHeavyMachinery from '../assets/images/construction_heavy_machinery_1782935156246.jpg';
import municipalCleanFleet from '../assets/images/municipal_clean_fleet_1782935178050.jpg';
import municipalWorkshopParts from '../assets/images/municipal_workshop_parts_1786785099442.jpg';

export interface PartnerMetric {
  labelAr: string;
  labelEn: string;
  value: string;
}

export interface PartnerQuote {
  textAr: string;
  textEn: string;
  authorAr: string;
  authorEn: string;
  roleAr: string;
  roleEn: string;
}

export interface EnterprisePartner {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  industryAr: string;
  industryEn: string;
  rating: number;
  yearJoint: string;
  activeVehicles: string;
  logoSeed: string;
  colorClass?: string;
  bgLight?: string;
  bgDark?: string;
  badgeBg?: string;
  avatarBg?: string;
  image: string;
  articleTitleAr: string;
  articleTitleEn: string;
  articleSummaryAr: string;
  articleSummaryEn: string;
  articleContentAr: string;
  articleContentEn: string;
  metrics: PartnerMetric[];
  quote?: PartnerQuote;
  updatedAt?: string;
}

export const CURATED_PARTNER_IMAGES = [
  { id: 'highway-truck', url: highwayLogisticsTruck, labelAr: 'شاحنات النقل اللوجستي السريع', labelEn: 'Express Logistics Highway Trucks' },
  { id: 'enterprise-depot', url: enterpriseFleetDepot, labelAr: 'مستودع ومرآب الأساطيل المركزية', labelEn: 'Central Fleet Operations Depot' },
  { id: 'driver-inspection', url: driverTruckInspection, labelAr: 'فحص السائق وبطاقة الـ QR', labelEn: 'Driver QR & Mobile Inspection' },
  { id: 'diesel-maintenance', url: dieselMaintenance, labelAr: 'صيانة محركات الديزل الثقيلة', labelEn: 'Heavy Diesel Engine Overhaul' },
  { id: 'mechanic-workshop', url: mechanicTruckWorkshop, labelAr: 'ورش الميكانيكا المتقدمة', labelEn: 'Advanced Fleet Workshop' },
  { id: 'hydraulic-servicing', url: hydraulicServicing, labelAr: 'خدمات الهيدروليك والمكابح', labelEn: 'Hydraulic & Brake Servicing' },
  { id: 'ai-diagnostics', url: aiFleetDiagnostics, labelAr: 'حساسات وتشخيص الذكاء الاصطناعي', labelEn: 'AI Diagnostics & OBD Sensors' },
  { id: 'construction-machinery', url: constructionHeavyMachinery, labelAr: 'معدات التشييد والإنشاءات', labelEn: 'Heavy Construction Machinery' },
  { id: 'municipal-fleet', url: municipalCleanFleet, labelAr: 'أساطيل الخدمات البلدية والبيئية', labelEn: 'Municipal & Eco Clean Fleet' },
  { id: 'workshop-parts', url: municipalWorkshopParts, labelAr: 'مستودعات قطع الغيار والإطارات', labelEn: 'Spare Parts Inventory Hub' }
];

export const DEFAULT_ENTERPRISE_PARTNERS: EnterprisePartner[] = [
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
    colorClass: 'text-brand-blue-600 bg-brand-blue-50 border-brand-blue-100 dark:bg-brand-blue-950/30',
    bgLight: 'bg-sky-50/70 hover:bg-sky-50 hover:shadow-sky-50 border-sky-100 hover:border-sky-300 text-sky-900',
    bgDark: 'dark:bg-sky-950/20 dark:border-sky-900/30 dark:hover:border-sky-800',
    badgeBg: 'text-sky-700 bg-sky-100 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/30',
    avatarBg: 'bg-sky-600 text-white shadow-sky-100',
    image: highwayLogisticsTruck,
    articleTitleAr: 'كيف ضاعفت مؤسسة الغد للشحن الذكي جاهزية أسطول الـ 1,200 شاحنة وخفضت نفقات الإصلاح 35% عبر FleetAurvexis',
    articleTitleEn: 'How Al-Ghad Smart Transport Boosted 1,200 Fleet Uptime & Slashed Maintenance Costs by 35%',
    articleSummaryAr: 'دراسة حالة توثق رحلة التحول من الفحص الورقي التقليدي إلى حوكمة الفحص الميداني بباركود QR وتتبع استهلاك قطع الغيار لـ 1,200 شاحنة نقل لوجستي سريعة.',
    articleSummaryEn: 'A comprehensive field study documenting the transition from manual clipboards to governed QR barcode mobile checkups across 1,200 express highway freight trucks.',
    articleContentAr: `### ملخص التجربة التشغيلية
تُعد "مؤسسة الغد للشحن الذكي" واحدة من كبرى شركات سلاسل الإمداد اللوجستية التي تغطي شبكتها كافة مناطق المملكة والخليج العربي بأسطول يتجاوز 1,200 شاحنة ومقطورة ثقيلة. واجهت المؤسسة تحدياً رئيسياً يتمثل في تباين تقارير السائقين عن الأعطال، وتأخر وصول الشاحنات للصيانة الوقائية، مما كان يتسبب في أعطال مفاجئة على الطرق السريعة وارتفاع كلفة الشحن البديل.

### التحديات قبل تطبيق FleetAurvexis:
1. **تراكم الفحوصات الورقية**: كانت كشوفات الفحص تستغرق أكثر من يومين للوصول من السائق الميداني إلى مهندس الورشة المركزية.
2. **غياب التنبؤ بالأعطال**: غياب الربط اللحظي بين قراءات العدادات ومواعيد استبدال الزيوت والفلاتر.
3. **ارتفاع هدر مستودع القطع**: طلب قطع غيار مكررة لعدم وجود توثيق رقمي فوري لتاريخ استبدال كل قطعة لكل شاحنة.

### الحلول الرقمية المنفذة:
- **تفعيل بطاقة الفحص الذكية بـ QR**: تم تثبيت ملصق QR مقاوم للعوامل الجوية على كل شاحنة، يمسحه السائق بكاميرا الجوال لإتمام الفحص الإلزامي في 15 ثانية مع دعم التسجيل الصوتي لملاحظات الأعطال.
- **أتمتة جدول الصيانة الدورية**: بناء روزنامة ذكية ترسل إشعارات استباقية عند اقتراب موعد الصيانة بناءً على الكيلومترات المقطوعة.
- **حوكمة مستودع قطع الغيار**: ربط صرف قطع الغيار مباشرة برقم الشاسيه ورقم أمر العمل المعتمد في المنصة.

### النتائج الميدانية المحققة:
- خفض أعطال المحركات الطارئة على الطرق السريعة بنسبة **35%**.
- رفع معدل الجاهزية التشغيلية اليومية للأسطول إلى **99.2%**.
- توفير أكثر من **1.4 مليون ريال** سنوياً من تكاليف الإصلاحات الطارئة وقطع الغيار المفقودة.
- تقليص وقت معالجة أوامر العمل في الورش من 4.5 ساعة إلى **45 دقيقة فقط**.`,
    articleContentEn: `### Executive Operational Overview
Al-Ghad Smart Transport operates one of the region's premier logistics fleets, managing over 1,200 commercial trucks across national transit corridors. Prior to adopting FleetAurvexis, manual paper logs and delayed mechanic handovers caused unexpected road stoppages and excessive spare parts consumption.

### Key Deployment Solutions:
- **Instant QR Inspection Badges**: Ruggedized barcode stickers assigned to every vehicle cabin, enabling drivers to complete compliance safety walks in 15 seconds with voice memos.
- **Automated Odometer-Triggered Preventive Maintenance**: Real-time sync preventing scheduled maintenance lapses.
- **Unified Inventory Governance**: Zero spare parts issued without an authenticated digital work order tagged to the vehicle VIN.

### Measurable Field Outcomes:
- **35% Reduction** in roadside breakdown interventions.
- **99.2% Daily Fleet Uptime** sustained across peak seasons.
- **1.4M SAR Saved** annually in mitigated catastrophic failures and streamline parts utilization.`,
    metrics: [
      { labelAr: 'خفض تكاليف الصيانة الطارئة', labelEn: 'PM Cost Reduction', value: '35%' },
      { labelAr: 'معدل الجاهزية اليومية للأسطول', labelEn: 'Daily Fleet Uptime', value: '99.2%' },
      { labelAr: 'زمن الفحص الميداني لكل سائق', labelEn: 'Inspection Duration', value: '15 ثانية' },
      { labelAr: 'إجمالي الشاحنات النشطة', labelEn: 'Active Heavy Trucks', value: '1,200' }
    ],
    quote: {
      textAr: 'منصة FleetAurvexis لم تكن مجرد برنامج صيانة، بل كانت التحول الجذري في أمان أسطولنا وربط 1,200 سائق بالورشة المركزية لحظة بلحظة.',
      textEn: 'FleetAurvexis completely redefined our operational standard, seamlessly syncing 1,200 highway drivers with our core maintenance command desk in real time.',
      authorAr: 'م. فهد الزهراني',
      authorEn: 'Eng. Fahad Al-Zahrani',
      roleAr: 'نائب الرئيس للعمليات اللوجستية',
      roleEn: 'VP of Fleet Operations'
    }
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
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30',
    bgLight: 'bg-emerald-50/70 hover:bg-emerald-50 hover:shadow-emerald-50 border-emerald-100 hover:border-emerald-300 text-emerald-900',
    bgDark: 'dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:hover:border-emerald-800',
    badgeBg: 'text-emerald-700 bg-emerald-100 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/30',
    avatarBg: 'bg-emerald-600 text-white shadow-emerald-100',
    image: enterpriseFleetDepot,
    articleTitleAr: 'أتمتة صيانة أسطول الخدمات البيئية والهجينة: تجربة فيوتشر تراك في حوكمة 450 آلية متخصصة',
    articleTitleEn: 'Automating Hybrid Environmental Fleet Care: FutureTrack Case Study on 450 Heavy Assets',
    articleSummaryAr: 'حوكمة أوامر الصيانة الدورية واستبدال السوائل وفلاتر الهواء للمعدات البيئية الشاقة لضمان استمرارية العمل على مدار الساعة دون توقف.',
    articleSummaryEn: 'Governance of scheduled servicing, fluid cycles, and air filtration for 450 municipal and heavy environmental vehicles ensuring 24/7 continuous city service.',
    articleContentAr: `### بيئة العمل والتحدي الفني
تعمل شاحنات ومعدات شركة فيوتشر تراك في بيئات تشغيلية قاسية تتطلب دورات صيانة مكثفة لمنظومات الهيدروليك، مكابس المخلفات، ومحركات الديزل الصديقة للبيئة. كان التحدي الأكبر يتمثل في منع تسرب السوائل الهيدروليكية وحماية الفلاتر من الانسداد المفاجئ أثناء العمليات الميدانية المستمرة في المدن.

### الحل المنفذ عبر المنصة:
- وضع قوائم فحص مخصصة للمعدات البيئية تشمل فحص أذرع الهيدروليك، ضغط الزيت، ودرجات حرارة المحرك.
- تصوير الأعطال من قبل المشغلين ورفعها فوراً في أمر العمل مع توثيق العلامات الميكانيكية.
- جدولة مواعيد غسيل الفلاتر وتبديل السوائل الحيوية بتنبيهات آلية للمهندس المشرف.

### ثمار الشراكة:
- انخفاض الحوادث والأعطال الهيدروليكية الميدانية بنسبة **40%**.
- توفير **28%** في استهلاك المحروقات عبر معايرة حقن الوقود وصيانة منظومات العادم.
- حيازة الشركة على شهادات الامتثال البيئي ومعايير الآيزو بسهولة بفضل السجلات الرقمية الموثقة.`,
    articleContentEn: `### Operational Environment
FutureTrack deploys municipal eco-collection vehicles and hybrid transit machinery operating in rigorous urban duty cycles. Hydraulic seal integrity and particulate filtration demands were paramount.

### Implementation:
- Tailored digital safety checklists assessing hydraulic cylinder seals, auxiliary power units, and emissions sensors.
- Real-time photo uploads of wear patterns straight into active mechanic dispatch tickets.
- Automated service triggers pegged to engine running hours rather than static calendar intervals.

### Tangible Outcomes:
- **40% Drop** in hydraulic line failures.
- **28% Fuel Efficiency Gain** via proactive injector calibration and clean filtration schedules.
- Seamless audit pass rates with government municipality inspectors.`,
    metrics: [
      { labelAr: 'انخفاض أعطال الهيدروليك', labelEn: 'Hydraulic Failures Down', value: '40%' },
      { labelAr: 'توفير في استهلاك الوقود', labelEn: 'Fuel Consumption Saved', value: '28%' },
      { labelAr: 'معدات بيئية مخدومة', labelEn: 'Governed Eco Vehicles', value: '450' },
      { labelAr: 'نسبة الامتثال البيئي', labelEn: 'Eco Audit Compliance', value: '100%' }
    ],
    quote: {
      textAr: 'المنصة وفّرت لفريقنا الهندسي إشرافاً دقيقاً على كل ساعة عمل للمعدات الثقيلة، وألغت تماماً أي مفاجآت في أعطال الضاغطات والهيدروليك.',
      textEn: 'FleetAurvexis gave our engineering squad microscopic visibility into heavy machinery operating hours, eliminating surprise pump failures.',
      authorAr: 'الأستاذ بندر الدوسري',
      authorEn: 'Bandar Al-Dossari',
      roleAr: 'مدير الصيانة والشؤون الفنية',
      roleEn: 'Fleet Technical Director'
    }
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
    colorClass: 'text-sky-600 bg-sky-50 border-sky-100 dark:bg-sky-950/30',
    bgLight: 'bg-indigo-50/70 hover:bg-indigo-50 hover:shadow-indigo-50 border-indigo-100 hover:border-indigo-300 text-indigo-900',
    bgDark: 'dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:hover:border-indigo-800',
    badgeBg: 'text-indigo-700 bg-indigo-100 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900/30',
    avatarBg: 'bg-indigo-600 text-white shadow-indigo-100',
    image: driverTruckInspection,
    articleTitleAr: 'ربط السائقين بالورشة الميكانيكية لحظياً: قصة نجاح المسار المستدام في خفض زمن توقف 820 شاحنة',
    articleTitleEn: 'Connecting Road Drivers to Workshop Desks: Sustainable Cargo 820 Fleet Success Story',
    articleSummaryAr: 'استخدام بطاقات الفحص الفنية بالهاتف المحمول والبلاغات الصوتية الفورية لحل الشكاوى الميكانيكية وتفادي تفاقم الأعطال على الطرق السريعة.',
    articleSummaryEn: 'Mobilizing road pilots with smartphone QR inspections and instant voice memo reporting, preventing minor brake and tire defects from escalating.',
    articleContentAr: `### التحدي التشغيلي لنقل البضائع الصناعية
تنقل شاحنات "المسار المستدام" حمولات صناعية ثقيلة تتطلب فحصاً صارماً لمنظومات الفرامل الهوائية، سلامة الإطارات، ومحاور المقطورات. كان السائقون يترددون في كتابة تقارير الأعطال البسيطة خوفاً من تعطيل جدول الرحلة، مما يؤدي لاحقاً لأعطال فادحة.

### استراتيجية الحل الذكي:
- تبسيط فحص السائق ليصبح عبر مسح باركود وتأكيد سلامة 6 نقاط فنية أساسية في ثوانٍ.
- إمكانية تسجيل ملاحظة صوتية بالهاتف من السائق تترجم فوراً في لوحة تحكم مهندس الورشة.
- إنشاء مسار سريع (Express Lane) في الورشة للشاحنات التي رصد سائقوها تنبيهات خفيفة لحلها فور وصولها في أقل من 20 دقيقة.

### المؤشرات والأرقام:
- تسريع دورة تسليم واستلام أوامر الصيانة بنسبة **42%**.
- تدريب **820 سائقاً** على ثقافة الفحص الوقائي عبر الهاتف دون الحاجة لأي تدريب تقني معقد.
- توفير **45 دقيقة يومياً** لكل شاحنة في زمن تسليم واستلام الفحص الصباحي.`,
    articleContentEn: `### The Industrial Cargo Challenge
Transporting heavy manufacturing freight across vast deserts requires ironclad brake safety, tire integrity checks, and suspension tracking. Drivers previously avoided bureaucratic paperwork for minor vibrations, triggering severe breakdowns later.

### Strategic Implementation:
- 6-point visual touch inspection verified via mobile QR scans.
- Speech-to-text driver voice reporting routing complaints immediately to workshop triage bays.
- Fast-track express lanes servicing flagged trucks in under 20 minutes before departure.

### Impact Metrics:
- **42% Acceleration** in work order completion rates.
- **820 Drivers** certified on daily mobile preventative checks.
- **45 Minutes Saved Daily** per truck at dispatch departure terminals.`,
    metrics: [
      { labelAr: 'تسريع معالجة أوامر العمل', labelEn: 'Work Order Speedup', value: '42%' },
      { labelAr: 'سائقين معتمدين على QR', labelEn: 'Certified QR Drivers', value: '820' },
      { labelAr: 'وقت موفر يومياً لكل شاحنة', labelEn: 'Daily Time Saved', value: '45 دقيقة' },
      { labelAr: 'معدل الحوادث الميكانيكية', labelEn: 'Mechanical Failures', value: '0.1%' }
    ],
    quote: {
      textAr: 'خاصية التسجيل الصوتي للأعطال ومسح الـ QR أزالت الحاجز بين السائق والميكانيكي، فأصبح السائق هو خط الدفاع الأول عن سلامة شاحنته.',
      textEn: 'The voice memos and QR scans removed all friction between drivers and technicians, turning our road operators into proactive safety sentinels.',
      authorAr: 'المهندس عبدالرحمن العتيبي',
      authorEn: 'Eng. Abdulrahman Al-Otaibi',
      roleAr: 'مدير العمليات اللوجستية',
      roleEn: 'Director of Logistics'
    }
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
    colorClass: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/30',
    bgLight: 'bg-amber-50/70 hover:bg-amber-50 hover:shadow-amber-50 border-amber-100 hover:border-amber-300 text-amber-900',
    bgDark: 'dark:bg-amber-950/20 dark:border-amber-900/30 dark:hover:border-amber-800',
    badgeBg: 'text-amber-700 bg-amber-100 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/30',
    avatarBg: 'bg-amber-600 text-white shadow-amber-100',
    image: dieselMaintenance,
    articleTitleAr: 'معايير السلامة وصيانة منظومات الحقن والفرامل في أساطيل نقل المواد الطاقية الحساسة',
    articleTitleEn: 'Precision Maintenance for Hazardous Energy Transporters: TransOrbit Case Study',
    articleSummaryAr: 'تطبيق جداول الصيانة التنبؤية لمحركات الديزل الثقيلة وحساسات ضغط الإطارات لمنع أي توقف غير مخطط لصهاريج وشاحنات نقل الطاقة.',
    articleSummaryEn: 'Deploying predictive diesel engine calibration, dual-circuit brake checks, and valve governance on 310 specialized fuel and energy transport tankers.',
    articleContentAr: `### متطلبات أمان قصوى لنقل المواد الخطرة
لا تحتمل صهاريج نقل الوقود والغاز المسال أي هامش للخطأ. تتطلب اللوائح التنظيمية فحصاً دقيقاً لسلامة الصمامات، منظومات تفريغ الشحنات الساكنة، وحرارة الإطارات والمكابح قبل كل رحلة انطلاق.

### الحل المتقدم:
- تخصيص مسار فحص معتمد يطابق اشتراطات هيئة النقل والدفاع المدني.
- تتبع تاريخ استبدال بطانات الفرامل وحساسات الـ ABS رقمياً، مع منع خروج أي صهريج لم يجتز الفحص الفني المعتمد في التطبيق.
- ربط فوري بين الورشة والمكتب التنفيذي للسلامة لمراقبة أي تسريب أو خلل وقائي.

### المؤشرات المحققة:
- تحقيق نسبة **100%** في الامتثال لمعايير السلامة والنقل المتخصص.
- حماية **310 صهاريج وقاطرة** من أي حوادث حرارية أو تسريبات طارئة.
- توفير **30%** في تكاليف قطع الغيار عبر الشراء المخطط مسبقاً بناءً على قراءات الاهتراء.`,
    articleContentEn: `### Extreme Safety Standards for Hazmat Energy
Liquefied gas and fuel transit demands zero tolerance for equipment degradation. Anti-static grounding, pneumatic pressure, and brake thermal thresholds must be validated before every transit dispatch.

### Advanced Solution Architecture:
- Digital compliance gatekeepers preventing dispatch without an authenticated clearance seal.
- Odometer & thermal sensor integration prioritizing brake pads and tire replacements ahead of failure curves.
- Instant incident escalation directly to corporate safety and compliance directors.

### Tangible Metrics:
- **100% Compliance** rating across international hazmat transportation standards.
- **310 Tanker Units** shielded with zero safety downtime incidents.
- **30% Spare Parts Procurement Savings** achieved through batch predictive ordering.`,
    metrics: [
      { labelAr: 'الامتثال لمعايير السلامة', labelEn: 'Safety Compliance', value: '100%' },
      { labelAr: 'صهاريج وقاطرات مراقبة', labelEn: 'Governed Hazmat Tankers', value: '310' },
      { labelAr: 'توفير في قطع الغيار الاستباقية', labelEn: 'Preventative Parts Savings', value: '30%' },
      { labelAr: 'معدل الحوادث الحرارية', labelEn: 'Thermal Incidents', value: '0%' }
    ],
    quote: {
      textAr: 'في نقل المواد الطاقية، الصيانة الاستباقية ليست خياراً بل مسألة حياة وسلامة عامة. نظام FleetAurvexis منحنا راحة البال التامة.',
      textEn: 'In hazmat energy distribution, proactive maintenance is a matter of absolute safety. FleetAurvexis delivers total structural peace of mind.',
      authorAr: 'الكابتن طارق السليمان',
      authorEn: 'Capt. Tariq Al-Sulaiman',
      roleAr: 'رئيس قسم السلامة والنقل المتخصص',
      roleEn: 'Head of Fleet Safety & Compliance'
    }
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
    colorClass: 'text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-950/30',
    bgLight: 'bg-purple-50/70 hover:bg-purple-50 hover:shadow-purple-50 border-purple-100 hover:border-purple-300 text-purple-900',
    bgDark: 'dark:bg-purple-950/20 dark:border-purple-900/30 dark:hover:border-purple-800',
    badgeBg: 'text-purple-700 bg-purple-100 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900/30',
    avatarBg: 'bg-purple-600 text-white shadow-purple-100',
    image: mechanicTruckWorkshop,
    articleTitleAr: 'إدارة ورش الصيانة المركزية وتتبع أعمار الإطارات والمحاور لشاحنات المسافات الطويلة',
    articleTitleEn: 'Central Workshop Overhaul & Tire Lifespan Optimization for Long-Haul Fleets',
    articleSummaryAr: 'منظومة متكاملة لربط مستودع قطع الغيار وأوامر الإصلاح الدقيقة لرفع الكفاءة التشغيلية لأسطول الشحن الإقليمي وتدوير الإطارات.',
    articleSummaryEn: 'A unified digital management system coordinating mechanics, tire rotation cycles, and central hub parts tracking for long-distance transport rigs.',
    articleContentAr: `### تحديات تآكل الإطارات وتكاليف الورشة المركزية
تمثل الإطارات والمحاور ثاني أكبر كلفة تشغيلية بعد الوقود في شاحنات المسافات الطويلة. كان غياب سجل رقمي دقيق لتدوير الإطارات وضبط زوايا العجلات يتسبب في تلف الإطارات قبل انقضاء نصف عمرها الافتراضي.

### الحل المطبق:
- تتبع الرقم التسلسلي لكل إطار على كل محور وتعيين مواعيد ذكية للتدوير والمحاذاة.
- تسجيل قراءات عمق المداس (Tread Depth) وضغط الهواء بصفة دورية في بطاقة فحص المركبة.
- تقارير تكاليف الصيانة الشهرية ومقارنة استهلاك كل قاطرة لتحديد المركبات الأكثر استنزافاً للميزانية.

### النتائج المتحققة:
- زيادة العمر التشغيلي للإطارات بنسبة **30%** بفضل التدوير المنضبط.
- تقليل وقت وقوف الشاحنات في الورشة المركزية بمعدل **3.5 أيام شهرياً**.
- حوكمة كاملة لمشتريات القطع والزيوت وتوليد تقارير مالية شفافة بضغطة زر.`,
    articleContentEn: `### Tire Wear Dynamics & Central Workshop Outlays
Tire depreciation and axle alignment represent the second largest operating overhead in long-haul shipping. Unrecorded rotations routinely cut tire lifespans in half.

### Implemented Architecture:
- Serialized axle-by-axle tire tracking triggering automated rotation and balancing milestones.
- Periodic digital logging of tread depths and cold tire inflation readings.
- Asset-level total cost of ownership (TCO) dashboards pinpointing maintenance cost drivers.

### Verified Results:
- **30% Extended Tire Service Lifespan** via strict preventive rotations.
- **3.5 Days Saved** in monthly average garage downtime per commercial rig.
- Transparent digital auditing over lubricants and spare parts expenditures.`,
    metrics: [
      { labelAr: 'زيادة العمر الافتراضي للإطارات', labelEn: 'Extended Tire Lifespan', value: '30%' },
      { labelAr: 'أيام توقف تم إنقاذها شهرياً', labelEn: 'Monthly Uptime Saved', value: '3.5 أيام' },
      { labelAr: 'شاحنات وقواطر مربوطة', labelEn: 'Tracked Fleet Units', value: '150' },
      { labelAr: 'دقة تقارير الصيانة والقطع', labelEn: 'Audit Accuracy', value: '100%' }
    ],
    quote: {
      textAr: 'التحول إلى فحص الإطارات الرقمي وجدولة الصيانة الوقائية وفّر لشركتنا مئات الآلاف من الريالات وأعاد تنظيم ورشتنا المركزية باحترافية.',
      textEn: 'Switching to serialized tire logging and scheduled preventative care preserved hundreds of thousands in capital while professionalizing our depot.',
      authorAr: 'الأستاذ سلطان الرويلي',
      authorEn: 'Sultan Al-Ruwaili',
      roleAr: 'مدير العمليات وسلاسل الإمداد',
      roleEn: 'Supply Chain Operations Director'
    }
  }
];

/**
 * Migration helper to ensure any stored client data in localStorage or Firebase
 * is upgraded with rich images, articles, and case studies!
 */
export function migratePartners(rawList: any[]): EnterprisePartner[] {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return DEFAULT_ENTERPRISE_PARTNERS;
  }

  return rawList.map((item, idx) => {
    // Find matching default partner by ID or position
    const matchedDefault = DEFAULT_ENTERPRISE_PARTNERS.find(d => d.id === item.id) 
      || DEFAULT_ENTERPRISE_PARTNERS[idx % DEFAULT_ENTERPRISE_PARTNERS.length];

    const id = item.id || `c-${idx + 1}`;
    const name = item.name || item.nameAr || matchedDefault.name;
    const nameAr = item.nameAr || item.name || matchedDefault.nameAr;
    const nameEn = item.nameEn || matchedDefault.nameEn;
    const industryAr = item.industryAr || matchedDefault.industryAr;
    const industryEn = item.industryEn || matchedDefault.industryEn;
    const rating = typeof item.rating === 'number' ? item.rating : matchedDefault.rating;
    const yearJoint = item.yearJoint || matchedDefault.yearJoint;
    const activeVehicles = item.activeVehicles || matchedDefault.activeVehicles;
    const logoSeed = item.logoSeed || matchedDefault.logoSeed;

    // Use customized image if present, else default
    const image = item.image || item.imageUrl || matchedDefault.image;

    // Rich article and story fields
    const articleTitleAr = item.articleTitleAr || matchedDefault.articleTitleAr;
    const articleTitleEn = item.articleTitleEn || matchedDefault.articleTitleEn;
    const articleSummaryAr = item.articleSummaryAr || matchedDefault.articleSummaryAr;
    const articleSummaryEn = item.articleSummaryEn || matchedDefault.articleSummaryEn;
    const articleContentAr = item.articleContentAr || matchedDefault.articleContentAr;
    const articleContentEn = item.articleContentEn || matchedDefault.articleContentEn;

    // Metrics
    const metrics = (Array.isArray(item.metrics) && item.metrics.length > 0)
      ? item.metrics
      : matchedDefault.metrics;

    // Quote
    const quote = item.quote || matchedDefault.quote;

    return {
      ...matchedDefault,
      ...item,
      id,
      name,
      nameAr,
      nameEn,
      industryAr,
      industryEn,
      rating,
      yearJoint,
      activeVehicles,
      logoSeed,
      image,
      articleTitleAr,
      articleTitleEn,
      articleSummaryAr,
      articleSummaryEn,
      articleContentAr,
      articleContentEn,
      metrics,
      quote
    };
  });
}
