import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Wrench, 
  Calendar, 
  Warehouse, 
  Cpu, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Compass, 
  HelpCircle, 
  Sparkles,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAiEnabled: boolean;
  setIsAiEnabled: (enabled: boolean) => void;
  language: 'ar' | 'en';
}

export default function OnboardingTour({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  isAiEnabled,
  setIsAiEnabled,
  language
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0); // 0: Welcome, 1..6: Steps, 7: Outro

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tourSteps = [
    {
      id: 'welcome',
      icon: <Compass className="text-violet-500 w-10 h-10 animate-bounce" />,
      titleAr: 'مرحباً بك في FleetAurvexis! 👋',
      titleEn: 'Welcome to FleetAurvexis! 👋',
      descAr: 'دعنا نأخذك في جولة تعريفية سريعة تفاعلية لشرح كيفية تتبع وإدارة أسطولك وصياناته بذكاء وسرعة.',
      descEn: "Let's take a quick interactive walkthrough to explore how to monitor, diagnose, and optimize your fleet in real-time.",
      tabTarget: 'no-change'
    },
    {
      id: 'dashboard',
      icon: <LayoutDashboard className="text-blue-500 w-10 h-10" />,
      titleAr: 'لوحة التحكم والتحليل الفوري 📊',
      titleEn: 'Performance Dashboard & Statistics 📊',
      descAr: 'المحور الرئيسي لمتابعة كفاءة الأسطول، ونسب تشغيل الورش الميدانية، واستباق الأخطاء بالاعتماد على ذكاء الأودوميتر ومخرجات التنبؤ السحابي.',
      descEn: 'The central command center. Provides key performance indicators (KPIs), active workshop occupancy, daily trends, and cloud-synchronized diagnostics.',
      tabTarget: 'dashboard'
    },
    {
      id: 'vehicles',
      icon: <Truck className="text-emerald-500 w-10 h-10" />,
      titleAr: 'مكتب أسطول المركبات والباركود 🚛',
      titleEn: 'Fleet Vehicles & Live Inventory 🚛',
      descAr: 'عرض تفصيلي لكافة المركبات والشاحنات النشطة، متضمنةً قراءات استهلاك الوقود السريع، وتراخيص التأمين، وميزة مسح الباركود الفوري.',
      descEn: 'Track, filter, and register heavy trucks, trailers, or light passenger cars. Features live fuel efficiency tracking and instant barcode scanning lookup.',
      tabTarget: 'vehicles'
    },
    {
      id: 'maintenance',
      icon: <Wrench className="text-amber-500 w-10 h-10" />,
      titleAr: 'أوامر العمل وبلاغات السائقين الصوتية 🛠️',
      titleEn: 'Maintenance Work Orders & Dispatching 🛠️',
      descAr: 'إصدار تذاكر الإصلاح المباشرة، مع تكامل ذكي لاستقبال بلاغات السائقين الصوتية وترجمتها فورياً لإسناد المهام للميكانيكيين بدقة.',
      descEn: 'Issue actionable work orders, capture physical vehicle faults, record voice notes from active drivers, and coordinate assigned workshop mechanics.',
      tabTarget: 'maintenance'
    },
    {
      id: 'periodic',
      icon: <Calendar className="text-rose-500 w-10 h-10" />,
      titleAr: 'مجدول الصيانات الوقائية الدورية 📅',
      titleEn: 'Scheduled Preventive Trackers 📅',
      descAr: 'تنظيم وضبط مواعيد تغيير الزيوت، الفحوصات الأمنية المعيارية، وفحوصات السلامة الموثقة لتجنب توقف المحركات ومفاجآت الطريق صامتة.',
      descEn: 'Establish periodic intervals for engine oil swap, transmission health, and brake compliance. Drastically reduces unexpected vehicle breakdowns.',
      tabTarget: 'periodic-maintenance'
    },
    {
      id: 'inventory',
      icon: <Warehouse className="text-sky-500 w-10 h-10" />,
      titleAr: 'مستودع العتاد وقطع الصيانة 🔋',
      titleEn: 'Parts Warehouse & Inventory Audits 🔋',
      descAr: 'مراقبة وجرد مخازن الإطارات، البطاريات، والسوائل المتاحة، مع إرسال إشعارات تلقائية فور اقتراب أي صنف من حد الأمان المحدد.',
      descEn: 'Audit parts logs and unit costs. Triggers alerts on low filters, tires, or brake supplies, seamlessly decrementing reserves upon work order closure.',
      tabTarget: 'inventory'
    },
    {
      id: 'ai-engineer',
      icon: <Cpu className="text-purple-500 w-10 h-10 animate-pulse" />,
      titleAr: 'المهندس الآلي المساعد بالذكاء الاصطناعي 🤖',
      titleEn: 'AI Mechanical Co-Pilot 🤖',
      descAr: 'مستشارك الرقمي المتاح على مدار الساعة لتشخيص أكواد الأخطاء الميكانيكية اللغوية (OBD Codes) واقتراح الحلول العملية فوراً للفنيين.',
      descEn: 'Your round-the-clock copilot. Paste or type any standard vehicle fault code to generate instant diagnostic guides, step-by-step repairs, and parts requirements.',
      tabTarget: 'ai-on'
    },
    {
      id: 'completion',
      icon: <CheckCircle className="text-emerald-500 w-12 h-12" />,
      titleAr: 'لقد أكملت الجولة التعريفية بنجاح! 🎉',
      titleEn: 'Tour Completed Successfully! 🎉',
      descAr: 'أنت الآن جاهز لإدارة أسطولك بكفاءة متناهية وبتحكم رقمي كامل. لا تتردد في تفعيل الذكاء الاصطناعي دائماً لتسهيل عملك.',
      descEn: 'You are now ready to run your logistics and maintenance departments with full digital visibility. Enjoy absolute control with FleetAurvexis!',
      tabTarget: 'dashboard'
    }
  ];

  const handleNext = () => {
    const nextStep = currentStep + 1;
    if (nextStep < tourSteps.length) {
      setCurrentStep(nextStep);
      applyStepState(nextStep);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 0) {
      setCurrentStep(prevStep);
      applyStepState(prevStep);
    }
  };

  const applyStepState = (stepIndex: number) => {
    const step = tourSteps[stepIndex];
    if (step.tabTarget === 'no-change') {
      return;
    } else if (step.tabTarget === 'ai-on') {
      setIsAiEnabled(true);
    } else if (step.tabTarget) {
      setActiveTab(step.tabTarget);
      // Ensure AI is turned off during standard tabs so user can see they switched
      if (isAiEnabled && step.tabTarget !== 'dashboard') {
        setIsAiEnabled(false);
      }
    }
  };

  const handleComplete = () => {
    localStorage.setItem('saas_tour_completed', 'true');
    setIsAiEnabled(false);
    setActiveTab('dashboard');
    onClose();
  };

  const currentStepData = tourSteps[currentStep];
  const isRtl = language === 'ar';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
        
        {/* Confetti or decorative beam */}
        {currentStep === tourSteps.length - 1 && (
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-emerald-500 to-amber-500 animate-pulse pointer-events-none" />
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 30 }}
          className="bg-white dark:bg-[#0f1422] w-full max-w-lg rounded-3xl border border-slate-150 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col font-sans p-6 mb-2 sm:mb-0 relative"
          style={{ direction: isRtl ? 'rtl' : 'ltr' }}
        >
          {/* Skip buttons on steps except completion */}
          {currentStep < tourSteps.length - 1 && (
            <button
              onClick={handleComplete}
              className="absolute top-4 outline-none border-none text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-black cursor-pointer bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
              style={{ [isRtl ? 'left' : 'right']: '1rem' }}
            >
              <span>{isRtl ? 'تخطي الجولة' : 'Skip Tour'}</span>
              <X size={12} />
            </button>
          )}

          {/* Tour Step Content Area */}
          <div className="flex flex-col items-center text-center space-y-4 pt-4 pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500/10 to-brand-blue-500/10 dark:from-violet-500/5 dark:to-brand-blue-500/5 rounded-2xl flex items-center justify-center border border-violet-500/15">
              {currentStepData.icon}
            </div>

            <div className="space-y-1 my-1">
              <span className="text-[10px] uppercase font-bold text-violet-500 bg-violet-500/10 px-2.5 py-0.5 rounded-full">
                {isRtl ? `الخطوة ${currentStep + 1} من ${tourSteps.length}` : `Step ${currentStep + 1} of ${tourSteps.length}`}
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white pt-1">
                {isRtl ? currentStepData.titleAr : currentStepData.titleEn}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold max-w-sm pt-1">
                {isRtl ? currentStepData.descAr : currentStepData.descEn}
              </p>
            </div>
          </div>

          {/* Step markers indicator */}
          <div className="flex items-center justify-center gap-1 pb-4">
            {tourSteps.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === currentStep 
                    ? 'w-6 bg-violet-500' 
                    : idx < currentStep 
                      ? 'w-2 bg-emerald-500' 
                      : 'w-1.5 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Tour Controls Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer flex items-center gap-1"
                >
                  {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                  <span>{isRtl ? 'السابق' : 'Previous'}</span>
                </button>
              ) : (
                <div className="text-[9.5px] font-bold text-slate-350 dark:text-slate-500 flex items-center gap-1 pl-1.5">
                  <Sparkles size={10} className="text-violet-400 animate-pulse" />
                  <span>{isRtl ? 'أهلاً بك ميكانيكياً' : 'Fleet Copilot Active'}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {currentStep < tourSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 text-white bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 transition-all transform hover:scale-[102%] active:scale-[98%]"
                >
                  <span>{isRtl ? 'التالي' : 'Next Step'}</span>
                  {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  className="px-6 py-2.5 text-white bg-emerald-500 hover:bg-emerald-600 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all transform hover:scale-[102%] active:scale-[98%]"
                >
                  <CheckCircle size={14} />
                  <span>{isRtl ? 'جاهز للانطلاق 🚀' : 'Start Right Away! 🚀'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom decorative hint */}
          <div className="text-center text-[9px] text-slate-400 dark:text-slate-500 pt-2 select-none">
            {isRtl 
              ? '💡 سيتنقل النظام تلقائياً بين الأقسام لمساعدتك في معاينة واجهات العمل الحقيقية.' 
              : '💡 The platform navigates automatically to show real data interfaces.'}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
