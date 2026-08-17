import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Check, X, ShieldCheck, Cpu,
  RefreshCw, Layers, Sliders, Info, Search, 
  SlidersHorizontal, CheckSquare, Square,
  Building2, Calendar, ClipboardList, IdCard, 
  ShieldAlert, Box, Users, BarChart3, Truck, 
  Warehouse, Handshake, AlertCircle, Briefcase,
  Palette, Coins, Bell, Volume2, VolumeX, Smartphone,
  Zap, Send, CheckCircle2
} from 'lucide-react';
import { MENU_ITEMS, MenuItem } from '../constants';
import { useLanguage } from '../services/LanguageContext';
import { safeLocalStorage } from '../services/safeStorage';
import {
  getNotificationSettings,
  saveNotificationSettings,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  playNotificationSound,
  BrowserNotificationSettings
} from '../services/browserNotifications';

export interface SystemSettingsProps {
  onModuleChange?: (enabledModules: string[]) => void;
}

// Map of module descriptions for professional styling and context
const MODULE_INFOS: Record<string, { arDesc: string; enDesc: string; icon: React.ReactNode; arCategory: string; enCategory: string }> = {
  'reports': {
    arCategory: 'القيادة والتحكم',
    enCategory: 'Command & Control',
    icon: <BarChart3 size={16} />,
    arDesc: 'تحليل معمق للأعطال ومعدلات إكمال أوامر الصيانة وأداء الفنيين عبر مخططات بيانية دقيقة.',
    enDesc: 'Deep analytics of completed repair jobs, cost breakdowns, and active staff efficiency curves.'
  },
  'projects': {
    arCategory: 'العمليات والأسطول',
    enCategory: 'Fleet Operations',
    icon: <Briefcase size={16} />,
    arDesc: 'تنظيم المشاريع والمهام التشغيلية، حجز مركبات وسائقي الأسطول ومراقبة النواتج والموازنات.',
    enDesc: 'Organize operational projects, dispatch fleet vehicles/drivers, track outcomes and financial budgets.'
  },
  'vehicles': {
    arCategory: 'العمليات والأسطول',
    enCategory: 'Fleet Operations',
    icon: <Truck size={16} />,
    arDesc: 'إدارة شاملة لأسطول المعدات والمركبات، أرقام اللوحات، مواصفات المحرك وتتبع الاستهلاك الفني.',
    enDesc: 'Asset register tracking plate numbers, mechanical parameters, and engine parameters for active fleets.'
  },
  'drivers': {
    arCategory: 'العمليات والأسطول',
    enCategory: 'Fleet Operations',
    icon: <IdCard size={16} />,
    arDesc: 'تسجيل السائقين وتدقيق رخص القيادة وربطهم ديناميكياً مع تفويضات ومركبات الأسطول والتبعية.',
    enDesc: 'Authorized operator roster with license validity checks and dynamic vehicle keys dispatching.'
  },
  'workshops': {
    arCategory: 'الهندسة والصيانة',
    enCategory: 'Mechanical & Maintenance',
    icon: <Building2 size={16} />,
    arDesc: 'تنظيم الورش الفنية، معالجة الضغط الميداني اليومي، ورصد طاقة كل منفذ صيانة على حدة.',
    enDesc: 'Main workspace pipeline with load capacities and workshop bays balancing.'
  },
  'maintenance': {
    arCategory: 'الهندسة والصيانة',
    enCategory: 'Mechanical & Maintenance',
    icon: <ClipboardList size={16} />,
    arDesc: 'جدولة وإرسال أوامر الصيانة الميكانيكية والكهربائية العاجلة، ومراقبة تقدّم الإصلاح والخطوات.',
    enDesc: 'Core engineering ticket dispatching for emergency mechanical repairs and checklists verification.'
  },
  'periodic-maintenance': {
    arCategory: 'الهندسة والصيانة',
    enCategory: 'Mechanical & Maintenance',
    icon: <Calendar size={16} />,
    arDesc: 'برمجيات الصيانة الدورية الوقائية حسب المسافات أو الفترات الزمنية لتفادي توقف المعدات الحرج.',
    enDesc: 'Scheduled prevention engine alerts ensuring regular oil, brakes, and diagnostic maintenance cycles.'
  },
  'technicians': {
    arCategory: 'الهندسة والصيانة',
    enCategory: 'Mechanical & Maintenance',
    icon: <Users size={16} />,
    arDesc: 'إدارة الكادر البشري الفني، رصد تخصصات الفنيين الميكانيكية والهيدروليكية، والمهام المكتملة.',
    enDesc: 'Staff matrix indexing certified specialists across diagnostics, hydraulics, and electrical domains.'
  },
  'inventory': {
    arCategory: 'سلاسل الإمداد والتموين',
    enCategory: 'Supply Chain & Logistics',
    icon: <Warehouse size={16} />,
    arDesc: 'إدارة قطع الغيار والرفوف بالمستودعات، متابعة الكميات المتبقية وتنبيهات مستويات الطلب الحرج.',
    enDesc: 'Store logistics ledger with warehouse shelf index codes and critical low-stock alert lines.'
  },
  'vendors': {
    arCategory: 'سلاسل الإمداد والتموين',
    enCategory: 'Supply Chain & Logistics',
    icon: <Handshake size={16} />,
    arDesc: 'إدارة عقود الموردين الخارجيين، تتبع عينات قطع الغيار، ومصداقية التوريد مع سجل المشتريات.',
    enDesc: 'B2B supply-chain profiles tracking spare parts vendor reliability levels and purchase orders.'
  },
  'security-audit': {
    arCategory: 'الحوكمة والامتثال',
    enCategory: 'Governance & Compliance',
    icon: <ShieldCheck size={16} />,
    arDesc: 'حوكمة ورش العمل عبر تدقيق سجل الأمان الرقمي، وتتبع الولوج وصلاحيات الفنيين الحساسة.',
    enDesc: 'Advanced multi-factor security logs tracking operator barcode scans and system adjustments.'
  }
};

export const SystemSettings: React.FC<SystemSettingsProps> = ({ onModuleChange }) => {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  // State to track activated module IDs
  const [enabledModules, setEnabledModules] = useState<string[]>(() => {
    const saved = safeLocalStorage.getItem('saas_enabled_modules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Default: all modules enabled
    return MENU_ITEMS.map((item) => item.id);
  });

  // Search filter and group selection filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // --- DYNAMIC BRAND PRIMARY COLOR STATE & PRESETS ---
  const [primaryColor, setPrimaryColor] = useState(() => {
    return safeLocalStorage.getItem('saas_primary_color') || '#673de6';
  });

  const COLOR_PRESETS = [
    { id: 'violet', hex: '#673de6', labelAr: 'بنفسجي تكنولوجي', labelEn: 'Tech Violet' },
    { id: 'indigo', hex: '#4f46e5', labelAr: 'أزرق إنديغو', labelEn: 'Modern Indigo' },
    { id: 'blue', hex: '#1d4ed8', labelAr: 'أزرق ملكي', labelEn: 'Steel Blue' },
    { id: 'emerald', hex: '#059669', labelAr: 'أخضر زمردي', labelEn: 'Emerald Green' },
    { id: 'amber', hex: '#d97706', labelAr: 'أصفر كهرماني', labelEn: 'Amber Gold' },
    { id: 'crimson', hex: '#dc2626', labelAr: 'أحمر قرمزي', labelEn: 'Crimson Red' },
    { id: 'pink', hex: '#be185d', labelAr: 'وردي داكن', labelEn: 'Rose Red' },
    { id: 'carbon', hex: '#334155', labelAr: 'كربوني حديث', labelEn: 'Modern Carbon' },
  ];

  const handleColorChange = (hex: string) => {
    setAutosaveStatus('saving');
    setPrimaryColor(hex);
    safeLocalStorage.setItem('saas_primary_color', hex);
    
    // Dispatch standard storage event and custom brand color event
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('brand-color-changed'));
    
    setTimeout(() => {
      setAutosaveStatus('saved');
    }, 400);
  };

  // --- BASE CURRENCY SELECTION ---
  const [baseCurrency, setBaseCurrency] = useState(() => {
    return safeLocalStorage.getItem('saas_base_currency') || 'SAR';
  });

  const handleCurrencyChange = (currency: string) => {
    setAutosaveStatus('saving');
    setBaseCurrency(currency);
    safeLocalStorage.setItem('saas_base_currency', currency);
    
    // Dispatch standard storage event and custom currency event
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('base-currency-changed'));
    
    setTimeout(() => {
      setAutosaveStatus('saved');
      // Reload full page to ensure all components cleanly remount with the updated base currency format
      window.location.reload();
    }, 450);
  };

  // --- BROWSER PUSH NOTIFICATION SETTINGS ---
  const [notifSettings, setNotifSettings] = useState<BrowserNotificationSettings>(getNotificationSettings);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(getNotificationPermission);
  const [isNotifTesting, setIsNotifTesting] = useState(false);
  const [testNotifResult, setTestNotifResult] = useState<boolean | null>(null);
  const [isRequestingPerm, setIsRequestingPerm] = useState(false);

  const handleNotifToggle = (key: keyof BrowserNotificationSettings) => {
    setAutosaveStatus('saving');
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    saveNotificationSettings(updated);
    setTimeout(() => setAutosaveStatus('saved'), 350);
  };

  const handlePriorityFilterChange = (val: 'all' | 'high_only') => {
    setAutosaveStatus('saving');
    const updated = { ...notifSettings, minPriority: val };
    setNotifSettings(updated);
    saveNotificationSettings(updated);
    setTimeout(() => setAutosaveStatus('saved'), 350);
  };

  const handleRoleTargetChange = (val: 'all' | 'technicians' | 'managers') => {
    setAutosaveStatus('saving');
    const updated = { ...notifSettings, roleFilter: val };
    setNotifSettings(updated);
    saveNotificationSettings(updated);
    setTimeout(() => setAutosaveStatus('saved'), 350);
  };

  const handleRequestNotifPermission = async () => {
    setIsRequestingPerm(true);
    const result = await requestNotificationPermission();
    setNotifPermission(result.status);
    if (result.granted) {
      const updated = { ...notifSettings, enabled: true };
      setNotifSettings(updated);
      saveNotificationSettings(updated);
    }
    setIsRequestingPerm(false);
  };

  const handleTriggerTestNotif = async () => {
    setIsNotifTesting(true);
    setTestNotifResult(null);
    try {
      const ok = await sendTestNotification();
      setTestNotifResult(ok);
    } catch (e) {
      setTestNotifResult(false);
    } finally {
      setIsNotifTesting(false);
      setTimeout(() => setTestNotifResult(null), 4000);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const savedColor = safeLocalStorage.getItem('saas_primary_color') || '#673de6';
      setPrimaryColor(savedColor);
      const savedCurrency = safeLocalStorage.getItem('saas_base_currency') || 'SAR';
      setBaseCurrency(savedCurrency);
      setNotifSettings(getNotificationSettings());
      setNotifPermission(getNotificationPermission());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('brand-color-changed', handleStorageChange);
    window.addEventListener('base-currency-changed', handleStorageChange);
    window.addEventListener('notification-settings-changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('brand-color-changed', handleStorageChange);
      window.removeEventListener('base-currency-changed', handleStorageChange);
      window.removeEventListener('notification-settings-changed', handleStorageChange);
    };
  }, []);

  // Load modules list from standard constants, removing dashboard and billing (which are static core)
  const configurableItems = MENU_ITEMS.filter(
    (item) => item.id !== 'dashboard' && item.id !== 'saas-billing'
  );

  // Sync state if localStorage shifts elsewhere
  useEffect(() => {
    const handleStorage = () => {
      const saved = safeLocalStorage.getItem('saas_enabled_modules');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setEnabledModules(parsed);
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Update modules and dispatch event
  const handleToggleModule = (id: string) => {
    setAutosaveStatus('saving');
    let updated: string[];
    if (enabledModules.includes(id)) {
      updated = enabledModules.filter((mId) => mId !== id);
    } else {
      updated = [...enabledModules, id];
    }
    
    // Always keep 'dashboard' and 'saas-billing' implicitly enabled if they aren't already included
    if (!updated.includes('dashboard')) updated.push('dashboard');
    if (!updated.includes('saas-billing')) updated.push('saas-billing');

    setEnabledModules(updated);
    safeLocalStorage.setItem('saas_enabled_modules', JSON.stringify(updated));
    
    // Dispatch standard storage event so AppLayout listens to it
    window.dispatchEvent(new Event('storage'));
    
    // Optional callback
    if (onModuleChange) {
      onModuleChange(updated);
    }

    setTimeout(() => {
      setAutosaveStatus('saved');
    }, 400);
  };

  // Preset Configurations
  const applyPreset = (presetType: 'light' | 'operations' | 'full') => {
    setAutosaveStatus('saving');
    let updated: string[];

    if (presetType === 'light') {
      // Light version for minimal workshop tracking
      updated = ['dashboard', 'reports', 'vehicles', 'maintenance', 'saas-billing'];
    } else if (presetType === 'operations') {
      // Complete field-level operations without logistics / vendor accounting
      updated = [
        'dashboard',
        'reports',
        'vehicles',
        'drivers',
        'workshops',
        'maintenance',
        'periodic-maintenance',
        'technicians',
        'security-audit',
        'saas-billing'
      ];
    } else {
      // Full power integrated ERP suite
      updated = MENU_ITEMS.map((item) => item.id);
    }

    setEnabledModules(updated);
    safeLocalStorage.setItem('saas_enabled_modules', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    if (onModuleChange) {
      onModuleChange(updated);
    }

    setTimeout(() => {
      setAutosaveStatus('saved');
    }, 400);
  };

  // Filter modules lists
  const filteredModules = configurableItems.filter((item) => {
    const info = MODULE_INFOS[item.id];
    const categoryName = info ? (isRtl ? info.arCategory : info.enCategory) : '';
    const translatedName = isRtl ? item.label : item.id;
    
    const matchesSearch = 
      translatedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesGroup = selectedGroup === 'all' || item.group === selectedGroup;

    return matchesSearch && matchesGroup;
  });

  // Calculate stats
  const totalConfigurableCount = configurableItems.length;
  const activeConfigurableCount = configurableItems.filter((m) => enabledModules.includes(m.id)).length;
  const systemFootprintPercentage = Math.round((activeConfigurableCount / totalConfigurableCount) * 100);

  // Group translations for filter buttons
  const groupFilters = [
    { id: 'all', ar: 'الكل', en: 'All' },
    { id: 'operations', ar: 'العمليات والنشاط', en: 'Operations' },
    { id: 'engineering', ar: 'الهندسة والصيانة', en: 'Engineering' },
    { id: 'logistics', ar: 'المخزن والتموين', en: 'Logistics' },
    { id: 'governance', ar: 'الحوكمة والأمان', en: 'Governance' }
  ];

  return (
    <div className="space-y-6" id="system-settings-modularity-container">
      
      {/* Dynamic Brand Color Customization Section */}
      <div className={`p-5 bg-gradient-to-br from-violet-500/5 via-indigo-500/5 to-purple-500/5 dark:from-[#171330] dark:via-[#131124] dark:to-[#171330] rounded-3xl border border-violet-500/20 dark:border-violet-500/40 shadow-3xs space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <Palette size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-850 dark:text-white">
                {isRtl ? 'تخصيص لون الهوية البصرية (العلامة التجارية)' : 'Visual Brand Identity Customization'}
              </h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-400">
                {isRtl ? 'اختر لون الهوية الأساسي للمنصة ليتم تطبيقه على كافة الأزرار، القوائم، والمؤشرات البصرية فوراً.' : 'Select the primary brand color to instantly customize the interface buttons, menus, and visual highlights.'}
              </p>
            </div>
          </div>
          
          {/* Custom picker badge */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-[10px] text-slate-400 font-bold">
              {isRtl ? 'لون مخصص:' : 'Custom color:'}
            </span>
            <div className="relative flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-6 h-6 rounded-lg border-0 cursor-pointer overflow-hidden p-0 bg-transparent"
              />
              <span className="font-mono text-[9px] font-black uppercase text-slate-500 pr-1.5 pl-0.5">
                {primaryColor}
              </span>
            </div>
          </div>
        </div>

        {/* Color Presets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isActive = primaryColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleColorChange(preset.hex)}
                className={`p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2 relative ${
                  isActive
                    ? 'border-slate-400 dark:border-slate-500 bg-slate-50/50 dark:bg-slate-900/30 ring-2 ring-slate-400/10'
                    : 'border-slate-100 dark:border-slate-850 bg-white dark:bg-[#111827] hover:bg-slate-50'
                }`}
              >
                {/* Visual Swatch */}
                <span 
                  className="w-5 h-5 rounded-full shadow-inner block relative shrink-0" 
                  style={{ backgroundColor: preset.hex }}
                >
                  {isActive && (
                    <span className="absolute inset-0 flex items-center justify-center text-white">
                      <Check size={10} className="stroke-[3]" />
                    </span>
                  )}
                </span>
                
                {/* Label */}
                <span className="text-[9.5px] font-black text-slate-600 dark:text-slate-350 text-center truncate w-full">
                  {isRtl ? preset.labelAr : preset.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Base Currency Customization Section */}
      <div className={`p-5 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 dark:from-[#0d1e1a] dark:via-[#091512] dark:to-[#0d1e1a] rounded-3xl border border-emerald-500/20 dark:border-emerald-500/40 shadow-3xs space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Coins size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-850 dark:text-white">
                {isRtl ? 'العملة الأساسية للمنشأة' : 'Facility Base Currency Settings'}
              </h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-400">
                {isRtl ? 'اختر العملة الرسمية للمنشأة. سيقوم النظام بتحديث أسعار الفواتير وعروض التقارير المالية والتحليلات آلياً.' : 'Set the primary facility currency. All billing plans, local spare parts costs, and financial analytics will adjust dynamically.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-[10px] text-slate-400 font-bold">
              {isRtl ? 'العملة الحالية:' : 'Active Currency:'}
            </span>
            <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-lg border border-emerald-500/10">
              {baseCurrency}
            </div>
          </div>
        </div>

        {/* Currencies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-9 gap-2">
          {[
            { id: 'SAR', labelAr: 'ريال سعودي', labelEn: 'Saudi Riyal', symbolAr: 'ر.س', symbolEn: 'SAR' },
            { id: 'USD', labelAr: 'دولار أمريكي', labelEn: 'US Dollar', symbolAr: '$', symbolEn: 'USD' },
            { id: 'AED', labelAr: 'درهم إماراتي', labelEn: 'UAE Dirham', symbolAr: 'د.إ', symbolEn: 'AED' },
            { id: 'EGP', labelAr: 'جنيه مصري', labelEn: 'Egyptian Pound', symbolAr: 'ج.م', symbolEn: 'EGP' },
            { id: 'QAR', labelAr: 'ريال قطري', labelEn: 'Qatari Riyal', symbolAr: 'ر.ق', symbolEn: 'QAR' },
            { id: 'KWD', labelAr: 'دينار كويتي', labelEn: 'Kuwaiti Dinar', symbolAr: 'د.ك', symbolEn: 'KWD' },
            { id: 'OMR', labelAr: 'ريال عماني', labelEn: 'Omani Riyal', symbolAr: 'ر.ع', symbolEn: 'OMR' },
            { id: 'BHD', labelAr: 'دينار بحريني', labelEn: 'Bahraini Dinar', symbolAr: 'د.ب', symbolEn: 'BHD' },
            { id: 'EUR', labelAr: 'يورو أوروبي', labelEn: 'Euro', symbolAr: '€', symbolEn: 'EUR' }
          ].map((curr) => {
            const isActive = baseCurrency === curr.id;
            return (
              <button
                key={curr.id}
                type="button"
                onClick={() => handleCurrencyChange(curr.id)}
                className={`p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1.5 relative ${
                  isActive
                    ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/10 dark:bg-emerald-950/20 ring-2 ring-emerald-500/10'
                    : 'border-slate-100 dark:border-slate-850 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-900/40'
                }`}
              >
                {/* Symbol / Icon display */}
                <span className={`text-xs font-black font-sans leading-none block shrink-0 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {isRtl ? curr.symbolAr : curr.symbolEn}
                </span>

                {/* Label */}
                <span className={`text-[9.5px] font-black text-center truncate w-full ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-550 dark:text-slate-400'}`}>
                  {isRtl ? curr.labelAr : curr.labelEn}
                </span>

                {isActive && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 flex items-center justify-center text-white p-0.5">
                    <Check size={6} className="stroke-[4]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Browser Push Notifications & Real-Time Alerts Configuration Card */}
      <div className={`p-5 bg-gradient-to-br from-indigo-500/5 via-sky-500/5 to-brand-blue-500/5 dark:from-[#0d1527] dark:via-[#091120] dark:to-[#0d1527] rounded-3xl border border-indigo-500/20 dark:border-indigo-500/40 shadow-3xs space-y-5 ${isRtl ? 'text-right' : 'text-left'}`}>
        
        {/* Header & Permission Status */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Bell size={20} className={notifSettings.enabled ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-850 dark:text-white">
                  {isRtl ? 'نظام إشعارات المتصفح الفورية (Browser Push Notifications)' : 'Browser Push Notifications Engine'}
                </h3>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  notifPermission === 'granted'
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                    : notifPermission === 'denied'
                    ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                    : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                }`}>
                  {notifPermission === 'granted' 
                    ? (isRtl ? 'إذن المتصفح مسموح ✓' : 'Permission Active ✓') 
                    : notifPermission === 'denied' 
                    ? (isRtl ? 'محظور بالمتصفح' : 'Blocked') 
                    : (isRtl ? 'يتطلب الإذن' : 'Permission Needed')}
                </span>
              </div>
              <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">
                {isRtl 
                  ? 'تنبيه الفنيين ومدراء التشغيل فوراً على سطح المكتب والهاتف عند وصول بلاغ صيانة جديد أو اقتراب موعد صيانة وقائية (٤٨ ساعة).' 
                  : 'Instantly notify technicians and managers on desktop and mobile when maintenance tickets arrive or periodic service is due.'}
              </p>
            </div>
          </div>

          {/* Quick Actions / Master Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {notifPermission !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestNotifPermission}
                disabled={isRequestingPerm}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-black rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Zap size={12} />
                <span>{isRequestingPerm ? (isRtl ? 'جاري الطلب...' : 'Requesting...') : (isRtl ? 'منح إذن المتصفح' : 'Grant Permission')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleTriggerTestNotif}
              disabled={isNotifTesting}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10.5px] font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send size={12} className={isNotifTesting ? 'animate-spin' : ''} />
              <span>{isRtl ? 'إشعار تجريبي' : 'Test Alert'}</span>
            </button>
            
            {testNotifResult === true && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <Check size={12} />
                {isRtl ? 'تم الإرسال!' : 'Sent!'}
              </span>
            )}

            <div 
              onClick={() => handleNotifToggle('enabled')}
              className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer shrink-0 ml-1 ${
                notifSettings.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              title={isRtl ? 'تفعيل / إيقاف الإشعارات' : 'Toggle Notifications'}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-xs ${
                notifSettings.enabled 
                  ? (isRtl ? 'right-5' : 'left-5') 
                  : (isRtl ? 'right-1' : 'left-1')
              }`} />
            </div>
          </div>
        </div>

        {/* Feature Switches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          
          {/* Switch 1: New Maintenance Orders */}
          <div className="p-3.5 rounded-2xl border border-slate-150/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
                <Zap size={15} />
              </div>
              <div className="min-w-0">
                <h5 className="text-[11px] font-black text-slate-850 dark:text-slate-150 truncate">
                  {isRtl ? 'بلاغات الصيانة الجديدة' : 'New Repair Tickets'}
                </h5>
                <p className="text-[9px] text-slate-400 truncate">
                  {isRtl ? 'تنبيه فوري لأوامر العمل' : 'Instant dispatch alerts'}
                </p>
              </div>
            </div>
            <div 
              onClick={() => handleNotifToggle('notifyNewMaintenance')}
              className={`w-8 h-4.5 rounded-full relative transition-colors cursor-pointer shrink-0 ${
                notifSettings.notifyNewMaintenance ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-xs ${
                notifSettings.notifyNewMaintenance 
                  ? (isRtl ? 'right-4' : 'left-4') 
                  : (isRtl ? 'right-0.5' : 'left-0.5')
              }`} />
            </div>
          </div>

          {/* Switch 2: Periodic Maintenance Due (48h) */}
          <div className="p-3.5 rounded-2xl border border-slate-150/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <Calendar size={15} />
              </div>
              <div className="min-w-0">
                <h5 className="text-[11px] font-black text-slate-850 dark:text-slate-150 truncate">
                  {isRtl ? 'استحقاق الصيانة الدورية' : 'Upcoming Periodic (48h)'}
                </h5>
                <p className="text-[9px] text-slate-400 truncate">
                  {isRtl ? 'تذكير مبكر قبل ٤٨ ساعة' : '48h early preparation'}
                </p>
              </div>
            </div>
            <div 
              onClick={() => handleNotifToggle('notifyPeriodicDue')}
              className={`w-8 h-4.5 rounded-full relative transition-colors cursor-pointer shrink-0 ${
                notifSettings.notifyPeriodicDue ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-xs ${
                notifSettings.notifyPeriodicDue 
                  ? (isRtl ? 'right-4' : 'left-4') 
                  : (isRtl ? 'right-0.5' : 'left-0.5')
              }`} />
            </div>
          </div>

          {/* Switch 3: Sound Chimes */}
          <div className="p-3.5 rounded-2xl border border-slate-150/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                {notifSettings.soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h5 className="text-[11px] font-black text-slate-850 dark:text-slate-150 truncate">
                    {isRtl ? 'نغمة التنبيه الصوتية' : 'Audio Chime'}
                  </h5>
                  <button
                    type="button"
                    onClick={() => playNotificationSound('alert')}
                    className="text-[9px] text-indigo-600 hover:underline cursor-pointer font-bold"
                  >
                    ({isRtl ? 'تجربة' : 'play'})
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 truncate">
                  {isRtl ? 'جرس تنبيه عالي الوضوح' : 'Clear audible alert'}
                </p>
              </div>
            </div>
            <div 
              onClick={() => handleNotifToggle('soundEnabled')}
              className={`w-8 h-4.5 rounded-full relative transition-colors cursor-pointer shrink-0 ${
                notifSettings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-xs ${
                notifSettings.soundEnabled 
                  ? (isRtl ? 'right-4' : 'left-4') 
                  : (isRtl ? 'right-0.5' : 'left-0.5')
              }`} />
            </div>
          </div>

          {/* Switch 4: Mobile Vibration */}
          <div className="p-3.5 rounded-2xl border border-slate-150/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
                <Smartphone size={15} />
              </div>
              <div className="min-w-0">
                <h5 className="text-[11px] font-black text-slate-850 dark:text-slate-150 truncate">
                  {isRtl ? 'الاهتزاز للهواتف' : 'Mobile Vibration'}
                </h5>
                <p className="text-[9px] text-slate-400 truncate">
                  {isRtl ? 'تنبيه حركي للأجهزة الذكية' : 'Haptic vibration pattern'}
                </p>
              </div>
            </div>
            <div 
              onClick={() => handleNotifToggle('vibrationEnabled')}
              className={`w-8 h-4.5 rounded-full relative transition-colors cursor-pointer shrink-0 ${
                notifSettings.vibrationEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-xs ${
                notifSettings.vibrationEnabled 
                  ? (isRtl ? 'right-4' : 'left-4') 
                  : (isRtl ? 'right-0.5' : 'left-0.5')
              }`} />
            </div>
          </div>

        </div>

        {/* Targeting & Priority Scope */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Target Roles */}
          <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-150/50 dark:border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">
              {isRtl ? 'تخصيص استقبال التنبيهات الميدانية:' : 'Target Audience:'}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleRoleTargetChange('all')}
                className={`px-2.5 py-1 rounded-xl text-[9.5px] font-black transition-all cursor-pointer ${
                  notifSettings.roleFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700'
                }`}
              >
                {isRtl ? 'الكل (فنيين وإداريين)' : 'All Staff'}
              </button>
              <button
                type="button"
                onClick={() => handleRoleTargetChange('technicians')}
                className={`px-2.5 py-1 rounded-xl text-[9.5px] font-black transition-all cursor-pointer ${
                  notifSettings.roleFilter === 'technicians'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700'
                }`}
              >
                {isRtl ? 'الفنيين والورش فقط' : 'Technicians'}
              </button>
              <button
                type="button"
                onClick={() => handleRoleTargetChange('managers')}
                className={`px-2.5 py-1 rounded-xl text-[9.5px] font-black transition-all cursor-pointer ${
                  notifSettings.roleFilter === 'managers'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700'
                }`}
              >
                {isRtl ? 'الإداريين والمشرفين' : 'Managers'}
              </button>
            </div>
          </div>

          {/* Priority Level */}
          <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-150/50 dark:border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">
              {isRtl ? 'مستوى أهمية البلاغات المنبه عنها:' : 'Minimum Priority Level:'}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePriorityFilterChange('all')}
                className={`px-2.5 py-1 rounded-xl text-[9.5px] font-black transition-all cursor-pointer ${
                  notifSettings.minPriority === 'all'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700'
                }`}
              >
                {isRtl ? 'جميع المستويات (عادي، متوسط، حرج)' : 'All Priorities'}
              </button>
              <button
                type="button"
                onClick={() => handlePriorityFilterChange('high_only')}
                className={`px-2.5 py-1 rounded-xl text-[9.5px] font-black transition-all cursor-pointer ${
                  notifSettings.minPriority === 'high_only'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700'
                }`}
              >
                {isRtl ? 'الطارئ والحرج فقط 🚨' : 'Urgent Only 🚨'}
              </button>
            </div>
          </div>
        </div>

      </div>
      
      {/* Dynamic Summary Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Footprint / Active counter card */}
        <div className={`p-4 bg-white dark:bg-[#0c101d] rounded-2xl border border-slate-150 dark:border-slate-800/80 flex items-center justify-between ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block font-black uppercase tracking-widest">
              {isRtl ? 'الموديولات النشطة حالياً' : 'Active System Modules'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
                {activeConfigurableCount}
              </span>
              <span className="text-xs text-slate-400 font-bold">
                / {totalConfigurableCount}
              </span>
            </div>
            <p className="text-[9px] text-slate-450 leading-relaxed">
              {isRtl ? 'تم تخصيص الواجهة وتقليص قائمة التنقل' : 'Control sidebar links length in real-time'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 text-violet-500 flex items-center justify-center shrink-0 shadow-xs">
            <Cpu size={22} className="animate-pulse text-violet-500" />
          </div>
        </div>

        {/* Footprint Indicator Gauge */}
        <div className={`p-4 bg-white dark:bg-[#0c101d] rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 block font-black uppercase tracking-widest">
              {isRtl ? 'البصمة التشغيلية للنظام' : 'Platform Scope Overhead'}
            </span>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
              systemFootprintPercentage < 50 ? 'bg-emerald-500/10 text-emerald-600' :
              systemFootprintPercentage < 90 ? 'bg-amber-400/10 text-amber-500' :
              'bg-blue-500/10 text-blue-500'
            }`}>
              {systemFootprintPercentage < 50 ? (isRtl ? 'خفيف فائق' : 'Ultra Light') :
               systemFootprintPercentage < 90 ? (isRtl ? 'موجه ميدانياً' : 'Balanced') :
               (isRtl ? 'متكامل ERP' : 'Full ERP')}
            </span>
          </div>
          <div className="space-y-1.5 mt-2">
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  systemFootprintPercentage < 50 ? 'bg-emerald-500' :
                  systemFootprintPercentage < 90 ? 'bg-amber-500' :
                  'bg-brand-blue-500'
                }`}
                style={{ width: `${systemFootprintPercentage}%` }}
              />
            </div>
            <div className={`flex justify-between items-center text-[9px] text-slate-400 font-bold ${isRtl ? 'flex-row-reverse' : ''}`}>
              <span>{isRtl ? 'مساحة المنيو مقلصة' : 'Menu space optimized'}</span>
              <span>{systemFootprintPercentage}% {isRtl ? 'نطاق التشغيل' : 'footprint scale'}</span>
            </div>
          </div>
        </div>

        {/* Sync / Autosave Badge Card */}
        <div className={`p-4 bg-white dark:bg-[#0c101d] rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block font-black uppercase tracking-widest">
              {isRtl ? 'بوابة كشوف الكود والحفظ' : 'Localization & Save Policy'}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full block ${autosaveStatus === 'saving' ? 'bg-amber-500 animate-spin' : 'bg-emerald-500'}`} />
              <span className="text-xs font-black text-slate-800 dark:text-slate-150">
                {autosaveStatus === 'saving' ? (isRtl ? 'جاري المزمنة...' : 'Saving changes...') : (isRtl ? 'حفظ تلقائي مفعّل' : 'Instant Autosaved')}
              </span>
            </div>
            <p className="text-[9px] text-slate-450 leading-relaxed">
              {isRtl ? 'يقوم المكون بالكتابة المباشرة في التخزين الذاتي' : 'Direct secure writeback to local device registers'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0`}>
            <Sliders size={20} />
          </div>
        </div>

      </div>

      {/* Preset Packages Quick Controls */}
      <div className={`p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-slate-850 space-y-3 ${isRtl ? 'text-right' : 'text-left'}`}>
        <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">
          💡 {isRtl ? 'قوالب تفعيل جاهزة لتعديل النطاق بكبسة زر' : 'Capability Presets - Quick Configurer'}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Preset Light */}
          <button
            type="button"
            onClick={() => applyPreset('light')}
            className={`p-3 bg-white dark:bg-[#121829] border text-right rounded-2xl cursor-pointer hover:border-violet-500 hover:shadow-xs transition-all flex flex-col justify-between group h-24 ${
              enabledModules.length <= 5 && enabledModules.includes('vehicles') && !enabledModules.includes('drivers')
                ? 'border-violet-500/80 ring-2 ring-violet-500/10' : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className={`w-full flex justify-between items-center ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
              <span className="text-[8.5px] px-1.5 py-0.5 bg-sky-500/10 text-sky-600 rounded-md font-extrabold shrink-0">
                {isRtl ? 'الحد الأدنى للورشة' : 'Essential Focus'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-350 dark:bg-slate-700" />
            </div>
            <div className="space-y-0.5 mt-2">
              <span className="block text-[11px] font-black text-slate-850 dark:text-slate-100 group-hover:text-violet-500 transition-colors">
                {isRtl ? 'حزمة صيانة المعدات الأساسية' : 'Core Maintenance Desk'}
              </span>
              <span className="block text-[8.5px] text-slate-400 font-bold leading-tight">
                {isRtl ? 'تفعل فقط المعدات، أوامر الصيانة، لوحة المؤشرات وتكلفة قطع الاشتراك.' : 'Vitals only: diagnostics, core ticket desk and essentials.'}
              </span>
            </div>
          </button>

          {/* Preset Balanced Operations */}
          <button
            type="button"
            onClick={() => applyPreset('operations')}
            className={`p-3 bg-white dark:bg-[#121829] border text-right rounded-2xl cursor-pointer hover:border-violet-500 hover:shadow-xs transition-all flex flex-col justify-between group h-24 ${
              enabledModules.length > 5 && enabledModules.length <= 10 && !enabledModules.includes('inventory')
                ? 'border-violet-500/80 ring-2 ring-violet-500/10' : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className={`w-full flex justify-between items-center ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
              <span className="text-[8.5px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md font-extrabold shrink-0">
                {isRtl ? 'حزمة العمل الميداني والورش' : 'Field Operations Tier'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-350 dark:bg-slate-700" />
            </div>
            <div className="space-y-0.5 mt-2">
              <span className="block text-[11px] font-black text-slate-850 dark:text-slate-100 group-hover:text-violet-500 transition-colors">
                {isRtl ? 'إدارة الكادر والمعدات والورش' : 'Roster & Bays Balancer'}
              </span>
              <span className="block text-[8.5px] text-slate-400 font-bold leading-tight">
                {isRtl ? 'كامل النظام مع السائقين والموقع وصلاحيات السجل عدا موديولات المستودعات والتوريد.' : 'All field ops: drivers dispatching + bays + security role audits.'}
              </span>
            </div>
          </button>

          {/* Preset Enterprise Complete ERP */}
          <button
            type="button"
            onClick={() => applyPreset('full')}
            className={`p-3 bg-white dark:bg-[#121829] border text-right rounded-2xl cursor-pointer hover:border-violet-500 hover:shadow-xs transition-all flex flex-col justify-between group h-24 ${
              enabledModules.length === MENU_ITEMS.length
                ? 'border-violet-500/80 ring-2 ring-violet-500/10' : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className={`w-full flex justify-between items-center ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
              <span className="text-[8.5px] px-1.5 py-0.5 bg-brand-blue-500/10 text-brand-blue-600 rounded-md font-extrabold shrink-0">
                {isRtl ? 'المجموعة المتكاملة الشاملة' : 'Complete ERP System'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-350 dark:bg-slate-700" />
            </div>
            <div className="space-y-0.5 mt-2">
              <span className="block text-[11px] font-black text-slate-850 dark:text-slate-100 group-hover:text-violet-500 transition-colors">
                {isRtl ? 'طاقة الـ ERP الكلية للمنشآت' : 'Unified Logistics Enterprise'}
              </span>
              <span className="block text-[8.5px] text-slate-400 font-bold leading-tight">
                {isRtl ? 'تشغيل وتفعيل كافة الموديولات دفعة واحدة بما في ذلك المخازن وسلاسل التوريد والقطع.' : 'Fully loaded: inventory ledger, supplies, diagnostic bays & telemetry.'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Manual Advanced Custom Grid Panel with Search, Filters and Instant Switches */}
      <div className="space-y-4">
        
        {/* Search & Filter Header bar */}
        <div className={`flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
          
          {/* Integrated Search Input field */}
          <div className="relative flex-1">
            <Search className={`absolute top-3 w-4 h-4 text-slate-450 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isRtl ? 'ابحث باسم الموديول أو التخصص الفني فوري...' : 'Live filter capability codes...'}
              className={`w-full py-2.5 px-4 bg-white dark:bg-slate-900/55 text-slate-850 dark:text-white border border-slate-200/80 dark:border-slate-800 rounded-2xl text-[11px] font-black transition-all outline-none focus:border-brand-blue-500 placeholder-slate-400 shadow-3xs ${
                isRtl ? 'pr-11 text-right' : 'pl-11 text-left'
              }`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className={`absolute top-2.5 p-1 text-slate-400 hover:text-slate-650 rounded-lg border-0 cursor-pointer ${isRtl ? 'left-2.5' : 'right-2.5'}`}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Group Category Switch Selector */}
          <div className={`flex flex-wrap items-center gap-1 overflow-x-auto pb-1 max-w-full ${isRtl ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
            {groupFilters.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setSelectedGroup(group.id)}
                className={`px-3 py-2 text-[9.5px] font-black rounded-xl cursor-pointer border transition-all shrink-0 ${
                  selectedGroup === group.id
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-600 shadow-md shadow-violet-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 text-slate-550 dark:text-slate-450 hover:bg-slate-50'
                }`}
              >
                {isRtl ? group.ar : group.en}
              </button>
            ))}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <AnimatePresence mode="popLayout">
            {filteredModules.length > 0 ? (
              filteredModules.map((item) => {
                const isEnabled = enabledModules.includes(item.id);
                const info = MODULE_INFOS[item.id];
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={item.id}
                    onClick={() => handleToggleModule(item.id)}
                    className={`p-4 bg-white dark:bg-[#0c101d] border rounded-[1.5rem] flex items-start justify-between cursor-pointer hover:shadow-xs transition-all border-r-[4.5px] ${
                      isEnabled 
                        ? 'border-violet-500 border-r-violet-500 shadow-3xs hover:bg-violet-500/[0.01]' 
                        : 'border-slate-150 dark:border-slate-800 text-slate-400 bg-slate-50/10'
                    } ${isRtl ? 'flex-row-reverse text-right border-r-[4.5px]' : 'border-l-[4.5px]'}`}
                    style={
                      isRtl 
                        ? { borderRightColor: isEnabled ? '' : undefined, borderLeft: '0' }
                        : { borderLeftColor: isEnabled ? '' : undefined, borderRight: '0' }
                    }
                  >
                    {/* Left details slot */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Interactive Visual Icon box */}
                      <div className={`p-3 rounded-2xl shrink-0 transition-all ${
                        isEnabled 
                          ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/5 text-violet-600 dark:text-violet-400' 
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400'
                      }`}>
                        {info?.icon || item.icon}
                      </div>

                      <div className="space-y-1 text-right w-full min-w-0">
                        <div className={`flex items-center gap-1.5 flex-wrap ${isRtl ? 'justify-start flex-row-reverse' : ''}`}>
                          <span className={`text-[11.5px] font-black truncate block ${
                            isEnabled ? 'text-slate-850 dark:text-slate-100' : 'text-slate-405 dark:text-slate-500'
                          }`}>
                            {isRtl ? item.label : item.id}
                          </span>
                          
                          {/* Module Group / Category Badge label */}
                          {info && (
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                              isEnabled 
                                ? 'bg-gradient-to-br from-violet-500/15 to-purple-500/5 text-violet-700 dark:text-violet-300' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-450'
                            }`}>
                              {isRtl ? info.arCategory : info.enCategory}
                            </span>
                          )}
                        </div>

                        <p className={`text-[10px] leading-relaxed block ${
                          isEnabled ? 'text-slate-550 dark:text-slate-350' : 'text-slate-400 dark:text-slate-550'
                        }`}>
                          {isRtl ? info?.arDesc : info?.enDesc}
                        </p>

                        {/* Status Label block */}
                        <div className={`flex items-center gap-1 pt-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-350'}`} />
                          <span className={`text-[8px] font-black uppercase tracking-widest ${isEnabled ? 'text-emerald-500' : 'text-slate-400 font-bold'}`}>
                            {isEnabled 
                              ? (isRtl ? 'منشط فوري' : 'Live & Active') 
                              : (isRtl ? 'معطل ومحجوب' : 'Disabled / Hidden')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Standard IOS-Style Toggle Switch on the trailing side */}
                    <div className={`w-9 h-5 rounded-full relative transition-colors border-0 shrink-0 mt-1 cursor-pointer ${
                      isEnabled ? 'bg-gradient-to-r from-violet-500 to-indigo-600' : 'bg-slate-200 dark:bg-slate-850'
                    }`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                        isEnabled 
                          ? (isRtl ? 'right-5' : 'left-5') 
                          : (isRtl ? 'right-1' : 'left-1')
                      }`} />
                    </div>

                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-2 py-10 text-center space-y-3 bg-slate-50 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-205 dark:border-slate-800">
                <AlertCircle className="mx-auto text-slate-400" size={32} />
                <div className="space-y-1">
                  <h5 className="text-xs font-black text-slate-850 dark:text-slate-200">
                    {isRtl ? 'لا توجد موديولات مطابقة لفلتر البحث' : 'No compatible capability modules found'}
                  </h5>
                  <p className="text-[9.5px] text-slate-400 leading-normal max-w-xs mx-auto">
                    {isRtl ? 'الرجاء تجربة كتابة مصطلح آخر أو الضغط على زر "الكل" لإعادة تعيين قائمة المصفى.' : 'Try adjusting your filter text or selection scope parameters.'}
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
