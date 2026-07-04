import React, { createContext, useContext, useState, useEffect } from 'react';
import arTranslations from '../locales/ar.json';
import enTranslations from '../locales/en.json';
import loginTranslations from '../locales/login.json';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, any> = {
  ar: { ...arTranslations, login: loginTranslations.ar },
  en: { ...enTranslations, login: loginTranslations.en },
};

// Global dictionary map used for both virtual DOM tree translation and dynamic mutation fallbacks
const globalDict: Record<string, string> = {
  // Sidebar, Menu items, Titles & Welcome
  'لوحة المعلومات': 'Dashboard',
  'لوحة قيادة النظام الموحدة': 'Unified System Dashboard',
  'الأسطول والمعدات': 'Fleet & Equipment',
  'جدولة وتتبع الصيانة': 'Maintenance Schedule',
  'الصيانة الدورية والوقائية': 'Preventive & PM Management',
  'الورش وجودة العمل الميداني': 'Workshops & Field Quality',
  'إدارة شؤون الفنيين': 'Manage Technicians',
  'مستودع وقطع الغيار التكتيكية': 'Warehouse & Spare Parts',
  'التقارير والتحليلات البيانية': 'Reports & Analytics',
  'الاشتراكات والفوترة للشركة': 'Subscription & SaaS Billing',
  'مجمع تشفير السجلات والأمان': 'Permissions & Access Control',
  'أمر صيانة جديد': 'New Work Order',
  'مجمع نظام Axoventra': 'Axoventra SaaS Suite',
  'بوابة سحابية لإدارة حركة الصيانات ومخازن الأساطيل': 'Cloud portal for logistics, workshops, and fleet maintenance',

  // Actions, Buttons & Generic terms
  'حالات المركبات العاجلة': 'Critical Fleet Alerts',
  'تصفية وإجراءات للآليات الفنية': 'Advanced Fleet Filtering & Sorters',
  'تصفية': 'Filter',
  'تصفية حسب الحالة': 'Filter by status',
  'عرض الكل': 'View All',
  'إجمالي المركبات': 'Total Fleet Vehicles',
  'تحت الصيانة': 'Under Repairs',
  'صيانة مكتملة': 'Completed Repairs',
  'مهام معلقة': 'Pending Sells / Tasks',
  'إضافة مركبة': 'Add Vehicle',
  'إضافة مركبة جديدة': 'Add New Vehicle',
  'حفظ المركبة': 'Save Vehicle Specifications',
  'إلغاء': 'Cancel',
  'تحديث': 'Update',
  'تأكيد': 'Confirm',
  'صيانة': 'Maintenance',
  'توقف': 'Stopped',
  'بحث...': 'Search...',
  'الملصقات التجريبية بالورشة للمحاكاة:': 'Simulated workshop barcode labels:',
  'انقر للمحاكاة': 'Click tag to scan & simulate',
  'إدخال رقم لوحة / رمز يدوي:': 'Manual Plate ID Registration:',
  'اكتب رمز اللوحة هنا للتأكيد...': 'Type plate number to push...',
  'قرب ملصق الباركود المطبوع على هيكل المركبة أو لوحة الترخيص لتعديل العتاد فوراً.': 'Position the custom plate label inside the scan container to immediately access and index its repairs history.',
  'جاري تشغيل المستشعر البصري...': 'Instantiating optic lenses...',
  'تم قراءة لوحة الترخيص بنجاح!': 'Vehicle barcode matched!',
  'قارئ واستشعار الباركود الذكي': 'Intelligent Telemetric Barcode Reader',
  'Axoventra - نظام فحص ومعالجة الأصول الرقمية': 'Axoventra - Digital Asset Scanner',
  'تبديل الصلاحيات (تجريبي)': 'Swap Roles (Walkthrough)',
  'التبديل لـ': 'Swap to ',
  'جميع الورش': 'All Workshops',
  'المخازن': 'Warehouses',
  'قيد الانتظار': 'Pending',
  'مكتمل': 'Completed',
  'نشط': 'Active',
  'في الخدمة': 'In Service',
  'تصدير Excel': 'Export Excel',
  'تصدير السجل': 'Export Log',
  'تحميل التقرير': 'Download PDF Report',

  // Vehicles properties & Form variables
  'اسم المركبة مطلوب': 'Vehicle name is required',
  'رقم لوحة المركبة مطلوب': 'Plate number is required',
  'رقم لوحة المركبة هذا مكرر ومسجل بالفعل!': 'Plate number already registered!',
  'رقم الهيكل هذا مكرر ومسجل مسبقاً لمركبة أخرى!': 'Chassis number already exists for another vehicle!',
  'تويوتا بيك أب': 'Toyota Pickup HD',
  'تويوتا بيك أب خفيف': 'Toyota Tacoma Hilux',
  'بيك أب خفيف': 'Light Pickup Truck',
  'شاحنة مرسيدس ثقيلة': 'Mercedes Heavy Duty Truck',
  'شاحنة مرسيدس أكتروس': 'Mercedes Benz Actros',
  'حافلة نقل جماعي بريميوم': 'Hyundai Premium Bus',
  'حافلة نقل جماعي': 'Hyundai Transport Bus',
  'حافلة هيونداي': 'Hyundai Shuttle Bus',
  'رافعة شوكية كاتربيلر': 'CAT Heavy Forklift',
  'رافعة شوكية كات': 'CAT Crane Forklift',
  'مركبة خدمات / صيانة ورشية': 'Utility Service Vehicle',
  'سيارة خفيفة / ملاكي': 'Light Passenger Car',
  'حافلة ركاب / نقل جماعي': 'Commuter Bus Transporter',
  'أمن وطوارئ / رصد أمني': 'Highway Security Scout',
  'آلية ذكية / معدة إلكترونية': 'Smart Heavy Equipment',
  'شاحنة نقل / نقل ثقيل': 'Heavy Duty Hauler',
  'اسم المركبة': 'Vehicle/Asset Name',
  'رقم لوحة': 'Plate No',
  'رقم اللوحة': 'Plate Number / ID',
  'الحالة الفنية': 'Operational Health',
  'النوع': 'Asset Type',
  'القسم': 'Fleet Department',
  'الشعبة': 'Sub Division',
  'الحالة': 'Current Status',
  'عرض التفاصيل والسجل': 'View History & Specifications',
  'شعبة الحركة': 'Logistics & Movement Div',
  'شعبة الصيانة الآلية': 'Mechanical Repairs Div',
  'شعبة الصيانة الدورية': 'PM Routine Inspections Div',
  'قسم الآليات': 'General Fleet Dept',
  'قسم الشؤون الهندسية': 'Engineering Support Dept',
  'قسم ورشة الهياكل': 'Body Shop Repairs Div',
  'قسم الاستثمار': 'Investment Operations Dept',
  'الحمل الأقصى': 'Load Weight Limit',
  'سنة الصنع': 'Model Year',
  'تاريخ الصيانة الأخير': 'Last Completed Repair',
  'سجل الصيانة والمهام المنجزة': 'Chronological Repairs & Task Logs',
  'تغطية تأمينية تفصيلية للآلية': 'Asset Insurance Coverage Policies',
  'تاريخ انتهاء التأمين': 'Insurance Underwriter Expiry',
  'نوع الوقود': 'Engine Fuel Type',
  'حجم الإطار': 'Operational Tire Size',
  'رقم الهيكل': 'Chassis Serial [VIN]',
  'رقم المحرك': 'Engine Serial SKU',
  'عدد المحاور الإطارية': 'Wheel / Axle Count',
  'ضغط الإطار المقياسي': 'Optimal Tire Psi Pressure',
  'حالة تآكل المداس': 'Tread Health Status',
  'العلامة التجارية المحملة': 'Mounted Tire Brand',
  'الآلات والعتاد': 'Asset Components',
  'أضف بنداً جديداً': 'Add Spare Part Item',
  'بواجي تيتانيوم': 'Titanium Spark Plugs',
  'فلتر ماء ديزل': 'Diesel Separation Water Filter',
  'سير مروحة مرن': 'Rubber Heavy Fan Belt',
  'سائل تبريد ممتاز': 'Premium Polyethylene Coolant',
  'بواجي ليزر': 'Laser-precision Spark Plugs',
  'البرنامج الدوري للآلية': 'Vehicle Preventive Schedule',
  'المسافة قبل الصيانة الموصى بها': 'Pre-inspections interval (km)',
  'المهندس أحمد': 'Eng Ahmed (Workshop Officer)',
  'المهند خالد': 'Eng Khaled (Fleet Manager)',
  'فني ميكانيك أول': 'Lead Senior Mechanic',
  'فني كهربائي وتكييف': 'Electrical & AC Tech Specialist',
  'فني هيدروليك وروافع': 'Hydraulics & Crane Operator',
  'بواجي': 'Spark Plugs Platinum',
  'زيت محرك 5W30': 'Castrol Engine Oil 5W30',
  'فلتر زيت': 'Premium Oil Filter',
  'إطار ميشلان': 'Michelin Latitude Tire',
  'مكابح': 'Advanced Brake Pads',
  'سيور دينامو': 'Serpentine Dynamo Belts',
  'خطوة': 'Step',
  'التالي': 'Next Step',
  'السابق': 'Previous Step',
  'تأكيد وحفظ البيانات': 'Confirm & Save Asset',
  'مواصفات الإطارات والعجلات': 'Tire & Chassis Calibration',
  'المعلومات الميكانيكية والوقود': 'Engine & Power Unit Parameters',
  'البيانات الأساسية والهوية': 'Basic Identity & Dept Assignment',
  'اسحب وأفلت صورة الآلية هنا': 'Drag and drop vehicle image asset here',
  'أو انقر لتصفح الملفات من جهازك': 'or click to browse your repository',
  'اختيار من النماذج والآليات الجاهزة بالمنصة': 'Choose from ready platform-cached stock previews',
  'عرض سجل الصيانة والتفاصيل الميكانيكية الكاملة للآلية': 'Examine comprehensive lifecycle logs for this asset',
  'جدول الصيانة والتشخيص والقطع المستهلكة الملحقة': 'Connected work orders, parameters logs, and parts invoices',
  'تعديل تفاصيل الآلية': 'Modify Asset Spec Files',
  'حذف هذه الآلية نهائياً': 'Purge asset from local storage',

  // Maintenance / Work Orders Tab
  'أوامر العمل المفتوحة': 'Active Open Work Orders',
  'إضافة أمر صيانة جديد للأسطول الميداني': 'Dispatch New Maintenance Work Order',
  'صيانة دورية': 'Scheduled PM Check',
  'إصلاح طارئ': 'Emergency Unscheduled Repair',
  'معايرة أجهزة والكترونيات': 'Optics & CPU Recalibration',
  'تغيير قطع تآكل': 'Wear Parts Replacement',
  'تأثير الإجراء الميكانيكي على الإنتاجية المباشرة': 'Asset Operational Priority Indicator',
  'عالية جداً': 'Very High Priority (Immediate)',
  'عادية': 'Standard Priority (Routine)',
  'منخفضة': 'Low Priority (Deferred)',
  'أمر صيانة': 'Repair Order',
  'تفاصيل أمر الصيانة': 'Technical Work Order Details',
  'أولويات وأوامر العمل لتشغيل وتصليح الآليات الفنية': 'Operational Priorities & Status Sinks for Fleet Assets',
  'بحث عن أمر صيانة...': 'Locate work orders by ID or asset...',
  'الآلية الفنية المستهدفة': 'Target Diagnostic Vehicle',
  'وصف المشكلة الميكانيكية بدقة': 'Precise Description of Issue',
  'الإجراء الفني المتخذ أو المطلوب': 'Technical Action Taken/Required',
  'رقم أمر الصيانة': 'Work Order ID',
  'تاريخ وجدولة الصيانة': 'Assigned Repair Date',
  'تكلفة الصيانة الإجمالية ($)': 'Total Spare Part Invoice ($)',
  'الفني المسؤول عن المعالجة': 'Lead Assigned Tech Specialist',
  'حالة أمر العمل حالياً': 'Current Order State',
  'قيد المعالجة': 'In Progress / Processing',
  'مفتوح': 'Open & Awaiting Allocation',
  'ملغى': 'Cancelled',
  'تحديث حالة الأمر للآلية': 'Recalibrate Order Parameters',
  'جدولة وتوثيق الصيانة الدورية': 'Documentation & scheduling logs',
  'التوصيات الفنية للعداد القادم': 'Technical remarks for next service interval',
  'تغيير زيت وفلاتر وتدقيق ضغط الإطارات': 'Oil & Filter service plus wheel pressure audit',
  'الكشف الميكانيكي المنسوب للتاريخ المذكور': 'Inspection logs corresponding to dates',

  // Workshops page
  'الورش والميدان': 'Workshops & Field Operations',
  'ضغط ومعدل الورش': 'SaaS Workshop Congestion Heatmap',
  'ورشة صيانة الهياكل': 'Structural Chassis & Body Shop',
  'ورشة معالجة المحركات والسوائل': 'Powerplants, Fluids & Powertrains Shop',
  'ورشة الصيانة السريعة والكهرباء': 'Electrical Systems & Quick Lube Express Shop',
  'ورش المجموعة الأربعة': 'Enterprise Operations Workshops',
  'الموقع الجغرافي': 'GIS Coordinates / Location',
  'طاقة التحمل': 'Active Mechanics Bay Capacity',
  'عدد الأجهزة والرافعات الفعالة': 'Diagnostic Rigs & Hydraulic Lifts Active',
  'معدل إشغال الخلايا حالياً': 'Dynamic Bay Congestion Factor',
  'الضغط الحالي': 'Cell Pressure Load',
  'الحالة الفنية للورشة': 'Facility Technical Standing',
  'الورش وشعب الحركة': 'Local Repair Facilities & Depots',

  // Reports
  'تقارير وتحليلات الأسطول': 'Telemetry Reports & Enterprise Insights',
  'معدل الصرف والاهتلاك': 'Expense Burn Rates & Wear Deterioration',
  'نسبة كفاءة التشغيل': 'Active Fleet Operational Efficiency %',
  'مؤشرات صيانة الأسطول': 'Maintenance KPI Benchmarks & SLA Status',
  'تحميل كود QR': 'Generate System QR Code',
  'تصدير التقرير': 'Export Comprehensive PDF Audit Report',
  'الصيانات الممتازة والمنجزة اليوم': 'Superb Technical Repairs Logged Today',
  'قيمة المصاريف الفنية على قطع الغيار المعتمدة بالشهر': 'Consumables & Parts Spend Ratio (USD/Month)',
  'متوسط تكلفة الإصلاح': 'Average Asset Repair Cycle Cost',
  'المستردات من عقود الفواتير والـ SaaS': 'Recouped Capital from Subscription SLA',

  // Technicians
  'الفنيون المنتسبون': 'Active Certified Engineers & Techs',
  'في مهمة': 'On Dispatch Mission',
  'إجازة': 'Standard Vacation/Leave',
  'مستودع وقطع الغيار': 'Automated Inventory & Consumables Warehouse',
  'الكمية المتاحة': 'Stock On Hand',
  'الحد الأدنى للمخزون الموصى به لمتطلبات الصيانة الدورية الحالية': 'Recommended Minimum safety buffers for active cycles',
  'تنبيه نقص المخزون': 'Safety Stock Trigger Warning!',
  'مستوى الأصول بالباقي': 'Remaining Item Volume Quantity',
  'موقع الرف والموقع الجغرافي': 'Rack ID Grid coordinates',

  // Security Audit
  'مسؤول تكنولوجيا نظام Axoventra': 'Axoventra Head Cyber Security Architect',
  'سجل الامتثال والوصول': 'System Auditing & Real-time Intrusion Logs',
  'مجمع تشفير السجلات والأمان والامتثال': 'Security Permissions, SSL Protocol Auditing & Compliance Sinks',
  'الامتثال الإلكتروني لتسجيل الدخول الفوري والتحركات بـ SaaS': 'Real-time SaaS Enterprise Compliance Cryptographic Logs',
  'تشغيل جلسة آمنة': 'Enterprise Session TLS 1.3 Verified Secure',
  'سجل التشغيل المباشر': 'Live Decrypted Audit & Telemetry Sinks',
  'مسؤول الرمز': 'Passphrase Administrator Security Override',

  // Billing tab
  'إدارة الاشتراك والفوترة': 'SaaS Subscriptions Sinks & Billing Operations',
  'باقة بريميوم كلاس النشطة': 'Premium Class Enterprise Active Package',
  'Axoventra بريميوم كلاس': 'Axoventra Premium SLA Package',
  'مجموع دورة الفوترة الأوتوماتيكية الحالية': 'Consolidated Monthly SLA Billing Cycle Ratio',
  'الفواتير والتحميل المباشر للتقارير المالية': 'Automated PDF Invoice Sinks & Financial Statements Archive',
  'توزيع المصاريف الإجمالية': 'Aggregated Operations Cost Components Allocation',
  'قسم الصيانة السنوية': 'Annual Preventive Maintenance SLA Fee',
  'اشتراك الإدارات الرقمي': 'Digital Workspace Concurrent Seat Licenses',

  // Common translation tags
  'فعالة': 'Fully Active',
  'متوقفة': 'Stopped / Inactive',
  'تاريخ البدء': 'Deployment Date',
  'موعد الفحص': 'Scheduled Inspection Date',
  'أقسام وصلاحيات': 'Governance Protocols & Roles',
  'الترقية لبريميوم': 'Upgrade package to Premium Class',
  'مزامنة البيانات': 'Refresh and Sync Sinks',
  'الفئات الطارئة': 'Incident Priority Code',
  'التاريخ والوقت': 'Diagnostic Timestamp',
  'الأولوية': 'Urgency Priority',
  'رئيسي': 'Lead Engineer',
  'حرجة': 'Critical / Immediate',
  'عادي': 'Routine Action',
  'بسيط': 'Advisory / Low',
  'الرئيسية': 'Dashboard Indicator Panel',
  'المركبات': 'Fleet & Cargo Assets',
  'الفنيون': 'Assigned Technicians',
  'المستودع': 'Central Warehouse Hub',
  'التقارير': 'Analytics & Telemetry',
  'الاشتراكات': 'Active SaaS Billing',
  'الأمان': 'SSL Audit Logs',
  'الورش': 'Operational Workshop Cells',
  'حالة الورش والضغط': 'Workshop Load Standings',
  'الأقسام والشعب': 'Enterprise Divisions & Sectors',
  'عرض تفاصيل الصيانة والتكاليف التكتيكية للمركبة': 'View technical maintenance history and associated invoice costs',
  'شعبة الصيانة': 'General Maintenance Div',
  'قسم صيانة المحركات': 'Powertrains & Fuel Induction Dept',
  'شعبة الكهرباء والالكترونيات': 'Electrical & Diagnostic Div',

  // Missing Login, Billing & Quotas details
  'الباسكود غير صحيح! (اتركه فارغاً أو اكتب 1234 للتجربة)': 'Password incorrect! (Leave blank or write 1234 to bypass)',
  'احجز هويتك المراد الدخول بها (SaaS Role):': 'Select your professional identity:',
  'رمز المرور للتأكيد (Passcode)': 'Demo Passcode',
  'اكتب رمز الدخول...': 'Enter demo password...',
  '💡 رمز المرور الافتراضي المعزز للأمن هو 1234': '💡 Use default walkthrough passcode: 1234',
  'جاري التحقق والمزامنة...': 'Checking identity & syncing...',
  'Secure Login to Enterprise': 'Secure Login to Enterprise',
  'تسجيل الدخول الآمن للـ SaaS': 'Secure Login to Enterprise',
  'مدير نظام': 'Admin',
  'فني صيانة': 'Technician',
  'مركبة خفيفة': 'Light Vehicle',
  'إدارة الاشتراك واستغلال سعة باقة الـ SaaS': 'SaaS Subscriptions & Billing Quotas',
  'بوابة الفوترة الفعالة': 'Active Billing Portal',
  'دفع شهري 🗓️': 'Monthly Payment 🗓️',
  'دفع سنوي 🎉': 'Yearly Payment 🎉',
  'وفر 20%': 'Save 20%',
  'الباقة الأساسية': 'Basic Plan',
  'الباقة المتقدمة': 'Pro Plan',
  'باقة المؤسسات الضخمة': 'Enterprise Plan',
  'الباقة الأساسية (Basic)': 'Basic Plan (Basic)',
  'الباقة المتقدمة (Pro)': 'Pro Plan (Pro)',
  'باقة المؤسسات الضخمة (Enterprise)': 'Enterprise Plan (Enterprise)',
  'باص المجمع الفعال': 'Active Enterprise Quotas',
  'المهن خالد': 'Eng Khaled',
  'الالمهندس خالد': 'Eng Khaled',
  'الفني أحمد': 'Tech Ahmed',
  'المراقب سالم': 'Quality Inspector Salem',
  'مدير قسم الصيانة': 'Maintenance Department Director',
  'تدقيق جرد المخزون': 'Stock Audit',
  'بدء دورة جرد جديدة': 'Start New Stock Audit Cycle',
  'اعتماد جرد الرفوف': 'Commit Shelf Stock Audit',
  'جدول جرد المخزون ومطابقة الأرصدة القائمة': 'Stock Audit Table & Discrepancy Reconciliation',
  'الكمية الدفترية': 'System Book Qty',
  'الكمية الفعلية': 'Physical Counted Qty',
  'الفارق الفعلي المكتشف': 'Discrepancy Delta',
  'ملاحظة تدقيق التسوية': 'Audit Adjust Note',
  'لا توجد حركات تسوية جرد سابقة مسجلة.': 'No previous stock audit adjustments recorded.',
  'تاريخ الجرد': 'Audit Date',
  'الشخص المسؤول بالعد': 'Audit Officer',
  'أصناف خاضعة للجرد': 'Auditing Items',
  'قطع تم تعديلها': 'Adjusted Items Count',
  'القيمة الصافية للتسوية المالية': 'Net Financial Adjustment',
  'حالة الجرد الدورية الحاليّة': 'Current Periodic Stock Audit Session',
  'الكل مطابق': 'Force Match All',
  'تصفير المدخلات': 'Reset Counts',
  'تثبيت واعتماد دورة الجرد الفعالة': 'Approve & Post Active Stock Audit Cycle',
  'سجل دورات الجرد التاريخية المكتملة': 'Completed Historic Stock Audits',
  'التفاصيل': 'Details',
  'مطابق': 'Match',
  'زيادة (فائض)': 'Surplus',
  'نقص (عجز)': 'Deficit',

  // Sidebar Menu Items & Group Labels
  'لوحة التحكم': 'Dashboard',
  'التقارير والإحصائيات': 'Reports & Statistics',
  'إدارة المعدات والمركبات': 'Fleet & Equipment Management',
  'إدارة السائقين والتفويضات': 'Drivers & Authorizations',
  'تسليم واستلام العجلات الفني': 'Vehicle Technical Handover',
  'إدارة الورش والضغط الميداني': 'Workshops & Field Operations',
  'إدارة أوامر الصيانة': 'Maintenance Work Orders',
  'إدارة الصيانة الدورية': 'Preventive Maintenance Management',
  'إدارة الفنيين والعاملين': 'Technicians & Staff',
  'إدارة المخزن والقطع': 'Warehouse & Spare Parts Inventory',
  'إدارة الموردين والتوريد': 'Vendors & Supply Chains',
  'صلاحيات الموظفين والامتثال': 'Permissions & Compliance',
  'لوحة تحكم الموقع': 'Website Marketing Admin',

  // Drivers page specific
  'قاعدة تسجيل وإدارة السائقين والمفوضين بالحركة': 'Drivers & Authorized Movement Personnel Registry',
  'وحدة ذكاء الأسطول المركزي Axoventra': 'Central Fleet Intel Module Axoventra',
  'تأكيد الإجراء وحفظ السجل': 'Confirm Action & Save Log',
  'سجل رخص قيادة السائقين وتفويضات القيادة النشطة': 'Driver Licenses & Active Authorization Records',
  'إجمالي السائقين': 'Total Drivers',
  'سائقين نشطين': 'Active Drivers',
  'سائقين بلا مهام': 'Unassigned Drivers',
  'رخص حرجة وقريبة الانتهاء': 'Critical/Expiring Licenses',
  'إضافة سائق جديد': 'Add New Driver',
  'سجل الحركة الشخصي الفني للسائق': 'Driver Personal History & Operational Score',
  'تقييم السلوك الفني للسائق': 'Driver Behavior Assessment',
  'مستوى السلامة': 'Safety Standing Level',
  'الحوادث والتحذيرات': 'Incidents & Warnings',
  'تحديث بيانات السجل والتاريخ': 'Update Log Book & History',

  // Vehicles page specific
  'قاعدة البيانات والتحليلات الأساسية للمركبات والمعدات الثقيلة': 'Core Fleet Assets & Heavy Equipment Database',
  'محاكاة رمز الاستجابة السريع للباركود للمواصفات الفنية': 'Diagnostic Barcode QR Simulator',
  'إضافة مركبة للأسطول': 'Add Vehicle to Fleet',
  'تعديل بيانات المركبة': 'Edit Vehicle Data',
  'تأكيد الإجراء وحفظ المركبة': 'Confirm Specs & Save Vehicle',
  'بطاقة فحص المركبة الفنية والمعايرة رقم': 'Asset Technical Card & Calibration No.',
  'هوية وهيكل الآلية الفيدرالية': 'Asset Identity & Frame Classification',
  'تفاصيل القيادة والجدول الفني الدوري': 'Drive Metrics & Routine PM Schedule',
  'أرقام القطع والمستلزمات في المخزن': 'Stock Serial Codes & Parts',

  // Workshops specific
  'لوحة مراقبة وإشغال ورش الأسطول والميدان السريع': 'Fleet Workshops & Live Field Operations Monitor',
  'الورش الفعالة الميدانية ومستوى السعة الإجمالية': 'Active Field Repair Facilities & Bay Capacities',
  'اسم الورشة': 'Workshop Name',
  'معدل الإشغال': 'Active Bays Occupancy',
  'الفنيين المتاحين': 'Available On-Duty Technicians',
  'عدد الرافعات': 'Hydraulic Rigs Count',

  // Technicians specific
  'سجل توزيع الفنيين وحساب المهام بالورش': 'Certified Workshop Technicians & Action Allocation',
  'إدارة وتتبع الفنيين والعاملين باللجان الفنية الميدانية': 'Manage and track workshop engineers & dispatch personnel',
  'إضافة فني جديد': 'Add New Certified Technician',
  'توزيع مهام العمل اليومية': 'Active Daily Task Allocations',
  'إجمالي الفنيين': 'Total Engineers',
  'فنيين بالورش': 'On-Duty in Workshop',
  'فنيين في مهمة': 'Dispatched on Mission',
  'فنيين في إجازة': 'On Standard Leave',
  'تأكيد الإجراء وحفظ تفاصيل الفني': 'Confirm Details & Save Technician',
  'رقم تذكرة': 'Ticket ID',
  'التفاصيل الفنية وحالة المهارة': 'Skill Levels & Technical Background',

  // Inventory specific
  'مستوى المخزون الحالي': 'Current Inventory Levels',
  'أصناف حرجة (تحتاج طلب)': 'Critical Items (Need Order)',
  'أصناف مستقرة': 'Stable Items',
  'إجمالي قيمة المخزون': 'Total Inventory Valuation',
  'تعديل وتحديث تفاصيل القطعة': 'Edit & Adjust Part Specifications',
  'تأكيد الإجراء وحفظ القطعة': 'Confirm & Save Part Details',
  'صورة المعاينة الفنية للمنتج': 'Product Technical Preview Image',
  'اسحب الصورة هنا أو اختر وسيلة التقاط/رفع': 'Drag an image here or choose input type',
  'رفع صورة من الجهاز': 'Upload Image File',
  'التقاط فوري بالكاميرا 📷': 'Shoot Live Photo 📷',
  'أو أدخل رابط ويب خارجي يدوياً': 'Or enter a manual web hyperlink',
  'جرد وتتبع مخازن الأمان لقطع الغيار والمستهلكات': 'Track and audit spare parts inventory & safety stock buffers',

  // Periodic Maintenance page specific
  'جدول الصيانة الدورية والوقائية والمسافات المقطوعة': 'Preventive & Scheduled PM Maintenance Tracker',
  'تخطيط برنامج الصيانة الدورية للأصول حسب قراءات العداد الميكانيكي': 'Plan PM schedules dynamically based on odometer readings',
  'أضف برنامج دوري جديد': 'Add Preventive Program',
  'البرنامج الدوري': 'Preventive Program',
  'المسافة المستهدفة (كم)': 'Target Interval (km)',
  'الإجراء الموصى به': 'Mandatory PM Action',
  'المركبات المشمولة بالبرنامج': 'Vehicles Subscribed',
  'المصروفات التقديرية (USD)': 'Estimated Expenses (USD)',
  'تعديل برنامج الصيانة الدوريّة': 'Edit Preventive Program Parameters',
  'تأكيد الإجراء وحفظ البرنامج': 'Confirm Parameters & Save Program',

  // Support tickets
  'الدعم الميداني وقنوات المساعدة': 'Mechanic Live Desk & Support Workspace',
  'منصة تواصل تفاعلية فورية ومولد التذاكر': 'Interactive real-time communication & support ticket generator',
  'افتح تذكرة صيانة SLA 🎫': 'Open Ticket 🎫',
  'تم توليد تذكرة دعم فني SaaS معتمدة!': 'SaaS Support Ticket Successfully Dispatched!',
  'سيتواصل معك خبير معترف به خلال ساعة عمل واحدة.': 'SLA parameters instantiated. Expect response within 1 working hour.',
  'اكتب تساؤلك أو رسالتك للدعم...': 'Enter your technical request details...',

  // Billing
  'بوابة الاشتراك والفوترة': 'SaaS Subscriptions & Billing Quotas',
  'تغيير الخطة': 'Upgrade Package',
  'فاتورة رقم': 'Invoice ID',
  'تاريخ الفاتورة': 'Billing Date',
  'القيمة المستحقة': 'Outstanding Amount',
  'تحميل PDF': 'Download PDF Invoice',

  // Security Audit

  // Custom additional labels for total page translation coverage
  'منظومة السيطرة الشاملة لتسجيل رخص القيادة وربطهم بالأجهزة والمعدات، ومراقبة فترات الصلاحية والأخلاقيات المهنية للسائقين والمساعدين.': 'Comprehensive platform for registering driver licenses, assigning them to machinery, and monitoring validity periods & professional behavior.',
  'سجل كامل بجميع الأصول التابعة للمؤسسة تفصيلياً مع الإطارات والبيانات المتقدمة.': 'Detailed asset lifecycle records mapping multi-axle pressure sensors and chassis safety.',
  'إضافة مركبة تفصيلياً': 'Add Custom Vehicle Details',
  'تتبع توزيع الأصول، الطاقات الاستيعابية، كفاءة الرافعات والعدد الفنية المتخصصة داخل المجمّع العام لـ Axoventra.': 'Track overall asset allocation, bay capacities, mechanic dispatching, and diagnostic tool reserves.',
  'متابعة تخصصات الفنيين بالورشة، توزيع جدول البلاغات، وإضافة الفنيين وحالاتهم التشغيلية.': 'Track workshop engineer classifications, daily repair schedules, and log certificated availability.',
  'ابحث بالاسم، التخصص أو الهاتف...': 'Search by name, expertise, or phone...',
  'تتبع كلي لقطع الغيار، الإطارات والزيوت وسوائل الآلات مع حدود التنبيه التلقائي وسجل توريد وجرد متكامل.': 'Enterprise spare parts master log, specifying rack ID grids, safety alert thresholds, and automated audits.',
  'أصناف قطع الغيار': 'Warehouse Inventory Items',
  'حركة التوريد والصرف': 'Stock Transactions Sinks',
  'دورة تدقيق ومطابقة جرد المخازن الدورية': 'Periodic Stock Audit Cycle',
  'الكشف المباشر لتشغيل الورشة في المجمّع': 'Live operational telemetry monitoring active bays',
  'ابحث بالاسم، الكود، الرف أو المورد...': 'Search by part name, SKU, shelf ID, or vendor...',
  'إحصائيات وتحليلات صيانة الأسطول والمعدات': 'Fleet & Equipment Maintenance Analytics',
  'إدارة الورش والمربعات التشغيلية': 'Workshops & Operational Bays',
  'مدير المشروع': 'Project Manager',
  'الترتيب التلقائي حسب نسبة الإشغال': 'Auto-sort by Occupancy Rate',
  'تسكين مركبة بالورشة': 'Allocate Vehicle to Workshop',
  'تأسيس ورشة جديدة': 'Establish New Workshop',
  'إجمالي الورش القائمة بالميدان': 'Total Operational Workshops',
  'وحدات تتبع مدمجة': 'Integrated tracking units',
  'جاهزية اتصالات الاستشعار': 'Sensor communication readiness',
  'معدل انشغال خطوط الفحص': 'Inspection Line Occupancy Rate',
  'مسارات': 'bays',
  'من أصل': 'out of',
  'طاقة استيعابية تشغيلية متوازنة': 'Balanced operational capacity',
  'مؤشر جودة نجاح الإصلاح الأول FTR': 'First Time Right (FTR) Quality Index',
  'إجمالي الورش': 'All workshops',
  'تحسن في الأداء الربع سنوي': 'quarterly performance improvement',
  'متوسط دورة إقامة المركبة بالمسار': 'Average vehicle stay duration in bay',
  'من الفحص للتخريج الميداني': 'From checkup to field release',
  'تحديث ديناميكي كل 12 ساعة': 'Dynamic update every 12 hours',
  'توزيع كفاءة العمليات (First Time Right) عبر الأقسام التقنية': 'Operations Efficiency (FTR) Distribution across Technical Depts',
  'مؤشر كفاءة الإصلاح الأمني FTR': 'Security Repair Efficiency FTR',
  'مستهدف الجودة العام:': 'Overall quality target:',
  'ترتيب أقسام كفاءة الإصلاح الأول (FTR)': 'First Time Right (FTR) Departments Ranking',
  'معدل نجاح المهام الفنية من المحاولة الأولى': 'Success rate of technical tasks on first attempt',
  'الخريطة الحرارية لمؤشر ضغط العمل والترشيح التفاعلي (Heatmap)': 'Workload Congestion & Interactive Filter Heatmap',
  'مستوى الإشغال الميداني': 'Field Occupancy Level',
  'ضغط عمل حرج': 'Critical workload',
  'ضغط متوسط': 'Medium workload',
  'متاح ومستقر': 'Available & Stable',
  'صيانة المرفق': 'Facility maintenance'
};

const arCharRegex = /[\u0600-\u06FF]/;

function translateValue(val: any, dict: Record<string, string>): any {
  if (typeof val !== 'string') return val;
  if (!arCharRegex.test(val)) return val;

  const trimmed = val.trim();
  if (dict[trimmed]) {
    const leading = val.match(/^\s*/)?.[0] || '';
    const trailing = val.match(/\s*$/)?.[0] || '';
    return leading + dict[trimmed] + trailing;
  }

  // Sort keys by size descending to prevent partial replacements
  const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
  let newVal = val;
  let changed = false;
  for (const arWord of sortedKeys) {
    if (newVal.includes(arWord)) {
      newVal = newVal.replaceAll(arWord, dict[arWord]);
      changed = true;
    }
  }
  return newVal;
}

function translateClassName(className: string, lang: 'ar' | 'en'): string {
  if (lang === 'ar') return className;
  let cl = className;
  cl = cl.replace(/\btext-right\b/g, 'text-left');
  cl = cl.replace(/\bspace-x-reverse\b/g, '');
  cl = cl.replace(/\brtl\b/g, 'ltr');
  cl = cl.replace(/\brtl:text-right\b/g, 'ltr:text-left');
  cl = cl.replace(/\brtl:space-x-reverse\b/g, '');
  cl = cl.replace(/\brtl:flex-row-reverse\b/g, '');
  cl = cl.replace(/\bflex-row-reverse\b/g, 'flex-row');
  return cl;
}

export function translateReactTree(node: React.ReactNode, dict: Record<string, string>, lang: 'ar' | 'en'): React.ReactNode {
  if (!node) return node;

  if (typeof node === 'string') {
    return translateValue(node, dict);
  }

  if (typeof node === 'number' || typeof node === 'boolean') {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((item) => translateReactTree(item, dict, lang));
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<any>;

    if (typeof element.type === 'string' && (
      element.type === 'svg' || 
      element.type === 'path' || 
      element.type === 'circle' || 
      element.type === 'line' || 
      element.type === 'rect' || 
      element.type === 'polygon' || 
      element.type === 'polyline'
    )) {
      return element;
    }

    const { props } = element;
    let newProps: any = null;
    let hasChanged = false;

    // String prop properties replacement
    const excludeProps = new Set(['className', 'id', 'key', 'src', 'href', 'type', 'color', 'size', 'variant', 'theme', 'classes', 'icon', 'onClick', 'onChange', 'onSubmit']);
    for (const [key, val] of Object.entries(props)) {
      if (!excludeProps.has(key) && typeof val === 'string') {
        const translated = translateValue(val, dict);
        if (translated !== val) {
          if (!newProps) newProps = { ...props };
          newProps[key] = translated;
          hasChanged = true;
        }
      }
    }

    // Direction attribute mapping for hardcoded dir="rtl" wrappers
    if (lang === 'en' && props.dir === 'rtl') {
      if (!newProps) newProps = { ...props };
      newProps.dir = 'ltr';
      hasChanged = true;
    }

    // ClassName alignments replacement
    if (lang === 'en' && typeof props.className === 'string') {
      const translatedClass = translateClassName(props.className, lang);
      if (translatedClass !== props.className) {
        if (!newProps) newProps = { ...props };
        newProps.className = translatedClass;
        hasChanged = true;
      }
    }

    // Recursive children traversal
    if (props.children && typeof props.children !== 'function') {
      const translatedChildren = translateReactTree(props.children, dict, lang);
      if (translatedChildren !== props.children) {
        if (!newProps) newProps = { ...props };
        newProps.children = translatedChildren;
        hasChanged = true;
      }
    }

    if (hasChanged) {
      return React.cloneElement(element, newProps);
    }

    return element;
  }

  return node;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    // Reload full page to ensure any manual real-time translated DOM nodes are cleanly unmounted and remounted from scratch
    window.location.reload();
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
  }, [language, dir]);

  // Real-time complete DOM translation observer when language is set to English
  useEffect(() => {
    if (language !== 'en') return;

    // Comprehensive translation mapping of Arabic technical terms in the system to English
    const dict = globalDict;

    const translateDOM = () => {
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walk.nextNode();
      while (node) {
        if (node.nodeValue) {
          const trimVal = node.nodeValue.trim();
          if (dict[trimVal]) {
            node.nodeValue = node.nodeValue.replace(trimVal, dict[trimVal]);
          } else {
            let newVal = node.nodeValue;
            let changed = false;
            for (const [arWord, enWord] of Object.entries(dict)) {
              if (newVal.includes(arWord)) {
                newVal = newVal.replaceAll(arWord, enWord);
                changed = true;
              }
            }
            if (changed) {
              node.nodeValue = newVal;
            }
          }
        }
        node = walk.nextNode();
      }

      // Translate placeholders
      const inputs = document.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        const ph = input.getAttribute('placeholder');
        if (ph && dict[ph.trim()]) {
          input.setAttribute('placeholder', dict[ph.trim()]);
        } else if (ph) {
          let newPh = ph;
          let changed = false;
          for (const [arWord, enWord] of Object.entries(dict)) {
            if (newPh.includes(arWord)) {
              newPh = newPh.replaceAll(arWord, enWord);
              changed = true;
            }
          }
          if (changed) {
            input.setAttribute('placeholder', newPh);
          }
        }
      });
    };

    // Run once on load/render
    translateDOM();

    // Set up MutationObserver to intercept any dynamic client changes
    const observer = new MutationObserver((mutations) => {
      observer.disconnect();
      translateDOM();
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
    };
  }, [language]);


  // Nested key resolver, e.g. t('menu.dashboard')
  const t = (keyPath: string): string => {
    if (language === 'en') {
      const trimmed = keyPath.trim();
      if (globalDict[trimmed]) {
        return globalDict[trimmed];
      }
    }

    const keys = keyPath.split('.');
    let current = translations[language];
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English translation first if Arabic is missing
        let enFallback = translations['en'];
        let foundFallback = true;
        for (const fKey of keys) {
          if (enFallback && typeof enFallback === 'object' && fKey in enFallback) {
            enFallback = enFallback[fKey];
          } else {
            foundFallback = false;
            break;
          }
        }
        if (foundFallback && typeof enFallback === 'string') {
          return enFallback;
        }
        
        // Also fallback to globalDict lookup
        const trimmed = keyPath.trim();
        if (language === 'en' && globalDict[trimmed]) {
          return globalDict[trimmed];
        }
        return keyPath;
      }
    }
    
    return typeof current === 'string' ? current : keyPath;
  };

  const translatedChildren = children;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      <div dir={dir} className={language === 'ar' ? 'font-sans' : 'font-sans tracking-normal'}>
        {translatedChildren}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
