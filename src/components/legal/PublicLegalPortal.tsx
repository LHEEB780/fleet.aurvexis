import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  FileText,
  Search,
  ChevronRight,
  ChevronLeft,
  Calendar,
  CheckCircle,
  Globe,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Lock,
  Scale,
  Users,
  AlertCircle,
  Check,
  Building,
  Mail,
  HelpCircle,
  Sparkles,
  Printer
} from 'lucide-react';
import { LegalDocument, LegalSettings } from '../../types/legal';
import {
  getStoredLegalDocuments,
  getStoredLegalSettings
} from '../../data/legalDocumentsData';
import { PrivacyRequestModal } from './PrivacyRequestModal';

interface PublicLegalPortalProps {
  initialDocId?: string;
  onClose: () => void;
  brandPrimaryColor?: string;
  isDark?: boolean;
}

export function PublicLegalPortal({
  initialDocId = 'privacy-policy',
  onClose,
  brandPrimaryColor = '#6366f1',
  isDark = false
}: PublicLegalPortalProps) {
  const [documents, setDocuments] = useState<LegalDocument[]>(() => getStoredLegalDocuments());
  const [settings, setSettings] = useState<LegalSettings>(() => getStoredLegalSettings());
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('');

  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  // Listen for storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setDocuments(getStoredLegalDocuments());
      setSettings(getStoredLegalSettings());
    };
    window.addEventListener('fleet_legal_documents_updated', handleUpdate);
    window.addEventListener('fleet_legal_settings_updated', handleUpdate);
    return () => {
      window.removeEventListener('fleet_legal_documents_updated', handleUpdate);
      window.removeEventListener('fleet_legal_settings_updated', handleUpdate);
    };
  }, []);

  // Filter only published documents for public view
  const publishedDocs = useMemo(() => {
    return documents
      .filter(d => d.status === 'published')
      .sort((a, b) => a.order - b.order);
  }, [documents]);

  const activeDoc = useMemo(() => {
    const found = publishedDocs.find(d => d.id === selectedDocId || d.slug === selectedDocId);
    return found || publishedDocs[0] || null;
  }, [publishedDocs, selectedDocId]);

  // Set default active section
  useEffect(() => {
    if (activeDoc?.sections?.length > 0) {
      setActiveSectionId(activeDoc.sections[0].id);
    }
  }, [activeDoc]);

  // Scroll to top when changing document
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedDocId]);

  // Filtered sections based on in-page search
  const filteredSections = useMemo(() => {
    if (!activeDoc) return [];
    if (!searchQuery.trim()) return activeDoc.sections;

    const q = searchQuery.toLowerCase();
    return activeDoc.sections.filter(sec => {
      const title = (isAr ? sec.titleAr : sec.titleEn).toLowerCase();
      const content = (isAr ? sec.contentAr : sec.contentEn).toLowerCase();
      return title.includes(q) || content.includes(q);
    });
  }, [activeDoc, searchQuery, isAr]);

  const scrollToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!activeDoc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
        <p>لا توجد مستندات قانونية منشورة حالياً.</p>
      </div>
    );
  }

  const docTitle = isAr ? activeDoc.titleAr : activeDoc.titleEn;
  const docSummary = isAr ? activeDoc.summaryAr : activeDoc.summaryEn;
  const companyName = isAr ? settings.legalEntityNameAr : settings.legalEntityNameEn;
  const formattedDate = new Date(activeDoc.lastUpdated || activeDoc.effectiveDate).toLocaleDateString(
    isAr ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div
      id="public-legal-portal"
      dir={dir}
      className={`min-h-screen ${
        isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      } transition-colors duration-200`}
    >
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Portal Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-medium"
              title={isAr ? 'العودة للموقع التسويقي' : 'Return to website'}
            >
              {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              <span className="hidden sm:inline">{isAr ? 'العودة للرئيسية' : 'Back to Home'}</span>
            </button>
            <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: brandPrimaryColor }}
              >
                <Shield size={18} />
              </div>
              <div>
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white block leading-tight">
                  {settings.companyNameAr || 'FleetAurvexis'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                  {isAr ? 'مركز الامتثال والشؤون القانونية' : 'Legal & Compliance Center'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls: Language & Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLang(isAr ? 'en' : 'ar')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
            >
              <Globe size={14} className="text-purple-600 dark:text-purple-400" />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </button>

            {/* DSR Request Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 transition"
            >
              <Lock size={13} />
              <span>{isAr ? 'طلب حقوق الخصوصية (DSR)' : 'Privacy Rights Request'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar: Document Switcher (col-span-3) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Scale size={14} />
                  <span>{isAr ? 'المستندات والسياسات' : 'Policies & Agreements'}</span>
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                  {publishedDocs.length}
                </span>
              </div>

              <nav className="space-y-1 max-h-[65vh] overflow-y-auto pr-1">
                {publishedDocs.map(doc => {
                  const isSelected = doc.id === activeDoc.id;
                  const title = isAr ? doc.titleAr : doc.titleEn;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        setSelectedDocId(doc.id);
                        setSearchQuery('');
                      }}
                      className={`w-full text-right p-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800/80 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText
                          size={14}
                          className={`shrink-0 ${
                            isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{title}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                        v{doc.version}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* DPO Quick Box */}
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building size={14} />
                  <span>{isAr ? 'الجهة الرسمية المعتمدة:' : 'Official Legal Entity:'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {companyName}
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400">
                  <Mail size={12} />
                  <span>{settings.legalContactEmail}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Document Viewer (col-span-6 or col-span-9 depending on ToC) */}
          <main className="lg:col-span-6 space-y-6">
            {/* Document Hero & Metadata Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              {/* Top Accent Gradient Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: brandPrimaryColor }}
              />

              {/* Category & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                    {activeDoc.category.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle size={12} />
                    <span>{isAr ? 'إصدار رسمي سارٍ' : 'Active Valid Version'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar size={13} />
                  <span>
                    {isAr ? 'آخر تحديث:' : 'Last updated:'} {formattedDate}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
                {docTitle}
              </h1>

              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                <span className="font-bold block text-slate-900 dark:text-white mb-1">
                  {isAr ? 'الملخص التنفيذي للسياسة:' : 'Executive Summary:'}
                </span>
                {docSummary}
              </div>

              {/* Certified Version Info */}
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>{isAr ? 'رقم الإصدار المعتمد:' : 'Certified Version:'}</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  v{activeDoc.version}
                </span>
              </div>
            </div>

            {/* In-page Search Bar */}
            <div className="relative">
              <Search
                size={16}
                className={`absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-3 text-slate-400`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAr
                    ? 'البحث في بنود ومواد هذه الوثيقة...'
                    : 'Search sections within this policy...'
                }
                className={`w-full ${
                  isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'
                } py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm text-slate-800 dark:text-slate-100`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`absolute ${isAr ? 'left-3' : 'right-3'} top-2.5 text-xs text-slate-400 hover:text-slate-600`}
                >
                  {isAr ? 'مسح' : 'Clear'}
                </button>
              )}
            </div>

            {/* Document Sections */}
            <div className="space-y-6">
              {filteredSections.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
                  <HelpCircle size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {isAr
                      ? 'لا توجد بنود تطابق كلمات البحث المدخلة.'
                      : 'No sections match your search query.'}
                  </p>
                </div>
              ) : (
                filteredSections.map(sec => {
                  const secTitle = isAr ? sec.titleAr : sec.titleEn;
                  const secContent = isAr ? sec.contentAr : sec.contentEn;
                  return (
                    <section
                      key={sec.id}
                      id={sec.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm scroll-mt-24 transition-all"
                    >
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span>{secTitle}</span>
                        <a
                          href={`#${sec.id}`}
                          onClick={() => setActiveSectionId(sec.id)}
                          className="text-xs text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                          title={isAr ? 'رابط مباشر للبند' : 'Direct link'}
                        >
                          #
                        </a>
                      </h2>

                      <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 text-justify whitespace-pre-line">
                        {secContent}
                      </div>
                    </section>
                  );
                })
              )}
            </div>

            {/* Bottom Actions & Footer Card */}
            <div className="bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  {isAr ? 'هل لديك أي استفسار قانوني؟' : 'Have a legal inquiry?'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? 'فريق الامتثال ومسؤول حماية البيانات متاح للإجابة وتقديم التوضيحات.'
                    : 'Our compliance team and DPO are ready to assist.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-750 border border-purple-200 dark:border-purple-800 shadow-xs transition"
                >
                  {isAr ? 'تقديم طلب خصوصية' : 'Submit Privacy Request'}
                </button>
              </div>
            </div>
          </main>

          {/* Right Sidebar: Sticky Table of Contents (col-span-3) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24 space-y-4">
              <div className="px-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isAr ? 'فهرس بنود الوثيقة' : 'Table of Contents'}
                </h3>
              </div>

              <nav className="space-y-1 max-h-[55vh] overflow-y-auto pr-1">
                {activeDoc.sections.map(sec => {
                  const secTitle = isAr ? sec.titleAr : sec.titleEn;
                  const isActive = activeSectionId === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full text-right p-2 rounded-xl text-xs transition text-left block truncate ${
                        isActive
                          ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold border-r-2 border-purple-600'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                      style={{ textAlign: isAr ? 'right' : 'left' }}
                    >
                      <span className="truncate block">{secTitle}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Legal Disclaimers */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <Shield size={13} className="text-emerald-600" />
                  <span>{isAr ? 'الامتثال المعتمد:' : 'Regulatory Compliance:'}</span>
                </div>
                <p className="leading-relaxed">
                  {isAr
                    ? 'متوافق مع نظام حماية البيانات الشخصية السعودي (PDPL) واللائحة العامة لحماية البيانات (GDPR).'
                    : 'Compliant with Saudi PDPL and international GDPR standards.'}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* DSR Privacy Request Modal */}
      <PrivacyRequestModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        brandPrimaryColor={brandPrimaryColor}
        defaultType={activeDoc.id === 'account-deletion' ? 'deletion' : 'access'}
      />
    </div>
  );
}

export default PublicLegalPortal;
