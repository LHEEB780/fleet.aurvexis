import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Camera, 
  Upload, 
  Check, 
  ChevronLeft, 
  AlertTriangle, 
  Package, 
  ArrowLeft, 
  RefreshCw, 
  Layers,
  Wrench,
  CheckCircle2,
  List,
  Clock,
  Coins
} from 'lucide-react';
import { Vehicle, Technician, MaintenanceOrder, InventoryItem } from '../types';

// Pre-defined realistic machinery/vehicle issues with high-quality stock illustrations
const PRESET_FAILURES = [
  {
    id: 'oil_leak',
    title: 'تسريب زيت أسفل كتلة المحرك',
    category: 'mechanical' as const,
    image: 'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=400',
    notes: 'تراكم بقع زيت محرك لزجة وسوداء داكنة على الأرضية أسفل السيارة مع انخفاض طفيف في منسوب الزيت الدوري.',
    description: 'تسريب في حشوة غطاء الصمامات أو كرتير الزيت.'
  },
  {
    id: 'battery_corrosion',
    title: 'تأكسد وتملح أقطاب البطارية',
    category: 'electrical' as const,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400',
    notes: 'تكون مادة كبريتية رغوية باللون الأبيض والتركيوازي على أطراف الكابلات، مما يتسبب بضعف التوصيل وصعوبة بدء التشغيل صباحاً.',
    description: 'تأكسد أقطاب البطارية وتملح الموصلات.'
  },
  {
    id: 'brake_wear',
    title: 'تآكل شديد في بطانات الفرامل (الفحمات)',
    category: 'mechanical' as const,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400',
    notes: 'صرير معدني حاد عند الضغط على الفرامل مع انخفاض مستوى سائل الفرامل في الخزان الدليلي وتجريح خفيف على سطح الهوب.',
    description: 'تلف واهتراء فحمات المكابح الأمامية.'
  },
  {
    id: 'hydraulic_hose',
    title: 'تصدع وتلف خرطوم الضغط الهيدروليكي',
    category: 'hydraulic' as const,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400',
    notes: 'وجود تشققات عميقة في الهيكل المطاطي لخرطوم الهيدروليك المغذي لذراع الرفع الخلفي مع آثار ترشيح طفيفة للسائل.',
    description: 'تصدع وتلف خرطوم الضغط الميكانيكي.'
  }
];

interface SmartDiagnosticProps {
  vehicles: Vehicle[];
  technicians: Technician[];
  inventory: InventoryItem[];
  workshops: any[];
  onAddOrder: (order: Partial<MaintenanceOrder>) => void;
  onCancel: () => void;
}

export default function SmartDiagnostic({
  vehicles,
  technicians,
  inventory,
  workshops,
  onAddOrder,
  onCancel
}: SmartDiagnosticProps) {
  // Setup standard state
  const [selectedPreset, setSelectedPreset] = useState<string | null>('oil_leak');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>(PRESET_FAILURES[0].notes);
  const [category, setCategory] = useState<string>('mechanical');
  
  // API and analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    analysis: string;
    steps: string[];
    suggestedParts: string[];
  } | null>(null);

  // Work order parameters state
  const [showOrderForm, setShowOrderForm] = useState<boolean>(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [orderCost, setOrderCost] = useState<number>(350);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('');

  // Dropzone drag/drop ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Sync state with selected preset
  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    setCustomImage(null);
    const preset = PRESET_FAILURES.find(p => p.id === presetId);
    if (preset) {
      setNotes(preset.notes);
      setCategory(preset.category);
    }
  };

  // Convert uploaded image file to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
        setSelectedPreset(null);
        setNotes(prev => prev || 'صورة مخصصة مرفوعة للمعاينة الهندسية.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
        setSelectedPreset(null);
        setNotes(prev => prev || 'صورة مخصصة مرفوعة للمعاينة الهندسية.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Execute diagnostic API request
  const runDiagnosis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setDiagnosticResult(null);

    // Get current image source (either custom base64 or the preset image URL)
    let imagePayload = "";
    if (customImage) {
      imagePayload = customImage;
    } else {
      const preset = PRESET_FAILURES.find(p => p.id === selectedPreset);
      if (preset) {
        imagePayload = preset.image;
      }
    }

    try {
      const response = await fetch('/api/ai/smart-diagnostic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: imagePayload,
          notes,
          category
        })
      });

      if (!response.ok) {
        throw new Error('فشل الخادم في معالجة طلب التشخيص الذكي بالذكاء الاصطناعي.');
      }

      const data = await response.json();
      setDiagnosticResult(data);

      // Try auto-selecting the first vehicle and technician for convenience
      if (vehicles.length > 0) {
        setSelectedVehicleId(vehicles[0].id);
      }
      const matchingTechs = technicians.filter(t => t.specialization === category);
      if (matchingTechs.length > 0) {
        setAssignedTechnicianId(matchingTechs[0].id);
      } else if (technicians.length > 0) {
        setAssignedTechnicianId(technicians[0].id);
      }
      if (workshops.length > 0) {
        setSelectedWorkshopId(workshops[0].id);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء محاولة الاتصال بخدمة الذكاء الاصطناعي.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Convert diagnostic data into a real maintenance order in the parent component
  const handleCreateWorkOrder = () => {
    if (!diagnosticResult) return;

    const matchedMilestones = (diagnosticResult.steps || []).map((stepText, idx) => ({
      title: stepText,
      checked: idx === 0 // Check first step (preparation) by default to kickstart the workflow
    }));

    // Build the order object according to MaintenanceOrder schema
    const newOrderPayload: Partial<MaintenanceOrder> = {
      vehicleId: selectedVehicleId,
      description: `تشخيص ذكي ميكانيكي: ${notes}\n\n[تحليل الذكاء الاصطناعي]:\n${diagnosticResult.analysis.substring(0, 500)}...`,
      category: category as any,
      technicianId: assignedTechnicianId || undefined,
      priority: priority,
      cost: orderCost,
      workshopId: selectedWorkshopId || undefined,
      milestones: matchedMilestones,
      progress: 20, // Start with 20% progress since first step is pre-checked
      partsUsed: diagnosticResult.suggestedParts || [],
      techNotes: 'تم توليد هذا الأمر تلقائياً بواسطة التشخيص الذكي بالذكاء الاصطناعي (Mechanic 360).',
    };

    onAddOrder(newOrderPayload);
    // Show a temporary visual indicator or go straight back
  };

  // Helper custom markdown-like renderer for beautiful, responsive analysis presentation
  const renderDiagnosticAnalysis = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <div className="space-y-3 text-right leading-relaxed text-slate-800 dark:text-slate-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-2" />;

          // Headers
          if (trimmed.startsWith('###')) {
            return (
              <h4 key={idx} className="text-xs font-black text-slate-900 dark:text-white border-r-4 border-brand-blue-500 pr-2 mt-4 mb-2 flex items-center gap-1.5">
                <Sparkles size={11} className="text-brand-blue-500" />
                <span>{trimmed.replace(/^###\s*/, '')}</span>
              </h4>
            );
          }
          if (trimmed.startsWith('##') || trimmed.startsWith('#')) {
            return (
              <h3 key={idx} className="text-sm font-black text-brand-blue-600 dark:text-brand-blue-400 mt-5 mb-3">
                {trimmed.replace(/^##?\s*/, '')}
              </h3>
            );
          }

          // Bullet points
          if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
            let innerText = trimmed.replace(/^[-*]\s*/, '');
            // Highlight bold matches in bullets
            const parts = innerText.split('**');
            return (
              <div key={idx} className="flex items-start gap-1.5 pr-2 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <span>
                  {parts.map((part, pIdx) => (
                    pIdx % 2 === 1 ? <strong key={pIdx} className="text-slate-950 dark:text-white font-black">{part}</strong> : part
                  ))}
                </span>
              </div>
            );
          }

          // Warning lines
          if (trimmed.includes('تنبيه') || trimmed.includes('خطر') || trimmed.includes('تحذير')) {
            return (
              <div key={idx} className="p-2.5 bg-rose-50/75 dark:bg-rose-950/20 border-r-4 border-rose-500 rounded-lg text-[10px] font-black text-rose-700 dark:text-rose-400 flex items-start gap-1.5 my-3">
                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                <span>{trimmed}</span>
              </div>
            );
          }

          // Standard line with bold tags
          if (trimmed.includes('**')) {
            const parts = trimmed.split('**');
            return (
              <p key={idx} className="text-[11px] text-slate-600 dark:text-slate-350">
                {parts.map((part, pIdx) => (
                  pIdx % 2 === 1 ? <strong key={pIdx} className="text-slate-900 dark:text-white font-black">{part}</strong> : part
                ))}
              </p>
            );
          }

          return (
            <p key={idx} className="text-[11px] text-slate-600 dark:text-slate-350">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Upper Status & Back Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-blue-500/10 text-brand-blue-600 dark:text-brand-blue-400 flex items-center justify-center font-bold">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>التشخيص الذكي بالذكاء الاصطناعي (Smart Diagnostic)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-brand-blue-500 to-violet-600 text-white font-extrabold animate-pulse">Multimodal Gemini PRO</span>
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">ارفع صورة للمشكلة الميكانيكية ودع خوارزمياتنا تقترح التشخيص وخطوات الإصلاح الفورية.</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black cursor-pointer transition-all border border-slate-200/40 dark:border-slate-700/40"
        >
          <ArrowLeft size={11} />
          <span>رجوع للوحة المتابعة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* RIGHT COLUMN: Selection & Setup Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-4">
            <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Camera size={13} className="text-brand-blue-500" />
              <span>1. مصدر المعاينة والتوثيق الميداني</span>
            </h3>

            {/* Choose Preset Failure or upload */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 block">اختر من العينات الجاهزة للفحص السريع:</span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_FAILURES.map(preset => {
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`p-1.5 rounded-xl border text-right transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected 
                          ? 'border-brand-blue-500 bg-brand-blue-500/5 dark:bg-brand-blue-500/10' 
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30'
                      }`}
                    >
                      <div className="h-16 w-full rounded-lg overflow-hidden mb-1 relative bg-slate-100 dark:bg-slate-900">
                        <img 
                          src={preset.image} 
                          alt={preset.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-brand-blue-500/10 flex items-center justify-center">
                            <span className="bg-brand-blue-500 text-white rounded-full p-1 shadow-md">
                              <Check size={10} strokeWidth={4} />
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[9.5px] font-black block truncate text-slate-900 dark:text-white">{preset.title}</span>
                      <span className="text-[8px] text-slate-400 block">{preset.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 block">أو قم برفع صورة مخصصة من جهازك:</span>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-brand-blue-500 bg-brand-blue-500/5' 
                    : customImage 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-950/20'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden" 
                />
                
                {customImage ? (
                  <div className="space-y-2">
                    <img 
                      src={customImage} 
                      alt="Custom diagnostic file" 
                      className="h-24 mx-auto rounded-lg object-cover shadow-sm border border-emerald-100" 
                    />
                    <div className="flex items-center justify-center gap-1 text-[9.5px] text-emerald-600 dark:text-emerald-400 font-black">
                      <CheckCircle2 size={11} />
                      <span>تم تحميل صورة الفحص المخصصة بنجاح</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-slate-400">
                    <Upload size={16} className="mx-auto text-slate-400 animate-bounce" />
                    <p className="text-[9.5px] font-black text-slate-700 dark:text-slate-300">اسحب وأفلت صورة الخلل الميكانيكي هنا</p>
                    <p className="text-[8px] text-slate-400">أو اضغط للتصفح من ملفات النظام أو الكاميرا الحية</p>
                  </div>
                )}
              </div>
            </div>

            {/* Symptom description textarea */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 block">
                2. الملاحظات الحية ووصف الأعراض:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="صف الأصوات أو الروائح أو مكان الترشيح الذي تلاحظه..."
                rows={3}
                className="w-full text-[10.5px] font-bold p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 focus:outline-none dark:text-white"
              />
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 block">
                3. تصنيف منظومة الخلل المتوقع:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'mechanical', title: 'ميكانيكي' },
                  { id: 'electrical', title: 'كهربائي' },
                  { id: 'hydraulic', title: 'هيدروليك' },
                  { id: 'cooling', title: 'تبريد' },
                  { id: 'bodywork', title: 'هيكل/سمكرة' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`py-1.5 rounded-lg text-[9px] font-black border cursor-pointer transition-all ${
                      category === cat.id
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 text-[#425a7a] dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/20'
                    }`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnostic Action Button */}
            <button
              type="button"
              onClick={runDiagnosis}
              disabled={isAnalyzing || (!notes && !customImage && !selectedPreset)}
              className="w-full py-2.5 bg-brand-blue-600 hover:bg-brand-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-[10.5px] rounded-xl flex items-center justify-center gap-1.5 shadow-soft transition-all cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  <span>جاري معالجة الصورة وتحليلها بالذكاء الاصطناعي...</span>
                </>
              ) : (
                <>
                  <Sparkles size={12} className="animate-pulse text-yellow-300" />
                  <span>تشخيص فوري باستخدام الذكاء الاصطناعي 🪄</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* LEFT COLUMN: Results Screen & Work Order Creator */}
        <div className="lg:col-span-7 space-y-4">
          <AnimatePresence mode="wait">
            {!diagnosticResult && !isAnalyzing && !error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-slate-50 dark:bg-slate-900/40 p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 h-full flex flex-col items-center justify-center min-h-[350px]"
              >
                <div className="w-14 h-14 rounded-full bg-brand-blue-50 dark:bg-brand-blue-500/10 text-brand-blue-500 flex items-center justify-center mb-4">
                  <Sparkles size={24} className="animate-pulse" />
                </div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1">في انتظار أوامر التشخيص الفني</h4>
                <p className="text-[10px] text-slate-400 max-w-sm leading-relaxed">
                  قم بضبط مدخلات الصورة والملاحظات الميدانية في العمود الأيمن، ثم اضغط على زر "تشخيص فوري بالذكاء الاصطناعي" للحصول على تقرير هندسي متكامل وخطط الصيانة والقطع اللازمة.
                </p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-100 dark:border-slate-800 h-full flex flex-col items-center justify-center min-h-[350px] space-y-4 shadow-soft"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-brand-blue-200 dark:border-brand-blue-900/50 border-t-brand-blue-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-brand-blue-500">
                    <Sparkles size={18} className="animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">جاري الاتصال بخادم عيون الذكاء الاصطناعي (Gemini Multi-Modal)</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    نعمل الآن على استخلاص الأنماط البصرية من صورة القطعة، ومطابقة شكوى الفني مع كتلوجات الإصلاح وسجلات الصيانة لتقديم التشخيص الأنسب...
                  </p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-900 p-8 text-center rounded-2xl border border-red-100 dark:border-red-950/20 h-full flex flex-col items-center justify-center min-h-[350px] space-y-3 shadow-soft"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">فشل التشخيص الذكي بالذكاء الاصطناعي</h4>
                <p className="text-[10px] text-slate-500 dark:text-red-400 max-w-md leading-relaxed bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                  {error}
                </p>
                <button
                  onClick={runDiagnosis}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-[10px] font-black rounded-lg transition-all"
                >
                  إعادة المحاولة
                </button>
              </motion.div>
            )}

            {diagnosticResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* 1. Analysis Report Panel */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="animate-pulse" />
                      <span>اكتمل تقرير التشخيص البصري</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold">مصنف كـ: {category === 'mechanical' ? 'صيانة ميكانيكية' : category === 'electrical' ? 'صيانة كهربائية' : 'منظومة الصيانة الفنية'}</span>
                  </div>

                  <div className="max-h-[350px] overflow-y-auto scrollbar-thin pl-1">
                    {renderDiagnosticAnalysis(diagnosticResult.analysis)}
                  </div>
                </div>

                {/* 2. Interactive Work Order Preview and Config */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Wrench size={13} className="text-brand-blue-500" />
                      <span>2. خطة الإصلاح المقترحة وقطع الغيار المطلوبة</span>
                    </h4>
                    <span className="text-[9.5px] text-slate-400 font-bold">خطة صيانة من 5 خطوات دقيقة</span>
                  </div>

                  {/* 5-Step Checklist Visual */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 block mb-1">الخطوات المقترحة (التي سيتم جدولتها كمعالم للفني):</span>
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
                      {(diagnosticResult.steps || []).map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 border-b border-slate-100 dark:border-slate-850 last:border-none pb-2 last:pb-0">
                          <span className="w-5 h-5 rounded-full bg-brand-blue-500/10 text-brand-blue-600 dark:text-brand-blue-400 flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spare Parts Matching with inventory stock! */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 block">قطع الغيار المقترحة ومطابقتها مع مستودعاتنا:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(diagnosticResult.suggestedParts || []).map((part, pIdx) => {
                        // Attempt to find a match in actual inventory
                        const matchInInv = inventory.find(item => 
                          item.name.toLowerCase().includes(part.toLowerCase()) ||
                          part.toLowerCase().includes(item.name.toLowerCase())
                        );

                        return (
                          <div key={pIdx} className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-900 flex items-center justify-center shrink-0">
                                <Package size={12} className="text-slate-500" />
                              </div>
                              <div className="overflow-hidden">
                                <span className="text-[9.5px] font-black block truncate text-slate-850 dark:text-white" title={part}>{part}</span>
                                {matchInInv ? (
                                  <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 block truncate">
                                    متاح في الرف {matchInInv.shelfLocation || 'غير محدد'}
                                  </span>
                                ) : (
                                  <span className="text-[8px] font-bold text-slate-400 block">
                                    اسم مقترح للتوريد
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Stock Indicator */}
                            <div>
                              {matchInInv ? (
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black ${
                                  matchInInv.quantity > 0 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                }`}>
                                  الكمية: {matchInInv.quantity}
                                </span>
                              ) : (
                                <span className="text-[8.5px] text-violet-600 dark:text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded-md font-bold">
                                  غير مدرج
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {(!diagnosticResult.suggestedParts || diagnosticResult.suggestedParts.length === 0) && (
                        <div className="col-span-2 text-center py-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-[9px] text-slate-450">
                          لم يتم اقتراح قطع غيار صيانة محددة لهذه العملية.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Expandable Work Order Creator Form */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    {!showOrderForm ? (
                      <button
                        type="button"
                        onClick={() => setShowOrderForm(true)}
                        className="w-full py-2 bg-gradient-to-r from-brand-blue-600 to-indigo-600 hover:from-brand-blue-500 hover:to-indigo-500 text-white text-[10.5px] font-black rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <Wrench size={12} />
                        <span>تأكيد وجدولة أمر عمل وصيانة مباشر بهذا التشخيص 🛠️</span>
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 bg-slate-50 dark:bg-slate-955 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800 text-right"
                      >
                        <h5 className="text-[10px] font-black text-brand-blue-600 dark:text-brand-blue-400">تكوين أمر الصيانة الرسمي في النظام:</h5>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {/* Vehicle Selector */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 block">الآلية المشتكية (المركبة):</label>
                            <select
                              value={selectedVehicleId}
                              onChange={(e) => setSelectedVehicleId(e.target.value)}
                              className="w-full text-[10.5px] font-bold p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                            >
                              <option value="">-- اختر آلية من الأسطول --</option>
                              {vehicles.map(v => (
                                <option key={v.id} value={v.id}>
                                  {v.name} ({v.plateNumber})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Technician Selector */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 block">تعيين الفني المسؤول:</label>
                            <select
                              value={assignedTechnicianId}
                              onChange={(e) => setAssignedTechnicianId(e.target.value)}
                              className="w-full text-[10.5px] font-bold p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                            >
                              <option value="">-- اختر الفني المناسب --</option>
                              {technicians.map(t => (
                                <option key={t.id} value={t.id}>
                                  {t.name} - تخصُّص ({t.specialization === 'mechanical' ? 'ميكانيكا' : t.specialization === 'electrical' ? 'كهرباء' : t.specialization})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Priority */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 block">أولوية الصيانة:</label>
                            <select
                              value={priority}
                              onChange={(e) => setPriority(e.target.value as any)}
                              className="w-full text-[10.5px] font-bold p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                            >
                              <option value="low">منخفضة</option>
                              <option value="medium">متوسطة</option>
                              <option value="high">طارئة / حرجة جداً</option>
                            </select>
                          </div>

                          {/* Workshop Selector */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 block">الورشة الفنية:</label>
                            <select
                              value={selectedWorkshopId}
                              onChange={(e) => setSelectedWorkshopId(e.target.value)}
                              className="w-full text-[10.5px] font-bold p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                            >
                              <option value="">-- اختر الورشة والموقع --</option>
                              {workshops.map(w => (
                                <option key={w.id} value={w.id}>
                                  {w.name} ({w.location || 'مقر الورشة الرئيسي'})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Estimated cost input */}
                          <div className="space-y-1 col-span-2">
                            <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 block">التكلفة التقديرية (ر.س):</label>
                            <div className="relative">
                              <input
                                type="number"
                                value={orderCost}
                                onChange={(e) => setOrderCost(parseInt(e.target.value) || 0)}
                                className="w-full text-[10.5px] font-bold p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white pl-10 pr-3"
                              />
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450 text-[10px] font-black">
                                ر.س
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setShowOrderForm(false)}
                            className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-lg cursor-pointer hover:bg-slate-300/60 dark:hover:bg-slate-700 transition-colors"
                          >
                            تراجع
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateWorkOrder}
                            disabled={!selectedVehicleId}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-slate-300 disabled:cursor-not-allowed text-[10.5px] font-black rounded-lg cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <Check size={12} strokeWidth={3} />
                            <span>تسجيل وجدولة أمر العمل في الكانبان 🚀</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
