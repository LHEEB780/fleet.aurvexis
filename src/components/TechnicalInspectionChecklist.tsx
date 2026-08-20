import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle, 
  Wrench, 
  RefreshCw, 
  Camera, 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  Printer, 
  Calendar,
  AlertCircle,
  FileText,
  Info,
  CheckCircle2,
  ListPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MaintenanceOrder, Vehicle } from '../types';
import { saveDocument } from '../services/firebase';

export type TechnicalCheckStatus = 'healthy' | 'needs_maintenance' | 'replaced';

export interface TechnicalSubItem {
  id: string;
  nameAr: string;
  nameEn: string;
  status: TechnicalCheckStatus;
}

export interface TechnicalCheckItem {
  id: string;
  nameAr: string;
  nameEn: string;
  status: TechnicalCheckStatus;
  notes?: string;
  imageUrl?: string; // Base64 or uploaded URL
  subItems: TechnicalSubItem[];
}

export interface TechnicalInspection {
  id: string;
  orderId: string;
  orderNumber: string;
  vehicleId: string;
  vehicleName: string;
  checkedBy: string;
  timestamp: string;
  items: TechnicalCheckItem[];
  overallNotes?: string;
  signature?: string;
}

const DEFAULT_COMPONENTS_TEMPLATE = [
  { 
    id: 'tech-1', 
    nameAr: 'المحرك وفلتر الهواء', 
    nameEn: 'Engine & Air Filter',
    subItems: [
      { id: 'sub-oil', nameAr: 'زيت المحرك ومستوى اللزوجة', nameEn: 'Engine Oil & Viscosity', status: 'healthy' as TechnicalCheckStatus },
      { id: 'sub-filter', nameAr: 'شمعة الفلتر للهواء', nameEn: 'Air Filter Element', status: 'healthy' as TechnicalCheckStatus },
      { id: 'sub-belt', nameAr: 'سير الماكينة العام وبكرات التوجيه', nameEn: 'Serpentine Belt & Pulleys', status: 'healthy' as TechnicalCheckStatus }
    ]
  },
  { 
    id: 'tech-2', 
    nameAr: 'الإطارات وضغط الهواء', 
    nameEn: 'Tires & Air Pressure',
    subItems: [
      { id: 'sub-pressure', nameAr: 'قياس ضغط الهواء للخطوط الأربعة', nameEn: 'Wheel PSI Levels', status: 'healthy' as TechnicalCheckStatus },
      { id: 'sub-wear', nameAr: 'عمق وتأكل سطوح الإطارات (النعل)', nameEn: 'Tread Depth & Wear', status: 'healthy' as TechnicalCheckStatus },
      { id: 'sub-align', nameAr: 'ترصيص الإطارات وموزانة المقود', nameEn: 'Wheel Alignment & Balance', status: 'healthy' as TechnicalCheckStatus }
    ]
  },
  { 
    id: 'tech-3', 
    nameAr: 'نظام الفرامل وحالة الأقمشة', 
    nameEn: 'Brakes & Brake Pads',
    subItems: [
      { id: 'sub-front-pads', nameAr: 'أقمشة الفرامل الأمامية', nameEn: 'Front Brake Pads', status: 'healthy' as TechnicalCheckStatus },
      { id: 'sub-rear-pads', nameAr: 'أقمشة الفرامل الخلفية', nameEn: 'Rear Brake Pads', status: 'healthy' as TechnicalCheckStatus },
      { id: 'sub-brake-oil', nameAr: 'مستوى ونسبة رطوبة زيت الفرامل', nameEn: 'Brake Fluid level & Quality', status: 'healthy' as TechnicalCheckStatus },
      { id: 'sub-rotors', nameAr: 'هوبات العجلات (الهوب الخارجي)', nameEn: 'Brake Rotors / Discs', status: 'healthy' as TechnicalCheckStatus }
    ]
  },
  { 
    id: 'tech-4', 
    nameAr: 'التوصيلات الكهربائية والبطارية', 
    nameEn: 'Electrical & Battery',
    subItems: [
      { id: 'sub-battery', nameAr: 'اختبار جهد البطارية (الفولتية والأمبير)', nameEn: 'Battery CCA Voltage', status: 'healthy' as TechnicalCheckStatus },
      { id: 'sub-alternator', nameAr: 'خرج وإنتاج شحن الدينامو', nameEn: 'Alternator Charge Output', status: 'healthy' as TechnicalCheckStatus },
      { id: 'sub-wires', nameAr: 'التوصيلات المباشرة والظفيرة الرئيسية', nameEn: 'Wiring Harness & Connections', status: 'healthy' as TechnicalCheckStatus }
    ]
  },
  { 
    id: 'tech-5', 
    nameAr: 'نظام التبريد والرديتر', 
    nameEn: 'Cooling & Radiator',
    subItems: [
      { id: 'sub-coolant', nameAr: 'سائل تبريد الرديتر', nameEn: 'Radiator Coolant Condition', status: 'healthy' as TechnicalCheckStatus },
      { id: 'sub-fans', nameAr: 'مراوح التبريد (سرعة أولى وثانية)', nameEn: 'Cooling Fan Speeds', status: 'healthy' as TechnicalCheckStatus },
      { id: 'sub-hoses', nameAr: 'خراطيم ومواسير نظام التبريد الدوار', nameEn: 'Hoses & Direct Connectors', status: 'healthy' as TechnicalCheckStatus }
    ]
  },
  { 
    id: 'tech-6', 
    nameAr: 'المكيف وفلتر الكبينة', 
    nameEn: 'Air Conditioning System',
    subItems: [
      { id: 'sub-condenser', nameAr: 'مستوى ضغط الفريون والأنابيب', nameEn: 'Freon PSI Levels', status: 'healthy' as TechnicalCheckStatus },
      { id: 'sub-cabin-filter', nameAr: 'فلتر هواء الكبينة والمقصورة', nameEn: 'Cabin Microfilter', status: 'healthy' as TechnicalCheckStatus }
    ]
  }
];

const ILLUSTRATIVE_PRESETS = [
  { name: 'Engine Check', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400' },
  { name: 'Tire Check', url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=400' },
  { name: 'Brake Check', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400' },
  { name: 'Electrical Check', url: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=400' }
];

interface TechnicalInspectionChecklistProps {
  order: MaintenanceOrder;
  vehicle?: Vehicle;
  user: { name: string; role: string };
  language: 'ar' | 'en';
}

export default function TechnicalInspectionChecklist({
  order,
  vehicle,
  user,
  language
}: TechnicalInspectionChecklistProps) {
  const [inspections, setInspections] = useState<TechnicalInspection[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [items, setItems] = useState<TechnicalCheckItem[]>([]);
  const [overallNotes, setOverallNotes] = useState('');
  const [signature, setSignature] = useState('');
  const [viewingInspection, setViewingInspection] = useState<TechnicalInspection | null>(null);
  
  // Custom input fields for sub-items
  const [newSubAr, setNewSubAr] = useState<Record<string, string>>({});
  const [newSubEn, setNewSubEn] = useState<Record<string, string>>({});
  const [subItemAddOpenId, setSubItemAddOpenId] = useState<string | null>(null);

  // States helper for attaching images to items
  const [activeItemForImage, setActiveItemForImage] = useState<string | null>(null);

  const isRtl = language === 'ar';

  // Load existing inspections
  const loadInspections = () => {
    const saved = localStorage.getItem('fleet_technical_inspections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as TechnicalInspection[];
        setInspections(parsed.filter(insp => insp.orderId === order.id));
      } catch (e) {
        console.error('Error loading technical inspections', e);
      }
    }
  };

  useEffect(() => {
    loadInspections();
  }, [order.id]);

  const startNewInspection = () => {
    const initialItems: TechnicalCheckItem[] = DEFAULT_COMPONENTS_TEMPLATE.map(t => ({
      id: t.id,
      nameAr: t.nameAr,
      nameEn: t.nameEn,
      status: 'healthy',
      notes: '',
      imageUrl: '',
      subItems: t.subItems.map(sub => ({ ...sub }))
    }));
    
    setItems(initialItems);
    setOverallNotes('');
    setSignature(user.name);
    setNewSubAr({});
    setNewSubEn({});
    setSubItemAddOpenId(null);
    setIsFormOpen(true);
  };

  // Automatically recalculate top-category status based on its sub-items:
  // - If any is 'needs_maintenance', parent gets 'needs_maintenance'
  // - Else if any is 'replaced', parent gets 'replaced'
  // - Else 'healthy'
  const recalculateParentStatus = (subItems: TechnicalSubItem[]): TechnicalCheckStatus => {
    if (subItems.some(sub => sub.status === 'needs_maintenance')) {
      return 'needs_maintenance';
    }
    if (subItems.some(sub => sub.status === 'replaced')) {
      return 'replaced';
    }
    return 'healthy';
  };

  const handleSubItemStatusChange = (itemId: string, subItemId: string, status: TechnicalCheckStatus) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedSubItems = item.subItems.map(sub => 
          sub.id === subItemId ? { ...sub, status } : sub
        );
        return {
          ...item,
          subItems: updatedSubItems,
          status: recalculateParentStatus(updatedSubItems)
        };
      }
      return item;
    }));
  };

  const handleAddCustomSubItem = (itemId: string) => {
    const labelAr = newSubAr[itemId]?.trim();
    const labelEn = newSubEn[itemId]?.trim() || labelAr || 'Custom item';
    const textAr = labelAr || 'عنصر مخصص';

    if (!textAr) return;

    const newSub: TechnicalSubItem = {
      id: `custom-sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nameAr: textAr,
      nameEn: labelEn,
      status: 'healthy'
    };

    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedSubItems = [...item.subItems, newSub];
        return {
          ...item,
          subItems: updatedSubItems,
          status: recalculateParentStatus(updatedSubItems)
        };
      }
      return item;
    }));

    // Reset inputs
    setNewSubAr(prev => ({ ...prev, [itemId]: '' }));
    setNewSubEn(prev => ({ ...prev, [itemId]: '' }));
    setSubItemAddOpenId(null);
  };

  const handleRemoveSubItem = (itemId: string, subItemId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedSubItems = item.subItems.filter(sub => sub.id !== subItemId);
        return {
          ...item,
          subItems: updatedSubItems,
          status: recalculateParentStatus(updatedSubItems)
        };
      }
      return item;
    }));
  };

  const handleItemNoteChange = (itemId: string, notes: string) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, notes } : item));
  };

  const handleImageUpload = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, imageUrl: base64String } : item));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetImage = (itemId: string, url: string) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, imageUrl: url } : item));
    setActiveItemForImage(null);
  };

  const removeImage = (itemId: string) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, imageUrl: '' } : item));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const newInspection: TechnicalInspection = {
      id: `TL-INSP-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      vehicleId: order.vehicleId,
      vehicleName: vehicle?.name || order.vehicleId,
      checkedBy: user.name,
      timestamp: new Date().toISOString(),
      items,
      overallNotes,
      signature
    };

    // Save to local storage
    const savedRaw = localStorage.getItem('fleet_technical_inspections') || '[]';
    let allInspections: TechnicalInspection[] = [];
    try {
      allInspections = JSON.parse(savedRaw);
    } catch (e) {}

    // Exclude duplicates or rebuild
    allInspections = allInspections.filter(i => !(i.orderId === order.id && i.id === newInspection.id));
    allInspections.push(newInspection);
    localStorage.setItem('fleet_technical_inspections', JSON.stringify(allInspections));

    // Dispatch Storage Event to let outer modules stay reactive
    window.dispatchEvent(new Event('storage'));

    // Persistent storage integration with Cloud Firestore
    try {
      await saveDocument('technical_inspections', newInspection.id, newInspection);
    } catch (err) {
      console.warn("Firestore save failed, queued in background queue:", err);
    }

    loadInspections();
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    const confirmMsg = isRtl 
      ? 'هل أنت متأكد من حذف هذا الفحص الفني الإلكتروني نهائياً؟'
      : 'Are you sure you want to permanently delete this technical inspection?';
    if (window.confirm(confirmMsg)) {
      const savedRaw = localStorage.getItem('fleet_technical_inspections') || '[]';
      try {
        const parsed = JSON.parse(savedRaw) as TechnicalInspection[];
        const filtered = parsed.filter(i => i.id !== id);
        localStorage.setItem('fleet_technical_inspections', JSON.stringify(filtered));
        window.dispatchEvent(new Event('storage'));
        loadInspections();
        if (viewingInspection?.id === id) setViewingInspection(null);
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-4 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-150 dark:border-slate-800/80 pt-5 mt-4 gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-brand-blue-500/10 text-brand-blue-600 dark:text-[#38bdf8] rounded-xl">
            <ClipboardCheck size={16} />
          </span>
          <div className="text-right">
            <h4 className="text-xs md:text-sm font-black text-slate-800 dark:text-white">
              {isRtl ? 'الفحص الفني الرقمي للأجزاء والعناصر الفرعية' : 'Digital Component Technical Audit'}
            </h4>
            <p className="text-[10px] text-slate-450 font-bold">
              {isRtl ? 'فحص دقيق للمرحك، الفرامل والأجهزة عبر فروع وتصنيفات فرعية مخصصة' : 'Detailed check of sub-systems & customized divisions'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-600 dark:text-[#fbbf24] bg-amber-500/10 dark:bg-amber-500/5 rounded-xl font-black transition-all border border-amber-200/20 cursor-pointer"
          >
            <Info size={13} />
            <span>{isRtl ? 'دليل الفحص 📖' : 'Audit Guide'}</span>
          </button>

          {inspections.length === 0 && user.role !== 'viewer' && (
            <button
              type="button"
              onClick={startNewInspection}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue-550 hover:bg-brand-blue-600 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>{isRtl ? 'إجراء فحص فني للأقسام 🛠️' : 'Start Component Audit'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Checklist Status & Log Cards */}
      {inspections.length > 0 ? (
        <div className="space-y-3">
          {inspections.map((insp) => (
            <div 
              key={insp.id}
              className="bg-white dark:bg-slate-800 p-4 border border-slate-150 dark:border-slate-700/80 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/80"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-800 dark:text-white">
                    {isRtl 
                      ? `تم الفحص بواسطة: ${insp.checkedBy}` 
                      : `Inspected by: ${insp.checkedBy}`}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                    <Calendar size={10} />
                    <span>{new Date(insp.timestamp).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}</span>
                    <span>• {insp.items.reduce((acc, item) => acc + item.subItems.length, 0)} {isRtl ? 'عنصر اختبار فرعي' : 'sub-components tested'}</span>
                  </span>
                </div>
              </div>

              {/* Status Breakdown count badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-100 dark:border-emerald-900/60">
                  {insp.items.filter(i => i.status === 'healthy').length} {isRtl ? 'أقسام سليمة' : 'Healthy categories'}
                </span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-black rounded-lg border border-amber-100 dark:border-amber-900/60">
                  {insp.items.filter(i => i.status === 'needs_maintenance').length} {isRtl ? 'بحاجة لصيانة' : 'Needs Repair'}
                </span>

                <button
                  type="button"
                  onClick={() => setViewingInspection(insp)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-650 dark:text-slate-200 text-[10.5px] font-black rounded-lg transition-all cursor-pointer"
                >
                  {isRtl ? 'عرض التقارير 👁️' : 'View Report'}
                </button>

                {user.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => handleDelete(insp.id)}
                    className="p-1 px-1.5 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {user.role !== 'viewer' && (
            <button
              type="button"
              onClick={startNewInspection}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/30 dark:hover:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} />
              <span>{isRtl ? 'إجراء فحص فني إضافي للمراجعة' : 'Record another component inspection run'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-150 dark:border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-400 font-bold leading-relaxed">
            {isRtl 
              ? 'لم يتم تعبئة نموذج الفحص الشامل وتوزيع العناصر الفرعية لهذه المركبة بعد.' 
              : 'No dynamic technical component checklists have been recorded yet.'}
          </p>
          <p className="text-[10px] text-slate-400 leading-normal">
            {isRtl 
              ? 'يُوصى بإجراء فحص أجزاء الماكينة، والمكابح، والكهرباء لتأكيد الدقة وحالة قطع الغيار الكلية.' 
              : 'Verify status of brakes, engine parts, and electrical links for full precision log.'}
          </p>
        </div>
      )}

      {/* FORM MODAL / ADD CHECKLIST */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-3xl border border-slate-150 dark:border-slate-800 flex flex-col max-h-[92vh] shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-brand-blue-500 text-white rounded-xl">
                  <ClipboardCheck size={18} />
                </span>
                <div className="text-right">
                  <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white">
                    {isRtl ? 'نموج فحص الأجزاء وتصنيف وتعديل العناصر الفرعية 🎛️' : 'Sub-Category Component Technical Form'}
                  </h3>
                  <span className="text-[10px] text-slate-450 block mt-0.5">
                    {isRtl 
                      ? `رقم الأمر: ${order.orderNumber} • لوحة المركبة: ${vehicle?.plateNumber || order.vehicleId}` 
                      : `Order: ${order.orderNumber} • Tech Code: ${vehicle?.plateNumber || order.vehicleId}`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form scrollable elements */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin text-right">
              <div className="p-3.5 bg-brand-blue-500/[0.03] dark:bg-[#38bdf8]/5 rounded-2xl border border-brand-blue-100 dark:border-brand-blue-900/30 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {isRtl 
                  ? 'يرجى تحديد حالة العناصر الفنية الفرعية بدقة. يتم تحديث حالة البند الرئيسي تلقائياً وفقاً للتقييم الفرعي. يمكنك أيضاً إضافة تصنيفات فرعية جديدة بمرونة.' 
                  : 'Please check sub-component statuses. The parent category status is automatically resolved. You can also dynamically add custom sub-items.'}
              </div>

              {/* Template check items wrapper */}
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div 
                    key={item.id}
                    className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800/60 rounded-2xl space-y-4"
                  >
                    {/* Main Component Row Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3 gap-2">
                      <div>
                        <span className="text-[9px] text-brand-blue-600 dark:text-[#38bdf8] font-black uppercase tracking-wide">
                          {isRtl ? `القسم رقم ${index + 1}` : `Division ${index + 1}`}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{isRtl ? item.nameAr : item.nameEn}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                            item.status === 'healthy' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : item.status === 'needs_maintenance' 
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                              : 'bg-sky-500/10 text-sky-600 dark:text-sky-450'
                          }`}>
                            {item.status === 'healthy' ? (isRtl ? 'سليم بالكامل' : 'Completely Healthy') :
                             item.status === 'needs_maintenance' ? (isRtl ? 'تنبيه صيانة فرعي' : 'Sub Needs Repair') :
                             (isRtl ? 'مستبدل جزئياً' : 'Partially Replaced')}
                          </span>
                        </h4>
                      </div>

                      {/* Dynamic Add Subitem trigger inline */}
                      <button
                        type="button"
                        onClick={() => setSubItemAddOpenId(subItemAddOpenId === item.id ? null : item.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 self-start sm:self-auto bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-[10.5px] font-black border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                      >
                        <ListPlus size={12} className="text-[#38bdf8]" />
                        <span>{isRtl ? 'إضافة تصنيف فرعي ➕' : 'Add Custom child Category'}</span>
                      </button>
                    </div>

                    {/* Inline adding form for custom sub-components */}
                    <AnimatePresence>
                      {subItemAddOpenId === item.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-805 p-3 rounded-xl flex flex-col gap-2.5"
                        >
                          <span className="text-[9.5px] font-black text-slate-400 uppercase block">
                            {isRtl ? 'أدخل معلومات العنصر الفرعي الجديد للتصنيف:' : 'Create sub-category:'}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={newSubAr[item.id] || ''}
                              onChange={(e) => setNewSubAr(prev => ({ ...prev, [item.id]: e.target.value }))}
                              className="text-xs p-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-right dark:text-white"
                              placeholder={isRtl ? 'الاسم بالعربية (مثال: سير المكينة)' : 'Name in Arabic'}
                            />
                            <input
                              type="text"
                              value={newSubEn[item.id] || ''}
                              onChange={(e) => setNewSubEn(prev => ({ ...prev, [item.id]: e.target.value }))}
                              className="text-xs p-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-right dark:text-white"
                              placeholder={isRtl ? 'الاسم بالإنجليزية (مثال: Serpentine Belt)' : 'Name in English'}
                            />
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSubItemAddOpenId(null)}
                              className="px-2.5 py-1 text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md cursor-pointer"
                            >
                              {isRtl ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddCustomSubItem(item.id)}
                              className="px-3.5 py-1 text-[10px] bg-brand-blue-550 text-white font-black rounded-md cursor-pointer"
                            >
                              {isRtl ? 'تأكيد الإضافة ✅' : 'Inject Item'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Sub-items state toggler container */}
                    <div className="space-y-2 pt-1">
                      {item.subItems.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic text-center py-2">
                          {isRtl ? 'لا توجد تصنيفات فرعية لهذا المكون' : 'No sub-items registered for this component.'}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {item.subItems.map((sub, idx) => (
                            <div 
                              key={sub.id}
                              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-extrabold">{idx + 1}.</span>
                                <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                                  {isRtl ? sub.nameAr : sub.nameEn}
                                </span>
                                {Boolean(sub?.id && typeof sub.id === 'string' && sub.id.startsWith('custom-sub-')) && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSubItem(item.id, sub.id)}
                                    className="p-1 text-slate-350 hover:text-rose-500 rounded-lg shrink-0 cursor-pointer"
                                    title={isRtl ? 'حذف العنصر المخصص' : 'Delete user option'}
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                )}
                              </div>

                              {/* Nested status button selectors */}
                              <div className="grid grid-cols-3 gap-1 w-full sm:w-64 max-w-sm">
                                <button
                                  type="button"
                                  onClick={() => handleSubItemStatusChange(item.id, sub.id, 'healthy')}
                                  className={`py-1 px-1.5 text-[9.5px] font-black rounded-md border transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                                    sub.status === 'healthy'
                                      ? 'bg-emerald-555 text-white border-emerald-555 shadow-xs'
                                      : 'bg-slate-50 dark:bg-slate-850 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                                  }`}
                                >
                                  <CheckCircle size={9} />
                                  <span>{isRtl ? 'سليم' : 'Healthy'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSubItemStatusChange(item.id, sub.id, 'needs_maintenance')}
                                  className={`py-1 px-1.5 text-[9.5px] font-black rounded-md border transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                                    sub.status === 'needs_maintenance'
                                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                      : 'bg-slate-50 dark:bg-slate-850 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                                  }`}
                                >
                                  <Wrench size={9} />
                                  <span>{isRtl ? 'صيانة' : 'Needs Repair'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSubItemStatusChange(item.id, sub.id, 'replaced')}
                                  className={`py-1 px-1.5 text-[9.5px] font-black rounded-md border transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                                    sub.status === 'replaced'
                                      ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                                      : 'bg-slate-50 dark:bg-slate-850 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/20'
                                  }`}
                                >
                                  <RefreshCw size={9} />
                                  <span>{isRtl ? 'مستبدل' : 'Replaced'}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Image Attachment & Notes section */}
                    <div className="flex flex-col md:flex-row gap-3 items-start md:items-center pt-2">
                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) => handleItemNoteChange(item.id, e.target.value)}
                          className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-right dark:text-slate-100 placeholder:text-slate-400 focus:ring-1 focus:ring-brand-blue-500 outline-hidden font-medium"
                          placeholder={isRtl ? 'أدخل تفاصيل وملاحظات إضافية حول هذا البند للتوثيق...' : 'Notes about this category condition...'}
                        />
                      </div>

                      {/* Component Illustrative Photo Picker/Selector */}
                      <div className="flex items-center gap-2 shrink-0">
                        {item.imageUrl ? (
                          <div className="relative w-12 h-12 rounded-xl group overflow-hidden border border-slate-200 dark:border-slate-705 bg-black">
                            <img src={item.imageUrl} alt="audit item" className="w-full h-full object-cover opacity-80" />
                            <button
                              type="button"
                              onClick={() => removeImage(item.id)}
                              className="absolute inset-0 flex items-center justify-center text-white bg-red-600/75 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1.5">
                            {/* Preset Selection Trigger */}
                            <button
                              type="button"
                              onClick={() => setActiveItemForImage(item.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
                            >
                              <Camera size={11} />
                              <span>{isRtl ? 'صور توضيحية' : 'Illustrate Picture'}</span>
                            </button>

                            {/* Native / custom Upload Tool */}
                            <label className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 hover:bg-slate-750 border border-slate-200 dark:border-slate-705 rounded-xl text-[10px] text-slate-600 dark:text-slate-300 cursor-pointer transition-colors">
                              <Upload size={11} />
                              <span>{isRtl ? 'رفع ملف' : 'Upload file'}</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleImageUpload(item.id, e)} 
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Popover/Submodal to select nice illustrative presets */}
                    <AnimatePresence>
                      {activeItemForImage === item.id && (
                        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl mt-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9.5px] font-black text-slate-400 uppercase">
                              {isRtl ? 'اختر صورة توضيحية سريعة كدليل:' : 'Select preset illustrative guide:'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveItemForImage(null)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X size={10} />
                            </button>
                          </div>

                          <div className="grid grid-cols-4 gap-2 mr-0 ml-0">
                            {ILLUSTRATIVE_PRESETS.map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectPresetImage(item.id, preset.url)}
                                className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 hover:border-brand-blue-500 cursor-pointer transition-all focus:outline-none bg-slate-100"
                              >
                                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center py-0.5 truncate font-bold">
                                  {preset.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Notes and inspector sign-off section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-400 uppercase">
                    {isRtl ? 'توقعات وتوصيات الفني الشاملة:' : 'Overall Technician Summary & Recommendations:'}
                  </label>
                  <textarea
                    rows={2}
                    value={overallNotes}
                    onChange={(e) => setOverallNotes(e.target.value)}
                    className="w-full text-xs p-3 bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-xl text-right dark:text-slate-100 placeholder:text-slate-400 focus:ring-1 focus:ring-brand-blue-500 outline-hidden font-medium"
                    placeholder={isRtl ? 'اكتب الملاحظات الفنية للمركبة أو أي تنويه فني كلي...' : 'Overall technical remarks...'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-150 dark:border-slate-800/80">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-black text-slate-400 uppercase">
                      {isRtl ? 'الاسم المصادق بالفحص:' : 'Authorized Examiner Signature:'}
                    </label>
                    <input 
                      type="text"
                      className="w-full text-xs p-2 bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-xl text-right dark:text-slate-100 font-extrabold focus:ring-1 focus:ring-brand-blue-500 outline-hidden"
                      required
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-end text-[10px] text-slate-400 font-bold gap-1 mt-4">
                    <span>📅 {isRtl ? 'تاريخ التوثيق:' : 'Doc date:'}</span>
                    <span className="font-mono">{new Date().toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}</span>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-black rounded-xl transition-colors cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-blue-550 hover:bg-brand-blue-600 text-white text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-md shadow-brand-blue-500/15"
                >
                  <span>{isRtl ? 'اعتماد التقرير الفني وحفظه ✅' : 'Certify Technical Assessment Log'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL / PRINT PREVIEW OVERLAY */}
      {viewingInspection && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-3xl border border-slate-150 dark:border-slate-800 flex flex-col max-h-[92vh] shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-emerald-500 text-white rounded-xl">
                  <FileText size={18} />
                </span>
                <div className="text-right">
                  <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white">
                    {isRtl ? 'التقرير الإلكتروني المعتمد لفحص الأجزاء والتقييم' : 'Technical Component Inspection Record'}
                  </h3>
                  <span className="text-[10px] text-slate-450 block mt-0.5">
                    ID: {viewingInspection.id} // SEC-TECH-OK
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingInspection(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right scrollbar-thin">
              
              {/* Review Master Row */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-250 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-bold text-xs select-none">
                <div className="space-y-1">
                  <span className="text-[9.5px] text-slate-400 block font-bold">{isRtl ? 'مسؤول الفحص الفني المعتمد:' : 'Certified Technical Auditor:'}</span>
                  <span className="text-brand-blue-550 font-black text-xs block">{viewingInspection.checkedBy}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9.5px] text-slate-400 block font-bold">{isRtl ? 'تاريخ وساعة التدقيق الفني:' : 'Date & hour registered:'}</span>
                  <span className="font-mono text-slate-650 dark:text-slate-350 block">
                    {new Date(viewingInspection.timestamp).toLocaleString(isRtl ? 'ar-SA' : 'en-US')}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9.5px] text-slate-400 block font-bold">{isRtl ? 'مستند لمركبة لوحة:' : 'Associated Vehicle Key:'}</span>
                  <span className="font-mono text-slate-650 dark:text-slate-300 block">{vehicle?.plateNumber || viewingInspection.vehicleId}</span>
                </div>
              </div>

              {/* Items check details layout */}
              <div className="space-y-4">
                <span className="text-xs font-black text-slate-800 dark:text-slate-205 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-brand-blue-500 rounded-full block" />
                  <span>{isRtl ? 'حالة الأجزاء المفهرسة بالآلية وعناصرها الفرعية:' : 'Audited Component Status Breakdown:'}</span>
                </span>

                <div className="grid grid-cols-1 gap-3.5 animate-fade-in mr-0 ml-0">
                  {viewingInspection.items.map((item, index) => (
                    <div 
                      key={item.id}
                      className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800 rounded-2xl hover:border-slate-200 dark:hover:border-slate-750 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 font-bold block">{isRtl ? `بند ${index+1}` : `Division ${index+1}`}</span>
                          <span className="font-extrabold text-[#38bdf8] text-xs">
                            {isRtl ? item.nameAr : item.nameEn}
                          </span>
                        </div>

                        {/* Direct Category resolved status rendering */}
                        <span className={`px-2 py-0.5 rounded-lg font-black text-[9px] border inline-flex items-center gap-1 shrink-0 ${
                          item.status === 'healthy' 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900'
                            : item.status === 'needs_maintenance'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900'
                            : 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-450 border-sky-100 dark:border-sky-900'
                        }`}>
                          {item.status === 'healthy' && <CheckCircle size={9} />}
                          {item.status === 'needs_maintenance' && <Wrench size={9} />}
                          {item.status === 'replaced' && <RefreshCw size={9} />}
                          <span>
                            {item.status === 'healthy' ? (isRtl ? 'سليم بالكامل' : 'Healthy') :
                             item.status === 'needs_maintenance' ? (isRtl ? 'بحاجة لصيانة فرعية' : 'Sub Needs Repair') :
                             (isRtl ? 'مستبدل جزئياً' : 'Replaced')}
                          </span>
                        </span>
                      </div>

                      {/* Display table/list of audited sub items condition */}
                      <div className="pl-2 pr-2 space-y-1.5 py-1">
                        {item.subItems.map((sub, idx) => (
                          <div 
                            key={sub.id} 
                            className="flex items-center justify-between text-[11px] font-bold border-b border-slate-100/40 dark:border-slate-800/40 pb-1.5 last:border-b-0 last:pb-0"
                          >
                            <span className="text-slate-600 dark:text-slate-300">
                              {idx+1}. {isRtl ? sub.nameAr : sub.nameEn}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[8.5px] ${
                              sub.status === 'healthy' 
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : sub.status === 'needs_maintenance'
                                ? 'bg-amber-500/10 text-amber-600'
                                : 'bg-sky-500/10 text-sky-600'
                            }`}>
                              {sub.status === 'healthy' ? (isRtl ? 'سليم' : 'Healthy') :
                               sub.status === 'needs_maintenance' ? (isRtl ? 'بحاجة لصيانة' : 'Needs Repair') :
                               (isRtl ? 'مستبدل' : 'Replaced')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Illustrative preview image if supplied */}
                      {item.imageUrl && (
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/60 bg-black group max-w-md mx-auto">
                          <img src={item.imageUrl} alt="Inspection Proof" className="w-full h-full object-cover opacity-90 transition-transform group-hover:scale-105" />
                          <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 text-white text-[8px] rounded-md font-bold">
                            {isRtl ? 'صورة توضيحية فنية' : 'Technical illustration proof'}
                          </div>
                        </div>
                      )}

                      {/* Individual components notes */}
                      {item.notes && (
                        <div className="p-2 bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                          📝 {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* General Technical summary */}
              {viewingInspection.overallNotes && (
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-300 block">
                    {isRtl ? 'التوجيهات والتوصيات الفنية الشاملة للورشة:' : 'Overall Technicians & Sign-off Notes:'}
                  </span>
                  <p className="p-3 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                    "{viewingInspection.overallNotes}"
                  </p>
                </div>
              )}

              {/* Stamp and certified signature block */}
              <div className="p-4 bg-slate-100/50 dark:bg-slate-950 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-bold font-sans">
                <div>
                  <span className="text-[10px] text-slate-420 block">{isRtl ? 'توقيع واعتماد الفهرس الفني الفرعي:' : 'Authorized Official Digital Stamp:'}</span>
                  <span className="text-sm font-black text-brand-blue-550 block underline decoration-dotted mt-1">
                    {viewingInspection.signature || viewingInspection.checkedBy}
                  </span>
                </div>

                <div className="text-right sm:text-left">
                  <span className="text-[9px] text-slate-420 block">{isRtl ? 'تأكيد الرمز الآمن المرجعي:' : 'System verification secure signature:'}</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400 block mt-0.5">{viewingInspection.id.toLowerCase()} // SIGNED-SECURE</span>
                </div>
              </div>
            </div>

            {/* Print and view actions footer */}
            <div className="px-6 py-4.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-755 text-xs font-black rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <Printer size={13} />
                <span>{isRtl ? 'طباعة تقرير الفحص الفني' : 'Print Technical Checklist'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingInspection(null)}
                className="px-5 py-2 bg-brand-blue-500 hover:bg-brand-blue-600 text-white text-xs font-black rounded-lg cursor-pointer"
              >
                {isRtl ? 'إغلاق نافذة المراجعة' : 'Close Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER GUIDE MODAL / POPUP DESCRIPTION */}
      <AnimatePresence>
        {isGuideOpen && (
          <div className="fixed inset-0 z-[110] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl border border-slate-150 dark:border-slate-800 flex flex-col max-h-[90vh] shadow-2xl overflow-hidden"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-amber-500/10 text-amber-600 dark:text-[#fbbf24] rounded-xl">
                    <Info size={16} />
                  </span>
                  <div className="text-right">
                    <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white">
                      {isRtl ? 'دليل مستخدم منظومة الفحص الرقمية 📖' : 'Component Inspection User Guide'}
                    </h3>
                    <p className="text-[10px] text-slate-450 font-bold">
                      {isRtl ? 'إستبصار ذكي وتوضيح شامل لكافة آليات تدقيق أجزاء المركبة' : 'Full interactive walkthrough & status resolution explanation'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGuideOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-5 text-right font-sans scrollbar-thin flex-1 text-slate-750 dark:text-slate-200 text-xs leading-relaxed">
                {/* Intro Accent */}
                <div className="p-3.5 bg-amber-500/[0.03] dark:bg-amber-400/5 border border-amber-500/15 rounded-2xl text-amber-800 dark:text-amber-400 font-medium">
                  {isRtl 
                    ? 'أهلاً بك في نظام الفحص الفني الهيكلي للأقسام الفرعية. تتيح لك هذه المنظومة تتبع الحالة التشغيلية للمركبات بدقة فائقة وبطريقة مؤتمتة عبر الهواتف الذكية أو أجهزة التابلت في الورشة.'
                    : 'Welcome to the structural component design checklist. This module allows ground technicians to verify exact details of vehicle sub-components.'}
                </div>

                {/* Section 1: How Statuses Propagate */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue-550" />
                    <span>{isRtl ? '🔄 نظام توريث وتوريد الحالة الذكي' : 'Intelligent Status Inheritance'}</span>
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 pr-3.5">
                    {isRtl 
                      ? 'لا داعي لتعيين حالة الأقسام الكبرى يدوياً! بمجرد تغيير حالة أي مكون فرعي (مثل مستوى لزوجة الزيت)، يقوم النظام بالبث الفوري لتحديث حالة القسم الرئيسي (مثل "المحرك") كالتالي:'
                      : 'No need to set master category scores! Updating any sub-item dynamically maps to the parent division using this sequence:'}
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pr-6 text-slate-600 dark:text-slate-300 font-semibold">
                    <li>
                      <strong className="text-slate-800 dark:text-white">{isRtl ? 'طلب صيانة فرعي 🛠️:' : 'Needs Repair 🛠️:'}</strong>{' '}
                      {isRtl 
                        ? 'إذا تم رصد عطل وتنشيط "بحاجة لصيانة" لأي مكون فرعي واحد على الأقل، يتم تلقائياً تصنيف القسم الرئيسي بالكامل بأنه يحتاج صيانة.'
                        : 'If at least one sub-item is set to "Needs Repair", the parent status upgrades immediately to show care action.'}
                    </li>
                    <li>
                      <strong className="text-slate-800 dark:text-white">{isRtl ? 'الاستبدال الجزئي 🔄:' : 'Replaced 🔄:'}</strong>{' '}
                      {isRtl 
                        ? 'إذا كان أحد المكونات مستبدلاً والبقية سليمة، يتم تصنيف القسم الكلي كجزء "مستبدل جزئياً" لتوثيق تاريخ التغييرات.'
                        : 'If sub-items show replacements without pending defects, the parent maps as "Partially Replaced".'}
                    </li>
                    <li>
                      <strong className="text-slate-800 dark:text-white">{isRtl ? 'سلامة كاملة ✅:' : 'Completely Healthy ✅:'}</strong>{' '}
                      {isRtl 
                        ? 'يحتفظ القسم الرئيسي بحالة "سليم تماماً" فقط عندما تكون جميع العناصر والاختبارات الفرعية داخله بحالة سليمة.'
                        : 'Resolves to healthy context only if all registered metrics return completely green.'}
                    </li>
                  </ul>
                </div>

                {/* Section 2: Adding custom entities */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue-550" />
                    <span>{isRtl ? '➕ تخصيص وتعديل البنود ديناميكياً' : 'Add Custom Audit Criteria'}</span>
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 pr-3.5">
                    {isRtl 
                      ? 'تختلف المركبات باختلاف طرزها وتجهيزاتها؛ لذلك يمكنك بكل سهولة الضغط على "إضافة تصنيف فرعي" داخل أي فئة لرفع بنود اختبار تخصصية جديدة (مثل السيور الملحقة، أو الأجهزة الهيدروليكية الخاصة) باللغتين العربية والإنجليزية.'
                      : 'Vehicles differ. Click "Add Custom Item" to insert model-specific checks on the fly (e.g., custom hydraulic arms or special belts) in both languages.'}
                  </p>
                </div>

                {/* Section 3: Pictures / Visual Proof */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-905 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue-550" />
                    <span>{isRtl ? '📸 التوثيق الصوري وحفظ الأدلة' : 'Visual Reference & Photo Uploads'}</span>
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 pr-3.5">
                    {isRtl 
                      ? 'لتجنب النزاعات وتوفير إثباتات واضحة للمالك أو الإدارة، يمكنك التوثيق بطريقتين:'
                      : 'Provide concrete context for vehicle owners and logistics dashboards:'}
                  </p>
                  <ul className="list-disc list-inside space-y-1 pr-6 text-slate-600 dark:text-slate-300 font-semibold">
                    <li>{isRtl ? 'رفع صورة حقيقية ملتقطة عبر الكاميرا للجزء التالف.' : 'Take a photo of the dynamic fault over device camera.'}</li>
                    <li>{isRtl ? 'اختيار دليل توضيحي من الصور المجهزة مسبقاً لمطابقة شكل ومقر الفحص.' : 'Quickly load a visual guide preset to aid visual consistency.'}</li>
                  </ul>
                </div>

                {/* Section 4: Validation */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue-550" />
                    <span>{isRtl ? '✍️ التوقيع والاعتماد السحابي' : 'Cloud Sync & Official Signature'}</span>
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 pr-3.5 font-medium">
                    {isRtl 
                      ? 'عند الانتهاء، يتطلب النموذج كشف اسم الفني للتوقيع. يتم حفظ التقرير محلياً مع المزامنة التلقائية التامة بقواعد بيانات Firestore السحابية لتبقى البيانات موثوقة ومحمية من الضياع.'
                      : 'Ensure transparency with the mandated supervisor sign-off name. The report synchronizes to secured Firestore cloud structures instantly, persistent across reloads.'}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-955 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsGuideOpen(false)}
                  className="px-5 py-2 bg-brand-blue-550 hover:bg-brand-blue-600 text-white text-xs font-black rounded-xl cursor-pointer shadow-md transition-all animate-pulse"
                >
                  {isRtl ? 'فهمت ذلك، إغلاق الدليل 👍' : 'Understood, Close Guide'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
