import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Share2,
  Mail,
  Copy,
  Check,
  Smartphone,
  X,
  MessageCircle,
  Send,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export interface ShareArticleData {
  title: string;
  summary?: string;
  content?: string;
  category?: string;
  url?: string;
  author?: string;
}

interface ArticleShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: ShareArticleData | null;
  language?: string;
}

export const ArticleShareModal: React.FC<ArticleShareModalProps> = ({
  isOpen,
  onClose,
  article,
  language = 'ar'
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [nativeShareStatus, setNativeShareStatus] = useState<string>('');
  const isRtl = language === 'ar';

  if (!isOpen || !article) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : origin;
  const shareUrl = article.url || currentUrl;

  const cleanTitle = article.title;
  const cleanSummary = article.summary || '';
  
  // Clean formatted share messages
  const fullShareText = `${cleanTitle}\n\n${cleanSummary}\n\nمنصة FleetAurvexis لإدارة صيانة المركبات والمعدات الثقيلة\n${shareUrl}`;
  const shortShareText = `${cleanTitle} - منصة FleetAurvexis\n${shareUrl}`;

  // Native Web Share API trigger
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: cleanTitle,
          text: fullShareText,
          url: shareUrl
        });
        setNativeShareStatus(isRtl ? 'تم فتح المشاركة بنجاح' : 'Shared successfully');
        setTimeout(() => setNativeShareStatus(''), 3000);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('Native share failed or restricted in iframe:', err);
          setNativeShareStatus(isRtl ? 'المشاركة غير متاحة داخل هذا الإطار، اختر أحد التطبيقات أدناه' : 'Native share restricted, select an app below');
          setTimeout(() => setNativeShareStatus(''), 4000);
        }
      }
    } else {
      setNativeShareStatus(isRtl ? 'المشاركة المباشرة غير مدعومة في هذا المتصفح، اختر أحد التطبيقات أدناه' : 'Select an app below');
      setTimeout(() => setNativeShareStatus(''), 4000);
    }
  };

  const handleCopyLinkAndText = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullShareText);
      } else {
        const ta = document.createElement('textarea');
        ta.value = fullShareText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Pre-configured app targets
  const shareApps = [
    {
      id: 'whatsapp',
      nameAr: 'واتساب',
      nameEn: 'WhatsApp',
      color: 'bg-[#25D366] hover:bg-[#20bd5a]',
      icon: (
        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.073-.501-1.614-.672-2.651-2.316-2.73-2.42-.079-.105-.658-.875-.658-1.666 0-.791.413-1.18.558-1.341.144-.162.314-.202.419-.202.106 0 .211.002.304.007.098.006.23-.037.36.275.133.32.456 1.112.496 1.193.04.081.066.176.012.282-.054.106-.081.172-.162.268-.081.096-.17.214-.243.287-.081.081-.166.17-.071.333.095.163.423.698.908 1.13.626.557 1.155.73 1.318.811.163.081.258.07.354-.04.096-.111.413-.482.523-.647.11-.165.22-.138.371-.083.151.055.955.451 1.12.533.165.083.275.124.316.193.041.07.041.404-.103.809z"/>
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.83.5 3.54 1.36 5.01L2 22l5.17-1.33C8.6 21.51 10.25 22 12 22c5.52 0 10-4.48 10-10S17.52 2-12 2zm0 18.2c-1.61 0-3.11-.47-4.4-1.28l-.31-.19-3.26.85.87-3.18-.21-.33C3.82 14.8 3.33 13.44 3.33 12c0-4.78 3.89-8.67 8.67-8.67s8.67 3.89 8.67 8.67-3.89 8.67-8.67 8.67z"/>
        </svg>
      ),
      action: () => {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    {
      id: 'whatsapp_business',
      nameAr: 'واتساب للأعمال',
      nameEn: 'WA Business',
      color: 'bg-[#128C7E] hover:bg-[#0e7064]',
      icon: (
        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm.1 9.5c-2.4 0-4.3-1.9-4.3-4.3s1.9-4.3 4.3-4.3 4.3 1.9 4.3 4.3-1.9 4.3-4.3 4.3z"/>
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.83.5 3.54 1.36 5.01L2 22l5.17-1.33C8.6 21.51 10.25 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
        </svg>
      ),
      action: () => {
        const url = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    {
      id: 'telegram',
      nameAr: 'تليجرام',
      nameEn: 'Telegram',
      color: 'bg-[#229ED9] hover:bg-[#1d87b9]',
      icon: (
        <Send className="w-6 h-6 text-white transform -rotate-12" />
      ),
      action: () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(cleanTitle)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    {
      id: 'messenger',
      nameAr: 'الدردشات / ماسنجر',
      nameEn: 'Messenger',
      color: 'bg-[#0084FF] hover:bg-[#0070d6]',
      icon: (
        <MessageCircle className="w-6 h-6 text-white" />
      ),
      action: () => {
        const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    {
      id: 'facebook',
      nameAr: 'فيسبوك',
      nameEn: 'Facebook',
      color: 'bg-[#1877F2] hover:bg-[#166fe5]',
      icon: (
        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shortShareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    {
      id: 'twitter',
      nameAr: 'منصة إكس (تويتر)',
      nameEn: 'X (Twitter)',
      color: 'bg-black hover:bg-slate-800',
      icon: (
        <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortShareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    {
      id: 'gmail',
      nameAr: 'البريد / Gmail',
      nameEn: 'Email / Gmail',
      color: 'bg-[#EA4335] hover:bg-[#d33828]',
      icon: (
        <Mail className="w-6 h-6 text-white" />
      ),
      action: () => {
        const url = `mailto:?subject=${encodeURIComponent(cleanTitle)}&body=${encodeURIComponent(fullShareText)}`;
        window.location.href = url;
      }
    },
    {
      id: 'system_share',
      nameAr: 'مشاركة نظام الموبايل',
      nameEn: 'System Chooser',
      color: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700',
      icon: (
        <Smartphone className="w-6 h-6 text-white" />
      ),
      action: handleNativeShare
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-right overflow-hidden relative"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Share2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-none">
                  {isRtl ? 'مشاركة المقال عبر التطبيقات' : 'Share Article via Apps'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isRtl ? 'اختر التطبيق المراد الإرسال عبره مباشرة' : 'Choose app to share article instantly'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Article Mini Preview */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 mb-4 text-right">
            <span className="text-[10px] font-bold text-purple-600 block mb-0.5">
              {article.category || (isRtl ? 'مقال صيانة وأساطيل' : 'Article')}
            </span>
            <h4 className="text-xs font-black text-slate-800 line-clamp-2 leading-relaxed">
              {article.title}
            </h4>
          </div>

          {/* Status banner if system share is restricted */}
          {nativeShareStatus && (
            <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 flex items-center gap-2">
              <Smartphone size={14} className="shrink-0 text-amber-600" />
              <span>{nativeShareStatus}</span>
            </div>
          )}

          {/* Apps Grid (like phone native share drawer) */}
          <div className="grid grid-cols-4 gap-3 py-2">
            {shareApps.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={app.action}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-50 transition active:scale-95 cursor-pointer group"
              >
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${app.color}`}
                >
                  {app.icon}
                </div>
                <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                  {isRtl ? app.nameAr : app.nameEn}
                </span>
              </button>
            ))}
          </div>

          {/* Copy Link Row */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLinkAndText}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span className="text-emerald-700">{isRtl ? 'تم النسخ للحافظة!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span>{isRtl ? 'نسخ رابط المقال والملخص' : 'Copy link and summary'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              title={isRtl ? 'فتح قائمة مشاركة الهاتف' : 'Open system share dialog'}
            >
              <Smartphone size={15} />
              <span>{isRtl ? 'نظام الهاتف' : 'Device'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
