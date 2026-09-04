import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Trash2, 
  Sparkles, 
  Wrench, 
  ShieldCheck, 
  Boxes, 
  LineChart, 
  Landmark, 
  ArrowRight,
  ArrowLeft,
  FileCheck2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../services/LanguageContext';
import { 
  ExecutedActionReceipt, 
  getAgentActionsHistory 
} from '../services/agentActionExecutor';
import { safeLocalStorage } from '../services/safeStorage';

interface AgentActionsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterAgentId?: string;
}

export default function AgentActionsHistoryModal({
  isOpen,
  onClose,
  filterAgentId
}: AgentActionsHistoryModalProps) {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [selectedFilter, setSelectedFilter] = useState<string>(filterAgentId || 'all');
  const [historyList, setHistoryList] = useState<ExecutedActionReceipt[]>([]);

  const loadHistory = () => {
    const all = getAgentActionsHistory();
    setHistoryList(all);
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      if (filterAgentId) setSelectedFilter(filterAgentId);
    }
  }, [isOpen, filterAgentId]);

  if (!isOpen) return null;

  const filteredHistory = historyList.filter(item => {
    if (selectedFilter === 'all') return true;
    return item.agentId === selectedFilter;
  });

  const handleClearHistory = () => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من مسح سجل إجراءات الوكلاء؟' : 'Clear agent actions log?')) {
      safeLocalStorage.removeItem('fleet_agent_executed_actions_v1');
      setHistoryList([]);
    }
  };

  const renderAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'project-manager': return <Sparkles size={16} className="text-violet-500" />;
      case 'mechanic': return <Wrench size={16} className="text-amber-500" />;
      case 'safety': return <ShieldCheck size={16} className="text-emerald-500" />;
      case 'supply-chain': return <Boxes size={16} className="text-sky-500" />;
      case 'predictive': return <LineChart size={16} className="text-rose-500" />;
      case 'finance': return <Landmark size={16} className="text-teal-500" />;
      default: return <FileCheck2 size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileCheck2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {language === 'ar' ? 'سجل المهام والإجراءات المنفذة بواسطة الوكلاء' : 'Autonomous Agent Task Execution Log'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {language === 'ar' ? 'توثيق فعلي لجميع العمليات والمهام التي تم تطبيقها بالنظام' : 'Live audit log of all system changes performed by AI agents'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-3 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto bg-white dark:bg-slate-900/40 shrink-0">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', labelAr: 'الكل', labelEn: 'All' },
              { id: 'project-manager', labelAr: 'روبرت (العمليات)', labelEn: 'Robert (PM)' },
              { id: 'mechanic', labelAr: 'سالم (الصيانة)', labelEn: 'Salim (Maint)' },
              { id: 'safety', labelAr: 'أمان (السلامة)', labelEn: 'Aman (Safety)' },
              { id: 'supply-chain', labelAr: 'واصل (التوريد)', labelEn: 'Wasil (SCM)' },
              { id: 'predictive', labelAr: 'بصير (التنبؤ)', labelEn: 'Baseer (Pred)' },
              { id: 'finance', labelAr: 'راصد (المالية)', labelEn: 'Rased (Finance)' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`py-1.5 px-3 rounded-xl text-[11px] font-black transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === f.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {language === 'ar' ? f.labelAr : f.labelEn}
              </button>
            ))}
          </div>

          {historyList.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
              title={language === 'ar' ? 'تفريغ السجل' : 'Clear Log'}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3 scrollbar-thin">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileCheck2 size={36} className="mx-auto text-slate-300 dark:text-slate-700 stroke-[1.5]" />
              <p className="text-xs font-bold">
                {language === 'ar' ? 'لم يتم تنفيذ أي مهام في هذا التصنيف بعد.' : 'No actions executed under this category yet.'}
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                {language === 'ar' ? 'اطلب من أي وكيل تنفيذ مهمة في المحادثة أو اضغط على أزرار الإجراءات الفورية لتنفيذها بالنظام.' : 'Ask any agent in chat to perform a task or click on the Quick Action triggers.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className={`flex items-center justify-between gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                      {renderAgentIcon(item.agentId)}
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 block">
                        {language === 'ar' ? item.titleAr : item.titleEn}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {language === 'ar' ? item.agentNameAr : item.agentNameEn}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-300/60 flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    <span>{language === 'ar' ? 'منفذ ومحفوظ' : 'Executed'}</span>
                  </span>
                </div>

                <p className={`text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? item.summaryAr : item.summaryEn}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/60 text-[10px] text-slate-400 font-mono">
                  <span>ID: {item.id}</span>
                  <span>{new Date(item.timestamp).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500 font-bold">
          <span>{language === 'ar' ? `إجمالي العمليات: ${filteredHistory.length}` : `Total logged actions: ${filteredHistory.length}`}</span>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-black cursor-pointer hover:opacity-90 transition-opacity"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
