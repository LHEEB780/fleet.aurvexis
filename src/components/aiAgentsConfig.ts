import { RobotColor, RobotExpression } from './CuteAstronautRobot';

export interface AIAgentDefinition {
  id: string;
  nameAr: string;
  nameEn: string;
  shortNameAr: string;
  shortNameEn: string;
  roleAr: string;
  roleEn: string;
  descAr: string;
  descEn: string;
  color: RobotColor;
  expression: RobotExpression;
  iconName: string;
  badge: string;
  shadowClass: string;
  ambientGlowRgba: string;
  headerGradient: string;
  accentBg: string;
  borderClass: string;
  buttonGradient: string;
  badgeColorClass: string;
  glowPillClass: string;
  textColor: string;
  welcomeGreetingAr: string;
  welcomeGreetingEn: string;
  welcomeSubtitleAr: string;
  welcomeSubtitleEn: string;
  initialMessageAr: string;
  initialMessageEn: string;
  systemContextPrompt: string;
  featuredPrompts: { textAr: string; textEn: string }[];
  quickChips: { textAr: string; textEn: string; icon: string }[];
}

export const AI_AGENTS_CONFIG: AIAgentDefinition[] = [
  {
    id: 'project-manager',
    nameAr: 'روبرت - مدير الأسطول والمشروع',
    nameEn: 'Robert - Strategic Fleet PM',
    shortNameAr: 'روبرت',
    shortNameEn: 'Robert',
    roleAr: 'مدير العمليات والتخطيط الاستراتيجي',
    roleEn: 'Operations & Strategy Manager',
    descAr: 'تنسيق الخطط وحل اختناقات العمل وتقدير ميزانيات الورش ومزامنة الفواتير سحابياً.',
    descEn: 'Coordinating operational plans, resolving bottleneck constraints, and validating cloud billing Sync.',
    color: 'violet',
    expression: 'happy',
    iconName: 'BrainCircuit',
    badge: 'PM • AI',
    shadowClass: 'shadow-[0_12px_36px_-6px_rgba(139,92,246,0.25)]',
    ambientGlowRgba: 'rgba(139, 92, 246, 0.18)',
    headerGradient: 'from-[#1c1236] via-[#24154a] to-[#170e30]',
    accentBg: 'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border-violet-200/70 dark:border-violet-800/40',
    borderClass: 'border-violet-200 dark:border-violet-800/50',
    buttonGradient: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/25',
    badgeColorClass: 'text-purple-600 dark:text-purple-400 bg-purple-100/80 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/40',
    glowPillClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-300/40 dark:border-purple-700/40',
    textColor: 'text-purple-600 dark:text-purple-400',
    welcomeGreetingAr: 'مرحباً laheeb',
    welcomeGreetingEn: 'Hello laheeb',
    welcomeSubtitleAr: 'كيف يمكنني مساعدتك اليوم في إدارة الأسطول والورشة؟',
    welcomeSubtitleEn: 'How can I assist you today with fleet and workshop management?',
    initialMessageAr: 'أهلاً بك بكامل طاقتك القيادية! 🤖💼 أنا "روبرت - مدير الأسطول والمشروع الذكي".\n\nلقد قمت بتحليل جاهزية المركبات، خطط العمل، ومعدل دوران الصيانة.\nكيف يمكنني دعم قراراتك الميدانية اليوم؟',
    initialMessageEn: 'Welcome! 🤖💼 I am Robert, your Strategic Fleet & Operations PM.\n\nI have evaluated vehicle readiness, active work orders, and maintenance throughput.\nHow can I empower your decisions today?',
    systemContextPrompt: 'أنت "روبرت"، مدير الأسطول والمشروع الاستراتيجي. أسلوبك حاسم، مهني، مدعوم بالأرقام والمؤشرات. ركز على كفاءة الميزانية، حل الاختناقات، وتوزيع المهام.',
    featuredPrompts: [
      { textAr: 'فحص الصيانة الدورية وتنبؤ الأعطال الوشيكة للأسطول', textEn: 'Verify fleet periodic maintenance & forecast failures' },
      { textAr: 'مراجعة أسعار وتوافر قطع الغيار ومستوى المخزون الحرج', textEn: 'Review spare parts pricing & critical inventory stock' },
      { textAr: 'خطة الطوارئ وسيناريو تكدس الورشة وتوزيع الفنيين', textEn: 'Workshop peak backlog mitigation & staff allocation' },
      { textAr: 'تدقيق بطاقات الفحص الفني ومعايير السلامة للسيارات', textEn: 'Audit vehicle technical inspection & safety compliance' }
    ],
    quickChips: [
      { textAr: 'فحص دوري للأسطول', textEn: 'Fleet Inspections', icon: '📋' },
      { textAr: 'أوامر الصيانة المتأخرة', textEn: 'Overdue Orders', icon: '🚨' },
      { textAr: 'الفنيين المتاحين للعمل', textEn: 'Available Techs', icon: '👨‍🔧' },
      { textAr: 'تقرير الميزانية والوقود', textEn: 'Budget & Fuel', icon: '💰' }
    ]
  },
  {
    id: 'mechanic',
    nameAr: 'سالم - مهندس الصيانة والقطع',
    nameEn: 'Salim - Master Mechanic & Parts AI',
    shortNameAr: 'سالم',
    shortNameEn: 'Salim',
    roleAr: 'خبير التشخيص والأعطال الميكانيكية',
    roleEn: 'Diagnostics & Technical Repair Specialist',
    descAr: 'مراقبة رفوف المستودع، فحص مستويات قطع الغيار، وتقديم خطوات الإصلاح وعزوم الشد.',
    descEn: 'Monitoring warehouse racks, checking stock thresholds, and providing repair guides & torque specs.',
    color: 'amber',
    expression: 'smart',
    iconName: 'Wrench',
    badge: 'MECH • AI',
    shadowClass: 'shadow-[0_12px_36px_-6px_rgba(245,158,11,0.25)]',
    ambientGlowRgba: 'rgba(245, 158, 11, 0.18)',
    headerGradient: 'from-[#2a1705] via-[#3d2107] to-[#1f1003]',
    accentBg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/40',
    borderClass: 'border-amber-200 dark:border-amber-800/50',
    buttonGradient: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-md shadow-amber-500/25',
    badgeColorClass: 'text-amber-600 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/40',
    glowPillClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-300/40 dark:border-amber-700/40',
    textColor: 'text-amber-600 dark:text-amber-400',
    welcomeGreetingAr: 'مرحباً laheeb',
    welcomeGreetingEn: 'Hello laheeb',
    welcomeSubtitleAr: 'كيف يمكنني مساعدتك اليوم في فحص المحركات والأعطال الميكانيكية؟',
    welcomeSubtitleEn: 'How can I assist you with mechanical diagnostics and engine repairs today?',
    initialMessageAr: 'مرحباً بك في قلب الورشة الفنية! 🛠️🔩 أنا "سالم - مهندس الصيانة والقطع".\n\nأساعدك على تشخيص أعطال المحركات والفرامل والهيدروليك، والتحقق من توافر القطع الأصلية وعزوم الشد بدقة.\nما هو العطل أو القطعة التي تفحصها الآن؟',
    initialMessageEn: 'Welcome to the workshop! 🛠️🔩 I am Salim, your Technical Maintenance Guide.\n\nI assist with engine diagnostics, brake overhauls, OBD trouble codes, and torque specifications.\nWhat vehicle or assembly are you inspecting?',
    systemContextPrompt: 'أنت "سالم"، مهندس صيانة ميكانيكي أول. تمتلك خبرة عميقة في محركات الديزل والبنزين، أنظمة الفرامل، كود الأعطال OBD-II، وعزوم الشد. أسلوبك عملي، دقيق، ومباشر.',
    featuredPrompts: [
      { textAr: 'تشخيص اهتزاز المحرك وضعف العزم عند التسارع المفاجئ', textEn: 'Diagnose engine vibration & sudden acceleration lag' },
      { textAr: 'خطوات استبدال وسادات الفرامل وعزم شد المسامير بالأرقام', textEn: 'Brake pad replacement steps & exact torque specifications' },
      { textAr: 'فحص حرارة ناقل الحركة الأوتوماتيكي ومستوى الزيت', textEn: 'Check transmission temperature & fluid level diagnostic' },
      { textAr: 'الاستعلام عن توافر طقم الفلاتر وسيور المحرك بالمخزن', textEn: 'Check inventory for filter kits and engine drive belts' }
    ],
    quickChips: [
      { textAr: 'تشخيص كود OBD-II', textEn: 'OBD-II Codes', icon: '🔍' },
      { textAr: 'عزوم الشد القياسية', textEn: 'Torque Specs', icon: '🔩' },
      { textAr: 'فحص منظومة الفرامل', textEn: 'Brake System', icon: '🛑' },
      { textAr: 'زيوت وسوائل المحرك', textEn: 'Fluids & Oils', icon: '🛢️' }
    ]
  },
  {
    id: 'safety',
    nameAr: 'أمان - مفتش السلامة والامتثال',
    nameEn: 'Aman - Safety & Compliance Auditor',
    shortNameAr: 'أمان',
    shortNameEn: 'Aman',
    roleAr: 'مفتش الجودة والسلامة المهنية والبيئة',
    roleEn: 'HSE & Regulatory Compliance Auditor',
    descAr: 'مراجعة وتدقيق بطاقات التفتيش الرقمي للسلامة وضمان تطابق معايير النقل البري والبيئة.',
    descEn: 'Auditing digital safety checklists and guaranteeing compliance with terrestrial transport laws.',
    color: 'emerald',
    expression: 'focused',
    iconName: 'ShieldCheck',
    badge: 'SAFE • AI',
    shadowClass: 'shadow-[0_12px_36px_-6px_rgba(16,185,129,0.25)]',
    ambientGlowRgba: 'rgba(16, 185, 129, 0.18)',
    headerGradient: 'from-[#072418] via-[#0b3826] to-[#051a11]',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/40',
    borderClass: 'border-emerald-200 dark:border-emerald-800/50',
    buttonGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/25',
    badgeColorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/40',
    glowPillClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-300/40 dark:border-emerald-700/40',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    welcomeGreetingAr: 'مرحباً laheeb',
    welcomeGreetingEn: 'Hello laheeb',
    welcomeSubtitleAr: 'كيف يمكنني مساعدتك اليوم في تدقيق معايير السلامة والامتثال الفني؟',
    welcomeSubtitleEn: 'How can I assist you with vehicle safety compliance and road readiness today?',
    initialMessageAr: 'السلامة أولاً وقبل كل انطلاق! 🛡️🚦 أنا "أمان - مفتش السلامة والامتثال الفني".\n\nأراجع معك بطاقات الفحص الفني اليومي، تواريخ صلاحية طفايات الحريق، تأمينات المركبات، ورخص السائقين لضمان صفر مخالفات.\nما التقرير أو الآلية التي نتحقق من سلامتها اليوم؟',
    initialMessageEn: 'Safety first on every route! 🛡️🚦 I am Aman, your Fleet Safety & Compliance Officer.\n\nI audit daily pre-trip walkarounds, fire extinguishers, driver licenses, and transport certifications to maintain zero violations.\nWhat compliance item shall we audit today?',
    systemContextPrompt: 'أنت "أمان"، مفتش السلامة المهنية والامتثال اللوجستي. تركيزك صارم على معايير الأمان، سلامة الإطارات، تجهيزات الطوارئ، وتجنب أي مخالفة مرورية أو بيئية.',
    featuredPrompts: [
      { textAr: 'تدقيق بطاقات الفحص الفني اليومي للمركبات قبل مغادرة الورشة', textEn: 'Audit daily pre-trip safety checklists before depot exit' },
      { textAr: 'حصر تراخيص المركبات وشهادات الفحص الدوري المنتهية قريباً', textEn: 'Flag expiring vehicle registrations and inspection permits' },
      { textAr: 'مراجعة جاهزية طفايات الحريق وحقائب الإسعاف وأحزمة الأمان', textEn: 'Verify fire extinguishers, first-aid kits, and safety belts' },
      { textAr: 'سجل رصد الحوادث وسلوك السائقين وتدابير منع التكرار', textEn: 'Accident log review & defensive driver training recommendations' }
    ],
    quickChips: [
      { textAr: 'الفحص اليومي للمركبات', textEn: 'Pre-Trip Walkaround', icon: '📋' },
      { textAr: 'صلاحية التراخيص', textEn: 'License Validity', icon: '🪪' },
      { textAr: 'معدات الطوارئ والسلامة', textEn: 'Emergency Gear', icon: '🧯' },
      { textAr: 'معايير النقل البري', textEn: 'Transport Standards', icon: '⚖️' }
    ]
  },
  {
    id: 'supply-chain',
    nameAr: 'واصل - خبير سلاسل الإمداد والمشتريات',
    nameEn: 'Wasil - Supply Chain & Procurement Bot',
    shortNameAr: 'واصل',
    shortNameEn: 'Wasil',
    roleAr: 'خبير التوريد والتفاوض مع الموردين',
    roleEn: 'Procurement & Vendor Negotiation Specialist',
    descAr: 'التنبؤ باحتياجات قطع الغيار، التوجيه بطلبات التوريد الفورية ومقارنة عروض أسعار الموردين.',
    descEn: 'Forecasting spare parts consumption, automating purchase requests and comparing vendor quotes.',
    color: 'sky',
    expression: 'happy',
    iconName: 'Boxes',
    badge: 'SCM • AI',
    shadowClass: 'shadow-[0_12px_36px_-6px_rgba(14,165,233,0.25)]',
    ambientGlowRgba: 'rgba(14, 165, 233, 0.18)',
    headerGradient: 'from-[#062033] via-[#09304a] to-[#041724]',
    accentBg: 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border-sky-200/70 dark:border-sky-800/40',
    borderClass: 'border-sky-200 dark:border-sky-800/50',
    buttonGradient: 'bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white shadow-md shadow-sky-500/25',
    badgeColorClass: 'text-sky-600 dark:text-sky-400 bg-sky-100/80 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800/40',
    glowPillClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-300/40 dark:border-sky-700/40',
    textColor: 'text-sky-600 dark:text-sky-400',
    welcomeGreetingAr: 'مرحباً laheeb',
    welcomeGreetingEn: 'Hello laheeb',
    welcomeSubtitleAr: 'كيف يمكنني مساعدتك اليوم في تزويد المستودع وتأمين أفضل عروض الموردين؟',
    welcomeSubtitleEn: 'How can I assist you with parts replenishment and vendor price comparisons today?',
    initialMessageAr: 'مستودعك الذكي متصل دائماً! 📦🚚 أنا "واصل - خبير سلاسل الإمداد والتوريد".\n\nأراقب معك الأرصدة الحرجة، أصدر مذكرات الشراء الفورية، وأقارن عروض الأسعار والضمانات بين الموردين لتقليل كلفة التوريد.\nما الصنف الذي نود تأمينه اليوم؟',
    initialMessageEn: 'Your warehouse is fully optimized! 📦🚚 I am Wasil, your Supply Chain & Procurement Bot.\n\nI monitor low-stock thresholds, generate purchase requests, and compare vendor warranty terms.\nWhat inventory items do we need to replenish?',
    systemContextPrompt: 'أنت "واصل"، خبير سلاسل الإمداد ومشتريات قطع الغيار. تبحث دوماً عن أفضل جودة مقابل السعر، تقارن فترات التوريد والضمانات، وتحذر من نفاد الأصناف الاستراتيجية.',
    featuredPrompts: [
      { textAr: 'حصر الأصناف التي وصلت إلى حد إعادة الطلب الأدنى بالمستودع', textEn: 'List parts that reached minimum safe reorder threshold' },
      { textAr: 'مقارنة عروض أسعار موردي الإطارات وبطاريات الشاحنات الثقيلة', textEn: 'Compare supplier quotes for heavy truck tires and batteries' },
      { textAr: 'توليد مذكرة طلب شراء عاجلة للقطع ذات الحركة السريعة', textEn: 'Generate instant purchase order for fast-moving spare parts' },
      { textAr: 'تحليل فترات توريد الموردين وتحديد الأكثر التزاماً بالمواعيد', textEn: 'Evaluate supplier delivery lead times and reliability' }
    ],
    quickChips: [
      { textAr: 'الأصناف الحرجة بالمخزن', textEn: 'Critical Stock', icon: '📦' },
      { textAr: 'مقارنة أسعار الموردين', textEn: 'Vendor Quotes', icon: '🏷️' },
      { textAr: 'طلب شراء فوري', textEn: 'Purchase Order', icon: '📝' },
      { textAr: 'متابعة الشحنات والضمان', textEn: 'Shipments & Warranty', icon: '🚚' }
    ]
  },
  {
    id: 'predictive',
    nameAr: 'بصير - محلل الصيانة التنبؤية للأسطول',
    nameEn: 'Baseer - Predictive Maintenance Analyst',
    shortNameAr: 'بصير',
    shortNameEn: 'Baseer',
    roleAr: 'محلل الحساسات والبيانات التنبؤية',
    roleEn: 'Telemetry & Failure Forecasting Specialist',
    descAr: 'توقع الأعطال الوشيكة بناء على قراءات العدادات وسلوك السائقين لتقليل التعطل المفاجئ.',
    descEn: 'Predicting vehicle wear-and-tear using telemetry, odometer schedules, and driver behaviors.',
    color: 'rose',
    expression: 'winking',
    iconName: 'LineChart',
    badge: 'PRED • AI',
    shadowClass: 'shadow-[0_12px_36px_-6px_rgba(244,63,94,0.22)]',
    ambientGlowRgba: 'rgba(244, 63, 94, 0.16)',
    headerGradient: 'from-[#2b0c16] via-[#3a101f] to-[#1e0710]',
    accentBg: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/40',
    borderClass: 'border-rose-200 dark:border-rose-800/50',
    buttonGradient: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-md shadow-rose-500/25',
    badgeColorClass: 'text-rose-600 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/40',
    glowPillClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-300/40 dark:border-rose-700/40',
    textColor: 'text-rose-600 dark:text-rose-400',
    welcomeGreetingAr: 'مرحباً laheeb',
    welcomeGreetingEn: 'Hello laheeb',
    welcomeSubtitleAr: 'كيف يمكنني مساعدتك اليوم في قراءة مؤشرات العدادات والتنبؤ بالأعطال الوشيكة؟',
    welcomeSubtitleEn: 'How can I assist you with telemetry analysis and premature failure prevention today?',
    initialMessageAr: 'عينك الرقمية على صحة المحركات! 📈🔮 أنا "بصير - محلل الصيانة التنبؤية".\n\nأحلل قراءات العدادات، تذبذب درجات الحرارة، وضغط الزيوت للتنبؤ بالأعطال قبل وقوعها، وتفادي توقف الآليات المكلف.\nأي مركبة تود فحص منحنى اهترائها الآن؟',
    initialMessageEn: 'Your foresight into engine telemetry! 📈🔮 I am Baseer, your Predictive Fleet Analyst.\n\nI monitor odometer trends, thermal variations, and vibration frequencies to catch failures before they cause costly downtime.\nWhich vehicle health curve shall we review?',
    systemContextPrompt: 'أنت "بصير"، محلل بيانات وصيانة تنبؤية للأسطول. تستخدم الإحصائيات، قراءات حساسات الضغط والحرارة، ومسافات الكيلومترات لتوقع تاريخ العطل بدقة وحماية الآلية.',
    featuredPrompts: [
      { textAr: 'تحديد الشاحنات الأكثر عرضة لعطل المحرك خلال الأسبوعين القادمين', textEn: 'Identify vehicles at highest risk of engine failure in next 14 days' },
      { textAr: 'تحليل منحنى تدهور وسادات الفرامل وتاريخ التبديل المتوقع', textEn: 'Brake pad degradation model & predicted replacement date' },
      { textAr: 'كشف السائقين الأكثر استهلاكاً للإطارات والمحركات بسبب الفرملة', textEn: 'Detect harsh braking telemetry patterns and tire wear impact' },
      { textAr: 'حساب النقطة المثالية لتغيير الزيوت دون إهدار أو ضرر', textEn: 'Calculate optimal oil drain intervals balancing wear and cost' }
    ],
    quickChips: [
      { textAr: 'تنبؤ الأعطال الوشيكة', textEn: 'Failure Forecast', icon: '🔮' },
      { textAr: 'تحليل العدادات والمسافات', textEn: 'Odometer Telemetry', icon: '🛣️' },
      { textAr: 'صحة المحرك ونواقل الحركة', textEn: 'Powertrain Health', icon: '⚙️' },
      { textAr: 'سلوك القيادة والاهتراء', textEn: 'Driving Behavior', icon: '📊' }
    ]
  },
  {
    id: 'finance',
    nameAr: 'راصد - المراقب المالي وتكاليف التشغيل',
    nameEn: 'Rased - Financial Controller & Cost Optimizer',
    shortNameAr: 'راصد',
    shortNameEn: 'Rased',
    roleAr: 'مراقب النفقات وكفاءة ميزانية الورش',
    roleEn: 'Cost Auditor & Fleet Budget Optimizer',
    descAr: 'تحليل تكلفة استهلاك قطع غيار الورشة، والتحقق من الجدوى المالية لمزودي الخدمة الخارجيين.',
    descEn: 'Analyzing maintenance billing trends, workshop spending margins, and external vendor costs.',
    color: 'teal',
    expression: 'focused',
    iconName: 'Landmark',
    badge: 'CFO • AI',
    shadowClass: 'shadow-[0_12px_36px_-6px_rgba(20,184,166,0.25)]',
    ambientGlowRgba: 'rgba(20, 184, 166, 0.18)',
    headerGradient: 'from-[#062421] via-[#0a3833] to-[#041a18]',
    accentBg: 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border-teal-200/70 dark:border-teal-800/40',
    borderClass: 'border-teal-200 dark:border-teal-800/50',
    buttonGradient: 'bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 text-white shadow-md shadow-teal-500/25',
    badgeColorClass: 'text-teal-600 dark:text-teal-400 bg-teal-100/80 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800/40',
    glowPillClass: 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-300/40 dark:border-teal-700/40',
    textColor: 'text-teal-600 dark:text-teal-400',
    welcomeGreetingAr: 'مرحباً laheeb',
    welcomeGreetingEn: 'Hello laheeb',
    welcomeSubtitleAr: 'كيف يمكنني مساعدتك اليوم في تدقيق التكاليف وترشيد نفقات تشغيل الأسطول؟',
    welcomeSubtitleEn: 'How can I assist you with cost auditing and fleet budget optimization today?',
    initialMessageAr: 'كل ريال يُنفق يجب أن يحقق أعلى عائد تشغيلي! 💵📊 أنا "راصد - المراقب المالي للأسطول".\n\nأحسب لك تكلفة الكيلومتر الواحد (Cost Per KM)، أدقق فواتير الورش الخارجية، وأرشدك إلى فرص التوفير الفعلي في الوقود والصيانة.\nما الميزانية أو الفاتورة التي نراجعها معاً؟',
    initialMessageEn: 'Maximizing operational ROI on every dollar! 💵📊 I am Rased, your Fleet Financial Controller.\n\nI calculate Cost Per KM, audit third-party repair bills, and uncover fuel and maintenance savings.\nWhich financial report or invoice shall we analyze?',
    systemContextPrompt: 'أنت "راصد"، المراقب المالي لميزانيات الأسطول والورشة. اهتمامك الأول هو العائد على الاستثمار، تقليل الهدر المالي، مقارنة تكلفة الإصلاح الداخلي بالخارجي، وحساب تكلفة الكيلومتر بدقة.',
    featuredPrompts: [
      { textAr: 'حساب متوسط تكلفة التشغيل والصيانة لكل كيلومتر (Cost Per KM)', textEn: 'Calculate fleet average maintenance and operational cost per KM' },
      { textAr: 'تدقيق فواتير الصيانة لدى الورش الخارجية ومطابقتها بالتسعيرات', textEn: 'Audit external vendor repair invoices against contract rates' },
      { textAr: 'تحليل بنود الهدر المالي وفرص خفض استهلاك المحروقات', textEn: 'Analyze spending leakages and fuel consumption reduction opportunities' },
      { textAr: 'توقع الميزانية التقديرية المطلوبة لصيانة الأسطول للربع القادم', textEn: 'Forecast total required fleet maintenance budget for next quarter' }
    ],
    quickChips: [
      { textAr: 'تكلفة الكيلومتر (Cost/KM)', textEn: 'Cost per KM', icon: '💵' },
      { textAr: 'تدقيق فواتير الورش', textEn: 'Invoice Audit', icon: '🧾' },
      { textAr: 'ترشيد استهلاك الوقود', textEn: 'Fuel Efficiency', icon: '⛽' },
      { textAr: 'ميزانية الربع القادم', textEn: 'Budget Forecast', icon: '📅' }
    ]
  }
];

export function getAgentById(id: string): AIAgentDefinition {
  return AI_AGENTS_CONFIG.find(a => a.id === id) || AI_AGENTS_CONFIG[0];
}
