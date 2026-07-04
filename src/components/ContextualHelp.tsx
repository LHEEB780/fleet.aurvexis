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
        className="inline-flex items-center gap-1.5 px-2.5 py-1 h-[26px] rounded-full bg-violet-100/80 dark:bg-violet-950/40 hover:bg-violet-200/90 dark:hover:bg-violet-900/60 border border-violet-300/60 dark:border-violet-700/60 text-violet-850 dark:text-violet-200 leading-none transition-all cursor-pointer relative group shrink-0 outline-none focus:outline-none select-none text-[11px] font-bold tracking-normal normal-case align-middle"
        title={isRtl ? "دليل تشغيل الميزة" : "Feature Operational Guide"}
      >
        {/* Pulsing visual cue dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-650 dark:bg-violet-400"></span>
        </span>
        
        <HelpCircle size={13} className="transition-transform group-hover:scale-110 shrink-0 text-violet-700 dark:text-violet-300" />
        
        <span className="leading-none whitespace-nowrap">
          {isRtl ? "دليل سريع" : "Quick Guide"}
        </span>
      </button>

      {/* Popover Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`absolute z-[80] top-7 ${isRtl ? 'right-0' : 'left-0'} w-72 sm:w-80 bg-white dark:bg-[#0f1422] border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl p-4.5 text-right font-sans`}
            style={{ direction: isRtl ? 'rtl' : 'ltr' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-550/10 text-violet-600 dark:text-violet-400 bg-violet-500/10">
                  <Compass size={14} className="animate-pulse" />
                </div>
                <h4 className="text-xs font-black text-slate-905 dark:text-white leading-none">
                  {isRtl ? titleAr : titleEn}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer border-none outline-none"
              >
                <X size={12} />
              </button>
            </div>

            {/* Explanation */}
            <div className="space-y-3">
              <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                {isRtl ? explanationAr : explanationEn}
              </p>

              {/* Benefits */}
              <div className="space-y-1.5">
                <span className="text-[9.5px] uppercase font-black text-violet-550 dark:text-violet-450 tracking-wider block">
                  {isRtl ? 'الفوائد والامتيازات التشغيلية:' : 'Key Operational Benefits:'}
                </span>
                <ul className="space-y-1">
                  {(isRtl ? benefitsAr : benefitsEn).map((benefit, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-1.5 text-[10px] text-slate-700 dark:text-slate-300 font-semibold leading-normal">
                      <CheckCircle2 size={11} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actionable Tips (Optional) */}
              {(isRtl ? tipsAr : tipsEn).length > 0 && (
                <div className="mt-2.5 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-1 text-[9px] font-black text-violet-650 dark:text-violet-400 mb-1">
                    <Sparkles size={10} className="animate-spin-slow text-violet-500" />
                    <span>{isRtl ? 'تلميحة ميكانيكية ذكية:' : 'Pro Mechanical Tip:'}</span>
                  </div>
                  <ul className="space-y-1">
                    {(isRtl ? tipsAr : tipsEn).map((tip, tIdx) => (
                      <li key={tIdx} className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Close button inside popover */}
            <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white font-bold text-[9px] rounded-lg transition-all cursor-pointer shadow-sm shadow-violet-500/10"
              >
                {isRtl ? 'فهمت ذلك' : 'Got it'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
