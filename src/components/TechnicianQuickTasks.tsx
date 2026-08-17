import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Wrench, 
  Tag, 
  User, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Layers, 
  X,
  FileText,
  Truck,
  Zap,
  Edit2,
  Calendar,
  BellRing
} from 'lucide-react';
import { Technician } from '../types';
import { maintenanceOrders, vehicles } from '../data';
import { useLanguage } from '../services/LanguageContext';

export interface QuickTask {
  id: string;
  title: string;
  technicianId?: string;
  technicianName?: string;
  orderId?: string;
  orderNumber?: string;
  orderDescription?: string;
  vehicleName?: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  category: 'torque' | 'parts' | 'inspection' | 'reminder' | 'handoff';
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  dueDate?: string;
  notes?: string;
}

const STORAGE_KEY = 'fleet_technician_quick_tasks_v1';

const INITIAL_QUICK_TASKS: QuickTask[] = [
  {
    id: 'qt-1',
    title: 'معايرة عزم مسامير العجلات الأمامية (120 Nm) بعد تبديل تيل الفرامل',
    technicianId: '201',
    technicianName: 'م. أحمد الشمري',
    orderId: '108',
    orderNumber: 'WO-2026-002',
    orderDescription: 'فحص دوري ومعايرة للأنظمة الهيدروليكية',
    vehicleName: 'مرسيدس أكتروس 1845 (أ ب ج 1234)',
    priority: 'urgent',
    category: 'torque',
    completed: false,
    createdAt: '2026-05-19T08:30:00Z',
    dueDate: '2026-05-19',
    notes: 'التأكد من استخدام مفتاح العزم الرقمي والتوقيع في كشف السلامة'
  },
  {
    id: 'qt-2',
    title: 'طلب فلتر هيدروليك إضافي من المستودع قبل بدء تفريغ الزيت',
    technicianId: '201',
    technicianName: 'م. أحمد الشمري',
    orderId: '108',
    orderNumber: 'WO-2026-002',
    orderDescription: 'فحص دوري ومعايرة للأنظمة الهيدروليكية',
    vehicleName: 'مرسيدس أكتروس 1845 (أ ب ج 1234)',
    priority: 'high',
    category: 'parts',
    completed: true,
    completedAt: '2026-05-19T09:15:00Z',
    createdAt: '2026-05-19T08:00:00Z',
    dueDate: '2026-05-19'
  },
  {
    id: 'qt-3',
    title: 'فحص التوصيلات الكهربية للحساس المركزي وتأكيد عدم وجود كود خطأ OBD',
    technicianId: '202',
    technicianName: 'م. يوسف القحطاني',
    orderId: '109',
    orderNumber: 'WO-2026-003',
    orderDescription: 'تبديل زيت المحرك وفلاتر الوقود والزيت بالكامل',
    vehicleName: 'فولفو FH16 (د هـ و 5678)',
    priority: 'normal',
    category: 'inspection',
    completed: false,
    createdAt: '2026-05-19T10:00:00Z',
    dueDate: '2026-05-20'
  },
  {
    id: 'qt-4',
    title: 'تسليم مفتاح المركبة لمسؤول الحركة وتوقيع محضر الإنجاز الميداني',
    technicianId: '203',
    technicianName: 'م. طارق العمري',
    orderId: '113',
    orderNumber: 'WO-2026-007',
    orderDescription: 'تبديل تيل الفرامل الأمامية للمقطورة',
    vehicleName: 'مان TGX (س ص ع 9101)',
    priority: 'high',
    category: 'handoff',
    completed: false,
    createdAt: '2026-05-19T11:20:00Z',
    dueDate: '2026-05-19'
  }
];

const CATEGORY_MAP: Record<QuickTask['category'], { labelAr: string; labelEn: string; color: string; bg: string }> = {
  torque: { labelAr: 'معايرة وعزم', labelEn: 'Torque & Fasten', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40' },
  parts: { labelAr: 'متابعة قطع الغيار', labelEn: 'Spare Parts', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/40' },
  inspection: { labelAr: 'فحص نهائي', labelEn: 'Inspection', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/40' },
  reminder: { labelAr: 'تذكير شخصي', labelEn: 'Personal Note', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/40' },
  handoff: { labelAr: 'تسليم المركبة', labelEn: 'Handoff Alert', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40' }
};

const PRIORITY_MAP: Record<QuickTask['priority'], { labelAr: string; labelEn: string; color: string; badge: string }> = {
  urgent: { labelAr: 'عاجل وحرج 🚨', labelEn: 'Urgent 🚨', color: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
  high: { labelAr: 'أولوية عالية', labelEn: 'High Priority', color: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  normal: { labelAr: 'عادي', labelEn: 'Normal', color: 'text-slate-600 dark:text-slate-400', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  low: { labelAr: 'منخفض', labelEn: 'Low', color: 'text-slate-400 dark:text-slate-500', badge: 'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400' }
};

interface TechnicianQuickTasksProps {
  technicians: Technician[];
  focusedTechId?: string; // If set, pre-filter to this technician
  inDrawerMode?: boolean; // Compact styling inside technician profile drawer
}

export const TechnicianQuickTasks: React.FC<TechnicianQuickTasksProps> = ({
  technicians,
  focusedTechId,
  inDrawerMode = false
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [tasks, setTasks] = useState<QuickTask[]>(() => {
    if (typeof window === 'undefined') return INITIAL_QUICK_TASKS;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return INITIAL_QUICK_TASKS;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_QUICK_TASKS;
    }
  });

  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'with_order'>('all');
  const [selectedTechFilter, setSelectedTechFilter] = useState<string>(focusedTechId || 'all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form State for Quick Add / Edit
  const [taskTitle, setTaskTitle] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskTechId, setTaskTechId] = useState(focusedTechId || '');
  const [taskOrderId, setTaskOrderId] = useState('');
  const [taskPriority, setTaskPriority] = useState<QuickTask['priority']>('normal');
  const [taskCategory, setTaskCategory] = useState<QuickTask['category']>('torque');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (focusedTechId) {
      setSelectedTechFilter(focusedTechId);
      setTaskTechId(focusedTechId);
    }
  }, [focusedTechId]);

  // Load all available active maintenance orders from system/localStorage
  const allOrders = useMemo(() => {
    const saved = localStorage.getItem('fleet_maintenance_orders');
    let ordersList = maintenanceOrders;
    if (saved) {
      try {
        ordersList = JSON.parse(saved);
      } catch (e) {}
    }
    return ordersList;
  }, []);

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined
        };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleStartEdit = (task: QuickTask) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskNotes(task.notes || '');
    setTaskTechId(task.technicianId || '');
    setTaskOrderId(task.orderId || '');
    setTaskPriority(task.priority);
    setTaskCategory(task.category);
    setTaskDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
    setIsAddingNew(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    // Find linked technician info
    const matchedTech = technicians.find(t => t.id === taskTechId);
    // Find linked order info
    const matchedOrder = allOrders.find(o => o.id === taskOrderId || o.orderNumber === taskOrderId);
    let matchedVehicleStr = '';
    if (matchedOrder) {
      const veh = vehicles.find(v => v.id === matchedOrder.vehicleId);
      matchedVehicleStr = veh ? `${veh.name} (${veh.plateNumber})` : `مركبة #${matchedOrder.vehicleId}`;
    }

    if (editingTaskId) {
      // Update existing
      setTasks(prev => prev.map(t => {
        if (t.id === editingTaskId) {
          return {
            ...t,
            title: taskTitle.trim(),
            notes: taskNotes.trim() || undefined,
            technicianId: taskTechId || undefined,
            technicianName: matchedTech?.name || undefined,
            orderId: matchedOrder?.id || (taskOrderId ? taskOrderId : undefined),
            orderNumber: matchedOrder?.orderNumber || (taskOrderId ? taskOrderId : undefined),
            orderDescription: matchedOrder?.description,
            vehicleName: matchedVehicleStr || undefined,
            priority: taskPriority,
            category: taskCategory,
            dueDate: taskDueDate
          };
        }
        return t;
      }));
    } else {
      // Create new
      const newTask: QuickTask = {
        id: `qt-${Date.now()}`,
        title: taskTitle.trim(),
        notes: taskNotes.trim() || undefined,
        technicianId: taskTechId || undefined,
        technicianName: matchedTech?.name || undefined,
        orderId: matchedOrder?.id || (taskOrderId ? taskOrderId : undefined),
        orderNumber: matchedOrder?.orderNumber || (taskOrderId ? taskOrderId : undefined),
        orderDescription: matchedOrder?.description,
        vehicleName: matchedVehicleStr || undefined,
        priority: taskPriority,
        category: taskCategory,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: taskDueDate
      };
      setTasks(prev => [newTask, ...prev]);
    }

    // Reset Form
    setTaskTitle('');
    setTaskNotes('');
    setTaskOrderId('');
    setEditingTaskId(null);
    setIsAddingNew(false);
  };

  const handleCancelForm = () => {
    setTaskTitle('');
    setTaskNotes('');
    setTaskOrderId('');
    setEditingTaskId(null);
    setIsAddingNew(false);
  };

  // Pre-fill quick preset helper
  const handleApplyPreset = (presetText: string, cat: QuickTask['category'], prio: QuickTask['priority']) => {
    setTaskTitle(presetText);
    setTaskCategory(cat);
    setTaskPriority(prio);
    setIsAddingNew(true);
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Tech filter
      if (selectedTechFilter !== 'all' && task.technicianId !== selectedTechFilter) {
        return false;
      }
      // Status filter
      if (activeFilter === 'pending' && task.completed) return false;
      if (activeFilter === 'completed' && !task.completed) return false;
      if (activeFilter === 'with_order' && !task.orderId && !task.orderNumber) return false;
      return true;
    });
  }, [tasks, selectedTechFilter, activeFilter]);

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-purple-100 dark:border-slate-800 shadow-sm transition-all overflow-hidden ${
      inDrawerMode ? 'p-3.5 space-y-3' : 'p-5 space-y-4'
    }`}>
      {/* Header & Collapse Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
            <CheckSquare size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{isAr ? 'قائمة المهام السريعة والملاحظات الميدانية' : 'Technician Quick Task List & Notes'}</span>
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40">
                {completedCount} / {totalCount} {isAr ? 'منجز' : 'Done'} ({completionPercentage}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
              {isAr 
                ? 'إضافة تذكيرات فنية، معايرة عزم، وملاحظات مرتبطة بأوامر الصيانة الحالية دون مغادرة الصفحة' 
                : 'Add fast reminders, torque checks, and notes tied to active work orders'}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {!isAddingNew && (
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>{isAr ? 'إضافة مهمة / تذكير' : 'Add Quick Note'}</span>
            </button>
          )}

          {!inDrawerMode && (
            <button
              type="button"
              onClick={() => setIsExpanded(prev => !prev)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title={isExpanded ? 'طي القائمة' : 'توسيع القائمة'}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-purple-600 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Main Content Body */}
      {isExpanded && (
        <div className="space-y-4 pt-1">
          
          {/* Quick Presets Carousel (Fast One-Click Notes) */}
          {!isAddingNew && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px] font-bold">
              <span className="text-slate-400 shrink-0 text-[9px] font-black flex items-center gap-1">
                <Sparkles size={11} className="text-purple-500" />
                <span>{isAr ? 'إضافة سريعة:' : 'Quick Presets:'}</span>
              </span>
              <button
                type="button"
                onClick={() => handleApplyPreset('معايرة عزم مسامير العجلات (120 Nm) بعد التركيب', 'torque', 'urgent')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 shrink-0 transition-all cursor-pointer"
              >
                🔩 معايرة عزم العجلات
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('تأكيد استلام قطع الغيار والزيوت المطلوبة من المستودع', 'parts', 'high')}
                className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40 shrink-0 transition-all cursor-pointer"
              >
                📦 متابعة قطع المستودع
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('فحص تسريب السوائل والزيوت بعد تشغيل المحرك 15 دقيقة', 'inspection', 'normal')}
                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40 shrink-0 transition-all cursor-pointer"
              >
                🔍 فحص تسريب السوائل
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('تنبيه مشرف الورشة بجاهزية الشاحنة للتسليم النهائي', 'handoff', 'high')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 shrink-0 transition-all cursor-pointer"
              >
                📞 تنبيه تسليم المركبة
              </button>
            </div>
          )}

          {/* Quick Add / Edit Form Card */}
          <AnimatePresence>
            {isAddingNew && (
              <motion.form
                initial={{ opacity: 0, height: 0, scale: 0.98 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.98 }}
                onSubmit={handleSaveTask}
                className="p-4 bg-gradient-to-br from-purple-500/5 via-slate-50 to-indigo-500/5 dark:from-slate-850 dark:via-slate-900 dark:to-slate-850 rounded-2xl border border-purple-200/70 dark:border-purple-900/40 space-y-3 shadow-inner"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Wrench size={13} className="text-purple-600" />
                    <span>{editingTaskId ? (isAr ? 'تعديل المهمة / الملاحظة' : 'Edit Task') : (isAr ? 'تسجيل تذكير فني جديد مرتبط بالصيانة' : 'New Quick Note')}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Task Title Input */}
                <div>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder={isAr ? 'اكتب نص المهمة أو التذكير الفني السريع...' : 'Enter task or reminder note...'}
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:text-white transition-all shadow-2xs"
                  />
                </div>

                {/* Form Controls Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                  {/* Link with Maintenance Order */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <FileText size={11} className="text-purple-500" />
                      <span>{isAr ? 'ربط بأمر صيانة قيد التنفيذ:' : 'Link to Work Order:'}</span>
                    </label>
                    <select
                      value={taskOrderId}
                      onChange={(e) => setTaskOrderId(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-bold dark:text-slate-200 outline-none"
                    >
                      <option value="">{isAr ? '— تذكير عام (غير مقيد بأمر) —' : '— General / No Order —'}</option>
                      {allOrders.map(order => {
                        const v = vehicles.find(veh => veh.id === order.vehicleId);
                        const vStr = v ? ` - ${v.name}` : '';
                        const ordNum = order.orderNumber || `#${order.id}`;
                        return (
                          <option key={order.id} value={order.id}>
                            {ordNum} {vStr} ({order.description.slice(0, 25)}...)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Technician assignment */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <User size={11} className="text-purple-500" />
                      <span>{isAr ? 'الفني المعني:' : 'Technician:'}</span>
                    </label>
                    <select
                      value={taskTechId}
                      onChange={(e) => setTaskTechId(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-bold dark:text-slate-200 outline-none"
                    >
                      <option value="">{isAr ? '— عام لكافة الفنيين —' : '— All Techs —'}</option>
                      {technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name} ({tech.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Tag size={11} className="text-purple-500" />
                      <span>{isAr ? 'تصنيف المهمة:' : 'Category:'}</span>
                    </label>
                    <select
                      value={taskCategory}
                      onChange={(e) => setTaskCategory(e.target.value as any)}
                      className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-bold dark:text-slate-200 outline-none"
                    >
                      {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                        <option key={key} value={key}>
                          {isAr ? val.labelAr : val.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority & Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <AlertCircle size={11} className="text-purple-500" />
                      <span>{isAr ? 'درجة الأولوية:' : 'Priority:'}</span>
                    </label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                      className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-black dark:text-slate-200 outline-none"
                    >
                      {Object.entries(PRIORITY_MAP).map(([key, val]) => (
                        <option key={key} value={key}>
                          {isAr ? val.labelAr : val.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Optional Detailed Notes */}
                <div>
                  <textarea
                    rows={2}
                    placeholder={isAr ? 'ملاحظات إضافية، أرقام قطع الغيار، قياسات أو تنبيهات للفاحص (اختياري)...' : 'Optional notes or torque values...'}
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none focus:border-purple-500 dark:text-white"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black cursor-pointer transition-all"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>{editingTaskId ? (isAr ? 'تحديث المهمة' : 'Update Task') : (isAr ? 'حفظ التذكير' : 'Save Task')}</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-slate-50/80 dark:bg-slate-850/60 border border-slate-150/70 dark:border-slate-800">
            {/* Status Tabs */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {isAr ? `الكل (${totalCount})` : `All (${totalCount})`}
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('pending')}
                className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                  activeFilter === 'pending'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {isAr ? `قيد التنفيذ (${pendingCount})` : `Pending (${pendingCount})`}
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('completed')}
                className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                  activeFilter === 'completed'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {isAr ? `المكتملة (${completedCount})` : `Completed (${completedCount})`}
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('with_order')}
                className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                  activeFilter === 'with_order'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {isAr ? 'مرتبطة بأوامر صيانة' : 'With Work Order'}
              </button>
            </div>

            {/* Technician Filter Dropdown */}
            {!inDrawerMode && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400">{isAr ? 'الفني:' : 'Tech:'}</span>
                <select
                  value={selectedTechFilter}
                  onChange={(e) => setSelectedTechFilter(e.target.value)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black dark:text-slate-200 outline-none"
                >
                  <option value="all">{isAr ? 'جميع الفنيين' : 'All Technicians'}</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Tasks List */}
          <div className="space-y-2.5">
            <AnimatePresence>
              {filteredTasks.map(task => {
                const catConf = CATEGORY_MAP[task.category] || CATEGORY_MAP.reminder;
                const prioConf = PRIORITY_MAP[task.priority] || PRIORITY_MAP.normal;

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      task.completed
                        ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                        : task.priority === 'urgent'
                        ? 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/40 hover:border-rose-400'
                        : 'bg-white dark:bg-slate-850/60 border-slate-200/70 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 shadow-2xs'
                    }`}
                  >
                    {/* Left/Right Action & Title Details */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Checkbox Trigger */}
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className={`p-1 mt-0.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                          task.completed 
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' 
                            : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                        }`}
                        title={task.completed ? 'إلغاء التحديد' : 'تحديد كمكتمل'}
                      >
                        {task.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>

                      {/* Content block */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-black leading-snug ${
                            task.completed 
                              ? 'line-through text-slate-400 dark:text-slate-500' 
                              : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {task.title}
                          </span>

                          {/* Category Badge */}
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${catConf.bg} ${catConf.color}`}>
                            {isAr ? catConf.labelAr : catConf.labelEn}
                          </span>

                          {/* Priority Badge */}
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${prioConf.badge}`}>
                            {isAr ? prioConf.labelAr : prioConf.labelEn}
                          </span>
                        </div>

                        {/* Order & Vehicle linkage info */}
                        {(task.orderNumber || task.vehicleName || task.technicianName) && (
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 font-bold flex-wrap pt-0.5">
                            {task.orderNumber && (
                              <span className="flex items-center gap-1 font-mono text-purple-600 dark:text-purple-400 font-extrabold bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.25 rounded">
                                <FileText size={10} />
                                <span>أمر عمل: {task.orderNumber}</span>
                              </span>
                            )}

                            {task.vehicleName && (
                              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 truncate">
                                <Truck size={10} className="text-slate-400" />
                                <span>{task.vehicleName}</span>
                              </span>
                            )}

                            {task.technicianName && (
                              <span className="flex items-center gap-1 text-slate-500 truncate">
                                <User size={10} className="text-slate-400" />
                                <span>{task.technicianName}</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Notes details */}
                        {task.notes && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-150/60 dark:border-slate-800/60 mt-1">
                            {task.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Task Actions (Edit, Delete, Timestamp) */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {task.completedAt ? (
                        <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          <span>{isAr ? 'تم الإنجاز' : 'Completed'}</span>
                        </span>
                      ) : task.dueDate ? (
                        <span className="text-[9.5px] font-mono text-slate-400 flex items-center gap-1">
                          <Calendar size={10} />
                          <span>{task.dueDate}</span>
                        </span>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleStartEdit(task)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg transition-colors cursor-pointer"
                        title="تعديل المهمة"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                        title="حذف المهمة"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredTasks.length === 0 && (
              <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-850/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <CheckSquare size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2 opacity-50" />
                <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                  {isAr ? 'لا توجد مهام أو ملاحظات تطابق التصفية الحالية' : 'No tasks match current filter'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isAr ? 'يمكنك إضافة مهمة سريعة أو تذكير فني باستخدام الزر بالأعلى.' : 'Click Add Quick Note to record reminders.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
