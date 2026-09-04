import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Send, 
  Wrench, 
  ShieldCheck, 
  Boxes, 
  LineChart, 
  Landmark, 
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../services/LanguageContext';
import { 
  AgentActionDef, 
  ExecutedActionReceipt, 
  executeAgentAction 
} from '../services/agentActionExecutor';
import { Vehicle, MaintenanceOrder, InventoryItem, Technician } from '../types';

interface AgentActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionDef: AgentActionDef | null;
  initialParams?: Record<string, any>;
  agentId: string;
  onActionExecuted: (receipt: ExecutedActionReceipt) => void;
  vehicles?: Vehicle[];
  orders?: MaintenanceOrder[];
  inventory?: InventoryItem[];
  technicians?: Technician[];
}

export default function AgentActionModal({
  isOpen,
  onClose,
  actionDef,
  initialParams = {},
  agentId,
  onActionExecuted,
  vehicles = [],
  orders = [],
  inventory = [],
  technicians = []
}: AgentActionModalProps) {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionReceipt, setExecutionReceipt] = useState<ExecutedActionReceipt | null>(null);

  // Sync initial params and default values when actionDef changes
  useEffect(() => {
    if (!actionDef) return;
    const initial: Record<string, any> = { ...initialParams };
    actionDef.fields.forEach(field => {
      if (initial[field.name] === undefined) {
        if (field.defaultValue !== undefined) {
          initial[field.name] = field.defaultValue;
        } else if (field.type === 'select') {
          if (field.name === 'vehicleId' && vehicles.length > 0) {
            initial[field.name] = vehicles[0].id;
          } else if (field.name === 'technicianId' && technicians.length > 0) {
            initial[field.name] = technicians[0].id;
          } else if (field.name === 'orderId' && orders.length > 0) {
            initial[field.name] = orders[0].id;
          } else if (field.name === 'partId' && inventory.length > 0) {
            initial[field.name] = inventory[0].id;
          } else if (field.options && field.options.length > 0) {
            initial[field.name] = field.options[0].value;
          }
        } else if (field.type === 'date') {
          initial[field.name] = new Date().toISOString().split('T')[0];
        }
      }
    });
    setFormData(initial);
    setExecutionReceipt(null);
  }, [actionDef, initialParams, vehicles, technicians, orders, inventory]);

  if (!isOpen || !actionDef) return null;

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const receipt = executeAgentAction(actionDef.actionType, formData, agentId);
      setIsExecuting(false);
      setExecutionReceipt(receipt);
      onActionExecuted(receipt);
    }, 600);
  };

  const renderActionIcon = () => {
    switch (agentId) {
      case 'project-manager': return <Sparkles size={20} className="text-violet-500" />;
      case 'mechanic': return <Wrench size={20} className="text-amber-500" />;
      case 'safety': return <ShieldCheck size={20} className="text-emerald-500" />;
      case 'supply-chain': return <Boxes size={20} className="text-sky-500" />;
      case 'predictive': return <LineChart size={20} className="text-rose-500" />;
      case 'finance': return <Landmark size={20} className="text-teal-500" />;
      default: return <Zap size={20} className="text-blue-500" />;
    }
  };

  const getAccentGradient = () => {
    switch (agentId) {
      case 'project-manager': return 'from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/25';
      case 'mechanic': return 'from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/25';
      case 'safety': return 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25';
      case 'supply-chain': return 'from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white shadow-sky-500/25';
      case 'predictive': return 'from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-rose-500/25';
      case 'finance': return 'from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 text-white shadow-teal-500/25';
      default: return 'from-blue-600 to-indigo-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-150 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <div className={`flex items-center gap-3.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs shrink-0">
              {renderActionIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {language === 'ar' ? actionDef.badgeAr : actionDef.badgeEn}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {language === 'ar' ? 'جاهز للتنفيذ المباشر' : 'Live System Action'}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                {language === 'ar' ? actionDef.titleAr : actionDef.titleEn}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {language === 'ar' ? actionDef.descAr : actionDef.descEn}
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4.5 scrollbar-thin">
          {executionReceipt ? (
            /* Success State */
            <div className="py-6 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={36} className="animate-bounce" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? 'تم تنفيذ المهمة بنجاح وتحديث النظام!' : 'Action Successfully Executed in System!'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-2 leading-relaxed font-semibold bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40">
                  {language === 'ar' ? executionReceipt.summaryAr : executionReceipt.summaryEn}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400 text-center">
                <span>{language === 'ar' ? 'رقم الإجراء المعتمد:' : 'Action ID:'} </span>
                <strong className="text-slate-800 dark:text-slate-200">{executionReceipt.id}</strong>
                <span className="mx-2">•</span>
                <span>{new Date(executionReceipt.timestamp).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
              </div>
            </div>
          ) : (
            /* Input Form */
            <div className="space-y-4">
              {actionDef.fields.map(field => {
                const isSelectedVehicle = field.name === 'vehicleId';
                const isSelectedTech = field.name === 'technicianId';
                const isSelectedOrder = field.name === 'orderId';
                const isSelectedPart = field.name === 'partId';

                return (
                  <div key={field.name} className="space-y-1.5">
                    <label className={`block text-xs font-black text-slate-700 dark:text-slate-200 ${isRtl ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? field.labelAr : field.labelEn}
                      {field.required && <span className="text-rose-500 mr-1 ml-1">*</span>}
                    </label>

                    {/* SELECT: VEHICLE */}
                    {isSelectedVehicle ? (
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.name} - [{v.plateNumber}] - ({v.status})
                          </option>
                        ))}
                      </select>
                    ) : isSelectedTech ? (
                      /* SELECT: TECHNICIAN */
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {technicians.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} - ({t.role || t.specialization})
                          </option>
                        ))}
                      </select>
                    ) : isSelectedOrder ? (
                      /* SELECT: WORK ORDER */
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {orders.map(o => (
                          <option key={o.id} value={o.id}>
                            {o.orderNumber || o.id} - ({o.description.slice(0, 35)}...)
                          </option>
                        ))}
                      </select>
                    ) : isSelectedPart ? (
                      /* SELECT: INVENTORY PART */
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {inventory.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name} [{item.partNumber}] - متوفر: ({item.quantity})
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'select' && field.options ? (
                      /* STANDARD SELECT */
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {field.options.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {language === 'ar' ? opt.labelAr : opt.labelEn}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      /* TEXTAREA */
                      <textarea
                        rows={3}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        placeholder={language === 'ar' ? field.placeholderAr : field.placeholderEn}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                      />
                    ) : (
                      /* TEXT / NUMBER / DATE */
                      <input
                        type={field.type}
                        value={formData[field.name] ?? ''}
                        onChange={(e) => handleFieldChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                        placeholder={language === 'ar' ? field.placeholderAr : field.placeholderEn}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 md:p-5 border-t border-slate-150 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
          {executionReceipt ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-black transition-all cursor-pointer shadow-md"
            >
              {language === 'ar' ? 'إغلاق ومتابعة المحادثة' : 'Close and Return to Chat'}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isExecuting}
                className="py-2.5 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleExecute}
                disabled={isExecuting}
                className={`py-3 px-6 rounded-2xl bg-gradient-to-r ${getAccentGradient()} text-xs font-black transition-all duration-200 cursor-pointer shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`}
              >
                {isExecuting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{language === 'ar' ? 'جاري تنفيذ المهمة وتحديث السجلات...' : 'Executing in system...'}</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    <span>{language === 'ar' ? 'تأكيد وتنفيذ الإجراء في النظام الآن' : 'Confirm & Execute Action Now'}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
