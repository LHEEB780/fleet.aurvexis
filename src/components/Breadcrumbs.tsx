import React, { useState } from 'react';
import { Home, ChevronLeft, ChevronRight, Folder, Truck, Users, LayoutDashboard, Wrench, BarChart3, IdCard, ClipboardCheck, Building2, Calendar, Warehouse, Handshake, ShieldCheck, CreditCard, Globe, Bot, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MENU_ITEMS } from '../constants';

interface BreadcrumbsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: 'ar' | 'en';
  variant?: 'card' | 'inline';
}

const GROUP_LABELS = {
  command: { ar: 'القيادة والتحكم الإستراتيجي', en: 'Strategic Command & Control' },
  operations: { ar: 'إدارة العمليات والأسطول', en: 'Fleet & Operations' },
  engineering: { ar: 'إدارة الصيانة والورش الفنية', en: 'Engineering & Maintenance' },
  logistics: { ar: 'سلاسل الإمداد والخدمات اللوجستية', en: 'Supply Chain & Logistics' },
  governance: { ar: 'الحوكمة وإدارة الموارد والأمان', en: 'Governance & Security' },
};

export const TAB_LABELS: Record<string, { ar: string; en: string; icon: React.ReactNode }> = {
  dashboard: { ar: 'لوحة التحكم والمؤشرات', en: 'Dashboard & KPIs', icon: <LayoutDashboard size={14} /> },
  reports: { ar: 'التقارير والإحصائيات', en: 'Reports & Analytics', icon: <BarChart3 size={14} /> },
  vehicles: { ar: 'إدارة المعدات والمركبات', en: 'Vehicles & Equipment', icon: <Truck size={14} /> },
  drivers: { ar: 'إدارة السائقين والتفويضات', en: 'Drivers & Authorizations', icon: <IdCard size={14} /> },
  'driver-handover': { ar: 'تسليم واستلام العجلات الفني', en: 'Driver Handover', icon: <ClipboardCheck size={14} /> },
  workshops: { ar: 'إدارة الورش والضغط الميداني', en: 'Workshops & Field Load', icon: <Building2 size={14} /> },
  maintenance: { ar: 'إدارة أوامر الصيانة', en: 'Maintenance Work Orders', icon: <Wrench size={14} /> },
  'external-maintenance': { ar: 'إدارة الصيانة الخارجية', en: 'External Maintenance Management', icon: <Wrench size={14} /> },
  'periodic-maintenance': { ar: 'إدارة الصيانة الدورية', en: 'Periodic Maintenance', icon: <Calendar size={14} /> },
  technicians: { ar: 'إدارة الفنيين والعاملين', en: 'Technicians & Staff', icon: <Users size={14} /> },
  inventory: { ar: 'إدارة المخزن والقطع', en: 'Inventory & Spare Parts', icon: <Warehouse size={14} /> },
  vendors: { ar: 'إدارة الموردين والتوريد', en: 'Vendors & Procurement', icon: <Handshake size={14} /> },
  'security-audit': { ar: 'صلاحيات الموظفين والامتثال', en: 'Permissions & Compliance', icon: <ShieldCheck size={14} /> },
  'firebase-sync': { ar: 'بوابة المزامنة والربط السحابي', en: 'Cloud Sync Portal (Firebase)', icon: <Cloud size={14} /> },
  'saas-billing': { ar: 'إدارة الاشتراك والفوترة', en: 'SaaS Billing & Plan', icon: <CreditCard size={14} /> },
  'marketing-admin': { ar: 'لوحة تحكم الموقع', en: 'Website Admin Panel', icon: <Globe size={14} /> },
  'maintenance-bot': { ar: 'مركز التحكم بوكلاء الـ AI', en: 'AI Agents Unified Command Hub', icon: <Bot size={14} /> },
};

export default function Breadcrumbs({ activeTab, setActiveTab, language, variant = 'card' }: BreadcrumbsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const currentItem = MENU_ITEMS.find((item) => item.id === activeTab);
  const currentGroup = currentItem ? currentItem.group : null;
  
  const isRtl = language === 'ar';
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;
  
  // Get other sections in the same group to facilitate quick transition
  const siblings = MENU_ITEMS.filter(
    (item) => item.group === currentGroup && item.id !== activeTab
  );

  const handleSibClick = (tabId: string) => {
    setActiveTab(tabId);
    setDropdownOpen(false);
  };

  return (
    <div 
      className={variant === 'inline'
        ? "flex flex-wrap items-center justify-between gap-3 text-xs font-semibold leading-none text-slate-700 dark:text-slate-300 select-none text-right w-full"
        : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3 md:p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs font-semibold leading-none text-slate-700 dark:text-slate-300 select-none text-right"
      }
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Paths and Nav Elements */}
      <div className="flex items-center flex-wrap gap-2 md:gap-3">
        {/* Home Link */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
            activeTab === 'dashboard'
              ? 'bg-brand-blue-500/10 text-brand-blue-600 dark:text-[#38bdf8] font-black'
              : activeTab === 'external-maintenance' && variant === 'inline'
              ? 'text-purple-200 hover:text-white hover:bg-white/10 cursor-pointer font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-white cursor-pointer'
          }`}
          title={isRtl ? 'الذهاب للوحة التحكم الرئيسية' : 'Go to Home Dashboard'}
        >
          <Home size={13} className="shrink-0" />
          <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
        </button>

        {currentGroup && currentItem && activeTab !== 'dashboard' && (
          <>
            <ArrowIcon size={12} className={`shrink-0 ${activeTab === 'external-maintenance' && variant === 'inline' ? 'text-purple-300/80' : 'text-slate-400'}`} />
            
            {/* Group Label (Static or navigation helper) */}
            <div className={`flex items-center gap-1.5 px-2 py-1.5 font-medium ${
              activeTab === 'external-maintenance' && variant === 'inline' ? 'text-purple-200/90' : 'text-slate-400 dark:text-slate-500'
            }`}>
              <Folder size={12} className="shrink-0" />
              <span>{isRtl ? GROUP_LABELS[currentGroup].ar : GROUP_LABELS[currentGroup].en}</span>
            </div>

            <ArrowIcon size={12} className={`shrink-0 ${activeTab === 'external-maintenance' && variant === 'inline' ? 'text-purple-300/80' : 'text-slate-400'}`} />

            {/* Current Item with Interactive Dropdown switcher to switch inline */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-extrabold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'external-maintenance' && variant === 'inline'
                    ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-xs shadow-xs'
                    : 'bg-brand-blue-50/50 dark:bg-brand-blue-950/30 text-brand-blue-700 dark:text-[#38bdf8] border border-brand-blue-100/30 hover:border-brand-blue-300 dark:hover:border-slate-700'
                }`}
              >
                {TAB_LABELS[activeTab]?.icon}
                <span>{isRtl ? TAB_LABELS[activeTab]?.ar : TAB_LABELS[activeTab]?.en}</span>
                <span className="text-[9px] opacity-70">▼</span>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute top-9 ${
                        isRtl ? 'right-0' : 'left-0'
                      } w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-50 p-1 divide-y divide-slate-100 dark:divide-slate-800/60`}
                    >
                      <div className="p-2 text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-wide uppercase">
                        {isRtl ? 'أقسام إضافية في هذه المجموعة:' : 'Other pages in this group:'}
                      </div>
                      
                      <div className="py-1 space-y-0.5">
                        {siblings.length === 0 ? (
                          <p className="p-2 text-[10px] text-slate-400 italic">
                            {isRtl ? 'لا يوجد أقسام أخرى' : 'No other sections'}
                          </p>
                        ) : (
                          siblings.map((sib) => (
                            <button
                              key={sib.id}
                              onClick={() => handleSibClick(sib.id)}
                              className="w-full text-right flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer text-xs"
                              dir={isRtl ? 'rtl' : 'ltr'}
                            >
                              <span className="text-slate-400">{TAB_LABELS[sib.id]?.icon || <ArrowIcon size={12} />}</span>
                              <span className="truncate">{isRtl ? (TAB_LABELS[sib.id]?.ar || sib.label) : (TAB_LABELS[sib.id]?.en || sib.id)}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
