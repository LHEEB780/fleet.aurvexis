import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useLanguage } from '../services/LanguageContext';
import ContextualHelp from './ContextualHelp';
import { 
  CreditCard, 
  Crown, 
  Percent, 
  Check, 
  Zap, 
  History, 
  Download, 
  ArrowUpRight, 
  AlertTriangle,
  Flame,
  Gauge,
  CheckCircle2,
  Calendar,
  Sparkles,
  HelpCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { loadStripe } from '@stripe/stripe-js';

interface BillingInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
}

export default function SaasBilling({ user }: { user?: User }) {
  const { language } = useLanguage();
  // Persistence-aware state initialization
  const [activePlan, setActivePlan] = useState<'basic' | 'pro' | 'enterprise'>(() => {
    return (localStorage.getItem('saas_active_plan') as 'basic' | 'pro' | 'enterprise') || 'pro';
  });
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(() => {
    return (localStorage.getItem('saas_billing_cycle') as 'monthly' | 'yearly') || 'yearly';
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalTargetPlan, setModalTargetPlan] = useState<'basic' | 'pro' | 'enterprise' | null>(null);
  
  // Simulated subscription quotas
  const [quotas, setQuotas] = useState(() => {
    const saved = localStorage.getItem('saas_quotas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      vehicles: { current: 6, limit: 15 },
      workshops: { current: 3, limit: 5 },
      technicians: { current: 4, limit: 10 },
      inventoryParts: { current: 82, limit: 250 },
      aiAssistantQueries: { current: 42, limit: 120 },
    };
  });

  // Invoice logs
  const [invoices, setInvoices] = useState<BillingInvoice[]>(() => {
    const saved = localStorage.getItem('saas_invoices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'inv-101', invoiceNo: 'INV-2026-003', date: '2026-05-15', amount: 1490, status: 'paid', plan: 'الباقة المتقدمة (Pro)' },
      { id: 'inv-102', invoiceNo: 'INV-2026-002', date: '2026-04-15', amount: 149, status: 'paid', plan: 'الباقة المتقدمة (Pro)' },
      { id: 'inv-103', invoiceNo: 'INV-2026-001', date: '2026-03-15', amount: 149, status: 'paid', plan: 'الباقة المتقدمة (Pro)' },
    ];
  });

  // Stripe integration & payment states
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [successCelebration, setSuccessCelebration] = useState<{ plan: string, amount: number, invoiceNo: string } | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'processing' | 'done'>('details');
  const [checkoutMessage, setCheckoutMessage] = useState('');
  
  // Custom Card Input States for Sandbox Simulation
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardError, setCardError] = useState('');

  const isStripeConfigured = !!(import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY;

  // Sync state mutations to LocalStorage
  useEffect(() => {
    localStorage.setItem('saas_active_plan', activePlan);
  }, [activePlan]);

  useEffect(() => {
    localStorage.setItem('saas_billing_cycle', billingCycle);
  }, [billingCycle]);

  useEffect(() => {
    localStorage.setItem('saas_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('saas_quotas', JSON.stringify(quotas));
  }, [quotas]);

  // Hook to handle success callback from Stripe redirections
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stripeSuccess = urlParams.get('stripe_success');
    const targetPlan = urlParams.get('plan') as 'basic' | 'pro' | 'enterprise';
    const targetCycle = urlParams.get('cycle') as 'monthly' | 'yearly';
    const targetAmount = Number(urlParams.get('amount'));
    const sessionId = urlParams.get('session_id');

    if (stripeSuccess === 'true' && targetPlan && targetCycle && targetAmount) {
      setVerificationLoading(true);
      
      fetch('/api/stripe/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: targetPlan,
          billingCycle: targetCycle,
          amount: targetAmount,
          sessionId: sessionId || 'sandbox'
        })
      })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          setActivePlan(targetPlan);
          setBillingCycle(targetCycle);
          
          const limits = {
            basic: { vehicles: 5, workshops: 2, technicians: 3, inventoryParts: 50, aiAssistantQueries: 20 },
            pro: { vehicles: 15, workshops: 5, technicians: 10, inventoryParts: 250, aiAssistantQueries: 120 },
            enterprise: { vehicles: 150, workshops: 20, technicians: 50, inventoryParts: 1000, aiAssistantQueries: 1000 },
          };
          
          setQuotas({
            vehicles: { current: quotas.vehicles.current, limit: limits[targetPlan].vehicles },
            workshops: { current: quotas.workshops.current, limit: limits[targetPlan].workshops },
            technicians: { current: quotas.technicians.current, limit: limits[targetPlan].technicians },
            inventoryParts: { current: quotas.inventoryParts.current, limit: limits[targetPlan].inventoryParts },
            aiAssistantQueries: { current: quotas.aiAssistantQueries.current, limit: limits[targetPlan].aiAssistantQueries },
          });

          const newVerifiedInvoice: BillingInvoice = {
            id: `inv-stripe-${Date.now()}`,
            invoiceNo: data.invoiceNo || `STRIPE-${Date.now().toString().slice(-4)}`,
            date: data.date || new Date().toISOString().split('T')[0],
            amount: targetAmount,
            status: 'paid',
            plan: targetPlan === 'basic' ? 'الباقة الأساسية (Basic)' : targetPlan === 'pro' ? 'الباقة المتقدمة (Pro)' : 'باقة المؤسسات الضخمة (Enterprise)'
          };

          setInvoices(prev => {
            if (prev.some(inv => inv.invoiceNo === newVerifiedInvoice.invoiceNo)) return prev;
            return [newVerifiedInvoice, ...prev];
          });

          setSuccessCelebration({
            plan: targetPlan === 'basic' ? 'الأساسية (Basic)' : targetPlan === 'pro' ? 'المتقدمة (Pro)' : 'المؤسسات الكبرى (Enterprise)',
            amount: targetAmount,
            invoiceNo: data.invoiceNo
          });

          window.dispatchEvent(new Event('storage'));
        }
      })
      .catch(err => {
        console.error("Verification failed:", err);
      })
      .finally(() => {
        setVerificationLoading(false);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      });
    }
  }, []);

  const getPlanPrice = (plan: 'basic' | 'pro' | 'enterprise', cycle: 'monthly' | 'yearly'): number => {
    if (plan === 'basic') {
      return cycle === 'yearly' ? 490 : 59;
    }
    if (plan === 'pro') {
      return cycle === 'yearly' ? 1490 : 179;
    }
    return cycle === 'yearly' ? 4990 : 599;
  };

  const handlePlanSelection = (plan: 'basic' | 'pro' | 'enterprise') => {
    if (plan === activePlan) return;
    setModalTargetPlan(plan);
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setCardName('');
    setCardError('');
    setCheckoutStep('details');
    setShowUpgradeModal(true);
  };

  const executeCheckoutPayment = async () => {
    if (!modalTargetPlan) return;
    
    // Validate inputs if we are in Sandbox Simulator Mode (API keys missing)
    if (!isStripeConfigured) {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        setCardError('يرجى إدخال رقم بطاقة صالح يتألف من 16 خانة.');
        return;
      }
      if (!cardExpiry || !cardExpiry.includes('/')) {
        setCardError('يرجى إدخال تاريخ انتهاء بمحاذاة MM/YY.');
        return;
      }
      if (!cardCvc || cardCvc.length < 3) {
        setCardError('يرجى التحقق من الرقم الثلاثي خلف البطاقة CVC.');
        return;
      }
      if (!cardName) {
        setCardError('الرجاء إدخال اسم حامل البطاقة بالكامل.');
        return;
      }
    }

    setCardError('');
    setCheckoutStep('processing');
    setCheckoutMessage('جاري إنشاء جسر الدفع وتشفير البيانات...');

    const amountToBilled = getPlanPrice(modalTargetPlan, billingCycle);
    const successUrl = `${window.location.origin}${window.location.pathname}?stripe_success=true&plan=${modalTargetPlan}&cycle=${billingCycle}&amount=${amountToBilled}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}${window.location.pathname}`;

    try {
      // API call to Express Stripe Endpoint
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: modalTargetPlan,
          billingCycle,
          priceAmount: amountToBilled,
          successUrl,
          cancelUrl
        })
      });

      const data = await response.json();

      if (data.fallback) {
        // Run immersive Premium Sandbox payment simulation with real-time feedback loaders
        setTimeout(() => {
          setCheckoutMessage('تأكيد تفويض البنك المركزي للعمليات المجدولة...');
        }, 800);

        setTimeout(() => {
          setCheckoutMessage('تسجيل الحركات المالية وصياغة الفواتير الضريبية...');
        }, 1600);

        setTimeout(() => {
          // Successfully apply changes locally to localStorage with high quality feedback
          setActivePlan(modalTargetPlan);
          
          const limits = {
            basic: { vehicles: 5, workshops: 2, technicians: 3, inventoryParts: 50, aiAssistantQueries: 20 },
            pro: { vehicles: 15, workshops: 5, technicians: 10, inventoryParts: 250, aiAssistantQueries: 120 },
            enterprise: { vehicles: 150, workshops: 20, technicians: 50, inventoryParts: 1000, aiAssistantQueries: 1000 },
          };

          setQuotas({
            vehicles: { current: quotas.vehicles.current, limit: limits[modalTargetPlan].vehicles },
            workshops: { current: quotas.workshops.current, limit: limits[modalTargetPlan].workshops },
            technicians: { current: quotas.technicians.current, limit: limits[modalTargetPlan].technicians },
            inventoryParts: { current: quotas.inventoryParts.current, limit: limits[modalTargetPlan].inventoryParts },
            aiAssistantQueries: { current: quotas.aiAssistantQueries.current, limit: limits[modalTargetPlan].aiAssistantQueries },
          });

          const newInvoiceNo = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
          const newInvoiceDate = new Date().toISOString().split('T')[0];

          const newInvoice: BillingInvoice = {
            id: `inv-${Date.now()}`,
            invoiceNo: newInvoiceNo,
            date: newInvoiceDate,
            amount: amountToBilled,
            status: 'paid',
            plan: modalTargetPlan === 'basic' ? 'الباقة الأساسية (Basic)' : modalTargetPlan === 'pro' ? 'الباقة المتقدمة (Pro)' : 'باقة المؤسسات الضخمة (Enterprise)'
          };

          setInvoices(prev => [newInvoice, ...prev]);
          setCheckoutStep('done');
          
          // Show primary success celebration
          setSuccessCelebration({
            plan: modalTargetPlan === 'basic' ? 'الأولى (Basic)' : modalTargetPlan === 'pro' ? 'المتقدمة (Pro)' : 'الهيئات والمؤسسات (Enterprise)',
            amount: amountToBilled,
            invoiceNo: newInvoiceNo
          });

          // Trigger general update event so other active windows adapt
          window.dispatchEvent(new Event('storage'));
        }, 2500);

      } else if (data.url) {
        // Redirection to genuine Stripe checkout pages (API mode)
        setCheckoutMessage('توجيه آمن إلى صفحة دفع Stripe الرسمية...');
        setTimeout(() => {
          window.location.href = data.url;
        }, 500);
      } else {
        throw new Error(data.error || 'فشل تكوين المعاملة');
      }

    } catch (err: any) {
      console.error(err);
      setCardError(err.message || 'حدث خطأ غير متوقع أثناء ربط الخدمة.');
      setCheckoutStep('details');
    }
  };


  return (
    <div className="space-y-6 text-right pb-12" dir="rtl" id="saas-billing-container">
      {/* Verification Loader overlay */}
      {verificationLoading && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white font-sans gap-4">
          <RefreshCw className="animate-spin text-brand-blue-400" size={36} />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-black">جاري الاستعلام عن بيانات الدفع الآمنة...</h3>
            <p className="text-[11px] text-slate-300">نقوم الآن بالتحقق من الرموز المشفرة عبر خوادم Stripe الموثقة.</p>
          </div>
        </div>
      )}

      {/* Success Celebration Panel */}
      <AnimatePresence>
        {successCelebration && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-6 text-right flex flex-col md:flex-row items-center justify-between gap-4 font-sans shadow-xs"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                <ShieldCheck size={28} className="animate-bounce text-white" />
              </div>
              <div className="space-y-1">
                <span className="text-[9.5px] bg-emerald-500 text-white font-bold px-2.5 py-0.5 rounded-full">
                  اكتمال تأمين الدفع ✓
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  تم شحن اشتراك مؤسستك وترقية المستويات بنجاح!
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  الباقة المفتوحة: <strong className="text-emerald-500 font-black">{successCelebration.plan}</strong> | قيمة المعاملة: <strong className="font-mono text-emerald-550 dark:text-emerald-400">${successCelebration.amount}</strong> | رقم الفاتورة: <strong className="font-mono text-slate-700 dark:text-slate-300">{successCelebration.invoiceNo}</strong>
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setSuccessCelebration(null)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs rounded-xl transition-all shadow-md cursor-pointer text-center whitespace-nowrap"
            >
              متابعة لوحة المستأجر
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{language === 'ar' ? 'إدارة الاشتراك واستغلال سعة باقة الـ SaaS' : 'Subscription & SaaS Billing Panel'}</span>
              <span className="text-[10px] bg-brand-blue-500/10 text-brand-blue-600 dark:text-[#38bdf8] px-2 py-0.5 rounded-full font-black border border-brand-blue-500/15 shrink-0">
                {language === 'ar' ? 'بوابة الفوترة الفعالة' : 'Billing Gateway'}
              </span>
            </h1>
            <ContextualHelp 
              id="saas-billing"
              titleAr="بوابة الفوترة والاشتراكات"
              titleEn="SaaS Billing & Subscriptions"
              explanationAr="عرض ومراقبة سعة الباقات النشطة (عدد السائقين والمعدات المتاحة)، الترقية المباشرة للخطط الشهرية والسنوية، واستعراض سجل الفواتير كلياً."
              explanationEn="A complete billing operations dashboard mapping current operational resource limits (fleets, drivers, workshops) to dynamic subscription upgrades."
              benefitsAr={[
                "متابعة حية لنسب استغلال الحصص والحدود المسموحة لحسابك الموحد.",
                "الدفع والترقية الآمنة الفورية للخطة الاحترافية أو الشركات.",
                "أرشفة وتنزيل الفواتير السابقة إلكترونيّاً بصيغة PDF مجهزة وطباعتها."
              ]}
              benefitsEn={[
                "Displays dynamic resource meters alerting you when approaching account quota maximums.",
                "Enables single-click upgrade authorizations to professional and corporate tiers safely.",
                "Provides quick billing history table with downloadable transaction receipts."
              ]}
              tipsAr={[
                "اختر الدفع السنوي لتوفير حتى 20% من التكلفة الإجمالية لباقات خدمات ميكانيك 360 المتقدمة."
              ]}
              tipsEn={[
                "Opting for Yearly Billing cycle directly waives 20% off all mechanics billing limits automatically."
              ]}
              language={language}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            راقب حجم استهلاك الموارد المتاحة في مؤسستك، تحكم بالخطط المتاحة، وراجع الفواتير والمدفوعات فوريًا.
          </p>
        </div>

        {/* Billing Plan toggler */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-xl max-w-xs self-start shrink-0 select-none">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
              billingCycle === 'monthly'
                ? 'bg-brand-blue-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            دفع شهري 🗓️
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-brand-blue-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>دفع سنوي 🎉</span>
            <span className="bg-emerald-500 text-white text-[8.5px] px-1 py-0.1 rounded font-black">وفر 20%</span>
          </button>
        </div>
      </div>

      {/* Grid: Dynamic Plan Display vs Meters Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        
        {/* Current active plan Summary Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-3xl p-6 border border-indigo-900/60 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[320px]">
          {/* Decorative shapes */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl translate-x-12 translate-y-12" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-505/20 text-indigo-200 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                باص المجمع الفعال
              </span>
              <Crown className="text-yellow-400 animate-bounce" size={24} />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black">
                {activePlan === 'basic' ? 'الباقة الأساسية' : activePlan === 'pro' ? 'الباقة المتقدمة' : 'باقة المؤسسات الضخمة'}
              </h2>
              <p className="text-xs text-indigo-200/80">المستوى المشترك به لمؤسستك حالياً</p>
            </div>

            {/* Price indicator */}
            <div className="pt-2">
              <span className="text-4xl font-extrabold font-mono tracking-tight">
                ${activePlan === 'basic' ? (billingCycle === 'yearly' ? 49 : 59) : activePlan === 'pro' ? (billingCycle === 'yearly' ? 149 : 179) : (billingCycle === 'yearly' ? 499 : 599)}
              </span>
              <span className="text-xs text-indigo-200/70 mr-1.5">
                / {billingCycle === 'yearly' ? 'شهرياً (بدفع سنوي)' : 'شهرياً'}
              </span>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-85 text-indigo-150">تاريخ التجديد القادم:</span>
                <span className="font-mono font-black text-emerald-400">2026-06-24</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-85 text-indigo-150 text-[10.5px]">المستحقات القادمة المقدرة:</span>
                <span className="font-mono font-bold">
                  ${activePlan === 'basic' ? (billingCycle === 'yearly' ? 588 : 59) : activePlan === 'pro' ? (billingCycle === 'yearly' ? 1788 : 179) : (billingCycle === 'yearly' ? 5988 : 599)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 relative z-10 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] text-indigo-250">
              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
              <span>يتضمن جميع صلاحيات الصيانة الدورية الذكية والـ AI</span>
            </div>
            <button 
              onClick={() => handlePlanSelection('enterprise')} 
              className="w-full h-11 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>طلب ميزات مخصصة (Enterprise)</span>
              <ArrowUpRight size={14} className="group-hover:translate-y-[-1px] group-hover:translate-x-[1px] transition-transform text-slate-700" />
            </button>
          </div>
        </div>

        {/* Resource Consumption Meters Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f1422] p-6 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Gauge size={16} className="text-brand-blue-500" />
              <span>أجهزة قياس استهلاك حصة الـ SaaS الافتراضية</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              يتم مراقبة استهلاك الموارد المتاحة لكل مستأجر لمنع الضغط الزائد وضمان امتثال العقود البرمجية المبرمة.
            </p>
          </div>

          {/* Meter grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            {/* Meter: Vehicles */}
            <div className="p-3 px-4 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-700 dark:text-slate-300">المركبات النشطة بالمجمع</span>
                <span className="font-mono text-slate-650 dark:text-slate-200">
                  {quotas.vehicles.current} / {quotas.vehicles.limit} مركبة
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    (quotas.vehicles.current / quotas.vehicles.limit) > 0.8 ? 'bg-rose-500' : 'bg-brand-blue-500'
                  }`} 
                  style={{ width: `${Math.min(100, (quotas.vehicles.current / quotas.vehicles.limit) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 flex justify-between items-center text-left">
                <span>الحد المتاح: {quotas.vehicles.limit}</span>
                <span className="font-mono text-[9px]">الامتلاء: {Math.round((quotas.vehicles.current / quotas.vehicles.limit) * 100)}%</span>
              </div>
            </div>

            {/* Meter: Workshops */}
            <div className="p-3 px-4 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-700 dark:text-slate-300">ورش الصيانة الفعالة</span>
                <span className="font-mono text-slate-650 dark:text-slate-200">
                  {quotas.workshops.current} / {quotas.workshops.limit} ورش
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    (quotas.workshops.current / quotas.workshops.limit) > 0.8 ? 'bg-rose-500' : 'bg-indigo-505'
                  }`} 
                  style={{ width: `${Math.min(100, (quotas.workshops.current / quotas.workshops.limit) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 flex justify-between items-center text-left">
                <span>الحد المتاح: {quotas.workshops.limit}</span>
                <span className="font-mono text-[9px]">الامتلاء: {Math.round((quotas.workshops.current / quotas.workshops.limit) * 100)}%</span>
              </div>
            </div>

            {/* Meter: Technicians */}
            <div className="p-3 px-4 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-700 dark:text-slate-300">طاقم الفنيين (المستخدمين)</span>
                <span className="font-mono text-slate-650 dark:text-slate-200">
                  {quotas.technicians.current} / {quotas.technicians.limit} مستخدم
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    (quotas.technicians.current / quotas.technicians.limit) > 0.8 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`} 
                  style={{ width: `${Math.min(100, (quotas.technicians.current / quotas.technicians.limit) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 flex justify-between items-center text-left">
                <span>الحد المتاح: {quotas.technicians.limit}</span>
                <span className="font-mono text-[9px]">الامتلاء: {Math.round((quotas.technicians.current / quotas.technicians.limit) * 100)}%</span>
              </div>
            </div>

            {/* Meter: AI Queries */}
            <div className="p-3 px-4 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Zap size={11} className="text-emerald-500 animate-pulse" />
                  <span>استفسارات الذكاء الاصطناعي الذكي</span>
                </span>
                <span className="font-mono text-slate-650 dark:text-slate-200">
                  {quotas.aiAssistantQueries.current} / {quotas.aiAssistantQueries.limit} استهداف
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    (quotas.aiAssistantQueries.current / quotas.aiAssistantQueries.limit) > 0.8 ? 'bg-rose-500' : 'bg-amber-500'
                  }`} 
                  style={{ width: `${Math.min(100, (quotas.aiAssistantQueries.current / quotas.aiAssistantQueries.limit) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 flex justify-between items-center text-left">
                <span>الحد المتاح: {quotas.aiAssistantQueries.limit}</span>
                <span className="font-mono text-[9px]">الامتلاء: {Math.round((quotas.aiAssistantQueries.current / quotas.aiAssistantQueries.limit) * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-yellow-500/10 text-yellow-600 dark:text-amber-400 rounded-2xl border border-yellow-500/10 text-[10px] flex items-start gap-2 select-none">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>
              نصيحة إشرافية: إذا قارب أي مؤشر من 80%، فسيقوم النظام بإخطار المالك ميكانيكيًا لطلب خطة مرنة تناسب المتطلبات دون انقطاع.
            </span>
          </div>
        </div>

      </div>

      {/* Pricing Table Section */}
      <div className="bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-5">
        <div className="pb-3 border-b border-slate-150/50 dark:border-slate-800/60 font-sans">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <Percent size={16} className="text-brand-blue-500" />
            <span>باقات الاشتراك وخارطة الخدمات المتطابقة</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            قارن بين الميزات الأساسية لمختلف الباقات والمستويات. اختر ما تراه متناسباً لعملياتك مع كفالة تامة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-sans">
          {/* Plan: Basic */}
          <div className={`p-5 rounded-2xl border transition-all ${
            activePlan === 'basic' 
              ? 'border-brand-blue-500 bg-brand-blue-50/10 dark:bg-brand-blue-900/10 ring-1 ring-brand-blue-500' 
              : 'border-slate-150 dark:border-slate-800 bg-slate-50/20'
          }`}>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">الباقة الأساسية (Basic)</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">للأساطيل الصغيرة والورش المحدودة</p>
                </div>
                {activePlan === 'basic' && (
                  <span className="text-[9px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">الخطة النشطة</span>
                )}
              </div>

              <div>
                <span className="text-2xl font-black font-mono">
                  ${billingCycle === 'yearly' ? '49' : '59'}
                </span>
                <span className="text-[10px] text-slate-500 mr-1">/ شهريًا</span>
              </div>

              <button 
                disabled={activePlan === 'basic'}
                onClick={() => handlePlanSelection('basic')}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                  activePlan === 'basic' 
                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed' 
                    : 'bg-slate-900 hover:bg-slate-850 text-white dark:bg-slate-800 dark:hover:bg-slate-750 cursor-pointer'
                }`}
              >
                {activePlan === 'basic' ? 'الباقة الحالية' : 'التحويل لهذه الباقة ⚡'}
              </button>

              <div className="space-y-2 pt-2 border-t border-slate-150/50 dark:border-slate-800/60 text-[10px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>تتبع حد 5 مركبات نشطة فقط</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>محطة عمل وورشة عمل ثنائية (2)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>جدول صيانة يدوي (بدون تنبيه SMS)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-350 dark:text-slate-600 line-through">
                  <span>صحة المستودع الذكي وطلبات الشراء التلقائية</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-350 dark:text-slate-600 line-through">
                  <span>مساعد مهندس AI (أوتوماتيكي بالكامل)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plan: Pro */}
          <div className={`p-5 rounded-2xl border transition-all relative ${
            activePlan === 'pro' 
              ? 'border-brand-blue-500 bg-brand-blue-50/20 dark:bg-[#1a2035] ring-1 ring-brand-blue-500' 
              : 'border-slate-150 dark:border-slate-800 bg-slate-50/20'
          }`}>
            <div className="absolute top-3.5 left-3.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[8.5px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <Flame size={9} className="animate-pulse" />
              <span>الأكثر طلباً</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">الخطة المتقدمة (Pro)</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">للأساطيل الكبيرة والمجمعات المركزية</p>
                </div>
                {activePlan === 'pro' && (
                  <span className="text-[9px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full shrink-0">الخطة النشطة</span>
                )}
              </div>

              <div>
                <span className="text-2xl font-black font-mono">
                  ${billingCycle === 'yearly' ? '149' : '179'}
                </span>
                <span className="text-[10px] text-slate-500 mr-1">/ شهريًا</span>
              </div>

              <button 
                disabled={activePlan === 'pro'}
                onClick={() => handlePlanSelection('pro')}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                  activePlan === 'pro' 
                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed' 
                    : 'bg-brand-blue-500 hover:bg-brand-blue-600 text-white cursor-pointer'
                }`}
              >
                {activePlan === 'pro' ? 'الباقة الحالية' : 'التحويل لهذه الباقة 🌟'}
              </button>

              <div className="space-y-2 pt-2 border-t border-slate-150/50 dark:border-slate-800/60 text-[10px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>تتبع حد 15 مركبة ومعدة ميدانية</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>إدارة 5 ورش صيانة مخصصة</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>120 استفسار متاح لـ مساعد القيادة والـ AI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>قارئ الباركود والملصقات وتنبيهات ميكانيكية</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>تصدير تقارير محاسبية ومالية بنسق PDF</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plan: Enterprise */}
          <div className={`p-5 rounded-2xl border transition-all ${
            activePlan === 'enterprise' 
              ? 'border-brand-blue-500 bg-brand-blue-50/10 dark:bg-brand-blue-900/10 ring-1 ring-brand-blue-500' 
              : 'border-slate-150 dark:border-slate-800 bg-slate-50/20'
          }`}>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">باقة الهيئات الكبرى (Enterprise)</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">للشركات والموانئ والمجموعات الكبرى</p>
                </div>
                {activePlan === 'enterprise' && (
                  <span className="text-[9px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">الخطة النشطة</span>
                )}
              </div>

              <div>
                <span className="text-2xl font-black font-mono">
                  ${billingCycle === 'yearly' ? '499' : '599'}
                </span>
                <span className="text-[10px] text-slate-500 mr-1">/ شهريًا</span>
              </div>

              <button 
                disabled={activePlan === 'enterprise'}
                onClick={() => handlePlanSelection('enterprise')}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                  activePlan === 'enterprise' 
                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 text-white cursor-pointer'
                }`}
              >
                {activePlan === 'enterprise' ? 'الباقة الحالية' : 'التحويل لهذه الباقة 🚀'}
              </button>

              <div className="space-y-2 pt-2 border-t border-slate-150/50 dark:border-slate-800/60 text-[10px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>عدد غير محدود من المركبات الصيانة</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>دعم كامل لربط الحساسات عن بعد IoT</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>عقود مخصصة (SLA) بدعم على مدار الساعة</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>تخزين سحابي بلا حدود للمستندات واللوحات</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices History section */}
      <div className="bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between font-sans">
          <div className="flex items-center gap-1.5">
            <History size={16} className="text-brand-blue-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">سجل الفواتير والدفع للحساب</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-500">تم رصد آخر 3 عمليات تلقائية</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs font-sans border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/85 text-slate-400 font-bold">
                <th className="py-2.5 px-3">رقم الفاتورة</th>
                <th className="py-2.5 px-3">التاريخ</th>
                <th className="py-2.5 px-3">تفاصيل الخطة</th>
                <th className="py-2.5 px-3">القيمة الإجمالية</th>
                <th className="py-2.5 px-3">الحالة المالية</th>
                <th className="py-2.5 px-3 text-left">مستندات</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                  <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">{inv.invoiceNo}</td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{inv.date}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{inv.plan}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">${inv.amount}</td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      مكتملة الدفع ✓
                    </span>
                  </td>
                  <td className="py-3 px-3 text-left">
                    <button 
                      onClick={() => alert(`جاري تنزيل الفاتورة رقم ${inv.invoiceNo} بصيغة المبيعات الافتراضية PDF...`)}
                      className="p-1.5 text-slate-505 hover:text-brand-blue-500 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                      title="تحميل كـ PDF"
                    >
                      <Download size={13} />
                      <span className="text-[9.5px] font-bold">تحميل PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Upgrade / Checkout simulation dialog modal */}
      <AnimatePresence>
        {showUpgradeModal && modalTargetPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay background */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (checkoutStep !== 'processing') setShowUpgradeModal(false);
              }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            />
            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full relative z-10 text-right font-sans space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/10 text-indigo-505 flex items-center justify-center rounded-xl shrink-0">
                    <CreditCard size={20} className="text-brand-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white leading-none">تأكيد الاشتراك وتفويض الدفع</h3>
                    <span className="text-[10px] text-slate-450 dark:text-slate-505 block mt-1">تعديل معايير الباقة عبر بوابة Stripe</span>
                  </div>
                </div>
                {checkoutStep !== 'processing' && (
                  <button 
                    onClick={() => setShowUpgradeModal(false)}
                    className="p-1 px-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {checkoutStep === 'details' && (
                <div className="space-y-4">
                  {/* Status indicator */}
                  <div className={`p-2.5 rounded-xl border text-[10.5px] leading-relaxed font-bold flex items-center gap-2 ${
                    isStripeConfigured 
                      ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600'
                      : 'bg-indigo-500/5 border-indigo-500/10 text-indigo-600'
                  }`}>
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
                    <span>
                      {isStripeConfigured 
                        ? 'مفتاح بوابة Stripe حقيقي نشط لبيئة الإنتاج 🔓' 
                        : 'أنت في بيئة Sandbox للمحاكاة التفاعلية 🧪 (جرب بطاقة افتراضية)'}
                    </span>
                  </div>

                  {/* Pricing Overview */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">الباقة المعتمدة حالياً:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-250">
                        {activePlan === 'basic' ? 'الباقة الأساسية' : activePlan === 'pro' ? 'الباقة المتقدمة' : 'باقة الهيئات (Enterprise)'}
                      </span>
                    </div>
                    <div className="flex justify-between text-brand-blue-600 dark:text-brand-blue-400">
                      <span className="font-bold">الباقة المستهدفة والمميزات:</span>
                      <span className="font-black">
                        {modalTargetPlan === 'basic' ? 'الأساسية' : modalTargetPlan === 'pro' ? 'المتقدمة' : 'الهيئات والمؤسسات'}
                      </span>
                    </div>
                    <hr className="border-slate-100 dark:border-slate-850" />
                    <div className="flex justify-between text-[13px] font-black">
                      <span className="text-slate-800 dark:text-slate-200">الإجمالي المستحق للدفع:</span>
                      <span className="font-mono text-emerald-500 font-extrabold flex items-center gap-0.5">
                        <span>${getPlanPrice(modalTargetPlan, billingCycle)}</span>
                        <span className="text-[10px] text-slate-400 font-medium">/ {billingCycle === 'yearly' ? 'سنة' : 'شهر'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Simulated forms if not configurated */}
                  {!isStripeConfigured ? (
                    <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-850">
                      <span className="text-[10.5px] font-black text-slate-500 block">تفاصيل بطاقة الفوترة الافتراضية (Sandbox Simulator)</span>
                      
                      {cardError && (
                        <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-bold text-center border border-rose-500/10">
                          ⚠️ {cardError}
                        </div>
                      )}

                      <div className="space-y-3 font-sans">
                        <div>
                          <input
                            type="text"
                            placeholder="رقم بطاقة الائتمان (16 رقمًا، مثلاً: 4242 4242 ...)"
                            value={cardNumber}
                            onChange={(e) => {
                              // format text
                              const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                              setCardNumber(val.slice(0, 19));
                            }}
                            className="w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none bg-slate-50/50 dark:bg-slate-900 focus:border-brand-blue-500 text-slate-950 dark:text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="انتهاء الصلاحية MM / YY"
                            value={cardExpiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\s/g, '');
                              if (val.length === 2 && !val.includes('/')) {
                                val += '/';
                              }
                              setCardExpiry(val.slice(0, 5));
                            }}
                            className="w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none bg-slate-50/50 dark:bg-slate-900 focus:border-brand-blue-500 text-slate-950 dark:text-white"
                          />
                          <input
                            type="password"
                            placeholder="الرقم السري CVC/CVV"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            className="w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none bg-slate-50/50 dark:bg-slate-900 focus:border-brand-blue-500 text-slate-950 dark:text-white text-center"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="اسم حامل البطاقة كما يظهر بالهوية"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none bg-slate-50/50 dark:bg-slate-900 focus:border-brand-blue-500 text-slate-950 dark:text-white text-right"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-brand-blue-50/10 text-brand-blue-600 rounded-xl text-[11px] leading-relaxed border border-brand-blue-500/10">
                      🔒 ستفتح هذه العملية صفحة تفويض مشفرة خاصة بشركة Stripe لإتمام الدفع السحابي المؤمّن لـ {modalTargetPlan === 'basic' ? 'الباقة الأساسية' : modalTargetPlan === 'pro' ? 'الباقة المتقدمة' : 'باقة المؤسسات'}.
                    </div>
                  )}

                  {/* Footer buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowUpgradeModal(false)}
                      className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black transition-all cursor-pointer"
                    >
                      إلغاء الأمر
                    </button>
                    <button
                      type="button"
                      onClick={executeCheckoutPayment}
                      className="py-2.5 bg-brand-blue-500 hover:bg-brand-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-brand-blue-500/10 flex items-center justify-center gap-1.5"
                    >
                      <span>{isStripeConfigured ? 'التوجيه لـ Stripe 🔒' : 'إرساء دفع محاكى ✓'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Processing spinner */}
              {checkoutStep === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 dar:border-slate-800 border-t-brand-blue-500 animate-spin" />
                    <Sparkles className="text-yellow-400 absolute inset-0 m-auto animate-ping" size={20} />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black text-slate-850 dark:text-slate-100">جاري معالجة الاشتراك بأمان...</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs leading-normal">
                      {checkoutMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Step: Done checkmark */}
              {checkoutStep === 'done' && (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 size={32} className="animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">تمت المعاملة وتحديث المستويات!</h4>
                    <p className="text-[10.5px] text-slate-500 max-w-xs font-semibold leading-relaxed">
                      ✓ مع تحيات نظام إدارة الأساطيل الذكي، تم تفويض الرتب والخصومات المقررة على حساب المستأجر.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(false)}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    الدخول للوحة التحكم المحدثة
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
