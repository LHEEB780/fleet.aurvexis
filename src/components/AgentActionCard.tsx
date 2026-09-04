import React, { useState } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  Truck, 
  Wrench, 
  DollarSign, 
  ShieldAlert, 
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { 
  findActionDef, 
  executeAgentAction, 
  ExecutedActionReceipt 
} from '../services/agentActionExecutor';

interface AgentActionCardProps {
  actionType: string;
  params: Record<string, any>;
  agentId: string;
  agentNameAr: string;
  agentNameEn: string;
  initialReceipt?: ExecutedActionReceipt;
  onExecuted?: (receipt: ExecutedActionReceipt) => void;
  onOpenModal?: (actionType: string, params: Record<string, any>) => void;
}

export default function AgentActionCard({
  actionType,
  params,
  agentId,
  agentNameAr,
  agentNameEn,
  initialReceipt,
  onExecuted,
  onOpenModal
}: AgentActionCardProps) {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const actionDef = findActionDef(actionType);
  const [receipt, setReceipt] = useState<ExecutedActionReceipt | null>(initialReceipt || null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const res = executeAgentAction(actionType, params, agentId);
      setIsExecuting(false);
      setReceipt(res);
      if (onExecuted) onExecuted(res);
    }, 500);
  };

  const getAgentColorStyle = () => {
    switch (agentId) {
      case 'project-manager':
        return {
          border: 'border-violet-300/80 dark:border-violet-700/60',
          bg: 'bg-violet-50/60 dark:bg-violet-950/20',
          btn: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/20',
          pill: 'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300'
        };
      case 'mechanic':
        return {
          border: 'border-amber-300/80 dark:border-amber-700/60',
          bg: 'bg-amber-50/60 dark:bg-amber-950/20',
          btn: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/20',
          pill: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
        };
      case 'safety':
        return {
          border: 'border-emerald-300/80 dark:border-emerald-700/60',
          bg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
          btn: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20',
          pill: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
        };
      case 'supply-chain':
        return {
          border: 'border-sky-300/80 dark:border-sky-700/60',
          bg: 'bg-sky-50/60 dark:bg-sky-950/20',
          btn: 'bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white shadow-sky-500/20',
          pill: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300'
        };
      case 'predictive':
        return {
          border: 'border-rose-300/80 dark:border-rose-700/60',
          bg: 'bg-rose-50/60 dark:bg-rose-950/20',
          btn: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-rose-500/20',
          pill: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
        };
      case 'finance':
        return {
          border: 'border-teal-300/80 dark:border-teal-700/60',
          bg: 'bg-teal-50/60 dark:bg-teal-950/20',
          btn: 'bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 text-white shadow-teal-500/20',
          pill: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300'
        };
      default:
        return {
          border: 'border-blue-300 dark:border-blue-700',
          bg: 'bg-blue-50 dark:bg-blue-950/20',
          btn: 'bg-blue-600 hover:bg-blue-500 text-white',
          pill: 'bg-blue-100 text-blue-800'
        };
    }
  };

  const style = getAgentColorStyle();
  const title = actionDef ? (language === 'ar' ? actionDef.titleAr : actionDef.titleEn) : actionType;
  const isExecuted = Boolean(receipt && receipt.status === 'completed');

  return (
    <div className={`mt-3.5 mb-1 rounded-2xl border ${style.border} ${style.bg} p-4 shadow-sm transition-all duration-200 text-slate-800 dark:text-slate-100 ${isRtl ? 'text-right' : 'text-left'}`}>
      
      {/* Top Badge and Status */}
      <div className={`flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-800/60 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${style.pill}`}>
            {isExecuted 
              ? (language === 'ar' ? '✓ تم التنفيذ بالنظام' : '✓ Executed in System')
              : (language === 'ar' ? '⚡ إجراء تنفيذي مقترح' : '⚡ Proposed Action')}
          </span>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {language === 'ar' ? agentNameAr : agentNameEn}
          </span>
        </div>

        {isExecuted && (
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300/60 flex items-center gap-1">
            <CheckCircle2 size={11} />
            <span>{language === 'ar' ? 'معتمد ومحفوظ' : 'Persisted'}</span>
          </span>
        )}
      </div>

      {/* Main Action Title */}
      <div className="py-2.5">
        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>{title}</span>
        </h4>
        {actionDef && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {language === 'ar' ? actionDef.descAr : actionDef.descEn}
          </p>
        )}
      </div>

      {/* Parameters Preview Key-Value Grid */}
      <div className="grid grid-cols-2 gap-2 my-2 bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs">
        {Object.entries(params).slice(0, 4).map(([k, v]) => (
          <div key={k} className="overflow-hidden">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold truncate">
              {k}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
              {String(v)}
            </span>
          </div>
        ))}
      </div>

      {/* If Executed: show summary receipt */}
      {isExecuted && receipt && (
        <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-semibold my-2">
          {language === 'ar' ? receipt.summaryAr : receipt.summaryEn}
        </div>
      )}

      {/* Action Buttons */}
      <div className={`mt-3 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
        {!isExecuted ? (
          <>
            <button
              type="button"
              onClick={handleExecute}
              disabled={isExecuting}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 ${style.btn} disabled:opacity-50`}
            >
              {isExecuting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{language === 'ar' ? 'جاري التنفيذ والتسجيل...' : 'Executing...'}</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>{language === 'ar' ? 'تأكيد وتنفيذ الإجراء في النظام الآن' : 'Execute Action in System Now'}</span>
                </>
              )}
            </button>

            {onOpenModal && (
              <button
                type="button"
                onClick={() => onOpenModal(actionType, params)}
                className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
                title={language === 'ar' ? 'تعديل البيانات قبل التنفيذ' : 'Edit parameters'}
              >
                {language === 'ar' ? 'تعديل' : 'Edit'}
              </button>
            )}
          </>
        ) : (
          <div className="w-full flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
            <span>{language === 'ar' ? 'رقم الإجراء:' : 'Action ID:'} <strong className="text-slate-700 dark:text-slate-300">{receipt?.id}</strong></span>
            <span>{receipt?.timestamp ? new Date(receipt.timestamp).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US') : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}
