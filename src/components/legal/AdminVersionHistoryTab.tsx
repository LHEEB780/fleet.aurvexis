import React, { useState, useMemo } from 'react';
import { History, Eye, RotateCcw, Search, Filter, FileText, Calendar, User, CheckCircle2, Clock } from 'lucide-react';
import { LegalDocument, LegalDocumentVersion } from '../../types/legal';

interface AdminVersionHistoryTabProps {
  documents: LegalDocument[];
  onViewVersion: (doc: LegalDocument, version: LegalDocumentVersion) => void;
  onPreviewVersionPublic: (doc: LegalDocument, version: LegalDocumentVersion) => void;
  onPromptRestore: (doc: LegalDocument, version: LegalDocumentVersion) => void;
  brandPrimaryColor?: string;
  hasRestorePermission?: boolean;
}

interface FlattenedVersionItem {
  doc: LegalDocument;
  version: LegalDocumentVersion;
  isCurrent: boolean;
}

export const AdminVersionHistoryTab: React.FC<AdminVersionHistoryTabProps> = ({
  documents,
  onViewVersion,
  onPreviewVersionPublic,
  onPromptRestore,
  brandPrimaryColor = '#6366f1',
  hasRestorePermission = true
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Flatten all document versions
  const allVersions = useMemo(() => {
    const list: FlattenedVersionItem[] = [];

    documents.forEach(doc => {
      // First add current active version as a reference if history doesn't contain it
      const historyList = doc.versionHistory && doc.versionHistory.length > 0
        ? doc.versionHistory
        : [
            {
              id: `${doc.id}-current`,
              version: doc.version,
              status: doc.status,
              publishedAt: doc.publishedAt || doc.lastUpdated,
              effectiveDate: doc.effectiveDate,
              createdBy: doc.publishedBy || 'مدير النظام',
              changeSummaryAr: 'الإصدار النشط الأساسي',
              changeSummaryEn: 'Active baseline release',
              sections: doc.sections,
              titleAr: doc.titleAr,
              titleEn: doc.titleEn
            }
          ];

      historyList.forEach(ver => {
        const isCurrent = ver.version === doc.version;
        list.push({
          doc,
          version: ver,
          isCurrent
        });
      });
    });

    return list;
  }, [documents]);

  const filteredVersions = useMemo(() => {
    return allVersions.filter(item => {
      const matchDoc = selectedDocId === 'all' || item.doc.id === selectedDocId;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        item.doc.titleAr.toLowerCase().includes(q) ||
        item.doc.titleEn.toLowerCase().includes(q) ||
        item.version.version.toLowerCase().includes(q) ||
        (item.version.changeSummaryAr && item.version.changeSummaryAr.toLowerCase().includes(q)) ||
        (item.version.changeSummary && item.version.changeSummary.toLowerCase().includes(q)) ||
        (item.version.changeSummaryEn && item.version.changeSummaryEn.toLowerCase().includes(q));

      return matchDoc && matchQuery;
    });
  }, [allVersions, selectedDocId, searchQuery]);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Search and Document Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute right-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الإصدارات، التعديلات، أو الوثيقة..."
            className="w-full pr-9 pl-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 font-semibold shrink-0">تصفية حسب الوثيقة:</label>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 max-w-xs"
          >
            <option value="all">كافة الوثائق القانونية ({documents.length})</option>
            {documents.map(d => (
              <option key={d.id} value={d.id}>
                {d.titleAr} (v{d.version})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Version Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
              <tr>
                <th className="p-3.5">الوثيقة القانونية</th>
                <th className="p-3.5">رقم الإصدار</th>
                <th className="p-3.5">اللغات</th>
                <th className="p-3.5">الحالة آنذاك</th>
                <th className="p-3.5">تاريخ النشر</th>
                <th className="p-3.5">تاريخ السريان</th>
                <th className="p-3.5">الناشر / المسؤول</th>
                <th className="p-3.5">ملخص التعديلات</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredVersions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    لا توجد سجلات إصدارات مطابقة لمعايير البحث.
                  </td>
                </tr>
              ) : (
                filteredVersions.map(({ doc, version, isCurrent }, idx) => (
                  <tr
                    key={`${doc.id}-${version.version}-${idx}`}
                    className="hover:bg-slate-50 dark:hover:bg-slate-850 transition"
                  >
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText size={14} className="text-purple-600 shrink-0" />
                        <span>{doc.titleAr}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{doc.slug}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-purple-700 dark:text-purple-300 text-xs">
                          v{version.version}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            الحالي
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                        العربية / English
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                          version.status === 'published' || (!version.status && isCurrent && doc.status === 'published')
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {version.status === 'published' || (!version.status && isCurrent && doc.status === 'published') ? (
                          <>
                            <CheckCircle2 size={11} />
                            <span>منشور رسمي</span>
                          </>
                        ) : (
                          <>
                            <Clock size={11} />
                            <span>مسودة اعتماد</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {version.publishedAt
                        ? new Date(version.publishedAt).toLocaleDateString('ar-SA')
                        : doc.lastUpdated}
                    </td>

                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {version.effectiveDate || doc.effectiveDate}
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {version.publishedBy || version.createdBy || doc.publishedBy || 'مدير النظام'}
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <p className="truncate text-slate-600 dark:text-slate-400 text-[11px]" title={version.changeSummaryAr || version.changeSummary || version.changeSummaryEn || '—'}>
                        {version.changeSummaryAr || version.changeSummary || version.changeSummaryEn || '—'}
                      </p>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1">
                        {/* View Action */}
                        <button
                          type="button"
                          onClick={() => onViewVersion(doc, version)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition"
                          title="عرض محتوى وتفاصيل الإصدار"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Preview Action */}
                        <button
                          type="button"
                          onClick={() => onPreviewVersionPublic(doc, version)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                          title="معاينة في البوابة العامة"
                        >
                          <FileText size={14} />
                        </button>

                        {/* Restore Action */}
                        <button
                          type="button"
                          disabled={!hasRestorePermission}
                          onClick={() => onPromptRestore(doc, version)}
                          className={`p-1.5 rounded-lg transition ${
                            hasRestorePermission
                              ? 'text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800'
                              : 'text-slate-300 cursor-not-allowed'
                          }`}
                          title={hasRestorePermission ? 'استعادة محتوى هذا الإصدار كإصدار جديد' : 'لا تملك صلاحية الاستعادة'}
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
