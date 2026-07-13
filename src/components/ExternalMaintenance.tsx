import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Building2, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  Plus, 
  Calendar, 
  Eye, 
  Info,
  ExternalLink,
  BookOpen,
  Scale,
  Upload,
  Image,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, MaintenanceOrder, Vendor } from '../types';

interface ExternalMaintenanceProps {
  user: User;
}

export default function ExternalMaintenance({ user }: ExternalMaintenanceProps) {
  // States for data
  const [orders, setOrders] = useState<MaintenanceOrder[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  
  // Quick Guide active index
  const [guideExpanded, setGuideExpanded] = useState(true);
  const [activeGuideStep, setActiveGuideStep] = useState<number | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [invoiceFilter, setInvoiceFilter] = useState<string>('all');
  const [workshopFilter, setWorkshopFilter] = useState<string>('all');

  // Selected Order for quick invoice edit
  const [editingOrder, setEditingOrder] = useState<MaintenanceOrder | null>(null);
  const [viewingInvoiceImages, setViewingInvoiceImages] = useState<string[] | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [invoiceForm, setInvoiceForm] = useState({
    externalInvoiceNo: '',
    cost: '',
    externalInvoiceStatus: 'pending_invoice' as 'pending_invoice' | 'received_unpaid' | 'paid',
    externalInvoiceImages: [] as string[]
  });

  // User notifications / feedback
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load data from LocalStorage
  const loadSystemData = () => {
    // 1. Load Maintenance Orders
    const savedOrders = localStorage.getItem('fleet_maintenance_orders_v2');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error('Error loading orders', e);
      }
    }

    // 2. Load Workshops (specifically external ones)
    const savedWorkshops = localStorage.getItem('fleet_workshops');
    if (savedWorkshops) {
      try {
        const parsedWorkshops = JSON.parse(savedWorkshops);
        // External workshops have isExternal = true or are synced from vendors of type external_workshop / both
        setWorkshops(parsedWorkshops.filter((ws: any) => ws.isExternal));
      } catch (e) {
        console.error('Error loading workshops', e);
      }
    }

    // 3. Load Vehicles for plate/name matching
    const savedVehicles = localStorage.getItem('fleet_vehicles_v2');
    if (savedVehicles) {
      try {
        setVehicles(JSON.parse(savedVehicles));
      } catch (e) {
        console.error('Error loading vehicles', e);
      }
    }
  };

  useEffect(() => {
    loadSystemData();
    // Listen for storage changes to sync instantly
    const handleStorageChange = () => loadSystemData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const triggerFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Utility to compress base64 images using HTML Canvas to prevent QuotaExceededError in localStorage
  const compressImage = (base64Str: string, maxWidth = 550, maxHeight = 550): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions to maintain aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress as JPEG with 0.45 quality (which balances clarity with huge size reduction)
          resolve(canvas.toDataURL('image/jpeg', 0.45));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  // Handle saving the invoice updates
  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const updatedOrders = orders.map(o => {
      if (o.id === editingOrder.id) {
        return {
          ...o,
          externalInvoiceNo: invoiceForm.externalInvoiceNo.trim() || undefined,
          cost: invoiceForm.cost ? parseFloat(invoiceForm.cost) : undefined,
          externalInvoiceStatus: invoiceForm.externalInvoiceStatus,
          // Save multiple images and single fallback image
          externalInvoiceImages: invoiceForm.externalInvoiceImages.length > 0 ? invoiceForm.externalInvoiceImages : undefined,
          externalInvoiceImage: invoiceForm.externalInvoiceImages[0] || undefined,
          lastUpdate: new Date().toISOString().split('T')[0]
        };
      }
      return o;
    });

    try {
      localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
      setEditingOrder(null);
      triggerFeedback('تم تحديث الفاتورة والتسوية المالية بنجاح للطلب رقم ' + editingOrder.orderNumber);
      
      // Dispatch custom event to notify other components (e.g., Dashboard or Maintenance)
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Storage error:', error);
      triggerFeedback('خطأ: لم يتم الحفظ بسبب تجاوز المساحة المتاحة للذاكرة المحلية. يرجى تقليل عدد أو حجم الصور المرفقة.', 'error');
    }
  };

  const startEditingInvoice = (order: MaintenanceOrder) => {
    setEditingOrder(order);
    
    // Support both single and multiple image history
    let images: string[] = [];
    if (order.externalInvoiceImages && order.externalInvoiceImages.length > 0) {
      images = [...order.externalInvoiceImages];
    } else if (order.externalInvoiceImage) {
      images = [order.externalInvoiceImage];
    }

    setInvoiceForm({
      externalInvoiceNo: order.externalInvoiceNo || '',
      cost: order.cost ? order.cost.toString() : '',
      externalInvoiceStatus: order.externalInvoiceStatus || 'pending_invoice',
      externalInvoiceImages: images
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    let loadedCount = 0;
    const newImages: string[] = [];

    fileList.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === 'string') {
          try {
            // Compress image to ensure fits well inside 5MB quota (using updated 550x550 size)
            const compressed = await compressImage(reader.result, 550, 550);
            newImages.push(compressed);
          } catch (err) {
            newImages.push(reader.result);
          }
        }
        loadedCount++;
        if (loadedCount === fileList.length) {
          setInvoiceForm(prev => {
            const combined = [...prev.externalInvoiceImages, ...newImages];
            if (combined.length > 6) {
              triggerFeedback('تنبيه: تم الاحتفاظ بأول 6 صور فقط كحد أقصى للحفاظ على مساحة التخزين المحلية.', 'error');
              return {
                ...prev,
                externalInvoiceImages: combined.slice(0, 6)
              };
            }
            return {
              ...prev,
              externalInvoiceImages: combined
            };
          });
        }
      };
      reader.readAsDataURL(file as Blob);
    });
  };

  // Calculations
  const externalOrders = orders.filter(o => {
    // Is linked to an external workshop?
    return workshops.some(ws => ws.id === o.workshopId);
  });

  // Metrics
  const activeExternalOrders = externalOrders.filter(o => o.status !== 'completed').length;
  const completedExternalOrders = externalOrders.filter(o => o.status === 'completed').length;
  
  const totalFinancials = externalOrders.reduce((sum, o) => sum + (o.cost || 0), 0);
  const paidFinancials = externalOrders
    .filter(o => o.externalInvoiceStatus === 'paid')
    .reduce((sum, o) => sum + (o.cost || 0), 0);
  const unpaidFinancials = externalOrders
    .filter(o => o.externalInvoiceStatus === 'received_unpaid')
    .reduce((sum, o) => sum + (o.cost || 0), 0);
  const pendingInvoicesCount = externalOrders.filter(o => !o.externalInvoiceStatus || o.externalInvoiceStatus === 'pending_invoice').length;

  // Filter and search orders
  const filteredOrders = externalOrders.filter(o => {
    const vehicle = vehicles.find(v => v.id === o.vehicleId);
    const workshop = workshops.find(w => w.id === o.workshopId);
    
    const searchString = `${o.orderNumber} ${o.description} ${vehicle?.name || ''} ${vehicle?.plateNumber || ''} ${workshop?.name || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true : o.status === statusFilter;
    const matchesInvoice = invoiceFilter === 'all' 
      ? true 
      : (o.externalInvoiceStatus || 'pending_invoice') === invoiceFilter;
    const matchesWorkshop = workshopFilter === 'all' ? true : o.workshopId === workshopFilter;

    return matchesSearch && matchesStatus && matchesInvoice && matchesWorkshop;
  });

  // Business flow guide steps
  const guideSteps = [
    {
      title: '١. ربط جهة صيانة ومورّد معتمد',
      icon: '⚙️',
      desc: 'عند إضافة جهة خارجية من صفحة "الموردين" وتصنيف نوعها كـ "ورشة صيانة خارجية" أو "كلاهما"، يقوم النظام تلقائياً بتصدير ومزامنة هذا الكيان في جدول الورش والمسارات الفنية المعتمدة للأسطول كورشة تعاقدية مستقلة.',
    },
    {
      title: '٢. توجيه وإرسال مركبة أو آلية',
      icon: '🚚',
      desc: 'عند فتح كرت صيانة جديد أو معالجة عطل طارئ، اختر الورشة المعنية بالعمل لتكون الورشة الخارجية المحددة. سيقوم النظام فوراً بنقل حالة المركبة إلى "تحت الصيانة الخارجية" وتوثيق الضغط الفني الخارجي.',
    },
    {
      title: '٣. الفوترة ومراجعة التكاليف الفعلية',
      icon: '📋',
      desc: 'فور انتهاء الورشة الخارجية من أعمال الإصلاح وتزويدكم بالفاتورة، يتم تسجيل رقم الفاتورة والملغ المالي الحقيقي هنا. يمكن تتبع حالات الفواتير كـ (معلقة / مستلمة وغير مسددة / مسددة بالكامل) لإغلاق القيود المالية للتشغيل.',
    }
  ];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-4 right-4 md:left-auto md:w-96 z-50 p-4 rounded-xl shadow-xl flex items-center justify-between border ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500/20 text-emerald-800 dark:text-emerald-300' 
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-500/20 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{feedback.type === 'success' ? '✅' : '⚠️'}</span>
              <span className="text-xs font-bold">{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Guide Panel at top */}
      <div className="bg-gradient-to-br from-purple-500/10 via-brand-blue-500/5 to-transparent border border-purple-500/20 rounded-2xl p-5 shadow-xs relative overflow-hidden">
        {/* Abstract background graphics */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-blue-500/5 rounded-full blur-3xl translate-x-12 translate-y-12"></div>

        <div className="flex items-center justify-between relative z-10 border-b border-purple-500/10 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 animate-pulse">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-[14px] font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>الدليل الاسترشادي السريع للصيانة الخارجية</span>
                <span className="text-[8.5px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-black tracking-widest animate-pulse">
                  تعاقد خارجي
                </span>
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                كيف يعمل نظام الصيانة الخارجية والربط المالي مع الموردين ومراكز الخدمة المتعاقد معها؟
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setGuideExpanded(!guideExpanded)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all border border-slate-200/50 dark:border-slate-800"
            title={guideExpanded ? "إخفاء الدليل" : "إظهار الدليل"}
          >
            {guideExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <AnimatePresence>
          {guideExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden relative z-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {guideSteps.map((step, index) => {
                  const isActive = activeGuideStep === index;
                  return (
                    <div 
                      key={index}
                      onMouseEnter={() => setActiveGuideStep(index)}
                      onMouseLeave={() => setActiveGuideStep(null)}
                      className={`p-4 rounded-xl border transition-all duration-300 relative group cursor-pointer ${
                        isActive 
                          ? 'bg-white dark:bg-slate-900 border-purple-500/45 shadow-md -translate-y-1'
                          : 'bg-slate-500/5 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{step.icon}</span>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                        {step.desc}
                      </p>
                      
                      {/* Step bottom indicator decorator */}
                      <div className={`absolute bottom-0 inset-x-0 h-1 transition-all duration-300 rounded-b-xl ${
                        isActive ? 'bg-purple-600' : 'bg-transparent'
                      }`} />
                    </div>
                  );
                })}
              </div>

              {/* Tips Banner */}
              <div className="mt-4 p-3 bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/40 rounded-xl flex items-start gap-2">
                <Info size={14} className="text-purple-600 shrink-0 mt-0.5" />
                <div className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                  <span className="text-purple-600 dark:text-purple-400 font-black">نصيحة التشغيل:</span> يمكنك دائماً تعديل أو تسوية الفواتير من الجدول بالأسفل. إذا رغبت بإضافة مركز صيانة خارجي جديد، توجه إلى 
                  <span className="text-purple-600 dark:text-purple-400 font-black mx-1">إدارة الموردين</span> وقم بإضافته وتحديد التصنيف كورشة صيانة خارجية، وسيظهر هنا تلقائياً دون أي خطوات إضافية.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Strategic Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Workshops Count */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center justify-between shadow-xs relative overflow-hidden group hover:border-purple-500/25 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">مراكز الخدمة الخارجية المعتمدة</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white block">{workshops.length}</span>
            <span className="text-[8px] text-purple-600 dark:text-purple-400 font-bold block">شركاء صيانة تعاقدية متاحين</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Building2 size={18} />
          </div>
        </div>

        {/* Metric 2: Active External Orders */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center justify-between shadow-xs relative overflow-hidden group hover:border-brand-blue-500/25 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">أوامر الصيانة النشطة بالخارج</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white block">{activeExternalOrders}</span>
            <span className="text-[8px] text-amber-500 font-bold block">قيد التنفيذ والمتابعة الفنية</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Clock size={18} />
          </div>
        </div>

        {/* Metric 3: Total Commitments */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center justify-between shadow-xs relative overflow-hidden group hover:border-emerald-500/25 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">إجمالي الالتزامات المالية</span>
            <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 block">
              {totalFinancials.toLocaleString()} <span className="text-[10px]">ر.س</span>
            </span>
            <span className="text-[8px] text-slate-450 dark:text-slate-500 font-bold block">
              المسدد منها: {paidFinancials.toLocaleString()} ر.س
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <DollarSign size={18} />
          </div>
        </div>

        {/* Metric 4: Invoice Status Alerts */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center justify-between shadow-xs relative overflow-hidden group hover:border-rose-500/25 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">الفواتير المعلقة والذمم</span>
            <span className="text-xl font-black font-mono text-rose-500 block">
              {unpaidFinancials.toLocaleString()} <span className="text-[10px]">ر.س</span>
            </span>
            <span className="text-[8px] text-rose-500 font-bold block">
              {pendingInvoicesCount} عمليات صيانة بانتظار الفاتورة
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <AlertTriangle size={18} />
          </div>
        </div>
      </div>

      {/* Main Content: Workshops + Active Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Right side / 2 cols on wide: Financial Work Orders Grid */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>📂</span>
                  <span>أوامر ومطالبات الصيانة الخارجية</span>
                </h3>
                <p className="text-[9.5px] text-slate-500 font-bold mt-0.5">
                  تتبع الحالات الفنية، مبالغ التسويات، وأرقام الفواتير ومصادقة سدادها.
                </p>
              </div>

              {/* Status & Search controls */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="رقم الطلب، الآلية، الورشة..."
                    className="w-44 p-1.5 pr-7 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] rounded-lg font-bold outline-none text-slate-900 dark:text-white focus:border-purple-500/50"
                  />
                  <Search size={10} className="absolute right-2.5 top-2.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Sub-Filters line */}
            <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50/50 dark:bg-slate-950/30 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850">
              {/* Order Status */}
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-bold">الحالة الفنية:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] rounded-lg font-bold outline-none text-slate-900 dark:text-white"
                >
                  <option value="all">الكل (الحالات الفنية)</option>
                  <option value="pending">⏳ بانتظار بدء العمل</option>
                  <option value="in-progress">⚙️ قيد الصيانة بالخارج</option>
                  <option value="completed">✅ مكتملة وجاهزة</option>
                </select>
              </div>

              {/* Invoice Status */}
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-bold">حالة الفاتورة والمالية:</label>
                <select
                  value={invoiceFilter}
                  onChange={(e) => setInvoiceFilter(e.target.value)}
                  className="w-full p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] rounded-lg font-bold outline-none text-slate-900 dark:text-white"
                >
                  <option value="all">الكل (الحالة المالية)</option>
                  <option value="pending_invoice">⏳ بانتظار الفاتورة</option>
                  <option value="received_unpaid">💵 مستلمة - غير مسددة</option>
                  <option value="paid">✅ تم السداد المالي</option>
                </select>
              </div>

              {/* Workshop filter */}
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-bold">مركز الخدمة:</label>
                <select
                  value={workshopFilter}
                  onChange={(e) => setWorkshopFilter(e.target.value)}
                  className="w-full p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] rounded-lg font-bold outline-none text-slate-900 dark:text-white"
                >
                  <option value="all">جميع الورش الخارجية</option>
                  {workshops.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Orders List Container */}
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center bg-slate-500/5 rounded-xl border border-dashed border-slate-200 dark:border-slate-850">
                <span className="text-xl block mb-2">🔍</span>
                <span className="text-[10.5px] font-bold text-slate-450 dark:text-slate-500">لا توجد سجلات صيانة خارجية مطابقة للفلاتر النشطة</span>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const veh = vehicles.find(v => v.id === order.vehicleId);
                  const wsObj = workshops.find(w => w.id === order.workshopId);

                  // Colors for statuses
                  const statusColors = {
                    pending: 'bg-amber-500/15 text-amber-600 border-amber-500/20',
                    'in-progress': 'bg-blue-500/15 text-blue-600 border-blue-500/20',
                    completed: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20'
                  };

                  const invoiceColors = {
                    pending_invoice: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                    received_unpaid: 'bg-rose-500/15 text-rose-500 border-rose-500/20',
                    paid: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20'
                  };

                  const invoiceLabels = {
                    pending_invoice: '⏳ بانتظار الفاتورة',
                    received_unpaid: '💵 مستلمة - لم تسدد',
                    paid: '✅ تم السداد'
                  };

                  return (
                    <div 
                      key={order.id} 
                      className={`p-3.5 rounded-xl border transition-all hover:bg-slate-50 dark:hover:bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        editingOrder?.id === order.id 
                          ? 'border-purple-500/50 bg-purple-500/5 dark:bg-purple-950/20' 
                          : 'border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-900/50'
                      }`}
                    >
                      {/* Right column: Order Info */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {order.orderNumber}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold font-mono">
                            {order.date}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black border uppercase tracking-wider ${statusColors[order.status]}`}>
                            {order.status === 'completed' ? 'صيانة منتهية' : order.status === 'in-progress' ? 'تحت الصيانة بالخارج' : 'بانتظار البدء'}
                          </span>
                        </div>

                        {/* Repair / Vehicle */}
                        <div className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                          {order.description}
                        </div>

                        {/* Details row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-bold text-slate-450 dark:text-slate-500">
                          <span className="flex items-center gap-0.5">
                            🚚 الآلية: <span className="text-slate-700 dark:text-slate-300 font-black">{veh?.name || 'غير معروفة'} ({veh?.plateNumber || 'لوحة مفقودة'})</span>
                          </span>
                          <span className="flex items-center gap-0.5">
                            🔮 مركز الخدمة: <span className="text-purple-600 dark:text-purple-400 font-black">{wsObj?.name || 'ورشة خارجية'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Middle: Financial Status Badge / Values */}
                      <div className="flex items-center gap-2 border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100 dark:border-slate-800">
                        {/* Financial info */}
                        <div className="text-left space-y-1 pl-3 border-l border-slate-100 dark:border-slate-800">
                          <span className="text-[8.5px] text-slate-400 font-bold block">التكلفة الفعلية والمطالبة:</span>
                          <span className="text-xs font-black font-mono text-slate-800 dark:text-slate-200 block">
                            {order.cost ? `${order.cost.toLocaleString()} ر.س` : 'غير محددة'}
                          </span>
                          {order.externalInvoiceNo && (
                            <span className="text-[8px] font-mono text-purple-600 dark:text-purple-400 font-black block">
                              فاتورة: {order.externalInvoiceNo}
                            </span>
                          )}
                        </div>

                        {/* Settlement status badge */}
                        <div className="text-left space-y-1">
                          <span className="text-[8.5px] text-slate-400 font-bold block">التسوية المالية:</span>
                          <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-black border block text-center ${invoiceColors[order.externalInvoiceStatus || 'pending_invoice']}`}>
                            {invoiceLabels[order.externalInvoiceStatus || 'pending_invoice']}
                          </span>
                        </div>
                      </div>

                      {/* Left: Quick Actions */}
                      <div className="flex items-center justify-end gap-1.5 shrink-0">
                        {((order.externalInvoiceImages && order.externalInvoiceImages.length > 0) || order.externalInvoiceImage) ? (
                          <button
                            onClick={() => {
                              const imgs = order.externalInvoiceImages && order.externalInvoiceImages.length > 0
                                ? order.externalInvoiceImages
                                : [order.externalInvoiceImage!];
                              setViewingInvoiceImages(imgs);
                              setActiveImageIndex(0);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-purple-600 hover:text-purple-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer gap-1"
                            title="عرض مستند الفاتورة المرفق"
                          >
                            <Image size={14} />
                            {order.externalInvoiceImages && order.externalInvoiceImages.length > 1 && (
                              <span className="text-[9px] font-mono font-bold bg-purple-100 dark:bg-purple-950 px-1 rounded">
                                {order.externalInvoiceImages.length}
                              </span>
                            )}
                          </button>
                        ) : null}
                        <button 
                          onClick={() => startEditingInvoice(order)}
                          className="px-2.5 py-1.5 text-[10px] font-black rounded-lg bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 text-white hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 shrink-0"
                          title="تحديث بيانات التسوية والفوترة لهذه الصيانة"
                        >
                          <span>🧾</span>
                          <span>تسوية الفاتورة</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Left side: External Workshops Overview & Quick Info */}
        <div className="space-y-6">
          
          {/* External Workshops Contacts Directory */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl p-5 shadow-xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>🏢</span>
                  <span>دليل مراكز الصيانة الخارجية</span>
                </h3>
                <p className="text-[9px] text-slate-500 font-bold mt-0.5">
                  الجهات التعاقدية المرتبطة والمعتمدة لتسلم مركبات الأسطول.
                </p>
              </div>
              <span className="text-[9.5px] bg-purple-500/10 text-purple-600 font-black px-2 py-0.5 rounded-full">
                {workshops.length} ورش
              </span>
            </div>

            {workshops.length === 0 ? (
              <div className="p-6 text-center bg-slate-500/5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <span className="text-lg block mb-1">💼</span>
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500">لا توجد ورش خارجية معتمدة بالدليل حالياً</span>
              </div>
            ) : (
              <div className="space-y-3">
                {workshops.map((wsObj) => {
                  // Count of vehicles currently sitting in this workshop
                  const sittingOrdersCount = orders.filter(o => o.workshopId === wsObj.id && o.status !== 'completed').length;
                  
                  return (
                    <div 
                      key={wsObj.id}
                      className="p-3 bg-slate-500/5 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-xl space-y-2 hover:border-purple-500/20 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-black text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {wsObj.name}
                        </span>
                        
                        <span className="text-[8.5px] font-black px-2 py-0.5 bg-purple-500/15 border border-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full">
                          {sittingOrdersCount > 0 ? `🚗 تحت الصيانة: ${sittingOrdersCount}` : 'متاح للتوجيه'}
                        </span>
                      </div>

                      {/* Specialist and Location */}
                      <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-450 dark:text-slate-500 border-t border-b border-slate-100 dark:border-slate-800/40 py-1.5">
                        <span className="truncate" title={wsObj.location}>📍 {wsObj.location || 'موقع غير محدد'}</span>
                        <span className="truncate">👤 {wsObj.supervisor || 'مدير المركز'}</span>
                      </div>

                      {/* Contact details */}
                      <div className="flex items-center justify-between text-[8.5px] text-slate-400 font-mono">
                        <span>📞 {wsObj.phone || '055-xxx-xxxx'}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={7} 
                              className={`${i < (wsObj.reliability || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-800'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick SLA Settlement Overview Panel */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/0 to-transparent border border-emerald-500/25 rounded-2xl p-5 shadow-xs text-right space-y-3">
            <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 border-b border-emerald-500/10 pb-2.5">
              <span>🛡️</span>
              <span>حوكمة الصيانة الخارجية والـ SLA</span>
            </h3>
            
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
              يساعد نظام الصيانة الخارجية على التزام الجهات الخارجية بشروط العقد والـ SLA (اتفاقية مستوى الخدمة).
            </p>

            <ul className="space-y-1.5 text-[9.5px] text-slate-500 dark:text-slate-400 font-bold">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500">✔️</span>
                <span>مطابقة مبالغ المطالبات مع حدود الصيانة المسموحة لكل آلية.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500">✔️</span>
                <span>تحديث كروت الصيانة بانتظام يمنع التضخم المالي وتكرار المطالبات.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500">✔️</span>
                <span>توفير الشفافية المالية الكاملة لمراجعة التدقيق الداخلي وإغلاق قيود التشغيل.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* MODAL: Inline Invoicing and settlement Update */}
      <AnimatePresence>
        {editingOrder && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-hidden text-right"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧾</span>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white">
                      تسوية كرت صيانة خارجي وفاتورته
                    </h3>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                      رقم الطلب: {editingOrder.orderNumber}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingOrder(null)} 
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:rotate-90 transition-all duration-200"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSaveInvoice} className="space-y-4">
                
                {/* Order Summary details */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-150 dark:border-slate-850/60 text-[9.5px] text-slate-500 dark:text-slate-400 font-bold space-y-1">
                  <div>🔧 العمل المطلوب: <span className="text-slate-800 dark:text-slate-200 font-black">{editingOrder.description}</span></div>
                  <div>🚚 الآلية المعنية: <span className="text-slate-800 dark:text-slate-200 font-black">
                    {vehicles.find(v => v.id === editingOrder.vehicleId)?.name || 'غير معروفة'}
                  </span></div>
                  <div>🏢 ورشة العمل الخارجية: <span className="text-purple-600 dark:text-purple-400 font-black">
                    {workshops.find(w => w.id === editingOrder.workshopId)?.name || 'ورشة خارجية'}
                  </span></div>
                </div>

                {/* Input 1: External Invoice No */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black block">رقم الفاتورة الخارجية (المستند):</label>
                  <input
                    type="text"
                    value={invoiceForm.externalInvoiceNo}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, externalInvoiceNo: e.target.value })}
                    placeholder="مثال: INV-2026-08"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl font-mono text-left outline-none focus:border-purple-500/50 text-slate-900 dark:text-white"
                  />
                  <span className="text-[8.5px] text-slate-400 dark:text-slate-500 block">رقم الفاتورة الصادرة عن مركز الخدمة الخارجي</span>
                </div>

                {/* Input 2: Cost */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black block">التكلفة الفعلية النهائية (ر.س):</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.cost}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, cost: e.target.value })}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl font-mono text-left outline-none focus:border-purple-500/50 text-slate-900 dark:text-white"
                  />
                  <span className="text-[8.5px] text-slate-400 dark:text-slate-500 block">المبلغ الإجمالي الفعلي للفاتورة بالريال السعودي</span>
                </div>

                {/* Input 3: Invoice Status Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black block">حالة السداد والفوترة:</label>
                  <select
                    value={invoiceForm.externalInvoiceStatus}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, externalInvoiceStatus: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl font-bold cursor-pointer outline-none focus:border-purple-500/50 text-slate-900 dark:text-white"
                  >
                    <option value="pending_invoice">⏳ بانتظار إصدار الفاتورة من المركز الخارجي</option>
                    <option value="received_unpaid">💵 تم استلام الفاتورة - بانتظار السداد المالي</option>
                    <option value="paid">✅ تم السداد المالي بالكامل وإغلاق القيد</option>
                  </select>
                </div>

                {/* Input 4: Upload Invoice Image / Photo */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black block">صور الفاتورة / المستندات المرفقة:</label>
                  
                  {/* List of current images if any */}
                  {invoiceForm.externalInvoiceImages && invoiceForm.externalInvoiceImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                      {invoiceForm.externalInvoiceImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative group rounded-lg border border-slate-200 dark:border-slate-800 p-1.5 bg-white dark:bg-slate-900 flex items-center gap-2">
                          <img 
                            src={imgUrl} 
                            alt={`Invoice Preview ${idx + 1}`} 
                            className="w-9 h-9 rounded-md object-cover border border-slate-150 dark:border-slate-800 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              setViewingInvoiceImages(invoiceForm.externalInvoiceImages);
                              setActiveImageIndex(idx);
                            }}
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0 text-[9px] text-slate-500 font-black truncate">
                            <span>مستند {idx + 1}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setInvoiceForm(prev => ({
                                ...prev,
                                externalInvoiceImages: prev.externalInvoiceImages.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer shrink-0"
                            title="حذف المرفق"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button - ALWAYS available for adding more */}
                  <div className="relative border-2 border-dashed border-slate-250 dark:border-slate-800 rounded-xl p-3 text-center hover:border-purple-500/40 transition-colors bg-slate-50/50 dark:bg-slate-950/20 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload size={16} className="mx-auto text-slate-400 mb-1" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 block">
                      {invoiceForm.externalInvoiceImages && invoiceForm.externalInvoiceImages.length > 0 
                        ? "اضغط أو اسحب لإضافة المزيد من الصور" 
                        : "اضغط أو اسحب لرفع صور الفواتير"}
                    </span>
                    <span className="text-[8.5px] text-slate-400 block mt-0.5">يمكنك تحديد عدة صور معاً (PNG, JPG, JPEG)</span>
                  </div>
                </div>

                {/* Form buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    className="flex-1 p-2.5 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 text-white rounded-xl text-xs font-black hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    حفظ وإغلاق التسوية
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-4 p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX / MULTI-IMAGE VIEW MODAL */}
      <AnimatePresence>
        {viewingInvoiceImages && viewingInvoiceImages.length > 0 && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-fade-in" dir="rtl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-3xl w-full max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-right"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Image size={14} className="text-purple-500" />
                  <span>عرض مستند الفاتورة المرفق ({activeImageIndex + 1} من {viewingInvoiceImages.length})</span>
                </span>
                <button 
                  onClick={() => setViewingInvoiceImages(null)} 
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:rotate-90 transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Slide content with navigation */}
              <div className="flex-1 relative overflow-auto flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-xl p-2 min-h-[350px]">
                {viewingInvoiceImages.length > 1 && (
                  <>
                    {/* Previous Button (Right in RTL layout) */}
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex(prev => (prev === 0 ? viewingInvoiceImages.length - 1 : prev - 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all hover:scale-105 cursor-pointer z-10"
                      title="الصورة السابقة"
                    >
                      <span className="text-sm font-bold">▶</span>
                    </button>

                    {/* Next Button (Left in RTL layout) */}
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex(prev => (prev === viewingInvoiceImages.length - 1 ? 0 : prev + 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all hover:scale-105 cursor-pointer z-10"
                      title="الصورة التالية"
                    >
                      <span className="text-sm font-bold">◀</span>
                    </button>
                  </>
                )}

                <img 
                  src={viewingInvoiceImages[activeImageIndex]} 
                  alt={`Invoice Document ${activeImageIndex + 1}`} 
                  className="max-w-full max-h-[55vh] object-contain rounded-lg shadow-md"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Thumbnails strip */}
              {viewingInvoiceImages.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-3 overflow-x-auto py-1.5 border-t border-slate-50 dark:border-slate-850">
                  {viewingInvoiceImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        idx === activeImageIndex 
                          ? 'border-purple-600 scale-105 shadow-md' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-end mt-4 gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <a 
                  href={viewingInvoiceImages[activeImageIndex]} 
                  download={`invoice-document-${activeImageIndex + 1}.png`}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span>⬇️</span>
                  <span>تحميل الصورة الحالية</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewingInvoiceImages(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-750 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
