import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, CheckCircle2, Sparkles, X, ChevronRight, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContextualHelpProps {
  id: string;
  titleAr: string;
  titleEn: string;
  explanationAr: string;
  explanationEn: string;
  benefitsAr: string[];
  benefitsEn: string[];
  tipsAr?: string[];
  tipsEn?: string[];
  language: 'ar' | 'en';
}

export default function ContextualHelp({
  id,
  titleAr,
  titleEn,
  explanationAr,
  explanationEn,
  benefitsAr,
  benefitsEn,
  tipsAr = [],
  tipsEn = [],
  language
}: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRtl = language === 'ar';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center" ref={containerRef} id={`help-${id}`}>
      {/* Pulsing Guide Trigger Pill Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 h-[26px] rounded-full bg-brand-blue-100/80 dark:bg-brand-blue-950/40 hover:bg-brand-blue-200/90 dark:hover:bg-brand-blue-900/60 border border-brand-blue-300/60 dark:border-brand-blue-700/60 text-brand-blue-800 dark:text-brand-blue-200 leading-none transition-all cursor-pointer relative group shrink-0 outline-none focus:outline-none select-none text-[11px] font-bold tracking-normal normal-case align-middle"
        title={isRtl ? "دليل تشغيل الميزة" : "Feature Operational Guide"}
      >
        {/* Pulsing visual cue dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue-600 dark:bg-brand-blue-400"></span>
        </span>
        
        <HelpCircle size={13} className="transition-transform group-hover:scale-110 shrink-0 text-brand-blue-700 dark:text-brand-blue-300" />
        
        <span className="leading-none whitespace-nowrap">
          {isRtl ? "دليل سريع" : "Quick Guide"}
        </span>
      </button>

      {/* Popover Content (Rendered as Fixed Centered Modal to prevent clipping by parent overflow-hidden) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[9998] bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="pointer-events-auto w-full max-w-md bg-white dark:bg-[#0f1422] border border-slate-150 dark:border-slate-800 rounded-3xl shadow-2xl p-6 text-right font-sans overflow-hidden"
                style={{ direction: isRtl ? 'rtl' : 'ltr' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-brand-blue-500/10 text-brand-blue-600 dark:text-brand-blue-400">
                      <Compass size={18} className="animate-pulse" />
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-none">
                      {isRtl ? titleAr : titleEn}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border-none outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Explanation */}
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                    {isRtl ? explanationAr : explanationEn}
                  </p>

                  {/* Benefits */}
                  <div className="space-y-2">
                    <span className="text-[10px] sm:text-xs uppercase font-black text-brand-blue-600 dark:text-brand-blue-400 tracking-wider block">
                      {isRtl ? 'الفوائد والامتيازات التشغيلية:' : 'Key Operational Benefits:'}
                    </span>
                    <ul className="space-y-2">
                      {(isRtl ? benefitsAr : benefitsEn).map((benefit, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200 font-semibold leading-normal">
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actionable Tips (Optional) */}
                  {(isRtl ? tipsAr : tipsEn).length > 0 && (
                    <div className="mt-3.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center gap-1.5 text-xs font-black text-brand-blue-650 dark:text-brand-blue-400 mb-1.5">
                        <Sparkles size={12} className="animate-spin-slow text-brand-blue-500" />
                        <span>{isRtl ? 'تلميحة ميكانيكية ذكية:' : 'Pro Mechanical Tip:'}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {(isRtl ? tipsAr : tipsEn).map((tip, tIdx) => (
                          <li key={tIdx} className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                            • {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Close button inside popover */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-1.5 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-brand-blue-500/10"
                  >
                    {isRtl ? 'فهمت ذلك' : 'Got it'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
