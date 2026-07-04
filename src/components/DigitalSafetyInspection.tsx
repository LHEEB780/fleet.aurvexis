import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  XOctagon, 
  Plus, 
  ClipboardList, 
  Clock, 
  UserCheck, 
  Search, 
  Sparkles, 
  Trash2, 
  Calendar, 
  Wrench,
  Check,
  ChevronDown,
  X,
  Printer,
  History,
  FileText,
  HelpCircle,
  Activity
} from 'lucide-react';
import { SafetyInspection, SafetyCheckItem, SafetyCheckStatus, MaintenanceOrder, Vehicle, User } from '../types';
import { saveDocument } from '../services/firebase';

const PRE_MAINTENANCE_TEMPLATE: Omit<SafetyCheckItem, 'status'>[] = [
  { id: 'pre-1', nameAr: 'نظام الفرامل وضغط الفرامل المساعد', nameEn: 'Braking System & Booster', category: 'brakes' },
  { id: 'pre-2', nameAr: 'تسرّب الزيوت وسوائل تبريد المحرك من الأسفل', nameEn: 'Oil & Coolant Leaks (Under carriage)', category: 'fluids' },
  { id: 'pre-3', nameAr: 'فحص مظهر وسماكة فحمات الإطارات وهيكلها', nameEn: 'Tire Tread, Sidewall & Safety Wear', category: 'tires' },
  { id: 'pre-4', nameAr: 'أكواد الأعطال الفعالة ولمبة فحص المحرك', nameEn: 'Active Dashboard Warnings & Check Engine', category: 'lights' },
  { id: 'pre-5', nameAr: 'صوت المحرك عند التشغيل ومعدّل الاهتزاز', nameEn: 'Engine Start Sound & RPM Idle Vibration', category: 'engine' },
  { id: 'pre-6', nameAr: 'سلامة أحزمة الأمان والوسائد الهوائية', nameEn: 'Cabin Seatbelts & Airbag Readiness', category: 'safety' },
  { id: 'pre-7', nameAr: 'الأضواء الأمامية والخلفية وإشارات الانعطاف', nameEn: 'Headlights, Taillights & Signals', category: 'lights' },
];

const POST_MAINTENANCE_TEMPLATE: Omit<SafetyCheckItem, 'status'>[] = [
  { id: 'post-1', nameAr: 'عزم المحرك وقدرة ناقل الحركة (تجربة ميدانية)', nameEn: 'Engine Torque & Transmission (Road Test)', category: 'engine' },
  { id: 'post-2', nameAr: 'إعادة ربط صواميل الإطارات والبراغي المفككة', nameEn: 'Wheel Lug Nuts Torque & Fasteners Check', category: 'tires' },
  { id: 'post-3', nameAr: 'نظافة حجرة المحرك من الخرق والزيوت المترسبة', nameEn: 'Engine Bay Cleanliness & Flammables Removal', category: 'cabin' },
  { id: 'post-4', nameAr: 'تصفير وعيار مؤشرات التنبيه بشاشة القيادة', nameEn: 'Reset Dashboard Alarms & Service Interval', category: 'electronics' },
  { id: 'post-5', nameAr: 'إغلاق الأقفال ومفاصل غطاء المحرك والأبواب', nameEn: 'Hood Latches, Doors & Tailgate Locks Security', category: 'body' },
  { id: 'post-6', nameAr: 'توفير طفاية حريق صالحة ومثلث السحب بالكبينة', nameEn: 'Fire Extinguisher Charge & Safety Triangle', category: 'safety' },
];

interface DigitalSafetyInspectionProps {
  order: MaintenanceOrder;
  vehicle?: Vehicle;
  user: User;
  language?: 'ar' | 'en';
  onInspectionSaved?: () => void;
}

export default function DigitalSafetyInspection({ 
  order, 
  vehicle, 
  user, 
  language = 'ar',
  onInspectionSaved
}: DigitalSafetyInspectionProps) {
  const [inspections, setInspections] = useState<SafetyInspection[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'before' | 'after'>('before');
  const [selectedInspection, setSelectedInspection] = useState<SafetyInspection | null>(null);
  const [qualityRequested, setQualityRequested] = useState(false);

  // Form states
  const [items, setItems] = useState<SafetyCheckItem[]>([]);
  const [overallStatus, setOverallStatus] = useState<'safe' | 'warning' | 'unsafe'>('safe');
  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState('');

  // Load inspections from local storage
  const loadInspections = () => {
    const saved = localStorage.getItem('fleet_safety_inspections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SafetyInspection[];
        // Filter those belonging to this maintenance order or vehicle
        setInspections(parsed);
      } catch (e) {
        console.error("Error loading safety inspections", e);
      }
    }
  };

  const requestQualityCheck = () => {
    localStorage.setItem(`quality_requested_${order.id}`, 'true');
    setQualityRequested(true);
    
    // Dispatch custom event to add notification to the supervisor
    window.dispatchEvent(new CustomEvent('add-notification', {
      detail: {
        type: 'warning',
        titleAr: 'تنبيه المراقب: طلب فحص جودة جديد 🛡️',
        titleEn: 'Inspector Notification: New Quality Audit Request 🛡️',
        msgAr: `تم تقديم طلب فحص جودة معتمد لمركبة طلب الصيانة #${order.orderNumber}. يرجى معاينة حالة الصيانة ومراجعة المعايير.`,
        msgEn: `Technician has submitted an official Quality Check request for order #${order.orderNumber}.`
      }
    }));
    
    // Also dispatch a storage event so all other components refresh
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    loadInspections();
    const req = localStorage.getItem(`quality_requested_${order.id}`) === 'true';
    setQualityRequested(req);
  }, [order.id]);

  // Order-specific inspections
  const orderInspections = inspections.filter(insp => insp.orderId === order.id);
  const beforeInspection = orderInspections.find(i => i.type === 'before');
  const afterInspection = orderInspections.find(i => i.type === 'after');

  const startNewForm = (type: 'before' | 'after') => {
    setFormType(type);
    const template = type === 'before' ? PRE_MAINTENANCE_TEMPLATE : POST_MAINTENANCE_TEMPLATE;
    
    // Initialize questions with pass as default to make it fast but adjustable
    const initialItems = template.map(t => ({
      ...t,
      status: 'pass' as SafetyCheckStatus,
      notes: ''
    }));
    
    setItems(initialItems);
    setOverallStatus('safe');
    setNotes('');
    setSignature(user.name);
    setIsFormOpen(true);

    if (type === 'after') {
      // Trigger notification that a Quality Check/Audit has been initiated
      window.dispatchEvent(new CustomEvent('add-notification', {
        detail: {
          type: 'warning',
          titleAr: 'تنبيه المراقب: طلب فحص جودة جديد 🛡️',
          titleEn: 'Inspector Notification: New Quality Audit Request 🛡️',
          msgAr: `تم البدء في تسجيل فحص الجودة النهائي للمركبة لطلب الصيانة #${order.orderNumber}.`,
          msgEn: `Quality audit form has been launched/requested for order #${order.orderNumber}.`
        }
      }));
    }
  };

  const handleStatusChange = (itemId: string, status: SafetyCheckStatus) => {
    const updatedItems = items.map(p => {
      if (p.id === itemId) {
        return { ...p, status };
      }
      return p;
    });
    setItems(updatedItems);

    // Auto calculate overall status based on item statuses
    const hasFail = updatedItems.some(i => i.status === 'fail');
    const hasWarning = updatedItems.some(i => i.status === 'warning');

    if (hasFail) {
      setOverallStatus('unsafe');
    } else if (hasWarning) {
      setOverallStatus('warning');
    } else {
      setOverallStatus('safe');
    }
  };

  const handleItemNoteChange = (itemId: string, text: string) => {
    setItems(items.map(p => {
      if (p.id === itemId) {
        return { ...p, notes: text };
      }
      return p;
    }));
  };

  const saveInspection = async (e: React.FormEvent) => {
    e.preventDefault();

    const newInspection: SafetyInspection = {
      id: `INSP-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      vehicleId: order.vehicleId,
      vehicleName: vehicle?.name || order.vehicleId,
      checkedBy: user.name,
      timestamp: new Date().toISOString(),
      type: formType,
      items,
      overallStatus,
      notes,
      signature
    };

    // Get all existing inspections
    const saved = localStorage.getItem('fleet_safety_inspections');
    let allInspections: SafetyInspection[] = [];
    if (saved) {
      try {
        allInspections = JSON.parse(saved);
      } catch (e) {}
    }

    // Replace if same orderId + type already exists (should not happen UI locks it, but safe)
    allInspections = allInspections.filter(
      insp => !(insp.orderId === order.id && insp.type === formType)
    );
    allInspections.push(newInspection);

    // Save back locally
    localStorage.setItem('fleet_safety_inspections', JSON.stringify(allInspections));
    
    // Automatic Notifications Alerts system based on type
    if (formType === 'before') {
      window.dispatchEvent(new CustomEvent('add-notification', {
        detail: {
          type: 'info',
          titleAr: 'تنبيه الفني: الانتقال للفحص النهائي 🛠️',
          titleEn: 'Technician: Move to Final Inspection 🛠️',
          msgAr: `اكتمل الفحص المبدئي لتقرير الآلية #${newInspection.orderNumber}. يرجى الشروع فوراً في اختبارات 'الفحص النهائي والجودة'.`,
          msgEn: `Initial inspection completed for asset report #${newInspection.orderNumber}. Please proceed to final safety & quality stage.`
        }
      }));
    } else if (formType === 'after') {
      localStorage.removeItem(`quality_requested_${order.id}`);
      setQualityRequested(false);
      window.dispatchEvent(new CustomEvent('add-notification', {
        detail: {
          type: 'success',
          titleAr: 'اعتماد فحص الجودة بنجاح ✅',
          titleEn: 'Quality Audit Certification Success ✅',
          msgAr: `تم الانتهاء بنجاح من الفحص النهائي واعتماد الجودة لطلب الصيانة #${order.orderNumber}.`,
          msgEn: `Final safety inspection and quality sign-off completed successfully for order #${order.orderNumber}.`
        }
      }));
    }

    // Trigger event for syncing / reloading other components
    window.dispatchEvent(new Event('storage'));

    // Persistent storage integration with Cloud Firestore
    try {
      await saveDocument('safety_inspections', newInspection.id, newInspection);
    } catch (err) {
      console.warn("Firestore save failed detailed, relies on auto-sync background queued: ", err);
    }

    // Refresh display
    setInspections(allInspections);
    setIsFormOpen(false);
    onInspectionSaved?.();
  };

  const deleteInspection = async (id: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف تقرير الفحص هذا نهائياً من سجلات الأرشيف؟' : 'Are you sure you want to permanently delete this inspection record?')) {
      const saved = localStorage.getItem('fleet_safety_inspections');
      let allInspections: SafetyInspection[] = [];
      if (saved) {
        try {
          allInspections = JSON.parse(saved);
        } catch (e) {}
      }
      const updated = allInspections.filter(i => i.id !== id);
      localStorage.setItem('fleet_safety_inspections', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      
      setInspections(updated);
      if (selectedInspection?.id === id) {
        setSelectedInspection(null);
      }
    }
  };

  const getStatusBadge = (status: 'safe' | 'warning' | 'unsafe') => {
    if (status === 'safe') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-lg border border-emerald-500/20">
          <ShieldCheck size={13} className="shrink-0" />
          <span>{language === 'ar' ? 'آمن ومطابق بالكامل' : 'Safe & Certified'}</span>
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black rounded-lg border border-amber-500/20">
          <AlertTriangle size={13} className="shrink-0" />
          <span>{language === 'ar' ? 'تحذير (ملاحظات غير حرجة)' : 'Warning (Minor issues)'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black rounded-lg border border-rose-500/20 animate-pulse">
        <XOctagon size={13} className="shrink-0" />
        <span>{language === 'ar' ? 'غير آمن (أعطال حرجة!)' : 'Unsafe & Defective'}</span>
      </span>
    );
  };

  const getItemStatusStyle = (status: SafetyCheckStatus) => {
    switch (status) {
      case 'pass':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'warning':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'fail':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'na':
        return 'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400 border-slate-250 dark:border-slate-800';
    }
  };

  return (
    <div className="space-y-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Upper Status Cards for Pre and Post Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Pre-Maintenance card (قبل الصيانة) */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-brand-blue-500 font-extrabold block">البند رقم 1 • قبل الصيانة</span>
              <h4 className="text-xs md:text-sm font-black text-slate-800 dark:text-white">الفحص المبدئي للسلامة</h4>
            </div>
            <span className="p-2 bg-brand-blue-50 dark:bg-brand-blue-950 text-brand-blue-500 rounded-xl shrink-0">
              <ClipboardList size={15} />
            </span>
          </div>

          <div className="pt-1">
            {beforeInspection ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">{language === 'ar' ? 'حالة الآلية:' : 'Status:'}</span>
                  {getStatusBadge(beforeInspection.overallStatus)}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl">
                  <span className="truncate">📋 {beforeInspection.checkedBy}</span>
                  <span>{new Date(beforeInspection.timestamp).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInspection(beforeInspection)}
                  className="w-full text-center py-1.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black rounded-lg border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer"
                >
                  {language === 'ar' ? '👁️ وعرض الفحص المبدئي الفعلي' : 'View Safety Certificate'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400 leading-normal">
                  {language === 'ar' 
                    ? 'لم يتم الفحص بعد. يُوصى فحص وتأمين المركبة قبل تفكيك الأجزاء بالورشة.' 
                    : 'Inspection pending. Ensure checklist is signed before repair works.'}
                </p>
                {user.role !== 'viewer' && (
                  <button
                    type="button"
                    onClick={() => startNewForm('before')}
                    className="w-full py-1.5 px-3 bg-brand-blue-500 hover:bg-brand-blue-600 text-white text-[10px] font-black rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus size={11} strokeWidth={3} />
                    <span>{language === 'ar' ? 'تسجيل فحص ما قبل الصيانة' : 'Record Pre-Maintenance Check'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post-Maintenance card (بعد الصيانة) */}
        <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-emerald-500 font-extrabold block">البند رقم 2 • بعد الصيانة</span>
              <h4 className="text-xs md:text-sm font-black text-slate-800 dark:text-white">الفحص النهائي والجودة</h4>
            </div>
            <span className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-500 rounded-xl shrink-0">
              <ShieldCheck size={15} />
            </span>
          </div>

          <div className="pt-1">
            {afterInspection ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">{language === 'ar' ? 'حالة الآلية:' : 'Status:'}</span>
                  {getStatusBadge(afterInspection.overallStatus)}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl">
                  <span className="truncate">📋 {afterInspection.checkedBy}</span>
                  <span>{new Date(afterInspection.timestamp).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInspection(afterInspection)}
                  className="w-full text-center py-1.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black rounded-lg border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer"
                >
                  {language === 'ar' ? '👁️ وعرض تقرير الجودة الفعلي' : 'View Quality Certificate'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400 leading-normal">
                  {language === 'ar' 
                    ? 'لم يتم الفحص النهائي. يجب تأكيد الأمان وتوافر طفاية الحريق وتجربة العزم.' 
                    : 'Pending post-repair audit. Perform drive torque & safety torque confirmation.'}
                </p>
                {qualityRequested && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-300 text-[10px] font-black flex items-center justify-center gap-1.5 animate-pulse">
                    <Clock size={11} className="animate-spin" />
                    <span>{language === 'ar' ? '⏳ تم طلب فحص جودة وبانتظار المراقب' : 'Pending Inspector Quality Check ⏳'}</span>
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  {user.role !== 'viewer' && (
                    <button
                      type="button"
                      disabled={order.status !== 'completed' && order.status !== 'in-progress'}
                      onClick={() => startNewForm('after')}
                      className="w-full py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white text-[10px] font-black rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus size={11} strokeWidth={3} />
                      <span>{language === 'ar' ? 'تسجيل فحص ما بعد الصيانة' : 'Record Post-Maintenance Check'}</span>
                    </button>
                  )}
                  {!qualityRequested && user.role === 'technician' && (
                    <button
                      type="button"
                      disabled={order.status !== 'completed' && order.status !== 'in-progress'}
                      onClick={requestQualityCheck}
                      className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-[10px] font-black rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Activity size={11} />
                      <span>{language === 'ar' ? 'طلب فحص الجودة 🛡️' : 'Request Quality Check'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* HISTORIC REFERENCE: سجل الفحص والأرشيف التاريخي للسلامة */}
      {inspections.length > 0 && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2">
            <History size={13} className="text-slate-400 shrink-0" />
            <h5 className="font-black text-xs text-slate-600 dark:text-slate-300">
              {language === 'ar' ? 'المرجع التاريخي للفحوصات والتدقيق الرقمي' : 'Safety Audit Log & History Archive'}
            </h5>
          </div>
          
          <div className="max-h-36 overflow-y-auto space-y-2 scrollbar-thin select-none">
            {inspections.map((insp) => (
              <div 
                key={insp.id}
                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700/60 rounded-xl flex items-center justify-between gap-3 text-[10px] hover:border-brand-blue-100 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${insp.type === 'before' ? 'bg-brand-blue-500' : 'bg-emerald-500'}`} />
                  <div>
                    <span className="font-extrabold text-slate-700 dark:text-slate-350 block">
                      {insp.type === 'before' 
                        ? (language === 'ar' ? 'فحص مبدئي قبل الإجراء' : 'Pre-Maintenance check')
                        : (language === 'ar' ? 'فحص نهائي بعد المطابقة' : 'Post-Maintenance quality check')
                      }
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      بواسطة: {insp.checkedBy} • {new Date(insp.timestamp).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded-md font-bold text-[9px] ${
                    insp.overallStatus === 'safe' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10' :
                    insp.overallStatus === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/10' :
                    'bg-rose-50 text-rose-600 dark:bg-rose-900/10'
                  }`}>
                    {insp.overallStatus === 'safe' ? (language === 'ar' ? 'مطابق' : 'Pass') : 
                     insp.overallStatus === 'warning' ? (language === 'ar' ? 'ملاحظة' : 'Warning') : 
                     (language === 'ar' ? 'فشل' : 'Fail')}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedInspection(insp)}
                    className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-655 text-slate-500 dark:text-slate-350 rounded-md cursor-pointer border border-slate-200 dark:border-slate-600 text-[9px] font-bold"
                  >
                    عرض
                  </button>

                  {user.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => deleteInspection(insp.id)}
                      className="p-1 text-slate-400 hover:text-rose-550 dark:hover:text-rose-400 rounded-md cursor-pointer ml-1"
                      title={language === 'ar' ? 'حذف من الأرشيف' : 'Delete Log'}
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHECKLIST FORM MODAL/OVERLAY */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto select-none">
          <div 
            className="bg-white dark:bg-slate-850 max-w-2xl w-full rounded-3xl border border-slate-150 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden shadow-2xl"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Form Header */}
            <div className="px-6 py-4.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`p-2 rounded-xl text-white ${formType === 'before' ? 'bg-brand-blue-500' : 'bg-emerald-500'}`}>
                  <Activity size={18} />
                </span>
                <div>
                  <h3 className="text-sm md:text-base font-black text-slate-905 dark:text-white">
                    {formType === 'before' 
                      ? (language === 'ar' ? 'نموذج فحص السلامة المبدئي (قبل الصيانة)' : 'Digital Safety Pre-Maintenance Inspection')
                      : (language === 'ar' ? 'نموذج الفحص والجودة النهائي (بعد الصيانة)' : 'Digital Safety Post-Maintenance Inspection')
                    }
                  </h3>
                  <span className="text-[10px] text-slate-410 block mt-0.5">
                    {language === 'ar' ? `المشروع: ${order.orderNumber} • آلية: ${vehicle?.name || order.vehicleId}` : `Order: ${order.orderNumber} • Vehicle: ${vehicle?.name || order.vehicleId}`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-805 rounded-xl cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Scrollable checklist */}
            <form onSubmit={saveInspection} className="p-6 overflow-y-auto space-y-5 flex-1 select-none">
              
              <div className="p-3 bg-brand-blue-50/20 dark:bg-brand-blue-500/5 rounded-2xl border border-brand-blue-200/20 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-right md:text-right">
                {language === 'ar' 
                  ? 'يجب اختبار كل نقطة وعنونتها بدقة لضمان سلامة السائقين وصحة تشغيل الأصول في المصلحة العامة. حدد حالة البند واكتب ملحوظة إذا وجدت عيوباً.' 
                  : 'Test and check each individual item to ensure driver safety and proper asset operation. Select target condition.'}
              </div>

              {/* Checks */}
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div 
                    key={item.id}
                    className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-150 dark:border-slate-800/80 rounded-2xl space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400">البند التشكيلي {idx + 1}</span>
                        <h5 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs text-right">
                          {language === 'ar' ? item.nameAr : item.nameEn}
                        </h5>
                      </div>

                      {/* Selectable toggle buttons */}
                      <div className="grid grid-cols-4 gap-1 sm:w-72 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'pass')}
                          className={`py-1 text-[10px] font-black rounded-lg text-center cursor-pointer border transition-all ${
                            item.status === 'pass' 
                              ? 'bg-emerald-500 text-white border-emerald-500' 
                              : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-500 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {language === 'ar' ? 'سليم' : 'Pass'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'warning')}
                          className={`py-1 text-[10px] font-black rounded-lg text-center cursor-pointer border transition-all ${
                            item.status === 'warning' 
                              ? 'bg-amber-500 text-white border-amber-500' 
                              : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-amber-500 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {language === 'ar' ? 'ملاحظة' : 'Warn'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'fail')}
                          className={`py-1 text-[10px] font-black rounded-lg text-center cursor-pointer border transition-all ${
                            item.status === 'fail' 
                              ? 'bg-rose-500 text-white border-rose-500' 
                              : 'bg-white dark:bg-slate-800 text-slate-405 hover:text-rose-550 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {language === 'ar' ? 'فشل' : 'Fail'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'na')}
                          className={`py-1 text-[10px] font-black rounded-lg text-center cursor-pointer border transition-all ${
                            item.status === 'na' 
                              ? 'bg-slate-400 text-white border-slate-400' 
                              : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>

                    {/* Single Item Notes */}
                    <input 
                      type="text"
                      className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-705 rounded-xl text-right dark:text-slate-100 placeholder:text-slate-400 focus:ring-1 focus:ring-brand-blue-500 outline-hidden font-medium"
                      placeholder={language === 'ar' ? 'ملاحظات وتفاصيل فنية عن هذا البند (اختياري)...' : 'Write notes if check is failed or has issues...'}
                      value={item.notes || ''}
                      onChange={(e) => handleItemNoteChange(item.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* Master overall inspection parameters */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-right">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-250">
                    {language === 'ar' ? 'التقييم الشامل لأمان الآلية بالفحص:' : 'Overall Safety Diagnostic Evaluation:'}
                  </span>
                  <div className="flex gap-2 font-black text-xs">
                    <span className={`px-2.5 py-1 rounded-lg ${overallStatus === 'safe' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      {language === 'ar' ? 'آمنة وقابلة للميدان' : 'Safe to run'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg ${overallStatus === 'warning' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      {language === 'ar' ? 'ملاحظات وبواقي طفيفة' : 'Minor defect warning'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg ${overallStatus === 'unsafe' ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      {language === 'ar' ? 'تالفة وخطرة (ممنوعة!)' : 'Hazardous Defect!'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-450">
                    {language === 'ar' ? 'توصيات وملاحظاتInspector إضافية:' : 'Additional Inspector Sign-off Recommendation Notes:'}
                  </label>
                  <textarea
                    rows={2}
                    className="w-full text-xs p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-right dark:text-slate-100 placeholder:text-slate-400 focus:ring-1 focus:ring-brand-blue-500 outline-hidden font-medium"
                    placeholder={language === 'ar' ? 'اكتب أي توصيات فنية لتبييتها في مصلحة السجلات...' : 'Additional diagnostic recommendations...'}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1 border-t border-slate-150/4 pb-1 pt-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-black text-slate-450">
                      {language === 'ar' ? 'توقيع الفاحص (الاسم الثلاثي بالأرشيف):' : 'Inspector Signature / Name Confirmation:'}
                    </label>
                    <input 
                      type="text"
                      className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-right dark:text-slate-100 font-black focus:ring-1 focus:ring-brand-blue-500 outline-hidden"
                      required
                      placeholder="أحمد علي الحربي"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-end text-[10px] text-slate-400 font-semibold gap-1.5 pt-4">
                    <span>📅 {language === 'ar' ? 'تاريخ التوقيع الفعلي اليوم:' : 'Sign date:'}</span>
                    <span className="font-mono">{new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء وتجاهل' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 text-white text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-xs ${
                    formType === 'before' ? 'bg-brand-blue-500 hover:bg-brand-blue-600' : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  <Check size={14} strokeWidth={3} />
                  <span>
                    {formType === 'before' 
                      ? (language === 'ar' ? 'تحفيظ فحص ما قبل الصيانة' : 'Save Pre Check')
                      : (language === 'ar' ? 'تحفيظ فحص ما بعد الصيانة' : 'Save Post Check')
                    }
                  </span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* INSPECTION VIEW/REVIEW DETAIL OVERLAY */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto select-none">
          <div 
            className="bg-white dark:bg-slate-850 max-w-2xl w-full rounded-3xl border border-slate-150 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden shadow-2xl"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Review Header */}
            <div className="px-6 py-4.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`p-2 rounded-xl text-white ${selectedInspection.type === 'before' ? 'bg-brand-blue-500' : 'bg-emerald-500'}`}>
                  <FileText size={18} />
                </span>
                <div>
                  <h3 className="text-sm md:text-base font-black text-slate-909 dark:text-white">
                    {selectedInspection.type === 'before' 
                      ? (language === 'ar' ? `تقرير السلامة المبدئي #${selectedInspection.id}` : `Pre-Maintenance Report #${selectedInspection.id}`)
                      : (language === 'ar' ? `تقرير الجودة النهائي #${selectedInspection.id}` : `Post-Maintenance Report #${selectedInspection.id}`)
                    }
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    {language === 'ar' ? `الجهة: إدارة تشغيل وصيانة الأسطول العام` : `Department: Fleet Operations & City Maintenance`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInspection(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-805 rounded-xl cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Review Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 select-none text-right">

              {/* Status Header Badge bar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-905 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">{language === 'ar' ? 'التقييم التشخيصي العام:' : 'Diagnostic Rating:'}</span>
                  <div className="mt-1">{getStatusBadge(selectedInspection.overallStatus)}</div>
                </div>
                <div className="text-right sm:text-left text-[11px] text-slate-400 space-y-0.5 font-bold">
                  <div>📆 {language === 'ar' ? 'تاريخ الفحص والتحقق:' : 'Safety Audited at:'} <span className="font-mono text-slate-600 dark:text-slate-350">{new Date(selectedInspection.timestamp).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}</span></div>
                  <div>👤 {language === 'ar' ? 'الفاحص المسؤول المهني:' : 'Auditor in Charge:'} <span className="text-brand-blue-500 font-black">{selectedInspection.checkedBy}</span></div>
                </div>
              </div>

              {/* Items Table / list */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-850 dark:text-slate-300 flex items-center gap-1.5 border-b border-slate-150/5 pb-1">
                  <span className="w-1.5 h-3 bg-brand-blue-500 rounded-full block" />
                  <span>{language === 'ar' ? 'تفاصيل بنود فحص التدقيق الميداني:' : 'Field Inspection Checks List Details:'}</span>
                </span>
                
                <div className="space-y-2">
                  {selectedInspection.items.map((item, idx) => (
                    <div 
                      key={item.id}
                      className="p-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/80 rounded-xl flex flex-col space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-black flex items-center justify-center text-slate-420">
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {language === 'ar' ? item.nameAr : item.nameEn}
                          </span>
                        </div>
                        
                        <span className={`px-2 py-0.5 rounded-md font-sans font-black text-[9px] border ${getItemStatusStyle(item.status)}`}>
                          {item.status === 'pass' ? (language === 'ar' ? 'سليم Pass ✅' : 'Pass ✅') :
                           item.status === 'warning' ? (language === 'ar' ? 'تنبيه/ملاحظة' : 'Warning ⚠️') :
                           item.status === 'fail' ? (language === 'ar' ? 'معيب/فشل ❌' : 'Defective ❌') :
                           'N/A'}
                        </span>
                      </div>

                      {item.notes && (
                        <div className="text-[10px] text-slate-400 font-semibold bg-white dark:bg-slate-850 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          📌 {language === 'ar' ? 'ملحوظة الفني الفورية:' : 'Notes:'} {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes block */}
              {selectedInspection.notes && (
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-slate-850 dark:text-slate-300 block">{language === 'ar' ? 'توجيهات وتوصيات الفاحص المعتمدة:' : 'Inspector General Recommendations:'}</span>
                  <div className="p-3 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    {selectedInspection.notes}
                  </div>
                </div>
              )}

              {/* Document authentication bottom banner */}
              <div className="p-4 bg-slate-100/50 dark:bg-slate-900 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-bold text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">{language === 'ar' ? 'ختم الاعتماد الرقمي:' : 'Digital Stamp Auth:'}</span>
                  <span className="font-mono text-slate-550 dark:text-slate-300 block">{selectedInspection.id} // SEC-QUAL-SLA</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold text-right sm:text-left">{language === 'ar' ? 'الاسم المصحح المعتمد الفعلي:' : 'Authorized Signature:'}</span>
                  <span className="text-sm font-black text-brand-blue-500 block text-right sm:text-left underline decoration-dotted decoration-brand-blue-500 mt-1 pr-1 pl-1">
                    {selectedInspection.signature || selectedInspection.checkedBy}
                  </span>
                </div>
              </div>

            </div>

            {/* Review Actions */}
            <div className="px-6 py-4.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-755 text-xs font-black rounded-lg transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <Printer size={13} />
                <span>{language === 'ar' ? 'طباعة التقرير الرقمي' : 'Print Certificate'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedInspection(null)}
                className="px-5 py-2 bg-brand-blue-500 hover:bg-brand-blue-600 text-white text-xs font-black rounded-lg cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق المراجعة' : 'Close review'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
