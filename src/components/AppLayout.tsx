import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Wrench, 
  Users, 
  Warehouse, 
  BarChart3, 
  Bell, 
  Clock,
  Activity,
  Search, 
  ChevronLeft,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  Sun,
  Moon,
  Scan,
  Check,
  MessageSquare,
  Send,
  Save,
  Languages,
  BadgeAlert,
  HelpCircle,
  Compass,
  Database,
  Cpu,
  UserCheck,
  Sparkles,
  Award,
  Lock,
  Sliders,
  Plus,
  Upload,
  Image,
  Trash2,
  AlertTriangle,
  HardDrive,
  CreditCard,
  Coins,
  LifeBuoy,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole } from '../types';
import { MENU_ITEMS } from '../constants';
import { useLanguage } from '../services/LanguageContext';
import { pushLocalDataToCloud, pullCloudDataToLocal, testFirestoreConnection } from '../services/firebase';
import { SystemSettings } from './SystemSettings';
import { SupportTickets } from './SupportTickets';
import OnboardingTour from './OnboardingTour';
import Breadcrumbs, { TAB_LABELS } from './Breadcrumbs';
import { vehicles as staticVehicles } from '../data';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
  key?: string | number;
}

const SidebarItem = ({ icon, label, active, onClick, collapsed }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-2.5 rounded-xl transition-all duration-200 group relative ${
      active 
        ? 'bg-brand-blue-500/10 dark:bg-brand-blue-500/20 text-brand-blue-800 dark:text-[#34d399] font-black' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/55 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    {active && (
      <motion.div 
        layoutId="active-nav"
        className="absolute inset-y-1.5 right-0 w-1.5 bg-brand-blue-600 rounded-l-full"
      />
    )}
    <div className={`transition-colors ${active ? 'text-brand-blue-600 dark:text-[#34d399]' : 'text-slate-400 group-hover:text-brand-blue-600 dark:group-hover:text-emerald-400'}`}>
      {icon}
    </div>
    {!collapsed && (
      <span className="mr-3 ml-3 text-[11.5px] font-bold tracking-wide">
        {label}
      </span>
    )}
  </button>
);

const adjustColorBrightness = (hex: string, percent: number): string => {
  try {
    let cleanHex = hex.trim().replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(char => char + char).join('');
    }
    if (cleanHex.length !== 6) {
      return hex;
    }
    
    let r = parseInt(cleanHex.substring(0, 2), 16);
    let g = parseInt(cleanHex.substring(2, 4), 16);
    let b = parseInt(cleanHex.substring(4, 6), 16);
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return hex;
    }
    
    const factor = percent / 100;
    if (percent > 0) {
      r = Math.round(r + (255 - r) * factor);
      g = Math.round(g + (255 - g) * factor);
      b = Math.round(b + (255 - b) * factor);
    } else {
      r = Math.round(r + r * factor);
      g = Math.round(g + g * factor);
      b = Math.round(b + b * factor);
    }
    
    const clamp = (val: number) => Math.max(0, Math.min(255, val));
    const rHex = clamp(r).toString(16).padStart(2, '0');
    const gHex = clamp(g).toString(16).padStart(2, '0');
    const bHex = clamp(b).toString(16).padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}`;
  } catch (e) {
    return hex;
  }
};

const THEMES_PRESETS = [
  {
    id: 'classic-blue',
    hex: '#6d28d9',
    nameAr: 'البنفسجي الملكي الإمبراطوري (Imperial Purple)',
    nameEn: 'Imperial Royal Purple',
    descAr: 'النمط الرسمي المعتمد لإدارة وتتبع الورش لأسطول رسمي ومثالي للأعمال الهندسية والمستقبلية.',
    descEn: 'Official approved platform style featuring a futuristic royal purple palette for modern fleet operations.',
    colorClass: 'bg-brand-blue-500'
  },
  {
    id: 'eco-green',
    hex: '#00b95c',
    nameAr: 'أخضر الأسطول المستدام (Eco-Fleet)',
    nameEn: 'Eco-Fleet Green',
    descAr: 'نمط حيوي ومنعش يناسب ورش غيار محركات الحافلات الهجينة والسيارات الكهربائية والمعدات الثقيلة.',
    descEn: 'Vibrant and fresh diagnostic style suitable for eco-friendly vehicle workshops.',
    colorClass: 'bg-emerald-500'
  },
  {
    id: 'safety-gold',
    hex: '#f59e0b',
    nameAr: 'ذهبي الأمن والصيانة الصناعية (Safety)',
    nameEn: 'Safety Compliance Gold',
    descAr: 'نمط عالي التباين يحاكي لون التروس ولوحات التنبيه في الميدان وورش الصيانة الصناعية.',
    descEn: 'High contrast compliance theme for rigorous enterprise machinery depots & fast pits.',
    colorClass: 'bg-brand-yellow-500'
  },
  {
    id: 'tactical-red',
    hex: '#f03e3e',
    nameAr: 'أحمر الأداء والعزم الخارق (Torque Red)',
    nameEn: 'Tactical Torque Red',
    descAr: 'طاقة نفاثة وعزم متكامل ومظهر رياضي معزز لورش سيارات الصيانة السريعة والفورميلا.',
    descEn: 'Aggressive diagnostic theme for premium tuning centers, emergency pitlanes & sport garages.',
    colorClass: 'bg-brand-red-500'
  }
];

const GROUP_INFOS = {
  command: {
    ar: 'القيادة والتحكم الإستراتيجي',
    en: 'Command & Strategic Control'
  },
  operations: {
    ar: 'إدارة العمليات والأسطول',
    en: 'Fleet & Operations Management'
  },
  engineering: {
    ar: 'إدارة الصيانة والورش الفنية',
    en: 'Engineering & Maintenance'
  },
  logistics: {
    ar: 'سلاسل الإمداد والخدمات اللوجستية',
    en: 'Supply Chain & Logistics'
  },
  governance: {
    ar: 'الحوكمة وإدارة الموارد والأمان',
    en: 'Governance, Wealth & Security'
  }
};

const GROUP_ORDER = ['command', 'operations', 'engineering', 'logistics', 'governance'] as const;

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAiEnabled: boolean;
  setIsAiEnabled: (enabled: boolean) => void;
  user: User;
  onRoleChange: (role: UserRole) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout?: () => void;
  onUserUpdate?: (updatedUser: User) => void;
  onNavigateToMarketing?: () => void;
}

const calculateOverdueCount = (): number => {
  const saved = localStorage.getItem('fleet_periodic_schedules');
  let schedules = [];
  if (saved) {
    try {
      schedules = JSON.parse(saved);
    } catch (e) {
      schedules = [];
    }
  } else {
    // Default schedules aligning with INITIAL_SCHEDULES
    schedules = [
      {
        id: 'p-1',
        dueDate: '2026-06-20',
        status: 'active'
      },
      {
        id: 'p-2',
        dueDate: '2026-05-15',
        status: 'overdue'
      },
      {
        id: 'p-3',
        dueDate: '2026-05-29',
        status: 'due-soon'
      },
      {
        id: 'p-4',
        dueDate: '2026-05-31',
        status: 'active'
      }
    ];
  }
  
  const systemDate = new Date('2026-05-23');
  let count = 0;
  for (const sched of schedules) {
    if (sched.status === 'paused') continue;
    
    const dueDateObj = new Date(sched.dueDate);
    const diffTime = dueDateObj.getTime() - systemDate.getTime();
    const diffDays = Math.ceil(diffTime / (1024 * 60 * 60 * 1000));
    
    if (diffDays <= 0) {
      count++;
    }
  }
  return count;
};

export default function AppLayout({ 
  children, 
  activeTab, 
  setActiveTab, 
  isAiEnabled, 
  setIsAiEnabled,
  user,
  onRoleChange,
  isDarkMode,
  toggleDarkMode,
  onLogout,
  onUserUpdate,
  onNavigateToMarketing
}: LayoutProps) {
  const { language, setLanguage, t, dir } = useLanguage();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [overdueMaintenanceCount, setOverdueMaintenanceCount] = useState(() => calculateOverdueCount());
  
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncQueueCount, setSyncQueueCount] = useState(0);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      const savedQueue = localStorage.getItem('fleet_offline_sync_queue');
      if (savedQueue) {
        try {
          const queue = JSON.parse(savedQueue);
          if (queue && queue.length > 0) {
            setIsSyncing(true);
            setSyncToastMessage(language === 'ar' ? 'تم استعادة الاتصال بالإنترنت! جاري مزامنة بيانات الصيانة...' : 'Connectivity recovered! Syncing offline maintenance changes...');
            setTimeout(() => {
              localStorage.removeItem('fleet_offline_sync_queue');
              setSyncQueueCount(0);
              setIsSyncing(false);
              setSyncToastMessage(language === 'ar' ? 'تمت مزامنة جميع تعديلات الصيانة بنجاح مع السيرفر الرئيسي! 🟢' : 'All maintenance updates successfully reconciled with central server! 🟢');
              setTimeout(() => setSyncToastMessage(null), 3500);
            }, 2500);
          }
        } catch (e) {
          localStorage.removeItem('fleet_offline_sync_queue');
        }
      } else {
        setSyncToastMessage(language === 'ar' ? 'أنت متصل بالإنترنت مجدداً! 🟢' : 'Your connection is back online! 🟢');
        setTimeout(() => setSyncToastMessage(null), 3000);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setSyncToastMessage(language === 'ar' ? 'تم العمل دون اتصال بالإنترنت. سيتم تخزين بيانات الصيانة وتحديثاتها محلياً.' : 'Offline mode active. All pending maintenance edits are stored locally.');
      setTimeout(() => setSyncToastMessage(null), 4000);
    };

    const handleActionLogged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSyncToastMessage(language === 'ar' ? customEvent.detail.message_ar : customEvent.detail.message_en);
        setTimeout(() => setSyncToastMessage(null), 4500);
        
        // Refresh queue count
        const savedQueue = localStorage.getItem('fleet_offline_sync_queue');
        if (savedQueue) {
          try {
            setSyncQueueCount(JSON.parse(savedQueue).length);
          } catch (err) {}
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-action-logged', handleActionLogged);

    // Read initial queue on mount
    const savedQueue = localStorage.getItem('fleet_offline_sync_queue');
    if (savedQueue) {
      try {
        setSyncQueueCount(JSON.parse(savedQueue).length);
      } catch (err) {}
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-action-logged', handleActionLogged);
    };
  }, [language]);

  useEffect(() => {
    const handleUpdate = () => {
      setOverdueMaintenanceCount(calculateOverdueCount());
      updateInspectionStats();
    };
    window.addEventListener('schedules-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('schedules-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    command: true,
    operations: true,
    engineering: true,
    logistics: true,
    governance: true
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };
  
  const [enabledModuleIds, setEnabledModuleIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('saas_enabled_modules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          let hasUpdates = false;
          if (!parsed.includes('projects')) {
            parsed.push('projects');
            hasUpdates = true;
          }
          if (!parsed.includes('driver-handover')) {
            parsed.push('driver-handover');
            hasUpdates = true;
          }
          if (!parsed.includes('maintenance-bot')) {
            parsed.push('maintenance-bot');
            hasUpdates = true;
          }
          if (!parsed.includes('firebase-sync')) {
            parsed.push('firebase-sync');
            hasUpdates = true;
          }
          if (!parsed.includes('external-maintenance')) {
            parsed.push('external-maintenance');
            hasUpdates = true;
          }
          if (hasUpdates) {
            localStorage.setItem('saas_enabled_modules', JSON.stringify(parsed));
          }
        }
        return parsed;
      } catch (e) {}
    }
    return MENU_ITEMS.map(item => item.id);
  });

  // Load custom RBAC feature permissions from storage
  const [customFeaturePermissions, setCustomFeaturePermissions] = useState<Record<string, Record<string, boolean>> | null>(() => {
    const saved = localStorage.getItem('saas_rbac_custom_features');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  // Listen to custom RBAC updates
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('saas_rbac_custom_features');
      if (saved) {
        try { setCustomFeaturePermissions(JSON.parse(saved)); } catch (e) {}
      } else {
        setCustomFeaturePermissions(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('rbac-updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('rbac-updated', handleStorageChange);
    };
  }, []);

  const filteredMenuItems = MENU_ITEMS.filter(item => {
    if (item.id === 'marketing-admin') return false;
    
    // Check if there are custom manager rules for feature visibility
    if (customFeaturePermissions && customFeaturePermissions[item.id]) {
      const isAllowedByManager = !!customFeaturePermissions[item.id][user.role];
      if (!isAllowedByManager) return false;
    } else {
      // Fallback to static role validation
      if (!item.roles.includes(user.role)) return false;
    }
    
    return (
      item.id === 'dashboard' || 
      item.id === 'maintenance-bot' || 
      item.id === 'firebase-sync' || 
      item.id === 'saas-billing' || 
      item.id === 'marketing-portal' || 
      enabledModuleIds.includes(item.id)
    );
  });

  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  // Getting Started Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(() => localStorage.getItem('saas_wizard_completed') !== 'true');
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardFleetType, setWizardFleetType] = useState('hybrid');
  const [wizardCorpScale, setWizardCorpScale] = useState('sme');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    const wizardDone = localStorage.getItem('saas_wizard_completed') === 'true';
    const tourDone = localStorage.getItem('saas_tour_completed') === 'true';
    return wizardDone && !tourDone;
  });

  // Modal States
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  
  // Settings values
  const [profileName, setProfileName] = useState(user.name);
  const [profileTitle, setProfileTitle] = useState(user.title || 'مدير قسم الصيانة');
  const [profileAvatar, setProfileAvatar] = useState(user.avatar);
  const [hasHeaderAvatarError, setHasHeaderAvatarError] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [readOnlyMode, setReadOnlyMode] = useState(() => {
    return localStorage.getItem('saas_read_only_mode') === 'true';
  });
  const [automatedBackups, setAutomatedBackups] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(() => {
    return localStorage.getItem('saas_biometric_enabled') !== 'false';
  });
  const [backupSchedule, setBackupSchedule] = useState('daily');
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);
  const [saasBrandName, setSaasBrandName] = useState(() => localStorage.getItem('saas_brand_name') || 'FleetAurvexis');
  const [saasBrandDesc, setSaasBrandDesc] = useState(() => localStorage.getItem('saas_brand_desc') || '');
  const [saasBrandLogo, setSaasBrandLogo] = useState(() => localStorage.getItem('saas_brand_logo') || '');

  // Cloud Database Sync States
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudFeedback, setCloudFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Cloud Database Storage Quota states (Simulates Gmail-like Limit Warning)
  const [storageUsed, setStorageUsed] = useState(() => Number(localStorage.getItem('saas_storage_used') || '14.2'));
  const [storageMax, setStorageMax] = useState(() => Number(localStorage.getItem('saas_storage_max') || '15.0'));
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeSuccessPlan, setUpgradeSuccessPlan] = useState<string | null>(null);

  // SaaS ROI Monetization Yield Simulator states
  const [simulatorClients, setSimulatorClients] = useState(12);
  const [simulatorFee, setSimulatorFee] = useState(499);

  const handleUpdateStorageUsed = (val: number) => {
    const rounded = Math.round(val * 10) / 10;
    setStorageUsed(rounded);
    localStorage.setItem('saas_storage_used', String(rounded));
  };

  const handleBrandLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(language === 'ar' ? 'حجم الملف كبير جداً! يرجى اختيار صورة أقل من 2 ميجابايت.' : 'File size is too big! Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSaasBrandLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloudUpload = async () => {
    if (storageUsed >= storageMax) {
      setIsCloudSyncing(true);
      setCloudFeedback({
        type: 'info',
        text: language === 'ar' ? 'جاري التحقق من مساحة السيرفر المتاحة قبل المزامنة...' : 'Checking available cloud server storage before backup...'
      });
      await new Promise(resolve => setTimeout(resolve, 800));
      setCloudFeedback({
        type: 'error',
        text: language === 'ar'
          ? `⚠️ خطأ: الذاكرة غير كافية! لقد استهلكت كامل سعتك التخزينية المحددة (${storageUsed} جيجابايت من أصل ${storageMax} جيجابايت). لم تعد البيانات تُحفظ في السحاب. يرجى ترقية باقة الاشتراك السحابي للحصول على مساحة أكبر وبسرعة أعلى كما في بريد Gmail.`
          : `⚠️ Account Quota Over Limit! Push backup blocked because you used (${storageUsed} GB / ${storageMax} GB) of your total cloud hosting allowance. Upgrade your membership plan immediately to continue syncing.`
      });
      setIsCloudSyncing(false);
      return;
    }

    setIsCloudSyncing(true);
    setCloudFeedback({ 
      type: 'info', 
      text: language === 'ar' ? 'جاري رفع ومزامنة كافة البيانات المحلية إلى خادم Firebase السحابي...' : 'Uploading and synchronizing all offline data to the Firebase cloud servers...'
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = await pushLocalDataToCloud();
    if (result.success) {
      // Increment storage slightly to simulate progressive storage consumed upon success
      const newUsed = Math.min(storageMax, storageUsed + 0.1);
      handleUpdateStorageUsed(newUsed);

      setCloudFeedback({
        type: 'success',
        text: language === 'ar' 
          ? `تم رفع البيانات السحابية بنجاح! تم حفظ وتأمين ${result.count} سجل. تم تحديث حجم تخزين السحاب إلى ${newUsed.toFixed(1)} جيجابايت.`
          : `Data uploaded & secured in Cloud Firestore successfully! Synchronized ${result.count} records. Cloud disk adjusted to ${newUsed.toFixed(1)} GB.`
      });
    } else {
      setCloudFeedback({
        type: 'error',
        text: language === 'ar'
          ? 'فشلت المزامنة. يرجى التأكد من اتصال الإنترنت وصحة إعدادات خادم Firestore.'
          : 'Sync failed. Please verify internet connectivity and custom security rules.'
      });
    }
    setIsCloudSyncing(false);
  };

  const handleCloudDownload = async () => {
    setIsCloudSyncing(true);
    setCloudFeedback({
      type: 'info',
      text: language === 'ar' ? 'جاري استيراد ومزامنة البيانات من خادم Firebase السحابي إلى متصفحك...' : 'Importing and downloading latest dataset from Firebase Cloud storage...'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = await pullCloudDataToLocal();
    if (result.success) {
      setCloudFeedback({
        type: 'success',
        text: language === 'ar'
          ? `تم جلب واستعادة البيانات السحابية بالكامل! تم تحديث وتحميل ${result.count} سجل بنجاح.`
          : `Cloud data imported and restored successfully! Refreshed ${result.count} local stored records.`
      });
    } else {
      setCloudFeedback({
        type: 'error',
        text: language === 'ar'
          ? 'فشل الاستيراد السحابي. تأكد من أن قاعدة بيانات Firebase تحتوي على نسخ مسجلة بالفعل.'
          : 'Cloud restore failed. Confirm your Firebase environment contains existing cloud tables.'
      });
    }
    setIsCloudSyncing(false);
  };
  
  // Custom structured settings state
  const [selectedSettingsTab, setSelectedSettingsTab] = useState<'branding' | 'admin' | 'staff' | 'system' | 'cloud_sync' | 'tickets' | null>(null);
  const [settingsMobileSection, setSettingsMobileSection] = useState<'menu' | 'content'>('menu');
  const [adminPin, setAdminPin] = useState(() => localStorage.getItem('saas_admin_pin') || '4321');
  const [saasBrandColor, setSaasBrandColor] = useState(() => localStorage.getItem('saas_brand_color') || 'blue');
  const [brandTheme, setBrandTheme] = useState(() => localStorage.getItem('saas_brand_theme') || 'classic-blue');
  const [brandPrimaryColor, setBrandPrimaryColor] = useState(() => localStorage.getItem('saas_brand_primary_color') || '#6d28d9');
  const [staffList, setStaffList] = useState<Array<{
    id: number;
    name: string;
    role: string;
    status: string;
    permissions?: string[];
    mfaEnabled?: boolean;
    mfaMethod?: 'app' | 'sms' | 'email';
    maxWorkOrderValue?: number;
    allowedHours?: 'any' | 'business' | 'daytime';
    ipRestriction?: string;
    maxActiveSessions?: number;
  }>>(() => {
    const saved = localStorage.getItem('saas_staff_list');
    if (saved) return JSON.parse(saved);
    return [
      { 
        id: 1, 
        name: 'م. خالد العتيبي', 
        role: 'خبير صيانة الأساطيل والتكاملات الكهربائية', 
        status: 'نشط', 
        permissions: ['scan_barcode', 'approve_work'],
        mfaEnabled: true,
        mfaMethod: 'app',
        maxWorkOrderValue: 50000,
        allowedHours: 'any',
        ipRestriction: '192.168.1.0/24',
        maxActiveSessions: 3
      },
      { 
        id: 2, 
        name: 'أحمد الشمراني', 
        role: 'مسؤول القطع الاستراتيجية والمخازن', 
        status: 'نشط', 
        permissions: ['scan_barcode', 'edit_fleet'],
        mfaEnabled: false,
        mfaMethod: 'sms',
        maxWorkOrderValue: 15000,
        allowedHours: 'business',
        ipRestriction: '192.168.2.0/24',
        maxActiveSessions: 1
      },
      { 
        id: 3, 
        name: 'سارة القحطاني', 
        role: 'محللة جودة الأداء والاعتمادية البرمجية', 
        status: 'دعم ميداني', 
        permissions: ['scan_barcode', 'system_settings'],
        mfaEnabled: true,
        mfaMethod: 'email',
        maxWorkOrderValue: 8000,
        allowedHours: 'daytime',
        ipRestriction: '',
        maxActiveSessions: 2
      }
    ];
  });

  // Advanced staff permission/title individual sub-state
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [editingStaffName, setEditingStaffName] = useState('');
  const [editingStaffRole, setEditingStaffRole] = useState('');
  const [editingStaffPermissions, setEditingStaffPermissions] = useState<string[]>([]);
  const [editingStaffMfaEnabled, setEditingStaffMfaEnabled] = useState<boolean>(false);
  const [editingStaffMfaMethod, setEditingStaffMfaMethod] = useState<'app' | 'sms' | 'email'>('app');
  const [editingStaffMaxWorkOrderValue, setEditingStaffMaxWorkOrderValue] = useState<number>(10000);
  const [editingStaffAllowedHours, setEditingStaffAllowedHours] = useState<'any' | 'business' | 'daytime'>('any');
  const [editingStaffIpRestriction, setEditingStaffIpRestriction] = useState<string>('');
  const [editingStaffMaxActiveSessions, setEditingStaffMaxActiveSessions] = useState<number>(2);

  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('فني أول صيانات');

  // Inline dropdown and live editing states/handlers
  const [activeDropdownStaffId, setActiveDropdownStaffId] = useState<number | null>(null);

  const handleInlineEditRole = (id: number, newRole: string) => {
    const updated = staffList.map(item => item.id === id ? { ...item, role: newRole } : item);
    setStaffList(updated);
  };

  const handleInlineEditName = (id: number, newName: string) => {
    const updated = staffList.map(item => item.id === id ? { ...item, name: newName } : item);
    setStaffList(updated);
  };

  const handleInlineTogglePermission = (id: number, permission: string) => {
    const updated = staffList.map(item => {
      if (item.id === id) {
        const currentPerms = item.permissions || [];
        const isChecked = currentPerms.includes(permission);
        const nextPerms = isChecked
          ? currentPerms.filter(p => p !== permission)
          : [...currentPerms, permission];
        return { ...item, permissions: nextPerms };
      }
      return item;
    });
    setStaffList(updated);
  };

  // Global sub-admin credentials & task allocations state
  const [globalSubAdminPrivileges, setGlobalSubAdminPrivileges] = useState<{
    allowHeavyDelete: boolean;
    allowInventoryAdjust: boolean;
    allowSettingsWrite: boolean;
    requireMFAForAdmins: boolean;
  }>(() => {
    const saved = localStorage.getItem('saas_global_sub_admin_privileges');
    if (saved) return JSON.parse(saved);
    return {
      allowHeavyDelete: false,
      allowInventoryAdjust: true,
      allowSettingsWrite: false,
      requireMFAForAdmins: true
    };
  });

  const [subAdminTasks, setSubAdminTasks] = useState<Array<{
    id: number;
    title: string;
    assigneeId: number;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'active' | 'completed';
    dueDate: string;
  }>>(() => {
    const saved = localStorage.getItem('saas_sub_admin_tasks');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, title: 'جرد مستودع مرشحات وفلاتر الأسطول', assigneeId: 2, priority: 'high', status: 'active', dueDate: '2026-06-05' },
      { id: 2, title: 'فحص التراخيص الميكانيكية للرافعات الثقيلة', assigneeId: 1, priority: 'medium', status: 'pending', dueDate: '2026-06-10' },
      { id: 3, title: 'تحديث معايير اختبار انبعاثات العوادم البرمجية', assigneeId: 3, priority: 'low', status: 'completed', dueDate: '2026-05-30' }
    ];
  });

  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [newSubTaskAssigneeId, setNewSubTaskAssigneeId] = useState<number>(1);
  const [newSubTaskPriority, setNewSubTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newSubTaskDueDate, setNewSubTaskDueDate] = useState('2026-06-15');

  React.useEffect(() => {
    const currentColor = localStorage.getItem('saas_brand_primary_color');
    if (!currentColor || currentColor === '#1e53e4') {
      localStorage.setItem('saas_brand_primary_color', '#6d28d9');
      setBrandPrimaryColor('#6d28d9');
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('saas_global_sub_admin_privileges', JSON.stringify(globalSubAdminPrivileges));
  }, [globalSubAdminPrivileges]);

  React.useEffect(() => {
    localStorage.setItem('saas_sub_admin_tasks', JSON.stringify(subAdminTasks));
  }, [subAdminTasks]);

  const handleAddSubTask = () => {
    if (!newSubTaskTitle.trim()) return;
    const newTask = {
      id: Date.now(),
      title: newSubTaskTitle,
      assigneeId: Number(newSubTaskAssigneeId),
      priority: newSubTaskPriority,
      status: 'pending' as const,
      dueDate: newSubTaskDueDate
    };
    setSubAdminTasks(prev => [...prev, newTask]);
    setNewSubTaskTitle('');
  };

  const handleToggleSubTaskStatus = (id: number) => {
    setSubAdminTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'pending' ? 'active' : t.status === 'active' ? 'completed' : 'pending';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleRemoveSubTask = (id: number) => {
    setSubAdminTasks(prev => prev.filter(t => t.id !== id));
  };

  // Auto-save staff list changes to localStorage and dispatch event
  React.useEffect(() => {
    localStorage.setItem('saas_staff_list', JSON.stringify(staffList));
    window.dispatchEvent(new Event('storage'));
  }, [staffList]);

  React.useEffect(() => {
    if (isSettingsModalOpen) {
      setSettingsMobileSection('menu');
      setProfileName(user.name);
      setProfileTitle(user.title || 'مدير قسم الصيانة');
      setProfileAvatar(user.avatar);
      setSaasBrandName(localStorage.getItem('saas_brand_name') || '');
      setSaasBrandDesc(localStorage.getItem('saas_brand_desc') || '');
      setAdminPin(localStorage.getItem('saas_admin_pin') || '4321');
      setSaasBrandColor(localStorage.getItem('saas_brand_color') || 'blue');
      const saved = localStorage.getItem('saas_staff_list');
      if (saved) {
        setStaffList(JSON.parse(saved));
      }
    }
  }, [isSettingsModalOpen, user]);

  React.useEffect(() => {
    const handleStorageChange = () => {
      setSaasBrandName(localStorage.getItem('saas_brand_name') || '');
      setSaasBrandDesc(localStorage.getItem('saas_brand_desc') || '');
      const savedModules = localStorage.getItem('saas_enabled_modules');
      if (savedModules) {
        try {
          setEnabledModuleIds(JSON.parse(savedModules));
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Support Chat values
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    { 
      sender: 'bot', 
      text: language === 'ar' 
        ? 'أهلاً بك في الدعم الميداني التقني لمجموعة Axoventra المعزز بالـ SaaS. يمكننا معاً معالجة أي استفسارات تخص الاشتراكات، الفواتير، إدارة القطع التكتيكية، أو المشكلات الميكانيكية.' 
        : 'Welcome to the Axoventra Tech Support portal. We are here to assist you with subscription billing, logistics tracking, or spare parts management workflows.',
      time: '12:00'
    }
  ]);
  const [supportTicketId, setSupportTicketId] = useState<string | null>(null);

  // Notifications State
  const [activeSmartAlert, setActiveSmartAlert] = useState<{
    id: string;
    orderId: string;
    oldStatus: 'pending' | 'in-progress' | 'completed';
    newStatus: 'pending' | 'in-progress' | 'completed';
    descriptionAr: string;
    descriptionEn: string;
    vehicleName: string;
    technicianName?: string;
  } | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsFilter, setNotificationsFilter] = useState<'all' | 'initial' | 'final' | 'quality'>('all');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'warning' | 'info' | 'success' | 'danger';
    titleAr: string;
    titleEn: string;
    msgAr: string;
    msgEn: string;
    timeAr: string;
    timeEn: string;
    read: boolean;
  }>>(() => {
    const saved = localStorage.getItem('fleet_system_notifications_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }

    const now = new Date();
    const getFormattedTime = (offsetMs: number) => {
      const d = new Date(now.getTime() - offsetMs);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours() % 12 || 12).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      const ampm = d.getHours() >= 12 ? 'م' : 'ص';
      const ampmEn = d.getHours() >= 12 ? 'PM' : 'AM';
      return {
        ar: `${year}/${month}/${day} - ${hours}:${minutes}:${seconds} ${ampm}`,
        en: `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${ampmEn}`
      };
    };

    const t1 = getFormattedTime(2 * 60 * 1000);
    const t2 = getFormattedTime(60 * 60 * 1000);
    const t3 = getFormattedTime(2 * 60 * 60 * 1000);
    const t4 = getFormattedTime(4 * 60 * 60 * 1000);

    return [
      {
        id: '1',
        type: 'warning',
        titleAr: 'تنبيه: مخزون منخفض',
        titleEn: 'Low Stock Alert',
        msgAr: 'مخزون فلاتر الزيت وفحمات الفرامل (تويوتا) شارف على الانتهاء.',
        msgEn: 'Oil filters and brake pads (Toyota) are running low in stock.',
        timeAr: t1.ar,
        timeEn: t1.en,
        read: false,
      },
      {
        id: '2',
        type: 'info',
        titleAr: 'بلاغ صيانة جديد',
        titleEn: 'New Maintenance Ticket',
        msgAr: 'تم تعيين مركبة (فورد إكسبلورر - ل ح د 9823) لقسم الصيانة الميكانيكية المباشرة.',
        msgEn: 'Ford Explorer (LHD 9823) has been assigned for mechanical repair.',
        timeAr: t2.ar,
        timeEn: t2.en,
        read: false,
      },
      {
        id: '3',
        type: 'success',
        titleAr: 'اكتمال فحص دوري',
        titleEn: 'Inspection Completed',
        msgAr: 'تم إنهاء الصيانة المجدولة بنجاح لمركبة (هيونداي إلنترا - ا ر ب 4412).',
        msgEn: 'Scheduled checkup completed for Hyundai Elantra (ARB 4412).',
        timeAr: t3.ar,
        timeEn: t3.en,
        read: false,
      },
      {
        id: '4',
        type: 'danger',
        titleAr: 'تنبيه: إشغال مرتفع',
        titleEn: 'High Occupancy Alert',
        msgAr: 'تجاوزت ورشة (شمال الرياض) نسبة إشغال 90%.',
        msgEn: 'Workshop (North Riyadh) exceeded 90% floor occupancy.',
        timeAr: t4.ar,
        timeEn: t4.en,
        read: true,
      }
    ];
  });

  const [inspectionStats, setInspectionStats] = useState({ initial: 0, final: 0, certified: 0 });

  const updateInspectionStats = () => {
    try {
      const ordersRaw = localStorage.getItem('fleet_maintenance_orders_v2') || '[]';
      const inspsRaw = localStorage.getItem('fleet_safety_inspections') || '[]';
      
      let orders: any[] = [];
      let insps: any[] = [];
      
      try { orders = JSON.parse(ordersRaw); } catch(e) {}
      try { insps = JSON.parse(inspsRaw); } catch(e) {}
      
      if (!Array.isArray(orders)) orders = [];
      if (!Array.isArray(insps)) insps = [];
      
      const orderBeforeMap = new Set(insps.filter(i => i?.type === 'before').map(i => i?.orderId));
      const orderAfterMap = new Set(insps.filter(i => i?.type === 'after').map(i => i?.orderId));
      
      let initialCount = 0;
      let finalCount = 0;
      let certifiedCount = 0;
      
      orders.forEach(order => {
        if (!order || !order.id) return;
        const hasBefore = orderBeforeMap.has(order.id);
        const hasAfter = orderAfterMap.has(order.id);
        
        if (!hasBefore) {
          initialCount++;
        } else if (hasBefore && !hasAfter) {
          finalCount++;
        } else if (hasAfter) {
          certifiedCount++;
        }
      });

      if (orders.length === 0) {
        setInspectionStats({ initial: 3, final: 2, certified: 6 });
      } else {
        setInspectionStats({
          initial: initialCount,
          final: finalCount,
          certified: certifiedCount
        });
      }
    } catch (err) {
      setInspectionStats({ initial: 0, final: 0, certified: 0 });
    }
  };

  useEffect(() => {
    localStorage.setItem('fleet_system_notifications_v1', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    updateInspectionStats();
    
    const handleStorageChangeNotif = (e: StorageEvent) => {
      if (e.key === 'fleet_system_notifications_v1' && e.newValue) {
        try {
          setNotifications(JSON.parse(e.newValue));
        } catch (err) {}
      }
      updateInspectionStats();
    };
    const handleAddNotification = (e: CustomEvent) => {
      const { type, titleAr, titleEn, msgAr, msgEn } = e.detail || {};
      if (!titleAr || !titleEn) return;
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours() % 12 || 12).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = now.getHours() >= 12 ? 'م' : 'ص';
      const ampmEn = now.getHours() >= 12 ? 'PM' : 'AM';
      
      const preciseTimeAr = `${year}/${month}/${day} - ${hours}:${minutes}:${seconds} ${ampm}`;
      const preciseTimeEn = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${ampmEn}`;

      const newNotif = {
        id: `notif-${Date.now()}`,
        type: type || 'info',
        titleAr,
        titleEn,
        msgAr: msgAr || '',
        msgEn: msgEn || '',
        timeAr: preciseTimeAr,
        timeEn: preciseTimeEn,
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      updateInspectionStats();
    };

    window.addEventListener('storage', handleStorageChangeNotif);
    window.addEventListener('add-notification' as any, handleAddNotification as any);
    return () => {
      window.removeEventListener('storage', handleStorageChangeNotif);
      window.removeEventListener('add-notification' as any, handleAddNotification as any);
    };
  }, []);

  useEffect(() => {
    const handleStatusChange = (e: CustomEvent) => {
      const { orderId, oldStatus, newStatus, descriptionAr, descriptionEn, vehicleName, technicianName } = e.detail || {};
      
      const statusNamesAr = {
        'pending': 'قيد الانتظار ⏳',
        'in-progress': 'جاري العمل ⚙️',
        'completed': 'مكتمل بنجاح ✓'
      };
      
      const statusNamesEn = {
        'pending': 'Pending ⏳',
        'in-progress': 'In Progress ⚙️',
        'completed': 'Completed ✓'
      };

      const oldNameAr = statusNamesAr[oldStatus as keyof typeof statusNamesAr] || oldStatus;
      const newNameAr = statusNamesAr[newStatus as keyof typeof statusNamesAr] || newStatus;
      const oldNameEn = statusNamesEn[oldStatus as keyof typeof statusNamesEn] || oldStatus;
      const newNameEn = statusNamesEn[newStatus as keyof typeof statusNamesEn] || newStatus;

      // 1. Dispatch normal add-notification so it registers in the drawer & local storage
      const titleAr = '🔔 تحديث حالة صيانة ذكي!';
      const titleEn = '🔔 Smart Maintenance Update!';
      const msgAr = `المركبة: ${vehicleName || 'مجهولة'} • تغيرت الحالة من [${oldNameAr}] إلى [${newNameAr}] • البيان: ${descriptionAr || ''}`;
      const msgEn = `Vehicle: ${vehicleName || 'Unknown'} • Status changed from [${oldNameEn}] to [${newNameEn}] • Details: ${descriptionEn || ''}`;

      window.dispatchEvent(new CustomEvent('add-notification', {
        detail: {
          type: newStatus === 'completed' ? 'success' : 'info',
          titleAr,
          titleEn,
          msgAr,
          msgEn
        }
      }));

      // 2. Set active smart alert overlay state to show on the screen
      setActiveSmartAlert({
        id: `alert-${Date.now()}`,
        orderId,
        oldStatus,
        newStatus,
        descriptionAr: descriptionAr || '',
        descriptionEn: descriptionEn || '',
        vehicleName: vehicleName || 'مجهولة',
        technicianName: technicianName || ''
      });
    };

    window.addEventListener('maintenance-order-status-changed' as any, handleStatusChange as any);
    return () => {
      window.removeEventListener('maintenance-order-status-changed' as any, handleStatusChange as any);
    };
  }, []);

  useEffect(() => {
    if (activeSmartAlert) {
      const timer = setTimeout(() => {
        setActiveSmartAlert(null);
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [activeSmartAlert]);

  useEffect(() => {
    // Check periodic schedules for 48 hours warnings
    const checkUpcomingPeriodicMaintenance = () => {
      const savedSchedules = localStorage.getItem('fleet_periodic_schedules');
      let schedules: any[] = [];
      if (savedSchedules) {
        try {
          schedules = JSON.parse(savedSchedules);
        } catch (e) {
          schedules = [];
        }
      } else {
        schedules = [
          { id: 'p-1', vehicleId: '1', title: 'تغيير زيت المحرك وباقة الفلاتر الدورية', dueDate: '2026-06-20', status: 'active' },
          { id: 'p-2', vehicleId: '2', title: 'معايرة ميزان الإطارات وفحص عمق المداس للمحاور', dueDate: '2026-05-15', status: 'overdue' },
          { id: 'p-3', vehicleId: '3', title: 'فحص واختبار فعالية منظومة الفرامل والصيانة الوقائية لها', dueDate: '2026-05-29', status: 'due-soon' },
          { id: 'p-4', vehicleId: '4', title: 'تنظيف وغسيل فلاتر التكييف ومروحة التبريد المساعدة', dueDate: '2026-05-31', status: 'active' }
        ];
      }

      const vehiclesRaw = localStorage.getItem('fleet_vehicles_v3') || localStorage.getItem('fleet_vehicles_v2');
      let vehiclesList: any[] = [];
      if (vehiclesRaw) {
        try {
          vehiclesList = JSON.parse(vehiclesRaw);
        } catch (e) {}
      }
      if (!vehiclesList || vehiclesList.length === 0) {
        vehiclesList = staticVehicles;
      }

      const systemDate = new Date('2026-05-23');
      const notifiedStr = localStorage.getItem('fleet_notified_schedules_48h') || '[]';
      let notifiedIds: string[] = [];
      try {
        notifiedIds = JSON.parse(notifiedStr);
      } catch (e) {}

      let newNotificationsAdded = false;
      const updatedNotifiedIds = [...notifiedIds];
      const newNotifsToAppend: any[] = [];

      schedules.forEach(sched => {
        if (sched.status === 'paused') return;
        
        const dueDateObj = new Date(sched.dueDate);
        const diffTime = dueDateObj.getTime() - systemDate.getTime();
        const diffHours = diffTime / (1000 * 60 * 60);

        // Within 48 hours, in the future and not notified yet
        if (diffHours > 0 && diffHours <= 48 && !notifiedIds.includes(sched.id)) {
          const v = vehiclesList.find(veh => veh.id === sched.vehicleId) || { name: `مركبة #${sched.vehicleId}`, plateNumber: '' };
          const vName = v.name;
          const vPlate = v.plateNumber ? ` (${v.plateNumber})` : '';

          updatedNotifiedIds.push(sched.id);

          const preciseTimeAr = '2026/05/23 - 08:00:00 ص';
          const preciseTimeEn = '2026-05-23 08:00:00 AM';

          const newNotif = {
            id: `notif-pm-48h-${sched.id}`,
            type: 'warning' as 'warning' | 'info' | 'success' | 'danger',
            titleAr: 'تنبيه: اقتراب موعد صيانة وقائية (خلال ٤٨ ساعة) ⚠️',
            titleEn: 'Alert: Scheduled PM Approaching (Within 48h) ⚠️',
            msgAr: `تنبيه للفنيين والمديرين: يرجى التحضير لصيانة المركبة "${vName}"${vPlate} - الخدمة: "${sched.title}" المجدولة بتاريخ ${sched.dueDate}.`,
            msgEn: `Alert for technicians & managers: Prepare for servicing vehicle "${vName}"${vPlate} - Service: "${sched.title}" scheduled on ${sched.dueDate}.`,
            timeAr: preciseTimeAr,
            timeEn: preciseTimeEn,
            read: false
          };

          newNotifsToAppend.push(newNotif);
          newNotificationsAdded = true;
        }
      });

      if (newNotificationsAdded) {
        localStorage.setItem('fleet_notified_schedules_48h', JSON.stringify(updatedNotifiedIds));
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const filteredNewNotifs = newNotifsToAppend.filter(n => !existingIds.has(n.id));
          return [...filteredNewNotifs, ...prev];
        });
      }
    };

    const timer = setTimeout(() => {
      checkUpcomingPeriodicMaintenance();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (notificationsFilter === 'all') return true;
    
    const textAr = (n.titleAr + ' ' + n.msgAr).toLowerCase();
    const textEn = (n.titleEn + ' ' + n.msgEn).toLowerCase();
    
    if (notificationsFilter === 'initial') {
      return textAr.includes('مبدئي') || textAr.includes('تذكرة') || textAr.includes('بلاغ') || textAr.includes('مخزون منخفض') || textEn.includes('initial') || textEn.includes('ticket') || textEn.includes('stock');
    }
    if (notificationsFilter === 'final') {
      return textAr.includes('نهائي') || textAr.includes('ما بعد الصيانة') || textEn.includes('final') || textEn.includes('post-maintenance');
    }
    if (notificationsFilter === 'quality') {
      return textAr.includes('جودة') || textAr.includes('اعتماد') || textAr.includes('سلامة') || textEn.includes('quality') || textEn.includes('certification') || textEn.includes('audit');
    }
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleNotificationClick = (n: typeof notifications[0]) => {
    markAsRead(n.id);
    setIsNotificationsOpen(false);

    if (n.id === '1') {
      setActiveTab('inventory');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('notification-navigate', { detail: { tab: 'inventory', filter: 'toyota' } }));
      }, 100);
    } else if (n.id === '2') {
      setActiveTab('maintenance');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('notification-navigate', { detail: { tab: 'maintenance', item: '9823' } }));
      }, 100);
    } else if (n.id === '3') {
      setActiveTab('periodic-maintenance');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('notification-navigate', { detail: { tab: 'periodic-maintenance', item: '4412' } }));
      }, 100);
    } else if (n.id === '4') {
      setActiveTab('workshops');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('notification-navigate', { detail: { tab: 'workshops', search: 'شمال الرياض' } }));
      }, 100);
    } else if (n.id.startsWith('notif-pm-48h-')) {
      setActiveTab('periodic-maintenance');
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.log("Audio contexts aren't supported or allowed yet", e);
    }
  };

  const handleSimulatedScan = (plateNumber: string) => {
    playScanBeep();
    setScannedFeedback(plateNumber);
    
    setTimeout(() => {
      setScannedFeedback(null);
      setIsBarcodeModalOpen(false);
      
      // Navigate to vehicles tab
      setActiveTab('vehicles');
      
      // Dispatch custom event to let Vehicles.tsx know a vehicle was scanned
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('barcode-scanned', { 
          detail: { plateNumber } 
        }));
      }, 150);
    }, 800);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    const timeString = new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Add User Message
    setChatHistory(prev => [...prev, { sender: 'user', text: userText, time: timeString }]);
    setChatMessage('');

    // Generate responsive bot feedback matching user input
    setTimeout(() => {
      let responseText = '';
      const textLower = userText.toLowerCase();

      if (textLower.includes('اشتراك') || textLower.includes('باقة') || textLower.includes('sub') || textLower.includes('plan') || textLower.includes('bill')) {
        responseText = language === 'ar' 
          ? 'بخصوص باقة بريميوم كلاس النشطة، متبقي 6 أيام. يمكنك تحديث دورة الدفع الفوترة، أو التحميل الفوري للفواتير عبر قسم "إدارة الاشتراك والفوترة" المناحة في لوحة القيادة بنجاح.'
          : 'Regarding your Premium Class SaaS Plan (6 days remaining), you can upgrade your package or download latest PDF financial statements directly in the "Subscription & SaaS Billing" tab.';
      } else if (textLower.includes('صيانة') || textLower.includes('فني') || textLower.includes('repair') || textLower.includes('tech')) {
        responseText = language === 'ar'
          ? 'تتم حالياً فلترة الفنيين أوتوماتيكياً بالاستناد على ورش الهيت ماب وضغط العمل لضمان سرعة إسناد أوامر العمل الطارئة.'
          : 'Technicians are currently auto-assigned using regional heatmaps and cell occupancy values to prevent workflow bottlenecks.';
      } else if (textLower.includes('مخزن') || textLower.includes('قطع') || textLower.includes('inv') || textLower.includes('part')) {
        responseText = language === 'ar'
          ? 'إدارة مخازن Axoventra تدعم فحص حركة العتاد وربط استهلاك البواجي ومرشحات الزيت بأوامر الصيانة (Work Orders) الجارية.'
          : 'Stock inventory tracking monitors spare oil filters, spark plugs, and tires, updating stock levels on active work orders in real-time.';
      } else {
        responseText = language === 'ar'
          ? 'تلقينا رسالتك بتقدير كامل! لقد قمت بفتح تذكرة دعم رقمي للورشة. الفنيون ومسؤولو SaaS سيتصلون بك قريباً لمعايرة طلبك.'
          : 'Message received and indexed successfully! A custom support ticket has been instantiated in your logs, dispatching feedback parameters shortly.';
      }

      setChatHistory(prev => [...prev, { sender: 'bot', text: responseText, time: timeString }]);
    }, 850);
  };

  const handleCreateTicket = () => {
    const randomTicket = 'TIC-' + Math.floor(100000 + Math.random() * 900000);
    setSupportTicketId(randomTicket);
  };

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStaff = () => {
    if (!newStaffName.trim()) return;
    const newStaff = {
      id: Date.now(),
      name: newStaffName,
      role: newStaffRole,
      status: 'نشط',
      permissions: ['scan_barcode'],
      mfaEnabled: false,
      mfaMethod: 'app' as const,
      maxWorkOrderValue: 8000,
      allowedHours: 'any' as const,
      ipRestriction: '',
      maxActiveSessions: 2
    };
    const updated = [...staffList, newStaff];
    setStaffList(updated);
    setNewStaffName('');
  };

  const handleRemoveStaff = (id: number) => {
    const updated = staffList.filter(item => item.id !== id);
    setStaffList(updated);
    if (editingStaffId === id) {
      setEditingStaffId(null);
    }
  };

  const handleStartEditStaff = (staff: {
    id: number;
    name: string;
    role: string;
    status: string;
    permissions?: string[];
    mfaEnabled?: boolean;
    mfaMethod?: 'app' | 'sms' | 'email';
    maxWorkOrderValue?: number;
    allowedHours?: 'any' | 'business' | 'daytime';
    ipRestriction?: string;
    maxActiveSessions?: number;
  }) => {
    setEditingStaffId(staff.id);
    setEditingStaffName(staff.name);
    setEditingStaffRole(staff.role);
    setEditingStaffPermissions(staff.permissions || []);
    setEditingStaffMfaEnabled(staff.mfaEnabled ?? false);
    setEditingStaffMfaMethod(staff.mfaMethod ?? 'app');
    setEditingStaffMaxWorkOrderValue(staff.maxWorkOrderValue ?? 10000);
    setEditingStaffAllowedHours(staff.allowedHours ?? 'any');
    setEditingStaffIpRestriction(staff.ipRestriction ?? '');
    setEditingStaffMaxActiveSessions(staff.maxActiveSessions ?? 2);
  };

  const handleSaveEditStaff = () => {
    if (!editingStaffId || !editingStaffName.trim()) return;
    const updated = staffList.map(item => {
      if (item.id === editingStaffId) {
        return {
          ...item,
          name: editingStaffName,
          role: editingStaffRole,
          permissions: editingStaffPermissions,
          mfaEnabled: editingStaffMfaEnabled,
          mfaMethod: editingStaffMfaMethod,
          maxWorkOrderValue: editingStaffMaxWorkOrderValue,
          allowedHours: editingStaffAllowedHours,
          ipRestriction: editingStaffIpRestriction,
          maxActiveSessions: editingStaffMaxActiveSessions
        };
      }
      return item;
    });
    setStaffList(updated);
    setEditingStaffId(null);
  };

  const handleCancelEditStaff = () => {
    setEditingStaffId(null);
  };

  const handleToggleEditPermission = (permission: string) => {
    setEditingStaffPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUserUpdate) {
      onUserUpdate({
        ...user,
        name: profileName,
        title: profileTitle,
        avatar: profileAvatar
      });
    }
    // Save custom branding parameters
    localStorage.setItem('saas_brand_name', saasBrandName);
    localStorage.setItem('saas_brand_desc', saasBrandDesc);
    localStorage.setItem('saas_brand_logo', saasBrandLogo);
    localStorage.setItem('saas_admin_pin', adminPin);
    localStorage.setItem('saas_brand_color', saasBrandColor);
    localStorage.setItem('saas_brand_theme', brandTheme);
    localStorage.setItem('saas_brand_primary_color', brandPrimaryColor);
    localStorage.setItem('saas_staff_list', JSON.stringify(staffList));
    localStorage.setItem('saas_biometric_enabled', biometricEnabled ? 'true' : 'false');
    localStorage.setItem('saas_read_only_mode', readOnlyMode ? 'true' : 'false');
    window.dispatchEvent(new Event('storage')); // trigger update in App.tsx

    setShowSaveFeedback(true);
    setTimeout(() => {
      setShowSaveFeedback(false);
      setIsSettingsModalOpen(false);
    }, 1200);
  };

  React.useEffect(() => {
    const handleOpenScanner = () => setIsBarcodeModalOpen(true);
    window.addEventListener('open-barcode-scanner', handleOpenScanner);
    return () => window.removeEventListener('open-barcode-scanner', handleOpenScanner);
  }, []);

  return (
    <div 
      className="flex h-screen bg-[#f4f6fa] dark:bg-[#05070a] font-sans text-slate-950 dark:text-slate-100 overflow-hidden transition-all duration-500" 
      dir={dir}
    >
      <style>{`
        :root, .dark, body, html {
          --color-brand-blue-50: ${adjustColorBrightness(brandPrimaryColor, 92)} !important;
          --color-brand-blue-100: ${adjustColorBrightness(brandPrimaryColor, 80)} !important;
          --color-brand-blue-250: ${adjustColorBrightness(brandPrimaryColor, 60)} !important; /* support legacy if any */
          --color-brand-blue-200: ${adjustColorBrightness(brandPrimaryColor, 60)} !important;
          --color-brand-blue-300: ${adjustColorBrightness(brandPrimaryColor, 40)} !important;
          --color-brand-blue-400: ${adjustColorBrightness(brandPrimaryColor, 20)} !important;
          --color-brand-blue-500: ${brandPrimaryColor} !important;
          --color-brand-blue-600: ${adjustColorBrightness(brandPrimaryColor, -15)} !important;
          --color-brand-blue-700: ${adjustColorBrightness(brandPrimaryColor, -30)} !important;
          --color-brand-blue-800: ${adjustColorBrightness(brandPrimaryColor, -45)} !important;
          --color-brand-blue-900: ${adjustColorBrightness(brandPrimaryColor, -60)} !important;
        }
      `}</style>
      
      {/* Floating Sync / Offline Toast Overlay */}
      <AnimatePresence>
        {syncToastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-4.5 py-3 bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md text-white text-xs font-black rounded-xl shadow-xl border border-slate-700/50"
          >
            {isSyncing ? (
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
            ) : isOffline ? (
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            )}
            <span className="leading-tight text-[11px] font-sans antialiased text-slate-100">
              {syncToastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Maintenance Status Change Alert Toast with dynamic animations */}
      <AnimatePresence>
        {activeSmartAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: dir === 'rtl' ? 100 : -100 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
            className={`fixed bottom-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-[110] max-w-sm w-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 text-white overflow-hidden p-4.5`}
            dir={dir}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, -15, 15, -15, 15, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
                  className={`p-2 rounded-xl ${
                    activeSmartAlert.newStatus === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  <Bell size={18} className="animate-pulse" />
                </motion.div>
                <div>
                  <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase block">
                    {language === 'ar' ? 'إشعار صيانة ذكي' : 'SMART MAINTENANCE ALERT'}
                  </span>
                  <h5 className="text-xs font-black text-slate-100">
                    {language === 'ar' ? 'تحديث حالة الآلية' : 'Vehicle Status Changed'}
                  </h5>
                </div>
              </div>
              <button
                onClick={() => setActiveSmartAlert(null)}
                className="text-slate-400 hover:text-slate-100 p-1.5 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3.5 text-right" dir={dir}>
              {/* Vehicle Title */}
              <div className="flex items-center justify-between bg-slate-850/60 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold">
                  {language === 'ar' ? 'المركبة/الآلية:' : 'Vehicle:'}
                </span>
                <span className="text-xs font-black text-indigo-300">
                  {activeSmartAlert.vehicleName}
                </span>
              </div>

              {/* Status Transition Badges */}
              <div className="flex items-center justify-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50" dir="ltr">
                {/* Old status */}
                <span className="px-2.5 py-1 text-[9px] font-bold text-slate-400 bg-slate-800/80 rounded-lg">
                  {language === 'ar'
                    ? activeSmartAlert.oldStatus === 'pending'
                      ? 'قيد الانتظار'
                      : activeSmartAlert.oldStatus === 'in-progress'
                      ? 'جاري العمل'
                      : 'مكتمل'
                    : activeSmartAlert.oldStatus}
                </span>

                {/* Arrow */}
                <span className="text-slate-500 text-xs font-black animate-pulse">──▶</span>

                {/* New Status */}
                <span
                  className={`px-2.5 py-1 text-[9px] font-black rounded-lg shadow-sm ${
                    activeSmartAlert.newStatus === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {language === 'ar'
                    ? activeSmartAlert.newStatus === 'pending'
                      ? 'قيد الانتظار'
                      : activeSmartAlert.newStatus === 'in-progress'
                      ? 'جاري العمل'
                      : 'مكتمل'
                    : activeSmartAlert.newStatus}
                </span>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-300 font-medium line-clamp-2 leading-relaxed bg-slate-800/20 p-2 rounded-xl text-center">
                {language === 'ar' ? activeSmartAlert.descriptionAr : activeSmartAlert.descriptionEn}
              </p>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center gap-2 mt-4.5 pt-3.5 border-t border-slate-800/80">
              <button
                onClick={() => {
                  setActiveTab('maintenance');
                  setTimeout(() => {
                    window.dispatchEvent(
                      new CustomEvent('notification-navigate', {
                        detail: { tab: 'maintenance', item: activeSmartAlert.orderId }
                      }
                    ));
                  }, 150);
                  setActiveSmartAlert(null);
                }}
                className={`flex-1 text-[10px] font-black py-2 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  activeSmartAlert.newStatus === 'completed'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20'
                }`}
              >
                <Wrench size={12} />
                <span>{language === 'ar' ? 'انتقال للتفاصيل والقطع' : 'Inspect Ticket & Parts'}</span>
              </button>
            </div>

            {/* Countdown Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-800/50">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 9, ease: 'linear' }}
                className={`h-full ${
                  activeSmartAlert.newStatus === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden md:flex flex-col bg-white dark:bg-[#0f1422] border-slate-200 dark:border-slate-800/80 transition-all duration-300 ease-in-out ${
          dir === 'rtl' ? 'border-l' : 'border-r'
        } ${collapsed ? 'w-14' : 'w-56'}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-[#f1f5f9] dark:border-slate-800/60">
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 bg-brand-blue-500 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm shadow-brand-blue-500/20 overflow-hidden">
                {saasBrandLogo ? (
                  <img src={saasBrandLogo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Wrench size={14} className="text-white" />
                )}
              </div>
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white select-none">
                {saasBrandName ? saasBrandName : 'FleetAurvexis'}
              </span>
            </motion.div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
          >
            {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} className={dir === 'ltr' ? 'rotate-180' : ''} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {GROUP_ORDER.map((group, groupIdx) => {
            const itemsInGroup = filteredMenuItems.filter(item => item.group === group);
            if (itemsInGroup.length === 0) return null;

            return (
              <div key={group} className="space-y-1">
                {collapsed ? (
                  groupIdx > 0 && <div className="my-1 border-t border-slate-100 dark:border-slate-800/40" />
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group)}
                    className="w-full pt-2 pb-1 px-2.5 text-[12.5px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center justify-between hover:text-brand-blue-500 dark:hover:text-[#38bdf8] transition-colors cursor-pointer text-right group"
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400 shrink-0" />
                      <span className="truncate">{language === 'ar' ? GROUP_INFOS[group].ar : GROUP_INFOS[group].en}</span>
                    </div>
                    <ChevronDown size={10} className={`shrink-0 transition-transform duration-200 ${expandedGroups[group] ? 'rotate-0' : (dir === 'rtl' ? 'rotate-90' : '-rotate-90')}`} />
                  </button>
                )}
                {(!collapsed && expandedGroups[group]) && (
                  <div className="space-y-0.5">
                    {itemsInGroup.map((item) => (
                      <SidebarItem
                        key={item.id}
                        icon={item.icon}
                        label={t(`menu.${item.id}`)}
                        active={activeTab === item.id}
                        onClick={() => setActiveTab(item.id)}
                        collapsed={collapsed}
                      />
                    ))}
                  </div>
                )}
                {collapsed && (
                  <div className="space-y-0.5">
                    {itemsInGroup.map((item) => (
                      <SidebarItem
                        key={item.id}
                        icon={item.icon}
                        label={t(`menu.${item.id}`)}
                        active={activeTab === item.id}
                        onClick={() => setActiveTab(item.id)}
                        collapsed={collapsed}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Subscription box - fully operational */}
        {!collapsed && (
          <div className="mx-2 mb-3 p-3 bg-brand-blue-50 dark:bg-brand-blue-900/10 border border-brand-blue-100/60 dark:border-slate-800/60 rounded-2xl shadow-xs select-none">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs">👑</span>
              <p className="text-[10px] font-black text-brand-blue-700 dark:text-brand-blue-400 leading-none">
                {t('menu.premiumClass')}
              </p>
            </div>
            <p className="text-[10px] text-brand-blue-600/80 dark:text-brand-blue-500/80 mb-3">
              {t('menu.daysRemaining')}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button 
                onClick={() => setActiveTab('saas-billing')}
                className="bg-brand-blue-500 hover:bg-brand-blue-600 text-white text-[9.5px] py-1.5 px-1 rounded-lg font-black transition-all text-center cursor-pointer shadow-xs shadow-brand-blue-500/10"
              >
                {t('menu.renew')}
              </button>
              <button 
                onClick={() => setIsSupportModalOpen(true)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent text-[9.5px] py-1.5 px-1 rounded-lg font-black text-center transition-all cursor-pointer"
              >
                {t('menu.support')}
              </button>
            </div>
          </div>
        )}

        <div className="p-2 border-t border-slate-200 dark:border-slate-800">
          <SidebarItem
            icon={<Settings size={16} />}
            label={t('menu.settings')}
            onClick={() => setIsSettingsModalOpen(true)}
            collapsed={collapsed}
          />
          <SidebarItem
            icon={<LogOut size={16} />}
            label={t('menu.logout')}
            onClick={() => {
              if (onLogout) {
                onLogout();
              }
            }}
            collapsed={collapsed}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-4 sm:px-6 z-10 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent shadow-xs cursor-pointer shrink-0"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block w-full max-w-sm mx-auto">
              <span className={`absolute inset-y-0 flex items-center text-slate-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`}>
                <Search size={14} />
              </span>
              <input 
                id="header-search-input"
                type="text"
                placeholder={t('common.search')}
                onChange={(e) => {
                  window.dispatchEvent(new CustomEvent('barcode-scanned', { 
                    detail: { plateNumber: e.target.value } 
                  }));
                  if (activeTab !== 'vehicles' && e.target.value.trim() !== '') {
                    setActiveTab('vehicles');
                  }
                }}
                className={`w-full py-2 bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-brand-blue-500 rounded-full transition-all outline-none text-xs font-semibold dark:text-white ${
                  dir === 'rtl' ? 'pr-9 pl-4' : 'pl-9 pr-4'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
             {/* General Barcode Scanner Button */}
             <button 
              onClick={() => setIsBarcodeModalOpen(true)}
              className="h-10 px-3 text-brand-blue-600 dark:text-brand-blue-400 bg-brand-blue-50/70 dark:bg-brand-blue-950/25 hover:bg-brand-blue-100 dark:hover:bg-brand-blue-900/30 border border-brand-blue-100/30 dark:border-brand-blue-950/40 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
              title={t('common.barcodeScanner')}
             >
              <Scan size={16} />
              <span className="text-[10px] font-black hidden lg:inline-block leading-none">
                {t('common.barcodeScanner').split(' ')[0]}
              </span>
            </button>

            {/* External Marketing Site Preview Action */}
            {onNavigateToMarketing && (
              <button 
                onClick={onNavigateToMarketing}
                className="h-10 px-3 text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 border border-indigo-100/40 dark:border-slate-800/40 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                title={language === 'ar' ? 'معاينة الموقع والواجهة التسويقية' : 'Preview External Marketing Site'}
              >
                <Globe size={16} className="text-indigo-505 dark:text-indigo-400" />
                <span className="text-[10px] font-black hidden lg:inline-block leading-none">
                  {language === 'ar' ? 'الموقع العام' : 'Public Site'}
                </span>
              </button>
            )}


            {/* Quick Language Toggle Button */}
            <button 
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="h-10 px-3 text-brand-blue-600 dark:text-[#38bdf8] bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/90 dark:hover:bg-slate-700 border border-slate-200/40 dark:border-slate-705 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0 hover:-translate-y-0.5"
              title={language === 'ar' ? 'تغيير اللغة إلى الإنجليزية' : 'Switch Language to Arabic'}
            >
              <Globe size={15} className="animate-spin-slow text-violet-500" />
              <span className="text-[10px] font-black leading-none">
                {language === 'ar' ? 'English 🇺🇸' : 'العربية 🇸🇦'}
              </span>
            </button>

            {/* Quick Access / Mode Changer (Demo Only) */}
            <div className="relative">
              <button 
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="h-10 flex items-center justify-center gap-1.5 px-3 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/90 dark:hover:bg-slate-700/95 border border-slate-200/40 dark:border-slate-700/60 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Shield size={14} className="text-brand-blue-600" />
                <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 hidden lg:block">
                  {t('common.role')}: {
                    user.role === 'admin' 
                      ? t('common.roleAdmin') 
                      : user.role === 'technician' 
                        ? t('common.roleTechnician') 
                        : user.role === 'viewer'
                          ? t('common.roleViewer')
                          : (language === 'ar' ? 'سائق نقل ثقيل' : 'Heavy Driver')
                  }
                </span>
                <ChevronDown size={12} className={`text-slate-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {roleDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setRoleDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute top-12 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl z-30 p-2 overflow-hidden ${
                        dir === 'rtl' ? 'left-0' : 'right-0'
                      }`}
                    >
                      <p className={`px-3 py-2 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 ${
                        dir === 'rtl' ? 'text-right' : 'text-left'
                      }`}>
                        {language === 'ar' ? 'تبديل الصلاحيات (تجريبي)' : 'Swap Roles (Walkthrough)'}
                      </p>
                      {[
                        { id: 'admin', label: t('common.roleAdmin') || (language === 'ar' ? '🔑 مدير الصيانة (كامل)' : '🔑 Maintenance Admin (Full)') },
                        { id: 'technician', label: t('common.roleTechnician') || (language === 'ar' ? '🔧 فني ميكانيك أول' : '🔧 Lead Technician') },
                        { id: 'viewer', label: t('common.roleViewer') || (language === 'ar' ? '👁️ مراقب جودة ونظام (معاينة)' : '👁️ Quality Observer (Read-only)') },
                        { id: 'driver', label: t('login.roleDriver') || (language === 'ar' ? '🚛 سائق نقل ثقيل' : '🚛 Heavy Driver') },
                      ].map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            onRoleChange(r.id as UserRole);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                            dir === 'rtl' ? 'text-right' : 'text-left'
                          } ${
                            user.role === r.id 
                              ? 'bg-brand-blue-50 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Connection / Synchronization Status Badge */}
            {isSyncing ? (
              <div 
                className="h-10 px-3 flex items-center justify-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-650 dark:text-amber-400 border border-amber-150 dark:border-amber-900/50 rounded-xl shadow-xs shrink-0"
                title={language === 'ar' ? 'جاري مزامنة تعديلات الصيانة...' : 'Syncing local changes to server...'}
              >
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping inline-block" />
                <span className="text-[10px] md:text-[11px] font-black leading-none text-amber-705 dark:text-amber-300">
                  {language === 'ar' ? 'جاري المزامنة...' : 'Syncing...'}
                </span>
              </div>
            ) : isOffline ? (
              <div 
                className="h-10 px-3 flex items-center justify-center gap-1.5 bg-rose-50/90 dark:bg-rose-950/20 text-rose-650 dark:text-rose-400 border border-rose-150 dark:border-rose-900/40 rounded-xl shadow-xs shrink-0"
                title={language === 'ar' ? 'وضعية العمل دون اتصال نشطة (تُحفظ التعديلات بالمتصفح)' : 'Running locally in offline cache mode'}
              >
                <WifiOff size={14} className="text-rose-500 shrink-0 animate-bounce" />
                <span className="text-[10px] md:text-[11px] font-black leading-none text-rose-700 dark:text-rose-300">
                  {language === 'ar' ? `دون اتصال ${syncQueueCount > 0 ? `(${syncQueueCount} معلق)` : ''}` : `Offline ${syncQueueCount > 0 ? `(${syncQueueCount} pending)` : ''}`}
                </span>
              </div>
            ) : (
              <div 
                className="h-10 px-3 flex items-center justify-center gap-1.5 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-450 border border-emerald-100/30 rounded-xl shadow-xs shrink-0"
                title={language === 'ar' ? 'الاتصال مستقر مع خادم الصيانة المركزي' : 'Stable server connection'}
              >
                <Wifi size={14} className="text-emerald-500 shrink-0" />
                <span className="text-[10px] font-black leading-none text-emerald-700 dark:text-emerald-400 hidden sm:inline-block">
                  {language === 'ar' ? 'متصل' : 'Online'}
                </span>
              </div>
            )}

            {/* Overdue Maintenance Warning Badge */}
            {overdueMaintenanceCount > 0 && (
              <button
                id="overdue-maintenance-warning-badge"
                onClick={() => {
                  setActiveTab('periodic-maintenance');
                  setTimeout(() => {
                    const scrollOption = { behavior: 'smooth' as ScrollBehavior };
                    document.getElementById('periodic-maintenance-section')?.scrollIntoView(scrollOption);
                    window.dispatchEvent(new CustomEvent('notification-navigate', { detail: { tab: 'periodic-maintenance', overdueOnly: true } }));
                  }, 150);
                }}
                className="h-10 px-3 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-red-650 dark:text-rose-405 border border-red-150 dark:border-rose-900/50 rounded-xl transition-all cursor-pointer shadow-xs shrink-0 animate-pulse"
                title={language === 'ar' ? `تنبيه: يوجد ${overdueMaintenanceCount} خدمات صيانة متأخرة!` : `System Alert: ${overdueMaintenanceCount} periodic maintenance services are overdue!`}
              >
                <AlertTriangle size={15} className="shrink-0 text-red-650 dark:text-rose-400" />
                <span className="text-[10px] md:text-[11px] font-black leading-none text-red-750 dark:text-rose-300">
                  {language === 'ar' ? `${overdueMaintenanceCount} صيانات متأخرة` : `${overdueMaintenanceCount} PM Overdue`}
                </span>
              </button>
            )}

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`w-10 h-10 flex items-center justify-center hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl border border-slate-205/10 hover:border-slate-205/10 relative transition-all cursor-pointer shrink-0 shadow-xs ${
                  isNotificationsOpen ? 'text-brand-blue-600 bg-slate-100 dark:bg-slate-800' : 'text-slate-500 dark:text-slate-400'
                }`}
                title={language === 'ar' ? 'الإشعارات الميدانية والتنبيهات' : 'Field Notifications & Alerts'}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[9px] font-black text-white bg-red-650 rounded-full border border-white dark:border-slate-900 shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsNotificationsOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute top-12 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-30 overflow-hidden ${
                        dir === 'rtl' ? 'left-0' : 'right-0'
                      }`}
                    >
                      {/* Header */}
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell size={16} className="text-brand-blue-600 dark:text-brand-blue-400 animate-pulse" />
                          <h4 className="text-sm font-black text-slate-800 dark:text-slate-150">
                            {language === 'ar' ? 'الإشعارات الميدانية والتنبيهات' : 'Field Notifications & Alerts'}
                          </h4>
                        </div>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                          >
                            {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                          </button>
                        )}
                      </div>

                      {/* Inspection Stages Mini Dashboard */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 select-none">
                        <div className="text-[9.5px] font-extrabold text-slate-400 dark:text-slate-550 mb-2 uppercase tracking-wide flex items-center gap-1">
                          <Activity size={11} className="text-brand-blue-500 shrink-0" />
                          <span>{language === 'ar' ? 'حالة فحص الأسطول الميدانية اللحظية (اضغط للتصفية)' : 'Real-time Fleet Inspection Stages (Click to Filter)'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {/* Stage 1 */}
                          <button
                            onClick={() => setNotificationsFilter(notificationsFilter === 'initial' ? 'all' : 'initial')}
                            className={`p-2 bg-white dark:bg-slate-900 border rounded-xl hover:shadow-xs transition-all flex flex-col items-center justify-center text-center cursor-pointer outline-none ${
                              notificationsFilter === 'initial' 
                                ? 'border-amber-400 dark:border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-400/30' 
                                : 'border-slate-100 dark:border-slate-800'
                            }`}
                          >
                            <span className="text-xs font-black text-amber-550 dark:text-amber-400 block mb-0.5">{inspectionStats.initial}</span>
                            <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 leading-tight">
                              {language === 'ar' ? 'الفحص المبدئي' : 'Initial Check'}
                            </span>
                          </button>
                          
                          {/* Stage 2 */}
                          <button
                            onClick={() => setNotificationsFilter(notificationsFilter === 'final' ? 'all' : 'final')}
                            className={`p-2 bg-white dark:bg-slate-900 border rounded-xl hover:shadow-xs transition-all flex flex-col items-center justify-center text-center cursor-pointer outline-none ${
                              notificationsFilter === 'final' 
                                ? 'border-indigo-400 dark:border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-400/30' 
                                : 'border-slate-100 dark:border-slate-800'
                            }`}
                          >
                            <span className="text-xs font-black text-indigo-650 dark:text-indigo-400 block mb-0.5">{inspectionStats.final}</span>
                            <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 leading-tight">
                              {language === 'ar' ? 'الفحص النهائي' : 'Final Check'}
                            </span>
                          </button>

                          {/* Stage 3 */}
                          <button
                            onClick={() => setNotificationsFilter(notificationsFilter === 'quality' ? 'all' : 'quality')}
                            className={`p-2 bg-white dark:bg-slate-900 border rounded-xl hover:shadow-xs transition-all flex flex-col items-center justify-center text-center cursor-pointer outline-none ${
                              notificationsFilter === 'quality' 
                                ? 'border-emerald-400 dark:border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-405/30' 
                                : 'border-slate-100 dark:border-slate-800'
                            }`}
                          >
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mb-0.5">{inspectionStats.certified}</span>
                            <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 leading-tight">
                              {language === 'ar' ? 'معتمد الجودة' : 'Quality Passed'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Unified Segment Filtering Controls */}
                      <div className="px-3 py-2 bg-slate-50/50 dark:bg-slate-900/35 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between gap-1 select-none">
                        <button
                          onClick={() => setNotificationsFilter('all')}
                          className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                            notificationsFilter === 'all'
                              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                              : 'bg-slate-100/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80'
                          }`}
                        >
                          {language === 'ar' ? 'كل التنبيهات' : 'All'}
                        </button>
                        <button
                          onClick={() => setNotificationsFilter('initial')}
                          className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                            notificationsFilter === 'initial'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                          <span>{language === 'ar' ? 'مبدئي' : 'Initial'}</span>
                        </button>
                        <button
                          onClick={() => setNotificationsFilter('final')}
                          className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                            notificationsFilter === 'final'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-indigo-600/10 text-indigo-700 dark:text-indigo-455 hover:bg-indigo-600/20'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0" />
                          <span>{language === 'ar' ? 'نهائي' : 'Final'}</span>
                        </button>
                        <button
                          onClick={() => setNotificationsFilter('quality')}
                          className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                            notificationsFilter === 'quality'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-450 hover:bg-emerald-600/20'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full shrink-0" />
                          <span>{language === 'ar' ? 'جودة' : 'Quality'}</span>
                        </button>
                      </div>

                      {/* Content */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/10 dark:bg-slate-900/15">
                        {filteredNotifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 dark:text-slate-550 flex flex-col items-center gap-2">
                            <Bell size={28} className="opacity-20 text-slate-400 mb-1 animate-bounce" />
                            <p className="text-xs font-bold leading-normal">
                              {language === 'ar' 
                                ? 'لا توجد إشعارات تطابق هذا الفلتر حالياً' 
                                : 'No notifications match this filter.'}
                            </p>
                            <button
                              onClick={() => setNotificationsFilter('all')}
                              className="text-[10px] font-bold text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer"
                            >
                              {language === 'ar' ? 'عرض جميع التنبيهات والطلبات' : 'Clear filter and view all'}
                            </button>
                          </div>
                        ) : (
                          filteredNotifications.map((n) => (
                            <div 
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start relative hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                !n.read ? 'bg-indigo-50/10 dark:bg-indigo-950/10' : ''
                              }`}
                            >
                              {/* Dot status for unread */}
                              {!n.read && (
                                <span className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-4 w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full`} />
                              )}

                              {/* Icon Indicator based on type */}
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                n.type === 'warning' 
                                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-500' 
                                  : n.type === 'danger' 
                                    ? 'bg-red-50 dark:bg-red-950/30 text-red-500' 
                                    : n.type === 'success' 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500' 
                                      : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500'
                              }`}>
                                <Bell size={14} className={!n.read ? 'animate-pulse' : ''} />
                              </div>

                              <div className={`min-w-0 pr-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                                <h5 className={`text-xs font-semibold ${!n.read ? 'text-slate-900 dark:text-white font-black animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {language === 'ar' ? n.titleAr : n.titleEn}
                                </h5>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                  {language === 'ar' ? n.msgAr : n.msgEn}
                                </p>
                                <span className="text-[9.5px] text-slate-400 dark:text-slate-550 font-extrabold flex items-center gap-1 mt-1.5 leading-none">
                                  <Clock size={11} className="text-slate-400 dark:text-slate-550 shrink-0" />
                                  <span>{language === 'ar' ? n.timeAr : n.timeEn}</span>
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-center">
                          <button 
                            onClick={clearAllNotifications}
                            className="text-[10px] text-red-500 hover:text-red-700 font-black cursor-pointer uppercase tracking-wider"
                          >
                            {language === 'ar' ? 'مسح الكل' : 'Clear All'}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Info */}
            <div className="flex items-center gap-3 pr-4 border-slate-200 dark:border-slate-800 border-r">
              <div className={`hidden sm:block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none mb-1">{profileName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0"></span>
                  <span>{user.title}</span>
                </p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/50 border-2 border-white dark:border-slate-800 overflow-hidden shadow-sm flex items-center justify-center">
                  {!hasHeaderAvatarError && user.avatar ? (
                    <img 
                      referrerPolicy="no-referrer"
                      src={user.avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      onError={() => setHasHeaderAvatarError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-brand-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center select-none">
                      <span>{profileName ? (profileName.startsWith('الفني ') ? profileName.substring(6, 7) : profileName.startsWith('المراقب ') ? profileName.substring(8, 9) : profileName.charAt(0)) : 'أ'}</span>
                    </div>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className={`flex-1 ${activeTab === 'maintenance-bot' ? 'flex flex-col overflow-hidden p-0' : 'overflow-y-auto p-4 md:p-6 lg:p-8'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={activeTab === 'maintenance-bot' ? 'w-full h-full flex flex-col flex-1' : 'max-w-[1400px] w-full mx-auto h-full space-y-6'}
            >
              {/* Page Sub-Header (Scrolls Naturally, Not Sticky) */}
              {activeTab !== 'maintenance-bot' && (
                <div className="bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-100 dark:border-slate-800/80 p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors duration-300 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-blue-500/10 text-brand-blue-600 dark:text-[#38bdf8] rounded-xl shrink-0">
                      {TAB_LABELS[activeTab]?.icon || <LayoutDashboard size={18} />}
                    </div>
                    <div>
                      <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                        {language === 'ar' ? TAB_LABELS[activeTab]?.ar : TAB_LABELS[activeTab]?.en}
                      </h1>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                        {language === 'ar' ? 'بوابة التشغيل الشاملة والتحكم بالأسطول' : 'Comprehensive Operations & Fleet Control Portal'}
                      </p>
                    </div>
                  </div>
                  <div className="w-full md:w-auto overflow-x-auto min-w-0 md:overflow-visible">
                    <Breadcrumbs activeTab={activeTab} setActiveTab={setActiveTab} language={language} variant="inline" />
                  </div>
                </div>
              )}

              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setMobileMenuOpen(false)}
               className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
               initial={{ x: dir === 'rtl' ? '100%' : '-100%' }}
               animate={{ x: 0 }}
               exit={{ x: dir === 'rtl' ? '100%' : '-100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className={`fixed inset-y-0 w-64 bg-[#f0f6f3] dark:bg-[#0c1411] z-50 md:hidden p-6 shadow-2xl border-slate-200 dark:border-slate-850/40 ${
                 dir === 'rtl' ? 'right-0 border-l' : 'left-0 border-r'
               }`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-blue-600 rounded flex items-center justify-center text-white overflow-hidden shadow-xs">
                    {saasBrandLogo ? (
                      <img src={saasBrandLogo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Wrench size={16} />
                    )}
                  </div>
                  <span className="text-md font-black text-slate-900 dark:text-white">
                    {saasBrandName ? saasBrandName : 'FleetAurvexis'}
                  </span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X size={18} className="text-slate-500 hover:text-slate-900 dark:text-emerald-300 dark:hover:text-white cursor-pointer" />
                </button>
              </div>
              <nav className="space-y-4 overflow-y-auto max-h-[60vh] mb-4 pr-1">
                {GROUP_ORDER.map((group) => {
                  const itemsInGroup = filteredMenuItems.filter(item => item.group === group);
                  if (itemsInGroup.length === 0) return null;

                  return (
                    <div key={group} className="space-y-1.5">
                      <div className="pb-1 px-2.5 text-[12px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
                        <span>{language === 'ar' ? GROUP_INFOS[group].ar : GROUP_INFOS[group].en}</span>
                      </div>
                      <div className="space-y-1">
                        {itemsInGroup.map((item) => (
                          <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            label={t(`menu.${item.id}`)}
                            active={activeTab === item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setMobileMenuOpen(false);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </nav>

              <div className="border-t border-slate-200/50 dark:border-slate-800 pt-3 space-y-1">
                <button 
                  onClick={() => {
                    setIsSettingsModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full p-2.5 text-xs font-bold rounded-xl text-slate-650 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                >
                  <Settings size={16} />
                  <span>{t('menu.settings')}</span>
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="flex items-center gap-2 w-full p-2.5 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                >
                  <LogOut size={16} />
                  <span>{t('menu.logout')}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Barcode Scanner Modal */}
      <AnimatePresence>
        {isBarcodeModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white dark:bg-[#0f1422] w-full max-w-lg rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className={`p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2.5 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  <div className="w-10 h-10 bg-brand-blue-550/10 dark:bg-brand-blue-900/40 text-brand-blue-500 rounded-xl flex items-center justify-center border border-brand-blue-100/30">
                    <Scan className="animate-pulse text-brand-blue-500" size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      {language === 'ar' ? 'قارئ واستشعار الباركود الذكي' : 'Intelligent Telemetric Barcode Reader'}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {saasBrandName ? `${saasBrandName} - ${language === 'ar' ? 'نظام فحص ومعالجة الأصول الرقمية' : 'Digital Asset Scanner'}` : (language === 'ar' ? 'FleetAurvexis - نظام فحص ومعالجة الأصول الرقمية' : 'FleetAurvexis - Digital Asset Scanner')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBarcodeModalOpen(false)}
                  className="p-2.5 bg-slate-150/40 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-500 rounded-xl transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Viewport content */}
              <div className="p-6 flex flex-col items-center gap-5">
                {/* Viewport Wrapper */}
                <div className="w-full h-44 bg-slate-950 rounded-2xl border-2 border-brand-blue-550/40 overflow-hidden relative flex flex-col items-center justify-center text-center shadow-inner">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                  
                  {/* Corners */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-brand-blue-500 rounded-tl-md" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-brand-blue-500 rounded-tr-md" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-brand-blue-500 rounded-bl-md" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-brand-blue-500 rounded-br-md" />

                  {/* Red Laser */}
                  <motion.div 
                    animate={{ y: [0, 165, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2.5px] bg-red-500 shadow-[0_0_12px_3px_rgba(239,68,68,0.95)] pointer-events-none z-10"
                    style={{ top: 0 }}
                  />

                  {/* Feedback */}
                  {scannedFeedback ? (
                    <motion.div 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-brand-green-500/95 flex flex-col items-center justify-center text-white z-20"
                    >
                      <Check className="w-12 h-12 mb-2 p-2.5 bg-white/20 rounded-full shrink-0 animate-bounce" />
                      <span className="text-sm font-black tracking-wide">
                        {language === 'ar' ? 'تم قراءة لوحة الترخيص بنجاح!' : 'Vehicle barcode matched!'}
                      </span>
                      <span className="text-[11px] font-black mt-1 font-mono tracking-widest bg-black/25 px-3 py-1 rounded-lg">
                        {scannedFeedback}
                      </span>
                    </motion.div>
                  ) : (
                    <div className="space-y-2.5 z-10 px-6">
                      <p className="text-xs text-brand-blue-400 font-extrabold tracking-widest leading-none">
                        {language === 'ar' ? 'جاري تشغيل المستشعر البصري...' : 'Instantiating optic lenses...'}
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-[320px] leading-relaxed mx-auto">
                        {language === 'ar' 
                          ? 'قرب ملصق الباركود المطبوع على هيكل المركبة أو لوحة الترخيص لتعديل العتاد فوراً.' 
                          : 'Position the custom plate label inside the scan container to immediately access and index its repairs history.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Simulated test cases */}
                <div className="w-full space-y-3">
                  <div className={`flex items-center justify-between ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                    <span className="text-[11px] font-black text-slate-400 dark:text-slate-500">
                      {language === 'ar' ? 'ملصقات تجريبية بالورشة للمحاكاة:' : 'Simulated workshop barcode labels:'}
                    </span>
                    <span className="text-[9px] font-black text-brand-blue-500 bg-brand-blue-50 dark:bg-brand-blue-900/40 px-2 py-0.5 rounded-full">
                      {language === 'ar' ? 'انقر للمحاكاة' : 'Click to scan'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { plate: 'أ ب ج 1234', name: language === 'ar' ? 'تويوتا بيك أب' : 'Toyota Tacoma Hilux' },
                      { plate: 'د هـ و 5678', name: language === 'ar' ? 'شاحنة مرسيدس أكتروس' : 'Mercedes-Benz Actros' },
                      { plate: 'ز ح ط 9012', name: language === 'ar' ? 'حافلة هيونداي' : 'Hyundai Transport Bus' },
                      { plate: 'ج ك ل 9182', name: language === 'ar' ? 'رافعة شوكية كات' : 'CAT Lift Truck heavy' },
                    ].map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSimulatedScan(item.plate)}
                        className={`p-3 bg-slate-50 hover:bg-slate-105 dark:bg-slate-800/20 dark:hover:bg-slate-800/60 border border-slate-150/45 dark:border-slate-800 hover:border-brand-blue-500/60 rounded-2xl flex flex-col justify-between cursor-pointer transition-all ${
                          dir === 'rtl' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <span className="text-[9.5px] font-black block text-slate-400 dark:text-slate-500 truncate w-full">{item.name}</span>
                        <div className={`flex items-center justify-between w-full mt-1.5 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[10px] font-mono font-black text-slate-800 dark:text-white tracking-wider bg-slate-200/50 dark:bg-slate-900/50 px-1.5 py-0.5 rounded-lg">
                            {item.plate}
                          </span>
                          <span className="text-[10.5px] text-brand-blue-500 font-extrabold flex items-center gap-1">
                            {language === 'ar' ? '📟 امسح' : '📟 scan'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual identity */}
                <div className="w-full border-t border-slate-100 dark:border-slate-800/50 pt-4 text-right">
                  <label className={`block text-[11px] font-black text-slate-500 dark:text-slate-450 mb-2 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    {language === 'ar' ? 'إدخال رقم لوحة / رمز يدوي:' : 'Manual Plate ID Registration:'}
                  </label>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const inputElement = e.currentTarget.elements.namedItem('manualBar') as HTMLInputElement;
                      if(inputElement && inputElement.value.trim()) {
                        handleSimulatedScan(inputElement.value.trim());
                      }
                    }}
                    className={`flex gap-2`}
                  >
                    <input 
                      name="manualBar"
                      type="text"
                      placeholder={language === 'ar' ? 'اكتب رمز اللوحة هنا للتأكيد...' : 'Type plate number to push...'}
                      className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:bg-white dark:focus:bg-slate-800 focus:border-brand-blue-500 rounded-xl outline-none text-xs font-bold dark:text-white"
                    />
                    <button 
                      type="submit"
                      className="px-5 py-2.5 bg-brand-blue-500 hover:bg-brand-blue-600 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0"
                    >
                      {language === 'ar' ? 'تأكيد' : 'Confirm'}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal - Fully Interactive with Left-Right Tab Layout */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <div className="fixed inset-0 bg-slate-50 dark:bg-[#070b13] z-[80] flex flex-col w-full h-full overflow-y-auto relative">
            {/* Elegant Ambient Purple/Indigo Radial Gradients for Background Depth */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-violet-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="w-full flex-1 flex flex-col text-slate-900 dark:text-white pb-16 relative z-10"
            >
              {/* Header */}
              <div className={`p-6 border-b border-violet-100 dark:border-violet-900/40 flex items-center justify-between bg-white/95 dark:bg-[#0f1422]/95 backdrop-blur-md shadow-xs shrink-0 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3.5 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  <button 
                    onClick={() => {
                      if (selectedSettingsTab !== null) {
                        setSelectedSettingsTab(null);
                      } else {
                        setIsSettingsModalOpen(false);
                      }
                    }}
                    className={`p-2.5 bg-slate-50 hover:bg-violet-50 dark:bg-[#131124] dark:hover:bg-violet-950/40 border border-slate-150 dark:border-violet-900/30 text-slate-600 dark:text-violet-300 rounded-2xl cursor-pointer flex items-center justify-center transition-all`}
                    title={language === 'ar' ? 'رجوع' : 'Back'}
                  >
                    <span className="text-sm font-black">←</span>
                    <span className="hidden sm:inline text-[10.5px] font-black mr-1 ml-1">{language === 'ar' ? (selectedSettingsTab !== null ? 'للإعدادات' : 'للنظام') : (selectedSettingsTab !== null ? 'Back' : 'System')}</span>
                  </button>
                  
                  {/* Beautiful Purple Settings Icon Container */}
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/20 rounded-2xl flex items-center justify-center shadow-xs">
                    <Settings className="text-violet-500 animate-spin-slow" size={20} />
                  </div>
                  
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      {selectedSettingsTab === null ? (
                        language === 'ar' ? 'بوابة التحكم بالمنصة وإعدادات الـ SaaS' : 'SaaS Control Center & Console Settings'
                      ) : selectedSettingsTab === 'branding' ? (
                        language === 'ar' ? 'تخصيص الهوية التجارية للمستأجر (Tenant Branding)' : 'Tenant Brand & White-Label'
                      ) : selectedSettingsTab === 'admin' ? (
                        language === 'ar' ? 'ملف المسؤول والتحكم الأمني والمهام' : 'Admin Credentials & Tasks Security'
                      ) : selectedSettingsTab === 'staff' ? (
                        language === 'ar' ? 'إدارة طواقم العمل والموظفين والحدود' : 'Staff Directory & Access Boundaries'
                      ) : selectedSettingsTab === 'system' ? (
                        language === 'ar' ? 'تفضيلات وموديولات النظام العام' : 'System Preferences & Modularity'
                      ) : selectedSettingsTab === 'tickets' ? (
                        language === 'ar' ? 'مكتب تذاكر الدعم والربط الفني' : 'Technical Support Tickets & Connectivity Guide'
                      ) : (
                        language === 'ar' ? 'بوابة المزامنة والنسخ السحابي' : 'Cloud Backup & DB Synchronization'
                      )}
                    </h3>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">
                      {selectedSettingsTab === null ? (
                        language === 'ar' ? 'تهيئة وتخصيص هوية المستأجر والتحقق من حسابات الموظفين والصلاحيات المتكاملة' : 'Configure and customize tenant styling, verify staff accounts, and authorize system overrides'
                      ) : (
                        language === 'ar' ? 'الضبط الكلي للقسم المختار - يتم حفظ البيانات بمجرد النقر على زر الحفظ أدناه.' : 'Perform active configurations and save alterations to apply white-label nodes.'
                      )}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-500 dark:text-slate-400 rounded-2xl cursor-pointer border border-slate-150 dark:border-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Main Workspace Frame */}
              <div className="flex-1 overflow-y-auto w-full">
                {selectedSettingsTab === null ? (
                  <div className="max-w-5xl mx-auto w-full px-6 py-10">
                    <div className={`mb-8 space-y-1.5 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <h4 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-tight">
                        {language === 'ar' ? 'البوابة الكلية لوحدات الـ SAAS' : 'SaaS Console Configuration Modules'}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-400 max-w-3xl leading-relaxed">
                        {language === 'ar' ? 'اختر أحد الأقسام التالية لضبط معايير الهوية، وإدارة الصلاحيات المتقدمة للأدمن والفنيين بالكامل وبشكل منعزل.' : 'Select a node below to configure white-labeled client brands, establish fine-grained technical authorization, and audit databases.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                      {[
                        {
                          id: 'branding',
                          labelAr: 'الهوية البصرية وتخصيص الشعار للمؤسسة',
                          labelEn: 'Corporate Visual Identity & Logo',
                          descAr: 'تخصيص الاسم التجاري، رفع الشعار المعتمد، واختيار تدرج الألوان المتطابق مع علامتكم التجارية لتقديم مظهر White-Label متكامل.',
                          descEn: 'Configure your custom business brand name, upload official company logo, and align theme accents for a complete white-labeled look.',
                          icon: <Sparkles size={24} className="text-amber-500 group-hover:animate-pulse" />,
                          tagAr: 'الهوية البصرية واللوجو',
                          tagEn: 'Visual Identity & Logo',
                          color: 'amber'
                        },
                        {
                          id: 'admin',
                          labelAr: 'حساب المسؤول وتحكم الأمان',
                          labelEn: 'Admin Profile & Security',
                          descAr: 'ضبط ملف المدير العام للورشة، رمز التحقق الشخصي (Security PIN)، صلاحيات الأدمن الفرعيين وجدول تكليفات المهام الصيانة.',
                          descEn: 'Change expert supervisor titles, main safety PIN code, and toggle backend action overrides.',
                          icon: <UserCheck size={24} className="text-violet-500" />,
                          tagAr: 'الحساب والأمن',
                          tagEn: 'Credentials & PIN',
                          color: 'blue'
                        },
                        {
                          id: 'staff',
                          labelAr: 'إدارة الموظفين والامتيازات الفنية',
                          labelEn: 'Staff & Team Directory',
                          descAr: 'إلحاق الكوادر الفنية الجديدة، مصفوفة الصلاحيات الفردية للفنيين والمنسقين، فرض المصادقة الثنائية والحدود الجغرافية.',
                          descEn: 'Enlist new fleet technicians, view master permissions grid, and track MFA enforcement.',
                          icon: <Users size={24} className="text-emerald-500" />,
                          tagAr: 'طاقم الورشة',
                          tagEn: 'Roster & MFA',
                          color: 'emerald'
                        },
                        {
                          id: 'system',
                          labelAr: 'تفضيلات وموديولات النظام',
                          labelEn: 'System Preferences & Modules',
                          descAr: 'تفعيل وتعطيل موديولات الـ SaaS كبوابة الصيانة والذكاء الاصطناعي وباقة الفوترة العامة.',
                          descEn: 'Toggle SaaS subscription modules, manage global system properties, translations, and active modules.',
                          icon: <Cpu size={24} className="text-rose-500" />,
                          tagAr: 'موديولات النظام',
                          tagEn: 'Modules & Prefs',
                          color: 'rose'
                        },
                        {
                          id: 'tickets',
                          labelAr: 'تذاكر الدعم والربط الفني للمنصة',
                          labelEn: 'SaaS Tech & Maintenance Link',
                          descAr: 'تواصل مع المهندسين، واقرأ أدلة الربط المعياري وجرب فاحص تماسك النظام ومزامنة أجهزة سكانر الليزر والباركود.',
                          descEn: 'Connect with support specialists, review developer database schemas, and trigger instant local cache diagnostics.',
                          icon: <LifeBuoy size={24} className="text-violet-500" />,
                          tagAr: 'تذاكر الدعم والربط',
                          tagEn: 'Help Desk & Guides',
                          color: 'brand-blue'
                        },
                        {
                          id: 'marketing-admin',
                          labelAr: 'إدارة الموقع العام والتسويق',
                          labelEn: 'Public Website & Marketing Admin',
                          descAr: 'تخصيص الواجهة التسويقية العامة للموقع، تعديل النصوص الترحيبية، وضبط ألوان العلامة التجارية ومميزاتها الأساسية.',
                          descEn: 'Customize the public marketing homepage, update showcase headers, brand colors, and configure product features.',
                          icon: <Globe size={24} className="text-indigo-500" />,
                          tagAr: 'إدارة الموقع والتسويق',
                          tagEn: 'Marketing & Site Builder',
                          color: 'indigo'
                        }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (item.id === 'marketing-admin') {
                              setActiveTab('marketing-admin');
                              setIsSettingsModalOpen(false);
                            } else {
                              setSelectedSettingsTab(item.id as any);
                            }
                          }}
                          className={`w-full p-6 sm:p-8 bg-white dark:bg-[#0c101d]/90 rounded-[2rem] border border-slate-150 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-800/80 hover:scale-[1.018] hover:shadow-xl hover:shadow-violet-500/5 transition-all text-right outline-none cursor-pointer flex flex-col justify-between h-[210px] group ${dir === 'rtl' ? 'flex-col text-right' : 'flex-col text-left'}`}
                        >
                          <div className={`flex items-start justify-between w-full ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 group-hover:bg-gradient-to-br group-hover:from-violet-500/10 group-hover:to-indigo-500/10 group-hover:text-violet-600 transition-all shadow-3xs border border-slate-100 dark:border-slate-800">
                              {item.icon}
                            </div>
                            <span className={`text-[9.5px] font-black px-2.5 py-1 rounded-full ${
                              item.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                              item.color === 'amber' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                              item.color === 'blue' ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400' :
                              item.color === 'rose' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' :
                              item.color === 'brand-blue' ? 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400' :
                              'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                            }`}>
                              {language === 'ar' ? item.tagAr : item.tagEn}
                            </span>
                          </div>
                          
                          <div className="mt-4 flex-1">
                            <span className="block text-sm sm:text-base font-black text-slate-900 dark:text-white mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                              {language === 'ar' ? item.labelAr : item.labelEn}
                            </span>
                            <span className="block text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 leading-normal line-clamp-2">
                              {language === 'ar' ? item.descAr : item.descEn}
                            </span>
                          </div>

                          <div className={`text-[10.5px] font-black mt-2 text-slate-500 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-all flex items-center gap-1 ${dir === 'rtl' ? 'justify-start group-hover:translate-x-[-4px]' : 'justify-end group-hover:translate-x-[4px]'}`}>
                            <span>{language === 'ar' ? 'افتح صفحة الإعدادات الكلية ←' : 'Open full configuration page ←'}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto w-full px-6 py-6 pb-24">
                    {/* Back header for details */}
                    <div className={`mb-6 flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                      <button
                        type="button"
                        onClick={() => setSelectedSettingsTab(null)}
                        className={`px-4 py-2 bg-white dark:bg-slate-900 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                      >
                        <span>{language === 'ar' ? '← العودة لوحة التحكم الكلية' : '← Back to Master Control Panel'}</span>
                      </button>
                    </div>

                    {/* Content Detail Panels */}
                  
                    {/* TAB 1: BRANDING & TENANT IDENTITY */}
                  {selectedSettingsTab === 'branding' && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Sparkles size={16} className="text-amber-500" />
                          <span>{language === 'ar' ? 'تصميم الهوية البصرية وشعار المؤسسة' : 'Corporate Identity & Logo Customization'}</span>
                        </h4>
                        <p className="text-[10px] text-slate-450 mt-1">
                          {language === 'ar' ? 'خصص علامتك التجارية بالكامل عبر رفع اللوجو المعتمد للمؤسسة وتعديل الاسم واللون.' : 'Customize your corporate identity in detail by uploading your official logos and names.'}
                        </p>
                      </div>

                      <div className="space-y-5">
                        {/* Custom Logo Upload Section */}
                        <div className="space-y-2">
                          <label className="text-[10px] text-slate-500 block font-bold">
                            {language === 'ar' ? 'شعار اللوحة وصورة العلامة التجارية (SaaS Logo)' : 'SaaS Brand Logo Image'}
                          </label>

                          <div className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center`}>
                            {/* Logo Display Preview Column */}
                            <div className="md:col-span-3 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 h-32 relative group">
                              {saasBrandLogo ? (
                                <>
                                  <img 
                                    src={saasBrandLogo} 
                                    alt="Brand Logo" 
                                    className="max-h-20 max-w-full object-contain rounded-lg" 
                                    referrerPolicy="no-referrer"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setSaasBrandLogo('')}
                                    className="absolute -top-1.5 -left-1.5 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md transition-all scale-90 hover:scale-100 cursor-pointer"
                                    title={language === 'ar' ? 'حذف الشعار والعودة للافتراضي' : 'Remove logo & reset to default'}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              ) : (
                                <div className="text-center space-y-1">
                                  <Image size={24} className="mx-auto text-slate-400 dark:text-slate-600" />
                                  <span className="text-[10px] text-slate-400 block font-bold">
                                    {language === 'ar' ? 'شعار افتراضي' : 'Default Icon'}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Logo Upload Actions Column */}
                            <div className="md:col-span-9 space-y-3">
                              {/* Drag & Drop simulated upload panel */}
                              <div 
                                onClick={() => document.getElementById('brand-logo-file-input')?.click()}
                                className="border border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-blue-500/50 dark:hover:border-brand-blue-500/50 rounded-2xl p-4 text-center cursor-pointer bg-white dark:bg-slate-900 shadow-3xs transition-all flex items-center justify-center gap-3"
                              >
                                <Upload size={16} className="text-brand-blue-500 animate-bounce" />
                                <div className="text-right">
                                  <span className="block text-xs font-black text-slate-800 dark:text-slate-200">
                                    {language === 'ar' ? 'اضغط لرفع شعار جديد (PNG/JPG)' : 'Click to upload brand logo'}
                                  </span>
                                  <span className="block text-[9px] text-slate-400">
                                    {language === 'ar' ? 'يدعم الصور حتى 2 ميجابايت كحد أقصى' : 'Supports images up to 2MB'}
                                  </span>
                                </div>
                                <input 
                                  type="file" 
                                  id="brand-logo-file-input" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleBrandLogoFileChange}
                                />
                              </div>

                              {/* Instant presets generator for nice look */}
                              <div className="space-y-1.5">
                                <span className="block text-[9.5px] font-bold text-slate-400">
                                  {language === 'ar' ? '💡 أو اختر أحد النماذج الهندسية الجاهزة فوراً:' : '💡 Or apply a preloaded design preset instantly:'}
                                </span>
                                <div className="flex gap-2 flex-wrap">
                                  {[
                                    {
                                      id: 'preset1',
                                      labelAr: 'درع الأسطول',
                                      labelEn: 'Fleet Shield',
                                      svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%232563eb"><polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="%233b82f6" stroke-width="8"/><circle cx="50" cy="50" r="15" fill="%233b82f6"/></svg>'
                                    },
                                    {
                                      id: 'preset2',
                                      labelAr: 'الميكانيكي الذكي',
                                      labelEn: 'Smart Engine',
                                      svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="%2310b981" stroke-width="8"><circle cx="50" cy="50" r="22"/><path d="M50,10 L50,22 M50,78 L50,90 M10,50 L22,50 M78,50 L90,50 M22,22 L32,32 M68,68 L78,78" stroke-linecap="round"/></svg>'
                                    },
                                    {
                                      id: 'preset3',
                                      labelAr: 'القمة الذهبية',
                                      labelEn: 'Golden Peak',
                                      svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23f59e0b"><path d="M15,80 L85,80 L75,30 L50,55 L25,30 Z" stroke="%23d97706" stroke-width="6" stroke-linejoin="round"/></svg>'
                                    },
                                    {
                                      id: 'preset4',
                                      labelAr: 'الطاقة القصوى',
                                      labelEn: 'Max Voltage',
                                      svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23f43f5e"><polygon points="60,10 20,55 50,55 40,90 80,45 50,45" stroke="%23e11d48" stroke-width="4" stroke-linejoin="round"/></svg>'
                                    }
                                  ].map((preset) => (
                                    <button
                                      key={preset.id}
                                      type="button"
                                      onClick={() => setSaasBrandLogo(preset.svg)}
                                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-[10px] font-black cursor-pointer flex items-center gap-1.5 transition-all text-slate-700 dark:text-slate-300"
                                    >
                                      <img src={preset.svg} alt={preset.labelEn} className="w-3.5 h-3.5 object-contain" />
                                      <span>{language === 'ar' ? preset.labelAr : preset.labelEn}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 pt-1">
                          <label className="text-[10px] text-slate-500 block font-bold">
                            {language === 'ar' ? 'الاسم التجاري للمنصة (عنوان اللوحة الجانبية)' : 'Commercial SaaS Platform Title'}
                          </label>
                          <input 
                            type="text" 
                            value={saasBrandName}
                            onChange={(e) => setSaasBrandName(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-black dark:text-white outline-none focus:border-brand-blue-500/60 focus:bg-white"
                            placeholder={language === 'ar' ? 'مثال: Axoventra' : 'e.g. Axoventra'}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 block font-bold">
                            {language === 'ar' ? 'شعار وصفي لصفحة الدخول (Slogan)' : 'Login Slogan & Technical Subtitle'}
                          </label>
                          <input 
                            type="text" 
                            value={saasBrandDesc}
                            onChange={(e) => setSaasBrandDesc(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-black dark:text-white outline-none focus:border-brand-blue-500/60 focus:bg-white"
                            placeholder={language === 'ar' ? 'مثال: بوابة سحابية لإدارة حركة الصيانات' : 'e.g. Fleet logistics & workshops cloud portal'}
                          />
                        </div>

                        {/* Professional Theme Presets Selection (4 Themes) */}
                        <div className="space-y-3 pt-2">
                          <div className={`flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/60 pb-1.5 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            <Sparkles size={14} className="text-brand-blue-500 animate-pulse" />
                            <label className="text-xs text-slate-700 dark:text-slate-300 font-black">
                              {language === 'ar' ? 'الأنماط والسمات الأربعة الفاخرة للورش والمؤسسة' : '4 Premium Architectural Themes'}
                            </label>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {THEMES_PRESETS.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  setBrandTheme(preset.id);
                                  setBrandPrimaryColor(preset.hex);
                                  // Maintain compatibility logic
                                  setSaasBrandColor(preset.id === 'classic-blue' ? 'blue' : preset.id === 'eco-green' ? 'emerald' : preset.id === 'safety-gold' ? 'amber' : preset.id === 'tactical-red' ? 'rose' : 'blue');
                                }}
                                className={`p-3.5 border rounded-2xl flex flex-col gap-2 cursor-pointer transition-all text-right focus:outline-none ${
                                  brandTheme === preset.id
                                    ? 'border-brand-blue-500 bg-brand-blue-500/5 shadow-xs ring-1 ring-brand-blue-500/30'
                                    : 'border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 hover:bg-slate-50/50'
                                }`}
                              >
                                <div className={`flex justify-between items-center w-full ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                  <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs shrink-0 block" style={{ backgroundColor: preset.hex }} />
                                    <span className="text-[11px] font-black text-slate-850 dark:text-slate-100">
                                      {language === 'ar' ? preset.nameAr : preset.nameEn}
                                    </span>
                                  </div>
                                  {brandTheme === preset.id && (
                                    <span className="w-3.5 h-3.5 rounded-full bg-brand-blue-500 text-white flex items-center justify-center text-[9px] font-extrabold">✓</span>
                                  )}
                                </div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-relaxed">
                                  {language === 'ar' ? preset.descAr : preset.descEn}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Accent Color Customizer Palette & Dynamic Wheel Button */}
                        <div className="space-y-3 pt-3 p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-150 dark:border-slate-800">
                          <div className={`flex justify-between items-center ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            <div className="space-y-0.5 text-right">
                              <span className="block text-xs font-black text-slate-800 dark:text-slate-200">
                                {language === 'ar' ? 'التحكم بالهوية اللونية الحر وزر الألوان' : 'Custom Corporate Accent & Color Studio'}
                              </span>
                              <span className="block text-[9.5px] text-slate-400">
                                {language === 'ar' ? 'تعديل دقيق للون هويتك أو سحب عجلة الأوان بالكامل' : 'Fine-tune your brand hex color dynamically with custom swatches'}
                              </span>
                            </div>
                            
                            {/* Real Swatch custom hex preview & input color */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-black text-slate-600 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                                {brandPrimaryColor.toUpperCase()}
                              </span>
                              <div className="relative w-8 h-8 rounded-full border border-slate-200 shadow-md flex items-center justify-center overflow-hidden cursor-pointer" style={{ backgroundColor: brandPrimaryColor }}>
                                <input
                                  type="color"
                                  value={brandPrimaryColor}
                                  onChange={(e) => {
                                    setBrandPrimaryColor(e.target.value);
                                    setBrandTheme('custom');
                                    setSaasBrandColor('custom');
                                  }}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                  title={language === 'ar' ? 'اختر لون مخصص بالكامل عبر زر الألوان' : 'Choose custom color'}
                                />
                                <Sparkles size={12} className="text-white mix-blend-difference" />
                              </div>
                            </div>
                          </div>

                          {/* Instant Tones dot palette */}
                          <div className={`flex gap-2 items-center flex-wrap pt-1 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[9.5px] text-slate-400 font-bold">
                              {language === 'ar' ? 'نظام تدرجات مسبقة ذكية للتروس:' : 'Instant Diagnostic Tones:'}
                            </span>
                            {[
                              { hex: '#8b5cf6', labelAr: 'أرجواني الكهروبرمجة', labelEn: 'Programming Violet' },
                              { hex: '#06b6d4', labelAr: 'سماوي التبريد', labelEn: 'Ice Cool cooling' },
                              { hex: '#ec4899', labelAr: 'فوشيا ميكاترونيكس', labelEn: 'Mechatronics Pink' },
                              { hex: '#f97316', labelAr: 'برتقالي الرافعات والتحميل', labelEn: 'Loader Amber' },
                              { hex: '#6366f1', labelAr: 'نيلي مستودعات قطع الغيار', labelEn: 'Warehouse Indigo' },
                              { hex: '#64748b', labelAr: 'رمادي ورشة التصفيح', labelEn: 'Shielding Case Slate' }
                            ].map((tone) => (
                              <button
                                key={tone.hex}
                                type="button"
                                onClick={() => {
                                  setBrandPrimaryColor(tone.hex);
                                  setBrandTheme('custom');
                                  setSaasBrandColor('custom');
                                }}
                                className={`w-5 h-5 rounded-full cursor-pointer transition-transform duration-150 hover:scale-120 border flex items-center justify-center ${
                                  brandPrimaryColor.toLowerCase() === tone.hex.toLowerCase()
                                    ? 'border-slate-800 scale-110 ring-2 ring-brand-blue-500/20'
                                    : 'border-white/30'
                                }`}
                                style={{ backgroundColor: tone.hex }}
                                title={language === 'ar' ? tone.labelAr : tone.labelEn}
                              >
                                {brandPrimaryColor.toLowerCase() === tone.hex.toLowerCase() && (
                                  <span className="text-[7.5px] text-white font-extrabold">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: ADMIN PROFILE & SECURITY PIN */}
                  {selectedSettingsTab === 'admin' && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <UserCheck size={16} className="text-brand-blue-500" />
                          <span>{language === 'ar' ? 'ملف المسؤول والتحكم الأمني' : 'Admin Credentials & Security Master'}</span>
                        </h4>
                        <p className="text-[10px] text-slate-450 mt-1">
                          {language === 'ar' ? 'لتغيير معرّف المسؤول الرئيسي وهويته في الفروع بالإضافة الميدانية.' : 'Specify display aliases and change security authentication codes.'}
                        </p>
                      </div>

                      <div className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          {/* Avatar Setup */}
                          <div className="relative group/avatar cursor-pointer shrink-0">
                            <div className="w-16 h-16 rounded-full border bg-white dark:bg-slate-800 overflow-hidden shadow-inner flex items-center justify-center relative">
                              {profileAvatar ? (
                                <img src={profileAvatar} alt="Profile Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-brand-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center select-none">
                                  <span>{profileName ? profileName.charAt(0) : 'أ'}</span>
                                </div>
                              )}
                            </div>
                            <button 
                              type="button"
                              onClick={() => document.getElementById('manager-avatar-file-tabbed')?.click()}
                              className="absolute -bottom-1 -left-1 p-1 bg-brand-blue-500 text-white rounded-full shadow-xs hover:bg-brand-blue-600 transition-colors"
                              title={language === 'ar' ? 'تحميل صورة' : 'Upload photo'}
                            >
                              <Settings size={10} className="text-white" />
                            </button>
                            <input 
                              type="file" 
                              id="manager-avatar-file-tabbed" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleProfileFileChange} 
                            />
                          </div>

                          <div className="flex-1 space-y-2.5">
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 block font-bold">
                                {language === 'ar' ? 'اسم العرض الكامل للمدير' : 'Manager Full Display Name'}
                              </label>
                              <input 
                                type="text" 
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-black dark:text-white outline-none focus:border-brand-blue-500/60"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 block font-bold">
                                {language === 'ar' ? 'المسمى الوظيفي والقسم للمسؤول' : 'Job Title & Master Department'}
                              </label>
                              <input 
                                type="text" 
                                value={profileTitle}
                                onChange={(e) => setProfileTitle(e.target.value)}
                                className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-black dark:text-white outline-none focus:border-brand-blue-500/60"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Read-only Mode Toggle for Observers */}
                        <div className="pt-3.5 border-t border-slate-150 dark:border-slate-800/60 space-y-3">
                          <div className={`flex items-center justify-between gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            <div className={`space-y-0.5 flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                              <span className="text-xs font-black block text-slate-800 dark:text-slate-100 flex items-center gap-1.5 justify-end">
                                <span className="inline-flex items-center px-1.5 py-0.5 bg-violet-500/10 text-violet-500 dark:text-violet-400 rounded text-[8px] font-bold shrink-0">
                                  {language === 'ar' ? 'حماية البيانات للمراقبين' : 'Observer Protection'}
                                </span>
                                <span>{language === 'ar' ? 'وضع القراءة فقط للمراقبين (Read-only Mode)' : 'Observer Read-only Mode'}</span>
                              </span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 block leading-normal">
                                {language === 'ar' 
                                  ? 'عند تفعيله، يتم إخفاء أزرار الإضافة والتعديل والحذف في كافة صفحات التطبيق لحماية البيانات وضمان سلامتها من العبث.' 
                                  : 'Hides all adding, editing, and deleting controls globally across all application views to secure live data from unintentional adjustments.'
                                }
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newVal = !readOnlyMode;
                                setReadOnlyMode(newVal);
                                localStorage.setItem('saas_read_only_mode', newVal ? 'true' : 'false');
                                window.dispatchEvent(new Event('storage'));
                              }}
                              className={`w-9 h-5 rounded-full relative transition-colors border-0 shrink-0 ${readOnlyMode ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${readOnlyMode ? (dir === 'rtl' ? 'right-5' : 'left-5') : (dir === 'rtl' ? 'right-1' : 'left-1')}`} />
                            </button>
                          </div>
                        </div>

                        {/* PIN Security Key Section */}
                        <div className="pt-3 border-t border-slate-150 dark:border-slate-800 space-y-1">
                          <label className="text-[10px] text-slate-500 block font-extrabold flex items-center gap-1.5 justify-end">
                            <span>{language === 'ar' ? 'رمز حماية لوحة التحكم (Platform Admin Pin)' : 'Admin Lock PIN'}</span>
                            <Shield size={12} className="text-brand-blue-500" />
                          </label>
                          <input 
                            type="password" 
                            maxLength={4}
                            value={adminPin}
                            onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                            className={`p-2.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-mono font-black text-center tracking-widest leading-none outline-none focus:border-brand-blue-500/60 w-32 ${dir === 'rtl' ? 'mr-auto block' : 'ml-auto block'}`}
                            placeholder="••••"
                          />
                          <span className="text-[9px] text-slate-400 block mt-1">
                            {language === 'ar' ? 'يتكون الرمز من 4 أقام لحماية حركات التعديل والمزامنة اليدوية.' : '4-digit numeric key used to secure administrative actions.'}
                          </span>
                        </div>

                        {/* 🌟 ADVANCED GLOBAL SUB-ADMIN PRIVILEGES & SECURITY GENERAL OVERRIDES */}
                        <div className="pt-4 border-t border-slate-150 dark:border-slate-800 space-y-3 text-right">
                          <label className="text-[11px] text-slate-800 dark:text-white block font-black flex items-center gap-1.5 justify-end">
                            <span>{language === 'ar' ? 'التحكم المتقدم في الصلاحيات العامة للمسؤولين الفرعيين' : 'Global Sub-Admin Authority & Overrides'}</span>
                            <Sliders size={13} className="text-brand-blue-500" />
                          </label>
                          <span className="text-[9.5px] text-slate-400 block leading-normal">
                            {language === 'ar' ? 'التحكم بالصلاحيات الأمنية العامة التي يتم توريثها تلقائياً لكافة الفنيين والمشرفين الفرعيين في الورشة.' : 'Establish baseline overrides propagated down to all delegated workshop leaders.'}
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {[
                              {
                                key: 'allowHeavyDelete',
                                titleAr: 'السماح بحذف المركبات والآليات الثقيلة',
                                titleEn: 'Allow Vehicle / Fleet Deletions',
                                descAr: 'تمكين المشرفين والمساعدين من حذف وتعديل شجرة الأصول الهيكلية.',
                                descEn: 'Grants sub-managers rights to permanently purge fleet identifiers.'
                              },
                              {
                                key: 'allowInventoryAdjust',
                                titleAr: 'السماح بتعديل قوائم المخازن الاستراتيجية',
                                titleEn: 'Authorize Supply Inventory Sizing',
                                descAr: 'صلاحية إضافة وتعديل كميات قطع الغيار والمشتقات والمخزون البديل.',
                                descEn: 'Allow manual override adjustments on premium mechanical stock.'
                              },
                              {
                                key: 'allowSettingsWrite',
                                titleAr: 'السماح بتحرير معايير SaaS للأجهزة والربط الكلي',
                                titleEn: 'Allow Client SaaS Integrations Edit',
                                descAr: 'تخويل المساعدين من تعديل الروابط السحابية الكلية لمعايرة المركبات.',
                                descEn: 'Enables tweaking diagnostic endpoints and telemetry nodes.'
                              },
                              {
                                key: 'requireMFAForAdmins',
                                titleAr: 'فرض المصادقة الثنائية (MFA) كشرط إلزامي',
                                titleEn: 'Enforce Compulsory MFA Policy',
                                descAr: 'منع تسجيل الدخول لأي مسؤول فرعي لا يستخدم رمز التحقق الإضافي.',
                                descEn: 'Force multi-factor authentication check for any system administrator.'
                              }
                            ].map((perm) => {
                              const isChecked = globalSubAdminPrivileges[perm.key as keyof typeof globalSubAdminPrivileges];
                              return (
                                <button
                                  key={perm.key}
                                  type="button"
                                  onClick={() => setGlobalSubAdminPrivileges(prev => ({
                                    ...prev,
                                    [perm.key]: !isChecked
                                  }))}
                                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-start gap-2.5 outline-none ${
                                    isChecked 
                                      ? 'border-brand-blue-500/40 bg-brand-blue-500/5 dark:bg-brand-blue-500/10' 
                                      : 'border-slate-150 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-800 bg-white dark:bg-slate-950'
                                  } ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                                >
                                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                                    isChecked 
                                      ? 'bg-brand-blue-600 border-brand-blue-600 text-white' 
                                      : 'border-slate-300 dark:border-slate-705'
                                  }`}>
                                    {isChecked && <Check size={10} strokeWidth={3} className="text-white" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className={`block text-[10px] font-black leading-none ${isChecked ? 'text-brand-blue-650 dark:text-brand-blue-400' : 'text-slate-750 dark:text-slate-300'}`}>
                                      {language === 'ar' ? perm.titleAr : perm.titleEn}
                                    </span>
                                    <span className="block text-[8px] text-slate-400 mt-1 leading-normal">
                                      {language === 'ar' ? perm.descAr : perm.descEn}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 📋 SUB-ADMIN MISSION CONTROL & TASK ALLOCATION */}
                        <div className="pt-4 border-t border-slate-150 dark:border-slate-800 space-y-3 text-right">
                          <label className="text-[11px] text-slate-800 dark:text-white block font-black flex items-center gap-1.5 justify-end">
                            <span>{language === 'ar' ? 'إدارة وتعيين مهام المسؤولين الفرعيين' : 'Sub-Admin Task Allocation Control'}</span>
                            <UserCheck size={13} className="text-brand-blue-500" />
                          </label>
                          <span className="text-[9.5px] text-slate-400 block leading-normal">
                            {language === 'ar' ? 'قم بإسناد المهام الاستقصائية والمراجعات الدورية لفريق الإشراف الفرعي وتتبع تقدم إتمامها.' : 'Delegate critical audits or operational inspections directly to key administrative staff.'}
                          </span>

                          {/* Task Creation Form */}
                          <div className="p-3.5 bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-3">
                            <span className="text-[9px] font-black block text-slate-500 uppercase">
                              {language === 'ar' ? 'إضافة وتكليف مهمة إشرافية جديدة' : 'Add New Delegated Commission'}
                            </span>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                              {/* Task Title */}
                              <div className="space-y-1">
                                <label className="text-[8px] text-slate-500 font-bold block">{language === 'ar' ? 'عنوان وصنف المهمة' : 'Mission Title'}</label>
                                <input 
                                  type="text"
                                  value={newSubTaskTitle}
                                  onChange={(e) => setNewSubTaskTitle(e.target.value)}
                                  placeholder={language === 'ar' ? 'مثال: تحديث أرقام المخزن الميكانيكي' : 'e.g. Audit Heavy Spares catalog'}
                                  className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-black dark:text-white outline-none"
                                />
                              </div>

                              {/* Assignee Selection */}
                              <div className="space-y-1">
                                <label className="text-[8px] text-slate-500 font-bold block">{language === 'ar' ? 'المسؤول المكلَّف' : 'Assigned Sub-Admin'}</label>
                                <select 
                                  value={newSubTaskAssigneeId}
                                  onChange={(e) => setNewSubTaskAssigneeId(Number(e.target.value))}
                                  className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-black dark:text-white outline-none cursor-pointer"
                                >
                                  {staffList.map(s => (
                                    <option key={s.id} value={s.id}>
                                      {s.name} ({s.role})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Priority */}
                              <div className="space-y-1">
                                <label className="text-[8px] text-slate-500 font-bold block">{language === 'ar' ? 'أولوية المهمة' : 'Priority Level'}</label>
                                <select 
                                  value={newSubTaskPriority}
                                  onChange={(e) => setNewSubTaskPriority(e.target.value as 'high' | 'medium' | 'low')}
                                  className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-black dark:text-white outline-none cursor-pointer"
                                >
                                  <option value="high">{language === 'ar' ? 'عالية جداً (High)' : 'High Priority'}</option>
                                  <option value="medium">{language === 'ar' ? 'متوسطة الأهمية (Medium)' : 'Medium Priority'}</option>
                                  <option value="low">{language === 'ar' ? 'منخفضة السرعة (Low)' : 'Low Priority'}</option>
                                </select>
                              </div>

                              {/* Due Date */}
                              <div className="space-y-1">
                                <label className="text-[8px] text-slate-505 font-bold block">{language === 'ar' ? 'تاريخ الاستحقاق' : 'Target Deadline'}</label>
                                <input 
                                  type="date"
                                  value={newSubTaskDueDate}
                                  onChange={(e) => setNewSubTaskDueDate(e.target.value)}
                                  className="w-full p-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-black dark:text-white outline-none"
                                />
                              </div>
                            </div>

                            <button 
                              type="button"
                              onClick={handleAddSubTask}
                              disabled={!newSubTaskTitle.trim()}
                              className="w-full py-1.5 bg-brand-blue-600 hover:bg-brand-blue-700 disabled:opacity-40 text-white rounded-xl text-[10px] font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Plus size={12} />
                              <span>{language === 'ar' ? 'تأكيد إسناد المهمة وإصدار التكليف' : 'Enforce & Assign Task Mandate'}</span>
                            </button>
                          </div>

                          {/* Task List Display Container */}
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {subAdminTasks.length === 0 ? (
                              <div className="text-center py-4 text-slate-400 text-[10px] font-bold">
                                {language === 'ar' ? 'لا يوجد مهام نشطة للمسؤولين الفرعيين حالياً.' : 'No tasks assigned to sub-administrators yet.'}
                              </div>
                            ) : (
                              subAdminTasks.map((task) => {
                                const assignee = staffList.find(s => s.id === task.assigneeId) || { name: 'مسؤول مجهول', role: 'دعم' };
                                return (
                                  <div 
                                    key={task.id}
                                    className={`p-2.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-[10px] ${
                                      dir === 'rtl' ? 'flex-row-reverse' : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      {/* Status toggle indicator */}
                                      <button
                                        type="button"
                                        onClick={() => handleToggleSubTaskStatus(task.id)}
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                                          task.status === 'completed'
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : task.status === 'active'
                                            ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10'
                                            : 'border-slate-300 dark:border-slate-700 text-transparent hover:border-brand-blue-500'
                                        }`}
                                        title={language === 'ar' ? 'تغيير حالة المهمة' : 'Toggle task state'}
                                      >
                                        {task.status === 'completed' && <Check size={10} strokeWidth={3.5} />}
                                        {task.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />}
                                      </button>

                                      <div className={`min-w-0 flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                                        <span className={`block font-black text-slate-800 dark:text-slate-100 ${
                                          task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                                        }`}>
                                          {task.title}
                                        </span>
                                        <span className="block text-[8px] text-slate-400 mt-0.5">
                                          {language === 'ar' 
                                            ? `مكلف لـ: ${assignee.name} (${assignee.role})` 
                                            : `Assigned to: ${assignee.name} (${assignee.role})`}
                                        </span>
                                      </div>
                                    </div>

                                    <div className={`flex items-center gap-1.5 shrink-0 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                      {/* Priority Badge */}
                                      <span className={`text-[7.5px] px-1 py-0.2 rounded font-extrabold ${
                                        task.priority === 'high' 
                                          ? 'bg-red-500/10 text-red-500' 
                                          : task.priority === 'medium' 
                                          ? 'bg-amber-500/10 text-amber-500' 
                                          : 'bg-slate-400/10 text-slate-500'
                                      }`}>
                                        {task.priority === 'high' ? (language === 'ar' ? 'عالية' : 'HIGH') :
                                         task.priority === 'medium' ? (language === 'ar' ? 'متوسطة' : 'MID') :
                                         (language === 'ar' ? 'منخفضة' : 'LOW')}
                                      </span>

                                      {/* Due date */}
                                      <span className="text-[7.5px] text-slate-400 font-mono">
                                        📅 {task.dueDate}
                                      </span>

                                      {/* Delete button */}
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveSubTask(task.id)}
                                        className="text-red-500 hover:bg-red-500/10 p-1 rounded-md transition-colors"
                                      >
                                        <X size={11} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: STAFF & EMPLOYEE MANAGEMENT */}
                  {selectedSettingsTab === 'staff' && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      
                      {/* Live Workforce Dynamic Stats Banner */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-950/20 dark:to-teal-900/10 border border-teal-100/60 dark:border-teal-900/30 rounded-2xl flex items-center justify-between shadow-xs">
                          <div className={`space-y-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                            <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-widest block">
                              {language === 'ar' ? 'إجمالي طاقم الورشة' : 'Total Field Staff'}
                            </span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white block leading-none">
                              {staffList.length}
                            </span>
                            <span className="text-[9px] text-slate-505 dark:text-slate-400 block pb-1">
                              {language === 'ar' ? 'موارد نشطة مخولة حالياً' : 'Current authorized active nodes'}
                            </span>
                          </div>
                          <div className="p-3 bg-teal-500/10 dark:bg-teal-500/20 rounded-xl">
                            <Users className="text-teal-600 dark:text-teal-400" size={24} />
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 border border-emerald-100/60 dark:border-emerald-900/30 rounded-2xl flex items-center justify-between shadow-xs">
                          <div className={`space-y-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                              {language === 'ar' ? 'حماية المصادقة الـ MFA' : 'MFA Enforced Rate'}
                            </span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white block leading-none">
                              {staffList.length > 0 
                                ? `${Math.round((staffList.filter(s => s.mfaEnabled).length / staffList.length) * 100)}%`
                                : '0%'
                              }
                            </span>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 block pb-1">
                              {language === 'ar' 
                                ? `${staffList.filter(s => s.mfaEnabled).length} من أصل ${staffList.length} بوابات آمنة` 
                                : `${staffList.filter(s => s.mfaEnabled).length} of ${staffList.length} secured`
                              }
                            </span>
                          </div>
                          <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl">
                            <Lock className="text-emerald-600 dark:text-emerald-400" size={24} />
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/20 dark:to-indigo-900/10 border border-indigo-100/60 dark:border-indigo-900/30 rounded-2xl flex items-center justify-between shadow-xs">
                          <div className={`space-y-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                            <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                              {language === 'ar' ? 'متوسط التفويض المالي' : 'Avg Work Sign-off'}
                            </span>
                            <span className="text-xl font-black text-slate-900 dark:text-white block leading-none">
                              {staffList.length > 0
                                ? `${Math.round(staffList.reduce((sum, s) => sum + (s.maxWorkOrderValue || 10000), 0) / staffList.length).toLocaleString()} SAR`
                                : '10,000 SAR'
                              }
                            </span>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 block pb-1">
                              {language === 'ar' ? 'سقف إغلاق التذاكر التقريبي' : 'Approximate authorization cap'}
                            </span>
                          </div>
                          <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl">
                            <Sliders className="text-indigo-600 dark:text-indigo-400" size={24} />
                          </div>
                        </div>
                      </div>

                      <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Users size={18} className="text-teal-500" />
                            <span>{language === 'ar' ? 'إدارة طواقم العمل والموظفين والحدود' : 'Staff Directory & Access Boundaries'}</span>
                          </h4>
                          <p className="text-[10px] text-slate-450 mt-1">
                            {language === 'ar' ? 'تهيئة وتفصيل صلاحيات الفنيين، الحدود الجغرافية، وسقوف الموازنات المالية المعتمدة.' : 'Configure fine-grained technicians, geographic ranges, security parameters and financial triggers.'}
                          </p>
                        </div>
                        {editingStaffId && (
                          <button
                            type="button"
                            onClick={handleCancelEditStaff}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-600 dark:text-slate-300 text-[10.5px] font-black rounded-xl transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>{language === 'ar' ? '← العودة للقائمة' : '← Back to List'}</span>
                          </button>
                        )}
                      </div>

                      {editingStaffId ? (
                        /* 🟢 WAJEEHA FAR'EEYAH (EDITING STAFF MEMBERS DETAILS & DETAILED PERMISSIONS) */
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="bg-white dark:bg-[#0f1422] p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6 sidebar-font-reset text-right"
                        >
                          <div className={`flex items-center gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800/80 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                            <div className="w-12 h-12 bg-teal-500/10 text-teal-500 rounded-2xl flex items-center justify-center font-black">
                              <Shield className="text-teal-500" size={22} />
                            </div>
                            <div>
                              <span className="text-sm font-black text-slate-900 dark:text-white block leading-tight">
                                {language === 'ar' ? `لوحة التحكم وتخصيص صلاحيات: ${editingStaffName}` : `Configure permissions & title: ${editingStaffName}`}
                              </span>
                              <span className="text-[10px] text-slate-450 block mt-1">
                                {language === 'ar' ? 'تعديل وسحب الصلاحيات الإشرافية والحدود الآمنة للمرور.' : 'Set direct operational constraints and platform permission bounds.'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Column A: Metadata Names & Titles */}
                            <div className="space-y-4">
                              <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 block pb-1 border-b border-slate-100 dark:border-slate-800">
                                {language === 'ar' ? 'الملف التعريفي والصفة المهنية للموظف' : 'Professional Profile Details'}
                              </span>

                              <div className="space-y-1.5 text-right">
                                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black block">
                                  {language === 'ar' ? 'الاسم الكامل المعتمد بالمنظومة' : 'Authorized Full Name'}
                                </label>
                                <input 
                                  type="text"
                                  value={editingStaffName}
                                  onChange={(e) => setEditingStaffName(e.target.value)}
                                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs font-black dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-right"
                                />
                              </div>

                              <div className="space-y-1.5 text-right">
                                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black block">
                                  {language === 'ar' ? 'المسمى الوظيفي والدور بالورشة' : 'Professional Job Title'}
                                </label>
                                <input 
                                  type="text"
                                  value={editingStaffRole}
                                  onChange={(e) => setEditingStaffRole(e.target.value)}
                                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-black dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-right"
                                  placeholder={language === 'ar' ? 'اكتب المسمى هنا...' : 'Enter details...'}
                                />
                              </div>

                              <div className="space-y-1.5 text-right">
                                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black block">
                                  {language === 'ar' ? 'القالب السريع للمسمى الوظيفي' : 'Quick Role Selector'}
                                </label>
                                <select 
                                  onChange={(e) => setEditingStaffRole(e.target.value)}
                                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-black dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer text-right"
                                  value={editingStaffRole}
                                >
                                  <option value="خبير صيانة الأساطيل والتكاملات الكهربائية">{language === 'ar' ? '⚡ خبير صيانة الأساطيل والتكاملات الكهربائية' : 'Expert Mechanical Engineer'}</option>
                                  <option value="مسؤول القطع الاستراتيجية والمخازن">{language === 'ar' ? '📦 مسؤول القطع الاستراتيجية والمخازن' : 'Lead Stores Controller'}</option>
                                  <option value="محللة جودة الأداء والاعتمادية البرمجية">{language === 'ar' ? '📊 محللة جودة الأداء والاعتمادية البرمجية' : 'Quality Assurance Coordinator'}</option>
                                  <option value="فني تشخيص وصيانة مركبات ميداني">{language === 'ar' ? '🛠️ فني تشخيص وصيانة مركبات ميداني' : 'Field Diagnostic Specialist'}</option>
                                  <option value="مهندس فحص وتفتيش للسلامة والضمان">{language === 'ar' ? '🛡️ مهندس فحص وتفتيش وضمان جودة' : 'Technical Quality & Inspection Monitor'}</option>
                                </select>
                              </div>
                            </div>

                            {/* Column B: Permissions Matrix */}
                            <div className="space-y-4">
                              <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 block pb-1 border-b border-slate-100 dark:border-slate-800">
                                {language === 'ar' ? 'مصفوفة الصلاحيات وتحكم الأداء' : 'Permissions & System Authorization'}
                              </span>

                              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                                {[
                                  {
                                    key: 'scan_barcode',
                                    titleAr: '🔬 قراءة وفحص باركود المركبات',
                                    titleEn: 'Barcode QR Diagnostics Service',
                                    descAr: 'يسمح للفني بفتح كاميرا الهاتف لمسح باركود شاسيه الأساطيل وقراءة الأعطال.',
                                    descEn: 'Authorize camera scanning of dynamic fleet chassis barcodes.'
                                  },
                                  {
                                    key: 'edit_fleet',
                                    titleAr: '📦 إدارة المخازن وصرف قطع الغيار',
                                    titleEn: 'Store Inventory & Dispatch Access',
                                    descAr: 'تمكين الموظف من طلب وصرف الزيوت، الفلاتر والقطع وتثبيت الحركات بالمخزن.',
                                    descEn: 'Role capable of deducting oil filters and updating structural part ledgers.'
                                  },
                                  {
                                    key: 'approve_work',
                                    titleAr: '✍️ اعتماد التوقيع والإغلاق النهائي تذاكر',
                                    titleEn: 'Work Order Final Sign-Off Authority',
                                    descAr: 'منح الموظف حق توقيع سلامة عتاد السيارة وإغلاق الطلب نهائياً وأرشفته.',
                                    descEn: 'Permit final safety validation certificates on heavy trucks.'
                                  },
                                  {
                                    key: 'system_settings',
                                    titleAr: '⚙️ صلاحيات المشرف التراكمية (SaaS Admin)',
                                    titleEn: 'Admin Terminal & System Overrides',
                                    descAr: 'تخويل الموظف بتعديل هويات الورشة، إدارة المستأجر وإعدادات الـ SaaS والنسخ.',
                                    descEn: 'Allow high-level modifications to tenant skins, system chronos, and roster limits.'
                                  }
                                ].map((perm) => {
                                  const isChecked = editingStaffPermissions.includes(perm.key);
                                  return (
                                    <button
                                      key={perm.key}
                                      type="button"
                                      onClick={() => handleToggleEditPermission(perm.key)}
                                      className={`w-full p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-start gap-3 outline-none ${
                                        isChecked 
                                          ? 'border-teal-500/40 bg-teal-500/5 dark:bg-teal-500/10 shadow-xs' 
                                          : 'border-slate-150 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
                                      } ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                                    >
                                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                                        isChecked 
                                          ? 'bg-teal-600 border-teal-600 text-white' 
                                          : 'border-slate-300 dark:border-slate-700'
                                      }`}>
                                        {isChecked && <Check size={11} strokeWidth={3.5} className="text-white" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <span className={`block text-[10.5px] font-black leading-none ${isChecked ? 'text-teal-600 dark:text-teal-400' : 'text-slate-850 dark:text-slate-300'}`}>
                                          {language === 'ar' ? perm.titleAr : perm.titleEn}
                                        </span>
                                        <span className="block text-[8.5px] text-slate-450 mt-1 leading-relaxed">
                                          {language === 'ar' ? perm.descAr : perm.descEn}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* MFA and Limit Boundaries Container */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
                            {/* Card 1: MFA */}
                            <div className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-150 dark:border-slate-800/80 space-y-4">
                              <div className={`flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                                <Lock className="text-teal-600 shrink-0" size={18} />
                                <span className="text-xs font-black text-slate-800 dark:text-white">
                                  {language === 'ar' ? 'سياسة المصادقة الثنائية (MFA Policy)' : 'Multi-Factor Enforcement Parameters'}
                                </span>
                              </div>
                              
                              <div className={`flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                <span className="text-[10px] text-slate-600 dark:text-slate-300 font-extrabold">
                                  {language === 'ar' ? 'فرض التحقق عند تسجيل الدخول' : 'Enforce Multi-Factor Login'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingStaffMfaEnabled(!editingStaffMfaEnabled)}
                                  className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                                    editingStaffMfaEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                                  } flex items-center justify-start relative`}
                                >
                                  <motion.div 
                                    layout 
                                    className={`w-4 h-4 rounded-full bg-white shadow-xs transition-all ${
                                      editingStaffMfaEnabled ? (dir === 'rtl' ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                                    }`} 
                                  />
                                </button>
                              </div>

                              {editingStaffMfaEnabled ? (
                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                  <label className="text-[9.5px] text-slate-500 font-bold block text-right">
                                    {language === 'ar' ? 'قناة التفويض واستلام رمز OTP' : 'OTP Broadcast Channel'}
                                  </label>
                                  <div className="grid grid-cols-3 gap-2">
                                    {[
                                      { value: 'app', labelAr: '📲 تطبيق Auth', labelEn: 'Auth App' },
                                      { value: 'sms', labelAr: '💬 رسالة SMS', labelEn: 'SMS Code' },
                                      { value: 'email', labelAr: '✉️ بريد إلكتروني', labelEn: 'Email OTP' }
                                    ].map(opt => (
                                      <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setEditingStaffMfaMethod(opt.value as 'app' | 'sms' | 'email')}
                                        className={`py-2 px-1.5 rounded-lg text-[9.5px] font-black border text-center transition-all cursor-pointer ${
                                          editingStaffMfaMethod === opt.value
                                            ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400'
                                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-805 text-slate-500 hover:text-teal-500'
                                        }`}
                                      >
                                        {language === 'ar' ? opt.labelAr : opt.labelEn}
                                      </button>
                                    ))}
                                  </div>
                                </motion.div>
                              ) : (
                                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center">
                                  <span className="text-[9.5px] font-extrabold text-amber-600 dark:text-amber-400 block">
                                    ⚠️ {language === 'ar' ? 'الحساب غير محمي بمصادقة ثنائية حالياً' : 'Account lacks primary MFA protection'}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Card 2: Access Boundaries */}
                            <div className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-150 dark:border-slate-800/80 space-y-4 text-right">
                              <div className={`flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                                <Sliders className="text-teal-600 shrink-0" size={18} />
                                <span className="text-xs font-black text-slate-800 dark:text-white">
                                  {language === 'ar' ? 'الحدود التشغيلية والقيود (Safety Guardrails)' : 'Operations Access Limits & Sinks'}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-right">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black block">
                                    {language === 'ar' ? 'سقف العملة للاعتماد (SAR)' : 'Max Sign-off Order (SAR)'}
                                  </label>
                                  <input 
                                    type="number"
                                    value={editingStaffMaxWorkOrderValue}
                                    onChange={(e) => setEditingStaffMaxWorkOrderValue(Number(e.target.value))}
                                    className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-[11px] font-mono font-black dark:text-white outline-none focus:border-teal-500 text-center"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black block">
                                    {language === 'ar' ? 'الأجهزة المتزامنة المسموحة' : 'Device Session Caps'}
                                  </label>
                                  <input 
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={editingStaffMaxActiveSessions}
                                    onChange={(e) => setEditingStaffMaxActiveSessions(Number(e.target.value))}
                                    className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-805 rounded-xl text-[11px] font-mono font-black dark:text-white outline-none focus:border-teal-500 text-center"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-right">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black block">
                                    {language === 'ar' ? 'ساعات المرور المصرحة' : 'Authorized Window'}
                                  </label>
                                  <select
                                    value={editingStaffAllowedHours}
                                    onChange={(e) => setEditingStaffAllowedHours(e.target.value as 'any' | 'business' | 'daytime')}
                                    className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-[10px] font-black dark:text-white cursor-pointer outline-none focus:border-teal-500 text-center text-right"
                                  >
                                    <option value="any">{language === 'ar' ? '⏰ طوال الأسبوع (24/7)' : 'Anytime (24/7)'}</option>
                                    <option value="business">{language === 'ar' ? '💼 ساعات الدوام الرائجة' : 'Work Hours'}</option>
                                    <option value="daytime">{language === 'ar' ? '☀️ ساعات النهار فقط' : 'Daylight Only'}</option>
                                  </select>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black block">
                                    {language === 'ar' ? 'جدار شبكة الـ IP الموثوق' : 'IP Geofence Whitelist'}
                                  </label>
                                  <input 
                                    type="text"
                                    value={editingStaffIpRestriction}
                                    onChange={(e) => setEditingStaffIpRestriction(e.target.value)}
                                    placeholder="e.g. 10.0.0.1/24"
                                    className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-[11px] font-mono dark:text-white outline-none focus:border-teal-500 text-center"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className={`flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            <button
                              type="button"
                              onClick={handleCancelEditStaff}
                              className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl cursor-pointer transition-colors"
                            >
                              {language === 'ar' ? 'إلغاء التعديلات' : 'Cancel'}
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveEditStaff}
                              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                            >
                              <Check size={16} />
                              <span>{language === 'ar' ? 'اعتماد وحفظ الصلاحيات' : 'Apply Security Constraints'}</span>
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        /* 🔵 MAIN ROSTER VIEW */
                        <>
                          {/* Rich Interactive "Add New Staff" Form Panel */}
                          <div className="p-6 bg-slate-50/70 dark:bg-slate-900/40 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4 text-right">
                            <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800 pb-2">
                              <Plus className="text-teal-600 dark:text-teal-400" size={18} />
                              <span className="text-xs font-black text-slate-800 dark:text-teal-400">
                                {language === 'ar' ? 'بوابة إلحاق وتفعيل كادر صيانة جديد' : 'Enlist New Fleet Technician & Assign Default Role'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5 text-right">
                                <label className="text-[10px] text-slate-500 font-black block">{language === 'ar' ? 'اسم الفني / الموظف الرباعي' : 'Employee Full Name'}</label>
                                <input 
                                  type="text"
                                  value={newStaffName}
                                  onChange={(e) => setNewStaffName(e.target.value)}
                                  placeholder={language === 'ar' ? 'مثال: م. بندر الشمري' : 'e.g. Bandr Al-Shammeri'}
                                  className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-2xl text-xs font-black dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-right"
                                />
                              </div>

                              <div className="space-y-1.5 text-right">
                                <label className="text-[10px] text-slate-500 font-black block">{language === 'ar' ? 'الدور والبروتوكول الرئيسي للمستخدم' : 'Initial Workspace Role'}</label>
                                <select 
                                  value={newStaffRole}
                                  onChange={(e) => setNewStaffRole(e.target.value)}
                                  className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-2xl text-xs font-black dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-teal-505/20 focus:border-teal-505 transition-all text-right text-slate-700 dark:text-slate-200"
                                >
                                  <option value="خبير صيانة الأساطيل والتكاملات الكهربائية">{language === 'ar' ? '⚙️ خبير صيانة الأساطيل والتكاملات الكهربائية' : 'Diagnostic Engineer'}</option>
                                  <option value="مسؤول القطع الاستراتيجية والمخازن">{language === 'ar' ? '📦 مسؤول القطع الاستراتيجية والمخازن' : 'Inventory Specialist'}</option>
                                  <option value="محللة جودة الأداء والاعتمادية البرمجية">{language === 'ar' ? '📊 محللة جودة الأداء والاعتمادية والتحقق' : 'Workshop Coordinator'}</option>
                                  <option value="فني تشخيص وصيانة مركبات ميداني">{language === 'ar' ? '🛠️ فني تشخيص وصيانة مركبات ميداني' : 'Quality Inspector'}</option>
                                </select>
                              </div>
                            </div>

                            {/* Quick Roles Presets Selector */}
                            <div className="space-y-2 pt-1">
                              <span className="text-[9.5px] font-extrabold text-slate-450 uppercase tracking-widest block text-right">
                                {language === 'ar' ? '⚙️ قوالب الأدوار المسرعة (بنقرة واحدة للملء)' : '💡 Fast Roster Templates (Click to Auto-fill Role)'}
                              </span>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                                {[
                                  {
                                    title: 'صيانات كهربائية',
                                    role: 'خبير صيانة الأساطيل والتكاملات الكهربائية',
                                    permDesc: 'مسح الأعطال والاعتماد',
                                    color: 'border-amber-400 bg-amber-500/5 text-amber-600',
                                    icon: '⚡'
                                  },
                                  {
                                    title: 'أمين المستودعات',
                                    role: 'مسؤول القطع الاستراتيجية والمخازن',
                                    permDesc: 'صرف القطع التلقائية',
                                    color: 'border-indigo-400 bg-indigo-500/5 text-indigo-600',
                                    icon: '📦'
                                  },
                                  {
                                    title: 'صيانة ميدانية',
                                    role: 'فني تشخيص وصيانة مركبات ميداني',
                                    permDesc: 'فحص باركود المركبة',
                                    color: 'border-rose-450 bg-rose-500/5 text-rose-500',
                                    icon: '🛠️'
                                  },
                                  {
                                    title: 'إشراف وضمان جودة',
                                    role: 'محللة جودة الأداء والاعتمادية البرمجية',
                                    permDesc: 'إدارة وتكاملات كاملة',
                                    color: 'border-emerald-400 bg-emerald-500/5 text-emerald-600',
                                    icon: '🛡️'
                                  }
                                ].map((preset) => {
                                  const isActive = newStaffRole === preset.role;
                                  return (
                                    <button
                                      key={preset.title}
                                      type="button"
                                      onClick={() => setNewStaffRole(preset.role)}
                                      className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between h-[68px] cursor-pointer group ${
                                        isActive 
                                          ? `${preset.color} ring-2 ring-teal-505/20 font-black shadow-sm scale-[1.02]` 
                                          : 'border-slate-205 dark:border-slate-805 bg-white dark:bg-slate-950/60 text-slate-500 hover:border-slate-400'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span className="text-[10px] font-black truncate">{preset.title}</span>
                                        <span>{preset.icon}</span>
                                      </div>
                                      <span className="text-[8px] text-slate-400 font-normal line-clamp-1 truncate block mt-0.5">
                                        {preset.permDesc}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <button 
                              type="button"
                              onClick={handleAddStaff}
                              disabled={!newStaffName.trim()}
                              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Plus size={15} />
                              <span>{language === 'ar' ? 'تنشيط وإدراج الموظف بالورشة' : 'Authorize & Enlist New Agent'}</span>
                            </button>
                          </div>
                          
                          {/* Current Staff List - Roster Matrix View */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                                {language === 'ar' ? 'سجل بطاقات طاقم العمل وتنزيل الصلاحيات' : 'Current Workforce Register & IP Geofences'}
                              </span>
                              <span className="text-[9px] font-black text-teal-600 bg-teal-500/10 px-2 py-0.5 rounded-full">
                                {language === 'ar' ? 'أمان فائق' : 'Supervised Secure Mode'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
                              {staffList.map((staff) => {
                                // Designate gradient for each character initial to make it colorful
                                const nameInitial = staff.name ? staff.name.charAt(0) : 'G';
                                const gradientOptions = [
                                  'from-teal-500 to-emerald-500 text-teal-50',
                                  'from-amber-400 to-orange-500 text-amber-50',
                                  'from-indigo-500 to-purple-600 text-indigo-50',
                                  'from-rose-500 to-red-650 text-rose-50',
                                  'from-sky-500 to-blue-600 text-sky-50'
                                ];
                                const gradientClass = gradientOptions[staff.id % gradientOptions.length];

                                return (
                                  <div 
                                    key={staff.id}
                                    className={`relative bg-white dark:bg-[#0f1422] rounded-[1.5rem] border border-slate-100 dark:border-slate-800/80 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden border-r-[6px] ${
                                      staff.mfaEnabled 
                                        ? 'border-r-emerald-500' 
                                        : 'border-r-amber-500'
                                    }`}
                                  >
                                    {/* Top Metadata Layout */}
                                    <div className="flex items-start justify-between">
                                      <div className={`flex items-start gap-3.5 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                                        {/* Colored Gradient Rounded Avatar */}
                                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center font-black text-sm shrink-0 shadow-sm border border-white/10`}>
                                          {nameInitial}
                                        </div>
                                        
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="block text-xs font-black text-slate-850 dark:text-white leading-tight truncate">
                                              {staff.name}
                                            </span>
                                            <span className="inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Active on cloud" />
                                          </div>
                                          
                                          <span className="block text-[9px] text-slate-450 font-black mt-0.5 leading-snug break-words">
                                            {staff.role}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveStaff(staff.id)}
                                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                                          title={language === 'ar' ? 'حذف من السجل' : 'Remove agent'}
                                        >
                                          <X size={13} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Parameter Badges / Sinks Grid Indicator */}
                                    <div className={`flex flex-wrap gap-1 mt-3 mb-3 shrink-0 ${dir === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                                      {/* Security level OTP */}
                                      {staff.mfaEnabled ? (
                                        <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold rounded-lg flex items-center gap-0.5">
                                          <span>🔐 {staff.mfaMethod === 'app' ? (language === 'ar' ? 'تطبيق مصادق' : 'Auth App') : staff.mfaMethod === 'sms' ? (language === 'ar' ? 'رسالة SMS' : 'OTP SMS') : (language === 'ar' ? 'البريد OTP' : 'OTP Email')}</span>
                                        </span>
                                      ) : (
                                        <span className="text-[8px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold rounded-lg flex items-center gap-0.5">
                                          <span>🔓 {language === 'ar' ? 'MFA معطل' : 'Lacks MFA'}</span>
                                        </span>
                                      )}

                                      {/* Cap Order Value Authorization */}
                                      <span className="text-[8px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold rounded-lg">
                                        💰 {language === 'ar' ? 'سقف: ' : 'Cap: '} {staff.maxWorkOrderValue ? `${(staff.maxWorkOrderValue).toLocaleString()} SAR` : '10,000 SAR'}
                                      </span>

                                      {/* Access limits */}
                                      <span className="text-[8px] px-1.5 py-0.5 bg-slate-500/10 text-slate-600 dark:text-slate-400 font-extrabold rounded-lg">
                                        🕒 {staff.allowedHours === 'business' ? (language === 'ar' ? 'ساعات دوام' : 'Business') : staff.allowedHours === 'daytime' ? (language === 'ar' ? 'ساعات النهار' : 'Daylight') : (language === 'ar' ? 'على مدار الساعة' : '24/7')}
                                      </span>

                                      {/* Loop permissions */}
                                      {staff.permissions && staff.permissions.map(p => (
                                        <span key={p} className="text-[7.5px] px-1.5 py-0.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-extrabold rounded-lg">
                                          {p === 'scan_barcode' ? (language === 'ar' ? '🔍 باركود' : 'Barcode') :
                                           p === 'edit_fleet' ? (language === 'ar' ? '📦 مخازن' : 'Stores') :
                                           p === 'approve_work' ? (language === 'ar' ? '✍️ اعتماد' : 'Approval') :
                                           (language === 'ar' ? '⚙️ إشراف' : 'Supervisor')}
                                        </span>
                                      ))}
                                    </div>

                                    {/* Action Buttons Footer section inside ID card */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 w-full shrink-0">
                                      <div className="relative">
                                        <button
                                          type="button"
                                          onClick={() => setActiveDropdownStaffId(activeDropdownStaffId === staff.id ? null : staff.id)}
                                          className="px-2.5 py-1.5 text-[9px] font-black bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                                        >
                                          <Settings size={11} />
                                          <span>{language === 'ar' ? 'تبديل الصلاحيات ▾' : 'Permissions ▾'}</span>
                                        </button>

                                        {/* Dropdown Menu Portals for direct toggle */}
                                        {activeDropdownStaffId === staff.id && (
                                          <>
                                            <div 
                                              className="fixed inset-0 z-40 cursor-default" 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdownStaffId(null);
                                              }}
                                            />
                                            <div className={`absolute z-50 mt-1 pb-1.5 w-60 bg-white dark:bg-[#121829] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1 ${
                                              dir === 'rtl' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
                                            } sidebar-font-reset`}>
                                              <div className="px-2 py-1 border-b border-slate-100 dark:border-slate-800/60 mb-1">
                                                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">
                                                  {language === 'ar' ? 'تبديل فوري للصلاحيات' : 'Instant Permissions Shift'}
                                                </span>
                                              </div>
                                              {[
                                                { key: 'scan_barcode', labelAr: '🧬 كاميرا وفحص الباركود', labelEn: 'Chassis Barcode Engine' },
                                                { key: 'edit_fleet', labelAr: '📦 صرف قطع المخزن والعتاد', labelEn: 'Stores Inventory Sinks' },
                                                { key: 'approve_work', labelAr: '✍️ توقيع واعتماد بطاقات الصيانة', labelEn: 'Work Order Final Approval' },
                                                { key: 'system_settings', labelAr: '⚙️ إشراف سحابي وإعداد SaaS', labelEn: 'Administrative Super Control' },
                                              ].map((p) => {
                                                const currentPerms = staff.permissions || [];
                                                const isChecked = currentPerms.includes(p.key);
                                                return (
                                                  <button
                                                    key={p.key}
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleInlineTogglePermission(staff.id, p.key);
                                                    }}
                                                    className={`w-full p-2 rounded-xl flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer text-[9.5px] transition-all text-right ${
                                                      isChecked ? 'font-black text-teal-600 dark:text-teal-400 bg-teal-500/5' : 'text-slate-650 dark:text-slate-400'
                                                    } ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                                                  >
                                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                                      isChecked 
                                                        ? 'bg-teal-600 border-teal-650 text-white' 
                                                        : 'border-slate-300 dark:border-slate-705'
                                                    }`}>
                                                      {isChecked && <Check size={8} strokeWidth={4} className="text-white" />}
                                                    </div>
                                                    <span className="truncate flex-1">
                                                      {language === 'ar' ? p.labelAr : p.labelEn}
                                                    </span>
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </>
                                        )}
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleStartEditStaff(staff)}
                                        className="px-3 py-1.5 text-[9.5px] font-black bg-slate-50 hover:bg-slate-100 dark:bg-slate-[#0f1422] dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
                                      >
                                        <Shield size={11} className="text-teal-555" />
                                        <span>{language === 'ar' ? 'قيود متقدمة' : 'Configure Shield'}</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 4: SYSTEM PREFERENCES & MODULARITY */}
                  {selectedSettingsTab === 'system' && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="border-b border-violet-100 dark:border-violet-900/60 pb-3">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Cpu size={16} className="text-violet-500 animate-pulse" />
                          <span className="bg-gradient-to-r from-violet-650 via-indigo-600 to-purple-650 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            {language === 'ar' ? 'بوابة التحكم بالمنصة وإعدادات الـ SaaS' : 'SaaS System Control Portal & Settings'}
                          </span>
                        </h4>
                        <p className="text-[10px] text-slate-450 mt-1">
                          {language === 'ar' ? 'تحكّم بلون الهوية، واضبط موديولات الـ SaaS المفعلة، ووفر بيئة عمل مخصصة بالكامل مجهزة بالهوية التجارية.' : 'Configure default system language, fine-tune live event notifications, toggle platform capabilities, or deploy quick workspace scope presets.'}
                        </p>
                      </div>

                      {/* General Localization Setup */}
                      <div className="space-y-4 pt-2">

                        {/* Dynamic Interactive Upgrade Pricing Tiers Popup frame */}
                        <AnimatePresence>
                          {isUpgradeModalOpen && (
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                              <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 overflow-hidden text-right"
                                dir="rtl"
                              >
                                {/* Modal Header */}
                                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                                  <button
                                    type="button"
                                    onClick={() => setIsUpgradeModalOpen(false)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-slate-500 hover:text-slate-800 border-0"
                                  >
                                    <X size={16} />
                                  </button>
                                  <div className="flex items-center gap-2">
                                    <Sparkles size={18} className="text-amber-500 animate-bounce" />
                                    <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                                      {language === 'ar' ? 'توسيع سعة تخزين خوادم قاعدة البيانات' : 'Expand Cloud Database Storage Capacity'}
                                    </h3>
                                  </div>
                                </div>

                                {!upgradeSuccessPlan ? (
                                  <>
                                    <div className="text-xs text-slate-550 leading-relaxed text-right space-y-1">
                                      <p>🔍 <strong>خطتك الحالية للورشة:</strong> السعة الأساسية المجانية (15 جيجابايت).</p>
                                      <p>اختر أحد باقات التوسيع لتفادي تعطيل حفظ كشوف فحص الأسطول وحفظ أرشفة السيارات:</p>
                                    </div>

                                    {/* Plan Tiers */}
                                    <div className="grid grid-cols-1 gap-3 pt-1">
                                      {[
                                        { name: 'باقة التخزين المتقدمة (Silver Reserve)', space: 100, price: '49 ر.س', desc: 'مناسبة للورش المتوسطة لحفظ كشوف المركبات والفحوصات وسجلات قطع الغيار الكثيفة.' },
                                        { name: 'باقة التخزين الاحترافية (Gold Reserve)', space: 1000, price: '99 ر.س', desc: 'تتيح أرشفة وتزامن لا محدود لأكثر من 5,000 مركبة مع نسخ احتياطي دوري كامل وسجلات باركود.' },
                                        { name: 'باقة الـسعة اللامحدودة (Enterprise Block)', space: 100000, price: '199 ر.س', desc: 'سعة غير محدودة مع سرعة معالجة فائقة مخصصة للمؤسسات الكبرى متعددة الفروع والمستودعات.' }
                                      ].map((plan) => (
                                        <button
                                          key={plan.name}
                                          type="button"
                                          onClick={() => {
                                            handleUpdateStorageUsed(storageUsed);
                                            setStorageMax(plan.space);
                                            setUpgradeSuccessPlan(plan.name);
                                            setTimeout(() => {
                                              setIsUpgradeModalOpen(false);
                                              setUpgradeSuccessPlan(null);
                                            }, 3500);
                                          }}
                                          className="p-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-between items-center transition-all text-right cursor-pointer hover:border-brand-blue-500 group"
                                        >
                                          <span className="p-2 bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-extrabold text-[11px] rounded-xl transition-all">
                                            ترقية السعة
                                          </span>
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2 justify-end">
                                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 font-extrabold text-slate-600 dark:text-slate-300">
                                                {plan.price} / شهرياً
                                              </span>
                                              <h4 className="text-xs font-black text-slate-850 dark:text-slate-100 group-hover:text-brand-blue-500 transition-colors">
                                                {plan.name} ({plan.space >= 1000 ? `${plan.space / 1000} تيرابايت` : `${plan.space} جيجابايت`})
                                              </h4>
                                            </div>
                                            <p className="text-[10px] text-slate-400">
                                              {plan.desc}
                                            </p>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                ) : (
                                  <div className="py-8 text-center space-y-4">
                                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-2xl animate-bounce">
                                      ✓
                                    </div>
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-black text-emerald-500">
                                        تمت ترقية سعة التخزين بنجاح!
                                      </h4>
                                      <p className="text-xs text-slate-550 leading-relaxed max-w-sm mx-auto">
                                        تهانينا! لقد تم شحن وزيادة مساحتك التخزينية بنجاح إلى باقة <strong>{upgradeSuccessPlan}</strong> المتقدمة. لقد تم استئناف كافة خدمات النسخ الاحتياطي والمزامنة السحابية وسيعمل جرس الذاكرة في وضعه الآمن الآن.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div className="text-[9px] text-slate-400 text-center pt-2 leading-normal">
                                  تتم المعالجة وتحديث سعتك التخزينية بأعلى معايير الأمان السحابي المشفرة.
                                </div>
                              </motion.div>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* General Localization Setup */}
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2 text-right">
                          <label className="text-[10.5px] text-slate-500 block font-black">
                            {language === 'ar' ? 'لغة واجهة المستخدم الرئيسية للتطبيق' : 'Default Platform UI Language'}
                          </label>
                          <div className="grid grid-cols-2 gap-2.5">
                            {[
                              { code: 'ar', label: 'العربية (من اليمين لليسار)', flag: '🇸🇦' },
                              { code: 'en', label: 'English Layout', flag: '🇺🇸' }
                            ].map((lang) => (
                              <button
                                key={lang.code}
                                type="button"
                                onClick={() => setLanguage(lang.code as 'ar' | 'en')}
                                className={`p-3 border rounded-2xl flex items-center gap-2 justify-center text-xs font-black cursor-pointer transition-all border-0 ${
                                  language === lang.code 
                                    ? 'bg-brand-blue-500 text-white border-brand-blue-500 shadow-xs' 
                                    : 'bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-400 border-slate-150 dark:border-slate-800 hover:border-slate-200'
                                }`}
                              >
                                <span>{lang.flag}</span>
                                <span>{lang.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Extra push and toggle switches */}
                        <div className={`p-3 bg-slate-50 dark:bg-slate-900/55 rounded-2xl flex items-center justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <div className={`space-y-0.5 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                            <span className="text-xs font-black block text-slate-800 dark:text-slate-100">
                              {language === 'ar' ? 'تفعيل التنبيهات والاتصال المباشر (Active Sinks)' : 'Enable Live Event Sinks'}
                            </span>
                            <span className="text-[9px] text-slate-400 block">
                              {language === 'ar' ? 'إطلاق جرس فوري عند تتبع فحص باركود أو ضغط طارئ للورشة.' : 'Push critical hardware diagnostic logs automatically.'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPushNotifications(!pushNotifications)}
                            className={`w-9 h-5 rounded-full relative transition-colors border-0 ${pushNotifications ? 'bg-brand-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${pushNotifications ? (dir === 'rtl' ? 'right-5' : 'left-5') : (dir === 'rtl' ? 'right-1' : 'left-1')}`} />
                          </button>
                        </div>

                        <div className={`p-3 bg-slate-50 dark:bg-slate-900/55 rounded-2xl flex items-center justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <div className={`space-y-0.5 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                            <span className="text-xs font-black block text-slate-800 dark:text-slate-100">
                              {language === 'ar' ? 'مزامنة السحاب التلقائية' : 'Simulated Automated Backup Schedule'}
                            </span>
                            <span className="text-[9px] text-slate-400 block">
                              {language === 'ar' ? 'حفظ الحالات والتذاكر وتثبيت نسخة إلى خادم الـ Backup.' : 'Archive dispatch checklists to secure offsite databases.'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAutomatedBackups(!automatedBackups)}
                            className={`w-9 h-5 rounded-full relative transition-colors border-0 ${automatedBackups ? 'bg-brand-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${automatedBackups ? (dir === 'rtl' ? 'right-5' : 'left-5') : (dir === 'rtl' ? 'right-1' : 'left-1')}`} />
                          </button>
                        </div>

                        {/* Biometric Login Simulation Toggle Option */}
                        <div className={`p-3 bg-slate-50 dark:bg-slate-900/55 rounded-2xl flex items-center justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <div className={`space-y-0.5 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                            <span className="text-xs font-black block text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{language === 'ar' ? 'تسجيل الدخول بالبصمة الحيوية (Fingerprint/FaceID)' : 'Biometric Login Simulation'}</span>
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-brand-blue-500/10 text-brand-blue-500 rounded text-[8px] font-bold">
                                {language === 'ar' ? 'محاكاة آمنة' : 'Simulation'}
                              </span>
                            </span>
                            <span className="text-[9px] text-slate-450 dark:text-slate-405 block">
                              {language === 'ar' 
                                ? 'تمكين أو تعطيل مستشعر البصمة الافتراضي في شاشة الدخول لتسجيل الدخول السريع.' 
                                : 'Enable or disable the interactive biometric scanner on the login page.'
                              }
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newValue = !biometricEnabled;
                              setBiometricEnabled(newValue);
                              localStorage.setItem('saas_biometric_enabled', newValue ? 'true' : 'false');
                              window.dispatchEvent(new Event('storage'));
                            }}
                            className={`w-9 h-5 rounded-full relative transition-colors border-0 ${biometricEnabled ? 'bg-brand-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${biometricEnabled ? (dir === 'rtl' ? 'right-5' : 'left-5') : (dir === 'rtl' ? 'right-1' : 'left-1')}`} />
                          </button>
                        </div>

                        {/* 🌟 SaaS Scale Customizer & Dynamic Module Toggles (SystemSettings Component) 🌟 */}
                        <SystemSettings onModuleChange={(updated) => setEnabledModuleIds(updated)} />
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 5: CLOUD DATABASE BACKUP & SYNC */}
                  {selectedSettingsTab === 'cloud_sync' && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="border-b border-violet-100 dark:border-violet-900/60 pb-3">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Database size={16} className="text-violet-500 animate-pulse" />
                          <span className="bg-gradient-to-r from-violet-650 via-indigo-600 to-purple-650 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            {language === 'ar' ? 'بوابة المزامنة والربط السحابي الذكي' : 'Cloud Database Sync Portal'}
                          </span>
                        </h4>
                        <p className="text-[10px] text-slate-450 mt-1">
                          {language === 'ar' ? 'راقب سعة قاعدة البيانات المباشرة، وجدول المزامنة التلقائية مع خدمات الدعم، وقم برفع وحفظ النسخ الاحتياطية فورا.' : 'Monitor server-capacity quotas of live Google Firestore schemas, configure automated backup synchronization timers, and force offsite data uploads.'}
                        </p>
                      </div>

                      {/* Cloud Storage Database Management Center */}
                      <div className="p-6 bg-gradient-to-br from-violet-600/10 via-indigo-600/5 to-purple-650/10 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 border border-violet-500/25 dark:border-violet-500/30 rounded-3xl space-y-6 relative overflow-hidden shadow-lg shadow-violet-500/5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className={`flex items-center justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''} relative z-10`}>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-violet-500/15 text-violet-500 flex items-center justify-center shadow-inner">
                              <Database size={16} />
                            </div>
                            <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                              <h5 className="text-xs font-black text-slate-800 dark:text-slate-100">
                                {language === 'ar' ? 'بوابة المزامنة والربط السحابي (Google Firestore)' : 'Live Google Firestore Database Integration'}
                              </h5>
                              <p className="text-[9.5px] text-slate-450">
                                {language === 'ar' ? 'مزامنة وتخزين فوري آمن لجميع كشوف الفحص وحالات سيارات أسطولك' : 'Fully scalable real-time database syncing diagnostic checklists, vehicles and staff history'}
                              </p>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[9px] font-black animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 block" />
                            {language === 'ar' ? 'قناة مشفرة متطابقة' : 'Firestore Live Secured'}
                          </span>
                        </div>

                        {/* Dynamic Storage Capacity Gauge (Gmail Style) */}
                        <div className={`p-4 bg-white dark:bg-slate-950/60 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                          <div className={`flex justify-between items-center text-xs font-black ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            <span className="flex items-center gap-1.5 text-slate-705 dark:text-slate-300">
                              <HardDrive size={13} className="text-violet-500" />
                              {language === 'ar' ? 'حالة السعة المحددة لقاعدة بيانات ورشتك' : 'Workshop Cloud Storage Quota'}
                            </span>
                            <span className={`text-[10px] ${
                              (storageUsed / storageMax) >= 1.0 ? 'text-rose-500 font-extrabold' :
                              (storageUsed / storageMax) >= 0.9 ? 'text-amber-500 font-extrabold' :
                              'text-violet-500'
                            }`}>
                              {Math.round((storageUsed / storageMax) * 100)}% {language === 'ar' ? 'ممتلئ' : 'consumed'}
                            </span>
                          </div>

                          {/* Beautiful visual progress indicator container */}
                          <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (storageUsed / storageMax) * 100)}%` }}
                              transition={{ type: "spring", stiffness: 60 }}
                              className={`h-full rounded-full ${
                                (storageUsed / storageMax) >= 1.0 ? 'bg-gradient-to-r from-rose-500 to-red-650' :
                                (storageUsed / storageMax) >= 0.9 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                                'bg-gradient-to-r from-emerald-400 to-violet-500'
                              }`}
                            />
                          </div>

                          {/* Label of memory allocated */}
                          <div className={`flex justify-between items-center text-[10px] text-slate-400 font-bold ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            <span>
                              {language === 'ar' 
                                ? `${storageUsed.toFixed(1)} جيجابايت مستخدمة` 
                                : `${storageUsed.toFixed(1)} GB Synchronized`}
                            </span>
                            <span>
                              {language === 'ar' 
                                ? `الحد الأقصى للتخزين: ${storageMax.toFixed(1)} جيجابايت` 
                                : `Cloud Reserve Limit: ${storageMax.toFixed(1)} GB`}
                            </span>
                          </div>

                          {/* Real-time Warning alert if space runs low or full, just like Gmail / Google Drive */}
                          <AnimatePresence>
                            {(storageUsed / storageMax) >= 0.9 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`p-3 rounded-xl border text-[10px] leading-relaxed font-bold mt-2 ${
                                  (storageUsed / storageMax) >= 1.0 
                                    ? 'bg-rose-500/15 text-rose-500 border-rose-500/30' 
                                    : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                                }`}
                              >
                                <div className={`flex items-start gap-1.5 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                  <div className="flex-1 space-y-1">
                                    <p className="font-black text-[11px]">
                                      {(storageUsed / storageMax) >= 1.0 
                                        ? (language === 'ar' ? '⚠️ الذاكرة ممتلئة بالكامل!' : '⚠️ Storage space is full!') 
                                        : (language === 'ar' ? '⚠️ أوشكت مساحة السيرفر على النفاد!' : '⚠️ Cloud Storage almost full!')}
                                    </p>
                                    <p className="font-medium text-slate-650 dark:text-slate-300 leading-relaxed text-[9.5px]">
                                      {(storageUsed / storageMax) >= 1.0 
                                        ? (language === 'ar' 
                                            ? 'لقد استنفدت 100% من سعتك السحابية المحددة لخطتك. تم إيقاف النسخ الاحتياطي التراكمي وتحديثات الأسطول فوراً لتفادي نقص التناسق.' 
                                            : 'You have consumed 100% of your allocated database storage quota. Automated live backups are paused to prevent write collision conflicts.')
                                        : (language === 'ar'
                                            ? 'تم استخدام أكثر من 90% من المساحة في الخادم. يُرجى ترقية خطتك السحابية الآن لضمان عدم تعرض العمليات بالورشة وحفظ سجلات السيارات لأي توقف.'
                                            : 'Over 90% of storage used. Please upgrade your storage account options today to prevent backup interruption.')}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setUpgradeSuccessPlan(null);
                                        setIsUpgradeModalOpen(true);
                                      }}
                                      className="mt-2.5 px-3 py-1.5 bg-brand-blue-500 hover:bg-brand-blue-600 font-extrabold text-white rounded-xl text-[10px] transition-all cursor-pointer shadow-xs inline-flex items-center gap-1 border-0"
                                    >
                                      <Sparkles size={11} />
                                      <span>{language === 'ar' ? 'ترقية وحجز سعة سحابية كبرى' : 'Upgrade Cloud Capacity Now'}</span>
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Quick Preset Simulator for Testers/Developers to witness warnings behavior */}
                        <div className={`p-3 bg-slate-100/55 dark:bg-slate-900/60 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-2 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                          <span className="text-[10px] font-black block text-slate-505">
                            🛠️ {language === 'ar' ? 'محاكي سعة التخزين (لاختبار جرس التحذير ونوافذ الامتلاء):' : 'Storage Quota Simulator (To test full-space alerts):'}
                          </span>
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateStorageUsed(5.0)}
                              className={`text-[9px] font-black p-1.5 bg-white dark:bg-slate-800 border rounded-xl cursor-pointer hover:bg-slate-50 transition-all ${storageUsed === 5.0 ? 'border-brand-blue-500 text-brand-blue-500 ring-2 ring-brand-blue-500/10' : 'border-slate-250 dark:border-slate-705'}`}
                            >
                              {language === 'ar' ? 'مساحة كافية (33%)' : 'Normal (33%)'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStorageUsed(14.3)}
                              className={`text-[9px] font-black p-1.5 bg-white dark:bg-slate-800 border rounded-xl cursor-pointer hover:bg-slate-50 transition-all ${storageUsed === 14.3 ? 'border-amber-500 text-amber-500 ring-2 ring-amber-500/10' : 'border-slate-250 dark:border-slate-705'}`}
                            >
                              {language === 'ar' ? 'تحذير (95%)' : 'Warning (95%)'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStorageUsed(15.0)}
                              className={`text-[9px] font-black p-1.5 bg-white dark:bg-slate-800 border rounded-xl cursor-pointer hover:bg-slate-50 transition-all ${storageUsed === 15.0 ? 'border-rose-500 text-rose-500 ring-2 ring-rose-500/10' : 'border-slate-250 dark:border-slate-705'}`}
                            >
                              {language === 'ar' ? 'ممتلئ خطير (100%)' : 'Critical Full (100%)'}
                            </button>
                          </div>
                        </div>

                        {/* Force Backup Push & Restore Actions */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <button
                            type="button"
                            onClick={handleCloudDownload}
                            disabled={isCloudSyncing}
                            className="p-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 disabled:opacity-50 text-slate-800 dark:text-slate-200 rounded-2xl flex items-center justify-center gap-2 text-xs font-black cursor-pointer transition-all"
                          >
                            <Database size={14} className={isCloudSyncing ? "animate-spin" : ""} />
                            <span>{language === 'ar' ? 'استعادة وجلب النسخة' : 'Cloud Restore Sync'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleCloudUpload}
                            disabled={isCloudSyncing}
                            className="p-3 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-650 text-white disabled:opacity-50 rounded-2xl flex items-center justify-center gap-2 text-xs font-black cursor-pointer transition-all shadow-md shadow-violet-500/15 border-0 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]"
                          >
                            <Upload size={14} className={isCloudSyncing ? "animate-spin text-white" : "text-white"} />
                            <span>{language === 'ar' ? 'رفع ومزامنة السحاب' : 'Cloud Push Backup'}</span>
                          </button>
                        </div>

                        {/* Dynamics Synchronization Feedback Banner */}
                        <AnimatePresence>
                          {cloudFeedback && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className={`p-3 rounded-2xl text-[10px] font-black border ${
                                cloudFeedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25' :
                                cloudFeedback.type === 'error' ? 'bg-rose-500/10 text-rose-600 border-rose-500/25' :
                                'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25'
                              }`}
                            >
                              <div className={`flex items-start gap-1 p-0.5 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                                <span>ℹ️</span>
                                <div className="flex-1">{cloudFeedback.text}</div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Automated Background Backup Toggle Switch */}
                        <div className={`p-4 bg-white dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 flex items-center justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <div className={`space-y-0.5 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                            <span className="text-xs font-black block text-slate-800 dark:text-slate-100">
                              {language === 'ar' ? 'جدولة النسخ الاحتياطي التلقائي السحابي' : 'Automated Background Sync Schedule'}
                            </span>
                            <span className="text-[9px] text-slate-450 block font-medium">
                              {language === 'ar' ? 'تزامن خلفي مستمر وتلقائي لكشوف فحص المركبات كل 30 دقيقة.' : 'Auto-save diagnostic checklists securely to the cloud reserves database every 30 minutes.'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAutomatedBackups(!automatedBackups)}
                            className={`w-9 h-5 rounded-full relative transition-colors border-0 shrink-0 cursor-pointer ${automatedBackups ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${automatedBackups ? (dir === 'rtl' ? 'right-5' : 'left-5') : (dir === 'rtl' ? 'right-1' : 'left-1')}`} />
                          </button>
                        </div>

                        {/* Dynamic Interactive Upgrade Pricing Tiers Popup frame */}
                        <AnimatePresence>
                          {isUpgradeModalOpen && (
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                              <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 overflow-hidden text-right"
                                dir="rtl"
                              >
                                {/* Modal Header */}
                                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                                  <button
                                    type="button"
                                    onClick={() => setIsUpgradeModalOpen(false)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-slate-500 hover:text-slate-800 border-0"
                                  >
                                    <X size={16} />
                                  </button>
                                  <div className="flex items-center gap-2">
                                    <Sparkles size={18} className="text-amber-500 animate-bounce" />
                                    <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                                      {language === 'ar' ? 'توسيع سعة تخزين خوادم قاعدة البيانات' : 'Expand Cloud Database Storage Capacity'}
                                    </h3>
                                  </div>
                                </div>

                                {!upgradeSuccessPlan ? (
                                  <>
                                    <div className="text-xs text-slate-550 leading-relaxed text-right space-y-1">
                                      <p>🔍 <strong>خطتك الحالية للورشة:</strong> السعة الأساسية المجانية (15 جيجابايت).</p>
                                      <p>اختر أحد باقات التوسيع لتفادي تعطيل حفظ كشوف فحص الأسطول وحفظ أرشفة السيارات:</p>
                                    </div>

                                    {/* Plan Tiers */}
                                    <div className="grid grid-cols-1 gap-3 pt-1">
                                      {[
                                        { name: 'باقة التخزين المتقدمة (Silver Reserve)', space: 100, price: '49 ر.س', desc: 'مناسبة للورش المتوسطة لحفظ كشوف المركبات والفحوصات وسجلات قطع الغيار الكثيفة.' },
                                        { name: 'باقة التخزين الاحترافية (Gold Reserve)', space: 1000, price: '99 ر.س', desc: 'تتيح أرشفة وتزامن لا محدود لأكثر من 5,000 مركبة مع نسخ احتياطي دوري كامل وسجلات باركود.' },
                                        { name: 'باقة الـسعة اللامحدودة (Enterprise Block)', space: 100000, price: '199 ر.س', desc: 'سعة غير محدودة مع سرعة معالجة فائقة مخصصة للمؤسسات الكبرى متعددة الفروع والمستودعات.' }
                                      ].map((plan) => (
                                        <button
                                          key={plan.name}
                                          type="button"
                                          onClick={() => {
                                            handleUpdateStorageUsed(storageUsed);
                                            setStorageMax(plan.space);
                                            setUpgradeSuccessPlan(plan.name);
                                            setTimeout(() => {
                                              setIsUpgradeModalOpen(false);
                                              setUpgradeSuccessPlan(null);
                                            }, 3500);
                                          }}
                                          className="p-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-between items-center transition-all text-right cursor-pointer hover:border-violet-500 group"
                                        >
                                          <span className="p-2 bg-gradient-to-r from-violet-650 to-indigo-600 hover:opacity-95 text-white font-extrabold text-[11px] rounded-xl transition-all">
                                            ترقية السعة
                                          </span>
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2 justify-end">
                                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 font-extrabold text-slate-600 dark:text-slate-300">
                                                {plan.price} / شهرياً
                                              </span>
                                              <h4 className="text-xs font-black text-slate-850 dark:text-slate-100 group-hover:text-violet-500 transition-colors">
                                                {plan.name} ({plan.space >= 1000 ? `${plan.space / 1000} تيرابايت` : `${plan.space} جيجابايت`})
                                              </h4>
                                            </div>
                                            <p className="text-[10px] text-slate-400">
                                              {plan.desc}
                                            </p>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                ) : (
                                  <div className="py-8 text-center space-y-4">
                                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-2xl animate-bounce">
                                      ✓
                                    </div>
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-black text-emerald-500">
                                        تمت ترقية سعة التخزين بنجاح!
                                      </h4>
                                      <p className="text-xs text-slate-550 leading-relaxed max-w-sm mx-auto">
                                        تهانينا! لقد تم شحن وزيادة مساحتك التخزينية بنجاح إلى باقة <strong>{upgradeSuccessPlan}</strong> المتقدمة. لقد تم استئناف كافة خدمات النسخ الاحتياطي والمزامنة السحابية وسيعمل جرس الذاكرة في وضعه الآمن الآن.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div className="text-[9px] text-slate-400 text-center pt-2 leading-normal">
                                  تتم المعالجة وتحديث سعتك التخزينية بأعلى معايير الأمان السحابي المشفرة.
                                </div>
                              </motion.div>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 6: SUPPORT TICKETS & MAINTENANCE */}
                  {selectedSettingsTab === 'tickets' && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <SupportTickets />
                    </motion.div>
                  )}
                </div>
              )}
              </div>

              {/* Submit Panel */}
              {selectedSettingsTab !== null && (
                <div className={`p-6 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0f1422] flex gap-3 justify-end ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedSettingsTab(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-705 dark:text-slate-400 cursor-pointer"
                  >
                    {language === 'ar' ? 'رجوع للقسم الرئيسي' : 'Back to Panel'}
                  </button>
                  {selectedSettingsTab !== 'tickets' && (
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      className={`px-5 py-2 text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        saasBrandColor === 'emerald' ? 'bg-emerald-500 hover:bg-emerald-600' : saasBrandColor === 'amber' ? 'bg-amber-500 hover:bg-amber-600' : saasBrandColor === 'rose' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-brand-blue-500 hover:bg-brand-blue-600'
                      }`}
                    >
                      {showSaveFeedback ? (
                        <>
                          <Check size={14} />
                          <span>{language === 'ar' ? 'تم حفظ البيانات!' : 'Saved successfully!'}</span>
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          <span>{language === 'ar' ? 'حفظ واعتماد التغييرات' : 'Apply Settings'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Technical Support Chat Box */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 30 }}
              className="bg-white dark:bg-[#0f1422] w-full max-w-lg h-[500px] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className={`p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/25 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2.5 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/45 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-100/30">
                    <MessageSquare size={18} className="text-emerald-500 shrink-0" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                      {language === 'ar' ? 'الدعم الميداني وقنوات المساعدة' : 'Mechanic Live Desk & Support'}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {language === 'ar' ? 'منصة تواصل تفاعلية فورية ومولد التذاكر' : 'Interactive real-time communication & dispatch ticket desk'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSupportModalOpen(false)}
                  className="p-2 bg-slate-150/40 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-500 rounded-xl cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 dark:bg-slate-950/20 flex flex-col">
                {chatHistory.map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col max-w-[80%] ${
                      item.sender === 'user' 
                        ? 'self-end bg-brand-blue-500 text-white rounded-br-none rounded-2xl p-3' 
                        : 'self-start bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-750 p-3 rounded-bl-none rounded-2xl'
                    }`}
                  >
                    <p className={`text-[11.5px] leading-relaxed font-semibold ${
                      item.sender === 'user' ? 'text-right' : (dir === 'rtl' ? 'text-right' : 'text-left')
                    }`}>
                      {item.text}
                    </p>
                    <span className="text-[9px] mt-1 text-slate-400 dark:text-slate-500 font-mono self-end">
                      {item.time}
                    </span>
                  </div>
                ))}
                
                {supportTicketId && (
                  <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-900/20 border border-emerald-250/30 dark:border-emerald-850/40 rounded-2xl text-center space-y-1.5 animate-bounce">
                    <p className="text-[11px] font-black text-emerald-800 dark:text-emerald-400">
                      🎉 {language === 'ar' ? 'تم توليد تذكرة دعم فني SaaS معتمدة!' : 'SaaS Support Ticket Generated!'}
                    </p>
                    <p className="text-xs font-mono font-black text-slate-800 dark:text-white bg-white dark:bg-slate-900 px-3 py-1.5 inline-block rounded-xl border">
                      {supportTicketId}
                    </p>
                    <p className="text-[9px] text-slate-400 block pb-1">
                      {language === 'ar' ? 'سيتواصل معك خبير معترف به خلال ساعة عمل واحدة.' : 'SLA parameters instantiated. Response scheduled in 1 working hour.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Fast choices & ticket instantiator */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    language === 'ar' ? 'مشكلة فوترة' : 'Billing Inquiry',
                    language === 'ar' ? 'استقصاء قطع' : 'Part Inventory Info',
                    language === 'ar' ? 'بطء بالنظام' : 'Slow Dashboard Issue'
                  ].map((pill, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setChatMessage(pill);
                      }}
                      className="text-[9.5px] font-black text-brand-blue-600 dark:text-brand-blue-450 bg-brand-blue-50/70 dark:bg-brand-blue-950/40 hover:bg-brand-blue-100 dark:hover:bg-brand-blue-900/30 px-2.5 py-1 rounded-xl cursor-pointer"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
                
                {!supportTicketId && (
                  <button
                    onClick={handleCreateTicket}
                    className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    <BadgeAlert size={12} />
                    <span>{language === 'ar' ? 'افتح تذكرة صيانة SLA 🎫' : 'Open Ticket 🎫'}</span>
                  </button>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className={`p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <input 
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder={language === 'ar' ? 'اكتب تساؤلك أو رسالتك للدعم...' : 'Ask dynamic desk coordinates...'}
                  className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:bg-white dark:focus:bg-slate-800 focus:border-brand-blue-500 rounded-xl outline-none text-xs font-semibold dark:text-white"
                />
                <button 
                  type="submit"
                  className="p-3 bg-brand-blue-500 hover:bg-brand-blue-600 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs"
                >
                  <Send size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* 🌟 Getting Started & Setup Wizard Onboarding Modal 🌟 */}
        {isWizardOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="bg-white dark:bg-[#0f1422] w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col font-sans"
              dir={dir}
            >
              {/* Wizard Dynamic Progress Header */}
              <div className="p-6 border-b border-slate-150 dark:border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/20">
                <div className={`space-y-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider bg-violet-500/10 text-violet-500 px-2 py-0.5 rounded-lg font-black font-mono">
                      {language === 'ar' ? `الخطوة ${wizardStep} من 4` : `Step ${wizardStep} of 4`}
                    </span>
                    <span className="text-amber-500 text-xs font-bold flex items-center gap-1">
                      <Sparkles size={11} className="animate-pulse" />
                      {language === 'ar' ? 'تهيئة مخصصة ذكية' : 'Smart setup Customizer'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {language === 'ar' ? 'مرشد البدء السريع وإعداد أبعاد النظام' : 'Getting Started Welcome Wizard & Configurator'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === 'ar' ? 'مواءمة النظام وتفصيل الأقسام حسب متطلبات وكادرك الفني بضغطة واحدة.' : 'Tailor your Axoventra platform based on your fleet density & corporate focus.'}
                  </p>
                </div>

                {/* Steps Visual Bar */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div 
                        onClick={() => {
                          if (step < wizardStep) setWizardStep(step);
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                          wizardStep === step 
                            ? 'bg-violet-500 text-white ring-4 ring-violet-500/20' 
                            : wizardStep > step 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-slate-100 dark:bg-slate-850 text-slate-400'
                        }`}
                      >
                        {wizardStep > step ? <Check size={12} strokeWidth={3} /> : step}
                      </div>
                      {step < 4 && (
                        <div className={`w-6 h-0.5 ml-2 ${wizardStep > step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Wizard Steps Main Body Panel */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                
                {/* STEP 1: Fleet Nature and Operational Focus */}
                {wizardStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className={`space-y-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <h4 className="text-sm font-black text-slate-850 dark:text-white">
                        {language === 'ar' ? '1. ما هو مجال وطبيعة أسطولك وصيانتك؟' : '1. What is the nature of your fleet operational focus?'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {language === 'ar' ? 'اختر التوجه العام لنشاطك لمواءمة المسميات وواجهات الفحص تلقائياً.' : 'Selecting an option instantiates tailored terminology and diagnostic indexes.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        {
                          id: 'light',
                          icon: <Truck className="text-sky-500" size={20} />,
                          titleAr: 'المركبات الخفيفة والسيارات وسيارات المبيعات',
                          titleEn: 'Light Fleet / Leasing / Passenger VIP Cars',
                          descAr: 'لشركات التوصيل، التأجير، وسيارات الموظفين. تتبع استهلاك الوقود السريع، الكيلومترات (KM)، والتراخيص الفردية والوقائية صامتة.',
                          descEn: 'Perfect for delivery cabs, company fleets and retail pools. Tracks fuel, licenses, and mileage-based maintenance cycles.'
                        },
                        {
                          id: 'heavy',
                          icon: <Wrench className="text-amber-500" size={20} />,
                          titleAr: 'المعدات الثقيلة، الإنشائية والرافعات والبلدوزرات',
                          titleEn: 'Heavy Duty & Yellow Construction Equipment',
                          descAr: 'لشركات المقاولات، المصانع، والمجاميع الثقيلة. تتبع ساعات العمل الفعلية للمحركات (Hours Engine) بدلاً من المسافة، والضمان والامتثال الفاحص الصارم.',
                          descEn: 'Unlocks advanced engine-hours metrics, warranty tracking and stringent heavy safety checkpoints (Forklifts, Cranes).'
                        },
                        {
                          id: 'logistics',
                          icon: <Sliders className="text-emerald-500" size={20} />,
                          titleAr: 'الشاحنات الثقيلة، النقل والخدمات اللوجستية',
                          titleEn: 'Logistics Freight & Long-haul Cargo Trucks',
                          descAr: 'لشركات الشحن والخدمات الإمدادية. التركيز على استهلاك وقود المسافات الطويلة، تذاكر الفحص المترابطة، وسائقي الشحن وسقوف حركتهم الجغرافية.',
                          descEn: 'Optimized for cross-border freight routes, travel payload logs, and centralized driver scheduling matrix.'
                        },
                        {
                          id: 'hybrid',
                          icon: <Cpu className="text-violet-500" size={20} />,
                          titleAr: 'تشغيل هجين / عام (ورش ومحطات صيانة عامة)',
                          titleEn: 'General Workshop / Hybrid Maintenance Fleet',
                          descAr: 'أدوات مرنة تجمع كافة أنواع الأساطيل والسيارات والمعدات لإدارة صيانة متوازنة وتتبع كامل لكل شيء.',
                          descEn: 'A versatile preset enabling general layouts for diverse automotive workshop requirements and heavy parts logistics.'
                        }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setWizardFleetType(item.id);
                          }}
                          className={`p-4 border rounded-2xl flex flex-col items-start gap-2.5 transition-all outline-none cursor-pointer leading-normal ${
                            dir === 'rtl' ? 'text-right' : 'text-left'
                          } ${
                            wizardFleetType === item.id 
                              ? 'border-violet-500 bg-violet-500/[0.03] ring-2 ring-violet-500/20' 
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/15 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-white shrink-0">
                              {item.icon}
                            </div>
                            <span className="text-[11px] font-black text-slate-800 dark:text-white">
                              {language === 'ar' ? item.titleAr : item.titleEn}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-slate-400 dark:text-slate-400 font-medium leading-relaxed">
                            {language === 'ar' ? item.descAr : item.descEn}
                          </p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Company Scale and UI Simplicity Packages */}
                {wizardStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className={`space-y-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <h4 className="text-sm font-black text-slate-850 dark:text-white">
                        {language === 'ar' ? '2. حجم الشركة ونطاق الكادر الفني لوضع لوحة التحكم المفضلة' : '2. What is your team scale & functional interface level?'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {language === 'ar' ? 'هل كادرك قليل وتخشى أن يكون النظام معقداً؟ لا تقلق، بضغطة زر سنبسط الواجهة والخصائص تماماً لتلائم كادرك.' : 'Too complex? Let us strip away overhead features. Customize density instantly based on your staff scope.'}
                      </p>
                    </div>

                    <div className="space-y-3 font-sans">
                      {[
                        {
                          id: 'startup',
                          badge: language === 'ar' ? 'مبسط للغاية ⚡' : 'Ultra-Simplified',
                          color: 'amber',
                          titleAr: 'الباقة الميسرة والشركات الناشئة (تبسيط الواجهة بالكامل)',
                          titleEn: 'Micro & Lean Startup Tier (Highly simplified & focused)',
                          descAr: 'يخفي لراحتك المستودعات الكبيرة، جداول الموردين المعقدة، ومهندسي الكشف المتعددين. يفعل فقط: لوحة المتابعة، والتقرير السريع، ومرآة إدارة السيارات، وصيانة البلاغات وحل المشكلات.',
                          descEn: 'Removes dense secondary modules like spare parts catalogs and security compliance indexes. Keeps ONLY 5 essential views so you concentrate on fixes.'
                        },
                        {
                          id: 'sme',
                          badge: language === 'ar' ? 'صيانة ناضجة 🛠️' : 'Standard Pro',
                          color: 'emerald',
                          titleAr: 'الباقة المتوسطة والورش الإقليمية الكفوءة',
                          titleEn: 'Standard SME & Professional Fleet Operations',
                          descAr: 'يدرج تتبع السائقين، المخطط التفاعلي للورش الملونة حرارياً، والصيانات الدورية الوقائية المترابطة، مع الحفاظ على مخزن القطع مجرداً لتجنب تشويش الفريق.',
                          descEn: 'Includes scheduled preventive task alerts, workshop load tracking, driver sheets and live field diagnostics without inventory overhead.'
                        },
                        {
                          id: 'enterprise',
                          badge: language === 'ar' ? 'ERP متكامل 🏢' : 'Enterprise ERP',
                          color: 'blue',
                          titleAr: 'الباقة الشاملة والشركات الكبرى (النظام الكامل)',
                          titleEn: 'Full Enterprise-Scale Connected ERP Suite',
                          descAr: 'تثبيت وتشغيل كافة الـ 12 لوحة برصيد كامل: المستودعات التكتيكية العميقة، وحوكمة الصلاحيات المعزولة للأدمن والفنيين، وإدارة الموردين والتوريد والتعقب الأمني مع السجلات الكلية.',
                          descEn: 'Activates all modules. Full tactical warehouses, dual safety inspectors, automated vendor rosters, security credential propagation.'
                        }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setWizardCorpScale(item.id);
                            
                            // Adjust check list behind the scenes dynamically for step 3
                            if (item.id === 'startup') {
                              const startupIds = ['dashboard', 'reports', 'vehicles', 'maintenance', 'saas-billing'];
                              setEnabledModuleIds(startupIds);
                            } else if (item.id === 'sme') {
                              const smeIds = ['dashboard', 'reports', 'vehicles', 'drivers', 'maintenance', 'periodic-maintenance', 'workshops', 'technicians', 'saas-billing'];
                              setEnabledModuleIds(smeIds);
                            } else {
                              const fullIds = MENU_ITEMS.map(m => m.id);
                              setEnabledModuleIds(fullIds);
                            }
                          }}
                          className={`p-4 border rounded-2xl flex items-start gap-4 transition-all outline-none cursor-pointer text-right w-full leading-normal ${
                            dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'
                          } ${
                            wizardCorpScale === item.id 
                              ? 'border-violet-500 bg-violet-500/[0.03] ring-2 ring-violet-500/20' 
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/15 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                          }`}
                        >
                          <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xs font-black ${
                            item.id === 'startup' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                            item.id === 'sme' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                            'bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400'
                          }`}>
                            {item.id === 'startup' ? <Cpu size={20} /> :
                             item.id === 'sme' ? <Wrench size={20} /> :
                             <LayoutDashboard size={20} />}
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className={`flex items-center gap-2 ${dir === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                              <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-lg ${
                                item.id === 'startup' ? 'bg-amber-500/10 text-amber-500' :
                                item.id === 'sme' ? 'bg-emerald-500/10 text-emerald-500' :
                                'bg-violet-500/10 text-violet-500'
                              }`}>
                                {item.badge}
                              </span>
                              <h5 className="text-[11.5px] font-black text-slate-850 dark:text-white">
                                {language === 'ar' ? item.titleAr : item.titleEn}
                              </h5>
                            </div>
                            <p className="text-[9.5px] text-slate-400 dark:text-slate-400 leading-relaxed font-medium">
                              {language === 'ar' ? item.descAr : item.descEn}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Modules Checklist customizer matrix */}
                {wizardStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className={`space-y-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <h4 className="text-sm font-black text-slate-850 dark:text-white">
                        {language === 'ar' ? '3. حدد الموديولات واللوحات التي تحتاج تشغيلها (مصفوفة الخصائص)' : '3. Personalize individual modules you actually need'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {language === 'ar' ? 'هذه الأقسام مجهزة للسيارات والمعدات. بضغط زر يمكنك إخفاء أي قسم لا تحتاجه الآن تماماً لتبسيط تجربة فريقك.' : 'Fine-tune live modules. Any unselected capability will instantly be hidden from your workspace navigation.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1.5 font-sans">
                      {MENU_ITEMS.filter(item => item.id !== 'dashboard' && item.id !== 'saas-billing').map((item) => {
                        const isEnabled = enabledModuleIds.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              let updated;
                              if (isEnabled) {
                                updated = enabledModuleIds.filter(id => id !== item.id);
                              } else {
                                updated = [...enabledModuleIds, item.id];
                              }
                              setEnabledModuleIds(updated);
                            }}
                            className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-900/60 ${
                              isEnabled 
                                ? 'border-violet-500/35 bg-violet-500/[0.03] text-slate-900 dark:text-white ring-1 ring-violet-500/5' 
                                : 'border-slate-205 dark:border-slate-850 text-slate-400 bg-slate-50/20'
                            } ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`p-2 rounded-xl shrink-0 ${isEnabled ? 'bg-violet-500/15 text-violet-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                {item.icon}
                              </div>
                              <span className={`text-[11px] font-black truncate ${isEnabled ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                                {item.label}
                              </span>
                            </div>

                            {/* Toggle checkbox */}
                            <div className={`w-8 h-4.5 rounded-full relative transition-colors shrink-0 ${isEnabled ? 'bg-violet-500' : 'bg-slate-205 dark:bg-slate-750'}`}>
                              <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${isEnabled ? (dir === 'rtl' ? 'right-4' : 'left-4') : (dir === 'rtl' ? 'right-0.5' : 'left-0.5')}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 bg-violet-500/10 border border-violet-500/10 rounded-2xl text-[9.5px] text-violet-600 dark:text-violet-400 text-center font-bold">
                      💡 {language === 'ar' ? 'ملاحظة: يمكنك دائماً تعديل وتحديث هذه التفضيلات بلمسة زر من قسم الإعدادات لاحقاً.' : 'Note: You can easily enable/disable these modules anytime through system configuration.'}
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: White label Branding identity preferences */}
                {wizardStep === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className={`space-y-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <h4 className="text-sm font-black text-slate-850 dark:text-white">
                        {language === 'ar' ? '4. خصص هوية وشعار علامتك التجارية (SaaS White-Labeling)' : '4. Personalize your premium white-label identity'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {language === 'ar' ? 'تعديل اسم النظام، السكاكين، وشعار ألوان منصتك ليلائم علامتك في لحظات صامتة.' : 'Update identity labels & brand presets propagated down to client dashboards.'}
                      </p>
                    </div>

                    <div className="space-y-3 font-sans">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {/* Brand Name Input */}
                        <div className="space-y-1">
                          <label className={`text-[10px] font-black text-slate-400 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                            {language === 'ar' ? 'اسم شركتك أو أسطولك:' : 'Your Business Name:'}
                          </label>
                          <input
                            type="text"
                            value={saasBrandName}
                            onChange={(e) => setSaasBrandName(e.target.value)}
                            placeholder={language === 'ar' ? 'مثال: أسطول الرياض للمقاولات' : 'e.g. Al-Riyadh Freight Logistics'}
                            className={`w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:bg-white dark:focus:bg-slate-800 rounded-xl outline-none text-xs font-semibold dark:text-white ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                          />
                        </div>

                        {/* Brand Tagline Input */}
                        <div className="space-y-1">
                          <label className={`text-[10px] font-black text-slate-400 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                            {language === 'ar' ? 'شعار اللوحة / عبارة الوصف:' : 'Workspace Slogan:'}
                          </label>
                          <input
                            type="text"
                            value={saasBrandDesc}
                            onChange={(e) => setSaasBrandDesc(e.target.value)}
                            placeholder={language === 'ar' ? 'مثال: نظام إدارة ومعالجة أعطال الفحص الميكانيكي' : 'e.g. Connected Heavy Fleet Diagnostic Engine'}
                            className={`w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:bg-white dark:focus:bg-slate-800 rounded-xl outline-none text-xs font-semibold dark:text-white ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                          />
                        </div>
                      </div>

                      {/* Brand Color Preset Picker */}
                      <div className="space-y-1.5 pt-2">
                        <label className={`text-[10px] font-black text-slate-400 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                          {language === 'ar' ? 'اختر سمة الألوان المفضلة للوحة التحكم:' : 'Select primary dashboard interface accent:'}
                        </label>
                        <div className={`flex flex-wrap gap-2.5 ${dir === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                          {[
                            { id: 'classic-blue', value: 'blue', color: 'bg-brand-blue-500', nameAr: 'أزرق كلاسيكي', nameEn: 'Classic Blue' },
                            { id: 'eco-green', value: 'emerald', color: 'bg-emerald-500', nameAr: 'أخضر بيئي', nameEn: 'Eco Green' },
                            { id: 'safety-gold', value: 'amber', color: 'bg-amber-500', nameAr: 'أصفر السلامة', nameEn: 'Safety Amber' },
                            { id: 'tactical-red', value: 'rose', color: 'bg-rose-500', nameAr: 'أحمر تكتيكي', nameEn: 'Tactical Rose' }
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setBrandTheme(item.id);
                                setSaasBrandColor(item.value);
                                setBrandPrimaryColor(item.value === 'blue' ? '#6d28d9' : item.value === 'emerald' ? '#10b981' : item.value === 'amber' ? '#f59e0b' : '#f43f5e');
                              }}
                              className={`px-3 py-2 border rounded-xl flex items-center gap-2 transition-all cursor-pointer text-xs font-bold ${
                                brandTheme === item.id 
                                  ? 'border-violet-500 bg-violet-500/10 text-slate-950 dark:text-white' 
                                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/10 text-slate-500 dark:text-slate-455'
                              }`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full ${item.color} block shrink-0`} />
                              <span>{language === 'ar' ? item.nameAr : item.nameEn}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Wizard Steps Control Footer Panels */}
              <div className="p-6 border-t border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                <div>
                  {wizardStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setWizardStep(prev => prev - 1)}
                      className="px-4.5 py-2.5 text-xs font-black text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <ChevronLeft size={14} className={dir === 'rtl' ? '' : 'rotate-180'} />
                      <span>{language === 'ar' ? 'السابق' : 'Back'}</span>
                    </button>
                  ) : (
                    localStorage.getItem('saas_wizard_completed') === 'true' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsWizardOpen(false);
                        }}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {language === 'ar' ? 'إغلاق المعالج' : 'Close wizard'}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 text-[9.5px] font-black text-rose-500 bg-rose-500/10 dark:bg-rose-500/5 rounded-xl border border-rose-500/10">
                        <Lock size={11} className="shrink-0" />
                        <span>{language === 'ar' ? 'يرجى إكمال الإعداد لتفعيل واجهة النظام' : 'Complete setup to activate system layout'}</span>
                      </div>
                    )
                  )}
                </div>

                <div className="flex gap-2">
                  {wizardStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setWizardStep(prev => prev + 1)}
                      className="px-5 py-2.5 text-white bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <span>{language === 'ar' ? 'متابعة الخطوة التالية' : 'Continue Next'}</span>
                      <ChevronLeft size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        // Complete & save configurations locally with live effect!
                        localStorage.setItem('saas_wizard_completed', 'true');
                        localStorage.setItem('saas_enabled_modules', JSON.stringify(enabledModuleIds));
                        localStorage.setItem('saas_brand_name', saasBrandName);
                        localStorage.setItem('saas_brand_desc', saasBrandDesc);
                        localStorage.setItem('saas_brand_color', saasBrandColor);
                        localStorage.setItem('saas_brand_theme', brandTheme);
                        localStorage.setItem('saas_brand_primary_color', brandPrimaryColor);
                        
                        // Fire event so local states instantly refresh
                        window.dispatchEvent(new Event('storage'));
                        
                        // Close
                        setIsWizardOpen(false);
                        setIsOnboardingOpen(true);
                        
                        // Show save completion toast or feedback
                        setShowSaveFeedback(true);
                        setTimeout(() => setShowSaveFeedback(false), 3000);
                      }}
                      className="px-6 py-2.5 text-white bg-emerald-500 hover:bg-emerald-600 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all animate-bounce"
                    >
                      <Check size={14} strokeWidth={3} />
                      <span>{language === 'ar' ? 'ابدأ إدارة أسطولك الذكي ⚡' : 'Deploy Smart Configuration ⚡'}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding Tour Module */}
      <OnboardingTour 
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAiEnabled={isAiEnabled}
        setIsAiEnabled={setIsAiEnabled}
        language={language}
      />
    </div>
  );
}
