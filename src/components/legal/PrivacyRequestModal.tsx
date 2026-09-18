import React, { useState } from 'react';
import { Shield, X, CheckCircle2, AlertCircle, Send, FileText, Lock, User, Mail, Building, Phone } from 'lucide-react';
import { PrivacyRequest, PrivacyRequestType } from '../../types/legal';

interface PrivacyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandPrimaryColor?: string;
  defaultType?: PrivacyRequestType;
}

export function PrivacyRequestModal({
  isOpen,
  onClose,
  brandPrimaryColor = '#6366f1',
  defaultType = 'access'
}: PrivacyRequestModalProps) {
  const [requestType, setRequestType] = useState<PrivacyRequestType>(defaultType);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<PrivacyRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !details.trim()) {
      setErrorMsg('يرجى تعبئة جميع الحقول الإلزامية (الاسم، البريد الإلكتروني، وتفاصيل الطلب).');
      return;
    }

    if (!confirmed) {
      setErrorMsg('يرجى تأكيد إقرار صحة البيانات وهوية صاحب الطلب.');
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedId = `DSR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const newRequest: PrivacyRequest = {
        id: generatedId,
        requestType,
        fullName: fullName.trim(),
        email: email.trim(),
        organization: organization.trim() || undefined,
        phone: phone.trim() || undefined,
        details: details.trim(),
        status: 'new',
        createdAt: new Date().toISOString(),
        verificationConfirmed: true
      };

      // Save to localStorage
      const existing = localStorage.getItem('fleet_privacy_requests_v1');
      const list: PrivacyRequest[] = existing ? JSON.parse(existing) : [];
      list.unshift(newRequest);
      localStorage.setItem('fleet_privacy_requests_v1', JSON.stringify(list));

      // Dispatch event for admin notification
      window.dispatchEvent(new CustomEvent('fleet_privacy_request_created', { detail: newRequest }));

      // Also log to audit logs
      const auditItem = {
        id: `audit-${Date.now()}`,
        who: fullName.trim() || email.trim(),
        userEmail: email.trim(),
        action: 'privacy_request_status' as const,
        timestamp: new Date().toISOString(),
        details: `تقديم طلب خصوصية جديد (${requestType}) برقم المرجع: ${generatedId}`
      };
      const logs = localStorage.getItem('fleet_legal_audit_logs_v1');
      const logList = logs ? JSON.parse(logs) : [];
      logList.unshift(auditItem);
      localStorage.setItem('fleet_legal_audit_logs_v1', JSON.stringify(logList));

      setSubmittedRequest(newRequest);
    } catch (err) {
      console.error(err);
      setErrorMsg('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRequest(null);
    setFullName('');
    setEmail('');
    setOrganization('');
    setPhone('');
    setDetails('');
    setConfirmed(false);
    onClose();
  };

  return (
    <div
      id="privacy-request-modal-backdrop"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
              <Shield size={22} />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white">
                بوابة طلبات الخصوصية وحقوق أصحاب البيانات (DSR)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                وفق نظام حماية البيانات الشخصية السعودي (PDPL) واللوائح العالمية
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1">
          {submittedRequest ? (
            /* Success State */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="font-bold text-xl text-slate-900 dark:text-white">
                تم استلام طلب الخصوصية بنجاح
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                شكراً لتواصلك. تم تسجيل طلبك وإحالته إلى مسؤول حماية البيانات (DPO) لمراجعته ومعالجته في غضون المدة النظامية المحددة (٣٠ يوماً كحد أقصى).
              </p>

              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-sm mx-auto text-right space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>الرقم المرجعي للطلب:</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-sm">
                    {submittedRequest.id}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>البريد المسجل:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {submittedRequest.email}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>نوع الطلب:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {submittedRequest.requestType === 'access' && 'حق الوصول للبيانات'}
                    {submittedRequest.requestType === 'correction' && 'تصحيح البيانات'}
                    {submittedRequest.requestType === 'deletion' && 'إتلاف ومحو البيانات (الحق في النسيان)'}
                    {submittedRequest.requestType === 'export' && 'تصدير ونقل البيانات'}
                    {submittedRequest.requestType === 'objection' && 'الاعتراض على المعالجة'}
                    {submittedRequest.requestType === 'other' && 'طلب خصوصية عام'}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  style={{ backgroundColor: brandPrimaryColor }}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:brightness-110 transition"
                >
                  إغلاق ومتابعة
                </button>
              </div>
            </div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Request Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نوع حق صاحب البيانات المطلوب ممارسته *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'access', label: 'الوصول للبيانات', desc: 'الحصول على نسخة من بياناتك' },
                    { id: 'correction', label: 'تصحيح البيانات', desc: 'تحديث بيانات خاطئة أو ناقصة' },
                    { id: 'deletion', label: 'حذف ومحو البيانات', desc: 'ممارسة الحق في النسيان' },
                    { id: 'export', label: 'تصدير البيانات', desc: 'تصدير بصيغة قابلة للنقل' },
                    { id: 'objection', label: 'الاعتراض على المعالجة', desc: 'تقييد أو سحب الموافقة' },
                    { id: 'other', label: 'استفسار آخر', desc: 'استفسار مخصص لمسؤول الخصوصية' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRequestType(item.id as PrivacyRequestType)}
                      className={`p-2.5 rounded-xl text-right border transition text-xs flex flex-col justify-between ${
                        requestType === item.id
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    الاسم الثلاثي أو الكامل *
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute right-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="مثال: عبدالله محمد الشهري"
                      className="w-full pr-9 pl-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    البريد الإلكتروني المعتمد *
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute right-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pr-9 pl-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المنشأة أو الشركة (إن وجد)
                  </label>
                  <div className="relative">
                    <Building size={15} className="absolute right-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="شركة النقليات المعتمدة"
                      className="w-full pr-9 pl-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الهاتف للتواصل والتحقق
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute right-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+966 5X XXX XXXX"
                      className="w-full pr-9 pl-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  تفاصيل الطلب والسجلات المعنية بالتحديد *
                </label>
                <textarea
                  required
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="يرجى توضيح نوع البيانات المطلوب معالجتها، أرقام اللوحات أو معرف الحساب أو نطاق التواريخ لتسهيل الاستجابة السريعة..."
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-100 resize-none leading-relaxed"
                />
              </div>

              {/* Confirmation Checkbox */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="privacy-confirm-check"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="privacy-confirm-check" className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                  أقر بأنني صاحب البيانات الشخصية المعنية أو ممثلها المفوض نظاماً، وأن البيانات المقدمة صحيحة ودقيقة، وأوافق على استخدامها للتحقق من الهوية وتنفيذ الطلب.
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: brandPrimaryColor }}
                  className="px-5 py-2 rounded-xl text-xs md:text-sm font-bold text-white shadow hover:brightness-110 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال طلب الخصوصية'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
