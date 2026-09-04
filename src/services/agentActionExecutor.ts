import { getStorageJson, setStorageJson } from './safeStorage';
import { 
  vehicles as defaultVehicles, 
  maintenanceOrders as defaultOrders, 
  inventory as defaultInventory, 
  technicians as defaultTechnicians,
  drivers as defaultDrivers
} from '../data';

export interface ActionFieldDef {
  name: string;
  labelAr: string;
  labelEn: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'date';
  options?: { value: string; labelAr: string; labelEn: string }[];
  defaultValue?: string | number;
  placeholderAr?: string;
  placeholderEn?: string;
  required?: boolean;
}

export interface AgentActionDef {
  actionType: string;
  agentId: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  iconName: string;
  badgeAr: string;
  badgeEn: string;
  color: string;
  fields: ActionFieldDef[];
}

export interface ExecutedActionReceipt {
  id: string;
  actionType: string;
  agentId: string;
  agentNameAr: string;
  agentNameEn: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  timestamp: string;
  entityId: string;
  params: Record<string, any>;
  status: 'completed' | 'failed';
}

// 1. Full Catalog of Actions by Agent Specialty
export const AGENT_ACTION_CATALOG: Record<string, AgentActionDef[]> = {
  'project-manager': [
    {
      actionType: 'dispatch_trip',
      agentId: 'project-manager',
      titleAr: 'إسناد وجدولة رحلة أسطول فورية',
      titleEn: 'Dispatch & Schedule Fleet Trip',
      descAr: 'جدولة رحلة ميدانية جديدة وتعيين سائق ومركبة ومزامنتها مباشرة مع تطبيق السائق.',
      descEn: 'Schedule a new field trip, assign vehicle & driver, syncing to Driver App.',
      iconName: 'Send',
      badgeAr: 'تشغيل • رحلات',
      badgeEn: 'OPS • DISPATCH',
      color: 'violet',
      fields: [
        {
          name: 'vehicleId',
          labelAr: 'المركبة المخصصة',
          labelEn: 'Assigned Vehicle',
          type: 'select',
          required: true
        },
        {
          name: 'driverName',
          labelAr: 'السائق المعين',
          labelEn: 'Assigned Driver',
          type: 'text',
          placeholderAr: 'مثال: أبو فهد الشمري',
          placeholderEn: 'e.g. Fahad Al-Shammari',
          required: true
        },
        {
          name: 'destination',
          labelAr: 'الوجهة / موقع المشروع',
          labelEn: 'Destination / Project Site',
          type: 'text',
          placeholderAr: 'مثال: مشروع نيوم - البوابة الشمالية B-4',
          placeholderEn: 'e.g. Neom Gate B-4',
          required: true
        },
        {
          name: 'origin',
          labelAr: 'نقطة الانطلاق',
          labelEn: 'Origin Depot',
          type: 'text',
          defaultValue: 'مستودع الرياض المركزي',
          required: true
        },
        {
          name: 'cargoType',
          labelAr: 'نوع الحمولة / المهمة',
          labelEn: 'Cargo / Mission Type',
          type: 'text',
          placeholderAr: 'مثال: مواد بناء ومعدات مساندة',
          placeholderEn: 'e.g. Construction materials',
          required: true
        },
        {
          name: 'departureTime',
          labelAr: 'وقت الانطلاق المقرر',
          labelEn: 'Departure Schedule',
          type: 'text',
          placeholderAr: '2026-06-01 08:00',
          placeholderEn: '2026-06-01 08:00'
        }
      ]
    },
    {
      actionType: 'assign_technician_reschedule',
      agentId: 'project-manager',
      titleAr: 'إعادة جدولة وتعيين فني لأمر صيانة',
      titleEn: 'Assign Tech & Reschedule Order',
      descAr: 'حل اختناقات الورشة عبر إعادة توجيه أمر الصيانة لفني متاح وتحديث الأولوية.',
      descEn: 'Resolve bottlenecks by assigning an order to an available tech and resetting priority.',
      iconName: 'UserCheck',
      badgeAr: 'جدولة • طواقم',
      badgeEn: 'SCHEDULE • TECH',
      color: 'violet',
      fields: [
        {
          name: 'orderId',
          labelAr: 'رقم أمر الصيانة',
          labelEn: 'Work Order ID',
          type: 'select',
          required: true
        },
        {
          name: 'technicianId',
          labelAr: 'الفني المعين الجديد',
          labelEn: 'New Assigned Technician',
          type: 'select',
          required: true
        },
        {
          name: 'priority',
          labelAr: 'مستوى الأولوية الجديد',
          labelEn: 'New Priority',
          type: 'select',
          defaultValue: 'high',
          options: [
            { value: 'low', labelAr: 'منخفضة', labelEn: 'Low' },
            { value: 'medium', labelAr: 'متوسطة', labelEn: 'Medium' },
            { value: 'high', labelAr: 'قصوى / عاجل', labelEn: 'Urgent / High' }
          ]
        },
        {
          name: 'notes',
          labelAr: 'ملاحظات التوجيه التشغيلي',
          labelEn: 'Operational Directives',
          type: 'textarea',
          placeholderAr: 'توجيهات روبرت لمعالجة العطل دون تأخير مسار العمل...'
        }
      ]
    },
    {
      actionType: 'broadcast_fleet_alert',
      agentId: 'project-manager',
      titleAr: 'بث تعميم تشغيلي فوري للأسطول',
      titleEn: 'Broadcast Operational Fleet Alert',
      descAr: 'إرسال تنبيه وتعميم عاجل لجميع السائقين وغرف التحكم الميدانية.',
      descEn: 'Send an emergency broadcast to all drivers and field dispatchers.',
      iconName: 'Radio',
      badgeAr: 'طوارئ • تعاميم',
      badgeEn: 'BROADCAST • ALERT',
      color: 'violet',
      fields: [
        {
          name: 'title',
          labelAr: 'عنوان التعميم التشغيلي',
          labelEn: 'Alert Title',
          type: 'text',
          placeholderAr: 'مثال: تنبيه تقلبات جوية وتخفيض السرعات',
          placeholderEn: 'e.g. Weather Alert - Speed Reduction',
          required: true
        },
        {
          name: 'severity',
          labelAr: 'مستوى الأهمية',
          labelEn: 'Severity Level',
          type: 'select',
          defaultValue: 'warning',
          options: [
            { value: 'info', labelAr: 'معلوماتي عادي', labelEn: 'Informational' },
            { value: 'warning', labelAr: 'تنبيه متوسط', labelEn: 'Warning' },
            { value: 'urgent', labelAr: 'طارئ عاجل جداً', labelEn: 'Critical / Urgent' }
          ]
        },
        {
          name: 'message',
          labelAr: 'نص التعميم والتعليمات',
          labelEn: 'Broadcast Message & Directives',
          type: 'textarea',
          required: true,
          placeholderAr: 'اكتب نص التوجيه لجميع السائقين وفريق الدعم الميداني...'
        }
      ]
    }
  ],

  'mechanic': [
    {
      actionType: 'create_work_order',
      agentId: 'mechanic',
      titleAr: 'إنشاء أمر صيانة فوري بالورشة',
      titleEn: 'Create Direct Work Order',
      descAr: 'فتح بطاقة صيانة معتمدة لمركبة مع تحديد العطل والتكلفة والفني المسؤول.',
      descEn: 'Open an official maintenance ticket with vehicle, defect, and assigned mechanic.',
      iconName: 'Wrench',
      badgeAr: 'صيانة • أمر عمل',
      badgeEn: 'MAINT • WORK ORDER',
      color: 'amber',
      fields: [
        {
          name: 'vehicleId',
          labelAr: 'المركبة المطلوب صيانتها',
          labelEn: 'Target Vehicle',
          type: 'select',
          required: true
        },
        {
          name: 'category',
          labelAr: 'نوع ومجال العطل',
          labelEn: 'Maintenance Category',
          type: 'select',
          defaultValue: 'mechanical',
          options: [
            { value: 'mechanical', labelAr: 'ميكانيكي / محرك', labelEn: 'Mechanical' },
            { value: 'brakes', labelAr: 'فرامل ومكابح', labelEn: 'Brakes' },
            { value: 'electrical', labelAr: 'كهرباء وحساسات', labelEn: 'Electrical' },
            { value: 'cooling', labelAr: 'تبريد ورديتر', labelEn: 'Cooling' },
            { value: 'hydraulic', labelAr: 'هيدروليك وروافع', labelEn: 'Hydraulic' },
            { value: 'tires', labelAr: 'إطارات وميزان', labelEn: 'Tires' }
          ]
        },
        {
          name: 'description',
          labelAr: 'التشخيص ووصف العطل الفني',
          labelEn: 'Fault Description & Symptoms',
          type: 'textarea',
          required: true,
          placeholderAr: 'مثال: فحص خشونة في صوت المحرك وتبديل وسادات الفرامل الأمامية...'
        },
        {
          name: 'technicianId',
          labelAr: 'الفني المسؤول',
          labelEn: 'Assigned Mechanic',
          type: 'select',
          required: true
        },
        {
          name: 'cost',
          labelAr: 'التكلفة المقدرة (ر.س)',
          labelEn: 'Estimated Cost (SAR)',
          type: 'number',
          defaultValue: 350
        },
        {
          name: 'priority',
          labelAr: 'الأولوية',
          labelEn: 'Priority',
          type: 'select',
          defaultValue: 'high',
          options: [
            { value: 'medium', labelAr: 'عادية', labelEn: 'Medium' },
            { value: 'high', labelAr: 'عالية / إيقاف للمركبة', labelEn: 'High' }
          ]
        }
      ]
    },
    {
      actionType: 'reserve_spare_part',
      agentId: 'mechanic',
      titleAr: 'حجز وصرف قطعة غيار من المستودع',
      titleEn: 'Reserve / Issue Spare Part',
      descAr: 'خصم وحجز قطعة الغيار من المستودع وربطها مباشرة برقم أمر الصيانة.',
      descEn: 'Deduct and reserve spare parts from warehouse stock linked to the work order.',
      iconName: 'PackageCheck',
      badgeAr: 'مستودع • قطع غيار',
      badgeEn: 'WAREHOUSE • PARTS',
      color: 'amber',
      fields: [
        {
          name: 'partId',
          labelAr: 'قطعة الغيار المطلوبة',
          labelEn: 'Selected Spare Part',
          type: 'select',
          required: true
        },
        {
          name: 'quantity',
          labelAr: 'الكمية المطلوبة',
          labelEn: 'Quantity',
          type: 'number',
          defaultValue: 1,
          required: true
        },
        {
          name: 'orderId',
          labelAr: 'ربط بأمر الصيانة',
          labelEn: 'Linked Work Order',
          type: 'select',
          required: true
        },
        {
          name: 'notes',
          labelAr: 'ملاحظات الصرف والتركيب',
          labelEn: 'Installation & Dispensing Notes',
          type: 'text',
          placeholderAr: 'صرف فوري للتركيب في وردية الصباح'
        }
      ]
    },
    {
      actionType: 'update_work_order_status',
      agentId: 'mechanic',
      titleAr: 'تحديث واعتماد إتمام أمر الصيانة',
      titleEn: 'Complete / Update Work Order',
      descAr: 'إغلاق أمر الصيانة أو تحويله إلى "قيد العمل" مع توثيق تقرير الفحص النهائي.',
      descEn: 'Close work order or switch to in-progress with signed completion report.',
      iconName: 'CheckCheck',
      badgeAr: 'إنجاز • إغلاق أمر',
      badgeEn: 'STATUS • CLOSE ORDER',
      color: 'amber',
      fields: [
        {
          name: 'orderId',
          labelAr: 'أمر الصيانة',
          labelEn: 'Work Order',
          type: 'select',
          required: true
        },
        {
          name: 'newStatus',
          labelAr: 'الحالة الجديدة',
          labelEn: 'New Status',
          type: 'select',
          defaultValue: 'completed',
          options: [
            { value: 'in-progress', labelAr: '🔵 قيد العمل بالورشة', labelEn: 'In Progress' },
            { value: 'completed', labelAr: '🟢 مكتمل وجاهز للتسليم', labelEn: 'Completed' }
          ]
        },
        {
          name: 'techNotes',
          labelAr: 'ملاحظات وتوصيات المهندس سالم',
          labelEn: 'Mechanic Completion Notes',
          type: 'textarea',
          defaultValue: 'تم إتمام الاختبار الفني بنجاح والمعدة مطابقة للمواصفات التشغيلية.'
        }
      ]
    }
  ],

  'safety': [
    {
      actionType: 'issue_safety_inspection',
      agentId: 'safety',
      titleAr: 'إصدار بطاقة فحص فني وسلامة معتمدة',
      titleEn: 'Issue Certified Safety Inspection',
      descAr: 'توثيق نتيجة الفحص الفني الدوري للفرامل والأنوار والسلامة واعتماد الصلاحية.',
      descEn: 'Log periodic safety compliance audit for brakes, tires, and road safety.',
      iconName: 'ShieldCheck',
      badgeAr: 'سلامة • فحص فني',
      badgeEn: 'SAFETY • AUDIT',
      color: 'emerald',
      fields: [
        {
          name: 'vehicleId',
          labelAr: 'المركبة المفحوصة',
          labelEn: 'Inspected Vehicle',
          type: 'select',
          required: true
        },
        {
          name: 'inspectorName',
          labelAr: 'اسم المفتش / الفاحص',
          labelEn: 'Inspector Name',
          type: 'text',
          defaultValue: 'مفتش السلامة أمان (نظامي)',
          required: true
        },
        {
          name: 'overallStatus',
          labelAr: 'التقييم العام للمركبة',
          labelEn: 'Overall Safety Verdict',
          type: 'select',
          defaultValue: 'safe',
          options: [
            { value: 'safe', labelAr: '🟢 آمنة ومجتازة للفحص بالكامل', labelEn: 'Safe / Passed' },
            { value: 'warning', labelAr: '🟡 ملاحظات طفيفة (تتطلب متابعة)', labelEn: 'Minor Warning' },
            { value: 'unsafe', labelAr: '🔴 غير آمنة (إيقاف فوري)', labelEn: 'Unsafe / Ground Immediately' }
          ]
        },
        {
          name: 'brakeStatus',
          labelAr: 'فحص منظومة المكابح',
          labelEn: 'Brakes System',
          type: 'select',
          defaultValue: 'pass',
          options: [
            { value: 'pass', labelAr: 'سليمة 100%', labelEn: 'Pass' },
            { value: 'warning', labelAr: 'استهلاك نسبي', labelEn: 'Warning' },
            { value: 'fail', labelAr: 'خلل حرج', labelEn: 'Fail' }
          ]
        },
        {
          name: 'tiresStatus',
          labelAr: 'فحص الإطارات وضغط الهواء',
          labelEn: 'Tires & Pressure',
          type: 'select',
          defaultValue: 'pass',
          options: [
            { value: 'pass', labelAr: 'ممتازة', labelEn: 'Pass' },
            { value: 'warning', labelAr: 'نقشة مهترئة', labelEn: 'Warning' },
            { value: 'fail', labelAr: 'تلف يستوجب التبديل', labelEn: 'Fail' }
          ]
        },
        {
          name: 'notes',
          labelAr: 'توصيات وملاحظات المفتش أمان',
          labelEn: 'Inspector Directives',
          type: 'textarea',
          defaultValue: 'المركبة مطابقة للائحة هيئة النقل ومعايير السلامة المهنية.'
        }
      ]
    },
    {
      actionType: 'ground_vehicle_violation',
      agentId: 'safety',
      titleAr: 'إيقاف مركبة احترازياً وتسجيل مخالفة سلامة',
      titleEn: 'Ground Vehicle for Safety Breach',
      descAr: 'إيقاف المركبة عن الحركة وتغيير حالتها فوراً لعدم استيفاء اشتراطات السلامة.',
      descEn: 'Ground vehicle immediately from active duty due to safety or mechanical risk.',
      iconName: 'AlertTriangle',
      badgeAr: 'حظر • إيقاف احترازي',
      badgeEn: 'GROUND • VIOLATION',
      color: 'emerald',
      fields: [
        {
          name: 'vehicleId',
          labelAr: 'المركبة المطلوب إيقافها',
          labelEn: 'Target Vehicle',
          type: 'select',
          required: true
        },
        {
          name: 'reason',
          labelAr: 'سبب الإيقاف / المخالفة المرصودة',
          labelEn: 'Grounding Reason',
          type: 'textarea',
          required: true,
          placeholderAr: 'مثال: تسريب زيت شديد أو تلف خطير في وسادات الفرامل يهدد السائق...'
        },
        {
          name: 'severity',
          labelAr: 'درجة الخطورة',
          labelEn: 'Risk Severity',
          type: 'select',
          defaultValue: 'critical',
          options: [
            { value: 'high', labelAr: 'عالية - حظر نقل الركاب/البضائع', labelEn: 'High' },
            { value: 'critical', labelAr: 'حرجة - حظر تشغيل المحرك نهائياً', labelEn: 'Critical Grounding' }
          ]
        },
        {
          name: 'requiredAction',
          labelAr: 'الإجراء التصحيحي المشروط لإعادة التشغيل',
          labelEn: 'Required Corrective Action',
          type: 'text',
          defaultValue: 'إجراء صيانة شاملة وإعادة الفحص الفني قبل فك الحظر.'
        }
      ]
    },
    {
      actionType: 'schedule_permit_renewal',
      agentId: 'safety',
      titleAr: 'جدولة تنبيه تجديد رخصة أو فحص دوري',
      titleEn: 'Schedule Inspection / Permit Renewal',
      descAr: 'إدراج موعد تجديد الفحص الفني الدوري أو ترخيص هيئة النقل في جدول المهام.',
      descEn: 'Schedule periodic roadworthiness inspection and transport permit alert.',
      iconName: 'CalendarClock',
      badgeAr: 'تراخيص • امتثال',
      badgeEn: 'PERMITS • RENEWAL',
      color: 'emerald',
      fields: [
        {
          name: 'vehicleId',
          labelAr: 'المركبة',
          labelEn: 'Vehicle',
          type: 'select',
          required: true
        },
        {
          name: 'renewalType',
          labelAr: 'نوع الترخيص / الفحص',
          labelEn: 'Permit Type',
          type: 'select',
          defaultValue: 'periodic_inspection',
          options: [
            { value: 'periodic_inspection', labelAr: 'الفحص الفني الدوري (MVPI)', labelEn: 'Periodic Inspection' },
            { value: 'insurance', labelAr: 'وثيقة التأمين الشامل', labelEn: 'Insurance Policy' },
            { value: 'operating_card', labelAr: 'بطاقة تشغيل هيئة النقل', labelEn: 'Transport Operating Card' }
          ]
        },
        {
          name: 'dueDate',
          labelAr: 'تاريخ الاستحقاق أو الانتهاء',
          labelEn: 'Due Date',
          type: 'date',
          required: true
        }
      ]
    }
  ],

  'supply-chain': [
    {
      actionType: 'create_purchase_requisition',
      agentId: 'supply-chain',
      titleAr: 'إنشاء مذكرة طلب شراء عاجلة للقطع',
      titleEn: 'Create Spare Parts Purchase Requisition',
      descAr: 'إصدار أمر شراء رسمي للأصناف التي هبطت تحت حد الأمان لتفادي توقف الصيانة.',
      descEn: 'Issue formal purchase order for items below safe reorder threshold.',
      iconName: 'ShoppingBag',
      badgeAr: 'مشتريات • طلب توريد',
      badgeEn: 'PROCUREMENT • PO',
      color: 'sky',
      fields: [
        {
          name: 'partName',
          labelAr: 'اسم الصنف أو القطعة',
          labelEn: 'Part / Item Name',
          type: 'text',
          placeholderAr: 'مثال: فحمات فرامل أمامية شاحنة أكتروس',
          placeholderEn: 'e.g. Actros Front Brake Pads',
          required: true
        },
        {
          name: 'partNumber',
          labelAr: 'رقم القطعة (Part Number / SKU)',
          labelEn: 'Part Number',
          type: 'text',
          placeholderAr: 'BP-ACT-0921',
          placeholderEn: 'BP-ACT-0921'
        },
        {
          name: 'quantity',
          labelAr: 'الكمية المطلوبة توريدها',
          labelEn: 'Requisition Quantity',
          type: 'number',
          defaultValue: 10,
          required: true
        },
        {
          name: 'estimatedUnitCost',
          labelAr: 'سعر الوحدة التقديري (ر.س)',
          labelEn: 'Estimated Unit Cost (SAR)',
          type: 'number',
          defaultValue: 220
        },
        {
          name: 'suggestedVendor',
          labelAr: 'المورد المعتمد المقترح',
          labelEn: 'Suggested Vendor',
          type: 'text',
          defaultValue: 'شركة المسار الدولية لقطع الغيار',
          required: true
        },
        {
          name: 'urgency',
          labelAr: 'درجة الاستعجال',
          labelEn: 'Urgency Level',
          type: 'select',
          defaultValue: 'urgent',
          options: [
            { value: 'normal', labelAr: 'عادي (دورة المشتريات الشهرية)', labelEn: 'Normal' },
            { value: 'urgent', labelAr: 'عاجل (نفاد وشيك بالمخزن)', labelEn: 'Urgent Reorder' }
          ]
        }
      ]
    },
    {
      actionType: 'update_reorder_level',
      agentId: 'supply-chain',
      titleAr: 'تعديل حد الأمان وإعادة الطلب للصنف',
      titleEn: 'Update Min Stock Reorder Level',
      descAr: 'رفع أو تعديل الحد الأدنى الآمن للقطعة بالمستودع لضمان عدم حدوث أزمة انقطاع.',
      descEn: 'Adjust min stock threshold to avoid unexpected supply chain interruptions.',
      iconName: 'Sliders',
      badgeAr: 'مستودع • حد الأمان',
      badgeEn: 'STOCK • THRESHOLD',
      color: 'sky',
      fields: [
        {
          name: 'partId',
          labelAr: 'الصنف بالمستودع',
          labelEn: 'Inventory Part',
          type: 'select',
          required: true
        },
        {
          name: 'newMinQuantity',
          labelAr: 'حد إعادة الطلب الأدنى الجديد',
          labelEn: 'New Min Reorder Level',
          type: 'number',
          defaultValue: 8,
          required: true
        }
      ]
    },
    {
      actionType: 'request_vendor_quote',
      agentId: 'supply-chain',
      titleAr: 'طلب استدراج عروض أسعار (RFQ)',
      titleEn: 'Request Vendor Quotation (RFQ)',
      descAr: 'إرسال طلب تسعير ومقارنة شروط الضمان لعدد من الموردين لتقليل التكلفة.',
      descEn: 'Send RFQ to compare prices and warranty terms among approved vendors.',
      iconName: 'Tag',
      badgeAr: 'مناقصة • عروض أسعار',
      badgeEn: 'RFQ • VENDOR QUOTE',
      color: 'sky',
      fields: [
        {
          name: 'category',
          labelAr: 'تصنيف المشتريات',
          labelEn: 'Purchase Category',
          type: 'select',
          defaultValue: 'tires_batteries',
          options: [
            { value: 'tires_batteries', labelAr: 'إطارات وبطاريات ثقيلة', labelEn: 'Tires & Batteries' },
            { value: 'oils_filters', labelAr: 'زيوت وفلاتر ومواد تشحيم', labelEn: 'Oils & Lubricants' },
            { value: 'engine_parts', labelAr: 'قطع محركات وأنظمة حقن', labelEn: 'Engine & Injection Parts' }
          ]
        },
        {
          name: 'description',
          labelAr: 'تفاصيل الأصناف المطلوبة للتسعير',
          labelEn: 'Items Specification',
          type: 'textarea',
          required: true,
          defaultValue: 'استدراج عروض أسعار لتوريد 20 إطار شاحنات ثقيلة مقاس 315/80R22.5 مع الضمان.'
        }
      ]
    }
  ],

  'predictive': [
    {
      actionType: 'schedule_predictive_service',
      agentId: 'predictive',
      titleAr: 'جدولة صيانة وقائية تنبؤية قبل وقوع العطل',
      titleEn: 'Schedule Predictive Maintenance Task',
      descAr: 'إدراج مهمة استباقية بناء على منحنى الاهتراء وحساسات الحرارة لتجنب التوقف.',
      descEn: 'Schedule proactive maintenance based on telemetry and failure wear curve.',
      iconName: 'LineChart',
      badgeAr: 'تنبؤ • صيانة استباقية',
      badgeEn: 'PREDICTIVE • SERVICE',
      color: 'rose',
      fields: [
        {
          name: 'vehicleId',
          labelAr: 'المركبة المعرضة للعطل',
          labelEn: 'At-Risk Vehicle',
          type: 'select',
          required: true
        },
        {
          name: 'component',
          labelAr: 'المنظومة المتوقع اهتراؤها',
          labelEn: 'Failing Component',
          type: 'select',
          defaultValue: 'brakes',
          options: [
            { value: 'brakes', labelAr: 'فحمات وهوبات الفرامل', labelEn: 'Brake Pads & Rotors' },
            { value: 'cooling', labelAr: 'مضخة الماء وطرمبة التبريد', labelEn: 'Water Pump & Cooling' },
            { value: 'transmission', labelAr: 'كلتش وناقل الحركة', labelEn: 'Clutch & Transmission' },
            { value: 'alternator', labelAr: 'الدينامو وبطارية التشغيل', labelEn: 'Alternator & Battery' }
          ]
        },
        {
          name: 'predictedFailureKm',
          labelAr: 'قراءة العداد المتوقعة لحدوث العطل',
          labelEn: 'Predicted Failure Odometer (KM)',
          type: 'number',
          defaultValue: 135000
        },
        {
          name: 'suggestedDate',
          labelAr: 'التاريخ الموصى به لإجراء الفحص',
          labelEn: 'Recommended Service Date',
          type: 'date',
          required: true
        },
        {
          name: 'reason',
          labelAr: 'المبرر الفني وتفسير التيليماتري',
          labelEn: 'Telemetry Justification',
          type: 'textarea',
          defaultValue: 'ارتفاع تذبذب درجات الحرارة ومعدل الفرملة القاسية يشير إلى اقتراب تلف بطانات الفرامل بنسبة 85%.'
        }
      ]
    },
    {
      actionType: 'add_telemetry_watchlist',
      agentId: 'predictive',
      titleAr: 'إدراج مركبة في قائمة المراقبة الحثيثة والحساسات',
      titleEn: 'Add Vehicle to Critical Telemetry Watchlist',
      descAr: 'تفعيل المراقبة اللحظية المكثفة لاهتزازات المحرك وضغط الزيت وإرسال إنذار مبكر.',
      descEn: 'Enforce high-frequency sensor monitoring for oil pressure and engine vibration.',
      iconName: 'Activity',
      badgeAr: 'مراقبة • إنذار مبكر',
      badgeEn: 'WATCHLIST • TELEMETRY',
      color: 'rose',
      fields: [
        {
          name: 'vehicleId',
          labelAr: 'المركبة',
          labelEn: 'Vehicle',
          type: 'select',
          required: true
        },
        {
          name: 'sensorRisk',
          labelAr: 'الحساس عالي الخطورة',
          labelEn: 'Monitored Sensor Risk',
          type: 'select',
          defaultValue: 'oil_pressure',
          options: [
            { value: 'oil_pressure', labelAr: 'انخفاض ضغط الزيت عند التسارع', labelEn: 'Low Oil Pressure' },
            { value: 'coolant_temp', labelAr: 'تذبذب حرارة مياه التبريد', labelEn: 'Coolant Temp Spikes' },
            { value: 'harsh_braking', labelAr: 'تكرار الفرملة العنيفة من السائق', labelEn: 'Harsh Braking Pattern' }
          ]
        },
        {
          name: 'threshold',
          labelAr: 'سقف التنبيه (Alert Threshold)',
          labelEn: 'Alert Threshold',
          type: 'text',
          defaultValue: 'تجاوز 98°C أو انخفاض الضغط عن 1.8 بار'
        }
      ]
    },
    {
      actionType: 'update_odometer_telemetry',
      agentId: 'predictive',
      titleAr: 'تحديث قراءة العداد وتسجيل الكيلومترات',
      titleEn: 'Update Odometer & Telemetry Log',
      descAr: 'تعديل عداد الكيلومترات الفعلي للمركبة لإعادة ضبط جداول تبديل الزيوت والإطارات.',
      descEn: 'Sync live odometer reading to re-calibrate service intervals.',
      iconName: 'Gauge',
      badgeAr: 'عداد • مسافات',
      badgeEn: 'ODOMETER • SYNC',
      color: 'rose',
      fields: [
        {
          name: 'vehicleId',
          labelAr: 'المركبة',
          labelEn: 'Vehicle',
          type: 'select',
          required: true
        },
        {
          name: 'newOdometerKm',
          labelAr: 'قراءة العداد الحالية (كم)',
          labelEn: 'New Odometer Reading (KM)',
          type: 'number',
          required: true
        }
      ]
    }
  ],

  'finance': [
    {
      actionType: 'log_expense_voucher',
      agentId: 'finance',
      titleAr: 'تسجيل سند صرف مالي / مصروف تشغيلي',
      titleEn: 'Log Expense Voucher / Maintenance Cost',
      descAr: 'قيد مصروف صيانة أو وقود أو قطع غيار وربطه بمركز تكلفة المركبة مباشرة.',
      descEn: 'Record maintenance, fuel, or external workshop invoice against vehicle cost center.',
      iconName: 'Receipt',
      badgeAr: 'مالية • سند صرف',
      badgeEn: 'FINANCE • VOUCHER',
      color: 'teal',
      fields: [
        {
          name: 'amount',
          labelAr: 'المبلغ المالي (ر.س)',
          labelEn: 'Amount (SAR)',
          type: 'number',
          defaultValue: 1250,
          required: true
        },
        {
          name: 'category',
          labelAr: 'بند المصروف',
          labelEn: 'Expense Category',
          type: 'select',
          defaultValue: 'external_workshop',
          options: [
            { value: 'external_workshop', labelAr: 'أجور ورشة خارجية', labelEn: 'External Workshop' },
            { value: 'spare_parts', labelAr: 'شراء قطع غيار', labelEn: 'Spare Parts Purchase' },
            { value: 'fuel', labelAr: 'محروقات ووقود', labelEn: 'Fuel' },
            { value: 'fees', labelAr: 'رسوم فحص وتراخيص', labelEn: 'Inspection & Fees' }
          ]
        },
        {
          name: 'vehicleId',
          labelAr: 'المركبة المستفيدة (مركز التكلفة)',
          labelEn: 'Vehicle / Cost Center',
          type: 'select',
          required: true
        },
        {
          name: 'invoiceNo',
          labelAr: 'رقم الفاتورة الضريبية',
          labelEn: 'Invoice Number',
          type: 'text',
          placeholderAr: 'INV-2026-9901',
          placeholderEn: 'INV-2026-9901'
        },
        {
          name: 'payee',
          labelAr: 'الجهة المستفيدة / الورشة',
          labelEn: 'Payee / Vendor',
          type: 'text',
          defaultValue: 'مركز الخليج لصيانة الشاحنات'
        }
      ]
    },
    {
      actionType: 'audit_approve_invoice',
      agentId: 'finance',
      titleAr: 'اعتماد وتدقيق فاتورة ورشة خارجية',
      titleEn: 'Audit & Approve External Repair Invoice',
      descAr: 'مطابقة بنود الفاتورة بالأسعار المتفق عليها واعتماد الصرف أو تسجيل استقطاع.',
      descEn: 'Verify external repair invoice items against contracted rates and approve payment.',
      iconName: 'CheckSquare',
      badgeAr: 'تدقيق • مطابقة فواتير',
      badgeEn: 'AUDIT • APPROVAL',
      color: 'teal',
      fields: [
        {
          name: 'invoiceNo',
          labelAr: 'رقم الفاتورة',
          labelEn: 'Invoice Number',
          type: 'text',
          placeholderAr: 'EXT-88741',
          placeholderEn: 'EXT-88741',
          required: true
        },
        {
          name: 'vendorName',
          labelAr: 'اسم الورشة أو المورد',
          labelEn: 'Vendor Name',
          type: 'text',
          defaultValue: 'ورشة السلام الميكانيكية'
        },
        {
          name: 'claimedAmount',
          labelAr: 'المبلغ المطالب به (ر.س)',
          labelEn: 'Claimed Amount (SAR)',
          type: 'number',
          defaultValue: 2400
        },
        {
          name: 'approvedAmount',
          labelAr: 'المبلغ المعتمد بعد التدقيق (ر.س)',
          labelEn: 'Audited Approved Amount (SAR)',
          type: 'number',
          defaultValue: 2150,
          required: true
        },
        {
          name: 'notes',
          labelAr: 'ملاحظات التدقيق المالي للمراقب راصد',
          labelEn: 'Financial Auditor Findings',
          type: 'textarea',
          defaultValue: 'تم اعتماد الفاتورة بعد خصم أجور يد زائدة غير مطابقة للعقد المبرم.'
        }
      ]
    },
    {
      actionType: 'set_budget_cap',
      agentId: 'finance',
      titleAr: 'تحديد سقف ميزانية الصيانة الشهري',
      titleEn: 'Set Monthly Maintenance Budget Cap',
      descAr: 'فرض حد مالي شهري لاستهلاك الصيانة لمنع تجاوز الموازنة التقديرية.',
      descEn: 'Impose monthly maintenance spending ceiling to safeguard fleet operating margins.',
      iconName: 'Landmark',
      badgeAr: 'موازنة • سقف إنفاق',
      badgeEn: 'BUDGET • SPENDING CAP',
      color: 'teal',
      fields: [
        {
          name: 'targetScope',
          labelAr: 'نطاق سقف الميزانية',
          labelEn: 'Budget Scope',
          type: 'select',
          defaultValue: 'fleet_wide',
          options: [
            { value: 'fleet_wide', labelAr: 'ميزانية الأسطول العامة', labelEn: 'Fleet-wide' },
            { value: 'heavy_trucks', labelAr: 'قطاع الشاحنات الثقيلة فقط', labelEn: 'Heavy Trucks Division' },
            { value: 'light_vehicles', labelAr: 'المركبات الخفيفة والخدمية', labelEn: 'Light Fleet' }
          ]
        },
        {
          name: 'monthlyBudgetCap',
          labelAr: 'سقف الميزانية الشهري (ر.س)',
          labelEn: 'Monthly Budget Limit (SAR)',
          type: 'number',
          defaultValue: 45000,
          required: true
        }
      ]
    }
  ]
};

// 2. Helper to get all actions for an agent
export function getAgentActions(agentId: string): AgentActionDef[] {
  return AGENT_ACTION_CATALOG[agentId] || [];
}

// 3. Helper to find a specific action definition
export function findActionDef(actionType: string): AgentActionDef | undefined {
  for (const list of Object.values(AGENT_ACTION_CATALOG)) {
    const found = list.find(a => a.actionType === actionType);
    if (found) return found;
  }
  return undefined;
}

// 4. Storage Keys Mapping
const STORAGE_KEYS = {
  ACTIONS_HISTORY: 'fleet_agent_executed_actions_v1',
  TRIPS: 'fleet_driver_trips',
  ORDERS: 'fleet_maintenance_orders_v2',
  INVENTORY: 'fleet_inventory_v2',
  VEHICLES: 'fleet_vehicles_v2',
  INSPECTIONS: 'fleet_technical_inspections',
  SCHEDULES: 'fleet_periodic_schedules',
  PURCHASE_ORDERS: 'fleet_purchase_orders_v1',
  ALERTS: 'fleet_broadcast_alerts_v1',
  WATCHLIST: 'fleet_telemetry_watchlist_v1',
  EXPENSES: 'fleet_expense_vouchers_v1',
  INVOICES: 'fleet_audited_invoices_v1',
  BUDGET_CAPS: 'fleet_budget_caps_v1',
  RFQ: 'fleet_vendor_rfqs_v1'
};

// 5. Execution Engine: Executes the action, updates state, and returns audit receipt
export function executeAgentAction(
  actionType: string,
  params: Record<string, any>,
  executedByAgentId: string
): ExecutedActionReceipt {
  const actionDef = findActionDef(actionType);
  const actionId = `ACT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const nowStr = new Date().toISOString();

  let entityId = '';
  let summaryAr = '';
  let summaryEn = '';

  const getVehicleName = (vId?: string) => {
    const vehiclesList = getStorageJson(STORAGE_KEYS.VEHICLES, defaultVehicles);
    const v = vehiclesList.find((item: any) => item.id === vId);
    return v ? `${v.name} [${v.plateNumber}]` : (vId || 'المركبة العامة');
  };

  const getTechName = (tId?: string) => {
    const techs = defaultTechnicians;
    const t = techs.find((item: any) => item.id === tId);
    return t ? t.name : (tId || 'فني الورشة');
  };

  try {
    switch (actionType) {
      // -------------------------------------------------------------
      // 1. ROBERT (PROJECT MANAGER)
      // -------------------------------------------------------------
      case 'dispatch_trip': {
        const currentTrips = getStorageJson(STORAGE_KEYS.TRIPS, []);
        const vehiclePlate = getVehicleName(params.vehicleId);
        entityId = `TRIP-${Math.floor(1000 + Math.random() * 9000)}`;

        const newTrip = {
          id: entityId,
          tripCode: `TRIP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          projectId: 'PRJ-OPS-DISPATCH',
          projectName: params.destination || 'مهمة أسطول ميدانية فورية',
          projectNameEn: params.destination || 'Direct Field Dispatch',
          origin: params.origin || 'مستودع الرياض المركزي',
          originEn: 'Central Logistics Depot',
          destination: params.destination || 'الموقع الميداني',
          destinationEn: 'Field Destination',
          cargoType: params.cargoType || 'مواد صيانة ومعدات',
          cargoTypeEn: 'General Logistics Cargo',
          cargoWeightTons: Number(params.cargoWeightTons) || 5,
          vehiclePlate: vehiclePlate,
          vehicleModel: vehiclePlate,
          status: 'scheduled',
          departureTime: params.departureTime || new Date().toISOString().replace('T', ' ').slice(0, 16),
          estimatedArrival: 'بعد 4 ساعات من الانطلاق',
          startOdometer: 125000,
          totalDistanceKm: 120,
          driverName: params.driverName || 'سائق معتمد',
          waypoints: [
            { id: 'wp-1', name: params.origin || 'نقطة الانطلاق', type: 'origin', status: 'pending', lat: 24.71, lng: 46.67 },
            { id: 'wp-2', name: params.destination || 'نقطة الوصول', type: 'destination', status: 'pending', lat: 24.85, lng: 46.80 }
          ],
          dispatchedByAgent: 'روبرت - مدير الأسطول والمشروع'
        };

        const updated = [newTrip, ...currentTrips];
        setStorageJson(STORAGE_KEYS.TRIPS, updated);

        summaryAr = `تمت جدولة الرحلة بنجاح برقم ${newTrip.tripCode} وتعيين السائق (${params.driverName}) والمركبة (${vehiclePlate}) ومزامنتها لحظياً مع بوابة السائق.`;
        summaryEn = `Dispatched trip ${newTrip.tripCode} with driver (${params.driverName}) and vehicle (${vehiclePlate}), synced to Driver Portal.`;
        break;
      }

      case 'assign_technician_reschedule': {
        const orders = getStorageJson(STORAGE_KEYS.ORDERS, defaultOrders);
        entityId = params.orderId || 'ORDER-RESCHEDULE';
        const techName = getTechName(params.technicianId);

        const updatedOrders = orders.map((o: any) => {
          if (o.id === params.orderId) {
            return {
              ...o,
              technicianId: params.technicianId,
              priority: params.priority || 'high',
              lastUpdate: nowStr,
              techNotes: (o.techNotes ? o.techNotes + ' | ' : '') + `إعادة توجيه بواسطة روبرت: ${params.notes || 'أولوية قصوى'}`
            };
          }
          return o;
        });

        setStorageJson(STORAGE_KEYS.ORDERS, updatedOrders);
        summaryAr = `تمت إعادة جدولة أمر الصيانة (${entityId}) وتكليف الفني (${techName}) مع رفع الأولوية إلى (${params.priority || 'عاجل'}).`;
        summaryEn = `Rescheduled work order (${entityId}) to technician (${techName}) with priority set to (${params.priority || 'high'}).`;
        break;
      }

      case 'broadcast_fleet_alert': {
        const alerts = getStorageJson(STORAGE_KEYS.ALERTS, []);
        entityId = `ALR-${Date.now()}`;

        const newAlert = {
          id: entityId,
          title: params.title,
          message: params.message,
          severity: params.severity || 'warning',
          issuedBy: 'روبرت - مدير الأسطول',
          timestamp: nowStr,
          isActive: true
        };

        setStorageJson(STORAGE_KEYS.ALERTS, [newAlert, ...alerts]);
        summaryAr = `تم بث التعميم التشغيلي (${params.title}) فوراً إلى جميع غرف التحكم والسائقين بمستوى (${params.severity}).`;
        summaryEn = `Broadcasted alert "${params.title}" fleet-wide with severity level (${params.severity}).`;
        break;
      }

      // -------------------------------------------------------------
      // 2. SALIM (MECHANIC)
      // -------------------------------------------------------------
      case 'create_work_order': {
        const orders = getStorageJson(STORAGE_KEYS.ORDERS, defaultOrders);
        entityId = `MNT-${Math.floor(1000 + Math.random() * 9000)}`;
        const techName = getTechName(params.technicianId);
        const vehicleName = getVehicleName(params.vehicleId);

        const newOrder = {
          id: entityId,
          orderNumber: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          vehicleId: params.vehicleId || defaultVehicles[0]?.id || 'V1',
          date: new Date().toISOString().split('T')[0],
          category: params.category || 'mechanical',
          description: params.description || 'فحص وصيانة عاجلة موجهة بالذكاء الاصطناعي',
          status: 'pending',
          priority: params.priority || 'high',
          technicianId: params.technicianId || defaultTechnicians[0]?.id || 'T1',
          cost: Number(params.cost) || 350,
          startDate: new Date().toISOString().split('T')[0],
          progress: 10,
          notes: 'تم إنشاؤه واعتماده مباشرة من مهندس الصيانة سالم.',
          techNotes: `تشخيص المهندس سالم: ${params.description}`
        };

        setStorageJson(STORAGE_KEYS.ORDERS, [newOrder, ...orders]);
        summaryAr = `تم إنشاء وتفعيل أمر صيانة رسمي برقم (${newOrder.orderNumber}) للمركبة (${vehicleName}) بإسناد للفني (${techName}) وبتكلفة تقديرية (${params.cost || 350} ر.س).`;
        summaryEn = `Created official work order (${newOrder.orderNumber}) for vehicle (${vehicleName}) assigned to (${techName}) with estimated cost (${params.cost || 350} SAR).`;
        break;
      }

      case 'reserve_spare_part': {
        const inventory = getStorageJson(STORAGE_KEYS.INVENTORY, defaultInventory);
        const qty = Number(params.quantity) || 1;
        entityId = params.partId || 'PART-RES';
        let partFoundName = params.partId;

        const updatedInventory = inventory.map((item: any) => {
          if (item.id === params.partId || item.partNumber === params.partId) {
            partFoundName = item.name;
            const newQty = Math.max(0, (item.quantity || 0) - qty);
            return {
              ...item,
              quantity: newQty,
              lastOrderedDate: nowStr
            };
          }
          return item;
        });

        setStorageJson(STORAGE_KEYS.INVENTORY, updatedInventory);
        summaryAr = `تم حجز وصرف كمية (${qty}) من الصنف (${partFoundName}) وربطه بأمر الصيانة (${params.orderId || 'المحدد'}). تم تحديث رصيد المستودع تلقائياً.`;
        summaryEn = `Reserved and deducted (${qty}) units of (${partFoundName}) for order (${params.orderId}). Warehouse balance updated.`;
        break;
      }

      case 'update_work_order_status': {
        const orders = getStorageJson(STORAGE_KEYS.ORDERS, defaultOrders);
        entityId = params.orderId || '';

        const updatedOrders = orders.map((o: any) => {
          if (o.id === params.orderId || o.orderNumber === params.orderId) {
            return {
              ...o,
              status: params.newStatus || 'completed',
              progress: params.newStatus === 'completed' ? 100 : 65,
              lastUpdate: nowStr,
              techNotes: (o.techNotes ? o.techNotes + '\n' : '') + `اعتماد سالم: ${params.techNotes || 'تم الفحص الفني'}`
            };
          }
          return o;
        });

        setStorageJson(STORAGE_KEYS.ORDERS, updatedOrders);
        summaryAr = `تم تحديث حالة أمر الصيانة (${entityId}) إلى (${params.newStatus === 'completed' ? 'مكتمل وجاهز للتسليم 🟢' : 'قيد العمل بالورشة 🔵'}).`;
        summaryEn = `Updated status of work order (${entityId}) to (${params.newStatus}).`;
        break;
      }

      // -------------------------------------------------------------
      // 3. AMAN (SAFETY & COMPLIANCE)
      // -------------------------------------------------------------
      case 'issue_safety_inspection': {
        const inspections = getStorageJson(STORAGE_KEYS.INSPECTIONS, []);
        entityId = `CHK-SAF-${Date.now().toString().slice(-6)}`;
        const vehicleName = getVehicleName(params.vehicleId);

        const newInspection = {
          id: entityId,
          orderId: `WO-INSP-${Math.floor(1000 + Math.random() * 9000)}`,
          orderNumber: entityId,
          vehicleId: params.vehicleId || 'V1',
          vehicleName: vehicleName,
          checkedBy: params.inspectorName || 'مفتش السلامة أمان',
          timestamp: nowStr,
          type: 'after',
          overallStatus: params.overallStatus || 'safe',
          brakeStatus: params.brakeStatus || 'pass',
          tiresStatus: params.tiresStatus || 'pass',
          notes: params.notes || 'بطاقة فحص سلامة رقمية معتمدة.',
          items: [
            { id: '1', nameAr: 'المكابح والفرامل', nameEn: 'Brakes', status: params.brakeStatus || 'pass' },
            { id: '2', nameAr: 'ضغط وجودة الإطارات', nameEn: 'Tires', status: params.tiresStatus || 'pass' },
            { id: '3', nameAr: 'معدات الطوارئ والإطفاء', nameEn: 'Emergency Fire Extinguisher', status: 'pass' }
          ]
        };

        setStorageJson(STORAGE_KEYS.INSPECTIONS, [newInspection, ...inspections]);
        summaryAr = `تم إصدار بطاقة فحص فني وسلامة رسمية برقم (${entityId}) للمركبة (${vehicleName}) بنتيجة (${params.overallStatus === 'safe' ? 'آمنة ومجتازة 🟢' : 'غير آمنة / ملاحظات 🔴'}).`;
        summaryEn = `Issued certified safety inspection (${entityId}) for (${vehicleName}) with status (${params.overallStatus}).`;
        break;
      }

      case 'ground_vehicle_violation': {
        const vehicles = getStorageJson(STORAGE_KEYS.VEHICLES, defaultVehicles);
        entityId = params.vehicleId || '';
        let vehicleName = entityId;

        const updatedVehicles = vehicles.map((v: any) => {
          if (v.id === params.vehicleId) {
            vehicleName = `${v.name} [${v.plateNumber}]`;
            return {
              ...v,
              status: 'stopped',
              groundedReason: params.reason,
              groundedBy: 'أمان - مفتش السلامة والامتثال',
              groundedAt: nowStr
            };
          }
          return v;
        });

        setStorageJson(STORAGE_KEYS.VEHICLES, updatedVehicles);
        summaryAr = `تم حظر وتشغيل أمر إيقاف فوري للمركبة (${vehicleName}) وحظرها من مهام السير للسبب: "${params.reason}". تم تحديث حالة الأسطول فوراً.`;
        summaryEn = `Grounded vehicle (${vehicleName}) immediately due to: "${params.reason}". Status updated to stopped.`;
        break;
      }

      case 'schedule_permit_renewal': {
        const schedules = getStorageJson(STORAGE_KEYS.SCHEDULES, []);
        entityId = `SCH-${Date.now()}`;
        const vehicleName = getVehicleName(params.vehicleId);

        const newSchedule = {
          id: entityId,
          vehicleId: params.vehicleId,
          vehicleName: vehicleName,
          type: params.renewalType || 'periodic_inspection',
          title: `تجديد ${params.renewalType === 'periodic_inspection' ? 'الفحص الفني الدوري (MVPI)' : 'وثيقة التأمين/الرخصة'}`,
          dueDate: params.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: 'scheduled',
          scheduledBy: 'أمان - مفتش الامتثال'
        };

        setStorageJson(STORAGE_KEYS.SCHEDULES, [newSchedule, ...schedules]);
        summaryAr = `تمت جدولة موعد تجديد (${newSchedule.title}) للمركبة (${vehicleName}) بتاريخ استحقاق (${newSchedule.dueDate}).`;
        summaryEn = `Scheduled renewal alert for (${vehicleName}) due on (${newSchedule.dueDate}).`;
        break;
      }

      // -------------------------------------------------------------
      // 4. WASIL (SUPPLY CHAIN & PROCUREMENT)
      // -------------------------------------------------------------
      case 'create_purchase_requisition': {
        const pos = getStorageJson(STORAGE_KEYS.PURCHASE_ORDERS, []);
        entityId = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const total = (Number(params.quantity) || 1) * (Number(params.estimatedUnitCost) || 200);

        const newPO = {
          id: entityId,
          partName: params.partName,
          partNumber: params.partNumber || 'AUTO-SKU',
          quantity: Number(params.quantity) || 1,
          unitCost: Number(params.estimatedUnitCost) || 200,
          totalCost: total,
          supplierName: params.suggestedVendor || 'المورد المعتمد',
          status: 'submitted',
          urgency: params.urgency || 'urgent',
          createdAt: nowStr,
          createdBy: 'واصل - خبير سلاسل الإمداد'
        };

        setStorageJson(STORAGE_KEYS.PURCHASE_ORDERS, [newPO, ...pos]);
        summaryAr = `تم إصدار مذكرة طلب شراء معتمدة برقم (${entityId}) لتوريد (${newPO.quantity}) وحدة من (${params.partName}) بإجمالي تقديري (${total} ر.س) من المورد (${newPO.supplierName}).`;
        summaryEn = `Issued purchase requisition (${entityId}) for (${newPO.quantity}) units of (${params.partName}) totalling (${total} SAR).`;
        break;
      }

      case 'update_reorder_level': {
        const inventory = getStorageJson(STORAGE_KEYS.INVENTORY, defaultInventory);
        entityId = params.partId || '';
        const newMin = Number(params.newMinQuantity) || 5;
        let partName = entityId;

        const updatedInventory = inventory.map((item: any) => {
          if (item.id === params.partId || item.partNumber === params.partId) {
            partName = item.name;
            return {
              ...item,
              minQuantity: newMin
            };
          }
          return item;
        });

        setStorageJson(STORAGE_KEYS.INVENTORY, updatedInventory);
        summaryAr = `تم رفع وتعديل حد الأمان وإعادة الطلب للصنف (${partName}) إلى (${newMin} وحدة) لمنع انقطاع المخزون.`;
        summaryEn = `Updated safety stock reorder threshold for (${partName}) to (${newMin} units).`;
        break;
      }

      case 'request_vendor_quote': {
        const rfqs = getStorageJson(STORAGE_KEYS.RFQ, []);
        entityId = `RFQ-${Date.now()}`;

        const newRfq = {
          id: entityId,
          category: params.category,
          description: params.description,
          status: 'sent_to_vendors',
          createdAt: nowStr,
          initiatedBy: 'واصل - خبير سلاسل الإمداد'
        };

        setStorageJson(STORAGE_KEYS.RFQ, [newRfq, ...rfqs]);
        summaryAr = `تم إرسال وتوليد استدراج عروض أسعار (RFQ) برقم (${entityId}) لموردي (${params.category}) لمقارنة الأسعار وفترات الضمان.`;
        summaryEn = `Generated RFQ (${entityId}) for category (${params.category}) to benchmark quotes.`;
        break;
      }

      // -------------------------------------------------------------
      // 5. BASEER (PREDICTIVE MAINTENANCE)
      // -------------------------------------------------------------
      case 'schedule_predictive_service': {
        const orders = getStorageJson(STORAGE_KEYS.ORDERS, defaultOrders);
        entityId = `PRED-WO-${Math.floor(1000 + Math.random() * 9000)}`;
        const vehicleName = getVehicleName(params.vehicleId);

        const newPredictiveOrder = {
          id: entityId,
          orderNumber: `PRED-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          vehicleId: params.vehicleId || 'V1',
          date: params.suggestedDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          category: params.component || 'brakes',
          description: `[صيانة تنبؤية استباقية] ${params.reason || 'استبدال وقائي قبل الانهيار المتوقع'}`,
          status: 'pending',
          priority: 'high',
          technicianId: defaultTechnicians[0]?.id || 'T1',
          cost: 450,
          isPredictive: true,
          predictedKm: params.predictedFailureKm || 135000,
          notes: `تحليل بصير: تم تحديد موعد الخدمة قبل وصول العداد إلى ${params.predictedFailureKm || 135000} كم لتفادي تعطل الآلية.`
        };

        setStorageJson(STORAGE_KEYS.ORDERS, [newPredictiveOrder, ...orders]);
        summaryAr = `تمت جدولة صيانة وقائية تنبؤية برقم (${newPredictiveOrder.orderNumber}) للمركبة (${vehicleName}) استباقاً لاهتراء (${params.component}) بتاريخ (${newPredictiveOrder.date}).`;
        summaryEn = `Scheduled predictive service (${newPredictiveOrder.orderNumber}) for vehicle (${vehicleName}) targeting (${params.component}) on (${newPredictiveOrder.date}).`;
        break;
      }

      case 'add_telemetry_watchlist': {
        const watchlist = getStorageJson(STORAGE_KEYS.WATCHLIST, []);
        entityId = `WATCH-${params.vehicleId}`;
        const vehicleName = getVehicleName(params.vehicleId);

        const newWatchItem = {
          id: entityId,
          vehicleId: params.vehicleId,
          vehicleName: vehicleName,
          sensorRisk: params.sensorRisk || 'oil_pressure',
          threshold: params.threshold || 'تجاوز حدود الأمان',
          addedAt: nowStr,
          addedBy: 'بصير - محلل الصيانة التنبؤية',
          status: 'monitoring'
        };

        const filtered = watchlist.filter((w: any) => w.vehicleId !== params.vehicleId);
        setStorageJson(STORAGE_KEYS.WATCHLIST, [newWatchItem, ...filtered]);
        summaryAr = `تم إدراج المركبة (${vehicleName}) في قائمة المراقبة التليمترية المشددة للحساس (${params.sensorRisk}) مع سقف تنبيه (${params.threshold}).`;
        summaryEn = `Added (${vehicleName}) to high-frequency telemetry watchlist for (${params.sensorRisk}).`;
        break;
      }

      case 'update_odometer_telemetry': {
        const vehicles = getStorageJson(STORAGE_KEYS.VEHICLES, defaultVehicles);
        entityId = params.vehicleId;
        const newKm = Number(params.newOdometerKm) || 120000;
        let vName = entityId;

        const updated = vehicles.map((v: any) => {
          if (v.id === params.vehicleId) {
            vName = `${v.name} [${v.plateNumber}]`;
            return {
              ...v,
              lastOdometer: newKm,
              odometerUpdatedAt: nowStr
            };
          }
          return v;
        });

        setStorageJson(STORAGE_KEYS.VEHICLES, updated);
        summaryAr = `تم تحديث قراءة عداد الكيلومترات للمركبة (${vName}) إلى (${newKm.toLocaleString()} كم) وإعادة ضبط منحنى الصيانة التنبؤية.`;
        summaryEn = `Updated odometer for (${vName}) to (${newKm.toLocaleString()} KM). Maintenance forecast recalibrated.`;
        break;
      }

      // -------------------------------------------------------------
      // 6. RASED (FINANCE & COST CONTROLLER)
      // -------------------------------------------------------------
      case 'log_expense_voucher': {
        const expenses = getStorageJson(STORAGE_KEYS.EXPENSES, []);
        entityId = `EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const vehicleName = getVehicleName(params.vehicleId);

        const newExpense = {
          id: entityId,
          amount: Number(params.amount) || 500,
          category: params.category || 'external_workshop',
          vehicleId: params.vehicleId,
          vehicleName: vehicleName,
          invoiceNo: params.invoiceNo || `INV-${Math.floor(10000 + Math.random() * 90000)}`,
          payee: params.payee || 'الورشة المعتمدة',
          date: nowStr.split('T')[0],
          loggedBy: 'راصد - المراقب المالي',
          status: 'recorded'
        };

        setStorageJson(STORAGE_KEYS.EXPENSES, [newExpense, ...expenses]);
        summaryAr = `تم تسجيل سند قيد مالي برقم (${entityId}) بمبلغ (${newExpense.amount} ر.س) لحساب مركبة (${vehicleName}) كبند (${params.category}).`;
        summaryEn = `Logged expense voucher (${entityId}) for (${newExpense.amount} SAR) assigned to (${vehicleName}).`;
        break;
      }

      case 'audit_approve_invoice': {
        const invoices = getStorageJson(STORAGE_KEYS.INVOICES, []);
        entityId = params.invoiceNo || `AUDIT-INV-${Date.now()}`;

        const newAudit = {
          id: entityId,
          invoiceNo: params.invoiceNo,
          vendorName: params.vendorName || 'الورشة الخارجية',
          claimedAmount: Number(params.claimedAmount) || 2000,
          approvedAmount: Number(params.approvedAmount) || 1800,
          notes: params.notes || 'معتمد بعد المطابقة المحاسبية',
          auditedAt: nowStr,
          auditedBy: 'راصد - المراقب المالي',
          status: 'approved'
        };

        setStorageJson(STORAGE_KEYS.INVOICES, [newAudit, ...invoices]);
        summaryAr = `تم تدقيق واعتماد الفاتورة (${params.invoiceNo}) بمبلغ معتمد (${newAudit.approvedAmount} ر.س) بعد مطابقة بنود التسعير.`;
        summaryEn = `Audited and approved invoice (${params.invoiceNo}) with final amount (${newAudit.approvedAmount} SAR).`;
        break;
      }

      case 'set_budget_cap': {
        const budgetCaps = getStorageJson(STORAGE_KEYS.BUDGET_CAPS, {});
        const cap = Number(params.monthlyBudgetCap) || 40000;
        entityId = params.targetScope || 'fleet_wide';

        const updated = {
          ...budgetCaps,
          [entityId]: {
            cap,
            updatedAt: nowStr,
            updatedBy: 'راصد - المراقب المالي'
          }
        };

        setStorageJson(STORAGE_KEYS.BUDGET_CAPS, updated);
        summaryAr = `تم تطبيق سقف الميزانية الشهري لنطاق (${entityId === 'fleet_wide' ? 'الأسطول بالكامل' : entityId}) بمبلغ (${cap.toLocaleString()} ر.س).`;
        summaryEn = `Applied monthly budget cap of (${cap.toLocaleString()} SAR) for scope (${entityId}).`;
        break;
      }

      default: {
        throw new Error(`Unknown action type: ${actionType}`);
      }
    }

    // Save to Agent Executed Actions Log for Audit Trail
    const agentNameMap: Record<string, { ar: string; en: string }> = {
      'project-manager': { ar: 'روبرت - مدير الأسطول والمشروع', en: 'Robert - Project Manager' },
      'mechanic': { ar: 'سالم - مهندس الصيانة والقطع', en: 'Salim - Master Mechanic' },
      'safety': { ar: 'أمان - مفتش السلامة والامتثال', en: 'Aman - Safety Auditor' },
      'supply-chain': { ar: 'واصل - خبير سلاسل الإمداد', en: 'Wasil - Supply Chain' },
      'predictive': { ar: 'بصير - محلل الصيانة التنبؤية', en: 'Baseer - Predictive Analyst' },
      'finance': { ar: 'راصد - المراقب المالي', en: 'Rased - Financial Controller' }
    };

    const agentNames = agentNameMap[executedByAgentId] || { ar: 'وكيل ذكي', en: 'AI Agent' };

    const receipt: ExecutedActionReceipt = {
      id: actionId,
      actionType,
      agentId: executedByAgentId,
      agentNameAr: agentNames.ar,
      agentNameEn: agentNames.en,
      titleAr: actionDef?.titleAr || actionType,
      titleEn: actionDef?.titleEn || actionType,
      summaryAr,
      summaryEn,
      timestamp: nowStr,
      entityId,
      params,
      status: 'completed'
    };

    const actionLogs = getStorageJson(STORAGE_KEYS.ACTIONS_HISTORY, []);
    setStorageJson(STORAGE_KEYS.ACTIONS_HISTORY, [receipt, ...actionLogs]);

    // Dispatch system events so other components (Driver Portal, Dashboard, etc.) react instantly
    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('fleet_data_updated', { detail: { actionType, receipt } }));
    } catch (e) {}

    return receipt;
  } catch (err: any) {
    console.error(`[AgentActionExecutor] Execution error on ${actionType}:`, err);
    return {
      id: actionId,
      actionType,
      agentId: executedByAgentId,
      agentNameAr: 'وكيل النظام',
      agentNameEn: 'System Agent',
      titleAr: actionDef?.titleAr || actionType,
      titleEn: actionDef?.titleEn || actionType,
      summaryAr: `فشل تنفيذ الإجراء: ${err.message || 'خطأ غير متوقع'}`,
      summaryEn: `Action execution failed: ${err.message || 'Unexpected error'}`,
      timestamp: nowStr,
      entityId,
      params,
      status: 'failed'
    };
  }
}

// 6. Retrieve History of Executed Actions
export function getAgentActionsHistory(agentId?: string): ExecutedActionReceipt[] {
  const allLogs = getStorageJson<ExecutedActionReceipt[]>(STORAGE_KEYS.ACTIONS_HISTORY, []);
  if (!agentId) return allLogs;
  return allLogs.filter(log => log.agentId === agentId);
}

// 7. Parse Structured Action Tag from Model Response
// Model can format: ||ACTION:{"actionType":"...", "params":{...}}||
export function parseActionFromText(text: string): { cleanText: string; proposedAction?: { actionType: string; params: Record<string, any> } } {
  if (!text.includes('||ACTION:')) {
    return { cleanText: text };
  }

  const match = text.match(/\|\|ACTION:(\{[\s\S]*?\})\|\|/);
  if (!match) {
    return { cleanText: text };
  }

  try {
    const rawJson = match[1];
    const parsed = JSON.parse(rawJson);
    const cleanText = text.replace(/\|\|ACTION:[\s\S]*?\|\|/, '').trim();
    return {
      cleanText,
      proposedAction: {
        actionType: parsed.actionType || parsed.type,
        params: parsed.params || {}
      }
    };
  } catch (e) {
    console.warn('[parseActionFromText] JSON parse error:', e);
    return { cleanText: text };
  }
}

// 8. Intent Detector from User Queries to suggest 1-click execution
export function detectUserActionIntent(agentId: string, text: string): { actionType: string; suggestedParams: Record<string, any> } | null {
  const lower = text.toLowerCase();
  
  if (agentId === 'mechanic') {
    if (lower.includes('أمر صيانة') || lower.includes('طلب صيانة') || lower.includes('صلح') || lower.includes('عطل') || lower.includes('work order') || lower.includes('repair')) {
      return {
        actionType: 'create_work_order',
        suggestedParams: {
          category: lower.includes('فرامل') ? 'brakes' : lower.includes('كهرباء') ? 'electrical' : 'mechanical',
          description: text.slice(0, 120),
          cost: 400,
          priority: 'high'
        }
      };
    }
    if (lower.includes('احجز') || lower.includes('اصرف') || lower.includes('قطعة غيار') || lower.includes('فحمات') || lower.includes('reserve part')) {
      return {
        actionType: 'reserve_spare_part',
        suggestedParams: {
          quantity: 1,
          notes: 'حجز فوري مطلوب من المحادثة'
        }
      };
    }
    if (lower.includes('أكمل') || lower.includes('إغلاق أمر') || lower.includes('تم الصيانة') || lower.includes('جاهز')) {
      return {
        actionType: 'update_work_order_status',
        suggestedParams: {
          newStatus: 'completed',
          techNotes: 'تم إتمام الصيانة والفحص النهائي'
        }
      };
    }
  }

  if (agentId === 'project-manager') {
    if (lower.includes('رحلة') || lower.includes('اسند') || lower.includes('مهمة') || lower.includes('انطلاق') || lower.includes('dispatch') || lower.includes('trip')) {
      return {
        actionType: 'dispatch_trip',
        suggestedParams: {
          cargoType: 'نقل مواد تشغيلية عاجلة',
          driverName: 'أبو فهد الشمري',
          destination: 'مشروع نيوم - البوابة B-4'
        }
      };
    }
    if (lower.includes('عين فني') || lower.includes('أعد جدولة') || lower.includes('فني متاح') || lower.includes('reassign')) {
      return {
        actionType: 'assign_technician_reschedule',
        suggestedParams: {
          priority: 'high',
          notes: 'إعادة توجيه تشغيلي لحل الاختناق'
        }
      };
    }
    if (lower.includes('تعميم') || lower.includes('تنبيه أسطول') || lower.includes('طوارئ') || lower.includes('broadcast')) {
      return {
        actionType: 'broadcast_fleet_alert',
        suggestedParams: {
          title: 'تعميم تشغيلي عاجل للأسطول',
          severity: 'warning',
          message: text.slice(0, 150)
        }
      };
    }
  }

  if (agentId === 'safety') {
    if (lower.includes('فحص فني') || lower.includes('بطاقة فحص') || lower.includes('تفتيش') || lower.includes('inspection')) {
      return {
        actionType: 'issue_safety_inspection',
        suggestedParams: {
          overallStatus: 'safe',
          brakeStatus: 'pass',
          tiresStatus: 'pass',
          notes: 'اجتياز معايير الفحص والسلامة'
        }
      };
    }
    if (lower.includes('إيقاف') || lower.includes('حظر') || lower.includes('مخالفة') || lower.includes('غير آمن') || lower.includes('ground')) {
      return {
        actionType: 'ground_vehicle_violation',
        suggestedParams: {
          reason: text.slice(0, 120),
          severity: 'critical'
        }
      };
    }
    if (lower.includes('تجديد') || lower.includes('رخصة') || lower.includes('فحص دوري') || lower.includes('تأمين')) {
      return {
        actionType: 'schedule_permit_renewal',
        suggestedParams: {
          renewalType: 'periodic_inspection',
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
        }
      };
    }
  }

  if (agentId === 'supply-chain') {
    if (lower.includes('طلب شراء') || lower.includes('توريد') || lower.includes('نقص بالمستودع') || lower.includes('شراء قطع') || lower.includes('po')) {
      return {
        actionType: 'create_purchase_requisition',
        suggestedParams: {
          partName: 'قطع غيار سريعة الاستهلاك',
          quantity: 10,
          estimatedUnitCost: 250,
          urgency: 'urgent'
        }
      };
    }
    if (lower.includes('حد الأمان') || lower.includes('إعادة الطلب') || lower.includes('حد أدنى') || lower.includes('threshold')) {
      return {
        actionType: 'update_reorder_level',
        suggestedParams: {
          newMinQuantity: 8
        }
      };
    }
    if (lower.includes('تسعير') || lower.includes('عروض أسعار') || lower.includes('rfq') || lower.includes('موردين')) {
      return {
        actionType: 'request_vendor_quote',
        suggestedParams: {
          category: 'tires_batteries',
          description: text.slice(0, 140)
        }
      };
    }
  }

  if (agentId === 'predictive') {
    if (lower.includes('صيانة وقائية') || lower.includes('تنبؤ') || lower.includes('قبل العطل') || lower.includes('اهتراء') || lower.includes('predict')) {
      return {
        actionType: 'schedule_predictive_service',
        suggestedParams: {
          component: 'brakes',
          predictedFailureKm: 135000,
          suggestedDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          reason: 'استباق تآكل المنظومة استناداً للتيليماتري'
        }
      };
    }
    if (lower.includes('قائمة المراقبة') || lower.includes('حساس') || lower.includes('حرارة') || lower.includes('ضغط زيت') || lower.includes('watchlist')) {
      return {
        actionType: 'add_telemetry_watchlist',
        suggestedParams: {
          sensorRisk: 'oil_pressure',
          threshold: 'مراقبة حثيثة لحظية'
        }
      };
    }
    if (lower.includes('عداد') || lower.includes('كيلومتر') || lower.includes('قراءة') || lower.includes('odometer')) {
      return {
        actionType: 'update_odometer_telemetry',
        suggestedParams: {
          newOdometerKm: 125000
        }
      };
    }
  }

  if (agentId === 'finance') {
    if (lower.includes('سند صرف') || lower.includes('مصروف') || lower.includes('تكلفة') || lower.includes('فاتورة') || lower.includes('expense')) {
      return {
        actionType: 'log_expense_voucher',
        suggestedParams: {
          amount: 1200,
          category: 'external_workshop',
          payee: 'الورشة المتخصصة'
        }
      };
    }
    if (lower.includes('تدقيق') || lower.includes('اعتماد فاتورة') || lower.includes('مراجعة حساب') || lower.includes('audit')) {
      return {
        actionType: 'audit_approve_invoice',
        suggestedParams: {
          claimedAmount: 2500,
          approvedAmount: 2200,
          notes: 'تم التدقيق والمطابقة'
        }
      };
    }
    if (lower.includes('سقف ميزانية') || lower.includes('موازنة') || lower.includes('ترشيد') || lower.includes('budget cap')) {
      return {
        actionType: 'set_budget_cap',
        suggestedParams: {
          targetScope: 'fleet_wide',
          monthlyBudgetCap: 50000
        }
      };
    }
  }

  return null;
}
