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
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-auto max-h-[92vh] flex flex-col text-right"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {/* Header Bar with Action Buttons */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                title={isAr ? 'إغلاق' : 'Close'}
              >
                <X size={16} />
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title={isAr ? 'نسخ رابط المقال' : 'Share article link'}
              >
                <Share2 size={13} />
                <span className="hidden sm:inline">{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'مشاركة' : 'Share')}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">
                {isAr ? 'دراسة حالة وتجربة شريك معتمد' : 'Verified Enterprise Partner Case Study'}
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto flex-1 p-5 sm:p-7 space-y-6">
            
            {/* Hero Banner with Vehicle Fleet Photo */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
              <div className="h-52 sm:h-64 w-full overflow-hidden bg-slate-900 relative">
                <img
                  src={partner.image}
                  alt={companyName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              </div>

              {/* Top Floating Badges on Banner */}
              <div className="absolute top-3 right-3 left-3 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
                    <CheckCircle2 size={12} />
                    <span>{isAr ? 'شريك استراتيجي معتمد' : 'Verified Strategic Partner'}</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900/80 text-purple-200 border border-purple-400/30 backdrop-blur-md">
                    {partner.activeVehicles} {isAr ? 'آلية نشطة' : 'Active Assets'}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md text-amber-400 px-2.5 py-1 rounded-full text-xs font-black border border-amber-400/30">
                  <Star size={12} fill="currentColor" />
                  <span>{partner.rating}</span>
                </div>
              </div>

              {/* Bottom Partner Info on Banner */}
              <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between gap-4 text-white">
                <div className="flex items-center gap-3">
                  <div className={`w-13 h-13 rounded-2xl font-black flex items-center justify-center text-sm shadow-lg border-2 border-white/40 backdrop-blur-md ${partner.colorClass || 'bg-purple-600 text-white'}`}>
                    {partner.logoSeed}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-sm">
                      {companyName}
                    </h3>
                    <p className="text-xs text-slate-200 font-medium drop-shadow-xs">
                      {industry} • {isAr ? `شريك المنصة منذ ${partner.yearJoint}` : `Partner Since ${partner.yearJoint}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Impact Metrics Grid */}
            {partner.metrics && partner.metrics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {partner.metrics.map((m, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 bg-gradient-to-b from-purple-50/60 to-white border border-purple-100/80 rounded-2xl text-center space-y-1 shadow-2xs"
                  >
                    <span className="text-lg sm:text-xl font-black text-purple-700 font-mono tracking-tight block">
                      {m.value}
                    </span>
                    <span className="text-[10px] sm:text-[10.5px] font-bold text-slate-600 block leading-tight">
                      {isAr ? m.labelAr : m.labelEn}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Article Title & Summary Box */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full w-fit">
                <Sparkles size={13} className="text-amber-500" />
                <span>{isAr ? 'مقال ودراسة الحالة التشغيلية' : 'Case Study & Operational Article'}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {title}
              </h2>

              {summary && (
                <div className="p-4 bg-slate-50 border-r-4 border-purple-600 rounded-xl text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">
                  {summary}
                </div>
              )}
            </div>

            {/* Executive Quote Card (if exists) */}
            {partner.quote && (
              <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl text-white space-y-3 shadow-md relative overflow-hidden">
                <div className="absolute top-2 left-3 opacity-10 text-white">
                  <Quote size={64} />
                </div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-black">
                  <Quote size={14} className="rotate-180" />
                  <span>{isAr ? 'تصريح قيادة العمليات اللوجستية' : 'Operations Leadership Testimonial'}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 italic leading-relaxed font-normal relative z-10">
                  "{isAr ? partner.quote.textAr : partner.quote.textEn}"
                </p>
                <div className="border-t border-slate-800 pt-2.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-white">
                    {isAr ? partner.quote.authorAr : partner.quote.authorEn}
                  </span>
                  <span className="text-purple-300 text-[11px]">
                    {isAr ? partner.quote.roleAr : partner.quote.roleEn}
                  </span>
                </div>
              </div>
            )}

            {/* Full Formatted Article Content */}
            <div className="space-y-4 pt-2 border-t border-slate-150">
              {renderFormattedContent(content)}
            </div>

            {/* Bottom Call to Action Card */}
            <div className="p-5 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-blue-50 border border-purple-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-right">
                <h4 className="text-sm font-black text-slate-900">
                  {isAr ? 'هل ترغب في تحقيق نفس النتائج لأسطولك؟' : 'Ready to achieve matching results for your fleet?'}
                </h4>
                <p className="text-xs text-slate-600">
                  {isAr 
                    ? 'ابدأ تجربة مجانية كاملة الميزات أو اطلب استشارة هندسية مخصصة لحجم أسطولك.' 
                    : 'Start your full-featured trial or request tailored engineering consultation for your fleet size.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
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
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>{isAr ? 'ابدأ تجربة مجانية الآن' : 'Start Free Trial'}</span>
                  {isAr ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                </button>
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono text-[11px]">
              ID: #{partner.id} • FleetAurvexis Case Studies
            </span>
            <button
              type="button"
              onClick={handlePrint}
              className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer size={13} />
              <span>{isAr ? 'طباعة التقرير' : 'Print Report'}</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EnterprisePartnerModal;
