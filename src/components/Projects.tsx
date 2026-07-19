import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Edit, Trash2, Calendar, Briefcase, 
  DollarSign, CheckSquare, Clock, AlertTriangle, Users, Truck,
  PlusCircle, Check, X, LayoutGrid, List, TrendingUp, BarChart3,
  ChevronRight, ArrowLeftRight, Percent, CheckCircle2, Play, Pause,
  AlertCircle, Sparkles
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useLanguage } from '../services/LanguageContext';
import { Vehicle, Driver, User as AppUser } from '../types';
import { vehicles as staticVehicles } from '../data';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces for our Operational Projects
export interface ProjectTask {
  id: string;
  title: string;
  assigneeType: 'driver' | 'technician' | 'other';
  assigneeId: string;
  assigneeName: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
}

export interface OperationalProject {
  id: string;
  name: string;
  nameEn: string;
  client: string;
  clientEn: string;
  startDate: string;
  endDate: string;
  budget: number;
  expenses: number;
  status: 'pending' | 'active' | 'completed' | 'paused';
  description: string;
  descriptionEn: string;
  allocatedVehicleIds: string[];
  allocatedDriverIds: string[];
  tasks: ProjectTask[];
}

interface ProjectsProps {
  user: AppUser;
}

// Local translations for the Projects module
const TRANSLATIONS = {
  ar: {
    title: 'إدارة المشاريع التشغيلية',
    subtitle: 'تخطيط، جدولة ومراقبة عمليات الأسطول كحزم مشاريع متكاملة مع ميزانيات ومهام تشغيلية.',
    newProject: 'مشروع تشغيلي جديد',
    totalProjects: 'إجمالي المشاريع',
    activeProjects: 'المشاريع النشطة',
    completedProjects: 'المشاريع المكتملة',
    totalBudget: 'الميزانية الكلية للمشاريع',
    totalExpenses: 'إجمالي المصروفات والمحروقات',
    searchPlaceholder: 'البحث عن مشروع، عميل أو مركبة...',
    allStatuses: 'كل الحالات',
    pending: 'قيد الانتظار',
    active: 'نشط',
    completed: 'مكتمل',
    paused: 'متوقف مؤقتاً',
    status: 'الحالة',
    client: 'العميل',
    duration: 'المدة',
    budget: 'الميزانية',
    expenses: 'المصروفات',
    allocatedAssets: 'الأصول المخصصة',
    vehicles: 'مركبات',
    drivers: 'سائقين',
    progress: 'نسبة الإنجاز',
    noProjects: 'لا توجد مشاريع تشغيلية حالياً. ابدأ بإضافة مشروع جديد!',
    addProjectTitle: 'إضافة مشروع تشغيلي جديد',
    editProjectTitle: 'تعديل المشروع التشغيلي',
    projectNameAr: 'اسم المشروع (بالعربية)',
    projectNameEn: 'اسم المشروع (بالانجليزية)',
    clientAr: 'اسم العميل (بالعربية)',
    clientEn: 'اسم العميل (بالانجليزية)',
    descAr: 'الوصف ونطاق العمل (بالعربية)',
    descEn: 'الوصف ونطاق العمل (بالانجليزية)',
    startDate: 'تاريخ البدء',
    endDate: 'تاريخ الانتهاء المخطط',
    projectBudget: 'ميزانية المشروع المعتمدة ($)',
    projectExpenses: 'المصروفات التشغيلية والمحروقات المبدئية ($)',
    allocateVehicles: 'تخصيص مركبات ومعدات للعملية',
    searchVehiclesPlaceholder: 'ابحث عن مركبة، آلية أو رقم اللوحة...',
    allocateDrivers: 'تخصيص سائقين ومشغلي أجهزة',
    searchDriversPlaceholder: 'ابحث عن سائق باسمه أو نوع الرخصة...',
    cancel: 'إلغاء',
    save: 'حفظ المشروع',
    tasksAndMilestones: 'المهام ومحطات المشروع',
    addTask: 'إضافة مهمة تشغيلية',
    taskTitle: 'عنوان المهمة',
    assignee: 'المسؤول',
    dueDate: 'تاريخ الاستحقاق',
    priority: 'الأولوية',
    high: 'عالية',
    medium: 'متوسطة',
    low: 'منخفضة',
    todo: 'المتبقي',
    in_progress: 'قيد التنفيذ',
    done: 'تم إنجازها',
    deleteConfirm: 'هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف كافة المهام والأصول المرتبطة به.',
    financialOverview: 'التحليل المالي والميزانيات',
    budgetVsCost: 'الميزانية المرصودة مقابل المصروفات الفعلية',
    allocatedAssetDetails: 'تفاصيل الأصول والكوادر المعينة للمشروع',
    noTasks: 'لا توجد مهام تشغيلية مضافة لهذا المشروع بعد.',
    activeTasks: 'المهام التشغيلية النشطة',
    completedTasks: 'المهام المنجزة',
    driverSelector: 'اختر سائقاً',
    vehicleSelector: 'اختر مركبة',
    projectStats: 'مؤشرات الأداء للمشاريع',
    kanbanView: 'لوحة المهام (Kanban)',
    listView: 'عرض القائمة'
  },
  en: {
    title: 'Operational Project Management',
    subtitle: 'Plan, schedule, and monitor fleet operations as integrated projects with budgets and tasks.',
    newProject: 'New Operational Project',
    totalProjects: 'Total Projects',
    activeProjects: 'Active Projects',
    completedProjects: 'Completed Projects',
    totalBudget: 'Total Projects Budget',
    totalExpenses: 'Total Expenses & Fuel Costs',
    searchPlaceholder: 'Search projects, clients, or vehicles...',
    allStatuses: 'All Statuses',
    pending: 'Pending',
    active: 'Active',
    completed: 'Completed',
    paused: 'Paused',
    status: 'Status',
    client: 'Client',
    duration: 'Duration',
    budget: 'Budget',
    expenses: 'Expenses',
    allocatedAssets: 'Allocated Assets',
    vehicles: 'Vehicles',
    drivers: 'Drivers',
    progress: 'Progress',
    noProjects: 'No operational projects found. Start by creating a new project!',
    addProjectTitle: 'Add New Operational Project',
    editProjectTitle: 'Edit Operational Project',
    projectNameAr: 'Project Name (Arabic)',
    projectNameEn: 'Project Name (English)',
    clientAr: 'Client Name (Arabic)',
    clientEn: 'Client Name (English)',
    descAr: 'Description & Scope (Arabic)',
    descEn: 'Description & Scope (English)',
    startDate: 'Start Date',
    endDate: 'Planned End Date',
    projectBudget: 'Approved Project Budget ($)',
    projectExpenses: 'Initial Operational Expenses & Fuel ($)',
    allocateVehicles: 'Allocate Vehicles & Machinery',
    searchVehiclesPlaceholder: 'Search vehicle, machinery, or plate...',
    allocateDrivers: 'Allocate Drivers & Heavy Operators',
    searchDriversPlaceholder: 'Search driver by name or license type...',
    cancel: 'Cancel',
    save: 'Save Project',
    tasksAndMilestones: 'Tasks & Milestones',
    addTask: 'Add Operational Task',
    taskTitle: 'Task Title',
    assignee: 'Assignee',
    dueDate: 'Due Date',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
    deleteConfirm: 'Are you sure you want to delete this project? This will remove all associated tasks.',
    financialOverview: 'Financial Overview & Budgets',
    budgetVsCost: 'Allocated Budget vs. Real Expenses',
    allocatedAssetDetails: 'Allocated Fleet Assets & Drivers',
    noTasks: 'No tasks added to this project yet.',
    activeTasks: 'Active Operational Tasks',
    completedTasks: 'Completed Tasks',
    driverSelector: 'Select Driver',
    vehicleSelector: 'Select Vehicle',
    projectStats: 'Project Performance Indicators',
    kanbanView: 'Kanban Board',
    listView: 'List View'
  }
};

const INITIAL_PROJECTS: OperationalProject[] = [
  {
    id: 'proj-101',
    name: 'مشروع نقل توربينات الطاقة الهوائية - حقل سدير',
    nameEn: 'Sudair Wind Turbine Transport Project',
    client: 'الشركة السعودية للكهرباء (SEC)',
    clientEn: 'Saudi Electricity Company (SEC)',
    startDate: '2026-05-01',
    endDate: '2026-08-30',
    budget: 350000,
    expenses: 142000,
    status: 'active',
    description: 'نقل وتأمين الأجزاء العملاقة والتوربينات الهوائية الثقيلة من ميناء جدة الإسلامي إلى حقل الطاقة المتجددة في سدير بمسافات لوجستية شاسعة.',
    descriptionEn: 'Transportation of wind turbines and giant mechanical parts from Jeddah Islamic Port to Sudair Renewable Energy Depot.',
    allocatedVehicleIds: ['2', '4'],
    allocatedDriverIds: ['d2', 'd4'],
    tasks: [
      {
        id: 't-1',
        title: 'فحص فني شامل للناقلات الثقيلة والمقطورات الملحقة',
        assigneeType: 'technician',
        assigneeId: 'u2',
        assigneeName: 'الفني أحمد الشمراني',
        dueDate: '2026-05-05',
        priority: 'high',
        status: 'completed'
      },
      {
        id: 't-2',
        title: 'شحن ونقل الدفعة الأولى من شفرات التوربينات العملاقة',
        assigneeType: 'driver',
        assigneeId: 'd2',
        assigneeName: 'فهد بن مساعد المرشدي',
        dueDate: '2026-06-15',
        priority: 'high',
        status: 'in_progress'
      },
      {
        id: 't-3',
        title: 'استكمال تراخيص عبور الطرق وتأمين الحراسة الميدانية للآليات',
        assigneeType: 'other',
        assigneeId: 'other-1',
        assigneeName: 'سارة القحطاني',
        dueDate: '2026-05-10',
        priority: 'medium',
        status: 'completed'
      },
      {
        id: 't-4',
        title: 'صيانة وقائية دورية مجدولة للمحاور الميكانيكية للرافعات الشوكية كاتربيلر',
        assigneeType: 'technician',
        assigneeId: 'u2',
        assigneeName: 'الفني أحمد الشمراني',
        dueDate: '2026-07-20',
        priority: 'low',
        status: 'todo'
      }
    ]
  },
  {
    id: 'proj-102',
    name: 'عقد الخدمات اللوجستية الموحد - أمانة منطقة الرياض',
    nameEn: 'Unified Logistics Service - Riyadh Municipality',
    client: 'أمانة منطقة الرياض',
    clientEn: 'Riyadh Municipality',
    startDate: '2026-01-10',
    endDate: '2026-12-31',
    budget: 680000,
    expenses: 412000,
    status: 'active',
    description: 'توزيع الحاويات وتغطية مسارات النقل واللوجستيات والصيانة للمعدات الهندسية ومجموعات تنظيف الأحياء الذكية شمال وشرق العاصمة.',
    descriptionEn: 'Daily transit schedules, waste management equipment routes, and municipal engineering support for northern sectors.',
    allocatedVehicleIds: ['1', '3'],
    allocatedDriverIds: ['d1', 'd3'],
    tasks: [
      {
        id: 't-10',
        title: 'تهيئة وتفويض رخص قيادة السائقين للعمل بنظام الورديات الإضافية',
        assigneeType: 'driver',
        assigneeId: 'd1',
        assigneeName: 'سالم عبد الرحمن الدوسري',
        dueDate: '2026-01-15',
        priority: 'medium',
        status: 'completed'
      },
      {
        id: 't-11',
        title: 'صرف فلاتر الزيوت وقطع الاستهلاك الأساسي لشاحنات وحافلات الدعم اللوجستي',
        assigneeType: 'technician',
        assigneeId: 'u2',
        assigneeName: 'أحمد الشمراني',
        dueDate: '2026-02-28',
        priority: 'high',
        status: 'completed'
      },
      {
        id: 't-12',
        title: 'جدولة مسارات الأحياء الجديدة وإطلاق تطبيق التفتيش الفني اليومي الميداني',
        assigneeType: 'other',
        assigneeId: 'other-2',
        assigneeName: 'سارة القحطاني',
        dueDate: '2026-06-30',
        priority: 'high',
        status: 'in_progress'
      }
    ]
  },
  {
    id: 'proj-103',
    name: 'تطوير مسارات النقل التبادلي الذكي للزوار - موسم القدية',
    nameEn: 'Smart Shuttle Operations - Qiddiya Season',
    client: 'شركة القدية للاستثمار (QIC)',
    clientEn: 'Qiddiya Investment Company (QIC)',
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    budget: 210000,
    expenses: 0,
    status: 'pending',
    description: 'تأجير وتشغيل أسطول الحافلات الصديقة للبيئة والسيارات الكهربائية لنقل الجماهير والضيوف والمهندسين بين الفعاليات الترفيهية والميدانية الموزعة.',
    descriptionEn: 'Electric shuttle transport design and operations for visitors and staff during key events.',
    allocatedVehicleIds: ['3'],
    allocatedDriverIds: ['d3'],
    tasks: [
      {
        id: 't-20',
        title: 'فحص كفاءة بطاريات حافلات النقل ومحطات الشحن السريع بالقدية',
        assigneeType: 'technician',
        assigneeId: 'u2',
        assigneeName: 'ميكانيك أول صيانة',
        dueDate: '2026-08-25',
        priority: 'high',
        status: 'todo'
      }
    ]
  }
];

export default function Projects({ user }: ProjectsProps) {
  const { language, dir } = useLanguage();
  const isRtl = language === 'ar';
  const t = isRtl ? TRANSLATIONS.ar : TRANSLATIONS.en;

  // Load Projects from storage
  const [projects, setProjects] = useState<OperationalProject[]>(() => {
    const saved = localStorage.getItem('fleet_projects_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_PROJECTS;
  });

  // Load Vehicles & Drivers from local storage to allocate dynamically
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('fleet_vehicles_v3') || localStorage.getItem('fleet_vehicles_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return staticVehicles;
  });

  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('saas_drivers_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'd1', name: 'سالم عبد الرحمن الدوسري', status: 'active', licenseType: 'خفيف' },
      { id: 'd2', name: 'فهد بن مساعد المرشدي', status: 'active', licenseType: 'ثقيل' },
      { id: 'd3', name: 'عبد الله عمر الحربي', status: 'active', licenseType: 'عمومي' },
      { id: 'd4', name: 'عادل منصور القحطاني', status: 'active', licenseType: 'إنشائي' },
      { id: 'd5', name: 'سلطان صلاح الغامدي', status: 'vacation', licenseType: 'خفيف' }
    ] as any[];
  });

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<OperationalProject | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<OperationalProject | null>(null);

  // Project Form States
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [clientAr, setClientAr] = useState('');
  const [clientEn, setClientEn] = useState('');
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [budgetVal, setBudgetVal] = useState<number>(0);
  const [expensesVal, setExpensesVal] = useState<number>(0);
  const [projStatus, setProjStatus] = useState<'pending' | 'active' | 'completed' | 'paused'>('pending');
  const [descAr, setDescAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [selectedVehIds, setSelectedVehIds] = useState<string[]>([]);
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [driverSearchQuery, setDriverSearchQuery] = useState('');

  // Task form within details state
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskTitleVal, setTaskTitleVal] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskAssigneeType, setTaskAssigneeType] = useState<'driver' | 'technician' | 'other'>('driver');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('fleet_projects_v1', JSON.stringify(projects));
  }, [projects]);

  // Sync available vehicles & drivers from general state
  useEffect(() => {
    const handleStorageChange = () => {
      const vSaved = localStorage.getItem('fleet_vehicles_v3') || localStorage.getItem('fleet_vehicles_v2');
      if (vSaved) {
        try { setAvailableVehicles(JSON.parse(vSaved)); } catch (e) {}
      }
      const dSaved = localStorage.getItem('saas_drivers_v1');
      if (dSaved) {
        try { setAvailableDrivers(JSON.parse(dSaved)); } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Set selected project details up to date when projects state updates
  useEffect(() => {
    if (selectedProject) {
      const upToDateProj = projects.find(p => p.id === selectedProject.id);
      if (upToDateProj) {
        setSelectedProject(upToDateProj);
      }
    }
  }, [projects]);

  const handleOpenForm = (project: OperationalProject | null = null) => {
    setVehicleSearchQuery('');
    setDriverSearchQuery('');
    if (project) {
      setEditingProject(project);
      setNameAr(project.name);
      setNameEn(project.nameEn);
      setClientAr(project.client);
      setClientEn(project.clientEn);
      setStartDateStr(project.startDate);
      setEndDateStr(project.endDate);
      setBudgetVal(project.budget);
      setExpensesVal(project.expenses);
      setProjStatus(project.status);
      setDescAr(project.description);
      setDescEn(project.descriptionEn);
      setSelectedVehIds(project.allocatedVehicleIds || []);
      setSelectedDriverIds(project.allocatedDriverIds || []);
    } else {
      setEditingProject(null);
      setNameAr('');
      setNameEn('');
      setClientAr('');
      setClientEn('');
      setStartDateStr(new Date().toISOString().split('T')[0]);
      setEndDateStr('');
      setBudgetVal(100000);
      setExpensesVal(0);
      setProjStatus('pending');
      setDescAr('');
      setDescEn('');
      setSelectedVehIds([]);
      setSelectedDriverIds([]);
    }
    setIsFormOpen(true);
  };



  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !nameEn.trim()) return;

    if (editingProject) {
      // Edit mode
      const updated = projects.map(p => {
        if (p.id === editingProject.id) {
          return {
            ...p,
            name: nameAr,
            nameEn: nameEn,
            client: clientAr,
            clientEn: clientEn,
            startDate: startDateStr,
            endDate: endDateStr,
            budget: Number(budgetVal),
            expenses: Number(expensesVal),
            status: projStatus,
            description: descAr,
            descriptionEn: descEn,
            allocatedVehicleIds: selectedVehIds,
            allocatedDriverIds: selectedDriverIds
          };
        }
        return p;
      });
      setProjects(updated);
      
      // Dispatch notification
      window.dispatchEvent(new CustomEvent('add-notification', {
        detail: {
          type: 'info',
          titleAr: 'تحديث مشروع تشغيلي',
          titleEn: 'Operational Project Updated',
          msgAr: `تم تحديث بيانات مشروع [${nameAr}] بنجاح وتأمين خطوط الدعم الميدانية.`,
          msgEn: `Operational parameters for project ${nameAr} updated successfully.`
        }
      }));
    } else {
      // Add mode
      const newProj: OperationalProject = {
        id: `proj-${Date.now()}`,
        name: nameAr,
        nameEn: nameEn,
        client: clientAr,
        clientEn: clientEn,
        startDate: startDateStr,
        endDate: endDateStr,
        budget: Number(budgetVal),
        expenses: Number(expensesVal),
        status: projStatus,
        description: descAr,
        descriptionEn: descEn,
        allocatedVehicleIds: selectedVehIds,
        allocatedDriverIds: selectedDriverIds,
        tasks: []
      };
      setProjects([...projects, newProj]);

      window.dispatchEvent(new CustomEvent('add-notification', {
        detail: {
          type: 'info',
          titleAr: 'مشروع تشغيلي جديد',
          titleEn: 'New Operational Project',
          msgAr: `تم إطلاق مشروع تشغيلي جديد [${nameAr}] بنجاح وتنسيق الميدان.`,
          msgEn: `Successfully initiated operational project [${nameEn}].`
        }
      }));
    }
    setIsFormOpen(false);
  };

  // Task Handlers
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitleVal.trim() || !selectedProject) return;

    let assigneeName = 'غير معين';
    if (taskAssigneeType === 'driver') {
      const drv = availableDrivers.find(d => d.id === taskAssigneeId);
      assigneeName = drv ? drv.name : 'سائق الأسطول المعين';
    } else if (taskAssigneeType === 'technician') {
      assigneeName = 'فني الصيانة المعتمد';
    } else {
      assigneeName = 'مراقب جودة الميدان';
    }

    const newTask: ProjectTask = {
      id: `task-${Date.now()}`,
      title: taskTitleVal,
      assigneeType: taskAssigneeType,
      assigneeId: taskAssigneeId,
      assigneeName,
      dueDate: taskDueDate || new Date().toISOString().split('T')[0],
      priority: taskPriority,
      status: 'todo'
    };

    const updated = projects.map(p => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          tasks: [...(p.tasks || []), newTask]
        };
      }
      return p;
    });

    setProjects(updated);
    setIsTaskFormOpen(false);
    setTaskTitleVal('');
    setTaskAssigneeId('');
    setTaskDueDate('');

    window.dispatchEvent(new CustomEvent('add-notification', {
      detail: {
        type: 'info',
        titleAr: 'مهمة تشغيلية جديدة',
        titleEn: 'New Operation Task',
        msgAr: `تم بنجاح تعيين مهمة [${taskTitleVal}] للسائق/المشرف في مشروع ${selectedProject.name}.`,
        msgEn: `Allocated task [${taskTitleVal}] inside project ${selectedProject.nameEn}.`
      }
    }));
  };

  const handleToggleTaskStatus = (projId: string, taskId: string, currentStatus: 'todo' | 'in_progress' | 'completed') => {
    const nextStatusMap: Record<string, 'todo' | 'in_progress' | 'completed'> = {
      'todo': 'in_progress',
      'in_progress': 'completed',
      'completed': 'todo'
    };
    const next = nextStatusMap[currentStatus];

    const updated = projects.map(p => {
      if (p.id === projId) {
        const updatedTasks = p.tasks.map(t => t.id === taskId ? { ...t, status: next } : t);
        return { ...p, tasks: updatedTasks };
      }
      return p;
    });
    setProjects(updated);
  };

  const handleRemoveTask = (projId: string, taskId: string) => {
    const updated = projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          tasks: p.tasks.filter(t => t.id !== taskId)
        };
      }
      return p;
    });
    setProjects(updated);
  };

  const handleDeleteProject = (projId: string) => {
    if (!window.confirm(isRtl ? 'هل أنت متأكد من حذف هذا المشروع التشغيلي؟' : 'Are you sure you want to delete this operational project?')) return;
    const updated = projects.filter(p => p.id !== projId);
    setProjects(updated);
    if (selectedProject?.id === projId) {
      setSelectedProject(null);
    }
    
    window.dispatchEvent(new CustomEvent('add-notification', {
      detail: {
        type: 'warning',
        titleAr: 'حذف مشروع تشغيلي',
        titleEn: 'Operational Project Deleted',
        msgAr: 'تم حذف المشروع التشغيلي بنجاح وإلغاء ارتباط كافة السائقين والآليات من الميدان.',
        msgEn: 'Successfully deleted the operational project and unallocated all driver and vehicle assets.'
      }
    }));
  };

  const handleToggleStatusDirectly = (proj: OperationalProject) => {
    const nextStatus: 'active' | 'pending' | 'completed' | 'paused' = proj.status === 'active' ? 'paused' : 'active';
    const updated = projects.map(p => {
      if (p.id === proj.id) {
        return { ...p, status: nextStatus };
      }
      return p;
    });
    setProjects(updated);
    
    window.dispatchEvent(new CustomEvent('add-notification', {
      detail: {
        type: 'info',
        titleAr: nextStatus === 'active' ? 'تنشيط المشروع التشغيلي' : 'إيقاف المشروع التشغيلي مؤقتاً',
        titleEn: nextStatus === 'active' ? 'Operational Project Activated' : 'Operational Project Paused',
        msgAr: nextStatus === 'active' ? `تم إعادة تنشيط المشروع [${proj.name}] في الميدان.` : `تم إيقاف المشروع [${proj.name}] مؤقتاً وتجميد المهام الميدانية.`,
        msgEn: nextStatus === 'active' ? `Project [${proj.nameEn}] has been re-activated.` : `Project [${proj.nameEn}] has been temporarily paused.`
      }
    }));
  };

  // Calculations for KPI Cards
  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalExpenses = projects.reduce((acc, p) => acc + p.expenses, 0);
  const activeCount = projects.filter(p => p.status === 'active').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;

  const filteredProjects = projects.filter(p => {
    // Check if any allocated vehicles match the search query
    const matchingVehicles = (p.allocatedVehicleIds || []).map(vid => availableVehicles.find(v => v.id === vid)).filter(Boolean);
    const hasMatchingVehicle = matchingVehicles.some(v => 
      v!.name.toLowerCase().includes(search.toLowerCase()) ||
      (v!.plateNumber && v!.plateNumber.toLowerCase().includes(search.toLowerCase())) ||
      (v!.type && v!.type.toLowerCase().includes(search.toLowerCase()))
    );

    // Check if any allocated drivers match the search query
    const matchingDrivers = (p.allocatedDriverIds || []).map(did => availableDrivers.find(d => d.id === did)).filter(Boolean);
    const hasMatchingDriver = matchingDrivers.some(d => 
      d!.name.toLowerCase().includes(search.toLowerCase()) ||
      (d!.licenseType && d!.licenseType.toLowerCase().includes(search.toLowerCase()))
    );

    const matchSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.clientEn.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.descriptionEn.toLowerCase().includes(search.toLowerCase()) ||
      hasMatchingVehicle ||
      hasMatchingDriver;
    
    if (statusFilter === 'all') return matchSearch;
    return matchSearch && p.status === statusFilter;
  });

  // Recharts financial chart data mapping
  const chartData = projects.map(p => ({
    name: isRtl ? (p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name) : (p.nameEn.length > 25 ? p.nameEn.substring(0, 25) + '...' : p.nameEn),
    budget: p.budget,
    cost: p.expenses
  }));

  const pieData = [
    { name: t.pending, value: projects.filter(p => p.status === 'pending').length, color: '#f59e0b' },
    { name: t.active, value: projects.filter(p => p.status === 'active').length, color: '#3b82f6' },
    { name: t.completed, value: projects.filter(p => p.status === 'completed').length, color: '#10b981' },
    { name: t.paused, value: projects.filter(p => p.status === 'paused').length, color: '#94a3b8' }
  ].filter(item => item.value > 0);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'paused': return 'bg-slate-400/10 text-slate-600 dark:text-slate-400 border border-slate-400/20';
      case 'completed': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 dark:text-slate-100 pb-16">
      
      {/* HEADER SECTION WITH TOP CRAFTSMANSHIP & PURPLE GRADIENT */}
      <div className="relative p-6 md:p-8 bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 rounded-3xl text-white shadow-2xl border border-purple-800/35 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] -ml-20 -mb-20"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-purple-300 uppercase">
              <Sparkles size={11} className="animate-spin text-purple-400" />
              <span>إدارة وتخطيط الأسطول الذكي</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Briefcase size={32} className="text-purple-300 animate-pulse" />
              <span>{t.title}</span>
            </h1>
            
            <p className="text-xs text-purple-100/70 max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <button
            onClick={() => handleOpenForm(null)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>{t.newProject}</span>
          </button>
        </div>
      </div>

      {/* KPI STATISTICS METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-3xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Briefcase size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t.totalProjects}</span>
            <div className="text-lg font-black mt-0.5">{projects.length}</div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-3xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckSquare size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t.activeProjects}</span>
            <div className="text-lg font-black mt-0.5">{activeCount}</div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-3xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-blue-500/10 text-brand-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <DollarSign size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t.totalBudget}</span>
            <div className="text-lg font-black mt-0.5">${totalBudget.toLocaleString()}</div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-3xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t.totalExpenses}</span>
            <div className="text-lg font-black mt-0.5">${totalExpenses.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS ROW */}
      <div className="flex flex-col md:flex-row justify-between gap-3 p-4 bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-100 dark:border-slate-800/80">
        <div className="flex-1 relative">
          <Search className="absolute right-3.5 top-3 text-slate-400 dark:text-slate-500" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-blue-500 border border-slate-100 dark:border-slate-800/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-blue-500"
          >
            <option value="all">{t.allStatuses}</option>
            <option value="pending">{t.pending}</option>
            <option value="active">{t.active}</option>
            <option value="completed">{t.completed}</option>
            <option value="paused">{t.paused}</option>
          </select>

          {/* Toggle View mode */}
          <div className="flex items-center border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden p-0.5 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-slate-100 dark:bg-slate-800/80 text-brand-blue-500' : 'text-slate-400'}`}
              title={t.listView}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'timeline' ? 'bg-slate-100 dark:bg-slate-800/80 text-brand-blue-500' : 'text-slate-400'}`}
              title={t.projectStats}
            >
              <BarChart3 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* RENDER DYNAMIC VISUAL PERFORMANCE TIMELINE */}
      {viewMode === 'timeline' && (
        <div className="p-5 bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-100 dark:border-slate-800/80 space-y-6">
          <h2 className="text-sm font-black flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <BarChart3 size={18} className="text-brand-blue-500" />
            <span>{t.financialOverview}</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="budget" name={isRtl ? "الميزانية المخصصة" : "Allocated Budget"} fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cost" name={isRtl ? "المصروفات الفعلية" : "Actual Expenses"} fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col justify-center space-y-4 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/40">
              <h3 className="text-xs font-bold text-slate-500 text-center">{t.status}</h3>
              <div className="h-40 flex items-center justify-center">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-400 text-center">{t.noProjects}</div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="font-semibold text-slate-500 truncate">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CORE PROJECTS CARDS INTERFACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* PROJECTS CARDS CONTAINER (Left / Center major pane) */}
        <div className="lg:col-span-2 space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800/80 rounded-3xl space-y-3">
              <AlertTriangle className="text-slate-300 dark:text-slate-600 mx-auto" size={32} />
              <p className="text-xs text-slate-400 font-semibold">{t.noProjects}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((proj) => {
                const totalTasks = proj.tasks?.length || 0;
                const doneTasks = proj.tasks?.filter(tk => tk.status === 'completed').length || 0;
                const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProject(proj)}
                    className={`p-5 bg-white dark:bg-[#0f1422] rounded-2xl border transition-all duration-300 hover:shadow-md cursor-pointer relative overflow-hidden group ${
                      selectedProject?.id === proj.id 
                        ? 'border-brand-blue-500 dark:border-emerald-500 shadow-md ring-1 ring-brand-blue-500/10' 
                        : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Status accent top indicator */}
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-brand-blue-500 to-indigo-500 opacity-60" />

                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider leading-none ${getStatusBadgeClass(proj.status)}`}>
                          {isRtl ? TRANSLATIONS.ar[proj.status] : TRANSLATIONS.en[proj.status]}
                        </span>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-emerald-400 transition-colors mt-1.5 leading-normal">
                          {isRtl ? proj.name : proj.nameEn}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          {t.client}: <span className="text-slate-600 dark:text-slate-300">{isRtl ? proj.client : proj.clientEn}</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {isRtl ? proj.description : proj.descriptionEn}
                    </p>

                    {/* Timeline bar / duration info */}
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-50 dark:border-slate-900/60 pt-3 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1 font-semibold">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{proj.startDate}</span>
                        <span>←</span>
                        <span>{proj.endDate}</span>
                      </div>
                      <div className="font-bold text-slate-500">
                        {t.progress}: {pct}%
                      </div>
                    </div>

                    {/* Task Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className="bg-brand-blue-500 dark:bg-emerald-400 h-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Allocated fleet counters */}
                    <div className="flex justify-between items-center mt-3 bg-slate-50 dark:bg-slate-900/35 p-2 rounded-xl text-[10px]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Truck size={12} className="text-brand-blue-500" />
                          <span className="font-black text-slate-700 dark:text-slate-300">{(proj.allocatedVehicleIds || []).length}</span> {t.vehicles}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Users size={12} className="text-amber-500" />
                          <span className="font-black text-slate-700 dark:text-slate-300">{(proj.allocatedDriverIds || []).length}</span> {t.drivers}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenForm(proj);
                          }}
                          className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors cursor-pointer"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(proj.id);
                          }}
                          className="p-1 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Live List of Allocated Assets with Highlighting */}
                    {((proj.allocatedVehicleIds || []).length > 0 || (proj.allocatedDriverIds || []).length > 0) && (
                      <div className="mt-3 pt-2.5 border-t border-dashed border-slate-100 dark:border-slate-800/80 space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-wider">
                          <span>{isRtl ? "الأصول والكوادر المعينة" : "Allocated Assets"}</span>
                          {search && (
                            <span className="text-[8.5px] text-brand-blue-500 font-bold tracking-normal flex items-center gap-0.5 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue-500 inline-block"></span>
                              {isRtl ? "مطابقة البحث المباشر" : "live search matched"}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {/* Vehicles list within card */}
                          {(proj.allocatedVehicleIds || []).map(vid => {
                            const veh = availableVehicles.find(v => v.id === vid);
                            if (!veh) return null;
                            const isMatched = search && (
                              veh.name.toLowerCase().includes(search.toLowerCase()) ||
                              (veh.plateNumber && veh.plateNumber.toLowerCase().includes(search.toLowerCase())) ||
                              (veh.type && veh.type.toLowerCase().includes(search.toLowerCase()))
                            );
                            return (
                              <div
                                key={vid}
                                className={`px-2 py-0.5 rounded-lg text-[9.5px] font-bold flex items-center gap-1 transition-all ${
                                  isMatched
                                    ? 'bg-brand-blue-500/15 text-brand-blue-600 dark:text-emerald-400 border border-brand-blue-500/40 shadow-xs ring-2 ring-brand-blue-500/10 animate-pulse'
                                    : 'bg-slate-100/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border border-transparent'
                                }`}
                              >
                                <Truck size={10} className={isMatched ? "text-brand-blue-500 dark:text-emerald-400" : "text-slate-400"} />
                                <span>{veh.name}</span>
                                {veh.plateNumber && <span className="opacity-60 text-[8px]">({veh.plateNumber})</span>}
                                {isMatched && (
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue-500 dark:bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-blue-500 dark:bg-emerald-400"></span>
                                  </span>
                                )}
                              </div>
                            );
                          })}

                          {/* Drivers list within card */}
                          {(proj.allocatedDriverIds || []).map(did => {
                            const drv = availableDrivers.find(d => d.id === did);
                            if (!drv) return null;
                            const isMatched = search && (
                              drv.name.toLowerCase().includes(search.toLowerCase()) ||
                              (drv.licenseType && drv.licenseType.toLowerCase().includes(search.toLowerCase()))
                            );
                            return (
                              <div
                                key={did}
                                className={`px-2 py-0.5 rounded-lg text-[9.5px] font-bold flex items-center gap-1 transition-all ${
                                  isMatched
                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40 shadow-xs ring-2 ring-amber-500/10 animate-pulse'
                                    : 'bg-slate-100/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border border-transparent'
                                }`}
                              >
                                <Users size={10} className={isMatched ? "text-amber-500" : "text-slate-400"} />
                                <span>{drv.name}</span>
                                {isMatched && (
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SELECTED PROJECT SIDE DETAIL BOARD PANEL (Right panel) */}
        <div className="lg:col-span-1 space-y-4">
          {selectedProject ? (
            <div className="p-5 bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-md space-y-5 relative">
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 left-4 p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-all cursor-pointer"
              >
                <X size={14} />
              </button>

              <div className="space-y-1.5 pt-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider leading-none ${getStatusBadgeClass(selectedProject.status)}`}>
                  {isRtl ? TRANSLATIONS.ar[selectedProject.status] : TRANSLATIONS.en[selectedProject.status]}
                </span>
                <h2 className="text-sm font-black leading-normal text-slate-900 dark:text-white">
                  {isRtl ? selectedProject.name : selectedProject.nameEn}
                </h2>
                <div className="text-[10.5px] text-slate-500 font-bold">
                  {t.client}: <span className="text-slate-700 dark:text-slate-300">{isRtl ? selectedProject.client : selectedProject.clientEn}</span>
                </div>
              </div>

              {/* Action trigger to shift state quickly */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleStatusDirectly(selectedProject)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-white ${
                    selectedProject.status === 'active'
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-xs'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xs'
                  }`}
                >
                  {selectedProject.status === 'active' ? (
                    <>
                      <Pause size={12} />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play size={12} />
                      <span>تنشيط المشروع</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleOpenForm(selectedProject)}
                  className="py-1.5 px-3 bg-brand-blue-500/10 hover:bg-brand-blue-500/20 rounded-xl text-[10px] font-black text-brand-blue-600 flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Edit size={12} />
                  <span>تعديل</span>
                </button>
              </div>

              {/* Financial Progress bar details */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40 space-y-3">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-400 font-semibold">{t.budget}</span>
                  <span className="font-black text-slate-900 dark:text-white">${selectedProject.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-400 font-semibold">{t.expenses}</span>
                  <span className="font-black text-red-500">${selectedProject.expenses.toLocaleString()}</span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-500 h-full transition-all" 
                    style={{ width: `${Math.min(100, (selectedProject.expenses / selectedProject.budget) * 100)}%` }}
                  />
                </div>
                <div className="text-[9px] text-slate-400 text-left font-bold">
                  {Math.round((selectedProject.expenses / selectedProject.budget) * 100)}% {isRtl ? "من الميزانية الكلية" : "of allocated budget"}
                </div>
              </div>

              {/* ALLOCATED VEHICLES & DRIVERS DETAILS LIST */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-500 flex items-center gap-1.5">
                  <Users size={14} className="text-brand-blue-500" />
                  <span>{t.allocatedAssetDetails}</span>
                </h3>

                <div className="space-y-2">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{t.vehicles}:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(selectedProject.allocatedVehicleIds || []).map(vid => {
                      const veh = availableVehicles.find(v => v.id === vid);
                      if (!veh) return null;
                      const isMatched = search && (
                        veh.name.toLowerCase().includes(search.toLowerCase()) ||
                        (veh.plateNumber && veh.plateNumber.toLowerCase().includes(search.toLowerCase())) ||
                        (veh.type && veh.type.toLowerCase().includes(search.toLowerCase()))
                      );
                      return (
                        <div 
                          key={vid} 
                          className={`p-2 rounded-xl border text-[10px] font-bold flex items-center justify-between gap-1.5 transition-all ${
                            isMatched
                              ? 'bg-brand-blue-500/15 border-brand-blue-500/40 text-brand-blue-600 dark:text-emerald-400 ring-2 ring-brand-blue-500/10 shadow-xs animate-pulse'
                              : 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Truck size={12} className={isMatched ? "text-brand-blue-500 dark:text-emerald-400 animate-bounce" : "text-brand-blue-500"} />
                            <span className="truncate">{veh.name}</span>
                          </div>
                          {isMatched && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue-500 dark:bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-blue-500 dark:bg-emerald-400"></span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {(selectedProject.allocatedVehicleIds || []).length === 0 && (
                      <div className="text-[10px] text-slate-400 italic">لا توجد آليات مخصصة</div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-2">{t.drivers}:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(selectedProject.allocatedDriverIds || []).map(did => {
                      const drv = availableDrivers.find(d => d.id === did);
                      if (!drv) return null;
                      const isMatched = search && (
                        drv.name.toLowerCase().includes(search.toLowerCase()) ||
                        (drv.licenseType && drv.licenseType.toLowerCase().includes(search.toLowerCase()))
                      );
                      return (
                        <div 
                          key={did} 
                          className={`p-2 rounded-xl border text-[10px] font-bold flex items-center justify-between gap-1.5 transition-all ${
                            isMatched
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/10 shadow-xs animate-pulse'
                              : 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Users size={12} className={isMatched ? "text-amber-500 animate-bounce" : "text-amber-500"} />
                            <span className="truncate">{drv.name}</span>
                          </div>
                          {isMatched && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {(selectedProject.allocatedDriverIds || []).length === 0 && (
                      <div className="text-[10px] text-slate-400 italic">لا توجد سائقين مخصصين</div>
                    )}
                  </div>
                </div>
              </div>

              {/* TASKS & MILESTONES (Operational tasks checklist) */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-500 flex items-center gap-1.5">
                    <CheckSquare size={14} className="text-emerald-500" />
                    <span>{t.tasksAndMilestones}</span>
                  </h3>

                  <button
                    onClick={() => setIsTaskFormOpen(true)}
                    className="p-1 text-brand-blue-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                  >
                    <PlusCircle size={12} />
                    <span>{t.addTask}</span>
                  </button>
                </div>

                {/* Task Form Within Card Drawer */}
                {isTaskFormOpen && (
                  <form onSubmit={handleAddTask} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                    <input
                      type="text"
                      required
                      placeholder={t.taskTitle}
                      value={taskTitleVal}
                      onChange={(e) => setTaskTitleVal(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 rounded-lg text-[11px] font-semibold border focus:outline-none"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={taskAssigneeType}
                        onChange={(e: any) => setTaskAssigneeType(e.target.value)}
                        className="p-1.5 bg-white dark:bg-slate-950 rounded-lg text-[10px] border focus:outline-none"
                      >
                        <option value="driver">{t.drivers}</option>
                        <option value="technician">{isRtl ? "الفنيين" : "Technicians"}</option>
                        <option value="other">{isRtl ? "شخص آخر" : "Supervisor"}</option>
                      </select>

                      <select
                        value={taskPriority}
                        onChange={(e: any) => setTaskPriority(e.target.value)}
                        className="p-1.5 bg-white dark:bg-slate-950 rounded-lg text-[10px] border focus:outline-none"
                      >
                        <option value="high">{t.high}</option>
                        <option value="medium">{t.medium}</option>
                        <option value="low">{t.low}</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {taskAssigneeType === 'driver' && (
                        <select
                          value={taskAssigneeId}
                          onChange={(e) => setTaskAssigneeId(e.target.value)}
                          className="p-1.5 bg-white dark:bg-slate-950 rounded-lg text-[10px] border focus:outline-none"
                        >
                          <option value="">{t.driverSelector}</option>
                          {availableDrivers.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      )}

                      <input
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className="p-1.5 bg-white dark:bg-slate-950 rounded-lg text-[10px] border focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-1.5 pt-1">
                      <button 
                        type="button" 
                        onClick={() => setIsTaskFormOpen(false)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-lg text-[10px] font-bold"
                      >
                        {t.cancel}
                      </button>
                      <button 
                        type="submit" 
                        className="px-2.5 py-1 bg-brand-blue-500 text-white rounded-lg text-[10px] font-bold"
                      >
                        {t.addTask}
                      </button>
                    </div>
                  </form>
                )}

                {/* Checklist Task items rendering */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(selectedProject.tasks || []).map(tk => (
                    <div 
                      key={tk.id} 
                      className="p-2.5 bg-slate-50 dark:bg-slate-900/25 hover:bg-slate-50/80 rounded-xl border border-slate-100 dark:border-slate-800/40 flex items-start gap-2 group transition-all"
                    >
                      <button
                        onClick={() => handleToggleTaskStatus(selectedProject.id, tk.id, tk.status)}
                        className={`mt-0.5 w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          tk.status === 'completed'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                        }`}
                      >
                        {tk.status === 'completed' && <Check size={10} />}
                      </button>

                      <div className="flex-1 space-y-0.5">
                        <div className={`text-[10.5px] font-bold leading-normal ${tk.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {tk.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[9px] text-slate-400 font-semibold">
                          <span className="flex items-center gap-0.5">
                            <Clock size={10} />
                            {tk.dueDate}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>{tk.assigneeName}</span>
                          <span className="text-slate-300">•</span>
                          <span className={`font-black ${tk.priority === 'high' ? 'text-red-500' : tk.priority === 'medium' ? 'text-amber-500' : 'text-slate-400'}`}>
                            {tk.priority === 'high' ? t.high : tk.priority === 'medium' ? t.medium : t.low}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveTask(selectedProject.id, tk.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 text-red-500 rounded-lg transition-all shrink-0 cursor-pointer"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}

                  {(selectedProject.tasks || []).length === 0 && (
                    <div className="text-[10px] text-slate-400 italic text-center p-4">
                      {t.noTasks}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:block p-8 text-center bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 rounded-3xl space-y-2">
              <Briefcase className="text-slate-300 dark:text-slate-700 mx-auto" size={32} />
              <p className="text-[10.5px] text-slate-400 font-bold">انقر على أي مشروع لوجستي لعرض ومراقبة نواتج العمليات والمهام وتعيين المركبات</p>
            </div>
          )}
        </div>
      </div>

      {/* DETAILED DIALOG MODAL: PROJECT ADD / EDIT */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f1422] w-full max-w-2xl rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Briefcase size={18} className="text-brand-blue-500" />
                <span>{editingProject ? t.editProjectTitle : t.addProjectTitle}</span>
              </h2>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 text-right">
              
              {/* Project Names (Ar & En) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-slate-400">{t.projectNameAr}</label>
                  <input
                    type="text"
                    required
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: مشروع تزويد الرياض بالمحروقات الاستراتيجية"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-semibold focus:outline-none border border-slate-100 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-slate-400">{t.projectNameEn}</label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Example: Riyadh Fuel Supply Transit Project"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-semibold focus:outline-none border border-slate-100 dark:border-slate-800"
                  />
                </div>
              </div>

              {/* Clients (Ar & En) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-slate-400">{t.clientAr}</label>
                  <input
                    type="text"
                    required
                    value={clientAr}
                    onChange={(e) => setClientAr(e.target.value)}
                    placeholder="مثال: وزارة النقل والخدمات اللوجستية"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-semibold focus:outline-none border border-slate-100 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-slate-400">{t.clientEn}</label>
                  <input
                    type="text"
                    required
                    value={clientEn}
                    onChange={(e) => setClientEn(e.target.value)}
                    placeholder="Example: Ministry of Transport"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-semibold focus:outline-none border border-slate-100 dark:border-slate-800"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-slate-400">{t.startDate}</label>
                  <input
                    type="date"
                    required
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-semibold focus:outline-none border border-slate-100 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-slate-400">{t.endDate}</label>
                  <input
                    type="date"
                    required
                    value={endDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-semibold focus:outline-none border border-slate-100 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-slate-400">{t.status}</label>
                  <select
                    value={projStatus}
                    onChange={(e: any) => setProjStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold focus:outline-none border border-slate-100 dark:border-slate-800"
                  >
                    <option value="pending">{t.pending}</option>
                    <option value="active">{t.active}</option>
                    <option value="completed">{t.completed}</option>
                    <option value="paused">{t.paused}</option>
                  </select>
                </div>
              </div>

              {/* Financial Budgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-slate-400">{t.projectBudget}</label>
                  <input
                    type="number"
                    required
                    value={budgetVal}
                    onChange={(e) => setBudgetVal(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-semibold focus:outline-none border border-slate-100 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-slate-400">{t.projectExpenses}</label>
                  <input
                    type="number"
                    required
                    value={expensesVal}
                    onChange={(e) => setExpensesVal(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-semibold focus:outline-none border border-slate-100 dark:border-slate-800"
                  />
                </div>
              </div>

              {/* Scope descriptions */}
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-black text-slate-400">{t.descAr}</label>
                <textarea
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-semibold focus:outline-none border border-slate-100 dark:border-slate-800"
                  placeholder="الوصف اللوجستي التفريغي للمشروع ونطاق عمل الأسطول..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10.5px] font-black text-slate-400">{t.descEn}</label>
                <textarea
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-semibold focus:outline-none border border-slate-100 dark:border-slate-800"
                  placeholder="Description of logistics operations, route frequencies and vehicle limits..."
                />
              </div>

              {/* ALLOCATE FLEET ASSETS DYNAMIC PICKERS */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-500">{t.allocateVehicles}</h3>
                  {selectedVehIds.length > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-brand-blue-500/10 text-brand-blue-600 dark:text-emerald-400 rounded-md font-bold">
                      {isRtl ? `${selectedVehIds.length} محددة` : `${selectedVehIds.length} selected`}
                    </span>
                  )}
                </div>
                
                {/* Vehicle Search Input */}
                <div className="relative">
                  <Search className="absolute right-2.5 top-2.5 text-slate-400 dark:text-slate-500" size={13} />
                  <input
                    type="text"
                    value={vehicleSearchQuery}
                    onChange={(e) => setVehicleSearchQuery(e.target.value)}
                    placeholder={t.searchVehiclesPlaceholder}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-brand-blue-500 border border-slate-100 dark:border-slate-800"
                  />
                  {vehicleSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setVehicleSearchQuery('')}
                      className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-slate-100/50 dark:border-slate-800/40 rounded-xl bg-slate-50/30">
                  {availableVehicles
                    .filter(veh => {
                      const q = vehicleSearchQuery.toLowerCase();
                      return (
                        veh.name.toLowerCase().includes(q) ||
                        (veh.type && veh.type.toLowerCase().includes(q)) ||
                        (veh.plateNumber && veh.plateNumber.toLowerCase().includes(q))
                      );
                    })
                    .map(veh => {
                      const isAllocated = selectedVehIds.includes(veh.id);
                      return (
                        <button
                          key={veh.id}
                          type="button"
                          onClick={() => {
                            if (isAllocated) {
                              setSelectedVehIds(selectedVehIds.filter(id => id !== veh.id));
                            } else {
                              setSelectedVehIds([...selectedVehIds, veh.id]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                            isAllocated
                              ? 'bg-brand-blue-500 border-brand-blue-500 text-white shadow-xs'
                              : 'bg-white dark:bg-[#090d16] border-slate-100 dark:border-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <Truck size={12} />
                          <span>{veh.name}</span>
                          {veh.plateNumber && <span className="opacity-60 text-[9px]">({veh.plateNumber})</span>}
                          {isAllocated && <Check size={12} />}
                        </button>
                      );
                    })}
                  {availableVehicles.filter(veh => {
                    const q = vehicleSearchQuery.toLowerCase();
                    return (
                      veh.name.toLowerCase().includes(q) ||
                      (veh.type && veh.type.toLowerCase().includes(q)) ||
                      (veh.plateNumber && veh.plateNumber.toLowerCase().includes(q))
                    );
                  }).length === 0 && (
                    <div className="text-[10px] text-slate-400 italic py-3 text-center w-full">
                      {isRtl ? 'لا توجد آليات مطابقة للبحث' : 'No matching vehicles found'}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-2">
                  <h3 className="text-xs font-black text-slate-500">{t.allocateDrivers}</h3>
                  {selectedDriverIds.length > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded-md font-bold">
                      {isRtl ? `${selectedDriverIds.length} محددين` : `${selectedDriverIds.length} selected`}
                    </span>
                  )}
                </div>

                {/* Driver Search Input */}
                <div className="relative">
                  <Search className="absolute right-2.5 top-2.5 text-slate-400 dark:text-slate-500" size={13} />
                  <input
                    type="text"
                    value={driverSearchQuery}
                    onChange={(e) => setDriverSearchQuery(e.target.value)}
                    placeholder={t.searchDriversPlaceholder}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-brand-blue-500 border border-slate-100 dark:border-slate-800"
                  />
                  {driverSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setDriverSearchQuery('')}
                      className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-slate-100/50 dark:border-slate-800/40 rounded-xl bg-slate-50/30">
                  {availableDrivers
                    .filter(drv => {
                      const q = driverSearchQuery.toLowerCase();
                      return (
                        drv.name.toLowerCase().includes(q) ||
                        (drv.licenseType && drv.licenseType.toLowerCase().includes(q))
                      );
                    })
                    .map(drv => {
                      const isAllocated = selectedDriverIds.includes(drv.id);
                      return (
                        <button
                          key={drv.id}
                          type="button"
                          onClick={() => {
                            if (isAllocated) {
                              setSelectedDriverIds(selectedDriverIds.filter(id => id !== drv.id));
                            } else {
                              setSelectedDriverIds([...selectedDriverIds, drv.id]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                            isAllocated
                              ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                              : 'bg-white dark:bg-[#090d16] border-slate-100 dark:border-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <Users size={12} />
                          <span>{drv.name}</span>
                          {drv.licenseType && <span className="opacity-60 text-[9px]">({drv.licenseType})</span>}
                          {isAllocated && <Check size={12} />}
                        </button>
                      );
                    })}
                  {availableDrivers.filter(drv => {
                    const q = driverSearchQuery.toLowerCase();
                    return (
                      drv.name.toLowerCase().includes(q) ||
                      (drv.licenseType && drv.licenseType.toLowerCase().includes(q))
                    );
                  }).length === 0 && (
                    <div className="text-[10px] text-slate-400 italic py-3 text-center w-full">
                      {isRtl ? 'لا توجد سائقين مطابقين للبحث' : 'No matching drivers found'}
                    </div>
                  )}
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-black cursor-pointer transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-blue-500 hover:bg-brand-blue-600 text-white rounded-xl text-xs font-black cursor-pointer transition-all shadow-md active:scale-95"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
