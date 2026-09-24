import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, CheckCircle2, Star, TrendingUp, ShieldCheck, Clock, Truck, 
  Building2, Calendar, Share2, Printer, ArrowRight, ArrowLeft,
  Quote, Sparkles, Award, ExternalLink
} from 'lucide-react';
import { EnterprisePartner } from '../data/enterprisePartnersData';

interface EnterprisePartnerModalProps {
  partner: EnterprisePartner | null;
  onClose: () => void;
  language: string;
  onBookDemo?: () => void;
}

export const EnterprisePartnerModal: React.FC<EnterprisePartnerModalProps> = ({
  partner,
  onClose,
  language,
  onBookDemo
}) => {
  const isAr = language === 'ar';
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (partner) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [partner, onClose]);

  if (!partner) return null;

  const title = isAr ? partner.articleTitleAr : partner.articleTitleEn;
  const summary = isAr ? partner.articleSummaryAr : partner.articleSummaryEn;
  const content = isAr ? partner.articleContentAr : partner.articleContentEn;
  const companyName = isAr ? partner.nameAr : partner.nameEn;
  const industry = isAr ? partner.industryAr : partner.industryEn;

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/#partner-${partner.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Simple clean markdown-like paragraph & section renderer
  const renderFormattedContent = (rawText: string) => {
    if (!rawText) return null;

    const sections = rawText.split('\n\n');
    return sections.map((sec, idx) => {
      const trimmed = sec.trim();
      if (!trimmed) return null;

      // H3 Section Heading
      if (trimmed.startsWith('### ')) {
        const headingText = trimmed.replace('### ', '');
        return (
          <div key={idx} className="pt-4 pb-1 border-b border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
            <h4 className="text-base font-black text-slate-900 tracking-tight">
              {headingText}
            </h4>
          </div>
        );
      }

      // Bullet List
      if (trimmed.includes('\n- ') || trimmed.startsWith('- ') || trimmed.includes('\n1. ') || trimmed.startsWith('1. ')) {
        const lines = trimmed.split('\n');
        return (
          <ul key={idx} className="space-y-2 py-1">
            {lines.map((line, lIdx) => {
              const cleanLine = line.replace(/^-\s*/, '').replace(/^\d+\.\s*/, '');
              // Check for bold prefixes like **تراكم الفحوصات**:
              const parts = cleanLine.split('**');
              if (parts.length >= 3) {
                return (
                  <li key={lIdx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span>
                      <strong className="text-slate-900 font-black">{parts[1]}</strong>
                      {parts.slice(2).join('**')}
                    </span>
                  </li>
                );
              }
              return (
                <li key={lIdx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{cleanLine}</span>
                </li>
              );
            })}
          </ul>
        );
      }

      // Regular Paragraph
      return (
        <p key={idx} className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-purple-100 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative my-auto max-h-[82vh] flex flex-col text-right"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {/* Header Bar with Action Buttons */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                title={isAr ? 'إغلاق' : 'Close'}
              >
                <X size={15} />
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title={isAr ? 'نسخ رابط المقال' : 'Share article link'}
              >
                <Share2 size={12} />
                <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'مشاركة' : 'Share')}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10.5px] font-bold text-slate-500">
                {isAr ? 'قصة نجاح وشراكة معتمدة' : 'Verified Partner Case'}
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4 text-start" dir={isAr ? 'rtl' : 'ltr'}>
            
            {/* Hero Banner with Vehicle Fleet Photo (Compact & Elegant) */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
              <div className="h-36 sm:h-40 w-full overflow-hidden bg-slate-900 relative">
                <img
                  src={partner.image}
                  alt={companyName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
              </div>

              {/* Top Floating Badges on Banner */}
              <div className="absolute top-2.5 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/90 text-white backdrop-blur-md shadow-xs">
                  <CheckCircle2 size={11} />
                  <span>{isAr ? 'شريك معتمد' : 'Verified Partner'}</span>
                </span>

                <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-black border border-amber-400/30">
                  <Star size={10} fill="currentColor" />
                  <span>{partner.rating}</span>
                </div>
              </div>

              {/* Bottom Partner Info on Banner */}
              <div className="absolute bottom-3 inset-x-3 flex items-end justify-between gap-3 text-white">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl font-black flex items-center justify-center text-xs shadow-md border border-white/40 backdrop-blur-md shrink-0 ${partner.colorClass || 'bg-purple-600 text-white'}`}>
                    {partner.logoSeed}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm sm:text-base font-black text-white drop-shadow-sm line-clamp-1">
                      {companyName}
                    </h3>
                    <p className="text-[10px] text-slate-200 font-medium">
                      {industry} • {partner.activeVehicles} {isAr ? 'آلية' : 'Assets'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Impact Metrics Grid (Compact) */}
            {partner.metrics && partner.metrics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {partner.metrics.map((m, idx) => (
                  <div 
                    key={idx} 
                    className="p-2.5 bg-gradient-to-b from-purple-50/70 to-white border border-purple-100 rounded-xl text-center space-y-0.5 shadow-2xs"
                  >
                    <span className="text-base sm:text-lg font-black text-purple-700 font-mono tracking-tight block">
                      {m.value}
                    </span>
                    <span className="text-[9.5px] font-bold text-slate-600 block leading-tight">
                      {isAr ? m.labelAr : m.labelEn}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Article Title & Summary Box */}
            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                {title}
              </h2>

              {summary && (
                <div className="p-3 bg-purple-50/50 border-r-3 rtl:border-r-3 ltr:border-l-3 border-purple-600 rounded-xl text-slate-700 text-xs font-medium leading-relaxed">
                  {summary}
                </div>
              )}
            </div>

            {/* Executive Quote Card (if exists) */}
            {partner.quote && (
              <div className="p-3.5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white space-y-2 shadow-sm relative overflow-hidden">
                <Quote size={18} className="text-purple-400/40 absolute top-2.5 end-3" />
                <p className="text-xs text-slate-100 italic leading-relaxed pe-5">
                  "{isAr ? partner.quote.textAr : partner.quote.textEn}"
                </p>
                <div className="border-t border-slate-800/80 pt-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white">
                    {isAr ? partner.quote.authorAr : partner.quote.authorEn}
                  </span>
                  <span className="text-purple-300 text-[10px]">
                    {isAr ? partner.quote.roleAr : partner.quote.roleEn}
                  </span>
                </div>
              </div>
            )}

            {/* Full Formatted Article Content */}
            <div className="space-y-3 pt-1 border-t border-slate-100 text-xs">
              {renderFormattedContent(content)}
            </div>

            {/* Bottom Call to Action Card */}
            <div className="p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50/40 to-blue-50 border border-purple-200/70 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-center sm:text-start">
                <h4 className="text-xs font-black text-slate-900">
                  {isAr ? 'هل ترغب في نتائج مماثلة لأسطولك؟' : 'Want similar results for your fleet?'}
                </h4>
                <p className="text-[10.5px] text-slate-600">
                  {isAr 
                    ? 'ابدأ تجربة مجانية أو اطلب استشارة تشخيصية مخصصة.' 
                    : 'Start your free trial or book an engineering demo.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onBookDemo) onBookDemo();
                  else {
                    const ctaSection = document.getElementById('register') || document.getElementById('roi');
                    if (ctaSection) ctaSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>{isAr ? 'ابدأ تجربة مجانية' : 'Start Free Trial'}</span>
                {isAr ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
              </button>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-mono text-[10px]">
              ID: #{partner.id}
            </span>
            <button
              type="button"
              onClick={handlePrint}
              className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Printer size={12} />
              <span>{isAr ? 'طباعة التقرير' : 'Print Report'}</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EnterprisePartnerModal;
