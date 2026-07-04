import React from 'react';
import { useLanguage } from '../services/LanguageContext';
import { Check } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800 shadow-xs shrink-0 select-none">
      <button
        onClick={() => setLanguage('ar')}
        className={`px-3 py-1.5 text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none ${
          language === 'ar'
            ? 'bg-white dark:bg-slate-800 text-brand-blue-600 dark:text-white border border-slate-200/50 dark:border-slate-700/40 shadow-xs'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200'
        }`}
      >
        <span className="text-sm">🇸🇦</span>
        <span>العربية</span>
        {language === 'ar' && <Check size={11} strokeWidth={3.5} />}
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none ${
          language === 'en'
            ? 'bg-white dark:bg-slate-800 text-brand-blue-600 dark:text-white border border-slate-200/50 dark:border-slate-700/40 shadow-xs'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200'
        }`}
      >
        <span className="text-sm">🇺🇸</span>
        <span>English</span>
        {language === 'en' && <Check size={11} strokeWidth={3.5} />}
      </button>
    </div>
  );
}
