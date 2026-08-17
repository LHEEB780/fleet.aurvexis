import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Volume2, VolumeX, Smartphone, AlertTriangle, 
  Calendar, CheckCircle2, ShieldAlert, Sparkles, X, 
  Check, Sliders, RefreshCw, Send, ShieldCheck, Zap
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { 
  getNotificationSettings, 
  saveNotificationSettings, 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendTestNotification, 
  playNotificationSound,
  BrowserNotificationSettings,
  isNotificationSupported
} from '../services/browserNotifications';

interface BrowserNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrowserNotificationModal: React.FC<BrowserNotificationModalProps> = ({ isOpen, onClose }) => {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [settings, setSettings] = useState<BrowserNotificationSettings>(getNotificationSettings);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(getNotificationPermission);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getNotificationSettings());
      setPermission(getNotificationPermission());
    }
  }, [isOpen]);

  const handleToggle = (key: keyof BrowserNotificationSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    const result = await requestNotificationPermission();
    setPermission(result.status);
    if (result.granted) {
      setSettings(prev => ({ ...prev, enabled: true }));
      saveNotificationSettings({ enabled: true });
    }
    setIsRequesting(false);
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    setTestSuccess(null);
    try {
      const ok = await sendTestNotification();
      setTestSuccess(ok);
    } catch (e) {
      setTestSuccess(false);
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestSuccess(null), 4000);
    }
  };

  const handlePlaySoundPreview = (type: 'alert' | 'urgent' | 'success') => {
    playNotificationSound(type);
  };

  if (!isOpen) return null;

  const supported = isNotificationSupported();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden my-6"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-blue-500/10 text-brand-blue-600 dark:text-brand-blue-400 flex items-center justify-center shrink-0">
                <Bell size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? 'إعدادات إشعارات المتصفح الفورية (Push)' : 'Browser Push Notifications Settings'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'ar' 
                    ? 'تنبيه الفنيين والإداريين فوراً بالبلاغات ومواعيد الصيانة' 
                    : 'Instant alerts for technicians & managers on new reports and schedules'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Permission Banner */}
            <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              permission === 'granted'
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                : permission === 'denied'
                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
                : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  permission === 'granted'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : permission === 'denied'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {permission === 'granted' ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {language === 'ar' ? 'حالة إذن المتصفح:' : 'Browser Permission Status:'}
                    </span>
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                      permission === 'granted'
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        : permission === 'denied'
                        ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                    }`}>
                      {permission === 'granted' 
                        ? (language === 'ar' ? 'مفعل ومسموح به ✓' : 'Granted ✓')
                        : permission === 'denied'
                        ? (language === 'ar' ? 'محظور في إعدادات المتصفح' : 'Blocked / Denied')
                        : (language === 'ar' ? 'يتطلب منح الإذن' : 'Permission Required')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {permission === 'granted'
                      ? (language === 'ar' ? 'سيتلقى المتصفح التنبيهات حتى عند تصغير النافذة أو استخدام تبويب آخر.' : 'You will receive desktop banners even when tab is minimized.')
                      : permission === 'denied'
                      ? (language === 'ar' ? 'يرجى فتح إعدادات الموقع بالمتصفح (رمز القفل بجانب الرابط) والسماح بالإشعارات.' : 'Please allow notifications in browser site settings.')
                      : (language === 'ar' ? 'اضغط على زر التفعيل لمنح الموقع صلاحية إرسال التنبيهات.' : 'Click activate to grant notification permissions.')}
                  </p>
                </div>
              </div>

              {permission !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  disabled={isRequesting}
                  className="w-full sm:w-auto px-4 py-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-xs font-black rounded-xl shadow-sm hover:shadow transition-all shrink-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Zap size={14} />
                  <span>{isRequesting ? (language === 'ar' ? 'جاري الطلب...' : 'Requesting...') : (language === 'ar' ? 'طلب الإذن الآن' : 'Enable Now')}</span>
                </button>
              )}
            </div>

            {/* Master Toggle & Quick Settings */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? 'تفعيل نظام الإشعارات الشامل' : 'Master Notifications Engine'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'ar' ? 'التحكم العام في تفعيل أو إيقاف كافة التنبيهات المباشرة' : 'Enable or pause all real-time push alerts'}
                </p>
              </div>

              <div 
                onClick={() => handleToggle('enabled')}
                className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${
                  settings.enabled ? 'bg-brand-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-xs ${
                  settings.enabled 
                    ? (isRtl ? 'right-6' : 'left-6') 
                    : (isRtl ? 'right-1' : 'left-1')
                }`} />
              </div>
            </div>

            {/* Sound & Vibration Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sound toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-850/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${settings.soundEnabled ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-slate-100 text-slate-400'}`}>
                    {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {language === 'ar' ? 'النغمة الصوتية الذكية' : 'Audio Chime'}
                    </h5>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <button
                        type="button"
                        onClick={() => handlePlaySoundPreview('alert')}
                        className="text-[10px] text-brand-blue-600 dark:text-brand-blue-400 hover:underline cursor-pointer"
                      >
                        {language === 'ar' ? 'تجربة النغمة' : 'Preview'}
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <button
                        type="button"
                        onClick={() => handlePlaySoundPreview('urgent')}
                        className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        {language === 'ar' ? 'نغمة الطوارئ' : 'Urgent tone'}
                      </button>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => handleToggle('soundEnabled')}
                  className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
                    settings.soundEnabled ? 'bg-brand-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-xs ${
                    settings.soundEnabled 
                      ? (isRtl ? 'right-5' : 'left-5') 
                      : (isRtl ? 'right-1' : 'left-1')
                  }`} />
                </div>
              </div>

              {/* Vibration toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-850/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${settings.vibrationEnabled ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 text-slate-400'}`}>
                    <Smartphone size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {language === 'ar' ? 'الاهتزاز للهواتف' : 'Mobile Vibration'}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      {language === 'ar' ? 'اهتزاز عند التنبيه بالأجهزة الذكية' : 'Haptic feedback on mobile'}
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => handleToggle('vibrationEnabled')}
                  className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
                    settings.vibrationEnabled ? 'bg-brand-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-xs ${
                    settings.vibrationEnabled 
                      ? (isRtl ? 'right-5' : 'left-5') 
                      : (isRtl ? 'right-1' : 'left-1')
                  }`} />
                </div>
              </div>
            </div>

            {/* Notification Triggers / Categories */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders size={14} className="text-brand-blue-600" />
                <span>{language === 'ar' ? 'أحداث وبلاغات الصيانة المراد التنبيه بها' : 'Alert Trigger Events'}</span>
              </h4>

              <div className="grid grid-cols-1 gap-2.5">
                {/* Trigger 1: New Maintenance Orders */}
                <div className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                      <Zap size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-850 dark:text-slate-150">
                        {language === 'ar' ? 'وصول بلاغ صيانة جديد أو أمر عمل ميداني' : 'New Maintenance Request or Work Order'}
                      </h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {language === 'ar' ? 'تنبيه فوري عند تسجيل السائقين أو المشرفين لبلاغ جديد' : 'Alert when drivers or supervisors log a new repair order'}
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleToggle('notifyNewMaintenance')}
                    className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
                      settings.notifyNewMaintenance ? 'bg-brand-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-xs ${
                      settings.notifyNewMaintenance 
                        ? (isRtl ? 'right-5' : 'left-5') 
                        : (isRtl ? 'right-1' : 'left-1')
                    }`} />
                  </div>
                </div>

                {/* Trigger 2: Periodic Maintenance 48h Due */}
                <div className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-850 dark:text-slate-150">
                        {language === 'ar' ? 'اقتراب موعد صيانة دورية وقائية (خلال ٤٨ ساعة)' : 'Upcoming Scheduled Maintenance (48h Warning)'}
                      </h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {language === 'ar' ? 'تذكير الفنيين والإداريين لتجهيز الورشة وقطع الغيار' : 'Remind technicians and managers to prepare bays & stock'}
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleToggle('notifyPeriodicDue')}
                    className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
                      settings.notifyPeriodicDue ? 'bg-brand-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-xs ${
                      settings.notifyPeriodicDue 
                        ? (isRtl ? 'right-5' : 'left-5') 
                        : (isRtl ? 'right-1' : 'left-1')
                    }`} />
                  </div>
                </div>

                {/* Trigger 3: Status Changed & Completed */}
                <div className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-850 dark:text-slate-150">
                        {language === 'ar' ? 'اكتمال الإصلاح أو تحديث مرحلة الإنجاز' : 'Job Completed or Progress Updates'}
                      </h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {language === 'ar' ? 'تحديث الفنيين بحالة انتقال المركبة من قيد العمل إلى جاهز للتسليم' : 'Notify when vehicles complete maintenance'}
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleToggle('notifyStatusChanged')}
                    className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
                      settings.notifyStatusChanged ? 'bg-brand-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-xs ${
                      settings.notifyStatusChanged 
                        ? (isRtl ? 'right-5' : 'left-5') 
                        : (isRtl ? 'right-1' : 'left-1')
                    }`} />
                  </div>
                </div>

                {/* Trigger 4: Urgent & Critical Emergencies */}
                <div className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-850 dark:text-slate-150">
                        {language === 'ar' ? 'نداءات وأعطال الطوارئ والتعطل المفاجئ' : 'Emergency & Critical Breakdown Alerts'}
                      </h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {language === 'ar' ? 'إشعار ذو أولوية قصوى مع نغمة تحذيرية للمركبات المتوقفة' : 'Highest priority sound & notification for downtime'}
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleToggle('notifyUrgentEmergency')}
                    className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
                      settings.notifyUrgentEmergency ? 'bg-brand-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-xs ${
                      settings.notifyUrgentEmergency 
                        ? (isRtl ? 'right-5' : 'left-5') 
                        : (isRtl ? 'right-1' : 'left-1')
                    }`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestNotification}
                disabled={isTesting}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send size={14} className={isTesting ? 'animate-spin' : ''} />
                <span>{language === 'ar' ? 'إرسال إشعار تجريبي للمتصفح' : 'Send Test Push Alert'}</span>
              </button>

              {testSuccess === true && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check size={14} />
                  {language === 'ar' ? 'تم إرسال الإشعار بنجاح!' : 'Test alert sent!'}
                </span>
              )}
              {testSuccess === false && (
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <X size={14} />
                  {language === 'ar' ? 'يرجى السماح بالإشعارات أولاً' : 'Permission needed'}
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-xs font-black rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {language === 'ar' ? 'حفظ وإغلاق' : 'Save & Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
