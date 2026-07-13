import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../services/LanguageContext';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Wrench, 
  Search, 
  Package, 
  Trash2, 
  FileText, 
  MessageSquare, 
  Loader2, 
  HelpCircle,
  ArrowRightLeft,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  ChevronRight,
  ShieldAlert,
  Compass,
  Hammer,
  Layers,
  Info,
  Users,
  Warehouse,
  Truck,
  TrendingUp,
  RefreshCw,
  X,
  LayoutDashboard,
  CheckCircle2,
  Cpu,
  Bookmark,
  Database,
  Wifi,
  WifiOff,
  AlertCircle,
  ChevronDown,
  Check,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity,
  VolumeX,
  Volume2,
  Copy,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  vehicles as defaultVehicles, 
  maintenanceOrders as defaultOrders, 
  inventory as defaultInventory, 
  technicians as defaultTechnicians 
} from '../data';
import { getAIProjectManagerInsight, AIMessage } from '../services/aiService';
import { collection, getDocs } from 'firebase/firestore';
import { db, testFirestoreConnection, pushLocalDataToCloud, pullCloudDataToLocal } from '../services/firebase';
import firebaseConfig from '../services/firebaseConfig';

// Interfaces for Maintenance Bot
interface MechanicMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function AiHub() {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  // Master Tab State
  // 'project-manager' = AI Strategic Project Manager
  // 'mechanic' = Smart Mechanic Assistant & Parts Bot
  const [activeTab, setActiveTab] = useState<'project-manager' | 'mechanic' | 'copilot'>('project-manager');

  // --- Enhanced Command Center States ---
  const [isRegistryExpanded, setIsRegistryExpanded] = useState<boolean>(true);
  const [agentsRegistry, setAgentsRegistry] = useState([
    {
      id: 'project-manager',
      nameAr: 'روبرت - مدير المشروع الاستراتيجي',
      nameEn: 'Robert - Strategic Project Manager',
      descAr: 'تنسيق الخطط وحل اختناقات العمل وتقدير ميزانيات الورش ومزامنة الفواتير سحابياً.',
      descEn: 'Coordinating operational plans, resolving bottleneck constraints, and validating cloud billing Sync.',
      icon: 'Sparkles',
      isActive: true,
      color: 'violet',
      roles: ['Manager', 'Admin']
    },
    {
      id: 'mechanic',
      nameAr: 'مساعد الصيانة والقطع الذكي',
      nameEn: 'Smart Mechanic & Parts Guide',
      descAr: 'مراقبة رفوف المستودع، فحص مستويات قطع الغيار، وتقديم خطوات الإصلاح وعزوم الشد.',
      descEn: 'Monitoring warehouse racks, checking stock thresholds, and providing repair guides & torque specs.',
      icon: 'Wrench',
      isActive: true,
      color: 'amber',
      roles: ['Technician', 'Admin']
    },
    {
      id: 'safety',
      nameAr: 'مفتش السلامة والأمان والامتثال',
      nameEn: 'Safety & Compliance Auditor',
      descAr: 'مراجعة وتدقيق بطاقات التفتيش الرقمي للسلامة وضمان تطابق معايير النقل البري والبيئة.',
      descEn: 'Auditing digital safety checklists and guaranteeing compliance with terrestrial transport laws.',
      icon: 'ShieldAlert',
      isActive: true,
      color: 'emerald',
      roles: ['Inspector', 'Admin']
    },
    {
      id: 'supply-chain',
      nameAr: 'خبير سلاسل الإمداد ومفاوض الموردين',
      nameEn: 'Supply Chain & Procurement Bot',
      descAr: 'التنبؤ باحتياجات قطع الغيار، التوجيه بطلبات التوريد الفورية ومقارنة عروض أسعار الموردين.',
      descEn: 'Forecasting spare parts consumption, automating purchase requests and comparing vendor quotes.',
      icon: 'RefreshCw',
      isActive: true,
      color: 'sky',
      roles: ['Procurement', 'Admin']
    },
    {
      id: 'predictive',
      nameAr: 'محلل الصيانة التنبؤية للأسطول',
      nameEn: 'Predictive Fleet Lifecycle Analyst',
      descAr: 'توقع الأعطال الوشيكة بناء على قراءات العدادات وسلوك السائقين لتقليل التعطل المفاجئ.',
      descEn: 'Predicting vehicle wear-and-tear using telemetry, odometer schedules, and driver behaviors.',
      icon: 'TrendingUp',
      isActive: true,
      color: 'rose',
      roles: ['Analyst', 'Admin']
    },
    {
      id: 'finance',
      nameAr: 'المراقب المالي وإدارة تكاليف التشغيل',
      nameEn: 'Financial Controller & Cost Optimizer',
      descAr: 'تحليل تكلفة استهلاك قطع غيار الورشة، والتحقق من الجدوى المالية لمزودي الخدمة الخارجيين.',
      descEn: 'Analyzing maintenance billing trends, workshop spending margins, and external vendor costs.',
      icon: 'Layers',
      isActive: true,
      color: 'teal',
      roles: ['Accountant', 'Admin']
    }
  ]);

  const toggleAgentActive = (id: string) => {
    setAgentsRegistry(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, isActive: !a.isActive };
      }
      return a;
    }));
  };

  const isAgentActive = (id: string) => {
    return agentsRegistry.find(a => a.id === id)?.isActive ?? true;
  };

  const renderAgentIcon = (id: string, color: string) => {
    const iconSize = 13;
    let colorClass = '';
    if (color === 'violet') colorClass = 'text-violet-600 dark:text-violet-400';
    else if (color === 'amber') colorClass = 'text-amber-600 dark:text-amber-400';
    else if (color === 'emerald') colorClass = 'text-emerald-500 dark:text-emerald-400';
    else if (color === 'sky') colorClass = 'text-sky-500 dark:text-sky-400';
    else if (color === 'rose') colorClass = 'text-rose-500 dark:text-rose-400';
    else if (color === 'teal') colorClass = 'text-teal-600 dark:text-teal-400';

    switch (id) {
      case 'project-manager':
        return <Sparkles size={iconSize} className={colorClass} />;
      case 'mechanic':
        return <Wrench size={iconSize} className={colorClass} />;
      case 'safety':
        return <ShieldAlert size={iconSize} className={colorClass} />;
      case 'supply-chain':
        return <RefreshCw size={iconSize} className={colorClass} />;
      case 'predictive':
        return <TrendingUp size={iconSize} className={colorClass} />;
      case 'finance':
        return <Layers size={iconSize} className={colorClass} />;
      default:
        return <Bot size={iconSize} className={colorClass} />;
    }
  };

  const [isCoPilotEnabled, setIsCoPilotEnabled] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<'normal' | 'parts-crisis' | 'backlog-peak' | 'staff-shortage'>('normal');
  const [pmPersona, setPmPersona] = useState<'default' | 'commander' | 'economist'>('default');
  const [mechPersona, setMechPersona] = useState<'default' | 'master' | 'safety'>('default');

  // Dynamic metrics based on activeScenario simulation
  const simulatedVehiclesCount = activeScenario === 'staff-shortage' 
    ? Math.max(2, defaultVehicles.length - 8)
    : defaultVehicles.length;

  const simulatedOrdersCount = activeScenario === 'backlog-peak'
    ? Math.round(defaultOrders.length * 2.2)
    : defaultOrders.length;

  const simulatedInventoryCount = activeScenario === 'parts-crisis'
    ? Math.round(defaultInventory.length * 0.4)
    : defaultInventory.length;

  const simulatedTechniciansCount = activeScenario === 'staff-shortage'
    ? 2
    : defaultTechnicians.length;

  // Helper to build context modifier for strategic PM
  const getPmContextModifier = () => {
    let scenarioText = '';
    if (activeScenario === 'parts-crisis') {
      scenarioText = 'تحذير أزمة توريد: المخزون هبط بنسبة 60% وأرصدة الأرفف تحت خط الأمان الحرج. اقترح حلول استباقية لإعادة التدوير والتقشف.';
    } else if (activeScenario === 'backlog-peak') {
      scenarioText = 'تحذير تراكم وضغط: أوامر العمل تضاعفت مرتين والموسم في ذروته. اقترح حلول لتقليص مدة الصيانة وتأجيل الأعمال التجميلية.';
    } else if (activeScenario === 'staff-shortage') {
      scenarioText = 'تحذير عجز بشري: يعمل بالورشة فنيين اثنين فقط اليوم بسبب الإجازات. اقترح جدول مهام طارئ والتركيز على الأعطال الفادحة فقط.';
    }

    let personaText = '';
    if (pmPersona === 'commander') {
      personaText = 'تحدث بصفتك كوماندر وقائد عمليات حاسم. أعط توجيهات مباشرة عسكرية الطابع، في نقاط موجزة ومسؤولة، وركز على الامتثال.';
    } else if (pmPersona === 'economist') {
      personaText = 'تحدث بصفتك محلل اقتصادي خبير. ركز على كفاءة الميزانية وتقليص الهدر المالي وعائد الاستثمار لكل قرار صيانة.';
    }

    return `${scenarioText} ${personaText}`.trim();
  };

  // Helper to build custom message context for Mechanic Bot
  const getMechContextModifier = () => {
    let scenarioText = '';
    if (activeScenario === 'parts-crisis') {
      scenarioText = 'تنبيه ورشة: هناك أزمة توريد بالمستودع. وجه الفني لاستخدام قطع مصلحة أو فحص البدائل القريبة بحرص.';
    } else if (activeScenario === 'backlog-peak') {
      scenarioText = 'تنبيه ورشة: تكدس فائق بالبوابات. وجه الفني بالتركيز على إصلاح الأعطال الأساسية وتفادي العمليات الطويلة غير اللازمة.';
    } else if (activeScenario === 'staff-shortage') {
      scenarioText = 'تنبيه ورشة: عجز بشري حاد. الورش تعمل بطاقة محدودة جداً.';
    }

    let personaText = '';
    if (mechPersona === 'master') {
      personaText = 'تقمص دور المعلم وكبير الفنيين المتقاعد ذو الخبرة العريقة. أسهب في ذكر عزم الربط، وتفاصيل الأجزاء الداخلية الميكانيكية بدقة.';
    } else if (mechPersona === 'safety') {
      personaText = 'تقمص دور مفتش السلامة والأمان الصارم. وجه كل تركيزك في خطوات الإصلاح حول سلامة الفني وارتداء قناع الغاز وحاجز الصدمات.';
    }

    return `${scenarioText} ${personaText}`.trim();
  };

  // Unified Co-Pilot message stream
  interface CoPilotMessage {
    id: string;
    role: 'user' | 'model';
    text?: string;
    pmText?: string;
    mechText?: string;
    timestamp: Date;
  }
  const [coPilotMessages, setCoPilotMessages] = useState<CoPilotMessage[]>([
    {
      id: 'welcome-copilot',
      role: 'model',
      pmText: 'أهلاً بك في وضع التعاون الفيدرالي المشترك! 🤖💼 سأقوم بتقديم التخطيط الإستراتيجي وحل الاختناقات بأسلوب تكتيكي.',
      mechText: 'بصفتي كبير الفنيين، سأتكامل لحظياً مع مدير المشروع لتوفير أدلة الصيانة التفصيلية وعزم الشد ومستويات جرد قطع الغيار!',
      timestamp: new Date()
    }
  ]);
  const [coPilotInput, setCoPilotInput] = useState('');
  const [coPilotLoading, setCoPilotLoading] = useState(false);

  // Text-To-Speech audio player state
  const [activeAudioMessageId, setActiveAudioMessageId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Voice dictation simulation state
  const [isDictating, setIsDictating] = useState<boolean>(false);

  // Quick Work Order modal state
  const [quickOrderModalOpen, setQuickOrderModalOpen] = useState<boolean>(false);
  const [quickOrderData, setQuickOrderData] = useState({
    vehicleId: '',
    category: 'mechanical',
    description: '',
    technicianId: '',
    cost: '250'
  });

  // Quick guide modals
  const [pmGuideModalOpen, setPmGuideModalOpen] = useState<boolean>(false);
  const [mechGuideModalOpen, setMechGuideModalOpen] = useState<boolean>(false);

  // Shared font size state
  const [chatFontSize, setChatFontSize] = useState<'sm' | 'md' | 'lg'>(() => {
    return (localStorage.getItem('fleet_chat_font_size') as 'sm' | 'md' | 'lg') || 'md';
  });

  const handleSetChatFontSize = (size: 'sm' | 'md' | 'lg') => {
    setChatFontSize(size);
    localStorage.setItem('fleet_chat_font_size', size);
  };

  // Shared sidebar visibility state - default to false for a clean, distraction-free full-screen chat on start
  const [showSidebar, setShowSidebar] = useState<boolean>(() => {
    return localStorage.getItem('fleet_ai_show_sidebar') === 'true';
  });

  const handleToggleSidebar = () => {
    const nextState = !showSidebar;
    setShowSidebar(nextState);
    localStorage.setItem('fleet_ai_show_sidebar', String(nextState));
  };

  // --- 0. Dedicated Agent Chat States & Helpers ---
  const [activeChatAgent, setActiveChatAgent] = useState<any | null>(null);
  const [agentInputText, setAgentInputText] = useState<string>('');
  const [agentChats, setAgentChats] = useState<Record<string, AIMessage[]>>({});
  const [agentChatLoading, setAgentChatLoading] = useState<Record<string, boolean>>({});
  const [dynamicSuggestions, setDynamicSuggestions] = useState<Record<string, string[]>>({});
  const [selectedReadingSuggestion, setSelectedReadingSuggestion] = useState<string | null>(null);
  const agentChatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside agent chat when messages change
  useEffect(() => {
    if (agentChatScrollRef.current) {
      agentChatScrollRef.current.scrollTo({
        top: agentChatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [agentChats, agentChatLoading]);

  const getAgentWelcomeMessageAr = (id: string) => {
    switch (id) {
      case 'project-manager':
        return 'أهلاً بك! أنا روبرت، مديرك الاستراتيجي الذكي. مستعد لتحليل ميزانيات الورش، تحسين المخرجات، وحل أي اختناق تشغيلي. كيف يمكنني دعم خطتك التنفيذية اليوم؟';
      case 'mechanic':
        return 'مرحباً! أنا مساعد الصيانة والقطع الذكي. يمكنني فحص الرفوف، وتتبع مستويات قطع الغيار، وتقديم أدلة تفصيلية للأعطال. بمَ تود الاستعلام الفني اليوم؟';
      case 'safety':
        return 'أهلاً بك حضرة المدير. أنا مفتش السلامة والامتثال. مهمتي مراجعة بطاقات الفحص الرقمية والتأكد من مطابقة الأسطول لمعايير النقل والبيئة. ما هي ملفات السلامة التي نراجعها اليوم؟';
      case 'supply-chain':
        return 'مرحباً بك! أنا خبير سلاسل الإمداد ومفاوض الموردين. يمكنني التنبؤ بالقطع المستهلكة، ومقارنة عروض الموردين لضمان أفضل قيمة مالية. ما هي المواد المطلوبة لطلب الشراء؟';
      case 'predictive':
        return 'أهلاً بك. أنا محلل الصيانة التنبؤية. من خلال قراءة عدادات الأسطول والتحليلات التاريخية، يمكنني توقع الأعطال قبل حدوثها لحماية أصولك. ما هي المركبة التي تود فحص احتمالية عطلها؟';
      case 'finance':
        return 'مرحباً بك يا فندم. أنا المراقب المالي وإدارة التكاليف. مهمتي فحص نفقات الورش والتحقق من الجدوى المالية للمعاملات الخارجية لخفض هدر الميزانية. ما هي البنود المالية التي تود تدقيقها اليوم؟';
      default:
        return 'مرحباً بك! أنا وكيلك الذكي في مركز الذكاء الاصطناعي الموحد. كيف يمكنني مساعدتك اليوم؟';
    }
  };

  const getAgentWelcomeMessageEn = (id: string) => {
    switch (id) {
      case 'project-manager':
        return 'Welcome! I am Robert, your Strategic Project Manager. I coordinate operational plans, resolve constraints, and optimize budgets. How can I support your executive goals today?';
      case 'mechanic':
        return 'Hello! I am your Smart Mechanic and Parts Guide. I monitor warehouse racks, track spare parts thresholds, and provide repair specs. What technical queries do you have today?';
      case 'safety':
        return 'Greetings. I am your Safety & Compliance Auditor. I review digital inspection logs and ensure our fleet meets safety and transport guidelines. Which compliance parameters should we review?';
      case 'supply-chain':
        return 'Welcome! I am your Supply Chain & Procurement Specialist. I forecast parts consumption and analyze vendor quotes to guarantee maximum financial value. What are we procuring today?';
      case 'predictive':
        return 'Hello. I am your Predictive Fleet Analyst. By evaluating vehicle odometers and driver patterns, I forecast wear-and-tear before breakdowns happen. Which vehicle should we inspect?';
      case 'finance':
        return 'Greetings. I am your Financial Controller. I audit workshop billing, analyze parts consumption, and assess external repair margins to plug budget leaks. Which cost centers shall we audit?';
      default:
        return 'Hello! I am your AI assistant in the unified hub. How can I assist you today?';
    }
  };

  const getAgentSuggestions = (id: string, isAr: boolean) => {
    if (isAr) {
      switch (id) {
        case 'project-manager':
          return [
            'كيف يمكن تحسين كفاءة الورشة في ظل سيناريو عجز الموظفين؟',
            'أريد تحليلاً لحجم المهام العالقة وتوزيع العمالة الآن',
            'ما هي أولوياتي التشغيلية لتفادي أزمات التوريد؟'
          ];
        case 'mechanic':
          return [
            'ما هي مواصفات عزم الشد لتيل فرامل شاحنة مرسيدس أكتروس؟',
            'هل يتوفر فلتر زيت معتمد في المخزن وكم كميته؟',
            'أريد دليلاً ميكانيكياً لخطوات إصلاح عطل هيدروليكي بالرافعة'
          ];
        case 'safety':
          return [
            'أريد مراجعة نتائج تدقيق السلامة الأخير للأسطول',
            'ما هي أبرز المخالفات الشائعة التي رصدتها في بطاقات التفتيش؟',
            'كيف نضمن الامتثال الكامل لقوانين النقل والبيئة المحلية؟'
          ];
        case 'supply-chain':
          return [
            'ما هي قطع الغيار التي قاربت على النفاد وتحت حد الأمان؟',
            'قارن لي بين الموردين المحليين لتوفير الفرامل بأقل تكلفة',
            'هل يجب تقديم طلب توريد عاجل الآن لـ فلتر الهواء وفلتر الزيت؟'
          ];
        case 'predictive':
          return [
            'ما هي الحافلات أو الشاحنات المعرضة لأعطال وشيكة هذا الأسبوع؟',
            'كيف يؤثر سلوك القيادة المتسرعة على تآكل الفحمات والإطارات؟',
            'أريد جدول الصيانة الوقائية القادم لسيارة تويوتا هايلوكس'
          ];
        case 'finance':
          return [
            'أين تذهب أعلى النفقات المالية في مركز الصيانة حالياً؟',
            'هل خيار التعامل مع الورش الخارجية ذو جدوى مالية مجدية؟',
            'قدم لي توصيات عملية لخفض هدر ميزانية شراء قطع الغيار'
          ];
        default:
          return ['ما هي توصياتك الحالية؟', 'كيف يسير العمل بالورشة؟'];
      }
    } else {
      switch (id) {
        case 'project-manager':
          return [
            'How can we improve workshop throughput during staff shortages?',
            'Analyze our pending task queue and staff allocation right now',
            'What are our top operational priorities to bypass parts crises?'
          ];
        case 'mechanic':
          return [
            'What are the torque specifications for Mercedes Actros brakes?',
            'Do we have certified oil filters in stock and what is the quantity?',
            'Provide a mechanical guide for repairing hydraulic cylinder leaks'
          ];
        case 'safety':
          return [
            'I want to review our latest fleet safety audit scores',
            'What are the most common failures flagged in inspection logs?',
            'How can we achieve 100% compliance with local transport rules?'
          ];
        case 'supply-chain':
          return [
            'Which critical spare parts are below our safety threshold?',
            'Compare local suppliers for cost-effective brake pads sourcing',
            'Should we place an urgent procurement order for air/oil filters?'
          ];
        case 'predictive':
          return [
            'Which vehicles are highly vulnerable to imminent failures this week?',
            'How does aggressive driving style impact parts wear-and-tear?',
            'Show me the next scheduled lifecycle check for Toyota Hilux'
          ];
        case 'finance':
          return [
            'Where is our highest maintenance spending concentrated currently?',
            'Is outsourcing heavy repairs to third-party workshops cost-effective?',
            'Give me practical recommendations to optimize parts consumption budgets'
          ];
        default:
          return ['What are your top insights?', 'How is the workshop performing today?'];
      }
    }
  };

  const getSmartClientSuggestions = (id: string, text: string, isAr: boolean) => {
    const query = text ? text.toLowerCase() : '';
    if (isAr) {
      switch (id) {
        case 'project-manager':
          if (query.includes('عجز') || query.includes('موظف') || query.includes('عمال') || query.includes('بشر')) {
            return [
              'ما هي خطة توزيع المهام اليومية في ظل هذا العجز؟',
              'هل يمكننا الاستعانة بفنيين مؤقتين لحل المشكلة؟',
              'كيف تؤثر قلة العمالة على مواعيد تسليم المركبات؟'
            ];
          }
          if (query.includes('أزمة') || query.includes('توريد') || query.includes('قطع') || query.includes('نقص')) {
            return [
              'ما هي قطع الغيار الأكثر تأثيراً على توقف العمل؟',
              'هل لدينا موردين بدلاء محليين لحالات الطوارئ؟',
              'كيف نتفادى غرامات تأخير تسليم الحافلات؟'
            ];
          }
          return [
            'كيف يمكن تحسين إنتاجية الورشة بنسبة 20%؟',
            'أريد مراجعة خطة الصيانة الاستباقية للشهر القادم',
            'ما هي أكثر الشاحنات المعطلة التي تستنزف العمالة؟'
          ];
        case 'mechanic':
          if (query.includes('فرامل') || query.includes('تيل') || query.includes('فحمات')) {
            return [
              'كم تستغرق عملية استبدال فحمات الفرامل بالكامل؟',
              'هل تتوفر فحمات الفرامل لجميع الشاحنات بالمخزن؟',
              'ما هي المعايير المعتمدة لفحص سلامة قرص الفرامل؟'
            ];
          }
          if (query.includes('زيت') || query.includes('فلتر') || query.includes('فلاتر')) {
            return [
              'متى يجب استبدال فلتر الزيت لشاحنة أكتروس؟',
              'كم لتر زيت تحتاجه تويوتا هايلوكس عند الصيانة؟',
              'كيف نكتشف تسريب الزيت في محرك الديزل مبكراً؟'
            ];
          }
          return [
            'أريد التحقق من ضغط نظام الهيدروليك في الرافعة',
            'ما هي قطع الصيانة الأكثر طلباً اليوم بالورشة؟',
            'هل تتوفر أداة المعايرة الرقمية لحاقن الوقود؟'
          ];
        case 'safety':
          return [
            'ما هي شروط السلامة عند التعامل مع بطاريات الليثيوم؟',
            'كيف نسجل حادثة عمل أو إصابة طفيفة بالمنظومة؟',
            'أريد طباعة ملصقات تحذيرية للورشة الكبرى'
          ];
        case 'supply-chain':
          return [
            'ما هي قطع الغيار التي انتهت صلاحية تخزينها؟',
            'كيف يمكننا تتبع شحنة الفلاتر المستوردة القادمة؟',
            'هل يمكن إعادة تفاوض أسعار العقود مع شركة قطع الغيار؟'
          ];
        case 'predictive':
          return [
            'ما هي نسبة دقة خوارزمية الذكاء الاصطناعي في رصد الأعطال؟',
            'هل توجد شاحنة بها تنبيه حرارة محرك غير طبيعي؟',
            'كيف نسجل قراءة العداد الرقمي للمركبة V3 تلقائياً؟'
          ];
        case 'finance':
          return [
            'ما هي الميزانية المتبقية لقسم الصيانة الميكانيكية؟',
            'كم بلغت التكلفة الإجمالية لإصلاح الحافلات هذا الربع؟',
            'أريد مقارنة تكلفة الصيانة الوقائية بالصيانة التصحيحية'
          ];
        default:
          return ['ما هي توصيتك التالية؟', 'كيف نسجل بيانات الصيانة؟', 'هل هناك تنبيهات حية؟'];
      }
    } else {
      switch (id) {
        case 'project-manager':
          return [
            'How can we prioritize tasks for today?',
            'Analyze our workshop efficiency with current staff',
            'What is the average vehicle turnaround time?'
          ];
        case 'mechanic':
          return [
            'What is the recommended replacement period for filters?',
            'How do we bleed the hydraulic braking system?',
            'What are the mechanical signs of transmission wear?'
          ];
        default:
          return ['What are your next recommendations?', 'Any live operational alerts?', 'Show me the recent activity logs'];
      }
    }
  };

  const getAgentSpecificFallback = (id: string, text: string, isAr: boolean) => {
    if (isAr) {
      switch (id) {
        case 'project-manager':
          return `### 📊 مراجعة تخطيطية من مدير المشروع الاستراتيجي
بناءً على طلبك بخصوص: "${text}"، قمت بمراجعة توزيع العمليات وموارد الورشة:
1. **سيناريو التشغيل**: تم رصد تزايد طفيف في قوائم الانتظار. ننصح بإعادة توجيه فنيين من قسم الهيدروليك لدعم الميكانيك العام.
2. **الإنتاجية**: رفع معدل تسليم أوامر العمل المفتوحة بنسبة 15% من خلال موازنة فترات الراحة وجدولة المهام الرقمية.
3. **توصية ملموسة**: تفعيل إغلاق أوامر الصيانة المكتملة سحابياً لتحرير مخصصاتها وتسهيل صرف قطع الغيار الجديدة.`;
        case 'mechanic':
          return `### 🛠️ تقرير فني من مساعد الصيانة والقطع
تحليل فني بخصوص: "${text}":
1. **أدلة الصيانة**: تم التحقق من العزم الموصى به لربط صواميل فرامل الشاحنات الثقيلة (Mercedes Actros) وهو **450 نيوتن.متر**، مع ضرورة تطبيق شحم حراري معتمد على مجاري الحركة.
2. **المخزون الفوري**: فلاتر الزيت (LF-16015) متوفرة بعدد **14 حبة** في الرف B-3، وهو مستوى مطمئن يفوق حد الأمان الموصى به.
3. **الخطوات الفنية**: احرص على استخدام جهاز OBD-II لمسح رمز العطل وتصفيره بعد استبدال الحشوات أو الحساسات لمنع تنبيه لوحة القيادة.`;
        case 'safety':
          return `### 🛡️ تدقيق السلامة والامتثال الرقمي
بناءً على تدقيق معايير الأمان بخصوص: "${text}":
1. **مؤشر الامتثال**: نسبة الالتزام ببطاقات الفحص الرقمي بلغت **94%** هذا الأسبوع. تم رصد ملاحظتين بشأن عدم ارتداء نظارات حماية أثناء اللحام في ورشة ميكانيك-2.
2. **حالة النقل البري**: جميع مركبات نقل الركاب النشطة اجتازت فحص الفرامل والانبعاثات بامتثال كامل لقوانين النقل والبيئة.
3. **الإجراء الوقائي**: يوصى بجدولة تفتيش مفاجئ لأجهزة الإطفاء ومخارج الطوارئ في الورشة الكبرى ومستودع قطع الغيار لضمان الأمن والسلامة.`;
        case 'supply-chain':
          return `### 📦 تحليل المشتريات ومفاوضة الموردين
رصد سلاسل الإمداد بخصوص: "${text}":
1. **تنبيه نفاد المخزون**: فلاتر الهواء لسيارات تويوتا هايلوكس هبطت إلى **3 حبات** (تحت حد الأمان البالغ 5 حبات). تم توليد طلب شراء وقائي برقم PR-2026-089.
2. **عروض أسعار الموردين**: مقارنة الأسعار لـ طقم فحمات الفرامل تظهر أن "مورد الشرق" يقدم سعراً أقل بنسبة 12% مع جودة معتمدة وضمان تشغيل لمدة 6 أشهر مقارنة بالبقية.
3. **التوصية**: اعتماد أمر الشراء العاجل للقطع الهابطة تحت حد الأمان لتجنب تعطل الحافلات في فترات ذروة التشغيل القادمة.`;
        case 'predictive':
          return `### 🔮 توقعات الصيانة التنبؤية ودورة حياة الأصول
قراءة تنبؤية للعدادات والبيانات الحية بخصوص: "${text}":
1. **احتمالية الأعطال**: الشاحنة رقم Plate-DU-8821 تظهر مؤشرات لتآكل تيل الفرامل بنسبة 85% خلال 400 كم القادمة بناءً على سلوك القيادة المتكرر في الاختناقات المرورية.
2. **تحليل دورة الحياة**: حافلات نقل الكادر التي قطعت أكثر من 180,000 كم تحتاج إلى فحص تنبؤي لنظام التبريد ومضخة الماء قبل موسم الحر الشديد لتفادي التوقف المفاجئ.
3. **إجراء عاجل**: استدعاء الشاحنة المعنية للفحص الوقائي السريع، فتكلفة التبديل المخطط له تعادل 20% فقط من تكلفة القطر والإصلاح الطارئ في الطريق.`;
        case 'finance':
          return `### 💼 التقرير المالي ومراقبة هدر الميزانيات
تحليل مالي مفصل بخصوص البند: "${text}":
1. **تكلفة الاستهلاك**: نفقات شراء قطع الغيار شكلت 42% من إجمالي ميزانية التشغيل هذا الشهر. الهدر الأكبر كان في تكرار استبدال خراطيم الهيدروليك من ماركات غير معتمدة.
2. **مقارنة الجدوى**: تكلفة الاستعانة بالورش الخارجية لإصلاح المحركات الثقيلة بلغت **$4,500** لكل محرك، في حين أن صيانتها داخلياً بواسطة طاقم المهندسين المتاحين لا تتجاوز **$1,800** (توفير بنسبة 60%).
3. **قرار مالي**: نوصي بوقف إرسال المحركات للورش الخارجية فوراً وتكليف فنيي الورشة بجميع أعمال التوضيب والإصلاح الميكانيكي تحت رقابة المشرف.`;
      default:
        return `### 🤖 استشارة ذكية من مركز الوكلاء
بخصوص: "${text}"، قمت بمطابقة قراءات الأسطول وجداول الصيانة المتاحة:
- **التوصية**: يرجى الاستمرار في فحص مستجدات الأرفف وتحيين سجلات المزامنة سحابياً بصفة مستمرة.
- **الحالة**: المنظومة تعمل بامتثال تشغيلي ممتاز وكافة التوصيات جاهزة للتنفيذ.`;
      }
    } else {
      switch (id) {
        case 'project-manager':
          return `### 📊 Strategic Project Manager Briefing
Regarding your query on: "${text}", I have reviewed our operational resources:
1. **Workloads**: Detected minor bottlenecks in repair lines. Recommend reassigning 2 techs from hydraulic lines to general mechanics to speed up deliveries.
2. **Efficiency**: Raise completion rates by 15% through smart scheduling and automated digital task tracking.
3. **Actionable Step**: Formally close fully-serviced orders via cloud sync to release allocated spares for incoming orders.`;
        case 'mechanic':
          return `### 🛠️ Technical Repair Guidance
Mechanical analysis for: "${text}":
1. **Specs Guide**: Confirmed that heavy-duty truck (Mercedes Actros) wheel hub bolts torque spec is **450 N.m**, with mandatory application of heat-resistant grease on calliper slide pins.
2. **Instant Inventory**: LF-16015 Oil Filters are healthy at **14 units** on Rack B-3, well above safety threshold levels.
3. **Tech Tip**: Use the OBD-II diagnostic computer to reset failure codes after replacing any gaskets or sensors to clear dashboard check-engine alerts.`;
        case 'safety':
          return `### 🛡️ Safety & Compliance Digital Log Audit
Regarding safety metrics on: "${text}":
1. **Compliance Index**: Checklist completion reached **94%** this week. Two minor safety violations were logged regarding eye protective gear in Workshop-2.
2. **Transport Audit**: All active passenger buses have cleared emissions and brake performance audits in full compliance with municipal laws.
3. **Preventive Action**: Schedule an unannounced fire safety and emergency exit audit in the primary workshop and inventory yard tomorrow morning.`;
        case 'supply-chain':
          return `### 📦 Supply Chain & Procurement Advisory
Procurement parameters on: "${text}":
1. **Stock Warning**: Hilux air filters dropped to **3 units** (below safety min of 5). Pre-emptive purchase request generated as PR-2026-089.
2. **Vendor Quotes**: Bids comparison for heavy brake pads reveals "Al-Sharq Spares" is 12% cheaper with full 6-month warranty compared to alternative local shops.
3. **Decision**: Approve the immediate PO for items flagged below safety stock levels to secure critical operations.`;
        case 'predictive':
          return `### 🔮 Predictive Maintenance & Wear Analytics
Telemetry analysis for: "${text}":
1. **Failure Probability**: Plate-DU-8821 has an 85% probability of brake pad wear-out within the next 400 km based on heavy stop-and-go driving patterns.
2. **Asset Lifecycle**: Fleet buses with odometer readings exceeding 180,000 km require water pump and radiator cooling system tests before peak summer season.
3. **Action**: Pull the flagged truck into the quick-service lane now. Preventive replacement costs 20% less than a highway breakdown and towing.`;
        case 'finance':
          return `### 💼 Financial Control & Cost Report
Budget audit regarding cost center: "${text}":
1. **Parts Outlays**: Parts purchase consumed 42% of the operating budget. The primary leaks were repeated high-frequency purchases of low-quality hydraulic hoses.
2. **Feasibility Study**: Outsourcing heavy engine overhauls to third-party shops costs **$4,500** per unit. Rebuilding them on-site using our tech staff costs **$1,800** (60% cost savings).
3. **Financial Recommendation**: Halt all third-party engine repair orders immediately and assign the tasks to our skilled workshop technicians on-site.`;
        default:
          return `### 🤖 Smart Agent Recommendation
Regarding: "${text}", live data metrics match our general parameters:
- **Advisory**: Keep monitoring parts consumption and update cloud records to maintain maximum operational uptime.
- **Status**: The workshop complies fully with all technical standards.`;
      }
    }
  };

  const handleOpenAgentChat = (agent: any) => {
    setActiveChatAgent(agent);
    
    // Initialize suggestions if not set
    if (!dynamicSuggestions[agent.id]) {
      setDynamicSuggestions(prev => ({
        ...prev,
        [agent.id]: getAgentSuggestions(agent.id, language === 'ar')
      }));
    }
    
    // If no chat history exists for this agent yet, initialize with a beautiful custom welcome message!
    if (!agentChats[agent.id]) {
      const welcomeText = language === 'ar' 
        ? getAgentWelcomeMessageAr(agent.id)
        : getAgentWelcomeMessageEn(agent.id);
      
      setAgentChats(prev => ({
        ...prev,
        [agent.id]: [
          { role: 'model', text: welcomeText }
        ]
      }));
    }
  };

  const handleAgentSendMessage = async (agentId: string, textToSend?: string) => {
    if (!activeChatAgent) return;
    const currentChat = agentChats[agentId] || [];
    const text = textToSend?.trim() || agentInputText.trim();
    if (!text) return;

    // Clear input
    setAgentInputText('');

    const userMessage: AIMessage = { role: 'user', text };
    
    // Optimistically add user message
    setAgentChats(prev => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), userMessage]
    }));

    setAgentChatLoading(prev => ({ ...prev, [agentId]: true }));

    // Define custom context according to which agent it is
    const activeAgent = agentsRegistry.find(a => a.id === agentId);
    const agentName = activeAgent ? (language === 'ar' ? activeAgent.nameAr : activeAgent.nameEn) : 'Agent';
    const agentDesc = activeAgent ? (language === 'ar' ? activeAgent.descAr : activeAgent.descEn) : '';
    
    const context = `
      أنت "${agentName}" في مركز صيانة المركبات والمعدات الذكي التابع للمؤسسة.
      دورك ووصف عملك: ${agentDesc}
      
      فيما يلي بيانات الأسطول والورش والمخازن الحية المسجلة بالمنظومة للرجوع إليها:
      =========================================
      - عدد المركبات الإجمالي بالأسطول: ${simulatedVehiclesCount}
      - عدد أوامر الصيانة الحالية قيد المتابعة: ${simulatedOrdersCount}
      - عدد الفنيين والمهندسين المتاحين بالورشة اليوم: ${simulatedTechniciansCount}
      - حالة المستودع: ${simulatedInventoryCount} أصناف قطع غيار فريدة
      - حالة سيناريو تشغيل الأسطول الحالي: ${activeScenario === 'normal' ? 'طبيعي متزن' : activeScenario === 'parts-crisis' ? 'أزمة توريد' : activeScenario === 'backlog-peak' ? 'ذروة تكدس' : 'عجز بشري'}
      =========================================

      وظيفتك الخاصة كـ "${agentName}" هي:
      1. الإجابة بدقة متناهية وبطابع مهني وداعم مبني على تخصصك فقط.
      2. تقديم توصيات ملموسة، عملية وقابلة للتطبيق فوراً من قبل المدير التنفيذي أو مدراء العمليات بالورشة.
      3. الحفاظ على إجابات رصينة، منسقة بشكل ممتاز باستخدام لغة التخاطب (العربية بالدرجة الأولى، أو الإنجليزية إذا خاطبك بها).
      4. استخدام الرموز التعبيرية الهندسية/المهنية لإضفاء طابع تفاعلي مميز.
      
      هام جداً وجوهري لسلامة النظام:
      يجب عليك في نهاية ردك تماماً، وبشكل إلزامي، إضافة سطر يحتوي فقط على الكلمة المفتاحية '||SUGGESTIONS||'، يليه مباشرة ثلاثة (3) أسئلة أو استفسارات سريعة مقترحة وموصى بها ومناسبة جداً لمسار وتطور المحادثة الحالي ليستعين بها المستخدم كخطوة تالية (سؤال واحد فقط لكل سطر، بدون أرقام أو رموز نقطية، بحد أقصى 10 كلمات للسؤال).
      مثال على الهيكل المطلوب للرد:
      [محتوى ردك المنسق والغني هنا]
      ||SUGGESTIONS||
      سؤال المتابعة الأول المتوقع؟
      سؤال المتابعة الثاني المتوقع؟
      سؤال المتابعة الثالث المتوقع؟
    `;

    try {
      const res = await fetch("/api/ai/project-manager-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...currentChat, userMessage], 
          context 
        }),
      });
      if (!res.ok) {
        throw new Error("Failed server-side query");
      }
      const data = await res.json();
      const rawReply = data.text || (language === 'ar' ? "عذراً، لم أستطع معالجة التوصية حالياً." : "Sorry, I could not process your recommendation request.");
      
      let reply = rawReply;
      let suggestions: string[] = [];

      if (rawReply.includes('||SUGGESTIONS||')) {
        const parts = rawReply.split('||SUGGESTIONS||');
        reply = parts[0].trim();
        const sugText = parts[1] || '';
        suggestions = sugText
          .split('\n')
          .map(s => s.trim().replace(/^[-*•\d.\s]+/, '')) // clean any list markers
          .filter(s => s.length > 0 && !s.includes('SUGGESTIONS'));
      }

      // Fallback suggestions if we couldn't parse 3 clean ones
      if (suggestions.length < 2) {
        suggestions = getSmartClientSuggestions(agentId, text, language === 'ar');
      }

      setDynamicSuggestions(prev => ({
        ...prev,
        [agentId]: suggestions.slice(0, 3)
      }));

      setAgentChats(prev => ({
        ...prev,
        [agentId]: [...(prev[agentId] || []), { role: 'model', text: reply }]
      }));
    } catch (error) {
      console.error("Agent chat query error:", error);
      const fallbackReply = getAgentSpecificFallback(agentId, text, language === 'ar');
      const fallbackSug = getSmartClientSuggestions(agentId, text, language === 'ar');
      
      setDynamicSuggestions(prev => ({
        ...prev,
        [agentId]: fallbackSug
      }));

      setAgentChats(prev => ({
        ...prev,
        [agentId]: [...(prev[agentId] || []), { role: 'model', text: fallbackReply }]
      }));
    } finally {
      setAgentChatLoading(prev => ({ ...prev, [agentId]: false }));
    }
  };

  const getFontSizeClass = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm': return 'text-[13px] md:text-[14px] leading-relaxed font-semibold';
      case 'lg': return 'text-[22px] md:text-[24px] leading-relaxed font-bold';
      case 'md':
      default:
        return 'text-[17px] md:text-[18px] leading-relaxed font-semibold';
    }
  };

  // --- 1. State for AI Project Manager ---
  const [firebaseConnected, setFirebaseConnected] = useState<boolean | null>(null);
  const [isTestingFirebase, setIsTestingFirebase] = useState<boolean>(false);
  const [isSyncInProgress, setIsSyncInProgress] = useState<boolean>(false);
  const [syncProgressText, setSyncProgressText] = useState<string>('');
  const [isDiagnosticExpanded, setIsDiagnosticExpanded] = useState<boolean>(true);

  const [tableSyncStates, setTableSyncStates] = useState<{
    [key: string]: { local: number; cloud: number | null; status: 'loading' | 'synced' | 'mismatch' | 'error' }
  }>({
    vehicles: { local: 0, cloud: null, status: 'loading' },
    maintenance_orders: { local: 0, cloud: null, status: 'loading' },
    inventory: { local: 0, cloud: null, status: 'loading' },
    technicians: { local: 0, cloud: null, status: 'loading' },
    safety_inspections: { local: 0, cloud: null, status: 'loading' },
  });

  const refreshSyncDiagnostic = async () => {
    setIsTestingFirebase(true);
    setSyncProgressText(language === 'ar' ? 'جاري فحص الاتصال وقراءة السجلات...' : 'Verifying connection & scanning logs...');
    
    // 1. Check connection
    const connected = await testFirestoreConnection();
    setFirebaseConnected(connected);

    // 2. Fetch local counts
    const localVehiclesStr = localStorage.getItem('fleet_vehicles_v3') || localStorage.getItem('fleet_vehicles_v2');
    const localVehiclesCount = localVehiclesStr ? JSON.parse(localVehiclesStr).length : defaultVehicles.length;

    const localOrdersStr = localStorage.getItem('fleet_maintenance_orders_v2');
    const localOrdersCount = localOrdersStr ? JSON.parse(localOrdersStr).length : defaultOrders.length;

    const localInvStr = localStorage.getItem('fleet_inventory_v2');
    const localInvCount = localInvStr ? JSON.parse(localInvStr).length : defaultInventory.length;

    const localTechsStr = localStorage.getItem('fleet_technicians_v2');
    const localTechsCount = localTechsStr ? JSON.parse(localTechsStr).length : defaultTechnicians.length;

    const localInspectionsStr = localStorage.getItem('fleet_safety_inspections');
    const localInspectionsCount = localInspectionsStr ? JSON.parse(localInspectionsStr).length : 0;

    const newStates: typeof tableSyncStates = {
      vehicles: { local: localVehiclesCount, cloud: null, status: 'loading' },
      maintenance_orders: { local: localOrdersCount, cloud: null, status: 'loading' },
      inventory: { local: localInvCount, cloud: null, status: 'loading' },
      technicians: { local: localTechsCount, cloud: null, status: 'loading' },
      safety_inspections: { local: localInspectionsCount, cloud: null, status: 'loading' },
    };

    if (connected && db) {
      const collections = [
        { key: 'vehicles', col: 'vehicles' },
        { key: 'maintenance_orders', col: 'maintenance_orders' },
        { key: 'inventory', col: 'inventory' },
        { key: 'technicians', col: 'technicians' },
        { key: 'safety_inspections', col: 'safety_inspections' },
      ];

      for (const col of collections) {
        try {
          const snap = await getDocs(collection(db, col.col));
          const count = snap.size;
          const localVal = newStates[col.key].local;
          newStates[col.key] = {
            local: localVal,
            cloud: count,
            status: localVal === count ? 'synced' : 'mismatch'
          };
        } catch (err) {
          console.warn(`Could not fetch cloud count for ${col.col}:`, err);
          newStates[col.key] = {
            local: newStates[col.key].local,
            cloud: null,
            status: 'error'
          };
        }
      }
    } else {
      // Offline fallback
      Object.keys(newStates).forEach(key => {
        newStates[key] = {
          local: newStates[key].local,
          cloud: null,
          status: 'error'
        };
      });
    }

    setTableSyncStates(newStates);
    setIsTestingFirebase(false);
  };

  const handlePushAll = async () => {
    setIsSyncInProgress(true);
    setSyncProgressText(language === 'ar' ? 'جاري رفع كافة التعديلات والمزامنة مع Firestore...' : 'Pushing all local edits & synchronizing with Firestore...');
    const res = await pushLocalDataToCloud();
    setIsSyncInProgress(false);
    if (res.success) {
      setSyncProgressText(language === 'ar' ? `✓ نجح الرفع! تم مزامنة ${res.count} سجل.` : `✓ Push success! Synced ${res.count} records.`);
      await refreshSyncDiagnostic();
    } else {
      setSyncProgressText(language === 'ar' ? '✕ فشلت عملية الرفع. يرجى مراجعة القواعد الأمنية.' : '✕ Push failed. Review Firebase security rules.');
    }
  };

  const handlePullAll = async () => {
    setIsSyncInProgress(true);
    setSyncProgressText(language === 'ar' ? 'جاري سحب وتحديث السجلات من قاعدة البيانات السحابية...' : 'Pulling and updating local tables from Firestore...');
    const res = await pullCloudDataToLocal();
    setIsSyncInProgress(false);
    if (res.success) {
      setSyncProgressText(language === 'ar' ? `✓ نجح السحب! تم تحديث ${res.count} سجل محلياً.` : `✓ Pull success! Updated ${res.count} records.`);
      await refreshSyncDiagnostic();
    } else {
      setSyncProgressText(language === 'ar' ? '✕ فشلت عملية السحب. تأكد من تهيئة الجداول.' : '✕ Pull failed. Confirm schema initialized.');
    }
  };

  useEffect(() => {
    refreshSyncDiagnostic();
  }, [language]);

  const [pmMessages, setPmMessages] = useState<AIMessage[]>([
    { 
      role: 'model', 
      text: language === 'ar'
        ? 'أهلاً بك بكامل طاقتك القيادية! 🤖💼 أنا "روبرت - مدير المشروع الذكي (AI)" للتوجيه الإستراتيجي.\n\nلقد قمت بتحليل بيانات أسطولك الميكانيكي ومستودعات قطع الغيار وقوائم فنيي الورش حالياً.\nكيف يمكنني مساعدتك اليوم؟'
        : 'Welcome Commander! I am Robert, your Strategic AI Project Manager.\n\nI have parsed all registered vehicles, technician workloads, inventory rows and pending repair steps.\nHow can I assist you today?'
    }
  ]);
  const [pmInput, setPmInput] = useState('');
  const [pmLoading, setPmLoading] = useState(false);
  const pmScrollRef = useRef<HTMLDivElement>(null);

  // --- 2. State for Mechanic & Parts Bot ---
  const [mechMessages, setMechMessages] = useState<MechanicMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: language === 'ar'
        ? 'أهلاً بك في البوابة الفنية للورشة! 🛠️🔩 أنا "مساعد الصيانة والقطع الذكي".\n\nأنا مدرب خصيصاً لمساعدتك على فحص قطع الغيار المتوفرة على الأرفف بالمخزن، والاستفسار الفوري عن حالة شاحنة أو معدة، أو لتوليد خطوات العمل التفصيلية لإصلاح أعطال الفرامل والمحركات والهيدروليك بامتثال رقمي كامل.\n\nأخبرني بالمركبة أو القطعة التي تود الاستعلام عنها الآن!'
        : 'Hello from the workshop technical floor! 🛠️🔩 I am your "Smart Mechanic & Parts Assistant".\n\nI specialize in checking physical inventory shelves, pulling instant vehicle diagnostic files, or generating step-by-step mechanical/hydraulic work orders with technical torque benchmarks.\n\nWhat item or spare part are you tracking today?',
      timestamp: new Date()
    }
  ]);
  const [mechInput, setMechInput] = useState('');
  const [mechLoading, setMechLoading] = useState(false);
  const mechScrollRef = useRef<HTMLDivElement>(null);

  // Scroll effect on message update
  useEffect(() => {
    if (activeTab === 'project-manager' && pmScrollRef.current) {
      pmScrollRef.current.scrollTop = pmScrollRef.current.scrollHeight;
    }
  }, [pmMessages, pmLoading, activeTab]);

  useEffect(() => {
    if (activeTab === 'mechanic' && mechScrollRef.current) {
      mechScrollRef.current.scrollTop = mechScrollRef.current.scrollHeight;
    }
  }, [mechMessages, mechLoading, activeTab]);

  // --- 3. Handling Actions ---

  // Standard interactive trigger that switches tab and performs request
  const triggerAgentWithQuestion = (agent: 'project-manager' | 'mechanic', question: string) => {
    setActiveTab(agent);
    if (agent === 'project-manager') {
      handlePmSendMessage(question);
    } else {
      handleMechSendMessage(question);
    }
  };

  // Sender for PM Bot
  const handlePmSendMessage = async (textToSend?: string) => {
    const text = textToSend || pmInput;
    if (!text.trim() || pmLoading) return;

    const userMessage: AIMessage = { role: 'user', text };
    setPmMessages(prev => [...prev, userMessage]);
    
    if (!textToSend) {
      setPmInput('');
    }
    
    setPmLoading(true);

    try {
      const response = await getAIProjectManagerInsight([...pmMessages, userMessage], getPmContextModifier());
      setPmMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
      console.error(e);
      setPmMessages(prev => [...prev, { 
        role: 'model', 
        text: language === 'ar'
          ? '⚠️ عذراً، واجهت صعوبة في معالجة طلبك حالياً. يرجى التحقق من اتصال الإنترنت.'
          : '⚠️ Pardon me, I had issue getting the response. Please check project settings.'
      }]);
    } finally {
      setPmLoading(false);
    }
  };

  // Sender for Mechanic Bot
  const handleMechSendMessage = async (textToSend?: string) => {
    const text = textToSend || mechInput;
    if (!text.trim() || mechLoading) return;

    const newUserMessage: MechanicMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text,
      timestamp: new Date()
    };

    setMechMessages(prev => [...prev, newUserMessage]);
    if (!textToSend) {
      setMechInput('');
    }
    setMechLoading(true);

    try {
      // Build parameters exactly like custom endpoint expects
      const sanitizedVehicles = defaultVehicles.map(v => ({
        id: v.id,
        plateNumber: v.plateNumber,
        model: v.name,
        type: v.type,
        status: v.status
      }));

      const sanitizedOrders = defaultOrders.map(o => ({
        id: o.id,
        vehicleId: o.vehicleId,
        category: o.category,
        description: o.description,
        status: o.status,
        cost: o.cost,
        technicianId: o.technicianId
      }));

      const sanitizedInventory = defaultInventory.map(i => ({
        id: i.id,
        name: i.name,
        parCode: i.partNumber,
        quantity: i.quantity,
        minQuantity: i.minQuantity,
        price: i.price
      }));

      const sanitizedTechnicians = defaultTechnicians.map(t => ({
        id: t.id,
        name: t.name,
        specialty: t.specialization,
        status: t.status || '',
        activeTasks: t.activeTasks || 0
      }));

      const mappedMechMessages = [...mechMessages, newUserMessage]
        .filter(m => !m.id.startsWith('welcome'))
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const mechModifier = getMechContextModifier();
      if (mechModifier) {
        mappedMechMessages.unshift({
          role: 'user',
          text: `[نظام توجيه محاكاة]: يرجى صياغة ردك متماشياً مع المحدد الفني والظروف التالية: ${mechModifier}`
        });
      }

      const payload = {
        messages: mappedMechMessages,
        vehicles: sanitizedVehicles,
        orders: sanitizedOrders,
        inventory: sanitizedInventory,
        technicians: sanitizedTechnicians,
        language
      };

      const res = await fetch('/api/ai/maintenance-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('API server returned error state.');
      }

      const data = await res.json();

      setMechMessages(prev => [...prev, {
        id: `msg-${Date.now()}-reply`,
        role: 'model',
        text: data.text,
        timestamp: new Date()
      }]);
    } catch (e) {
      console.error(e);
      setMechMessages(prev => [...prev, {
        id: `msg-${Date.now()}-err`,
        role: 'model',
        text: language === 'ar'
          ? '🛑 حدث خطأ أثناء إرسال استفسارك الفني للخادم، يرجى التثبت والمحاولة لاحقاً.'
          : '🛑 An error occurred while communicating with the server. Please retry.',
        timestamp: new Date()
      }]);
    } finally {
      setMechLoading(false);
    }
  };

  // Co-Pilot Multi-Agent concurrent sender
  const handleCoPilotSendMessage = async (textToSend?: string) => {
    const text = textToSend || coPilotInput;
    if (!text.trim() || coPilotLoading) return;

    const newUserMessage: CoPilotMessage = {
      id: `copilot-${Date.now()}-user`,
      role: 'user',
      text,
      timestamp: new Date()
    };

    setCoPilotMessages(prev => [...prev, newUserMessage]);
    if (!textToSend) {
      setCoPilotInput('');
    }
    setCoPilotLoading(true);

    try {
      // 1. Trigger PM Insight query
      const pmPromise = getAIProjectManagerInsight(
        coPilotMessages
          .filter(m => m.text)
          .map(m => ({ role: m.role, text: m.text || '' }))
          .concat([{ role: 'user', text }]),
        getPmContextModifier()
      );

      // 2. Trigger Mechanic Bot query
      const sanitizedVehicles = defaultVehicles.map(v => ({
        id: v.id,
        plateNumber: v.plateNumber,
        model: v.name,
        type: v.type,
        status: v.status
      }));

      const sanitizedOrders = defaultOrders.map(o => ({
        id: o.id,
        vehicleId: o.vehicleId,
        category: o.category,
        description: o.description,
        status: o.status,
        cost: o.cost,
        technicianId: o.technicianId
      }));

      const sanitizedInventory = defaultInventory.map(i => ({
        id: i.id,
        name: i.name,
        parCode: i.partNumber,
        quantity: i.quantity,
        minQuantity: i.minQuantity,
        price: i.price
      }));

      const sanitizedTechnicians = defaultTechnicians.map(t => ({
        id: t.id,
        name: t.name,
        specialty: t.specialization,
        status: t.status || '',
        activeTasks: t.activeTasks || 0
      }));

      const mappedMechMessages = coPilotMessages
        .filter(m => m.text)
        .map(m => ({ role: m.role, text: m.text || '' }))
        .concat([{ role: 'user', text }]);

      const mechModifier = getMechContextModifier();
      if (mechModifier) {
        mappedMechMessages.unshift({
          role: 'user',
          text: `[نظام محاكاة توجيهي خارجي للمطابقة]: ركز على الظروف والسمات التالية في ردودك القادمة: ${mechModifier}`
        });
      }

      const mechPromise = fetch('/api/ai/maintenance-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: mappedMechMessages,
          vehicles: sanitizedVehicles,
          orders: sanitizedOrders,
          inventory: sanitizedInventory,
          technicians: sanitizedTechnicians,
          language
        })
      }).then(async r => {
        if (!r.ok) throw new Error();
        const data = await r.json();
        return data.text;
      });

      // Execute both concurrently
      const [pmRes, mechRes] = await Promise.all([pmPromise, mechPromise]);

      setCoPilotMessages(prev => [...prev, {
        id: `copilot-${Date.now()}-reply`,
        role: 'model',
        pmText: pmRes,
        mechText: mechRes,
        timestamp: new Date()
      }]);

    } catch (err) {
      console.error(err);
      setCoPilotMessages(prev => [...prev, {
        id: `copilot-${Date.now()}-err`,
        role: 'model',
        pmText: language === 'ar' ? '⚠️ عذراً، تعذر استرداد توجيه مدير المشروع.' : '⚠️ Strategic query failed.',
        mechText: language === 'ar' ? '⚠️ عذراً، تعذر استرداد إفادة كبير الفنيين.' : '⚠️ Workshop query failed.',
        timestamp: new Date()
      }]);
    } finally {
      setCoPilotLoading(false);
    }
  };

  const handleCoPilotClearChat = () => {
    setCoPilotMessages([
      {
        id: 'welcome-copilot-reset',
        role: 'model',
        pmText: language === 'ar'
          ? 'تم تصفير ذاكرة التعاون الفيدرالي بالكامل. كيف نستطيع توجيه الأسطول والورش معاً الآن?'
          : 'Co-Pilot concurrent history flushed. How can we orchestrate strategy and mechanic floors today?',
        mechText: language === 'ar'
          ? 'تم التصفير. بانتظار استفسارك المزدوج لمطابقة رصيد المستودع والبدء الفوري!'
          : 'Ready. Submit any joint query to analyze part reserves and procedures concurrently!',
        timestamp: new Date()
      }
    ]);
  };

  const handleQuickOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stored = localStorage.getItem('fleet_maintenance_orders_v2');
      const currentOrders = stored ? JSON.parse(stored) : defaultOrders;

      const newOrder = {
        id: `MNT-${Math.floor(1000 + Math.random() * 9000)}`,
        vehicleId: quickOrderData.vehicleId || defaultVehicles[0]?.id || 'V1',
        category: quickOrderData.category,
        description: quickOrderData.description || 'طلب صيانة مولد بالذكاء الاصطناعي',
        status: 'pending',
        priority: 'high',
        technicianId: quickOrderData.technicianId || defaultTechnicians[0]?.id || 'T1',
        startDate: new Date().toISOString().split('T')[0],
        cost: Number(quickOrderData.cost) || 150,
        notes: 'تم إنشاؤه مباشرة من محادثة مركز الوكلاء الذكاء الاصطناعي.'
      };

      const updated = [newOrder, ...currentOrders];
      localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify(updated));
      
      setQuickOrderModalOpen(false);
      refreshSyncDiagnostic();

      if (activeTab === 'project-manager') {
        setPmMessages(prev => [...prev, {
          role: 'model',
          text: language === 'ar'
            ? `✅ تم بنجاح توليد أمر صيانة فوري برقم ${newOrder.id} وإضافته لجدول الأعمال الفعلي!`
            : `✅ Successfully generated direct work order ${newOrder.id} and synced to active tasks!`
        }]);
      } else if (activeTab === 'mechanic') {
        setMechMessages(prev => [...prev, {
          id: `msg-${Date.now()}-ticket`,
          role: 'model',
          text: language === 'ar'
            ? `🛠️ تم فتح أمر عمل رقم ${newOrder.id} وتكليف الميكانيكي المناسب فورياً.`
            : `🛠️ Opened physical work order ${newOrder.id} and assigned to technician instantly.`,
          timestamp: new Date()
        }]);
      } else {
        setCoPilotMessages(prev => [...prev, {
          id: `copilot-${Date.now()}-ticket`,
          role: 'model',
          pmText: language === 'ar' ? `📋 وافقت الإدارة على تفويض التكلفة لطلب ${newOrder.id}.` : `📋 Strategic approval completed for task ${newOrder.id}.`,
          mechText: language === 'ar' ? `🔧 تم إضافة التكليف رقم ${newOrder.id} للوحة تحكم الفنيين.` : `🔧 Technician dispatch card ${newOrder.id} posted.`,
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderRichMessageText = (text: string, msgId: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs md:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} className="h-2" />;
          
          if (trimmed.startsWith('###')) {
            return (
              <h4 key={i} className="text-xs font-black text-slate-900 dark:text-white border-l-4 border-violet-500 pl-2 mt-3 mb-1.5 flex items-center gap-1.5">
                <Sparkles size={12} className="text-violet-500 animate-pulse" />
                {trimmed.replace('###', '').trim()}
              </h4>
            );
          }
          
          if (trimmed.startsWith('##')) {
            return (
              <h3 key={i} className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1 mt-4 mb-2">
                {trimmed.replace('##', '').trim()}
              </h3>
            );
          }

          if (trimmed.startsWith('⚠️') || trimmed.startsWith('🛑') || trimmed.includes('تحذير')) {
            return (
              <div key={i} className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 rounded-xl border border-rose-100 dark:border-rose-900/30 my-2 text-xs font-bold flex items-start gap-2">
                <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                <span>{trimmed}</span>
              </div>
            );
          }

          if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
            const cleanText = trimmed.replace(/^[-*]\s*/, '');
            return (
              <div key={i} className="flex items-start gap-2 pl-1.5 my-1 text-slate-600 dark:text-slate-300 font-semibold text-[11px] md:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 shrink-0" />
                <span>{cleanText}</span>
              </div>
            );
          }

          if (/^\d+\./.test(trimmed)) {
            return (
              <div key={i} className="flex items-start gap-2 pl-1 my-1 font-semibold text-[11px] md:text-xs">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {trimmed.match(/^\d+/)![0]}
                </span>
                <span className="text-slate-600 dark:text-slate-300">{trimmed.replace(/^\d+\.\s*/, '')}</span>
              </div>
            );
          }

          return (
            <p key={i} className="font-semibold text-[11px] md:text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  // TTS (Text-to-Speech) Read Aloud feature
  const handleToggleSpeakMessage = (messageId: string, text: string) => {
    if (activeAudioMessageId === messageId && isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setActiveAudioMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const containsArabic = /[\u0600-\u06FF]/.test(text);
    if (containsArabic) {
      utterance.lang = 'ar-SA';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setActiveAudioMessageId(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setActiveAudioMessageId(null);
    };

    speechUtteranceRef.current = utterance;
    setActiveAudioMessageId(messageId);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Smart Voice Dictation trigger
  const handleStartVoiceDictation = (target: 'pm' | 'mech' | 'copilot') => {
    if (isDictating) {
      setIsDictating(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsDictating(true);
        };

        recognition.onresult = (event: any) => {
          const speechResult = event.results[0][0].transcript;
          if (target === 'pm') setPmInput(speechResult);
          else if (target === 'mech') setMechInput(speechResult);
          else setCoPilotInput(speechResult);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsDictating(false);
          triggerSimulationFallback(target);
        };

        recognition.onend = () => {
          setIsDictating(false);
        };

        recognition.start();
      } catch (e) {
        console.warn('Failed to start speech recognition:', e);
        triggerSimulationFallback(target);
      }
    } else {
      triggerSimulationFallback(target);
    }
  };

  const triggerSimulationFallback = (target: 'pm' | 'mech' | 'copilot') => {
    setIsDictating(true);
    
    let fallbackText = '';
    if (target === 'pm') {
      if (activeScenario === 'parts-crisis') {
        fallbackText = language === 'ar' 
          ? 'أريد حلاً لنقص الأرصدة وقطع الغيار الحرجة بالورشة اليوم'
          : 'I need a resolution plan for the critical spare parts deficiency today';
      } else if (activeScenario === 'backlog-peak') {
        fallbackText = language === 'ar'
          ? 'كيف نوزع فنيي الصيانة لتخفيف التراكم الزائد وسرعة الإنجاز؟'
          : 'How do we distribute technicians to reduce backlog peak and speed up repairs?';
      } else {
        fallbackText = language === 'ar'
          ? 'قدم لي توجيهاً إستراتيجياً لتحسين أداء الطاقم وزيادة معدل الجاهزية'
          : 'Give me strategic guidance to optimize crew performance and increase fleet readiness';
      }
    } else if (target === 'mech') {
      fallbackText = language === 'ar'
        ? 'ما هو رصيد قطع فرامل شاحنات مرسيدس أكتروس وموقعها بالمستودع؟'
        : 'What is the current stock count and rack location of Mercedes Actros brake parts?';
    } else {
      fallbackText = language === 'ar'
        ? 'خطط لحل أزمة الصيانة في الورش الفيدرالية مع جرد قطع الغيار المتاحة حالياً'
        : 'Plan to resolve the federal workshop maintenance peak while checking available parts counts';
    }

    let currentText = '';
    let index = 0;
    const interval = setInterval(() => {
      if (index < fallbackText.length) {
        currentText += fallbackText[index];
        if (target === 'pm') setPmInput(currentText);
        else if (target === 'mech') setMechInput(currentText);
        else setCoPilotInput(currentText);
        index++;
      } else {
        clearInterval(interval);
        setIsDictating(false);
      }
    }, 45);
  };

  // Reset chat logic
  const handlePmClearChat = () => {
    setPmMessages([
      { 
        role: 'model', 
        text: language === 'ar'
          ? 'أهلاً بك مجدداً. تم تصفير سجل المخطط الإستراتيجي بالكامل. تفضل بطرح مشكلة أو انقر على المقترحات لتوفير الوقت.'
          : 'Welcome back. Strategy cache has been fully reset. Feel free to state a scenario or tap any bento cards.'
      }
    ]);
  };

  const handleMechClearChat = () => {
    setMechMessages([
      {
        id: `welcome-reset`,
        role: 'model',
        text: language === 'ar'
          ? 'تم تصفير ذاكرة المساعد الفني. تفضل بطرح طراز الشاحنة أو القطعة التي تود الاستعلام عن رصيدها بالرفوف الآن!'
          : 'Mechanic assistant log flushed. State the truck plate / model or spare part code you are searching for now!',
        timestamp: new Date()
      }
    ]);
  };

  const handlePmSuggestionClick = (text: string) => {
    handlePmSendMessage(text);
    setPmGuideModalOpen(false);
  };

  const handleMechSuggestionClick = (text: string) => {
    handleMechSendMessage(text);
    setMechGuideModalOpen(false);
  };

  // Bento suggestions configurations matching original files but visually enhanced
  const pmSuggestions = [
    {
      text: 'كيف يمكنني تحسين معالجة الأعطال وتفادي تراكم فواتير الصيانة اليوم؟',
      label: language === 'ar' ? 'خطة تقليص التراكم' : 'Queue Reducer Plan',
      desc: language === 'ar' ? 'توجيه أعباء الفنيين بالورش للحد من التكدس.' : 'Resolve core bay bottleneck issues.',
      icon: <Wrench size={16} className="text-violet-600 dark:text-violet-400" />,
      color: 'from-violet-500/10 to-indigo-500/5 text-violet-750 dark:text-violet-400 border-violet-100 dark:border-violet-950/60'
    },
    {
      text: 'أعطني خطة مقترحة لتوزيع الفنيين المناوبين اليوم لتسريع الصيانة الدورية.',
      label: language === 'ar' ? 'إسناد الفنيين الذكي' : 'Staff Allocation Plan',
      desc: language === 'ar' ? 'التقليل الفوري لأوقات انتظار الشاحنات والمعدات.' : 'Rebalance assignments for heavy rigs.',
      icon: <Users size={16} className="text-emerald-600 dark:text-emerald-400" />,
      color: 'from-emerald-500/10 to-teal-500/5 text-emerald-750 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/60'
    },
    {
      text: 'ما هي توصياتك الاستباقية لتوفير ميزانية قطع الغيار استناداً للأرصدة المتوفرة حالياً؟',
      label: language === 'ar' ? 'تحليل تكلفة القطع' : 'Spare Parts Valuation',
      desc: language === 'ar' ? 'تجنب شراء القطع المتوفرة بكثرة وتحديد بنود حد الأمان.' : 'Target high cost categories & limit deficit.',
      icon: <Warehouse size={16} className="text-amber-600 dark:text-amber-400" />,
      color: 'from-amber-500/10 to-orange-500/5 text-amber-750 dark:text-amber-400 border-amber-100 dark:border-amber-950/60'
    },
    {
      text: 'كيف أتعامل مع قضايا تأخر السائقين في استلام وتسليم المركبات الفنية؟',
      label: language === 'ar' ? 'تنظيم دورة السائقين' : 'Driver Transition Stream',
      desc: language === 'ar' ? 'معايرة أوقات التسليم الرقمي وبطاقات التفويض.' : 'Eliminate key handover friction.',
      icon: <Truck size={16} className="text-blue-600 dark:text-blue-400" />,
      color: 'from-blue-500/10 to-sky-500/5 text-blue-750 dark:text-blue-400 border-blue-100 dark:border-blue-950/60'
    }
  ];

  const mechSuggestions = [
    { 
      text: 'ما هي حالة صيانة شاحنة مرسيدس أكتروس؟', 
      label: language === 'ar' ? 'متابعة شاحنة أكتروس' : 'Track Actros Repairs',
      desc: language === 'ar' ? 'الاستعلام الفوري عن حالة أوامر العمل المفتوحة والمهندس المسؤول.' : 'Get active mechanics and work status.',
      icon: <Wrench size={16} className="text-blue-600 dark:text-blue-400" />, 
      color: 'from-blue-500/10 to-indigo-500/5 text-blue-600 dark:text-blue-40 border-blue-200/50 dark:border-blue-900/40' 
    },
    { 
      text: 'هل يتوفر فلتر زيت هايلوكس بالمخزن وما هي كميته؟', 
      label: language === 'ar' ? 'تفقد مستودع الفلاتر' : 'Check Oil Filters Stock',
      desc: language === 'ar' ? 'التحقق من أرصدة قطع الغيار وتنبيه الهبوط تحت حد الضمان.' : 'Retrieve rack depth and depletion risk.',
      icon: <Package size={16} className="text-amber-600 dark:text-amber-400" />, 
      color: 'from-amber-500/10 to-amber-600/5 text-amber-600 dark:text-amber-40 border-amber-200/50 dark:border-amber-900/40' 
    },
    { 
      text: 'ابحث عن قطع الغيار المتاحة للفرامل', 
      label: language === 'ar' ? 'منظومة الفرامل والأسطوانات' : 'Brake Cylinder Parts',
      desc: language === 'ar' ? 'البحث الشامل والمطابقة عن وسادات الفرامل والأقراص بالمخزون.' : 'Match pad inventory quantities globally.',
      icon: <Search size={16} className="text-emerald-600 dark:text-emerald-400" />, 
      color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-600 dark:text-emerald-40 border-emerald-200/50 dark:border-emerald-900/40' 
    },
    { 
      text: 'هل لدينا فنيين متاحين لصيانة الأنظمة الهيدروليكية؟', 
      label: language === 'ar' ? 'تتبع كفاءة الفنيين' : 'Locate Hydraulic Staff',
      desc: language === 'ar' ? 'استدعاء الفنيين المتاحين حالياً وتخصصاتهم وحجم الأعباء.' : 'Verify specialized technicians dispatch status.',
      icon: <ArrowRightLeft size={16} className="text-rose-600 dark:text-rose-400" />, 
      color: 'from-rose-500/10 to-rose-600/5 text-rose-600 dark:text-rose-40 border-rose-200/50 dark:border-rose-900/40' 
    }
  ];

  return (
    <div className="flex flex-col h-full flex-1 w-full bg-slate-50 dark:bg-[#070a13] font-sans" dir={dir}>
      
      {/* 1. Header Bar: Combines visual aesthetics with interactive submenu switching */}
      <div className="bg-white dark:bg-[#0c101d] border-b border-slate-200 dark:border-slate-850 p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 transition-all shadow-xs">
        <div className={`flex items-center gap-3 w-full md:w-auto ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/10">
            <Cpu size={24} className="animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-black text-slate-900 dark:text-white leading-tight">
              {language === 'ar' ? 'مركز وكلاء الذكاء الاصطناعي الموحد' : 'Unified AI Agents Command Hub'}
            </h1>
            <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
              {language === 'ar' ? 'الإدارة والتحكم والصيانة الفنية مدعومة بنماذج التوليد الفوري' : 'Fleet Operations, Resource Allocation & Mechanical Diagonstics Platform'}
            </p>
          </div>
        </div>

         {/* Dynamic Nav Tabs */}
        <div className="grid grid-cols-2 md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('project-manager')}
            className={`px-2 md:px-4.5 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 w-full md:w-auto ${
              activeTab === 'project-manager'
                ? 'bg-white dark:bg-[#151c2e] text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:dark:text-slate-300'
            }`}
          >
            <Sparkles size={14} className="shrink-0" />
            <span className="truncate">
              {language === 'ar' ? 'روبرت - مدير المشروع (AI)' : 'Robert - Project Manager (AI)'}
              {!isAgentActive('project-manager') && ' ⏸️'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('mechanic')}
            className={`px-2 md:px-4.5 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 w-full md:w-auto ${
              activeTab === 'mechanic'
                ? 'bg-white dark:bg-[#151c2e] text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:dark:text-slate-300'
            }`}
          >
            <Wrench size={14} className="shrink-0" />
            <span className="truncate">
              {language === 'ar' ? 'مساعد الصيانة والقطع' : 'Mechanic Assistant'}
              {!isAgentActive('mechanic') && ' ⏸️'}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: AI PROJECT MANAGER / مدير المشروع الذكي */}
          {activeTab === 'project-manager' && (
            <motion.div
              key="project-manager"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col md:flex-row min-h-0 bg-white dark:bg-[#0c101d]"
            >
              {/* Left sidebar suggestions and metrics panel */}
              {showSidebar && (
                <div className={`w-full md:w-80 border-slate-200 dark:border-slate-850 p-5 flex flex-col shrink-0 bg-slate-50/60 dark:bg-[#090d18] overflow-y-auto ${
                  isRtl ? 'md:order-last md:border-l' : 'md:border-r'
                }`}>
                {/* Simulation crisis & Persona selector panel */}
                <div className="mb-5 p-4 bg-violet-50/50 dark:bg-violet-950/15 rounded-2xl border border-violet-150/40 dark:border-violet-900/30 space-y-3.5 shadow-xs">
                  <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <Sparkles size={14} className="text-violet-600 dark:text-violet-400" />
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {language === 'ar' ? 'محاكي طوارئ الورشة والأعطال' : 'Workshop Crisis Simulator'}
                    </span>
                  </div>
                  
                  {/* Scenario Pills */}
                  <div className="space-y-1">
                    <label className={`text-[9px] font-extrabold text-slate-400 dark:text-slate-500 block ${isRtl ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'سيناريو التشغيل الفعلي للمطابقة:' : 'Active Operational Scenario:'}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveScenario('normal')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border ${
                          activeScenario === 'normal'
                            ? 'bg-emerald-500 text-white border-transparent'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        {language === 'ar' ? '🟢 طبيعي متزن' : '🟢 Balanced'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenario('parts-crisis')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border ${
                          activeScenario === 'parts-crisis'
                            ? 'bg-rose-500 text-white border-transparent'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        {language === 'ar' ? '🛑 أزمة توريد' : '🛑 Parts Crisis'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenario('backlog-peak')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border ${
                          activeScenario === 'backlog-peak'
                            ? 'bg-amber-500 text-white border-transparent'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        {language === 'ar' ? '⚡ ذروة تكدس' : '⚡ Backlog Peak'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenario('staff-shortage')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border ${
                          activeScenario === 'staff-shortage'
                            ? 'bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 text-white border-transparent'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        {language === 'ar' ? '👥 عجز بشري' : '👥 Staff Short'}
                      </button>
                    </div>
                  </div>

                  {/* Persona selectors */}
                  <div className="space-y-2 border-t border-slate-200/30 dark:border-slate-800/40 pt-2">
                    <div>
                      <label className={`text-[9px] font-extrabold text-slate-400 dark:text-slate-500 block ${isRtl ? 'text-right' : 'text-left'}`}>
                        {language === 'ar' ? 'نمط وكيل المخطط (PM):' : 'Strategic PM Persona:'}
                      </label>
                      <select
                        value={pmPersona}
                        onChange={(e) => setPmPersona(e.target.value as any)}
                        className="w-full mt-1 p-1.5 bg-white dark:bg-[#121829] border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-bold outline-hidden cursor-pointer"
                      >
                        <option value="default">{language === 'ar' ? 'الافتراضي المتزن' : 'Standard Balanced'}</option>
                        <option value="commander">{language === 'ar' ? 'القائد الصارم العملياتي' : 'Tactical Commander'}</option>
                        <option value="economist">{language === 'ar' ? 'المحلل المالي للجدوى' : 'Budget Optimizer'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* AI AGENTS REGISTRY CARD */}
                <div className="p-4 bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-xs flex flex-col gap-3 mb-5">
                  <div 
                    onClick={() => setIsRegistryExpanded(!isRegistryExpanded)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <Bot size={15} className="text-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'سجل وبطاقات تشغيل الوكلاء (6)' : 'AI Agents Control & Registry (6)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-black">
                        {agentsRegistry.filter(a => a.isActive).length}/6 {language === 'ar' ? 'نشط' : 'Active'}
                      </span>
                      <motion.div
                        animate={{ rotate: isRegistryExpanded ? 0 : 180 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ChevronDown size={14} className="text-slate-400 dark:text-slate-500" />
                      </motion.div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isRegistryExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden flex flex-col gap-2.5 text-[10px] border-t border-slate-100 dark:border-slate-800/60 pt-2.5"
                      >
                        <p className={`text-[9px] text-slate-400 dark:text-slate-500 font-semibold leading-normal ${isRtl ? 'text-right' : 'text-left'}`}>
                          {language === 'ar' 
                            ? 'تحكم بتشغيل أو إيقاف الوكلاء ومطابقتهم الذكية بالمؤسسة:' 
                            : 'Configure, run or pause active business agents dynamically:'}
                        </p>
                        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                          {agentsRegistry.map((agent) => {
                            const isAct = agent.isActive;
                            return (
                              <div 
                                key={agent.id}
                                className={`p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer hover:border-violet-500/50 dark:hover:border-violet-400/50 hover:bg-slate-50 dark:hover:bg-[#161d33]/50 ${
                                  isAct 
                                    ? 'bg-white dark:bg-[#111526] border-slate-150 dark:border-slate-800' 
                                    : 'bg-slate-50/40 dark:bg-slate-900/20 border-slate-200/30 dark:border-slate-800/40 opacity-75'
                                }`}
                                onClick={(e) => {
                                  const target = e.target as HTMLElement;
                                  if (target.closest('button')) return;
                                  handleOpenAgentChat(agent);
                                }}
                                title={language === 'ar' ? 'انقر لفتح نافذة الدردشة التفاعلية مع الوكيل' : 'Click to open interactive chat with this agent'}
                              >
                                <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                                  <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                      isAct 
                                        ? 'bg-slate-100 dark:bg-[#161c30]' 
                                        : 'bg-slate-100/50 dark:bg-slate-900/50'
                                    }`}>
                                      {renderAgentIcon(agent.id, agent.color)}
                                    </div>
                                    <div className="text-left leading-tight">
                                      <span className={`text-[10px] font-black block ${isRtl ? 'text-right' : 'text-left'} ${
                                        isAct ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                                      }`}>
                                        {language === 'ar' ? agent.nameAr : agent.nameEn}
                                      </span>
                                      <span className={`text-[8px] font-extrabold text-slate-400 dark:text-slate-500 block ${isRtl ? 'text-right' : 'text-left'}`}>
                                        {agent.roles.join(' | ')}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Small Play/Pause Toggle Switch */}
                                  <button
                                    onClick={() => toggleAgentActive(agent.id)}
                                    className={`relative w-9.5 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-hidden cursor-pointer ${
                                      isAct ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                                    }`}
                                    title={isAct 
                                      ? (language === 'ar' ? 'إيقاف الوكيل' : 'Stop Agent') 
                                      : (language === 'ar' ? 'تشغيل الوكيل' : 'Run Agent')
                                    }
                                  >
                                    <div 
                                      className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                                        isAct ? (isRtl ? '-translate-x-4.5' : 'translate-x-4.5') : 'translate-x-0'
                                      }`} 
                                    />
                                  </button>
                                </div>

                                <p className={`text-[9px] leading-normal font-semibold ${isRtl ? 'text-right' : 'text-left'} ${
                                  isAct ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400/80 dark:text-slate-600'
                                }`}>
                                  {language === 'ar' ? agent.descAr : agent.descEn}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Header inside side block */}
                <div className="mb-5 space-y-1">
                  <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div className="p-2 rounded-xl bg-violet-600 text-white shadow-md shadow-violet-500/5">
                      <LayoutDashboard size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        {language === 'ar' ? 'مؤشرات التخطيط الإستراتيجي' : 'Strategy Board Metrics'}
                      </h4>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500">
                        {language === 'ar' ? 'بيانات معالجة الأسطول المزامنة بالخادم' : 'Live database sync parameters'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Micro Metric Boxes */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="p-3 bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-xs flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                      {language === 'ar' ? 'المركبات بالأسطول' : 'Vehicles'}
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-base font-black text-slate-800 dark:text-white font-mono">{simulatedVehiclesCount}</span>
                      <Truck size={11} className="text-blue-500 shrink-0" />
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-xs flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                      {language === 'ar' ? 'أوامر الصيانة' : 'Repair Orders'}
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-base font-black text-slate-800 dark:text-white font-mono">{simulatedOrdersCount}</span>
                      <Wrench size={11} className="text-violet-500 shrink-0" />
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-xs flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                      {language === 'ar' ? 'أصناف قطع الغيار' : 'Unique Parts'}
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-base font-black text-slate-800 dark:text-white font-mono">{simulatedInventoryCount}</span>
                      <Warehouse size={11} className="text-amber-500 shrink-0" />
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-xs flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                      {language === 'ar' ? 'طاقم المهندسين' : 'Staff Mechanics'}
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-base font-black text-slate-800 dark:text-white font-mono">{simulatedTechniciansCount}</span>
                      <Users size={11} className="text-emerald-500 shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Firebase Database Diagnostic Hub (أداة تشخيص السحابية والمزامنة اللحظية) */}
                <div className="p-4 bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-xs flex flex-col gap-3 mb-5">
                  <div 
                    onClick={() => setIsDiagnosticExpanded(!isDiagnosticExpanded)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <Database size={15} className="text-violet-600 dark:text-violet-400" />
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'تشخيص ومزامنة Firebase' : 'Firebase Diagnostics & Sync'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isTestingFirebase ? (
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      ) : firebaseConnected === true ? (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                      ) : firebaseConnected === false ? (
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                      )}
                      <motion.div
                        animate={{ rotate: isDiagnosticExpanded ? 0 : 180 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ChevronDown size={14} className="text-slate-400 dark:text-slate-500" />
                      </motion.div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isDiagnosticExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden flex flex-col gap-2.5 text-[10px] border-t border-slate-100 dark:border-slate-800/60 pt-2.5"
                      >
                        {/* Target Database Info */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200/20 text-[9px] font-mono flex flex-col gap-0.5">
                          <span className="text-slate-400 font-bold uppercase">{language === 'ar' ? 'معرف قاعدة البيانات:' : 'Database ID:'}</span>
                          <span className="text-slate-700 dark:text-slate-300 break-all select-all font-black text-[8px]">
                            {firebaseConfig.firestoreDatabaseId || 'ai-studio-39cc4385-020c-4e44-84cd-664702f85570'}
                          </span>
                        </div>

                        {/* Sync Status Progress Message */}
                        {syncProgressText && (
                          <div className={`p-2 bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100/50 dark:border-violet-900/30 rounded-xl text-violet-700 dark:text-violet-400 font-bold flex items-center gap-1.5 leading-normal ${
                            isRtl ? 'text-right flex-row-reverse' : 'text-left'
                          }`}>
                            <Activity size={10} className="animate-pulse shrink-0" />
                            <span>{syncProgressText}</span>
                          </div>
                        )}

                        {/* Sync Grid */}
                        <div className="space-y-1.5">
                          {[
                            { key: 'vehicles', labelAr: 'المركبات', labelEn: 'Vehicles', icon: <Truck size={10} className="text-blue-500" /> },
                            { key: 'maintenance_orders', labelAr: 'أوامر الصيانة', labelEn: 'Repair Orders', icon: <Wrench size={10} className="text-violet-500" /> },
                            { key: 'inventory', labelAr: 'المستودع', labelEn: 'Inventory', icon: <Warehouse size={10} className="text-amber-500" /> },
                            { key: 'technicians', labelAr: 'الفنيين', labelEn: 'Technicians', icon: <Users size={10} className="text-emerald-500" /> },
                            { key: 'safety_inspections', labelAr: 'فحوصات السلامة', labelEn: 'Inspections', icon: <FileText size={10} className="text-teal-500" /> },
                          ].map((col) => {
                            const state = tableSyncStates[col.key] || { local: 0, cloud: null, status: 'loading' };
                            return (
                              <div key={col.key} className={`flex items-center justify-between p-1.5 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-lg transition-colors ${
                                isRtl ? 'flex-row-reverse' : ''
                              }`}>
                                <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                  {col.icon}
                                  <span className="font-extrabold text-slate-600 dark:text-slate-400">
                                    {language === 'ar' ? col.labelAr : col.labelEn}
                                  </span>
                                </div>

                                <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                  <span className="text-[9px] text-slate-500 dark:text-slate-500 font-mono">
                                    L:{state.local} | C:{state.cloud !== null ? state.cloud : '?'}
                                  </span>
                                  
                                  {state.status === 'loading' ? (
                                    <Loader2 size={10} className="text-slate-400 animate-spin" />
                                  ) : state.status === 'synced' ? (
                                    <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 p-0.5 px-1.5 rounded-full font-black text-[8px] flex items-center gap-0.5 animate-fade-in">
                                      <Check size={8} />
                                      <span>{language === 'ar' ? 'متزامن' : 'Synced'}</span>
                                    </span>
                                  ) : state.status === 'mismatch' ? (
                                    <span 
                                      className="bg-amber-50 dark:bg-amber-950/20 text-amber-650 dark:text-amber-400 p-0.5 px-1.5 rounded-full font-black text-[8px] flex items-center gap-0.5 cursor-help animate-fade-in"
                                      title={language === 'ar' ? 'تفاوت السجلات المكتوبة بالخادم مقارنة ببيانات المتصفح' : 'Mismatch detected! Local and cloud counts differ.'}
                                    >
                                      <AlertCircle size={8} />
                                      <span>{language === 'ar' ? 'تفاوت' : 'Mismatch'}</span>
                                    </span>
                                  ) : (
                                    <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-0.5 px-1.5 rounded-full font-black text-[8px] flex items-center gap-0.5">
                                      <span>{language === 'ar' ? 'عطل' : 'Offline'}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Interactive Buttons Row */}
                        <div className="grid grid-cols-3 gap-1.5 mt-1 border-t border-slate-100 dark:border-slate-800/60 pt-2.5">
                          <button
                            onClick={refreshSyncDiagnostic}
                            disabled={isTestingFirebase || isSyncInProgress}
                            className="flex items-center justify-center gap-1 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-600 dark:text-slate-350 font-black cursor-pointer transition-all disabled:opacity-50 text-[9px] border border-transparent shadow-xs"
                            title={language === 'ar' ? 'فحص الاتصال وتحديث العدادات سحابياً' : 'Re-test firestore and refresh cloud states'}
                          >
                            <RefreshCw size={11} className={isTestingFirebase ? 'animate-spin text-violet-500' : ''} />
                            <span>{language === 'ar' ? 'فحص' : 'Check'}</span>
                          </button>

                          <button
                            onClick={handlePushAll}
                            disabled={isTestingFirebase || isSyncInProgress || firebaseConnected === false}
                            className="flex items-center justify-center gap-1 p-2 rounded-xl bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:brightness-110 text-white font-black cursor-pointer transition-all disabled:opacity-50 text-[9px] shadow-xs"
                            title={language === 'ar' ? 'مزامنة ورفع البيانات المحلية إلى السحابية' : 'Sync and push local edits to Google Cloud'}
                          >
                            <ArrowUpCircle size={11} className={isSyncInProgress ? 'animate-pulse' : ''} />
                            <span>{language === 'ar' ? 'رفع سحابي' : 'Push'}</span>
                          </button>

                          <button
                            onClick={handlePullAll}
                            disabled={isTestingFirebase || isSyncInProgress || firebaseConnected === false}
                            className="flex items-center justify-center gap-1 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black cursor-pointer transition-all disabled:opacity-50 text-[9px] shadow-xs"
                            title={language === 'ar' ? 'سحب وتحديث السجلات المحلية من السحابة' : 'Download and overwrite local cache with cloud records'}
                          >
                            <ArrowDownCircle size={11} className={isSyncInProgress ? 'animate-pulse' : ''} />
                            <span>{language === 'ar' ? 'سحب سحابي' : 'Pull'}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Suggestions Section inside sidebar */}
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <Compass size={13} className="text-violet-600 dark:text-violet-400" />
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {language === 'ar' ? 'سيناريوهات مقترحة للتحليل' : 'Recommended Scenarios'}
                    </span>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
                    {pmSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handlePmSendMessage(sug.text)}
                        disabled={pmLoading}
                        className={`w-full p-3 bg-white dark:bg-[#111625] hover:bg-slate-50 dark:hover:bg-[#131b30] rounded-2xl border border-slate-200/70 dark:border-slate-800 cursor-pointer transition-all flex flex-col gap-1.5 group select-none ${
                          isRtl ? 'items-end text-right' : 'items-start text-left'
                        }`}
                      >
                        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${sug.color} shrink-0`}>
                            {sug.icon}
                          </div>
                          <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-violet-600 transition-colors">
                            {sug.label}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal font-medium">
                          {sug.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              )}

              {/* Chat Timeline Panel */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0c101d] relative">
                
                {!isAgentActive('project-manager') && (
                  <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 text-center">
                    <div className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 p-8 rounded-3xl max-w-sm shadow-2xl space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center animate-pulse">
                        <Sparkles size={32} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                        {language === 'ar' ? 'الوكيل الاستراتيجي "روبرت" متوقف' : 'Strategic Agent "Robert" is Paused'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                        {language === 'ar' 
                          ? 'تم إيقاف تشغيل هذا الوكيل حالياً من لوحة التحكم. يرجى تفعيله بالنقر على زر التشغيل الأخضر في لوحة إدارة الوكلاء الجانبية.'
                          : 'This agent has been paused. Please toggle it back on from the AI Agents Control & Registry in the sidebar to start chat.'}
                      </p>
                      <button
                        onClick={() => {
                          setAgentsRegistry(prev => prev.map(a => a.id === 'project-manager' ? { ...a, isActive: true } : a));
                        }}
                        className="w-full px-6 py-2.5 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer transition-all"
                      >
                        {language === 'ar' ? 'تفعيل وتشغيل الوكيل الآن' : 'Activate Agent Now'}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Title and Controls inside Chat bar */}
                <div className="p-4 px-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between bg-white dark:bg-[#0c101d] shrink-0">
                  <div className={`flex items-center gap-3 w-full md:w-auto ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md">
                      <Sparkles size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xs md:text-sm font-black text-slate-900 dark:text-white leading-tight">
                        {language === 'ar' ? 'روبرت - مدير المشروع الذكي (AI)' : 'Robert - AI Project Manager'}
                      </h3>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500">
                        {language === 'ar' ? 'وكيل التخطيط والتنسيق لحل الاختناقات اللحظية' : 'Full-stack scheduling strategy assistant'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Font Size Selector (Three Small Squares) */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 dark:bg-slate-800/80 dark:border-slate-750 p-1 rounded-xl shrink-0" title={language === 'ar' ? 'حجم الخط' : 'Font Size'}>
                      <button
                        type="button"
                        onClick={() => handleSetChatFontSize('sm')}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] transition-all cursor-pointer border ${
                          chatFontSize === 'sm'
                            ? 'bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 text-white border-transparent shadow-xs scale-105 font-black'
                            : 'bg-white dark:bg-[#121829] text-slate-400 hover:text-slate-750 dark:text-slate-500 hover:dark:text-slate-300 border-slate-200/80'
                        }`}
                        title={language === 'ar' ? 'تصغير الخط' : 'Small font'}
                      >
                        {language === 'ar' ? 'أ' : 'A'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetChatFontSize('md')}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm transition-all cursor-pointer border ${
                          chatFontSize === 'md'
                            ? 'bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 text-white border-transparent shadow-xs scale-105 font-black'
                            : 'bg-white dark:bg-[#121829] text-slate-400 hover:text-slate-750 dark:text-slate-500 hover:dark:text-slate-300 border-slate-200/80'
                        }`}
                        title={language === 'ar' ? 'خط متوسط' : 'Medium font'}
                      >
                        {language === 'ar' ? 'أ' : 'A'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetChatFontSize('lg')}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-lg transition-all cursor-pointer border ${
                          chatFontSize === 'lg'
                            ? 'bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 text-white border-transparent shadow-xs scale-105 font-black'
                            : 'bg-white dark:bg-[#121829] text-slate-400 hover:text-slate-750 dark:text-slate-500 hover:dark:text-slate-300 border-slate-200/80'
                        }`}
                        title={language === 'ar' ? 'تكبير الخط' : 'Large font'}
                      >
                        {language === 'ar' ? 'أ' : 'A'}
                      </button>
                    </div>

                    {/* Sidebar Toggle Button */}
                    <button
                      type="button"
                      onClick={handleToggleSidebar}
                      className={`p-1.5 md:p-2 md:px-3 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border ${
                        showSidebar
                          ? 'bg-violet-50 border-violet-200 text-violet-600 dark:bg-violet-950/25 dark:border-violet-900/40 dark:text-violet-400'
                          : 'bg-slate-55 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-750 dark:text-slate-300'
                      }`}
                      title={language === 'ar' ? 'المحاكاة ومؤشرات التشغيل' : 'Simulator & Metrics'}
                    >
                      <LayoutDashboard size={14} />
                      <span className="hidden sm:inline">{language === 'ar' ? 'المحاكاة والمؤشرات' : 'Simulator & Metrics'}</span>
                    </button>

                    <button
                      onClick={() => setPmGuideModalOpen(true)}
                      className="p-1.5 md:p-2 md:px-3 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border bg-violet-50 border-violet-200 hover:bg-violet-100 text-violet-600 dark:bg-violet-950/25 dark:border-violet-900/40 dark:hover:bg-violet-950/40 dark:text-violet-400"
                      title={language === 'ar' ? 'الدليل السريع وطبيعة عمل الوكيل' : 'Agent nature of work & guide'}
                    >
                      <Compass size={14} className="animate-pulse" />
                      <span className="hidden sm:inline">{language === 'ar' ? 'طبيعة عمل الروبوت' : 'Nature of Work'}</span>
                    </button>

                    <button
                      onClick={handlePmClearChat}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-500 dark:text-slate-400 transition-all cursor-pointer border border-slate-200/50 dark:border-slate-750 shadow-xs"
                      title={language === 'ar' ? 'مسح تدوينات المحادثة' : 'Clear Strategy cache'}
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>

                {/* Timeline Messages Area */}
                <div
                  ref={pmScrollRef}
                  className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 bg-slate-50/30 dark:bg-[#070a13]/20"
                >
                  {pmMessages.map((msg, i) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={i}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}
                      >
                        {/* Name tag pointer */}
                        <span className={`text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block px-1.5 mb-1 ${
                          isRtl ? 'text-right' : 'text-left'
                        }`}>
                          {!isUser 
                            ? (language === 'ar' ? 'مدير المشروع الذكي 🤖💼' : 'AI Project Planner 🤖💼') 
                            : (language === 'ar' ? 'أنت (القيادة والعمليات)' : 'You (Strategic Director)')}
                        </span>

                        <div className={`p-4 md:p-5 leading-relaxed max-w-[85%] md:max-w-[75%] border relative group/msg transition-all duration-300 ${
                          isUser 
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-[32px] md:rounded-[40px] px-6 py-3.5 border-transparent text-right font-black shadow-lg shadow-indigo-600/10' 
                            : `bg-gradient-to-br from-indigo-50/70 to-white dark:from-[#11172b] dark:to-[#0c1020] text-slate-800 dark:text-slate-200 rounded-3xl rounded-bl-none border-indigo-100/80 dark:border-indigo-950/40 border-l-4 border-l-indigo-600 dark:border-l-indigo-500 font-medium shadow-[0_6px_20px_rgba(99,102,241,0.04)] ${
                                isRtl ? 'text-right' : 'text-left'
                              }`
                        }`}>
                          <div className={`select-text ${getFontSizeClass(chatFontSize)}`}>
                            {isUser ? msg.text : renderRichMessageText(msg.text, `pm-${i}`)}
                          </div>

                          {!isUser && (
                            <div className="flex items-center gap-2.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 font-bold select-none">
                              <button
                                type="button"
                                onClick={() => handleToggleSpeakMessage(`pm-${i}`, msg.text)}
                                className="flex items-center gap-1 hover:text-violet-600 cursor-pointer transition-colors"
                              >
                                {activeAudioMessageId === `pm-${i}` && isPlayingAudio ? (
                                  <>
                                    <VolumeX size={12} className="text-rose-500 animate-bounce" />
                                    <span>{language === 'ar' ? 'إيقاف الصوت' : 'Mute'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 size={12} />
                                    <span>{language === 'ar' ? 'قراءة صوتية' : 'Read Aloud'}</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.text);
                                }}
                                className="flex items-center gap-1 hover:text-violet-600 cursor-pointer transition-colors"
                              >
                                <Copy size={12} />
                                <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                              </button>

                              {(msg.text.includes('صيانة') || msg.text.includes('إصلاح') || msg.text.includes('عطل') || msg.text.includes('فرامل') || msg.text.toLowerCase().includes('maintenance') || msg.text.toLowerCase().includes('repair')) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuickOrderData({
                                      vehicleId: defaultVehicles[0]?.id || 'V1',
                                      category: 'mechanical',
                                      description: msg.text.slice(0, 150) + '...',
                                      technicianId: defaultTechnicians[0]?.id || 'T1',
                                      cost: '350'
                                    });
                                    setQuickOrderModalOpen(true);
                                  }}
                                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer transition-colors ml-auto mr-auto"
                                >
                                  <Wrench size={12} />
                                  <span>{language === 'ar' ? '⚙️ توليد أمر صيانة فوري' : '⚙️ Quick Work Order'}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {pmMessages.length === 1 && (
                    <div className="mt-8 max-w-2xl mx-auto space-y-4">
                      <div className={`flex items-center gap-2 text-slate-500 dark:text-slate-450 text-xs font-black ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                        <Compass size={14} className="text-violet-550 shrink-0" />
                        <span>{language === 'ar' ? 'السيناريوهات والاقتراحات السريعة المقترحة من مدير المشروع:' : 'Quick Strategy & Planning Scenarios:'}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {pmSuggestions.map((sug, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handlePmSendMessage(sug.text)}
                            className={`p-4 bg-white dark:bg-[#111526] hover:bg-violet-50/20 dark:hover:bg-violet-950/10 border border-slate-150 dark:border-slate-800/80 rounded-2xl cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] flex flex-col gap-2 ${
                              isRtl ? 'items-end text-right' : 'items-start text-left'
                            }`}
                          >
                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                              <div className={`p-2 rounded-xl bg-gradient-to-br ${sug.color} shrink-0`}>
                                {sug.icon}
                              </div>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                                {sug.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-normal">
                              {sug.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Loading status */}
                  {pmLoading && (
                    <div className="flex justify-start w-full">
                      <div className="bg-white dark:bg-[#111526] p-4.5 rounded-3xl rounded-bl-none border border-slate-150 dark:border-slate-800 flex items-center gap-3 shadow-xs">
                        <div className="flex gap-1.5">
                          <motion.div 
                            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-1.5 h-1.5 bg-violet-500 rounded-full" 
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="w-1.5 h-1.5 bg-violet-500 rounded-full" 
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="w-1.5 h-1.5 bg-violet-500 rounded-full" 
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold select-none">
                          {language === 'ar' ? 'جاري تحليل الأرقام والبيانات للتخطيط...' : 'Analyzing fleet numbers and formulating advice...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div className="p-4 bg-white dark:bg-[#0c101d] border-t border-slate-150 dark:border-slate-850 shrink-0">
                  {isDictating && (
                    <div className="text-[10px] text-rose-500 font-extrabold text-center pb-2 animate-pulse flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{language === 'ar' ? 'جاري الاستماع للتحليل الصوتي الذكي...' : 'Listening for strategic voice input...'}</span>
                    </div>
                  )}
                  <div className={`p-1.5 bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-slate-800/80 rounded-2.5xl flex items-center gap-2 ${
                    isRtl ? 'flex-row-reverse' : ''
                  }`}>
                    {/* Microphone Dictation Button */}
                    <button
                      type="button"
                      onClick={() => handleStartVoiceDictation('pm')}
                      className={`p-3 rounded-xl transition-all cursor-pointer shrink-0 ${
                        isDictating
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-slate-150 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-violet-600'
                      }`}
                      title={language === 'ar' ? 'إملاء صوتي أو محاكاة سريعة' : 'Voice dictation fallback'}
                    >
                      <Mic size={15} />
                    </button>

                    <input 
                      type="text"
                      value={pmInput}
                      onChange={(e) => setPmInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePmSendMessage()}
                      placeholder={
                        language === 'ar' 
                          ? 'استفسر من مدير المشروع (مثال: اقترح سبل تفادي تعطل الشاحنات)...' 
                          : 'Ask AI manager (e.g. Suggest technical allocation recommendations)...'
                      }
                      className="flex-1 bg-transparent p-3 outline-none text-xs md:text-sm font-semibold dark:text-white"
                    />
                    
                    <button 
                      onClick={() => handlePmSendMessage()}
                      disabled={pmLoading || !pmInput.trim()}
                      className="p-3 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <Send size={15} className={isRtl ? 'rotate-180' : ''} />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: SMART MECHANIC ASSISTANT / مساعد الصيانة والقطع الذكي */}
          {activeTab === 'mechanic' && (
            <motion.div
              key="mechanic"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col md:flex-row min-h-0 bg-white dark:bg-[#0c101d]"
            >
              {/* Left sidebar suggestions and metrics panel for Mechanic Bot */}
              {showSidebar && (
                <div className={`w-full md:w-80 border-slate-200 dark:border-slate-850 p-5 flex flex-col shrink-0 bg-slate-50/60 dark:bg-[#090d18] overflow-y-auto ${
                  isRtl ? 'md:order-last md:border-l' : 'md:border-r'
                }`}>
                {/* Simulation crisis & Persona selector panel for Mechanic */}
                <div className="mb-5 p-4 bg-amber-50/40 dark:bg-amber-950/10 rounded-2xl border border-amber-150/40 dark:border-amber-900/30 space-y-3.5 shadow-xs">
                  <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <Wrench size={14} className="text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {language === 'ar' ? 'محاكي طوارئ الصيانة والقطع' : 'Workshop Crisis Simulator'}
                    </span>
                  </div>
                  
                  {/* Scenario Pills */}
                  <div className="space-y-1">
                    <label className={`text-[9px] font-extrabold text-slate-400 dark:text-slate-500 block ${isRtl ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'سيناريو التشغيل الفعلي للمطابقة:' : 'Active Operational Scenario:'}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveScenario('normal')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border ${
                          activeScenario === 'normal'
                            ? 'bg-emerald-500 text-white border-transparent'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        {language === 'ar' ? '🟢 طبيعي متزن' : '🟢 Balanced'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenario('parts-crisis')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border ${
                          activeScenario === 'parts-crisis'
                            ? 'bg-rose-500 text-white border-transparent'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        {language === 'ar' ? '🛑 أزمة توريد' : '🛑 Parts Crisis'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenario('backlog-peak')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border ${
                          activeScenario === 'backlog-peak'
                            ? 'bg-amber-500 text-white border-transparent'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        {language === 'ar' ? '⚡ ذروة تكدس' : '⚡ Backlog Peak'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenario('staff-shortage')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border ${
                          activeScenario === 'staff-shortage'
                            ? 'bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 text-white border-transparent'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        {language === 'ar' ? '👥 عجز بشري' : '👥 Staff Short'}
                      </button>
                    </div>
                  </div>

                  {/* Persona selectors */}
                  <div className="space-y-2 border-t border-slate-200/30 dark:border-slate-800/40 pt-2">
                    <div>
                      <label className={`text-[9px] font-extrabold text-slate-400 dark:text-slate-500 block ${isRtl ? 'text-right' : 'text-left'}`}>
                        {language === 'ar' ? 'نمط وكيل الصيانة (Technician):' : 'Technician Persona:'}
                      </label>
                      <select
                        value={mechPersona}
                        onChange={(e) => setMechPersona(e.target.value as any)}
                        className="w-full mt-1 p-1.5 bg-white dark:bg-[#121829] border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-bold outline-hidden cursor-pointer"
                      >
                        <option value="default">{language === 'ar' ? 'الافتراضي المتزن' : 'Standard Balanced'}</option>
                        <option value="master">{language === 'ar' ? 'المعلم وكبير الفنيين المتقاعد' : 'Master Mechanic'}</option>
                        <option value="safety">{language === 'ar' ? 'مفتش السلامة والأمان الصارم' : 'Safety Inspector'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* AI AGENTS REGISTRY CARD */}
                <div className="p-4 bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-xs flex flex-col gap-3 mb-5">
                  <div 
                    onClick={() => setIsRegistryExpanded(!isRegistryExpanded)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <Bot size={15} className="text-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'سجل وبطاقات تشغيل الوكلاء (6)' : 'AI Agents Control & Registry (6)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-black">
                        {agentsRegistry.filter(a => a.isActive).length}/6 {language === 'ar' ? 'نشط' : 'Active'}
                      </span>
                      <motion.div
                        animate={{ rotate: isRegistryExpanded ? 0 : 180 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ChevronDown size={14} className="text-slate-400 dark:text-slate-500" />
                      </motion.div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isRegistryExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden flex flex-col gap-2.5 text-[10px] border-t border-slate-100 dark:border-slate-800/60 pt-2.5"
                      >
                        <p className={`text-[9px] text-slate-400 dark:text-slate-500 font-semibold leading-normal ${isRtl ? 'text-right' : 'text-left'}`}>
                          {language === 'ar' 
                            ? 'تحكم بتشغيل أو إيقاف الوكلاء ومطابقتهم الذكية بالمؤسسة:' 
                            : 'Configure, run or pause active business agents dynamically:'}
                        </p>
                        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                          {agentsRegistry.map((agent) => {
                            const isAct = agent.isActive;
                            return (
                              <div 
                                key={agent.id}
                                className={`p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer hover:border-violet-500/50 dark:hover:border-violet-400/50 hover:bg-slate-50 dark:hover:bg-[#161d33]/50 ${
                                  isAct 
                                    ? 'bg-white dark:bg-[#111526] border-slate-150 dark:border-slate-800' 
                                    : 'bg-slate-50/40 dark:bg-slate-900/20 border-slate-200/30 dark:border-slate-800/40 opacity-75'
                                }`}
                                onClick={(e) => {
                                  const target = e.target as HTMLElement;
                                  if (target.closest('button')) return;
                                  handleOpenAgentChat(agent);
                                }}
                                title={language === 'ar' ? 'انقر لفتح نافذة الدردشة التفاعلية مع الوكيل' : 'Click to open interactive chat with this agent'}
                              >
                                <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                                  <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                      isAct 
                                        ? 'bg-slate-100 dark:bg-[#161c30]' 
                                        : 'bg-slate-100/50 dark:bg-slate-900/50'
                                    }`}>
                                      {renderAgentIcon(agent.id, agent.color)}
                                    </div>
                                    <div className="text-left leading-tight">
                                      <span className={`text-[10px] font-black block ${isRtl ? 'text-right' : 'text-left'} ${
                                        isAct ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                                      }`}>
                                        {language === 'ar' ? agent.nameAr : agent.nameEn}
                                      </span>
                                      <span className={`text-[8px] font-extrabold text-slate-400 dark:text-slate-500 block ${isRtl ? 'text-right' : 'text-left'}`}>
                                        {agent.roles.join(' | ')}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Small Play/Pause Toggle Switch */}
                                  <button
                                    onClick={() => toggleAgentActive(agent.id)}
                                    className={`relative w-9.5 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-hidden cursor-pointer ${
                                      isAct ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                                    }`}
                                    title={isAct 
                                      ? (language === 'ar' ? 'إيقاف الوكيل' : 'Stop Agent') 
                                      : (language === 'ar' ? 'تشغيل الوكيل' : 'Run Agent')
                                    }
                                  >
                                    <div 
                                      className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                                        isAct ? (isRtl ? '-translate-x-4.5' : 'translate-x-4.5') : 'translate-x-0'
                                      }`} 
                                    />
                                  </button>
                                </div>

                                <p className={`text-[9px] leading-normal font-semibold ${isRtl ? 'text-right' : 'text-left'} ${
                                  isAct ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400/80 dark:text-slate-600'
                                }`}>
                                  {language === 'ar' ? agent.descAr : agent.descEn}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Header inside side block */}
                <div className="mb-5 space-y-1">
                  <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div className="p-2 rounded-xl bg-amber-600 text-white shadow-md shadow-amber-500/5">
                      <Wrench size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        {language === 'ar' ? 'أرصدة وأقسام الميكانيك' : 'Workshop Parts Log'}
                      </h4>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500">
                        {language === 'ar' ? 'سجلات فحص القطع المتوفرة بالرفوف' : 'Verify exact physical capacity flags'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mechanic specific suggestions */}
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <Compass size={13} className="text-amber-600 dark:text-amber-500" />
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {language === 'ar' ? 'استعلامات الصيانة الميدانية' : 'Field Workshop Support'}
                    </span>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
                    {mechSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleMechSendMessage(sug.text)}
                        disabled={mechLoading}
                        className={`w-full p-3 bg-white dark:bg-[#111625] hover:bg-slate-50 dark:hover:bg-[#131b30] rounded-2xl border border-slate-200/70 dark:border-slate-800 cursor-pointer transition-all flex flex-col gap-1.5 group select-none ${
                          isRtl ? 'items-end text-right' : 'items-start text-left'
                        }`}
                      >
                        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${sug.color} shrink-0`}>
                            {sug.icon}
                          </div>
                          <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 transition-colors">
                            {sug.label}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal font-medium">
                          {sug.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              )}

              {/* Chat Timeline Panel for Mechanic */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0c101d] relative">
                
                {!isAgentActive('mechanic') && (
                  <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 text-center">
                    <div className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 p-8 rounded-3xl max-w-sm shadow-2xl space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center animate-pulse">
                        <Wrench size={32} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                        {language === 'ar' ? 'مساعد الصيانة متوقف' : 'Mechanic Assistant is Paused'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                        {language === 'ar' 
                          ? 'تم إيقاف تشغيل مساعد الصيانة والقطع حالياً. يرجى تفعيله بالنقر على زر التشغيل في اللوحة الجانبية لمطابقة الأرفف.'
                          : 'This assistant has been paused. Please toggle it back on from the AI Agents Control & Registry in the sidebar to view guides.'}
                      </p>
                      <button
                        onClick={() => {
                          setAgentsRegistry(prev => prev.map(a => a.id === 'mechanic' ? { ...a, isActive: true } : a));
                        }}
                        className="w-full px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer transition-all"
                      >
                        {language === 'ar' ? 'تفعيل وتشغيل مساعد الصيانة' : 'Activate Assistant Now'}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Title and Controls inside Chat bar */}
                <div className="p-4 px-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between bg-white dark:bg-[#0c101d] shrink-0">
                  <div className={`flex items-center gap-3 w-full md:w-auto ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                      <Wrench size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xs md:text-sm font-black text-slate-900 dark:text-white leading-tight">
                        {language === 'ar' ? 'مساعد الصيانة والقطع الذكي' : 'Smart Mechanic Assistant'}
                      </h3>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500">
                        {language === 'ar' ? 'حل مشكلات القطع والأنظمة ومراجعة مستويات المخزن' : 'Check parts stock levels and technical specifications'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Font Size Selector (Three Small Squares) */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 dark:bg-slate-800/80 dark:border-slate-750 p-1 rounded-xl shrink-0" title={language === 'ar' ? 'حجم الخط' : 'Font Size'}>
                      <button
                        type="button"
                        onClick={() => handleSetChatFontSize('sm')}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] transition-all cursor-pointer border ${
                          chatFontSize === 'sm'
                            ? 'bg-amber-600 border-amber-600 text-white shadow-xs scale-105 font-black'
                            : 'bg-white dark:bg-[#121829] text-slate-400 hover:text-slate-705 dark:text-slate-500 hover:dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                        title={language === 'ar' ? 'تصغير الخط' : 'Small font'}
                      >
                        {language === 'ar' ? 'أ' : 'A'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetChatFontSize('md')}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm transition-all cursor-pointer border ${
                          chatFontSize === 'md'
                            ? 'bg-amber-600 border-amber-600 text-white shadow-xs scale-105 font-black'
                            : 'bg-white dark:bg-[#121829] text-slate-400 hover:text-slate-705 dark:text-slate-500 hover:dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                        title={language === 'ar' ? 'خط متوسط' : 'Medium font'}
                      >
                        {language === 'ar' ? 'أ' : 'A'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetChatFontSize('lg')}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-lg transition-all cursor-pointer border ${
                          chatFontSize === 'lg'
                            ? 'bg-amber-600 border-amber-600 text-white shadow-xs scale-105 font-black'
                            : 'bg-white dark:bg-[#121829] text-slate-400 hover:text-slate-750 dark:text-slate-500 hover:dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                        title={language === 'ar' ? 'تكبير الخط' : 'Large font'}
                      >
                        {language === 'ar' ? 'أ' : 'A'}
                      </button>
                    </div>

                    {/* Sidebar Toggle Button */}
                    <button
                      type="button"
                      onClick={handleToggleSidebar}
                      className={`p-1.5 md:p-2 md:px-3 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border ${
                        showSidebar
                          ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/25 dark:border-amber-900/40 dark:text-amber-400'
                          : 'bg-slate-55 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-750 dark:text-slate-300'
                      }`}
                      title={language === 'ar' ? 'المحاكاة ومؤشرات التشغيل' : 'Simulator & Metrics'}
                    >
                      <LayoutDashboard size={14} />
                      <span className="hidden sm:inline">{language === 'ar' ? 'المحاكاة والمؤشرات' : 'Simulator & Metrics'}</span>
                    </button>

                    <button
                      onClick={() => setMechGuideModalOpen(true)}
                      className="p-1.5 md:p-2 md:px-3 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/25 dark:border-amber-900/40 dark:hover:bg-amber-950/40 dark:text-amber-400"
                      title={language === 'ar' ? 'الدليل السريع وطبيعة عمل الوكيل' : 'Agent nature of work & guide'}
                    >
                      <Compass size={14} className="animate-pulse" />
                      <span className="hidden sm:inline">{language === 'ar' ? 'طبيعة عمل الروبوت' : 'Nature of Work'}</span>
                    </button>

                    <button
                      onClick={handleMechClearChat}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-500 dark:text-slate-400 transition-all cursor-pointer border border-slate-200/50 dark:border-slate-750 shadow-xs"
                      title={language === 'ar' ? 'مسح تدوينات المحادثة' : 'Clear logs'}
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>

                {/* Timeline Messages Area */}
                <div
                  ref={mechScrollRef}
                  className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 bg-slate-50/30 dark:bg-[#070a13]/20"
                >
                  {mechMessages.map((msg, i) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id || i}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}
                      >
                        {/* Name tag pointer */}
                        <span className={`text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block px-1.5 mb-1 ${
                          isRtl ? 'text-right' : 'text-left'
                        }`}>
                          {!isUser 
                            ? (language === 'ar' ? 'مساعد ميكانيك الذكي 🤖⚙️' : 'Smart Mechanic Bot 🤖⚙️') 
                            : (language === 'ar' ? 'أنت (المسؤول الفني)' : 'You (Fleet Engineer)')}
                        </span>

                        <div className={`p-4 md:p-5 leading-relaxed max-w-[85%] md:max-w-[75%] border relative group/msg transition-all duration-300 ${
                          isUser 
                            ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-[32px] md:rounded-[40px] px-6 py-3.5 border-transparent text-right font-black shadow-lg shadow-amber-600/10' 
                            : `bg-gradient-to-br from-amber-50/40 to-white dark:from-[#131725] dark:to-[#0d101c] text-slate-800 dark:text-slate-200 rounded-3xl rounded-bl-none border-amber-100/70 dark:border-amber-950/30 border-l-4 border-l-amber-500 dark:border-l-amber-400 font-medium shadow-[0_6px_20px_rgba(245,158,11,0.03)] ${
                                isRtl ? 'text-right' : 'text-left'
                              }`
                        }`}>
                          <div className={`select-text ${getFontSizeClass(chatFontSize)}`}>
                            {isUser ? msg.text : renderRichMessageText(msg.text, `mech-${msg.id || i}`)}
                          </div>

                          {!isUser && (
                            <div className="flex items-center gap-2.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 font-bold select-none">
                              <button
                                type="button"
                                onClick={() => handleToggleSpeakMessage(`mech-${msg.id || i}`, msg.text)}
                                className="flex items-center gap-1 hover:text-amber-600 cursor-pointer transition-colors"
                              >
                                {activeAudioMessageId === `mech-${msg.id || i}` && isPlayingAudio ? (
                                  <>
                                    <VolumeX size={12} className="text-rose-500 animate-bounce" />
                                    <span>{language === 'ar' ? 'إيقاف الصوت' : 'Mute'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 size={12} />
                                    <span>{language === 'ar' ? 'قراءة صوتية' : 'Read Aloud'}</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.text);
                                }}
                                className="flex items-center gap-1 hover:text-amber-600 cursor-pointer transition-colors"
                              >
                                <Copy size={12} />
                                <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                              </button>

                              {(msg.text.includes('صيانة') || msg.text.includes('إصلاح') || msg.text.includes('عطل') || msg.text.includes('فرامل') || msg.text.toLowerCase().includes('maintenance') || msg.text.toLowerCase().includes('repair')) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuickOrderData({
                                      vehicleId: defaultVehicles[0]?.id || 'V1',
                                      category: 'mechanical',
                                      description: msg.text.slice(0, 150) + '...',
                                      technicianId: defaultTechnicians[0]?.id || 'T1',
                                      cost: '350'
                                    });
                                    setQuickOrderModalOpen(true);
                                  }}
                                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer transition-colors ml-auto mr-auto"
                                >
                                  <Wrench size={12} />
                                  <span>{language === 'ar' ? '⚙️ توليد أمر صيانة فوري' : '⚙️ Quick Work Order'}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {mechMessages.length === 1 && (
                    <div className="mt-8 max-w-2xl mx-auto space-y-4">
                      <div className={`flex items-center gap-2 text-slate-500 dark:text-slate-450 text-xs font-black ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                        <Compass size={14} className="text-amber-550 shrink-0" />
                        <span>{language === 'ar' ? 'الاستفسارات والاقتراحات الفنية السريعة المقترحة:' : 'Quick Technical & Maintenance Inquiries:'}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {mechSuggestions.map((sug, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleMechSendMessage(sug.text)}
                            className={`p-4 bg-white dark:bg-[#111526] hover:bg-amber-50/20 dark:hover:bg-amber-950/10 border border-slate-150 dark:border-slate-800/80 rounded-2xl cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] flex flex-col gap-2 ${
                              isRtl ? 'items-end text-right' : 'items-start text-left'
                            }`}
                          >
                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                              <div className={`p-2 rounded-xl bg-gradient-to-br ${sug.color} shrink-0`}>
                                {sug.icon}
                              </div>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                                {sug.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-normal">
                              {sug.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Loading status */}
                  {mechLoading && (
                    <div className="flex justify-start w-full">
                      <div className="bg-white dark:bg-[#111526] p-4.5 rounded-3xl rounded-bl-none border border-slate-150 dark:border-slate-800 flex items-center gap-3 shadow-xs">
                        <div className="flex gap-1.5">
                          <motion.div 
                            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-1.5 h-1.5 bg-amber-500 rounded-full" 
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="w-1.5 h-1.5 bg-amber-500 rounded-full" 
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="w-1.5 h-1.5 bg-amber-500 rounded-full" 
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold select-none">
                          {language === 'ar' ? 'جاري الاستعلام ومطابقة القطع بالمستودع...' : 'Searching parts catalogs and matching safety quantities...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div className="p-4 bg-white dark:bg-[#0c101d] border-t border-slate-150 dark:border-slate-850 shrink-0">
                  {isDictating && (
                    <div className="text-[10px] text-rose-500 font-extrabold text-center pb-2 animate-pulse flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{language === 'ar' ? 'جاري الاستماع لتسجيل تشخيص المهندس...' : 'Listening to workshop voice diagnostics...'}</span>
                    </div>
                  )}
                  <div className={`p-1.5 bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-slate-800/80 rounded-2.5xl flex items-center gap-2 ${
                    isRtl ? 'flex-row-reverse' : ''
                  }`}>
                    {/* Microphone Dictation Button */}
                    <button
                      type="button"
                      onClick={() => handleStartVoiceDictation('mech')}
                      className={`p-3 rounded-xl transition-all cursor-pointer shrink-0 ${
                        isDictating
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-slate-150 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-600'
                      }`}
                      title={language === 'ar' ? 'تسجيل صوتي للتشخيص الفوري' : 'Voice diagnostics dictation'}
                    >
                      <Mic size={15} />
                    </button>

                    <input 
                      type="text"
                      value={mechInput}
                      onChange={(e) => setMechInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleMechSendMessage()}
                      placeholder={
                        language === 'ar' 
                          ? 'استفسر عن قطع أو مركبة بالورشة (مثال: هل يتوفر وسادات فرامل أكتروس؟)...' 
                          : 'Query inventory or vehicles (e.g. status of Toyota Hilux)...'
                      }
                      className="flex-1 bg-transparent p-3 outline-none text-xs md:text-sm font-semibold dark:text-white"
                    />
                    
                    <button 
                      onClick={() => handleMechSendMessage()}
                      disabled={mechLoading || !mechInput.trim()}
                      className="p-3 bg-amber-600 hover:bg-amber-705 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <Send size={15} className={isRtl ? 'rotate-180' : ''} />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: CO-PILOT JOINT AGENT / التوجيه التعاوني المشترك */}
          {activeTab === 'copilot' && (
            <motion.div
              key="copilot"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col md:flex-row min-h-0 bg-white dark:bg-[#0c101d]"
            >
              {/* Sidebar: Shows Joint Orchestration metrics & Scenario simulator */}
              {showSidebar && (
                <div className={`w-full md:w-80 border-slate-200 dark:border-slate-850 p-5 flex flex-col shrink-0 bg-slate-50/60 dark:bg-[#090d18] overflow-y-auto ${
                  isRtl ? 'md:order-last md:border-l' : 'md:border-r'
                }`}>
                {/* Simulator panel for Co-Pilot */}
                <div className="mb-5 p-4 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-2xl border border-emerald-150/40 dark:border-emerald-900/30 space-y-3.5 shadow-xs">
                  <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <Bot size={14} className="text-emerald-500 animate-pulse" />
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {language === 'ar' ? 'غرفة محاكاة الطوارئ الموحدة' : 'Unified Crisis Control Room'}
                    </span>
                  </div>
                  
                  {/* Scenario Pills */}
                  <div className="space-y-1">
                    <label className={`text-[9px] font-extrabold text-slate-400 dark:text-slate-500 block ${isRtl ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'سيناريو التشغيل الفعلي للمطابقة:' : 'Active Operational Scenario:'}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveScenario('normal')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border ${
                          activeScenario === 'normal'
                            ? 'bg-emerald-500 text-white border-transparent'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        {language === 'ar' ? '🟢 طبيعي متزن' : '🟢 Balanced'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenario('parts-crisis')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border ${
                          activeScenario === 'parts-crisis'
                            ? 'bg-rose-500 text-white border-transparent'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        {language === 'ar' ? '🛑 أزمة توريد' : '🛑 Parts Crisis'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenario('backlog-peak')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border ${
                          activeScenario === 'backlog-peak'
                            ? 'bg-amber-500 text-white border-transparent'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        {language === 'ar' ? '⚡ ذروة تكدس' : '⚡ Backlog Peak'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenario('staff-shortage')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border ${
                          activeScenario === 'staff-shortage'
                            ? 'bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 text-white border-transparent'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800'
                        }`}
                      >
                        {language === 'ar' ? '👥 عجز بشري' : '👥 Staff Short'}
                      </button>
                    </div>
                  </div>

                  {/* Dual Persona selectors */}
                  <div className="space-y-2 border-t border-slate-200/30 dark:border-slate-800/40 pt-2">
                    <div>
                      <label className={`text-[9px] font-extrabold text-slate-400 dark:text-slate-500 block ${isRtl ? 'text-right' : 'text-left'}`}>
                        {language === 'ar' ? 'نمط وكيل المخطط (PM):' : 'Strategic PM Persona:'}
                      </label>
                      <select
                        value={pmPersona}
                        onChange={(e) => setPmPersona(e.target.value as any)}
                        className="w-full mt-1 p-1.5 bg-white dark:bg-[#121829] border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-bold outline-hidden cursor-pointer"
                      >
                        <option value="default">{language === 'ar' ? 'الافتراضي المتزن' : 'Standard Balanced'}</option>
                        <option value="commander">{language === 'ar' ? 'القائد الصارم العملياتي' : 'Tactical Commander'}</option>
                        <option value="economist">{language === 'ar' ? 'المحلل المالي للجدوى' : 'Budget Optimizer'}</option>
                      </select>
                    </div>

                    <div>
                      <label className={`text-[9px] font-extrabold text-slate-400 dark:text-slate-500 block ${isRtl ? 'text-right' : 'text-left'}`}>
                        {language === 'ar' ? 'نمط وكيل الصيانة (Tech):' : 'Technician Persona:'}
                      </label>
                      <select
                        value={mechPersona}
                        onChange={(e) => setMechPersona(e.target.value as any)}
                        className="w-full mt-1 p-1.5 bg-white dark:bg-[#121829] border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-bold outline-hidden cursor-pointer"
                      >
                        <option value="default">{language === 'ar' ? 'الافتراضي المتزن' : 'Standard Balanced'}</option>
                        <option value="master">{language === 'ar' ? 'المعلم وكبير الفنيين المتقاعد' : 'Master Mechanic'}</option>
                        <option value="safety">{language === 'ar' ? 'مفتش السلامة والأمان الصارم' : 'Safety Inspector'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Suggestions inside Co-Pilot Sidebar */}
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <Compass size={13} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {language === 'ar' ? 'مقترحات توجيهية موحدة' : 'Co-Pilot Unified Prompts'}
                    </span>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
                    {[
                      {
                        label: language === 'ar' ? 'تحليل شامل للأعطال والجدوى' : 'Audit All Bottlenecks & Costs',
                        desc: language === 'ar' ? 'استجواب متزامن للقطاع المالي وفريق الصيانة فورا' : 'Direct simultaneous audit of planning and mechanical parts feasibility',
                        text: language === 'ar' ? 'أعطني تحليلاً موحداً للاختناقات الحالية بالورشة مع فحص موازنة الصيانة والقطع المتوفرة' : 'Provide a joint technical and strategic analysis of current workshop bottlenecks, budget limits, and matching replacement parts'
                      },
                      {
                        label: language === 'ar' ? 'سيناريو نقص الميزانية والطاقم' : 'Budget & Staff Scarcity Resolution',
                        desc: language === 'ar' ? 'التوجيه المشترك لجدولة الأولويات القصوى' : 'Joint direction to resolve high urgency tasks during extreme staff shortage',
                        text: language === 'ar' ? 'في حال عجز طاقم الصيانة ونفاذ ميزانية قطع الغيار، كيف نقوم بجدولة الصيانة للمركبات عالية الأولوية؟' : 'If we experience severe staff shortage and parts budget cuts, how should we prioritize and schedule critical vehicle maintenance?'
                      }
                    ].map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleCoPilotSendMessage(sug.text)}
                        disabled={coPilotLoading}
                        className={`w-full p-3 bg-white dark:bg-[#111625] hover:bg-slate-50 dark:hover:bg-[#131b30] rounded-2xl border border-slate-200/70 dark:border-slate-800 cursor-pointer transition-all flex flex-col gap-1.5 group select-none ${
                          isRtl ? 'items-end text-right' : 'items-start text-left'
                        }`}
                      >
                        <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-emerald-500 transition-colors">
                          {sug.label}
                        </span>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal font-medium">
                          {sug.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              )}

              {/* Chat Timeline Panel */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0c101d]">
                
                {/* Title inside Co-Pilot Chat Bar */}
                <div className="p-4 px-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between bg-white dark:bg-[#0c101d] shrink-0">
                  <div className={`flex items-center gap-3 w-full md:w-auto ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/10">
                      <Bot size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xs md:text-sm font-black text-slate-900 dark:text-white leading-tight">
                        {language === 'ar' ? 'المساعد التوجيهي التعاوني (Co-Pilot)' : 'Co-Pilot Unified Agent'}
                      </h3>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500">
                        {language === 'ar' ? 'استجواب متزامن لوكلاء التخطيط التكتيكي والصيانة الفنية' : 'Concurrent orchestration of PM & Mechanic bots'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Font Size Selector (Three Small Squares) */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 dark:bg-slate-800/80 dark:border-slate-750 p-1 rounded-xl shrink-0" title={language === 'ar' ? 'حجم الخط' : 'Font Size'}>
                      <button
                        type="button"
                        onClick={() => handleSetChatFontSize('sm')}
                        className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center font-bold text-[10px] transition-all cursor-pointer border ${
                          chatFontSize === 'sm'
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs scale-105 font-black'
                            : 'bg-white dark:bg-[#121829] text-slate-400 hover:text-slate-700 dark:text-slate-500 hover:dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                        title={language === 'ar' ? 'تصغير الخط' : 'Small font'}
                      >
                        {language === 'ar' ? 'أ' : 'A'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetChatFontSize('md')}
                        className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer border ${
                          chatFontSize === 'md'
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs scale-105 font-black'
                            : 'bg-white dark:bg-[#121829] text-slate-400 hover:text-slate-700 dark:text-slate-500 hover:dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                        title={language === 'ar' ? 'خط متوسط' : 'Medium font'}
                      >
                        {language === 'ar' ? 'أ' : 'A'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetChatFontSize('lg')}
                        className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center font-bold text-sm transition-all cursor-pointer border ${
                          chatFontSize === 'lg'
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs scale-105 font-black'
                            : 'bg-white dark:bg-[#121829] text-slate-400 hover:text-slate-700 dark:text-slate-500 hover:dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                        title={language === 'ar' ? 'تكبير الخط' : 'Large font'}
                      >
                        {language === 'ar' ? 'أ' : 'A'}
                      </button>
                    </div>

                    {/* Sidebar Toggle Button */}
                    <button
                      type="button"
                      onClick={handleToggleSidebar}
                      className={`p-1.5 md:p-2 md:px-3 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border ${
                        showSidebar
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/25 dark:border-emerald-900/40 dark:text-amber-400'
                          : 'bg-slate-55 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-750 dark:text-slate-300'
                      }`}
                      title={language === 'ar' ? 'المحاكاة ومؤشرات التشغيل' : 'Simulator & Metrics'}
                    >
                      <LayoutDashboard size={14} />
                      <span className="hidden sm:inline">{language === 'ar' ? 'المحاكاة والمؤشرات' : 'Simulator & Metrics'}</span>
                    </button>

                    <button
                      onClick={handleCoPilotClearChat}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-500 dark:text-slate-400 transition-all cursor-pointer border border-slate-200/50 dark:border-slate-750 shadow-xs"
                      title={language === 'ar' ? 'مسح تدوينات المحادثة' : 'Clear Co-Pilot history'}
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>

                {/* Co-Pilot Timeline Messages Area */}
                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 bg-slate-50/30 dark:bg-[#070a13]/20">
                  {coPilotMessages.map((msg, i) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id || i}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}
                      >
                        {/* Name tag */}
                        <span className={`text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block px-1.5 mb-1 ${
                          isRtl ? 'text-right' : 'text-left'
                        }`}>
                          {isUser 
                            ? (language === 'ar' ? 'أنت (القيادة والعمليات)' : 'You (Unified Operator)')
                            : (language === 'ar' ? 'الرد المتزامن التعاوني 🤖⚡' : 'Co-Pilot Concurrent Synthesis 🤖⚡')}
                        </span>

                        {isUser ? (
                          <div className={`p-4 md:p-5 max-w-[85%] md:max-w-[75%] border shadow-xs bg-emerald-600 text-white rounded-[32px] md:rounded-[40px] px-6 py-3.5 border-transparent text-right font-black ${getFontSizeClass(chatFontSize)}`}>
                            {msg.text}
                          </div>
                        ) : (
                          /* Render side-by-side advice cards */
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-full">
                            {/* PM Strategic Response Card */}
                            <div className="p-4 bg-gradient-to-br from-indigo-50/60 to-white dark:from-[#11172b] dark:to-[#0c1020] rounded-3xl border border-indigo-100 dark:border-indigo-950/40 border-l-4 border-l-indigo-600 dark:border-l-indigo-500 shadow-md flex flex-col justify-between transition-all duration-300">
                              <div>
                                <div className={`flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/60 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                  <Sparkles size={14} className="text-violet-600 dark:text-violet-400 animate-pulse" />
                                  <span className="text-[11px] font-black text-violet-700 dark:text-violet-400 uppercase tracking-wider">
                                    {language === 'ar' ? 'التخطيط الإستراتيجي (PM)' : 'PM Strategic Advice'}
                                  </span>
                                </div>
                                <div className={`select-text text-slate-700 dark:text-slate-300 ${getFontSizeClass(chatFontSize)}`}>
                                  {msg.pmText ? renderRichMessageText(msg.pmText, `copilot-pm-${i}`) : (language === 'ar' ? 'لم يتم إنتاج رد' : 'No response generated')}
                                </div>
                              </div>

                              {msg.pmText && (
                                <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-150/40 text-[10px] text-slate-400 font-bold select-none">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSpeakMessage(`copilot-pm-${i}`, msg.pmText || '')}
                                    className="flex items-center gap-1 hover:text-violet-600 cursor-pointer transition-colors"
                                  >
                                    {activeAudioMessageId === `copilot-pm-${i}` && isPlayingAudio ? (
                                      <>
                                        <VolumeX size={12} className="text-rose-500 animate-bounce" />
                                        <span>{language === 'ar' ? 'إيقاف الصوت' : 'Mute'}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Volume2 size={12} />
                                        <span>{language === 'ar' ? 'قراءة صوتية' : 'Read Aloud'}</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(msg.pmText || '');
                                    }}
                                    className="flex items-center gap-1 hover:text-violet-600 cursor-pointer transition-colors"
                                  >
                                    <Copy size={12} />
                                    <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Mechanic Assistant Response Card */}
                            <div className="p-4 bg-gradient-to-br from-amber-50/50 to-white dark:from-[#15131f] dark:to-[#0e0c15] rounded-3xl border border-amber-100 dark:border-amber-950/40 border-l-4 border-l-amber-500 dark:border-l-amber-400 shadow-md flex flex-col justify-between transition-all duration-300">
                              <div>
                                <div className={`flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/60 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                  <Wrench size={14} className="text-amber-600 dark:text-amber-400" />
                                  <span className="text-[11px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                    {language === 'ar' ? 'الفحوصات الفنية والقطع (Mechanic)' : 'Mechanic Technical Response'}
                                  </span>
                                </div>
                                <div className={`select-text text-slate-700 dark:text-slate-300 ${getFontSizeClass(chatFontSize)}`}>
                                  {msg.mechText ? renderRichMessageText(msg.mechText, `copilot-mech-${i}`) : (language === 'ar' ? 'لم يتم إنتاج رد' : 'No response generated')}
                                </div>
                              </div>

                              {msg.mechText && (
                                <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-150/40 text-[10px] text-slate-400 font-bold select-none">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSpeakMessage(`copilot-mech-${i}`, msg.mechText || '')}
                                    className="flex items-center gap-1 hover:text-amber-600 cursor-pointer transition-colors"
                                  >
                                    {activeAudioMessageId === `copilot-mech-${i}` && isPlayingAudio ? (
                                      <>
                                        <VolumeX size={12} className="text-rose-500 animate-bounce" />
                                        <span>{language === 'ar' ? 'إيقاف الصوت' : 'Mute'}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Volume2 size={12} />
                                        <span>{language === 'ar' ? 'قراءة صوتية' : 'Read Aloud'}</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(msg.mechText || '');
                                    }}
                                    className="flex items-center gap-1 hover:text-amber-600 cursor-pointer transition-colors"
                                  >
                                    <Copy size={12} />
                                    <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Joint Loading Spinner */}
                  {coPilotLoading && (
                    <div className="flex justify-start w-full animate-fadeIn">
                      <div className="bg-white dark:bg-[#111526] p-4.5 rounded-3xl rounded-bl-none border border-slate-150 dark:border-slate-800 flex items-center gap-3 shadow-xs">
                        <div className="flex gap-1.5">
                          <motion.div 
                            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-1.5 h-1.5 bg-emerald-500 rounded-full" 
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="w-1.5 h-1.5 bg-emerald-500 rounded-full" 
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="w-1.5 h-1.5 bg-emerald-500 rounded-full" 
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          {language === 'ar' ? 'جارٍ التشخيص المشترك...' : 'Analyzing jointly...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Co-Pilot Input Bar */}
                <div className="p-4 bg-white dark:bg-[#0c101d] border-t border-slate-150 dark:border-slate-850 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCoPilotSendMessage();
                    }}
                    className="flex items-center gap-2 bg-slate-50 dark:bg-[#121829] border border-slate-200/80 dark:border-slate-800 p-1.5 rounded-2xl"
                  >
                    <input
                      type="text"
                      value={coPilotInput}
                      onChange={(e) => setCoPilotInput(e.target.value)}
                      disabled={coPilotLoading}
                      placeholder={language === 'ar' ? 'اكتب سؤالاً موجهاً للمساعد المشترك...' : 'Ask the co-pilot joint command...'}
                      className="flex-1 bg-transparent p-3 outline-hidden text-xs md:text-sm font-semibold text-slate-850 dark:text-white"
                    />
                    
                    <button 
                      type="submit"
                      disabled={coPilotLoading || !coPilotInput.trim()}
                      className="p-3 bg-emerald-600 hover:bg-emerald-750 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <Send size={15} className={isRtl ? 'rotate-180' : ''} />
                    </button>
                  </form>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 1. PROJECT MANAGER QUICK GUIDE MODAL */}
      <AnimatePresence>
        {pmGuideModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setPmGuideModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" 
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white dark:bg-[#0c101d] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[101]"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-150 dark:border-slate-800 bg-violet-500/5 flex items-center justify-between">
                <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  <div className="w-9 h-9 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                    <Compass size={18} className="animate-spin" style={{ animationDuration: '8s' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-violet-700 dark:text-violet-400">
                      {language === 'ar' ? 'طبيعة عمل مستشار التخطيط والإستراتيجية' : 'AI Strategic Project Planner'}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {language === 'ar' ? 'دليل وكتالوج استخدام الوكيل التخطيطي الحكيم لمؤسستك' : 'Strategic operations handbook'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setPmGuideModalOpen(false)} 
                  className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] scrollbar-thin">
                {/* Section 1: Nature of work */}
                <div className="space-y-2">
                  <h4 className={`text-xs font-black text-slate-800 dark:text-slate-150 flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                    <Sparkles size={14} className="text-violet-500 shrink-0" />
                    <span>{language === 'ar' ? 'ما هي طبيعة عمل هذا الروبوت؟' : 'What is the nature of this robot?'}</span>
                  </h4>
                  <p className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>
                    {language === 'ar'
                      ? 'يعمل هذا الوكيل الذكي كمستشار تخطيط وتحليل مالي رفيع المستوى لمشروعك. يساعدك في كشف وحل اختناقات أعباء العمل لدى فنيي الصيانة، وتقدير الميزانيات، وتوزيع الساعات، بالإضافة إلى تصفية ومزامنة فواتير الصيانة سحابياً لمنع تلف البيانات.'
                      : 'This intelligent agent acts as a high-level planning and financial coordinator. It helps you resolve staff bottleneck constraints, estimate wages, and secure real-time Firestore database synchronization.'}
                  </p>
                </div>

                {/* Section 2: Live Data Sources */}
                <div className="p-4 bg-violet-50/50 dark:bg-violet-950/10 rounded-2xl border border-violet-100 dark:border-violet-900/40 space-y-2.5">
                  <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Database size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
                    <strong className="text-xs font-black text-violet-800 dark:text-violet-350">
                      {language === 'ar' ? 'قواعد البيانات الحية المتصل بها الروبوت:' : 'Live database integrations in scope:'}
                    </strong>
                  </div>
                  <div className={`grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-[#070a13] p-1.5 px-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                      <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                      <span>{language === 'ar' ? 'سجلات وأوامر الصيانة' : 'Maintenance Orders'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-[#070a13] p-1.5 px-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                      <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                      <span>{language === 'ar' ? 'جداول كفاءة وأوقات الفنيين' : 'Technicians Workload'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-[#070a13] p-1.5 px-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                      <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                      <span>{language === 'ar' ? 'بطاقات وأعطال أسطول المركبات' : 'Fleet Active Rigs'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-[#070a13] p-1.5 px-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                      <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                      <span>{language === 'ar' ? 'أرصدة وقطع الغيار والأسعار' : 'Spare Parts Valuation'}</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Clickable suggestions */}
                <div className="space-y-2.5">
                  <h4 className={`text-xs font-black text-slate-800 dark:text-slate-150 flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                    <MessageSquare size={14} className="text-violet-500 shrink-0" />
                    <span>{language === 'ar' ? 'الدليل السريع: اضغط على أي سؤال للبدء فوراً' : 'Quick Guide: Click any inquiry to execute'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {pmSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handlePmSuggestionClick(sug.text)}
                        className={`p-3 bg-slate-50 hover:bg-violet-50/50 dark:bg-[#111625] dark:hover:bg-[#141d33] border border-slate-200/50 dark:border-slate-800 rounded-2xl cursor-pointer transition-colors text-right flex flex-col gap-1 ${
                          isRtl ? 'items-end' : 'items-start text-left'
                        }`}
                      >
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-150 group-hover:text-violet-600">{sug.label}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal font-semibold">{sug.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPmGuideModalOpen(false)}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 text-white rounded-xl text-xs font-black cursor-pointer transition-colors"
                >
                  {language === 'ar' ? 'فهمت، ابدأ الاستعلام' : 'Got it, let’s query'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. SMART MECHANIC QUICK GUIDE MODAL */}
      <AnimatePresence>
        {mechGuideModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setMechGuideModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" 
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white dark:bg-[#0c101d] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[101]"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-150 dark:border-slate-800 bg-amber-500/5 flex items-center justify-between">
                <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  <div className="w-9 h-9 rounded-xl bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Compass size={18} className="animate-spin" style={{ animationDuration: '8s' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-700 dark:text-amber-400">
                      {language === 'ar' ? 'طبيعة عمل مساعد الصيانة والقطع' : 'Smart Mechanic & Parts Guide'}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {language === 'ar' ? 'دليل الفني الميداني ومطابق قطع الغيار بالرفوف والحدود الآمنة' : 'Field operations and catalog handbook'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setMechGuideModalOpen(false)} 
                  className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors border-0 bg-transparent flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] scrollbar-thin">
                {/* Section 1: Nature of work */}
                <div className="space-y-2">
                  <h4 className={`text-xs font-black text-slate-800 dark:text-slate-150 flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                    <Wrench size={14} className="text-amber-500 shrink-0" />
                    <span>{language === 'ar' ? 'ما هي طبيعة عمل هذا الروبوت؟' : 'What is the nature of this robot?'}</span>
                  </h4>
                  <p className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>
                                        {language === 'ar'
                      ? 'يعمل هذا الوكيل الميداني كخبير هندسي وأمين مخزن متقن. يركز على تتبع ومعاينة قطع الغيار داخل المخزن ومطابقة كميات الأرفف بالحدود الآمنة للمؤسسة، مع توفير أدلة فنية تفصيلية ورموز عزم شد البراغي وخطوات تفكيك وتعمير المحركات والأنظمة الهيدروليكية.'
                      : 'This agent acts as a direct workshop companion. It monitors parts shelves depth, checks stock levels against safety margins, and provides torque specs, engine repair overhauls, and hydraulic guidance.'}
                  </p>
                </div>

                {/* Section 2: Live Data Sources */}
                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl border border-amber-100 dark:border-amber-900/40 space-y-2.5">
                  <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Database size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    <strong className="text-xs font-black text-amber-800 dark:text-amber-350">
                      {language === 'ar' ? 'بيانات المستودع المتصل بالروبوت:' : 'Live warehouse data connections:'}
                    </strong>
                  </div>
                  <div className={`grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-[#070a13] p-1.5 px-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                      <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                      <span>{language === 'ar' ? 'جرد كميات قطع الغيار' : 'Inventory Stock Count'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-[#070a13] p-1.5 px-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                      <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                      <span>{language === 'ar' ? 'أماكن التخزين والأرفف' : 'Shelf & Bin Locations'}</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Clickable suggestions */}
                <div className="space-y-2.5">
                  <h4 className={`text-xs font-black text-slate-800 dark:text-slate-150 flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                    <MessageSquare size={14} className="text-amber-500 shrink-0" />
                    <span>{language === 'ar' ? 'الدليل السريع: اضغط على أي سؤال للبدء فوراً' : 'Quick Guide: Click any inquiry to execute'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {mechSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleMechSuggestionClick(sug.text)}
                        className={`p-3 bg-slate-50 hover:bg-amber-50/50 dark:bg-[#111625] dark:hover:bg-[#141d33] border border-slate-200/50 dark:border-slate-800 rounded-2xl cursor-pointer transition-colors text-right flex flex-col gap-1 ${
                          isRtl ? 'items-end' : 'items-start text-left'
                        }`}
                      >
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-150 group-hover:text-amber-600">{sug.label}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal font-semibold">{sug.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setMechGuideModalOpen(false)}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black cursor-pointer transition-colors border-0"
                >
                  {language === 'ar' ? 'فهمت، ابدأ الاستعلام' : 'Got it, let’s query'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. DEDICATED ROBOT INTERACTIVE CHAT DRAWER */}
      <AnimatePresence>
        {activeChatAgent && (() => {
          const activeChatMessages = agentChats[activeChatAgent.id] || [];
          const rawSuggestionsList = dynamicSuggestions[activeChatAgent.id] || getAgentSuggestions(activeChatAgent.id, language === 'ar');
          const currentSuggestions = rawSuggestionsList.map((sugText) => ({
            text: sugText,
            label: sugText,
            desc: language === 'ar' ? 'استعلم من خلال هذا السؤال الموصى به' : 'Query using this recommended advice.'
          }));
          const isWelcomeState = activeChatMessages.length <= 1;

          return (
            <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-end md:justify-center p-0 md:p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setActiveChatAgent(null)} 
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs" 
            />

            {/* Main Chat Drawer Container (Sleek light/dark adaptive premium theme) */}
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              className="bg-white dark:bg-[#0c101d] text-slate-800 dark:text-slate-100 w-full h-full md:max-w-4xl md:h-[90vh] flex flex-col md:rounded-3xl shadow-[0_20px_50px_rgba(109,40,217,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-slate-800 overflow-hidden z-[111]"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
                {/* Header with Glassmorphic Clean Style */}
                <div className="py-4 px-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-[#111726] flex items-center justify-between shadow-xs">
                  <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    {/* Dynamic Colorized Avatar */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-850">
                      <div className="scale-110">
                        {renderAgentIcon(activeChatAgent.id, activeChatAgent.color)}
                      </div>
                    </div>
                    <div>
                      <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                          {language === 'ar' ? activeChatAgent.nameAr : activeChatAgent.nameEn}
                        </h3>
                        {/* Active Status Badge */}
                        <span className="text-[9px] px-2.5 py-0.5 rounded-full font-black bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 animate-pulse">
                          {activeChatAgent.isActive 
                            ? (language === 'ar' ? '🟢 نشط' : '🟢 Active') 
                            : (language === 'ar' ? '⏸️ متوقف مؤقتاً' : '⏸️ Paused')}
                        </span>
                      </div>
                      <p className={`text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-extrabold ${isRtl ? 'text-right' : 'text-left'}`}>
                        {activeChatAgent.roles.join(' | ')}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveChatAgent(null)} 
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:dark:text-white hover:bg-slate-200/60 hover:dark:bg-white/10 rounded-xl cursor-pointer transition-colors border border-slate-200 dark:border-slate-800 shadow-xs"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Message Streams Area */}
                <div
                  ref={agentChatScrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/70 dark:bg-[#070a13] scrollbar-thin scrollbar-thumb-violet-200 dark:scrollbar-thumb-slate-850"
                >
                  {/* If in Welcome Landing State, render the stunning landing greeting inside scroll container */}
                  {isWelcomeState ? (
                    <div className="flex flex-col justify-center min-h-[50vh] text-center max-w-2xl mx-auto py-10">
                      {/* Centered Brand Logo */}
                      <div className="flex items-center justify-center mb-6">
                        <div className="relative w-20 h-20 flex items-center justify-center bg-violet-100 dark:bg-violet-950/30 rounded-full p-4 border border-violet-250 dark:border-violet-800 shadow-[0_0_30px_rgba(139,92,246,0.05)]">
                          <svg className="w-12 h-12 text-violet-500 dark:text-violet-400 animate-pulse" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M50,15 L72,37 L63,40 L50,29 L37,40 L28,37 Z" />
                            <path d="M20,68 L42,50 L45,59 L33,68 L45,77 L42,86 Z" transform="rotate(120 50 50)" />
                            <path d="M20,68 L42,50 L45,59 L33,68 L45,77 L42,86 Z" transform="rotate(240 50 50)" />
                          </svg>
                        </div>
                      </div>

                      {/* Greeting */}
                      <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
                        {language === 'ar' ? 'مرحباً يا لهيب 👋' : 'Hello, Lahib 👋'}
                      </h2>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-bold max-w-xl mx-auto leading-relaxed mb-6">
                        {language === 'ar' 
                          ? `أنا مساعدك الذكي ${activeChatAgent.nameAr}، كيف يمكنني خدمتك اليوم في إدارة الصيانة والعمليات؟`
                          : `I am your AI assistant ${activeChatAgent.nameEn}. How can I assist you in managing maintenance and operations today?`}
                      </p>

                      {/* Recommended Quick Query Cards (centered, huge, interactive, purple brand identity) */}
                      <div className="space-y-3 max-w-xl mx-auto px-4">
                        <div className="flex items-center justify-center gap-2 text-violet-600 dark:text-violet-400 text-xs font-black tracking-wider uppercase mb-1">
                          <Compass size={13} className="text-violet-500 dark:text-violet-400" />
                          <span>{language === 'ar' ? 'استعلامات سريعة موصى بها من الوكيل' : 'RECOMMENDED QUICK QUERIES'}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                          {currentSuggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAgentSendMessage(activeChatAgent.id, sug.text)}
                              className="group relative flex items-center justify-between p-3.5 text-right bg-white dark:bg-[#151c2e] hover:bg-violet-50/80 dark:hover:bg-violet-950/20 border border-slate-200 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-500 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 shadow-xs hover:shadow-md text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white animate-fadeIn"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:bg-violet-100 dark:group-hover:bg-violet-900 transition-colors">
                                  <Compass size={14} />
                                </div>
                                <span className="text-xs md:text-[13px] font-black leading-snug">{sug.label}</span>
                              </div>
                              <span className="text-xs text-violet-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all">
                                {isRtl ? '←' : '→'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Conversation stream
                    activeChatMessages.map((msg, i) => {
                      const isUser = msg.role === 'user';
                      return (
                        <div
                          key={i}
                          className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}
                        >
                          <span className={`text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block px-2 mb-1`}>
                            {isUser 
                              ? (language === 'ar' ? 'المدير التنفيذي لهيب' : 'Executive Director Lahib') 
                              : (language === 'ar' ? `الوكيل ${activeChatAgent.nameAr} 🤖` : `${activeChatAgent.nameEn} 🤖`)}
                          </span>

                           <div className={`p-4 leading-relaxed max-w-[85%] border relative group transition-all duration-300 ${
                            isUser 
                              ? 'bg-gradient-to-br from-violet-50/90 to-indigo-50/60 dark:from-violet-950/20 dark:to-indigo-950/15 text-violet-950 dark:text-violet-200 rounded-2xl rounded-tr-none px-5 py-3.5 border-violet-200/60 dark:border-violet-500/15 font-semibold shadow-[0_6px_18px_rgba(139,92,246,0.08)]' 
                              : 'bg-gradient-to-br from-indigo-50/70 to-white dark:from-[#11172b] dark:to-[#0c1020] text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-none border-violet-500/20 dark:border-violet-400/15 font-medium shadow-[0_6px_24px_rgba(109,40,217,0.03)]'
                          } ${isRtl ? 'text-right' : 'text-left'}`}>
                            
                            {!isUser && (
                              <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100/60 dark:border-slate-800/40 text-[10px] font-black text-violet-600 dark:text-violet-400 select-none">
                                <Sparkles size={11} className="animate-pulse shrink-0" />
                                <span>{language === 'ar' ? 'توصية الوكيل الذكي' : 'Verified AI Agent Recommendation'}</span>
                              </div>
                            )}

                            <div className="select-text text-[14px] md:text-[15px]">
                              {isUser ? msg.text : renderRichMessageText(msg.text, `agent-chat-${activeChatAgent.id}-${i}`)}
                            </div>

                            {!isUser && (
                              <div className="flex items-center gap-3.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 dark:text-slate-500 font-bold select-none">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSpeakMessage(`agent-chat-${activeChatAgent.id}-${i}`, msg.text)}
                                  className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors"
                                >
                                  {activeAudioMessageId === `agent-chat-${activeChatAgent.id}-${i}` && isPlayingAudio ? (
                                    <>
                                      <VolumeX size={13} className="text-rose-500 animate-bounce" />
                                      <span>{language === 'ar' ? 'إيقاف الصوت' : 'Mute'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 size={13} />
                                      <span>{language === 'ar' ? 'قراءة صوتية' : 'Read Aloud'}</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.text);
                                  }}
                                  className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors"
                                >
                                  <Copy size={13} />
                                  <span>{language === 'ar' ? 'نسخ التوصية' : 'Copy'}</span>
                                </button>

                                {/* Work Order Generator for repair recommendations */}
                                {(msg.text.includes('صيانة') || msg.text.includes('إصلاح') || msg.text.includes('عطل') || msg.text.includes('فرامل') || msg.text.toLowerCase().includes('maintenance') || msg.text.toLowerCase().includes('repair')) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuickOrderData({
                                        vehicleId: defaultVehicles[0]?.id || 'V1',
                                        category: activeChatAgent.id === 'mechanic' ? 'mechanical' : 'body',
                                        description: msg.text.slice(0, 150) + '...',
                                        technicianId: defaultTechnicians[0]?.id || 'T1',
                                        cost: '300'
                                      });
                                      setQuickOrderModalOpen(true);
                                    }}
                                    className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline cursor-pointer transition-colors ml-auto mr-auto"
                                  >
                                    <Wrench size={13} />
                                    <span>{language === 'ar' ? '⚙️ توليد أمر صيانة سريع' : '⚙️ Quick Work Order'}</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {agentChatLoading[activeChatAgent.id] && (
                    <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-850 flex items-center justify-center shrink-0">
                        <Loader2 size={16} className="animate-spin" />
                      </div>
                      <div className="p-3.5 bg-white dark:bg-[#111726] text-slate-600 dark:text-slate-300 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 text-xs font-bold animate-pulse shadow-xs">
                        {language === 'ar' ? 'يقوم الوكيل بتحليل الحالة الراهنة وتوليد التوصيات...' : 'Agent analyzing state and preparing action steps...'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Evolving Recommended Suggestions */}
                {!isWelcomeState && (
                  <div className="px-5 py-3 bg-violet-50/10 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-2 select-none shadow-inner animate-fadeIn">
                    <div className={`flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-extrabold pr-1 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <Lightbulb size={13} className="text-amber-500 animate-pulse shrink-0" />
                      <span>{language === 'ar' ? 'توصيات ومتابعات موصى بها من الوكيل:' : 'Recommended Next Steps:'}</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-violet-200/50 dark:scrollbar-thumb-slate-800 no-scrollbar snap-x max-w-full">
                      {currentSuggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={agentChatLoading[activeChatAgent.id]}
                          onClick={() => setSelectedReadingSuggestion(sug.text)}
                          className="flex items-center gap-2 text-xs font-black bg-white dark:bg-[#151c2e] hover:bg-violet-50 dark:hover:bg-violet-950/20 text-slate-700 dark:text-slate-200 hover:text-violet-700 dark:hover:text-violet-400 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-500 cursor-pointer transition-all duration-200 shadow-xs shrink-0 snap-center max-w-[280px] text-ellipsis overflow-hidden whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="truncate">{sug.label}</span>
                          {isRtl ? (
                            <ArrowLeft size={11} className="text-violet-600 dark:text-violet-400 shrink-0 font-bold" />
                          ) : (
                            <ArrowRight size={11} className="text-violet-600 dark:text-violet-400 shrink-0 font-bold" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Input form with Violet Accents */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0c101d] shadow-md">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAgentSendMessage(activeChatAgent.id);
                    }}
                    className="flex items-center gap-3"
                  >
                    <input
                      type="text"
                      value={agentInputText}
                      onChange={(e) => setAgentInputText(e.target.value)}
                      disabled={agentChatLoading[activeChatAgent.id]}
                      placeholder={language === 'ar' ? 'اكتب تساؤلاً أو طلباً تنظيمياً للوكيل...' : 'Type a query or action command...'}
                      className="flex-1 p-3.5 bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800/80 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-violet-600 dark:focus:border-violet-400 focus:ring-1 focus:ring-violet-600/20 dark:focus:ring-violet-400/20 transition-all disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={!agentInputText.trim() || agentChatLoading[activeChatAgent.id]}
                      className="p-3.5 bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 disabled:bg-slate-150 disabled:dark:bg-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-500 rounded-2xl cursor-pointer transition-all duration-200 border-0 flex items-center justify-center shrink-0 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(109,40,217,0.32)] hover:shadow-[0_4px_18_rgba(109,40,217,0.45)] dark:shadow-none"
                    >
                      {agentChatLoading[activeChatAgent.id] ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} className={isRtl ? 'rotate-180' : ''} />
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>

              {/* 5. RECOMMENDATION CENTERED READING MODAL */}
              <AnimatePresence>
                {selectedReadingSuggestion && (
                  <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedReadingSuggestion(null)} 
                      className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" 
                    />
                    
                    {/* Centered Modal Card */}
                    <motion.div 
                      initial={{ scale: 0.9, y: 20, opacity: 0 }} 
                      animate={{ scale: 1, y: 0, opacity: 1 }} 
                      exit={{ scale: 0.9, y: 20, opacity: 0 }}
                      className="bg-white dark:bg-[#0c101d] text-slate-800 dark:text-slate-200 w-full max-w-lg rounded-3xl shadow-[0_25px_60px_rgba(109,40,217,0.25)] border-2 border-violet-200 dark:border-violet-900 overflow-hidden z-[161]"
                      dir={isRtl ? 'rtl' : 'ltr'}
                    >
                      {/* Header */}
                      <div className="p-5 border-b border-violet-100 dark:border-violet-900/60 bg-gradient-to-r from-violet-50 to-white dark:from-violet-950/20 dark:to-[#0c101d] flex items-center justify-between">
                        <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 shadow-xs">
                            <Lightbulb size={18} className="text-amber-500 animate-pulse" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-violet-800 dark:text-violet-300">
                              {language === 'ar' ? 'تفاصيل التوصية المقترحة' : 'Recommendation Detail'}
                            </h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-bold">
                              {language === 'ar' ? 'مراجعة التوصية التشغيلية وتحليلها' : 'Review the agent\'s operational advice'}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedReadingSuggestion(null)} 
                          className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors border-0 bg-transparent flex items-center justify-center"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        <div className={`p-5 bg-violet-50/50 dark:bg-violet-950/10 rounded-2xl border border-violet-150 dark:border-violet-900/40 ${isRtl ? 'text-right font-black' : 'text-left font-black'}`}>
                          <p className="text-sm md:text-base text-slate-850 dark:text-slate-100 leading-relaxed">
                            {selectedReadingSuggestion}
                          </p>
                        </div>
                        
                        <div className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
                          {language === 'ar' ? (
                            <span className="flex flex-col gap-1.5">
                              <span>📌 <strong>ماذا يعني هذا؟</strong> هذه التوصية مصممة لتحسين كفاءة التشغيل وتفادي الاختناقات استناداً إلى بيانات الورشة المباشرة.</span>
                              <span>💡 يمكنك إرسال هذه التوصية فوراً للوكيل في الدردشة لمناقشة التفاصيل أو توليد خطوات العمل اللازمة.</span>
                            </span>
                          ) : (
                            <span className="flex flex-col gap-1.5">
                              <span>📌 <strong>What does this mean?</strong> This advice is tailored to optimize workshop operations and prevent delays based on live diagnostics data.</span>
                              <span>💡 You can send this recommendation directly to the agent to discuss details or generate action steps.</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-5 border-t border-violet-100 dark:border-violet-900/60 bg-slate-50/50 dark:bg-[#070a13]/30 flex flex-col sm:flex-row gap-2 justify-end">
                        <button
                          onClick={() => setSelectedReadingSuggestion(null)}
                          className="px-4 py-2.5 bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350 rounded-xl text-xs font-black transition-colors border-0 cursor-pointer text-center"
                        >
                          {language === 'ar' ? 'إغلاق' : 'Close'}
                        </button>
                        <button
                          onClick={() => {
                            handleAgentSendMessage(activeChatAgent.id, selectedReadingSuggestion);
                            setSelectedReadingSuggestion(null);
                          }}
                          className="px-4 py-2.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all border-0 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                        >
                          <Send size={13} className={isRtl ? 'rotate-180' : ''} />
                          <span>{language === 'ar' ? 'إرسال وتطبيق التوصية' : 'Send & Apply'}</span>
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
