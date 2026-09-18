import React, { useState } from 'react';
import { History, RotateCcw, X, Check, FileText, AlertTriangle, Calendar, User, Eye } from 'lucide-react';
import { LegalDocument, LegalDocumentVersion } from '../../types/legal';

interface AdminVersionHistoryModalProps {
  document: LegalDocument | null;
  version: LegalDocumentVersion | null;
  isOpen: boolean;
  mode: 'view' | 'restore';
  onClose: () => void;
  onConfirmRestore?: (doc: LegalDocument, versionToRestore: LegalDocumentVersion, summary: string) => void;
  brandPrimaryColor?: string;
}

export const AdminVersionHistoryModal: React.FC<AdminVersionHistoryModalProps> = ({
  document,
  version,
  isOpen,
  mode,
  onClose,
  onConfirmRestore,
  brandPrimaryColor = '#6366f1'
}) => {
  const [langTab, setLangTab] = useState<'ar' | 'en'>('ar');
  const [restoreNote, setRestoreNote] = useState('');

  if (!isOpen || !document || !version) return null;

  // Calculate next version
  const currentVersionParts = (document.version || '1.0.0').split('.').map(Number);
  const nextMinorVersion = currentVersionParts.length >= 2
    ? `${currentVersionParts[0]}.${(currentVersionParts[1] || 0) + 1}.0`
    : `${document.version}-restored`;

  return (
    <div
      id="version-history-modal"
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${mode === 'restore' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'}`}>
              {mode === 'restore' ? <RotateCcw size={20} /> : <History size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {mode === 'restore' ? 'تأكيد استعادة إصدار تاريخي (Version Restore)' : 'تفاصيل ومحتوى الإصدار التاريخي'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {document.titleAr} — الإصدار v{version.version}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Metadata banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 block">رقم الإصدار</span>
              <span className="font-bold font-mono text-purple-600 dark:text-purple-400 text-xs">v{version.version}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">تاريخ النشر</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {version.publishedAt ? new Date(version.publishedAt).toLocaleDateString('ar-SA') : version.effectiveDate}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">تاريخ السريان</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{version.effectiveDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">المسؤول / الناشر</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{version.publishedBy || version.createdBy || 'مدير النظام'}</span>
            </div>
          </div>

          {/* Change Summary */}
          {(version.changeSummaryAr || version.changeSummary || version.changeSummaryEn) && (
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200">
              <span className="font-bold block mb-0.5">ملخص التعديلات في هذا الإصدار:</span>
              <p className="text-xs">{version.changeSummaryAr || version.changeSummary || version.changeSummaryEn}</p>
            </div>
          )}

          {/* RESTORE CONFIRMATION VIEW */}
          {mode === 'restore' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
                  <AlertTriangle size={16} />
                  <span>آلية الاستعادة الآمنة وضمان سلامة السجل التاريخي</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-800 dark:text-amber-300 pr-1">
                  <li><strong>لن يتم حذف</strong> أو استبدال أي من الإصدارات السابقة في السجل.</li>
                  <li>سيتم إنشاء إصدار معتمد جديد برقم أعلى: <strong>v{nextMinorVersion}</strong> (مبني على محتوى v{version.version}).</li>
                  <li>سيتم توثيق عملية الاستعادة ومصدرها واسم المسؤول في <strong>Audit Log</strong> تلقائياً.</li>
                  <li>يمكنك مراجعة المسودة وتعديل بنودها قبل أو بعد نشرها.</li>
                </ul>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات أو مبرر الاستعادة (اختياري، يظهر في سجل الإصدارات والتدقيق):
                </label>
                <textarea
                  value={restoreNote}
                  onChange={(e) => setRestoreNote(e.target.value)}
                  placeholder={`استعادة محتوى الإصدار v${version.version} للاعتماد والعمل بموجبه...`}
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            /* VIEW CONTENT TAB */
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">بنود ومحتوى الوثيقة في هذا الإصدار:</span>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setLangTab('ar')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                      langTab === 'ar' ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    type="button"
                    onClick={() => setLangTab('en')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                      langTab === 'en' ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {version.sections && version.sections.length > 0 ? (
                  version.sections.map((sec, idx) => (
                    <div
                      key={sec.id || idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700"
                    >
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                        {langTab === 'ar' ? sec.titleAr : sec.titleEn}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] whitespace-pre-wrap leading-relaxed">
                        {langTab === 'ar' ? sec.contentAr : sec.contentEn}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-4">لا توجد بنود مفصلة لهذا الإصدار.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            إغلاق
          </button>
          {mode === 'restore' ? (
            <button
              type="button"
              id="confirm-restore-version-btn"
              onClick={() => onConfirmRestore?.(document, version, restoreNote)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>إنهاء واستعادة كإصدار v{nextMinorVersion}</span>
            </button>
          ) : (
            onConfirmRestore && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  // Trigger restore mode
                  setTimeout(() => {
                    const evt = new CustomEvent('open_version_restore_modal', { detail: { docId: document.id, version: version.version } });
                    window.dispatchEvent(evt);
                  }, 50);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>الانتقال للاستعادة</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
