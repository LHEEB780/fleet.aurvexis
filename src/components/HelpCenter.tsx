import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  HelpCircle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  Wrench, 
  Truck, 
  Users, 
  Calendar, 
  Warehouse, 
  ShieldCheck, 
  Cloud, 
  BarChart3, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  PhoneCall,
  Mail, 
  MessageSquare, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  Printer, 
  Copy, 
  Check, 
  LifeBuoy, 
  Lightbulb, 
  FileText, 
  Video, 
  Send,
  Zap,
  Info,
  Clock,
  IdCard,
  ClipboardCheck,
  Building2,
  Handshake,
  CreditCard,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../services/LanguageContext';
import { User } from '../types';
import { saveDocument } from '../services/firebase';
import Breadcrumbs from './Breadcrumbs';

interface HelpCenterProps {
  user?: User;
  onNavigateToTab?: (tab: string) => void;
  onOpenTutorials?: (videoId?: string) => void;
}

interface GuideStep {
  stepNumber: number;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  tipAr?: string;
  tipEn?: string;
}

interface GuideItem {
  id: string;
  category: 'fleet' | 'maintenance' | 'periodic' | 'drivers' | 'workshops' | 'inventory' | 'ai' | 'cloud' | 'reports' | 'security';
  categoryAr: string;
  categoryEn: string;
  icon: React.ReactNode;
  badgeColor: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  readTimeAr: string;
  readTimeEn: string;
  relatedTab?: string;
  relatedVideoId?: string;
  steps: GuideStep[];
  keyHighlightsAr: string[];
  keyHighlightsEn: string[];
}

interface FAQItem {
  id: string;
  category: 'fleet' | 'maintenance' | 'periodic' | 'drivers' | 'inventory' | 'cloud' | 'billing' | 'general';
  categoryAr: string;
  categoryEn: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  tagsAr: string[];
  tagsEn: string[];
  actionTab?: string;
  actionLabelAr?: string;
  actionLabelEn?: string;
}

// ----------------- GUIDE DATA -----------------
const USER_GUIDES: GuideItem[] = [
  {
    id: 'guide-vehicles',
    category: 'fleet',
    categoryAr: 'إدارة الأسطول',
    categoryEn: 'Fleet Management',
    icon: <Truck size={18} />,
    badgeColor: 'from-blue-500 to-cyan-500',
    titleAr: 'دليل إدارة المركبات والمعدات الثقيلة',
    titleEn: 'Fleet & Heavy Equipment Management Guide',
    summaryAr: 'تعرف على كيفية إضافة المركبات، متابعة عدادات الكيلومترات، ضبط الفحص الفني، وتوليد بطاقات الـ QR.',
    summaryEn: 'Learn how to register vehicles, monitor odometers, configure technical inspections, and generate QR codes.',
    readTimeAr: '4 دقائق قراءة',
    readTimeEn: '4 min read',
    relatedTab: 'vehicles',
    relatedVideoId: 'vid-1',
    keyHighlightsAr: [
      'تسجيل تفاصيل العجلات (رقم اللوحة، الهيكل VIN، سنة الصنع، نوع الوقود).',
      'تحديث عداد المسافة (Odometer) لتنشيط جداول الصيانة التلقائية.',
      'توليد وطباعة بطاقات QR Code الذكية لكل عجلة للصيانة السريعة.',
      'تتبع سجل الصيانة الشامل وتكاليف الاستهلاك التراكمية.'
    ],
    keyHighlightsEn: [
      'Register vehicle details (Plate, VIN, Model Year, Fuel Type).',
      'Update odometer readings to trigger automated maintenance intervals.',
      'Generate and print Smart QR Code stickers for rapid technician check-in.',
      'Track comprehensive maintenance history and cumulative operational costs.'
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'الوصول لقسم إدارة المعدات',
        titleEn: 'Navigate to Vehicles Section',
        descAr: 'من القائمة الجانبية، انقر على "إدارة المعدات والمركبات" للاطلاع على أسطول الشركة وحالات التشغيل.',
        descEn: 'From the sidebar, click on "Vehicles & Equipment" to view your fleet status and active units.',
        tipAr: 'يمكنك تصفية الأسطول حسب الحالة (نشط، في الصيانة، خارج الخدمة).',
        tipEn: 'You can filter the fleet by status (Active, In Maintenance, Out of Service).'
      },
      {
        stepNumber: 2,
        titleAr: 'إضافة مركبة أو معدة جديدة',
        titleEn: 'Add New Vehicle or Equipment',
        descAr: 'انقر على زر "+ إضافة مركبة جديدة"، ثم عبّئ رقم اللوحة، رقم الشاصي (VIN)، نوع الوقود، وقراءة العداد الحالية.',
        descEn: 'Click "+ Add New Vehicle", fill in the license plate, VIN, fuel type, and current odometer reading.',
        tipAr: 'تأكد من إدخال قراءة العداد الأولية بدقة لأنها حجر الأساس لجدولة الصيانات الدورية.',
        tipEn: 'Ensure accurate initial odometer entry as it forms the baseline for periodic maintenance schedules.'
      },
      {
        stepNumber: 3,
        titleAr: 'طباعة ملصق الـ QR الذكي',
        titleEn: 'Print Smart QR Code',
        descAr: 'افتح بطاقة المركبة واضغط على أيقونة الـ QR Code لطباعة ملصق مقاوم للحرارة يلصق على زجاج العجلة.',
        descEn: 'Open vehicle card and click the QR code icon to print a durable label to place on the vehicle windshield.',
      },
      {
        stepNumber: 4,
        titleAr: 'ربط السائق وتعيين الورشة المفضلة',
        titleEn: 'Assign Driver & Default Workshop',
        descAr: 'اختر السائق المرخص والمشروع التابع له لضمان دقة نسب الكلف التشغيلية للمشروع المناسب.',
        descEn: 'Assign the authorized driver and designated project to ensure accurate project operational cost tracking.'
      }
    ]
  },
  {
    id: 'guide-maintenance',
    category: 'maintenance',
    categoryAr: 'أوامر الصيانة',
    categoryEn: 'Work Orders',
    icon: <Wrench size={18} />,
    badgeColor: 'from-amber-500 to-orange-500',
    titleAr: 'دليل إنشاء ومتابعة أوامر الصيانة والإصلاح',
    titleEn: 'Work Orders Creation & Tracking Guide',
    summaryAr: 'خطوات فتح أمر صيانة داخلي أو خارجي، تشخيص العطل، صرف قطع الغيار، واعتماد الإغلاق الفني.',
    summaryEn: 'Steps to create internal/external work orders, diagnose faults, issue spare parts, and sign off technical completion.',
    readTimeAr: '5 دقائق قراءة',
    readTimeEn: '5 min read',
    relatedTab: 'maintenance',
    relatedVideoId: 'vid-2',
    keyHighlightsAr: [
      'فتح أوامر صيانة مصنفة حسب الأولوية (طارئة، دورية، فحص عام).',
      'إسناد المهام للفنيين المتاحين ومتابعة ساعات العمل الفعلية.',
      'سحب القطع من المخزن وتوثيق أرقام السيريال للقطع المستبدلة.',
      'التوقيع الرقمي للمشرف الفني وإغلاق أمر العمل.'
    ],
    keyHighlightsEn: [
      'Create categorized work orders by priority (Emergency, Routine, Inspection).',
      'Assign tasks to available technicians and log active wrench-time hours.',
      'Draw parts from warehouse and document serial numbers of replaced components.',
      'Digital signature approval and formal work order completion.'
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'إنشاء أمر صيانة جديد',
        titleEn: 'Create New Work Order',
        descAr: 'انقر على "إدارة أوامر الصيانة" ثم زر "+ فتح أمر صيانة". اختر المركبة وحدد تصنيف ونوع العطل بدقة.',
        descEn: 'Click "Maintenance Work Orders" then "+ Create Work Order". Select the vehicle and specify the fault category.',
        tipAr: 'يمكنك استخدام المساعد الذكي AI لاقتراح التشخيص المحتمل للأعطال المعقدة.',
        tipEn: 'You can use the AI Diagnostic assistant to suggest root causes for complex symptoms.'
      },
      {
        stepNumber: 2,
        titleAr: 'تعيين الورشة والفني المسؤول',
        titleEn: 'Assign Workshop & Lead Technician',
        descAr: 'اختر الورشة الميدانية المناسبة وعيّن الفني الرئيسي للمهمة. سيتلقى الفني إشعاراً فورياً بتفاصيل المهمة.',
        descEn: 'Select the optimal workshop and assign the lead technician. The technician receives an immediate notification.'
      },
      {
        stepNumber: 3,
        titleAr: 'صرف وتسجيل قطع الغيار والعمالة',
        titleEn: 'Issue Spare Parts & Labor Cost',
        descAr: 'أضف القطع المستخدمة من المخزن لحساب التكلفة تلقائياً وتحديث رصيد المخزن المتبقي.',
        descEn: 'Add parts pulled from inventory to calculate total repair cost and decrement warehouse stock.'
      },
      {
        stepNumber: 4,
        titleAr: 'الفحص النهائي والتوقيع الرقمي',
        titleEn: 'Final Inspection & Digital Signature',
        descAr: 'بعد إتمام الإصلاح، يقوم مهندس الجودة بالتوقيع الرقمي واعتماد خروج المركبة للخدمة.',
        descEn: 'Upon repair completion, the QA engineer signs digitally to certify vehicle roadworthiness.'
      }
    ]
  },
  {
    id: 'guide-periodic',
    category: 'periodic',
    categoryAr: 'الصيانة الدورية',
    categoryEn: 'Periodic Maintenance',
    icon: <Calendar size={18} />,
    badgeColor: 'from-emerald-500 to-teal-500',
    titleAr: 'دليل جدولة وبرمجة الصيانات الوقائية الدورية',
    titleEn: 'Preventive & Periodic Maintenance Scheduling Guide',
    summaryAr: 'برمجة خطط الصيانة الوقائية (تغيير الزيوت، الفلاتر، الفرامل) وتفعيل التنبيهات المسبقة قبل استحقاق الموعد.',
    summaryEn: 'Set up PM schedules (oil changes, filters, brakes) and trigger automated advance alerts before due dates.',
    readTimeAr: '3 دقائق قراءة',
    readTimeEn: '3 min read',
    relatedTab: 'periodic-maintenance',
    relatedVideoId: 'vid-3',
    keyHighlightsAr: [
      'ضبط برامج الصيانة حسب المسافة المقطوعة (مثلاً كل 5,000 كم) أو المدة الزمنية (كل 90 يوماً).',
      'تنبيهات استباقية عند اقتراب موعد الصيانة بـ 500 كم لتفادي التوقف المفاجئ.',
      'توليد أمر صيانة دوري تلقائي بضغطة زر واحدة بمجرد الاستحقاق.',
      'سجل كامل للالتزام بجدول الصيانة الوقائية لحفظ الضمان وقيمة الأسطول.'
    ],
    keyHighlightsEn: [
      'Configure PM programs by mileage (e.g. every 5,000 km) or calendar intervals (every 90 days).',
      'Proactive warning alerts 500 km prior to due limit to prevent unexpected roadside breakdowns.',
      'One-click automated conversion of due PM into an active work order.',
      'Audit log of PM compliance to safeguard manufacturer warranties and asset resale value.'
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'إنشاء خطة صيانة دورية',
        titleEn: 'Set Up PM Plan',
        descAr: 'توجه إلى "إدارة الصيانة الدورية" واضغط على "+ إضافة خطة صيانة". حدد اسم البرنامج (مثل: صيانة 10,000 كم).',
        descEn: 'Go to "Periodic Maintenance" and click "+ Add Maintenance Plan". Enter program name (e.g. 10,000 km Service).'
      },
      {
        stepNumber: 2,
        titleAr: 'تحديد المعايير والفاصل الدوري',
        titleEn: 'Define Trigger Thresholds',
        descAr: 'حدد الفاصل بالكيلومترات (مثلاً 5000 كم) أو الفاصل بالأيام (مثلاً 90 يوماً)، وحدد المركبات المشمولة.',
        descEn: 'Set interval in km (e.g., 5,000 km) or days (e.g., 90 days), and assign target vehicles.'
      },
      {
        stepNumber: 3,
        titleAr: 'متابعة مؤشر استحقاق الصيانة',
        titleEn: 'Monitor Due Indicators',
        descAr: 'تعرض الشاشة بطاقات ملونة: أخضر (سليم)، برتقالي (يقترب من الموعد)، أحمر (مستحق أو متأخر).',
        descEn: 'Cards display clear color-coded statuses: Green (OK), Orange (Upcoming), Red (Due / Overdue).'
      }
    ]
  },
  {
    id: 'guide-drivers',
    category: 'drivers',
    categoryAr: 'السائقين والتسليم',
    categoryEn: 'Drivers & Handover',
    icon: <ClipboardCheck size={18} />,
    badgeColor: 'from-purple-500 to-indigo-500',
    titleAr: 'دليل تفويض السائقين ومحاضر التسليم والاستلام الفني',
    titleEn: 'Driver Authorization & Digital Handover Protocol',
    summaryAr: 'حوكمة تسليم المركبات، توثيق الكيلومترات ومستوى الوقود، الفحص البصري للأضرار، والتوقيع الثنائي.',
    summaryEn: 'Standardize vehicle handovers, log odometers and fuel levels, conduct visual damage checks, and secure dual signatures.',
    readTimeAr: '4 دقائق قراءة',
    readTimeEn: '4 min read',
    relatedTab: 'driver-handover',
    relatedVideoId: 'vid-4',
    keyHighlightsAr: [
      'فحص استلام وتسليم رقمي بالكامل بدون أي معاملات ورقية.',
      'مخطط بصري تفاعلي لتسجيل الخدوش والصدمات ومستوى نظافة العجلة.',
      'توثيق قراءة عداد السرعة ومستوى الوقود عند كل عملية تسليم.',
      'توقيع رقمي ملزم للسائق ومسؤول الحركة مع إصدار وثيقة PDF فورية.'
    ],
    keyHighlightsEn: [
      'Fully digital handover protocol eliminating paper forms.',
      'Interactive visual vehicle inspection diagram for body dents and cleanliness.',
      'Verification of odometer and fuel gauge at every check-in/check-out.',
      'Binding digital signatures for driver and fleet officer with instant PDF issuance.'
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'بدء محضر تسليم / استلام جديد',
        titleEn: 'Start New Handover Record',
        descAr: 'انقر على "تسليم واستلام العجلات الفني" ثم اضغط "+ إنشاء محضر جديد". اختر نوع الإجراء (تسليم لسائق أو استلام من سائق).',
        descEn: 'Click "Driver Handover" then "+ New Handover Record". Choose action (Dispatch to Driver or Return from Driver).'
      },
      {
        stepNumber: 2,
        titleAr: 'تسجيل القراءات ومستوى الوقود',
        titleEn: 'Record Readings & Fuel Gauge',
        descAr: 'أدخل قراءة الكيلومتر الحالية ونسبة خزان الوقود، وحالة الإطارات وضغط الهواء.',
        descEn: 'Enter current odometer, fuel tank percentage, tire conditions, and air pressure status.'
      },
      {
        stepNumber: 3,
        titleAr: 'الفحص البصري للمركبة',
        titleEn: 'Visual Vehicle Inspection',
        descAr: 'استخدم المخطط البصري لتحديد أي خدش أو ضربة على الهيكل، مع إمكانية إرفاق صور مباشرة عبر الكاميرا.',
        descEn: 'Use interactive visual map to tag dents or scratches, with direct camera photo upload.'
      },
      {
        stepNumber: 4,
        titleAr: 'التوقيع والاعتماد',
        titleEn: 'Dual Sign-off & Completion',
        descAr: 'يقوم السائق ومسؤول الحركة بالتوقيع على الشاشة لحفظ الوثيقة ومزامنتها سحابياً.',
        descEn: 'Both driver and fleet officer sign on screen to permanently archive and sync the record.'
      }
    ]
  },
  {
    id: 'guide-inventory',
    category: 'inventory',
    categoryAr: 'المخازن وقطع الغيار',
    categoryEn: 'Inventory & Parts',
    icon: <Warehouse size={18} />,
    badgeColor: 'from-emerald-600 to-green-600',
    titleAr: 'دليل إدارة المخزون، قطع الغيار، وطلبات التوريد',
    titleEn: 'Warehouse, Spare Parts & Procurement Guide',
    summaryAr: 'متابعة حركة القطع، تنبيهات حد الطلب الأدنى، حساب كلفة المخزون، وربط القطع بالموردين المعتمدين.',
    summaryEn: 'Track inventory turnover, minimum reorder thresholds, inventory valuation, and supplier catalogs.',
    readTimeAr: '3 دقائق قراءة',
    readTimeEn: '3 min read',
    relatedTab: 'inventory',
    relatedVideoId: 'vid-5',
    keyHighlightsAr: [
      'تتبع دقيق لأرصدة قطع الغيار والزيوت والفلاتر والإطارات.',
      'تنبيهات تلقائية باللون الأحمر عند وصول القطعة إلى حد إعادة الطلب الأدنى.',
      'ربط استهلاك القطع مباشرة بأوامر الصيانة لحساب الكلفة الدقيقة للمركبة.',
      'إدارة سجل الموردين وتقييم سرعة التوريد وجودة القطع.'
    ],
    keyHighlightsEn: [
      'Accurate tracking of parts, oils, filters, and tire balances.',
      'Automated red alerts when stock drops below safety reorder threshold.',
      'Direct linkage of parts consumption to work orders for exact cost auditing.',
      'Vendor directory management with speed and quality ratings.'
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'إضافة قطعة غيار للمخزن',
        titleEn: 'Add Spare Part to Stock',
        descAr: 'توجه إلى "إدارة المخزن والقطع" واضغط "+ إضافة صنف جديد". أدخل اسم القطعة، رقم الصنف (Part Number)، وحد الأمان.',
        descEn: 'Go to "Inventory & Spare Parts" and click "+ Add Item". Enter part name, OEM Part Number, and minimum safety stock.'
      },
      {
        stepNumber: 2,
        titleAr: 'إجراء عمليات الإدخال والصرف',
        titleEn: 'Process Stock-in and Stock-out',
        descAr: 'عند استلام توريد جديد، سجّل كمية الوارد وسعر الشراء. عند الصيانة، يتم الخصم التلقائي عند إغلاق أمر العمل.',
        descEn: 'Record incoming stock quantities and unit cost. Parts are auto-deducted when work orders are executed.'
      },
      {
        stepNumber: 3,
        titleAr: 'إعادة الطلب والتوريد',
        titleEn: 'Reorder from Vendors',
        descAr: 'استخدم فلتر "قطع شارفت على النفاد" لمعرفة الأصناف المحتاجة لطلبات شراء سريعة من الموردين.',
        descEn: 'Use the "Low Stock Alert" filter to quickly generate purchase inquiries to verified vendors.'
      }
    ]
  },
  {
    id: 'guide-ai',
    category: 'ai',
    categoryAr: 'الذكاء الاصطناعي',
    categoryEn: 'AI Fleet Hub',
    icon: <Bot size={18} />,
    badgeColor: 'from-violet-600 to-fuchsia-600',
    titleAr: 'دليل وكلاء الذكاء الاصطناعي والتشخيص الذكي',
    titleEn: 'AI Agents Unified Command & Smart Diagnostics Guide',
    summaryAr: 'استخدام المساعد الذكي لتشخيص الأعطال الميكانيكية، توقع تكاليف الصيانة، وتحليل كفاءة استهلاك الوقود.',
    summaryEn: 'Leverage AI Agents for fault diagnostics, maintenance cost forecasting, and fuel efficiency optimization.',
    readTimeAr: '4 دقائق قراءة',
    readTimeEn: '4 min read',
    relatedTab: 'maintenance-bot',
    relatedVideoId: 'vid-6',
    keyHighlightsAr: [
      'وكيل تشخيص الأعطال: يحلل أصوات المحرك والأعراض ويقترح كود العطل OBD-II المحتمل.',
      'وكيل التنبؤ بالتكاليف: يحلل السجلات التاريخية لتوقع نفقات الصيانة القادمة.',
      'المحادثة الصوتية والنصية المباشرة مع مهندس الصيانة الافتراضي باللغتين العربية والإنجليزية.',
      'توليد تقارير أداء ملخصة بنقرة واحدة لمدراء الأساطيل.'
    ],
    keyHighlightsEn: [
      'Diagnostic Agent: analyzes engine symptoms and suggests potential OBD-II fault codes.',
      'Cost Predictor Agent: scans historical work orders to forecast upcoming maintenance expenditures.',
      'Real-time voice and text chat with Virtual Fleet Engineer in Arabic and English.',
      'One-click executive AI summary generation for fleet directors.'
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'فتح مركز وكلاء الـ AI',
        titleEn: 'Access AI Agents Command Hub',
        descAr: 'انقر على "مركز التحكم بوكلاء الـ AI" في أعلى القائمة الجانبية.',
        descEn: 'Click on "AI Agents Command Hub" at the top of the sidebar.'
      },
      {
        stepNumber: 2,
        titleAr: 'اختيار الوكيل المتخصص أو المحادثة الحية',
        titleEn: 'Select Specialized Agent or Live Chat',
        descAr: 'اختر وكيل التشخيص الميكانيكي، أو وكيل المخزون، أو تحدث مباشرة مع المساعد الذكي.',
        descEn: 'Select Mechanical Diagnostic Agent, Inventory Optimizer, or chat directly with the AI assistant.'
      },
      {
        stepNumber: 3,
        titleAr: 'إدخال الأعراض واستلام التوصيات الفنية',
        titleEn: 'Input Symptoms & Receive Recommendations',
        descAr: 'اكتب وصف العطل أو رقم كود الخطأ (مثل P0300)، وسيقدم المساعد خطة فحص تفصيلية بالخطوات والقطع المطلوبة.',
        descEn: 'Type fault description or OBD code (e.g. P0300); AI will generate inspection steps and required parts list.'
      }
    ]
  },
  {
    id: 'guide-cloud',
    category: 'cloud',
    categoryAr: 'الربط السحابي',
    categoryEn: 'Cloud Sync',
    icon: <Cloud size={18} />,
    badgeColor: 'from-sky-500 to-blue-600',
    titleAr: 'دليل المزامنة السحابية والحفظ الاحتياطي (Firebase Sync)',
    titleEn: 'Cloud Sync & Offline-First Backup Guide',
    summaryAr: 'كيفية مزامنة البيانات عبر أجهزة متعددة، معالجة التعارضات، وإدارة التخزين المحلي الآمن.',
    summaryEn: 'How to synchronize data across multiple devices, resolve merge conflicts, and manage secure local storage.',
    readTimeAr: '3 دقائق قراءة',
    readTimeEn: '3 min read',
    relatedTab: 'firebase-sync',
    relatedVideoId: 'vid-7',
    keyHighlightsAr: [
      'العمل بدون إنترنت (Offline-First): يمكنك تسجيل أوامر الصيانة حتى في الورش المعزولة.',
      'المزامنة السحابية المشفرة مع قاعدة بيانات Google Cloud Firestore.',
      'تنبيهات حد التخزين الآمن وإمكانية تصدير نسخة احتياطية محلية JSON.',
      'مؤشر حالة الاتصال اللحظي في أعلى واجهة التطبيق.'
    ],
    keyHighlightsEn: [
      'Offline-First operation: record work orders even in remote maintenance yards without internet.',
      'Encrypted cloud synchronization with Google Cloud Firestore database.',
      'Safe storage quota alerts with instant JSON local backup export.',
      'Real-time connectivity status indicator in application header.'
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'فحص حالة الاتصال السحابي',
        titleEn: 'Check Cloud Status',
        descAr: 'انقر على "بوابة المزامنة والربط السحابي" للاطلاع على حالة الاتصال وعدد السجلات المتزامنة.',
        descEn: 'Click "Cloud Sync Portal" to view active connection status and synced record counters.'
      },
      {
        stepNumber: 2,
        titleAr: 'إجراء مزامنة يدوية فورية',
        titleEn: 'Trigger Instant Manual Sync',
        descAr: 'اضغط على زر "رفع البيانات للسحابة" أو "سحب البيانات من السحابة" لتحديث البيانات بين أجهزة فريقك.',
        descEn: 'Click "Push Local to Cloud" or "Pull Cloud to Local" to harmonize records across team workstations.'
      },
      {
        stepNumber: 3,
        titleAr: 'تنزيل نسخة احتياطية محلية',
        titleEn: 'Export JSON Local Backup',
        descAr: 'لحفظ نسخة أمان إضافية، استخدم خيار "تصدير نسخة احتياطية كاملة" بصيغة JSON آمنة على جهازك.',
        descEn: 'For peace of mind, use "Export Complete Backup" to download a secure JSON snapshot to your computer.'
      }
    ]
  },
  {
    id: 'guide-reports',
    category: 'reports',
    categoryAr: 'التقارير والكلف',
    categoryEn: 'Reports & Costing',
    icon: <BarChart3 size={18} />,
    badgeColor: 'from-rose-500 to-pink-600',
    titleAr: 'دليل التقارير المالية والتحليلات وحساب الكلف',
    titleEn: 'Financial Reports, Fleet Analytics & Cost Auditing Guide',
    summaryAr: 'استخراج تقارير تكاليف الصيانة لكل مركبة، معدلات استهلاك الوقود، إنتاجية الفنيين، وتصدير PDF/Excel.',
    summaryEn: 'Generate cost-per-vehicle reports, fuel burn ratios, technician utilization, and export to PDF/Excel.',
    readTimeAr: '4 دقائق قراءة',
    readTimeEn: '4 min read',
    relatedTab: 'reports',
    relatedVideoId: 'vid-8',
    keyHighlightsAr: [
      'تحليل تكلفة الكيلومتر الواحد (Cost Per KM) لكل مركبة في الأسطول.',
      'مقارنة كفاءة الورش ونسبة إنجاز أوامر الصيانة في الوقت المحدد (SLA).',
      'تصدير تقارير رسمية جاهزة للطباعة والتوقيع بضغطة زر.',
      'فلاتر زمنية مرنة (شهري، ربع سنوي، سنوي، مخصص).'
    ],
    keyHighlightsEn: [
      'Calculate precise Cost-Per-Kilometer (CPK) for every asset in your fleet.',
      'Benchmark workshop turnaround efficiency and SLA compliance metrics.',
      'One-click export of print-ready formal managerial audits with company branding.',
      'Flexible time horizon filtering (Monthly, Quarterly, Annual, Custom).'
    ],
    steps: [
      {
        stepNumber: 1,
        titleAr: 'الدخول لمركز التقارير والإحصائيات',
        titleEn: 'Open Reports & Analytics Hub',
        descAr: 'انقر على "التقارير والإحصائيات" من القائمة الجانبية.',
        descEn: 'Click on "Reports & Analytics" from the sidebar menu.'
      },
      {
        stepNumber: 2,
        titleAr: 'تحديد نوع التقرير والنطاق الزمني',
        titleEn: 'Choose Report Type & Date Range',
        descAr: 'اختر نوع التقرير (تكاليف الصيانة، استهلاك القطع، تقييم الفنيين، حركة الوقود) وحدد الفترة الزمنية.',
        descEn: 'Select report category (Maintenance Costs, Parts Usage, Technician Productivity, Fuel) and timeframe.'
      },
      {
        stepNumber: 3,
        titleAr: 'المعاينة والتصدير والطباعة',
        titleEn: 'Preview, Export & Print',
        descAr: 'راجع الرسوم البيانية التفاعلية واضغط "تصدير PDF" أو "طباعة رسمية" لتقديم التقرير للإدارة العليا.',
        descEn: 'Review interactive charts and click "Export PDF" or "Print Official Report" for executive presentations.'
      }
    ]
  }
];

// ----------------- FAQ DATA -----------------
const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'fleet',
    categoryAr: 'الأسطول والمركبات',
    categoryEn: 'Fleet & Vehicles',
    questionAr: 'كيف يمكنني إضافة مركبة أو معدة ثقيلة جديدة في النظام؟',
    questionEn: 'How do I add a new vehicle or heavy equipment to the system?',
    answerAr: 'توجه إلى تبويب "إدارة المعدات والمركبات" من القائمة الجانبية، ثم اضغط على زر "+ إضافة مركبة جديدة" في أعلى الصفحة. قم بتعبئة رقم اللوحة، رقم الشاصي (VIN)، نوع الوقود، وقراءة عداد الكيلومتر الحالية، ثم اضغط "حفظ". سيتم إنشاء بطاقة ذكية ورمز QR خاص بالعجلة فوراً.',
    answerEn: 'Navigate to "Vehicles & Equipment" from the sidebar, then click the "+ Add New Vehicle" button at the top. Fill in the plate number, VIN, fuel type, and current odometer reading, then click "Save". A smart asset card and QR code will be generated immediately.',
    tagsAr: ['إضافة مركبة', 'أسطول', 'شاصي', 'QR'],
    tagsEn: ['add vehicle', 'fleet', 'VIN', 'QR'],
    actionTab: 'vehicles',
    actionLabelAr: 'انتقل لقسم المركبات',
    actionLabelEn: 'Go to Vehicles'
  },
  {
    id: 'faq-2',
    category: 'maintenance',
    categoryAr: 'أوامر الصيانة',
    categoryEn: 'Maintenance & Work Orders',
    questionAr: 'ما الفرق بين أمر الصيانة الطارئ والصيانة الدورية الوقائية؟',
    questionEn: 'What is the difference between an Emergency Work Order and Periodic Maintenance?',
    answerAr: 'الصيانة الطارئة تُفتح عند حدوث عطل مفاجئ أو توقف للمركبة في الميدان وتتطلب تدخلاً فورياً، بينما الصيانة الدورية هي خطة مجدولة مسبقاً (مثل تبديل الزيت كل 5000 كم أو فحص الفرامل كل 3 أشهر) للحفاظ على كفاءة المركبة وتجنب الأعطال المفاجئة.',
    answerEn: 'Emergency work orders are created when unexpected breakdown occurs requiring immediate fix, whereas Periodic Maintenance (PM) is a proactive scheduled program (like oil change every 5,000 km or brake check every 90 days) to prevent breakdowns.',
    tagsAr: ['صيانة طارئة', 'صيانة وقائية', 'أمر عمل'],
    tagsEn: ['emergency maintenance', 'preventive', 'work order'],
    actionTab: 'maintenance',
    actionLabelAr: 'أوامر الصيانة',
    actionLabelEn: 'Work Orders'
  },
  {
    id: 'faq-3',
    category: 'periodic',
    categoryAr: 'الصيانة الدورية',
    categoryEn: 'Periodic Maintenance',
    questionAr: 'كيف يقوم النظام بتنبيهي عند اقتراب موعد استحقاق صيانة دورية؟',
    questionEn: 'How does the system notify me when periodic maintenance is approaching?',
    answerAr: 'يقوم النظام بمقارنة قراءة العداد الحالية للمركبة مع حد الصيانة المبرمج، وتظهر بطاقة المركبة بلون برتقالي مع وسم "صيانة قريبة" عندما يتبقى أقل من 500 كم أو 7 أيام. وعند الوصول للحد، يتحول اللون للأحمر "مستحق الآن" مع إمكانية تحويلها لأمر صيانة بنقرة واحدة.',
    answerEn: 'The system automatically compares current odometer readings with scheduled service thresholds. When within 500 km or 7 days of due limit, it highlights the asset in orange ("Approaching"). Once breached, it turns red ("Due Now") with one-click conversion to a work order.',
    tagsAr: ['تنبيهات', 'صيانة دورية', 'عداد الكيلومتر'],
    tagsEn: ['alerts', 'periodic', 'odometer'],
    actionTab: 'periodic-maintenance',
    actionLabelAr: 'الصيانة الدورية',
    actionLabelEn: 'Periodic Maintenance'
  },
  {
    id: 'faq-4',
    category: 'drivers',
    categoryAr: 'السائقين والتسليم',
    categoryEn: 'Drivers & Handover',
    questionAr: 'كيف أضمن توثيق الخدوش والأضرار عند تسليم العجلة لسائق جديد؟',
    questionEn: 'How do I document existing vehicle scratches and dents during driver handover?',
    answerAr: 'من خلال قسم "تسليم واستلام العجلات الفني"، افتح محضر تسليم جديد واستخدم "مخطط الفحص البصري التفاعلي" لتحديد مكان ونوع الضرر على هيكل المركبة (خدش، صدمة، كسر زجاج)، مع إمكانية التقاط صور مباشرة بكاميرا الهاتف وتوقيع السائق رقمياً على المحضر.',
    answerEn: 'Via "Driver Handover", start a new handover inspection and use the interactive 2D vehicle body diagram to pinpoint damage locations (scratch, dent, cracked glass), attach direct photos, and require driver digital signature on the screen.',
    tagsAr: ['تسليم واستلام', 'أضرار', 'توقيع رقمي', 'فحص بصري'],
    tagsEn: ['handover', 'damage inspection', 'digital signature'],
    actionTab: 'driver-handover',
    actionLabelAr: 'تسليم واستلام العجلات',
    actionLabelEn: 'Driver Handover'
  },
  {
    id: 'faq-5',
    category: 'inventory',
    categoryAr: 'المخازن والقطع',
    categoryEn: 'Inventory & Parts',
    questionAr: 'ماذا يحدث عند صرف قطعة غيار في أمر صيانة؟ هل يُحدث المخزون تلقائياً؟',
    questionEn: 'What happens when a spare part is issued to a work order? Does stock update automatically?',
    answerAr: 'نعم، بمجرد إضافة قطعة الغيار إلى أمر الصيانة واعتماده، يتم خصم الكمية تلقائياً من رصيد المخزن المتاح وحساب تكلفتها ضمن إجمالي كلفة أمر الصيانة. إذا وصل رصيد القطعة إلى حد إعادة الطلب الأدنى، يظهر تنبيه فوري في لوحة المخازن.',
    answerEn: 'Yes, once a spare part is allocated to a work order and approved, quantity is instantly deducted from available inventory and its financial cost is appended to vehicle total repair expense. Low stock alert triggers if minimum safety stock is reached.',
    tagsAr: ['مخزن', 'قطع غيار', 'خصم تلقائي', 'حد الطلب'],
    tagsEn: ['inventory', 'spare parts', 'auto deduction'],
    actionTab: 'inventory',
    actionLabelAr: 'المخزن والقطع',
    actionLabelEn: 'Inventory'
  },
  {
    id: 'faq-6',
    category: 'cloud',
    categoryAr: 'الربط السحابي والمزامنة',
    categoryEn: 'Cloud Sync & Data',
    questionAr: 'هل يمكنني استخدام النظام وإدخال أوامر الصيانة في حال انقطاع الإنترنت؟',
    questionEn: 'Can I use the app and record work orders when there is no internet connection?',
    answerAr: 'نعم بالكامل! النظام مبني بتقنية Offline-First المتطورة؛ يتم حفظ كافة العمليات والتعديلات محلياً على جهازك بشكل فوري، وعند عودة الاتصال بالإنترنت يمكنك مزامنتها مع السحابة المركزية (Firebase) بضغطة زر واحدة بدون فقدان أي بيانات.',
    answerEn: 'Absolutely! The platform is engineered with modern Offline-First architecture. All entries are saved instantly to your local secure storage, and can be synchronized with Google Cloud Firestore seamlessly once internet is restored.',
    tagsAr: ['بدون إنترنت', 'أوفلاين', 'مزامنة', 'Firebase'],
    tagsEn: ['offline', 'cloud sync', 'firebase', 'no internet'],
    actionTab: 'firebase-sync',
    actionLabelAr: 'بوابة المزامنة',
    actionLabelEn: 'Cloud Sync'
  },
  {
    id: 'faq-7',
    category: 'billing',
    categoryAr: 'الاشتراك والفوترة',
    categoryEn: 'Subscriptions & Billing',
    questionAr: 'كيف يمكنني ترقية خطة اشتراك المنشأة أو زيادة عدد المركبات المسموح بها؟',
    questionEn: 'How can I upgrade my enterprise subscription plan or increase fleet asset limits?',
    answerAr: 'يمكن لمدير النظام (Admin) الانتقال إلى تبويب "إدارة الاشتراك والفوترة" من القائمة الجانبية، حيث يمكنك الاطلاع على الخطة الحالية (Startup, SME, Enterprise) واختيار الترقية أو التواصل المباشر مع فريق المبيعات لتخصيص خطة مناسبة لأسطولك.',
    answerEn: 'System Administrators can access "SaaS Billing & Plan" in the sidebar to review current subscription tier (Startup, SME, Enterprise) and upgrade or request a tailored enterprise quote from our sales representatives.',
    tagsAr: ['ترقية الخطة', 'اشتراك', 'فوترة', 'أسطول كبير'],
    tagsEn: ['upgrade plan', 'billing', 'subscription'],
    actionTab: 'saas-billing',
    actionLabelAr: 'إدارة الاشتراك',
    actionLabelEn: 'SaaS Billing'
  },
  {
    id: 'faq-8',
    category: 'general',
    categoryAr: 'عام وتشغيل',
    categoryEn: 'General Operations',
    questionAr: 'كيف يمكنني تغيير لغة واجهة النظام بين العربية والإنجليزية؟',
    questionEn: 'How can I switch the interface language between Arabic and English?',
    answerAr: 'يمكنك التبديل بين اللغتين في أي وقت من خلال زر تبديل اللغة (العربية / English) الموجود في الشريط العلوي للمنصة، أو من خلال إعدادات الحساب الشخصي. يدعم النظام اتجاهات العرض (RTL/LTR) تلقائياً.',
    answerEn: 'You can toggle language anytime using the language selector button in the top navigation header or via user profile settings. The system automatically adapts layout direction (RTL/LTR).',
    tagsAr: ['لغة', 'عربي', 'إنجليزي', 'واجهة'],
    tagsEn: ['language', 'Arabic', 'English', 'RTL']
  },
  {
    id: 'faq-9',
    category: 'general',
    categoryAr: 'عام وتشغيل',
    categoryEn: 'General Operations',
    questionAr: 'كيف يمكنني التواصل المباشر مع إدارة المنصة والشركة الأم (HQ)؟',
    questionEn: 'How can I directly contact SaaS Platform Leadership and Corporate HQ?',
    answerAr: 'يمكنك التواصل المباشر مع إدارة الساس والشركة الأم من خلال تبويب "الدعم والتواصل المباشر" في مركز المساعدة، حيث يتوفر خط واتساب الإدارة التنفيذية (+966 55 555 5555)، البريد الإلكتروني للقيادة (hq@fleetaurvexis.com)، والهاتف المباشر (+966 11 888 9900)، أو عبر تحديد خيار "إدارة الساس والشركة الأم" عند إرسال تذكرة استفسار.',
    answerEn: 'You can directly connect with SaaS Executive Leadership via the "Direct Support & Contact" tab in Help Center. We provide dedicated Executive WhatsApp (+966 55 555 5555), Corporate HQ Email (hq@fleetaurvexis.com), Direct Phone (+966 11 888 9900), or by selecting "SaaS HQ Management" in the ticket submission form.',
    tagsAr: ['الشركة الأم', 'إدارة الساس', 'تواصل مباشر', 'الإدارة العليا'],
    tagsEn: ['HQ', 'parent company', 'executive management', 'direct contact'],
    actionTab: 'help-center',
    actionLabelAr: 'قنوات الإدارة في مركز المساعدة',
    actionLabelEn: 'View HQ Channels'
  }
];

// ----------------- TROUBLESHOOTING ITEMS -----------------
const TROUBLESHOOTING_GUIDES = [
  {
    id: 'ts-1',
    titleAr: 'المركبة لا تظهر في قائمة أوامر الصيانة؟',
    titleEn: 'Vehicle not appearing in work order dropdown?',
    symptomAr: 'عند محاولة فتح أمر صيانة جديد، لا تظهر مركبة معينة في القائمة المنسدلة.',
    symptomEn: 'When opening a new work order, a specific vehicle is missing from the list.',
    solutionStepsAr: [
      'تأكد من أن حالة المركبة ليست "خارج الخدمة نهائياً" أو محذوفة.',
      'تحقق من أنك تملك صلاحية الوصول للمشروع أو الورشة التابع لها المركبة.',
      'افتح صفحة "إدارة المعدات" وتأكد من حفظ بيانات المركبة ورقم اللوحة بشكل صحيح.'
    ],
    solutionStepsEn: [
      'Ensure vehicle status is not marked as "Decommissioned" or deleted.',
      'Check that your user role has permission to access the assigned project/workshop.',
      'Go to "Vehicles" page to verify the vehicle profile and license plate are saved.'
    ]
  },
  {
    id: 'ts-2',
    titleAr: 'تنبيه امتلاء حجم التخزين المحلي (Storage Limit)؟',
    titleEn: 'Local Storage Limit Warning prompt appearing?',
    symptomAr: 'ظهور شريط تحذيري يفيد بأن حجم البيانات المحلية قارب على الحد الأقصى المسموح به.',
    symptomEn: 'Warning banner stating local browser storage is nearing safety limit.',
    solutionStepsAr: [
      'انتقل إلى "بوابة المزامنة والربط السحابي (Firebase Sync)".',
      'اضغط على زر "رفع ومزامنة البيانات وتصفير الحد" لترحيل البيانات للسحابة وتفريغ الكاش المؤقت.',
      'يمكنك أيضاً ضبط سقف الأمان (Threshold) من إعدادات المزامنة إذا كنت مديراً.'
    ],
    solutionStepsEn: [
      'Navigate to "Cloud Sync Portal (Firebase Sync)".',
      'Click "Sync & Reset Limit" to push accumulated offline records to cloud database.',
      'If you are an Admin, you can also adjust the safety threshold from sync settings.'
    ]
  },
  {
    id: 'ts-3',
    titleAr: 'فشل قراءة رمز الـ QR عبر الكاميرا؟',
    titleEn: 'QR Code scanner failing to read vehicle label?',
    symptomAr: 'الكاميرا لا تتعرف على رمز الاستجابة السريعة الملصق على المركبة.',
    symptomEn: 'Camera is not scanning the QR code sticker placed on the vehicle windshield.',
    solutionStepsAr: [
      'تأكد من إعطاء المتصفح إذن الوصول للكاميرا (Camera Permission).',
      'تأكد من إضاءة المكان ونظافة ملصق الـ QR من الغبار والزيوت.',
      'يمكنك دائماً إدخال رقم اللوحة أو رمز المركبة يدوياً في شريط البحث السريع.'
    ],
    solutionStepsEn: [
      'Ensure browser has been granted camera access permission.',
      'Check ambient lighting and ensure the sticker surface is clean of dust/oil.',
      'You can always search and select the vehicle manually by plate number in smart search.'
    ]
  }
];

export default function HelpCenter({ user, onNavigateToTab, onOpenTutorials }: HelpCenterProps) {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  // Navigation Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'guides' | 'faqs' | 'troubleshoot' | 'support' | 'quick-ref'>('guides');

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);

  // FAQ Accordion State
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');
  const [faqFeedback, setFaqFeedback] = useState<Record<string, 'yes' | 'no'>>({});
  const [copiedFaqId, setCopiedFaqId] = useState<string | null>(null);

  // Bookmarked Guides in local storage
  const [bookmarkedGuideIds, setBookmarkedGuideIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fms_bookmarked_help_guides');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Support inquiry state
  const [inquiryName, setInquiryName] = useState(user?.name || '');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryTopic, setInquiryTopic] = useState('technical');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Toggle Bookmark
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedGuideIds(prev => {
      const next = prev.includes(id) ? prev.filter(gId => gId !== id) : [...prev, id];
      try {
        localStorage.setItem('fms_bookmarked_help_guides', JSON.stringify(next));
      } catch (err) {}
      return next;
    });
  };

  // Copy FAQ Answer
  const handleCopyFaq = (faq: FAQItem) => {
    const textToCopy = `${isRtl ? faq.questionAr : faq.questionEn}\n\n${isRtl ? faq.answerAr : faq.answerEn}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedFaqId(faq.id);
    setTimeout(() => setCopiedFaqId(null), 2500);
  };

  // Switch sub-tabs cleanly with filter resets
  const switchSubTab = (tab: 'guides' | 'faqs' | 'troubleshoot' | 'support' | 'quick-ref') => {
    setActiveSubTab(tab);
    setSelectedCategory('all');
    if (tab === 'guides') {
      setSelectedGuide(null);
    }
    if (tab === 'faqs' && !expandedFaqId) {
      setExpandedFaqId('faq-1');
    }
  };

  // Submit Support Ticket to SaaS Management / CRM
  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryMessage.trim()) return;

    const topicTitles: Record<string, { ar: string; en: string }> = {
      'corporate-mgmt': { ar: 'إدارة الساس والشركة الأم (HQ)', en: 'SaaS HQ & Parent Company' },
      'technical': { ar: 'مشكلة فنية أو عطل في النظام', en: 'Technical Bug / System Issue' },
      'maintenance': { ar: 'استفسار عن أوامر الصيانة والورش', en: 'Maintenance & Work Orders' },
      'sync': { ar: 'استفسار عن المزامنة وقاعدة البيانات', en: 'Cloud Sync & Database' },
      'billing': { ar: 'الاشتراك، الباقات وترقية الخطة', en: 'Subscription & Billing' },
      'feature': { ar: 'اقتراح ميزة جديدة للمنصة', en: 'Feature Request' }
    };

    const isHQ = inquiryTopic === 'corporate-mgmt';
    const topicLabel = topicTitles[inquiryTopic] || { ar: inquiryTopic, en: inquiryTopic };
    const ticketId = `tkt-${Date.now()}`;

    const newTicket = {
      id: ticketId,
      name: inquiryName.trim() || user?.name || (isRtl ? 'مستخدم المنظومة' : 'Fleet System User'),
      company: (user as any)?.company || (isRtl ? 'منشأة الأسطول اللوجستية' : 'Fleet Logistics Corp'),
      email: inquiryEmail.trim() || (user as any)?.email || 'user@saas-fleet.com',
      phone: (user as any)?.phone || 'غير مسجل',
      fleetSize: (user as any)?.fleetSize || 15,
      province: 'المملكة العربية السعودية',
      country: 'المملكة العربية السعودية',
      status: 'new',
      date: new Date().toISOString().split('T')[0],
      source: isHQ ? 'إدارة الساس والشركة الأم (HQ)' : 'مركز المساعدة - تذكرة دعم',
      topic: inquiryTopic,
      topicLabelAr: topicLabel.ar,
      topicLabelEn: topicLabel.en,
      type: 'support_ticket',
      priority: isHQ ? 'urgent' : 'normal',
      notes: `[الموضوع: ${topicLabel.ar}]\n${inquiryMessage.trim()}`,
      communicationLogs: [
        {
          id: `log-${Date.now()}`,
          date: new Date().toLocaleDateString('ar-SA') + ' ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          type: isHQ ? 'meeting' : 'call',
          note: `📩 تم إرسال تذكرة جديدة من مركز المساعدة إلى لوحة تحكم الساس [${topicLabel.ar}]. بانتظار مراجعة فريق الإدارة والرد على العميل.`,
          agent: isHQ ? 'إدارة الساس والشركة الأم' : 'فريق الدعم الفني'
        }
      ]
    };

    // 1. Save to SaaS Leads & CRM Pipeline (localStorage)
    try {
      const storedLeads = localStorage.getItem('saas_crm_leads_v1');
      const leadsList = storedLeads ? JSON.parse(storedLeads) : [];
      const updatedLeads = [newTicket, ...leadsList];
      localStorage.setItem('saas_crm_leads_v1', JSON.stringify(updatedLeads));
      
      // Also save to dedicated support tickets store
      const storedTickets = localStorage.getItem('saas_support_tickets_v1');
      const ticketsList = storedTickets ? JSON.parse(storedTickets) : [];
      localStorage.setItem('saas_support_tickets_v1', JSON.stringify([newTicket, ...ticketsList]));
    } catch (err) {
      console.warn("Could not save ticket to local storage:", err);
    }

    // 2. Save to Firestore if available
    try {
      await saveDocument('saas_leads', newTicket.id, newTicket);
      await saveDocument('saas_tickets', newTicket.id, newTicket);
    } catch (err) {
      console.warn("Could not save ticket to cloud firestore:", err);
    }

    // 3. Dispatch global events for live update in active SaaS Controller tabs
    try {
      window.dispatchEvent(new CustomEvent('marketing-data-updated'));
      window.dispatchEvent(new CustomEvent('saas-tickets-updated', { detail: newTicket }));
    } catch (err) {}

    setInquirySubmitted(true);
    setTimeout(() => {
      setInquiryMessage('');
      setInquirySubmitted(false);
    }, 4500);
  };

  // Filtered Guides
  const filteredGuides = useMemo(() => {
    return USER_GUIDES.filter(guide => {
      const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory || (selectedCategory === 'bookmarked' && bookmarkedGuideIds.includes(guide.id));
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        guide.titleAr.toLowerCase().includes(q) ||
        guide.titleEn.toLowerCase().includes(q) ||
        guide.summaryAr.toLowerCase().includes(q) ||
        guide.summaryEn.toLowerCase().includes(q) ||
        guide.categoryAr.toLowerCase().includes(q) ||
        guide.categoryEn.toLowerCase().includes(q) ||
        guide.steps.some(s => s.titleAr.toLowerCase().includes(q) || s.titleEn.toLowerCase().includes(q) || s.descAr.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory, bookmarkedGuideIds]);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(faq => {
      let matchesCategory = false;
      if (selectedCategory === 'all') {
        matchesCategory = true;
      } else if (selectedCategory === 'maintenance') {
        matchesCategory = faq.category === 'maintenance' || faq.category === 'periodic';
      } else if (selectedCategory === 'cloud_hq') {
        matchesCategory = faq.category === 'cloud' || faq.category === 'billing' || faq.category === 'general';
      } else {
        matchesCategory = faq.category === selectedCategory;
      }
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        faq.questionAr.toLowerCase().includes(q) ||
        faq.questionEn.toLowerCase().includes(q) ||
        faq.answerAr.toLowerCase().includes(q) ||
        faq.answerEn.toLowerCase().includes(q) ||
        faq.tagsAr.some(t => t.toLowerCase().includes(q)) ||
        faq.tagsEn.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 pb-12 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs 
        activeTab="help-center" 
        setActiveTab={(tab) => onNavigateToTab && onNavigateToTab(tab)} 
        language={language} 
      />

      {/* ----------------- HERO BANNER & SEARCH ----------------- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3b0764] via-[#581c87] to-[#2e1065] text-white border border-purple-500/30 shadow-2xl p-6 sm:p-10">
        {/* Ambient background glowing orbs */}
        <div className="absolute -top-12 right-1/4 w-96 h-96 bg-fuchsia-500/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 left-1/4 w-96 h-96 bg-purple-400/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-purple-300/30 text-purple-100 text-xs font-black shadow-lg shadow-purple-950/40">
            <LifeBuoy size={14} className="text-fuchsia-300 animate-spin-slow" />
            <span>{isRtl ? 'مركز المساعدة ودليل تشغيل الأسطول' : 'Fleet Support Hub & User Knowledge Base'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-md">
            {isRtl ? 'كيف يمكننا مساعدتك اليوم؟' : 'How can we help you succeed today?'}
          </h1>
          <p className="text-xs sm:text-sm text-purple-100/90 max-w-xl mx-auto leading-relaxed font-medium">
            {isRtl 
              ? 'تصفح شروحات الاستخدام التفاعلية، حلول المشاكل الشائعة، أو تواصل مباشرة مع فريق الدعم الفني المتخصص.'
              : 'Explore comprehensive interactive user guides, instant troubleshooting answers, or connect directly with our technical engineering support.'}
          </p>

          {/* Smart Live Search Input */}
          <div className="relative max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} text-purple-200/80`} size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'ابحث في الأدلة، الأسئلة الشائعة، كلمات مفتاحية (مثل: صيانة دورية، إضافة مركبة)...' : 'Search guides, FAQs, keywords (e.g. Periodic maintenance, Work orders)...'}
                className={`w-full py-4 ${isRtl ? 'pr-12 pl-12' : 'pl-12 pr-12'} rounded-2xl bg-purple-950/60 hover:bg-purple-950/80 focus:bg-white text-white focus:text-slate-900 placeholder-purple-200/70 focus:placeholder-slate-500 border border-purple-400/40 focus:border-fuchsia-400 focus:ring-4 focus:ring-purple-500/30 text-xs sm:text-sm font-semibold transition-all shadow-inner outline-none`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`absolute ${isRtl ? 'left-4' : 'right-4'} text-purple-200 hover:text-white p-1 rounded-lg transition cursor-pointer`}
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </div>

            {/* Quick Keyword Badges */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap pt-3 text-[11px] font-bold text-purple-100">
              <span className="text-purple-200/80">{isRtl ? 'كلمات شائعة:' : 'Popular searches:'}</span>
              {['أمر صيانة', 'إضافة مركبة', 'صيانة دورية', 'باركود QR', 'مزامنة سحابية'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 transition cursor-pointer text-purple-100 border border-purple-300/30 shadow-xs hover:scale-105"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-purple-400/20 max-w-4xl mx-auto text-center">
          <div className="p-3.5 rounded-2xl bg-purple-950/50 backdrop-blur-md border border-purple-400/25 shadow-lg">
            <p className="text-lg sm:text-2xl font-black text-fuchsia-300">8+</p>
            <p className="text-[11px] text-purple-100 font-bold">{isRtl ? 'أدلة تشغيلية شاملة' : 'Full User Guides'}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-950/50 backdrop-blur-md border border-purple-400/25 shadow-lg">
            <p className="text-lg sm:text-2xl font-black text-cyan-300">24+</p>
            <p className="text-[11px] text-purple-100 font-bold">{isRtl ? 'سؤال وإجابة موثقة' : 'Verified FAQs'}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-950/50 backdrop-blur-md border border-purple-400/25 shadow-lg">
            <p className="text-lg sm:text-2xl font-black text-emerald-300">24/7</p>
            <p className="text-[11px] text-purple-100 font-bold">{isRtl ? 'دعم واستجابة سريعة' : 'Support SLA'}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-950/50 backdrop-blur-md border border-purple-400/25 shadow-lg">
            <p className="text-lg sm:text-2xl font-black text-amber-300">100%</p>
            <p className="text-[11px] text-purple-100 font-bold">{isRtl ? 'أوفلاين وسحابي' : 'Offline Ready'}</p>
          </div>
        </div>
      </div>

      {/* ----------------- SUB-TABS NAVIGATION BAR (SINGLE SCROLLABLE ROW) ----------------- */}
      <div className="w-full bg-slate-100/90 dark:bg-purple-950/40 p-1.5 sm:p-2 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-inner">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-thin">
          {/* Button 1: Interactive User Guides */}
          <button
            type="button"
            onClick={() => switchSubTab('guides')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'guides'
                ? 'bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-md shadow-purple-800/30 border border-purple-400/40'
                : 'bg-white dark:bg-purple-900/30 text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/60 border border-purple-100/80 dark:border-purple-900/50 shadow-xs'
            }`}
          >
            <BookOpen size={16} className={activeSubTab === 'guides' ? 'text-fuchsia-300' : 'text-purple-600 dark:text-purple-400'} />
            <span>{isRtl ? 'أدلة الاستخدام التفاعلية' : 'Interactive User Guides'}</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${activeSubTab === 'guides' ? 'bg-white/25 text-white' : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'}`}>
              {USER_GUIDES.length}
            </span>
          </button>

          {/* Button 2: Frequently Asked Questions (FAQ) */}
          <button
            type="button"
            onClick={() => switchSubTab('faqs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'faqs'
                ? 'bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-md shadow-purple-800/30 border border-purple-400/40'
                : 'bg-white dark:bg-purple-900/30 text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/60 border border-purple-100/80 dark:border-purple-900/50 shadow-xs'
            }`}
          >
            <HelpCircle size={16} className={activeSubTab === 'faqs' ? 'text-cyan-300' : 'text-cyan-600 dark:text-cyan-400'} />
            <span>{isRtl ? 'الأسئلة الشائعة (FAQ)' : 'Frequently Asked Questions'}</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${activeSubTab === 'faqs' ? 'bg-white/25 text-white' : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'}`}>
              {FAQ_DATA.length}
            </span>
          </button>

          {/* Button 3: Troubleshooting Assistant */}
          <button
            type="button"
            onClick={() => switchSubTab('troubleshoot')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'troubleshoot'
                ? 'bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-md shadow-purple-800/30 border border-purple-400/40'
                : 'bg-white dark:bg-purple-900/30 text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/60 border border-purple-100/80 dark:border-purple-900/50 shadow-xs'
            }`}
          >
            <Zap size={16} className={activeSubTab === 'troubleshoot' ? 'text-amber-300' : 'text-amber-500'} />
            <span>{isRtl ? 'استكشاف الأعطال وحلها' : 'Troubleshooting Assistant'}</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${activeSubTab === 'troubleshoot' ? 'bg-white/25 text-white' : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'}`}>
              {TROUBLESHOOTING_GUIDES.length}
            </span>
          </button>

          {/* Button 4: Quick Reference & Shortcuts */}
          <button
            type="button"
            onClick={() => switchSubTab('quick-ref')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'quick-ref'
                ? 'bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-md shadow-purple-800/30 border border-purple-400/40'
                : 'bg-white dark:bg-purple-900/30 text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/60 border border-purple-100/80 dark:border-purple-900/50 shadow-xs'
            }`}
          >
            <FileText size={16} className={activeSubTab === 'quick-ref' ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400'} />
            <span>{isRtl ? 'دليل الاختصارات والطباعة' : 'Quick Reference & Print'}</span>
          </button>

          {/* Button 5: Support & HQ Direct Contact */}
          <button
            type="button"
            onClick={() => switchSubTab('support')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'support'
                ? 'bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-md shadow-purple-800/30 border border-purple-400/40'
                : 'bg-white dark:bg-purple-900/30 text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/60 border border-purple-100/80 dark:border-purple-900/50 shadow-xs'
            }`}
          >
            <Phone size={16} className={activeSubTab === 'support' ? 'text-rose-300' : 'text-rose-500'} />
            <span>{isRtl ? 'تواصل مع الدعم وإدارة الساس' : 'Contact Support & HQ'}</span>
          </button>

          {/* Button 6: Video Tutorials */}
          <button
            type="button"
            onClick={() => {
              if (onOpenTutorials) {
                onOpenTutorials('vid-1');
              } else if (onNavigateToTab) {
                onNavigateToTab('tutorials');
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-purple-700/20 border border-purple-400/40 shrink-0 flex items-center gap-2 transition cursor-pointer"
          >
            <Video size={16} className="text-fuchsia-300 shrink-0" />
            <span>{isRtl ? 'مكتبة الفيديوهات التعليمية' : 'Video Tutorials'}</span>
          </button>
        </div>
      </div>

      {/* ----------------- SECTION 1: INTERACTIVE USER GUIDES ----------------- */}
      {activeSubTab === 'guides' && (
        <div className="space-y-6">
          {/* Categories Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-black shadow-md border border-purple-400/30'
                  : 'bg-white dark:bg-purple-950/40 text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/40 border border-purple-100 dark:border-purple-900/50'
              }`}
            >
              {isRtl ? 'جميع الأقسام' : 'All Categories'}
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('bookmarked')}
              className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'bookmarked'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black shadow-md'
                  : 'bg-white dark:bg-purple-950/40 text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/40 border border-purple-100 dark:border-purple-900/50'
              }`}
            >
              <Bookmark size={13} />
              <span>{isRtl ? `المحفوظة (${bookmarkedGuideIds.length})` : `Bookmarked (${bookmarkedGuideIds.length})`}</span>
            </button>

            {[
              { id: 'fleet', ar: 'إدارة الأسطول', en: 'Fleet' },
              { id: 'maintenance', ar: 'أوامر الصيانة', en: 'Maintenance' },
              { id: 'periodic', ar: 'الصيانة الدورية', en: 'Periodic' },
              { id: 'drivers', ar: 'السائقين والتسليم', en: 'Drivers' },
              { id: 'inventory', ar: 'المخازن والقطع', en: 'Inventory' },
              { id: 'ai', ar: 'الذكاء الاصطناعي', en: 'AI Hub' },
              { id: 'cloud', ar: 'الربط السحابي', en: 'Cloud Sync' },
              { id: 'reports', ar: 'التقارير والكلف', en: 'Reports' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-black shadow-md border border-purple-400/30'
                    : 'bg-white dark:bg-purple-950/40 text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/40 border border-purple-100 dark:border-purple-900/50'
                }`}
              >
                {isRtl ? cat.ar : cat.en}
              </button>
            ))}
          </div>

          {/* Guide Detail Modal / Drawer View */}
          <AnimatePresence>
            {selectedGuide && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white dark:bg-purple-950/30 rounded-3xl border-2 border-purple-300 dark:border-purple-800/60 shadow-2xl p-6 sm:p-8 space-y-6"
              >
                {/* Guide Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap border-b border-purple-100 dark:border-purple-900/40 pb-5">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-200 text-[11px] font-black border border-purple-200 dark:border-purple-700">
                        {isRtl ? selectedGuide.categoryAr : selectedGuide.categoryEn}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                        <Clock size={12} />
                        {isRtl ? selectedGuide.readTimeAr : selectedGuide.readTimeEn}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {isRtl ? selectedGuide.titleAr : selectedGuide.titleEn}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {isRtl ? selectedGuide.summaryAr : selectedGuide.summaryEn}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleBookmark(selectedGuide.id)}
                      className={`p-2.5 rounded-2xl border transition cursor-pointer ${
                        bookmarkedGuideIds.includes(selectedGuide.id)
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 border-amber-300'
                          : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800'
                      }`}
                      title={isRtl ? 'حفظ الدليل للمفضلة' : 'Bookmark Guide'}
                    >
                      {bookmarkedGuideIds.includes(selectedGuide.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-100 dark:border-purple-800 transition cursor-pointer"
                      title={isRtl ? 'طباعة هذا الدليل' : 'Print this guide'}
                    >
                      <Printer size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedGuide(null)}
                      className="px-4 py-2.5 rounded-2xl bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 text-purple-900 dark:text-purple-200 text-xs font-black transition cursor-pointer"
                    >
                      {isRtl ? 'إغلاق الدليل' : 'Close Guide'}
                    </button>
                  </div>
                </div>

                {/* Key Highlights */}
                <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-2">
                  <h4 className="text-xs font-black text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
                    <span>{isRtl ? 'أبرز مميزات ومخرجات هذا القسم:' : 'Key Operational Highlights:'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(isRtl ? selectedGuide.keyHighlightsAr : selectedGuide.keyHighlightsEn).map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Instructions */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {isRtl ? 'الخطوات التفصيلية للتنفيذ:' : 'Step-by-Step Execution:'}
                  </h3>

                  <div className="space-y-3">
                    {selectedGuide.steps.map((st) => (
                      <div
                        key={st.stepNumber}
                        className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2 relative overflow-hidden"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {st.stepNumber}
                          </div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                            {isRtl ? st.titleAr : st.titleEn}
                          </h4>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 pr-10 pl-10 leading-relaxed">
                          {isRtl ? st.descAr : st.descEn}
                        </p>

                        {(st.tipAr || st.tipEn) && (
                          <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-300 font-medium flex items-center gap-2">
                            <Lightbulb size={14} className="text-amber-600 shrink-0" />
                            <span>{isRtl ? st.tipAr : st.tipEn}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Action Footer */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-purple-100 dark:border-purple-900/40 flex-wrap">
                  <span className="text-xs text-slate-500 dark:text-purple-300 font-medium">
                    {isRtl ? 'هل تريد الانتقال لهذا القسم وتجربته الآن؟' : 'Ready to jump into this section now?'}
                  </span>

                  <div className="flex items-center gap-2">
                    {selectedGuide.relatedTab && onNavigateToTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateToTab(selectedGuide.relatedTab!)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-black shadow-md shadow-purple-700/30 flex items-center gap-2 cursor-pointer border border-purple-400/30"
                      >
                        <span>{isRtl ? 'انتقل إلى القسم مباشرة' : 'Open Section in Workspace'}</span>
                        <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''} />
                      </button>
                    )}

                    {selectedGuide.relatedVideoId && onOpenTutorials && (
                      <button
                        type="button"
                        onClick={() => onOpenTutorials(selectedGuide.relatedVideoId)}
                        className="px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-purple-100 dark:border-purple-800"
                      >
                        <Video size={14} className="text-purple-600" />
                        <span>{isRtl ? 'مشاهدة الفيديو التدريبي' : 'Watch Video'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Guide Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGuides.map((guide) => (
              <motion.div
                key={guide.id}
                whileHover={{ y: -3 }}
                onClick={() => setSelectedGuide(guide)}
                className="bg-white dark:bg-purple-950/20 rounded-3xl border border-purple-100 dark:border-purple-900/40 p-5 sm:p-6 hover:shadow-xl hover:shadow-purple-600/10 hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${guide.badgeColor} text-white flex items-center justify-center shadow-md`}>
                      {guide.icon}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(guide.id, e)}
                        className={`p-1.5 rounded-xl transition ${
                          bookmarkedGuideIds.includes(guide.id)
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                            : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                        }`}
                        title={isRtl ? 'حفظ الدليل' : 'Bookmark'}
                      >
                        {bookmarkedGuideIds.includes(guide.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                        {isRtl ? guide.readTimeAr : guide.readTimeEn}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                      {isRtl ? guide.categoryAr : guide.categoryEn}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {isRtl ? guide.titleAr : guide.titleEn}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {isRtl ? guide.summaryAr : guide.summaryEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-purple-50 dark:border-purple-900/40 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                  <span>{isRtl ? `${guide.steps.length} خطوات عمل` : `${guide.steps.length} steps`}</span>
                  <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>{isRtl ? 'عرض الدليل' : 'Read Guide'}</span>
                    <ArrowRight size={13} className={isRtl ? 'rotate-180' : ''} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredGuides.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <Search size={32} className="mx-auto text-slate-400" />
              <p className="text-sm font-black text-slate-800 dark:text-white">
                {isRtl ? 'لم نجد أي أدلة تطابق بحثك' : 'No guides match your search criteria'}
              </p>
              <p className="text-xs text-slate-500">
                {isRtl ? 'جرب البحث بكلمات مختلفة أو إزالة الفلاتر.' : 'Try different keywords or clear active filters.'}
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold cursor-pointer"
              >
                {isRtl ? 'إعادة ضبط البحث' : 'Reset Search'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ----------------- SECTION 2: FREQUENTLY ASKED QUESTIONS (FAQS) ----------------- */}
      {activeSubTab === 'faqs' && (
        <div className="space-y-6">
          {/* Category Filter Pills (Single Scrollable Row) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-thin">
            {[
              { 
                id: 'all', 
                ar: 'كافة الأسئلة', 
                en: 'All Questions', 
                icon: HelpCircle, 
                color: 'text-cyan-500', 
                count: FAQ_DATA.length 
              },
              { 
                id: 'fleet', 
                ar: 'الأسطول والمركبات', 
                en: 'Fleet & Vehicles', 
                icon: Truck, 
                color: 'text-purple-500', 
                count: FAQ_DATA.filter(f => f.category === 'fleet').length 
              },
              { 
                id: 'maintenance', 
                ar: 'أوامر الصيانة والدورية', 
                en: 'Maintenance & PM', 
                icon: Wrench, 
                color: 'text-amber-500', 
                count: FAQ_DATA.filter(f => f.category === 'maintenance' || f.category === 'periodic').length 
              },
              { 
                id: 'drivers', 
                ar: 'السائقين والتسليم', 
                en: 'Drivers & Handover', 
                icon: Users, 
                color: 'text-blue-500', 
                count: FAQ_DATA.filter(f => f.category === 'drivers').length 
              },
              { 
                id: 'inventory', 
                ar: 'المخازن والقطع', 
                en: 'Inventory & Parts', 
                icon: Warehouse, 
                color: 'text-emerald-500', 
                count: FAQ_DATA.filter(f => f.category === 'inventory').length 
              },
              { 
                id: 'cloud_hq', 
                ar: 'السحابة وإدارة الساس', 
                en: 'Cloud & SaaS HQ', 
                icon: Building2, 
                color: 'text-fuchsia-500', 
                count: FAQ_DATA.filter(f => ['cloud', 'billing', 'general'].includes(f.category)).length 
              },
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white font-black shadow-md border border-purple-400/40'
                      : 'bg-white dark:bg-purple-950/40 text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/40 border border-purple-100 dark:border-purple-900/50'
                  }`}
                >
                  <IconComponent size={15} className={isSelected ? 'text-white' : cat.color} />
                  <span>{isRtl ? cat.ar : cat.en}</span>
                  {cat.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                      isSelected 
                        ? 'bg-white/25 text-white' 
                        : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                    }`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* FAQs Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              const feedback = faqFeedback[faq.id];

              return (
                <div
                  key={faq.id}
                  className={`rounded-3xl border transition-all overflow-hidden ${
                    isExpanded 
                      ? 'bg-white dark:bg-purple-950/30 border-purple-400 dark:border-purple-700/80 shadow-xl shadow-purple-600/10' 
                      : 'bg-white dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/40 hover:border-purple-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-right cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                        isExpanded 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                          : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                      }`}>
                        ?
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 block mb-0.5 uppercase tracking-wide">
                          {isRtl ? faq.categoryAr : faq.categoryEn}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">
                          {isRtl ? faq.questionAr : faq.questionEn}
                        </h4>
                      </div>
                    </div>

                    <div className={`p-1.5 rounded-xl transition-transform duration-200 text-purple-500 ${isExpanded ? 'rotate-180 text-purple-700' : ''}`}>
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-purple-100 dark:border-purple-900/40 p-4 sm:p-6 bg-purple-50/40 dark:bg-purple-950/40 space-y-4 text-xs leading-relaxed"
                      >
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          {isRtl ? faq.answerAr : faq.answerEn}
                        </p>

                        {/* Action Link & Feedback */}
                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/40 flex-wrap">
                          {/* Tags & Direct Action */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {(isRtl ? faq.tagsAr : faq.tagsEn).map((tag, i) => (
                              <span key={i} className="px-2.5 py-0.5 rounded-lg bg-purple-100/70 dark:bg-purple-900/50 text-[10px] font-black text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50">
                                #{tag}
                              </span>
                            ))}

                            {faq.actionTab && onNavigateToTab && (
                              <button
                                type="button"
                                onClick={() => onNavigateToTab(faq.actionTab!)}
                                className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white text-[11px] font-black flex items-center gap-1 transition cursor-pointer shadow-xs border border-purple-400/30"
                              >
                                <span>{isRtl ? faq.actionLabelAr : faq.actionLabelEn}</span>
                                <ArrowRight size={11} className={isRtl ? 'rotate-180' : ''} />
                              </button>
                            )}
                          </div>

                          {/* Copy & Helpful Feedback */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyFaq(faq)}
                              className="px-2.5 py-1 rounded-xl bg-white dark:bg-purple-900/40 border border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-200 text-[11px] font-bold hover:bg-purple-50 flex items-center gap-1 transition cursor-pointer"
                              title={isRtl ? 'نسخ السؤال والإجابة' : 'Copy Question & Answer'}
                            >
                              {copiedFaqId === faq.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                              <span>{copiedFaqId === faq.id ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ الإجابة' : 'Copy')}</span>
                            </button>

                            <div className="flex items-center gap-1 pl-2 border-r border-purple-200 dark:border-purple-800">
                              <span className="text-[10px] text-slate-400 font-bold">{isRtl ? 'هل كانت الإجابة مفيدة؟' : 'Helpful?'}</span>
                              <button
                                type="button"
                                onClick={() => setFaqFeedback(prev => ({ ...prev, [faq.id]: 'yes' }))}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                                  feedback === 'yes' ? 'bg-emerald-500 text-white' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-emerald-100'
                                }`}
                              >
                                👍 {isRtl ? 'نعم' : 'Yes'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setFaqFeedback(prev => ({ ...prev, [faq.id]: 'no' }))}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                                  feedback === 'no' ? 'bg-rose-500 text-white' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-rose-100'
                                }`}
                              >
                                👎 {isRtl ? 'لا' : 'No'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-purple-950/20 rounded-3xl border border-purple-100 dark:border-purple-900/40 p-6 space-y-3">
                <HelpCircle size={32} className="mx-auto text-purple-400" />
                <p className="text-sm font-black text-slate-800 dark:text-white">
                  {isRtl ? 'لم يتم العثور على أي أسئلة تطابق بحثك' : 'No FAQs match your search criteria'}
                </p>
                <p className="text-xs text-slate-500 dark:text-purple-300">
                  {isRtl ? 'جرب البحث بكلمات أخرى أو عرض كافة الأسئلة.' : 'Try different keywords or clear the category filter.'}
                </p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer transition shadow-md"
                >
                  {isRtl ? 'إعادة ضبط الفلترة والبحث' : 'Reset Filter & Search'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- SECTION 3: TROUBLESHOOTING ASSISTANT ----------------- */}
      {activeSubTab === 'troubleshoot' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-fuchsia-900/20 border border-purple-500/30 space-y-1">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 text-xs font-black">
              <Zap size={16} />
              <span>{isRtl ? 'الموجّه الذكي لحل المشكلات والأخطاء التشغيلية السريعة' : 'Instant Technical Diagnostics & Problem Solver'}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isRtl
                ? 'إليك الحلول المعتمدة لأكثر المشكلات التي قد تواجه مسؤولي الحركة والفنيين أثناء الاستخدام اليومي.'
                : 'Verified standard operating procedures for resolving common issues encountered by fleet dispatchers and workshop leads.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TROUBLESHOOTING_GUIDES.map((ts) => (
              <div
                key={ts.id}
                className="bg-white dark:bg-purple-950/20 rounded-3xl border border-purple-100 dark:border-purple-900/40 p-6 space-y-4 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/15 text-purple-600 dark:text-purple-300 flex items-center justify-center font-black">
                    <AlertTriangle size={20} />
                  </div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {isRtl ? ts.titleAr : ts.titleEn}
                  </h3>

                  <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 text-[11px] text-slate-600 dark:text-purple-200 font-medium border border-purple-100 dark:border-purple-900/40">
                    <span className="font-bold text-purple-900 dark:text-purple-300 block mb-0.5">
                      {isRtl ? 'العَرَض / المشكلة:' : 'Symptom:'}
                    </span>
                    {isRtl ? ts.symptomAr : ts.symptomEn}
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-black text-purple-600 dark:text-purple-400 block">
                      {isRtl ? 'خطوات المعالجة المقترحة:' : 'Recommended Fix Steps:'}
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {(isRtl ? ts.solutionStepsAr : ts.solutionStepsEn).map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-100 dark:border-purple-900/40 text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center justify-between">
                  <span>{isRtl ? 'حل فوري معتمد' : 'Verified Procedure'}</span>
                  <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- SECTION 4: QUICK REFERENCE & PRINT MANUAL ----------------- */}
      {activeSubTab === 'quick-ref' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-purple-950/20 rounded-3xl border border-purple-100 dark:border-purple-900/40 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap border-b border-purple-100 dark:border-purple-900/40 pb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText size={20} className="text-purple-600" />
                  <span>{isRtl ? 'دليل الإجراءات اليومية السريعة (Fleet Manager Cheat Sheet)' : 'Daily Operational Checklist & Cheat Sheet'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-purple-300 mt-1">
                  {isRtl ? 'ملخص خطوات العمل اليومية لمدير الأسطول، مسؤول الحركة، وفنيي الصيانة.' : 'Summary cheat sheet for daily fleet management, dispatchers, and workshop leads.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-black shadow-md shadow-purple-700/30 flex items-center gap-2 transition cursor-pointer border border-purple-400/30"
              >
                <Printer size={15} />
                <span>{isRtl ? 'طباعة الدليل السريع' : 'Print Cheat Sheet'}</span>
              </button>
            </div>

            {/* Matrix of Daily Workflows */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-3">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-black text-xs">
                  <Truck size={16} className="text-purple-600" />
                  <span>{isRtl ? 'بداية الوردية (الصباحية)' : 'Morning Dispatch Routine'}</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-purple-600 shrink-0 mt-0.5" />
                    <span>{isRtl ? 'فحص تنبيهات الصيانة الدورية المستحقة.' : 'Review due periodic maintenance alerts.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-purple-600 shrink-0 mt-0.5" />
                    <span>{isRtl ? 'إجراء محاضر تسليم العجلات للسائقين مع مسح الـ QR.' : 'Conduct driver vehicle handovers with QR scan.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-purple-600 shrink-0 mt-0.5" />
                    <span>{isRtl ? 'مراجعة رصيد القطع الحرجة في المخزن.' : 'Audit critical safety stock inventory.'}</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-black text-xs">
                  <Wrench size={16} className="text-indigo-600" />
                  <span>{isRtl ? 'أثناء العمل والورش (الميداني)' : 'Workshop & Active Repairs'}</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span>{isRtl ? 'فتح أوامر الصيانة الطارئة وتعيين الفنيين.' : 'Open emergency work orders and dispatch mechanics.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span>{isRtl ? 'صرف وتوثيق القطع والزيوت من المخازن.' : 'Issue parts and fluids from stock.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span>{isRtl ? 'التوقيع الفني الرقمي وإغلاق المهام المكتملة.' : 'Digital supervisor sign-off and repair sign-out.'}</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-fuchsia-50/80 dark:bg-fuchsia-950/40 border border-fuchsia-200 dark:border-fuchsia-800/60 space-y-3">
                <div className="flex items-center gap-2 text-fuchsia-900 dark:text-fuchsia-200 font-black text-xs">
                  <BarChart3 size={16} className="text-fuchsia-600" />
                  <span>{isRtl ? 'نهاية اليوم (التقارير والمزامنة)' : 'Evening Closeout & Sync'}</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-fuchsia-600 shrink-0 mt-0.5" />
                    <span>{isRtl ? 'تشغيل المزامنة السحابية السريعة (Firebase Sync).' : 'Run Cloud Sync to harmonize day records.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-fuchsia-600 shrink-0 mt-0.5" />
                    <span>{isRtl ? 'استلام العجلات العائدة وتوثيق قراءات العداد.' : 'Log returned fleet mileage and fuel tanks.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-fuchsia-600 shrink-0 mt-0.5" />
                    <span>{isRtl ? 'تصدير تقرير الإنجاز والتكاليف اليومية.' : 'Export daily manager performance digest.'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SECTION 5: CONTACT & SUPPORT CHANNELS ----------------- */}
      {activeSubTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Direct Cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-purple-950/20 rounded-3xl border border-purple-100 dark:border-purple-900/40 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <LifeBuoy size={18} className="text-purple-600" />
                <span>{isRtl ? 'قنوات الدعم الفني المباشر' : 'Direct Support Channels'}</span>
              </h3>

              <div className="space-y-3">
                <a
                  href="https://wa.me/966500000000"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        {isRtl ? 'واتساب الدعم الفني السريع' : 'WhatsApp Live Support'}
                      </p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                        {isRtl ? 'استجابة خلال أقل من 15 دقيقة' : 'Avg reply time < 15 mins'}
                      </p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                </a>

                <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      {isRtl ? 'الرقم الموحد للطوارئ' : 'Fleet Emergency Hotline'}
                    </p>
                    <p className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                      +966 800 123 4567
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      {isRtl ? 'البريد الإلكتروني للدعم' : 'Engineering Email'}
                    </p>
                    <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      support@fleetaurvexis.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent Company & SaaS Management Direct Contact */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#581c87] text-white border border-purple-400/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-purple-400/20 pb-3">
                <div className="flex items-center gap-2 text-fuchsia-300 text-xs font-black">
                  <Building2 size={18} />
                  <span>{isRtl ? 'إدارة الساس والشركة الأم (HQ)' : 'SaaS HQ & Parent Company'}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-400/20 text-fuchsia-200 text-[10px] font-black border border-fuchsia-300/30">
                  {isRtl ? 'مباشر' : 'Direct HQ'}
                </span>
              </div>

              <p className="text-[11px] text-purple-100/90 leading-relaxed font-medium">
                {isRtl
                  ? 'للتواصل الإداري المباشر مع إدارة المنصة السحابية، شراكات الأعمال، العقود المؤسسية، أو تصعيد البلاغات الحرجة للإدارة العليا:'
                  : 'For direct executive inquiries, SaaS corporate contracts, enterprise partnerships, and critical escalation to platform leadership:'}
              </p>

              <div className="space-y-2.5 pt-1">
                {/* Executive WhatsApp */}
                <a
                  href="https://wa.me/966555555555?text=Hello%20SaaS%20Executive%20Team%2C%20I%20need%20direct%20assistance"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-between gap-3 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">
                        {isRtl ? 'واتساب إدارة المنصة والشركة الأم' : 'HQ Executive WhatsApp'}
                      </p>
                      <p className="text-[10px] text-purple-200">
                        {isRtl ? 'تواصل فوري مع مسؤولي الحسابات' : 'Direct Account Managers'}
                      </p>
                    </div>
                  </div>
                  <ExternalLink size={13} className="text-purple-200 group-hover:scale-110 transition-transform" />
                </a>

                {/* HQ Corporate Email */}
                <a
                  href="mailto:management@fleetaurvexis.com?subject=Inquiry%20to%20SaaS%20Executive%20Management"
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-between gap-3 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-fuchsia-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">
                        {isRtl ? 'بريد الإدارة العامة والشراكات' : 'Corporate HQ Email'}
                      </p>
                      <p className="text-[10px] font-mono text-purple-200">
                        hq@fleetaurvexis.com
                      </p>
                    </div>
                  </div>
                  <ExternalLink size={13} className="text-purple-200 group-hover:scale-110 transition-transform" />
                </a>

                {/* HQ Direct Escalation Phone */}
                <div className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <PhoneCall size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">
                      {isRtl ? 'هاتف الإدارة التنفيذية المباشر' : 'Executive Direct Line'}
                    </p>
                    <p className="text-[11px] font-mono text-fuchsia-300 font-bold">
                      +966 11 888 9900
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Level Agreement info */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#3b0764] via-[#581c87] to-[#2e1065] text-white border border-purple-500/30 p-5 space-y-2 shadow-lg">
              <div className="flex items-center gap-2 text-purple-200 text-xs font-black">
                <ShieldCheck size={16} />
                <span>{isRtl ? 'ضمان الخدمة للمؤسسات' : 'Enterprise SLA Guarantee'}</span>
              </div>
              <p className="text-[11px] text-purple-100/90 leading-relaxed">
                {isRtl
                  ? 'فرق الدعم الهندسي وإدارة الساس متواجدة على مدار الساعة لضمان استمرارية تشغيل أسطولك بأعلى معايير الأداء والموثوقية.'
                  : 'Dedicated fleet engineers and SaaS executive leadership on standby 24/7 to ensure maximum fleet uptime and SLA compliance.'}
              </p>
            </div>
          </div>

          {/* Submit Support Ticket Form */}
          <div className="lg:col-span-2 bg-white dark:bg-purple-950/20 rounded-3xl border border-purple-100 dark:border-purple-900/40 p-6 sm:p-8 space-y-5 shadow-sm">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isRtl ? 'إرسال تذكرة استفسار أو طلب مساعدة فنية' : 'Submit Support Ticket / Inquiry'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-purple-300 mt-0.5">
                {isRtl
                  ? 'سيقوم مهندس دعم متخصص بمراجعة طلبك والتواصل معك فوراً.'
                  : 'A dedicated fleet technical specialist will review your request and reply promptly.'}
              </p>
            </div>

            {inquirySubmitted ? (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-emerald-500/10 border border-emerald-400/40 text-center space-y-3 shadow-md">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
                  <CheckCircle2 size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900 dark:text-emerald-200">
                    {isRtl ? 'تم إرسال تذكرتك بنجاح ومزامنتها مع إدارة الساس!' : 'Ticket Submitted & Synced with SaaS Control Panel!'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-purple-200">
                    {isRtl 
                      ? 'تم تحويل الطلب إلى لوحة تحكم إدارة الساس (SaaS Admin / CRM) وسيتم الرد عليك عبر البريد والتواصل المباشر.' 
                      : 'Request has been routed to SaaS Management (CRM / Admin Panel). The team will review and respond promptly.'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/70 dark:bg-purple-950/60 rounded-xl border border-purple-200/50 dark:border-purple-800/50 text-[10.5px] font-mono text-purple-700 dark:text-purple-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isRtl ? 'حالة التذكرة: مسجلة في لوحة القيادة السحابية (جديدة)' : 'Status: Synced to Cloud Control Panel (New)'}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isRtl ? 'الاسم الكامل:' : 'Your Name:'}
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder={isRtl ? 'اسم المستخدم...' : 'Full Name...'}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isRtl ? 'البريد الإلكتروني للتواصل:' : 'Email Address:'}
                    </label>
                    <input
                      type="email"
                      required
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="engineer@company.com"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'موضوع التذكرة / القسم المعني:' : 'Inquiry Topic / Module:'}
                  </label>
                  <select
                    value={inquiryTopic}
                    onChange={(e) => setInquiryTopic(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="corporate-mgmt">{isRtl ? 'إدارة الساس والشركة الأم (عقود وشراكات وإدارة عليا)' : 'SaaS HQ & Parent Company Management (Executive/Contracts)'}</option>
                    <option value="technical">{isRtl ? 'مشكلة فنية أو عطل في النظام' : 'Technical Bug / System Issue'}</option>
                    <option value="maintenance">{isRtl ? 'استفسار عن أوامر الصيانة والورش' : 'Maintenance & Work Orders'}</option>
                    <option value="sync">{isRtl ? 'استفسار عن المزامنة وقاعدة البيانات' : 'Cloud Sync & Database'}</option>
                    <option value="billing">{isRtl ? 'الاشتراك، الباقات وترقية الخطة' : 'Subscription & Billing'}</option>
                    <option value="feature">{isRtl ? 'اقتراح ميزة جديدة للمنصة' : 'Feature Request / Idea'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'تفاصيل الرسالة أو المشكلة:' : 'Detailed Message / Problem Description:'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder={isRtl ? 'يرجى كتابة التفاصيل أو الخطوات التي حدثت معك...' : 'Please describe what happened and steps to reproduce...'}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-black shadow-md shadow-purple-700/30 flex items-center gap-2 transition cursor-pointer border border-purple-400/30"
                  >
                    <Send size={15} />
                    <span>{isRtl ? 'إرسال التذكرة الآن' : 'Submit Ticket Now'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
