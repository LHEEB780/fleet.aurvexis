import React, { useState, useEffect } from 'react';
import { Shield, Settings, Check, X, ChevronRight, Lock } from 'lucide-react';
import { CookiePreferences, CookieAdminSettings } from '../../types/legal';
import { getStoredCookieAdminSettings } from '../../data/legalDocumentsData';

const COOKIE_CONSENT_KEY = 'fleet_cookie_consent_v1';

interface CookieConsentBannerProps {
  onOpenPrivacyPolicy?: () => void;
  onOpenCookiePolicy?: () => void;
  brandPrimaryColor?: string;
  isDark?: boolean;
}

export function CookieConsentBanner({
  onOpenPrivacyPolicy,
  onOpenCookiePolicy,
  brandPrimaryColor = '#6366f1',
  isDark = false
}: CookieConsentBannerProps) {
  const [adminSettings, setAdminSettings] = useState<CookieAdminSettings>(() => getStoredCookieAdminSettings());
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    functional: true,
    marketing: false,
    consentedAt: '',
    version: '1.0'
  });

  useEffect(() => {
    const handleSettingsUpdated = (e: any) => {
      if (e.detail) {
        setAdminSettings(e.detail);
      } else {
        setAdminSettings(getStoredCookieAdminSettings());
      }
    };
    window.addEventListener('fleet_cookie_settings_updated', handleSettingsUpdated);
    return () => window.removeEventListener('fleet_cookie_settings_updated', handleSettingsUpdated);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!saved) {
        // Delay 1 second for smooth entrance
        const timer = setTimeout(() => setShowBanner(true), 800);
        return () => clearTimeout(timer);
      } else {
        setPreferences(JSON.parse(saved));
      }
    } catch (e) {
      setShowBanner(true);
    }
  }, []);

  // Listen for custom trigger to open preferences from footer
  useEffect(() => {
    const handleOpenPreferences = () => {
      setShowPreferencesModal(true);
    };
    window.addEventListener('open_cookie_preferences', handleOpenPreferences);
    return () => window.removeEventListener('open_cookie_preferences', handleOpenPreferences);
  }, []);

  const handleAcceptAll = () => {
    const updated: CookiePreferences = {
      essential: true,
      analytics: true,
      functional: true,
      marketing: true,
      consentedAt: new Date().toISOString(),
      version: '1.0'
    };
    setPreferences(updated);
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(updated));
    setShowBanner(false);
    setShowPreferencesModal(false);
  };

  const handleRejectNonEssential = () => {
    const updated: CookiePreferences = {
      essential: true,
      analytics: false,
      functional: false,
      marketing: false,
      consentedAt: new Date().toISOString(),
      version: '1.0'
    };
    setPreferences(updated);
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(updated));
    setShowBanner(false);
    setShowPreferencesModal(false);
  };

  const handleSavePreferences = () => {
    const updated: CookiePreferences = {
      ...preferences,
      essential: true,
      consentedAt: new Date().toISOString()
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(updated));
    setShowBanner(false);
    setShowPreferencesModal(false);
  };

  if (!showBanner && !showPreferencesModal) return null;

  return (
    <>
      {/* Floating Bottom Cookie Banner */}
      {showBanner && !showPreferencesModal && (
        <div
          id="cookie-consent-banner"
          className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 lg:max-w-4xl lg:mx-auto z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="bg-slate-900/95 backdrop-blur-md text-slate-100 p-5 md:p-6 rounded-2xl shadow-2xl border border-slate-700/80">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 flex-1">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                  <Shield size={22} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm md:text-base flex items-center gap-2">
                    <span>{adminSettings.bannerTitleAr || 'إشعار ملفات تعريف الارتباط والخصوصية'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal border border-slate-700">
                      PDPL & GDPR
                    </span>
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
                    {adminSettings.bannerMessageAr || 'نستخدم ملفات تعريف الارتباط والتقنيات المشابهة لتحسين أمان المنصة، والمصادقة، وحفظ التفضيلات التشغيلية للأسطول.'}{' '}
                    يمكنك قبول الكل، أو تخصيص ما يناسبك، أو مراجعة{' '}
                    <button
                      type="button"
                      onClick={onOpenPrivacyPolicy}
                      className="text-purple-400 underline hover:text-purple-300 font-medium"
                    >
                      سياسة الخصوصية
                    </button>{' '}
                    و{' '}
                    <button
                      type="button"
                      onClick={onOpenCookiePolicy}
                      className="text-purple-400 underline hover:text-purple-300 font-medium"
                    >
                      سياسة الكوكيز
                    </button>.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                <button
                  type="button"
                  id="cookie-btn-preferences"
                  onClick={() => setShowPreferencesModal(true)}
                  className="px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition border border-slate-700 flex items-center gap-1.5"
                >
                  <Settings size={14} />
                  <span>تخصيص الخيارات</span>
                </button>
                <button
                  type="button"
                  id="cookie-btn-reject"
                  onClick={handleRejectNonEssential}
                  className="px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition border border-slate-700"
                >
                  الضرورية فقط
                </button>
                <button
                  type="button"
                  id="cookie-btn-accept-all"
                  onClick={handleAcceptAll}
                  style={{ backgroundColor: brandPrimaryColor }}
                  className="px-4 py-2 rounded-xl text-xs md:text-sm font-bold text-white shadow-lg shadow-purple-900/30 hover:brightness-110 transition flex items-center gap-1.5"
                >
                  <Check size={15} />
                  <span>قبول الكل</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferencesModal && (
        <div
          id="cookie-preferences-modal"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          dir="rtl"
        >
          <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">مركز تفضيلات ملفات تعريف الارتباط</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">تحكم بالبيانات والتقنيات التي تسمح للمنصة باستخدامها</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferencesModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cookie Categories */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Essential */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Lock size={15} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">ملفات تعريف الارتباط الأساسية (Strictly Necessary)</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    مفعّلة دوماً
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  ضرورية لتمكين المصادقة الآمنة، وجلسات العمل المشفرة، والتحقق بخطوتين، ومنع هجمات CSRF. لا يمكن تعطيلها.
                </p>
              </div>

              {/* Functional */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">التفضيلات والوظائف التشغيلية (Functional)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  تتيح للموقع تذكر لغتك المختارة، والوضع الليلي/النهاري، وألوان العلامة التجارية، وحفظ مسودات العمل دون اتصال.
                </p>
              </div>

              {/* Analytics */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">الأداء والتحليلات (Performance & Analytics)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  تساعدنا في قياس سرعة تحميل الشاشات، وفهم تفاعل المشتركين مع ميزات الصيانة الوقائية، لتسريع وتطوير النظام.
                </p>
              </div>

              {/* Marketing */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">المحتوى الترويجي والتحديثات (Marketing)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  تساعد في تقديم تحديثات ومقالات متخصصة حول صيانة الأساطيل ومزايا الساس المناسبة لطبيعة أعمال منشأتك.
                </p>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                رفض غير الضرورية
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600 transition"
                >
                  حفظ التفضيلات
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  style={{ backgroundColor: brandPrimaryColor }}
                  className="px-4 py-2 rounded-xl text-xs md:text-sm font-bold text-white shadow hover:brightness-110 transition"
                >
                  قبول الكل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Icon helper
function Sliders(props: any) {
  return <Settings {...props} />;
}
