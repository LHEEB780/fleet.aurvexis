import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Sparkles, BookOpen, ArrowUpRight, ArrowLeft, ArrowRight,
  Mail, Phone as PhoneIcon, User, Building, MessageSquare, Send, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { saveDocument } from '../services/firebase';

export interface SuccessStory {
  id: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  companyAr: string;
  companyEn: string;
  metricAr: string;
  metricEn: string;
  imageUrl: string;
}

export const DEFAULT_SUCCESS_STORIES: SuccessStory[] = [
  {
    id: 'story-1',
    titleAr: 'التحول الرقمي لأسطول النقل الثقيل ومراقبة التشغيل',
    titleEn: 'Digital Transformation of Heavy Transit and Operations Monitoring',
    companyAr: 'الشركة الوطنية للخدمات اللوجستية',
    companyEn: 'National Logistics Services Corp.',
    contentAr: 'نجحت الشركة الوطنية في رقمنة فحص أسطولها المكون من 450 شاحنة ومقطورة ثقيلة باستخدام منصتنا، مما أدى لتقليل نسب أعطال المحركات المفاجئة على الطرق السريعة بمعدل 38%، وتوفير نفقات الصيانة الوقائية السنوية بشكل ملموس.',
    contentEn: 'National Logistics successfully digitized its fleet of 450 heavy trucks and trailers using our platform. This resulted in a 38% reduction in highway engine failures and unlocked unprecedented annual preventative maintenance budget savings.',
    metricAr: 'تقليل نفقات الصيانة الوقائية بنسبة 25%',
    metricEn: '25% Savings in PM Expenditures',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'story-2',
    titleAr: 'أتمتة جدولة الورش والتحكم الكامل بمستودع القطع',
    titleEn: 'Workshop Scheduling Automation and Spare Parts Control',
    companyAr: 'أمانة العاصمة لخدمات البلدية والمعدات',
    companyEn: 'Capital Municipality Services Division',
    contentAr: 'قامت الأمانة بربط 230 معدة بلدية ورافعة ثقيلة بنظام الفحوصات الرقمية والباركود، مما مكن المشرفين والمهندسين من جدولة تدوير الإطارات دورياً وتتبع استهلاك قطع الغيار بكفاءة حالت دون تضخم وهدر المخزون.',
    contentEn: 'The division linked 230 municipal heavy loaders and equipment to our digital barcode system. This enabled automated preventative maintenance triggers and spare parts utilization audits, eliminating overstocking waste completely.',
    metricAr: 'انخفاض هدر مستودع القطع بنسبة 30%',
    metricEn: '30% Reduction in Parts Waste',
    imageUrl: 'https://images.unsplash.com/photo-1579412695340-39aef37912c4?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'story-3',
    titleAr: 'تكامل البلاغات الصوتية الفورية وحوكمة الفحص للسائقين',
    titleEn: 'Driver Voice Memo Integration and Quick Inspection Governance',
    companyAr: 'شركة المسار السريع للشحن الإقليمي',
    companyEn: 'Fast Track Regional Cargo Company',
    contentAr: 'تم تطبيق بوابة السائقين السريعة المدمجة بالبلاغات الصوتية، مما مكن السائقين من إرسال الشكاوى الميكانيكية للورشة في أقل من 15 ثانية، مسرعاً دورة استجابة الفنيين الداخليين وتفادي الأعطال الحرجة بالصندوق المالي.',
    contentEn: 'Implementing our responsive driver portal with voice note capturing enabled road-drivers to report mechanical issues to the central desk under 15 seconds. This minimized workshop queue delays and preserved engine health.',
    metricAr: 'توفير 30 دقيقة يومياً لكل سائق فحص',
    metricEn: '30 Mins Saved Per Driver Checkup',
    imageUrl: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&auto=format&fit=crop&q=80'
  }
];

export default function CustomerSuccessStories() {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [stories, setStories] = useState<SuccessStory[]>(() => {
    const stored = localStorage.getItem('saas_marketing_success_stories_v1');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return DEFAULT_SUCCESS_STORIES;
  });

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    fleetSize: '25',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('saas_marketing_success_stories_v1');
      if (stored) {
        try {
          setStories(JSON.parse(stored));
        } catch (e) {}
      } else {
        setStories(DEFAULT_SUCCESS_STORIES);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('marketing-data-updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('marketing-data-updated', handleStorageChange);
    };
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = language === 'ar' ? 'الاسم يجب أن يكون 3 أحرف على الأقل' : 'Name must be at least 3 characters';
    }
    
    if (!formData.company.trim() || formData.company.trim().length < 2) {
      newErrors.company = language === 'ar' ? 'اسم المنشأة/الورشة يجب أن يكون حرفين على الأقل' : 'Company/Workshop name must be at least 2 characters';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = language === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address';
    }
    
    const phoneRegex = /^[0-9+\s-]{8,15}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = language === 'ar' ? 'يرجى إدخال رقم هاتف صحيح (8-15 رقم)' : 'Please enter a valid phone number (8-15 digits)';
    }
    
    const fleetSizeNum = parseInt(formData.fleetSize, 10);
    if (!formData.fleetSize.trim() || isNaN(fleetSizeNum) || fleetSizeNum < 1) {
      newErrors.fleetSize = language === 'ar' ? 'يرجى تحديد حجم أسطول صحيح' : 'Please specify a valid fleet size';
    }
    
    if (!formData.message.trim() || formData.message.trim().length < 15) {
      newErrors.message = language === 'ar' ? 'الرسالة يجب أن تكون 15 حرفاً على الأقل لتوضيح طلبكم' : 'Message must be at least 15 characters to explain your request';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create new Lead object compatible with CRM Admin
      const leadId = 'lead-' + Date.now();
      const newLead = {
        id: leadId,
        name: formData.name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        fleetSize: parseInt(formData.fleetSize, 10) || 25,
        province: language === 'ar' ? 'المنطقة الوسطى' : 'Central Province',
        country: language === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia',
        notes: formData.message.trim(),
        status: 'new',
        date: new Date().toISOString().split('T')[0],
        communicationLogs: [
          {
            id: 'log-initial',
            date: new Date().toLocaleDateString('ar-SA') + ' ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            type: 'meeting',
            note: language === 'ar' 
              ? `طلب تواصل مباشر وارد عبر نموذج التذييل. حجم الأسطول: ${formData.fleetSize} مركبة.\nالرسالة:\n${formData.message}`
              : `Direct inquiry received via footer contact form. Fleet size: ${formData.fleetSize} vehicles.\nMessage:\n${formData.message}`,
            agent: language === 'ar' ? 'موقع الشركة' : 'System Bot'
          }
        ]
      };
      
      // Save to localStorage
      const existingLeadsStr = localStorage.getItem('saas_crm_leads_v1');
      let currentLeads = [];
      if (existingLeadsStr) {
        try {
          currentLeads = JSON.parse(existingLeadsStr);
        } catch(e) {}
      }
      
      const updatedLeads = [newLead, ...currentLeads];
      localStorage.setItem('saas_crm_leads_v1', JSON.stringify(updatedLeads));
      
      // Try saving to cloud Firestore
      try {
        await saveDocument('saas_leads', leadId, newLead);
      } catch (err) {
        console.warn("Cloud Firestore save skipped or failed:", err);
      }
      
      // Dispatch custom events to instantly refresh Admin panels if they are open
      window.dispatchEvent(new Event('marketing-data-updated'));
      window.dispatchEvent(new Event('storage'));
      
      // Success delay simulation for premium user experience
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        fleetSize: '25',
        message: ''
      });
      
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (stories.length === 0) return null;

  // Animation variants for container & cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 110,
        damping: 15
      }
    }
  };

  return (
    <section 
      id="success-stories-section" 
      className="bg-slate-900/60 dark:bg-slate-950/80 py-24 border-t border-slate-800/80 relative overflow-hidden"
    >
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/12 w-80 h-80 bg-brand-blue-500/8 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/12 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-wider">
            <Sparkles size={11} className="animate-pulse" />
            <span>{language === 'ar' ? 'شركاء المسار والنجاح' : 'Success Partnerships'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            {language === 'ar' ? 'قصص النجاح ونموذج التواصل المباشر' : 'Success Stories & Direct Inquiry'}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {language === 'ar' 
              ? 'تصفح دراسات الكفاءة الميدانية لعملائنا، أو أرسل استفسارك مباشرة ليتواصل معك خبير هندسة الأساطيل لدينا خلال دقائق معدودة.' 
              : 'Browse real fleet efficiency case studies, or submit an inquiry to speak directly with our diagnostics engineer.'}
          </p>
        </div>

        {/* 12-Column Responsive Layout: Stories Grid + Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Success Stories Grid (Col Span 8) */}
          <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
            <h3 className={`text-md font-black text-indigo-300 mb-4 flex items-center gap-2 ${isRtl ? 'justify-start' : 'justify-start'}`}>
              <Award size={18} />
              <span>{language === 'ar' ? 'قصص الكفاءة والأثر الرقمي' : 'Field Efficiency Records'}</span>
            </h3>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {stories.slice(0, 4).map((story) => (
                <motion.div
                  key={story.id}
                  variants={cardVariants}
                  whileHover={{ 
                    y: -8, 
                    boxShadow: "0 20px 40px -15px rgba(99, 102, 241, 0.12)" 
                  }}
                  className="bg-slate-950/40 backdrop-blur-md border border-slate-800/60 hover:border-indigo-500/30 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Card Image and Metric Tag */}
                  <div className="relative overflow-hidden aspect-video">
                    <img 
                      src={story.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800'} 
                      alt={language === 'ar' ? story.companyAr : story.companyEn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
                    
                    {/* Floating Metric Badge */}
                    <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} bg-indigo-950/90 backdrop-blur-xs border border-indigo-500/20 p-2 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md`}>
                      <Award size={12} className="text-indigo-400 shrink-0" />
                      <span className="text-[9px] font-extrabold text-white">
                        {language === 'ar' ? story.metricAr : story.metricEn}
                      </span>
                    </div>
                  </div>

                  {/* Card Contents */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3 text-right">
                    <div className="space-y-2">
                      
                      {/* Company Info Badge */}
                      <div className={`flex items-center gap-1.5 ${isRtl ? 'justify-end text-right' : 'justify-start text-left'}`}>
                        {isRtl ? (
                          <>
                            <span className="text-[10.5px] font-black text-indigo-400">
                              {story.companyAr}
                            </span>
                            <div className="w-4 h-4 rounded bg-indigo-950/60 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                              <BookOpen size={9} />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-4 h-4 rounded bg-indigo-950/60 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                              <BookOpen size={9} />
                            </div>
                            <span className="text-[10.5px] font-black text-indigo-400">
                              {story.companyEn}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className={`text-xs md:text-sm font-black text-white leading-snug group-hover:text-indigo-300 transition-colors ${isRtl ? 'text-right' : 'text-left'}`}>
                        {language === 'ar' ? story.titleAr : story.titleEn}
                      </h4>

                      {/* Body Paragraph */}
                      <p className={`text-[10.5px] text-slate-300 leading-relaxed font-sans line-clamp-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                        {language === 'ar' ? story.contentAr : story.contentEn}
                      </p>

                    </div>

                    {/* Bottom Interactive Arrow Link */}
                    <div className={`pt-3 border-t border-slate-900/60 flex items-center ${isRtl ? 'justify-between' : 'justify-between flex-row-reverse'}`}>
                      <span className="text-[9px] font-bold text-slate-500 group-hover:text-slate-400 transition-colors">
                        {language === 'ar' ? 'دراسة حالة تفصلية' : 'Case Study Details'}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white group-hover:bg-indigo-650 group-hover:border-indigo-500 flex items-center justify-center transition-all duration-300 shadow-md">
                        <ArrowUpRight size={12} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>

                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Contact Form Card (Col Span 5) */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <h3 className={`text-md font-black text-indigo-300 mb-4 flex items-center gap-2 ${isRtl ? 'justify-start' : 'justify-start'}`}>
              <Mail size={18} />
              <span>{language === 'ar' ? 'إرسال استفسار مباشر' : 'Quick Consulting Inquiry'}</span>
            </h3>

            <div className="bg-slate-950/50 backdrop-blur-md border border-slate-800/80 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden text-right">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {!submitSuccess ? (
                  <motion.form 
                    key="contact-form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmitInquiry}
                    className="space-y-4 text-right"
                    dir={isRtl ? 'rtl' : 'ltr'}
                  >
                    <div>
                      <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                        {language === 'ar'
                          ? 'تواصل مع مستشاري الأساطيل والصيانة لتلقي إجابة فورية، أو طلب نسخة تجريبية حية ومخصصة لشركتك.'
                          : 'Connect with our engineering advisors instantly to schedule a custom system demo.'}
                      </p>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                        <User size={12} className="text-indigo-400" />
                        <span>{language === 'ar' ? 'الاسم الثلاثي للاتصال' : 'Full Name'}</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={language === 'ar' ? 'مثال: م. فهد العتيبي' : 'e.g., Fahad Al-Otaibi'}
                          className={`w-full bg-slate-900/60 border ${errors.name ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} text-slate-100 placeholder-slate-600 rounded-xl py-2 px-3 text-[11px] transition-colors focus:outline-none`}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-[9px] text-rose-400 flex items-center gap-1 mt-0.5">
                          <AlertCircle size={10} />
                          <span>{errors.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Company / Workshop Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                        <Building size={12} className="text-indigo-400" />
                        <span>{language === 'ar' ? 'اسم المنشأة / الورشة' : 'Company / Workshop Name'}</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder={language === 'ar' ? 'مثال: شركة المسار المتميز للنقل' : 'e.g., Al-Masar Logistics LLC'}
                          className={`w-full bg-slate-900/60 border ${errors.company ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} text-slate-100 placeholder-slate-600 rounded-xl py-2 px-3 text-[11px] transition-colors focus:outline-none`}
                        />
                      </div>
                      {errors.company && (
                        <p className="text-[9px] text-rose-400 flex items-center gap-1 mt-0.5">
                          <AlertCircle size={10} />
                          <span>{errors.company}</span>
                        </p>
                      )}
                    </div>

                    {/* Grid of Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Email */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                          <Mail size={12} className="text-indigo-400" />
                          <span>{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</span>
                        </label>
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@company.com"
                          className={`w-full bg-slate-900/60 border ${errors.email ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} text-slate-100 placeholder-slate-600 rounded-xl py-2 px-3 text-[11px] transition-colors focus:outline-none`}
                        />
                        {errors.email && (
                          <p className="text-[9px] text-rose-400 flex items-center gap-1 mt-0.5">
                            <AlertCircle size={10} />
                            <span>{errors.email}</span>
                          </p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                          <PhoneIcon size={12} className="text-indigo-400" />
                          <span>{language === 'ar' ? 'رقم الجوال' : 'Phone Number'}</span>
                        </label>
                        <input 
                          type="text" 
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g., 0500000000"
                          className={`w-full bg-slate-900/60 border ${errors.phone ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} text-slate-100 placeholder-slate-600 rounded-xl py-2 px-3 text-[11px] transition-colors focus:outline-none`}
                        />
                        {errors.phone && (
                          <p className="text-[9px] text-rose-400 flex items-center gap-1 mt-0.5">
                            <AlertCircle size={10} />
                            <span>{errors.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Fleet Size Selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                        <Award size={12} className="text-indigo-400" />
                        <span>{language === 'ar' ? 'حجم الأسطول التقريبي (شاحنة/معدة)' : 'Estimated Fleet Size'}</span>
                      </label>
                      <select 
                        value={formData.fleetSize}
                        onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
                        className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none cursor-pointer"
                      >
                        <option value="5">1 - 10 {language === 'ar' ? 'مركبات' : 'vehicles'}</option>
                        <option value="25">11 - 50 {language === 'ar' ? 'مركبات' : 'vehicles'}</option>
                        <option value="100">51 - 200 {language === 'ar' ? 'مركبة' : 'vehicles'}</option>
                        <option value="500">201+ {language === 'ar' ? 'شاحنة ومعدة' : 'heavy fleet'}</option>
                      </select>
                    </div>

                    {/* Detailed Message */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                        <MessageSquare size={12} className="text-indigo-400" />
                        <span>{language === 'ar' ? 'تفاصيل الاستفسار / طلب التجربة' : 'Inquiry details / Demo request'}</span>
                      </label>
                      <textarea 
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={language === 'ar' ? 'يرجى توضيح التحدي التشغيلي الحالي أو ما تأملون تحقيقه عبر النظام...' : 'Please specify current fleet pain-points or objectives...'}
                        className={`w-full bg-slate-900/60 border ${errors.message ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} text-slate-100 placeholder-slate-600 rounded-xl py-2 px-3 text-[11px] transition-colors focus:outline-none resize-none`}
                      />
                      {errors.message && (
                        <p className="text-[9px] text-rose-400 flex items-center gap-1 mt-0.5">
                          <AlertCircle size={10} />
                          <span>{errors.message}</span>
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 disabled:bg-indigo-950 disabled:text-slate-500 text-white py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg active:scale-98 mt-2"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>{language === 'ar' ? 'جاري إرسال الطلب...' : 'Submitting Inquiry...'}</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>{language === 'ar' ? 'إرسال الاستفسار والربط بالـ CRM' : 'Send Inquiry & Link with CRM'}</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success-card"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="py-10 text-center space-y-5"
                  >
                    <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                      <CheckCircle2 size={36} className="animate-bounce" />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-base font-black text-white">
                        {language === 'ar' ? 'تم استلام استفساركم بنجاح!' : 'Inquiry Received Successfully!'}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                        {language === 'ar'
                          ? 'نشكركم لثقتكم بنا. تم ربط طلبكم فورياً بلوحة قيادة المبيعات والـ CRM برقم تتبع مخصص، وسيتصل بكم خبيرنا الفني قريباً.'
                          : 'Thank you for reaching out. Your request has been logged instantly in our Sales CRM dashboard. A diagnostics engineer will call you shortly.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(false)}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white px-5 py-2 rounded-xl text-[10.5px] font-black cursor-pointer transition-colors"
                    >
                      {language === 'ar' ? 'إرسال رسالة أخرى' : 'Send another message'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

