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
  Mic,
  BrainCircuit,
  ShieldCheck,
  Boxes,
  PackageSearch,
  LineChart,
  Coins,
  Calculator,
  Landmark,
  Radar,
  Zap,
  AlertTriangle,
  Workflow,
  User,
  FilePlus,
  Radio,
  Sliders,
  Shield,
  Gauge,
  Maximize2,
  Minimize2,
  CheckCheck,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Camera,
  Image as ImageIcon,
  Download,
  Eye,
  FileSpreadsheet,
  File
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

export interface AttachedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  previewUrl?: string;
  isImage?: boolean;
}

// Interfaces for Maintenance Bot
interface MechanicMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachment?: AttachedFileItem;
}

// Sleek Modern Geometric AI Brand Emblem matching Hostinger / Agent style
const ModernAiBrandEmblem = ({ size = 52, className = "" }: { size?: number; className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 bg-violet-600/25 dark:bg-violet-500/30 blur-2xl rounded-full scale-150 pointer-events-none animate-pulse" />
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-md">
      <path d="M24 3L29 18.5L44.5 23.5L29 28.5L24 44L19 28.5L3.5 23.5L19 18.5L24 3Z" fill="url(#ai-grad-primary)" />
      <path d="M24 11.5L27 21L36.5 24L27 27L24 36.5L21 27L11.5 24L21 21L24 11.5Z" fill="url(#ai-grad-secondary)" />
      <circle cx="24" cy="24" r="3" fill="#ffffff" className="drop-shadow-xs" />
      <defs>
        <linearGradient id="ai-grad-primary" x1="3.5" y1="3" x2="44.5" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="0.5" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="ai-grad-secondary" x1="11.5" y1="11.5" x2="36.5" y2="36.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A855F7" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// Categorized Prompt Library for the Empty/Hero State
const PROMPT_CATEGORIES_DATA = {
  'for-you': {
    id: 'for-you',
    nameAr: 'مخصص لك',
    nameEn: 'For You',
    prompts: [
      { textAr: 'فحص الصيانة الدورية وتنبؤ الأعطال الوشيكة للأسطول', textEn: 'Verify fleet periodic maintenance & forecast failures' },
      { textAr: 'مراجعة أسعار وتوافر قطع الغيار ومستوى المخزون الحرج', textEn: 'Review spare parts pricing & critical inventory stock' },
      { textAr: 'خطة الطوارئ وسيناريو تكدس الورشة وتوزيع الفنيين', textEn: 'Workshop peak backlog mitigation & staff allocation' },
      { textAr: 'تدقيق بطاقات الفحص الفني ومعايير السلامة للسيارات', textEn: 'Audit vehicle technical inspection & safety compliance' }
    ]
  },
  'fleet': {
    id: 'fleet',
    nameAr: 'الأسطول والورشة',
    nameEn: 'Fleet & Workshop',
    prompts: [
      { textAr: 'ما هي المركبات الأكثر استهلاكاً للوقود والصيانة هذا الشهر؟', textEn: 'Which vehicles have the highest fuel and maintenance costs?' },
      { textAr: 'توزيع خطة التشغيل اليومية لسيارات النقل الثقيل', textEn: 'Daily dispatch schedule for heavy transport trucks' },
      { textAr: 'جدولة مواعيد الفحص الدوري للمركبات المتأخرة', textEn: 'Schedule overdue periodic inspections for the fleet' }
    ]
  },
  'parts': {
    id: 'parts',
    nameAr: 'قطع الغيار',
    nameEn: 'Spare Parts',
    prompts: [
      { textAr: 'حصر الأصناف التي وصلت إلى حد إعادة الطلب الأدنى', textEn: 'List items that reached minimum reorder threshold' },
      { textAr: 'مقارنة أسعار الموردين لقطع الفرامل والفلاتر', textEn: 'Compare vendor prices for brake pads and filters' },
      { textAr: 'توليد طلب شراء عاجل للقطع الأكثر استهلاكاً', textEn: 'Generate urgent PO for highest moving parts' }
    ]
  },
  'finance': {
    id: 'finance',
    nameAr: 'التكاليف والميزانية',
    nameEn: 'Budget & Finance',
    prompts: [
      { textAr: 'تحليل تكلفة الصيانة لكل كيلومتر (Cost Per KM) للشهر الحالي', textEn: 'Calculate maintenance cost per KM for this month' },
      { textAr: 'مقارنة تكلفة الورشة الداخلية مع مراكز الصيانة الخارجية', textEn: 'Compare in-house vs external workshop repair costs' },
      { textAr: 'توقع ميزانية قطع الغيار للربع السنوي القادم', textEn: 'Forecast spare parts budget for the next quarter' }
    ]
  },
  'staff': {
    id: 'staff',
    nameAr: 'الفنيين والإنتاجية',
    nameEn: 'Staff & Techs',
    prompts: [
      { textAr: 'تقييم كفاءة الفنيين وسرعة إنجاز أوامر الصيانة', textEn: 'Evaluate technician efficiency and work order turnaround' },
      { textAr: 'إعادة توزيع أوامر العمل المعلقة على الورش المتاحة', textEn: 'Reassign pending work orders across available workshops' },
      { textAr: 'كشف ساعات العمل الإضافية والضغط التشغيلي للفنيين', textEn: 'Review technician overtime and operational load' }
    ]
  }
};

interface AiHubProps {
  onBack?: () => void;
}

export default function AiHub({ onBack }: AiHubProps = {}) {
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
      icon: 'BrainCircuit',
      isActive: true,
      color: 'violet',
      roles: ['Strategic PM', 'Workflow Sync']
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
      roles: ['Diagnostics', 'Torque & Parts']
    },
    {
      id: 'safety',
      nameAr: 'مفتش السلامة والأمان والامتثال',
      nameEn: 'Safety & Compliance Auditor',
      descAr: 'مراجعة وتدقيق بطاقات التفتيش الرقمي للسلامة وضمان تطابق معايير النقل البري والبيئة.',
      descEn: 'Auditing digital safety checklists and guaranteeing compliance with terrestrial transport laws.',
      icon: 'ShieldCheck',
      isActive: true,
      color: 'emerald',
      roles: ['Compliance', 'Auditing']
    },
    {
      id: 'supply-chain',
      nameAr: 'خبير سلاسل الإمداد ومفاوض الموردين',
      nameEn: 'Supply Chain & Procurement Bot',
      descAr: 'التنبؤ باحتياجات قطع الغيار، التوجيه بطلبات التوريد الفورية ومقارنة عروض أسعار الموردين.',
      descEn: 'Forecasting spare parts consumption, automating purchase requests and comparing vendor quotes.',
      icon: 'Boxes',
      isActive: true,
      color: 'sky',
      roles: ['Procurement', 'Inventory AI']
    },
    {
      id: 'predictive',
      nameAr: 'محلل الصيانة التنبؤية للأسطول',
      nameEn: 'Predictive Fleet Lifecycle Analyst',
      descAr: 'توقع الأعطال الوشيكة بناء على قراءات العدادات وسلوك السائقين لتقليل التعطل المفاجئ.',
      descEn: 'Predicting vehicle wear-and-tear using telemetry, odometer schedules, and driver behaviors.',
      icon: 'LineChart',
      isActive: true,
      color: 'rose',
      roles: ['Telemetry', 'Failure Forecast']
    },
    {
      id: 'finance',
      nameAr: 'المراقب المالي وإدارة تكاليف التشغيل',
      nameEn: 'Financial Controller & Cost Optimizer',
      descAr: 'تحليل تكلفة استهلاك قطع غيار الورشة، والتحقق من الجدوى المالية لمزودي الخدمة الخارجيين.',
      descEn: 'Analyzing maintenance billing trends, workshop spending margins, and external vendor costs.',
      icon: 'Landmark',
      isActive: true,
      color: 'teal',
      roles: ['Budget Control', 'Cost Audit']
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

  const renderAgentIcon = (
    id: string, 
    color?: string, 
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'sm', 
    className = ''
  ) => {
    const sizeMap = {
      xs: 12,
      sm: 15,
      md: 19,
      lg: 24,
      xl: 32
    };
    const iconSize = sizeMap[size] || 15;

    let colorClass = '';
    if (color === 'violet') colorClass = 'text-violet-600 dark:text-violet-400';
    else if (color === 'amber') colorClass = 'text-amber-600 dark:text-amber-400';
    else if (color === 'emerald') colorClass = 'text-emerald-600 dark:text-emerald-400';
    else if (color === 'sky') colorClass = 'text-sky-600 dark:text-sky-400';
    else if (color === 'rose') colorClass = 'text-rose-600 dark:text-rose-400';
    else if (color === 'teal') colorClass = 'text-teal-600 dark:text-teal-400';
    else colorClass = 'text-slate-700 dark:text-slate-200';

    const mergedClass = `${colorClass} ${className} shrink-0 stroke-[2.2]`;

    switch (id) {
      case 'project-manager':
        return <BrainCircuit size={iconSize} className={mergedClass} />;
      case 'mechanic':
        return <Wrench size={iconSize} className={mergedClass} />;
      case 'safety':
        return <ShieldCheck size={iconSize} className={mergedClass} />;
      case 'supply-chain':
        return <Boxes size={iconSize} className={mergedClass} />;
      case 'predictive':
        return <LineChart size={iconSize} className={mergedClass} />;
      case 'finance':
        return <Landmark size={iconSize} className={mergedClass} />;
      default:
        return <Bot size={iconSize} className={mergedClass} />;
    }
  };

  const renderAgentAvatarContainer = (
    id: string, 
    color: string, 
    isActive = true, 
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md',
    showStatusDot = true
  ) => {
    const containerClasses = {
      xs: 'w-6 h-6 rounded-lg',
      sm: 'w-8 h-8 rounded-xl',
      md: 'w-10 h-10 rounded-xl',
      lg: 'w-12 h-12 rounded-2xl',
      xl: 'w-16 h-16 rounded-2xl'
    };

    const bgMap: Record<string, string> = {
      violet: 'bg-violet-500/10 border-violet-500/25 text-violet-600 dark:text-violet-400 dark:bg-violet-950/30',
      amber: 'bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400 dark:bg-amber-950/30',
      emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/30',
      sky: 'bg-sky-500/10 border-sky-500/25 text-sky-600 dark:text-sky-400 dark:bg-sky-950/30',
      rose: 'bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400 dark:bg-rose-950/30',
      teal: 'bg-teal-500/10 border-teal-500/25 text-teal-600 dark:text-teal-400 dark:bg-teal-950/30'
    };

    const activeTheme = isActive 
      ? (bgMap[color] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700')
      : 'bg-slate-100/60 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 border-slate-200/50 dark:border-slate-800/50 grayscale opacity-65';

    return (
      <div className="relative shrink-0 select-none">
        <div className={`${containerClasses[size]} border flex items-center justify-center shadow-xs transition-all ${activeTheme}`}>
          {renderAgentIcon(id, color, size)}
        </div>
        {showStatusDot && (
          <span 
            className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white dark:border-[#0c101d] ${
              size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
            } ${isActive ? 'bg-emerald-500 ring-1 ring-emerald-400/40 animate-pulse' : 'bg-slate-400'}`} 
            title={isActive ? 'Active' : 'Paused'}
          />
        )}
      </div>
    );
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
    attachment?: AttachedFileItem;
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

  // File Attachment States
  const [pmAttachedFile, setPmAttachedFile] = useState<AttachedFileItem | null>(null);
  const [mechAttachedFile, setMechAttachedFile] = useState<AttachedFileItem | null>(null);
  const [coPilotAttachedFile, setCoPilotAttachedFile] = useState<AttachedFileItem | null>(null);
  const [showMechAttachMenu, setShowMechAttachMenu] = useState<boolean>(false);
  const [showCoPilotAttachMenu, setShowCoPilotAttachMenu] = useState<boolean>(false);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  const pmFileInputRef = useRef<HTMLInputElement>(null);
  const mechFileInputRef = useRef<HTMLInputElement>(null);
  const coPilotFileInputRef = useRef<HTMLInputElement>(null);
  const cameraFileInputRef = useRef<HTMLInputElement>(null);
  const [cameraTarget, setCameraTarget] = useState<'pm' | 'mech' | 'copilot'>('pm');

  // Real Voice Recording & Dictation States
  const [isVoiceRecording, setIsVoiceRecording] = useState<boolean>(false);
  const [voiceRecordingDuration, setVoiceRecordingDuration] = useState<number>(0);
  const [voiceRecordingTarget, setVoiceRecordingTarget] = useState<'pm' | 'mech' | 'copilot'>('pm');
  const [voiceTranscriptText, setVoiceTranscriptText] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const speechRecRef = useRef<any>(null);

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

  // Fullscreen Page Mode State
  const [isFullscreenChat, setIsFullscreenChat] = useState<boolean>(false);

  // Shared sidebar visibility state - default to false so conversation takes 100% full width
  const [showSidebar, setShowSidebar] = useState<boolean>(() => {
    const saved = localStorage.getItem('fleet_ai_show_sidebar');
    return saved === 'true';
  });

  const handleToggleSidebar = () => {
    const nextState = !showSidebar;
    setShowSidebar(nextState);
    localStorage.setItem('fleet_ai_show_sidebar', String(nextState));
  };

  // Fullscreen Modern Chat States
  const [selectedPromptCategory, setSelectedPromptCategory] = useState<string>('for-you');
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState<boolean>(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState<boolean>(false);
  const [whatsAppMenuOpen, setWhatsAppMenuOpen] = useState<boolean>(false);
  const [showAttachMenu, setShowAttachMenu] = useState<boolean>(false);
  const [showQuickPromptsMenu, setShowQuickPromptsMenu] = useState<boolean>(false);

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
    const text = textToSend !== undefined ? textToSend : pmInput;
    const currentAttachment = pmAttachedFile;
    if ((!text.trim() && !currentAttachment) || pmLoading) return;

    const userMessageText = text.trim() || (currentAttachment ? (language === 'ar' ? `[مرفق: ${currentAttachment.name}]` : `[Attached: ${currentAttachment.name}]`) : '');

    const userMessage: AIMessage = { 
      role: 'user', 
      text: userMessageText,
      attachment: currentAttachment ? { ...currentAttachment } : undefined,
      timestamp: new Date()
    };
    setPmMessages(prev => [...prev, userMessage]);
    
    if (textToSend === undefined) {
      setPmInput('');
    }
    setPmAttachedFile(null);
    setPmLoading(true);

    try {
      let promptContext = getPmContextModifier();
      if (currentAttachment) {
        promptContext += ` [ملاحظة مرفق: أرفق المستخدم ملفاً/صورة باسم "${currentAttachment.name}"، نوعه "${currentAttachment.type}"، وحجمه ${Math.round(currentAttachment.size / 1024)} KB]`;
      }
      const response = await getAIProjectManagerInsight([...pmMessages, userMessage], promptContext);
      setPmMessages(prev => [...prev, { role: 'model', text: response, timestamp: new Date() }]);
    } catch (e) {
      console.error(e);
      setPmMessages(prev => [...prev, { 
        role: 'model', 
        text: language === 'ar'
          ? '⚠️ عذراً، واجهت صعوبة في معالجة طلبك حالياً. يرجى التحقق من اتصال الإنترنت.'
          : '⚠️ Pardon me, I had issue getting the response. Please check project settings.',
        timestamp: new Date()
      }]);
    } finally {
      setPmLoading(false);
    }
  };

  // Sender for Mechanic Bot
  const handleMechSendMessage = async (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : mechInput;
    const currentAttachment = mechAttachedFile;
    if ((!text.trim() && !currentAttachment) || mechLoading) return;

    const userMessageText = text.trim() || (currentAttachment ? (language === 'ar' ? `[مرفق: ${currentAttachment.name}]` : `[Attached: ${currentAttachment.name}]`) : '');

    const newUserMessage: MechanicMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: userMessageText,
      timestamp: new Date(),
      attachment: currentAttachment ? { ...currentAttachment } : undefined
    };

    setMechMessages(prev => [...prev, newUserMessage]);
    if (textToSend === undefined) {
      setMechInput('');
    }
    setMechAttachedFile(null);
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

      let mechModifier = getMechContextModifier();
      if (currentAttachment) {
        mechModifier += ` [ملاحظة مرفق: أرفق المستخدم ملفاً/صورة باسم "${currentAttachment.name}"، نوعه "${currentAttachment.type}"، وحجمه ${Math.round(currentAttachment.size / 1024)} KB]`;
      }
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
    const text = textToSend !== undefined ? textToSend : coPilotInput;
    const currentAttachment = coPilotAttachedFile;
    if ((!text.trim() && !currentAttachment) || coPilotLoading) return;

    const userMessageText = text.trim() || (currentAttachment ? (language === 'ar' ? `[مرفق: ${currentAttachment.name}]` : `[Attached: ${currentAttachment.name}]`) : '');

    const newUserMessage: CoPilotMessage = {
      id: `copilot-${Date.now()}-user`,
      role: 'user',
      text: userMessageText,
      timestamp: new Date(),
      attachment: currentAttachment ? { ...currentAttachment } : undefined
    };

    setCoPilotMessages(prev => [...prev, newUserMessage]);
    if (textToSend === undefined) {
      setCoPilotInput('');
    }
    setCoPilotAttachedFile(null);
    setCoPilotLoading(true);

    try {
      // 1. Trigger PM Insight query
      const pmPromise = getAIProjectManagerInsight(
        coPilotMessages
          .filter(m => m.text)
          .map(m => ({ role: m.role, text: m.text || '' }))
          .concat([{ role: 'user', text: userMessageText }]),
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
        .concat([{ role: 'user', text: userMessageText }]);

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
    } catch (e) {
      console.error(e);
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

  // Helper to format file sizes
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Render Message Attachment in Chat Bubble
  const renderMessageAttachmentBadge = (attachment?: AttachedFileItem) => {
    if (!attachment) return null;

    if (attachment.isImage && (attachment.previewUrl || attachment.dataUrl)) {
      const imgSource = attachment.previewUrl || attachment.dataUrl;
      return (
        <div className="mt-2 mb-1 overflow-hidden rounded-xl border border-white/20 dark:border-purple-800/40 bg-black/20 backdrop-blur-xs">
          <div className="relative group cursor-pointer" onClick={() => setPreviewModalImage(imgSource || null)}>
            <img 
              src={imgSource} 
              alt={attachment.name} 
              className="max-h-56 w-full object-cover rounded-lg transition-transform group-hover:scale-[1.02]" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white">
              <span className="p-2 rounded-full bg-white/20 backdrop-blur-md flex items-center gap-1 text-xs font-bold">
                <Eye size={14} />
                {language === 'ar' ? 'عرض مكبّر' : 'Zoom View'}
              </span>
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] text-white font-medium">
              <span className="truncate max-w-[150px]">{attachment.name}</span>
              <span>{formatFileSize(attachment.size)}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-2 mb-1 p-2.5 rounded-xl border border-white/20 dark:border-purple-800/40 bg-white/10 dark:bg-black/30 backdrop-blur-xs flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-600/30 text-purple-200 flex items-center justify-center shrink-0">
            <File size={16} />
          </div>
          <div className="min-w-0 text-left">
            <p className="font-bold truncate text-[11px] text-slate-100 dark:text-slate-200">{attachment.name}</p>
            <p className="text-[9px] opacity-75">{formatFileSize(attachment.size)}</p>
          </div>
        </div>
        {attachment.dataUrl && (
          <a
            href={attachment.dataUrl}
            download={attachment.name}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white shrink-0 transition-colors"
            title={language === 'ar' ? 'تحميل الملف' : 'Download File'}
          >
            <Download size={13} />
          </a>
        )}
      </div>
    );
  };

  // Render Attachment Preview Bar above Input
  const renderAttachmentPreviewBar = (attachedFile: AttachedFileItem | null, onRemove: () => void) => {
    if (!attachedFile) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 5, scale: 0.96 }}
        className="mx-3 md:mx-5 mb-2 p-2 rounded-2xl bg-purple-950/80 dark:bg-[#150e26] border border-purple-400/30 backdrop-blur-md flex items-center justify-between gap-3 shadow-lg"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {attachedFile.isImage && (attachedFile.previewUrl || attachedFile.dataUrl) ? (
            <img
              src={attachedFile.previewUrl || attachedFile.dataUrl}
              alt={attachedFile.name}
              className="w-10 h-10 object-cover rounded-xl border border-purple-400/40 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-purple-600/40 text-purple-200 flex items-center justify-center shrink-0 border border-purple-400/30">
              <File size={18} />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-600/40 text-purple-200 font-bold uppercase">
                {attachedFile.isImage ? (language === 'ar' ? 'صورة' : 'Image') : (language === 'ar' ? 'ملف' : 'Doc')}
              </span>
              <p className="text-xs font-bold text-white truncate max-w-[180px] md:max-w-[300px]">
                {attachedFile.name}
              </p>
            </div>
            <p className="text-[10px] text-purple-200/70">
              {formatFileSize(attachedFile.size)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {attachedFile.isImage && (
            <button
              type="button"
              onClick={() => setPreviewModalImage(attachedFile.previewUrl || attachedFile.dataUrl || null)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-purple-100 transition-all cursor-pointer"
              title={language === 'ar' ? 'معاينة' : 'Preview'}
            >
              <Eye size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-all cursor-pointer"
            title={language === 'ar' ? 'إلغاء المرفق' : 'Remove Attachment'}
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    );
  };

  // Render Voice Recording Live Banner
  const renderVoiceRecordingBanner = (target: 'pm' | 'mech' | 'copilot') => {
    if (!isVoiceRecording || voiceRecordingTarget !== target) return null;

    const formatDuration = (sec: number) => {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex-1 bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-rose-950/80 border border-rose-500/40 rounded-2xl px-3.5 py-2 flex items-center justify-between gap-3 shadow-inner"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span className="text-xs font-mono font-bold text-rose-300">
              {formatDuration(voiceRecordingDuration)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <motion.span animate={{ height: [6, 18, 6] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-rose-400 rounded-full" />
            <motion.span animate={{ height: [12, 24, 8] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className="w-1 bg-purple-400 rounded-full" />
            <motion.span animate={{ height: [8, 20, 10] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.2 }} className="w-1 bg-rose-400 rounded-full" />
            <motion.span animate={{ height: [14, 22, 6] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.3 }} className="w-1 bg-purple-400 rounded-full" />
          </div>

          <span className="text-xs text-purple-100 font-semibold truncate max-w-[120px] md:max-w-[240px]">
            {voiceTranscriptText || (language === 'ar' ? 'جارٍ الاستماع والتسجيل...' : 'Listening and recording...')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCancelRealVoiceRecording}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title={language === 'ar' ? 'إلغاء' : 'Cancel'}
          >
            <X size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleStopRealVoiceRecording(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md"
          >
            <Check size={14} />
            <span>{language === 'ar' ? 'إرسال' : 'Send'}</span>
          </button>
        </div>
      </motion.div>
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

  // File & Media Upload Handlers
  const handleFileSelected = (file: File, target: 'pm' | 'mech' | 'copilot') => {
    if (!file) return;
    const isImg = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = (e) => {
      const item: AttachedFileItem = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: file.name,
        size: file.size,
        type: file.type || (isImg ? 'image/jpeg' : 'application/octet-stream'),
        dataUrl: e.target?.result as string,
        previewUrl: isImg ? (e.target?.result as string) : undefined,
        isImage: isImg
      };
      if (target === 'pm') setPmAttachedFile(item);
      else if (target === 'mech') setMechAttachedFile(item);
      else setCoPilotAttachedFile(item);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerCamera = (target: 'pm' | 'mech' | 'copilot') => {
    setCameraTarget(target);
    if (cameraFileInputRef.current) {
      cameraFileInputRef.current.value = '';
      cameraFileInputRef.current.click();
    }
  };

  const handleTriggerImageUpload = (target: 'pm' | 'mech' | 'copilot') => {
    if (target === 'pm' && pmFileInputRef.current) {
      pmFileInputRef.current.value = '';
      pmFileInputRef.current.accept = 'image/*';
      pmFileInputRef.current.click();
    } else if (target === 'mech' && mechFileInputRef.current) {
      mechFileInputRef.current.value = '';
      mechFileInputRef.current.accept = 'image/*';
      mechFileInputRef.current.click();
    } else if (target === 'copilot' && coPilotFileInputRef.current) {
      coPilotFileInputRef.current.value = '';
      coPilotFileInputRef.current.accept = 'image/*';
      coPilotFileInputRef.current.click();
    }
  };

  const handleTriggerDocumentUpload = (target: 'pm' | 'mech' | 'copilot') => {
    if (target === 'pm' && pmFileInputRef.current) {
      pmFileInputRef.current.value = '';
      pmFileInputRef.current.accept = '.pdf,.doc,.docx,.xlsx,.xls,.txt,.csv,.json';
      pmFileInputRef.current.click();
    } else if (target === 'mech' && mechFileInputRef.current) {
      mechFileInputRef.current.value = '';
      mechFileInputRef.current.accept = '.pdf,.doc,.docx,.xlsx,.xls,.txt,.csv,.json';
      mechFileInputRef.current.click();
    } else if (target === 'copilot' && coPilotFileInputRef.current) {
      coPilotFileInputRef.current.value = '';
      coPilotFileInputRef.current.accept = '.pdf,.doc,.docx,.xlsx,.xls,.txt,.csv,.json';
      coPilotFileInputRef.current.click();
    }
  };

  // Real Voice Recording with MediaRecorder & Speech Recognition
  const handleStartRealVoiceRecording = async (target: 'pm' | 'mech' | 'copilot') => {
    if (isVoiceRecording) {
      handleStopRealVoiceRecording(true);
      return;
    }

    setVoiceRecordingTarget(target);
    setVoiceRecordingDuration(0);
    setVoiceTranscriptText('');
    audioChunksRef.current = [];

    // 1. Try Speech Recognition for real-time dictation preview
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          currentTranscript = currentTranscript.trim();
          setVoiceTranscriptText(currentTranscript);
          if (target === 'pm') setPmInput(currentTranscript);
          else if (target === 'mech') setMechInput(currentTranscript);
          else setCoPilotInput(currentTranscript);
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech rec error in live recording:', err);
        };

        recognition.start();
        speechRecRef.current = recognition;
      } catch (e) {
        console.warn('Speech recognition initiation error:', e);
      }
    }

    // 2. Try MediaStream Audio Recording
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start(250);
      }
    } catch (micErr) {
      console.warn('Microphone stream access error:', micErr);
    }

    setIsVoiceRecording(true);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = setInterval(() => {
      setVoiceRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const handleStopRealVoiceRecording = (sendImmediately = false) => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch (e) {}
      speechRecRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    setIsVoiceRecording(false);

    const capturedText = voiceTranscriptText.trim() || 
      (voiceRecordingTarget === 'pm' ? pmInput.trim() : voiceRecordingTarget === 'mech' ? mechInput.trim() : coPilotInput.trim());

    if (sendImmediately && capturedText) {
      if (voiceRecordingTarget === 'pm') handlePmSendMessage(capturedText);
      else if (voiceRecordingTarget === 'mech') handleMechSendMessage(capturedText);
      else handleCoPilotSendMessage(capturedText);
    }
  };

  const handleCancelRealVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (speechRecRef.current) {
      try { speechRecRef.current.stop(); } catch (e) {}
      speechRecRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    setIsVoiceRecording(false);
    setVoiceTranscriptText('');
    setVoiceRecordingDuration(0);
  };

  // Smart Voice Dictation trigger (Fallback simulation & quick prompt)
  const handleStartVoiceDictation = (target: 'pm' | 'mech' | 'copilot') => {
    handleStartRealVoiceRecording(target);
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
    <div 
      className="fixed inset-0 z-[100] w-screen h-screen flex flex-col bg-[#efeae2] dark:bg-[#0b141a] overflow-hidden font-sans"
      dir={dir}
    >
      {/* 1. Brand Shadowed Purple Top Bar (بنفسجي ضلي فخم مع تدرجات وظلال عميقة) */}
      <div className={`bg-gradient-to-r from-[#1e1136] via-[#2d184f] to-[#20123b] dark:from-[#130a24] dark:via-[#1f1038] dark:to-[#140b26] text-white px-3.5 md:px-5 py-2.5 flex items-center justify-between gap-3 shrink-0 z-30 shadow-xl shadow-purple-950/40 border-b border-purple-400/20 backdrop-blur-md ${isRtl ? 'flex-row-reverse' : ''}`}>
        
        {/* Left Side (or Right in RTL): Back button + Avatar + Contact Info & Status */}
        <div className={`flex items-center gap-2.5 md:gap-3.5 min-w-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {/* Back Arrow Button */}
          <button
            type="button"
            onClick={onBack ? onBack : () => {
              if (window.history.length > 1) {
                window.history.back();
              }
            }}
            className="p-2 -mx-1 bg-white/10 hover:bg-white/15 active:bg-purple-900 active:scale-95 rounded-xl border border-purple-300/20 transition-all cursor-pointer text-purple-100 hover:text-white flex items-center justify-center shrink-0 shadow-xs"
            title={language === 'ar' ? 'الرجوع للتطبيق' : 'Back to App'}
          >
            {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>

          {/* Avatar with Online Badge */}
          <div 
            className="relative shrink-0 cursor-pointer active:scale-95 transition-transform" 
            onClick={() => activeTab === 'project-manager' ? setPmGuideModalOpen(true) : setMechGuideModalOpen(true)}
            title={language === 'ar' ? 'عرض بطاقة الوكيل' : 'View Agent Card'}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md overflow-hidden ${
              activeTab === 'project-manager'
                ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 border-2 border-purple-300/30 ring-2 ring-purple-500/20'
                : 'bg-gradient-to-tr from-amber-600 to-yellow-500 border-2 border-amber-300/30 ring-2 ring-amber-500/20'
            }`}>
              {activeTab === 'project-manager' ? <Sparkles size={20} /> : <Wrench size={20} />}
            </div>
            <span className={`absolute -bottom-0.5 ${isRtl ? '-left-0.5' : '-right-0.5'} w-3.5 h-3.5 bg-[#25d366] rounded-full border-2 border-[#1e1136] shadow-xs animate-pulse`} />
          </div>

          {/* Contact Name & Live Status Subtitle */}
          <div className={`leading-tight min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
            <h3 className="text-sm md:text-base font-bold text-white truncate flex items-center gap-1.5">
              <span>
                {activeTab === 'project-manager' 
                  ? (language === 'ar' ? 'روبرت - مدير الأسطول الذكي' : 'Robert - Fleet PM')
                  : (language === 'ar' ? 'مساعد الصيانة والقطع' : 'Mechanic & Parts Bot')}
              </span>
              <span className="text-[9px] bg-purple-900/70 border border-purple-400/30 text-purple-200 px-2 py-0.5 rounded-full font-bold shadow-xs">AI</span>
            </h3>
            <p className="text-[11px] text-purple-200/80 truncate flex items-center gap-1 mt-0.5">
              {(activeTab === 'project-manager' ? pmLoading : mechLoading) ? (
                <span className="text-purple-200 font-bold italic flex items-center gap-1 animate-pulse">
                  <span>{language === 'ar' ? 'يكتب الآن...' : 'typing...'}</span>
                </span>
              ) : (
                <span className="text-purple-200/80 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#25d366] shrink-0 shadow-xs" />
                  <span>{language === 'ar' ? 'متصل الآن' : 'online'}</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Center / Right: WhatsApp Agent Switcher Pill + Action Buttons */}
        <div className={`flex items-center gap-2 shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {/* Agent Switcher Tabs */}
          <div className="flex items-center bg-black/35 dark:bg-black/50 p-1 rounded-xl border border-purple-400/20 backdrop-blur-sm shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('project-manager')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                activeTab === 'project-manager'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-black ring-1 ring-white/20'
                  : 'text-purple-200/80 hover:text-white hover:bg-white/10 active:bg-purple-900'
              }`}
            >
              <Sparkles size={12} />
              <span className="hidden sm:inline">{language === 'ar' ? 'روبرت' : 'Robert'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mechanic')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                activeTab === 'mechanic'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-black ring-1 ring-white/20'
                  : 'text-purple-200/80 hover:text-white hover:bg-white/10 active:bg-purple-900'
              }`}
            >
              <Wrench size={12} />
              <span className="hidden sm:inline">{language === 'ar' ? 'الصيانة' : 'Mechanic'}</span>
            </button>
          </div>

          {/* Simulator & Metrics Drawer Toggle */}
          <button
            type="button"
            onClick={handleToggleSidebar}
            className={`p-2 bg-white/10 hover:bg-white/15 active:bg-purple-900 active:scale-95 rounded-xl border border-purple-300/20 transition-all cursor-pointer text-purple-100 hover:text-white flex items-center justify-center relative shadow-xs ${
              showSidebar ? 'bg-purple-600/40 ring-2 ring-purple-400/40' : ''
            }`}
            title={language === 'ar' ? 'لوحة المحاكاة والمؤشرات' : 'Simulator & Metrics'}
          >
            <LayoutDashboard size={18} />
          </button>

          {/* WhatsApp Dropdown Menu (3 dots) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setWhatsAppMenuOpen(!whatsAppMenuOpen)}
              className="p-2 bg-white/10 hover:bg-white/15 active:bg-purple-900 active:scale-95 rounded-xl border border-purple-300/20 transition-all cursor-pointer text-purple-100 hover:text-white flex items-center justify-center shadow-xs"
              title={language === 'ar' ? 'خيارات إضافية' : 'More options'}
            >
              <MoreVertical size={18} />
            </button>

            {whatsAppMenuOpen && (
              <>
                {/* Backdrop to close when clicking outside */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setWhatsAppMenuOpen(false)} 
                />

                <div 
                  className="absolute top-full mt-2 right-0 w-60 bg-white dark:bg-[#1f1738] text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl py-2 z-50 border border-purple-100 dark:border-purple-800/40 space-y-0.5 text-xs font-semibold animate-scale-in"
                  onClick={() => setWhatsAppMenuOpen(false)}
                >
                  <button
                    onClick={() => activeTab === 'project-manager' ? setPmGuideModalOpen(true) : setMechGuideModalOpen(true)}
                    className={`w-full px-4 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/50 active:bg-purple-600 active:text-white flex items-center gap-2.5 transition-colors cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                  >
                    <Compass size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="flex-1">{language === 'ar' ? 'معلومات ودليل الوكيل' : 'Agent Guide & Card'}</span>
                  </button>

                  <div className={`px-4 py-2.5 border-t border-b border-slate-100 dark:border-purple-900/30 flex items-center justify-between gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">{language === 'ar' ? 'حجم الخط' : 'Font Size'}</span>
                    <div className="flex items-center gap-1.5">
                      {(['sm', 'md', 'lg'] as const).map(sz => (
                        <button
                          key={sz}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetChatFontSize(sz);
                          }}
                          className={`w-7 h-7 rounded-lg font-bold text-[11px] flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                            chatFontSize === sz 
                              ? 'bg-purple-600 text-white shadow-xs' 
                              : 'bg-slate-100 dark:bg-purple-950/60 text-slate-600 dark:text-slate-300 hover:bg-purple-100 active:bg-purple-600 active:text-white'
                          }`}
                        >
                          {sz.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => activeTab === 'project-manager' ? handlePmClearChat() : handleMechClearChat()}
                    className={`w-full px-4 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/50 active:bg-purple-600 active:text-white flex items-center gap-2.5 transition-colors cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                  >
                    <RefreshCw size={15} className="text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="flex-1">{language === 'ar' ? 'مسح تدوينات المحادثة' : 'Clear Chat'}</span>
                  </button>

                  <button
                    onClick={() => onBack ? onBack() : null}
                    className={`w-full px-4 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:bg-rose-600 active:text-white text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                  >
                    <X size={15} className="shrink-0" />
                    <span className="flex-1">{language === 'ar' ? 'إغلاق والعودة للتطبيق' : 'Exit to App'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
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
                <>
                  {/* Mobile Backdrop Overlay */}
                  <div 
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
                    onClick={() => setShowSidebar(false)}
                  />

                  <div className={`fixed inset-y-0 z-50 w-[88vw] max-w-sm bg-white dark:bg-[#0c101d] shadow-2xl overflow-y-auto p-5 md:static md:w-80 md:z-auto md:shadow-none md:bg-slate-50/60 md:dark:bg-[#090d18] flex flex-col shrink-0 ${
                    isRtl ? 'right-0 md:order-last md:border-l border-slate-200 dark:border-slate-850' : 'left-0 md:border-r border-slate-200 dark:border-slate-850'
                  }`}>
                    {/* Mobile Drawer Close Header */}
                    <div className={`flex md:hidden items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                          <LayoutDashboard size={14} />
                        </div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {language === 'ar' ? 'محاكي الطوارئ والمؤشرات' : 'Simulator & Controls'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSidebar(false)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
                        title={language === 'ar' ? 'إغلاق والعودة إلى روبرت' : 'Close and return to Robert'}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Simulation crisis & Persona selector panel */}
                <div className="mb-5 p-4 bg-violet-50/50 dark:bg-violet-950/15 rounded-2xl border border-violet-150/40 dark:border-violet-900/30 space-y-3.5 shadow-xs">
                  <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <Sparkles size={14} className="text-violet-600 dark:text-violet-400" />
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {language === 'ar' ? 'محاكي طوارئ الورشة والأعطال' : 'Workshop Crisis Simulator'}
                    </span>
                  </div>
                  
                  {/* Scenario Pills with Vector Icons */}
                  <div className="space-y-1">
                    <label className={`text-[9px] font-extrabold text-slate-400 dark:text-slate-500 block ${isRtl ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'سيناريو التشغيل الفعلي للمطابقة:' : 'Active Operational Scenario:'}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveScenario('normal')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                          activeScenario === 'normal'
                            ? 'bg-emerald-500 text-white border-transparent shadow-xs'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800 hover:border-emerald-500/40'
                        }`}
                      >
                        <CheckCircle2 size={12} className="shrink-0" />
                        <span>{language === 'ar' ? 'طبيعي متزن' : 'Balanced'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenario('parts-crisis')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                          activeScenario === 'parts-crisis'
                            ? 'bg-rose-500 text-white border-transparent shadow-xs'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800 hover:border-rose-500/40'
                        }`}
                      >
                        <AlertTriangle size={12} className="shrink-0" />
                        <span>{language === 'ar' ? 'أزمة توريد' : 'Parts Crisis'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenario('backlog-peak')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                          activeScenario === 'backlog-peak'
                            ? 'bg-amber-500 text-white border-transparent shadow-xs'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800 hover:border-amber-500/40'
                        }`}
                      >
                        <Zap size={12} className="shrink-0" />
                        <span>{language === 'ar' ? 'ذروة تكدس' : 'Backlog Peak'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenario('staff-shortage')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                          activeScenario === 'staff-shortage'
                            ? 'bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 text-white border-transparent shadow-xs'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800 hover:border-violet-500/40'
                        }`}
                      >
                        <Users size={12} className="shrink-0" />
                        <span>{language === 'ar' ? 'عجز بشري' : 'Staff Short'}</span>
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
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                          {agentsRegistry.map((agent) => {
                            const isAct = agent.isActive;
                            return (
                              <div 
                                key={agent.id}
                                className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 cursor-pointer group hover:border-violet-500/50 dark:hover:border-violet-400/50 hover:bg-slate-50/80 dark:hover:bg-[#161d33]/60 ${
                                  isAct 
                                    ? 'bg-white dark:bg-[#111526] border-slate-200/80 dark:border-slate-800/90 shadow-xs' 
                                    : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/40 dark:border-slate-800/40 opacity-70'
                                }`}
                                onClick={(e) => {
                                  const target = e.target as HTMLElement;
                                  if (target.closest('button')) return;
                                  handleOpenAgentChat(agent);
                                }}
                                title={language === 'ar' ? 'انقر لفتح نافذة الدردشة التفاعلية مع الوكيل' : 'Click to open interactive chat with this agent'}
                              >
                                <div className={`flex items-center justify-between gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                  <div className={`flex items-center gap-2.5 min-w-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    {renderAgentAvatarContainer(agent.id, agent.color, isAct, 'md', true)}
                                    <div className="text-left leading-tight min-w-0">
                                      <span className={`text-[10.5px] font-black block truncate ${isRtl ? 'text-right' : 'text-left'} ${
                                        isAct ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                                      }`}>
                                        {language === 'ar' ? agent.nameAr : agent.nameEn}
                                      </span>
                                      <div className={`flex items-center gap-1 mt-0.5 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
                                        <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 truncate">
                                          {agent.roles.join(' • ')}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Quick Action Buttons */}
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenAgentChat(agent);
                                      }}
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-violet-100 dark:bg-slate-800 dark:hover:bg-violet-950/60 text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300 transition-colors cursor-pointer"
                                      title={language === 'ar' ? 'محادثة فورية مع الوكيل' : 'Chat with Agent'}
                                    >
                                      <MessageSquare size={12} />
                                    </button>

                                    {/* Small Play/Pause Toggle Switch */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAgentActive(agent.id);
                                      }}
                                      className={`relative w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-hidden cursor-pointer ${
                                        isAct ? 'bg-gradient-to-r from-purple-600 to-indigo-500' : 'bg-slate-300 dark:bg-slate-700'
                                      }`}
                                      title={isAct 
                                        ? (language === 'ar' ? 'إيقاف الوكيل' : 'Stop Agent') 
                                        : (language === 'ar' ? 'تشغيل الوكيل' : 'Run Agent')
                                      }
                                    >
                                      <div 
                                        className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                                          isAct ? (isRtl ? '-translate-x-3.5' : 'translate-x-3.5') : 'translate-x-0'
                                        }`} 
                                      />
                                    </button>
                                  </div>
                                </div>

                                <p className={`text-[9px] leading-relaxed font-medium ${isRtl ? 'text-right' : 'text-left'} ${
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
                                      className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 p-0.5 px-1.5 rounded-full font-black text-[8px] flex items-center gap-0.5 cursor-help animate-fade-in"
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
                            className="flex items-center justify-center gap-1 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black cursor-pointer transition-all disabled:opacity-50 text-[9px] border border-transparent shadow-xs"
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
              </>
              )}

              {/* Chat Timeline Panel */}
              <div className="flex-1 flex flex-col min-h-0 bg-[#efeae2] dark:bg-[#0b141a] relative">
                
                {/* WhatsApp Messages Timeline */}
                <div
                  ref={pmScrollRef}
                  className="flex-1 overflow-y-auto p-3 md:p-5 space-y-3 bg-[#efeae2] dark:bg-[#0b141a] bg-opacity-95"
                >
                  {/* WhatsApp Floating Date Badge */}
                  <div className="flex justify-center my-1 select-none">
                    <span className="bg-white/85 dark:bg-[#182229]/90 text-[11px] font-bold text-[#54656f] dark:text-[#8696a0] px-3 py-1 rounded-lg shadow-2xs border border-black/5 dark:border-white/5">
                      {language === 'ar' ? 'اليوم' : 'TODAY'}
                    </span>
                  </div>

                  {/* WhatsApp Security Encryption Disclaimer */}
                  <div className="flex justify-center my-1 px-4 text-center select-none">
                    <span className="bg-[#ffeecd]/80 dark:bg-[#182229]/90 text-[10px] font-semibold text-[#54656f] dark:text-[#8696a0] px-3.5 py-1.5 rounded-lg shadow-2xs max-w-md border border-[#ffe6b3] dark:border-slate-800">
                      🔒 {language === 'ar' ? 'الرسائل مدعومة بالذكاء الاصطناعي مع اتصال مباشر بقاعدة بيانات الأسطول والمخزون.' : 'Messages are AI-powered with real-time fleet & inventory database sync.'}
                    </span>
                  </div>

                  {pmMessages.map((msg, i) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={i}
                        className={`flex flex-col ${isUser ? (isRtl ? 'items-start' : 'items-end') : (isRtl ? 'items-end' : 'items-start')} w-full`}
                      >
                        <div className={`p-3 md:px-4 md:py-2.5 leading-relaxed max-w-[88%] md:max-w-[75%] relative rounded-2xl shadow-xs transition-all ${
                          isUser 
                            ? `bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium ${isRtl ? 'rounded-tl-xs' : 'rounded-tr-xs'}` 
                            : `bg-white dark:bg-[#1a152d] text-slate-800 dark:text-slate-100 border border-purple-100/50 dark:border-purple-900/40 ${isRtl ? 'rounded-tr-xs' : 'rounded-tl-xs'}`
                        }`}>
                          {!isUser && (
                            <div className="flex items-center justify-between gap-2 pb-1 mb-1.5 border-b border-slate-100 dark:border-purple-900/30">
                              <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400">
                                {language === 'ar' ? 'روبرت - مدير الأسطول ⚡' : 'Robert - Fleet PM ⚡'}
                              </span>
                              <span className="text-[9px] bg-purple-100/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full font-bold">AI</span>
                            </div>
                          )}

                          <div className={`select-text ${getFontSizeClass(chatFontSize)} ${isUser ? (isRtl ? 'text-right' : 'text-left') : (isRtl ? 'text-right' : 'text-left')}`}>
                            {isUser ? msg.text : renderRichMessageText(msg.text, `pm-${i}`)}
                          </div>

                          {/* Render Attachment if present */}
                          {renderMessageAttachmentBadge(msg.attachment)}

                          <div className={`flex items-center gap-2 mt-1.5 pt-1.5 border-t ${isUser ? 'border-white/20 text-purple-100' : 'border-slate-100 dark:border-purple-900/30 text-slate-400 dark:text-slate-400'} text-[10px] select-none ${
                            isUser ? 'justify-end' : 'justify-between'
                          }`}>
                            {!isUser && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSpeakMessage(`pm-${i}`, msg.text)}
                                  className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 active:bg-purple-600 active:text-white rounded-md px-1.5 py-0.5 cursor-pointer transition-all"
                                >
                                  {activeAudioMessageId === `pm-${i}` && isPlayingAudio ? (
                                    <>
                                      <VolumeX size={12} className="text-rose-500 animate-bounce" />
                                      <span>{language === 'ar' ? 'إيقاف' : 'Mute'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 size={12} />
                                      <span>{language === 'ar' ? 'صوتي' : 'Audio'}</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.text);
                                  }}
                                  className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 active:bg-purple-600 active:text-white rounded-md px-1.5 py-0.5 cursor-pointer transition-all"
                                >
                                  <Copy size={12} />
                                  <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                                </button>

                                {Boolean(msg?.text && (msg.text.includes('صيانة') || msg.text.includes('إصلاح') || msg.text.includes('عطل') || msg.text.includes('فرامل') || msg.text.toLowerCase().includes('maintenance') || msg.text.toLowerCase().includes('repair'))) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuickOrderData({
                                        vehicleId: defaultVehicles[0]?.id || 'V1',
                                        category: 'mechanical',
                                        description: (msg?.text || '').slice(0, 150) + '...',
                                        technicianId: defaultTechnicians[0]?.id || 'T1',
                                        cost: '350'
                                      });
                                      setQuickOrderModalOpen(true);
                                    }}
                                    className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold hover:underline active:bg-purple-600 active:text-white rounded-md px-1.5 py-0.5 cursor-pointer transition-all"
                                  >
                                    <Wrench size={11} />
                                    <span>{language === 'ar' ? 'أمر صيانة' : 'Work Order'}</span>
                                  </button>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <span>{new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                              {isUser && <CheckCheck size={14} className="text-purple-200" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* When starting / 1 welcome message: Display Full-Screen Prompts */}
                  {pmMessages.length <= 1 && (
                    <div className="py-4 px-2 max-w-2xl mx-auto flex flex-col items-center justify-center text-center animate-fade-in">
                      <ModernAiBrandEmblem size={48} className="mb-3" />

                      <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
                        <span>{language === 'ar' ? 'مرحباً laheeb' : 'Hello laheeb'}</span>
                        <span className="text-xl animate-pulse">👋</span>
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-4 font-medium">
                        {language === 'ar' ? 'كيف يمكنني مساعدتك اليوم في إدارة الأسطول والورشة؟' : 'How can I help you today?'}
                      </p>

                      <div className="w-full bg-white dark:bg-[#1a152d] border border-purple-100 dark:border-purple-900/40 rounded-2xl shadow-xs overflow-hidden text-right mb-4 divide-y divide-purple-50 dark:divide-purple-900/20">
                        {((PROMPT_CATEGORIES_DATA as any)[selectedPromptCategory]?.prompts || PROMPT_CATEGORIES_DATA['for-you'].prompts).map((item: any, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handlePmSendMessage(language === 'ar' ? item.textAr : item.textEn)}
                            className={`w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-950/40 active:bg-purple-600 active:text-white text-slate-700 dark:text-slate-200 text-xs md:text-sm font-semibold transition-all flex items-center gap-3 cursor-pointer group ${
                              isRtl ? 'flex-row-reverse text-right' : 'text-left'
                            }`}
                          >
                            <Sparkles size={14} className="text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="flex-1 leading-snug">{language === 'ar' ? item.textAr : item.textEn}</span>
                          </button>
                        ))}
                      </div>

                      <div className="w-full flex items-center justify-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-wrap">
                        {Object.values(PROMPT_CATEGORIES_DATA).map((cat: any) => {
                          const isActive = selectedPromptCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setSelectedPromptCategory(cat.id)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                                isActive
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'bg-white/90 dark:bg-[#1a152d] text-slate-600 dark:text-slate-300 border border-purple-100 dark:border-purple-900/40 hover:bg-purple-50 active:bg-purple-600 active:text-white'
                              }`}
                            >
                              {cat.id === 'for-you' && <Sparkles size={11} className={isActive ? 'text-white' : 'text-purple-600'} />}
                              <span>{language === 'ar' ? cat.nameAr : cat.nameEn}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Typing status */}
                  {pmLoading && (
                    <div className={`flex ${isRtl ? 'justify-end' : 'justify-start'} w-full my-1`}>
                      <div className="bg-white dark:bg-[#1a152d] px-4 py-2.5 rounded-2xl rounded-tl-none border border-purple-100 dark:border-purple-900/30 flex items-center gap-2 shadow-xs">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold italic">
                          {language === 'ar' ? 'جاري التحليل والتخطيط...' : 'Robert is analyzing...'}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-bounce" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Chips Floating Row */}
                <div className="bg-gradient-to-r from-[#1c1032]/95 via-[#291747]/95 to-[#1f1138]/95 backdrop-blur-md px-3.5 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-b border-purple-400/20 shadow-inner">
                  {[
                    { textAr: 'فحص دوري للأسطول', textEn: 'Fleet Inspections', icon: '📋' },
                    { textAr: 'أوامر الصيانة المتأخرة', textEn: 'Overdue Orders', icon: '🚨' },
                    { textAr: 'الفنيين المتاحين للعمل', textEn: 'Available Techs', icon: '👨‍🔧' },
                    { textAr: 'تقرير الميزانية والوقود', textEn: 'Budget & Fuel', icon: '💰' }
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePmSendMessage(language === 'ar' ? chip.textAr : chip.textEn)}
                      disabled={pmLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/70 active:bg-purple-600 active:text-white active:scale-95 text-purple-100 text-[11px] font-bold shrink-0 shadow-xs border border-purple-400/25 backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer ring-1 ring-black/10"
                    >
                      <span>{chip.icon}</span>
                      <span>{language === 'ar' ? chip.textAr : chip.textEn}</span>
                    </button>
                  ))}
                </div>

                {/* Attachment Preview Bar above Input */}
                {renderAttachmentPreviewBar(pmAttachedFile, () => setPmAttachedFile(null))}

                {/* Brand Shadowed Purple Gradient Input Bar */}
                <div className="bg-gradient-to-r from-[#1e1136] via-[#2d184f] to-[#20123b] dark:from-[#130a24] dark:via-[#1f1038] dark:to-[#140b26] px-3 md:px-5 py-3 border-t border-purple-400/20 flex items-center gap-2 md:gap-3 shrink-0 z-20 shadow-2xl shadow-purple-950/40 backdrop-blur-md">
                  {/* Emoji / Quick Prompts Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                      className="p-2.5 bg-white/10 hover:bg-white/15 active:bg-purple-900 active:scale-95 text-purple-100 hover:text-white rounded-xl border border-purple-300/20 transition-all cursor-pointer shrink-0 shadow-xs"
                      title={language === 'ar' ? 'نماذج استفسارات' : 'Prompts'}
                    >
                      <Smile size={20} />
                    </button>

                    {isQuickActionsOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setIsQuickActionsOpen(false)} />
                        <div className={`absolute bottom-full mb-3 ${isRtl ? 'right-0' : 'left-0'} w-64 bg-white dark:bg-[#1f1738] rounded-2xl shadow-2xl p-2 z-40 border border-purple-100 dark:border-purple-800/40 space-y-1 text-xs font-bold animate-scale-in`}>
                          <div className="text-[10px] font-black text-purple-600 dark:text-purple-400 px-2 py-1 uppercase">
                            {language === 'ar' ? 'استفسارات فورية' : 'Quick Prompts'}
                          </div>
                          {PROMPT_CATEGORIES_DATA['for-you'].prompts.map((p: any, idx: number) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                handlePmSendMessage(language === 'ar' ? p.textAr : p.textEn);
                                setIsQuickActionsOpen(false);
                              }}
                              className={`w-full p-2 text-xs rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/50 active:bg-purple-600 active:text-white text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-2 transition-all ${
                                isRtl ? 'flex-row-reverse text-right' : 'text-left'
                              }`}
                            >
                              <Sparkles size={12} className="text-purple-600 dark:text-purple-400 shrink-0" />
                              <span className="truncate">{language === 'ar' ? p.textAr : p.textEn}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Attachment Button & Rich Attachment Menu */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                        pmAttachedFile
                          ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-400/40'
                          : 'bg-white/10 hover:bg-white/15 active:bg-purple-900 active:scale-95 text-purple-100 hover:text-white border-purple-300/20'
                      }`}
                      title={language === 'ar' ? 'إرفاق ملفات وصور وتقارير' : 'Attach files and reports'}
                    >
                      <Paperclip size={20} />
                    </button>

                    {showAttachMenu && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowAttachMenu(false)} />
                        <div className={`absolute bottom-full mb-3 ${isRtl ? 'right-0' : 'left-0'} w-64 bg-white dark:bg-[#1c1432] rounded-2xl shadow-2xl p-2 z-40 border border-purple-200 dark:border-purple-800/60 space-y-1 text-xs font-bold animate-scale-in`}>
                          <div className="text-[10px] font-black text-purple-600 dark:text-purple-400 px-2.5 py-1 uppercase tracking-wider border-b border-slate-100 dark:border-purple-900/30">
                            {language === 'ar' ? 'إرفاق ملف أو إجراء' : 'Attach File or Action'}
                          </div>

                          {/* Camera */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowAttachMenu(false);
                              handleTriggerCamera('pm');
                            }}
                            className={`w-full p-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/50 active:bg-purple-600 active:text-white rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                          >
                            <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center shrink-0">
                              <Camera size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-xs">{language === 'ar' ? 'التقاط صورة بالكاميرا' : 'Take Camera Photo'}</p>
                              <p className="text-[9px] text-slate-400">{language === 'ar' ? 'تصوير مباشر للأعطال والقطع' : 'Live photo of truck or part'}</p>
                            </div>
                          </button>

                          {/* Gallery / Image Upload */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowAttachMenu(false);
                              handleTriggerImageUpload('pm');
                            }}
                            className={`w-full p-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/50 active:bg-purple-600 active:text-white rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                          >
                            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                              <ImageIcon size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-xs">{language === 'ar' ? 'رفع صورة / مخطط' : 'Upload Image'}</p>
                              <p className="text-[9px] text-slate-400">{language === 'ar' ? 'PNG, JPG, WEBP' : 'PNG, JPG, WEBP'}</p>
                            </div>
                          </button>

                          {/* Documents Upload */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowAttachMenu(false);
                              handleTriggerDocumentUpload('pm');
                            }}
                            className={`w-full p-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/50 active:bg-purple-600 active:text-white rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                          >
                            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                              <FileText size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-xs">{language === 'ar' ? 'إرفاق مستند / PDF' : 'Upload Document / PDF'}</p>
                              <p className="text-[9px] text-slate-400">{language === 'ar' ? 'PDF, DOCX, XLSX, TXT' : 'PDF, DOCX, XLSX, TXT'}</p>
                            </div>
                          </button>

                          {/* Quick Work Order */}
                          <button
                            type="button"
                            onClick={() => {
                              setQuickOrderModalOpen(true);
                              setShowAttachMenu(false);
                            }}
                            className={`w-full p-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/50 active:bg-purple-600 active:text-white rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border-t border-slate-100 dark:border-purple-900/30 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                          >
                            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                              <Wrench size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-xs">{language === 'ar' ? 'إنشاء أمر صيانة فوري' : 'Create Work Order'}</p>
                              <p className="text-[9px] text-slate-400">{language === 'ar' ? 'إسناد فني وتحديد تكلفة' : 'Assign tech & parts'}</p>
                            </div>
                          </button>

                          {/* Fleet Report */}
                          <button
                            type="button"
                            onClick={() => {
                              handlePmSendMessage(language === 'ar' ? 'تقرير حالة أسطول المركبات والفحص الدوري' : 'Vehicle inspection & periodic maintenance summary');
                              setShowAttachMenu(false);
                            }}
                            className={`w-full p-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/50 active:bg-purple-600 active:text-white rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                          >
                            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
                              <FileSpreadsheet size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-xs">{language === 'ar' ? 'توليد تقرير أداء فوري' : 'Generate Fleet Report'}</p>
                              <p className="text-[9px] text-slate-400">{language === 'ar' ? 'جاهزية الأسطول والتكاليف' : 'Fleet readiness metrics'}</p>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* If voice recording active, show live waveform banner; else show text input */}
                  {isVoiceRecording && voiceRecordingTarget === 'pm' ? (
                    renderVoiceRecordingBanner('pm')
                  ) : (
                    <div className="flex-1 bg-purple-950/40 dark:bg-black/50 rounded-2xl px-4 py-2.5 text-sm flex items-center border border-purple-300/25 dark:border-purple-500/20 focus-within:border-purple-300/60 focus-within:bg-purple-950/60 focus-within:ring-2 focus-within:ring-purple-400/30 backdrop-blur-xs shadow-inner transition-all">
                      <input
                        type="text"
                        value={pmInput}
                        onChange={(e) => setPmInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handlePmSendMessage();
                          }
                        }}
                        placeholder={language === 'ar' ? 'اكتب رسالة لـ روبرت أو اضغط المايك للتسجيل...' : 'Type a message or tap mic to record...'}
                        className={`w-full bg-transparent border-0 outline-none text-white placeholder:text-purple-200/60 ${
                          isRtl ? 'text-right' : 'text-left'
                        }`}
                      />
                    </div>
                  )}

                  {/* Circular Purple Brand Action Button (Send / Mic) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isVoiceRecording && voiceRecordingTarget === 'pm') {
                        handleStopRealVoiceRecording(true);
                      } else if (pmInput.trim() || pmAttachedFile) {
                        handlePmSendMessage();
                      } else {
                        handleStartRealVoiceRecording('pm');
                      }
                    }}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-950/50 border transition-all shrink-0 cursor-pointer ${
                      isVoiceRecording && voiceRecordingTarget === 'pm'
                        ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 animate-pulse'
                        : (pmInput.trim() || pmAttachedFile)
                        ? 'bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-600 hover:brightness-110 active:scale-95 text-white border-purple-300/30'
                        : 'bg-white/10 hover:bg-white/20 active:scale-95 text-purple-100 hover:text-white border-purple-300/20'
                    }`}
                    title={
                      isVoiceRecording && voiceRecordingTarget === 'pm'
                        ? (language === 'ar' ? 'إنهاء وإرسال التسجيل' : 'Finish & Send Recording')
                        : (pmInput.trim() || pmAttachedFile)
                        ? (language === 'ar' ? 'إرسال' : 'Send')
                        : (language === 'ar' ? 'بدء التسجيل الصوتي' : 'Start Voice Recording')
                    }
                  >
                    {isVoiceRecording && voiceRecordingTarget === 'pm' ? (
                      <Check size={18} />
                    ) : (pmInput.trim() || pmAttachedFile) ? (
                      <Send size={18} className={isRtl ? 'rotate-180' : ''} />
                    ) : (
                      <Mic size={18} className={isVoiceRecording ? 'text-rose-500 animate-pulse' : ''} />
                    )}
                  </button>
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
                <>
                  {/* Mobile Backdrop Overlay */}
                  <div 
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
                    onClick={() => setShowSidebar(false)}
                  />

                  <div className={`fixed inset-y-0 z-50 w-[88vw] max-w-sm bg-white dark:bg-[#0c101d] shadow-2xl overflow-y-auto p-5 md:static md:w-80 md:z-auto md:shadow-none md:bg-slate-50/60 md:dark:bg-[#090d18] flex flex-col shrink-0 ${
                    isRtl ? 'right-0 md:order-last md:border-l border-slate-200 dark:border-slate-850' : 'left-0 md:border-r border-slate-200 dark:border-slate-850'
                  }`}>
                    {/* Mobile Drawer Close Header */}
                    <div className={`flex md:hidden items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <Wrench size={14} />
                        </div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {language === 'ar' ? 'محاكي طوارئ الصيانة والقطع' : 'Maintenance Simulator'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSidebar(false)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
                        title={language === 'ar' ? 'إغلاق والعودة إلى مساعد الصيانة' : 'Close and return to Mechanic'}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Simulation crisis & Persona selector panel for Mechanic */}
                <div className="mb-5 p-4 bg-amber-50/40 dark:bg-amber-950/10 rounded-2xl border border-amber-150/40 dark:border-amber-900/30 space-y-3.5 shadow-xs">
                  <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <Wrench size={14} className="text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {language === 'ar' ? 'محاكي طوارئ الصيانة والقطع' : 'Workshop Crisis Simulator'}
                    </span>
                  </div>
                  
                  {/* Scenario Pills with Vector Icons */}
                  <div className="space-y-1">
                    <label className={`text-[9px] font-extrabold text-slate-400 dark:text-slate-500 block ${isRtl ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'سيناريو التشغيل الفعلي للمطابقة:' : 'Active Operational Scenario:'}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveScenario('normal')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                          activeScenario === 'normal'
                            ? 'bg-emerald-500 text-white border-transparent shadow-xs'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800 hover:border-emerald-500/40'
                        }`}
                      >
                        <CheckCircle2 size={12} className="shrink-0" />
                        <span>{language === 'ar' ? 'طبيعي متزن' : 'Balanced'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenario('parts-crisis')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                          activeScenario === 'parts-crisis'
                            ? 'bg-rose-500 text-white border-transparent shadow-xs'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800 hover:border-rose-500/40'
                        }`}
                      >
                        <AlertTriangle size={12} className="shrink-0" />
                        <span>{language === 'ar' ? 'أزمة توريد' : 'Parts Crisis'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenario('backlog-peak')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                          activeScenario === 'backlog-peak'
                            ? 'bg-amber-500 text-white border-transparent shadow-xs'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800 hover:border-amber-500/40'
                        }`}
                      >
                        <Zap size={12} className="shrink-0" />
                        <span>{language === 'ar' ? 'ذروة تكدس' : 'Backlog Peak'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenario('staff-shortage')}
                        className={`p-2 text-[9px] font-extrabold rounded-xl transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                          activeScenario === 'staff-shortage'
                            ? 'bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 text-white border-transparent shadow-xs'
                            : 'bg-white dark:bg-[#121829] text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800 hover:border-violet-500/40'
                        }`}
                      >
                        <Users size={12} className="shrink-0" />
                        <span>{language === 'ar' ? 'عجز بشري' : 'Staff Short'}</span>
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
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                          {agentsRegistry.map((agent) => {
                            const isAct = agent.isActive;
                            return (
                              <div 
                                key={agent.id}
                                className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 cursor-pointer group hover:border-violet-500/50 dark:hover:border-violet-400/50 hover:bg-slate-50/80 dark:hover:bg-[#161d33]/60 ${
                                  isAct 
                                    ? 'bg-white dark:bg-[#111526] border-slate-200/80 dark:border-slate-800/90 shadow-xs' 
                                    : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/40 dark:border-slate-800/40 opacity-70'
                                }`}
                                onClick={(e) => {
                                  const target = e.target as HTMLElement;
                                  if (target.closest('button')) return;
                                  handleOpenAgentChat(agent);
                                }}
                                title={language === 'ar' ? 'انقر لفتح نافذة الدردشة التفاعلية مع الوكيل' : 'Click to open interactive chat with this agent'}
                              >
                                <div className={`flex items-center justify-between gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                  <div className={`flex items-center gap-2.5 min-w-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    {renderAgentAvatarContainer(agent.id, agent.color, isAct, 'md', true)}
                                    <div className="text-left leading-tight min-w-0">
                                      <span className={`text-[10.5px] font-black block truncate ${isRtl ? 'text-right' : 'text-left'} ${
                                        isAct ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                                      }`}>
                                        {language === 'ar' ? agent.nameAr : agent.nameEn}
                                      </span>
                                      <div className={`flex items-center gap-1 mt-0.5 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
                                        <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 truncate">
                                          {agent.roles.join(' • ')}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Quick Action Buttons */}
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenAgentChat(agent);
                                      }}
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-violet-100 dark:bg-slate-800 dark:hover:bg-violet-950/60 text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300 transition-colors cursor-pointer"
                                      title={language === 'ar' ? 'محادثة فورية مع الوكيل' : 'Chat with Agent'}
                                    >
                                      <MessageSquare size={12} />
                                    </button>

                                    {/* Small Play/Pause Toggle Switch */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAgentActive(agent.id);
                                      }}
                                      className={`relative w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-hidden cursor-pointer ${
                                        isAct ? 'bg-gradient-to-r from-purple-600 to-indigo-500' : 'bg-slate-300 dark:bg-slate-700'
                                      }`}
                                      title={isAct 
                                        ? (language === 'ar' ? 'إيقاف الوكيل' : 'Stop Agent') 
                                        : (language === 'ar' ? 'تشغيل الوكيل' : 'Run Agent')
                                      }
                                    >
                                      <div 
                                        className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                                          isAct ? (isRtl ? '-translate-x-3.5' : 'translate-x-3.5') : 'translate-x-0'
                                        }`} 
                                      />
                                    </button>
                                  </div>
                                </div>

                                <p className={`text-[9px] leading-relaxed font-medium ${isRtl ? 'text-right' : 'text-left'} ${
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
              </>
              )}

              {/* Chat Timeline Panel for Mechanic */}
              <div className="flex-1 flex flex-col min-h-0 bg-[#efeae2] dark:bg-[#0b141a] relative">
                
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
                        className="w-full px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer transition-all"
                      >
                        {language === 'ar' ? 'تفعيل وتشغيل مساعد الصيانة' : 'Activate Assistant Now'}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Timeline Messages Area */}
                <div
                  ref={mechScrollRef}
                  className="flex-1 overflow-y-auto p-3 md:p-5 space-y-3 bg-[#efeae2] dark:bg-[#0b141a] bg-opacity-95"
                  style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 80%)`
                  }}
                >
                  {mechMessages.map((msg, i) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id || i}
                        className={`flex flex-col ${isUser ? (isRtl ? 'items-start' : 'items-end') : (isRtl ? 'items-end' : 'items-start')} w-full`}
                      >
                        {/* WhatsApp-style bubble */}
                        <div className={`p-3 md:p-4 leading-relaxed max-w-[88%] md:max-w-[75%] relative shadow-xs transition-all ${
                          isUser 
                            ? `bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-2xl ${isRtl ? 'rounded-tl-xs' : 'rounded-tr-xs'}` 
                            : `bg-white dark:bg-[#1a152d] text-slate-800 dark:text-slate-100 rounded-2xl border border-purple-100/50 dark:border-purple-900/40 font-medium ${isRtl ? 'rounded-tr-xs' : 'rounded-tl-xs'}`
                        }`}>
                          <div className={`select-text ${getFontSizeClass(chatFontSize)} ${isRtl ? 'text-right' : 'text-left'}`}>
                            {isUser ? msg.text : renderRichMessageText(msg.text, `mech-${msg.id || i}`)}
                          </div>

                          {/* Render Attachment if present */}
                          {renderMessageAttachmentBadge(msg.attachment)}

                          {!isUser && (
                            <div className="flex items-center gap-2.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-purple-900/30 text-[10px] text-slate-400 font-bold select-none">
                              <button
                                type="button"
                                onClick={() => handleToggleSpeakMessage(`mech-${msg.id || i}`, msg.text)}
                                className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 active:bg-purple-600 active:text-white rounded-md px-1.5 py-0.5 cursor-pointer transition-all"
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
                                className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 active:bg-purple-600 active:text-white rounded-md px-1.5 py-0.5 cursor-pointer transition-all"
                              >
                                <Copy size={12} />
                                <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                              </button>

                              {Boolean(msg?.text && (msg.text.includes('صيانة') || msg.text.includes('إصلاح') || msg.text.includes('عطل') || msg.text.includes('فرامل') || msg.text.toLowerCase().includes('maintenance') || msg.text.toLowerCase().includes('repair'))) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuickOrderData({
                                      vehicleId: defaultVehicles[0]?.id || 'V1',
                                      category: 'mechanical',
                                      description: (msg?.text || '').slice(0, 150) + '...',
                                      technicianId: defaultTechnicians[0]?.id || 'T1',
                                      cost: '350'
                                    });
                                    setQuickOrderModalOpen(true);
                                  }}
                                  className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline active:bg-purple-600 active:text-white rounded-md px-1.5 py-0.5 cursor-pointer transition-all ml-auto mr-auto"
                                >
                                  <Wrench size={12} />
                                  <span>{language === 'ar' ? '⚙️ أمر صيانة فوري' : '⚙️ Work Order'}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Welcome Prompts */}
                  {mechMessages.length <= 1 && (
                    <div className="py-6 px-2 max-w-2xl mx-auto flex flex-col items-center justify-center text-center animate-fade-in">
                      <ModernAiBrandEmblem size={52} className="mb-3" />
                      <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
                        <span>{language === 'ar' ? 'مساعد الصيانة والقطع الذكي' : 'Smart Workshop Assistant'}</span>
                        <span className="text-xl">🔧</span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 font-medium">
                        {language === 'ar' ? 'استفسر عن توفر القطع، تشخيص الأعطال، أو توليد أوامر الصيانة الفورية' : 'Query inventory, diagnose vehicle faults, or issue work orders'}
                      </p>

                      <div className="w-full bg-white dark:bg-[#1a152d] border border-purple-100 dark:border-purple-900/40 rounded-2xl shadow-xs overflow-hidden text-right mb-4 divide-y divide-purple-50 dark:divide-purple-900/20">
                        {((PROMPT_CATEGORIES_DATA as any)[selectedPromptCategory]?.prompts || PROMPT_CATEGORIES_DATA['parts'].prompts).map((item: any, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleMechSendMessage(language === 'ar' ? item.textAr : item.textEn)}
                            className={`w-full px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-950/40 active:bg-purple-600 active:text-white text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer group ${
                              isRtl ? 'flex-row-reverse text-right' : 'text-left'
                            }`}
                          >
                            <Sparkles size={14} className="text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="flex-1 leading-snug">{language === 'ar' ? item.textAr : item.textEn}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Loading status */}
                  {mechLoading && (
                    <div className="flex justify-start w-full">
                      <div className="bg-white dark:bg-[#1a152d] p-3 rounded-2xl rounded-tl-none border border-purple-100 dark:border-purple-900/30 flex items-center gap-3 shadow-xs">
                        <div className="flex gap-1.5">
                          <motion.div 
                            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-1.5 h-1.5 bg-purple-500 rounded-full" 
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="w-1.5 h-1.5 bg-purple-500 rounded-full" 
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="w-1.5 h-1.5 bg-purple-500 rounded-full" 
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold select-none">
                          {language === 'ar' ? 'جاري الاستعلام ومطابقة القطع بالمستودع...' : 'Searching parts catalogs and matching safety quantities...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Chips Floating Row */}
                <div className="bg-gradient-to-r from-[#1c1032]/95 via-[#291747]/95 to-[#1f1138]/95 backdrop-blur-md px-3.5 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-b border-purple-400/20 shadow-inner">
                  {[
                    { textAr: 'فحص دوري للمحرك والفرامل', textEn: 'Brakes & Engine Check', icon: '🔧' },
                    { textAr: 'كتالوج قطع غيار تويوتا وهينو', textEn: 'Parts Catalog Search', icon: '📦' },
                    { textAr: 'توليد أمر صيانة عاجل', textEn: 'Quick Work Order', icon: '⚡' },
                    { textAr: 'تشخيص الأعطال الشائعة', textEn: 'Diagnostic Troubles', icon: '🔍' }
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleMechSendMessage(language === 'ar' ? chip.textAr : chip.textEn)}
                      disabled={mechLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/70 active:bg-purple-600 active:text-white active:scale-95 text-purple-100 text-[11px] font-bold shrink-0 shadow-xs border border-purple-400/25 backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer ring-1 ring-black/10"
                    >
                      <span>{chip.icon}</span>
                      <span>{language === 'ar' ? chip.textAr : chip.textEn}</span>
                    </button>
                  ))}
                </div>

                {/* Attachment Preview Bar above Mechanic Input */}
                {renderAttachmentPreviewBar(mechAttachedFile, () => setMechAttachedFile(null))}

                {/* Brand Shadowed Purple Gradient Input Bar */}
                <div className="bg-gradient-to-r from-[#1e1136] via-[#2d184f] to-[#20123b] dark:from-[#130a24] dark:via-[#1f1038] dark:to-[#140b26] px-3 md:px-5 py-3 border-t border-purple-400/20 flex items-center gap-2 md:gap-3 shrink-0 z-20 shadow-2xl shadow-purple-950/40 backdrop-blur-md">
                  {/* Emoji / Quick Prompts Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                      className="p-2.5 bg-white/10 hover:bg-white/15 active:bg-purple-900 active:scale-95 text-purple-100 hover:text-white rounded-xl border border-purple-300/20 transition-all cursor-pointer shrink-0 shadow-xs"
                      title={language === 'ar' ? 'نماذج استفسارات' : 'Prompts'}
                    >
                      <Smile size={20} />
                    </button>

                    {isQuickActionsOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setIsQuickActionsOpen(false)} />
                        <div className={`absolute bottom-full mb-3 ${isRtl ? 'right-0' : 'left-0'} w-64 bg-white dark:bg-[#1f1738] rounded-2xl shadow-2xl p-2 z-40 border border-purple-100 dark:border-purple-800/40 space-y-1 text-xs font-bold animate-scale-in`}>
                          <div className="text-[10px] font-black text-purple-600 dark:text-purple-400 px-2 py-1 uppercase">
                            {language === 'ar' ? 'اختصارات الصيانة' : 'Quick Prompts'}
                          </div>
                          {PROMPT_CATEGORIES_DATA['parts'].prompts.map((p: any, idx: number) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                handleMechSendMessage(language === 'ar' ? p.textAr : p.textEn);
                                setIsQuickActionsOpen(false);
                              }}
                              className={`w-full p-2 text-xs rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/50 active:bg-purple-600 active:text-white text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-2 transition-all ${
                                isRtl ? 'flex-row-reverse text-right' : 'text-left'
                              }`}
                            >
                              <Sparkles size={12} className="text-purple-600 dark:text-purple-400 shrink-0" />
                              <span className="truncate">{language === 'ar' ? p.textAr : p.textEn}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Attachment Button & Rich Menu for Mechanic */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowMechAttachMenu(!showMechAttachMenu)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                        mechAttachedFile
                          ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-400/40'
                          : 'bg-white/10 hover:bg-white/15 active:bg-purple-900 active:scale-95 text-purple-100 hover:text-white border-purple-300/20'
                      }`}
                      title={language === 'ar' ? 'إرفاق صور الأعطال والمخططات والملفات' : 'Attach diagnostic files & photos'}
                    >
                      <Paperclip size={20} />
                    </button>

                    {showMechAttachMenu && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowMechAttachMenu(false)} />
                        <div className={`absolute bottom-full mb-3 ${isRtl ? 'right-0' : 'left-0'} w-64 bg-white dark:bg-[#1c1432] rounded-2xl shadow-2xl p-2 z-40 border border-purple-200 dark:border-purple-800/60 space-y-1 text-xs font-bold animate-scale-in`}>
                          <div className="text-[10px] font-black text-purple-600 dark:text-purple-400 px-2.5 py-1 uppercase tracking-wider border-b border-slate-100 dark:border-purple-900/30">
                            {language === 'ar' ? 'إرفاق فني ومستندات' : 'Attach Diagnostic Item'}
                          </div>

                          {/* Camera */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowMechAttachMenu(false);
                              handleTriggerCamera('mech');
                            }}
                            className={`w-full p-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/50 active:bg-purple-600 active:text-white rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                          >
                            <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center shrink-0">
                              <Camera size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-xs">{language === 'ar' ? 'تصوير العطل بالكاميرا' : 'Take Photo of Fault'}</p>
                              <p className="text-[9px] text-slate-400">{language === 'ar' ? 'تصوير فوري للشاحنة أو القطعة' : 'Instant snapshot of component'}</p>
                            </div>
                          </button>

                          {/* Image / Part Blueprint Upload */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowMechAttachMenu(false);
                              handleTriggerImageUpload('mech');
                            }}
                            className={`w-full p-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/50 active:bg-purple-600 active:text-white rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                          >
                            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                              <ImageIcon size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-xs">{language === 'ar' ? 'رفع مخطط / صورة قطعة' : 'Upload Part / Diagram'}</p>
                              <p className="text-[9px] text-slate-400">{language === 'ar' ? 'PNG, JPG, WEBP' : 'PNG, JPG, WEBP'}</p>
                            </div>
                          </button>

                          {/* Document Upload */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowMechAttachMenu(false);
                              handleTriggerDocumentUpload('mech');
                            }}
                            className={`w-full p-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/50 active:bg-purple-600 active:text-white rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                          >
                            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                              <FileText size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-xs">{language === 'ar' ? 'كتالوج صيانة / PDF' : 'Maintenance Manual / PDF'}</p>
                              <p className="text-[9px] text-slate-400">{language === 'ar' ? 'PDF, DOCX, XLSX, TXT' : 'PDF, DOCX, XLSX, TXT'}</p>
                            </div>
                          </button>

                          {/* Quick Work Order */}
                          <button
                            type="button"
                            onClick={() => {
                              setQuickOrderData({
                                vehicleId: defaultVehicles[0]?.id || 'V1',
                                category: 'mechanical',
                                description: 'طلب فحص وصيانة سريعة من المحادثة',
                                technicianId: defaultTechnicians[0]?.id || 'T1',
                                cost: '300'
                              });
                              setQuickOrderModalOpen(true);
                              setShowMechAttachMenu(false);
                            }}
                            className={`w-full p-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/50 active:bg-purple-600 active:text-white rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border-t border-slate-100 dark:border-purple-900/30 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                          >
                            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                              <Wrench size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-xs">{language === 'ar' ? 'أمر صيانة فوري' : 'Work Order'}</p>
                              <p className="text-[9px] text-slate-400">{language === 'ar' ? 'تسجيل أمر فحص عاجل' : 'Dispatch quick work order'}</p>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* If voice recording active, show live waveform banner; else show text input */}
                  {isVoiceRecording && voiceRecordingTarget === 'mech' ? (
                    renderVoiceRecordingBanner('mech')
                  ) : (
                    <div className="flex-1 bg-purple-950/40 dark:bg-black/50 rounded-2xl px-4 py-2.5 text-sm flex items-center border border-purple-300/25 dark:border-purple-500/20 focus-within:border-purple-300/60 focus-within:bg-purple-950/60 focus-within:ring-2 focus-within:ring-purple-400/30 backdrop-blur-xs shadow-inner transition-all">
                      <input
                        type="text"
                        value={mechInput}
                        onChange={(e) => setMechInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleMechSendMessage();
                          }
                        }}
                        placeholder={language === 'ar' ? 'استفسر عن قطع الغيار أو اضغط المايك للتسجيل...' : 'Ask about parts or tap mic to record...'}
                        className={`w-full bg-transparent border-0 outline-none text-white placeholder:text-purple-200/60 ${
                          isRtl ? 'text-right' : 'text-left'
                        }`}
                      />
                    </div>
                  )}

                  {/* Circular Purple Brand Action Button (Send / Mic) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isVoiceRecording && voiceRecordingTarget === 'mech') {
                        handleStopRealVoiceRecording(true);
                      } else if (mechInput.trim() || mechAttachedFile) {
                        handleMechSendMessage();
                      } else {
                        handleStartRealVoiceRecording('mech');
                      }
                    }}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-950/50 border transition-all shrink-0 cursor-pointer ${
                      isVoiceRecording && voiceRecordingTarget === 'mech'
                        ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 animate-pulse'
                        : (mechInput.trim() || mechAttachedFile)
                        ? 'bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-600 hover:brightness-110 active:scale-95 text-white border-purple-300/30'
                        : 'bg-white/10 hover:bg-white/20 active:scale-95 text-purple-100 hover:text-white border-purple-300/20'
                    }`}
                    title={
                      isVoiceRecording && voiceRecordingTarget === 'mech'
                        ? (language === 'ar' ? 'إنهاء وإرسال التسجيل' : 'Finish & Send Recording')
                        : (mechInput.trim() || mechAttachedFile)
                        ? (language === 'ar' ? 'إرسال' : 'Send')
                        : (language === 'ar' ? 'بدء التسجيل الصوتي' : 'Start Voice Recording')
                    }
                  >
                    {isVoiceRecording && voiceRecordingTarget === 'mech' ? (
                      <Check size={18} />
                    ) : (mechInput.trim() || mechAttachedFile) ? (
                      <Send size={18} className={isRtl ? 'rotate-180' : ''} />
                    ) : (
                      <Mic size={18} className={isVoiceRecording ? 'text-rose-500 animate-pulse' : ''} />
                    )}
                  </button>
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
                <>
                  {/* Mobile Backdrop Overlay */}
                  <div 
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
                    onClick={() => setShowSidebar(false)}
                  />

                  <div className={`fixed inset-y-0 z-50 w-[88vw] max-w-sm bg-white dark:bg-[#0c101d] shadow-2xl overflow-y-auto p-5 md:static md:w-80 md:z-auto md:shadow-none md:bg-slate-50/60 md:dark:bg-[#090d18] flex flex-col shrink-0 ${
                    isRtl ? 'right-0 md:order-last md:border-l border-slate-200 dark:border-slate-850' : 'left-0 md:border-r border-slate-200 dark:border-slate-850'
                  }`}>
                    {/* Mobile Drawer Close Header */}
                    <div className={`flex md:hidden items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <Bot size={14} />
                        </div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {language === 'ar' ? 'غرفة محاكاة الطوارئ الموحدة' : 'Unified Control Room'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSidebar(false)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
                        title={language === 'ar' ? 'إغلاق والعودة إلى المحادثة' : 'Close and return'}
                      >
                        <X size={16} />
                      </button>
                    </div>

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
              </>
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

                    {/* Sidebar Toggle Button with Active Scenario Indicator */}
                    <button
                      type="button"
                      onClick={handleToggleSidebar}
                      className={`p-1.5 md:p-2 md:px-3 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border ${
                        showSidebar
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-emerald-50/80 border-emerald-200/80 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300'
                      }`}
                      title={language === 'ar' ? 'غرفة محاكاة الطوارئ الموحدة وبطاقات الوكلاء' : 'Simulator & Metrics'}
                    >
                      <LayoutDashboard size={14} className="shrink-0" />
                      <span className="text-[11px] font-extrabold flex items-center gap-1">
                        <span className="hidden sm:inline">{language === 'ar' ? 'المحاكاة:' : 'Sim:'}</span>
                        <span>
                          {activeScenario === 'normal' && (language === 'ar' ? 'متزن' : 'Balanced')}
                          {activeScenario === 'parts-crisis' && (language === 'ar' ? 'أزمة توريد' : 'Crisis')}
                          {activeScenario === 'backlog-peak' && (language === 'ar' ? 'ذروة تكدس' : 'Peak')}
                          {activeScenario === 'staff-shortage' && (language === 'ar' ? 'عجز بشري' : 'Shortage')}
                        </span>
                      </span>
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
                            <div>{msg.text}</div>
                            {renderMessageAttachmentBadge(msg.attachment)}
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

                {/* Attachment Preview Bar above CoPilot Input */}
                {renderAttachmentPreviewBar(coPilotAttachedFile, () => setCoPilotAttachedFile(null))}

                {/* Co-Pilot Input Bar */}
                <div className="p-3 md:p-4 bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-emerald-950/20 dark:bg-[#0c101d] border-t border-emerald-500/20 dark:border-emerald-500/15 shrink-0 backdrop-blur-md">
                  <div className="flex items-center gap-2 bg-white/80 dark:bg-[#121829]/90 border border-emerald-500/30 dark:border-emerald-500/20 p-2 rounded-2xl shadow-lg focus-within:ring-2 focus-within:ring-emerald-400/30 transition-all">
                    {/* Attachment Button & Menu */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowCoPilotAttachMenu(!showCoPilotAttachMenu)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          coPilotAttachedFile
                            ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/40'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                        }`}
                        title={language === 'ar' ? 'إرفاق ملف أو صورة' : 'Attach file'}
                      >
                        <Paperclip size={18} />
                      </button>

                      {showCoPilotAttachMenu && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setShowCoPilotAttachMenu(false)} />
                          <div className={`absolute bottom-full mb-3 ${isRtl ? 'right-0' : 'left-0'} w-60 bg-white dark:bg-[#131b30] rounded-2xl shadow-2xl p-2 z-40 border border-emerald-200 dark:border-emerald-800/60 space-y-1 text-xs font-bold animate-scale-in`}>
                            <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 px-2.5 py-1 uppercase border-b border-slate-100 dark:border-slate-800">
                              {language === 'ar' ? 'إرفاق مستند أو صورة' : 'Attach File'}
                            </div>

                            {/* Camera */}
                            <button
                              type="button"
                              onClick={() => {
                                setShowCoPilotAttachMenu(false);
                                handleTriggerCamera('copilot');
                              }}
                              className={`w-full p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center shrink-0">
                                <Camera size={15} />
                              </div>
                              <span className="font-bold text-xs">{language === 'ar' ? 'التقاط بالكاميرا' : 'Camera'}</span>
                            </button>

                            {/* Gallery / Image */}
                            <button
                              type="button"
                              onClick={() => {
                                setShowCoPilotAttachMenu(false);
                                handleTriggerImageUpload('copilot');
                              }}
                              className={`w-full p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                                <ImageIcon size={15} />
                              </div>
                              <span className="font-bold text-xs">{language === 'ar' ? 'رفع صورة / مخطط' : 'Upload Image'}</span>
                            </button>

                            {/* Document */}
                            <button
                              type="button"
                              onClick={() => {
                                setShowCoPilotAttachMenu(false);
                                handleTriggerDocumentUpload('copilot');
                              }}
                              className={`w-full p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                                <FileText size={15} />
                              </div>
                              <span className="font-bold text-xs">{language === 'ar' ? 'إرفاق ملف / PDF' : 'Upload Document'}</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* If voice recording is active */}
                    {isVoiceRecording && voiceRecordingTarget === 'copilot' ? (
                      renderVoiceRecordingBanner('copilot')
                    ) : (
                      <input
                        type="text"
                        value={coPilotInput}
                        onChange={(e) => setCoPilotInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleCoPilotSendMessage();
                          }
                        }}
                        disabled={coPilotLoading}
                        placeholder={language === 'ar' ? 'اكتب سؤالاً موجهاً للمساعد المشترك أو اضغط المايك...' : 'Ask the co-pilot joint command or tap mic...'}
                        className="flex-1 bg-transparent px-3 py-2 outline-hidden text-xs md:text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-400"
                      />
                    )}
                    
                    {/* Action button (Send / Mic / Confirm Recording) */}
                    <button 
                      type="button"
                      onClick={() => {
                        if (isVoiceRecording && voiceRecordingTarget === 'copilot') {
                          handleStopRealVoiceRecording(true);
                        } else if (coPilotInput.trim() || coPilotAttachedFile) {
                          handleCoPilotSendMessage();
                        } else {
                          handleStartRealVoiceRecording('copilot');
                        }
                      }}
                      disabled={coPilotLoading}
                      className={`p-3 rounded-xl shadow-md transition-all cursor-pointer shrink-0 ${
                        isVoiceRecording && voiceRecordingTarget === 'copilot'
                          ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                          : (coPilotInput.trim() || coPilotAttachedFile)
                          ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 active:scale-95 text-white'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300'
                      }`}
                      title={
                        isVoiceRecording && voiceRecordingTarget === 'copilot'
                          ? (language === 'ar' ? 'إنهاء وإرسال التسجيل' : 'Finish & Send Recording')
                          : (coPilotInput.trim() || coPilotAttachedFile)
                          ? (language === 'ar' ? 'إرسال' : 'Send')
                          : (language === 'ar' ? 'تسجيل صوتي' : 'Voice')
                      }
                    >
                      {isVoiceRecording && voiceRecordingTarget === 'copilot' ? (
                        <Check size={16} />
                      ) : (coPilotInput.trim() || coPilotAttachedFile) ? (
                        <Send size={16} className={isRtl ? 'rotate-180' : ''} />
                      ) : (
                        <Mic size={16} className={isVoiceRecording ? 'text-rose-500 animate-pulse' : ''} />
                      )}
                    </button>
                  </div>
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
                    {/* Dynamic Vector Icon Avatar */}
                    {renderAgentAvatarContainer(activeChatAgent.id, activeChatAgent.color, activeChatAgent.isActive, 'lg', true)}
                    <div>
                      <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                          {language === 'ar' ? activeChatAgent.nameAr : activeChatAgent.nameEn}
                        </h3>
                        {/* Active Status Badge with Icon */}
                        <span className="text-[9px] px-2.5 py-0.5 rounded-full font-black bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
                          <span>
                            {activeChatAgent.isActive 
                              ? (language === 'ar' ? 'نشط ومطابق' : 'Active') 
                              : (language === 'ar' ? 'متوقف مؤقتاً' : 'Paused')}
                          </span>
                        </span>
                      </div>
                      <p className={`text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-extrabold ${isRtl ? 'text-right' : 'text-left'}`}>
                        {activeChatAgent.roles.join(' • ')}
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
                                {Boolean(msg?.text && (msg.text.includes('صيانة') || msg.text.includes('إصلاح') || msg.text.includes('عطل') || msg.text.includes('فرامل') || msg.text.toLowerCase().includes('maintenance') || msg.text.toLowerCase().includes('repair'))) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuickOrderData({
                                        vehicleId: defaultVehicles[0]?.id || 'V1',
                                        category: activeChatAgent.id === 'mechanic' ? 'mechanical' : 'body',
                                        description: (msg?.text || '').slice(0, 150) + '...',
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

      {/* Hidden File Inputs for Attachment / Camera */}
      <input
        type="file"
        ref={pmFileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelected(e.target.files[0], 'pm');
          }
        }}
        className="hidden"
      />
      <input
        type="file"
        ref={mechFileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelected(e.target.files[0], 'mech');
          }
        }}
        className="hidden"
      />
      <input
        type="file"
        ref={coPilotFileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelected(e.target.files[0], 'copilot');
          }
        }}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraFileInputRef}
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelected(e.target.files[0], cameraTarget);
          }
        }}
        className="hidden"
      />

      {/* Image Zoom Lightbox Modal */}
      <AnimatePresence>
        {previewModalImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewModalImage(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] z-[201] flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
                title={language === 'ar' ? 'إغلاق' : 'Close'}
              >
                <X size={20} />
              </button>
              <img
                src={previewModalImage}
                alt="Enlarged preview"
                className="max-h-[80vh] w-auto object-contain rounded-2xl border border-white/20 shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
