import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Mail,
  MoreVertical,
  Zap,
  Wrench,
  Thermometer,
  Layers,
  Droplets,
  Plus,
  X,
  UserPlus,
  Trash2,
  Smile,
  Check,
  Award,
  BookOpen,
  Upload,
  Image,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { technicians as initialTechnicians, maintenanceOrders } from '../data';
import { Technician, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell } from 'recharts';
import { getRealAvatarByName } from './Drivers';
import { useLanguage } from '../services/LanguageContext';
import ContextualHelp from './ContextualHelp';
import { TechnicianQuickTasks } from './TechnicianQuickTasks';

const SEED_PHOTO_MAP: Record<string, string> = {
  Aiden: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
  Mason: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
  George: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200',
  Felix: 'https://images.unsplash.com/photo-1620122303020-43ec4b6cf7f8?auto=format&fit=crop&q=80&w=200&h=200',
  Aneka: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200'
};

const getTechAvatar = (form: { customAvatar: string; avatarSeed: string; name: string }) => {
  if (form.customAvatar) return form.customAvatar;
  return SEED_PHOTO_MAP[form.avatarSeed] || getRealAvatarByName(form.name || form.avatarSeed);
};

// Anchor date matching current actual session date (2026-05-19)
const SYSTEM_ANCHOR_DATE = '2026-05-19';

const SpecializationIcon = ({ spec, size = 18 }: { spec: string, size?: number }) => {
  switch (spec) {
    case 'electrical': return <Zap size={size} className="text-brand-yellow-500" />;
    case 'mechanical': return <Wrench size={size} className="text-purple-500" />;
    case 'cooling': return <Thermometer size={size} className="text-rose-500" />;
    case 'hydraulic': return <Droplets size={size} className="text-sky-500" />;
    case 'bodywork': return <Layers size={size} className="text-emerald-500" />;
    default: return <Users size={size} />;
  }
};

const specLabels: Record<string, string> = {
  electrical: 'كهرباء وتوصيلات',
  mechanical: 'ميكانيك شاحنات',
  cooling: 'تبريد وتكييف',
  hydraulic: 'أنظمة هيدروليكية',
  bodywork: 'سمكرة ودهانات'
};

const specColors: Record<string, { bg: string; text: string; border: string }> = {
  electrical: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/40' },
  mechanical: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/40' },
  cooling: { bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-450', border: 'border-rose-100 dark:border-rose-900/40' },
  hydraulic: { bg: 'bg-sky-50 dark:bg-sky-950/20', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-100 dark:border-sky-900/40' },
  bodywork: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/40' }
};

const getSkillColor = (skill: string): { bg: string; text: string; border: string } => {
  const s = skill.toLowerCase();
  if (s.includes('كهرب') || s.includes('حساس') || s.includes('برمج') || s.includes('سلك') || s.includes('سلاك') || s.includes('بطار') || s.includes('مولد') || s.includes('لوح')) {
    return { bg: 'bg-amber-50 dark:bg-amber-950/25 border-amber-100/50 dark:border-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/40' };
  }
  if (s.includes('محرك') || s.includes('حرك') || s.includes('عجل') || s.includes('عط') || s.includes('زيت') || s.includes('فلت') || s.includes('وقود') || s.includes('ميكان')) {
    return { bg: 'bg-blue-50 dark:bg-blue-950/25 border-blue-100/50 dark:border-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/40' };
  }
  if (s.includes('هيدرول') || s.includes('ضغط') || s.includes('رافع') || s.includes('صم') || s.includes('خرط')) {
    return { bg: 'bg-purple-50 dark:bg-purple-950/25 border-purple-100/50 dark:border-purple-900/20', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/40' };
  }
  if (s.includes('فريون') || s.includes('تبريد') || s.includes('تكييف') || s.includes('حرار') || s.includes('كابين')) {
    return { bg: 'bg-rose-50 dark:bg-rose-950/25 border-rose-100/50 dark:border-rose-900/20', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/40' };
  }
  if (s.includes('هيكل') || s.includes('دهان') || s.includes('سمكر') || s.includes('صدأ') || s.includes('خدش') || s.includes('فيبر')) {
    return { bg: 'bg-emerald-50 dark:bg-emerald-950/25 border-emerald-100/50 dark:border-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-450', border: 'border-emerald-100 dark:border-emerald-900/40' };
  }
  if (s.includes('فرمل') || s.includes('فرامل') || s.includes('هوا')) {
    return { bg: 'bg-indigo-50 dark:bg-indigo-950/25 border-indigo-100/50 dark:border-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-900/40' };
  }
  
  // Dynamic fallback based on charCode sum
  const colors = [
    { bg: 'bg-sky-50 dark:bg-sky-950/25 border-sky-100/50 dark:border-sky-900/20', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-100 dark:border-sky-900/40' },
    { bg: 'bg-teal-50 dark:bg-teal-950/25 border-teal-100/50 dark:border-teal-900/20', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-100 dark:border-teal-900/40' },
    { bg: 'bg-orange-50 dark:bg-orange-950/25 border-orange-100/50 dark:border-orange-900/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-900/40' },
    { bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/25 border-fuchsia-100/50 dark:border-fuchsia-900/20', text: 'text-fuchsia-700 dark:text-fuchsia-400', border: 'border-fuchsia-100 dark:border-fuchsia-900/40' },
  ];
  let sum = 0;
  for (let i = 0; i < skill.length; i++) {
    sum += skill.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

export default function Technicians({ user }: { user?: User }) {
  const { language } = useLanguage();
  // Working hours and viewing states
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [draftLogDate, setDraftLogDate] = useState('2026-05-21');
  const [draftLogHours, setDraftLogHours] = useState(8);

  const [techList, setTechList] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('fleet_technicians_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((t: any) => {
          const initMatch = initialTechnicians.find(it => it.id === t.id);
          return {
            ...t,
            name: initMatch ? initMatch.name : t.name,
            avatar: initMatch ? initMatch.avatar : t.avatar,
            skills: t.skills || (initMatch ? initMatch.skills : []),
            workLogs: t.workLogs || []
          };
        });
      } catch (e) {
        console.error(e);
      }
    }
    
    // Seed initial technicians with realistic monthly working logs
    return initialTechnicians.map((t, idx) => ({
      ...t,
      workLogs: [
        { date: '2026-05-01', hours: 8 },
        { date: '2026-05-02', hours: 8 },
        { date: '2026-05-04', hours: idx % 2 === 0 ? 9 : 8 },
        { date: '2026-05-05', hours: 8 },
        { date: '2026-05-06', hours: 8 },
        { date: '2026-05-08', hours: 8 },
        { date: '2026-05-09', hours: 8 },
        { date: '2026-05-11', hours: 10 },
        { date: '2026-05-12', hours: 8 },
        { date: '2026-05-13', hours: 8 },
        { date: '2026-05-15', hours: 8 },
        { date: '2026-05-16', hours: 8 },
        { date: '2026-05-18', hours: idx % 3 === 0 ? 10 : 8 },
        { date: '2026-05-19', hours: 8 },
        { date: '2026-05-20', hours: 8 }
      ]
    }));
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeSpec, setActiveSpec] = useState<string | 'all'>('all');

  // Modal active states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);

  // Form states for new technician
  const [newTechForm, setNewTechForm] = useState({
    name: '',
    role: '',
    specialization: 'mechanical' as Technician['specialization'],
    status: 'available' as Technician['status'],
    phone: '',
    joinDate: SYSTEM_ANCHOR_DATE,
    avatarSeed: 'Aiden',
    customAvatar: '', // Base64 or external uploaded image path
    skills: [] as string[]
  });

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTech(null);
    setNewTechForm({
      name: '',
      role: '',
      specialization: 'mechanical',
      status: 'available',
      phone: '',
      joinDate: SYSTEM_ANCHOR_DATE,
      avatarSeed: Math.random().toString(36).substring(7),
      customAvatar: '',
      skills: []
    });
  };

  const handleStartEdit = (tech: Technician) => {
    setEditingTech(tech);
    let currentSeed = 'Aiden';
    let customAvatarStr = '';
    
    const reverseMatch = Object.entries(SEED_PHOTO_MAP).find(([key, val]) => val === tech.avatar);
    if (reverseMatch) {
      currentSeed = reverseMatch[0];
    } else if (tech.avatar.includes('api.dicebear.com')) {
      const match = tech.avatar.match(/seed=([^&]+)/);
      if (match && match[1]) {
        currentSeed = match[1];
      }
    } else {
      customAvatarStr = tech.avatar;
    }
    
    setNewTechForm({
      name: tech.name,
      role: tech.role,
      specialization: tech.specialization,
      status: tech.status,
      phone: tech.phone,
      joinDate: tech.joinDate || SYSTEM_ANCHOR_DATE,
      avatarSeed: currentSeed,
      customAvatar: customAvatarStr,
      skills: tech.skills || []
    });
    setIsFormOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTechForm(p => ({
          ...p,
          customAvatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Persist list updates automatically
  useEffect(() => {
    localStorage.setItem('fleet_technicians_v2', JSON.stringify(techList));
  }, [techList]);

  // Hourly quick-log managers for the main table view
  const handleQuickLogSet = (techId: string, date: string, hours: number) => {
    setTechList(prev => prev.map(t => {
      if (t.id === techId) {
        const logs = t.workLogs ? [...t.workLogs] : [];
        const existingIdx = logs.findIndex(log => log.date === date);
        if (existingIdx > -1) {
          logs[existingIdx] = { date, hours };
        } else {
          logs.push({ date, hours });
        }
        return { ...t, workLogs: logs };
      }
      return t;
    }));
  };

  const handleQuickLogChange = (techId: string, date: string, delta: number) => {
    setTechList(prev => prev.map(t => {
      if (t.id === techId) {
        const logs = t.workLogs ? [...t.workLogs] : [];
        const existingIdx = logs.findIndex(log => log.date === date);
        if (existingIdx > -1) {
          const newHours = Math.min(24, Math.max(0, logs[existingIdx].hours + delta));
          logs[existingIdx] = { date, hours: newHours };
        } else if (delta > 0) {
          logs.push({ date, hours: delta });
        }
        return { ...t, workLogs: logs };
      }
      return t;
    }));
  };

  // Helper calculating sum hours for current month (prefix: '2026-05')
  const getMonthlyHours = (tech: Technician) => {
    if (!tech.workLogs) return 0;
    return tech.workLogs
      .filter(log => log.date.startsWith('2026-05'))
      .reduce((sum, log) => sum + log.hours, 0);
  };

  // Handle Form Submission
  const handleCreateTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechForm.name || !newTechForm.role || !newTechForm.phone) {
      alert('فضلاً قم بملء جميع الحقول الإلزامية!');
      return;
    }

    if (editingTech) {
      // Editing existing technician
      setTechList(prev => prev.map(t => {
        if (t.id === editingTech.id) {
          return {
            ...t,
            name: newTechForm.name,
            role: newTechForm.role,
            specialization: newTechForm.specialization,
            status: newTechForm.status,
            phone: newTechForm.phone,
            joinDate: newTechForm.joinDate,
            avatar: getTechAvatar(newTechForm),
            skills: newTechForm.skills
          };
        }
        return t;
      }));
    } else {
      // Creating standard new technician
      const brandNew: Technician = {
        id: `TECH-${Date.now()}`,
        name: newTechForm.name,
        role: newTechForm.role,
        specialization: newTechForm.specialization,
        activeTasks: 0,
        status: newTechForm.status,
        avatar: getTechAvatar(newTechForm),
        joinDate: newTechForm.joinDate || SYSTEM_ANCHOR_DATE,
        phone: newTechForm.phone,
        skills: newTechForm.skills
      };

      setTechList(prev => [brandNew, ...prev]);
    }

    handleCloseForm();
  };

  // Toggle Technician Status quickly
  const handleUpdateStatus = (id: string, newStatus: Technician['status']) => {
    setTechList(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: newStatus };
      }
      return t;
    }));

    // sync current open detail
    setSelectedTech(prev => {
      if (prev && prev.id === id) {
        return { ...prev, status: newStatus };
      }
      return prev;
    });
  };

  // Delete technician
  const handleDeleteTech = (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الكادر الفني من السجلات نهائياً؟')) {
      setTechList(prev => prev.filter(t => t.id !== id));
      setSelectedTech(null);
    }
  };

  const filteredTechnicians = techList.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tech.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tech.phone.includes(searchTerm);
    const matchesSpec = activeSpec === 'all' || tech.specialization === activeSpec;
    return matchesSearch && matchesSpec;
  });

  const specs = ['all', 'mechanical', 'electrical', 'cooling', 'hydraulic', 'bodywork'];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header section styled elegantly like dashboard with purple gradient */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 text-white p-6 rounded-[2rem] border border-purple-900/40 shadow-xl relative overflow-hidden" dir="rtl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/15 border border-purple-500/20 rounded-full text-purple-300 text-[10px] font-black mb-1.5">
            <Sparkles size={11} className="animate-pulse text-purple-400" />
            <span>متابعة وتوزيع كفاءة الكادر الفني للورش</span>
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>{language === 'ar' ? 'إدارة الفنيين والعاملين' : 'Technicians & Staff Panel'}</span>
            </h1>
            
            <div className="shrink-0 text-slate-800 dark:text-slate-200">
              <ContextualHelp 
                id="technicians"
                titleAr="إدارة الفنيين والعاملين"
                titleEn="Technicians & Staff Directory"
                explanationAr="دليل تفصيلي لإدارة ورصد كفاءة وحضور وتخصصات الطاقم الميكانيكي والفني، وإسناد بطاقات العمل وتسجيل مراجعات السلامة والمهارات الفنية لكل مهندس وفني."
                explanationEn="A complete personnel management dashboard listing technician certifications, daily attendance, active work ticket assignments, and safety audit reports."
                benefitsAr={[
                  "متابعة دقيقة لحالة توفر الفنيين ومستويات ضغط العمل الفوري لكل فرد.",
                  "تسجيل ساعات الحضور والعمل الإضافي بشكل رصين لدعم كشوف الرواتب.",
                  "تقييم دقيق للمستويات الفنية وإصدار شهادات الامتثال المهني الميداني."
                ]}
                benefitsEn={[
                  "Directly audits the current availability and active job ticket queue of each mechanic.",
                  "Logs daily working hours, overtime milestones, and labor overheads.",
                  "Grants safety compliance badges based on quality inspections history."
                ]}
                tipsAr={[
                  "انقر على أي اسم فني بالجدول لفتح ملفه الميكانيكي وسجل تدقيق الأمان والسلامة الكامل الخاص به."
                ]}
                tipsEn={[
                  "Click on any technician row to view their full technical skills and safety audit records."
                ]}
                language={language}
              />
            </div>
          </div>
          <p className="text-xs md:text-[13px] text-purple-200/80 font-bold mt-2 leading-relaxed">
            متابعة تخصصات الفنيين بالورشة، توزيع جدول البلاغات، وإضافة الفنيين وحالاتهم التشغيلية.
          </p>
        </div>
        
        {/* Actions Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0 relative z-10 w-full lg:w-auto">
          {/* Main search input */}
          <div className="relative flex-1 sm:flex-none w-full sm:w-64 md:w-80">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-300" size={14} />
            <input 
              type="text"
              placeholder="ابحث بالاسم، التخصص أو الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 pl-4 py-2.5 bg-white/10 dark:bg-slate-900/50 border border-purple-500/20 focus:border-purple-400 rounded-xl text-xs font-black outline-none w-full shadow-inner transition-all placeholder:text-purple-300 text-white focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* ADD TECHNICIAN BUTTON */}
          <button 
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-650 hover:from-purple-500 hover:via-fuchsia-500 hover:to-indigo-505 text-white font-black text-xs rounded-xl transition-all shadow-md hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-purple-500/10 whitespace-nowrap"
          >
            <UserPlus size={15} />
            <span>إضافة فني جديد</span>
          </button>
        </div>
      </div>

      {/* View Mode and Specialization Filter Chips */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div className="flex flex-wrap gap-2 items-center">
          {specs.map(spec => (
            <button
              key={spec}
              onClick={() => setActiveSpec(spec)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border whitespace-nowrap cursor-pointer ${
                activeSpec === spec 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-650 text-white border-transparent shadow-md shadow-purple-500/10' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-705 hover:border-purple-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750/50'
              }`}
            >
              {spec !== 'all' && <SpecializationIcon spec={spec} size={13} />}
              <span>{spec === 'all' ? 'جميع الورش والوحدات' : specLabels[spec]}</span>
            </button>
          ))}
        </div>

        {/* View Mode switcher (Cards vs Table) */}
        <div className="flex items-center gap-1 bg-slate-100/85 dark:bg-slate-800/80 p-1 rounded-xl shrink-0 self-start lg:self-auto border border-slate-200/30 dark:border-slate-700/30">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-550 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            عرض البطاقات
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-550 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            سجل الساعات (التايم شيت)
          </button>
        </div>
      </div>

      {/* Technician Quick Task List & Field Notes component */}
      <TechnicianQuickTasks technicians={techList} />

      {/* Table vs Grid Display Containers */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-850 rounded-[2rem] border border-slate-100 dark:border-slate-705 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table id="technicians-table" className="w-full text-right border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-4.5 px-6">صورة واسم الفني</th>
                  <th className="py-4.5 px-6">المسمى الوظيفي</th>
                  <th className="py-4.5 px-6">شعبة التخصص</th>
                  <th className="py-4.5 px-6">الحالة التشغيلية</th>
                  <th className="py-4.5 px-6 text-center">سرعة تتبع المهام</th>
                  <th className="py-4.5 px-6 text-center bg-slate-100/50 dark:bg-slate-900/20">ساعات العمل اليومية (اليوم 21 مايو)</th>
                  <th className="py-4.5 px-6 text-center text-purple-600 dark:text-purple-400 bg-purple-50/15 dark:bg-purple-950/10 font-black">إجمالي الساعات الشهرية (مايو)</th>
                  <th className="py-4.5 px-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60 text-xs font-semibold">
                <AnimatePresence mode="popLayout">
                  {filteredTechnicians.map((tech) => {
                    const techOrders = maintenanceOrders.filter(o => o.technicianId === tech.id);
                    const completedCount = techOrders.filter(o => o.status === 'completed').length;
                    const specConf = specColors[tech.specialization] || specColors['mechanical'];
                    
                    const todayStr = '2026-05-21';
                    const todayLog = tech.workLogs?.find(l => l.date === todayStr);
                    const todayHours = todayLog ? todayLog.hours : 0;
                    const monthlyTotal = getMonthlyHours(tech);

                    let borderSpecialization = 'border-r-[6px] border-r-blue-500 hover:bg-blue-500/5 dark:hover:bg-blue-900/10';
                    if (tech.specialization === 'electrical') {
                      borderSpecialization = 'border-r-[6px] border-r-amber-500 hover:bg-amber-500/5 dark:hover:bg-amber-900/10';
                    } else if (tech.specialization === 'cooling') {
                      borderSpecialization = 'border-r-[6px] border-r-rose-450 hover:bg-rose-500/5 dark:hover:bg-rose-900/10';
                    } else if (tech.specialization === 'hydraulic') {
                      borderSpecialization = 'border-r-[6px] border-r-sky-500 hover:bg-sky-500/5 dark:hover:bg-sky-900/10';
                    } else if (tech.specialization === 'bodywork') {
                      borderSpecialization = 'border-r-[6px] border-r-emerald-500 hover:bg-emerald-500/5 dark:hover:bg-emerald-950/10';
                    }

                    return (
                      <motion.tr 
                        key={tech.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`transition-colors group cursor-pointer ${borderSpecialization}`}
                        onClick={() => setSelectedTech(tech)}
                      >
                        {/* Name & Avatar */}
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <img 
                              src={tech.avatar} 
                              alt={tech.name} 
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-xl object-cover bg-slate-50 border border-slate-100 dark:border-slate-700 shrink-0 self-start mt-0.5"
                            />
                            <div>
                              <span className="block font-black text-slate-800 dark:text-white group-hover:text-purple-650 transition-colors">{tech.name}</span>
                              <span className="block text-[9px] text-slate-400 font-bold mt-0.5 font-mono">{tech.id}</span>
                              {tech.skills && tech.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1 max-w-[220px]">
                                  {tech.skills.map((skill, sIdx) => {
                                    const colorConf = getSkillColor(skill);
                                    return (
                                      <span 
                                        key={sIdx} 
                                        className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold border leading-none ${colorConf.bg} ${colorConf.text} ${colorConf.border}`}
                                      >
                                        {skill}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-6 text-slate-500 dark:text-slate-400 font-bold">{tech.role}</td>

                        {/* Specialization */}
                        <td className="py-3 px-6">
                          <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg border inline-flex items-center gap-1.5 leading-none ${specConf.bg} ${specConf.text} ${specConf.border}`}>
                            <SpecializationIcon spec={tech.specialization} size={11} />
                            <span>{specLabels[tech.specialization]}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-6">
                          <div className="inline-flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              tech.status === 'available' ? 'bg-brand-green-500 animate-pulse' :
                              tech.status === 'busy' ? 'bg-brand-yellow-500' : 'bg-brand-red-400'
                            }`} />
                            <span className="text-[10px] font-bold text-slate-750 dark:text-slate-300">
                              {tech.status === 'available' ? 'متاح ومستعد' :
                               tech.status === 'busy' ? 'قيد عمل' : 'إجازة / غياب'}
                            </span>
                          </div>
                        </td>

                        {/* Active / Completed Tasks */}
                        <td className="py-3 px-6 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <div className="flex flex-col items-start gap-1 font-semibold text-[10px]">
                              <span className="px-1.5 py-0.5 bg-slate-150/70 dark:bg-slate-800 rounded text-[9px] font-black text-slate-600 dark:text-slate-350" title="بلاغات جارية">
                                {tech.activeTasks} جاري
                              </span>
                              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 rounded text-[9px] font-black" title="بلاغات مكتملة">
                                {completedCount || 4} مكتمل
                              </span>
                            </div>

                            {/* Tiny inline circular Pie Chart for Table Row */}
                            <div className="relative w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-100/60 dark:border-slate-700 shadow-inner" style={{ direction: 'ltr' }}>
                              <PieChart width={34} height={34}>
                                <Pie
                                  data={[
                                    { name: 'مكتمل', value: completedCount || 4, color: '#10B981' },
                                    { name: 'جاري', value: tech.activeTasks, color: '#6366F1' }
                                  ].filter(d => d.value > 0).length > 0 ? [
                                    { name: 'مكتمل', value: completedCount || 4, color: '#10B981' },
                                    { name: 'جاري', value: tech.activeTasks, color: '#6366F1' }
                                  ] : [
                                    { name: 'بلا مهام', value: 1, color: '#cbd5e1' }
                                  ]}
                                  cx={17}
                                  cy={17}
                                  innerRadius={9}
                                  outerRadius={15}
                                  dataKey="value"
                                >
                                  {([
                                    { name: 'مكتمل', value: completedCount || 4, color: '#10B981' },
                                    { name: 'جاري', value: tech.activeTasks, color: '#6366F1' }
                                  ].filter(d => d.value > 0).length > 0 ? [
                                    { name: 'مكتمل', value: completedCount || 4, color: '#10B981' },
                                    { name: 'جاري', value: tech.activeTasks, color: '#6366F1' }
                                  ] : [
                                    { name: 'بلا مهام', value: 1, color: '#cbd5e1' }
                                  ]).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </div>
                          </div>
                        </td>

                        {/* Quick Hour Logging Input / controls */}
                        <td 
                          className="py-3 px-6 text-center bg-slate-50/40 dark:bg-[#121829]/20"
                          onClick={(e) => e.stopPropagation()} // Prevent row selection from triggering profile drawer
                        >
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleQuickLogChange(tech.id, todayStr, -1)}
                              className="w-5 h-5 bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-black cursor-pointer shadow-xs active:scale-90 select-none"
                              title="إنقاص ساعة"
                            >
                              -
                            </button>
                            
                            <input
                              type="number"
                              min={0}
                              max={24}
                              value={todayHours || ''}
                              onChange={(e) => {
                                const h = parseInt(e.target.value) || 0;
                                handleQuickLogSet(tech.id, todayStr, Math.min(24, Math.max(0, h)));
                              }}
                              placeholder="0"
                              className="w-10 py-1 text-center font-black text-xs font-mono text-slate-800 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-inner outline-none focus:border-purple-500"
                              title="ساعات عمل اليوم"
                            />
                            
                            <button
                              onClick={() => handleQuickLogChange(tech.id, todayStr, 1)}
                              className="w-5 h-5 bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-705 flex items-center justify-center font-black cursor-pointer shadow-xs active:scale-90 select-none"
                              title="إضافة ساعة"
                            >
                              +
                            </button>
                            
                            <span className="text-[9px] text-slate-400 font-black mr-0.5">س</span>
                          </div>
                        </td>

                        {/* Monthly Hours Total */}
                        <td className="py-3 px-6 text-center text-purple-600 dark:text-purple-400 bg-purple-50/10 dark:bg-purple-950/10 font-bold">
                          <div className="flex items-center justify-center gap-1 font-mono">
                            <span className="font-black text-sm">{monthlyTotal}</span>
                            <span className="text-[10px] font-bold text-slate-400">ساعة</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedTech(tech)}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg text-[9.5px] font-black transition-all cursor-pointer"
                            >
                              كشف الساعات
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(tech)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-705 dark:text-slate-200 rounded-lg text-[9.5px] font-black transition-all cursor-pointer border border-slate-200/50 dark:border-slate-700"
                            >
                              تعديل
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTech(tech.id)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/45 dark:text-rose-450 rounded-lg text-[9.5px] font-black transition-all cursor-pointer border border-rose-100 dark:border-rose-900/30"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredTechnicians.length === 0 && (
            <div className="bg-white dark:bg-slate-800 p-16 rounded-2xl text-center text-slate-400">
              <Users size={40} className="mx-auto text-slate-350 dark:text-slate-600 mb-3 opacity-30" />
              <p className="font-bold text-xs text-slate-800 dark:text-slate-305">لا يوجد كادر فني يوافق تصفيتك الحالية</p>
              <p className="text-[10px] text-slate-400 mt-1">تغيير خيارات التصفية للرجوع للقائمة الأساسية.</p>
            </div>
          )}
        </div>
      ) : (
        /* Regular Deck Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTechnicians.map((tech) => {
              const techOrders = maintenanceOrders.filter(o => o.technicianId === tech.id);
              const completedCount = techOrders.filter(o => o.status === 'completed').length;
              const specConf = specColors[tech.specialization] || specColors['mechanical'];
              const monthlyTotal = getMonthlyHours(tech);
              
              let borderSpecialization = 'border-r-[6px] border-r-blue-500 hover:border-r-blue-600 bg-blue-500/0 dark:bg-blue-950/5';
              if (tech.specialization === 'electrical') {
                borderSpecialization = 'border-r-[6px] border-r-amber-500 hover:border-r-amber-600 bg-amber-500/0 dark:bg-amber-950/5';
              } else if (tech.specialization === 'cooling') {
                borderSpecialization = 'border-r-[6px] border-r-rose-450 hover:border-r-rose-500 bg-rose-500/0 dark:bg-[#1f1215]/30';
              } else if (tech.specialization === 'hydraulic') {
                borderSpecialization = 'border-r-[6px] border-r-sky-500 hover:border-r-sky-600 bg-sky-500/0 dark:bg-sky-950/5';
              } else if (tech.specialization === 'bodywork') {
                borderSpecialization = 'border-r-[6px] border-r-emerald-500 hover:border-r-emerald-600 bg-emerald-500/0 dark:bg-emerald-950/5';
              }

              return (
                <motion.div
                  key={tech.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  onClick={() => setSelectedTech(tech)}
                  className={`bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-100 dark:border-slate-755 shadow-sm overflow-hidden group hover:border-purple-300 dark:hover:border-slate-600 transition-all cursor-pointer flex flex-col justify-between ${borderSpecialization}`}
                >
                  <div className="p-4 flex-1">
                    
                    {/* Card head: Avatar and quick status badge */}
                    <div className="flex items-start justify-between mb-3.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative flex-shrink-0">
                          <img 
                            src={tech.avatar} 
                            alt={tech.name} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover bg-slate-50 border border-slate-100 dark:border-slate-700 shadow-sm" 
                          />
                          <div className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-905 shadow-sm ${
                            tech.status === 'available' ? 'bg-brand-green-500' :
                            tech.status === 'busy' ? 'bg-brand-yellow-500' : 'bg-brand-red-400'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[12px] font-black text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors truncate">
                            {tech.name}
                          </h3>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold truncate mt-0.5">
                            {tech.role}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 text-[9px] font-black rounded-lg border flex items-center gap-1 leading-none ${specConf.bg} ${specConf.text} ${specConf.border}`}>
                        <SpecializationIcon spec={tech.specialization} size={10} />
                        <span>{specLabels[tech.specialization] ? specLabels[tech.specialization].split(' ')[0] : 'أخر'}</span>
                      </span>
                    </div>

                    {/* Operational stats numbers row (Enhanced with Monthly Hours and Pie Chart) */}
                    <div className="flex items-center justify-between gap-2.5 mb-3.5 bg-slate-50/30 dark:bg-slate-900/10 p-2 rounded-2xl border border-slate-100/40 dark:border-slate-800/40">
                      <div className="flex-1 grid grid-cols-3 gap-1">
                        <div className="bg-slate-50/70 dark:bg-slate-900/40 p-1.5 rounded-xl border border-slate-100/30 text-center flex flex-col justify-center min-h-[48px]">
                          <p className="text-[7.5px] font-extrabold text-slate-400 dark:text-slate-500 leading-tight mb-0.5">المهام الجارية</p>
                          <span className="text-xs font-black text-slate-800 dark:text-white font-mono">{tech.activeTasks}</span>
                        </div>
                        <div className="bg-slate-50/70 dark:bg-slate-900/40 p-1.5 rounded-xl border border-slate-100/30 text-center flex flex-col justify-center min-h-[48px]">
                          <p className="text-[7.5px] font-extrabold text-slate-400 dark:text-slate-500 leading-tight mb-0.5">المنجز المكتمل</p>
                          <span className="text-xs font-black text-brand-green-500 font-mono">{completedCount || 4}</span>
                        </div>
                        <div className="bg-purple-50/50 dark:bg-purple-950/20 p-1.5 rounded-xl border border-purple-500/10 text-center flex flex-col justify-center min-h-[48px]">
                          <p className="text-[7.5px] font-extrabold text-purple-600 dark:text-purple-400 leading-tight mb-0.5">ساعات الشهر</p>
                          <span className="text-xs font-black text-purple-600 dark:text-purple-400 font-mono">{monthlyTotal}س</span>
                        </div>
                      </div>

                      {/* Miniature Pie/Donut Chart */}
                      <div className="relative flex-shrink-0 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-100 dark:border-slate-700 w-16 h-16 shadow-inner" title={`نسبة الإنجاز: ${Math.round((completedCount || 4) / ((completedCount || 4) + tech.activeTasks) * 100)}%`}>
                        <PieChart width={56} height={56}>
                          <Pie
                            data={[
                              { name: 'مكتمل', value: completedCount || 4, color: '#10B981' },
                              { name: 'جاري', value: tech.activeTasks, color: '#6366F1' }
                            ].filter(d => d.value > 0).length > 0 ? [
                              { name: 'مكتمل', value: completedCount || 4, color: '#10B981' },
                              { name: 'جاري', value: tech.activeTasks, color: '#6366F1' }
                            ] : [
                              { name: 'بلا مهام', value: 1, color: '#cbd5e1' }
                            ]}
                            cx={28}
                            cy={28}
                            innerRadius={15}
                            outerRadius={24}
                            paddingAngle={((completedCount || 4) > 0 && tech.activeTasks > 0) ? 3 : 0}
                            dataKey="value"
                          >
                            {([
                              { name: 'مكتمل', value: completedCount || 4, color: '#10B981' },
                              { name: 'جاري', value: tech.activeTasks, color: '#6366F1' }
                            ].filter(d => d.value > 0).length > 0 ? [
                              { name: 'مكتمل', value: completedCount || 4, color: '#10B981' },
                              { name: 'جاري', value: tech.activeTasks, color: '#6366F1' }
                            ] : [
                              { name: 'بلا مهام', value: 1, color: '#cbd5e1' }
                            ]).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                        {/* Center text of total/completion */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 font-mono">
                            {((completedCount || 4) + tech.activeTasks) > 0 
                              ? `${Math.round(((completedCount || 4) / ((completedCount || 4) + tech.activeTasks)) * 100)}%` 
                              : '0%'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Phone contact snippet */}
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 px-1 mb-2.5">
                      <Phone size={11} className="text-slate-400" />
                      <span className="font-mono tracking-tight">{tech.phone}</span>
                    </div>

                    {/* Specialized Skills Tags */}
                    {tech.skills && tech.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 px-1 mb-2">
                        {tech.skills.map((skill, sIdx) => {
                          const colorConf = getSkillColor(skill);
                          return (
                            <span 
                              key={sIdx} 
                              className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold border leading-none ${colorConf.bg} ${colorConf.text} ${colorConf.border}`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Foot actionable trigger */}
                  <div className="p-3 bg-slate-50/70 dark:bg-slate-900/20 border-t border-slate-100/60 dark:border-slate-800/40 space-y-2">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTech(tech);
                      }}
                      className="w-full text-center text-slate-650 dark:text-slate-300 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/30 py-1.5 rounded-xl text-[10.5px] font-extrabold transition-all duration-200 cursor-pointer block border border-slate-200/40 dark:border-slate-800"
                    >
                      عرض الملف والتحكم الفني
                    </button>

                    <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(tech)}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-255 rounded-xl text-[10px] font-black border border-slate-200 dark:border-slate-700 cursor-pointer transition-all"
                      >
                        <Wrench size={11} className="text-purple-500" />
                        <span>تعديل البيانات</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTech(tech.id)}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/45 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black border border-rose-100 dark:border-rose-900/30 cursor-pointer transition-all"
                      >
                        <Trash2 size={11} />
                        <span>حذف البيانات</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredTechnicians.length === 0 && (
            <div className="col-span-full bg-white dark:bg-slate-800 p-16 rounded-[2rem] border border-slate-100 dark:border-slate-700 text-center text-slate-400 shadow-soft">
              <Users size={40} className="mx-auto text-slate-350 dark:text-slate-600 mb-3 opacity-30" />
              <p className="font-bold text-xs text-slate-800 dark:text-slate-300">لا يوجد كادر فني يوافق تصفيتك الحالية</p>
              <p className="text-[10px] text-slate-400 mt-1">امسح خيارات البحث للرجوع للقائمة الأساسية.</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom statistics and fast action cards */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-705 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">توطيد الموارد الفنية وساعات التواجد</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
              يتكون الطاقم الحالي من <span className="font-extrabold text-purple-600">{techList.length} فنيين</span> نشطين وموزعين يغطون شفت الصيانة الميكانيكية والهيدروليكية على مدار 24 ساعة.
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto self-end md:self-center">
          <button 
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="flex-1 md:flex-initial px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            استيراد ملف كادر فني csv
          </button>
          
          <button 
            type="button"
            onClick={() => alert('جاري تصدير كشف الحالة والصيانة للفنيين...')}
            className="flex-1 md:flex-initial px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-500/10 hover:bg-purple-700 transition-all cursor-pointer"
          >
            طباعة كشف الإنتاجية
          </button>
        </div>
      </div>

      {/* PROFESSIONAL FORM MODAL (استمارة احترافية لإضافة فني) */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseForm}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            {/* Dialog Container */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white dark:bg-slate-850 w-full max-w-lg rounded-3xl shadow-2xl relative border border-slate-100 dark:border-slate-700 overflow-hidden z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {editingTech ? `تعديل بيانات الفني: ${editingTech.name}` : 'استمارة تسجيل كادر فني جديد'}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-550 font-bold">
                      {editingTech ? 'تحديث وتعديل سجل المهارات والحالة التشغيلية للفني' : 'تسجيل وتوزيع مهارات الفنيين المعتمدة'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseForm}
                  className="p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateTechnician} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                
                {/* Full name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">اسم الفني بالكامل:<span className="text-brand-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: المهندس محمد العلي"
                      value={newTechForm.name}
                      onChange={(e) => setNewTechForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-extrabold outline-none focus:ring-1 focus:ring-purple-500 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">رقم الهاتف الجوال:<span className="text-brand-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      placeholder="05xxxxxxxx"
                      value={newTechForm.phone}
                      onChange={(e) => setNewTechForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-black font-mono text-left outline-none focus:ring-1 focus:ring-purple-500 dark:text-white"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Job Role Title & Joining date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">المسمى الوظيفي الدقيق:<span className="text-brand-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: فني ميكانيك ثقيل أول"
                      value={newTechForm.role}
                      onChange={(e) => setNewTechForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-extrabold outline-none focus:ring-1 focus:ring-purple-500 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">تاريخ الالتحاق بالعمل:</label>
                    <input
                      type="date"
                      value={newTechForm.joinDate}
                      onChange={(e) => setNewTechForm(prev => ({ ...prev, joinDate: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-black text-left outline-none focus:ring-1 focus:ring-purple-500 dark:text-white"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Specialization Icon Grid choosing */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-705 dark:text-slate-300 block">شعبة التخصص (القسم الفني الرئيسي):</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(specLabels).map(([key, labelStr]) => {
                      const isSelected = newTechForm.specialization === key;
                      const conf = specColors[key] || specColors.mechanical;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setNewTechForm(p => ({ ...p, specialization: key as any }))}
                          className={`p-3 rounded-xl border text-right flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                            isSelected 
                              ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 font-black' 
                              : 'border-slate-150 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20 hover:border-slate-300'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${conf.bg}`}>
                            <SpecializationIcon spec={key} size={16} />
                          </div>
                          <span className="text-[10px] font-black text-slate-800 dark:text-slate-200">{labelStr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Specialized Skills Management */}
                <div className="space-y-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                  <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">
                    المهارات والخبرات التخصصية للفني:
                  </label>
                  
                  {/* Predefined skill chips to quickly click/toggle */}
                  <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-2xl border border-slate-150/60 dark:border-slate-800">
                    <span className="text-[9px] font-extrabold text-slate-450 block w-full mb-1">نقرة سريعة للإسناد:</span>
                    {[
                      'محركات ديزل', 'صيانة محركات', 'ناقل الحركة', 'كهرباء مركبات', 'دوائر كهربائية',
                      'حساسات ذكية', 'هيدروليك شاحنات', 'مضخات هيدروليكية', 'تبريد وتكييف', 'سمكرة وهيكل'
                    ].map(preSkill => {
                      const isIncluded = newTechForm.skills?.includes(preSkill);
                      const colorConf = getSkillColor(preSkill);
                      return (
                        <button
                          key={preSkill}
                          type="button"
                          onClick={() => {
                            setNewTechForm(prev => {
                              const list = prev.skills || [];
                              if (list.includes(preSkill)) {
                                return { ...prev, skills: list.filter(s => s !== preSkill) };
                              } else {
                                return { ...prev, skills: [...list, preSkill] };
                              }
                            });
                          }}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-xl border cursor-pointer transition-all ${
                            isIncluded 
                              ? `${colorConf.bg} ${colorConf.text} ${colorConf.border} font-black scale-[1.02] shadow-xs` 
                              : 'bg-white dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-750 hover:border-slate-350'
                          }`}
                        >
                          {isIncluded ? '✓ ' : ''}{preSkill}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom skills input block */}
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <input 
                        type="text"
                        id="custom-skill-input"
                        placeholder="أو اكتب مهارة مخصصة واضغط إضافة..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              setNewTechForm(prev => {
                                const list = prev.skills || [];
                                if (!list.includes(val)) {
                                  return { ...prev, skills: [...list, val] };
                                }
                                return prev;
                              });
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-purple-500 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('custom-skill-input') as HTMLInputElement;
                        const val = input?.value.trim();
                        if (val) {
                          setNewTechForm(prev => {
                            const list = prev.skills || [];
                            if (!list.includes(val)) {
                              return { ...prev, skills: [...list, val] };
                            }
                            return prev;
                          });
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-xl text-xs font-black cursor-pointer whitespace-nowrap"
                    >
                      إضافة مهارة
                    </button>
                  </div>

                  {/* Currently assigned custom/predefined skills list with close/remove button */}
                  {newTechForm.skills && newTechForm.skills.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-black text-slate-450 block">المهارات والوسوم المحددة حالياً:</span>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-105 dark:border-slate-800">
                        {newTechForm.skills.map((skill, sIdx) => {
                          const colorConf = getSkillColor(skill);
                          return (
                            <span 
                              key={sIdx} 
                              className={`px-2 py-0.5 rounded-lg text-[9.5px] font-black border flex items-center gap-1 ${colorConf.bg} ${colorConf.text} ${colorConf.border}`}
                            >
                              <span>{skill}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewTechForm(prev => ({
                                    ...prev,
                                    skills: (prev.skills || []).filter(s => s !== skill)
                                  }));
                                }}
                                className="text-current opacity-60 hover:opacity-100 p-0.5 font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
                              >
                                <X size={10} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Toggle option */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">حالة الخدمة التشغيلية المبدئية:</label>
                    <select
                      value={newTechForm.status}
                      onChange={(e) => setNewTechForm(p => ({ ...p, status: e.target.value as any }))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-extrabold outline-none focus:ring-1 focus:ring-purple-500 dark:text-white"
                    >
                      <option value="available">متاح حالياً (نشط ومستعد وبلا مهام)</option>
                      <option value="busy">مشغول بالعمل (منخرط في أمر صيانة)</option>
                      <option value="away">خارج العمل (إجازة / غير متواجد حالياً)</option>
                    </select>
                  </div>

                  {/* Quick Avatar seed styling generator & Custom Image Upload */}
                  <div className="space-y-2 col-span-1 sm:col-span-2">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">الصورة الرمزية للفني (أفتار أو صورة شخصية):</label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-150/60 dark:border-slate-800">
                      
                      {/* Option A: Quick Predefined Avatars */}
                      <div className="space-y-1.5">
                        <span className="text-[9.5px] font-black text-slate-450 uppercase block">خيار أ: الرموز الجاهزة (الأفاتار)</span>
                        <div className="flex gap-2 items-center">
                          <select
                            value={newTechForm.customAvatar ? 'custom' : newTechForm.avatarSeed}
                            onChange={(e) => {
                              if (e.target.value === 'custom') {
                                // Keep custom if already selected
                              } else {
                                setNewTechForm(p => ({ ...p, avatarSeed: e.target.value, customAvatar: '' }));
                              }
                            }}
                            className="flex-1 p-2 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-bold"
                          >
                            <option value="Aiden">النمط الكلاسيكي (1)</option>
                            <option value="Mason">النمط الحديث (2)</option>
                            <option value="George">النمط المناوب (3)</option>
                            <option value="Felix">النمط المتميز (4)</option>
                            <option value="Aneka">شفت الصيانة النسائية (5)</option>
                            {newTechForm.customAvatar && <option value="custom" disabled>صورة مرفوعة حالياً</option>}
                          </select>
                        </div>
                      </div>

                      {/* Option B: Custom File Upload */}
                      <div className="space-y-1.5 border-t md:border-t-0 md:border-r border-slate-200/40 dark:border-slate-800 pt-2.5 md:pt-0 md:pr-3">
                        <span className="text-[9.5px] font-black text-slate-450 uppercase block">خيار ب: رفع صورة من الملفات المحفوظة</span>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-900 hover:bg-slate-50 dark:hover:bg-slate-900/60 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition-all">
                            <Upload size={13} className="text-purple-500" />
                            <span>اختر ملف صورة</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileChange} 
                              className="hidden" 
                            />
                          </label>
                          {newTechForm.customAvatar && (
                            <button
                              type="button"
                              onClick={() => setNewTechForm(p => ({ ...p, customAvatar: '' }))}
                              className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 rounded-xl text-[10px] font-extrabold transition-all border border-rose-100 dark:border-rose-900/30 cursor-pointer"
                            >
                              إلغاء الصورة
                            </button>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Preview Area layout */}
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150/60 dark:border-slate-800 mt-1">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {newTechForm.customAvatar ? (
                          <img 
                            src={newTechForm.customAvatar} 
                            alt="Custom Avatar Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img 
                            src={getTechAvatar(newTechForm)}
                            alt="preview" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </div>
                      <div className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                        {newTechForm.customAvatar ? (
                          <div className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            ✓ تم اختيار صورة مخصصة بنجاح من جهازك
                          </div>
                        ) : (
                          <div>
                            مستعرض الرمز التعريفي الحالي. يمكنك رفع ملف صورة (JPG, PNG, SVG) ليحل محل الأفاتار التلقائي.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Form Actions footer */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    إلغاء الأمر
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-1"
                  >
                    <Check size={12} />
                    <span>
                      {editingTech ? 'حفظ التغييرات الفنية' : 'اعتماد إلحاق الكادر بالفريق'}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED TECHNICIAN PROFILE DRAWER / OVERLAY */}
      <AnimatePresence>
        {selectedTech && (() => {
          const techTasks = maintenanceOrders.filter(o => o.technicianId === selectedTech.id);
          const comp = techTasks.filter(o => o.status === 'completed');
          const ing = techTasks.filter(o => o.status === 'in-progress');
          const pend = techTasks.filter(o => o.status === 'pending');
          const specConf = specColors[selectedTech.specialization] || specColors['mechanical'];
          
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTech(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
              />
              {/* Card Container */}
              <motion.div 
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                className="bg-white dark:bg-slate-850 w-full max-w-md rounded-3xl shadow-2xl relative border border-slate-200/60 dark:border-slate-700 overflow-hidden z-10"
              >
                {/* Header Profile background band */}
                <div className="h-28 bg-gradient-to-l from-purple-500/10 via-purple-400/5 to-transparent relative p-5 flex items-end justify-between border-b border-slate-100 dark:border-slate-800">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[9px] font-black text-slate-500 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-200/50">
                    <Award size={10} className="text-purple-600" />
                    <span>ملف كادر معتمد</span>
                  </div>
                  <button 
                    onClick={() => setSelectedTech(null)}
                    className="absolute top-3 left-3 p-1 text-slate-400 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <X size={14} />
                  </button>

                  <div className="flex items-center gap-3 translate-y-7 z-10">
                    <img 
                      src={selectedTech.avatar} 
                      alt={selectedTech.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 p-0.5 border-2 border-white dark:border-slate-800 shadow-xl" 
                    />
                    <div>
                      <h4 className="font-black text-sm text-slate-950 dark:text-white">{selectedTech.name}</h4>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">{selectedTech.role}</p>
                    </div>
                  </div>
                </div>

                {/* Main Profile Info Section */}
                <div className="p-5 pt-10 space-y-4">
                  
                  {/* Status Toggle control block */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-800/50 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-black">
                      <span className="text-slate-400">الحالة النشطة للخدمة:</span>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedTech.status === 'available' ? 'bg-brand-green-500' :
                          selectedTech.status === 'busy' ? 'bg-brand-yellow-500' : 'bg-brand-red-400'
                        }`} />
                        <span className="text-slate-700 dark:text-slate-250">
                          {selectedTech.status === 'available' ? 'متاح ومستعد' :
                           selectedTech.status === 'busy' ? 'مشغول ببلاغ' : 'خارج الخدمة'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100/60 dark:border-slate-800/60">
                      {[
                        { key: 'available', label: 'متاح', color: 'hover:text-brand-green-500' },
                        { key: 'busy', label: 'قيد عمل', color: 'hover:text-brand-yellow-500' },
                        { key: 'away', label: 'غياب / إجازة', color: 'hover:text-brand-red-500' }
                      ].map((st) => {
                        const isCurrent = selectedTech.status === st.key;
                        return (
                          <button
                            key={st.key}
                            type="button"
                            onClick={() => handleUpdateStatus(selectedTech.id, st.key as any)}
                            className={`py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                              isCurrent 
                                ? 'bg-purple-600 text-white shadow-sm' 
                                : `bg-white dark:bg-slate-850 text-slate-500 border border-slate-100 dark:border-slate-800 ${st.color}`
                            }`}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Core specs Details List */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100/60 dark:border-slate-800/40">
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <BookOpen size={12} />
                        <span>شعبة التخصص:</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-black ${specConf.bg} ${specConf.text} ${specConf.border}`}>
                        {specLabels[selectedTech.specialization]}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100/60 dark:border-slate-800/40">
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <Phone size={11} />
                        <span>رقم الاتصال الداخلي:</span>
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-black font-mono tracking-tight select-all">
                        {selectedTech.phone}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100/60 dark:border-slate-800/40">
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <Calendar size={11} />
                        <span>تاريخ الانضمام للشركة:</span>
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold font-mono">
                        {selectedTech.joinDate}
                      </span>
                    </div>
                  </div>

                  {/* Specialized Skills Section */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-black text-slate-400 block">المهارات والوسوم التخصصية:</span>
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                      {selectedTech.skills && selectedTech.skills.length > 0 ? (
                        selectedTech.skills.map((skill, sIdx) => {
                          const colorConf = getSkillColor(skill);
                          return (
                            <span 
                              key={sIdx} 
                              className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border flex items-center gap-1 ${colorConf.bg} ${colorConf.text} ${colorConf.border}`}
                            >
                              <ShieldCheck size={10} className="text-current opacity-70" />
                              <span>{skill}</span>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold">لم يتم تحديد مهارات تخصصية لهذا الفني حتى الآن.</span>
                      )}
                    </div>
                  </div>

                  {/* Tasks breakdown indicators */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-black text-slate-400 block">إنتاجية المهام وبلاغات الصيانة للورشة:</span>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-extrabold text-slate-600 dark:text-slate-400">
                      <div className="bg-brand-red-50/50 dark:bg-brand-red-950/25 p-2 rounded-xl">
                        <span className="block text-slate-400 text-[8px]">بانتظار بدء العمل</span>
                        <span className="text-sm font-black text-brand-red-600">{pend.length || 0}</span>
                      </div>
                      <div className="bg-amber-50/50 dark:bg-amber-950/25 p-2 rounded-xl">
                        <span className="block text-slate-400 text-[8px]">مباشرة في المسار</span>
                        <span className="text-sm font-black text-brand-yellow-500">{ing.length || 1}</span>
                      </div>
                      <div className="bg-brand-green-50/50 dark:bg-brand-green-950/25 p-2 rounded-xl">
                        <span className="block text-slate-400 text-[8px]">منجزة بالكامل</span>
                        <span className="text-sm font-black text-brand-green-500">{comp.length || 4}</span>
                      </div>
                    </div>
                  </div>

                  {/* Technician Specific Quick Tasks & Notes */}
                  <div className="pt-1">
                    <TechnicianQuickTasks 
                      technicians={techList} 
                      focusedTechId={selectedTech.id} 
                      inDrawerMode={true} 
                    />
                  </div>

                  {/* WORK LOGS / TIMESHEET SYSTEM SECTION */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-150 dark:border-slate-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="text-purple-500" size={15} />
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">سجل ساعات الحضور والعمل اليومية</h4>
                      </div>
                      <span className="text-[10px] font-black text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                        {getMonthlyHours(selectedTech)} س الشهر الحالي
                      </span>
                    </div>

                    {/* Simple Quick logger inside Drawer */}
                    <div className="bg-white dark:bg-[#0c101c] p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-2">
                      <span className="text-[9px] font-black text-slate-400 block shrink-0">تسجيل مباشر لساعات يوم جديد:</span>
                      
                      <div className="flex items-center gap-2">
                        {/* Date Picker */}
                        <div className="flex-1">
                          <input 
                            type="date"
                            value={draftLogDate}
                            onChange={(e) => setDraftLogDate(e.target.value)}
                            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-white"
                          />
                        </div>
                        {/* Hours */}
                        <div className="w-16">
                          <input 
                            type="number"
                            min={1}
                            max={24}
                            value={draftLogHours || ''}
                            onChange={(e) => setDraftLogHours(parseInt(e.target.value) || 0)}
                            placeholder="ساعات"
                            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black text-center bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-white"
                          />
                        </div>
                        {/* Submit */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!draftLogHours || draftLogHours <= 0 || draftLogHours > 24) {
                              alert('الرجاء إدخال عدد ساعات واقعي وصحيح (بين 1 و 24)!');
                              return;
                            }
                            if (!draftLogDate) {
                              alert('الرجاء تحديد تاريخ تسجيل الحضور!');
                              return;
                            }
                            
                            // Log it
                            setTechList(prev => prev.map(t => {
                              if (t.id === selectedTech.id) {
                                const logs = t.workLogs ? [...t.workLogs] : [];
                                const existingIdx = logs.findIndex(log => log.date === draftLogDate);
                                if (existingIdx > -1) {
                                  logs[existingIdx] = { date: draftLogDate, hours: draftLogHours };
                                } else {
                                  logs.push({ date: draftLogDate, hours: draftLogHours });
                                }
                                return { ...t, workLogs: logs };
                              }
                              return t;
                            }));

                            // Sync local drawer item state
                            setSelectedTech(prev => {
                              if (prev) {
                                const logs = prev.workLogs ? [...prev.workLogs] : [];
                                const existingIdx = logs.findIndex(log => log.date === draftLogDate);
                                if (existingIdx > -1) {
                                  logs[existingIdx] = { date: draftLogDate, hours: draftLogHours };
                                } else {
                                  logs.push({ date: draftLogDate, hours: draftLogHours });
                                }
                                return { ...prev, workLogs: logs };
                              }
                              return prev;
                            });

                            alert(`تم بنجاح قيد تسجيل ساعات اليوم (${draftLogHours} س) للفني.`);
                          }}
                          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-black transition-all cursor-pointer inline-flex items-center"
                        >
                          قيد ساعات اليوم
                        </button>
                      </div>
                    </div>

                    {/* Historical Logs List */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 block pb-1">كشف الأيام المسجلة (التايم شيت للمراجعة):</span>
                      <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin">
                        {selectedTech.workLogs && selectedTech.workLogs.length > 0 ? (
                          [...selectedTech.workLogs]
                            .sort((a,b) => b.date.localeCompare(a.date))
                            .map((log, lIdx) => (
                              <div 
                                key={lIdx}
                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-lg flex items-center justify-between text-[10px] font-black"
                              >
                                <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                                  <Calendar size={10} className="text-slate-400" />
                                  <span>{log.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-800 dark:text-slate-200 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                    {log.hours} ساعة عمل
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`هل ترغب فعلاً بحذف بيان يوم ${log.date} من سجل هذا الفني؟`)) {
                                        // Update state
                                        setTechList(prev => prev.map(t => {
                                          if (t.id === selectedTech.id) {
                                            const filtered = (t.workLogs || []).filter(item => item.date !== log.date);
                                            return { ...t, workLogs: filtered };
                                          }
                                          return t;
                                        }));

                                        // Update drawer
                                        setSelectedTech(prev => {
                                          if (prev) {
                                            const filtered = (prev.workLogs || []).filter(item => item.date !== log.date);
                                            return { ...prev, workLogs: filtered };
                                          }
                                          return prev;
                                        });
                                      }
                                    }}
                                    className="text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                                    title="حذف هذا اليوم"
                                  >
                                    حذف
                                  </button>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-4 bg-white/45 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                            <span className="text-[9px] text-slate-400 font-bold block">لم يتم تسجيل أي ساعات عمل حضورية للفني حالياً.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SAFETY INSPECTION REPORTS ASSIGNED/CERTIFIED SECTION */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-150 dark:border-slate-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500" size={15} />
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">سجل تدقيق الأمان والسلامة الرقمي</h4>
                      </div>
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        الجودة والأمان
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {(() => {
                        const savedInsps = localStorage.getItem('fleet_safety_inspections');
                        let allInsps: any[] = [];
                        if (savedInsps) {
                          try { allInsps = JSON.parse(savedInsps); } catch (e) {}
                        }
                        const techOrderIds = techTasks.map(o => o.id);
                        const filteredInsps = allInsps.filter((insp: any) => 
                          (insp.checkedBy && insp.checkedBy.toLowerCase() === selectedTech.name.toLowerCase()) ||
                          (insp.signature && insp.signature.toLowerCase() === selectedTech.name.toLowerCase()) ||
                          techOrderIds.includes(insp.orderId)
                        );

                        if (filteredInsps.length === 0) {
                          return (
                            <div className="text-center py-4 bg-white/45 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                              <span className="text-[9px] text-slate-400 font-bold block">لا توجد سجلات فحص جودة أو سلامة رقمية مسجلة للفني حالياً.</span>
                            </div>
                          );
                        }

                        return (
                          <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin">
                            {filteredInsps.map((insp, idx) => {
                              const matchedOrder = maintenanceOrders.find(o => o.id === insp.orderId);
                              return (
                                <div 
                                  key={idx}
                                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-lg space-y-1 text-right text-[10px]"
                                >
                                  <div className="flex items-center justify-between font-black">
                                    <span className="text-slate-800 dark:text-slate-200">
                                      {matchedOrder ? matchedOrder.description : `أمر صيانة #${insp.orderId}`}
                                    </span>
                                    <span className={`px-1.5 py-0.25 rounded text-[8px] font-black ${
                                      insp.overallStatus === 'safe' 
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                        : insp.overallStatus === 'warn' 
                                        ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400' 
                                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                                    }`}>
                                      {insp.overallStatus === 'safe' ? 'آمن وتشغيلي' : insp.overallStatus === 'warn' ? 'ملاحظات مقبولة' : 'خطر / توقف'}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[8px] text-slate-400 font-bold">
                                    <span>المسار: {insp.type === 'before' ? 'فحص قبل الصيانة' : 'فحص بعد الصيانة'}</span>
                                    <span className="font-mono">{insp.timestamp?.split('T')[0] || ''}</span>
                                  </div>
                                  {insp.checkedBy && (
                                    <div className="text-[8px] text-slate-400 font-bold">
                                      الموقع / الفني: <span className="text-slate-650 dark:text-slate-300 font-black">{insp.checkedBy}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Actions footer (Edit, Delete, Close) */}
                  <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                    <div className="flex items-center justify-between gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const t = selectedTech;
                          setSelectedTech(null);
                          handleStartEdit(t);
                        }}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-slate-700 cursor-pointer transition-colors"
                      >
                        <Wrench size={11} className="text-purple-500" />
                        <span>تعديل البيانات</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('هل أنت متأكد من رغبتك في حذف هذا الكادر الفني من السجل نهائياً؟')) {
                            setTechList(prev => prev.filter(t => t.id !== selectedTech.id));
                            setSelectedTech(null);
                          }
                        }}
                        className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/45 dark:text-rose-450 rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1.5 border border-rose-100 dark:border-rose-900/30 cursor-pointer transition-all"
                      >
                        <Trash2 size={11} />
                        <span>حذف البيانات</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTech(null)}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black cursor-pointer transition-all mt-1 shadow-sm"
                    >
                      إغلاق نافذة الملف
                    </button>
                  </div>

                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
