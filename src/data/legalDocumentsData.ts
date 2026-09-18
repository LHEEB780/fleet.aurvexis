import { LegalDocument, LegalSettings, CookieAdminSettings, LegalAuditLog } from '../types/legal';

export const DEFAULT_LEGAL_SETTINGS: LegalSettings = {
  companyNameAr: 'FleetAurvexis',
  companyNameEn: 'FleetAurvexis',
  productNameAr: 'منصة فليت أورفيكسيس لإدارة الأساطيل والصيانة الذكية',
  productNameEn: 'FleetAurvexis Smart Fleet & Maintenance Platform',
  legalEntityNameAr: 'شركة فليت أورفيكسيس لحلول تقنية المعلومات المحدودة',
  legalEntityNameEn: 'FleetAurvexis Information Technology Solutions LLC',
  crNumber: '1010894231',
  vatNumber: '310984210900003',
  legalContactEmail: 'legal@fleetaurvexis.com',
  privacyEmail: 'privacy@fleetaurvexis.com',
  supportEmail: 'support@fleetaurvexis.com',
  dpoName: 'مسؤول حماية البيانات والامتثال (DPO)',
  dpoEmail: 'dpo@fleetaurvexis.com',
  dpoPhone: '+966 11 498 2000',
  countryAr: 'المملكة العربية السعودية',
  countryEn: 'Kingdom of Saudi Arabia',
  addressAr: 'طريق الملك فهد، حي الصحافة، ص.ب 13321، الرياض، المملكة العربية السعودية',
  addressEn: 'King Fahd Road, Al-Sahafa District, P.O. Box 13321, Riyadh, Kingdom of Saudi Arabia',
  effectiveDate: '2026-01-01',
  defaultLanguage: 'ar',
  availableLanguages: ['ar', 'en'],
  governingLawAr: 'الأنظمة واللوائح السارية في المملكة العربية السعودية بما فيها نظام حماية البيانات الشخصية (PDPL)',
  governingLawEn: 'The laws and regulations of the Kingdom of Saudi Arabia, including the Personal Data Protection Law (PDPL)',
  jurisdictionAr: 'المحاكم المختصة في مدينة الرياض، المملكة العربية السعودية',
  jurisdictionEn: 'Competent courts in the city of Riyadh, Kingdom of Saudi Arabia'
};

export const DEFAULT_LEGAL_DOCUMENTS: LegalDocument[] = [
  // 1. Privacy Policy
  {
    id: 'privacy-policy',
    slug: 'privacy-policy',
    titleAr: 'سياسة الخصوصية وحماية البيانات الشخصية',
    titleEn: 'Privacy & Personal Data Protection Policy',
    summaryAr: 'توضح هذه السياسة كيفية جمع البيانات ومعالجتها وتخزينها ومشاركتها عند استخدام منصة FleetAurvexis، وحقوق أصحاب البيانات وفق نظام حماية البيانات الشخصية (PDPL) والمعايير العالمية.',
    summaryEn: 'This policy explains how data is collected, processed, stored, and shared when using FleetAurvexis, detailing data subject rights under applicable data protection laws including PDPL and GDPR.',
    category: 'privacy',
    version: '1.2.0',
    status: 'published',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-08-15',
    publishedAt: '2026-01-01T08:00:00Z',
    publishedBy: 'الإدارة القانونية ومكتب الامتثال',
    order: 1,
    showInFooter: true,
    requiresAcceptance: true,
    changeSummaryAr: 'تحديث بنود الامتثال لنظام حماية البيانات الشخصية ولائحته التنفيذية وتوضيح قنوات طلبات أصحاب البيانات.',
    changeSummaryEn: 'Updated compliance provisions under Personal Data Protection Law (PDPL) and detailed Data Subject Request channels.',
    sections: [
      {
        id: 'sec-1',
        titleAr: '١. النطاق والجهة المسؤولة عن التحكم بالبيانات',
        titleEn: '1. Scope & Data Controller Identification',
        contentAr: 'تنطبق هذه السياسة على كافة مستخدمي منصة FleetAurvexis السحابية وزوار موقعها الإلكتروني وتطبيقاتها المحمولة وبوابات السائقين والورش. تعمل المنصة بصفتها "جهة التحكم بالبيانات" (Data Controller) فيما يتعلق ببيانات الحسابات والفوترة، وبصفتها "معالج البيانات" (Data Processor) فيما يخص بيانات الأساطيل وسجلات الصيانة التي يدخلها العملاء من المنشآت.',
        contentEn: 'This policy applies to all users of the FleetAurvexis cloud platform, website visitors, mobile applications, and driver/workshop portals. FleetAurvexis acts as a "Data Controller" regarding direct account and billing records, and as a "Data Processor" for fleet telemetry and maintenance logs submitted by subscriber organizations.'
      },
      {
        id: 'sec-2',
        titleAr: '٢. فئات البيانات التي نقوم بجمعها',
        titleEn: '2. Categories of Data Collected',
        contentAr: 'نقوم بجمع الأنواع التالية من البيانات لتقديم خدمات المنصة وصيانتها: \n• بيانات الحساب والتعريف: الاسم، المسمى الوظيفي، البريد الإلكتروني، رقم الهاتف، اسم المنشأة، والسجل التجاري.\n• بيانات الأسطول والتشغيل: أرقام اللوحات، هياكل المركبات (VIN)، نوع الوقود، المسافات المقطوعة، وقراءات الحساسات.\n• سجلات الصيانة والفحص: أوامر العمل، بلاغات الأعطال، صور وتواقيع الفحص الفني، والتسجيلات الصوتية للبلاغات.\n• البيانات التقنية وبيانات الاستخدام: عنوان بروتوكول الإنترنت (IP)، نوع المتصفح، معرّف الجهاز، وبيانات ملفات تعريف الارتباط الضرورية.',
        contentEn: 'We collect the following data categories to operate and deliver services:\n• Identity & Account Data: Full name, job title, corporate email, phone number, organization name, and commercial registration.\n• Fleet & Operational Data: License plates, Vehicle Identification Numbers (VIN), odometer readings, fuel consumption, and sensor logs.\n• Maintenance & Inspection Records: Work orders, fault tickets, technical inspection photos, digital signatures, and recorded voice notes.\n• Technical & Usage Telemetry: IP addresses, browser specifications, device identifiers, and essential cookie data.'
      },
      {
        id: 'sec-3',
        titleAr: '٣. الأساس النظامي وأغراض معالجة البيانات',
        titleEn: '3. Legal Basis & Processing Purposes',
        contentAr: 'تتم معالجة البيانات الشخصية استناداً إلى الأسس النظامية التالية:\n• تنفيذ العقد: لتوفير خدمات إدارة الأسطول، جدولة الصيانة، ودعم العملاء الفني.\n• الامتثال للالتزامات القانونية: للاحتفاظ بالفواتير والسجلات الضريبية وتلبية متطلبات الجهات التنظيمية.\n• المصلحة المشروعة: لتأمين الشبكة، منع الاحتيال، وتطوير خوارزميات التشخيص الذكي بالذكاء الاصطناعي.\n• الموافقة الصريحة: لإرسال النشرات الإخبارية التسويقية أو معالجة ملفات تعريف الارتباط غير الضرورية.',
        contentEn: 'Personal data is processed based on lawful grounds including:\n• Contract Performance: Delivering fleet management modules, scheduling maintenance, and technical customer assistance.\n• Legal Compliance: Retaining tax invoices, commercial accounting records, and regulatory mandates.\n• Legitimate Interests: Enhancing cyber defenses, fraud prevention, and fine-tuning AI diagnostic algorithms.\n• Explicit Consent: Optional marketing communications and analytical cookies.'
      },
      {
        id: 'sec-4',
        titleAr: '٤. مشاركة البيانات والإفصاح للأطراف الثالثة',
        titleEn: '4. Data Sharing & Third-Party Disclosures',
        contentAr: 'لا نقوم ببيع أو تأجير أي بيانات شخصية لأي طرف ثالث. تتم مشاركة البيانات في حدود الضرورة القصوى مع:\n• مزودي البنية التحتية السحابية المعتمدين والمستضيفين داخل النطاق الجغرافي المسموح به نظاماً.\n• بوابات الدفع الإلكتروني المعتمدة من البنك المركزي لإتمام العمليات المالية بصورة مشفرة.\n• الجهات القضائية أو الحكومية المختصة عند صدور أمر نظامي ملزم وفق الأنظمة السارية.',
        contentEn: 'We strictly do not sell or lease personal data. Data is shared exclusively on a need-to-know basis with:\n• Authorized cloud infrastructure providers hosting data within approved geographical borders.\n• Central Bank-certified electronic payment gateways for encrypted financial processing.\n• Judicial or regulatory authorities upon lawful court orders or statutory subpoenas.'
      },
      {
        id: 'sec-5',
        titleAr: '٥. حقوق أصحاب البيانات الشخصية (DSR)',
        titleEn: '5. Data Subject Rights (DSR)',
        contentAr: 'يتمتع صاحب البيانات بالحقوق التالية المكفولة نظاماً:\n• حق العلم: الاطلاع على تفاصيل جمع واستخدام بياناته.\n• حق الوصول: طلب نسخة من بياناته الشخصية المخزنة.\n• حق التصحيح: طلب تصحيح أي بيانات غير دقيقة أو استكمالها.\n• حق الإتلاف والمحو (الحق في النسيان): طلب حذف بياناته الشخصية عند انتهاء الغرض من المعالجة ما لم يتطلب النظام استبقاءها.\n• حق الاعتراض وسحب الموافقة: في الحالات التي تستند فيها المعالجة إلى الموافقة.\nيمكن ممارسة هذه الحقوق عبر نموذج طلبات الخصوصية بالمنصة أو مراسلة: privacy@fleetaurvexis.com.',
        contentEn: 'Data subjects hold protected statutory rights:\n• Right to be Informed: Understanding how and why data is processed.\n• Right of Access: Requesting a copy of held personal data.\n• Right to Rectification: Correcting inaccurate or outdated records.\n• Right to Erasure (Right to be Forgotten): Requesting deletion once retention obligations lapse.\n• Right to Restrict & Withdraw Consent: Revoking consent where processing was consent-based.\nRequests may be submitted via our Privacy Request Portal or by emailing: privacy@fleetaurvexis.com.'
      }
    ]
  },

  // 2. Terms of Service
  {
    id: 'terms-of-service',
    slug: 'terms-of-service',
    titleAr: 'شروط وأحكام الخدمة (اتفاقية ترخيص SaaS للمنشآت)',
    titleEn: 'Enterprise Terms of Service (SaaS Agreement)',
    summaryAr: 'الاتفاقية القانونية التي تحكم وصول واستخدام منصة FleetAurvexis لحلول إدارة وحوكمة أساطيل المركبات والمعدات الثقيلة، محددة الاشتراطات، المسؤوليات، ومستويات الخدمة (SLA).',
    summaryEn: 'The binding legal agreement governing access and subscription use of the FleetAurvexis cloud suite for fleet governance and equipment maintenance.',
    category: 'terms',
    version: '1.3.0',
    status: 'published',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-08-10',
    publishedAt: '2026-01-01T08:00:00Z',
    publishedBy: 'المستشار القانوني العام',
    order: 2,
    showInFooter: true,
    requiresAcceptance: true,
    changeSummaryAr: 'تحديث شروط فوترة الاشتراكات المؤسسية وحصص سعة التخزين وأحكام الملكية الفكرية.',
    changeSummaryEn: 'Updated enterprise subscription billing cycles, cloud storage quotas, and intellectual property provisions.',
    sections: [
      {
        id: 'sec-1',
        titleAr: '١. قبول الشروط والتسجيل بالمنصة',
        titleEn: '1. Acceptance of Terms & Registration',
        contentAr: 'بإنشاء حساب أو الوصول إلى منصة FleetAurvexis، فإنك تقر بأنك مفوض قانونياً بالتعاقد نيابة عن المنشأة المسجلة، وتوافق على الالتزام الكامل بهذه الشروط. يحظر استخدام المنصة من قبل أي أطراف غير مصرح لها أو لأغراض تخالف الأنظمة التجارية السارية.',
        contentEn: 'By creating an account or accessing FleetAurvexis, you represent that you hold full legal authority to bind your organization to these Terms. Unauthorized use or breach of local commercial legislation is strictly prohibited.'
      },
      {
        id: 'sec-2',
        titleAr: '٢. ترخيص الاستخدام والقيود التشغيلية',
        titleEn: '2. License Grant & Restrictions',
        contentAr: 'تمنح المنصة العميل ترخيصاً محدوداً، غير حصري، وغير قابل للتحويل للوصول إلى برمجيات الساس لأغراض إدارة أسطوله الخاصة. يحظر:\n• الهندسة العكسية، فك التشفير، أو محاولة نسخ الشيفرة المصدرية.\n• إعادة بيع أو تأجير حسابات الوصول لأطراف خارجية دون إذن كتابي.\n• استخدام المنصة لتمرير بيانات ضارة أو برمجيات خبيثة.',
        contentEn: 'FleetAurvexis grants a non-exclusive, non-transferable, limited license to access the SaaS platform for internal fleet operations. Users may not:\n• Reverse engineer, decompile, or extract the underlying source code.\n• Resell, sub-license, or lease platform access to third parties without prior written consent.\n• Transmit corrupted code, viruses, or malicious payloads.'
      },
      {
        id: 'sec-3',
        titleAr: '٣. اتفاقية مستوى الخدمة والجاهزية (SLA)',
        titleEn: '3. Service Level Agreement (SLA)',
        contentAr: 'تبذل المنصة عنايتها التجارية لضمان توفر الخدمة السحابية بنسبة جاهزية لا تقل عن 99.8% شهرياً، مع استثناء أعمال الصيانة الدورية المجدولة مسبقاً والتي يتم إشعار المشتركين بها عبر لوحة الإدارة.',
        contentEn: 'FleetAurvexis employs commercially reasonable efforts to maintain monthly cloud availability of at least 99.8%, excluding scheduled maintenance windows notified in advance via the Admin Dashboard.'
      },
      {
        id: 'sec-4',
        titleAr: '٤. الاشتراكات، الفوترة، والتجديد التلقائي',
        titleEn: '4. Subscriptions, Invoicing & Auto-Renewal',
        contentAr: 'تتم محاسبة الاشتراكات بناءً على عدد المركبات النشطة وخطة التسعير المختارة (شهرياً أو سنوياً). تجدد الاشتراكات تلقائياً ما لم يطلب العميل إلغاء التجديد قبل 15 يوماً على الأقل من تاريخ انتهاء الدورة الفوترية. جميع الأسعار خاضعة لضريبة القيمة المضافة (VAT) المقررة.',
        contentEn: 'Fees are calculated based on active vehicle asset counts and the chosen billing tier (monthly or annual). Subscriptions renew automatically unless a cancellation request is submitted at least 15 days prior to billing cycle expiry. All fees exclude statutory Value Added Tax (VAT).'
      },
      {
        id: 'sec-5',
        titleAr: '٥. حدود المسؤولية والتعويضات',
        titleEn: '5. Limitation of Liability',
        contentAr: 'لا تتحمل المنصة المسؤولية عن أي خسائر غير مباشرة أو تبعية أو خسارة أرباح ناتجة عن استخدام الخدمة. تقتصر أقصى مسؤولية إجمالية للمنصة على إجمالي الرسوم المسددة فعلياً من العميل خلال الأشهر الثلاثة (3) السابقة للحادثة الموجبة للمسؤولية.',
        contentEn: 'Neither party shall be liable for indirect, consequential, or punitive damages or lost profits. Total aggregate liability under this agreement is capped at the total subscription fees paid by the client during the three (3) months preceding the incident.'
      }
    ]
  },

  // 3. Cookie Policy
  {
    id: 'cookie-policy',
    slug: 'cookie-policy',
    titleAr: 'سياسة ملفات تعريف الارتباط (Cookies)',
    titleEn: 'Cookie & Tracking Technologies Policy',
    summaryAr: 'توضح هذه السياسة أنواع ملفات تعريف الارتباط والتقنيات المشابهة المستخدمة في المنصة لأغراض المصادقة، الأمان، تحسين الأداء، وتجربة المستخدم، وكيفية التحكم بها.',
    summaryEn: 'Details the cookie categories, local storage tokens, and tracking mechanisms deployed for authentication, security hardening, performance analytics, and user preferences.',
    category: 'privacy',
    version: '1.1.0',
    status: 'published',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-07-20',
    publishedAt: '2026-01-01T08:00:00Z',
    publishedBy: 'فريق هندسة الأمان والامتثال',
    order: 3,
    showInFooter: true,
    requiresAcceptance: false,
    changeSummaryAr: 'توضيح تفاصيل التخزين المحلي لرموز التوثيق وتفضيلات ملفات تعريف الارتباط.',
    changeSummaryEn: 'Clarified local storage tokens used for session persistence and cookie consent preferences.',
    sections: [
      {
        id: 'sec-1',
        titleAr: '١. ما هي ملفات تعريف الارتباط والتخزين المحلي؟',
        titleEn: '1. What Are Cookies and Local Storage?',
        contentAr: 'ملفات تعريف الارتباط هي ملفات نصية صغيرة تحفظ على جهازك عند زيارة المنصة. تستخدم المنصة أيضاً تقنيات التخزين المحلي (Local Storage & Session Storage) لتمكين العمل دون اتصال (Offline Mode) وحفظ جلسة تسجيل الدخول الآمنة.',
        contentEn: 'Cookies are small text files placed on your device during visits. FleetAurvexis also utilizes HTML5 LocalStorage and SessionStorage to enable offline data caching and secure authentication token persistence.'
      },
      {
        id: 'sec-2',
        titleAr: '٢. تصنيف ملفات تعريف الارتباط المستخدمة',
        titleEn: '2. Categorization of Deployed Cookies',
        contentAr: '• الضرورية (Strictly Essential): لازمة لعمل المصادقة الأمنية، حماية الجلسة، والتحقق بخطوتين (2FA). لا يمكن إيقافها.\n• الوظيفية والتفضيلات (Functional): تحفظ إعداداتك المفضلة مثل اللغة (العربية/الإنجليزية) ووضع الشاشة (الداكن/الفاتح) ولون الهوية.\n• التحليلية والأداء (Analytics): تساعدنا في قياس زمن استجابة الشاشات ومعدل استخدام ميزات صيانة الأسطول لتحسين المنظومة.\n• التسويقية (Marketing): تُستخدم لعرض التحديثات التشغيلية والمقالات الموجهة ولا نستخدم ملفات تتبع إعلانية من جهات مجهولة.',
        contentEn: '• Strictly Essential: Required for user authentication, CSRF defense, and multi-factor session validation. Cannot be disabled.\n• Functional & Preferences: Persists chosen language (Arabic/English), display theme (dark/light), and branding color.\n• Analytics & Performance: Measures module responsiveness and fleet ledger interactions to optimize speed and reliability.\n• Marketing: Delivers relevant operational guides and feature updates without deploying invasive third-party ad networks.'
      },
      {
        id: 'sec-3',
        titleAr: '٣. إدارة التفضيلات وإلغاء الموافقة',
        titleEn: '3. Managing Preferences & Opt-Out',
        contentAr: 'يمكنك تعديل تفضيلاتك في أي وقت بالنقر على رابط "تفضيلات ملفات تعريف الارتباط" في تذييل الموقع، أو ضبط إعدادات متصفحك لحظر ملفات الارتباط غير الضرورية، مع ملاحظة أن حظر الملفات الضرورية قد يعطل بعض وظائف المنصة.',
        contentEn: 'You can update your cookie preferences at any time by clicking "Cookie Preferences" in the footer, or via your browser settings. Disabling essential cookies may impair platform login and offline synchronization.'
      }
    ]
  },

  // 4. Acceptable Use Policy
  {
    id: 'acceptable-use',
    slug: 'acceptable-use-policy',
    titleAr: 'سياسة الاستخدام المقبول (AUP)',
    titleEn: 'Acceptable Use Policy (AUP)',
    summaryAr: 'تحدد هذه السياسة معايير السلوك المسموح به والمحظور عند التعامل مع البنية التحتية البرمجية والمنافذ اللاسلكية وبوابات السائقين والـ APIs التابعة لـ FleetAurvexis.',
    summaryEn: 'Outlines permitted and prohibited operational behavior when interacting with FleetAurvexis cloud infrastructure, driver portals, APIs, and network endpoints.',
    category: 'terms',
    version: '1.1.0',
    status: 'published',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-06-15',
    publishedAt: '2026-01-01T08:00:00Z',
    publishedBy: 'إدارة أمن المعلومات',
    order: 4,
    showInFooter: true,
    requiresAcceptance: false,
    changeSummaryAr: 'إضافة ضوابط واجهات برمجة التطبيقات (API Rate Limiting) واستخدام الذكاء الاصطناعي المسؤول.',
    changeSummaryEn: 'Added API rate limiting rules and guidelines for responsible AI diagnostics utilization.',
    sections: [
      {
        id: 'sec-1',
        titleAr: '١. الممارسات المحظورة حظراً باتاً',
        titleEn: '1. Strictly Prohibited Conduct',
        contentAr: 'يُحظر على أي مستخدم أو منشأة استخدام المنصة في:\n• اختراق، فحص منافذ غير مصرح بها، أو شن هجمات حجب الخدمة (DDoS).\n• إدخال بلاغات كاذبة أو تزييف قراءات عدادات المركبات أو تقارير الفحص الفني.\n• تحميل صور خادشة، بيانات محظورة نظاماً، أو ملفات تنتهك حقوق الملكية الفكرية.\n• استخراج البيانات تلقائياً (Scraping) أو الإفراط المتعمد في استهلاك موارد الـ API بما يتجاوز حدود الاستخدام العادل.',
        contentEn: 'Users and subscriber organizations are strictly prohibited from:\n• Vulnerability probing, unauthorized port scanning, or launching Denial-of-Service (DDoS) attacks.\n• Submitting fraudulent fault logs, falsifying vehicle odometer telematics, or staging counterfeit inspection records.\n• Uploading offensive media, unlawful assets, or copyright-infringing documents.\n• Automated web scraping or abusive API rate flooding exceeding designated fair usage thresholds.'
      },
      {
        id: 'sec-2',
        titleAr: '٢. الاستخدام المسؤول لأدوات الذكاء الاصطناعي',
        titleEn: '2. Responsible AI Diagnostics Utilization',
        contentAr: 'تعد تحليلات الذكاء الاصطناعي واقتراحات مسار الإصلاح أدوات مساعدة هندسية ولا تعفي الفني الميكانيكي المؤهل من إجراء الفحص الحسي الميداني المعتمد لضمان السلامة الميكانيكية الشاملة.',
        contentEn: 'AI diagnostic suggestions and repair roadmap recommendations are advisory technical aids and do not substitute certified hands-on mechanical safety verification by licensed technicians.'
      },
      {
        id: 'sec-3',
        titleAr: '٣. الإجراءات الجزائية في حال الانتهاك',
        titleEn: '3. Enforcement & Sanctions',
        contentAr: 'تحتفظ المنصة بالحق في تعليق الحساب مؤقتاً أو إنهائه فورياً دون إشعار مسبق في حال ثبوت مخالفة جسيمة لسياسة الاستخدام المقبول، مع اتخاذ الإجراءات القانونية اللازمة.',
        contentEn: 'FleetAurvexis reserves the right to suspend or terminate accounts immediately upon validated critical breaches of this policy, alongside initiating necessary legal remediation.'
      }
    ]
  },

  // 5. Data Processing Agreement (DPA)
  {
    id: 'data-processing',
    slug: 'data-processing-agreement',
    titleAr: 'اتفاقية معالجة البيانات وحمايتها (DPA)',
    titleEn: 'Data Processing Agreement (DPA)',
    summaryAr: 'اتفاقية ملزمة قانونياً تنظم التزامات معالجة البيانات بين المنشأة المشتركة (المتحكم) ومنصة FleetAurvexis (المعالج) وفق ضوابط نظام حماية البيانات الشخصية واللوائح التنظيمية.',
    summaryEn: 'Statutory contract governing data processing obligations between the subscriber entity (Data Controller) and FleetAurvexis (Data Processor) under enterprise privacy standards.',
    category: 'compliance',
    version: '1.2.0',
    status: 'published',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-07-30',
    publishedAt: '2026-01-01T08:00:00Z',
    publishedBy: 'فريق الامتثال القانوني السحابي',
    order: 5,
    showInFooter: true,
    requiresAcceptance: true,
    changeSummaryAr: 'تحديث مصفوفة تدابير الأمان الفنية والتنظيمية (TOMs) ومواقع مراكز البيانات.',
    changeSummaryEn: 'Updated technical and organizational security measures (TOMs) and datacenter regions.',
    sections: [
      {
        id: 'sec-1',
        titleAr: '١. موضوع الاتفاقية ونطاق المعالجة',
        titleEn: '1. Subject Matter & Scope of Processing',
        contentAr: 'تحدد هذه الاتفاقية واجبات المنصة بوصفها معالجاً للبيانات نيابة عن العميل الذي يظل المتحكم الأصيل ببيانات أسطوله وسائقيه. تتم المعالجة حصراً لتنفيذ اتفاقية تقديم خدمات FleetAurvexis المبرمة وبناءً على تعليمات العميل الموثقة.',
        contentEn: 'This DPA governs FleetAurvexis processing obligations on behalf of the customer, who remains the principal Data Controller for fleet and driver records. Processing is conducted solely pursuant to authenticated customer instructions to deliver subscribed services.'
      },
      {
        id: 'sec-2',
        titleAr: '٢. التدابير الفنية والتنظيمية لحماية البيانات (TOMs)',
        titleEn: '2. Technical & Organizational Measures (TOMs)',
        contentAr: 'تلتزم المنصة بتطبيق أعلى المعايير الأمنية:\n• التشفير التام للبيانات أثناء السكون (AES-256) وأثناء النقل (TLS 1.3).\n• التحكم بالوصول القائم على الأدوار (RBAC) ومصادقة متعددة العوامل (MFA/2FA).\n• نسخ احتياطي يومي مشفر مع فصل تام للبيانات بين المستأجرين (Multi-Tenancy Isolation).\n• سجلات تدقيق مستمرة لجميع العمليات الحساسة ومراقبة أمنية على مدار الساعة.',
        contentEn: 'FleetAurvexis enforces rigorous technical safeguards:\n• Universal data encryption at rest (AES-256) and in transit (TLS 1.3).\n• Granular Role-Based Access Control (RBAC) with Multi-Factor Authentication (MFA).\n• Daily encrypted snapshot backups with strict logical tenant isolation.\n• Continuous immutable audit logging and round-the-clock telemetry monitoring.'
      },
      {
        id: 'sec-3',
        titleAr: '٣. الإخطار بالحوادث والاختراقات الأمنية',
        titleEn: '3. Security Incident & Breach Notification',
        contentAr: 'في حال وقوع أي حادث أمني يمس سرية البيانات أو سلامتها، تلتزم المنصة بإخطار العميل دون تأخير غير مبرر (وخلال 72 ساعة كحد أقصى) مع تزويده بتقرير أولي يوضح طبيعة الحادث والإجراءات التصحيحية المتخذة.',
        contentEn: 'In the event of a verified data breach impacting personal data, FleetAurvexis will notify the affected customer without undue delay (within 72 hours maximum), providing incident scope and mitigation steps.'
      }
    ]
  },

  // 6. Security & Vulnerability Policy
  {
    id: 'security-compliance',
    slug: 'security-and-vulnerability-policy',
    titleAr: 'سياسة أمن المعلومات وإدارة الثغرات',
    titleEn: 'Information Security & Vulnerability Disclosure',
    summaryAr: 'استعراض للبنية الأمنية التحتية، معايير التشفير، خطة استمرارية الأعمال والتعافي من الكوارث، وقنوات الإبلاغ المسؤول عن الثغرات الأمنية (Bug Bounty).',
    summaryEn: 'Comprehensive overview of cybersecurity architecture, zero-trust design, business continuity protocols, and coordinated vulnerability disclosure channels.',
    category: 'security',
    version: '1.1.0',
    status: 'published',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-08-01',
    publishedAt: '2026-01-01T08:00:00Z',
    publishedBy: 'مدير قطاع الأمن السيبراني',
    order: 6,
    showInFooter: true,
    requiresAcceptance: false,
    changeSummaryAr: 'إضافة قنوات الإبلاغ المسؤول عن الثغرات وإجراءات الفحص الدوري.',
    changeSummaryEn: 'Added responsible disclosure intake process and routine penetration testing schedules.',
    sections: [
      {
        id: 'sec-1',
        titleAr: '١. مبادئ الأمان المعتمدة في التصميم (Security by Design)',
        titleEn: '1. Security by Design Architecture',
        contentAr: 'تعتمد منصة FleetAurvexis نموذج انعدام الثقة (Zero Trust Architecture)؛ حيث يتم التحقق من صحة كل طلب، وتطهير المدخلات لمنع هجمات الحقن (SQLi/NoSQLi/XSS)، وتطبيق قواعد أمان صارمة في قاعدة البيانات (Firestore Security Rules) تمنع الوصول غير المصرح به.',
        contentEn: 'FleetAurvexis implements Zero-Trust Architecture: every request is authenticated, all client payloads are sanitized against injection vectors (XSS/SQLi), and database rules enforce server-level isolation per organization tenant.'
      },
      {
        id: 'sec-2',
        titleAr: '٢. النسخ الاحتياطي والتعافي من الكوارث (DRP)',
        titleEn: '2. Backup, Resilience & Disaster Recovery',
        contentAr: 'تُخزن البيانات في بيئة سحابية متعددة المناطق الجغرافية مع نسخ احتياطي فوري متكرر. يبلغ الهدف الزمني للتعافي (RTO) أقل من 4 ساعات، وهدف نقطة التعافي (RPO) أقل من 15 دقيقة في أسوأ الظروف التشغيلية.',
        contentEn: 'Data is replicated across geo-redundant cloud availability zones with automated snapshots. The platform targets a Recovery Time Objective (RTO) of under 4 hours and a Recovery Point Objective (RPO) of under 15 minutes.'
      },
      {
        id: 'sec-3',
        titleAr: '٣. برنامج الإفصاح المسؤول عن الثغرات (Coordinated Disclosure)',
        titleEn: '3. Coordinated Vulnerability Disclosure',
        contentAr: 'نرحب بجهود الباحثين الأمنيين الأخلاقيين. في حال اكتشاف أي ثغرة أمنية، نرجو إرسال تقرير تفصيلي إلى: security@fleetaurvexis.com. نلتزم بالرد والتحقق خلال 48 ساعة وعدم اتخاذ إجراءات قانونية ضد من يلتزم بقواعد الإفصاح المسؤول.',
        contentEn: 'We welcome reports from certified ethical security researchers. Please send vulnerability findings to: security@fleetaurvexis.com. We acknowledge submissions within 48 hours and provide safe harbor to researchers acting in good faith.'
      }
    ]
  },

  // 7. Subprocessors List
  {
    id: 'subprocessors',
    slug: 'subprocessors-list',
    titleAr: 'قائمة معالجي البيانات الفرعيين المعتمدين',
    titleEn: 'Authorized Subprocessors Directory',
    summaryAr: 'كشف رسمي شفاف بالجهات والشركات التقنية الفرعية المعتمدة التي تعتمد عليها FleetAurvexis في استضافة البنية التحتية، معالجة الدفع، وإرسال الرسائل.',
    summaryEn: 'Transparent official listing of vetted third-party vendors and cloud infrastructure partners utilized to deliver FleetAurvexis core platform services.',
    category: 'compliance',
    version: '1.2.0',
    status: 'published',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-08-20',
    publishedAt: '2026-01-01T08:00:00Z',
    publishedBy: 'إدارة الامتثال وسلاسل التوريد',
    order: 7,
    showInFooter: true,
    requiresAcceptance: false,
    changeSummaryAr: 'تحديث بيانات مناطق الاستضافة السحابية ومزودي بوابات الدفع الإلكتروني.',
    changeSummaryEn: 'Updated cloud host datacenter regions and verified payment provider entries.',
    sections: [
      {
        id: 'sec-1',
        titleAr: '١. البنية التحتية السحابية وقواعد البيانات',
        titleEn: '1. Cloud Infrastructure & Databases',
        contentAr: '• Google Cloud Platform (GCP) / Firebase: توفير الاستضافة السحابية، إدارة قواعد البيانات Firestore الموزعة، والمصادقة الأمنية. (مراكز البيانات: النطاق الإقليمي المعتمد في الشرق الأوسط وأوروبا الغربية).\n• Cloud Run & Edge CDN: استضافة وتشغيل خوادم التطبيقات وتوزيع المحتوى بسرعة عالية.',
        contentEn: '• Google Cloud Platform (GCP) / Firebase: Primary cloud hosting, distributed Firestore NoSQL database, and OAuth identity validation. (Datacenter regions: Middle East / Western Europe clusters).\n• Cloud Run & Edge CDN: High-availability container runtime and static asset delivery.'
      },
      {
        id: 'sec-2',
        titleAr: '٢. بوابات المعالجة المالية والمدفوعات',
        titleEn: '2. Payment Gateways & Invoicing Infrastructure',
        contentAr: '• مزودو بوابات الدفع الإلكتروني المعتمدة محلياً: لمعالجة مدفوعات البطاقات ومدى وApple Pay بأعلى معايير أمان بطاقات الدفع (PCI-DSS المستوى الأول). لا تحتفظ المنصة بأرقام البطاقات الائتمانية الكاملة.',
        contentEn: '• Certified Regional Payment Gateways: Processing credit cards, Mada, and digital wallets compliant with PCI-DSS Level 1. FleetAurvexis never stores raw credit card numbers on its servers.'
      },
      {
        id: 'sec-3',
        titleAr: '٣. خدمات الاتصالات والرسائل الفورية',
        titleEn: '3. Communications & OTP Notification Gateways',
        contentAr: '• مزودو خدمات الرسائل القصيرة (SMS Gateway): لإرسال رموز التحقق الثنائي (2FA) وتنبيهات طوارئ الأعطال للسائقين والمشرفين.',
        contentEn: '• Licensed Telecommunications SMS Gateways: Dispatches two-factor authentication tokens (OTP) and urgent vehicle breakdown alerts.'
      }
    ]
  },

  // 8. Data Retention & Deletion Policy
  {
    id: 'data-retention',
    slug: 'data-retention-policy',
    titleAr: 'سياسة الاحتفاظ بالبيانات وإتلافها الآمن',
    titleEn: 'Data Retention & Secure Deletion Policy',
    summaryAr: 'تحدد هذه السياسة المدد الزمنية النظامية للاحتفاظ بسجلات المركبات، أوامر الصيانة، الفواتير، والبيانات الشخصية، وإجراءات الإتلاف الرقمي الآمن بعد انقضاء الحاجة.',
    summaryEn: 'Governs statutory retention schedules for fleet assets, repair logs, tax records, and telemetry history, alongside cryptographic digital sanitization procedures.',
    category: 'compliance',
    version: '1.1.0',
    status: 'published',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-07-10',
    publishedAt: '2026-01-01T08:00:00Z',
    publishedBy: 'لجنة الحوكمة والأرشفة الرقمية',
    order: 8,
    showInFooter: true,
    requiresAcceptance: false,
    changeSummaryAr: 'تحديد مدد استبقاء السجلات الضريبية وسجلات فحص السلامة الميكانيكية.',
    changeSummaryEn: 'Specified regulatory retention terms for tax invoices and mechanical safety audit trails.',
    sections: [
      {
        id: 'sec-1',
        titleAr: '١. جدول مدد الاحتفاظ بالسجلات',
        titleEn: '1. Record Retention Schedules',
        contentAr: '• الفواتير والسجلات المالية: 10 سنوات (امتثالاً لنظام المعاملات التجارية وضريبة القيمة المضافة).\n• سجلات الصيانة والفحص الفني: طوال مدة اشتراك المنشأة + 3 سنوات بعد إلغاء الحساب لأغراض الضمان والنزاعات القانونية.\n• بلاغات الأعطال والتسجيلات الصوتية: سنتان (2) من تاريخ إغلاق أمر العمل المقابل.\n• سجلات تدقيق الأمان والوصول (Audit Logs): سنة واحدة (1) لأغراض الرقابة السيبرانية.',
        contentEn: '• Financial Ledgers & Tax Invoices: 10 years (statutory VAT and commercial accounting requirement).\n• Vehicle Maintenance & Technical Inspection Logs: Duration of active subscription + 3 years post-termination for warranty and liability coverage.\n• Driver Fault Reports & Audio Notes: 2 years following closure of the associated work order.\n• Cybersecurity Access & Audit Logs: 1 year for forensic review and threat detection.'
      },
      {
        id: 'sec-2',
        titleAr: '٢. آلية الإتلاف الرقمي والتطهير (Data Sanitization)',
        titleEn: '2. Cryptographic Data Sanitization Protocol',
        contentAr: 'عند انتهاء مدة الاستبقاء أو تلقي طلب حذف مشروع، يتم إتلاف البيانات عبر الحذف المتوافق مع معايير NIST SP 800-88 مع حذف المفاتيح التشفيرية (Crypto-shredding) لضمان استحالة استرجاعها.',
        contentEn: 'Upon retention expiry or validated deletion requests, records undergo digital sanitization in compliance with NIST SP 800-88 guidelines, utilizing crypto-shredding to render residual data irrevocably unrecoverable.'
      }
    ]
  },

  // 9. Account & Data Deletion
  {
    id: 'account-deletion',
    slug: 'account-and-data-deletion',
    titleAr: 'طلب حذف الحساب ومحو البيانات (الحق في النسيان)',
    titleEn: 'Account Deletion & Right to be Forgotten',
    summaryAr: 'دليل المستخدم والمنشآت لتقديم طلبات إغلاق الحساب، وتصفية بيانات الأسطول، وتصدير الأرشيف، مع نموذج رقمي مباشر لممارسة الحق في النسيان.',
    summaryEn: 'Comprehensive guide for individuals and organizations to initiate account termination, purge fleet records, export historical backups, and execute erasure rights.',
    category: 'privacy',
    version: '1.1.0',
    status: 'published',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-08-05',
    publishedAt: '2026-01-01T08:00:00Z',
    publishedBy: 'فريق دعم الخصوصية وحقوق المستخدم',
    order: 9,
    showInFooter: true,
    requiresAcceptance: false,
    changeSummaryAr: 'إضافة نموذج الحذف الرقمي المباشر وخيار تصدير الأرشيف الشامل قبل الإغلاق.',
    changeSummaryEn: 'Added direct digital deletion intake and full data archive export prior to closure.',
    sections: [
      {
        id: 'sec-1',
        titleAr: '١. كيفية تقديم طلب حذف الحساب',
        titleEn: '1. Submitting an Account Deletion Request',
        contentAr: 'يمكن لمسؤول المنشأة المعتمد أو المستخدم الفردي طلب حذف الحساب عبر:\n• الانتقال إلى تبويب إعدادات الحساب والنقر على "طلب إغلاق الحساب وحذف البيانات".\n• أو تعبئة نموذج طلبات الخصوصية المتاح في هذه الصفحة.\n• أو إرسال بريد إلكتروني رسمي إلى: privacy@fleetaurvexis.com مع ذكر معرف الحساب.',
        contentEn: 'Authorized organizational administrators or individual users may request account deletion via:\n• Account Settings > "Request Account Deletion & Data Purge".\n• Submitting the online Privacy Request Form directly on this page.\n• Emailing an official request from the registered address to: privacy@fleetaurvexis.com.'
      },
      {
        id: 'sec-2',
        titleAr: '٢. فترة السماح وتأكيد الهوية (Grace Period)',
        titleEn: '2. Identity Verification & 14-Day Grace Period',
        contentAr: 'لحماية الأساطيل من الحذف العرضي أو الخبيث، يتم التحقق من هوية مقدم الطلب عبر رمز مصادقة (OTP)، وتدخل البيانات فترة تجميد مؤقتة مدتها 14 يوماً يمكن خلالها التراجع عن الطلب، قبل البدء في الإتلاف النهائي.',
        contentEn: 'To prevent accidental or malicious fleet outages, requests require two-factor verification. Accounts then enter a 14-day grace period during which administrators may cancel the request before permanent erasure.'
      },
      {
        id: 'sec-3',
        titleAr: '٣. تصدير البيانات قبل الحذف (Data Portability)',
        titleEn: '3. Data Portability & Archive Export',
        contentAr: 'نوفر إمكانية تصدير كافة سجلات المركبات، أوامر الصيانة، والفواتير بصيغة ملفات مفتوحة (JSON / Excel / PDF) قبل تنفيذ عملية الحذف لضمان سهولة الانتقال.',
        contentEn: 'Clients can download an aggregated backup archive of vehicles, maintenance workorders, and invoices in standard portable formats (JSON/Excel/PDF) prior to final account deletion.'
      }
    ]
  },

  // 10. Legal Notice / Impressum
  {
    id: 'legal-notice',
    slug: 'legal-notice',
    titleAr: 'الإشعار القانوني وبيانات المنشأة (Impressum)',
    titleEn: 'Legal Notice & Corporate Information (Impressum)',
    summaryAr: 'البيانات الرسمية والاعتبارية لشركة FleetAurvexis، متضمنة السجل التجاري، الرقم الضريبي، العناوين الوطنية، ومعلومات الاتصال الإداري والقضائي.',
    summaryEn: 'Official statutory disclosure of FleetAurvexis corporate entity, commercial registration, tax identification numbers, physical headquarters, and authorized representatives.',
    category: 'notices',
    version: '1.0.0',
    status: 'published',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-06-01',
    publishedAt: '2026-01-01T08:00:00Z',
    publishedBy: 'الإدارة القانونية المؤسسية',
    order: 10,
    showInFooter: true,
    requiresAcceptance: false,
    changeSummaryAr: 'الإصدار المعتمد للإشعار القانوني وبيانات السجل التجاري.',
    changeSummaryEn: 'Initial approved corporate statutory disclosure.',
    sections: [
      {
        id: 'sec-1',
        titleAr: '١. البيانات الاعتبارية والتجارية',
        titleEn: '1. Corporate Legal Entity Details',
        contentAr: '• الاسم التجاري: FleetAurvexis (فليت أورفيكسيس).\n• الكيان النظامي: شركة فليت أورفيكسيس لحلول تقنية المعلومات المحدودة.\n• السجل التجاري: 1010894231 - الرياض.\n• الرقم الضريبي للمنشأة (VAT): 310984210900003.\n• النشاط المعتمد: تقديم الخدمات السحابية، حلول إدارة الأساطيل، والبرمجيات كخدمة (SaaS).',
        contentEn: '• Trade Brand: FleetAurvexis.\n• Legal Entity: FleetAurvexis Information Technology Solutions LLC.\n• Commercial Registration (CR): 1010894231 - Riyadh.\n• Value Added Tax (VAT) ID: 310984210900003.\n• Licensed Activity: Cloud computing, enterprise fleet management software-as-a-service (SaaS).'
      },
      {
        id: 'sec-2',
        titleAr: '٢. العنوان الوطني ومقر الإدارة الرئيسية',
        titleEn: '2. Headquarters & National Address',
        contentAr: 'المملكة العربية السعودية، مدينة الرياض، طريق الملك فهد، حي الصحافة، الرمز البريدي 13321.\nهاتف الإدارة العامة: +966 11 450 8890\nالبريد الإلكتروني الرسمي: legal@fleetaurvexis.com',
        contentEn: 'Kingdom of Saudi Arabia, Riyadh City, King Fahd Road, Al-Sahafa District, Postal Code 13321.\nHeadquarters Phone: +966 11 450 8890\nCorporate Legal Desk: legal@fleetaurvexis.com'
      },
      {
        id: 'sec-3',
        titleAr: '٣. حقوق الملكية الفكرية والعلامات التجارية',
        titleEn: '3. Intellectual Property & Trademarks',
        contentAr: 'جميع التصاميم، العلامات التجارية، الشعارات، والنصوص البرمجية لمنصة FleetAurvexis محمية بموجب أنظمة حماية حقوق المؤلف والعلامات التجارية المعمول بها دولياً ومحلياً.',
        contentEn: 'All proprietary software code, logos, UI designs, and brand hallmarks of FleetAurvexis are protected under applicable national and international intellectual property legislation.'
      }
    ]
  },

  // 11. Contact Legal & DPO
  {
    id: 'contact-legal',
    slug: 'contact-legal-and-dpo',
    titleAr: 'التواصل مع الشؤون القانونية ومسؤول حماية البيانات (DPO)',
    titleEn: 'Contact Legal & Data Protection Officer (DPO)',
    summaryAr: 'قنوات الاتصال المباشرة المخصصة للاستفسارات القانونية، إبرام اتفاقيات عدم الإفصاح (NDA)، متابعة عقود المنشآت، والتواصل مع مسؤول حماية البيانات.',
    summaryEn: 'Dedicated communication channels for enterprise contractual inquiries, bespoke DPA negotiations, regulatory compliance, and direct contact with the Data Protection Officer.',
    category: 'notices',
    version: '1.0.0',
    status: 'published',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-07-01',
    publishedAt: '2026-01-01T08:00:00Z',
    publishedBy: 'مكتب مسؤول حماية البيانات',
    order: 11,
    showInFooter: true,
    requiresAcceptance: false,
    changeSummaryAr: 'تحديث قنوات التواصل ونماذج طلب الاستفسارات التعاقدية.',
    changeSummaryEn: 'Updated contact protocols and contractual intake channels.',
    sections: [
      {
        id: 'sec-1',
        titleAr: '١. مسؤول حماية البيانات الشخصية (Data Protection Officer - DPO)',
        titleEn: '1. Data Protection Officer (DPO) Contact',
        contentAr: 'لمتابعة أي شأن يتعلق بنظام حماية البيانات الشخصية، أو تقديم شكاوى الخصوصية، أو الاستفسار عن التدابير الأمنية المطبقة، يمكنك التواصل المباشر مع مسؤول حماية البيانات عبر:\nالبريد الإلكتروني: dpo@fleetaurvexis.com\nالعنوان المباشر: عناية مسؤول حماية البيانات، شركة فليت أورفيكسيس، ص.ب 13321، الرياض.',
        contentEn: 'For matters concerning statutory personal data rights, privacy complaints, or data protection audits, contact our Data Protection Officer directly:\nEmail: dpo@fleetaurvexis.com\nPostal Address: Attn: Data Protection Officer, FleetAurvexis LLC, P.O. Box 13321, Riyadh, Saudi Arabia.'
      },
      {
        id: 'sec-2',
        titleAr: '٢. العقود والاتفاقيات المؤسسية المخصصة (Enterprise Contracts)',
        titleEn: '2. Enterprise Legal & Contractual Inquiries',
        contentAr: 'للجهات الحكومية والشركات الكبرى الراغبة في توقيع اتفاقيات مستوى خدمة مخصصة (Custom SLA) أو اتفاقيات سرية معلومات (NDA) أو مراجعة بنود الشراء المؤسسي:\nالبريد الإلكتروني للتعاقدات: legal@fleetaurvexis.com\nأوقات العمل الرسمية: الأحد إلى الخميس من 08:00 صباحاً حتى 05:00 مساءً بتوقيت مكة المكرمة.',
        contentEn: 'For government entities and large enterprise clients requesting customized Service Level Agreements (Custom SLAs), bilateral Non-Disclosure Agreements (NDAs), or procurement reviews:\nCorporate Legal Inquiries: legal@fleetaurvexis.com\nOperating Hours: Sunday through Thursday, 08:00 AM – 05:00 PM (Riyadh Time).'
      }
    ]
  }
];

// Helper functions for storage and persistence
const STORAGE_KEYS = {
  DOCUMENTS: 'fleet_legal_documents_v1',
  SETTINGS: 'fleet_legal_settings_v1',
  AUDIT_LOGS: 'fleet_legal_audit_logs_v1',
  COOKIE_CONSENT: 'fleet_cookie_consent_v1',
  COOKIE_ADMIN: 'fleet_cookie_admin_settings_v1',
  PRIVACY_REQUESTS: 'fleet_privacy_requests_v1',
  LEGAL_ACCEPTANCES: 'fleet_legal_acceptances_v1'
};

export const DEFAULT_COOKIE_ADMIN_SETTINGS: CookieAdminSettings = {
  categories: {
    essential: {
      id: 'essential',
      nameAr: 'ملفات تعريف الارتباط الضرورية والتشغيلية',
      nameEn: 'Strictly Necessary & Operational Cookies',
      descriptionAr: 'لازمة ومطلوبة فنياً لتشغيل منصة FleetAurvexis، الحفاظ على أمان جلسة العمل، وتوثيق المصادقة الرقمية.',
      descriptionEn: 'Technically indispensable for the core operation of FleetAurvexis, session integrity, and secure authentication.',
      enabled: true,
      required: true,
      retentionAr: 'طوال مدة جلسة التصفح حتى تسجيل الخروج',
      retentionEn: 'Session duration until user signs out'
    },
    analytics: {
      id: 'analytics',
      nameAr: 'ملفات تعريف الارتباط التحليلية وقياس الأداء',
      nameEn: 'Performance & Analytics Cookies',
      descriptionAr: 'تساعد في فهم كيفية تفاعل المستخدمين مع النظام وقياس سرعة استجابة الخوادم لتحسين التجربة.',
      descriptionEn: 'Helps evaluate user interactions, diagnose technical latency, and enhance system stability.',
      enabled: true,
      required: false,
      retentionAr: '180 يوماً من تاريخ التفعيل',
      retentionEn: '180 days from consent date'
    },
    functional: {
      id: 'functional',
      nameAr: 'ملفات تعريف الارتباط الوظيفية والتفضيلات',
      nameEn: 'Functional & Preferences Cookies',
      descriptionAr: 'تسمح للموقع بتذكر تفضيلات الواجهة مثل اللغة المختارة، الوضع الليلي/النهاري، وأحجام الخطوط.',
      descriptionEn: 'Enables custom preferences persistence such as language choice, dark/light theme, and layout scale.',
      enabled: true,
      required: false,
      retentionAr: '365 يوماً',
      retentionEn: '365 days'
    },
    marketing: {
      id: 'marketing',
      nameAr: 'ملفات تعريف الارتباط الترويجية والتواصل',
      nameEn: 'Marketing & Outreach Cookies',
      descriptionAr: 'تُستخدم لعرض الإعلانات المستهدفة والحملات الموجهة وقياس كفاءة الحملات التسويقية الخارجية.',
      descriptionEn: 'Used to measure outbound marketing performance and audience engagement.',
      enabled: false,
      required: false,
      retentionAr: '90 يوماً',
      retentionEn: '90 days'
    }
  },
  bannerTitleAr: 'إشعار ملفات تعريف الارتباط والخصوصية',
  bannerTitleEn: 'Cookie Preferences & Privacy Notice',
  bannerMessageAr: 'نستخدم ملفات تعريف الارتباط الضرورية لضمان عمل المنصة بأمان، ونطلب موافقتك لتفعيل ملفات التحليل والتفضيلات وفقاً للائحة PDPL.',
  bannerMessageEn: 'We use necessary cookies for secure platform operation and request consent for analytics and preferences per PDPL standards.',
  consentLifetimeDays: 180,
  updatedAt: '2026-01-01',
  updatedBy: 'النظام القانوني (FleetAurvexis Compliance)'
};

export function getStoredCookieAdminSettings(): CookieAdminSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COOKIE_ADMIN);
    if (saved) {
      return { ...DEFAULT_COOKIE_ADMIN_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load cookie admin settings, using defaults', e);
  }
  return DEFAULT_COOKIE_ADMIN_SETTINGS;
}

export function saveStoredCookieAdminSettings(settings: CookieAdminSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COOKIE_ADMIN, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('fleet_cookie_admin_updated', { detail: settings }));
  } catch (e) {
    console.error('Failed to save cookie admin settings', e);
  }
}

export function getStoredAuditLogs(): LegalAuditLog[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load audit logs', e);
  }
  return [];
}

export function saveStoredAuditLogs(logs: LegalAuditLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('fleet_legal_audit_logs_updated'));
  } catch (e) {
    console.error('Failed to save audit logs', e);
  }
}

export function getStoredLegalDocuments(): LegalDocument[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load stored legal documents, falling back to defaults', e);
  }
  return DEFAULT_LEGAL_DOCUMENTS;
}

export function saveStoredLegalDocuments(docs: LegalDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    window.dispatchEvent(new CustomEvent('fleet_legal_documents_updated'));
  } catch (e) {
    console.error('Failed to save legal documents to storage', e);
  }
}

export function getStoredLegalSettings(): LegalSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      return { ...DEFAULT_LEGAL_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load legal settings, falling back to defaults', e);
  }
  return DEFAULT_LEGAL_SETTINGS;
}

export function saveStoredLegalSettings(settings: LegalSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('fleet_legal_settings_updated'));
  } catch (e) {
    console.error('Failed to save legal settings to storage', e);
  }
}
