import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check, MessageSquare, Bot, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import CuteAstronautRobot from './CuteAstronautRobot';
import { AI_AGENTS_CONFIG, AIAgentDefinition } from './aiAgentsConfig';

interface AiAgentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAgentId: string;
  onSelectAgent: (agentId: string) => void;
  activeStatusMap: Record<string, boolean>;
  onToggleActive: (agentId: string) => void;
}

export default function AiAgentsModal({
  isOpen,
  onClose,
  selectedAgentId,
  onSelectAgent,
  activeStatusMap,
  onToggleActive
}: AiAgentsModalProps) {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0f1422] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden z-10"
          dir={dir}
        >
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#13192c]/80 backdrop-blur-xs">
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25 shrink-0">
                <Bot size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{language === 'ar' ? 'سجل وكلاء الذكاء الاصطناعي الـ 6' : 'The 6 Specialized AI Agents'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                    6 AGENTS
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {language === 'ar' 
                    ? 'تم تمييز كل وكيل بلون ظلي مريح للعين وتخصص هندسي وتشغيلي مستقل' 
                    : 'Each agent is distinguished with eye-friendly shadow colors and operational expertise'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
              title={language === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X size={18} />
            </button>
          </div>

          {/* Grid of 6 Agents */}
          <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_AGENTS_CONFIG.map((agent: AIAgentDefinition) => {
              const isSelected = selectedAgentId === agent.id;
              const isActive = activeStatusMap[agent.id] !== false;

              return (
                <div
                  key={agent.id}
                  onClick={() => {
                    onSelectAgent(agent.id);
                    onClose();
                  }}
                  className={`group relative rounded-2xl p-4.5 border transition-all duration-300 cursor-pointer flex flex-col justify-between select-none ${agent.shadowClass} ${
                    isSelected
                      ? `bg-slate-50 dark:bg-[#161d31] ${agent.borderClass} ring-2 ring-offset-1 ring-offset-white dark:ring-offset-[#0f1422]`
                      : 'bg-white dark:bg-[#121727] border-slate-200/80 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-[#151b2e]'
                  }`}
                  style={{
                    boxShadow: isSelected ? `0 12px 32px -4px ${agent.ambientGlowRgba}` : undefined
                  }}
                >
                  {/* Top row: Avatar + Role Badge + Active Switch */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      {/* Avatar with Ambient Glow */}
                      <div className="relative shrink-0">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300"
                          style={{
                            backgroundColor: agent.ambientGlowRgba,
                            borderColor: isSelected ? agent.buttonGradient : 'rgba(255,255,255,0.1)'
                          }}
                        >
                          <CuteAstronautRobot
                            size="md"
                            color={agent.color}
                            expression={agent.expression}
                            animate={isSelected}
                            showAmbientGlow={isSelected}
                            showFloorShadow={false}
                          />
                        </div>

                        {/* Status indicator dot */}
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#121727] ${
                            isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                          title={isActive ? 'Active' : 'Paused'}
                        />
                      </div>

                      {/* Top Badges & Toggle */}
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${agent.glowPillClass}`}>
                          {agent.badge}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleActive(agent.id);
                          }}
                          className={`relative w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-hidden cursor-pointer ${
                            isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          title={isActive ? (language === 'ar' ? 'تعطيل الوكيل' : 'Pause') : (language === 'ar' ? 'تفعيل الوكيل' : 'Activate')}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 shadow-xs ${
                              isActive ? (isRtl ? '-translate-x-3.5' : 'translate-x-3.5') : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Agent Name & Title */}
                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                      {language === 'ar' ? agent.nameAr : agent.nameEn}
                    </h4>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      {language === 'ar' ? agent.roleAr : agent.roleEn}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {language === 'ar' ? agent.descAr : agent.descEn}
                    </p>

                    {/* Featured sample prompt pill */}
                    <div className="mt-3 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[10.5px] text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 line-clamp-1 border border-slate-200/50 dark:border-slate-800/40">
                      <Sparkles size={11} className="shrink-0 text-amber-500" />
                      <span className="truncate">
                        {language === 'ar' ? agent.featuredPrompts[0]?.textAr : agent.featuredPrompts[0]?.textEn}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400">
                      {isActive ? (language === 'ar' ? 'جاهز للخدمة ⚡' : 'Ready') : (language === 'ar' ? 'متوقف مؤقتاً' : 'Paused')}
                    </span>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? `${agent.buttonGradient} text-white shadow-xs`
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <MessageSquare size={13} />
                      <span>{isSelected ? (language === 'ar' ? 'محدد حالياً' : 'Active') : (language === 'ar' ? 'محادثة' : 'Chat')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-200/70 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#111626] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{language === 'ar' ? 'جميع الوكلاء متصلون بقاعدة بيانات الأسطول والمخزون الحية.' : 'All agents are synced with live fleet and inventory telemetry.'}</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
