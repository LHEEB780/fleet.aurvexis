import React, { useState, useEffect, useMemo } from 'react';
import {
  Scale,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  CheckCircle2,
  Clock,
  Archive,
  Save,
  RotateCcw,
  Search,
  Sliders,
  Shield,
  Send,
  AlertTriangle,
  History,
  Building,
  Mail,
  UserCheck,
  Download,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Globe,
  Sparkles,
  Lock,
  Phone,
  Filter,
  Layers
} from 'lucide-react';
import {
  LegalDocument,
  LegalDocumentSection,
  LegalDocumentVersion,
  LegalSettings,
  PrivacyRequest,
  LegalAuditLog,
  PrivacyRequestStatus,
  CookieAdminSettings,
  LegalAuditAction
} from '../../types/legal';
import { UserRole, hasGranularPermission } from '../../types';
import {
  DEFAULT_LEGAL_DOCUMENTS,
  DEFAULT_LEGAL_SETTINGS,
  DEFAULT_COOKIE_ADMIN_SETTINGS,
  getStoredLegalDocuments,
  saveStoredLegalDocuments,
  getStoredLegalSettings,
  saveStoredLegalSettings,
  getStoredCookieAdminSettings,
  saveStoredCookieAdminSettings,
  getStoredAuditLogs,
  saveStoredAuditLogs
} from '../../data/legalDocumentsData';
import { downloadLegalDocumentAsPDF } from '../../utils/legalPdfExporter';
import { AdminArchiveConfirmModal } from './AdminArchiveConfirmModal';
import { AdminVersionHistoryModal } from './AdminVersionHistoryModal';
import { AdminCookieSettingsTab } from './AdminCookieSettingsTab';
import { AdminVersionHistoryTab } from './AdminVersionHistoryTab';

interface AdminLegalManagerProps {
  brandPrimaryColor?: string;
  onPreviewPublicDoc?: (docId: string) => void;
  currentUser?: { name?: string; email?: string; role?: string };
}

export function AdminLegalManager({
  brandPrimaryColor = '#6366f1',
  onPreviewPublicDoc,
  currentUser = { name: 'المهندس خالد', email: 'admin@fleetaurvexis.com', role: 'admin' }
}: AdminLegalManagerProps) {
  const userRole = (currentUser?.role as UserRole) || 'admin';

  // Granular permissions checking
  const canView = hasGranularPermission('legal.view', userRole);
  const canCreate = hasGranularPermission('legal.create', userRole);
  const canEdit = hasGranularPermission('legal.edit', userRole);
  const canPublish = hasGranularPermission('legal.publish', userRole);
  const canUnpublish = hasGranularPermission('legal.unpublish', userRole);
  const canArchive = hasGranularPermission('legal.archive', userRole);
  const canRestore = hasGranularPermission('legal.restore', userRole);
  const canManageSettings = hasGranularPermission('legal.manage_settings', userRole);
  const canManageCookies = hasGranularPermission('legal.manage_cookies', userRole);
  const canViewHistory = hasGranularPermission('legal.view_history', userRole);

  // Navigation tabs within Legal Admin
  const [activeTab, setActiveTab] = useState<
    'overview' | 'docs' | 'drafts' | 'published' | 'versions' | 'dsr' | 'cookies' | 'settings' | 'audit' | 'editor'
  >('overview');

  // Core data states
  const [documents, setDocuments] = useState<LegalDocument[]>(() => getStoredLegalDocuments());
  const [settings, setSettings] = useState<LegalSettings>(() => getStoredLegalSettings());
  const [cookieSettings, setCookieSettings] = useState<CookieAdminSettings>(() => getStoredCookieAdminSettings());
  const [auditLogs, setAuditLogs] = useState<LegalAuditLog[]>(() => getStoredAuditLogs());
  const [privacyRequests, setPrivacyRequests] = useState<PrivacyRequest[]>(() => {
    try {
      const saved = localStorage.getItem('fleet_privacy_requests_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Editor states
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  const [editorTabLang, setEditorTabLang] = useState<'ar' | 'en'>('ar');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // DSR filter
  const [dsrStatusFilter, setDsrStatusFilter] = useState<string>('all');
  const [selectedDsr, setSelectedDsr] = useState<PrivacyRequest | null>(null);
  const [dsrNotesInput, setDsrNotesInput] = useState('');
  const [dsrResolutionSummary, setDsrResolutionSummary] = useState('');

  // Audit filter states
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');

  // Archive modal states
  const [archiveModalDoc, setArchiveModalDoc] = useState<LegalDocument | null>(null);

  // Version modal states
  const [versionModalState, setVersionModalState] = useState<{
    isOpen: boolean;
    mode: 'view' | 'restore';
    doc: LegalDocument | null;
    version: LegalDocumentVersion | null;
  }>({
    isOpen: false,
    mode: 'view',
    doc: null,
    version: null
  });

  // Listen for custom event to trigger version restore modal
  useEffect(() => {
    const handleOpenVersionRestore = (e: any) => {
      const { docId, version } = e.detail || {};
      if (docId) {
        const targetDoc = documents.find(d => d.id === docId);
        if (targetDoc) {
          const targetVer = targetDoc.versionHistory?.find(v => v.version === version) || {
            id: `${targetDoc.id}-v${version}`,
            version: version || targetDoc.version,
            status: targetDoc.status,
            publishedAt: targetDoc.publishedAt,
            effectiveDate: targetDoc.effectiveDate,
            createdBy: targetDoc.publishedBy || 'مدير النظام',
            sections: targetDoc.sections,
            titleAr: targetDoc.titleAr,
            titleEn: targetDoc.titleEn
          };
          setVersionModalState({
            isOpen: true,
            mode: 'restore',
            doc: targetDoc,
            version: targetVer
          });
        }
      }
    };

    window.addEventListener('open_version_restore_modal', handleOpenVersionRestore);
    return () => window.removeEventListener('open_version_restore_modal', handleOpenVersionRestore);
  }, [documents]);

  // Audit Logging helper
  const addAuditLog = (
    action: LegalAuditAction,
    details: string,
    docTitle?: string,
    version?: string,
    prevState?: string,
    newState?: string
  ) => {
    const newLog: LegalAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      who: currentUser?.name || 'مدير النظام (Admin)',
      userEmail: currentUser?.email || 'admin@fleetaurvexis.com',
      userRole: userRole,
      action: action,
      documentTitle: docTitle,
      version: version,
      timestamp: new Date().toISOString(),
      previousState: prevState,
      newState: newState,
      details: details
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    saveStoredAuditLogs(updated);
  };

  // Commit documents to persistent storage
  const commitDocuments = (newDocs: LegalDocument[]) => {
    setDocuments(newDocs);
    saveStoredLegalDocuments(newDocs);
  };

  // Commit settings to persistent storage
  const commitSettings = (newSettings: LegalSettings) => {
    setSettings(newSettings);
    saveStoredLegalSettings(newSettings);
    addAuditLog(
      'settings_updated',
      'تحديث الإعدادات والبيانات القانونية المعتمدة للمنصة ومسؤول حماية البيانات (DPO)',
      'إعدادات النظام القانوني'
    );
    setSaveSuccessMsg('تم حفظ الإعدادات القانونية بنجاح.');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Commit cookie settings to persistent storage
  const handleSaveCookieSettings = (newCookieSettings: CookieAdminSettings) => {
    setCookieSettings(newCookieSettings);
    saveStoredCookieAdminSettings(newCookieSettings);
    addAuditLog(
      'cookie_settings_updated',
      'تحديث إعدادات وتصنيفات ملفات تعريف الارتباط وصيغ الإشعار الإلزامي',
      'إعدادات ملفات تعريف الارتباط'
    );
    setSaveSuccessMsg('تم حفظ إعدادات ملفات تعريف الارتباط وتحديث البوابة العامة بنجاح.');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // ================= DOCUMENT REORDERING (↑ / ↓) =================
  const handleMoveDocument = (currentIndex: number, direction: 'up' | 'down') => {
    if (!canEdit) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= documents.length) return;

    const newDocs = [...documents];
    const currentDoc = newDocs[currentIndex];
    const targetDoc = newDocs[targetIndex];

    // Swap order property
    const tempOrder = currentDoc.order ?? currentIndex + 1;
    currentDoc.order = targetDoc.order ?? targetIndex + 1;
    targetDoc.order = tempOrder;

    // Swap array position
    newDocs[currentIndex] = targetDoc;
    newDocs[targetIndex] = currentDoc;

    commitDocuments(newDocs);
    addAuditLog(
      direction === 'up' ? 'moved_up' : 'moved_down',
      `تعديل ترتيب العرض للوثيقة: ${currentDoc.titleAr} (${direction === 'up' ? 'تقديم للأعلى' : 'تأخير للأسفل'})`,
      currentDoc.titleAr,
      currentDoc.version,
      `ترتيب ${currentIndex + 1}`,
      `ترتيب ${targetIndex + 1}`
    );
  };

  // ================= ARCHIVE & UNARCHIVE =================
  const handlePromptArchive = (doc: LegalDocument) => {
    if (!canArchive) return;
    setArchiveModalDoc(doc);
  };

  const handleConfirmArchive = (doc: LegalDocument) => {
    const updated = documents.map(d => {
      if (d.id === doc.id) {
        return {
          ...d,
          status: 'archived' as const,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return d;
    });

    commitDocuments(updated);
    addAuditLog(
      'archived',
      `أرشفة الوثيقة وإخفائها من التذييل والبوابة العامة مع الاحتفاظ بإصداراتها: ${doc.titleAr}`,
      doc.titleAr,
      doc.version,
      doc.status,
      'archived'
    );

    setArchiveModalDoc(null);
    setSaveSuccessMsg(`تمت أرشفة الوثيقة (${doc.titleAr}) بنجاح.`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleUnarchive = (doc: LegalDocument) => {
    if (!canArchive && !canEdit) return;
    const updated = documents.map(d => {
      if (d.id === doc.id) {
        return {
          ...d,
          status: 'draft' as const,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return d;
    });

    commitDocuments(updated);
    addAuditLog(
      'draft_saved',
      `استعادة الوثيقة المؤرشفة إلى حالة مسودة للمراجعة: ${doc.titleAr}`,
      doc.titleAr,
      doc.version,
      'archived',
      'draft'
    );

    setSaveSuccessMsg(`تمت استعادة الوثيقة (${doc.titleAr}) كمسودة جاهزة للمراجعة.`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // ================= VERSION RESTORE =================
  const handlePromptRestoreVersion = (doc: LegalDocument, version: LegalDocumentVersion) => {
    if (!canRestore) return;
    setVersionModalState({
      isOpen: true,
      mode: 'restore',
      doc,
      version
    });
  };

  const handleConfirmRestoreVersion = (
    targetDoc: LegalDocument,
    versionToRestore: LegalDocumentVersion,
    summary: string
  ) => {
    const currentVersionParts = (targetDoc.version || '1.0.0').split('.').map(Number);
    const newVersionString = currentVersionParts.length >= 2
      ? `${currentVersionParts[0]}.${(currentVersionParts[1] || 0) + 1}.0`
      : `${targetDoc.version}.1`;

    const nowISO = new Date().toISOString();
    const today = nowISO.split('T')[0];

    // Create new version record preserving history
    const restoredVersionRecord: LegalDocumentVersion = {
      id: `${targetDoc.id}-v${newVersionString}-${Date.now()}`,
      docId: targetDoc.id,
      version: newVersionString,
      effectiveDate: today,
      publishedAt: nowISO,
      publishedBy: currentUser?.name || 'مدير النظام',
      changeSummaryAr: summary || `استعادة كاملة للمحتوى والبنود من الإصدار v${versionToRestore.version}`,
      changeSummaryEn: `Full content restoration from historic release v${versionToRestore.version}`,
      status: 'published',
      sections: JSON.parse(JSON.stringify(versionToRestore.sections || targetDoc.sections)),
      titleAr: versionToRestore.titleAr || targetDoc.titleAr,
      titleEn: versionToRestore.titleEn || targetDoc.titleEn,
      summaryAr: versionToRestore.summaryAr || targetDoc.summaryAr,
      summaryEn: versionToRestore.summaryEn || targetDoc.summaryEn
    };

    const updated = documents.map(d => {
      if (d.id === targetDoc.id) {
        return {
          ...d,
          version: newVersionString,
          titleAr: versionToRestore.titleAr || d.titleAr,
          titleEn: versionToRestore.titleEn || d.titleEn,
          summaryAr: versionToRestore.summaryAr || d.summaryAr,
          summaryEn: versionToRestore.summaryEn || d.summaryEn,
          sections: JSON.parse(JSON.stringify(versionToRestore.sections || d.sections)),
          status: 'published' as const,
          lastUpdated: today,
          publishedAt: nowISO,
          publishedBy: currentUser?.name || 'مدير النظام',
          versionHistory: [restoredVersionRecord, ...(d.versionHistory || [])]
        };
      }
      return d;
    });

    commitDocuments(updated);
    addAuditLog(
      'restored',
      `استعادة الإصدار v${versionToRestore.version} للوثيقة (${targetDoc.titleAr}) وإنشاء الإصدار المعتمد الجديد v${newVersionString}`,
      targetDoc.titleAr,
      newVersionString,
      `v${targetDoc.version}`,
      `v${newVersionString}`
    );

    setVersionModalState({ isOpen: false, mode: 'view', doc: null, version: null });
    setSaveSuccessMsg(
      `تمت استعادة محتوى الإصدار v${versionToRestore.version} بنجاح وإنشاء الإصدار الجديد v${newVersionString}!`
    );
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // ================= EDITOR ACTIONS =================
  const handleStartEdit = (doc: LegalDocument) => {
    if (!canEdit) return;
    setEditingDoc(JSON.parse(JSON.stringify(doc)));
    setActiveTab('editor');
    setSaveSuccessMsg('');
  };

  const handleCreateNewDoc = () => {
    if (!canCreate) return;
    const newId = `legal-doc-${Date.now()}`;
    const newDoc: LegalDocument = {
      id: newId,
      slug: `custom-doc-${Date.now()}`,
      titleAr: 'وثيقة قانونية جديدة',
      titleEn: 'New Legal Document',
      summaryAr: 'ملخص موجز للوثيقة والهدف منها...',
      summaryEn: 'Executive summary of this legal document...',
      category: 'compliance',
      version: '1.0.0',
      status: 'draft',
      effectiveDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      order: documents.length + 1,
      showInFooter: true,
      requiresAcceptance: false,
      sections: [
        {
          id: `sec-1`,
          titleAr: '١. المقدمة والتعريفات',
          titleEn: '1. Introduction & Definitions',
          contentAr: 'أدخل البنود والأحكام هنا...',
          contentEn: 'Enter policy provisions here...'
        }
      ]
    };
    setEditingDoc(newDoc);
    setActiveTab('editor');
  };

  const handleTogglePublish = (doc: LegalDocument) => {
    if (doc.status === 'published' && !canUnpublish) return;
    if (doc.status !== 'published' && !canPublish) return;

    const nextStatus = doc.status === 'published' ? 'draft' : 'published';
    const nowISO = new Date().toISOString();
    const updated = documents.map(d => {
      if (d.id === doc.id) {
        return {
          ...d,
          status: nextStatus as any,
          publishedAt: nextStatus === 'published' ? nowISO : d.publishedAt,
          publishedBy: nextStatus === 'published' ? currentUser?.name || 'مدير الامتثال' : d.publishedBy,
          lastUpdated: nowISO.split('T')[0]
        };
      }
      return d;
    });

    commitDocuments(updated);
    addAuditLog(
      nextStatus === 'published' ? 'published' : 'unpublished',
      nextStatus === 'published'
        ? `اعتماد ونشر الوثيقة رسمياً: ${doc.titleAr}`
        : `إلغاء نشر الوثيقة وتحويلها إلى مسودة: ${doc.titleAr}`,
      doc.titleAr,
      doc.version,
      doc.status,
      nextStatus
    );

    setSaveSuccessMsg(
      nextStatus === 'published'
        ? `تم نشر الوثيقة (${doc.titleAr}) وجعلها متاحة للجمهور!`
        : `تم إلغاء نشر الوثيقة (${doc.titleAr}) وتحويلها لمسودة.`
    );
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleSaveDocFromEditor = (publishNow = false) => {
    if (!editingDoc) return;
    if (publishNow && !canPublish) return;
    if (!publishNow && !canEdit) return;

    const finalStatus = publishNow ? 'published' : editingDoc.status;
    const nowISO = new Date().toISOString();

    const finalizedDoc: LegalDocument = {
      ...editingDoc,
      status: finalStatus,
      lastUpdated: nowISO.split('T')[0],
      publishedAt: publishNow ? nowISO : editingDoc.publishedAt,
      publishedBy: publishNow ? currentUser?.name || 'مدير الامتثال' : editingDoc.publishedBy
    };

    if (publishNow) {
      const versionRecord: LegalDocumentVersion = {
        id: `${editingDoc.id}-v${editingDoc.version}-${Date.now()}`,
        docId: editingDoc.id,
        version: editingDoc.version,
        effectiveDate: editingDoc.effectiveDate,
        publishedAt: nowISO,
        publishedBy: currentUser?.name || 'مدير الامتثال',
        changeSummaryAr: editingDoc.changeSummaryAr || 'إصدار معتمد رسمي',
        changeSummaryEn: editingDoc.changeSummaryEn || 'Approved release',
        status: 'published',
        sections: editingDoc.sections,
        titleAr: editingDoc.titleAr,
        titleEn: editingDoc.titleEn,
        summaryAr: editingDoc.summaryAr,
        summaryEn: editingDoc.summaryEn
      };
      finalizedDoc.versionHistory = [versionRecord, ...(finalizedDoc.versionHistory || [])];
    }

    const docIndex = documents.findIndex(d => d.id === finalizedDoc.id);
    let updatedDocs: LegalDocument[];
    if (docIndex >= 0) {
      updatedDocs = [...documents];
      updatedDocs[docIndex] = finalizedDoc;
    } else {
      updatedDocs = [...documents, finalizedDoc];
    }

    commitDocuments(updatedDocs);
    addAuditLog(
      publishNow ? 'published' : 'draft_saved',
      publishNow
        ? `نشر الإصدار (${finalizedDoc.version}) من الوثيقة: ${finalizedDoc.titleAr}`
        : `حفظ مسودة الوثيقة: ${finalizedDoc.titleAr}`,
      finalizedDoc.titleAr,
      finalizedDoc.version,
      editingDoc.status,
      finalStatus
    );

    setSaveSuccessMsg(
      publishNow ? 'تم نشر الوثيقة بنجاح وجعلها متاحة للجمهور!' : 'تم حفظ المسودة بنجاح.'
    );
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleAddSection = () => {
    if (!editingDoc) return;
    const newSec: LegalDocumentSection = {
      id: `sec-${Date.now()}`,
      titleAr: `${editingDoc.sections.length + 1}. بند جديد`,
      titleEn: `${editingDoc.sections.length + 1}. New Provision`,
      contentAr: '',
      contentEn: ''
    };
    setEditingDoc({
      ...editingDoc,
      sections: [...editingDoc.sections, newSec]
    });
  };

  const handleUpdateSection = (index: number, field: keyof LegalDocumentSection, value: string) => {
    if (!editingDoc) return;
    const updated = [...editingDoc.sections];
    updated[index] = { ...updated[index], [field]: value };
    setEditingDoc({ ...editingDoc, sections: updated });
  };

  const handleDeleteSection = (index: number) => {
    if (!editingDoc || editingDoc.sections.length <= 1) return;
    const updated = editingDoc.sections.filter((_, idx) => idx !== index);
    setEditingDoc({ ...editingDoc, sections: updated });
  };

  const handleVersionBump = (type: 'minor' | 'major') => {
    if (!editingDoc) return;
    const parts = editingDoc.version.split('.').map(Number);
    if (parts.length < 3) return;

    if (type === 'minor') {
      parts[1] += 1;
      parts[2] = 0;
    } else {
      parts[0] += 1;
      parts[1] = 0;
      parts[2] = 0;
    }
    setEditingDoc({ ...editingDoc, version: parts.join('.') });
  };

  // ================= DSR REQUESTS =================
  const handleUpdateDsrStatus = (id: string, newStatus: PrivacyRequestStatus) => {
    const updated = privacyRequests.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: newStatus,
          internalNotes: dsrNotesInput || req.internalNotes,
          resolutionSummary:
            newStatus === 'resolved' ? dsrResolutionSummary || 'تمت معالجة الطلب بالكامل' : req.resolutionSummary,
          resolutionDate: newStatus === 'resolved' ? new Date().toISOString() : req.resolutionDate
        };
      }
      return req;
    });
    setPrivacyRequests(updated);
    localStorage.setItem('fleet_privacy_requests_v1', JSON.stringify(updated));
    setSelectedDsr(null);
    setDsrNotesInput('');
    setDsrResolutionSummary('');
    addAuditLog('dsr_processed', `معالجة وتحديث حالة طلب خصوصية (${id}) إلى ${newStatus}`);
  };

  // Reset to default enterprise templates
  const handleResetToDefaults = () => {
    if (
      window.confirm(
        'هل أنت متأكد من استعادة النسخ الافتراضية المعتمدة لكافة الوثائق القانونية؟ ستفقد التعديلات غير المحفوظة.'
      )
    ) {
      commitDocuments(DEFAULT_LEGAL_DOCUMENTS);
      commitSettings(DEFAULT_LEGAL_SETTINGS);
      handleSaveCookieSettings(DEFAULT_COOKIE_ADMIN_SETTINGS);
      setSaveSuccessMsg('تمت استعادة الوثائق والإعدادات الافتراضية بنجاح.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  // ================= FILTERED LISTS =================
  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }, [documents]);

  const filteredDocs = useMemo(() => {
    return sortedDocuments.filter(doc => {
      const matchesSearch =
        !searchDocQuery ||
        doc.titleAr.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
        doc.titleEn.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
        doc.slug.toLowerCase().includes(searchDocQuery.toLowerCase());
      const matchesCat = filterCategory === 'all' || doc.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [sortedDocuments, searchDocQuery, filterCategory, filterStatus]);

  const draftDocs = useMemo(() => {
    return sortedDocuments.filter(d => d.status === 'draft');
  }, [sortedDocuments]);

  const publishedDocs = useMemo(() => {
    return sortedDocuments.filter(d => d.status === 'published');
  }, [sortedDocuments]);

  const archivedDocs = useMemo(() => {
    return sortedDocuments.filter(d => d.status === 'archived');
  }, [sortedDocuments]);

  const pendingDsrCount = useMemo(() => {
    return privacyRequests.filter(r => r.status === 'new' || r.status === 'in_review').length;
  }, [privacyRequests]);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchAction = auditActionFilter === 'all' || log.action === auditActionFilter;
      const q = auditSearchQuery.toLowerCase();
      const matchSearch =
        !q ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        (log.who && log.who.toLowerCase().includes(q)) ||
        (log.documentTitle && log.documentTitle.toLowerCase().includes(q));
      return matchAction && matchSearch;
    });
  }, [auditLogs, auditActionFilter, auditSearchQuery]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-purple-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              <Shield size={13} />
              <span>نظام حوكمة الشؤون القانونية والامتثال السحابي</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              إدارة الوثائق القانونية، السياسات، وحقوق الخصوصية (Legal & Compliance)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              تحكم كامل في نصوص شروط الخدمة، سياسات الخصوصية، ملفات تعريف الارتباط، وتدقيق الامتثال مع معايير PDPL و GDPR دون المساس بهوية النظام.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">المسؤول الحالي</span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{currentUser?.name || 'مدير النظام'}</span>
              </span>
              <span className="text-[10px] text-purple-300 font-mono">({userRole})</span>
            </div>
          </div>
        </div>

        {/* Advisory Notice */}
        <div className="mt-4 pt-4 border-t border-purple-800/40 flex items-center gap-2 text-xs text-purple-200">
          <AlertTriangle size={14} className="text-amber-400 shrink-0" />
          <span>
            <strong>تنبيه قانوني:</strong> التعديلات على الوثائق تخضع لسجل تدقيق غير قابل للحذف (Audit Log)، مع إمكانية أرشفة أو استعادة أي إصدار سابق بضغطة زر.
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          {/* Overview */}
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Layers size={14} />
            <span>نظرة عامة (Overview)</span>
          </button>

          {/* Documents */}
          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'docs'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <FileText size={14} />
            <span>الوثائق ({documents.length})</span>
          </button>

          {/* Drafts */}
          <button
            type="button"
            onClick={() => setActiveTab('drafts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'drafts'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Clock size={14} />
            <span>المسودات ({draftDocs.length})</span>
          </button>

          {/* Published */}
          <button
            type="button"
            onClick={() => setActiveTab('published')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'published'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <CheckCircle size={14} />
            <span>المنشورة ({publishedDocs.length})</span>
          </button>

          {/* Version History */}
          <button
            type="button"
            onClick={() => setActiveTab('versions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'versions'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <History size={14} />
            <span>سجل الإصدارات (Version History)</span>
          </button>

          {/* Privacy Requests */}
          <button
            type="button"
            onClick={() => setActiveTab('dsr')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'dsr'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <UserCheck size={14} />
            <span>طلبات الخصوصية DSR ({privacyRequests.length})</span>
            {pendingDsrCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </button>

          {/* Cookie Settings */}
          <button
            type="button"
            onClick={() => setActiveTab('cookies')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'cookies'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Sliders size={14} />
            <span>إعدادات الكوكيز (Cookie Settings)</span>
          </button>

          {/* Legal Settings */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Building size={14} />
            <span>إعدادات النظام (Legal Settings)</span>
          </button>

          {/* Audit Log */}
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'audit'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <History size={14} />
            <span>سجل العمليات (Audit Log) ({auditLogs.length})</span>
          </button>

          {editingDoc && (
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'editor'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}
            >
              <Edit size={14} />
              <span>محرر: {editingDoc.titleAr}</span>
            </button>
          )}
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
            title="استعادة القوالب الافتراضية"
          >
            <RotateCcw size={13} />
            <span>استعادة الافتراضيات</span>
          </button>
          {canCreate && (
            <button
              type="button"
              onClick={handleCreateNewDoc}
              style={{ backgroundColor: brandPrimaryColor }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow hover:brightness-110 transition flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>إنشاء وثيقة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle size={16} className="text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ================= TAB: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-bold">إجمالي الوثائق</span>
                <FileText size={16} className="text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {documents.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">وثائق معتمدة في النظام</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-bold">الوثائق المنشورة</span>
                <CheckCircle size={16} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 font-mono">
                {publishedDocs.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">متاحة للجمهور والتذييل</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-bold">المسودات قيد الإعداد</span>
                <Clock size={16} className="text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-amber-600 font-mono">
                {draftDocs.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">تتطلب المراجعة والاعتماد</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-bold">الوثائق المؤرشفة</span>
                <Archive size={16} className="text-slate-600" />
              </div>
              <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 font-mono">
                {archivedDocs.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">محفوظة دون ظهور عام</div>
            </div>
          </div>

          {/* Quick Actions & Compliance Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={16} className="text-purple-600" />
                <span>إجراءات الامتثال السريعة</span>
              </h4>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('docs')}
                  className="w-full text-right p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/40 text-xs font-medium text-slate-700 dark:text-slate-200 transition flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <FileText size={14} className="text-purple-600" />
                    <span>إدارة وثائق وسياسات المنصة</span>
                  </span>
                  <span className="text-slate-400 font-mono">({documents.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('cookies')}
                  className="w-full text-right p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/40 text-xs font-medium text-slate-700 dark:text-slate-200 transition flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Sliders size={14} className="text-purple-600" />
                    <span>ضبط فئات وإشعار ملفات تعريف الارتباط</span>
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    مفعّل
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('versions')}
                  className="w-full text-right p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/40 text-xs font-medium text-slate-700 dark:text-slate-200 transition flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <History size={14} className="text-purple-600" />
                    <span>استعراض سجل الإصدارات والاستعادة</span>
                  </span>
                  <span className="text-slate-400">سجل كامل</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="w-full text-right p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/40 text-xs font-medium text-slate-700 dark:text-slate-200 transition flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Building size={14} className="text-purple-600" />
                    <span>تحديث بيانات الكيان ومسؤول الحماية DPO</span>
                  </span>
                  <span className="text-slate-400">CR & VAT</span>
                </button>
              </div>
            </div>

            {/* Compliance Health Checklist */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield size={16} className="text-emerald-600" />
                  <span>مؤشرات الجاهزية والامتثال القانوني (PDPL / GDPR Ready)</span>
                </h4>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  امتثال كامل 100%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">سياسة الخصوصية وشروط الخدمة</div>
                    <p className="text-slate-500 text-[11px] mt-0.5">منشورة ومحدثة مع أحدث إصدارات التعاقد.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">إشعار ملفات تعريف الارتباط PDPL</div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      فصل ملفات التحليل والتسويق مع إغلاق الفئات الضرورية.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">مسؤول حماية البيانات (DPO)</div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {settings.dpoEmail} • {settings.dpoPhone || '011-400-0000'}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">سجل العمليات والتدقيق (Audit Log)</div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      توثيق كافة عمليات النشر، الأرشفة، والاستعادة برمجياً.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: DOCUMENTS (TABLE WITH ORDERING & ARCHIVE) ================= */}
      {activeTab === 'docs' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchDocQuery}
                onChange={(e) => setSearchDocQuery(e.target.value)}
                placeholder="البحث في العناوين والمعرفات..."
                className="w-full pr-9 pl-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <option value="all">كافة الفئات</option>
                <option value="privacy">الخصوصية والبيانات</option>
                <option value="terms">شروط الخدمة والتعاقد</option>
                <option value="security">أمن المعلومات</option>
                <option value="compliance">الامتثال والمعالجة</option>
                <option value="notices">الإشعارات والتواصل</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <option value="all">كافة الحالات</option>
                <option value="published">منشورة فقط</option>
                <option value="draft">مسودات</option>
                <option value="archived">مؤرشفة</option>
              </select>
            </div>
          </div>

          {/* Documents Table with Ordering Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="p-3.5 text-center">الترتيب</th>
                    <th className="p-3.5">عنوان الوثيقة القانونية</th>
                    <th className="p-3.5">الفئة</th>
                    <th className="p-3.5">الإصدار</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5">تاريخ التحديث</th>
                    <th className="p-3.5">التذييل</th>
                    <th className="p-3.5 text-center">الإجراءات والعمليات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {filteredDocs.map((doc, idx) => {
                    const rawIndex = documents.findIndex(d => d.id === doc.id);
                    const isFirst = rawIndex === 0;
                    const isLast = rawIndex === documents.length - 1;

                    return (
                      <tr
                        key={doc.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-850 transition ${
                          doc.status === 'archived' ? 'opacity-70 bg-slate-50/50 dark:bg-slate-900/50' : ''
                        }`}
                      >
                        {/* Ordering Controls (Move Up / Down) */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-mono text-slate-400 text-xs ml-1 font-bold">
                              #{doc.order ?? rawIndex + 1}
                            </span>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                disabled={isFirst || !canEdit}
                                onClick={() => handleMoveDocument(rawIndex, 'up')}
                                className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition ${
                                  isFirst || !canEdit ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300'
                                }`}
                                title="تقديم للأعلى (Move Up)"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                disabled={isLast || !canEdit}
                                onClick={() => handleMoveDocument(rawIndex, 'down')}
                                className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition ${
                                  isLast || !canEdit ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300'
                                }`}
                                title="تأخير للأسفل (Move Down)"
                              >
                                <ArrowDown size={12} />
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText size={15} className="text-purple-600 shrink-0" />
                            <span>{doc.titleAr}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{doc.titleEn}</div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                            {doc.category}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono font-bold text-purple-700 dark:text-purple-300">
                          v{doc.version}
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 ${
                              doc.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : doc.status === 'draft'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {doc.status === 'published' && <CheckCircle size={12} />}
                            {doc.status === 'draft' && <Clock size={12} />}
                            {doc.status === 'archived' && <Archive size={12} />}
                            <span>
                              {doc.status === 'published' && 'منشور رسمي'}
                              {doc.status === 'draft' && 'مسودة مراجعة'}
                              {doc.status === 'archived' && 'مؤرشف'}
                            </span>
                          </span>
                        </td>

                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                          {doc.lastUpdated}
                        </td>

                        <td className="p-3.5">
                          <button
                            type="button"
                            disabled={!canEdit || doc.status === 'archived'}
                            onClick={() => {
                              const updated = documents.map(d =>
                                d.id === doc.id ? { ...d, showInFooter: !d.showInFooter } : d
                              );
                              commitDocuments(updated);
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                              doc.showInFooter && doc.status !== 'archived'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                            }`}
                          >
                            {doc.status === 'archived' ? 'محجوب (مؤرشف)' : doc.showInFooter ? 'ظاهر' : 'مخفي'}
                          </button>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit */}
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(doc)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition"
                                title="تعديل نصوص الوثيقة"
                              >
                                <Edit size={14} />
                              </button>
                            )}

                            {/* Public Preview */}
                            <button
                              type="button"
                              onClick={() => onPreviewPublicDoc?.(doc.id)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                              title="معاينة الواجهة العامة"
                            >
                              <Eye size={14} />
                            </button>

                            {/* Toggle Publish / Unpublish */}
                            {doc.status !== 'archived' && (
                              <button
                                type="button"
                                onClick={() => handleTogglePublish(doc)}
                                className={`p-1.5 rounded-lg transition ${
                                  doc.status === 'published'
                                    ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800'
                                    : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800'
                                }`}
                                title={doc.status === 'published' ? 'تحويل لمسودة' : 'نشر الوثيقة الآن'}
                              >
                                {doc.status === 'published' ? <Clock size={14} /> : <CheckCircle size={14} />}
                              </button>
                            )}

                            {/* Archive Action */}
                            {doc.status !== 'archived' && canArchive && (
                              <button
                                type="button"
                                onClick={() => handlePromptArchive(doc)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition"
                                title="أرشفة الوثيقة (إخفاء من التذييل والموقع مع حفظ البيانات)"
                              >
                                <Archive size={14} />
                              </button>
                            )}

                            {/* Unarchive / Restore to Draft Action */}
                            {doc.status === 'archived' && (canArchive || canEdit) && (
                              <button
                                type="button"
                                onClick={() => handleUnarchive(doc)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition"
                                title="استعادة الوثيقة من الأرشيف إلى مسودة"
                              >
                                <RotateCcw size={14} />
                              </button>
                            )}

                            {/* Version History Quick Link */}
                            {canViewHistory && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('versions');
                                }}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition"
                                title="عرض سجل الإصدارات"
                              >
                                <History size={14} />
                              </button>
                            )}

                            {/* PDF download */}
                            <button
                              type="button"
                              onClick={() => downloadLegalDocumentAsPDF(doc, settings, 'ar')}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                              title="تحميل كملف PDF"
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: DRAFTS ================= */}
      {activeTab === 'drafts' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                <span>المسودات قيد المراجعة والاعتماد ({draftDocs.length})</span>
              </h4>
              <p className="text-xs text-slate-500">
                هذه الوثائق لا تظهر للجمهور في الموقع العام حتى يتم اعتمادها ونشرها.
              </p>
            </div>
            {canCreate && (
              <button
                type="button"
                onClick={handleCreateNewDoc}
                style={{ backgroundColor: brandPrimaryColor }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow hover:brightness-110 transition flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>مسودة جديدة</span>
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                <tr>
                  <th className="p-3.5">الوثيقة</th>
                  <th className="p-3.5">الإصدار</th>
                  <th className="p-3.5">آخر تحديث</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {draftDocs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      لا توجد مسودات حالياً. كافة الوثائق منشورة أو مؤرشفة.
                    </td>
                  </tr>
                ) : (
                  draftDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{doc.titleAr}</div>
                        <div className="text-[11px] text-slate-400">{doc.titleEn}</div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-amber-600">v{doc.version}</td>
                      <td className="p-3.5 text-slate-500 font-mono">{doc.lastUpdated}</td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {canPublish && (
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(doc)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 flex items-center gap-1"
                            >
                              <CheckCircle size={13} />
                              <span>اعتماد ونشر</span>
                            </button>
                          )}
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(doc)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onPreviewPublicDoc?.(doc.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Eye size={14} />
                          </button>
                          {canArchive && (
                            <button
                              type="button"
                              onClick={() => handlePromptArchive(doc)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50"
                            >
                              <Archive size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB: PUBLISHED ================= */}
      {activeTab === 'published' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" />
                <span>الوثائق المنشورة رسمياً ({publishedDocs.length})</span>
              </h4>
              <p className="text-xs text-slate-500">
                هذه الوثائق فعالة ومعتمدة وتظهر للمستخدمين في البوابة العامة وتذييل الموقع.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                <tr>
                  <th className="p-3.5">الترتيب</th>
                  <th className="p-3.5">الوثيقة</th>
                  <th className="p-3.5">الإصدار</th>
                  <th className="p-3.5">تاريخ النشر</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {publishedDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="p-3.5 font-mono text-purple-600 font-bold">#{doc.order ?? 1}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{doc.titleAr}</div>
                      <div className="text-[11px] text-slate-400">{doc.titleEn}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600">v{doc.version}</td>
                    <td className="p-3.5 text-slate-500 font-mono">
                      {doc.publishedAt ? new Date(doc.publishedAt).toLocaleDateString('ar-SA') : doc.lastUpdated}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPreviewPublicDoc?.(doc.id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-semibold text-xs flex items-center gap-1"
                        >
                          <Eye size={13} />
                          <span>معاينة عامة</span>
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(doc)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50"
                            title="تعديل"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                        {canUnpublish && (
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(doc)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"
                            title="إلغاء النشر وتحويل لمسودة"
                          >
                            <Clock size={14} />
                          </button>
                        )}
                        {canArchive && (
                          <button
                            type="button"
                            onClick={() => handlePromptArchive(doc)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50"
                            title="أرشفة"
                          >
                            <Archive size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB: VERSION HISTORY ================= */}
      {activeTab === 'versions' && (
        <AdminVersionHistoryTab
          documents={documents}
          onViewVersion={(doc, ver) => {
            setVersionModalState({
              isOpen: true,
              mode: 'view',
              doc,
              version: ver
            });
          }}
          onPreviewVersionPublic={(doc, ver) => {
            onPreviewPublicDoc?.(doc.id);
          }}
          onPromptRestore={handlePromptRestoreVersion}
          brandPrimaryColor={brandPrimaryColor}
          hasRestorePermission={canRestore}
        />
      )}

      {/* ================= TAB: COOKIE SETTINGS ================= */}
      {activeTab === 'cookies' && (
        <AdminCookieSettingsTab
          cookieSettings={cookieSettings}
          onSaveCookieSettings={handleSaveCookieSettings}
          brandPrimaryColor={brandPrimaryColor}
          hasPermission={canManageCookies}
        />
      )}

      {/* ================= TAB: DSR REQUESTS ================= */}
      {activeTab === 'dsr' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck size={16} className="text-purple-600" />
                <span>طلبات حقوق أصحاب البيانات والخصوصية (Data Subject Requests)</span>
              </h4>
              <p className="text-xs text-slate-500">
                معالجة ومتابعة طلبات الوصول، التصحيح، الحذف، والاعتراض الواردة من المستخدمين وفقاً لنظام حماية البيانات الشخصية (PDPL).
              </p>
            </div>

            <select
              value={dsrStatusFilter}
              onChange={(e) => setDsrStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="all">كافة الحالات ({privacyRequests.length})</option>
              <option value="new">طلبات جديدة (New)</option>
              <option value="in_review">قيد المعالجة (In Review)</option>
              <option value="resolved">مكتملة ومغلقة (Resolved)</option>
            </select>
          </div>

          {privacyRequests.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
              <UserCheck size={36} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                لا توجد طلبات خصوصية مسجلة حالياً.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                عند تقديم أي مستخدم لطلب عبر البوابة العامة سيظهر فوراً هنا.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {privacyRequests
                .filter(r => dsrStatusFilter === 'all' || r.status === dsrStatusFilter)
                .map(req => (
                  <div
                    key={req.id}
                    className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                          {req.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {req.requestType.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'new'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : req.status === 'in_review'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : req.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                        {req.fullName} ({req.email})
                      </h5>
                      {req.organization && (
                        <p className="text-xs text-slate-500">المنشأة: {req.organization}</p>
                      )}
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg mt-1">
                        {req.details}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {req.status !== 'resolved' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdateDsrStatus(req.id, 'in_review')}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition"
                          >
                            بدء المراجعة
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateDsrStatus(req.id, 'resolved')}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          >
                            إغلاق ومعالجة
                          </button>
                        </>
                      )}
                      {req.status === 'resolved' && (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <Check size={14} />
                          <span>مكتمل</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB: LEGAL SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                بيانات المنشأة، المنتج، والكيان القانوني المعتمد
              </h4>
              <p className="text-xs text-slate-500">
                تنعكس هذه البيانات تلقائياً في الإشعار القانوني وتذييلات كافة الوثائق والسياسات
              </p>
            </div>
            {canManageSettings && (
              <button
                type="button"
                onClick={() => commitSettings(settings)}
                style={{ backgroundColor: brandPrimaryColor }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow hover:brightness-110 transition flex items-center gap-1.5"
              >
                <Save size={14} />
                <span>حفظ الإعدادات القانونية</span>
              </button>
            )}
          </div>

          {/* Section 1: Product & Brand Name */}
          <div className="space-y-3">
            <h5 className="font-bold text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>اسم المنتج والعلامة التجارية (Product & Brand Name)</span>
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المنتج بالعربية (Product Name)
                </label>
                <input
                  type="text"
                  value={settings.productNameAr || ''}
                  onChange={(e) => setSettings({ ...settings, productNameAr: e.target.value })}
                  disabled={!canManageSettings}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المنتج بالإنجليزية (Product Name En)
                </label>
                <input
                  type="text"
                  value={settings.productNameEn || ''}
                  onChange={(e) => setSettings({ ...settings, productNameEn: e.target.value })}
                  disabled={!canManageSettings}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Legal Entity & Registrations */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h5 className="font-bold text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Building size={14} />
              <span>الكيان النظامي والسجل التجاري والضريبي</span>
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم الكيان النظامي بالعربية (Official Entity Name)
                </label>
                <input
                  type="text"
                  value={settings.legalEntityNameAr}
                  onChange={(e) => setSettings({ ...settings, legalEntityNameAr: e.target.value })}
                  disabled={!canManageSettings}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم الكيان النظامي بالإنجليزية
                </label>
                <input
                  type="text"
                  value={settings.legalEntityNameEn}
                  onChange={(e) => setSettings({ ...settings, legalEntityNameEn: e.target.value })}
                  disabled={!canManageSettings}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم السجل التجاري (CR Number)
                </label>
                <input
                  type="text"
                  value={settings.crNumber}
                  onChange={(e) => setSettings({ ...settings, crNumber: e.target.value })}
                  disabled={!canManageSettings}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الرقم الضريبي (VAT Number)
                </label>
                <input
                  type="text"
                  value={settings.vatNumber}
                  onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
                  disabled={!canManageSettings}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Legal Contacts & DPO */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h5 className="font-bold text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Mail size={14} />
              <span>قنوات التواصل الرسمية ومسؤول حماية البيانات (DPO)</span>
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  البريد الرسمي للشؤون القانونية
                </label>
                <input
                  type="email"
                  value={settings.legalContactEmail}
                  onChange={(e) => setSettings({ ...settings, legalContactEmail: e.target.value })}
                  disabled={!canManageSettings}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  بريد مسؤول حماية البيانات (DPO Email)
                </label>
                <input
                  type="email"
                  value={settings.dpoEmail}
                  onChange={(e) => setSettings({ ...settings, dpoEmail: e.target.value })}
                  disabled={!canManageSettings}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  هاتف مسؤول حماية البيانات (DPO Phone)
                </label>
                <input
                  type="text"
                  value={settings.dpoPhone || ''}
                  onChange={(e) => setSettings({ ...settings, dpoPhone: e.target.value })}
                  placeholder="+966-11-400-0000"
                  disabled={!canManageSettings}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Address & Jurisdiction */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h5 className="font-bold text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Building size={14} />
              <span>المقر والنظام الواجب التطبيق</span>
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  العنوان الوطني ومقر الإدارة الرئيسية
                </label>
                <input
                  type="text"
                  value={settings.addressAr}
                  onChange={(e) => setSettings({ ...settings, addressAr: e.target.value })}
                  disabled={!canManageSettings}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  النظام الواجب التطبيق والاختصاص القضائي
                </label>
                <input
                  type="text"
                  value={settings.governingLawAr}
                  onChange={(e) => setSettings({ ...settings, governingLawAr: e.target.value })}
                  disabled={!canManageSettings}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: AUDIT LOG ================= */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History size={16} className="text-purple-600" />
                <span>سجل العمليات والتدقيق القانوني غير القابل للتعديل (Legal Audit Log)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                يوثق بدقة كل إجراء من أرشفة، استعادة، تقديم وتأخير الترتيب، وتعديل إعدادات الكوكيز والسياسات.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                placeholder="بحث في السجل أو المسؤول..."
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              />

              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                <option value="all">كافة العمليات ({auditLogs.length})</option>
                <option value="archived">أرشفة وثيقة</option>
                <option value="restored">استعادة إصدار</option>
                <option value="moved_up">تقديم ترتيب (Move Up)</option>
                <option value="moved_down">تأخير ترتيب (Move Down)</option>
                <option value="published">نشر رسمي</option>
                <option value="unpublished">إلغاء نشر</option>
                <option value="cookie_settings_updated">إعدادات الكوكيز</option>
                <option value="settings_updated">إعدادات النظام</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
            {filteredAuditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                لا توجد سجلات تدقيق مطابقة لمعايير البحث.
              </div>
            ) : (
              filteredAuditLogs.map(log => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                      <span>{log.details}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                      <span>المسؤول: <strong className="text-slate-600 dark:text-slate-300">{log.who}</strong> ({log.userRole || 'admin'})</span>
                      {log.documentTitle && <span>الوثيقة: <strong>{log.documentTitle}</strong></span>}
                      {log.version && <span>الإصدار: <strong className="font-mono text-purple-600">v{log.version}</strong></span>}
                      {log.previousState && log.newState && (
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                          {log.previousState} ➔ {log.newState}
                        </span>
                      )}
                      <span>التاريخ: {new Date(log.timestamp).toLocaleString('ar-SA')}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                      log.action === 'archived'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : log.action === 'restored'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : log.action === 'published'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                    }`}
                  >
                    {log.action}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB: EDITOR ================= */}
      {activeTab === 'editor' && editingDoc && (
        <div className="space-y-6">
          {/* Editor Header */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  محرر الوثائق القانونية
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {editingDoc.id}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingDoc.titleAr}
              </h3>
            </div>

            {/* Language & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEditorTabLang('ar')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    editorTabLang === 'ar'
                      ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  العربية (RTL)
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTabLang('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    editorTabLang === 'en'
                      ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  English (LTR)
                </button>
              </div>

              {canEdit && (
                <button
                  type="button"
                  onClick={() => handleSaveDocFromEditor(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>حفظ مسودة</span>
                </button>
              )}

              {canPublish && (
                <button
                  type="button"
                  onClick={() => handleSaveDocFromEditor(true)}
                  style={{ backgroundColor: brandPrimaryColor }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow hover:brightness-110 transition flex items-center gap-1.5"
                >
                  <CheckCircle size={14} />
                  <span>اعتماد ونشر رسمي</span>
                </button>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان الوثيقة ({editorTabLang === 'ar' ? 'بالعربية' : 'In English'})
              </label>
              <input
                type="text"
                value={editorTabLang === 'ar' ? editingDoc.titleAr : editingDoc.titleEn}
                onChange={(e) =>
                  setEditingDoc({
                    ...editingDoc,
                    [editorTabLang === 'ar' ? 'titleAr' : 'titleEn']: e.target.value
                  })
                }
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                رقم الإصدار (Version)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingDoc.version}
                  onChange={(e) => setEditingDoc({ ...editingDoc, version: e.target.value })}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleVersionBump('minor')}
                  className="px-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-purple-700 dark:text-purple-300 whitespace-nowrap hover:bg-slate-200"
                  title="رفع إصدار فرعي (+0.1)"
                >
                  +0.1
                </button>
                <button
                  type="button"
                  onClick={() => handleVersionBump('major')}
                  className="px-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-purple-700 dark:text-purple-300 whitespace-nowrap hover:bg-slate-200"
                  title="رفع إصدار رئيسي (+1.0)"
                >
                  +1.0
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تاريخ السريان والفاعلية
              </label>
              <input
                type="date"
                value={editingDoc.effectiveDate}
                onChange={(e) => setEditingDoc({ ...editingDoc, effectiveDate: e.target.value })}
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ملخص التعديلات في هذا الإصدار ({editorTabLang === 'ar' ? 'بالعربية' : 'In English'})
              </label>
              <input
                type="text"
                value={editorTabLang === 'ar' ? editingDoc.changeSummaryAr || '' : editingDoc.changeSummaryEn || ''}
                onChange={(e) =>
                  setEditingDoc({
                    ...editingDoc,
                    [editorTabLang === 'ar' ? 'changeSummaryAr' : 'changeSummaryEn']: e.target.value
                  })
                }
                placeholder="بيان أسباب التعديل أو المواد المستحدثة..."
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={16} className="text-purple-600" />
                <span>بنود ومواد الوثيقة ({editingDoc.sections.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 transition flex items-center gap-1"
              >
                <Plus size={13} />
                <span>إضافة مادة / بند جديد</span>
              </button>
            </div>

            {editingDoc.sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-mono font-bold">
                    البند #{idx + 1}
                  </span>
                  {editingDoc.sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(idx)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="حذف البند"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان البند ({editorTabLang === 'ar' ? 'بالعربية' : 'In English'})
                  </label>
                  <input
                    type="text"
                    value={editorTabLang === 'ar' ? sec.titleAr : sec.titleEn}
                    onChange={(e) =>
                      handleUpdateSection(
                        idx,
                        editorTabLang === 'ar' ? 'titleAr' : 'titleEn',
                        e.target.value
                      )
                    }
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نص البند والمقتضيات النظامية ({editorTabLang === 'ar' ? 'بالعربية' : 'In English'})
                  </label>
                  <textarea
                    rows={4}
                    value={editorTabLang === 'ar' ? sec.contentAr : sec.contentEn}
                    onChange={(e) =>
                      handleUpdateSection(
                        idx,
                        editorTabLang === 'ar' ? 'contentAr' : 'contentEn',
                        e.target.value
                      )
                    }
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 leading-relaxed font-sans"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= ARCHIVE CONFIRMATION MODAL ================= */}
      <AdminArchiveConfirmModal
        document={archiveModalDoc}
        isOpen={!!archiveModalDoc}
        onClose={() => setArchiveModalDoc(null)}
        onConfirmArchive={handleConfirmArchive}
        brandPrimaryColor={brandPrimaryColor}
      />

      {/* ================= VERSION HISTORY & RESTORE MODAL ================= */}
      <AdminVersionHistoryModal
        document={versionModalState.doc}
        version={versionModalState.version}
        isOpen={versionModalState.isOpen}
        mode={versionModalState.mode}
        onClose={() => setVersionModalState({ isOpen: false, mode: 'view', doc: null, version: null })}
        onConfirmRestore={handleConfirmRestoreVersion}
        brandPrimaryColor={brandPrimaryColor}
      />
    </div>
  );
}

export default AdminLegalManager;
