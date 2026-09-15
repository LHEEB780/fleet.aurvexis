import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  Globe2,
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  FileText,
  Clock,
  Tag,
  BookOpen,
  Calendar,
  Share2,
  Copy,
  Download,
  X,
  Check,
  Search,
  Filter,
  Layers,
  Wand2,
  Sliders,
  ExternalLink,
  ChevronLeft,
  Camera,
  UploadCloud,
  AlertCircle
} from 'lucide-react';
import { MarketingArticle, CURATED_ARTICLE_IMAGES, DEFAULT_MARKETING_ARTICLES } from './MarketingArticlesSection';
import { ArticleShareModal } from './ArticleShareModal';

// Curated Fleet & Machinery Photography Assets
import heavyMachineryRepair from '../assets/images/heavy_machinery_repair_1783750018560.jpg';
import dieselMaintenance from '../assets/images/diesel_maintenance_1783750031121.jpg';
import hydraulicServicing from '../assets/images/hydraulic_servicing_1783750041949.jpg';
import constructionHeavyMachinery from '../assets/images/construction_heavy_machinery_1782935156246.jpg';
import mechanicTruckWorkshop from '../assets/images/mechanic_truck_workshop_1782935168167.jpg';
import highwayLogisticsTruck from '../assets/images/highway_logistics_truck_1782935190395.jpg';
import driverTruckInspection from '../assets/images/driver_truck_inspection_1786784371761.jpg';
import aiFleetDiagnostics from '../assets/images/ai_fleet_diagnostics_1786785439472.jpg';
import enterpriseFleetDepot from '../assets/images/enterprise_fleet_depot_1782935136613.jpg';
import municipalCleanFleet from '../assets/images/municipal_clean_fleet_1782935178050.jpg';
import municipalWorkshopParts from '../assets/images/municipal_workshop_parts_1786785099442.jpg';

export interface ExtendedLibraryItem {
  id: string;
  labelAr: string;
  labelEn: string;
  category: 'fleet' | 'inspection' | 'engine' | 'workshop' | 'heavy' | 'diagnostics';
  categoryLabelAr: string;
  url: string;
  aspect: string;
}

export const EXTENDED_FLEET_IMAGE_LIBRARY: ExtendedLibraryItem[] = [
  {
    id: 'lib-highway',
    labelAr: 'شاحنات النقل اللوجستي السريع على الخط الدولي',
    labelEn: 'Highway Logistics Commercial Fleet',
    category: 'fleet',
    categoryLabelAr: 'أساطيل وشاحنات',
    url: highwayLogisticsTruck,
    aspect: '16:9'
  },
  {
    id: 'lib-inspection',
    labelAr: 'الفحص الميداني للشاحنات عبر بطاقة QR الذكية',
    labelEn: 'Field QR & Driver Vehicle Inspection',
    category: 'inspection',
    categoryLabelAr: 'فحص وQR',
    url: driverTruckInspection,
    aspect: '16:9'
  },
  {
    id: 'lib-ai-diag',
    labelAr: 'تشخيص الأعطال بالذكاء الاصطناعي وتتبع الحساسات',
    labelEn: 'AI Fleet Diagnostics & Sensor Telemetry',
    category: 'diagnostics',
    categoryLabelAr: 'تشخيص وذكاء اصطناعي',
    url: aiFleetDiagnostics,
    aspect: '16:9'
  },
  {
    id: 'lib-workshop',
    labelAr: 'ورشة صيانة الشاحنات الثقيلة والمعدات الكبرى',
    labelEn: 'Commercial Heavy Trucks Workshop',
    category: 'workshop',
    categoryLabelAr: 'ورش وميكانيكا',
    url: mechanicTruckWorkshop,
    aspect: '16:9'
  },
  {
    id: 'lib-diesel',
    labelAr: 'صيانة محركات الديزل 6 سلندر وتصفية الحواقن',
    labelEn: 'Diesel Engine Diagnostics & Injectors',
    category: 'engine',
    categoryLabelAr: 'محركات وهيدروليك',
    url: dieselMaintenance,
    aspect: '16:9'
  },
  {
    id: 'lib-hydraulic',
    labelAr: 'معايرة الأنظمة وصمامات الضغط الهيدروليكي',
    labelEn: 'Hydraulic Systems & Pressure Valves Servicing',
    category: 'engine',
    categoryLabelAr: 'محركات وهيدروليك',
    url: hydraulicServicing,
    aspect: '16:9'
  },
  {
    id: 'lib-depot',
    labelAr: 'مستودع الأسطول ومركز التشغيل اللوجستي المركزي',
    labelEn: 'Central Fleet Logistics Depot & Yard',
    category: 'fleet',
    categoryLabelAr: 'أساطيل وشاحنات',
    url: enterpriseFleetDepot,
    aspect: '16:9'
  },
  {
    id: 'lib-heavy-machinery',
    labelAr: 'صيانة آليات الإنشاء والحفارات التعدينية الثقيلة',
    labelEn: 'Mining & Construction Heavy Machinery Repair',
    category: 'heavy',
    categoryLabelAr: 'معدات ثقيلة',
    url: heavyMachineryRepair,
    aspect: '16:9'
  },
  {
    id: 'lib-construction',
    labelAr: 'معدات المشاريع والبنية التحتية والرافعات الكبرى',
    labelEn: 'Infrastructure Construction Machinery & Cranes',
    category: 'heavy',
    categoryLabelAr: 'معدات ثقيلة',
    url: constructionHeavyMachinery,
    aspect: '16:9'
  },
  {
    id: 'lib-municipal',
    labelAr: 'أسطول الخدمات البلدية والحضرية الذكي',
    labelEn: 'Municipal Urban Services & Maintenance Fleet',
    category: 'fleet',
    categoryLabelAr: 'أساطيل وشاحنات',
    url: municipalCleanFleet,
    aspect: '16:9'
  },
  {
    id: 'lib-parts',
    labelAr: 'مستودع قطع الغيار والرفوف الذكية المنظمة',
    labelEn: 'Organized Smart Spare Parts Warehouse',
    category: 'workshop',
    categoryLabelAr: 'ورش وميكانيكا',
    url: municipalWorkshopParts,
    aspect: '16:9'
  }
];

interface MarketingArticlesManagerProps {
  language: 'ar' | 'en';
  brandPrimaryColor?: string;
  publishedArticles: MarketingArticle[];
  setPublishedArticles: React.Dispatch<React.SetStateAction<MarketingArticle[]>>;
  selectedArticleForView: MarketingArticle | null;
  setSelectedArticleForView: (art: MarketingArticle | null) => void;
  onPublishToggle: (articleId: string) => void;
  onChangeArticleImage: (articleId: string, newImage: string, meta?: any) => void;
  onGenerateNewArticle: (topic?: string) => void;
}

export const MarketingArticlesManager: React.FC<MarketingArticlesManagerProps> = ({
  language,
  brandPrimaryColor = '#7c3aed',
  publishedArticles,
  setPublishedArticles,
  selectedArticleForView,
  setSelectedArticleForView,
  onPublishToggle,
  onChangeArticleImage,
  onGenerateNewArticle
}) => {
  const isRtl = language === 'ar';

  // Active article being edited in composer
  const [activeArticleId, setActiveArticleId] = useState<string>(() => {
    return selectedArticleForView?.id || publishedArticles[0]?.id || '';
  });

  const currentArticle = publishedArticles.find(a => a.id === activeArticleId) || publishedArticles[0] || null;

  // Local form state for active article
  const [formData, setFormData] = useState({
    title: currentArticle?.title || '',
    titleEn: currentArticle?.titleEn || '',
    category: currentArticle?.category || 'صيانة وقائية وأساطيل',
    categoryEn: currentArticle?.categoryEn || 'Preventive Fleet Maintenance',
    readTime: currentArticle?.readTime || '4 دقائق قراءة',
    author: currentArticle?.author || 'فريق التحرير الهندسي - FleetAurvexis',
    summary: currentArticle?.summary || '',
    content: currentArticle?.content || '',
    tags: currentArticle?.tags ? currentArticle.tags.join(', ') : '',
    image: currentArticle?.image || highwayLogisticsTruck,
    imageUrl: currentArticle?.imageUrl || currentArticle?.image || highwayLogisticsTruck,
    isPublishedToMarketingSite: currentArticle?.isPublishedToMarketingSite !== false,
    imageSource: currentArticle?.imageSource || 'library',
    imageCaption: currentArticle?.imageCaption || '',
    imageModel: currentArticle?.imageModel || ''
  });

  // When activeArticleId changes or publishedArticles updates, synchronize form data
  useEffect(() => {
    if (currentArticle) {
      setFormData({
        title: currentArticle.title || '',
        titleEn: currentArticle.titleEn || '',
        category: currentArticle.category || 'صيانة وقائية وأساطيل',
        categoryEn: currentArticle.categoryEn || 'Preventive Fleet Maintenance',
        readTime: currentArticle.readTime || '4 دقائق قراءة',
        author: currentArticle.author || 'فريق التحرير الهندسي - FleetAurvexis',
        summary: currentArticle.summary || '',
        content: currentArticle.content || '',
        tags: currentArticle.tags ? currentArticle.tags.join(', ') : '',
        image: currentArticle.image || highwayLogisticsTruck,
        imageUrl: currentArticle.imageUrl || currentArticle.image || highwayLogisticsTruck,
        isPublishedToMarketingSite: currentArticle.isPublishedToMarketingSite !== false,
        imageSource: currentArticle.imageSource || 'library',
        imageCaption: currentArticle.imageCaption || '',
        imageModel: currentArticle.imageModel || ''
      });
    }
  }, [activeArticleId, currentArticle]);

  // Image Selection & Generation Tabs: 'library' | 'imagen' | 'url'
  const [imageTab, setImageTab] = useState<'library' | 'imagen' | 'url'>('library');

  // Library category filter
  const [libraryCategory, setLibraryCategory] = useState<string>('all');

  // Imagen AI generator states
  const [imagenPrompt, setImagenPrompt] = useState<string>('');
  const [imagenAspectRatio, setImagenAspectRatio] = useState<'16:9' | '4:3' | '1:1'>('16:9');
  const [imagenStyle, setImagenStyle] = useState<string>('photorealistic');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [generatedPreview, setGeneratedPreview] = useState<{
    imageUrl: string;
    modelUsed: string;
    modelLabel: string;
    promptUsed: string;
    source: 'imagen_ai' | 'library';
  } | null>(null);

  // Custom URL state
  const [customUrlInput, setCustomUrlInput] = useState<string>('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string>('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Full Live Article Preview Modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [shareModalData, setShareModalData] = useState<any | null>(null);

  const handlePreviewShare = async () => {
    const title = formData.title || 'مقال FleetAurvexis';
    const text = `${title}\n\n${formData.summary || ''}\n\nمنصة FleetAurvexis لإدارة الأساطيل والصيانة`;
    const url = window.location.href;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    setShareModalData({
      title: formData.title || 'مقال منصة FleetAurvexis',
      summary: formData.summary,
      content: formData.content,
      category: formData.category,
      author: formData.author
    });
  };

  const [allActivatedInManager, setAllActivatedInManager] = useState<boolean>(false);

  const handleActivateAllArticlesInManager = () => {
    try {
      const updated = publishedArticles.map(art => ({
        ...art,
        isPublishedToMarketingSite: true,
        status: 'published' as const
      }));
      setPublishedArticles(updated);
      localStorage.setItem('saas_articles_catalog', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('marketing-data-updated'));
      window.dispatchEvent(new CustomEvent('articles-catalog-updated'));
      setAllActivatedInManager(true);
      showToast(
        language === 'ar'
          ? `✓ تم تفعيل ونشر كافة المقالات (${updated.length} مقال) حياً على المنصة!`
          : `✓ All ${updated.length} articles activated & published live!`
      );
      setTimeout(() => setAllActivatedInManager(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Search & Filter for Articles Vault
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Quick prompt inspirations for heavy fleet & transport engineering
  const quickPrompts = [
    {
      titleAr: '🚛 شاحنة على طريق دولي',
      prompt: 'A sleek modern commercial heavy transport truck cruising on an asphalt highway at sunset, cinematic lighting, photorealistic 8k, professional automotive editorial photography.'
    },
    {
      titleAr: '🔍 فحص QR وفني ميداني',
      prompt: 'A professional fleet technician in safety gear scanning a digital vehicle QR inspection tag on a heavy commercial truck with a rugged tablet, modern workshop background, crisp photography.'
    },
    {
      titleAr: '⚙️ محرك ديزل مفكك',
      prompt: 'Close-up high detailed engineering photograph of a high-power 6-cylinder heavy truck diesel engine being inspected in an ultra-clean modern mechanical workshop, pristine lighting.'
    },
    {
      titleAr: '💧 أنظمة هيدروليكية',
      prompt: 'A technician adjusting hydraulic pressure hoses and valves on a yellow heavy industrial construction excavator, digital pressure gauges visible, crisp focus, cinematic workshop lighting.'
    },
    {
      titleAr: '🏢 مستودع أسطول مركزي',
      prompt: 'High angle commercial photograph of a large enterprise logistics fleet depot with dozens of transport trucks neatly aligned under morning sunlight, state-of-the-art facility.'
    },
    {
      titleAr: '⚡ فحص فرامل وحساسات',
      prompt: 'Detailed automotive photography of a heavy truck disc brake and air suspension system being tested with advanced electronic diagnostic sensors in a modern service bay.'
    }
  ];

  // Filter library items
  const filteredLibraryItems = EXTENDED_FLEET_IMAGE_LIBRARY.filter(item => {
    if (libraryCategory === 'all') return true;
    return item.category === libraryCategory;
  });

  // Filter articles vault
  const filteredVaultArticles = publishedArticles.filter(art => {
    const matchesSearch = searchQuery === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.titleEn && art.titleEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (art.tags && art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'published' ? (art.isPublishedToMarketingSite !== false && art.status !== 'draft') :
      (art.isPublishedToMarketingSite === false || art.status === 'draft');

    return matchesSearch && matchesStatus;
  });

  // Handle Imagen AI Generation Call
  const handleGenerateImagen = async () => {
    const promptToUse = imagenPrompt.trim() || formData.title || 'شاحنة نقل ثقيل في مركز صيانة متطور';
    setIsGeneratingImage(true);
    setGeneratedPreview(null);

    try {
      const response = await fetch('/api/ai/generate-article-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          topic: formData.title,
          aspectRatio: imagenAspectRatio,
          style: imagenStyle
        })
      });

      const data = await response.json();

      if (data.imageUrl) {
        setGeneratedPreview({
          imageUrl: data.imageUrl,
          modelUsed: data.modelUsed || 'imagen-3.0-generate-002',
          modelLabel: data.modelLabel || 'Google Imagen 3 AI',
          promptUsed: data.promptUsed || promptToUse,
          source: 'imagen_ai'
        });
        showToast(language === 'ar' ? '✨ تم توليد الصورة بنجاح بواسطة Imagen AI!' : '✨ Image generated successfully with Imagen AI!');
      } else if (data.fallbackKey) {
        // Map fallback key to high-res local asset
        let matchedUrl = highwayLogisticsTruck;
        if (data.fallbackKey === 'diesel') matchedUrl = dieselMaintenance;
        else if (data.fallbackKey === 'hydraulic') matchedUrl = hydraulicServicing;
        else if (data.fallbackKey === 'inspection') matchedUrl = driverTruckInspection;
        else if (data.fallbackKey === 'ai-diag') matchedUrl = aiFleetDiagnostics;
        else if (data.fallbackKey === 'workshop') matchedUrl = mechanicTruckWorkshop;
        else if (data.fallbackKey === 'depot') matchedUrl = enterpriseFleetDepot;
        else if (data.fallbackKey === 'heavy-machinery') matchedUrl = heavyMachineryRepair;
        else if (data.fallbackKey === 'municipal') matchedUrl = municipalCleanFleet;

        setGeneratedPreview({
          imageUrl: matchedUrl,
          modelUsed: data.modelUsed || 'مكتبة الأصول المعتمدة',
          modelLabel: data.modelLabel || 'Fleet Verified Asset',
          promptUsed: data.promptUsed || promptToUse,
          source: 'library'
        });
        showToast(language === 'ar' ? '✓ تم تحضير الصورة المتوافقة مع سياق المقال' : '✓ Contextual image prepared for article');
      }
    } catch (err) {
      console.error('Failed to generate image via API', err);
      // Fallback locally
      const fallbackUrl = EXTENDED_FLEET_IMAGE_LIBRARY[Math.floor(Math.random() * EXTENDED_FLEET_IMAGE_LIBRARY.length)].url;
      setGeneratedPreview({
        imageUrl: fallbackUrl,
        modelUsed: 'Fleet Verified Engine',
        modelLabel: 'Fleet Verified Asset',
        promptUsed: promptToUse,
        source: 'library'
      });
      showToast(language === 'ar' ? '✓ تم تجهيز صورة عالية الدقة من مكتبة الأصول' : '✓ High-res image prepared from asset library');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Merge the selected or generated image into the article
  const handleMergeImageToArticle = (
    imageUrl: string, 
    source: 'library' | 'imagen_ai' | 'custom_url', 
    model?: string,
    prompt?: string
  ) => {
    setFormData(prev => ({
      ...prev,
      image: imageUrl,
      imageUrl: imageUrl,
      imageSource: source,
      imageModel: model || prev.imageModel,
      imageCaption: prompt ? (prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt) : prev.imageCaption
    }));

    if (currentArticle) {
      onChangeArticleImage(currentArticle.id, imageUrl, {
        imageSource: source,
        imageModel: model,
        imagePrompt: prompt
      });
    }

    showToast(
      language === 'ar' 
        ? '✓ تم دمج الصورة بنجاح مع المقال واعتمادها كغلاف رئيسي!' 
        : '✓ Image integrated as article primary cover!'
    );
  };

  // Option to insert image markdown directly into content body
  const handleInsertImageIntoContent = (imageUrl: string, label: string) => {
    const markdownImg = `\n\n![${label || 'صورة توضيحية للمقال'}](${imageUrl})\n*${label || 'صورة توضيحية لعمليات الأسطول والهندسة الميدانية'}*\n\n`;
    setFormData(prev => ({
      ...prev,
      content: prev.content + markdownImg
    }));
    showToast(language === 'ar' ? '✓ تم إدراج كود الصورة داخل متن المقال (Markdown)' : '✓ Image markdown inserted into article content');
  };

  // Save the article changes
  const handleSaveArticle = () => {
    if (!formData.title.trim()) {
      showToast(language === 'ar' ? '⚠️ يرجى إدخال عنوان المقال أولاً' : '⚠️ Please enter article title');
      return;
    }

    const tagsArray = formData.tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);

    const updatedArticles = publishedArticles.map(art => {
      if (art.id === activeArticleId) {
        return {
          ...art,
          title: formData.title.trim(),
          titleEn: formData.titleEn.trim() || undefined,
          category: formData.category,
          categoryEn: formData.categoryEn || undefined,
          readTime: formData.readTime,
          author: formData.author,
          summary: formData.summary.trim(),
          content: formData.content.trim(),
          tags: tagsArray,
          image: formData.image,
          imageUrl: formData.imageUrl,
          isPublishedToMarketingSite: formData.isPublishedToMarketingSite,
          imageSource: formData.imageSource,
          imageCaption: formData.imageCaption,
          imageModel: formData.imageModel,
          status: formData.isPublishedToMarketingSite ? ('published' as const) : ('draft' as const)
        };
      }
      return art;
    });

    setPublishedArticles(updatedArticles);
    localStorage.setItem('saas_articles_catalog', JSON.stringify(updatedArticles));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('marketing-data-updated'));
    window.dispatchEvent(new CustomEvent('articles-catalog-updated'));

    showToast(language === 'ar' ? '✓ تم حفظ وتحديث بيانات المقال والصور بنجاح!' : '✓ Article and image data saved successfully!');
  };

  // Create a brand new blank article
  const handleCreateNewBlankArticle = () => {
    const newId = `art-${Date.now()}`;
    const defaultImg = EXTENDED_FLEET_IMAGE_LIBRARY[0].url;
    const newArt: MarketingArticle = {
      id: newId,
      title: language === 'ar' ? 'عنوان المقال الفني الجديد' : 'New Fleet Technical Article',
      titleEn: 'New Technical Playbook',
      category: 'صيانة وقائية وأساطيل',
      categoryEn: 'Preventive Fleet Maintenance',
      readTime: '3 دقائق قراءة',
      date: new Date().toISOString().split('T')[0],
      tags: ['صيانة', 'أساطيل', 'تقنية'],
      summary: language === 'ar' ? 'اكتب ملخصاً تنفيذياً جذاباً للمقال يستعرض الفوائد التشغيلية...' : 'Write an executive abstract...',
      content: language === 'ar' 
        ? `### مقدمة المقال\nأدخل هنا تفاصيل التحليل الفني، والتوصيات الميدانية للأساطيل والمعدات الثقيلة.\n\n#### المحور الأول: الإجراءات الوقائية\n- فحص دوري.\n- توثيق رقمي.\n\n#### الخلاصة\nالتطبيق المستمر يضمن جاهزية العمليات التشغيلية.`
        : `### Introduction\nAdd your technical analysis and field recommendations here.`,
      author: 'فريق التحرير الهندسي - FleetAurvexis',
      status: 'draft',
      isPublishedToMarketingSite: false,
      image: defaultImg,
      imageUrl: defaultImg,
      imageSource: 'library'
    };

    const updated = [newArt, ...publishedArticles];
    setPublishedArticles(updated);
    setActiveArticleId(newId);
    localStorage.setItem('saas_articles_catalog', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('marketing-data-updated'));
    window.dispatchEvent(new CustomEvent('articles-catalog-updated'));

    showToast(language === 'ar' ? '✓ تم إنشاء مسودة مقال جديد! يمكنك اختيار صورته والبدء بالصياغة' : '✓ New article draft created!');
  };

  // Delete an article
  const handleDeleteArticle = (idToDelete: string) => {
    if (publishedArticles.length <= 1) {
      showToast(language === 'ar' ? '⚠️ لا يمكن حذف المقال الأخير في النظام' : '⚠️ Cannot delete the last article');
      return;
    }

    const updated = publishedArticles.filter(a => a.id !== idToDelete);
    setPublishedArticles(updated);
    if (activeArticleId === idToDelete) {
      setActiveArticleId(updated[0].id);
    }
    localStorage.setItem('saas_articles_catalog', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('marketing-data-updated'));
    window.dispatchEvent(new CustomEvent('articles-catalog-updated'));

    showToast(language === 'ar' ? '✓ تم حذف المقال من المستودع' : '✓ Article deleted');
  };

  // Restore defaults
  const handleRestoreDefaults = () => {
    setPublishedArticles(DEFAULT_MARKETING_ARTICLES);
    setActiveArticleId(DEFAULT_MARKETING_ARTICLES[0].id);
    localStorage.setItem('saas_articles_catalog', JSON.stringify(DEFAULT_MARKETING_ARTICLES));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('marketing-data-updated'));
    window.dispatchEvent(new CustomEvent('articles-catalog-updated'));
    showToast(language === 'ar' ? '✓ تم استعادة المقالات الافتراضية للنظام' : '✓ Default articles restored');
  };

  return (
    <div className="space-y-6 text-right" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white border border-purple-500/50 shadow-2xl px-5 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-md"
          >
            <Sparkles size={16} className="text-amber-400 animate-pulse" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Card: Title, Stats & Primary Action Buttons */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[10px] font-black flex items-center gap-1">
                <BookOpen size={12} />
                <span>{language === 'ar' ? 'وحدة إدارة ونشر المقالات' : 'Article Publishing Studio'}</span>
              </span>
              <span className="p-1 px-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-black flex items-center gap-1">
                <Wand2 size={11} className="text-amber-600" />
                <span>Google Imagen 3 AI</span>
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-900">
              {language === 'ar' ? 'إدارة المقالات، توليد صور Imagen، والدمج قبل النشر' : 'Manage Articles, Imagen Generation & Media Merging'}
            </h3>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              {language === 'ar'
                ? 'تحكم كامل في مقالات المدونة الهندسية للموقع التسويقي. يمكنك صياغة المقالات، واختيار صور عالية الدقة من المكتبة أو توليد صور فوتوغرافية احترافية بالذكاء الاصطناعي (Imagen)، ودمجها مباشرة مع المقال قبل اعتماده ونشره للجمهور.'
                : 'Full control over technical marketing articles. Draft content, choose high-resolution assets from our verified fleet library or generate AI photography via Imagen, and merge them seamlessly before publishing live.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCreateNewBlankArticle}
              className="p-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl shadow-xs hover:shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Plus size={14} />
              <span>{language === 'ar' ? 'صياغة مقال جديد' : 'New Article'}</span>
            </button>

            <button
              type="button"
              onClick={() => onGenerateNewArticle(formData.title || 'صيانة الشاحنات الثقيلة')}
              className="p-2.5 px-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={13} className="text-indigo-600" />
              <span>{language === 'ar' ? 'توليد مسودة بالذكاء الاصطناعي' : 'Generate AI Article'}</span>
            </button>

            <button
              type="button"
              onClick={handleActivateAllArticlesInManager}
              className={`p-2.5 px-3.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border shadow-xs active:scale-95 ${
                allActivatedInManager
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
              title={language === 'ar' ? 'تفعيل ونشر كافة المقالات والمسودات حياً على الموقع فوراً' : 'Activate & publish all articles live'}
            >
              <CheckCircle2 size={13} className={allActivatedInManager ? 'text-white' : 'text-emerald-600'} />
              <span>
                {allActivatedInManager
                  ? (language === 'ar' ? '✓ تم تفعيل جميع المقالات' : '✓ All Live')
                  : (language === 'ar' ? 'تفعيل جميع المقالات' : 'Activate All Articles')}
              </span>
            </button>

            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="p-2.5 px-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
              title={language === 'ar' ? 'استعادة المقالات الافتراضية' : 'Restore defaults'}
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-bold block">{language === 'ar' ? 'إجمالي المقالات' : 'Total Articles'}</span>
            <span className="text-base font-black text-slate-900 font-mono">{publishedArticles.length}</span>
          </div>

          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
            <span className="text-[10px] text-emerald-700 font-bold block">{language === 'ar' ? 'منشور على الموقع التسويقي' : 'Published Live'}</span>
            <span className="text-base font-black text-emerald-800 font-mono">
              {publishedArticles.filter(a => a.isPublishedToMarketingSite !== false && a.status !== 'draft').length}
            </span>
          </div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
            <span className="text-[10px] text-amber-700 font-bold block">{language === 'ar' ? 'المسودات قيد الإعداد' : 'Drafts in Progress'}</span>
            <span className="text-base font-black text-amber-800 font-mono">
              {publishedArticles.filter(a => a.isPublishedToMarketingSite === false || a.status === 'draft').length}
            </span>
          </div>

          <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100">
            <span className="text-[10px] text-purple-700 font-bold block">{language === 'ar' ? 'صور Imagen والمكتبة' : 'Integrated Assets'}</span>
            <span className="text-base font-black text-purple-900 font-mono">
              {EXTENDED_FLEET_IMAGE_LIBRARY.length}+ صورة متاحة
            </span>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKFLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / PRIMARY COLUMN: ARTICLE COMPOSER & IMAGE INTEGRATION HUB (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. ARTICLE METADATA FORM */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-purple-600" />
                <h4 className="text-sm font-black text-slate-900">
                  {language === 'ar' ? 'بيانات وصياغة المقال الفني' : 'Article Drafting & Metadata'}
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                ID: {activeArticleId}
              </span>
            </div>

            <div className="space-y-4">
              {/* Title Arabic */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'عنوان المقال الرئيسي (باللغة العربية):' : 'Article Title (Arabic):'}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: الدليل الشامل للصيانة الوقائية للشاحنات الثقيلة..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none transition"
                />
              </div>

              {/* Title English & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'العنوان بالإنجليزية (English Title):' : 'English Title:'}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formData.titleEn}
                    onChange={e => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="E.g., Comprehensive Heavy Fleet Maintenance Guide..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-purple-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'تصنيف المقال:' : 'Category:'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-purple-500 focus:outline-none transition"
                  >
                    <option value="صيانة وقائية وأساطيل">صيانة وقائية وأساطيل</option>
                    <option value="التحول الرقمي للورش">التحول الرقمي للورش وبطاقات QR</option>
                    <option value="كفاءة الطاقة والتشغيل">كفاءة الطاقة واستهلاك الوقود</option>
                    <option value="فحص وتشخيص الذكاء الاصطناعي">فحص وتشخيص الذكاء الاصطناعي</option>
                    <option value="صيانة المحركات والهيدروليك">صيانة المحركات والأنظمة الهيدروليكية</option>
                  </select>
                </div>
              </div>

              {/* Author, Read Time, Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {language === 'ar' ? 'اسم الكاتب / الناشر:' : 'Author:'}
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {language === 'ar' ? 'وقت القراءة المقدر:' : 'Read Time:'}
                  </label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={e => setFormData({ ...formData, readTime: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {language === 'ar' ? 'الوسوم (مفصولة بفاصلة):' : 'Tags (comma separated):'}
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="شاحنات, فحص_وقائي, ديزل"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'الملخص التنفيذي للمقال (يظهر في بطاقة المعاينة بالموقع):' : 'Executive Summary:'}
                </label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={e => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="مستخلص مركز يبرز أهمية المقال للمدراء والمهندسين..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-purple-500 focus:outline-none transition leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* 2. IMAGE INTEGRATION & AI GENERATION HUB */}
          <div className="bg-white border-2 border-purple-200/90 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Camera size={18} className="text-purple-600" />
                  <h4 className="text-sm font-black text-slate-900">
                    {language === 'ar' ? 'محطة اختيار وتوليد صور المقال (Imagen & Library)' : 'Article Visual Studio (Imagen & Library)'}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500">
                  {language === 'ar' 
                    ? 'اختر صورة فوتوغرافية من مكتبة الأصول المعتمدة أو قم بتوليد صورة سينمائية بالذكاء الاصطناعي ودمجها مع المقال قبل النشر.'
                    : 'Select a verified photograph from our fleet library or generate AI photography via Imagen to merge before publishing.'}
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl shrink-0">
                <button
                  type="button"
                  onClick={() => setImageTab('library')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    imageTab === 'library'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon size={13} />
                  <span>{language === 'ar' ? 'مكتبة الصور المعتمدة' : 'Fleet Library'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImageTab('imagen')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    imageTab === 'imagen'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>{language === 'ar' ? 'توليد ذكي (Imagen AI)' : 'Generate AI'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    imageTab === 'url'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ExternalLink size={12} />
                  <span>{language === 'ar' ? 'رابط مخصص' : 'URL'}</span>
                </button>
              </div>
            </div>

            {/* TAB 1: CURATED MEDIA LIBRARY */}
            {imageTab === 'library' && (
              <div className="space-y-4">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: language === 'ar' ? 'كافة الصور' : 'All Images' },
                    { id: 'fleet', label: language === 'ar' ? '🚛 أساطيل وشاحنات' : 'Fleets' },
                    { id: 'inspection', label: language === 'ar' ? '🔍 فحص وبطاقات QR' : 'Inspections' },
                    { id: 'engine', label: language === 'ar' ? '⚙️ ديزل وهيدروليك' : 'Engine & Hydraulic' },
                    { id: 'workshop', label: language === 'ar' ? '🔧 ورش وقطع غيار' : 'Workshops' },
                    { id: 'heavy', label: language === 'ar' ? '🏗️ معدات ثقيلة وحفارات' : 'Heavy Machinery' },
                    { id: 'diagnostics', label: language === 'ar' ? '📊 ذكاء اصطناعي وتتبع' : 'AI Diagnostics' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setLibraryCategory(cat.id)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        libraryCategory === cat.id
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Library Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto p-1">
                  {filteredLibraryItems.map(item => {
                    const isSelected = formData.image === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleMergeImageToArticle(item.url, 'library', 'Fleet Curated Library', item.labelAr)}
                        className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all aspect-video flex flex-col justify-end p-2 ${
                          isSelected
                            ? 'border-purple-600 shadow-md ring-2 ring-purple-500/40'
                            : 'border-slate-200 hover:border-purple-400 opacity-90 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.labelAr}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                        
                        <div className="relative z-10 space-y-0.5">
                          <span className="text-[9px] font-bold text-purple-200 block truncate">
                            {item.categoryLabelAr}
                          </span>
                          <span className="text-[10px] font-black text-white line-clamp-1 leading-tight">
                            {language === 'ar' ? item.labelAr : item.labelEn}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 left-2 z-10 bg-purple-600 text-white p-1 rounded-full shadow-md">
                            <CheckCircle2 size={13} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: IMAGEN AI GENERATOR */}
            {imageTab === 'imagen' && (
              <div className="space-y-4 bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Wand2 size={16} className="text-purple-600" />
                    <h5 className="text-xs font-black text-purple-950">
                      {language === 'ar' ? 'توليد صور فوتوغرافية احترافية بنموذج Google Imagen' : 'Generate Photography with Google Imagen'}
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === 'ar'
                      ? 'صف المشهد الفني الذي تريده لمقالك أو انقر فوق أحد النماذج السريعة أدناه لتوليد صورة فوتوغرافية عالية النقاء بدقة سينمائية:'
                      : 'Describe the scene or choose one of our quick prompts to generate high-resolution editorial photography:'}
                  </p>
                </div>

                {/* Prompt Textarea */}
                <div>
                  <textarea
                    rows={2}
                    value={imagenPrompt}
                    onChange={e => setImagenPrompt(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: فحص فني ميداني لشاحنة مرسيدس أكتروس بجوار ورشة متقدمة مع جهاز لوحي رقمي...' : 'Describe prompt for Imagen...'}
                    className="w-full p-3 bg-white border border-purple-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs leading-relaxed"
                  />
                </div>

                {/* Quick Inspiration Prompts */}
                <div className="space-y-1.5">
                  <span className="text-[10.5px] font-bold text-purple-900 block">
                    {language === 'ar' ? 'أفكار سريعة بنقرة واحدة لأساطيل النقل والميكانيكا:' : 'Quick Prompt Inspirations:'}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {quickPrompts.map((qp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImagenPrompt(qp.prompt)}
                        className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-[10.5px] font-bold transition cursor-pointer shadow-2xs"
                      >
                        {qp.titleAr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio & Style Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {language === 'ar' ? 'أبعاد الصورة (Aspect Ratio):' : 'Aspect Ratio:'}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: '16:9', label: '16:9 (غلاف عريض)' },
                        { id: '4:3', label: '4:3 (بطاقة مقال)' },
                        { id: '1:1', label: '1:1 (مربع)' }
                      ].map(asp => (
                        <button
                          key={asp.id}
                          type="button"
                          onClick={() => setImagenAspectRatio(asp.id as any)}
                          className={`p-2 rounded-xl text-[10.5px] font-bold transition cursor-pointer border text-center ${
                            imagenAspectRatio === asp.id
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {asp.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {language === 'ar' ? 'النمط الفني (Artistic Style):' : 'Style Preset:'}
                    </label>
                    <select
                      value={imagenStyle}
                      onChange={e => setImagenStyle(e.target.value)}
                      className="w-full p-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="photorealistic">فوتوغرافي واقعي فائق الدقة (8K Photorealistic)</option>
                      <option value="cinematic">سينمائي بإضاءة استوديو درامية (Cinematic Lighting)</option>
                      <option value="technical">هندسي تقني ومخططات ورش (Technical Engineering)</option>
                      <option value="editorial">مجلات وتقارير أساطيل حديثة (Modern Editorial)</option>
                    </select>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleGenerateImagen}
                    disabled={isGeneratingImage}
                    className="w-full sm:w-auto p-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isGeneratingImage ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>{language === 'ar' ? 'جاري توليد الصورة الذكية بنموذج Imagen...' : 'Generating image via Imagen...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} className="text-amber-300" />
                        <span>{language === 'ar' ? 'توليد الصورة بنموذج Imagen الآن' : 'Generate with Imagen Now'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Generated Image Result Box */}
                {generatedPreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-4 rounded-2xl border-2 border-purple-400 shadow-md space-y-3 mt-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-black">
                          ✓ تم التوليد بنجاح
                        </span>
                        <span className="text-[10px] font-mono text-purple-700 font-bold">
                          {generatedPreview.modelLabel}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {imagenAspectRatio}
                      </span>
                    </div>

                    <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-200">
                      <img
                        src={generatedPreview.imageUrl}
                        alt="Generated Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <p className="text-[10.5px] text-slate-500 truncate max-w-xs">
                        {generatedPreview.promptUsed}
                      </p>
                      
                      <button
                        type="button"
                        onClick={() => handleMergeImageToArticle(
                          generatedPreview.imageUrl, 
                          generatedPreview.source, 
                          generatedPreview.modelLabel,
                          generatedPreview.promptUsed
                        )}
                        className="p-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <CheckCircle2 size={14} />
                        <span>{language === 'ar' ? 'دمج الصورة الموّلدة كغلاف للمقال' : 'Merge as Article Cover'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* TAB 3: CUSTOM URL */}
            {imageTab === 'url' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'ar' ? 'أدخل رابط الصورة الخارجي المباشر (URL):' : 'Custom Image URL:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    dir="ltr"
                    value={customUrlInput}
                    onChange={e => setCustomUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) {
                        handleMergeImageToArticle(customUrlInput.trim(), 'custom_url', 'Custom External Asset');
                      }
                    }}
                    className="p-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                  >
                    {language === 'ar' ? 'تطبيق ودمج' : 'Apply'}
                  </button>
                </div>
              </div>
            )}

            {/* CURRENT INTEGRATED IMAGE PREVIEW & MERGE STATUS BANNER */}
            <div className="pt-2 border-t border-purple-100">
              <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-black">
                    <img
                      src={formData.image || highwayLogisticsTruck}
                      alt="Active Article Cover"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-0.5 px-2 bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-md text-[9px] font-black">
                        {formData.imageSource === 'imagen_ai'
                          ? '✨ تم التوليد بنموذج Google Imagen'
                          : formData.imageSource === 'custom_url'
                          ? '🔗 رابط خارجي مخصص'
                          : '📸 من مكتبة الصور المعتمدة'}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>{language === 'ar' ? 'مدمجة بالمقال وجاهزة للنشر' : 'Integrated with Article'}</span>
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 line-clamp-1">
                      {formData.imageCaption || (language === 'ar' ? 'صورة الغلاف الرسمية للمقال الفني' : 'Primary article header cover')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleInsertImageIntoContent(formData.image, formData.title)}
                    className="p-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[10.5px] font-bold transition cursor-pointer flex items-center gap-1.5"
                    title={language === 'ar' ? 'إدراج الصورة داخل النص (Markdown)' : 'Insert into content body'}
                  >
                    <UploadCloud size={13} />
                    <span>{language === 'ar' ? 'إدراج بالمتن (Markdown)' : 'Insert Inline'}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="p-2 px-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10.5px] font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Eye size={13} />
                    <span>{language === 'ar' ? 'معاينة المقال كاملاً' : 'Live Preview'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* 3. ARTICLE CONTENT EDITOR */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-purple-600" />
                <h4 className="text-sm font-black text-slate-900">
                  {language === 'ar' ? 'متن ونص المقال (Markdown Support)' : 'Article Body Content (Markdown)'}
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">
                {formData.content ? formData.content.split(/\s+/).length : 0} {language === 'ar' ? 'كلمة' : 'words'}
              </span>
            </div>

            <textarea
              rows={12}
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder={language === 'ar' ? 'اكتب أو انسخ محتوى المقال هنا بالتنسيق المرغوب (Markdown)...' : 'Write article body content here...'}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:bg-white focus:border-purple-500 focus:outline-none transition leading-relaxed"
            />

            {/* Publishing Action Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isPublishedToMarketingSite}
                    onChange={e => setFormData({ ...formData, isPublishedToMarketingSite: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded-md focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    {language === 'ar' ? 'نشر هذا المقال حياً على الموقع التسويقي' : 'Publish Live to Marketing Site'}
                  </span>
                </label>
                <span className={`p-1 px-2 rounded-lg text-[10px] font-black ${
                  formData.isPublishedToMarketingSite
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {formData.isPublishedToMarketingSite 
                    ? (language === 'ar' ? '🟢 جاهز للعرض العام' : '🟢 Public Live')
                    : (language === 'ar' ? '🟡 مسودة خاصة' : '🟡 Draft Only')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="p-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Eye size={14} />
                  <span>{language === 'ar' ? 'معاينة القارئ' : 'Reader View'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveArticle}
                  className="p-2.5 px-5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 size={14} />
                  <span>{language === 'ar' ? 'حفظ المقال والصورة المدمجة' : 'Save Article & Visuals'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT / SECONDARY COLUMN: ARTICLES VAULT & ARCHIVE (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-purple-600" />
                <h4 className="text-xs font-black text-slate-900">
                  {language === 'ar' ? 'مستودع مقالات الموقع' : 'Articles Repository'}
                </h4>
              </div>
              <span className="text-[10px] font-mono font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                {publishedArticles.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'بحث بالعنوان أو الوسم...' : 'Search articles...'}
                className="w-full p-2 pr-8 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: language === 'ar' ? 'الكل' : 'All' },
                { id: 'published', label: language === 'ar' ? 'منشور' : 'Live' },
                { id: 'draft', label: language === 'ar' ? 'مسودة' : 'Draft' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer text-center ${
                    statusFilter === f.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Articles List */}
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-0.5">
              {filteredVaultArticles.map(art => {
                const isActive = art.id === activeArticleId;
                const isLive = art.isPublishedToMarketingSite !== false && art.status !== 'draft';
                return (
                  <div
                    key={art.id}
                    onClick={() => setActiveArticleId(art.id)}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2.5 ${
                      isActive
                        ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                        : 'border-slate-100 hover:border-purple-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Thumbnail */}
                      <div className="relative w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-200 border border-slate-200">
                        <img
                          src={art.image || highwayLogisticsTruck}
                          alt={art.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Title & Category */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold text-purple-700 truncate">
                            {art.category}
                          </span>
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-md ${
                            isLive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isLive ? (language === 'ar' ? 'منشور' : 'Live') : (language === 'ar' ? 'مسودة' : 'Draft')}
                          </span>
                        </div>
                        <h5 className="text-[11.5px] font-black text-slate-900 line-clamp-2 leading-snug">
                          {art.title}
                        </h5>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                      <span className="text-slate-400 font-mono flex items-center gap-1">
                        <Clock size={10} />
                        <span>{art.readTime}</span>
                      </span>

                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onPublishToggle(art.id)}
                          className={`px-2 py-0.5 rounded-lg text-[9.5px] font-bold transition cursor-pointer ${
                            isLive
                              ? 'bg-emerald-50 hover:bg-rose-50 text-emerald-700 hover:text-rose-700 border border-emerald-200 hover:border-rose-200'
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200'
                          }`}
                          title={isLive ? (language === 'ar' ? 'إلغاء النشر' : 'Unpublish') : (language === 'ar' ? 'نشر على الموقع' : 'Publish')}
                        >
                          {isLive ? (language === 'ar' ? 'نشط بالموقع' : 'Live') : (language === 'ar' ? 'نشر' : 'Publish')}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(art.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition cursor-pointer"
                          title={language === 'ar' ? 'حذف المقال' : 'Delete'}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* FULL LIVE ARTICLE MODAL PREVIEW (Matches what visitors see) */}
      <AnimatePresence>
        {isPreviewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsPreviewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 shadow-2xl relative my-auto text-right"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Modal Cover Image */}
              <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden shrink-0">
                <img
                  src={formData.image || highwayLogisticsTruck}
                  alt={formData.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="absolute top-4 left-4 sm:top-5 sm:left-5 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer z-20 border border-white/20"
                >
                  <X size={18} />
                </button>

                {/* Badges and Title */}
                <div className="absolute bottom-5 right-5 left-5 space-y-2 text-white">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg backdrop-blur-xs">
                      {formData.category}
                    </span>
                    <span className="px-2.5 py-1 bg-white/20 text-white text-[11px] font-mono rounded-lg backdrop-blur-xs flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formData.readTime}</span>
                    </span>
                    <span className="px-2.5 py-1 bg-amber-500/80 text-white text-[11px] font-bold rounded-lg backdrop-blur-xs flex items-center gap-1">
                      <Sparkles size={12} />
                      <span>{formData.imageSource === 'imagen_ai' ? 'Imagen AI 3' : 'Verified Asset'}</span>
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black leading-tight text-white drop-shadow-sm">
                    {formData.title}
                  </h2>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-right">
                
                {/* Actions Toolbar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePreviewShare}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      title={language === 'ar' ? 'مشاركة عبر تطبيقات الموبايل' : 'Share via apps'}
                    >
                      <Share2 size={13} />
                      <span>{language === 'ar' ? 'مشاركة المقال' : 'Share Article'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleActivateAllArticlesInManager}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border shadow-xs active:scale-95 ${
                        allActivatedInManager
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                      title={language === 'ar' ? 'تفعيل ونشر كافة المقالات حياً على الموقع' : 'Activate & publish all articles live'}
                    >
                      <CheckCircle2 size={13} className={allActivatedInManager ? 'text-white' : 'text-emerald-600'} />
                      <span>
                        {allActivatedInManager
                          ? (language === 'ar' ? '✓ تم تفعيل جميع المقالات' : '✓ All Live')
                          : (language === 'ar' ? 'تفعيل جميع المقالات' : 'Activate All Articles')}
                      </span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Sparkles size={13} className="text-purple-600" />
                    <span>{language === 'ar' ? 'الناشر الرسمي:' : 'Author:'}</span>
                    <strong className="text-slate-800">{formData.author}</strong>
                  </div>
                </div>

                {/* Summary */}
                {formData.summary && (
                  <div className="bg-purple-50/80 border-r-4 border-purple-600 p-4 rounded-xl text-slate-800 text-xs sm:text-sm leading-relaxed">
                    <span className="font-black text-purple-950 block mb-1 text-xs">
                      {language === 'ar' ? '💡 ملخص ومستخلص المقال:' : 'Executive Abstract:'}
                    </span>
                    {formData.summary}
                  </div>
                )}

                {/* Main Content */}
                <div className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans space-y-3">
                  {formData.content}
                </div>

                {/* Tags */}
                {formData.tags && (
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400 font-bold">{language === 'ar' ? 'الوسوم:' : 'Tags:'}</span>
                    {formData.tags.split(',').map((t, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 bg-slate-100 text-purple-700 rounded-lg text-xs font-mono">
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Mobile Apps Share Modal */}
      <ArticleShareModal
        isOpen={!!shareModalData}
        onClose={() => setShareModalData(null)}
        article={shareModalData}
        language={language}
      />
    </div>
  );
};

export default MarketingArticlesManager;
