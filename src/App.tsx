import React, { useState, useEffect } from 'react';
import AppLayout from './components/AppLayout';
import Dashboard from './components/Dashboard';
import Vehicles from './components/Vehicles';
import Drivers from './components/Drivers';
import Maintenance from './components/Maintenance';
import PeriodicMaintenance from './components/PeriodicMaintenance';
import Technicians from './components/Technicians';
import Workshops from './components/Workshops';
import ExternalMaintenance from './components/ExternalMaintenance';
import Inventory from './components/Inventory';
import Vendors from './components/Vendors';
import AIManager from './components/AIManager';
import Reports from './components/Reports';
import SaasBilling from './components/SaasBilling';
import SecurityAudit from './components/SecurityAudit';
import FirebaseSync from './components/FirebaseSync';
import DriverHandover from './components/DriverHandover';
import DriverPortal from './components/DriverPortal';
import MaintenanceBot from './components/MaintenanceBot';
import AiHub from './components/AiHub';
import Projects from './components/Projects';
import { User, UserRole } from './types';
import { MENU_ITEMS } from './constants';
import { useLanguage } from './services/LanguageContext';
import { Shield, Key, Eye, EyeOff, Wrench, Languages, Fingerprint, Layers, WifiOff, Globe, Check, AlertTriangle, RotateCcw, Loader2, Building2, CreditCard, Printer, Sparkles, ShieldAlert, UserCheck, ShieldCheck, X, Timer, Calendar, Clock, Headphones, MessageSquare, Send, CheckCircle2, Phone, Mail, HelpCircle, FileText, ChevronRight, ArrowRight, ShieldCheck as ShieldCheckIcon, ChevronDown, ChevronUp, Zap, ArrowUpRight, Truck, QrCode, Package, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MarketingLandingPage from './components/MarketingLandingPage';
import { MarketingAdmin } from './components/MarketingAdmin';
import VideoTutorialsModal from './components/VideoTutorialsModal';

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

const USERS: Record<UserRole, User> = {
  admin: {
    id: 'u1',
    name: 'المهندس خالد',
    title: 'مدير قسم الصيانة',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200',
  },
  technician: {
    id: 'u2',
    name: 'الفني أحمد',
    title: 'فني ميكانيك أول',
    role: 'technician',
    avatar: 'https://images.unsplash.com/photo-1620122303020-43ec4b6cf7f8?auto=format&fit=crop&q=80&w=200&h=200',
  },
  viewer: {
    id: 'u3',
    name: 'المراقب سالم',
    title: 'مراقب جودة',
    role: 'viewer',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200',
  },
  driver: {
    id: 'u4',
    name: 'السائق خالد الكعبي',
    title: 'سائق نقل ثقيل مرخص',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
  },
};

const getDynamicGreeting = (t: (key: string) => string, lang: 'ar' | 'en', brandName: string) => {
  const hour = new Date().getHours();
  let timeGreetingKey = 'login.greetings.night';
  
  if (hour >= 5 && hour < 12) {
    timeGreetingKey = 'login.greetings.morning';
  } else if (hour >= 12 && hour < 17) {
    timeGreetingKey = 'login.greetings.afternoon';
  } else if (hour >= 17 && hour < 21) {
    timeGreetingKey = 'login.greetings.evening';
  }

  const greeting = t(timeGreetingKey);
  const name = brandName || t('common.appName');
  const welcome = t('login.greetings.welcome');
  
  if (lang === 'ar') {
    return `${greeting}، ${welcome} ${name}`;
  } else {
    return `${greeting}, ${welcome} ${name}`;
  }
};

// Custom hook to detect browser language on absolute first load and update application language
function useBrowserLanguageDetector(language: 'ar' | 'en', setLanguage: (lang: 'ar' | 'en') => void) {
  useEffect(() => {
    const hasDetected = localStorage.getItem('app_language_detected');
    if (!hasDetected) {
      localStorage.setItem('app_language_detected', 'true');
      const browserLang = (
        navigator.language || 
        (navigator.languages && navigator.languages[0]) || 
        'en'
      ).toLowerCase();
      
      const matchedLang: 'ar' | 'en' = browserLang.startsWith('ar') ? 'ar' : 'en';
      
      if (language !== matchedLang) {
        setLanguage(matchedLang);
      }
    }
  }, [language, setLanguage]);
}

export default function App() {
  const [portalMode, setPortalMode] = useState<'marketing' | 'saas'>(() => {
    const saved = localStorage.getItem('saas_portal_mode');
    return (saved === 'marketing' || saved === 'saas' ? saved : 'marketing') as 'marketing' | 'saas';
  });
  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('saas_active_tab') || 'dashboard';
  });
  const [previousTab, setPreviousTab] = useState<string>('dashboard');
  const [activeTutorialVideoId, setActiveTutorialVideoId] = useState<string>('vid-1');
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('saas_remember_me') !== 'false';
  });
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedLocal = localStorage.getItem('saas_current_user');
    if (savedLocal) {
      try {
        return JSON.parse(savedLocal);
      } catch (e) {}
    }
    const savedSession = sessionStorage.getItem('saas_current_user');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {}
    }
    return USERS.admin;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('saas_is_logged_in') === 'true' || sessionStorage.getItem('saas_is_logged_in') === 'true';
  });

  const saveCurrentUserToStorage = (updatedUser: User, remember: boolean = localStorage.getItem('saas_is_logged_in') === 'true') => {
    const userJson = JSON.stringify(updatedUser);
    try {
      if (remember) {
        localStorage.setItem('saas_current_user', userJson);
        sessionStorage.removeItem('saas_current_user');
      } else {
        sessionStorage.setItem('saas_current_user', userJson);
        localStorage.removeItem('saas_current_user');
      }
    } catch (error) {
      console.warn('Failed to save user to storage, retrying with stripped avatar...', error);
      try {
        const strippedAvatar = updatedUser.avatar && updatedUser.avatar.startsWith('data:') ? '' : updatedUser.avatar;
        const strippedUser = { ...updatedUser, avatar: strippedAvatar };
        const strippedJson = JSON.stringify(strippedUser);
        if (remember) {
          localStorage.setItem('saas_current_user', strippedJson);
          sessionStorage.removeItem('saas_current_user');
        } else {
          sessionStorage.setItem('saas_current_user', strippedJson);
          localStorage.removeItem('saas_current_user');
        }
      } catch (innerError) {
        console.error('Failed to save stripped user to storage', innerError);
      }
    }
  };

  const setActiveTab = (tab: string) => {
    if (activeTab !== 'maintenance-bot' && tab !== activeTab) {
      setPreviousTab(activeTab);
    }
    const currentMenuItem = MENU_ITEMS.find(item => item.id === tab);
    const userRole = currentUser?.role || 'admin';
    if (isLoggedIn && currentMenuItem) {
      let isAllowed = currentMenuItem.roles.includes(userRole);
      
      // Load custom RBAC feature permissions from storage if set
      const savedCustom = localStorage.getItem('saas_rbac_custom_features');
      if (savedCustom) {
        try {
          const parsed = JSON.parse(savedCustom);
          if (parsed[tab]) {
            isAllowed = !!parsed[tab][userRole];
          }
        } catch (e) {}
      }

      if (isAllowed) {
        setActiveTabState(tab);
        localStorage.setItem('saas_active_tab', tab);
      } else {
        // إذا لم يملك الصلاحية، يتم توجيهه إلى لوحة التحكم الافتراضية
        console.warn(`Access denied for role [${userRole}] to tab [${tab}]. Redirecting to dashboard.`);
        setActiveTabState('dashboard');
        localStorage.setItem('saas_active_tab', 'dashboard');
      }
    } else {
      setActiveTabState(tab);
      localStorage.setItem('saas_active_tab', tab);
    }
  };
  
  const [openAddMaintenanceOnLoad, setOpenAddMaintenanceOnLoad] = useState(false);
  const [openAddVehicleOnLoad, setOpenAddVehicleOnLoad] = useState(false);
  
  // Login State
  const [loginRole, setLoginRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('admin@fleetaurvexis.com');
  const [passcode, setPasscode] = useState('1234');
  const [showPasscode, setShowPasscode] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(() => {
    return localStorage.getItem('saas_biometric_enabled') !== 'false';
  });

  useEffect(() => {
    const checkBiometric = () => {
      setIsBiometricEnabled(localStorage.getItem('saas_biometric_enabled') !== 'false');
    };
    window.addEventListener('storage', checkBiometric);
    const interval = setInterval(checkBiometric, 1000);
    return () => {
      window.removeEventListener('storage', checkBiometric);
      clearInterval(interval);
    };
  }, []);

  // Two-Factor Authentication (2FA) for Admins
  const [is2faStep, setIs2faStep] = useState(false);
  const [generated2faCode, setGenerated2faCode] = useState('');
  const [userEntered2fa, setUserEntered2fa] = useState('');
  const [isSending2fa, setIsSending2fa] = useState(false);
  const [tempSelectedUser, setTempSelectedUser] = useState<any>(null);
  const [tempRememberMe, setTempRememberMe] = useState(false);

  // Password Recovery States
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [resetMessage, setResetMessage] = useState('');

  // Commercial Co. Registration & Subscription States
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [regCompanyAr, setRegCompanyAr] = useState('');
  const [regCompanyEn, setRegCompanyEn] = useState('');
  const [regCR, setRegCR] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regFleetSize, setRegFleetSize] = useState('10-50');
  const [regSelectedPlan, setRegSelectedPlan] = useState<'basic' | 'pro' | 'enterprise'>('pro');
  const [regCycle, setRegCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [regAdminName, setRegAdminName] = useState('');
  const [regAdminPasscode, setRegAdminPasscode] = useState('');
  const [regError, setRegError] = useState('');
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [regSuccessData, setRegSuccessData] = useState<any>(null);
  const [isInvoiceFeaturesExpanded, setIsInvoiceFeaturesExpanded] = useState(false);

  // Sales & Subscription Support Modal State
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [salesInquiryCategory, setSalesInquiryCategory] = useState<'activation' | 'plan_upgrade' | 'fleet_expansion' | 'billing' | 'general'>('activation');
  const [salesInquirySubject, setSalesInquirySubject] = useState('');
  const [salesInquiryMessage, setSalesInquiryMessage] = useState('');
  const [salesInquiryPhone, setSalesInquiryPhone] = useState('');
  const [salesInquiryEmail, setSalesInquiryEmail] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySubmittedSuccess, setInquirySubmittedSuccess] = useState(false);

  const openSalesModalWithPreFill = (data: any) => {
    if (!data) return;
    setSalesInquiryEmail(data.email || '');
    setSalesInquiryPhone(data.phone || '');
    const defaultSubject = language === 'ar'
      ? `استفسار بخصوص اشتراك منشأة (${data.companyAr}) - باقة ${data.plan === 'basic' ? 'الأساسية' : data.plan === 'pro' ? 'المهنية Pro' : 'المؤسسات'}`
      : `Subscription Inquiry: ${data.companyEn || data.companyAr} - ${data.plan.toUpperCase()} Plan`;
    setSalesInquirySubject(defaultSubject);

    const defaultMsg = language === 'ar'
      ? `تحية طيبة لفريق المبيعات والدعم الفني،\n\nنود الاستفسار بخصوص تفاصيل تفعيل الاشتراك المجدول لمنشأة (${data.companyAr}) برقم اشتراك (#${data.subscriptionId}) وحجم أسطول (${data.fleetSize} شاحنة/مركبة) والمقرر تفعيله رسمياً في نوفمبر ٢٠٢٦.\n\nالرجاء تزويدنا بكافة التفاصيل المطلوبة وإمكانية الجدولة المسبقة.`
      : `Hello Sales & Support Team,\n\nWe would like to inquire about the scheduled subscription activation for (${data.companyEn || data.companyAr}) with Subscription ID (#${data.subscriptionId}), fleet capacity (${data.fleetSize} vehicles), scheduled for activation on November 1, 2026.\n\nPlease provide any additional onboarding and setup instructions.`;
    setSalesInquiryMessage(defaultMsg);
    setInquirySubmittedSuccess(false);
    setIsSalesModalOpen(true);
  };

  const { language, setLanguage, t, dir } = useLanguage();

  // --- MULTI-PROJECT SANDBOX CACHE & SW ISOLATION PURGE HOOK ---
  React.useEffect(() => {
    const CURRENT_SIGNATURE = "fleetaurvexis_mechanic_v2";
    const oldSignature = localStorage.getItem("applet_project_signature");
    if (oldSignature && oldSignature !== CURRENT_SIGNATURE) {
      console.log("[Applet Sandbox Detector] Stale cache or service worker from another applet detected! Purging to avoid cross-app conflicts...");
      
      // 1. Forcefully unregister all old service worker instances
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        }).catch((e) => console.warn(e));
      }
      
      // 2. Clear all local browser caches under this shared domain
      if ("caches" in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        }).catch((e) => console.warn(e));
      }
      
      localStorage.setItem("applet_project_signature", CURRENT_SIGNATURE);
      
      // 3. Clear session and reload page so the current fresh bundles take effect immediately
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } else {
      localStorage.setItem("applet_project_signature", CURRENT_SIGNATURE);
    }
  }, []);

  // --- DYNAMIC BRAND PRIMARY COLOR LOADER HOOK ---
  React.useEffect(() => {
    const applyBrandColor = () => {
      const savedColor = localStorage.getItem('saas_primary_color') || '#673de6';
      
      const shades = {
        50: adjustColorBrightness(savedColor, 95),
        100: adjustColorBrightness(savedColor, 85),
        200: adjustColorBrightness(savedColor, 70),
        300: adjustColorBrightness(savedColor, 50),
        400: adjustColorBrightness(savedColor, 25),
        500: savedColor,
        600: adjustColorBrightness(savedColor, -15),
        700: adjustColorBrightness(savedColor, -30),
        800: adjustColorBrightness(savedColor, -45),
        900: adjustColorBrightness(savedColor, -60),
      };
      
      Object.entries(shades).forEach(([shade, hex]) => {
        document.documentElement.style.setProperty(`--brand-${shade}`, hex);
      });
    };

    applyBrandColor();
    
    window.addEventListener('storage', applyBrandColor);
    // Custom event listener for instant single-window updates
    window.addEventListener('brand-color-changed', applyBrandColor);
    
    return () => {
      window.removeEventListener('storage', applyBrandColor);
      window.removeEventListener('brand-color-changed', applyBrandColor);
    };
  }, []);

  // --- OFFLINE SYNC STATE & PROCESSORS ---
  const [isOnlineState, setIsOnlineState] = useState(navigator.onLine);
  const [isOfflineDismissed, setIsOfflineDismissed] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    queueCount: number;
    isSyncing: boolean;
    progress: number;
    showSuccess: boolean;
    error: string | null;
  }>({
    queueCount: 0,
    isSyncing: false,
    progress: 0,
    showSuccess: false,
    error: null,
  });

  const updateQueueCount = () => {
    const queueRaw = localStorage.getItem('fleet_offline_maintenance_queue') || '[]';
    try {
      const queue = JSON.parse(queueRaw);
      setSyncStatus(prev => ({ 
        ...prev, 
        queueCount: Array.isArray(queue) ? queue.length : 0 
      }));
    } catch (e) {
      setSyncStatus(prev => ({ ...prev, queueCount: 0 }));
    }
  };

  const triggerOfflineSync = async () => {
    const queueRaw = localStorage.getItem('fleet_offline_maintenance_queue') || '[]';
    let queue: any[] = [];
    try {
      queue = JSON.parse(queueRaw);
    } catch (e) {
      console.error('Failed to parse offline sync queue:', e);
      return;
    }

    if (!Array.isArray(queue) || queue.length === 0) {
      return;
    }

    setSyncStatus(prev => ({
      ...prev,
      isSyncing: true,
      progress: 0,
      showSuccess: false,
      error: null
    }));

    try {
      const { saveDocument, db } = await import('./services/firebase');
      if (!db) {
        setSyncStatus(prev => ({
          ...prev,
          isSyncing: false,
          error: language === 'ar' ? 'خادم قاعدة البيانات غير مستجيب' : 'Database server unavailable'
        }));
        return;
      }

      let completed = 0;
      const total = queue.length;

      for (const item of queue) {
        // Safe document write proxy
        await saveDocument('maintenance_orders', item.id, item);
        completed++;
        setSyncStatus(prev => ({
          ...prev,
          progress: Math.round((completed / total) * 100)
        }));
        // Visual padding to let users appreciate sync status flow
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Success complete
      localStorage.removeItem('fleet_offline_maintenance_queue');
      
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_OFFLINE_QUEUE' });
      }

      setSyncStatus(prev => ({
        ...prev,
        queueCount: 0,
        isSyncing: false,
        progress: 100,
        showSuccess: true,
        error: null
      }));

      // Reload lists visually
      window.dispatchEvent(new Event('storage'));

      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, showSuccess: false }));
      }, 5000);

    } catch (err: any) {
      console.error('[Sync Engine] Error syncing queue item:', err);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: language === 'ar' 
          ? 'بث البيانات معطل أو قواعد حماية Firebase تمنع الرفع.'
          : 'Sync error or Firebase FireStore rules blocked the packet.'
      }));
    }
  };

  // Monitor network and initial queue actions
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnlineState(true);
      setIsOfflineDismissed(false);
      console.log('[Connection Status] Device returned ONLINE. Booting background sync flow...');
      triggerOfflineSync();
    };

    const handleOffline = () => {
      setIsOnlineState(false);
      setIsOfflineDismissed(false);
      console.log('[Connection Status] Device entered OFFLINE mode.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on mount
    updateQueueCount();
    if (navigator.onLine) {
      const queueRaw = localStorage.getItem('fleet_offline_maintenance_queue') || '[]';
      try {
        const queue = JSON.parse(queueRaw);
        if (Array.isArray(queue) && queue.length > 0) {
          triggerOfflineSync();
        }
      } catch (e) {}
    }

    const handleManualSyncTrigger = () => {
      console.log('[Manual Trigger] Triggering offline sync manual push...');
      triggerOfflineSync();
    };

    const handleOpenTutorial = (e: any) => {
      const vidId = e.detail?.videoId || 'vid-1';
      setActiveTutorialVideoId(vidId);
      setActiveTab('video-tutorials');
    };

    window.addEventListener('trigger-offline-sync', handleManualSyncTrigger);
    window.addEventListener('maintenance-offline-added', updateQueueCount);
    window.addEventListener('open-video-tutorial', handleOpenTutorial as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('trigger-offline-sync', handleManualSyncTrigger);
      window.removeEventListener('maintenance-offline-added', updateQueueCount);
      window.removeEventListener('open-video-tutorial', handleOpenTutorial as EventListener);
    };
  }, [language]);
  
  // Service Worker offline caching & sync dispatcher integration
  React.useEffect(() => {
    // 1. Safe Service Worker Activation
    if ('serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('[Service Worker] Activated and running at scope:', reg.scope);
            
            // Check if standard sync registration works
            if ('sync' in reg) {
              const queueRaw = localStorage.getItem('fleet_offline_maintenance_queue') || '[]';
              try {
                const q = JSON.parse(queueRaw);
                if (Array.isArray(q) && q.length > 0) {
                  (reg as any).sync.register('sync-maintenance').catch((e: any) => console.warn(e));
                }
              } catch (e) {}
            }
          })
          .catch((err) => {
            console.warn('[Service Worker] Fallback activated - registration did not complete:', err);
          });
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }

      // Sync listener from service worker
      const handleServiceWorkerMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'BACKGROUND_SYNC_TRIGGERED') {
          console.log('[Client SW Message] Background sync event received from SW!');
          triggerOfflineSync();
        }
      };

      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      return () => {
        window.removeEventListener('load', registerSW);
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
  }, []);

  // 2. Offline Action Logs Watcher 
  React.useEffect(() => {
    // Save current baseline schedules state when we are active online
    if (navigator.onLine) {
      const activeRaw = localStorage.getItem('fleet_periodic_schedules');
      if (activeRaw) {
        localStorage.setItem('last_synced_schedules', activeRaw);
      }
    }

    const handleSchedulesUpdated = () => {
      if (!navigator.onLine) {
        const currentRaw = localStorage.getItem('fleet_periodic_schedules') || '[]';
        const lastSyncedRaw = localStorage.getItem('last_synced_schedules') || '[]';
        
        try {
          const currentList = JSON.parse(currentRaw);
          const lastSyncedList = JSON.parse(lastSyncedRaw);
          
          // Deduce modified or newly added scheduling items
          const modifiedItems = currentList.filter((item: any) => {
            const matched = lastSyncedList.find((p: any) => p.id === item.id);
            return !matched || JSON.stringify(matched) !== JSON.stringify(item);
          });

          if (modifiedItems.length > 0) {
            const queueRaw = localStorage.getItem('fleet_offline_sync_queue') || '[]';
            const queue = JSON.parse(queueRaw);
            
            modifiedItems.forEach((item: any) => {
              const existingIdx = queue.findIndex((q: any) => q.id === item.id);
              if (existingIdx > -1) {
                queue[existingIdx] = { ...item, actionType: 'modify', syncedAt: Date.now() };
              } else {
                queue.push({ ...item, actionType: 'create', syncedAt: Date.now() });
              }
            });

            localStorage.setItem('fleet_offline_sync_queue', JSON.stringify(queue));
            
            // Dispatch dynamic alerts
            window.dispatchEvent(new CustomEvent('offline-action-logged', {
              detail: {
                message_ar: `وضعية العمل دون اتصال نشطة: تم حفظ ${modifiedItems.length} تعديل صيانة دورية محلياً وسيتم مزامنتها بمجرد عودة الاتصال.`,
                message_en: `Offline mode active: saved ${modifiedItems.length} maintenance scheduling updates locally. Ready to auto-sync.`
              }
            }));
          }
        } catch (e) {
          console.error('[Offline Logger] Failed to parse details:', e);
        }
      }
    };

    window.addEventListener('schedules-updated', handleSchedulesUpdated);
    return () => {
      window.removeEventListener('schedules-updated', handleSchedulesUpdated);
    };
  }, []);

  // 3. Scan QR Code URL Parameter Parser
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vehicleIdParam = params.get('vehicleId') || params.get('vehicle');
    const plateParam = params.get('plateNumber') || params.get('plate');
    if (vehicleIdParam || plateParam) {
      // Auto-transition to SaaS portal and perform auto-login if not logged in
      setPortalMode('saas');
      localStorage.setItem('saas_portal_mode', 'saas');
      setIsLoggedIn(true);
      localStorage.setItem('saas_is_logged_in', 'true');
      setCurrentUser(USERS.admin);
      saveCurrentUserToStorage(USERS.admin, true);

      setActiveTabState('vehicles');
      localStorage.setItem('saas_active_tab', 'vehicles');

      if (plateParam) {
        localStorage.setItem('scanned_plate_from_qr', plateParam);
        window.dispatchEvent(new CustomEvent('barcode-scanned', { detail: { plateNumber: plateParam } }));
      }
      if (vehicleIdParam) {
        localStorage.setItem('scanned_vehicle_id_from_qr', vehicleIdParam);
        window.dispatchEvent(new CustomEvent('vehicle-id-scanned', { detail: { vehicleId: vehicleIdParam } }));
      }
      // Clean query params so refresh operates normally
      const url = new URL(window.location.href);
      url.searchParams.delete('vehicleId');
      url.searchParams.delete('vehicle');
      url.searchParams.delete('plateNumber');
      url.searchParams.delete('plate');
      window.history.replaceState({}, '', url.toString());
      
      // Toast message indicating QR entry
      setTimeout(() => {
        const notifyDiv = document.createElement('div');
        notifyDiv.className = "fixed bottom-5 right-5 z-[100] bg-brand-blue-600 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-2 border border-brand-blue-500 text-xs font-black";
        notifyDiv.style.direction = "rtl";
        notifyDiv.innerHTML = `<span>⚡ تم مسح الرمز التعريفي للمركبة وجلب السجل الفني!</span>`;
        document.body.appendChild(notifyDiv);
        setTimeout(() => notifyDiv.remove(), 4500);
      }, 300);
    }
  }, []);

  // Call browser default language detector on first load
  useBrowserLanguageDetector(language, setLanguage);

  const isDarkMode = false;
  const setIsDarkMode = (_val?: any) => {};

  const sanitizeBrandName = (name: string | null | undefined): string => {
    if (!name || name === 'شعبة صيانة الآليات والمعدات التخصصية' || name.includes('شعبة صيانة') || name.includes('المعدات التخصصية') || name.toLowerCase().includes('axoventra')) {
      return 'FleetAurvexis';
    }
    return name;
  };

  const sanitizeBrandDesc = (desc: string | null | undefined): string => {
    if (!desc || desc.includes('شعبة صيانة') || desc.includes('المعدات التخصصية') || desc.includes('حساب الكلف') || desc.includes('للعجلات')) {
      return 'المنظومة السحابية الذكية المتكاملة لحوكمة صيانة المركبات والمعدات الثقيلة للمؤسسات والشركات الكبرى.';
    }
    return desc;
  };

  const [saasBrandName, setSaasBrandName] = useState(() => {
    const raw = localStorage.getItem('saas_brand_name');
    const cleaned = sanitizeBrandName(raw);
    if (cleaned !== raw) {
      localStorage.setItem('saas_brand_name', cleaned);
    }
    return cleaned;
  });
  const [saasBrandDesc, setSaasBrandDesc] = useState(() => {
    const raw = localStorage.getItem('saas_brand_desc');
    const cleaned = sanitizeBrandDesc(raw);
    if (cleaned !== raw) {
      localStorage.setItem('saas_brand_desc', cleaned);
    }
    return cleaned;
  });
  const [saasBrandLogo, setSaasBrandLogo] = useState(() => {
    return localStorage.getItem('saas_brand_logo') || '';
  });
  const [brandPrimaryColor, setBrandPrimaryColor] = useState(() => {
    return localStorage.getItem('saas_brand_primary_color') || '#6d28d9';
  });

  const getPendingDataVolumeMB = (): number => {
    let totalChars = 0;
    const keys = [
      'fleet_vehicles_v3',
      'fleet_vehicles_v2',
      'fleet_maintenance_orders_v2',
      'fleet_technicians_v2',
      'fleet_inventory_v2',
      'fleet_safety_inspections',
      'saas_brand_name',
      'saas_brand_desc',
      'saas_brand_logo',
      'saas_brand_color'
    ];
    for (const key of keys) {
      const val = localStorage.getItem(key);
      if (val) totalChars += val.length;
    }
    const realMB = totalChars / (1024 * 1024);
    const simMB = parseFloat(localStorage.getItem('saas_simulated_offline_weight') || '0');
    return Number((realMB + simMB).toFixed(3));
  };

  const [syncThresholdMB, setSyncThresholdMB] = useState(() => {
    return parseFloat(localStorage.getItem('saas_sync_threshold_mb') || '5');
  });

  const [currentOfflineWeightMB, setCurrentOfflineWeightMB] = useState(() => {
    return getPendingDataVolumeMB();
  });

  const [isMandatorySyncing, setIsMandatorySyncing] = useState(false);
  const [mandatorySyncProgress, setMandatorySyncProgress] = useState(0);
  const [mandatorySyncSuccess, setMandatorySyncSuccess] = useState(false);

  const handleMandatorySync = async () => {
    if (isMandatorySyncing) return;
    setIsMandatorySyncing(true);
    setMandatorySyncProgress(10);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setMandatorySyncProgress(35);
      
      try {
        const { pushLocalDataToCloud } = await import('./services/firebase');
        await pushLocalDataToCloud();
      } catch (e) {
        console.warn("Firestore sync backup skipped during mandatory sync fallback:", e);
      }
      
      await new Promise(resolve => setTimeout(resolve, 400));
      setMandatorySyncProgress(70);
      
      localStorage.setItem('last_firestore_sync_time', new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US'));
      localStorage.setItem('saas_simulated_offline_weight', '0'); // Reset simulation offset
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setMandatorySyncProgress(100);
      setMandatorySyncSuccess(true);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (err) {
      console.error(err);
    } finally {
      setIsMandatorySyncing(false);
      setMandatorySyncSuccess(false);
      window.dispatchEvent(new Event('storage'));
    }
  };

  React.useEffect(() => {
    const currentColor = localStorage.getItem('saas_brand_primary_color');
    if (!currentColor || currentColor === '#1e53e4') {
      localStorage.setItem('saas_brand_primary_color', '#6d28d9');
      setBrandPrimaryColor('#6d28d9');
    }
  }, []);

  React.useEffect(() => {
    const handleStorageChange = () => {
      setSaasBrandName(sanitizeBrandName(localStorage.getItem('saas_brand_name')));
      setSaasBrandDesc(sanitizeBrandDesc(localStorage.getItem('saas_brand_desc')));
      setSaasBrandLogo(localStorage.getItem('saas_brand_logo') || '');
      setBrandPrimaryColor(localStorage.getItem('saas_brand_primary_color') || '#6d28d9');
      setSyncThresholdMB(parseFloat(localStorage.getItem('saas_sync_threshold_mb') || '5'));
      setCurrentOfflineWeightMB(getPendingDataVolumeMB());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [language]);

  // Handle active modules verification & redirect
  React.useEffect(() => {
    const checkActiveTabEnabled = () => {
      const saved = localStorage.getItem('saas_enabled_modules');
      if (saved) {
        try {
          const enabledIds = JSON.parse(saved);
          if (activeTab !== 'dashboard' && activeTab !== 'saas-billing' && !enabledIds.includes(activeTab)) {
            setActiveTab('dashboard');
          }
        } catch (e) {}
      }
    };
    checkActiveTabEnabled();
    window.addEventListener('storage', checkActiveTabEnabled);
    return () => window.removeEventListener('storage', checkActiveTabEnabled);
  }, [activeTab]);

  React.useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  // Handle Read-Only Mode enforcement for Observers
  React.useEffect(() => {
    let observer: MutationObserver | null = null;

    const applyReadOnlyEnforcement = () => {
      const isReadOnly = localStorage.getItem('saas_read_only_mode') === 'true';
      if (isReadOnly) {
        document.body.setAttribute('data-read-only', 'true');
        
        // Query potential edit/add/delete triggers and hide them
        const selectors = [
          'button', 'a', 'span.cursor-pointer', 'div.cursor-pointer', 
          '[id*="add-"]', '[id*="edit-"]', '[id*="delete-"]'
        ];
        
        const elements = document.querySelectorAll(selectors.join(', '));
        elements.forEach((el: any) => {
          // Strictly protect navigation, sidebars, settings modals, and authentication elements
          if (
            el.closest('aside') || 
            el.closest('#system-settings-modularity-container') || 
            el.closest('[id*="settings-modal"]') || 
            el.closest('.fixed.inset-0.z-\\[80\\]') || 
            el.closest('.fixed.inset-0.z-50') || // settings modal container
            el.classList.contains('menu-tab') ||
            el.textContent?.trim() === 'لوحة التحكم' ||
            el.textContent?.trim() === 'إعدادات النظام'
          ) {
            return;
          }
          
          const text = el.textContent?.trim() || '';
          const title = el.getAttribute('title')?.trim() || '';
          
          const isAddText = text === 'إضافة' || text === 'اضافة' || text.startsWith('إضافة ') || text.startsWith('اضافة ') || text === 'جديد' || text === 'Add' || text === 'New' || text === 'Create';
          const isEditText = text === 'تعديل' || text === 'تحرير' || text.startsWith('تعديل ') || text === 'Edit' || text === 'Update';
          const isDeleteText = text === 'حذف' || text === 'مسح' || text.startsWith('حذف ') || text === 'Delete' || text === 'Remove';
          
          const isAddTitle = title.includes('إضافة') || title.includes('اضافة') || title.toLowerCase().includes('add') || title.toLowerCase().includes('new') || title.toLowerCase().includes('create');
          const isEditTitle = title.includes('تعديل') || title.includes('تحرير') || title.toLowerCase().includes('edit') || title.toLowerCase().includes('update');
          const isDeleteTitle = title.includes('حذف') || title.toLowerCase().includes('delete') || title.toLowerCase().includes('remove');
          
          if (isAddText || isEditText || isDeleteText || isAddTitle || isEditTitle || isDeleteTitle) {
            el.style.setProperty('display', 'none', 'important');
          }
        });
      } else {
        document.body.removeAttribute('data-read-only');
      }
    };

    applyReadOnlyEnforcement();
    window.addEventListener('storage', applyReadOnlyEnforcement);

    // Dynamic enforcement on any DOM adjustments/renders
    observer = new MutationObserver(() => {
      applyReadOnlyEnforcement();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('storage', applyReadOnlyEnforcement);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Handle role-based access control for tabs
  React.useEffect(() => {
    if (!isLoggedIn || !currentUser) return;
    const userRole = currentUser.role || 'admin';
    const currentMenuItem = MENU_ITEMS.find(item => item.id === activeTab);
    if (currentMenuItem && !currentMenuItem.roles.includes(userRole)) {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab, isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim() || !email.includes('@')) {
      setLoginError(t('login.emailRequiredError'));
      return;
    }

    // Check custom registered corporate credentials from local storage
    const existingCompaniesStr = localStorage.getItem('saas_registered_companies') || '[]';
    let matchedCompanyAdmin: any = null;
    try {
      const companies = JSON.parse(existingCompaniesStr);
      matchedCompanyAdmin = companies.find((co: any) => co.email.trim().toLowerCase() === email.trim().toLowerCase() && co.adminPasscode === passcode);
    } catch (err) {}

    if (passcode !== '1234' && passcode.trim() !== '' && !matchedCompanyAdmin) {
      setLoginError(t('login.passcodeError'));
      return;
    }
    
    setIsLoading(true);
    setLoginError('');
    
    setTimeout(() => {
      const selectedUser = matchedCompanyAdmin ? {
        id: 'co-admin-' + matchedCompanyAdmin.cr,
        name: matchedCompanyAdmin.adminName || 'المدير العام',
        title: `${matchedCompanyAdmin.companyAr || matchedCompanyAdmin.companyEn} - مدير المنشأة المعتمد`,
        role: 'admin' as UserRole,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200',
        companyDetails: matchedCompanyAdmin,
      } : USERS[loginRole];

      // Trigger 2FA step only for Administrator logins
      if (selectedUser.role === 'admin') {
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
        setGenerated2faCode(randomCode);
        setTempSelectedUser(selectedUser);
        setTempRememberMe(rememberMe);
        setIs2faStep(true);
        setIsLoading(false);
        setUserEntered2fa('');
        return;
      }

      setCurrentUser(selectedUser);
      setIsLoggedIn(true);
      setIsLoading(false);
      
      localStorage.setItem('saas_remember_me', rememberMe ? 'true' : 'false');
      if (rememberMe) {
        localStorage.setItem('saas_is_logged_in', 'true');
        sessionStorage.removeItem('saas_is_logged_in');
      } else {
        sessionStorage.setItem('saas_is_logged_in', 'true');
        localStorage.removeItem('saas_is_logged_in');
      }
      saveCurrentUserToStorage(selectedUser, rememberMe);
    }, 900);
  };

  const handleConfirm2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEntered2fa || userEntered2fa.trim() === '') {
      setLoginError(language === 'ar' ? '⚠️ يرجى إدخال رمز التحقق.' : '⚠️ Please enter the verification code.');
      return;
    }

    if (userEntered2fa.trim() !== generated2faCode) {
      setLoginError(language === 'ar' ? '⚠️ رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى.' : '⚠️ Incorrect verification code, please try again.');
      return;
    }

    setIsLoading(true);
    setLoginError('');

    setTimeout(() => {
      const selectedUser = tempSelectedUser || USERS.admin;
      setCurrentUser(selectedUser);
      setIsLoggedIn(true);
      setIsLoading(false);
      setIs2faStep(false);

      localStorage.setItem('saas_remember_me', tempRememberMe ? 'true' : 'false');
      if (tempRememberMe) {
        localStorage.setItem('saas_is_logged_in', 'true');
        sessionStorage.removeItem('saas_is_logged_in');
      } else {
        sessionStorage.setItem('saas_is_logged_in', 'true');
        localStorage.removeItem('saas_is_logged_in');
      }
      saveCurrentUserToStorage(selectedUser, tempRememberMe);
    }, 800);
  };

  const handleResend2FA = () => {
    setIsSending2fa(true);
    setLoginError('');
    setTimeout(() => {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGenerated2faCode(newCode);
      setIsSending2fa(false);
    }, 1000);
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.trim() || !resetEmail.includes('@')) {
      setResetMessage(t('login.resetError'));
      setResetStatus('error');
      return;
    }

    setResetStatus('sending');
    setResetMessage('');

    setTimeout(async () => {
      try {
        // Attempt actual Firebase auth if available, fallback gracefully
        const { auth } = await import('./services/firebase');
        if (auth) {
          const { sendPasswordResetEmail } = await import('firebase/auth');
          await sendPasswordResetEmail(auth, resetEmail);
        }
      } catch (err) {
        console.warn("Firebase Auth sent reset link (expected if mock project setup):", err);
      }

      setResetStatus('success');
      const successStr = t('login.resetSuccess') || '✓ Verification link successfully sent!';
      setResetMessage(successStr.replace('{email}', resetEmail));
    }, 1200);
  };

  const handleCommercialRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regStep === 1) {
      if (!regCompanyAr.trim() || !regCompanyEn.trim()) {
        setRegError(language === 'ar' ? '⚠️ يرجى إدخال اسم المنشأة باللغتين العربية والانجليزية.' : '⚠️ Please enter the company name in both Arabic and English.');
        return;
      }
      if (!regCR.trim() || regCR.length < 4) {
        setRegError(language === 'ar' ? '⚠️ يرجى إدخال رقم سجل تجاري صحيح ومكون من 4 خانات على الأقل.' : '⚠️ Please enter a valid Commercial Registration (CR) number.');
        return;
      }
      if (!regEmail.trim() || !regEmail.includes('@')) {
        setRegError(language === 'ar' ? '⚠️ البريد الإلكتروني غير صالح.' : '⚠️ Invalid corporate email address.');
        return;
      }
      if (!regPhone.trim()) {
        setRegError(language === 'ar' ? '⚠️ رقم الهاتف مطلوب.' : '⚠️ Mobile number is required.');
        return;
      }
      setRegStep(2);
      return;
    }

    if (regStep === 2) {
      setRegStep(3);
      return;
    }

    if (regStep === 3) {
      if (!regAdminName.trim()) {
        setRegError(language === 'ar' ? '⚠️ يرجى كتابة اسم المشرف.' : '⚠️ Please enter the administrator name.');
        return;
      }
      if (!regAdminPasscode.trim() || regAdminPasscode.length < 4) {
        setRegError(language === 'ar' ? '⚠️ يرجى إدخال رمز مرور مكون من 4 أرقام أو أحرف على الأقل للأمان.' : '⚠️ Please enter at least a 4-digit/character passcode.');
        return;
      }

      setIsSubmittingReg(true);

      const subscriptionId = 'SUB-NOV-' + Math.floor(100000 + Math.random() * 900000);
      const companyId = 'co-' + regCR.trim();
      
      const payload = {
        id: companyId,
        companyAr: regCompanyAr,
        companyEn: regCompanyEn,
        cr: regCR,
        email: regEmail,
        phone: regPhone,
        city: regCity || 'الرياض (HQ)',
        fleetSize: regFleetSize,
        plan: regSelectedPlan,
        cycle: regCycle,
        adminName: regAdminName,
        adminPasscode: regAdminPasscode,
        subscriptionId,
        registeredAt: new Date().toISOString(),
        subscriptionStatus: 'active',
        activeStarts: 'November 2026',
        isCommercialSaaS: true,
      };

      try {
        // Save to Firebase Core Cloud Database
        const { saveDocument } = await import('./services/firebase');
        await saveDocument('registered_companies', companyId, payload);
        
        // Also save to company_subscriptions for indexing
        await saveDocument('company_subscriptions', subscriptionId, {
          companyId,
          plan: regSelectedPlan,
          cycle: regCycle,
          activeStarts: 'November 2026',
          status: 'pending-november-activation',
          priceCalculated: regSelectedPlan === 'basic' ? 39 : regSelectedPlan === 'pro' ? 119 : 399,
          currency: 'USD',
        });
      } catch (err) {
        console.warn('Firebase error during commercial registration, using cloud fallback storage:', err);
      }

      // Save locally to allow instant customized session
      const existingCoStr = localStorage.getItem('saas_registered_companies') || '[]';
      try {
        const localCos = JSON.parse(existingCoStr);
        localCos.push(payload);
        localStorage.setItem('saas_registered_companies', JSON.stringify(localCos));
      } catch (e) {}

      // Add delay for high-tech provisioning experience
      setTimeout(() => {
        setIsSubmittingReg(false);
        setRegSuccessData(payload);
      }, 2500);
    }
  };

  const handleBiometricLogin = () => {
    if (isLoading || biometricStatus !== 'idle') return;
    
    setBiometricStatus('scanning');
    setLoginError('');
    
    setTimeout(() => {
      setBiometricStatus('success');
      setTimeout(() => {
        const selectedUser = USERS[loginRole];
        setCurrentUser(selectedUser);
        setIsLoggedIn(true);
        
        localStorage.setItem('saas_remember_me', rememberMe ? 'true' : 'false');
        if (rememberMe) {
          localStorage.setItem('saas_is_logged_in', 'true');
          sessionStorage.removeItem('saas_is_logged_in');
        } else {
          sessionStorage.setItem('saas_is_logged_in', 'true');
          localStorage.removeItem('saas_is_logged_in');
        }
        saveCurrentUserToStorage(selectedUser, rememberMe);
        setBiometricStatus('idle');
      }, 900);
    }, 2000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('saas_is_logged_in');
    localStorage.removeItem('saas_current_user');
    sessionStorage.removeItem('saas_is_logged_in');
    sessionStorage.removeItem('saas_current_user');
    setActiveTab('dashboard');
    setPortalMode('marketing');
    localStorage.setItem('saas_portal_mode', 'marketing');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            user={currentUser} 
            onNavigateToMaintenance={() => {
              setActiveTab('maintenance');
              setOpenAddMaintenanceOnLoad(true);
            }}
            onNavigateToVehicles={() => {
              setActiveTab('vehicles');
              setOpenAddVehicleOnLoad(true);
            }}
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
            }}
            onUserUpdate={(updatedUser) => {
              setCurrentUser(updatedUser);
              saveCurrentUserToStorage(updatedUser);
            }}
          />
        );
      case 'vehicles':
        return (
          <Vehicles 
            user={currentUser} 
            openAddOnLoad={openAddVehicleOnLoad}
            onAddOpenHandled={() => setOpenAddVehicleOnLoad(false)}
          />
        );
      case 'drivers':
        return <Drivers user={currentUser} />;
      case 'projects':
        return <Projects user={currentUser} />;
      case 'driver-handover':
        return <DriverHandover user={currentUser} />;
      case 'maintenance-bot':
        return <AiHub />;
      case 'maintenance':
        return (
          <Maintenance 
            user={currentUser} 
            openAddOnLoad={openAddMaintenanceOnLoad}
            onAddOpenHandled={() => setOpenAddMaintenanceOnLoad(false)}
          />
        );
      case 'external-maintenance':
        return <ExternalMaintenance user={currentUser} />;
      case 'periodic-maintenance':
        return <PeriodicMaintenance user={currentUser} />;
      case 'workshops':
        return <Workshops user={currentUser} />;
      case 'technicians':
        return <Technicians user={currentUser} />;
      case 'inventory':
        return <Inventory user={currentUser} />;
      case 'vendors':
        return <Vendors user={currentUser} />;
      case 'reports':
        return <Reports user={currentUser} isDarkMode={isDarkMode} />;
      case 'saas-billing':
        return <SaasBilling user={currentUser} />;
      case 'security-audit':
        return <SecurityAudit user={currentUser} />;
      case 'firebase-sync':
        return <FirebaseSync user={currentUser} />;
      case 'marketing-portal':
        return (
          <>
            <style>{`
              :root, .dark, body, html {
                --color-brand-blue-50: ${adjustColorBrightness(brandPrimaryColor, 92)} !important;
                --color-brand-blue-100: ${adjustColorBrightness(brandPrimaryColor, 80)} !important;
                --color-brand-blue-250: ${adjustColorBrightness(brandPrimaryColor, 60)} !important;
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
            <MarketingLandingPage 
              onNavigateToSaaS={() => setActiveTab('dashboard')}
              brandPrimaryColor={brandPrimaryColor}
              brandName={saasBrandName}
              brandDesc={saasBrandDesc}
              isInsideApp={true}
              onNavigateToTab={setActiveTab}
              portalMode={portalMode}
            />
          </>
        );
      case 'marketing-admin':
        return (
          <MarketingAdmin
            brandPrimaryColor={brandPrimaryColor}
            setBrandPrimaryColor={setBrandPrimaryColor}
            saasBrandName={saasBrandName}
            setSaasBrandName={setSaasBrandName}
            saasBrandDesc={saasBrandDesc}
            setSaasBrandDesc={setSaasBrandDesc}
            onNavigateToTab={setActiveTab}
          />
        );
      case 'video-tutorials':
        return (
          <VideoTutorialsModal 
            isOpen={true} 
            onClose={() => setActiveTab('dashboard')} 
            isDarkMode={isDarkMode} 
            isTabMode={true}
            initialVideoId={activeTutorialVideoId}
          />
        );
      default:
        return (
          <Dashboard 
            user={currentUser} 
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
            }}
          />
        );
    }
  };

  // --- MULTI-PORTAL ROUTER GATES ---
  if (portalMode === 'marketing') {
    return (
      <>
        <style>{`
          :root, .dark, body, html {
            --color-brand-blue-50: ${adjustColorBrightness(brandPrimaryColor, 92)} !important;
            --color-brand-blue-100: ${adjustColorBrightness(brandPrimaryColor, 80)} !important;
            --color-brand-blue-250: ${adjustColorBrightness(brandPrimaryColor, 60)} !important;
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
        <MarketingLandingPage 
          onNavigateToSaaS={(autoLogin = true) => {
            setPortalMode('saas');
            localStorage.setItem('saas_portal_mode', 'saas');
            if (autoLogin) {
              setIsLoggedIn(true);
              localStorage.setItem('saas_is_logged_in', 'true');
              setCurrentUser(USERS.admin);
              saveCurrentUserToStorage(USERS.admin, true);
            }
          }}
          brandPrimaryColor={brandPrimaryColor}
          brandName={saasBrandName}
          brandDesc={saasBrandDesc}
          portalMode={portalMode}
        />
      </>
    );
  }

  // --- SAAS SYSTEM ENTRY ---
  if (!isLoggedIn) {
    return (
      <div 
        dir={dir} 
        className="min-h-screen flex items-center justify-center bg-[#f4f6fa] dark:bg-[#080b11] text-slate-950 dark:text-slate-100 p-4 transition-colors duration-500 overflow-y-auto select-none"
      >
        <style>{`
          :root, .dark, body, html {
            --color-brand-blue-50: ${adjustColorBrightness(brandPrimaryColor, 92)} !important;
            --color-brand-blue-100: ${adjustColorBrightness(brandPrimaryColor, 80)} !important;
            --color-brand-blue-250: ${adjustColorBrightness(brandPrimaryColor, 60)} !important;
            --color-brand-blue-200: ${adjustColorBrightness(brandPrimaryColor, 60)} !important;
            --color-brand-blue-300: ${adjustColorBrightness(brandPrimaryColor, 40)} !important;
            --color-brand-blue-400: ${adjustColorBrightness(brandPrimaryColor, 20)} !important;
            --color-brand-blue-500: ${brandPrimaryColor} !important;
            --color-brand-blue-600: ${adjustColorBrightness(brandPrimaryColor, -15)} !important;
            --color-brand-blue-700: ${adjustColorBrightness(brandPrimaryColor, -30)} !important;
            --color-brand-blue-800: ${adjustColorBrightness(brandPrimaryColor, -45)} !important;
            --color-brand-blue-900: ${adjustColorBrightness(brandPrimaryColor, -60)} !important;
          }
          @keyframes scanBeam {
            0% { top: 10%; opacity: 0.2; }
            50% { top: 90%; opacity: 1; }
            100% { top: 10%; opacity: 0.2; }
          }
          .animate-scan {
            animation: scanBeam 1.8s ease-in-out infinite;
          }
        `}</style>
        
        {/* ENHANCED TOP CONSOLE SWITCHER BAR */}
        <div className="absolute top-4 right-4 left-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-sans">
            <button
              type="button"
              onClick={() => {
                setPortalMode('marketing');
                localStorage.setItem('saas_portal_mode', 'marketing');
              }}
              className="px-3.5 py-1.5 bg-white/90 shadow-3xs border border-slate-200 text-slate-700 text-[11px] font-black rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              🌐 {t('login.backToPublic')}
            </button>
          </div>

          <button 
            type="button"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-[#0f1422]/90 border border-slate-200 dark:border-slate-800 text-xs font-black rounded-full text-slate-700 dark:text-slate-300 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-3xs"
          >
            <Languages size={14} className="text-brand-blue-500" />
            <span>{t('login.switchLanguage')}</span>
          </button>
        </div>

        <div className="w-full max-w-md bg-white dark:bg-[#0f1422] rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 p-8 shadow-2xl relative space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md overflow-hidden p-1.5">
              {saasBrandLogo ? (
                <img src={saasBrandLogo} alt="Logo" className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
              ) : (
                <Wrench size={26} className="text-white animate-pulse" />
              )}
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {saasBrandName ? saasBrandName : t('login.systemSuite')}
            </h2>
            <p className="text-xs text-slate-505 dark:text-slate-400">
              {saasBrandDesc ? saasBrandDesc : t('login.systemDesc')}
            </p>
            
            {/* Dynamic Time-Based Greeting Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue-500/10 text-brand-blue-600 dark:text-brand-blue-400 rounded-full text-[10.5px] font-black mx-auto mt-1 border border-brand-blue-500/10 shadow-3xs">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue-500 animate-pulse shrink-0" />
              <span className="leading-normal">{getDynamicGreeting(t, language, saasBrandName)}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isRegisterMode ? (
              <motion.div
                key="saas-registration-pane"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 text-right"
              >
                {regSuccessData ? (
                  /* MAJESTIC SUBSCRIPTION PROVISIONED SUCCESS CARD */
                  <div className="space-y-4 text-right">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto animate-bounce mt-2">
                      <Sparkles size={32} />
                    </div>
                    
                    <div className="text-center space-y-1">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {language === 'ar' ? '🎉 تم تفعيل اشتراك المنشأة بنجاح!' : '🎉 Subscription Active!'}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-normal">
                        {language === 'ar' 
                          ? 'لقد تم ربط المنشأة آمنًا بقاعدة بروتوكول البيانات السحابية وجدول حزم التفعيل لشهر نوفمبر المقبل.'
                          : 'Your company details are securely synchronized. Billing starts automatically next November.'}
                      </p>
                    </div>

                    <div id="company-subscription-invoice" className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-3 relative overflow-hidden font-sans">
                      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-brand-blue-500 to-indigo-500" />
                      
                      <div className="flex justify-between items-center text-[10px] pb-1.5 border-b border-dashed border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-slate-400">#{regSuccessData.subscriptionId}</span>
                        <span className="font-black text-emerald-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {language === 'ar' ? 'نشط (تبدأ الجدولة في نوفمبر ٢٠٢٦)' : 'Active (Starts Nov 2026)'}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10.5px] text-slate-450 dark:text-slate-500 font-semibold">{language === 'ar' ? 'المنشأة التجارية:' : 'Commercial Company:'}</span>
                          <span className="text-[11.5px] font-black text-slate-850 dark:text-white">{regSuccessData.companyAr}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10.5px] text-slate-450 dark:text-slate-500 font-semibold">{language === 'ar' ? 'رقم السجل التجاري:' : 'CR Number:'}</span>
                          <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">{regSuccessData.cr}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10.5px] text-slate-450 dark:text-slate-500 font-semibold">{language === 'ar' ? 'الباقة المعتمدة:' : 'Selected Plan:'}</span>
                          <span className="text-[11.5px] font-extrabold text-brand-blue-500 dark:text-brand-blue-400 uppercase">
                            {regSuccessData.plan === 'basic' ? (language === 'ar' ? 'الأساسية' : 'Basic') : regSuccessData.plan === 'pro' ? (language === 'ar' ? 'المهنية Pro' : 'Professional Pro') : (language === 'ar' ? 'المؤسسات' : 'Enterprise')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10.5px] text-slate-450 dark:text-slate-500 font-semibold">{language === 'ar' ? 'حجم أسطول النقل:' : 'Fleet Size:'}</span>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{regSuccessData.fleetSize} {language === 'ar' ? 'شاحنة/مركبة' : 'Vehicles'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10.5px] text-slate-450 dark:text-slate-500 font-semibold">{language === 'ar' ? 'دورة الاشتراك الكلية:' : 'Billing Cycle:'}</span>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {regSuccessData.cycle === 'monthly' ? (language === 'ar' ? 'شهرياً' : 'Monthly') : (language === 'ar' ? 'سنوياً (-20% خصم)' : 'Yearly (20% Off)')}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-end">
                        <div className="text-left">
                          <span className="block text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">{language === 'ar' ? 'قيمة الاشتراك المجدول' : 'Scheduled Core Fee'}</span>
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            ${regSuccessData.plan === 'basic' ? (regSuccessData.cycle === 'yearly' ? '31.20' : '39') : regSuccessData.plan === 'pro' ? (regSuccessData.cycle === 'yearly' ? '95.20' : '119') : (regSuccessData.cycle === 'yearly' ? '319.20' : '399')}
                            <span className="text-[10px] text-slate-450 font-semibold">/{regSuccessData.cycle === 'yearly' ? (language === 'ar' ? 'عام' : 'yr') : (language === 'ar' ? 'شهر' : 'mo')}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[9px] text-slate-400 font-bold">{language === 'ar' ? 'تاريخ التفعيل التلقائي' : 'Auto Activation'}</span>
                          <span className="text-[10.5px] font-black text-indigo-600 dark:text-indigo-400">1 {language === 'ar' ? 'نوفمبر ٢٠٢٦' : 'November 2026'}</span>
                        </div>
                      </div>

                      {/* Dynamic Visual Progress Bar for November 2026 Activation Date */}
                      {(() => {
                        const targetDate = new Date(2026, 10, 1);
                        const now = new Date();
                        const diffTime = targetDate.getTime() - now.getTime();
                        const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                        const totalCountdownDays = 90; // Standard 90-day transition timeline
                        const elapsedDays = Math.max(0, totalCountdownDays - daysRemaining);
                        const progressPercent = Math.min(100, Math.max(8, Math.round((elapsedDays / totalCountdownDays) * 100)));

                        return (
                          <div className="pt-2.5 mt-2 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                <Timer size={13} className="text-indigo-500 shrink-0 animate-pulse" />
                                <span>{language === 'ar' ? 'المدة المتبقية حتى بدء موعد التفعيل:' : 'Countdown to Activation Date:'}</span>
                              </span>
                              <span className="font-black font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-1 shadow-2xs">
                                <span>{daysRemaining}</span>
                                <span className="text-[9px] font-sans font-bold">{language === 'ar' ? 'يوم' : 'days left'}</span>
                              </span>
                            </div>

                            {/* Visual Dynamic Progress Bar */}
                            <div className="space-y-1">
                              <div className="w-full h-2.5 bg-slate-200/90 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-300/40 dark:border-slate-700/60 shadow-inner">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 relative transition-all duration-700 shadow-xs"
                                  style={{ width: `${progressPercent}%` }}
                                >
                                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center text-[8.5px] font-bold text-slate-400 dark:text-slate-500 px-0.5">
                                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  {language === 'ar' ? 'الاشتراك جاهز ومثبت' : 'Provisioned & Ready'}
                                </span>
                                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                  {progressPercent}% {language === 'ar' ? 'اكتمال الجدولة' : 'scheduled'}
                                </span>
                                <span className="flex items-center gap-0.5 font-mono text-slate-600 dark:text-slate-300">
                                  <Calendar size={10} className="text-indigo-500" />
                                  <span>01/11/2026</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Expandable Features List & Tier Comparison */}
                      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                        <button
                          id="btn-toggle-plan-features"
                          type="button"
                          onClick={() => setIsInvoiceFeaturesExpanded(!isInvoiceFeaturesExpanded)}
                          className="w-full py-2 px-3 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-150 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-black transition-all flex items-center justify-between cursor-pointer shadow-3xs group"
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                              <Zap size={13} />
                            </div>
                            <span className="font-bold">
                              {language === 'ar' ? 'مميزات الباقة ومقارنة الترقية (Tier Comparison)' : 'Plan Features & Next Tier Comparison'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                            <span>{isInvoiceFeaturesExpanded ? (language === 'ar' ? 'إخفاء' : 'Collapse') : (language === 'ar' ? 'عرض التفاصيل' : 'Expand')}</span>
                            {isInvoiceFeaturesExpanded ? <ChevronUp size={14} className="text-indigo-500" /> : <ChevronDown size={14} className="text-indigo-500" />}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isInvoiceFeaturesExpanded && (() => {
                            const currentPlanKey = regSuccessData.plan || 'basic';
                            const nextTierKey = currentPlanKey === 'basic' ? 'pro' : currentPlanKey === 'pro' ? 'enterprise' : 'custom_enterprise';
                            
                            const planNames: Record<string, { ar: string; en: string; badgeColor: string }> = {
                              basic: { ar: 'الأساسية', en: 'Basic', badgeColor: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200' },
                              pro: { ar: 'المهنية Pro', en: 'Professional Pro', badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300' },
                              enterprise: { ar: 'المؤسسات Enterprise', en: 'Enterprise', badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300' },
                              custom_enterprise: { ar: 'المؤسسات المخصصة +VIP', en: 'Custom Dedicated', badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300' },
                            };

                            const featureMatrix = [
                              {
                                icon: Truck,
                                iconColor: 'text-blue-600 dark:text-blue-400',
                                iconBg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/60',
                                labelAr: 'سعة الأسطول والحد الأقصى للمركبات',
                                labelEn: 'Fleet Limit & Vehicle Capacity',
                                currentVal: currentPlanKey === 'basic' ? `${regSuccessData.fleetSize || 20} مركبة` : currentPlanKey === 'pro' ? `${regSuccessData.fleetSize || 100} مركبة` : 'أسطول غير محدود',
                                nextVal: currentPlanKey === 'basic' ? 'حتى 100 مركبة (+80)' : currentPlanKey === 'pro' ? 'أسطول غير محدود Unlimited' : 'خوادم مخصصة ومركبات غير محدودة',
                                isHighlight: true,
                              },
                              {
                                icon: Wrench,
                                iconColor: 'text-amber-600 dark:text-amber-400',
                                iconBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60',
                                labelAr: 'جدولة الصيانة الوقائية والتنبيهات',
                                labelEn: 'Preventative Maintenance & PM Alerts',
                                currentVal: 'مجدولة دورية قياسية',
                                nextVal: currentPlanKey === 'basic' ? 'خوارزميات تنبؤية ذكية AI' : 'أنظمة تنبؤية متقدمة مع حساسات IoT',
                                isHighlight: false,
                              },
                              {
                                icon: QrCode,
                                iconColor: 'text-emerald-600 dark:text-emerald-400',
                                iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
                                labelAr: 'فحوصات السائقين اليومية ورموز QR',
                                labelEn: 'Driver Daily Inspections & QR Codes',
                                currentVal: 'فحص رقمي مع QR كود',
                                nextVal: 'فحص متقدم مع صور وتوقيع إلكتروني وتوثيق سحابي',
                                isHighlight: false,
                              },
                              {
                                icon: Package,
                                iconColor: 'text-purple-600 dark:text-purple-400',
                                iconBg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/60',
                                labelAr: 'إدارة المستودع وقطع الغيار والتكاليف',
                                labelEn: 'Spare Parts & Inventory Analytics',
                                currentVal: currentPlanKey === 'basic' ? 'جرد أساسي للقطع' : 'تتبع تلقائي للقطع مع باركود ونقاط إعادة الطلب',
                                nextVal: currentPlanKey === 'basic' ? 'أتمتة أوامر الشراء ونقاط إعادة الطلب' : 'تكامل مالي ERP ومستودعات متعددة الفروع',
                                isHighlight: currentPlanKey === 'basic',
                              },
                              {
                                icon: TrendingUp,
                                iconColor: 'text-rose-600 dark:text-rose-400',
                                iconBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60',
                                labelAr: 'تحليلات تكلفة التشغيل لكل كم/ساعة',
                                labelEn: 'Cost Per KM/Hour Fleet Analytics',
                                currentVal: currentPlanKey === 'basic' ? 'تقارير مبسطة' : 'لوحات بيانات تفاعلية وتفصيل التكلفة',
                                nextVal: currentPlanKey === 'basic' ? 'تحليل عميق وتصدير PDF/Excel' : 'تقارير مالية وتنبؤات الميزانية بالذكاء الاصطناعي',
                                isHighlight: false,
                              },
                              {
                                icon: Headphones,
                                iconColor: 'text-sky-600 dark:text-sky-400',
                                iconBg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800/60',
                                labelAr: 'مستوى الدعم الفني وتعيين مدير حساب',
                                labelEn: 'Support SLA & Dedicated Account Mgr',
                                currentVal: currentPlanKey === 'basic' ? 'دعم عبر البريد (خلال 24 س)' : 'دعم ذو أولوية عبر الشات والهاتف',
                                nextVal: currentPlanKey === 'basic' ? 'دعم ذو أولوية مع هاتف مباشر' : 'مدير حساب مخصص 24/7 مع SLA 99.99%',
                                isHighlight: true,
                              },
                            ];

                            const currentInfo = planNames[currentPlanKey] || planNames.basic;
                            const nextInfo = planNames[nextTierKey] || planNames.enterprise;

                            return (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="mt-2.5 overflow-hidden"
                              >
                                <div className="p-3 bg-white dark:bg-slate-950/70 rounded-2xl border border-slate-200/90 dark:border-slate-805 space-y-2.5 shadow-2xs">
                                  {/* Table Header */}
                                  <div className="grid grid-cols-12 gap-2 text-[9.5px] font-black pb-2 border-b border-slate-100 dark:border-slate-800/80 items-center">
                                    <div className="col-span-5 text-slate-500 dark:text-slate-400">
                                      {language === 'ar' ? 'الميزة / الخاصية التشغيلية' : 'Feature / Capability'}
                                    </div>
                                    <div className="col-span-3 text-center">
                                      <span className={`inline-block px-2 py-0.5 rounded-md font-extrabold ${currentInfo.badgeColor}`}>
                                        {language === 'ar' ? currentInfo.ar : currentInfo.en}
                                      </span>
                                    </div>
                                    <div className="col-span-4 text-center">
                                      <span className={`inline-block px-2 py-0.5 rounded-md font-extrabold ${nextInfo.badgeColor} flex items-center justify-center gap-1 mx-auto`}>
                                        <ArrowUpRight size={10} />
                                        <span>{language === 'ar' ? nextInfo.ar : nextInfo.en}</span>
                                      </span>
                                    </div>
                                  </div>

                                  {/* Feature Rows */}
                                  <div className="space-y-1.5 divide-y divide-slate-100/70 dark:divide-slate-800/50">
                                    {featureMatrix.map((item, idx) => {
                                      const IconComp = item.icon;
                                      return (
                                        <div
                                          key={idx}
                                          className={`grid grid-cols-12 gap-2 text-[9px] pt-1.5 items-center leading-tight transition-colors ${
                                            item.isHighlight ? 'bg-indigo-50/50 dark:bg-indigo-950/30 p-1.5 rounded-xl border border-indigo-100/60 dark:border-indigo-900/40' : ''
                                          }`}
                                        >
                                          <div className="col-span-5 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 min-w-0">
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${item.iconBg} ${item.iconColor} shadow-3xs`}>
                                              <IconComp size={11} className="shrink-0" />
                                            </div>
                                            <span className="truncate">{language === 'ar' ? item.labelAr : item.labelEn}</span>
                                          </div>
                                          <div className="col-span-3 text-center font-semibold text-slate-600 dark:text-slate-400">
                                            {item.currentVal}
                                          </div>
                                          <div className="col-span-4 text-center font-extrabold text-indigo-600 dark:text-indigo-400">
                                            {item.nextVal}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Upgrade Opportunity Footer Box */}
                                  <div className="p-2 bg-gradient-to-r from-purple-50 dark:from-purple-950/30 to-indigo-50 dark:to-indigo-950/30 rounded-xl border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-between gap-2 text-[9.5px]">
                                    <span className="text-purple-800 dark:text-purple-300 font-bold">
                                      {language === 'ar'
                                        ? 'هل ترغب في ترقية اشتراكك قبل تفعيل موعد نوفمبر ٢٠٢٦؟'
                                        : 'Would you like to upgrade before your Nov 2026 activation?'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSalesInquiryCategory('plan_upgrade');
                                        openSalesModalWithPreFill(regSuccessData);
                                      }}
                                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-black transition-all cursor-pointer shadow-3xs shrink-0 flex items-center gap-1"
                                    >
                                      <Zap size={11} />
                                      <span>{language === 'ar' ? 'طلب ترقية' : 'Request Upgrade'}</span>
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })()}
                        </AnimatePresence>
                      </div>

                      {/* Contact Sales & Inquiries Button inside Invoice Card */}
                      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                        <button
                          id="btn-contact-sales"
                          type="button"
                          onClick={() => openSalesModalWithPreFill(regSuccessData)}
                          className="w-full py-2 px-3 bg-gradient-to-r from-indigo-50 dark:from-indigo-950/40 via-purple-50 dark:via-purple-950/30 to-brand-blue-50 dark:to-brand-blue-950/40 hover:from-indigo-100 hover:via-purple-100 hover:to-brand-blue-100 dark:hover:from-indigo-900/50 dark:hover:via-purple-900/40 dark:hover:to-brand-blue-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
                        >
                          <div className="flex items-center gap-1 shrink-0">
                            <Headphones size={14} className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                            <MessageSquare size={13} className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                          </div>
                          <span>{language === 'ar' ? 'التواصل مع المبيعات والدعم الفني' : 'Contact Sales & Inquiries'}</span>
                          <span className="text-[9.5px] bg-indigo-500/10 dark:bg-indigo-400/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-md font-bold">
                            {language === 'ar' ? 'استفسار فوري' : 'Direct Support'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-sans pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          window.print();
                        }}
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                      >
                        <Printer size={13} />
                        <span>{language === 'ar' ? 'طباعة تفاصيل الفاتورة' : 'Print Invoice'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          // Automatically set the corporate login email & password for immediate demo access!
                          setEmail(regSuccessData.email);
                          setPasscode(regSuccessData.adminPasscode);
                          setIsRegisterMode(false);
                          setRegSuccessData(null);
                          setRegStep(1);
                        }}
                        className="p-2.5 bg-brand-blue-500 hover:bg-brand-blue-600 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-blue-500/15 cursor-pointer"
                      >
                        <span>🚀 {language === 'ar' ? 'تسجيل الدخول الفوري مديراً' : 'Instant Login!'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* REGISTER SIGN-UP WIZARD STEPS */
                  <form onSubmit={handleCommercialRegister} className="space-y-4">
                    {/* WIZARD HEADER STEP PROGRESS */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2.5">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-500">
                          <span>{language === 'ar' ? 'الخطوة' : 'Step'} {regStep} {language === 'ar' ? 'من 3' : 'of 3'}</span>
                          <span className="text-brand-blue-500 font-extrabold">
                            {regStep === 1 
                              ? (language === 'ar' ? 'ملف المنشأة' : 'Company Profile') 
                              : regStep === 2 
                              ? (language === 'ar' ? 'اختيار باقة الاشتراك' : 'SaaS Plan Selection') 
                              : (language === 'ar' ? 'حساب المشرف المسؤول' : 'Administrator Setup')
                            }
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden flex gap-0.5">
                          <div className={`h-full transition-all duration-300 ${regStep >= 1 ? 'bg-brand-blue-500 flex-1' : 'bg-slate-200'}`} />
                          <div className={`h-full transition-all duration-300 ${regStep >= 2 ? 'bg-brand-blue-500 flex-1' : 'bg-slate-200'}`} />
                          <div className={`h-full transition-all duration-300 ${regStep >= 3 ? 'bg-brand-blue-500 flex-1' : 'bg-slate-200'}`} />
                        </div>
                      </div>
                    </div>

                    {/* STEP 1: CORPORATE PROFILE */}
                    {regStep === 1 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-3"
                      >
                        <div className="space-y-1">
                          <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                            {language === 'ar' ? 'اسم المنشأة باللغة العربية' : 'Company Name (Arabic)'} <span className="text-rose-500">*</span>
                          </label>
                          <input 
                            type="text"
                            required
                            value={regCompanyAr}
                            onChange={(e) => setRegCompanyAr(e.target.value)}
                            placeholder="مثال: شركة نقليات الوطن المحدودة"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/90 hover:border-slate-200 focus:border-brand-blue-500 rounded-xl text-xs font-semibold outline-none dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                            {language === 'ar' ? 'اسم المنشأة باللغة الإنجليزية' : 'Company Name (English)'} <span className="text-rose-500">*</span>
                          </label>
                          <input 
                            type="text"
                            required
                            value={regCompanyEn}
                            onChange={(e) => setRegCompanyEn(e.target.value)}
                            placeholder="e.g. Al-Watan Transport Ltd."
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/90 hover:border-slate-200 focus:border-brand-blue-500 rounded-xl text-xs font-semibold outline-none dark:text-white text-left"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                              {language === 'ar' ? 'رقم السجل التجاري' : 'CR Number'} <span className="text-rose-500">*</span>
                            </label>
                            <input 
                              type="text"
                              required
                              maxLength={10}
                              value={regCR}
                              onChange={(e) => setRegCR(e.target.value.replace(/\D/g, ''))}
                              placeholder="1010XXXXXX"
                              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/90 hover:border-slate-200 focus:border-brand-blue-500 rounded-xl text-xs font-mono font-bold outline-none dark:text-white text-center"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                              {language === 'ar' ? 'المدينة (المقر الرئيسي)' : 'City (HQ)'}
                            </label>
                            <input 
                              type="text"
                              value={regCity}
                              onChange={(e) => setRegCity(e.target.value)}
                              placeholder={language === 'ar' ? 'الرياض' : 'Riyadh'}
                              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/90 hover:border-slate-200 focus:border-brand-blue-500 rounded-xl text-xs font-semibold outline-none dark:text-white text-center"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                            {language === 'ar' ? 'البريد الإلكتروني المعتمد للمراسلات' : 'Corporate Contact Email'} <span className="text-rose-500">*</span>
                          </label>
                          <input 
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="management@company.com"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/90 hover:border-slate-200 focus:border-brand-blue-500 rounded-xl text-xs font-semibold outline-none dark:text-white text-left"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                              {language === 'ar' ? 'رقم الهاتف / الجوال' : 'Mobile Number'} <span className="text-rose-500">*</span>
                            </label>
                            <input 
                              type="text"
                              required
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              placeholder="05XXXXXXXX"
                              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/90 hover:border-slate-200 focus:border-brand-blue-500 rounded-xl text-xs font-semibold outline-none dark:text-white text-center"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                              {language === 'ar' ? 'حجم أسطول النقل المجدول' : 'Planned Fleet Size'}
                            </label>
                            <select
                              value={regFleetSize}
                              onChange={(e) => setRegFleetSize(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/90 hover:border-slate-200 focus:border-brand-blue-500 rounded-xl text-xs font-bold outline-none dark:text-white"
                            >
                              <option value="1-10">1 - 10 {language === 'ar' ? 'مركبات' : 'vehicles'}</option>
                              <option value="10-50">10-50 {language === 'ar' ? 'مركبة' : 'vehicles'}</option>
                              <option value="50-200">50-200 {language === 'ar' ? 'مركبة' : 'vehicles'}</option>
                              <option value="200+">200+ {language === 'ar' ? 'عملاق' : 'enterprise'}</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: SUBSCRIPTION PLANS SHOWCASE & CYCLE */}
                    {regStep === 2 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-3 text-right"
                      >
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-150 dark:border-slate-800">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">{language === 'ar' ? 'دورة احتساب الرسوم' : 'Choose Billing Cycle'}</span>
                          <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300/40">
                            <button
                              type="button"
                              onClick={() => setRegCycle('monthly')}
                              className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${regCycle === 'monthly' ? 'bg-white dark:bg-[#0f1422] text-slate-900 dark:text-white shadow-3xs' : 'text-slate-500'}`}
                            >
                              {language === 'ar' ? 'شهري' : 'Monthly'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRegCycle('yearly')}
                              className={`px-3 py-1 rounded-md text-[10px] font-black transition-all flex items-center gap-1 ${regCycle === 'yearly' ? 'bg-white dark:bg-[#0f1422] text-slate-900 dark:text-white shadow-3xs' : 'text-slate-500'}`}
                            >
                              <span>{language === 'ar' ? 'سنوي' : 'Yearly'}</span>
                              <span className="px-1 py-0.2 bg-emerald-500 text-white text-[7.5px] font-black rounded">-20%</span>
                            </button>
                          </div>
                        </div>

                        {/* HIGH-TECH INTERACTIVE PACKAGES GROUP */}
                        <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                          {[
                            {
                              id: 'basic',
                              titleAr: 'الباقة الأساسية Basic',
                              titleEn: 'Basic Core Suite',
                              price: 39,
                              descAr: 'المزايا الفنية والتقارير الفردية ودون اتصال بالإنترنت حتى ٥٠ مركبة.',
                              descEn: 'Core SaaS, offline database sync, up to 50 active vehicles.',
                              color: 'border-slate-200 dark:border-slate-800',
                            },
                            {
                              id: 'pro',
                              titleAr: 'الباقة المهنية Pro',
                              titleEn: 'Professional System Pro',
                              price: 119,
                              descAr: 'تشمل لوحة تحويل البلاغات وصانع قوائم الفحص الفنية وصلاحيات متعددة والمشرف المتكامل.',
                              descEn: 'Custom checklists constructor, full multi-user roles & dispatch board.',
                              color: 'border-brand-blue-500/80 ring-2 ring-brand-blue-500/10',
                              popular: true,
                            },
                            {
                              id: 'enterprise',
                              titleAr: 'باقة المؤسسات Enterprise',
                              titleEn: 'Enterprise Dedicated Platform',
                              price: 399,
                              descAr: 'أسطول كامل دون حدود وسيرفر خاص وبنية تحتية مخصصة ومزامنة حية للبيانات المتقدمة.',
                              descEn: 'Dedicated server instances, white-label configs, unlimited fleets.',
                              color: 'border-violet-500/40',
                            }
                          ].map((plan) => {
                            const calculatedPrice = regCycle === 'yearly' ? plan.price * 0.8 : plan.price;
                            const isSelected = regSelectedPlan === plan.id;

                            return (
                              <div
                                key={plan.id}
                                onClick={() => setRegSelectedPlan(plan.id as any)}
                                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer relative ${
                                  isSelected 
                                    ? 'bg-brand-blue-50/20 dark:bg-brand-blue-500/10 border-brand-blue-500 shadow-md' 
                                    : 'bg-white dark:bg-[#0f1422] border-slate-100 dark:border-slate-800/80 hover:border-slate-200'
                                }`}
                              >
                                {plan.popular && (
                                  <span className="absolute top-3 left-3 px-2 py-0.5 bg-brand-blue-500 text-white text-[8px] font-black rounded-full uppercase tracking-wider">
                                    {language === 'ar' ? 'الموصى بها' : 'RECOMMENDED'}
                                  </span>
                                )}

                                <div className="flex justify-between items-start gap-3">
                                  <div>
                                    <h4 className="text-[11.5px] font-black text-slate-900 dark:text-white flex items-center gap-1 px-1 py-0.5">
                                      {isSelected && <span className="text-brand-blue-500 font-extrabold">●</span>}
                                      {language === 'ar' ? plan.titleAr : plan.titleEn}
                                    </h4>
                                    <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold leading-normal max-w-[220px] mt-1">
                                      {language === 'ar' ? plan.descAr : plan.descEn}
                                    </p>
                                  </div>
                                  <div className="text-left shrink-0">
                                    <span className="block text-[14px] font-black text-slate-850 dark:text-white">
                                      ${calculatedPrice.toFixed(1)}
                                    </span>
                                    <span className="block text-[8.5px] text-slate-400 font-semibold uppercase">
                                      /{regCycle === 'yearly' ? (language === 'ar' ? 'سنوي' : 'year') : (language === 'ar' ? 'شهري' : 'month')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* NOVEMBER ACTIVATION BADGE */}
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-[10px] text-amber-800 dark:text-amber-300 font-semibold leading-normal">
                          <span className="text-base shrink-0">⏳</span>
                          <div>
                            {language === 'ar' 
                              ? 'ملحوظة: اشتراكك المجدول مجاني حتى تفعيل التشغيل التجاري الفعلي مطلع شهر نوفمبر ٢٠٢٦.'
                              : 'Note: Scheduled billing and active billing cards remain on pending schedule until live activation in November 2026.'}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: ADMINISTRATOR SETUP */}
                    {regStep === 3 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-3"
                      >
                        <div className="space-y-1">
                          <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                            {language === 'ar' ? 'الاسم الكامل للمشرف المسؤول والمدير المعتمد' : 'Administrator Full Name'} <span className="text-rose-500">*</span>
                          </label>
                          <input 
                            type="text"
                            required
                            value={regAdminName}
                            onChange={(e) => setRegAdminName(e.target.value)}
                            placeholder="مثال: م. فواز الرويلي"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/90 hover:border-slate-200 focus:border-brand-blue-500 rounded-xl text-xs font-semibold outline-none dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                            {language === 'ar' ? 'تعيين رمز مرور المشرف للأمان' : 'Set Admin Secure Passcode'} <span className="text-rose-500">*</span>
                          </label>
                          <input 
                            type="password"
                            required
                            maxLength={4}
                            value={regAdminPasscode}
                            onChange={(e) => setRegAdminPasscode(e.target.value.replace(/\D/g, ''))}
                            placeholder="9999"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/90 hover:border-slate-200 focus:border-brand-blue-500 rounded-xl text-xs font-mono font-bold outline-none dark:text-white text-center"
                          />
                          <p className="text-[9.5px] text-slate-400">
                            {language === 'ar' ? 'رمز مرور آمن مكون من 4 أرقام لتسجيل الدخول الفوري.' : 'A secure 4-digit digital code for logging in immediately.'}
                          </p>
                        </div>

                        {/* SUMMARIZED TERMS AGREEMENT */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 leading-normal space-y-1.5">
                          <div className="font-bold text-slate-700 dark:text-slate-350">{language === 'ar' ? '🔒 إقرار وتأكيد تسجيل المنشأة:' : '🔒 Registration Confirmation:'}</div>
                          <p className="font-medium text-slate-450">
                            {language === 'ar' 
                              ? 'بالضغط على مفتاح "تأكيد وتفعيل الاشتراك"، أنت تؤكد تفويضك بتسجيل هذه المنشأة وتوافق على شروط الخدمة وجدولة تفعيل الحزم في نوفمبر المقبل.'
                              : 'By clicking "Confirm Registration", you attest that you represent this commercial legal entity and agree to activate scheduled billing starting Nov 2026.'}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* ERROR FEEDBACK */}
                    {regError && (
                      <p className="text-[10.5px] font-bold text-rose-500 text-center animate-shake">
                        {regError}
                      </p>
                    )}

                    {/* WIZARD ACTIONS BAR */}
                    <div className="flex gap-2 font-sans pt-1">
                      {regStep > 1 && (
                        <button
                          type="button"
                          onClick={() => setRegStep((regStep - 1) as any)}
                          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700 font-black text-xs rounded-xl transition-all cursor-pointer"
                        >
                          {language === 'ar' ? 'السابق' : 'Back'}
                        </button>
                      )}
                      
                      <button
                        type="submit"
                        disabled={isSubmittingReg}
                        className="flex-1 py-2.5 px-4 bg-brand-blue-500 hover:bg-brand-blue-600 disabled:bg-slate-350 text-white font-black text-xs rounded-xl transition-all shadow-md shadow-brand-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isSubmittingReg ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{language === 'ar' ? 'جاري تهيئة قاعدة البيانات والاشتراك...' : 'Provisioning company cloud schema...'}</span>
                          </>
                        ) : regStep < 3 ? (
                          <span>{language === 'ar' ? 'المتابعة للخطوة التالية' : 'Proceed Next'} ➔</span>
                        ) : (
                          <>
                            <Building2 size={13} />
                            <span>{language === 'ar' ? 'تأكيد التسجيل وتفعيل الاشتراك المجدول' : 'Confirm Registration & Active SaaS'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* BOTTOM CHIC TOGGLE LINK */}
                {!regSuccessData && (
                  <div className="text-center pt-2 border-t border-dashed border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(false);
                        setRegError('');
                      }}
                      className="text-xs font-black text-slate-500 hover:text-brand-blue-500 dark:hover:text-brand-blue-400 transition-colors cursor-pointer"
                    >
                      {language === 'ar' ? '← العودة إلى تسجيل الدخول العام بالنظام' : '← Back to General Sign-In'}
                    </button>
                  </div>
                )}
              </motion.div>
            ) : !isForgotPasswordMode ? (
              <motion.div
                key="standard-login-pane"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {is2faStep ? (
                  <form onSubmit={handleConfirm2FA} className="space-y-4">
                    <div className="space-y-2 text-center pb-1">
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 animate-pulse border border-amber-500/20">
                        <ShieldAlert size={24} />
                      </div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white mt-2">
                        {language === 'ar' ? 'التحقق بخطوتين (2FA)' : 'Two-Factor Authentication'}
                      </h3>
                      <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-normal max-w-xs mx-auto">
                        {language === 'ar' 
                          ? `تم إرسال رمز تحقق مؤقت إلى البريد المسجل: ${email}`
                          : `A temporary verification code was sent to the registered email: ${email}`
                        }
                      </p>
                    </div>

                    <div className="p-3.5 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl border border-amber-500/20 text-right flex flex-col gap-1.5 animate-bounce">
                      <div className="flex items-center justify-between text-[11px] font-black text-amber-600 dark:text-amber-400">
                        <span>{language === 'ar' ? 'محاكاة صندوق الوارد (صندوق الأمان)' : 'Simulated Inbox (Sandbox Shield)'}</span>
                        <Sparkles size={12} className="animate-spin-slow text-amber-500" />
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-350 font-bold leading-normal">
                        {language === 'ar' 
                          ? `[منظومة FleetAurvexis - أمان]: رمز التحقق المؤقت الخاص بك لتسجيل دخول الإدارة هو: `
                          : `[FleetAurvexis - Safety]: Your temporary admin login verification code is: `
                        }
                        <span className="font-mono text-base font-black tracking-wider text-amber-600 dark:text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-lg">{generated2faCode}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-right font-sans">
                      <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                        {language === 'ar' ? 'أدخل رمز التحقق (6 أرقام)' : 'Enter Verification Code (6-Digits)'} <span className="text-rose-500 font-black">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        maxLength={6}
                        value={userEntered2fa}
                        onChange={(e) => {
                          setUserEntered2fa(e.target.value.replace(/\D/g, ''));
                          setLoginError('');
                        }}
                        placeholder="------"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/90 hover:border-slate-200 focus:border-brand-blue-500 rounded-2xl text-center text-lg font-mono font-black tracking-widest outline-none dark:text-white"
                      />
                    </div>

                    {loginError && (
                      <p className="text-[10.5px] font-bold text-rose-500 text-center animate-shake">
                        ⚠️ {loginError}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                      <button
                        type="button"
                        onClick={() => {
                          setIs2faStep(false);
                          setLoginError('');
                          setUserEntered2fa('');
                        }}
                        className="py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700 font-black text-xs rounded-2xl transition-all cursor-pointer text-center"
                      >
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-350 dark:disabled:bg-slate-800 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{language === 'ar' ? 'جاري التحقق...' : 'Verifying...'}</span>
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} />
                            <span>{language === 'ar' ? 'تأكيد الدخول' : 'Confirm & Enter'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        disabled={isSending2fa}
                        onClick={handleResend2FA}
                        className="text-[10.5px] font-black text-brand-blue-500 hover:underline disabled:text-slate-400"
                      >
                        {isSending2fa 
                          ? (language === 'ar' ? 'جاري إعادة الإرسال...' : 'Re-sending...') 
                          : (language === 'ar' ? '🔄 إعادة إرسال رمز التحقق' : '🔄 Resend verification code')
                        }
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2 text-right">
                      <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 block pb-1">
                        {t('login.selectIdentity')}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'admin', key: 'roleAdmin' },
                          { id: 'technician', key: 'roleTechnician' },
                          { id: 'viewer', key: 'roleViewer' },
                          { id: 'driver', key: 'roleDriver' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setLoginRole(item.id as UserRole);
                              setLoginError('');
                              if (item.id === 'admin') setEmail('admin@fleetaurvexis.com');
                              else if (item.id === 'technician') setEmail('tech@fleetaurvexis.com');
                              else if (item.id === 'viewer') setEmail('auditor@fleetaurvexis.com');
                              else setEmail('driver@fleetaurvexis.com');
                            }}
                            className={`p-3 rounded-2xl text-[11px] font-black border text-center transition-all cursor-pointer ${
                              loginRole === item.id 
                                ? 'bg-brand-blue-500 text-white border-brand-blue-500 shadow-md shadow-brand-blue-500/10' 
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-450 border-slate-100 dark:border-slate-800/90 hover:border-slate-200'
                            }`}
                          >
                            <span>{t('login.' + item.key)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selected User Identity Preview & Live Online Status Indicator */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-right">
                      <div className="flex items-center gap-2.5">
                        <div className="relative shrink-0">
                          <img 
                            src={USERS[loginRole].avatar} 
                            alt={USERS[loginRole].name} 
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200/50 dark:border-slate-800"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0f1422] rounded-full" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">{t('login.users.' + loginRole + '.name')}</span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[8.5px] font-black leading-none border border-emerald-500/10 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{t('login.online')}</span>
                            </span>
                          </div>
                          <span className="block text-[9.5px] text-slate-450 dark:text-slate-500 font-semibold">{t('login.users.' + loginRole + '.title')}</span>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <span className="block text-[8.5px] text-slate-450 dark:text-slate-500 font-black tracking-wider uppercase">{t('login.cloudConnected')}</span>
                        <span className="block text-[7.5px] text-emerald-500 font-bold">{t('login.latency')}</span>
                      </div>
                    </div>

                    {/* Email Input Field */}
                    <div className="space-y-1.5 text-right font-sans">
                      <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 block pb-0.5 animate-fade-in">
                        {t('login.emailLabel')} <span className="text-rose-500 font-black">*</span>
                      </label>
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setLoginError('');
                        }}
                        placeholder={t('login.emailPlaceholder')}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/90 hover:border-slate-200 focus:border-brand-blue-500 rounded-2xl text-xs font-bold outline-none dark:text-white text-right"
                      />
                    </div>

                    {/* Passcode Input Field */}
                    <div className="space-y-1.5 text-right font-sans">
                      <div className="flex items-center justify-between pb-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPasswordMode(true);
                            setResetEmail(email);
                            setResetStatus('idle');
                            setResetMessage('');
                          }}
                          className="text-[10px] font-black text-brand-blue-500 dark:text-brand-blue-400 hover:underline cursor-pointer"
                        >
                          {t('login.forgotPassword')}
                        </button>
                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 block">
                          {t('login.passcodeLabel')}
                        </label>
                      </div>
                      <div className="relative">
                        <input 
                          type={showPasscode ? 'text' : 'password'}
                          value={passcode}
                          onChange={(e) => {
                            setPasscode(e.target.value);
                            setLoginError('');
                          }}
                          placeholder={t('login.passcodePlaceholder')}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/90 hover:border-slate-200 focus:border-brand-blue-500 rounded-2xl text-xs font-black outline-none dark:text-white"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPasscode(!showPasscode)}
                          className="absolute inset-y-0 left-3 flex items-center text-slate-400 hover:text-slate-650"
                        >
                          {showPasscode ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <p className="text-[9.5px] text-slate-400 mt-1">
                        {t('login.passcodeTip')}
                      </p>
                    </div>

                    {/* Remember Me Option (تذكرني) */}
                    <div className="flex items-center justify-between py-1 px-1 bg-slate-50/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/50">
                      <label className="flex items-center gap-2 cursor-pointer group select-none">
                        <input 
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-brand-blue-500 focus:ring-brand-blue-500/20 cursor-pointer accent-brand-blue-500"
                        />
                        <span className="text-[11px] font-black text-slate-750 dark:text-slate-350 group-hover:text-brand-blue-500 transition-colors">
                          {t('login.rememberCheckbox')}
                        </span>
                      </label>
                      <div className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                        {t('login.rememberUser')}
                      </div>
                    </div>

                    {loginError && (
                      <p className="text-[10.5px] font-bold text-rose-500 text-center animate-shake">
                        ⚠️ {loginError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-brand-blue-500 hover:bg-brand-blue-600 disabled:bg-slate-350 dark:disabled:bg-slate-800 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-brand-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t('login.loadingText')}</span>
                        </>
                      ) : (
                        <>
                          <Key size={14} />
                          <span>{t('login.submitButton')}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* SIGN UP FOR AD-HOC CORPORATIONS LINK */}
                <div className="pt-2 border-t border-dashed border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setRegStep(1);
                      setRegError('');
                    }}
                    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900 p-3 border border-slate-200/50 dark:border-slate-850 rounded-2xl text-[11px] font-black text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 cursor-pointer shadow-3xs"
                  >
                    <Building2 size={13} className="text-brand-blue-500" />
                    <span>{language === 'ar' ? '🏢 تسجيل منشأة تجارية واشتراك مجدول' : '🏢 Register Corporate Company & SaaS Plan'}</span>
                  </button>
                </div>

                {/* High-Tech Biometric Fingerprint Simulator Button */}
                {isBiometricEnabled ? (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                    <div className="relative flex py-1.5 items-center justify-center">
                      <div className="flex-grow border-t border-slate-100 dark:border-slate-800/60"></div>
                      <span className="flex-shrink mx-4 text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {t('login.orBiometric')}
                      </span>
                      <div className="flex-grow border-t border-slate-100 dark:border-slate-800/60"></div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={handleBiometricLogin}
                        disabled={isLoading || biometricStatus !== 'idle'}
                        className={`relative group w-20 h-20 rounded-3xl border flex items-center justify-center cursor-pointer transition-all duration-300 transform active:scale-95 ${
                          biometricStatus === 'scanning'
                            ? 'border-emerald-500/40 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 animate-pulse'
                            : biometricStatus === 'success'
                            ? 'border-brand-blue-500 bg-brand-blue-500/20 shadow-xl shadow-brand-blue-500/15'
                            : 'border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-brand-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-3xs'
                        }`}
                      >
                        {/* Holographic scanning laser line */}
                        {biometricStatus === 'scanning' && (
                          <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent top-0 animate-[bounce_1s_infinite] shadow-[0_0_8px_rgba(52,211,153,0.8)] z-10" />
                        )}

                        {/* Outer decorative pulsing rings */}
                        <div className={`absolute inset-0 border rounded-3xl opacity-0 scale-95 transition-all duration-500 ${
                          biometricStatus === 'scanning'
                            ? 'border-emerald-500/30 animate-ping opacity-100'
                            : 'group-hover:opacity-40 border-brand-blue-500/20'
                        }`} />

                        {/* Fingerprint icon with state-based glow colors */}
                        <Fingerprint 
                          size={38} 
                          className={`transition-all duration-300 ${
                            biometricStatus === 'scanning'
                              ? 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                              : biometricStatus === 'success'
                              ? 'text-brand-blue-500 scale-110 drop-shadow-[0_0_12px_var(--color-brand-blue-500)]'
                              : 'text-slate-450 dark:text-slate-500 group-hover:text-brand-blue-500'
                          }`}
                        />

                        {/* Real-time checkmark overlay for high-tech look upon success */}
                        {biometricStatus === 'success' && (
                          <span className="absolute bottom-1 right-1 text-[11px] bg-brand-blue-500 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold ring-2 ring-white shadow-md">✓</span>
                        )}
                      </button>

                      <div className="text-center space-y-1">
                        <span className={`block text-[11px] font-black tracking-wide transition-all ${
                          biometricStatus === 'scanning' 
                            ? 'text-emerald-500 animate-pulse' 
                            : biometricStatus === 'success' 
                            ? 'text-brand-blue-500' 
                            : 'text-slate-700 dark:text-slate-350 hover:text-brand-blue-500'
                        }`}>
                          {biometricStatus === 'scanning' ? (
                            t('login.biometricScanning')
                          ) : biometricStatus === 'success' ? (
                            t('login.biometricSuccess')
                          ) : (
                            t('login.biometricIdle')
                          )}
                        </span>
                        
                        <span className="block text-[9px] text-slate-400 dark:text-slate-500 leading-normal max-w-[280px] mx-auto">
                          {biometricStatus === 'scanning' ? (
                            t('login.biometricScanDetails')
                          ) : biometricStatus === 'success' ? (
                            t('login.biometricSuccessDetails')
                          ) : (
                            t('login.biometricIdleDetails')
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-[10px] text-slate-400 border border-slate-100 dark:border-slate-850">
                      <Shield size={10} className="text-slate-400 shrink-0" />
                      <span>
                        {language === 'ar' 
                          ? 'الدخول بالبصمة الحيوية معطل حالياً من إعدادات النظام.' 
                          : 'Biometric sign-in is currently disabled from system settings.'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="password-recovery-pane"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-right"
              >
                <div className="space-y-1 pt-1">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    🔒 {t('login.recoverPassword')}
                  </h3>
                  <p className="text-[10.5px] text-slate-400 dark:text-slate-400 leading-normal font-semibold">
                    {language === 'ar' 
                      ? 'أدخل بريدك الإلكتروني لإصدار رابط إعادة تعيين كلمة المرور النشط آمنًا عبر تشفير Firebase Auth.'
                      : 'Enter your registered work email to receive a secure password reset link powered by Firebase Auth.'
                    }
                  </p>
                </div>

                <form onSubmit={handleSendResetLink} className="space-y-4">
                  <div className="space-y-1.5 text-right">
                    <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                      {t('login.emailLabel')} <span className="text-rose-500 font-black">*</span>
                    </label>
                    <input 
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setResetStatus('idle');
                        setResetMessage('');
                      }}
                      placeholder={t('login.emailPlaceholder')}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/90 hover:border-slate-200 focus:border-brand-blue-500 rounded-2xl text-xs font-black outline-none dark:text-white text-right"
                    />
                  </div>

                  {resetMessage && (
                    <div className={`p-4 rounded-2xl text-xs font-black leading-relaxed transition-all ${
                      resetStatus === 'success'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                    }`}>
                      {resetMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={resetStatus === 'sending'}
                    className="w-full py-3 px-4 bg-brand-blue-500 hover:bg-brand-blue-600 disabled:bg-slate-350 dark:disabled:bg-slate-800 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-brand-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {resetStatus === 'sending' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t('login.loadingText')}</span>
                      </>
                    ) : (
                      <>
                        <Shield size={14} className="shrink-0" />
                        <span>{t('login.sendResetLink')}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordMode(false);
                      setResetStatus('idle');
                      setResetMessage('');
                    }}
                    className="w-full py-2.5 text-center text-xs text-brand-blue-500 hover:text-brand-blue-600 font-black transition-colors cursor-pointer"
                  >
                    {t('login.backToLogin')}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-center text-[9.5px] text-slate-400 select-none">
            {t('login.footerSecurity')}
          </div>
        </div>

        {/* Pre-Filled Subscription Support & Sales Modal */}
        <AnimatePresence>
          {isSalesModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setIsSalesModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                className="bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 w-full max-w-lg shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto font-sans text-right"
                dir={dir}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0 gap-0.5">
                      <Headphones size={16} />
                      <MessageSquare size={14} className="opacity-95" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                        {language === 'ar' ? 'استفسارات المبيعات والاشتراك' : 'Sales & Subscription Support'}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                        {language === 'ar' ? 'تواصل مباشر مع فريق مبيعات ودعم FleetAurvexis SaaS' : 'Direct channel with FleetAurvexis SaaS Sales Team'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSalesModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {inquirySubmittedSuccess ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
                      <CheckCircle2 size={36} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        {language === 'ar' ? 'تم إرسال استفسارك بنجاح!' : 'Inquiry Dispatched Successfully!'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
                        {language === 'ar'
                          ? 'تم تسجيل طلب الاستفسار المسبق لبيانات اشتراك منشأتكم، وسيقوم مسؤول الحسابات بالتواصل معكم خلال وقت وجيز.'
                          : 'Your subscription inquiry has been recorded. An enterprise account manager will reach out to you shortly.'}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 inline-block text-[11px] font-mono font-black text-indigo-600 dark:text-indigo-400">
                      Ref: AXO-SALES-2026-{(Math.random() * 8999 + 1000).toFixed(0)}
                    </div>
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSalesModalOpen(false);
                          setInquirySubmittedSuccess(false);
                        }}
                        className="px-6 py-2.5 bg-brand-blue-500 hover:bg-brand-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-brand-blue-500/15"
                      >
                        {language === 'ar' ? 'حسناً، تم' : 'Close'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsSubmittingInquiry(true);
                      setTimeout(() => {
                        setIsSubmittingInquiry(false);
                        setInquirySubmittedSuccess(true);
                      }, 800);
                    }}
                    className="space-y-3.5"
                  >
                    {/* Pre-filled Context Badge */}
                    {regSuccessData && (
                      <div className="p-3 bg-gradient-to-r from-indigo-50/80 dark:from-indigo-950/30 to-purple-50/80 dark:to-purple-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-extrabold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                            <Building2 size={12} />
                            <span>{regSuccessData.companyAr}</span>
                          </span>
                          <span className="font-mono font-bold text-slate-500 dark:text-slate-400">#{regSuccessData.subscriptionId}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 font-bold">
                          <span>{language === 'ar' ? 'الباقة المعتمدة:' : 'Plan:'} <strong className="text-indigo-600 dark:text-indigo-400 uppercase">{regSuccessData.plan}</strong></span>
                          <span>{language === 'ar' ? 'الأسطول:' : 'Fleet:'} <strong>{regSuccessData.fleetSize}</strong></span>
                          <span className="text-emerald-600 dark:text-emerald-400">{language === 'ar' ? 'تفعيل: نوفمبر ٢٠٢٦' : 'Starts: Nov 2026'}</span>
                        </div>
                      </div>
                    )}

                    {/* Inquiry Category Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'تصنيف الاستفسار:' : 'Inquiry Category:'}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {[
                          { id: 'activation', ar: 'موعد تفعيل نوفمبر ٢٠٢٦', en: 'Nov 2026 Activation' },
                          { id: 'plan_upgrade', ar: 'تعديل أو ترقية الباقة', en: 'Plan Adjustment' },
                          { id: 'fleet_expansion', ar: 'زيادة سعة الأسطول', en: 'Fleet Expansion' },
                          { id: 'billing', ar: 'الفواتير والخصومات', en: 'Billing & Discounts' },
                          { id: 'general', ar: 'استفسار مخصص عام', en: 'General Inquiry' },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSalesInquiryCategory(cat.id as any)}
                            className={`p-2 rounded-xl text-[10px] font-bold border transition-all text-center cursor-pointer ${
                              salesInquiryCategory === cat.id
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300'
                            }`}
                          >
                            {language === 'ar' ? cat.ar : cat.en}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'عنوان الموضوع:' : 'Subject:'}
                      </label>
                      <input
                        type="text"
                        required
                        value={salesInquirySubject}
                        onChange={(e) => setSalesInquirySubject(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Contact Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                          {language === 'ar' ? 'البريد الإلكتروني:' : 'Contact Email:'}
                        </label>
                        <input
                          type="email"
                          required
                          value={salesInquiryEmail}
                          onChange={(e) => setSalesInquiryEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                          {language === 'ar' ? 'رقم الهاتف / الجوال:' : 'Phone Number:'}
                        </label>
                        <input
                          type="tel"
                          value={salesInquiryPhone}
                          onChange={(e) => setSalesInquiryPhone(e.target.value)}
                          placeholder="05XXXXXXXX"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Message Details */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'تفاصيل الاستفسار والطلب:' : 'Inquiry Message:'}
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={salesInquiryMessage}
                        onChange={(e) => setSalesInquiryMessage(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                      />
                    </div>

                    {/* Direct Contact Hotline Bar */}
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold">
                        <Phone size={12} className="text-indigo-500" />
                        <span>{language === 'ar' ? 'هاتف المبيعات المباشر:' : 'Direct Sales:'}</span>
                        <strong className="text-slate-900 dark:text-white font-mono">+966 800 123 4567</strong>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold">
                        <Mail size={12} className="text-indigo-500" />
                        <span>sales@fleetaurvexis.com</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsSalesModalOpen(false)}
                        className="px-4 py-2 text-xs font-black text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                      >
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingInquiry}
                        className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingInquiry ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>{language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}</span>
                          </>
                        ) : (
                          <>
                            <Send size={13} />
                            <span>{language === 'ar' ? 'إرسال الاستفسار للمبيعات' : 'Submit Inquiry'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const renderOfflineSyncBanner = () => {
    const { isSyncing, queueCount, progress, showSuccess, error } = syncStatus;
    const isOffline = !isOnlineState;

    return (
      <AnimatePresence>
        {/* Offline Notice Banner inside the active screens */}
        {isOffline && !isOfflineDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20 }}
            className={`fixed bottom-6 left-6 right-6 md:left-auto md:right-12 z-[150] max-w-md bg-brand-blue-500/15 backdrop-blur-md border border-brand-blue-500/30 rounded-2xl p-4 shadow-xl text-brand-blue-950 dark:text-brand-blue-300 text-xs font-black flex items-start gap-3.5 relative ${
              language === 'ar' ? 'pl-10 text-right' : 'pr-10 text-left'
            }`}
            dir={dir}
            id="maintenance-offline-indicator"
          >
            <div className="p-2 bg-brand-blue-500/25 rounded-xl shrink-0 text-brand-blue-600 dark:text-brand-blue-400">
              <WifiOff size={18} className="animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-extrabold text-xs">
                {language === 'ar' ? 'وضعية العمل دون اتصال نشطة' : 'Offline Mode Active'}
              </h4>
              <p className="opacity-90 font-semibold leading-relaxed">
                {language === 'ar' 
                  ? 'تم قطع الاتصال بالإنترنت بشكل مؤقت. جميع بلاغات صيانة الأسطول الجديدة ستحفظ محلياً في جهازك وسيتم مزامنتها بمجرد عودة الاتصال تلقائياً.'
                  : 'You are working offline. New maintenance reports will be queued locally and synchronized with the cloud once network connectivity is recovered.'}
              </p>
              {queueCount > 0 && (
                <div className="mt-2 bg-brand-blue-500/15 rounded-lg px-2.5 py-1.5 inline-flex items-center gap-1.5 text-brand-blue-700 dark:text-brand-blue-300">
                  <span className="w-2 h-2 rounded-full bg-brand-blue-500 animate-ping" />
                  <span>
                    {language === 'ar' 
                      ? `لديك ${queueCount} بلاغ بانتظار المزامنة`
                      : `${queueCount} report(s) waiting for cloud upload`}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOfflineDismissed(true)}
              className={`absolute top-3.5 ${language === 'ar' ? 'left-3.5' : 'right-3.5'} hover:bg-brand-blue-500/20 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-800 dark:hover:text-brand-blue-200 p-1.5 rounded-xl transition-all duration-200 cursor-pointer`}
              title={language === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X size={14} className="stroke-[2.5]" />
            </button>
          </motion.div>
        )}

        {/* Cloud Sync Progress Overlay Card */}
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-12 z-[150] max-w-sm bg-slate-900/95 dark:bg-slate-950/95 border border-[#34D399]/40 rounded-2xl p-4 shadow-2xl text-white text-xs font-black"
            dir={dir}
            id="maintenance-sync-progress-card"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#34D399]/25 rounded-xl shrink-0 text-[#34D399]">
                <Globe size={18} className="animate-spin" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-xs">
                    {language === 'ar' ? 'جاري مزامنة بلاغات الصيانة...' : 'Syncing maintenance reports...'}
                  </span>
                  <span className="font-mono text-xs text-[#34d399]">{progress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="bg-[#34D399] h-full rounded-full transition-all duration-300"
                  />
                </div>
              </div>
            </div>
            <p className="mt-2.5 text-[10px] text-slate-400 font-semibold text-right">
              {language === 'ar'
                ? `جاري تشكيل وبث حزم البيانات الآمنة لـ Firebase (${progress}%...)`
                : `Transmitting secure packets to Firebase database servers (${progress}%...)`}
            </p>
          </motion.div>
        )}

        {/* Sync Success Notification Toast */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-12 z-[150] max-w-sm bg-emerald-600 text-white rounded-2xl p-4 shadow-2xl text-xs font-black border border-emerald-500"
            dir={dir}
            id="maintenance-sync-success-card"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500 rounded-xl shrink-0 text-white shadow-md">
                <Check size={18} />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-extrabold text-xs">
                  {language === 'ar' ? 'تمت المزامنة بنجاح!' : 'Synchronization Complete!'}
                </h4>
                <p className="text-[11px] font-semibold opacity-95">
                  {language === 'ar'
                    ? 'تم مزامنة وتأمين جميع البلاغات التي سجلت في وضع عدم الاتصال بنجاح مع خادم Firebase.'
                    : 'All maintenance orders completed in offline mode are now secured & validated in Firebase.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sync Error Banner with Retry Action */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-12 z-[150] max-w-sm bg-rose-600 text-white border border-rose-500 rounded-2xl p-4 shadow-2xl text-xs font-black"
            dir={dir}
            id="maintenance-sync-error-card"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-500 rounded-xl shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="font-extrabold text-xs">
                    {language === 'ar' ? 'فشلت مزامنة البيانات' : 'Sync Process Failed'}
                  </h4>
                  <p className="text-[11px] font-semibold opacity-95 mt-0.5 leading-relaxed">
                    {error}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={triggerOfflineSync}
                  className="px-3.5 py-1.5 bg-white text-rose-700 hover:bg-slate-100 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 select-none cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>{language === 'ar' ? 'إعادة المحاولة الآن' : 'Retry Now'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderMandatorySyncPrompt = () => {
    const isExceeded = currentOfflineWeightMB >= syncThresholdMB;
    if (!isLoggedIn || !currentUser || !isExceeded) return null;

    return (
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[210] flex items-center justify-center p-4 overflow-y-auto"
        dir={dir}
        id="mandatory-sync-blocker-overlay"
      >
        <div className="bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 text-right relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-rose-500 via-amber-500 to-indigo-500" />

          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl shrink-0 animate-pulse">
              <AlertTriangle size={28} />
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {language === 'ar' ? '⚠️ إجراء إداري: المزامنة الإلزامية مطلوبة' : '⚠️ Administrative Action: Mandatory Sync Required'}
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                {language === 'ar' ? 'أمان قواعد البيانات السحابية' : 'Cloud Database Integrity Lock'}
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
            <p>
              {language === 'ar'
                ? `لقد تجاوز حجم البيانات غير المزامنة والنشطة محلياً في هذا الجهاز الحد المسموح به المحدد من قبل إدارة النظام وهو `
                : `You have accumulated unsynced offline data that exceeds the threshold allowed by your administrator (`}
              <span className="font-mono font-black text-rose-500 underline decoration-rose-500/30">{syncThresholdMB} MB</span>
              {language === 'ar' ? `. يرجى الملاحظة أن الحجم المعلق حالياً هو: ` : `). Current pending size: `}
              <span className="font-mono font-black text-rose-500">{currentOfflineWeightMB} MB</span>.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              {language === 'ar'
                ? 'من أجل الحفاظ على اتساق السجلات السحابية للأسطول ومنع تعارض البيانات، يرجى تفعيل الاتصال وإجراء مزامنة إجبارية فورية لتأمين البيانات وحفظها في قاعدة بيانات Firebase.'
                : 'To maintain clean cloud synchronizations and protect fleet registers, further local actions are locked until a mandatory cloud backup is successfully synchronized with Firebase.'}
            </p>
          </div>

          {/* Progress or status box */}
          {isMandatorySyncing ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-black text-indigo-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  {mandatorySyncSuccess 
                    ? (language === 'ar' ? '✅ اكتمل الترحيل!' : '✅ Upload complete!')
                    : (language === 'ar' ? '🔄 جاري ترحيل وتأمين البيانات...' : '🔄 Securely uploading data...')
                  }
                </span>
                <span className="font-mono text-xs text-slate-500 font-bold">{mandatorySyncProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden font-mono">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${mandatorySyncProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-[11px]">
              <div className="space-y-0.5 text-right">
                <span className="text-slate-400">{language === 'ar' ? 'الحد المسموح:' : 'Allowed Limit:'}</span>
                <p className="font-mono font-black text-slate-800 dark:text-slate-200">{syncThresholdMB} MB</p>
              </div>
              <div className="space-y-0.5 border-r border-slate-200/60 dark:border-slate-800/60 pr-3 text-right">
                <span className="text-slate-400">{language === 'ar' ? 'الحجم الفعلي الحالي:' : 'Current Weight:'}</span>
                <p className="font-mono font-black text-rose-500 animate-pulse">{currentOfflineWeightMB} MB</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row-reverse gap-2.5 pt-2">
            <button
              type="button"
              disabled={isMandatorySyncing}
              onClick={handleMandatorySync}
              className="w-full sm:flex-1 py-3 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 text-white rounded-2xl text-xs font-black shadow-md hover:opacity-90 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{language === 'ar' ? '🔄 تشغيل المزامنة وتصفير حد الأمان الآن' : '🔄 Sync & Reset Data Limit Now'}</span>
            </button>

            {/* Admin Override Settings Shortcut */}
            {currentUser?.role === 'admin' && activeTab !== 'firebase-sync' && (
              <button
                type="button"
                disabled={isMandatorySyncing}
                onClick={() => {
                  setActiveTab('firebase-sync');
                }}
                className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-black transition-all cursor-pointer"
              >
                {language === 'ar' ? 'ضبط الخصائص كمدير' : 'Adjust Limit (Admin)'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoggedIn && activeTab === 'maintenance-bot') {
    return (
      <AiHub 
        onBack={() => {
          setActiveTab(previousTab || 'dashboard');
        }}
      />
    );
  }

  if (isLoggedIn && currentUser && currentUser.role === 'driver') {
    return (
      <DriverPortal 
        user={currentUser} 
        onLogout={handleLogout} 
        isDarkMode={isDarkMode} 
        onRoleChange={(role) => {
          const u = USERS[role];
          setCurrentUser(u);
          saveCurrentUserToStorage(u);
        }}
      />
    );
  }

  return (
    <AppLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      isAiEnabled={isAiEnabled}
      setIsAiEnabled={setIsAiEnabled}
      user={currentUser}
      onNavigateToMarketing={() => {
        setPortalMode('marketing');
        localStorage.setItem('saas_portal_mode', 'marketing');
      }}
      onRoleChange={(role) => {
        const u = USERS[role];
        setCurrentUser(u);
        saveCurrentUserToStorage(u);
      }}
      isDarkMode={isDarkMode}
      toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      onLogout={handleLogout}
      onUserUpdate={(updatedUser) => {
        setCurrentUser(updatedUser);
        saveCurrentUserToStorage(updatedUser);
      }}
    >
      {renderContent()}
      {renderOfflineSyncBanner()}
      {renderMandatorySyncPrompt()}
    </AppLayout>
  );
}
