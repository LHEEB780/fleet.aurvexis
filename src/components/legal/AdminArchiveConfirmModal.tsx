import React from 'react';
import { Archive, AlertTriangle, X, Check } from 'lucide-react';
import { LegalDocument } from '../../types/legal';

interface AdminArchiveConfirmModalProps {
  document: LegalDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmArchive: (doc: LegalDocument) => void;
  brandPrimaryColor?: string;
}

export const AdminArchiveConfirmModal: React.FC<AdminArchiveConfirmModalProps> = ({
  document,
  isOpen,
  onClose,
  onConfirmArchive,
  brandPrimaryColor = '#6366f1'
}) => {
  if (!isOpen || !document) return null;

  return (
    <div
      id="archive-confirm-modal"
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-50 dark:bg-amber-950/40">
          <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60">
              <Archive size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base">تأكيد أرشفة الوثيقة القانونية</h3>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80">إجراء إداري لتعطيل الظهور العام</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400">الوثيقة المحددة:</div>
            <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
              {document.titleAr}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {document.titleEn} (v{document.version})
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-500" />
              <span>ماذا يترتب على أرشفة هذه الوثيقة؟</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pr-1 text-slate-500 dark:text-slate-400">
              <li>تتحول حالة الوثيقة إلى <strong>مؤرشفة (Archived)</strong> فوراً.</li>
              <li><strong>لن تظهر</strong> للمستخدمين في الموقع العام أو بوابة الامتثال.</li>
              <li><strong>لن تظهر</strong> في التذييل (Footer) إطلاقاً.</li>
              <li>تبقى الوثيقة <strong>محفوظة بالكامل</strong> في قاعدة البيانات.</li>
              <li>تبقى جميع <strong>إصداراتها التاريخية</strong> وسجل التعديلات محفوظاً.</li>
              <li>يمكنك كمسؤول مخوّل <strong>استعادتها في أي وقت</strong> إلى مسودة أو نشر رسمي.</li>
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            إلغاء
          </button>
          <button
            type="button"
            id="confirm-archive-btn"
            onClick={() => onConfirmArchive(document)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition flex items-center gap-1.5"
          >
            <Archive size={14} />
            <span>تأكيد الأرشفة الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
};
