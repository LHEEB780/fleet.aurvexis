import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  AlertCircle, 
  Wrench, 
  Users, 
  Warehouse, 
  Truck, 
  MessageSquare, 
  Compass, 
  Cpu, 
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAIProjectManagerInsight, AIMessage } from '../services/aiService';
import { vehicles, maintenanceOrders, inventory, technicians } from '../data';
import { useLanguage } from '../services/LanguageContext';

interface AIManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIManager({ isOpen, onClose }: AIManagerProps) {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [messages, setMessages] = useState<AIMessage[]>([
    { 
      role: 'model', 
      text: language === 'ar'
        ? 'أهلاً بك بكامل طاقتك القيادية! 🤖💼 أنا "مدير المشروع الذكي (AI)" للتوجيه الإستراتيجي.\n\nلقد قمت بتحليل بيانات أسطولك الميكانيكي ومستودعات قطع الغيار وقوائم فنيي الورش حالياً.\nكيف يمكنني مساعدتك في توجيه التوزيع العملي وتجاوز التكدسات الفنية اليوم؟'
        : 'Welcome Commander! I am your AI Project Manager with full diagnostic synchronization.\n\nI have parsed all registered vehicles, technician workloads, inventory rows and pending repair steps.\nHow can I assist you in optimizing task assignments and streamlining queue clearance today?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMessage: AIMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input if we typed it
    if (!textToSend) {
      setInputValue('');
    }
    
    setIsLoading(true);

    try {
      const aiResponse = await getAIProjectManagerInsight([...messages, userMessage]);
      setMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: language === 'ar'
          ? '⚠️ عذراً، واجهت صعوبة في معالجة طلبك حالياً. يرجى التحقق من اتصال الإنترنت أو إعدادات السحابة.'
          : '⚠️ Pardon me, I had issue getting the response. Please check project settings.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      { 
        role: 'model', 
        text: language === 'ar'
          ? 'أهلاً بك مجدداً. تم تصفير سجل المخطط الإستراتيجي بالكامل. تفضل بطرح مشكلة أو انقر على المقترحات لتوفير الوقت.'
          : 'Welcome back. Strategy cache has been fully reset. Feel free to state a scenario or tap any bento cards.'
      }
    ]);
  };

  const arabicSuggestions = [
    {
      text: 'كيف يمكنني تحسين معالجة الأعطال وتفادي تراكم فواتير الصيانة اليوم؟',
      label: 'خطة تقليص التراكم',
      desc: 'صيانة الآلات وتوجيه الأعباء بطرق معتمدة للحد من التكدس بالورش.',
      icon: <Wrench size={15} className="text-violet-600 dark:text-violet-400" />,
      color: 'from-violet-500/10 to-indigo-500/5 text-violet-750 dark:text-violet-400 border-violet-100 dark:border-violet-950/60'
    },
    {
      text: 'أعطني خطة مقترحة لتوزيع الفنيين المناوبين اليوم لتسريع الصيانة الدورية.',
      label: 'إسناد الفنيين المقترح',
      desc: 'الارتقاء بالاستمرارية والتقليل الفوري لتعطل الشاحنات والمعدات.',
      icon: <Users size={15} className="text-emerald-600 dark:text-emerald-400" />,
      color: 'from-emerald-500/10 to-teal-500/5 text-emerald-750 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/60'
    },
    {
      text: 'ما هي توصياتك الاستباقية لتوفير ميزانية قطع الغيار استناداً للأرصدة المتوفرة حالياً؟',
      label: 'تحليل تكاليف قطع الغيار',
      desc: 'استهداف البنود الأكثر عبئاً ماليّاً وتفادي الهبوط دون رصيد الأمان.',
      icon: <Warehouse size={15} className="text-amber-600 dark:text-amber-400" />,
      color: 'from-amber-500/10 to-orange-500/5 text-amber-750 dark:text-amber-400 border-amber-100 dark:border-amber-950/60'
    },
    {
      text: 'كيف أتعامل مع قضايا تأخر السائقين في استلام وتسليم المركبات الفنية؟',
      label: 'تنظيم تسليم السائقين',
      desc: 'معايرة الأوقات عبر حوكمة التقارير الرقمية وبطاقات الخروج.',
      icon: <Truck size={15} className="text-blue-600 dark:text-blue-400" />,
      color: 'from-blue-500/10 to-sky-500/5 text-blue-750 dark:text-blue-400 border-blue-100 dark:border-blue-950/60'
    }
  ];

  const englishSuggestions = [
    {
      text: 'How can I optimize work orders to clear pending maintenance tickets?',
      label: 'Clear Repair Queue',
      desc: 'Tactical advice to resolve workflow bottlenecks inside bays.',
      icon: <Wrench size={15} className="text-violet-600 dark:text-violet-400" />,
      color: 'from-violet-500/10 to-indigo-500/5 text-violet-750 dark:text-violet-400 border-violet-100 dark:border-violet-950/60'
    },
    {
      text: 'Recommend a technician allocation plan for today to speed up periodic checks.',
      label: 'Mechanic Allocation Plan',
      desc: 'Maximizing workshop utility and keeping heavy trucks roadworthy.',
      icon: <Users size={15} className="text-emerald-600 dark:text-emerald-400" />,
      color: 'from-emerald-500/10 to-teal-500/5 text-emerald-750 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/60'
    },
    {
      text: 'What proactive budget recommendations can we implement based on stock logs?',
      label: 'Inventory Budget Strategy',
      desc: 'Minimize expenses and identify critical low-count spares on racks.',
      icon: <Warehouse size={15} className="text-amber-600 dark:text-amber-400" />,
      color: 'from-amber-500/10 to-orange-500/5 text-amber-750 dark:text-amber-400 border-amber-100 dark:border-amber-950/60'
    },
    {
      text: 'How can we structure real-time handovers to prevent driver delays?',
      label: 'Governance & Handovers',
      desc: 'Establish frictionless transition checkpoints using clear mobile receipts.',
      icon: <Truck size={15} className="text-blue-600 dark:text-blue-400" />,
      color: 'from-blue-500/10 to-sky-500/5 text-blue-750 dark:text-blue-400 border-blue-100 dark:border-blue-950/60'
    }
  ];

  const suggestions = language === 'ar' ? arabicSuggestions : englishSuggestions;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[90] flex items-center justify-center p-0 md:p-4 lg:p-6" dir={dir}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 30 }}
            className="w-full h-full md:max-w-6xl md:h-[90vh] md:rounded-[2.5rem] bg-white dark:bg-[#0c101d] border border-slate-200 dark:border-slate-850 shadow-2xl flex flex-col md:flex-row overflow-hidden font-sans relative"
          >
            
            {/* Split Column 1: Info Board & Interactive Presets (RTL right-aligned, LTR left-aligned) */}
            <div className={`w-full md:w-80 border-slate-150 dark:border-slate-850 p-6 flex flex-col shrink-0 bg-slate-50/50 dark:bg-[#090d18] overflow-y-auto ${
              isRtl ? 'md:order-last md:border-l' : 'md:border-r'
            }`}>
              
              {/* Header inside sidebar */}
              <div className="mb-6 space-y-1.5">
                <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  <div className="p-2 rounded-xl bg-violet-600 text-white shadow-md">
                    <LayoutDashboard size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      {language === 'ar' ? 'مؤشرات التخطيط الإستراتيجي' : 'Strategy Board Metrics'}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {language === 'ar' ? 'بيانات الأسطول والورش المحدثة لحظياً' : 'Real-time database sync metrics'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid of Micro Metrics Cards */}
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                <div className="p-3 bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xs flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                    {language === 'ar' ? 'المركبات بالأسطول' : 'Vehicles'}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-black text-slate-800 dark:text-white font-mono">{vehicles.length}</span>
                    <Truck size={12} className="text-blue-500 shrink-0" />
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xs flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                    {language === 'ar' ? 'أوامر الصيانة' : 'Repair Orders'}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-black text-slate-800 dark:text-white font-mono">{maintenanceOrders.length}</span>
                    <Wrench size={12} className="text-violet-500 shrink-0" />
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xs flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                    {language === 'ar' ? 'أصناف قطع الغيار' : 'Unique Parts'}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-black text-slate-800 dark:text-white font-mono">{inventory.length}</span>
                    <Warehouse size={12} className="text-amber-500 shrink-0" />
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-[#121829] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xs flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                    {language === 'ar' ? 'طاقم المهندسين' : 'Staff Mechanics'}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-black text-slate-800 dark:text-white font-mono">{technicians.length}</span>
                    <Users size={12} className="text-emerald-500 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Suggestions Subsection */}
              <div className="space-y-3 flex-1 flex flex-col min-h-0">
                <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  <Compass size={13} className="text-violet-600 dark:text-violet-400" />
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {language === 'ar' ? 'سيناريوهات مقترحة للتحليل' : 'Recommended Scenarios'}
                  </span>
                </div>
                
                <div className="space-y-2.5 overflow-y-auto flex-1 pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(sug.text)}
                      disabled={isLoading}
                      className={`w-full p-3.5 bg-white dark:bg-[#111625] hover:bg-slate-50 dark:hover:bg-[#131b30] rounded-2xl border border-slate-200/80 dark:border-slate-800 text-right cursor-pointer transition-all flex flex-col gap-1.5 group select-none ${
                        isRtl ? 'items-end text-right' : 'items-start text-left'
                      }`}
                    >
                      <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${sug.color} shrink-0`}>
                          {sug.icon}
                        </div>
                        <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {sug.label}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-slate-400 dark:text-slate-500 leading-normal font-medium">
                        {sug.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Split Column 2: Full-screen Chat Arena */}
            <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0c101d]">
              
              {/* Top Bar inside Chat Area */}
              <div className="p-5 px-6 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between bg-white dark:bg-[#0c101d] shrink-0">
                <div className={`flex items-center gap-3.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  <div className="w-11 h-11 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/10">
                    <Bot size={22} className="animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                        {language === 'ar' ? 'مدير المشروع وتدفق العينات (AI)' : 'AI Strategic Project Manager'}
                      </h3>
                      <Sparkles size={13} className="text-yellow-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {language === 'ar' ? 'مساعد التخطيط الميداني المتصل بقواعد البيانات الحية' : 'Full-stack contextual helper connected via Cloud SDK'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Clear logs button */}
                  <button
                    onClick={handleClearChat}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-500 dark:text-slate-400 transition-all cursor-pointer border border-transparent shadow-xs hover:scale-105 active:scale-95"
                    title={language === 'ar' ? 'مسح تدوينات المحادثة' : 'Clear Chat Timeline'}
                  >
                    <RefreshCw size={14} />
                  </button>
                  {/* Close Full Screen button */}
                  <button
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 transition-all cursor-pointer hover:scale-105 active:scale-[96%]"
                    title={language === 'ar' ? 'إغلاق المعاينة' : 'Close Console'}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Chat Timeline (Scrolling list of messages) */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40 dark:bg-[#070a13]/30"
              >
                {messages.map((msg, i) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div 
                      key={i} 
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}
                    >
                      <div className={`p-4 md:p-5 rounded-3xl text-xs md:text-sm leading-relaxed max-w-[85%] md:max-w-[75%] border shadow-xs ${
                        isUser 
                          ? 'bg-violet-600 text-white rounded-br-none border-transparent text-right font-black' 
                          : `bg-white dark:bg-[#111526] text-slate-800 dark:text-slate-200 rounded-bl-none border-slate-150 dark:border-slate-800 font-semibold ${
                              isRtl ? 'text-right' : 'text-left'
                            }`
                      }`}>
                        {/* Render simple newlines inside text */}
                        <div className="whitespace-pre-wrap leading-relaxed select-text">
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start w-full">
                    <div className="bg-white dark:bg-[#111526] p-4.5 rounded-3xl rounded-bl-none border border-slate-150 dark:border-slate-800 flex items-center gap-3 shadow-xs">
                      <div className="flex gap-1.5">
                        <motion.div 
                          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-2 h-2 bg-violet-500 rounded-full" 
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                          className="w-2 h-2 bg-violet-500 rounded-full" 
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                          className="w-2 h-2 bg-violet-500 rounded-full" 
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold select-none">
                        {language === 'ar' ? 'جاري تحليل قواعد البيانات وتحضير الرد...' : 'Computing fleet statistics insights...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input Controls */}
              <div className="p-4 md:p-6 bg-white dark:bg-[#0c101d] border-t border-slate-150 dark:border-slate-850 shrink-0">
                <div className={`p-1.5 bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center gap-2 ${
                  isRtl ? 'flex-row-reverse' : ''
                }`}>
                  <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={
                      language === 'ar' 
                        ? 'اسأل مدير المشروع (مثال: اقترح خطة لتحسين موازنة الصيانة اليوم)...' 
                        : 'Ask AI manager (e.g. Suggest a plan to balance repair times today)...'
                    }
                    className="flex-1 bg-transparent p-3 outline-none text-xs md:text-sm font-semibold dark:text-white"
                  />
                  
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputValue.trim()}
                    className="p-3 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <Send size={16} className={isRtl ? 'rotate-180' : ''} />
                  </button>
                </div>
              </div>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
