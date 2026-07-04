import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  CheckCircle, 
  Trash2, 
  Check, 
  X, 
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface PeriodicSchedule {
  id: string;
  vehicleId: string;
  title: string;
  type: 'time' | 'mileage' | 'both';
  intervalDays?: number;
  intervalMileage?: number;
  lastDoneDate?: string;
  lastDoneMileage?: number;
  dueDate: string;
  dueMileage?: number;
  status: 'active' | 'due-soon' | 'overdue' | 'paused';
  notes?: string;
  category: 'mechanical' | 'electrical' | 'cooling' | 'hydraulic' | 'bodywork';
}

interface VehiclePeriodicTabProps {
  vehicleId: string;
  onRecordAdded: () => void;
}

const DEFAULT_SCHEDULES: PeriodicSchedule[] = [
  {
    id: 'p-1',
    vehicleId: '1',
    title: 'تغيير زيت المحرك وباقة الفلاتر الدورية',
    type: 'mileage',
    intervalMileage: 10000,
    lastDoneDate: '2026-03-20',
    lastDoneMileage: 40000,
    dueMileage: 50000,
    dueDate: '2026-06-20',
    status: 'active',
    category: 'mechanical',
    notes: 'استخدام زيت معتمد لزيادة مرونة المحرك وتقليل استهلاك الوقود.'
  },
  {
    id: 'p-2',
    vehicleId: '2',
    title: 'معايرة ميزان الإطارات وفحص عمق المداس للمحاور',
    type: 'time',
    intervalDays: 90,
    lastDoneDate: '2026-02-15',
    dueDate: '2026-05-15',
    status: 'overdue',
    category: 'mechanical',
    notes: 'فحص ميكانيكي لسلامة الإطارات العشرة وتجنب التآكل المتسارع.'
  },
  {
    id: 'p-3',
    vehicleId: '3',
    title: 'فحص واختبار فعالية منظومة الفرامل والصيانة الوقائية لها',
    type: 'time',
    intervalDays: 90,
    lastDoneDate: '2026-02-28',
    dueDate: '2026-05-29',
    status: 'due-soon',
    category: 'hydraulic',
    notes: 'يتضمن تغيير قماشات الفرامل والتأكد من مستوى زيت الهيدروليك.'
  },
  {
    id: 'p-4',
    vehicleId: '4',
    title: 'تنظيف وغسيل فلاتر التكييف ومروحة التبريد المساعدة',
    type: 'both',
    intervalDays: 30,
    intervalMileage: 3000,
    lastDoneDate: '2026-05-01',
    lastDoneMileage: 15200,
    dueDate: '2026-05-31',
    dueMileage: 18200,
    status: 'active',
    category: 'cooling',
    notes: 'صيانة وقائية لضمان عمل رافعة الشغل دون توقف في فترات الصيف الحرجة.'
  }
];

export default function VehiclePeriodicTab({ vehicleId, onRecordAdded }: VehiclePeriodicTabProps) {
  const [schedules, setSchedules] = useState<PeriodicSchedule[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState<PeriodicSchedule | null>(null);

  // States for adding a new schedule
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState<'mechanical' | 'electrical' | 'cooling' | 'hydraulic' | 'bodywork'>('mechanical');
  const [newType, setNewType] = useState<'time' | 'mileage' | 'both'>('time');
  const [newDays, setNewDays] = useState(90);
  const [newMileage, setNewMileage] = useState(10000);
  const [newLastDate, setNewLastDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLastMileage, setNewLastMileage] = useState(50000);
  const [newNotes, setNewNotes] = useState('');

  // States for marking as completed
  const [compDate, setCompDate] = useState(new Date().toISOString().split('T')[0]);
  const [compOdo, setCompOdo] = useState('');
  const [compCost, setCompCost] = useState('150');
  const [compWorkshop, setCompWorkshop] = useState('WS-1');
  const [compNotes, setCompNotes] = useState('تم فحص القطعة وتثبيتها بنجاح تالياً لدورة الصيانة الوقائية السليمة.');

  useEffect(() => {
    const saved = localStorage.getItem('fleet_periodic_schedules');
    let loaded: any[] = [];
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse periodic schedules', e);
      }
    }
    
    if (loaded.length === 0) {
      loaded = DEFAULT_SCHEDULES;
      localStorage.setItem('fleet_periodic_schedules', JSON.stringify(loaded));
    }
    const filtered = loaded.filter(s => s.vehicleId === vehicleId);
    setSchedules(filtered);
  }, [vehicleId]);

  const persistSchedulesLocal = (newSpecific: PeriodicSchedule[]) => {
    const saved = localStorage.getItem('fleet_periodic_schedules');
    let loadedAll: any[] = [];
    if (saved) {
      try { loadedAll = JSON.parse(saved); } catch (e) { }
    } else {
      loadedAll = DEFAULT_SCHEDULES;
    }
    const filteredAllButThis = loadedAll.filter(s => s.vehicleId !== vehicleId);
    const combined = [...newSpecific, ...filteredAllButThis];
    localStorage.setItem('fleet_periodic_schedules', JSON.stringify(combined));
    setSchedules(newSpecific);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let calDate = '';
    if (newType !== 'mileage') {
      const d = new Date(newLastDate);
      d.setDate(d.getDate() + Number(newDays));
      calDate = d.toISOString().split('T')[0];
    } else {
      const d = new Date(newLastDate);
      d.setDate(d.getDate() + 90);
      calDate = d.toISOString().split('T')[0];
    }

    const calculatedDueMileage = newType !== 'time' ? (Number(newLastMileage) + Number(newMileage)) : undefined;

    const newSched: PeriodicSchedule = {
      id: 'p-' + Math.random().toString(36).substring(2, 9),
      vehicleId: vehicleId,
      title: newTitle,
      type: newType,
      category: newCat,
      intervalDays: newType !== 'mileage' ? Number(newDays) : undefined,
      intervalMileage: newType !== 'time' ? Number(newMileage) : undefined,
      lastDoneDate: newLastDate,
      lastDoneMileage: Number(newLastMileage) || undefined,
      dueDate: calDate,
      dueMileage: calculatedDueMileage,
      status: 'active',
      notes: newNotes
    };

    persistSchedulesLocal([newSched, ...schedules]);
    
    setNewTitle('');
    setNewNotes('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التذكير الدوري الخاص بهذه المركبة؟')) {
      const updated = schedules.filter(s => s.id !== id);
      persistSchedulesLocal(updated);
    }
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCompleteForm) return;

    const sched = showCompleteForm;

    const nextDate = new Date(compDate);
    const setDayInterval = sched.intervalDays || 90;
    nextDate.setDate(nextDate.getDate() + setDayInterval);
    const calculatedNextDate = nextDate.toISOString().split('T')[0];

    const currentMile = Number(compOdo) || sched.lastDoneMileage || 50000;
    const intervalMile = sched.intervalMileage || 10000;
    const calculatedNextMile = currentMile + intervalMile;

    const currentOrdersRaw = localStorage.getItem('fleet_maintenance_orders_v2');
    let currentOrders: any[] = [];
    if (currentOrdersRaw) {
      try {
        currentOrders = JSON.parse(currentOrdersRaw);
      } catch (e) { }
    }

    const oNo = 'WO-P' + Math.floor(10000 + Math.random() * 90000);
    const auditRecord = {
      id: 'ord_' + Math.random().toString(36).substring(2, 9),
      vehicleId: vehicleId,
      orderNumber: oNo,
      date: compDate,
      description: `[إنجاز صيانة دورية] ${sched.title} - ${compNotes}`,
      category: sched.category,
      status: 'completed',
      priority: 'medium',
      cost: Number(compCost) || 0,
      partsUsed: ['زيوت وفلاتر ومستهلكات دورية وقائية'],
      workshopId: compWorkshop,
      progress: 100,
      lastUpdate: compDate,
      chiefNotes: 'أغلقت بامتياز من خلال لوحة الصيانة الفورية المدمجة للآلية.'
    };

    localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify([auditRecord, ...currentOrders]));

    // Update schedules list
    const updated = schedules.map(s => {
      if (s.id === sched.id) {
        return {
          ...s,
          lastDoneDate: compDate,
          lastDoneMileage: currentMile,
          dueDate: calculatedNextDate,
          dueMileage: sched.type !== 'time' ? calculatedNextMile : undefined,
          status: 'active' as const
        };
      }
      return s;
    });

    persistSchedulesLocal(updated);
    
    setShowCompleteForm(null);
    onRecordAdded();
  };

  const getBadgeClass = (s: PeriodicSchedule) => {
    const dObj = new Date(s.dueDate);
    const now = new Date('2026-05-23');
    const dDiff = Math.ceil((dObj.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (dDiff <= 0) {
      return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-450 border border-rose-100/30';
    } else if (dDiff <= 7) {
      return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100/30';
    }
    return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-[#34d399] border border-emerald-100/30';
  };

  const getDaysLabel = (s: PeriodicSchedule) => {
    const dObj = new Date(s.dueDate);
    const now = new Date('2026-05-23');
    const dDiff = Math.ceil((dObj.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (dDiff <= 0) return `⚠️ متأخرة بـ ${Math.abs(dDiff)} يوم`;
    if (dDiff <= 7) return `🕒 تستحق بعد ${dDiff} أيام`;
    return `✓ متبقي ${dDiff} يوم`;
  };

  const getCatLabel = (cat: string) => {
    switch (cat) {
      case 'mechanical': return '⚙️ ميكانيكا';
      case 'electrical': return '⚡ كهرباء';
      case 'cooling': return '❄️ تبريد';
      case 'hydraulic': return '💧 هيدروليك';
      case 'bodywork': return '🛠️ سمكرة';
      default: return 'عام';
    }
  };

  return (
    <div className="space-y-5 text-right font-sans" dir="rtl">
      
      {/* Upper context banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4.5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-150/45 dark:border-slate-800 rounded-2xl">
        <div className="text-right">
          <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="p-1 px-1.5 bg-brand-blue-500/10 text-brand-blue-500 rounded text-[11px] font-bold">لوحة مدمجة</span>
            <span>الصيانة الدورية والمجدولة المخصصة للعجلة</span>
          </h4>
          <p className="text-[10px] text-slate-550 dark:text-slate-400 mt-1">توليد بلاغات وتذكيرات الكيلومترات والتواريخ الاستباقية لتفادي التلفيات العشوائية وغير المتوقعة.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] uppercase font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
        >
          <Plus size={12} />
          <span>{showAddForm ? 'إخفاء لوحة الإنشاء' : 'إنشاء تذكير دوري للعجلة'}</span>
        </button>
      </div>

      {/* Inline Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-xs overflow-hidden"
          >
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h5 className="text-[11.5px] font-black text-slate-850 dark:text-white">جدولة دورة تكرار صيانة وقائية جديدة</h5>
              <p className="text-[9.5px] text-slate-400">املاء معطيات التواتر وفترة التحذير لتتبعها ميكانيكياً</p>
            </div>

            <form onSubmit={handleAddNew} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">مسمى ونوع الخدمة الدورية المكررة:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: تغيير باقة طرمبة الباور ومصفاة الزيوت..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl outline-none text-xs dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">التصنيف الفني:</label>
                  <select
                    value={newCat}
                    onChange={(e: any) => setNewCat(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-800 rounded-xl text-xs dark:text-white cursor-pointer"
                  >
                    <option value="mechanical">⚙️ ميكانيكا وصيانة عامة</option>
                    <option value="electrical">⚡ كهرباء وإلكترونيات</option>
                    <option value="cooling">❄️ تبريد وتكييف هواء</option>
                    <option value="hydraulic">💧 هيدروليكية وروافع</option>
                    <option value="bodywork">🛠️ سمكرة ودعم الهيكل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">آلية الاحتساب للتردد:</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-800 rounded-xl text-xs dark:text-white cursor-pointer"
                  >
                    <option value="time">📅 دورية زمنية (بالأيام)</option>
                    <option value="mileage">📟 دورية عداد (بالكيلومتر)</option>
                    <option value="both">⚖️ ثنائي (أيهما يسبق الآخر)</option>
                  </select>
                </div>

                <div>
                  {newType !== 'mileage' ? (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">التكرار بالأيام (مثال 90 يوماً):</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={newDays}
                        onChange={(e) => setNewDays(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-mono dark:text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">التكرار بالمسافة (مثال 10000 كم):</label>
                      <input
                        type="number"
                        min="100"
                        required
                        value={newMileage}
                        onChange={(e) => setNewMileage(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-mono dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50/50 dark:bg-slate-955 p-3 rounded-xl border border-slate-150/40 dark:border-slate-850">
                <div>
                  <label className="block text-[10px] text-slate-450 mb-1">تاريخ آخر مرة تم إجراؤها فيها:</label>
                  <input
                    type="date"
                    required
                    value={newLastDate}
                    onChange={(e) => setNewLastDate(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-150 rounded-lg text-xs font-mono dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-450 mb-1">عداد المركبة في المرة السابقة:</label>
                  <input
                    type="number"
                    required
                    value={newLastMileage}
                    onChange={(e) => setNewLastMileage(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-150 rounded-lg text-xs font-mono dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">ملاحظات وقائية للفنيين (اختياري):</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="نوع مستهلكات الصندوق أو متطلبات الفك والتركيب المتبعة للآلية..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 rounded-xl outline-none text-xs dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                >
                  إلغاء التراجع
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer"
                >
                  إضافة التذكير وجدولته فوراً
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedules grid view */}
      {schedules.length === 0 ? (
        <div className="py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center text-slate-450">
          <Calendar size={32} className="opacity-20 animate-pulse mb-2.5 text-slate-500" />
          <h5 className="text-xs font-black text-slate-700 dark:text-slate-350">لا يوجد تذكيرات تفصيلية مفعلة لهذه العجلة</h5>
          <p className="text-[10px] text-slate-500 max-w-xs mt-0.5">اضغط على زر الإنشاء بالأعلى لبدء نمذجة تذكيرات الوقاية الدورية لتظهر هنا بالاستحقاقات.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map(sched => (
            <div 
              key={sched.id} 
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs relative overflow-hidden text-right"
            >
              <div>
                <div className="flex items-start justify-between gap-2.5 mb-2.5">
                  <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-150/40 text-slate-600 dark:text-slate-350 text-[8.5px] font-black rounded shrink-0">
                    {getCatLabel(sched.category)}
                  </span>
                  
                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-extrabold ${getBadgeClass(sched)}`}>
                    {getDaysLabel(sched)}
                  </span>
                </div>

                <h5 className="font-black text-xs text-slate-850 dark:text-white leading-snug">{sched.title}</h5>
                {sched.notes && <p className="text-[9.5px] text-slate-450 dark:text-slate-500 mt-1 line-clamp-2 leading-relaxed">{sched.notes}</p>}

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-850 pt-3 mt-3 text-[10px] font-mono leading-relaxed text-slate-500">
                  <div>
                    <span className="block text-[8.5px] text-slate-400 font-bold leading-none mb-1">دورة الفاصل التكراري:</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-300">
                      {sched.type === 'time' && `كل ${sched.intervalDays} يوماً`}
                      {sched.type === 'mileage' && `كل ${sched.intervalMileage?.toLocaleString()} كم`}
                      {sched.type === 'both' && `كل ${sched.intervalDays} يوم أو ${sched.intervalMileage?.toLocaleString()} كم`}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[8.5px] text-slate-400 font-bold leading-none mb-1">الاستحقاق القادم:</span>
                    <span className="font-black text-slate-800 dark:text-slate-250">
                      📅 {sched.dueDate}
                      {sched.dueMileage && ` / 📟 عند ${sched.dueMileage.toLocaleString()} كم`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-3.5 mt-3.5">
                <span className="text-[9px] text-slate-400 leading-none">
                  آخر صيانة: {sched.lastDoneDate ? `${sched.lastDoneDate} (${sched.lastDoneMileage?.toLocaleString()} كم)` : 'مؤخراً بالورشة'}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(sched.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                    title="إلغاء المجدولة"
                  >
                    <Trash2 size={11} />
                  </button>

                  <button
                    onClick={() => {
                      setCompDate(new Date().toISOString().split('T')[0]);
                      setCompOdo(sched.lastDoneMileage ? String(sched.lastDoneMileage + (sched.intervalMileage || 5000)) : '45000');
                      setCompCost('150');
                      setCompNotes(`تم إغلاق واستبدال الملتزمات المجدولة لـ [${sched.title}] بكفاءة تشغيلية ودقة هندسية عالية.`);
                      setShowCompleteForm(sched);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-green-500 hover:opacity-90 text-[10.5px] font-black text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Check size={12} />
                    <span>إنجاز الخدمة المجدولة</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPLETE RESET POPUP */}
      <AnimatePresence>
        {showCompleteForm && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] border border-slate-150 dark:border-slate-800 shadow-2xl p-5 text-right flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-right">
                  <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-[#34d399] rounded-lg flex items-center justify-center">
                    <CheckCircle size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">توثيق وتنفيذ الصيانة الدورية المجدولة</h4>
                    <p className="text-[9px] text-slate-450 mt-0.5">تسجيل الدورة، تحديث العداد، وترحيل بلاغ ورقي مؤمن</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowCompleteForm(null)}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCompleteSubmit} className="space-y-3.5 py-4 text-xs font-bold text-right">
                
                <div className="bg-slate-50/70 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-right">
                  <span className="block text-[8.5px] text-slate-400 mb-0.5">البند المستهدف:</span>
                  <p className="text-[10px] text-slate-800 dark:text-white font-black">{showCompleteForm.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">تاريخ إكمال الإنجاز بالورشة:</label>
                    <input
                      type="date"
                      required
                      value={compDate}
                      onChange={(e) => setCompDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-mono dark:text-white text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">قراءة العداد الحالية (كم):</label>
                    <input
                      type="number"
                      required
                      value={compOdo}
                      onChange={(e) => setCompOdo(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-mono dark:text-white text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 font-bold">التكلفة الإجمالية والرسوم (ر.س):</label>
                    <input
                      type="number"
                      required
                      value={compCost}
                      onChange={(e) => setCompCost(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-mono dark:text-white text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">مكان / ورشة التركيب:</label>
                    <select
                      value={compWorkshop}
                      onChange={(e) => setCompWorkshop(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-800 rounded-xl text-xs dark:text-white text-right"
                    >
                      <option value="WS-15">ورشة ميكانيك المحركات العام</option>
                      <option value="WS-2">ورشة الأنظمة الإلكترونية والذكية</option>
                      <option value="WS-3">ورشة الإصلاح الميداني السريع</option>
                    </select>
                  </div>
                </div>

                <div className="text-right">
                  <label className="block text-[10px] text-slate-500 mb-1 text-right">أية ملاحظات وقائية أو قطع مبدلة:</label>
                  <textarea
                    rows={2}
                    value={compNotes}
                    onChange={(e) => setCompNotes(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl outline-none text-[10.5px] font-bold dark:text-white text-right"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCompleteForm(null)}
                    className="px-3.5 py-2 hover:bg-slate-50 rounded-xl transition-all font-bold text-slate-500"
                  >
                    رجوع
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    ترحيل وتحديث دورة الجدولة
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
