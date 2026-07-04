import React, { useState, useEffect } from 'react';
import AppLayout from './components/AppLayout';
import Dashboard from './components/Dashboard';
import Vehicles from './components/Vehicles';
import Drivers from './components/Drivers';
import Maintenance from './components/Maintenance';
import PeriodicMaintenance from './components/PeriodicMaintenance';
import Technicians from './components/Technicians';
import Workshops from './components/Workshops';
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
import { User, UserRole } from './types';
import { MENU_ITEMS } from './constants';
import { useLanguage } from './services/LanguageContext';
import { Shield, Key, Eye, EyeOff, Wrench, Languages, Fingerprint, Layers, WifiOff, Globe, Check, AlertTriangle, RotateCcw, Loader2, Building2, CreditCard, Printer, Sparkles, ShieldAlert, UserCheck, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MarketingLandingPage from './components/MarketingLandingPage';
import { MarketingAdmin } from './components/MarketingAdmin';

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

  const setActiveTab = (tab: string) => {
    const currentMenuItem = MENU_ITEMS.find(item => item.id === tab);
    const userRole = currentUser?.role || 'admin';
    if (isLoggedIn && currentMenuItem) {
      if (currentMenuItem.roles.includes(userRole)) {
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
  const [email, setEmail] = useState('admin@axoventra.com');
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

  const { language, setLanguage, t, dir } = useLanguage();

  // --- MULTI-PROJECT SANDBOX CACHE & SW ISOLATION PURGE HOOK ---
  React.useEffect(() => {
    const CURRENT_SIGNATURE = "axoventra_mechanic_v2";
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

  // --- OFFLINE SYNC STATE & PROCESSORS ---
  const [isOnlineState, setIsOnlineState] = useState(navigator.onLine);
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
      console.log('[Connection Status] Device returned ONLINE. Booting background sync flow...');
      triggerOfflineSync();
    };

    const handleOffline = () => {
      setIsOnlineState(false);
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

    window.addEventListener('trigger-offline-sync', handleManualSyncTrigger);
    window.addEventListener('maintenance-offline-added', updateQueueCount);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('trigger-offline-sync', handleManualSyncTrigger);
      window.removeEventListener('maintenance-offline-added', updateQueueCount);
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
      setActiveTab('vehicles');
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

  const [saasBrandName, setSaasBrandName] = useState(() => {
    return localStorage.getItem('saas_brand_name') || '';
  });
  const [saasBrandDesc, setSaasBrandDesc] = useState(() => {
    return localStorage.getItem('saas_brand_desc') || '';
  });
  const [saasBrandLogo, setSaasBrandLogo] = useState(() => {
    return localStorage.getItem('saas_brand_logo') || '';
  });
  const [brandPrimaryColor, setBrandPrimaryColor] = useState(() => {
    return localStorage.getItem('saas_brand_primary_color') || '#1e53e4';
  });

  React.useEffect(() => {
    const handleStorageChange = () => {
      setSaasBrandName(localStorage.getItem('saas_brand_name') || '');
      setSaasBrandDesc(localStorage.getItem('saas_brand_desc') || '');
      setSaasBrandLogo(localStorage.getItem('saas_brand_logo') || '');
      setBrandPrimaryColor(localStorage.getItem('saas_brand_primary_color') || '#1e53e4');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
        localStorage.setItem('saas_current_user', JSON.stringify(selectedUser));
        sessionStorage.removeItem('saas_is_logged_in');
        sessionStorage.removeItem('saas_current_user');
      } else {
        sessionStorage.setItem('saas_is_logged_in', 'true');
        sessionStorage.setItem('saas_current_user', JSON.stringify(selectedUser));
        localStorage.removeItem('saas_is_logged_in');
        localStorage.removeItem('saas_current_user');
      }
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
        localStorage.setItem('saas_current_user', JSON.stringify(selectedUser));
        sessionStorage.removeItem('saas_is_logged_in');
        sessionStorage.removeItem('saas_current_user');
      } else {
        sessionStorage.setItem('saas_is_logged_in', 'true');
        sessionStorage.setItem('saas_current_user', JSON.stringify(selectedUser));
        localStorage.removeItem('saas_is_logged_in');
        localStorage.removeItem('saas_current_user');
      }
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
          localStorage.setItem('saas_current_user', JSON.stringify(selectedUser));
          sessionStorage.removeItem('saas_is_logged_in');
          sessionStorage.removeItem('saas_current_user');
        } else {
          sessionStorage.setItem('saas_is_logged_in', 'true');
          sessionStorage.setItem('saas_current_user', JSON.stringify(selectedUser));
          localStorage.removeItem('saas_is_logged_in');
          localStorage.removeItem('saas_current_user');
        }
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
          <MarketingLandingPage 
            onNavigateToSaaS={() => setActiveTab('dashboard')}
            brandPrimaryColor={brandPrimaryColor}
            brandName={saasBrandName}
            brandDesc={saasBrandDesc}
            isInsideApp={true}
            onNavigateToTab={setActiveTab}
            portalMode={portalMode}
          />
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
      <MarketingLandingPage 
        onNavigateToSaaS={(autoLogin = true) => {
          setPortalMode('saas');
          localStorage.setItem('saas_portal_mode', 'saas');
          if (autoLogin) {
            setIsLoggedIn(true);
            localStorage.setItem('saas_is_logged_in', 'true');
            setCurrentUser(USERS.admin);
            localStorage.setItem('saas_current_user', JSON.stringify(USERS.admin));
          }
        }}
        brandPrimaryColor={brandPrimaryColor}
        brandName={saasBrandName}
        brandDesc={saasBrandDesc}
        portalMode={portalMode}
      />
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
                          ? `[منظومة Axoventra - أمان]: رمز التحقق المؤقت الخاص بك لتسجيل دخول الإدارة هو: `
                          : `[Axoventra - Safety]: Your temporary admin login verification code is: `
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
                              if (item.id === 'admin') setEmail('admin@axoventra.com');
                              else if (item.id === 'technician') setEmail('tech@axoventra.com');
                              else if (item.id === 'viewer') setEmail('auditor@axoventra.com');
                              else setEmail('driver@axoventra.com');
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
      </div>
    );
  }

  const renderOfflineSyncBanner = () => {
    const { isSyncing, queueCount, progress, showSuccess, error } = syncStatus;
    const isOffline = !isOnlineState;

    return (
      <AnimatePresence>
        {/* Offline Notice Banner inside the active screens */}
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-12 z-[150] max-w-md bg-amber-500/15 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 shadow-xl text-amber-900 dark:text-amber-300 text-xs font-black flex items-start gap-3.5"
            dir={dir}
            id="maintenance-offline-indicator"
          >
            <div className="p-2 bg-amber-500/25 rounded-xl shrink-0 text-amber-600 dark:text-amber-400">
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
                <div className="mt-2 bg-amber-500/15 rounded-lg px-2.5 py-1.5 inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>
                    {language === 'ar' 
                      ? `لديك ${queueCount} بلاغ بانتظار المزامنة`
                      : `${queueCount} report(s) waiting for cloud upload`}
                  </span>
                </div>
              )}
            </div>
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

  if (isLoggedIn && currentUser && currentUser.role === 'driver') {
    return (
      <DriverPortal 
        user={currentUser} 
        onLogout={handleLogout} 
        isDarkMode={isDarkMode} 
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
        if (localStorage.getItem('saas_is_logged_in') === 'true') {
          localStorage.setItem('saas_current_user', JSON.stringify(u));
        } else {
          sessionStorage.setItem('saas_current_user', JSON.stringify(u));
        }
      }}
      isDarkMode={isDarkMode}
      toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      onLogout={handleLogout}
      onUserUpdate={(updatedUser) => {
        setCurrentUser(updatedUser);
        if (localStorage.getItem('saas_is_logged_in') === 'true') {
          localStorage.setItem('saas_current_user', JSON.stringify(updatedUser));
        } else {
          sessionStorage.setItem('saas_current_user', JSON.stringify(updatedUser));
        }
      }}
    >
      {renderContent()}
      {renderOfflineSyncBanner()}
    </AppLayout>
  );
}
