export type LegalDocumentStatus = 'published' | 'draft' | 'archived';

export type PrivacyRequestType = 
  | 'access' 
  | 'correction' 
  | 'deletion' 
  | 'export' 
  | 'objection'
  | 'other';

export type PrivacyRequestStatus = 
  | 'new' 
  | 'in_review' 
  | 'waiting_user' 
  | 'resolved' 
  | 'rejected';

export interface LegalDocumentSection {
  id: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  subsections?: {
    id: string;
    titleAr: string;
    titleEn: string;
    contentAr: string;
    contentEn: string;
  }[];
}

export interface LegalDocumentVersion {
  id: string;
  docId: string;
  version: string;
  effectiveDate: string;
  publishedAt: string;
  publishedBy: string;
  changeSummaryAr: string;
  changeSummaryEn: string;
  status: LegalDocumentStatus;
  sections: LegalDocumentSection[];
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
}

export interface LegalDocument {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  category: 'terms' | 'privacy' | 'security' | 'compliance' | 'notices';
  version: string;
  status: LegalDocumentStatus;
  effectiveDate: string;
  lastUpdated: string;
  publishedAt?: string;
  publishedBy?: string;
  order: number;
  showInFooter: boolean;
  requiresAcceptance: boolean;
  changeSummaryAr?: string;
  changeSummaryEn?: string;
  sections: LegalDocumentSection[];
  versionHistory?: LegalDocumentVersion[];
}

export interface PrivacyRequest {
  id: string;
  requestType: PrivacyRequestType;
  fullName: string;
  email: string;
  organization?: string;
  phone?: string;
  details: string;
  status: PrivacyRequestStatus;
  createdAt: string;
  assignedAdmin?: string;
  internalNotes?: string;
  resolutionDate?: string;
  resolutionSummary?: string;
  ipAddress?: string;
  verificationConfirmed: boolean;
}

export interface LegalSettings {
  companyNameAr: string;
  companyNameEn: string;
  productNameAr?: string;
  productNameEn?: string;
  legalEntityNameAr: string;
  legalEntityNameEn: string;
  crNumber: string;
  vatNumber: string;
  legalContactEmail: string;
  privacyEmail: string;
  supportEmail: string;
  dpoName?: string;
  dpoEmail?: string;
  dpoPhone?: string;
  countryAr: string;
  countryEn: string;
  addressAr: string;
  addressEn: string;
  effectiveDate: string;
  defaultLanguage: 'ar' | 'en';
  availableLanguages: ('ar' | 'en')[];
  governingLawAr: string;
  governingLawEn: string;
  jurisdictionAr: string;
  jurisdictionEn: string;
}

export type LegalAuditAction = 
  | 'created' 
  | 'edited' 
  | 'draft_saved'
  | 'published' 
  | 'unpublished' 
  | 'version_duplicated'
  | 'archived' 
  | 'restored' 
  | 'moved_up'
  | 'moved_down'
  | 'reordered'
  | 'cookie_settings_updated'
  | 'settings_updated'
  | 'privacy_request_status'
  | 'privacy_request_resolved'
  | 'dsr_processed';

export interface LegalAuditLog {
  id: string;
  who: string;
  userEmail?: string;
  userRole?: string;
  action: LegalAuditAction;
  documentId?: string;
  documentTitle?: string;
  version?: string;
  timestamp: string;
  previousStatus?: string;
  newStatus?: string;
  previousState?: string;
  newState?: string;
  details: string;
}

export interface CookieCategoryConfig {
  id: 'essential' | 'analytics' | 'functional' | 'marketing';
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  enabled: boolean;
  required: boolean; // true for essential, cannot be turned off
  retentionAr: string;
  retentionEn: string;
}

export interface CookieAdminSettings {
  categories: {
    essential: CookieCategoryConfig;
    analytics: CookieCategoryConfig;
    functional: CookieCategoryConfig;
    marketing: CookieCategoryConfig;
  };
  bannerTitleAr: string;
  bannerTitleEn: string;
  bannerMessageAr: string;
  bannerMessageEn: string;
  consentLifetimeDays: number;
  updatedAt: string;
  updatedBy: string;
}

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  consentedAt: string;
  version: string;
}

export interface LegalAcceptanceRecord {
  id: string;
  userId?: string;
  userEmail?: string;
  organizationId?: string;
  documentId: string;
  documentVersion: string;
  acceptedAt: string;
  acceptanceType: 'signup' | 'subscription' | 'checkout' | 'terms_update';
  userAgent?: string;
}
