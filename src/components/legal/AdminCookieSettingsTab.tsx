import React, { useState } from 'react';
import { Shield, Lock, Sliders, CheckCircle2, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { CookieAdminSettings } from '../../types/legal';

interface AdminCookieSettingsTabProps {
  cookieSettings: CookieAdminSettings;
  onSaveCookieSettings: (settings: CookieAdminSettings) => void;
  brandPrimaryColor?: string;
  hasPermission?: boolean;
}

export const AdminCookieSettingsTab: React.FC<AdminCookieSettingsTabProps> = ({
  cookieSettings,
  onSaveCookieSettings,
  brandPrimaryColor = '#6366f1',
  hasPermission = true
}) => {
  const [formState, setFormState] = useState<CookieAdminSettings>(() => ({
    ...cookieSettings,
    categories: {
      ...cookieSettings.categories
    }
  }));
  const [savedMsg, setSavedMsg] = useState(false);

  const handleToggleCategory = (catKey: 'essential' | 'analytics' | 'functional' | 'marketing') => {
    if (!hasPermission) return;
    if (catKey === 'essential') return; // strictly forbidden to disable essential

    setFormState(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [catKey]: {
          ...prev.categories[catKey],
          enabled: !prev.categories[catKey].enabled
        }
      }
    }));
  };

  const handleSave = () => {
    if (!hasPermission) return;
    const finalData: CookieAdminSettings = {
      ...formState,
      updatedAt: new Date().toISOString(),
      updatedBy: 'مسؤول الامتثال (Admin Compliance)'
    };
    onSaveCookieSettings(finalData);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3500);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              حوكمة ملفات تعريف الارتباط
            </span>
            <span className="text-xs text-slate-400">PDPL & GDPR Compliance Control</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            إعدادات وتصنيفات ملفات تعريف الارتباط (Cookie Consent Manager)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            التحكم في تفعيل أو تعطيل فئات الكوكيز المعروضة للمستخدمين في البوابة العامة وتحديد مدد الاحتفاظ وصيغ الإشعارات الإلزامية.
          </p>
        </div>

        <button
          type="button"
          id="save-cookie-settings-btn"
          disabled={!hasPermission}
          onClick={handleSave}
          style={{ backgroundColor: hasPermission ? brandPrimaryColor : undefined }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center gap-2 ${
            hasPermission ? 'hover:brightness-110' : 'bg-slate-400 cursor-not-allowed'
          }`}
        >
          <Save size={15} />
          <span>حفظ إعدادات الكوكيز</span>
        </button>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>تم حفظ ونشر إعدادات الكوكيز بنجاح في الموقع العام وبوابة الامتثال!</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Essential */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-emerald-500/40 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">
                <Lock size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {formState.categories.essential.nameAr}
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formState.categories.essential.nameEn}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
              إلزامي فنياً ومقفل
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            {formState.categories.essential.descriptionAr}
          </p>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>مدة الاحتفاظ: {formState.categories.essential.retentionAr}</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>مفعل دائماً</span>
            </span>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                <Sliders size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {formState.categories.analytics.nameAr}
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formState.categories.analytics.nameEn}
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formState.categories.analytics.enabled}
                onChange={() => handleToggleCategory('analytics')}
                disabled={!hasPermission}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            {formState.categories.analytics.descriptionAr}
          </p>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>مدة الاحتفاظ: {formState.categories.analytics.retentionAr}</span>
            <span className={formState.categories.analytics.enabled ? 'text-purple-600 font-bold' : 'text-slate-400'}>
              {formState.categories.analytics.enabled ? 'متاح لاختيار المستخدم' : 'معطّل برمجياً'}
            </span>
          </div>
        </div>

        {/* Functional */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
                <Sliders size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {formState.categories.functional.nameAr}
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formState.categories.functional.nameEn}
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formState.categories.functional.enabled}
                onChange={() => handleToggleCategory('functional')}
                disabled={!hasPermission}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            {formState.categories.functional.descriptionAr}
          </p>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>مدة الاحتفاظ: {formState.categories.functional.retentionAr}</span>
            <span className={formState.categories.functional.enabled ? 'text-purple-600 font-bold' : 'text-slate-400'}>
              {formState.categories.functional.enabled ? 'متاح لاختيار المستخدم' : 'معطّل برمجياً'}
            </span>
          </div>
        </div>

        {/* Marketing */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300">
                <Sliders size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {formState.categories.marketing.nameAr}
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formState.categories.marketing.nameEn}
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formState.categories.marketing.enabled}
                onChange={() => handleToggleCategory('marketing')}
                disabled={!hasPermission}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            {formState.categories.marketing.descriptionAr}
          </p>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>مدة الاحتفاظ: {formState.categories.marketing.retentionAr}</span>
            <span className={formState.categories.marketing.enabled ? 'text-purple-600 font-bold' : 'text-slate-400'}>
              {formState.categories.marketing.enabled ? 'متاح لاختيار المستخدم' : 'معطّل برمجياً'}
            </span>
          </div>
        </div>
      </div>

      {/* Banner Configuration */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Shield size={16} className="text-purple-600" />
          <span>تخصيص نصوص شريط إشعار ملفات تعريف الارتباط (Banner Customization)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              عنوان الإشعار (بالعربية)
            </label>
            <input
              type="text"
              value={formState.bannerTitleAr}
              onChange={(e) => setFormState({ ...formState, bannerTitleAr: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Banner Title (In English)
            </label>
            <input
              type="text"
              value={formState.bannerTitleEn}
              onChange={(e) => setFormState({ ...formState, bannerTitleEn: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              نص الإشعار التوضيحي (بالعربية)
            </label>
            <textarea
              rows={2}
              value={formState.bannerMessageAr}
              onChange={(e) => setFormState({ ...formState, bannerMessageAr: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Banner Explanatory Notice (In English)
            </label>
            <textarea
              rows={2}
              value={formState.bannerMessageEn}
              onChange={(e) => setFormState({ ...formState, bannerMessageEn: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              مدة سريان موافقة المستخدم قبل التجديد (بالأيام)
            </label>
            <input
              type="number"
              min={30}
              max={365}
              value={formState.consentLifetimeDays || 180}
              onChange={(e) => setFormState({ ...formState, consentLifetimeDays: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
