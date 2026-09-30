import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pin, 
  ChevronDown, 
  Check, 
  Settings2, 
  Coins, 
  Search, 
  X, 
  RotateCcw, 
  TrendingUp, 
  Globe
} from 'lucide-react';
import { 
  getBaseCurrency, 
  setBaseCurrency, 
  getCustomExchangeRates, 
  saveCustomExchangeRates, 
  resetCustomExchangeRates, 
  DEFAULT_EXCHANGE_RATES,
  CustomExchangeRates,
  SUPPORTED_CURRENCIES,
  getCurrencyDetails,
  CurrencyItem
} from '../services/formatters';

interface CurrencyToggleProps {
  language?: 'ar' | 'en';
  variant?: 'topbar' | 'settings' | 'compact' | 'arrow-only';
  className?: string;
  onSelectCurrency?: (currencyId: string) => void;
}

export default function CurrencyToggle({
  language = 'ar',
  variant = 'topbar',
  className = '',
  onSelectCurrency
}: CurrencyToggleProps) {
  const [currentCurrency, setCurrentCurrency] = useState<string>(() => getBaseCurrency());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [customRates, setCustomRates] = useState<CustomExchangeRates>(() => getCustomExchangeRates());
  const [ratesForm, setRatesForm] = useState<CustomExchangeRates>(() => getCustomExchangeRates());
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const isRtl = language === 'ar';

  // Sync state with global storage events and custom events
  useEffect(() => {
    const handleCurrencyUpdate = () => {
      setCurrentCurrency(getBaseCurrency());
      const updatedRates = getCustomExchangeRates();
      setCustomRates(updatedRates);
      setRatesForm(updatedRates);
    };

    window.addEventListener('storage', handleCurrencyUpdate);
    window.addEventListener('base-currency-changed', handleCurrencyUpdate);
    return () => {
      window.removeEventListener('storage', handleCurrencyUpdate);
      window.removeEventListener('base-currency-changed', handleCurrencyUpdate);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Handle pinning a new base currency
  const handlePinCurrency = (currencyId: string) => {
    if (currentCurrency === currencyId) {
      setIsDropdownOpen(false);
      return;
    }

    setBaseCurrency(currencyId);
    setCurrentCurrency(currencyId);
    setIsDropdownOpen(false);
    setSearchQuery('');

    const targetDetails = getCurrencyDetails(currencyId);
    const message = isRtl
      ? `تم تثبيت ${targetDetails.labelAr} (${targetDetails.id} ${targetDetails.flag}) كعملة معتمدة وتحديث الأسعار فورياً ✓`
      : `Pinned ${targetDetails.labelEn} (${targetDetails.id} ${targetDetails.flag}) as system base currency ✓`;

    setSaveToast(message);
    setTimeout(() => setSaveToast(null), 3200);
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomExchangeRates(ratesForm);
    setCustomRates(ratesForm);
    setIsRatesModalOpen(false);

    const message = isRtl
      ? 'تم حفظ أسعار الصرف التقريبية محلياً وتحديث كافة الحسابات بنجاح ✓'
      : 'Custom exchange rates saved locally ✓';
    setSaveToast(message);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleResetRates = () => {
    resetCustomExchangeRates();
    setRatesForm(DEFAULT_EXCHANGE_RATES);
    setCustomRates(DEFAULT_EXCHANGE_RATES);
    setIsRatesModalOpen(false);

    const message = isRtl
      ? 'تمت استعادة أسعار الصرف الافتراضية بنجاح'
      : 'Exchange rates reset to default';
    setSaveToast(message);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const activeCurrencyDetails = getCurrencyDetails(currentCurrency);

  // Filter currencies based on search query
  const filteredCurrencies = SUPPORTED_CURRENCIES.filter((curr) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      curr.id.toLowerCase().includes(q) ||
      curr.labelAr.toLowerCase().includes(q) ||
      curr.labelEn.toLowerCase().includes(q) ||
      curr.countryAr.toLowerCase().includes(q) ||
      curr.countryEn.toLowerCase().includes(q) ||
      curr.symbolAr.toLowerCase().includes(q) ||
      curr.symbolEn.toLowerCase().includes(q)
    );
  });

  // Calculated cross-rate: 1 JOD = ? IQD
  const crossRateJodToIqd = ratesForm.jodVsUsd > 0 && ratesForm.iqdVsUsd > 0
    ? (ratesForm.iqdVsUsd / ratesForm.jodVsUsd).toFixed(1)
    : (1310 / 0.709).toFixed(1);

  // Modal Component for Adjusting Approximate Exchange Rates
  const renderRatesModal = () => (
    <AnimatePresence>
      {isRatesModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsRatesModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl text-slate-900 dark:text-slate-100 text-start space-y-4"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Coins size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {isRtl ? 'ضبط أسعار صرف العملات المحفوظة محلياً' : 'Manage Local Currency Exchange Rates'}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {isRtl ? 'يتم حفظ السعر التقريبي محلياً وتطبيقه على الفواتير والاشتراكات' : 'Saved locally in browser storage for invoices & billing'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRatesModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center cursor-pointer transition"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveRates} className="space-y-3.5">
              {/* Realtime calculated cross rate card */}
              <div className="p-3 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold text-violet-600 dark:text-violet-400 block uppercase">
                    {isRtl ? 'سعر الصرف المباشر المحسوب' : 'Direct Cross Rate'}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    1 د.أ (JOD) 🇯🇴 ≈ {crossRateJodToIqd} د.ع (IQD) 🇮🇶
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-600 flex items-center justify-center font-bold text-xs">
                  ≈
                </div>
              </div>

              {/* Iraqi Dinar inputs */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850/60 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 font-black text-xs text-emerald-600 dark:text-emerald-400">
                  <span>🇮🇶</span>
                  <span>{isRtl ? 'سعر صرف الدينار العراقي (IQD)' : 'Iraqi Dinar (IQD) Rates'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-start">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                      {isRtl ? '1 ر.س (SAR) =' : '1 SAR ='}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={ratesForm.iqdVsSar}
                        onChange={(e) => setRatesForm({ ...ratesForm, iqdVsSar: parseFloat(e.target.value) || 0 })}
                        className="w-full py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-mono font-bold outline-none focus:border-emerald-500"
                      />
                      <span className="absolute end-2 top-2 text-[9px] text-slate-400 font-bold">د.ع</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                      {isRtl ? '1 دولار (USD) =' : '1 USD ='}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        value={ratesForm.iqdVsUsd}
                        onChange={(e) => setRatesForm({ ...ratesForm, iqdVsUsd: parseFloat(e.target.value) || 0 })}
                        className="w-full py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-mono font-bold outline-none focus:border-emerald-500"
                      />
                      <span className="absolute end-2 top-2 text-[9px] text-slate-400 font-bold">د.ع</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jordanian Dinar inputs */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850/60 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 font-black text-xs text-amber-600 dark:text-amber-400">
                  <span>🇯🇴</span>
                  <span>{isRtl ? 'سعر صرف الدينار الأردني (JOD)' : 'Jordanian Dinar (JOD) Rates'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-start">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                      {isRtl ? '1 ر.س (SAR) =' : '1 SAR ='}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        value={ratesForm.jodVsSar}
                        onChange={(e) => setRatesForm({ ...ratesForm, jodVsSar: parseFloat(e.target.value) || 0 })}
                        className="w-full py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-mono font-bold outline-none focus:border-amber-500"
                      />
                      <span className="absolute end-2 top-2 text-[9px] text-slate-400 font-bold">د.أ</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                      {isRtl ? '1 دولار (USD) =' : '1 USD ='}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        value={ratesForm.jodVsUsd}
                        onChange={(e) => setRatesForm({ ...ratesForm, jodVsUsd: parseFloat(e.target.value) || 0 })}
                        className="w-full py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-mono font-bold outline-none focus:border-amber-500"
                      />
                      <span className="absolute end-2 top-2 text-[9px] text-slate-400 font-bold">د.أ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetRates}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center gap-1 cursor-pointer transition"
                >
                  <RotateCcw size={12} />
                  <span>{isRtl ? 'استعادة الافتراضي' : 'Reset'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRatesModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-black text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-md cursor-pointer transition"
                  >
                    {isRtl ? 'حفظ وتحديث الأسعار' : 'Save Rates'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Variant 1 & 2: Topbar Button with Dropdown (Header Row 2 or Compact)
  if (variant === 'topbar' || variant === 'compact') {
    return (
      <div 
        ref={dropdownRef} 
        className={`relative inline-flex items-center gap-1 select-none ${className}`} 
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Toast notification feedback */}
        <AnimatePresence>
          {saveToast && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900/95 dark:bg-slate-800/95 text-white text-[11px] font-black px-4 py-2 rounded-2xl shadow-2xl border border-emerald-500/40 whitespace-nowrap flex items-center gap-2 backdrop-blur-md"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check size={12} className="stroke-[3]" />
              </div>
              <span>{saveToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pinned Currency Selector Trigger Button with Dedicated Small Arrow */}
        <button
          id="topbar-pinned-currency-btn"
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`h-8.5 ps-2 pe-1.5 sm:ps-2.5 sm:pe-2 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 group border ${
            isDropdownOpen
              ? 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/60 ring-2 ring-amber-500/20 text-amber-700 dark:text-amber-300'
              : 'bg-white dark:bg-slate-800 hover:bg-amber-50/50 dark:hover:bg-slate-700/80 border-slate-200/70 dark:border-slate-700/70 text-slate-750 dark:text-slate-200'
          }`}
          title={
            isRtl
              ? `العملة المعتمدة حالياً: ${activeCurrencyDetails.labelAr} (${activeCurrencyDetails.id}) - اضغط على السهم لعرض كافة العملات والتبديل`
              : `Current base currency: ${activeCurrencyDetails.labelEn} (${activeCurrencyDetails.id}) - Click arrow to switch currency`
          }
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          {/* Flag of Pinned Currency */}
          <span className="text-sm leading-none shrink-0 group-hover:scale-110 transition-transform select-none">
            {activeCurrencyDetails.flag}
          </span>

          {/* Currency Code */}
          <span className="text-[11px] font-black leading-none text-slate-900 dark:text-white flex items-center">
            {activeCurrencyDetails.id}
          </span>

          {/* Dedicated Small Arrow Badge to open currencies menu and switch */}
          <span 
            className={`w-4.5 h-4.5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
              isDropdownOpen
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-700 dark:group-hover:bg-amber-950/60 dark:group-hover:text-amber-300'
            }`}
            title={isRtl ? 'عرض كافة العملات للتبديل' : 'Show all currencies to switch'}
          >
            <ChevronDown 
              size={11} 
              className={`transition-transform duration-200 stroke-[2.5] ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </span>
        </button>

        {/* Floating Dropdown Menu Showing ALL Currencies in the System */}
        <AnimatePresence>
          {isDropdownOpen && (
            <>
              {/* Mobile Backdrop Overlay to dismiss on tap anywhere outside */}
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-40 sm:hidden"
                onClick={() => setIsDropdownOpen(false)}
                aria-hidden="true"
              />

              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className={`
                  fixed inset-x-3 top-24 sm:top-10.5 sm:absolute sm:inset-x-auto
                  ${isRtl ? 'sm:end-0 sm:start-auto' : 'sm:start-0 sm:end-auto'}
                  z-50 w-auto sm:w-96 max-w-[calc(100vw-1.5rem)] sm:max-w-none
                  bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md text-start
                  flex flex-col max-h-[78vh] sm:max-h-[85vh]
                `}
              >
                {/* Dropdown Header */}
                <div className="p-3 sm:p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-slate-850 dark:to-slate-900 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Pin size={13} className="rotate-45 fill-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{isRtl ? 'العملات المعتمدة في النظام' : 'System Base Currencies'}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-full">
                          {SUPPORTED_CURRENCIES.length}
                        </span>
                      </h4>
                      <p className="text-[9.5px] text-slate-500 dark:text-slate-400">
                        {isRtl ? 'انقر على أي عملة لتثبيتها في الأعلى وتطبيق أسعارها' : 'Click any currency to pin it and recalculate prices'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center cursor-pointer transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Active Pinned Banner Inside Dropdown */}
                <div className="px-3 pt-2.5 pb-2 bg-slate-50/70 dark:bg-slate-850/40 border-b border-slate-150 dark:border-slate-800/80 shrink-0">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl leading-none shrink-0">{activeCurrencyDetails.flag}</span>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[9.5px] font-black uppercase text-amber-600 dark:text-amber-400">
                            {isRtl ? 'العملة المثبتة حالياً' : 'Currently Pinned'}
                          </span>
                          <Pin size={8.5} className="fill-amber-500 text-amber-600 shrink-0" />
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block truncate">
                          {isRtl ? activeCurrencyDetails.labelAr : activeCurrencyDetails.labelEn} ({activeCurrencyDetails.id})
                        </span>
                      </div>
                    </div>
                    <div className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black flex items-center gap-1 shrink-0">
                      <Check size={11} className="stroke-[3]" />
                      <span>{isRtl ? 'نشطة' : 'Active'}</span>
                    </div>
                  </div>

                  {/* Quick Search */}
                  <div className="relative mt-2">
                    <Search size={12} className="absolute start-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isRtl ? 'ابحث عن عملة أو بلد أو رمز...' : 'Search currency, country or code...'}
                      className="w-full py-1.5 ps-7 pe-2.5 text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute end-2 top-2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scrollable Currencies List */}
                <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-1.5 custom-scrollbar">
                  {filteredCurrencies.map((curr) => {
                    const isPinned = currentCurrency === curr.id;
                    return (
                      <button
                        key={curr.id}
                        type="button"
                        onClick={() => handlePinCurrency(curr.id)}
                        className={`w-full p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 text-start cursor-pointer group ${
                          isPinned
                            ? 'bg-amber-500/10 dark:bg-amber-950/25 border border-amber-500/30 shadow-2xs'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-transparent'
                        }`}
                      >
                        {/* Left side: Flag & Info */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl leading-none shrink-0 group-hover:scale-110 transition-transform">
                            {curr.flag}
                          </span>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {isRtl ? curr.labelAr : curr.labelEn}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                                {curr.id}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-450 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                              <span className="truncate">{isRtl ? curr.countryAr : curr.countryEn}</span>
                              <span>•</span>
                              <span className="font-mono">1 USD ≈ {curr.rateVsUsd} {isRtl ? curr.symbolAr : curr.symbolEn}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right side: Action / Pin Badge */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="text-xs font-black font-sans px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {isRtl ? curr.symbolAr : curr.symbolEn}
                          </div>

                          {isPinned ? (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-black shadow-xs">
                              <Pin size={9} className="rotate-45 fill-white" />
                              <span>{isRtl ? 'مثبتة' : 'Pinned'}</span>
                            </div>
                          ) : (
                            <div className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold">
                              <Pin size={9} />
                              <span>{isRtl ? 'تثبيت' : 'Pin'}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {filteredCurrencies.length === 0 && (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      {isRtl ? 'لا توجد عملة مطابقة للبحث' : 'No matching currencies found'}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Exchange Rates Modal */}
        {renderRatesModal()}
      </div>
    );
  }

  // Variant 3: Settings Panel Full View
  return (
    <div 
      className={`p-5 rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-50/30 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-[#1a1420] shadow-sm space-y-5 ${className}`} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Toast Feedback */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2"
          >
            <Check size={14} className="stroke-[3]" />
            <span>{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner: Currently Pinned Master Currency */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 text-2xl shadow-xs">
            {activeCurrencyDetails.flag}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {activeCurrencyDetails.labelAr} ({activeCurrencyDetails.id})
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                <Pin size={9} className="fill-white" />
                <span>{isRtl ? 'العملة المثبتة حالياً' : 'Pinned'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isRtl
                ? `الرمز: ${activeCurrencyDetails.symbolAr} • الدولة: ${activeCurrencyDetails.countryAr} • نسبة الصرف: 1 USD ≈ ${activeCurrencyDetails.rateVsUsd}`
                : `Symbol: ${activeCurrencyDetails.symbolEn} • Country: ${activeCurrencyDetails.countryEn} • Rate: 1 USD ≈ ${activeCurrencyDetails.rateVsUsd}`}
            </p>
          </div>
        </div>

        {/* Quick exchange rate adjustment button */}
        <button
          type="button"
          onClick={() => setIsRatesModalOpen(true)}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs transition"
        >
          <Settings2 size={13} className="text-amber-500" />
          <span>{isRtl ? 'ضبط أسعار الصرف التقريبية' : 'Adjust Rates'}</span>
        </button>
      </div>

      {/* Grid of ALL Supported Currencies to Pin Directly */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Globe size={14} className="text-amber-500" />
            <span>{isRtl ? 'اختر أي عملة لتثبيتها في شريط النظام وتطبيقها:' : 'Click any currency to pin it:'}</span>
          </span>
          <span className="text-[10.5px] text-slate-400 font-bold">
            {SUPPORTED_CURRENCIES.length} {isRtl ? 'عملة معتمدة' : 'Currencies'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {SUPPORTED_CURRENCIES.map((curr) => {
            const isPinned = currentCurrency === curr.id;
            return (
              <button
                key={curr.id}
                type="button"
                onClick={() => handlePinCurrency(curr.id)}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1 relative ${
                  isPinned
                    ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/30 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-amber-50/40 dark:hover:bg-slate-800'
                }`}
              >
                {/* Flag */}
                <span className="text-2xl leading-none">{curr.flag}</span>

                {/* Name */}
                <span className={`text-xs font-black text-center truncate w-full ${isPinned ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {isRtl ? curr.labelAr : curr.labelEn}
                </span>

                {/* Code & Symbol */}
                <span className="text-[10px] text-slate-450 font-bold font-mono">
                  {curr.id} ({isRtl ? curr.symbolAr : curr.symbolEn})
                </span>

                {isPinned && (
                  <span className="absolute top-1.5 end-1.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white p-0.5 shadow-xs">
                    <Pin size={8.5} className="fill-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Approximate Exchange Rates Quick Editor */}
      <div className="space-y-3 pt-3 border-t border-slate-150 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Coins size={14} className="text-amber-500" />
            <span>{isRtl ? 'أسعار الصرف التقريبية المحفوظة محلياً (العراق والأردن)' : 'Locally Saved Approximate Rates (IQD & JOD)'}</span>
          </span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
            1 JOD ≈ {crossRateJodToIqd} IQD
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Rate 1: IQD vs SAR */}
          <div className="p-2.5 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
              {isRtl ? '1 ر.س مقابل دينار عراقي (IQD):' : '1 SAR to IQD:'}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.01"
                value={ratesForm.iqdVsSar}
                onChange={(e) => setRatesForm({ ...ratesForm, iqdVsSar: parseFloat(e.target.value) || 0 })}
                className="w-full py-1 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 font-bold shrink-0">د.ع</span>
            </div>
          </div>

          {/* Rate 2: JOD vs SAR */}
          <div className="p-2.5 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
              {isRtl ? '1 ر.س مقابل دينار أردني (JOD):' : '1 SAR to JOD:'}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.001"
                value={ratesForm.jodVsSar}
                onChange={(e) => setRatesForm({ ...ratesForm, jodVsSar: parseFloat(e.target.value) || 0 })}
                className="w-full py-1 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 font-bold shrink-0">د.أ</span>
            </div>
          </div>

          {/* Rate 3: IQD vs USD */}
          <div className="p-2.5 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
              {isRtl ? '1 دولار مقابل دينار عراقي (IQD):' : '1 USD to IQD:'}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="1"
                value={ratesForm.iqdVsUsd}
                onChange={(e) => setRatesForm({ ...ratesForm, iqdVsUsd: parseFloat(e.target.value) || 0 })}
                className="w-full py-1 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 font-bold shrink-0">د.ع</span>
            </div>
          </div>

          {/* Rate 4: JOD vs USD */}
          <div className="p-2.5 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
              {isRtl ? '1 دولار مقابل دينار أردني (JOD):' : '1 USD to JOD:'}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.001"
                value={ratesForm.jodVsUsd}
                onChange={(e) => setRatesForm({ ...ratesForm, jodVsUsd: parseFloat(e.target.value) || 0 })}
                className="w-full py-1 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 font-bold shrink-0">د.أ</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleResetRates}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center gap-1 cursor-pointer transition"
          >
            <RotateCcw size={12} />
            <span>{isRtl ? 'استعادة الافتراضي' : 'Reset'}</span>
          </button>
          <button
            type="button"
            onClick={handleSaveRates}
            className="px-4 py-1.5 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer transition"
          >
            {isRtl ? 'حفظ أسعار الصرف' : 'Save Rates'}
          </button>
        </div>
      </div>

      {/* Render Modal if opened */}
      {renderRatesModal()}
    </div>
  );
}
