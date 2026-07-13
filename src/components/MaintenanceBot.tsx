import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../services/LanguageContext';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Wrench, 
  Search, 
  Package, 
  Trash2, 
  FileText, 
  MessageSquare, 
  Loader2, 
  HelpCircle,
  ArrowRightLeft,
  ChevronRight,
  ShieldAlert,
  Compass,
  Hammer,
  Layers,
  Info,
  X,
  Paperclip,
  Mic,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  vehicles as defaultVehicles, 
  maintenanceOrders as defaultOrders, 
  inventory as defaultInventory, 
  technicians as defaultTechnicians 
} from '../data';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

interface MaintenanceBotProps {
  isFloating?: boolean;
  onClose?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export default function MaintenanceBot({ 
  isFloating = false, 
  onClose,
  isMaximized = false,
  onToggleMaximize
}: MaintenanceBotProps) {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested preset questions styled with distinct subtle theme colors
  const arabicSuggestions = [
    { 
      text: 'ما هي حالة صيانة شاحنة مرسيدس أكتروس؟', 
      label: 'متابعة شاحنة أكتروس',
      desc: 'الاستعلام الفوري عن حالة أوامر العمل المفتوحة والمهندس المسؤول.',
      icon: <Wrench size={16} />, 
      color: 'from-blue-500/10 to-indigo-500/5 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/40' 
    },
    { 
      text: 'هل يتوفر فلتر زيت هايلوكس بالمخزن وما هي كميته؟', 
      label: 'تفقد مستودع الفلاتر',
      desc: 'التحقق من أرصدة قطع الغيار وتنبيه الهبوط تحت حد الضمان.',
      icon: <Package size={16} />, 
      color: 'from-amber-500/10 to-amber-600/5 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/40' 
    },
    { 
      text: 'ابحث عن قطع الغيار المتاحة للفرامل', 
      label: 'منظومة الفرامل والأسطوانات',
      desc: 'البحث الشامل والمطابقة عن وسادات الفرامل والأقراص بالمخزون.',
      icon: <Search size={16} />, 
      color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/40' 
    },
    { 
      text: 'أعطني ملخصاً لكل طلبات الصيانة المعلقة والمكتملة بالورشة', 
      label: 'تقرير أوامر العمل القائمة',
      desc: 'جرد إحصائي فوري للتذاكر المعلقة وتكلفتها وحالتها الفنية.',
      icon: <FileText size={16} />, 
      color: 'from-violet-500/10 to-violet-600/5 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-900/40' 
    },
    { 
      text: 'هل لدينا فنيين متاحين لصيانة الأنظمة الهيدروليكية؟', 
      label: 'تتبع كفاءة الفنيين',
      desc: 'استدعاء الفنيين المتاحين حالياً وتخصصاتهم وحجم الأعباء.',
      icon: <ArrowRightLeft size={16} />, 
      color: 'from-rose-500/10 to-rose-600/5 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/40' 
    }
  ];

  const englishSuggestions = [
    { 
      text: 'What is the maintenance status of Actros Truck?', 
      label: 'Track Actros Repairs',
      desc: 'Check live open work orders and assigned mechanic.',
      icon: <Wrench size={16} />, 
      color: 'from-blue-500/10 to-indigo-500/5 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/40' 
    },
    { 
      text: 'Is Hilux Oil Filter available in inventory? What capacity?', 
      label: 'Check Oil Filters Stock',
      desc: 'Verify exact shelf quantities and minimum safety limits.',
      icon: <Package size={16} />, 
      color: 'from-amber-500/10 to-amber-600/5 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/40' 
    },
    { 
      text: 'Search for available brakes spare parts', 
      label: 'Brakes & Rotary Discs',
      desc: 'Instant lookup of pads, cylinders and hardware values.',
      icon: <Search size={16} />, 
      color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/40' 
    },
    { 
      text: 'Give me a summary of all pending and completed work orders', 
      label: 'Work orders summary',
      desc: 'Retrieve statistical table of waiting vs done requests.',
      icon: <FileText size={16} />, 
      color: 'from-violet-500/10 to-violet-600/5 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-900/40' 
    },
    { 
      text: 'Do we have available technicians for hydraulic systems?', 
      label: 'Technician load tracker',
      desc: 'List active staff certifications and current work queue.',
      icon: <ArrowRightLeft size={16} />, 
      color: 'from-rose-500/10 to-rose-600/5 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/40' 
    }
  ];

  const suggestions = language === 'ar' ? arabicSuggestions : englishSuggestions;

  // Initialize with a welcome message from the robot
  useEffect(() => {
    const welcomeText = language === 'ar' 
      ? 'مرحباً بك في **مساعد ميكانيك الذكي**! 🤖🔧\n\nأنا هنا لخدمتك فوراً باستخدام بيانات الأسطول والمستودعات الحية. يمكنك سؤالي بشكل تفاعلي عن:\n- **مستوى المخزون الفعلي** وأي قطع تفوق حد الأمان.\n- **حالة الورش** والسيارات المدخلة للصيانة وتواريخ تسليمها.\n- **أداء الفنيين المتاحين** وجداول المهام المسندة إليهم.\n\nتفضل بالضغط على أي من **البطاقات الاسترشادية التفاعلية** أدناه للبدء الفوري، أو اكتب استفسارك الخاص بالأسفل!'
      : 'Hello & Welcome to **Mechanic Smart Assistant**! 🤖🔧\n\nI am directly connected to your active live workshop lists, inventories, and technicians. You can query me on:\n- **Exact spare part levels** and any item falling below the safety line.\n- **Work orders status**, repairs pending, and expected delivery times.\n- **Technicians workload** constraints and engineering availability.\n\nClick on any of the **interactive cards** below to run instant checks, or write down your custom dispatch!';

    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: welcomeText,
        timestamp: new Date()
      }
    ]);
  }, [language]);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load live data from localStorage
  const getLiveData = () => {
    try {
      const vehicles = JSON.parse(localStorage.getItem('fleet_vehicles_v2') || 'null') || defaultVehicles;
      const orders = JSON.parse(localStorage.getItem('fleet_maintenance_orders_v2') || 'null') || defaultOrders;
      const inventory = JSON.parse(localStorage.getItem('fleet_inventory_v2') || 'null') || defaultInventory;
      const technicians = JSON.parse(localStorage.getItem('fleet_technicians_v2') || 'null') || defaultTechnicians;
      return { vehicles, orders, inventory, technicians };
    } catch (e) {
      return { 
        vehicles: defaultVehicles, 
        orders: defaultOrders, 
        inventory: defaultInventory, 
        technicians: defaultTechnicians 
      };
    }
  };

  // Safe manual markdown parser supporting bold, lists, and status pill transformation
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      
      // Check for bullet points starting with - or *
      const isBullet = line.trim().startsWith('-') || line.trim().startsWith('*');
      if (isBullet) {
        content = line.replace(/^[-*]\s*/, '');
      }

      // Check if line contains a standard key-value statement of key metrics
      const isKeyValue = content.includes(':') && !content.startsWith('http');
      
      // Handle bold texts like **bold** and highlight them beautifully
      const parts = content.split('**');
      const formatted = parts.map((part, pIdx) => {
        if (pIdx % 2 === 1) {
          // Detect statuses or IDs to give them beautiful custom badge rendering
          const trimmedPart = part.trim();
          
          if (trimmedPart.includes('قيد الانتظار') || trimmedPart.includes('Pending') || trimmedPart.includes('⏳')) {
            return (
              <span key={pIdx} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 mx-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                {trimmedPart}
              </span>
            );
          }
          if (trimmedPart.includes('تحت العمل') || trimmedPart.includes('In Progress') || trimmedPart.includes('🔧') || trimmedPart.includes('🔵')) {
            return (
              <span key={pIdx} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/30 mx-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                {trimmedPart}
              </span>
            );
          }
          if (trimmedPart.includes('مكتمل') || trimmedPart.includes('Completed') || trimmedPart.includes('🟢') || trimmedPart.includes('نجاح')) {
            return (
              <span key={pIdx} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/30 mx-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {trimmedPart}
              </span>
            );
          }
          if (trimmedPart.startsWith('WO-') || trimmedPart.match(/^[A-Z0-0_#-]+$/)) {
            // It looks like a code, tag, serial, or a part number
            return (
              <code key={pIdx} className="px-1.5 py-0.5 rounded-md font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-slate-205 dark:border-slate-700 mx-1 font-semibold">
                {trimmedPart}
              </code>
            );
          }

          return (
            <strong key={pIdx} className="font-extrabold text-slate-900 dark:text-slate-100 underline decoration-violet-500/30 decoration-2">
              {trimmedPart}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className={`flex items-start gap-2.5 text-[12px] leading-relaxed mb-1 py-1 px-2.5 rounded-xl border border-dotted border-slate-100 dark:border-slate-850/45 bg-slate-50/40 dark:bg-[#111625]/30 ${isRtl ? 'pr-3' : 'pl-3'}`}>
            <span className="text-violet-500 select-none mt-1.5 shrink-0 text-xs">⚡</span>
            <span className="flex-1 text-slate-700 dark:text-slate-300 font-medium">{formatted}</span>
          </div>
        );
      }

      if (isKeyValue) {
        // Render pretty lines with split layout
        return (
          <div key={idx} className="p-2 my-1 bg-white/70 dark:bg-[#0c101d]/60 rounded-xl border border-slate-100 dark:border-slate-850 text-[12px] text-slate-750 dark:text-slate-300 transition-colors hover:border-violet-500/20">
            {formatted}
          </div>
        );
      }

      return (
        <p key={idx} className="text-[12.5px] leading-relaxed mb-2 text-slate-750 dark:text-slate-300">
          {formatted}
        </p>
      );
    });
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    if (!customText) {
      setInputText('');
    }

    const newUserMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Gather live telemetry data
      const liveData = getLiveData();

      // Sanitize arrays to prevent PayloadTooLargeError from rich/nested/image elements
      const sanitizedVehicles = (liveData.vehicles || []).map((v: any) => ({
        id: v.id,
        name: v.name,
        type: v.type,
        plateNumber: v.plateNumber,
        status: v.status,
        chassisNumber: v.chassisNumber || '',
        modelYear: v.modelYear || '',
        fuelType: v.fuelType || '',
        lastMaintenance: v.lastMaintenance || ''
      }));

      const sanitizedOrders = (liveData.orders || []).map((o: any) => ({
        id: o.id,
        vehicleId: o.vehicleId,
        orderNumber: o.orderNumber,
        date: o.date,
        description: o.description,
        category: o.category,
        status: o.status,
        technicianId: o.technicianId,
        priority: o.priority,
        cost: o.cost,
        partsUsed: o.partsUsed || []
      }));

      const sanitizedInventory = (liveData.inventory || []).map((i: any) => ({
        id: i.id,
        name: i.name,
        partNumber: i.partNumber,
        quantity: i.quantity,
        minQuantity: i.minQuantity,
        price: i.price,
        location: i.location || '',
        vehicleTypeCompatibility: i.vehicleTypeCompatibility || '',
        status: i.status || ''
      }));

      const sanitizedTechnicians = (liveData.technicians || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        specialty: t.specialty,
        phone: t.phone,
        status: t.status || '',
        activeTasks: t.activeTasks || 0
      }));

      // Communication payload with clean models
      const payload = {
        messages: [...messages, newUserMessage]
          .filter(m => !m.id.startsWith('welcome'))
          .map(m => ({
            role: m.role,
            text: m.text
          })),
        vehicles: sanitizedVehicles,
        orders: sanitizedOrders,
        inventory: sanitizedInventory,
        technicians: sanitizedTechnicians,
        language
      };

      const res = await fetch('/api/ai/maintenance-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('API server returned error state.');
      }

      const data = await res.json();

      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-reply`,
        role: 'model',
        text: data.text,
        timestamp: new Date()
      }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-err`,
        role: 'model',
        text: language === 'ar' 
          ? '⚠️ نأسف، واجهت مشكلة فنية بالترابط المباشر مع منفذ الذكاء الاصطناعي. يرجى مراجعة إعدادات قاعدة البيانات أو إعادة المحاولة.'
          : '⚠️ Pardon me, I encountered a communication error with the centralized AI system. Check your backend parameters and try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    const welcomeText = language === 'ar' 
      ? 'أهلاً بك في **مساعد ميكانيك الذكي**! 🤖🔧\n\nتم إعادة ضبط سجل الأسئلة بطلب من المستخدم. تفضل باختيار بطاقة أو اكتب سؤالاً.'
      : 'Conversation history reset upon user request. Click any card below or write down!';
    
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        text: welcomeText,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div 
      dir={dir}
      className={`flex flex-col w-full max-w-full mx-auto overflow-hidden font-sans ${
        isFloating 
          ? 'h-full bg-transparent border-0 shadow-none' 
          : 'h-[calc(100vh-100px)] md:h-[calc(100vh-140px)] rounded-none md:rounded-3xl bg-white dark:bg-[#0c101d] border-0 md:border border-slate-200/80 dark:border-slate-850 shadow-none md:shadow-md'
      }`}
    >
      
      {/* Slim Header */}
      <div className="py-2.5 px-4 bg-slate-900 dark:bg-[#0d1324] text-white flex items-center justify-between border-b border-slate-800 dark:border-slate-850 relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-violet-600/20 rounded-xl border border-violet-500/20 text-violet-400">
            <Bot size={16} className="animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-black tracking-tight select-none">
              {language === 'ar' ? 'مساعد الصيانة الذكي' : 'Smart Maintenance Assistant'}
            </h3>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleClearHistory}
            title={language === 'ar' ? 'تصفير المحادثة' : 'Reset Conversation'}
            className="p-1.5 rounded-lg hover:bg-slate-850 dark:hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border-0"
          >
            <Trash2 size={14} />
          </button>
          {isFloating && onToggleMaximize && (
            <button
              type="button"
              onClick={onToggleMaximize}
              title={isMaximized ? (language === 'ar' ? 'تصغير' : 'Minimize') : (language === 'ar' ? 'تكبير ملء الصفحة' : 'Maximize')}
              className="p-1.5 rounded-lg hover:bg-slate-850 dark:hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border-0"
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
          {isFloating && onClose && (
            <button
              type="button"
              onClick={onClose}
              title={language === 'ar' ? 'إغلاق المساعد' : 'Close Assistant'}
              className="p-1.5 rounded-lg hover:bg-slate-850 dark:hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border-0"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Split Interface Area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-slate-50 dark:bg-[#070a13]/40">
        
        {/* Left Side: Dynamic Information Board & Suggestion Panel (Hidden on mobile, flex on desktop) */}
        <div className="hidden md:flex w-full md:w-80 border-e border-slate-200 dark:border-slate-850 p-5 space-y-4 shrink-0 bg-white dark:bg-[#0a0d18] flex-col overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-start">
              <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                <Compass size={15} />
              </div>
              <h4 className="text-[12px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                {language === 'ar' ? 'لوحة المقترحات الذكية' : 'Suggested Queries'}
              </h4>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed text-start">
              {language === 'ar' 
                ? 'اضغط على أي بطاقة لإرسال السؤال ومطابقة قواعد البيانات فوراً:' 
                : 'Interactive queries to instantly parse stock columns:'}
            </p>
          </div>

          {/* Interactive Bento Suggestion Cards */}
          <div className="space-y-3">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(sug.text)}
                disabled={isLoading}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-[#0e1424] dark:to-[#0c101d] hover:to-violet-50/10 dark:hover:to-violet-950/5 border border-slate-200 dark:border-slate-800/80 hover:border-violet-400/40 dark:hover:border-violet-800/40 cursor-pointer transition-all hover:shadow-sm active:scale-[0.985] flex flex-col gap-2 relative overflow-hidden group items-start text-start"
              >
                {/* Decorative glow overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-2 w-full">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${sug.color} shrink-0`}>
                    {sug.icon}
                  </div>
                  <span className="text-[11.5px] font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {sug.label}
                  </span>
                </div>
                
                <p className="text-[10.5px] text-slate-400 dark:text-slate-500 leading-normal font-medium text-start">
                  {sug.desc}
                </p>

                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800/70 text-slate-400 dark:text-slate-500 flex items-center justify-center transition-all group-hover:bg-violet-600 group-hover:text-white mt-1 self-end rtl:rotate-180">
                  <ChevronRight size={13} />
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 bg-gradient-to-r from-violet-600/5 to-indigo-600/5 dark:from-violet-950/20 dark:to-indigo-950/20 rounded-2xl border border-violet-500/10 space-y-2">
            <span className="text-[10.5px] font-extrabold text-violet-600 dark:text-violet-400 flex items-center gap-1">
              <Info size={13} />
              <span>{language === 'ar' ? 'تحديث حي وتزامن مستمر' : 'Synchronous System'}</span>
            </span>
            <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 text-start">
              {language === 'ar' 
                ? 'أي تعديل على مستويات المخزن، فواتير القطع، أو تعيينات فنيي الورشة في الأبواب الأخرى يُحدّث ذاكرة المساعد تلقائياً.' 
                : 'Any updates about workshop parts usage or mechanic status instantly hydrate the assistant memory bounds.'}
            </p>
          </div>
        </div>

        {/* Right Side: Enhanced Chat Flow Space */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#070b14]">
          
          {/* Scrollable Chat Area with distinct bubble designs */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 scroll-smooth bg-slate-50/55 dark:bg-[#080c16]/30">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isModel = msg.role === 'model';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-3.5 max-w-[85%] ${
                      isModel 
                        ? (isRtl ? 'flex-row-reverse mr-0 ml-auto' : 'flex-row ml-0 mr-auto')
                        : (isRtl ? 'flex-row ml-0 mr-auto' : 'flex-row-reverse mr-0 ml-auto')
                    }`}
                  >
                    {/* Character Avatar with badge */}
                    {isModel ? (
                      <div className="relative shrink-0 select-none">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-550 to-indigo-600 text-white flex items-center justify-center border border-violet-500/20 shadow-md">
                          <Bot size={18} className="text-white animate-pulse" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#070b14] shadow" />
                      </div>
                    ) : (
                      <div className="shrink-0 select-none">
                        <div className="w-10 h-10 rounded-2xl bg-slate-205 dark:bg-slate-800 text-slate-655 dark:text-slate-350 flex items-center justify-center border border-slate-300 dark:border-slate-700 font-extrabold text-[11px] uppercase tracking-wide">
                          USER
                        </div>
                      </div>
                    )}

                    {/* Speech Bubble Container */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      
                      {/* Name tag indicator */}
                      <span className={`text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block px-1.5 ${
                        isRtl ? 'text-right' : 'text-left'
                      }`}>
                        {isModel 
                          ? (language === 'ar' ? 'مساعد ميكانيك الذكي 🤖' : 'Mechanic Smart Assistant 🤖') 
                          : (language === 'ar' ? 'أنت (المسؤول الفني)' : 'You (Fleet Manager)')}
                      </span>

                      {/* Bubble Text Card */}
                      <div className={`p-4 md:p-5 rounded-3xl text-xs md:text-sm font-semibold leading-relaxed shadow-sm border ${
                        isModel 
                          ? 'bg-white dark:bg-[#111625] text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 rounded-tl-none' 
                          : 'bg-violet-600 text-white border-transparent rounded-tr-none text-right font-semibold'
                      }`}>
                        <div className="whitespace-pre-wrap leading-relaxed select-text font-medium">
                          {msg.text}
                        </div>
                      </div>

                      {/* Message bottom info (timestamp) */}
                      <span className={`text-[9px] text-slate-400 dark:text-slate-500 block px-1.5 ${
                        isModel ? (isRtl ? 'text-right' : 'text-left') : (isRtl ? 'text-left' : 'text-right')
                      }`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3.5 max-w-[85%] ${isRtl ? 'flex-row-reverse mr-0 ml-auto' : 'flex-row ml-0 mr-auto'}`}
              >
                <div className="w-10 h-10 rounded-2xl bg-violet-600/10 text-violet-500 flex items-center justify-center shrink-0 border border-violet-500/10">
                  <Bot size={18} />
                </div>
                <div className="p-4 bg-white dark:bg-[#121829] rounded-3xl rounded-tl-sm border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 flex items-center gap-3 text-[11px] shadow-sm font-semibold">
                  <Loader2 size={13} className="animate-spin text-violet-500 shrink-0" />
                  <span>{language === 'ar' ? 'جاري جرد مخزن القطع وحالات الورش الفيدرالية...' : 'Parsing live tables & consulting Gemini...'}</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* User Text Input Area */}
          <div className="p-4 md:p-5 bg-white dark:bg-[#0c101d] border-t border-slate-200/80 dark:border-slate-850 flex flex-col gap-3.5 relative z-10 shadow-lg">
            
            {/* Horizontal scrollable chips shown ONLY on mobile (hidden on md and above) */}
            <div className="md:hidden flex overflow-x-auto gap-2 pb-1 scrollbar-none select-none justify-start" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(sug.text)}
                  disabled={isLoading}
                  className="text-[10px] whitespace-nowrap font-black text-violet-750 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 border border-violet-150/40 dark:border-violet-900/30 px-3.5 py-1.5 rounded-full shrink-0 cursor-pointer active:scale-95 transition-all"
                >
                  {sug.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              {/* Paperclip button */}
              <button
                type="button"
                title={language === 'ar' ? 'إرفاق ملف' : 'Attach file'}
                className="p-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all shrink-0 cursor-pointer"
              >
                <Paperclip size={16} />
              </button>

              {/* Mic button */}
              <button
                type="button"
                title={language === 'ar' ? 'رسالة صوتية' : 'Voice message'}
                className="p-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all shrink-0 cursor-pointer"
              >
                <Mic size={16} />
              </button>

              {/* Main input container with logical properties */}
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                  placeholder={
                    language === 'ar' 
                      ? 'اكتب استفساراً (مثال: هل يتوفر وسادات فرامل أكتروس؟)...' 
                      : 'Query inventory or fleet (e.g. status of Hilux)...'
                  }
                  className="w-full py-3.5 ps-11 pe-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 hover:bg-slate-100/30 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-150 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all font-sans text-start"
                />
                <div className="absolute select-none pointer-events-none text-slate-350 dark:text-slate-550 ps-4 start-0">
                  <MessageSquare size={16} />
                </div>
              </div>

              {/* Send button with RTL arrow rotation */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputText.trim()}
                className="p-3.5 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 text-white rounded-2xl transition-all cursor-pointer hover:scale-[1.03] shrink-0 active:scale-[0.97] flex items-center justify-center border border-violet-500/10 shadow-md"
              >
                <Send size={16} className="rtl:rotate-180" />
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
