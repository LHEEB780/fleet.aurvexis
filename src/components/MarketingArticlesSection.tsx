import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Sparkles, 
  Clock, 
  Tag, 
  ArrowRight, 
  CheckCircle2, 
  Share2, 
  Copy, 
  Download, 
  X, 
  Calendar, 
  ChevronRight,
  Filter,
  Eye,
  Check,
  Globe2,
  FileText
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { ArticleShareModal } from './ArticleShareModal';

// Import high-fidelity local assets for fleet articles
import highwayLogisticsTruck from '../assets/images/highway_logistics_truck_1782935190395.jpg';
import driverTruckInspection from '../assets/images/driver_truck_inspection_1786784371761.jpg';
import aiFleetDiagnostics from '../assets/images/ai_fleet_diagnostics_1786785439472.jpg';
import mechanicTruckWorkshop from '../assets/images/mechanic_truck_workshop_1782935168167.jpg';
import dieselMaintenance from '../assets/images/diesel_maintenance_1783750031121.jpg';
import hydraulicServicing from '../assets/images/hydraulic_servicing_1783750041949.jpg';
import enterpriseFleetDepot from '../assets/images/enterprise_fleet_depot_1782935136613.jpg';

export interface MarketingArticle {
  id: string;
  title: string;
  titleEn?: string;
  category: string;
  categoryEn?: string;
  readTime: string;
  date: string;
  tags: string[];
  summary: string;
  content: string;
  author: string;
  status: 'published' | 'draft';
  isPublishedToMarketingSite?: boolean;
  image?: string;
  imageUrl?: string;
  imageSource?: string;
  imageCaption?: string;
  imageModel?: string;
  imagePrompt?: string;
}

export const CURATED_ARTICLE_IMAGES: { id: string; labelAr: string; labelEn: string; url: string }[] = [
  { id: 'img-highway', labelAr: 'شاحنات النقل اللوجستي السريع', labelEn: 'Highway Fleet Logistics', url: highwayLogisticsTruck },
  { id: 'img-inspection', labelAr: 'الفحص الميداني للشاحنات وQR', labelEn: 'Driver & QR Fleet Inspection', url: driverTruckInspection },
  { id: 'img-ai-diag', labelAr: 'تشخيص الأعطال بالذكاء الاصطناعي', labelEn: 'AI Fleet Diagnostics & Telemetry', url: aiFleetDiagnostics },
  { id: 'img-workshop', labelAr: 'ورشة صيانة الشاحنات الثقيلة', labelEn: 'Heavy Commercial Workshop', url: mechanicTruckWorkshop },
  { id: 'img-diesel', labelAr: 'صيانة محركات الديزل والحواقن', labelEn: 'Diesel Engine Diagnostics', url: dieselMaintenance },
  { id: 'img-hydraulic', labelAr: 'معايرة الأنظمة الهيدروليكية', labelEn: 'Hydraulic Systems Servicing', url: hydraulicServicing },
  { id: 'img-depot', labelAr: 'مستودعات ومركز انطلاق الأسطول', labelEn: 'Enterprise Logistics Depot', url: enterpriseFleetDepot },
];

export const DEFAULT_MARKETING_ARTICLES: MarketingArticle[] = [
  {
    id: 'art-1',
    title: 'الدليل الشامل للصيانة الوقائية للشاحنات والمعدات الثقيلة: خطة الـ 5 خطوات لتفادي الأعطال المفاجئة',
    titleEn: 'Comprehensive Preventive Maintenance Guide for Heavy Trucks & Fleet Assets',
    category: 'صيانة وقائية وأساطيل',
    categoryEn: 'Preventive Fleet Maintenance',
    readTime: '4 دقائق قراءة',
    date: '2026-09-12',
    tags: ['صيانة_الشاحنات', 'إدارة_الأساطيل', 'فحص_وقائي', 'محركات_الديزل'],
    summary: 'تعد الصيانة الوقائية الركيزة الأولى لاستدامة أساطيل النقل والمعدات الثقيلة؛ حيث توفر ما يزيد عن 35% من تكاليف الإصلاحات الطارئة وترفع العمر التشغيلي للمركبات.',
    content: `### مقدمة: لماذا تعد الصيانة الوقائية استثماراً وليست تكلفة؟
في قطاع النقل البري والمقاولات، يعني توقف شاحنة واحدة خسائر تشغيلية تتجاوز تكلفة الإصلاح الميكانيكي. الصيانة الوقائية المبرمجة تضمن جاهزية الأسطول بنسبة تتجاوز 95%.

#### المحور الأول: الفحص اليومي ما قبل الانطلاق (Pre-trip Inspection)
- قياس منسوب الزيوت وسوائل التبريد وفحص مضخة الهيدروليك.
- فحص ضغط الإطارات وعمق المداس لمنع الانفجارات الحرارية على الطرق السريعة.
- اختبار ضغط الهواء لمنظومة المكابح الهوائية (Air Brake System) والتأكد من عدم وجود تسريب.

#### المحور الثاني: دورات الصيانة المجدولة بناءً على الكيلومترات وساعات التشغيل
- كل 10,000 كم: استبدال زيت المحرك وفلاتر الوقود وفلتر الهواء الأساسي.
- كل 40,000 كم: فحص منظومة التعليق، ميزان الدوران، وتشحيم محاور الكردان.
- كل 80,000 كم: فحص كامل لناقل الحركة (القيربوكس) وسائل التوجيه الهيدروليكي واستبدال سائل الفرامل.

#### المحور الثالث: دور الرقمنة ونظام FleetAurvexis في حماية الأسطول
بفضل تفعيل بطاقة الفحص الفني الرقمية بنظام باركود QR، يستطيع السائق أو الفني إتمام الفحص في أقل من دقيقتين مع توثيق الصور والبيانات الحية، وتنبيه مدير الصيانة فوراً لأي خلل طارئ قبل تفاقمه.

#### الخلاصة ودعوة للعمل:
استدامة الأسطول تبدأ من الالتزام بالجدول الدوري. انضم إلى المنظومة الرقمية وارفع أمان أسطولك اليوم.`,
    author: 'بوت كتابة المقالات - FleetAurvexis AI',
    status: 'published',
    isPublishedToMarketingSite: true,
    image: highwayLogisticsTruck
  },
  {
    id: 'art-2',
    title: 'كيف ترفع مراكز الصيانة إنتاجيتها بنسبة 40% عبر الفحص الرقمي بنظام QR الذكي',
    titleEn: 'Boosting Workshop Productivity by 40% with Intelligent QR Digital Inspections',
    category: 'التحول الرقمي للورش',
    categoryEn: 'Workshop Digital Transformation',
    readTime: '3 دقائق قراءة',
    date: '2026-09-10',
    tags: ['فحص_رقمي', 'إدارة_الورش', 'باركود_QR', 'إنتاجية_الصيانة'],
    summary: 'استبدال النماذج الورقية بنظام بطاقات QR الممسوحة ذكياً يقضي على أخطاء الفحص ويسرع تسليم أوامر العمل وربط الفنيين بقطع الغيار الفورية.',
    content: `### التحول من الورق إلى الأتمتة الميدانية
عانت الورش التقليدية لسنوات من ضياع أوراق الفحص وبطء وصول التقارير للمشرفين، مما يتسبب في تأخر تسليم المركبات لأيام إضافية.

#### مزايا بطاقة الفحص الرقمية بـ QR:
1. مسح فوري بهاتف الفني دون الحاجة لتثبيت برامج معقدة.
2. تسجيل الأعطال وتصويرها حياً لرفع الموثوقية مع العميل.
3. الربط الفوري بمستودع قطع الغيار لتقليل زمن الانتظار.

#### النتائج الميدانية:
أظهرت النتائج ارتفاع سرعة معالجة أوامر العمل بنسبة 40%، وتقليص النزاعات مع ملاك المركبات بنسبة 85% بفضل التوثيق المصور الشفاف.`,
    author: 'بوت كتابة المقالات - FleetAurvexis AI',
    status: 'published',
    isPublishedToMarketingSite: true,
    image: driverTruckInspection
  },
  {
    id: 'art-3',
    title: '5 استراتيجيات مجربة لخفض استهلاك الوقود وتكاليف التشغيل لأساطيل النقل',
    titleEn: '5 Proven Strategies to Cut Fuel Consumption and Fleet Operational Costs',
    category: 'كفاءة الطاقة والتشغيل',
    categoryEn: 'Energy & Fuel Efficiency',
    readTime: '5 دقائق قراءة',
    date: '2026-09-08',
    tags: ['استهلاك_الوقود', 'تكاليف_التشغيل', 'أساطيل_النقل', 'سلوك_السائق'],
    summary: 'يشكل الوقود أكثر من 30% من تكاليف تشغيل الأساطيل. استعرض أهم الخطوات التقنية لتقليل هذا العبء المالي باستخدام مستشعرات الصيانة والتدريب الذكي.',
    content: `### تكلفة الوقود: التحدي الأكبر لمديري الأساطيل
مع ارتفاع تكاليف الوقود، تصبح أي نسبة توفير عاملاً حاسماً في ربحية الشركة واستمراريتها.

#### الاستراتيجيات الخمس الأساسية:
1. معايرة ضغط الإطارات بدقة لتفادي زيادة استهلاك الوقود واهتراء المداس بنسبة 10%.
2. مراقبة سلوك القيادة والتسارع العنيف وتجنب فترات التوقف مع تشغيل المحرك المفرط (Idling).
3. الصيانة الدورية لفلاتر الهواء وشمعات الاحتراق وحواقن الديزل.
4. تخطيط المسارات الذكي وتفادي الاختناقات المرورية وأوقات الذروة.
5. استخدام زيوت محركات تخليقية ذات لزوجة محسنة وشهادات جودة معتمدة.`,
    author: 'بوت كتابة المقالات - FleetAurvexis AI',
    status: 'published',
    isPublishedToMarketingSite: true,
    image: dieselMaintenance
  },
  {
    id: 'art-4',
    title: 'دور خوارزميات الذكاء الاصطناعي في التنبؤ المبكر بأعطال المحركات الهيدروليكية',
    titleEn: 'Predicting Hydraulic Failures in Heavy Equipment Using Telemetry & AI',
    category: 'فحص وتشخيص الذكاء الاصطناعي',
    categoryEn: 'AI Diagnostics & Sensors',
    readTime: '4 دقائق قراءة',
    date: '2026-09-05',
    tags: ['ذكاء_اصطناعي', 'تشخيص_الأعطال', 'هيدروليك', 'إنترنت_الأشياء'],
    summary: 'كيف تساهم تحليلات الحساسات الرقمية ونماذج الذكاء الاصطناعي في توقع انخفاض ضغط الزيت وانسداد فلاتر الضغط قبل توقف الآلية أثناء العمل.',
    content: `### عصر الصيانة التنبؤية في أساطيل المعدات الثقيلة
لم يعد مجدياً الانتظار حتى يتعطل النظام الهيدروليكي في موقع الإنشاء. تقنيات التنبؤ المبكر تمنح المهندسين إشعارات استباقية دقيقة.

#### كيف يعمل الفحص التنبؤي الذكي؟
- جمع نبضات الضغط ودرجات حرارة الزيت عبر حساسات الـ IoT.
- مقارنة القراءات ببيانات المصنع الأصلية لكل طراز رافعة أو شاحنة.
- إصدار أمر صيانة فوري للمستودع لحجز الفلاتر والقطع المناسبة.`,
    author: 'بوت كتابة المقالات - FleetAurvexis AI',
    status: 'published',
    isPublishedToMarketingSite: true,
    image: aiFleetDiagnostics
  }
];

interface MarketingArticlesSectionProps {
  onStartTrial?: () => void;
  brandPrimaryColor?: string;
}

export default function MarketingArticlesSection({
  onStartTrial,
  brandPrimaryColor = '#6d28d9'
}: MarketingArticlesSectionProps) {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [articles, setArticles] = useState<MarketingArticle[]>(() => {
    const saved = localStorage.getItem('saas_articles_catalog');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize default images if missing
          return parsed.map((art: any, index: number) => {
            const fallbackImg = CURATED_ARTICLE_IMAGES[index % CURATED_ARTICLE_IMAGES.length].url;
            return {
              ...art,
              image: art.image || art.imageUrl || fallbackImg,
              isPublishedToMarketingSite: art.isPublishedToMarketingSite !== false
            };
          });
        }
      } catch (e) {}
    }
    return DEFAULT_MARKETING_ARTICLES;
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<MarketingArticle | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [actionToast, setActionToast] = useState<string>('');

  // Sync with Admin panel articles updates
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('saas_articles_catalog');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setArticles(parsed.map((art: any, index: number) => {
              const fallbackImg = CURATED_ARTICLE_IMAGES[index % CURATED_ARTICLE_IMAGES.length].url;
              return {
                ...art,
                image: art.image || art.imageUrl || fallbackImg,
                isPublishedToMarketingSite: art.isPublishedToMarketingSite !== false
              };
            }));
          }
        } catch (e) {}
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('marketing-data-updated', handleSync);
    window.addEventListener('articles-catalog-updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('marketing-data-updated', handleSync);
      window.removeEventListener('articles-catalog-updated', handleSync);
    };
  }, []);

  // Filter only articles marked for public marketing display
  const publishedArticles = articles.filter(a => a.isPublishedToMarketingSite !== false && a.status !== 'draft');

  // Categories list
  const categories = [
    { id: 'all', labelAr: 'كافة المقالات', labelEn: 'All Articles' },
    { id: 'صيانة وقائية وأساطيل', labelAr: 'صيانة وقائية', labelEn: 'Preventive PM' },
    { id: 'التحول الرقمي للورش', labelAr: 'التحول الرقمي والـ QR', labelEn: 'Digital Inspections' },
    { id: 'كفاءة الطاقة والتشغيل', labelAr: 'كفاءة الوقود', labelEn: 'Fuel Efficiency' },
    { id: 'فحص وتشخيص الذكاء الاصطناعي', labelAr: 'الذكاء الاصطناعي', labelEn: 'AI Diagnostics' }
  ];

  const filteredArticles = publishedArticles.filter(art => {
    if (activeCategory === 'all') return true;
    return art.category === activeCategory || (art.categoryEn && art.categoryEn.toLowerCase().includes(activeCategory.toLowerCase()));
  });

  // Native apps share trigger (WhatsApp, WA Business, Telegram, Messenger, Facebook, X, Gmail, Device)
  const handleShareArticle = async (art: MarketingArticle) => {
    setSelectedArticle(art);
    // Try native share sheet first (supported on standalone mobile browsers)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: art.title,
          text: `${art.title}\n\n${art.summary || ''}\n\nمنصة FleetAurvexis`,
          url: window.location.href
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        // If browser iframe restricts native share, fall through to our apps share modal
      }
    }
    // Open dedicated apps share drawer with direct WhatsApp, WA Business, Telegram, Messenger, X, Gmail links
    setIsShareModalOpen(true);
  };

  return (
    <section id="articles-section" className="py-20 bg-slate-50/60 border-b border-purple-100/50 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-bold shadow-xs">
            <BookOpen size={13} className="text-purple-600" />
            <span>{language === 'ar' ? 'المدونة الهندسية والأدلة التشغيلية' : 'Engineering Blog & Technical Guides'}</span>
            <Sparkles size={12} className="text-amber-500 animate-pulse" />
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {language === 'ar' 
              ? 'رؤى هندسية متخصصة لصيانة وإدارة أساطيل النقل' 
              : 'Actionable Technical Insights for Fleet Operations & Maintenance'}
          </h2>

          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {language === 'ar'
              ? 'مقالات فنية وأدلة تطبيقية دورية مدعومة بالذكاء الاصطناعي مع صور احترافية لرفع جاهزية الأسطول، وترشيد استهلاك الوقود، وحوكمة الورش.'
              : 'Curated technical articles and field-tested playbooks drafted with AI assistance to optimize vehicle uptime, spare parts logistics, and maintenance audits.'}
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center justify-center gap-2 flex-wrap pb-2">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 scale-[1.02]'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <span>{language === 'ar' ? cat.labelAr : cat.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredArticles.map((art, idx) => (
            <motion.article
              key={art.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col group text-right"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Image Container with Hover Zoom */}
              <div className="relative h-52 overflow-hidden bg-slate-100">
                <img
                  src={art.image || highwayLogisticsTruck}
                  alt={art.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {/* Category & Read Time Pills */}
                <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-purple-900/80 backdrop-blur-md text-purple-200 text-[10.5px] font-bold rounded-lg border border-purple-300/30">
                    {language === 'ar' ? art.category : (art.categoryEn || art.category)}
                  </span>
                </div>

                <div className="absolute bottom-3.5 right-3.5 left-3.5 flex items-center justify-between text-white text-[11px] font-medium">
                  <div className="flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-md">
                    <Clock size={12} className="text-purple-300" />
                    <span>{art.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-md">
                    <Calendar size={12} className="text-purple-300" />
                    <span>{art.date}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* SEO Tags */}
                  {art.tags && art.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {art.tags.slice(0, 3).map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-mono font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-base md:text-lg leading-snug group-hover:text-purple-700 transition-colors line-clamp-2">
                    {art.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed line-clamp-3">
                    {art.summary}
                  </p>
                </div>

                {/* Card Footer: Author & Read CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Sparkles size={12} className="text-purple-500" />
                    <span className="line-clamp-1">{art.author}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedArticle(art)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors group/btn cursor-pointer"
                  >
                    <span>{language === 'ar' ? 'قراءة المقال' : 'Read Article'}</span>
                    <ArrowRight size={14} className={`${isRtl ? 'rotate-180' : ''} transform group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5 transition-transform`} />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
            <BookOpen size={36} className="mx-auto text-purple-400 opacity-60" />
            <h4 className="text-base font-bold text-slate-800">
              {language === 'ar' ? 'لا توجد مقالات منشورة في هذا التصنيف حالياً' : 'No articles available in this category yet'}
            </h4>
            <p className="text-xs text-slate-500">
              {language === 'ar' ? 'يمكنك تصفح كافة التصنيفات الأخرى أو توليد مقالات جديدة عبر استوديو المقالات في لوحة الإدارة.' : 'Check back soon or generate new articles via the Admin Studio.'}
            </p>
          </div>
        )}

      </div>

      {/* Interactive Full Article Reader Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 shadow-2xl relative my-auto"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Modal Header Cover Image */}
              <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden shrink-0">
                <img
                  src={selectedArticle.image || highwayLogisticsTruck}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 left-4 sm:top-5 sm:left-5 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer z-20 border border-white/20"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>

                {/* Article Header Metadata */}
                <div className="absolute bottom-5 right-5 left-5 space-y-2 text-white text-right">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-purple-600/90 text-white text-xs font-bold rounded-lg backdrop-blur-xs">
                      {selectedArticle.category}
                    </span>
                    <span className="px-2.5 py-1 bg-white/20 text-white text-[11px] font-mono rounded-lg backdrop-blur-xs flex items-center gap-1">
                      <Clock size={12} />
                      <span>{selectedArticle.readTime}</span>
                    </span>
                    <span className="px-2.5 py-1 bg-white/20 text-white text-[11px] font-mono rounded-lg backdrop-blur-xs flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{selectedArticle.date}</span>
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight text-white drop-shadow-sm">
                    {selectedArticle.title}
                  </h2>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-right">
                
                {/* Toolbar (Share Article Only) */}
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Apps Share Button (Opens mobile apps drawer: WhatsApp, WA Business, Telegram, Messenger, Facebook, X, Gmail, Device) */}
                      <button
                        type="button"
                        onClick={() => handleShareArticle(selectedArticle)}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
                        title={language === 'ar' ? 'مشاركة عبر تطبيقات الموبايل (واتساب، تليجرام، فيسبوك...)' : 'Share via mobile apps'}
                      >
                        <Share2 size={16} />
                        <span>{language === 'ar' ? 'مشاركة المقال' : 'Share Article'}</span>
                      </button>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-purple-600" />
                      <span>{language === 'ar' ? 'الناشر الرسمي:' : 'Author:'}</span>
                      <strong className="text-slate-800">{selectedArticle.author}</strong>
                    </div>
                  </div>

                  {/* Feedback Toast Notification Banner */}
                  {actionToast && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs"
                    >
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                      <span>{actionToast}</span>
                    </motion.div>
                  )}
                </div>

                {/* Executive Summary Callout */}
                <div className="bg-purple-50/70 border-r-4 border-purple-600 p-4 rounded-xl text-slate-700 text-xs sm:text-sm leading-relaxed">
                  <span className="font-black text-purple-900 block mb-1 text-xs">
                    {language === 'ar' ? '💡 ملخص ومستخلص المقال:' : 'Executive Abstract:'}
                  </span>
                  {selectedArticle.summary}
                </div>

                {/* Full Article Text */}
                <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed whitespace-pre-line font-sans space-y-3">
                  {selectedArticle.content}
                </div>

                {/* SEO Tags */}
                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400 font-bold">{language === 'ar' ? 'الوسوم والكلمات المفتاحية:' : 'Tags:'}</span>
                    {selectedArticle.tags.map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-purple-700 rounded-lg text-xs font-mono font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Conversion In-Article CTA Banner */}
                <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white rounded-2xl p-6 text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <h4 className="font-black text-base md:text-lg text-white">
                      {language === 'ar' ? 'هل ترغب في تطبيق هذه المعايير على أسطولك؟' : 'Ready to apply these practices to your fleet?'}
                    </h4>
                    <p className="text-xs text-purple-200/90 leading-relaxed">
                      {language === 'ar' 
                        ? 'احجز عرضاً تجريبياً مجانياً واكتشف كيف يساعدك نظام FleetAurvexis في حوكمة الصيانة وخفض التكاليف.' 
                        : 'Schedule a dynamic demo and see FleetAurvexis diagnostics in real-world action.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedArticle(null);
                      if (onStartTrial) onStartTrial();
                    }}
                    className="px-6 py-3 bg-white text-purple-900 hover:bg-purple-50 font-black rounded-xl text-xs shadow-md transition cursor-pointer shrink-0"
                  >
                    {language === 'ar' ? 'ابدأ تجربة مجانية الآن' : 'Start Free Trial'}
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apps Sharing Sheet (WhatsApp, WA Business, Telegram, Messenger, Facebook, X, Gmail, Device) */}
      <ArticleShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        article={selectedArticle}
        language={language}
      />
    </section>
  );
}
