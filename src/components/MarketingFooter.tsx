import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Shield, 
  ShieldCheck, 
  Scale, 
  Lock, 
  FileCheck, 
  Cookie, 
  ExternalLink, 
  ChevronDown, 
  CheckCircle2, 
  Sparkles,
  Building,
  Mail,
  Sliders,
  HelpCircle,
  ChevronsUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FleetAurvexisVectorEmblem } from './FleetAurvexisLogo';
import { LegalDocument } from '../types/legal';

export interface FooterColumnItem {
  id: string;
  labelAr: string;
  labelEn: string;
}

export interface FooterColumn {
  id: string;
  titleAr: string;
  titleEn: string;
  items: FooterColumnItem[];
}

export interface MarketingFooterProps {
  footerColumnsList: FooterColumn[];
  language: 'ar' | 'en';
  effectiveBrandName: string;
  brandName?: string;
  footerLegalDocs: LegalDocument[];
  onNavigateToLegal?: (docId?: string) => void;
  onNavigateToSuperAdmin?: () => void;
  onItemClick: (e: React.MouseEvent, item: FooterColumnItem) => void;
  onShowSignup?: () => void;
}

interface LegalCategoryMeta {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  badgeAr: string;
  badgeEn: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  categories: Array<'terms' | 'privacy' | 'security' | 'compliance' | 'notices'>;
  action?: {
    id: string;
    labelAr: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    onClick: () => void;
  };
}

export default function MarketingFooter({
  footerColumnsList,
  language,
  effectiveBrandName,
  brandName = '',
  footerLegalDocs,
  onNavigateToLegal,
  onNavigateToSuperAdmin,
  onItemClick,
  onShowSignup
}: MarketingFooterProps) {
  const isAr = language === 'ar';

  // Mobile Accordion State for Legal Categories (Collapsed by default on mobile)
  const [expandedLegalCategories, setExpandedLegalCategories] = useState<Record<string, boolean>>({});

  // Mobile Accordion State for General Footer Navigation Columns (Collapsed by default on mobile)
  const [expandedNavColumns, setExpandedNavColumns] = useState<Record<string, boolean>>({});

  const handleOpenDoc = (docId: string) => {
    if (onNavigateToLegal) {
      onNavigateToLegal(docId);
    } else {
      window.dispatchEvent(new CustomEvent('open-legal-portal', { detail: { docId } }));
    }
  };

  const handleOpenCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent('open_cookie_preferences'));
  };

  const handleOpenPrivacyRequest = () => {
    if (onNavigateToLegal) {
      onNavigateToLegal('privacy-policy');
    } else {
      window.dispatchEvent(new CustomEvent('open-legal-portal', { detail: { docId: 'privacy-policy' } }));
    }
  };

  const handleOpenFullLegalHub = () => {
    if (onNavigateToLegal) {
      onNavigateToLegal('terms-of-service');
    } else {
      window.dispatchEvent(new CustomEvent('open-legal-portal', { detail: { docId: 'terms-of-service' } }));
    }
  };

  // Define categorized legal columns metadata
  const legalCategories: LegalCategoryMeta[] = useMemo(() => [
    {
      id: 'legal-cat-terms',
      titleAr: 'الشروط والتراخيص',
      titleEn: 'Terms & Licensing',
      descAr: 'اتفاقيات الاستخدام والتراخيص السحابية الرسمية',
      descEn: 'Cloud agreements & binding commercial terms',
      badgeAr: 'ملزمة تعاقدياً',
      badgeEn: 'Binding SLA',
      icon: Scale,
      categories: ['terms'],
      action: {
        id: 'action-view-all-terms',
        labelAr: 'بوابة الشروط والتعاقد',
        labelEn: 'Cloud Terms Hub',
        icon: ExternalLink,
        onClick: () => handleOpenDoc('terms-of-service')
      }
    },
    {
      id: 'legal-cat-privacy',
      titleAr: 'الخصوصية وحماية البيانات',
      titleEn: 'Privacy & Data Protection',
      descAr: 'نظام حماية البيانات الشخصية (PDPL) والمعايير العالمية',
      descEn: 'Saudi PDPL & international data sovereignty',
      badgeAr: 'معتمد PDPL',
      badgeEn: 'PDPL Certified',
      icon: ShieldCheck,
      categories: ['privacy'],
      action: {
        id: 'action-cookie-prefs',
        labelAr: 'تفضيلات الكوكيز',
        labelEn: 'Cookie Settings',
        icon: Cookie,
        onClick: handleOpenCookiePreferences
      }
    },
    {
      id: 'legal-cat-compliance',
      titleAr: 'الامتثال ومعالجة البيانات',
      titleEn: 'Compliance & Processing',
      descAr: 'اتفاقيات DPA وسجلات المعالجين الفرعيين والأرشفة',
      descEn: 'DPA, sub-processors register & retention rules',
      badgeAr: 'تدقيق نظامي',
      badgeEn: 'Audit Ready',
      icon: FileCheck,
      categories: ['compliance'],
      action: {
        id: 'action-dsar-request',
        labelAr: 'ممارسة حقوق الخصوصية (DSAR)',
        labelEn: 'Data Subject Rights (DSAR)',
        icon: Sliders,
        onClick: handleOpenPrivacyRequest
      }
    },
    {
      id: 'legal-cat-security',
      titleAr: 'الأمن والإفصاحات الرسمية',
      titleEn: 'Security & Legal Notices',
      descAr: 'ضوابط الأمن السيبراني والإشعارات التنظيمية وتواصل DPO',
      descEn: 'Cybersecurity controls, disclosures & DPO desk',
      badgeAr: 'تشفير AES-256',
      badgeEn: 'AES-256 SSL',
      icon: Lock,
      categories: ['security', 'notices'],
      action: {
        id: 'action-legal-portal',
        labelAr: 'البوابة القانونية الشاملة',
        labelEn: 'All Legal Documents',
        icon: FileText,
        onClick: handleOpenFullLegalHub
      }
    }
  ], [isAr]);

  // Group published documents into each category
  const categorizedLegalDocs = useMemo(() => {
    return legalCategories.map((catMeta) => {
      const docs = footerLegalDocs.filter((doc) =>
        catMeta.categories.includes(doc.category as any)
      );
      return {
        ...catMeta,
        docs
      };
    });
  }, [legalCategories, footerLegalDocs]);

  // Toggle mobile accordion for legal categories
  const toggleLegalCategory = (catId: string) => {
    setExpandedLegalCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Toggle mobile accordion for general nav columns
  const toggleNavColumn = (colId: string) => {
    setExpandedNavColumns((prev) => ({
      ...prev,
      [colId]: !prev[colId]
    }));
  };

  // Expand / Collapse all legal categories on mobile
  const allLegalExpanded = useMemo(() => {
    return legalCategories.every((cat) => !!expandedLegalCategories[cat.id]);
  }, [legalCategories, expandedLegalCategories]);

  const handleToggleAllLegal = () => {
    if (allLegalExpanded) {
      setExpandedLegalCategories({});
    } else {
      const all: Record<string, boolean> = {};
      legalCategories.forEach((cat) => {
        all[cat.id] = true;
      });
      setExpandedLegalCategories(all);
    }
  };

  return (
    <footer 
      id="main-app-footer"
      className="bg-gradient-to-b from-[#4c1d95] via-[#3b0764] to-[#2e1065] text-purple-100/90 text-xs py-14 sm:py-16 border-t border-purple-400/30 mt-auto relative overflow-hidden"
    >
      {/* Ambient Gradient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 relative z-10">
        
        {/* ==================================================================== */}
        {/* SECTION 1: Product & Solution Navigation Columns */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {footerColumnsList.map((col) => {
            const isNavOpen = !!expandedNavColumns[col.id];
            return (
              <div 
                key={col.id} 
                className="rounded-2xl sm:rounded-none bg-purple-950/25 sm:bg-transparent border border-purple-500/20 sm:border-none p-3.5 sm:p-0 transition-colors"
              >
                {/* Header (Acts as Accordion Toggle on Mobile, Static Header on sm+) */}
                <button
                  type="button"
                  id={`nav-col-header-${col.id}`}
                  onClick={() => toggleNavColumn(col.id)}
                  className="w-full flex items-center justify-between sm:pointer-events-none text-start sm:mb-4 cursor-pointer sm:cursor-default group"
                  aria-expanded={isNavOpen}
                >
                  <h4 className="font-extrabold text-white text-[12px] uppercase tracking-wider flex items-center gap-2 drop-shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-purple-300 shadow-xs shadow-purple-300/60 shrink-0"></span>
                    <span className="font-bold">{isAr ? col.titleAr : col.titleEn}</span>
                  </h4>
                  {/* Mobile-only Chevron Indicator */}
                  <div className="sm:hidden p-1 rounded-lg text-purple-300 group-hover:text-white transition-colors">
                    <ChevronDown 
                      size={16} 
                      className={`transform transition-transform duration-200 ${isNavOpen ? 'rotate-180 text-white' : ''}`}
                    />
                  </div>
                </button>

                {/* Items List (Responsive Accordion on Mobile, Always Block on sm+) */}
                <div className={`${isNavOpen ? 'block pt-3 sm:pt-0' : 'hidden sm:block'}`}>
                  <ul className="space-y-2 text-[11px] leading-relaxed border-t sm:border-t-0 border-purple-500/15 pt-2 sm:pt-0">
                    {col.items.map((item) => (
                      <li key={item.id}>
                        <a 
                          href="#/" 
                          id={`footer-link-${item.id}`}
                          onClick={(e) => onItemClick(e, item)}
                          className="text-purple-200/85 hover:text-white hover:translate-x-1 rtl:hover:-translate-x-1 transition-all inline-block font-medium py-0.5"
                        >
                          {isAr 
                            ? (item.id === 'item-4-1' ? `نبذة عن شركة ${brandName || effectiveBrandName}` : (item.labelAr || '').replace(/ميكانيك 360/g, brandName || effectiveBrandName))
                            : (item.id === 'item-4-1' ? `About ${brandName || effectiveBrandName}` : (item.labelEn || '').replace(/Mechanic 360/g, brandName || effectiveBrandName))
                          }
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* ==================================================================== */}
        {/* SECTION 2: Refactored Categorized Legal & Regulatory Policy Columns */}
        {/* ==================================================================== */}
        <div id="legal-policies-footer-section" className="border-t border-purple-500/25 pt-10 space-y-6">
          
          {/* Section Heading & Mobile Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-200 shrink-0">
                <Shield size={16} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>{isAr ? 'السياسات والامتثال النظامي' : 'Legal & Regulatory Policies'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40">
                    {footerLegalDocs.length} {isAr ? 'وثائق معتمدة' : 'Verified Docs'}
                  </span>
                </h3>
                <p className="text-[11px] text-purple-300/80">
                  {isAr 
                    ? 'منظومة السياسات المؤسسية وحماية البيانات متوافقة كلياً مع الأنظمة السارية بالمملكة'
                    : 'Enterprise governance & data privacy aligned with regulatory frameworks'}
                </p>
              </div>
            </div>

            {/* Mobile-only Expand/Collapse All Button */}
            <div className="flex items-center gap-2 sm:hidden pt-1">
              <button
                type="button"
                id="toggle-all-legal-mobile-btn"
                onClick={handleToggleAllLegal}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-[11px] font-bold cursor-pointer transition-colors active:scale-95"
              >
                <ChevronsUpDown size={14} />
                <span>
                  {allLegalExpanded 
                    ? (isAr ? 'طي كافة فئات السياسات' : 'Collapse All Policy Categories') 
                    : (isAr ? 'عرض كافة فئات السياسات' : 'Expand All Policy Categories')}
                </span>
              </button>
            </div>
          </div>

          {/* Categorized Legal Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {categorizedLegalDocs.map((cat) => {
              const isExpanded = !!expandedLegalCategories[cat.id];
              const IconComponent = cat.icon;
              const ActionIcon = cat.action?.icon;

              return (
                <div
                  key={cat.id}
                  id={`legal-column-${cat.id}`}
                  className="rounded-2xl bg-purple-950/40 border border-purple-500/25 p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between group hover:border-purple-400/45 hover:bg-purple-950/60 shadow-sm"
                >
                  <div>
                    {/* Category Header */}
                    <button
                      type="button"
                      id={`legal-accordion-btn-${cat.id}`}
                      onClick={() => toggleLegalCategory(cat.id)}
                      className="w-full flex items-center justify-between text-start cursor-pointer md:cursor-default group/header"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-200 flex items-center justify-center shrink-0 group-hover/header:text-white transition-colors">
                          <IconComponent size={14} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-white text-xs sm:text-[12.5px] truncate">
                            {isAr ? cat.titleAr : cat.titleEn}
                          </h4>
                          <span className="text-[10px] text-purple-300/75 block truncate">
                            {cat.docs.length} {isAr ? 'سياسات نظامية' : 'policies'}
                          </span>
                        </div>
                      </div>

                      {/* Header Right: Badge on Desktop + Chevron on Mobile */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline-block text-[9.5px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-200 border border-purple-400/30 whitespace-nowrap">
                          {isAr ? cat.badgeAr : cat.badgeEn}
                        </span>
                        {/* Mobile Chevron */}
                        <div className="md:hidden w-6 h-6 rounded-md bg-purple-900/60 flex items-center justify-center text-purple-300">
                          <ChevronDown 
                            size={14} 
                            className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180 text-white' : ''}`}
                          />
                        </div>
                      </div>
                    </button>

                    {/* Policy Links List: Collapsed on Mobile, Always Visible on Desktop (md:block) */}
                    <div 
                      id={`legal-links-list-${cat.id}`}
                      className={`pt-3.5 space-y-2 border-t border-purple-500/20 mt-3 ${
                        isExpanded ? 'block' : 'hidden md:block'
                      }`}
                    >
                      {cat.docs.length === 0 ? (
                        <p className="text-[10.5px] text-purple-300/60 italic py-1">
                          {isAr ? 'لا توجد وثائق معلنة حالياً' : 'No published policies yet'}
                        </p>
                      ) : (
                        <ul className="space-y-1.5">
                          {cat.docs.map((doc) => (
                            <li key={doc.id}>
                              <button
                                type="button"
                                id={`legal-doc-btn-${doc.id}`}
                                onClick={() => handleOpenDoc(doc.id)}
                                className="w-full text-start py-1.5 px-2 rounded-lg text-purple-200/90 hover:text-white hover:bg-purple-900/40 text-[11px] font-medium transition-all flex items-center justify-between group/link cursor-pointer"
                              >
                                <span className="truncate pr-2 rtl:pr-0 rtl:pl-2 group-hover/link:translate-x-0.5 rtl:group-hover/link:-translate-x-0.5 transition-transform">
                                  {isAr ? doc.titleAr : doc.titleEn}
                                </span>
                                {doc.version && (
                                  <span className="text-[9px] font-mono text-purple-300/60 group-hover/link:text-purple-200 shrink-0 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/20">
                                    v{doc.version}
                                  </span>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Category Bottom Action Button */}
                  {cat.action && (
                    <div className={`pt-3 mt-3 border-t border-purple-500/20 ${isExpanded ? 'block' : 'hidden md:block'}`}>
                      <button
                        type="button"
                        id={`legal-action-btn-${cat.action.id}`}
                        onClick={cat.action.onClick}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-purple-900/30 hover:bg-purple-900/60 text-purple-200 hover:text-white text-[10.5px] font-bold border border-purple-500/25 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                      >
                        {ActionIcon && <ActionIcon size={12} className="shrink-0 text-purple-300" />}
                        <span className="truncate">{isAr ? cat.action.labelAr : cat.action.labelEn}</span>
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Trust, Security & Regulatory Compliance Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-purple-200/90 font-medium">
              <span className="inline-flex items-center gap-1.5 text-white font-bold">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                {isAr ? 'الامتثال لأنظمة المملكة:' : 'KSA Regulatory Alignment:'}
              </span>
              <span className="bg-purple-900/60 px-2 py-0.5 rounded-md border border-purple-400/30 font-mono text-[10px]">
                {isAr ? 'نظام حماية البيانات الشخصية (PDPL)' : 'Personal Data Protection Law'}
              </span>
              <span className="bg-purple-900/60 px-2 py-0.5 rounded-md border border-purple-400/30 font-mono text-[10px]">
                {isAr ? 'تشفير السحاب TLS 1.3 / AES-256' : 'Cloud TLS 1.3 / AES-256'}
              </span>
              <span className="bg-purple-900/60 px-2 py-0.5 rounded-md border border-purple-400/30 font-mono text-[10px]">
                {isAr ? 'استضافة سحابية وتوطين البيانات' : 'Local Data Sovereignty'}
              </span>
            </div>

            <button
              type="button"
              id="open-privacy-dpo-btn"
              onClick={handleOpenPrivacyRequest}
              className="text-purple-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors text-[11px] underline underline-offset-4"
            >
              <span>{isAr ? 'مكتب مسؤول حماية البيانات (DPO)' : 'DPO Inquiries'}</span>
              <ExternalLink size={12} />
            </button>
          </div>

        </div>

        {/* ==================================================================== */}
        {/* SECTION 3: Bottom-most Copyright & Super Admin Bar */}
        {/* ==================================================================== */}
        <div className="border-t border-purple-500/25 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-purple-200/70 font-medium">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl overflow-hidden border border-purple-400/40 shadow-xs shrink-0 bg-[#090D16] p-0.5">
              <FleetAurvexisVectorEmblem className="w-full h-full" />
            </div>
            <span className="font-mono text-white tracking-widest font-black text-xs">
              {effectiveBrandName.toUpperCase()}
            </span>
            <span>
              © {new Date().getFullYear()} {effectiveBrandName}. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-purple-300/70 text-[10.5px]">
            <button
              type="button"
              id="footer-cookie-prefs-direct-btn"
              onClick={handleOpenCookiePreferences}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {isAr ? 'إعدادات الكوكيز' : 'Cookie Preferences'}
            </button>
            <span>•</span>
            <button
              type="button"
              id="footer-legal-hub-direct-btn"
              onClick={handleOpenFullLegalHub}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {isAr ? 'فهرس السياسات' : 'Policy Index'}
            </button>
            <span>•</span>
            <span>{isAr ? 'منظومة الحوكمة والامتثال المعتمدة' : 'Verified Governance'}</span>
            {onNavigateToSuperAdmin && (
              <button
                type="button"
                id="footer-super-admin-btn"
                onClick={onNavigateToSuperAdmin}
                className="opacity-30 hover:opacity-100 transition-opacity p-1 text-purple-300 hover:text-white rounded-sm hover:bg-purple-900/40 cursor-pointer"
                title={isAr ? 'مدير المنصة (Super Admin)' : 'Super Admin Portal'}
              >
                <Lock size={11} />
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
