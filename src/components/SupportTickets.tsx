import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LifeBuoy, Send, Layers, HelpCircle, CheckCircle2, 
  Hourglass, AlertTriangle, FileText, Plus, ArrowLeft,
  Users, Check, Trash2, Cpu, Database, RefreshCcw, 
  Search, ShieldCheck, Activity, Info, Shield, Code, 
  Sparkles, Terminal, DollarSign, Clock, CheckCircle,
  Maximize2, Minimize2, X, MoreVertical, CheckCheck,
  ShieldAlert, Lock
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { saveDocument } from '../services/firebase';

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'technical' | 'billing' | 'hardware' | 'consultation';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  replies: Array<{
    id: string;
    sender: 'user' | 'support_agent';
    senderName: string;
    text: string;
    time: string;
  }>;
}

export interface CustomDevRequest {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  timeframe: '1_week' | '2_weeks' | '1_month';
  status: 'pending_review' | 'under_scoring' | 'approved' | 'declined';
  createdAt: string;
  estimatedHours: number;
  hourlyRate: number;
  pmRiskAssessment: string;
}

export const SupportTickets: React.FC = () => {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  // --- Support Tickets State ---
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('saas_support_tickets_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'TKT-1082',
        subject: language === 'ar' ? 'استفسار حول ربط قواعد البيانات السحابية' : 'Query about cloud database integration',
        category: 'consultation',
        priority: 'high',
        description: language === 'ar' 
          ? 'كيف نقوم بربط أجهزة الفحص الميداني المحمولة وسكانر الباركود بقاعدة البيانات المركزية وهل يوجد تفاوت زمني؟'
          : 'How do we link portable diagnostics devices and barcode scanners to the centralized database, and is there latency?',
        status: 'resolved',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        replies: [
          {
            id: 'r1',
            sender: 'user',
            senderName: language === 'ar' ? 'مهندس الورشة' : 'Workshop Engineer',
            text: language === 'ar' ? 'نريد تفاصيل حول بروتوكول الاتصال بالـ Firestore.' : 'We need details about the Firestore connection protocol.',
            time: new Date(Date.now() - 3600000 * 23.5).toISOString()
          },
          {
            id: 'r2',
            sender: 'support_agent',
            senderName: language === 'ar' ? 'FleetAurvexis (الدعم المتقدم)' : 'FleetAurvexis (Advanced Support)',
            text: language === 'ar'
              ? 'مرحباً بك! النظام يعتمد معمارية هجينة بالكامل (Hybrid Client-Server): يتم ربط كل مستخدم بقاعدة بيانات Firestore سحابية فوراً. في حالة انقطاع الشبكة، يتم تخزين الحركات في السجل المحلي للباركود والمعدات (In-Memory/LocalStorage)، وعند عودة الاتصال تتم المزامنة دون تضارب. المزامنة تتم في أجزاء من الثانية (أقل من 150ms).'
              : 'Welcome! The system utilizes a hybrid local-first architecture. Standard telemetry connects directly to Firebase Firestore. If network connections drop, inputs compile securely within device registers and localStorage. Upon reconnection, automatic delta synconization occurs inside 150ms with zero conflicts.',
            time: new Date(Date.now() - 3600000 * 23).toISOString()
          }
        ]
      },
      {
        id: 'TKT-1051',
        subject: language === 'ar' ? 'دليل الصيانة الدورية لنظام الـ SaaS' : 'SaaS System Preventive Maintenance Guide',
        category: 'technical',
        priority: 'medium',
        description: language === 'ar'
          ? 'هل توجد نافذة لصيانة قواعد البيانات والتنظيف الدوري لسجلات الأداء؟ ولكن نواجه أحياناً تعذراً في تحديث حالة أجهزة الـ Barcode وسكانر الليزر بعد انقطاع طويل.'
          : 'Is there a maintenance window for database cleaning and historic performance logs? We sometimes face transient failures in updating Barcode scanners after extended offline work.',
        status: 'open',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        replies: [
          {
            id: 'r3',
            sender: 'user',
            senderName: language === 'ar' ? 'إدارة المبيعات' : 'Sales Management',
            text: language === 'ar' ? 'نريد معرفة إذا كان هناك إمكانية لمسح الكاش يدويًا وإصلاح كود معالجة الباركود ذكياً.' : 'We want to know if manual cache clearing is possible and if the AI can fix the barcode processing function.',
            time: new Date(Date.now() - 3600000 * 3.8).toISOString()
          }
        ]
      }
    ];
  });

  const [activeTab, setActiveTab] = useState<'tickets' | 'create' | 'maintain' | 'custom_dev'>('tickets');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Form states for creating a new ticket
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'technical' | 'billing' | 'hardware' | 'consultation'>('technical');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'emergency'>('medium');
  const [description, setDescription] = useState('');
  const [newReplyText, setNewReplyText] = useState('');
  
  // System maintenance diagnostics simulation states
  const [diagnosticRun, setDiagnosticRun] = useState<boolean>(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState<number>(0);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // --- AI Self-Healing States ---
  const [showPolicies, setShowPolicies] = useState<boolean>(false);
  const [hasReadConsent, setHasReadConsent] = useState<boolean>(false);
  const [aiHealingStatus, setAiHealingStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [selfRepairLogs, setSelfRepairLogs] = useState<string[]>([]);
  const [repairProgress, setRepairProgress] = useState<number>(0);
  const [simulatedDiff, setSimulatedDiff] = useState<string>('');

  // --- Remote Maintenance Authorization States ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [hasReadAuthDetails, setHasReadAuthDetails] = useState<boolean>(false);
  const [isAuthAgreeChecked, setIsAuthAgreeChecked] = useState<boolean>(false);
  const [authTriggerSource, setAuthTriggerSource] = useState<'ticket_healing' | 'diagnostics'>('ticket_healing');

  // --- Custom Dev Requests States ---
  const [customRequests, setCustomRequests] = useState<CustomDevRequest[]>(() => {
    const saved = localStorage.getItem('saas_custom_dev_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'REQ-2891',
        title: language === 'ar' ? 'توسيع المزامنة الميدانية مع خرائط غوغل وتتبع الأسطول' : 'Google Maps Fleet Live Route Sync Overlay',
        description: language === 'ar'
          ? 'المطالبة بتصدير كشوف المواقع الجغرافية للمركبة ورسمها ديناميكياً على خريطة تفاعلية لتسهيل توزيع المهام ومقر العمال ومؤشرات السرعة.'
          : 'Requesting to map real-time cellular lat-long coordinates on interactive Map overlay, showcasing vehicle statuses dynamically.',
        impact: 'high',
        timeframe: '2_weeks',
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        estimatedHours: 42,
        hourlyRate: 110,
        pmRiskAssessment: language === 'ar'
          ? 'التقييم الفني لمدير المشروع: نطاق ممتاز وموثوق. التكامل مع خرائط غوغل يعتمد واجهة برمجية موحدة. البنية مستقرة بنسبة 100% لتلقي ملصقات الإحداثيات.'
          : 'Technical PM Assessment: Feasible and highly recommended. API integration leverages direct map pins. Negligible architectural risk.',
      },
      {
        id: 'REQ-1904',
        title: language === 'ar' ? 'موديول احتساب ضريبة القيمة المضافة للمستودعات وقطع الغيار' : 'Smart Billing and Warehouse Value-Added Tax Calc',
        description: language === 'ar'
          ? 'نريد أتمتة حساب الضريبة والدمج الذكي مع كشف فواتير القطع وتعديلها تلقائياً عند تغيير القيمة لتفادي الحسم اليدوي.'
          : 'Request to auto-calculate fractional VAT levies directly inside parts release receipts, pulling state configurations from brand variables.',
        impact: 'medium',
        timeframe: '1_week',
        status: 'pending_review',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        estimatedHours: 18,
        hourlyRate: 120,
        pmRiskAssessment: language === 'ar'
          ? 'التقييم الأولي لمدير المشروع: موديول الحسابات آمن ومستقل. يتطلب الربط بقالب فواتير المستأجر وتخيل مدخلات الكاش.'
          : 'Initial PM Scoping: Financial formulas are self-contained. Minor adjustments planned for local tenant bill rendering.',
      }
    ];
  });

  const [selectedRequest, setSelectedRequest] = useState<CustomDevRequest | null>(null);

  // Custom request input states
  const [reqTitle, setReqTitle] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqImpact, setReqImpact] = useState<'low' | 'medium' | 'high'>('medium');
  const [reqTimeframe, setReqTimeframe] = useState<'1_week' | '2_weeks' | '1_month'>('2_weeks');

  // Interactive Project Manager valuation sliders states
  const [valHours, setValHours] = useState<number>(30);
  const [valRate, setValRate] = useState<number>(100);
  const [valAssessment, setValAssessment] = useState<string>('');
  const [pmWindowSize, setPmWindowSize] = useState<'fullscreen' | 'medium'>('fullscreen');

  // Persist tickets to localStorage
  const saveTicketsToStorage = (updated: SupportTicket[]) => {
    setTickets(updated);
    localStorage.setItem('saas_support_tickets_v1', JSON.stringify(updated));
  };

  // Persist custom requests to localStorage
  const saveCustomReqsToStorage = (updated: CustomDevRequest[]) => {
    setCustomRequests(updated);
    localStorage.setItem('saas_custom_dev_v1', JSON.stringify(updated));
  };

  useEffect(() => {
    if (selectedRequest) {
      setValHours(selectedRequest.estimatedHours);
      setValRate(selectedRequest.hourlyRate);
      setValAssessment(selectedRequest.pmRiskAssessment || '');
    }
  }, [selectedRequest]);

  // Submit support ticket
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: SupportTicket = {
      id: ticketId,
      subject,
      category,
      priority,
      description,
      status: 'open',
      createdAt: new Date().toISOString(),
      replies: []
    };

    const updated = [newTicket, ...tickets];
    saveTicketsToStorage(updated);

    // Save dynamically to Firestore in the background
    try {
      await saveDocument('support_tickets', ticketId, newTicket);
    } catch (err) {
      console.warn("Could not save ticket to Cloud Firestore, local backup saved successfully.");
    }

    // Reset Form & switch tab
    setSubject('');
    setCategory('technical');
    setPriority('medium');
    setDescription('');
    
    setSelectedTicket(newTicket);
    setActiveTab('tickets');

    // Trigger AI response after 4 seconds
    setTimeout(() => {
      simulateAIResponse(ticketId);
    }, 4500);
  };

  // Simulate AI Agent text response
  const simulateAIResponse = (ticketId: string) => {
    setTickets(prev => {
      const target = prev.find(t => t.id === ticketId);
      if (!target) return prev;

      let replyMessage = '';
      if (target.category === 'technical') {
        replyMessage = language === 'ar'
          ? `مرحباً! لقد تم فحص تذكرتك البرمجية رقم (${ticketId}) بنجاح. معمارية ربط نظامنا مرنة ومتكاملة عبر Google Firestore. لصيانة وتحسين أداء النظام، نوصي عادةً بمسح الكاش المحلي من متصفحك أو تفعيل "مساعد الإصلاح والترقيع الذاتي المدعم بالذكاء الاصطناعي" أدناه للولوج لمشروع الـ SaaS الفتي وتصليح خلل سكانر الباركود فورا وبلا كاش متعطل.`
          : `Hello! Ticket ${ticketId} has been analyzed. Our core data engine operates on Google Firestore with full active failover. To fix current barcode/code anomalies immediately, we recommend triggering our "AI Code Maintenance & Hot-Patching Bot" below to access files and deploy a secure patch in real-time.`;
      } else if (target.category === 'billing') {
        replyMessage = language === 'ar'
          ? `أهلاً بك! بخصوص استفسار الفواتير رقم (${ticketId}). يتم ربط المدفوعات بدقة مع نظام اشتراك SaaS الخاص بك. في حال وجود تكرار مالي، نوصيك بتحديث صفحة "الفواتير والترقيات" والتحقق من صلاحية خطة السحابة الحالية.`
          : `Hello! Regarding your billing ticket ${ticketId}. Our B2B Stripe ledger syncs directly with subscription frameworks. If synchronization lag occurs on corporate limits, please click the "Hard Refresh" tool in our diagnostics center.`;
      } else if (target.category === 'hardware') {
        replyMessage = language === 'ar'
          ? `مرحباً بك في قسم الهاردوير بالدعم الميداني. ربط قارئ الباركود أو ملصقات الأمان يتم بالكامل عبر توجيه المتصفح وقارئ الليزر (HID Emulation). تأكد من ضبط الأجهزة لتمرير الـ Enter بعد دفق الحروف لكي يعمل الرصد فوري بالمنظومة.`
          : `Hi! Connecting laser scanning devices or hardware terminals uses standard keyboard HID emulations. Please configure your scanning hardware to append a Carriage-Return (Enter key suffix) following any barcode parse to ensure instant dispatch lookup.`;
      } else {
        replyMessage = language === 'ar'
          ? `نشكرك على استفسارك الاستشاري رقم (${ticketId}). لربط وصيانة النظام بالكامل: أولاً، يتم الربط السحابي بشكل آمن باستخدام مفتاح تشفير يربط أسطولك بمنفذ السحابة المعزول. ثانياً، صيانة المنصة تتم تلقائياً في الخلفية (أقل من ثانية واحدة لكل تحديث) دون التأثير على ورشة العمل لتظل دائماً FleetAurvexis فاعلة ومستقرة للأدمن وللسائقين.`
          : `Thank you for your consultation query ${ticketId}. To securely link your systems: we provision key-based SSL channels bridging your fleet registers to your private Firestore instance. Platform updates are deployed in background hot-patches requiring zero downtown, allowing supervisors and operators to work non-stop.`;
      }

      const aiReply = {
        id: `rep-${Math.floor(Math.random() * 100000)}`,
        sender: 'support_agent' as const,
        senderName: language === 'ar' ? 'FleetAurvexis (الاستجابة الفورية للمهندس)' : 'FleetAurvexis (Specialist AI Response)',
        text: replyMessage,
        time: new Date().toISOString()
      };

      const updatedTicket = {
        ...target,
        status: 'in_progress' as const,
        replies: [...target.replies, aiReply]
      };

      const revised = prev.map(t => t.id === ticketId ? updatedTicket : t);
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(updatedTicket);
      }
      
      localStorage.setItem('saas_support_tickets_v1', JSON.stringify(revised));
      return revised;
    });
  };

  // Triggering the Simulated Intelligent Live Hot-Fix Core on files
  const triggerAISelfHealingFix = () => {
    if (!selectedTicket) return;
    setAiHealingStatus('running');
    setRepairProgress(0);
    setSelfRepairLogs([]);
    setSimulatedDiff('');

    const logMessages = [
      { prg: 10, msg: language === 'ar' ? '🔌 بدء المصادقة وتوثيق مفاتيح الترقيع السحابي لسطح المتصفح والـ sandbox...' : '🔌 Authenticating credential keys & binding container sandbox shell...' },
      { prg: 25, msg: language === 'ar' ? '🔍 فحص هياكل المزامنة وتماسك التخزين لملف /src/components/AppLayout.tsx ...' : '🔍 Scanning components registry and parsing syntax of /src/components/AppLayout.tsx ...' },
      { prg: 45, msg: language === 'ar' ? '⚠️ رصد الخلل: تعارض في استلام الكود الفرعي لملصقات باركود المتصفح وسكانر الليزر المبرمج.' : '⚠️ Bug isolated: Type-safety mismatch on local barcode reader HID callback array register.' },
      { prg: 65, msg: language === 'ar' ? '⚙️ توليد كود الترقيع الساخن (Smart Hot-Patch) ومعالجة المتغيرات...' : '⚙️ Generating targeted Hot-Patch block for the device event handler...' },
      { prg: 82, msg: language === 'ar' ? '🚀 إطلاق المفسر البرمجي والفحص الفني الشامل (npm run lint / compile-system)' : '🚀 Running comprehensive system code linter check output (npm run lint & compile)...' },
      { prg: 100, msg: language === 'ar' ? '✅ تم إصلاح الخلل المعزول وتعميم الترقيع الفني محلياً في 125ms بنجاح!' : '✅ Verification complete. Auto-heal successfully compiled and written in 125ms!' }
    ];

    const patchDraft = language === 'ar' 
      ? `<<<< [كود تالف مكتشف بـ AppLayout.tsx]
- const handleBarcodeScan = (code) => { this.setState({ currentCode: code }) };
==== [ترقيع ذكي مدعم بالذكاء الاصطناعي]
+ const handleBarcodeScan = (code: string) => {
+   if (!code || code.trim() === "") return;
+   setBarcodeRegister(prev => {
+     const exists = prev.some(item => item.code === code);
+     if (exists) return prev;
+     return [...prev, { code, timestamp: new Date().toISOString() }];
+   });
+ };`
      : `<<<< [STALE / RE-ENTRANCY BUG FOUND]
- const handleBarcodeScan = (code) => { this.setState({ currentCode: code }) };
==== [AI HOTPATCH SECURE REMEDIATION]
+ const handleBarcodeScan = (code: string) => {
+   if (!code || code.trim() === "") return;
+   setBarcodeRegister(prev => {
+     const exists = prev.some(item => item.code === code);
+     if (exists) return prev;
+     return [...prev, { code, timestamp: new Date().toISOString() }];
+   });
+ };`;

    let step = 0;
    const interval = setInterval(() => {
      if (step < logMessages.length) {
        setRepairProgress(logMessages[step].prg);
        setSelfRepairLogs(prev => [...prev, logMessages[step].msg]);
        if (logMessages[step].prg >= 65) {
          setSimulatedDiff(patchDraft);
        }
        step++;
      } else {
        clearInterval(interval);

        // Commit an active developer fix reply directly on the selected ticket
        setTickets(prev => {
          const original = prev.find(t => t.id === selectedTicket.id);
          if (!original) return prev;

          const technicianReply = {
            id: `rep-bot-${Math.floor(Math.random() * 100000)}`,
            sender: 'support_agent' as const,
            senderName: language === 'ar' ? 'FleetAurvexis (المهندس الذاتي لإصلاح الأكواد)' : 'FleetAurvexis (AI Repair Automation Specialist)',
            text: language === 'ar'
              ? `⚙️ [مصلح الأكواد التلقائي] تم الدخول للملحق الميداني وتطبيق الترقيع البرمجي (Hot-Fix) بنجاح وإعادة تفعيل مزامنة الباركود. كود النظام مستقر وخال من الأخطاء الآن.`
              : `⚙️ [AI Automatic Code Repair] System verified. Remote compiler successfully merged the hotpatch into code registers. The local scanner module has been fully restored.`,
            time: new Date().toISOString()
          };

          const finalized = {
            ...original,
            status: 'resolved' as const,
            replies: [...original.replies, technicianReply]
          };

          if (selectedTicket.id === original.id) {
            setSelectedTicket(finalized);
          }
          const revisedList = prev.map(t => t.id === selectedTicket.id ? finalized : t);
          localStorage.setItem('saas_support_tickets_v1', JSON.stringify(revisedList));
          return revisedList;
        });

        setAiHealingStatus('completed');
      }
    }, 1400);
  };

  // --- Remote Maintenance Authorization Handlers ---
  const openRemoteAuthModal = (source: 'ticket_healing' | 'diagnostics') => {
    setAuthTriggerSource(source);
    setIsAuthAgreeChecked(false);
    setHasReadAuthDetails(false);
    setIsAuthModalOpen(true);
  };

  const handleAuthorizeAndExecute = () => {
    setIsAuthModalOpen(false);
    if (authTriggerSource === 'ticket_healing') {
      setHasReadConsent(true);
      triggerAISelfHealingFix();
    } else {
      runSystemDiagnostics();
    }
  };

  // User manual reply submissions
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newReplyText.trim()) return;

    const userReply = {
      id: `rep-${Math.floor(Math.random() * 100000)}`,
      sender: 'user' as const,
      senderName: language === 'ar' ? 'مسؤول المنشأة' : 'Corporate Administrator',
      text: newReplyText,
      time: new Date().toISOString()
    };

    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      status: 'open' as const,
      replies: [...selectedTicket.replies, userReply]
    };

    setSelectedTicket(updatedTicket);
    const revised = tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t);
    saveTicketsToStorage(revised);
    setNewReplyText('');

    try {
      await saveDocument('support_tickets', selectedTicket.id, updatedTicket);
    } catch (err) {}

    setTimeout(() => {
      setTickets(prev => {
        const tgt = prev.find(t => t.id === selectedTicket.id);
        if (!tgt) return prev;

        const engineerReply = {
          id: `rep-${Math.floor(Math.random() * 100000)}`,
          sender: 'support_agent' as const,
          senderName: language === 'ar' ? 'FleetAurvexis (مكتب المهندسين الميدانيين)' : 'FleetAurvexis (Technical Advisor)',
          text: language === 'ar' 
            ? `لقد تم إرسال ردك الفني لإشراف الأسطول الشامل وصيانة الـ SaaS. نحن نتتبع هذا التعديل وسنقوم بالتواصل معك لتأكيد إصلاح المنافذ.`
            : `Your technical reply has been logged. Our mechanical advisors are actively reviewing the performance parameters to ensure full compatibility.`,
          time: new Date().toISOString()
        };

        const finalizedTicket = {
          ...tgt,
          status: 'in_progress' as const,
          replies: [...tgt.replies, engineerReply]
        };

        const revisedList = prev.map(t => t.id === selectedTicket.id ? finalizedTicket : t);
        if (selectedTicket && selectedTicket.id === tgt.id) {
          setSelectedTicket(finalizedTicket);
        }
        localStorage.setItem('saas_support_tickets_v1', JSON.stringify(revisedList));
        return revisedList;
      });
    }, 3000);
  };

  const handleResolveTicket = async (id: string) => {
    const updated = tickets.map(t => {
      if (t.id === id) {
        const upd: SupportTicket = { ...t, status: 'resolved' as const };
        if (selectedTicket && selectedTicket.id === id) {
          setSelectedTicket(upd);
        }
        return upd;
      }
      return t;
    });
    saveTicketsToStorage(updated);
    
    const matched = updated.find(t => t.id === id);
    if (matched) {
      try {
        await saveDocument('support_tickets', id, matched);
      } catch (err) {}
    }
  };

  // Submit custom development request
  const handleAddCustomRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqDesc.trim()) return;

    const newId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRequest: CustomDevRequest = {
      id: newId,
      title: reqTitle,
      description: reqDesc,
      impact: reqImpact,
      timeframe: reqTimeframe,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
      estimatedHours: reqImpact === 'high' ? 40 : reqImpact === 'medium' ? 24 : 12,
      hourlyRate: 110,
      pmRiskAssessment: language === 'ar' 
        ? `جاري تقييم المخاطر الفنية وهيكلة واجهة برمجية آمنة للملفات...`
        : `Baseline analysis queued. PM evaluating operational dependencies...`
    };

    const updated = [newRequest, ...customRequests];
    saveCustomReqsToStorage(updated);
    setSelectedRequest(newRequest);
    setPmWindowSize('fullscreen');

    // Reset Form fields
    setReqTitle('');
    setReqDesc('');
    setReqImpact('medium');

    try {
      saveDocument('custom_dev_requests', newId, newRequest);
    } catch (err) {}
  };

  // PM updates valuation details
  const handleUpdateValuation = (status: 'approved' | 'declined' | 'pending_review') => {
    if (!selectedRequest) return;

    const updated = customRequests.map(r => {
      if (r.id === selectedRequest.id) {
        const upd: CustomDevRequest = {
          ...r,
          status,
          estimatedHours: valHours,
          hourlyRate: valRate,
          pmRiskAssessment: valAssessment.trim() || (language === 'ar' ? 'تم تحديث تقييم مدير المشروع والموافقة على البناء.' : 'Project scope approved and allocated for construction.')
        };
        setSelectedRequest(upd);
        return upd;
      }
      return r;
    });

    saveCustomReqsToStorage(updated);

    const targetDoc = updated.find(r => r.id === selectedRequest.id);
    if (targetDoc) {
      try {
        saveDocument('custom_dev_requests', selectedRequest.id, targetDoc);
      } catch (err) {}
    }
  };

  // Simulated system diagnostics 
  const runSystemDiagnostics = () => {
    setDiagnosticRun(true);
    setDiagnosticProgress(0);
    setDiagnosticLogs([]);

    const logMessages = [
      language === 'ar' ? '🔍 بدء التحقق الفحصي العالي الشدة لنواة الـ SaaS...' : '🔍 Initiating SaaS master diagnostics routines...',
      language === 'ar' ? '🔋 فحص ريجسترات التخزين المحلي والـ Cache...' : '🔋 Checking client registry keys & memory footprint...',
      language === 'ar' ? '📦 التحقق من تماسك وحجم بيانات المركبات والصيانة بـ localStorage...' : '📦 Auditing vehicles & maintenance ledger data tables...',
      language === 'ar' ? '📡 قياس الاتصال بمدخل قاعدة بيانات Google Firestore...' : '📡 Measuring telemetry connection with Google Firestore database...',
      language === 'ar' ? '🛡️ فحص الرخص الرقمية واعتماد ملصقات الفحص الفني والباركود...' : '🛡️ Auditing active software licensing and barcode hardware integrity...',
      language === 'ar' ? '✅ النجاح: المنصة خالية من العثرات التشغيلية. التماسك مستقر بنسبة 100%!' : '✅ Success: All local indices compiled. Connection stability 100%!'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < logMessages.length) {
        setDiagnosticLogs(prev => [...prev, logMessages[currentStep]]);
        setDiagnosticProgress(Math.round(((currentStep + 1) / logMessages.length) * 100));
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 850);
  };

  const filteredTickets = tickets.filter(t => {
    return t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
           t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
           t.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6" id="support-tickets-component-node">
      
      {/* Header with Navigation tabs */}
      <div className={`flex flex-col sm:flex-row justify-between items-stretch sm:items-center border-b border-slate-150 dark:border-slate-850 pb-4 gap-3 ${isRtl ? 'sm:flex-row-reverse text-right' : 'text-left'}`}>
        <div className="space-y-1">
          <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5 justify-start">
            <LifeBuoy className="text-violet-500" size={18} />
            <span>{language === 'ar' ? 'مركز دعم العملاء وصيانة وتطوير الأنشطة' : 'FleetAurvexis Support & PM Center'}</span>
          </h4>
          <p className="text-[10px] text-slate-400">
            {language === 'ar' ? 'دعم فني فوري بالذكاء الاصطناعي، وأدلة المزامنة، وتطوير خصائص الـ SaaS المبتكرة.' : 'AI automated repairs, configuration audits, and B2B custom feature development.'}
          </p>
        </div>

        <div className={`flex items-center gap-1.5 self-start flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
          <button
            type="button"
            onClick={() => { setActiveTab('tickets'); setSelectedTicket(null); setAiHealingStatus('idle'); }}
            className={`px-3 py-2 text-[10px] font-black rounded-xl cursor-pointer border transition-all ${
              activeTab === 'tickets'
                ? 'bg-violet-600 text-white border-violet-600 shadow-3xs'
                : 'bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
            }`}
          >
            🎫 {language === 'ar' ? 'التذاكر المسجلة' : 'Support Tickets'}
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveTab('create'); setSelectedTicket(null); }}
            className={`px-3 py-2 text-[10px] font-black rounded-xl cursor-pointer border transition-all ${
              activeTab === 'create'
                ? 'bg-violet-600 text-white border-violet-600 shadow-3xs'
                : 'bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
            }`}
          >
            ➕ {language === 'ar' ? 'إنشاء تذكرة دعم' : 'New Support Request'}
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveTab('maintain'); }}
            className={`px-3 py-2 text-[10px] font-black rounded-xl cursor-pointer border transition-all ${
              activeTab === 'maintain'
                ? 'bg-violet-600 text-white border-violet-600 shadow-3xs'
                : 'bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
            }`}
          >
            ⚙️ {language === 'ar' ? 'دليل الروابط وصيانة النظام' : 'Database & Diagnostics'}
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('custom_dev'); }}
            className={`px-3 py-2 text-[10px] font-black rounded-xl cursor-pointer border transition-all ${
              activeTab === 'custom_dev'
                ? 'bg-violet-600 text-white border-violet-600 shadow-3xs'
                : 'bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
            }`}
          >
            💡 {language === 'ar' ? 'طلب تطويرات مخصصة (PM)' : 'Custom Features & PM'}
          </button>
        </div>
      </div>

      {/* Main Switch Panel */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: TICKETS LISTING & LIVE AI HEAL PANEL */}
        {activeTab === 'tickets' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-5"
            key="tickets-tab-list"
          >
            
            {/* Left side list of tickets */}
            <div className={`space-y-3 ${selectedTicket ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
              <div className="relative">
                <Search className={`absolute top-3 text-slate-400 w-4 h-4 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'ابحث برقم التذكرة أو الموضوع...' : 'Filter tickets ledger...'}
                  className={`w-full py-2.5 px-4 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-white border border-slate-200/85 dark:border-slate-800 rounded-2xl text-[11px] font-black outline-none focus:border-violet-500 ${
                    isRtl ? 'pr-11 text-right' : 'pl-11 text-left'
                  }`}
                />
              </div>

              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {filteredTickets.map((ticket) => {
                  const isSelected = selectedTicket?.id === ticket.id;
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => { setSelectedTicket(ticket); setAiHealingStatus('idle'); }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-xs ${
                        isSelected 
                          ? 'border-violet-500 bg-violet-500/[0.02]/[0.02]' 
                          : 'border-slate-200/80 dark:border-slate-850 bg-white dark:bg-[#0c101d]'
                      } ${isRtl ? 'text-right' : 'text-left'}`}
                    >
                      <div className={`flex items-start justify-between gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className="space-y-0.5">
                          <div className={`flex items-center gap-1.5 flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[10px] font-mono font-black py-0.5 px-2 bg-slate-100 dark:bg-slate-800 text-slate-550 rounded-lg">
                              {ticket.id}
                            </span>
                            <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-full ${
                              ticket.priority === 'emergency' ? 'bg-rose-500/10 text-rose-500' : 'bg-sky-500/10 text-sky-550'
                            }`}>
                              {ticket.priority.toUpperCase()}
                            </span>
                          </div>
                          <h5 className="text-xs font-black text-slate-850 dark:text-slate-100 line-clamp-1 mt-1.5">
                            {ticket.subject}
                          </h5>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black min-w-16 text-center ${
                          ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {ticket.status === 'resolved' ? (language === 'ar' ? 'مكتملة برمجياً' : 'Resolved') : (language === 'ar' ? 'مفتوحة' : 'Open')}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-2 line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side interactive detailed ticket workspace */}
            {selectedTicket && (
              <div className="lg:col-span-7 bg-white dark:bg-[#0c101d] rounded-[2rem] border border-slate-200/80 dark:border-slate-850 flex flex-col justify-between overflow-hidden h-[542px]">
                
                {/* Upper header segment */}
                <div className={`p-4 bg-slate-50 dark:bg-[#121829] border-b border-slate-200/50 dark:border-slate-850/80 ${isRtl ? 'text-right' : ''}`}>
                  <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400">{selectedTicket.id}</span>
                      <h4 className="text-xs font-black text-slate-850 dark:text-white">{selectedTicket.subject}</h4>
                    </div>
                    {selectedTicket.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => handleResolveTicket(selectedTicket.id)}
                        className="self-start px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-xl font-black text-[9.5px] cursor-pointer transition-colors"
                      >
                        ✔ {language === 'ar' ? 'تعيين كمكتملة' : 'Mark Resolved'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Main scrollable thread area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-sky-50/[0.01]">
                  
                  {/* Original Question submission */}
                  <div className={`max-w-[90%] p-3.5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-850/80 flex flex-col ${
                    isRtl ? 'mr-0 ml-auto' : 'mr-auto ml-0'
                  }`}>
                    <span className="text-[9.5px] font-black text-violet-500 mb-1">
                      {language === 'ar' ? 'سؤال المؤسسة الأصلي' : 'Original Client Query'}
                    </span>
                    <p className="text-[10.5px] leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
                      {selectedTicket.description}
                    </p>
                  </div>

                  {/* Message logs */}
                  {selectedTicket.replies.map((rep) => {
                    const isAgent = rep.sender === 'support_agent';
                    return (
                      <div
                        key={rep.id}
                        className={`max-w-[90%] p-3.5 rounded-[1.5rem] border ${
                          isAgent 
                            ? 'bg-violet-500/10 border-violet-500/20 mr-auto ml-0 text-left' 
                            : 'bg-slate-50 dark:bg-slate-900/90 border-slate-150 dark:border-slate-800 ml-auto mr-0 text-right'
                        } flex flex-col`}
                      >
                        <span className={`text-[9px] font-black mb-1 ${isAgent ? 'text-violet-600' : 'text-slate-500'}`}>
                          {rep.senderName}
                        </span>
                        <p className="text-[10.5px] leading-relaxed text-slate-700 dark:text-slate-205 whitespace-pre-wrap">
                          {rep.text}
                        </p>
                        <span className="text-[8px] text-slate-400 mt-1 pb-0.5 self-end">
                          {new Date(rep.time).toLocaleTimeString()}
                        </span>
                      </div>
                    );
                  })}

                  {/* AI SAFE SELF-HEALING INTERACTIVE PANEL (الدعم الفني الذاتي عبر الذكاء الاصطناعي) */}
                  {selectedTicket.category === 'technical' && selectedTicket.status !== 'resolved' && (
                    <div className="mt-4 border border-violet-500/30 bg-violet-500/[0.02] rounded-2xl p-4 space-y-3">
                      
                      <div className={`flex items-start gap-2.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                        <div className="p-2 bg-violet-600/15 rounded-xl text-violet-500 shrink-0">
                          <Activity size={18} className="animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <h6 className="text-xs font-black text-slate-850 dark:text-white">
                            {language === 'ar' ? '🤖 روبوت الترقيع التلقائي الذاتي للأكواد متاح حالياً' : '🤖 Automated AI Hot-Fix Agent Available'}
                          </h6>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            {language === 'ar' 
                              ? 'فريق العمل الفني يتابع مشكلتك، ولكن يمكنك تفويض روبوت الاصلاح الذكي للولوج ديناميكياً لملفات كود المتجر وتصليح خلل سكانر الباركود وملصقات الأجهزة فورياً بالنيابة عنك.'
                              : 'Our engineering staff is queued. However, you can instantly authorize our sandboxed AI system to parse your SaaS codebase files and patch this bug immediately.'}
                          </p>
                        </div>
                      </div>

                      {/* Read details Policy Toggler */}
                      <div className="border-t border-violet-500/10 pt-2.5">
                        <button
                          type="button"
                          onClick={() => setShowPolicies(!showPolicies)}
                          className="text-[9.5px] text-violet-600 font-extrabold flex items-center gap-1 cursor-pointer"
                        >
                          {showPolicies 
                            ? (language === 'ar' ? '▲ إخفاء الميثاق والسياسة الأمنية' : '▲ Hide secure sandbox policies')
                            : (language === 'ar' ? '▼ قراءة وثيقة حماية البيانات والوصول البرمجي' : '▼ Read safety & secure access policies')}
                        </button>

                        <AnimatePresence>
                          {showPolicies && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden mt-1.5"
                            >
                              <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-205 dark:border-slate-800 text-[9.5px] leading-relaxed text-slate-500 space-y-1.5">
                                <p className="font-extrabold text-violet-650">
                                  {language === 'ar' ? '🛡️ ميثاق الموثوقية لحماية أسطول الـ SaaS:' : '🛡️ FleetAurvexis Strict Sandbox Protocol:'}
                                </p>
                                <p>
                                  {language === 'ar'
                                    ? '1. الوصول المعزول: يعمل المصلح الذكي في قناة SSH تحت لير خاضع للرقابة محاط بـ Sandbox آمن.'
                                    : '1. Sandboxed Access: The AI works entirely within an isolated shell, bounded from touching server configs.'}
                                </p>
                                <p>
                                  {language === 'ar'
                                    ? '2. حيادية البيانات: لا يتم سحب فواتير أو مستندات حية نهائياً. يتم الترقيع التجميلي لكود سكانر الويب فقط.'
                                    : '2. UI & Component focus: Fixes are strictly verified against local state components to prevent live telemetry disruption.'}
                                </p>
                                <p>
                                  {language === 'ar'
                                    ? '3. المراقبة الراجعة: يتم رصد وبث كل تعديل برمجي (Simulated Diff code block) وتدقيقه تلقائياً لمنع أي تعارض.'
                                    : '3. Complete Visibility: Every codebase change triggers an immutable stdout log with code-diff visualization.'}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Consent Checkbox */}
                      {aiHealingStatus === 'idle' && (
                        <div className={`p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-205 dark:border-slate-850 flex items-center gap-2 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                          <input
                            type="checkbox"
                            id="accept-ai-repair"
                            checked={hasReadConsent}
                            onChange={(e) => setHasReadConsent(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-violet-650 focus:ring-violet-500 cursor-pointer"
                          />
                          <label htmlFor="accept-ai-repair" className="text-[10px] font-black text-slate-650 dark:text-slate-300 cursor-pointer select-none font-sans">
                            {language === 'ar' ? 'قرأت تفاصيل وثيقة الموثوقية وموافق على الولوج البرمجي المعزول وإصلاح كودي' : 'I have read safety details and authorize the AI agent to log in and patch this issue.'}
                          </label>
                        </div>
                      )}

                      {/* Repair triggers / Simulator output console */}
                      {aiHealingStatus === 'idle' && (
                        <div className="flex flex-col gap-2 font-sans w-full">
                          <button
                            type="button"
                            onClick={() => openRemoteAuthModal('ticket_healing')}
                            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-750 text-white text-[11px] rounded-xl font-black cursor-pointer shadow-sm transition-all flex items-center justify-center gap-1.5 font-sans"
                          >
                            <ShieldAlert size={14} className="animate-pulse shrink-0" />
                            <span>
                              {language === 'ar' 
                                ? 'فتح تفويض الصيانة والتحكم البرمجي عن بعد' 
                                : 'Open Remote Maintenance Authorization Modal'}
                            </span>
                          </button>

                          <button
                            type="button"
                            disabled={!hasReadConsent}
                            onClick={triggerAISelfHealingFix}
                            className={`w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 text-[10.5px] rounded-xl font-black cursor-pointer transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 font-sans ${
                              hasReadConsent 
                                ? 'opacity-100 font-extrabold cursor-pointer' 
                                : 'opacity-40 cursor-not-allowed font-medium'
                            }`}
                          >
                            ⚡ {language === 'ar' ? 'تشغيل فوري مباشر مسبق الاعتماد' : 'Direct Bypass - Trigger Secure Repair'}
                          </button>
                        </div>
                      )}

                      {/* Running Visual Code Repair Terminal */}
                      {aiHealingStatus === 'running' && (
                        <div className="space-y-3 pt-2">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-black text-violet-500">
                              <span>{language === 'ar' ? 'مستوى تقدم ترقيع الكود الساخن:' : 'Hot-Patch Construction Compile:'}</span>
                              <span>{repairProgress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${repairProgress}%` }} />
                            </div>
                          </div>

                          {/* Live stdout */}
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 font-mono text-[9px] text-emerald-400 space-y-1.5 max-h-40 overflow-y-auto leading-relaxed">
                            {selfRepairLogs.map((logStr, i) => (
                              <div key={i} className="flex gap-2 justify-start text-left">
                                <span className="text-violet-500 shrink-0 select-none">[vortex]</span>
                                <span>{logStr}</span>
                              </div>
                            ))}
                            {repairProgress < 100 && (
                              <div className="text-amber-500 animate-pulse text-left">⚡ Compiling diagnostics check...</div>
                            )}
                          </div>

                          {/* Interactive Diff Box */}
                          {simulatedDiff && (
                            <div className="space-y-1">
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">
                                {language === 'ar' ? 'مخطط الفروقات وكود الترقيع الصادر:' : 'Simulated Git Code Diff Outputs:'}
                              </span>
                              <pre className="p-2.5 bg-slate-900 dark:bg-slate-950 text-[8.5px] font-mono text-slate-300 rounded-xl border border-slate-800 leading-normal overflow-x-auto">
                                <code>{simulatedDiff}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Completed Feedback state */}
                      {aiHealingStatus === 'completed' && (
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-center text-[10px] font-extrabold flex items-center justify-center gap-1.5">
                          <CheckCircle size={14} />
                          <span>{language === 'ar' ? 'نجاح: تم الإصلاح والترقيع الذاتي بنجاح وتأمين الكشف!' : 'Success: Remote hot-patch integrated. Scanner telemetry functioning 100%!'}</span>
                        </div>
                      )}

                    </div>
                  )}

                </div>

                {/* Thread replying drawer footer */}
                <form
                  onSubmit={handleSendReply}
                  className={`p-3.5 bg-slate-50 dark:bg-[#121829] border-t border-slate-200/50 dark:border-slate-850/80 flex gap-2 items-center ${isRtl ? 'flex-row-reverse' : ''}`}
                >
                  <input
                    type="text"
                    value={newReplyText}
                    onChange={(e) => setNewReplyText(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب ردك أو استفسارك الإضافي الفني...' : 'Type response to technical team...'}
                    className={`flex-1 py-1.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-[10.5px] font-bold outline-none text-slate-800 dark:text-white ${isRtl ? 'text-right' : 'text-left'}`}
                  />
                  <button
                    type="submit"
                    className="p-2 bg-violet-600 text-white rounded-xl cursor-pointer hover:bg-violet-700 transition-colors shrink-0"
                  >
                    <Send size={12} className={isRtl ? 'rotate-180' : ''} />
                  </button>
                </form>

              </div>
            )}

          </motion.div>
        )}

        {/* TAB 2: CREATE NEW SUPPORT REQUEST TICKET */}
        {activeTab === 'create' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="max-w-2xl mx-auto bg-white dark:bg-[#0c101d] p-6 sm:p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-850"
            key="tickets-tab-create"
          >
            <div className={`space-y-1 mb-6 border-b border-slate-100 dark:border-slate-850 pb-4 ${isRtl ? 'text-right' : ''}`}>
              <h4 className="text-sm font-black text-slate-850 dark:text-white">
                {language === 'ar' ? 'إرسال طلب صيانة أو استشارة جديدة بالمنشأة' : 'Submit Diagnostic Support Request'}
              </h4>
              <p className="text-[10px] text-slate-450 leading-relaxed">
                {language === 'ar' ? 'املأ أبعاد مشكلتك وسيجيب مستشار FleetAurvexis الميداني الذكي ويحل تضارب المزامنة والربط فورياً.' : 'Describe your operational bottleneck; our diagnostic queue assigns an active engineer.'}
              </p>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-4 font-sans">
              <div className={`space-y-1 ${isRtl ? 'text-right' : ''}`}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {language === 'ar' ? 'موضوع المشكلة ونوع الخلل الفني' : 'Subject of Query'}
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: ربط كشوف السوائل مع طاقة المزامنة، تعسر كاش سكانر الباركود' : 'e.g., Diagnostics barcode sync delay or system cache optimization'}
                  className={`w-full py-2 px-4 bg-slate-50 dark:bg-slate-900/60 text-slate-850 dark:text-white border border-slate-200/90 dark:border-slate-800 rounded-2xl text-[11px] font-bold outline-none focus:border-violet-500 ${isRtl ? 'text-right' : ''}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`space-y-1 ${isRtl ? 'text-right' : ''}`}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {language === 'ar' ? 'تصنيف تذكرة الدعم' : 'Support Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className={`w-full py-2 px-4 bg-slate-50 dark:bg-slate-900/60 text-slate-850 dark:text-white border border-slate-200/90 dark:border-slate-800 rounded-2xl text-[11px] font-bold outline-none cursor-pointer focus:border-violet-500 ${isRtl ? 'text-right' : ''}`}
                  >
                    <option value="technical">{language === 'ar' ? '💻 خلل برمجي بقاعدة البيانات والتأصيل' : '💻 System Technical Bug'}</option>
                    <option value="billing">{language === 'ar' ? '💳 اشتراكات SaaS والترقيات والماليات' : '💳 Subscription Billing'}</option>
                    <option value="hardware">{language === 'ar' ? '🔌 سكانر الباركود والأجهزة الميدانية' : '🔌 Hardware & Scanning Sync'}</option>
                    <option value="consultation">{language === 'ar' ? '💡 استشارة هندسية لتوسيع الربط البرمجي' : '💡 Database Link Design'}</option>
                  </select>
                </div>

                <div className={`space-y-1 ${isRtl ? 'text-right' : ''}`}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {language === 'ar' ? 'الأولوية لورشة العمل' : 'Priority Level'}
                  </label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className={`w-full py-2 px-4 bg-slate-50 dark:bg-slate-900/60 text-slate-850 dark:text-white border border-slate-200/90 dark:border-slate-800 rounded-2xl text-[11px] font-bold outline-none cursor-pointer focus:border-violet-500 ${isRtl ? 'text-right' : ''}`}
                  >
                    <option value="low">{language === 'ar' ? 'منخفضة (تحسينات تجميلية)' : 'Low Priority'}</option>
                    <option value="medium">{language === 'ar' ? 'متوسطة (صيانة دورية)' : 'Medium Priority'}</option>
                    <option value="high">{language === 'ar' ? 'عالية (تعطل أحد المميزات)' : 'High Priority'}</option>
                    <option value="emergency">{language === 'ar' ? '🚨 طارئة (توقف خط التشغيل والمنصة)' : '🚨 Critical Emergency'}</option>
                  </select>
                </div>
              </div>

              <div className={`space-y-1 ${isRtl ? 'text-right' : ''}`}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {language === 'ar' ? 'تفاديات وتفصيل المشكلة بالكامل' : 'Detailed Description & Logs'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'ar' ? 'الرجاء توضيح الخطوات بدقة، أرقام الأجهزة وسجلات الأخطاء الملاحظة لمساعدتك...' : 'Trace your steps, supply error screens, or explain diagnostic readings for our field team...'}
                  className={`w-full py-2 px-4 bg-slate-50 dark:bg-slate-900/60 text-slate-850 dark:text-white border border-slate-200/90 dark:border-slate-800 rounded-2xl text-[11px] font-bold outline-none focus:border-violet-500 ${isRtl ? 'text-right' : ''}`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-2xl cursor-pointer transition-all shadow-md hover:scale-[1.012]"
              >
                {language === 'ar' ? 'إرسال التذكرة وبدء استجابة الذكاء الاصطناعي والدعم الفني 🚀' : 'Submit Ticket & Launch Support Response Queue 🚀'}
              </button>

            </form>
          </motion.div>
        )}

        {/* TAB 3: EDUCATIONAL DATABASE LINK & MAINTENANCE BLUEPRINTS */}
        {activeTab === 'maintain' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-6"
            key="tickets-tab-maintain"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Card 1: Cloud & Local Databases Architectural Overview */}
              <div className={`p-6 bg-white dark:bg-[#0c101d] rounded-3xl border border-slate-200/60 dark:border-slate-850 space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="p-3 bg-violet-500/10 text-violet-500 rounded-2xl shrink-0">
                    <Database size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-850 dark:text-slate-100">
                      {language === 'ar' ? 'معمارية الربط السحابي والتشغيل المركزي' : 'How the System is Linked (Central Telemetry)'}
                    </h5>
                    <p className="text-[9.5px] text-slate-400">
                      {language === 'ar' ? 'ربط الأجهزة الميدانية وحوسبة كشوف الـ SaaS بالتبعية' : 'Bridging tablets, barcode scanners, and central cloud nodes'}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] leading-relaxed text-slate-550 dark:text-slate-350 space-y-2.5">
                  <p>
                    {language === 'ar' 
                      ? 'تم ربط منصة "FleetAurvexis" بقاعدة بيانات سحابية مشفرة وخلفية قوية تعمل بنظام سحابة Google Firestore. يتم توثيق الحركات وحركات الأسطول وقطع غيار المستودعات تلقائياً وثنائياً.'
                      : 'FleetAurvexis utilizes Google Firestore relational-document architectures. Frontlines stream data seamlessly with zero synchronization roadblocks.'}
                  </p>
                  
                  <div className="p-3 bg-slate-50 dark:bg-[#121829] rounded-2xl border border-slate-205 dark:border-slate-800 space-y-2 text-[10px]">
                    <span className="font-extrabold text-violet-605 block">🔗 {language === 'ar' ? 'حلقات ربط الأجهزة وقارئات الباركود:' : 'Core Hardware Bridges:'}</span>
                    <ul className={`list-disc pl-4 space-y-1.5 ${isRtl ? 'pr-4 list-inside text-right' : 'text-left'}`}>
                      <li>
                        <strong>{language === 'ar' ? 'حوسبة الويب السحابية (Web Firestore Client):' : 'Cloud Integration SDK:'}</strong>{' '}
                        {language === 'ar' ? 'اتصال ثنائي آمن عبر تشفير SSL يحمل تحديثات كشوف الأسطول والورش فورياً.' : 'Real-time telemetry securely bound via SSL, tracking fleet registries.'}
                      </li>
                      <li>
                        <strong>{language === 'ar' ? 'تكامل سكانر الليزر والباركود الميداني:' : 'Barcode Wand Integrations:'}</strong>{' '}
                        {language === 'ar' ? 'إسقاط ملصقات الحماية الرقمية للمركبات وقراءة باركود الأجهزة الفنية وتحديث كمية قطع الصفر بالمنظومة.' : 'Instant barcode mapping on security shields, automating spare tool issuance.'}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card 2: Professional System Integrity Agent Transferred Announcement */}
              <div className={`p-6 bg-gradient-to-br from-violet-950/25 to-slate-900/40 rounded-3xl border border-violet-500/20 space-y-4 text-right flex flex-col justify-between`}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 justify-end flex-wrap">
                    <span className="p-1 px-2 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[9px] font-black">{language === 'ar' ? 'تمت الترقية إلى وكيل أوتوماتون 🤖' : 'System Promotion'}</span>
                    <h5 className="text-xs font-black text-white flex items-center gap-2">
                      <Cpu className="text-violet-405 animate-pulse" size={15} />
                      <span>{language === 'ar' ? 'فاحص ومحلل التماسك وصيانة منافذ النظام الذكي' : 'Live System Connectivity & Integrity Analyzer'}</span>
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-350 leading-relaxed">
                    {language === 'ar' 
                      ? 'تمت ترقية الفاحص البرمجي الميداني ليصبح وكيلاً احترافياً مستقلاً بمكتبة الروبوتات الكلية للـ SaaS، مجهزاً بمستشعرات حركية للأجهزة، وجدولة المزامنة السحابية وبلوك الصيانة الفورية وتفويض التحكم عن بعد ⚡. يرجى توجيه وتشغيل الوكيل مباشرة من لوحة الأتمتة والتحليل.'
                      : 'This tool has been upgraded and migrated to the full AI Robots catalog in the admin control panel as a professional system integrity agent.'}
                  </p>

                  <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1.5 text-[10px] text-right">
                    <span className="font-extrabold text-violet-400 block">⚡ {language === 'ar' ? 'أدوات الوكيل الجديد في تبويب الروبوتات:' : 'New Agent Capabilities:'}</span>
                    <ul className="list-disc pr-4 space-y-1.5 list-inside">
                      <li><strong>{language === 'ar' ? 'صيانة تخزين الـ Cache والرموز:' : 'Refactoring Local Storage:'}</strong> {language === 'ar' ? 'رصف وتطهير كشوف السجل الميداني.' : 'Purges and rebuilds stored data blocks.'}</li>
                      <li><strong>{language === 'ar' ? 'تفويض الصيانة الذكية عن بعد:' : 'Remote AI Control:'}</strong> {language === 'ar' ? 'رخص التشغيل الفيدرالي لمكافحة الأخطاء.' : 'Forces deep integrity cloud check.'}</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      alert(language === 'ar' 
                        ? 'تنبيه إرشادي: للوصول للروبوت المستقر، افتح لوحة تحكم الساس الموحدة ➔ ثم اختر تبويب "مكتبة الروبوتات والأتمتة" ➔ واضغط على "روبوت فاحص ومحلل التماسك وصيانة المنافذ" لتشغيله بكامل طاقته الاحترافية!'
                        : 'Navigate to: SaaS Administration Panel ➔ "Smart Robots Library" tab ➔ Select "AI System Integrity Agent" to run the upgraded professional edition.'
                      );
                    }}
                    className="p-2.5 px-4 bg-violet-605 hover:bg-violet-750 text-white rounded-xl text-[10.5px] font-black cursor-pointer shadow-md transition-all flex items-center gap-2 font-sans"
                  >
                    <span>{language === 'ar' ? 'الانتقال إلى لوحة الروبوتات الذكية ➔' : 'Go to Robots Catalog ➔'}</span>
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 4: B2B CUSTOM SAAS FEATURING & DETAILED PROJECT MANAGER CENTER */}
        {activeTab === 'custom_dev' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`transition-all duration-300 ${
              pmWindowSize === 'fullscreen'
                ? 'fixed inset-0 z-50 bg-[#efeae2] dark:bg-[#0b141a] overflow-hidden flex flex-col p-4 md:p-6'
                : 'w-full max-w-5xl mx-auto bg-[#efeae2] dark:bg-[#0b141a] rounded-2xl border border-slate-300 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[700px]'
            }`}
            style={{
              fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Segoe UI Arabic", Tahoma, Geneva, sans-serif'
            }}
            id="pm-windows-whatsapp-wrapper"
          >
            {/* 1. Microsoft Windows Style Window Titlebar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-slate-200 dark:border-slate-800 rounded-t-2xl select-none shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#008069] rounded flex items-center justify-center text-xs text-white">💼</div>
                <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200">
                  {language === 'ar' ? 'لوحة تخطيط وتطوير FleetAurvexis - مدير المشروع (PM Workspace)' : 'FleetAurvexis PM Workspace'}
                </span>
                <span className="text-[10px] bg-slate-200/80 dark:bg-slate-755 px-2 py-0.5 rounded-full font-serif text-[#008069] dark:text-[#00a884]">
                  {pmWindowSize === 'fullscreen' ? (language === 'ar' ? 'عرض ملء الشاشة' : 'Fullscreen Mode') : (language === 'ar' ? 'عرض متوسط' : 'Medium Mode')}
                </span>
              </div>

              {/* Three Window Controls Style Windows/Microsoft OS with labels */}
              <div className="flex items-center gap-1.5 shrink-0 font-sans">
                {/* 1. Fullscreen Button */}
                <button
                  type="button"
                  onClick={() => setPmWindowSize('fullscreen')}
                  className={`px-3 py-1 text-[11px] font-semibold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                    pmWindowSize === 'fullscreen'
                      ? 'bg-[#008069] text-white shadow-xs'
                      : 'hover:bg-slate-250 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Maximize2 size={11} />
                  <span>{language === 'ar' ? 'شاشة كاملة' : 'Fullscreen'}</span>
                </button>

                {/* 2. Medium Button */}
                <button
                  type="button"
                  onClick={() => setPmWindowSize('medium')}
                  className={`px-3 py-1 text-[11px] font-semibold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                    pmWindowSize === 'medium'
                      ? 'bg-[#008069] text-white shadow-xs'
                      : 'hover:bg-slate-250 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Layers size={11} />
                  <span>{language === 'ar' ? 'شاشة متوسطة' : 'Medium'}</span>
                </button>

                {/* 3. Cancel Button */}
                <button
                  type="button"
                  onClick={() => setActiveTab('tickets')}
                  className="px-3 py-1 text-[11px] font-semibold rounded flex items-center gap-1.5 transition-all cursor-pointer text-rose-600 hover:bg-rose-500 hover:text-white dark:text-rose-400"
                >
                  <X size={12} />
                  <span>{language === 'ar' ? 'إلغاء' : 'Cancel'}</span>
                </button>
              </div>
            </div>

            {/* 2. Main WhatsApp Styled App Body */}
            <div className="flex-1 flex overflow-hidden bg-[#efeae2] dark:bg-[#0b141a] relative">
              
              {/* WhatsApp background wallpaper overlay */}
              <div 
                className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%2523000000' fill-opacity='0.4'%3E%3Cpath d='M10 20h2V10h8V8h-8V0h-2v8H0v2h10v10zM10 2h6v4h-6V2zm18 18h2V10h8V8h-8V0h-2v8H18v2h10v10zM28 2h6v4h-6V2zM10 50h2V40h8V38h-8V30h-2v10H0v2h10v10zM10 32h6v4h-6v-4zm18 18h2V40h8V38h-8V30h-2v10H18v2h10v10zm0-18h6v4h-6v-4zm20-12h2V10h8V8h-8V0h-2v8H38v2h10v10zm0-18h6v4h-6V2zm18 18h2V10h8V8h-8V0h-2v8H58v2h10v10zm0-18h6v4h-6V2zM48 50h2V40h8V38h-8V30h-2v10H38v2h10v10zm0-18h6v4h-6v-4zm18 18h2V40h8V38h-8V30h-2v10H58v2h10v10zm0-18h6v4h-6v-4z'/%3E%3C/g%3E%3C/svg%3E")`
                }}
              />

              {/* Split layout: Sidebar left (Chats list and Feature proposal) & Chat window right */}
              <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative z-10 w-full h-full">
                
                {/* Left Side: Proposal submitting form & Chat lists (Scrollable sidebar) */}
                <div className="w-full md:w-[350px] border-e border-slate-200/85 dark:border-slate-800 bg-[#ffffff] dark:bg-[#111b21] flex flex-col h-full shrink-0">
                  
                  {/* Sidebar Header: WhatsApp profile bar style */}
                  <div className="px-4 py-3 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold text-sm shadow-xs select-none">
                        {language === 'ar' ? 'عميل' : 'USER'}
                      </div>
                      <div className="text-left font-sans">
                        <p className="text-[14px] font-bold text-[#111b21] dark:text-[#e9edef] leading-tight">
                          {language === 'ar' ? 'طلب تطوير جديد' : 'New Developer Request'}
                        </p>
                        <p className="text-[11px] text-[#667781] dark:text-[#8696a0]">
                          Online
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[#667781] dark:text-[#8696a0]">
                      <Sparkles size={18} className="text-[#00a884] animate-pulse" />
                      <MoreVertical size={18} />
                    </div>
                  </div>

                  {/* Submission Form styled inside left sidebar like an active composer window */}
                  <div className="p-4 border-b border-slate-150 dark:border-slate-800 bg-[#f9f9fa] dark:bg-[#111b21]/40 shrink-0">
                    <h5 className="text-[13px] font-bold text-[#008069] dark:text-[#00a884] mb-2 text-right">
                      {language === 'ar' ? '✍️ صياغة ميزة أو موديول جديد' : '✍️ Propose New Feature'}
                    </h5>
                    
                    <form onSubmit={handleAddCustomRequest} className="space-y-3">
                      <div>
                        <input
                          type="text"
                          required
                          value={reqTitle}
                          onChange={(e) => setReqTitle(e.target.value)}
                          placeholder={language === 'ar' ? 'عنوان موديول التطوير...' : 'e.g., Live Route Exporter'}
                          className="w-full py-2 px-3 bg-white dark:bg-[#202c33] border border-slate-200 dark:border-slate-800 text-[13px] text-[#111b21] dark:text-[#e9edef] rounded-lg outline-none focus:border-[#00a884] shadow-3xs text-right animate-none font-sans"
                        />
                      </div>

                      <div>
                        <textarea
                          required
                          rows={2}
                          value={reqDesc}
                          onChange={(e) => setReqDesc(e.target.value)}
                          placeholder={language === 'ar' ? 'المواصفات المطلوبة بالتفصيل...' : 'Detailed specifications and bounds...'}
                          className="w-full py-1.5 px-3 bg-white dark:bg-[#202c33] border border-slate-200 dark:border-slate-800 text-[13px] text-[#111b21] dark:text-[#e9edef] rounded-lg outline-none focus:border-[#00a884] shadow-3xs resize-none text-right font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <select
                            value={reqImpact}
                            onChange={(e: any) => setReqImpact(e.target.value)}
                            className="w-full py-1.5 px-1 bg-white dark:bg-[#202c33] border border-slate-200 dark:border-slate-800 text-[11px] text-[#111b21] dark:text-[#e9edef] font-semibold rounded-lg cursor-pointer text-center font-sans"
                          >
                            <option value="low">{language === 'ar' ? 'أثر منخفض' : 'Low Impact'}</option>
                            <option value="medium">{language === 'ar' ? 'أثر متوسط' : 'Medium Impact'}</option>
                            <option value="high">{language === 'ar' ? 'أثر استراتيجي' : 'High ROI'}</option>
                          </select>
                        </div>

                        <div>
                          <select
                            value={reqTimeframe}
                            onChange={(e: any) => setReqTimeframe(e.target.value)}
                            className="w-full py-1.5 px-1 bg-white dark:bg-[#202c33] border border-slate-200 dark:border-slate-800 text-[11px] text-[#111b21] dark:text-[#e9edef] font-semibold rounded-lg cursor-pointer text-center font-sans"
                          >
                            <option value="1_week">{language === 'ar' ? 'أسبوع واحد' : '1 Week'}</option>
                            <option value="2_weeks">{language === 'ar' ? 'أسبوعين' : '2 Weeks'}</option>
                            <option value="1_month">{language === 'ar' ? 'شهر كامل' : '1 Month'}</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-[#008069] hover:bg-[#00a884] text-white rounded-lg text-[13px] font-bold cursor-pointer transition-all shadow-sm font-sans"
                      >
                        🚀 {language === 'ar' ? 'تقديم الطلب لمدير المشروع' : 'Submit Upgrade Profile'}
                      </button>
                    </form>
                  </div>

                  {/* Previous requests - WhatsApp Chats Feed layout */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="px-4 py-2 bg-[#ffffff] dark:bg-[#111b21] border-b border-slate-100 dark:border-slate-800/60 text-right">
                      <span className="text-[12px] font-bold text-[#667781] dark:text-[#8696a0] font-sans">
                        {language === 'ar' ? 'الطلبات المجدولة والدراسات السابقة' : 'Valued Proposals Thread'}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-850">
                      {customRequests.map((req) => {
                        const isSelected = selectedRequest?.id === req.id;
                        return (
                          <div
                            key={req.id}
                            onClick={() => setSelectedRequest(req)}
                            className={`p-3 flex items-center gap-3 cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-[#f0f2f5] dark:bg-[#2a3942]' 
                                : 'hover:bg-slate-50 dark:hover:bg-[#111b21]/80'
                            }`}
                          >
                            {/* Round avatar mimicking WhatsApp contact photo */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                              req.status === 'approved' 
                                ? 'bg-[#e1f5fe] dark:bg-[#0a374c] text-[#0288d1]' 
                                : req.status === 'declined'
                                ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-500'
                                : 'bg-amber-100 dark:bg-amber-900/40 text-amber-500'
                            }`}>
                              💼
                            </div>

                            <div className="flex-1 min-w-0 text-right">
                              <div className="flex justify-between items-baseline gap-1.5">
                                <span className="text-[13.5px] font-bold text-[#111b21] dark:text-[#e9edef] truncate block font-sans">
                                  {req.title}
                                </span>
                                <span className="text-[10px] text-[#667781] dark:text-[#8696a0] shrink-0 font-sans font-medium">
                                  {new Date(req.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                </span>
                              </div>

                              <div className="flex items-center justify-between mt-1 text-right">
                                <span className="text-[12.5px] text-[#667781] dark:text-[#8696a0] truncate max-w-44 block font-sans">
                                  {req.description}
                                </span>
                                <span className="shrink-0 flex items-center gap-0.5 text-[#53bdeb]">
                                  <CheckCheck size={14} />
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Right Side: Valuation detailed window styled like an active conversation and messages sheet */}
                <div className="flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a]">
                  {selectedRequest ? (
                    <div className="flex-1 flex flex-col justify-between overflow-hidden h-full">
                      
                      {/* Chat Header Profile styled representing active Project Manager status */}
                      <div className="px-5 py-2 w-full bg-[#f0f2f5] dark:bg-[#202c33] shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold text-sm shadow-xs select-none">
                            PM
                          </div>
                          <div className="text-left font-sans">
                            <h5 className="text-[15px] font-bold text-[#111b21] dark:text-[#e9edef] leading-tight">
                              {language === 'ar' ? 'مدير مشروع FleetAurvexis المعين' : 'FleetAurvexis Dedicated PM'}
                            </h5>
                            <p className="text-[12px] text-[#00a884] font-semibold">
                              {language === 'ar' ? 'متصل الآن - يدرس ساعات التطبيق المخصص' : 'online • Scoping custom upgrades'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-[#667781] dark:text-[#8696a0]">
                          <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md font-sans ${
                            selectedRequest.status === 'approved' ? 'bg-[#00a884] text-white font-bold' :
                            selectedRequest.status === 'declined' ? 'bg-rose-500/10 text-rose-500 font-bold' :
                            'bg-amber-500/10 text-amber-600 font-bold'
                          }`}>
                            {selectedRequest.status === 'approved' ? (language === 'ar' ? 'تم الاعتماد' : 'APPROVED') :
                             selectedRequest.status === 'declined' ? (language === 'ar' ? 'تم الرفض' : 'DECLINED') :
                             (language === 'ar' ? 'قيد الدراسة' : 'PM EVALUATION')}
                          </span>
                          <MoreVertical size={20} className="cursor-pointer" />
                        </div>
                      </div>

                      {/* Conversation thread with WhatsApp Bubbles */}
                      <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-4">
                        
                        {/* WhatsApp Date divider representation */}
                        <div className="flex justify-center select-none my-2">
                          <span className="bg-white/90 dark:bg-[#182229]/90 border border-slate-200/50 dark:border-transparent text-slate-550 dark:text-[#8696a0] text-[11px] font-sans font-bold px-3 py-1 rounded-lg shadow-3xs uppercase">
                            {new Date(selectedRequest.createdAt).toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
                          </span>
                        </div>

                        {/* Speech Bubble A (Client's custom Request) resembling an Incoming Message (Received block: White) */}
                        <div className="flex flex-col items-start space-y-1">
                          <div className="bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] text-[15px] rounded-lg p-3.5 max-w-[85%] sm:max-w-[70%] shadow-2xs relative rounded-tl-none border-b-2 border-slate-200/40 dark:border-none text-right self-start font-sans leading-[1.45]">
                            
                            {/* Small profile tag inside bubble */}
                            <p className="text-[11.5px] font-extrabold text-[#008069] dark:text-[#00a884] border-b border-slate-100 dark:border-slate-850 pb-1 mb-1 text-right font-sans">
                              {language === 'ar' ? '📩 طلب عميلنا الفاضل' : '📩 Customer Feature Request Requirement'}
                            </p>

                            <p className="text-[14px] font-medium leading-relaxed font-sans">
                              {selectedRequest.description}
                            </p>

                            <div className="mt-2.5 flex items-center gap-3.5 text-[11px] text-[#667781] dark:text-[#8696a0] border-t border-slate-100 dark:border-slate-850 pt-2 font-semibold">
                              <span>ID: {selectedRequest.id}</span>
                              <span>•</span>
                              <span>{language === 'ar' ? 'الأثر التشغيلي:' : 'Impact:'} {selectedRequest.impact.toUpperCase()}</span>
                              <span>•</span>
                              <span>{language === 'ar' ? 'التسليم:' : 'Delivery Goal:'} {selectedRequest.timeframe}</span>
                            </div>

                            {/* Little tip triangle for incoming bubbles */}
                            <div className="absolute top-0 -left-2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-white dark:border-r-[#202c33] transform rotate-18 pointer-events-none" />
                          </div>
                          <span className="text-[11px] text-[#667781] dark:text-[#8696a0] ps-1 pt-0.5 font-sans">
                            {new Date(selectedRequest.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>

                        {/* System Milestone Pill: WhatsApp informational green box */}
                        <div className="flex justify-center select-none">
                          <span className="bg-[#e1f5fe] dark:bg-[#0a374c] text-[#0288d1] dark:text-[#4fc3f7] text-[12px] font-semibold px-4 py-1.5 rounded-xl shadow-4xs text-center max-w-md font-sans">
                            💡 {language === 'ar' 
                              ? 'يقوم مدير المشروع الآن بحساب وتعديل التكلفة التشغيلية وحساب خصم شركاء SaaS المضمون بنسبة 15%.' 
                              : 'PM active valuation engines calculation ongoing: standard 15% SaaS loyalty discount applied.'}
                          </span>
                        </div>

                        {/* Speech Bubble B (PM Valuation report) resembling an Outgoing Message (Sent block: Green `#d9fdd3`) */}
                        <div className="flex flex-col items-end space-y-1 font-sans">
                          <div className="bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-lg p-4 max-w-[85%] sm:max-w-[70%] shadow-2xs relative rounded-tr-none text-right self-end font-sans leading-[1.45]">
                            
                            <p className="text-[12px] font-black text-[#008069] dark:text-[#25d366] border-b border-[#c8ebd0]/40 dark:border-[#004e3e]/80 pb-1 mb-2.5 text-left flex justify-between items-center font-sans">
                              <span>{language === 'ar' ? '📋 التقييم التقديري والتكلفة المالية لمدير المشروع' : '📋 PM Resource Valuation & Quotation'}</span>
                              <span className="bg-[#008069] text-white text-[9.5px] px-2 py-0.5 rounded-full font-serif font-medium uppercase shrink-0">B2B Core</span>
                            </p>

                            {/* Financial Summary */}
                            <div className="p-3 bg-white/70 dark:bg-[#111b21]/75 rounded-xl text-center space-y-1 border border-slate-200/50 dark:border-transparent my-2">
                              <p className="text-[11px] font-bold text-[#667781] dark:text-[#8696a0] uppercase tracking-wider font-sans">
                                {language === 'ar' ? 'إجمالي الاستثمار الصافي' : 'Total Net Investment'}
                              </p>
                              <p className="text-2xl font-extrabold text-[#008069] dark:text-[#25d366] font-mono leading-none py-1">
                                ${Math.round((valHours * valRate) * 0.85)}
                              </p>
                              <div className="flex justify-center items-center gap-3 text-[11px] text-slate-500 font-semibold border-t border-slate-200/40 dark:border-slate-800/50 pt-1.5 mt-1.5 font-sans">
                                <span>{language === 'ar' ? 'الأساسي: ' : 'Base: '} ${valHours * valRate}</span>
                                <span>•</span>
                                <span className="text-emerald-600 font-black">{language === 'ar' ? 'خصم 15%: ' : '15% Off: '} -${Math.round((valHours * valRate) * 0.15)}</span>
                              </div>
                            </div>

                            {/* Live Valuation inputs built inside conversational frame as interactive sliders */}
                            <div className="space-y-3.5 my-3 bg-white/40 dark:bg-[#111b21]/20 p-3 rounded-xl border border-dotted border-slate-300 dark:border-slate-750 font-sans">
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-[12.5px] font-bold text-[#111b21] dark:text-slate-100/90 font-sans">
                                  <span>{language === 'ar' ? 'تقدير الوقت الهندسي (ساعة):' : 'Estimated Hours:'}</span>
                                  <span className="text-[#008069] dark:text-[#25d366] font-extrabold font-mono">{valHours}</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="5" 
                                  max="120" 
                                  value={valHours} 
                                  onChange={(e) => setValHours(Number(e.target.value))} 
                                  className="w-full accent-[#00a884] h-1 bg-slate-200/80 dark:bg-slate-800 rounded-lg cursor-pointer animate-none" 
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-[12.5px] font-bold text-[#111b21] dark:text-slate-100/90 font-sans">
                                  <span>{language === 'ar' ? 'سعر الساعة البرمجية ($):' : 'Hourly rate ($):'}</span>
                                  <span className="text-[#008069] dark:text-[#25d366] font-extrabold font-mono">${valRate}</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="40" 
                                  max="250" 
                                  value={valRate} 
                                  onChange={(e) => setValRate(Number(e.target.value))} 
                                  className="w-full accent-[#00a884] h-1 bg-slate-200/80 dark:bg-slate-800 rounded-lg cursor-pointer animate-none" 
                                />
                              </div>
                            </div>

                            {/* Assessment strategic details text */}
                            <div className="space-y-1">
                              <span className="text-[11.5px] font-extrabold text-[#008069] dark:text-[#00a884] block text-right font-sans">
                                {language === 'ar' ? '✍️ مذكرة مدير المشروع للمهندسين المطورين:' : '✍️ PM Implementation Strategic log:'}
                              </span>
                              <textarea
                                rows={2}
                                value={valAssessment}
                                onChange={(e) => setValAssessment(e.target.value)}
                                placeholder={language === 'ar' ? 'اكتب تدوينات وخارطة طريق مدير المشروع هنا لتجهيز البيئة البرمجية...' : 'Detail core logic parameters or system scopes here...'}
                                className="w-full py-1.5 px-3 bg-white/80 dark:bg-[#202c33] border border-slate-200/50 dark:border-slate-800 text-[13.5px] text-[#111b21] dark:text-[#e9edef] rounded-lg outline-none focus:border-[#008069] resize-none text-right font-medium leading-relaxed font-sans"
                                style={{
                                  fontSize: '13.5px'
                                }}
                              />
                            </div>

                            {/* Check check blue tick in WhatsApp bubble corner */}
                            <div className="absolute top-0 -right-2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-[#d9fdd3] dark:border-l-[#005c4b] transform -rotate-18 pointer-events-none" />
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[11px] text-[#667781] dark:text-[#8696a0] pe-1 pt-0.5 font-sans">
                            <span>{new Date(selectedRequest.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className="text-[#53bdeb]">
                              <CheckCheck size={14} />
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* Sticky Footer actions: styled like the message text entry bar in WhatsApp but with custom pm buttons! */}
                      <div className="px-4 py-3 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-slate-250 dark:border-slate-800 shrink-0 flex items-center justify-between gap-3 relative z-15 font-sans">
                        
                        <div className="hidden sm:flex items-center gap-2 text-[#667781] dark:text-[#8696a0]">
                          <ShieldCheck size={18} className="text-[#00a884]" />
                          <span className="text-[12px] font-medium select-none font-sans">
                            {language === 'ar' ? 'فحص وصياغة آمنة' : 'Verified by core PM scoping security tool'}
                          </span>
                        </div>

                        {/* Interactive PM Actions */}
                        <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto justify-end font-sans">
                          <button
                            type="button"
                            onClick={() => handleUpdateValuation('declined')}
                            className="px-4.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 rounded-lg text-[13.5px] font-bold cursor-pointer transition-all border border-rose-500/20 select-none font-sans"
                          >
                            ✖ {language === 'ar' ? 'رفض عروض السعر والطلب' : 'Decline Proposal'}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleUpdateValuation('approved')}
                            className="px-5 py-1.5 bg-[#008069] hover:bg-[#00a884] text-white rounded-lg text-[13.5px] font-bold cursor-pointer transition-all shadow-xs shrink-0 select-none font-sans"
                          >
                            ✔ {language === 'ar' ? 'تأكيد السعر وبدء التطوير' : 'Approve & Release Funds'}
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-350 dark:border-slate-800 rounded-2xl mx-10 my-8 p-12 text-center text-slate-400 font-sans">
                      <div className="w-16 h-16 rounded-full bg-[#008069]/10 text-[#008069] flex items-center justify-center mb-4">
                        💼
                      </div>
                      <h5 className="text-[16px] font-bold text-slate-800 dark:text-slate-200 font-sans">
                        {language === 'ar' ? 'ولم يتم تحديد أي مطالبة هندسية لدراستها ومتابعتها حاليا' : 'No feature request selected for review'}
                      </h5>
                      <p className="text-[13px] max-w-sm mx-auto text-slate-500 mt-2 text-center font-sans">
                        {language === 'ar' 
                          ? 'اختر ميزة مخصصة من اللائحة الجانبية للتحرك بمحددات السعر وساعات التنفيذ والتعديل والإنتاج فورا.' 
                          : 'Select any proposed feature request from the sidebar directory to run active PM valuations directly.'}
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* REMOTE MAINTENANCE AUTHORIZATION MODAL */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Dark glass backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.45 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
              style={{
                fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Segoe UI Arabic", Tahoma, Geneva, sans-serif',
                direction: dir
              }}
            >
              {/* Microsoft Windows Style Titlebar for Visual Consistency */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#f0f2f5] dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 select-none shrink-0 font-sans">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-violet-600 rounded text-white text-[10px]"><Shield size={10} /></span>
                  <span className="text-[11.5px] font-bold text-slate-750 dark:text-slate-250 font-sans">
                    {language === 'ar' ? 'نظام الحماية والأمان - وبوابة التفويض الميداني' : 'Security Command System - Authorization Gate'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#667781] dark:text-[#8696a0]">
                  <span>V2.20</span>
                  <button 
                    type="button" 
                    onClick={() => setIsAuthModalOpen(false)}
                    className="p-1 rounded hover:bg-rose-500/15 hover:text-rose-500 text-slate-500 transition-colors cursor-pointer ml-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* Main Content (Scrollable) */}
              <div className={`flex-1 overflow-y-auto p-5 md:p-6 space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                
                {/* Header Shield Accent section */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-500/10 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 rounded-full">
                    <ShieldAlert size={26} className="animate-pulse" />
                  </div>
                  <h3 className="text-sm font-black text-slate-850 dark:text-white leading-tight font-sans">
                    {language === 'ar' 
                      ? 'تفويض الصيانة والتحكم البرمجي عن بعد بالذكاء الاصطناعي' 
                      : 'Remote Maintenance Authorization Agreement'}
                  </h3>
                  <p className="text-[10px] text-slate-400 max-w-sm mx-auto font-sans">
                    {language === 'ar'
                      ? 'اتفاقية رسمية لتشغيل بروتوكول الصيانة الساخنة وسكان السورس كود ومعالجة البيانات محليا.'
                      : 'Legal and technical binding framework for secure, active AI troubleshooting & runtime self-patching.'}
                  </p>
                </div>

                {/* Brief Warning Banner */}
                <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] leading-relaxed flex items-start gap-2.5">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <div className={`space-y-0.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <p className="font-bold font-sans">{language === 'ar' ? '⚠️ تنبيه أمني عالي الشدة:' : '⚠️ Secure Execution Notice:'}</p>
                    <p className="font-sans">
                      {language === 'ar'
                        ? 'يتطلب استخدام مصلح الكود الساخن وقناة الترابط الميدانية الحصول على موافقتك الصريحة ونقل الصلاحيات محلياً.'
                        : 'Deploying deep AI troubleshooting scripts is a privilege bound strictly to sandboxed elements to absolute zero downtime.'}
                    </p>
                  </div>
                </div>

                {/* Core Legal Agreement Text */}
                <div className="p-4 bg-[#f8fafc]/90 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-350 space-y-2 font-sans">
                  <p className="font-extrabold text-slate-800 dark:text-slate-100 border-b border-slate-200/50 dark:border-slate-800 pb-1.5 mb-1.5">
                    {language === 'ar' ? '📄 البنود الأساسية لاتفاقية التحكم والصيانة الميدانية:' : '📄 Standard Core Operating Agreement Clauses:'}
                  </p>
                  <p>
                    {language === 'ar'
                      ? '١. بموجب هذه الوثيقة، يمنح العميل للمحرك الذكي حق الاتصال الآمن والمغلف بقناة تشفير أحادية الاتجاه SSH لولوج وجمع وفحص ملفات تهيئة المنظومة وكود سكانر الهاردوير.'
                      : '1. By signing, you confirm granting our sandboxed AI core a secure cryptographic outbound tunnel to telemetry registers, index configuration matrices, and web canvas interfaces.'}
                  </p>
                  <p>
                    {language === 'ar'
                      ? '٢. يلتزم الذكاء الاصطناعي التابع لـ FleetAurvexis بحيادية البيانات تامة وحصر أنشطة الترقيع خارج نطاقات بيانات فواتير العملاء أو الخصوصية الحساسة.'
                      : '2. Support is highly isolated inside read-only variables. Temporary hot patches of physical barcode drivers shall be transparently logged and visualized in active terminal logs.'}
                  </p>
                </div>

                {/* 'Read Details' toggle inside the modal */}
                <div className={`space-y-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <button
                    type="button"
                    onClick={() => setHasReadAuthDetails(!hasReadAuthDetails)}
                    className="text-[10px] font-extrabold text-violet-650 hover:text-violet-700 transition-colors flex items-center gap-1 cursor-pointer font-sans"
                  >
                    {hasReadAuthDetails
                      ? (language === 'ar' ? '▲ إخفاء المحددات التقنية المعقدة' : '▲ Collapse Technical & Sandbox Scopes')
                      : (language === 'ar' ? '▼ قراءة تفاصيل الأمان والـ Sandboxing الفني' : '▼ Read Detailed Technical Security Scopes')}
                  </button>

                  <AnimatePresence>
                    {hasReadAuthDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden bg-[#fafafa] dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left font-mono"
                      >
                        <div className="text-[9.5px] leading-relaxed text-slate-500 space-y-2 font-mono">
                          <p className="font-sans font-bold text-violet-600 dark:text-violet-400">🛡️ TECHNICAL SPECIFICATIONS & POLICY WHITELISTS:</p>
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">PROTOCOL:</span> SSH-Tunnel over TLSv1.3 with SHA-256 HMAC encryption keys.
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">ISOLATION LEVEL:</span> Local VM Sandbox, maximum stack memory bounded to 128MB.
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">WHITELIST ACTIONS:</span> Reads AppLayout, edits JS Event Handlers, validates LocalStorage pointers, re-initializes index DB.
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">TELEMETRY COMPLIANCE:</span> Immutable stdout logs streaming, zero cookies, and zero diagnostic uploads to external servers.
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 'I Agree' Checkbox */}
                <div className="p-3.5 bg-violet-500/[0.04] dark:bg-violet-500/[0.02] rounded-2xl border border-violet-500/15 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="modal-legal-agreement-agree"
                    checked={isAuthAgreeChecked}
                    onChange={(e) => setIsAuthAgreeChecked(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer shrink-0"
                  />
                  <label htmlFor="modal-legal-agreement-agree" className="text-[10px] text-slate-700 dark:text-slate-300 font-extrabold cursor-pointer select-none leading-relaxed font-sans text-right">
                    {language === 'ar'
                      ? 'أوافق بموجب هذا على التفويض القانوني الكامل وجدولة الفحص التلقائي وفتح قناة الصيانة الفورية بالذكاء الاصطناعي على المنظومة.'
                      : 'I hereby approve and sign this authorization, granting clean access and triggering system telemetry repair protocol.'}
                  </label>
                </div>

              </div>

              {/* Sticky Footer actions inside Modal */}
              <div className="px-5 py-4 bg-[#f0f2f5] dark:bg-[#1e293b] border-t border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-650 dark:text-slate-300 rounded-xl text-xs font-black cursor-pointer transition-all select-none font-sans"
                >
                  {language === 'ar' ? 'رفض وإلغاء' : 'Close / Refuse'}
                </button>

                <button
                  type="button"
                  disabled={!isAuthAgreeChecked}
                  onClick={handleAuthorizeAndExecute}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-2 select-none font-sans ${
                    isAuthAgreeChecked
                      ? 'bg-violet-650 hover:bg-violet-700 shadow-sm text-white font-black'
                      : 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Lock size={12} className={isAuthAgreeChecked ? 'text-white animate-pulse' : 'text-slate-400'} />
                  <span>
                    {language === 'ar' 
                      ? 'تفويض وتفعيل بروتوكول الصيانة الفورية' 
                      : 'Authorize & Launch Maintenance Link'}
                  </span>
                </button>
              </div>

            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
};
