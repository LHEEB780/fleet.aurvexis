import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../types';
import { useLanguage } from '../services/LanguageContext';
import ContextualHelp from './ContextualHelp';
import { 
  ShieldCheck, 
  UserPlus, 
  History, 
  Search, 
  Filter, 
  Lock, 
  Unlock, 
  Users, 
  Settings2, 
  Check, 
  X, 
  FileText, 
  Globe, 
  AlertCircle,
  Clock,
  Key,
  Cloud,
  Database,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Wifi,
  Plus,
  ShieldAlert,
  Eye,
  EyeOff,
  LayoutDashboard,
  Truck,
  Warehouse,
  BarChart3,
  Building2,
  Calendar,
  CreditCard,
  Wrench,
  Bot
} from 'lucide-react';
import { 
  db, 
  testFirestoreConnection, 
  pushLocalDataToCloud, 
  pullCloudDataToLocal 
} from '../services/firebase';
import firebaseConfig from '../services/firebaseConfig';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  category: 'vehicles' | 'maintenance' | 'inventory' | 'billing' | 'users';
  ipAddress: string;
  status: 'نجاح' | 'تنبيه' | 'فشل';
  details: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'fleet_manager' | 'technician' | 'viewer';
  status: 'active' | 'suspended';
  lastActive: string;
}

export default function SecurityAudit({ user }: { user?: User }) {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Firestore Connection & Sync states in Security Audit
  const [isDbConnecting, setIsDbConnecting] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDirection, setSyncDirection] = useState<'upload' | 'download' | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return localStorage.getItem('last_firestore_sync_time') || 'لم يتم المزامنة بعد';
  });
  const [syncFeedbackLog, setSyncFeedbackLog] = useState<string>('');

  // Check connection status on component load
  useEffect(() => {
    async function checkConn() {
      setIsDbConnecting(true);
      const isOk = await testFirestoreConnection();
      setIsDbConnected(isOk);
      setIsDbConnecting(false);
      setSyncFeedbackLog(isOk 
        ? (language === 'ar' ? '✓ تم تأسيس اتصال سحابي آمن بقاعدة Firestore!' : '✓ Connected to Cloud Firestore successfully!')
        : (language === 'ar' ? '⚠️ تعذر الاتصال بالسحابة. تم تفعيل الذاكرة الاحتياطية للمتصفح.' : '⚠️ Cloud database offline. Running in local browser emulation.')
      );
    }
    checkConn();
  }, [language]);

  const handleUploadBackup = async () => {
    setIsSyncing(true);
    setSyncDirection('upload');
    setSyncFeedbackLog(language === 'ar' ? 'جاري تجميع السجلات المحلية ومزامنتها على السحابة...' : 'Uploading local fleet assets & settings directly to Firestore...');
    
    const result = await pushLocalDataToCloud();
    if (result.success) {
      const now = new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US');
      setLastSyncTime(now);
      localStorage.setItem('last_firestore_sync_time', now);
      setSyncFeedbackLog(language === 'ar' 
        ? `✓ نجح التصدير! تم تأمين عدد ${result.count} سجل بأمان على خادم Google Cloud Firestore.` 
        : `✓ Backup successful! Secured ${result.count} documents on Google Cloud Firestore.`);
      
      // Add log
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'المهندس خالد',
        role: 'مدير نظام',
        action: 'نسخ سحابي احتياطي خارجي',
        category: 'users',
        ipAddress: '197.82.16.42',
        status: 'نجاح',
        details: `تم دفع ${result.count} وثيقة من المركبات، الصيانات، القطع والإعدادات لـ Firestore.`
      };
      setAuditLogs(logs => [newLog, ...logs]);
    } else {
      setSyncFeedbackLog(language === 'ar' ? '✕ فشلت عملية المزامنة. يرجى مراجعة الصلاحيات الأمنية.' : '✕ Sync failed. Please verify Firestore rules configurations.');
    }
    setIsSyncing(false);
    setSyncDirection(null);
  };

  const handleDownloadRestore = async () => {
    setIsSyncing(true);
    setSyncDirection('download');
    setSyncFeedbackLog(language === 'ar' ? 'جاري مطابقة وسحب السجلات الأحدث من السحابة...' : 'Downloading server fleet state from Cloud Firestore collections...');
    
    const result = await pullCloudDataToLocal();
    if (result.success) {
      const now = new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US');
      setLastSyncTime(now);
      localStorage.setItem('last_firestore_sync_time', now);
      setSyncFeedbackLog(language === 'ar' 
        ? `✓ نجح الاسترداد والتثبيت! تم تحديث وتنزيل ${result.count} وثيقة وتخزينها محلياً.` 
        : `✓ Database restored! Synced down ${result.count} files into browser workspace.`);
      
      // Add log
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'المهندس خالد',
        role: 'مدير نظام',
        action: 'مزامنة تحميل واسترداد سحابي',
        category: 'users',
        ipAddress: '197.82.16.42',
        status: 'نجاح',
        details: `تم تحميل وتبييت ${result.count} وثيقة من السحابة إلى مستعرض الويب.`
      };
      setAuditLogs(logs => [newLog, ...logs]);
    } else {
      setSyncFeedbackLog(language === 'ar' ? '✕ تعذر الاستيراد. تأكد من تهيئة قاعدة البيانات.' : '✕ Download failed. Please establish proper Firestore collections first.');
    }
    setIsSyncing(false);
    setSyncDirection(null);
  };
  
  // Team Member Form State
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'technician' as TeamMember['role'],
  });

  // Success indicator for user added action
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Simulated Team Members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 'tm-1', name: 'المهندس خالد', email: 'khaled@mech360.com', role: 'admin', status: 'active', lastActive: 'الآن' },
    { id: 'tm-2', name: 'الفني أحمد', email: 'ahmed@mech360.com', role: 'technician', status: 'active', lastActive: 'منذ دقيقتين' },
    { id: 'tm-3', name: 'المراقب سالم', email: 'salem@mech360.com', role: 'viewer', status: 'active', lastActive: 'منذ ساعة' },
    { id: 'tm-4', name: 'الفني صهيب', email: 'suhaib@mech350.com', role: 'technician', status: 'suspended', lastActive: 'منذ يومين' },
  ]);

  // Simulated Security Audit compliance logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'log-1', timestamp: '2026-05-24 19:42:15', user: 'المهندس خالد', role: 'مدير نظام', action: 'تعديل الصيانة الذاتية', category: 'maintenance', ipAddress: '197.82.16.42', status: 'نجاح', details: 'قام بتحديث إعدادات التعيين الذاتي للفنيين بورشة الرياض المركزية.' },
    { id: 'log-2', timestamp: '2026-05-24 16:12:05', user: 'المهندس خالد', role: 'مدير نظام', action: 'تغيير خطة الاشتراك', category: 'billing', ipAddress: '197.82.16.42', status: 'نجاح', details: 'ترقية باقة SaaS للمنشأة إلى الباقة المتقدمة (Pro).' },
    { id: 'log-3', timestamp: '2026-05-24 14:02:11', user: 'الفني أحمد', role: 'فني صيانة', action: 'صرف قطع غيار', category: 'inventory', ipAddress: '197.82.19.112', status: 'نجاح', details: 'صرف طقم فرامل شاحنة فورد (رقم القطعة BRK-72).' },
    { id: 'log-4', timestamp: '2026-05-24 11:30:55', user: 'المراقب سالم', role: 'مسؤول جودة', action: 'تنزيل تقرير استهلاك الوقود', category: 'vehicles', ipAddress: '192.168.1.55', status: 'نجاح', details: 'تنزل ملف إكسل مالي شامل لكافة شاحنات النقل الثقيل لشهر مايو.' },
    { id: 'log-5', timestamp: '2026-05-24 09:12:00', user: 'النظام ميكانيكي', role: 'بوت الصيانة AI', action: 'تنبيه صيانة دورية تلقائي', category: 'maintenance', ipAddress: 'localhost', status: 'تنبيه', details: 'تم جدولة تذكير دوري لمركبة (ل-ن-ب 201) لوصولها لحد كيلومترات مستهدف.' },
    { id: 'log-6', timestamp: '2026-05-23 23:15:30', user: 'مستخدم مجهول', role: 'مجهول', action: 'محاولة تسجيل دخول فاشلة', category: 'users', ipAddress: '42.112.5.88', status: 'فشل', details: 'محاولة خاطئة لإدخال كلمة مرور الحساب الإداري الرئيسي.' },
  ]);

  // Simulated Permission Matrix States
  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem('saas_matrix_permissions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      { id: 'write-vehicles', label: 'إضافة وتعديل بيانات مركبات ومعدات الأسطول', roles: { admin: true, fleet_manager: true, technician: false, viewer: false } },
      { id: 'delete-vehicles', label: 'حذف مركبات الأسطول تمااماً', roles: { admin: true, fleet_manager: false, technician: false, viewer: false } },
      { id: 'write-orders', label: 'إنشاء وإسناد أوامر الصيانة للفنيين بالورشة', roles: { admin: true, fleet_manager: true, technician: true, viewer: false } },
      { id: 'issue-inventory', label: 'صرف قطع غيار ومستلزمات من المخزن', roles: { admin: true, fleet_manager: true, technician: true, viewer: false } },
      { id: 'view-reports', label: 'الاطلاع على التقارير المالية والإحصاءات', roles: { admin: true, fleet_manager: true, technician: false, viewer: true } },
      { id: 'manage-saas', label: 'إدارة الفوترة والتحكم باشتراك SaaS', roles: { admin: true, fleet_manager: false, technician: false, viewer: false } },
    ];
  });

  // Custom RBAC policy settings for roles
  const [rolePolicies, setRolePolicies] = useState<{
    [key in 'admin' | 'fleet_manager' | 'technician' | 'viewer']: {
      aiBot: boolean;
      billing: boolean;
      maps: boolean;
      export: boolean;
      firebaseSync: boolean;
      selfAssign: boolean;
      mfa: boolean;
      passStrength: string;
      workHours: string;
      doubleAuth: boolean;
    }
  }>(() => {
    const saved = localStorage.getItem('saas_role_policies');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      admin: {
        aiBot: true,
        billing: true,
        maps: true,
        export: true,
        firebaseSync: true,
        selfAssign: true,
        mfa: true,
        passStrength: 'strong',
        workHours: 'anytime',
        doubleAuth: false,
      },
      fleet_manager: {
        aiBot: true,
        billing: false,
        maps: true,
        export: true,
        firebaseSync: false,
        selfAssign: true,
        mfa: true,
        passStrength: 'strong',
        workHours: 'anytime',
        doubleAuth: false,
      },
      technician: {
        aiBot: true,
        billing: false,
        maps: false,
        export: false,
        firebaseSync: false,
        selfAssign: true,
        mfa: false,
        passStrength: 'medium',
        workHours: 'shifts',
        doubleAuth: true,
      },
      viewer: {
        aiBot: false,
        billing: false,
        maps: true,
        export: true,
        firebaseSync: false,
        selfAssign: false,
        mfa: false,
        passStrength: 'medium',
        workHours: 'anytime',
        doubleAuth: false,
      }
    };
  });

  const [selectedRbacRole, setSelectedRbacRole] = useState<'admin' | 'fleet_manager' | 'technician' | 'viewer'>('technician');
  const [showAddPermissionModal, setShowAddPermissionModal] = useState(false);
  const [newPermissionLabel, setNewPermissionLabel] = useState('');

  // Handle toggling permission dynamically to show interactive state
  const handleTogglePermission = (permissionId: string, role: 'admin' | 'fleet_manager' | 'technician' | 'viewer') => {
    // Modify permission in state
    setPermissions(prev => {
      const updated = prev.map(p => {
        if (p.id === permissionId) {
          const updatedRoles = { ...p.roles, [role]: !p.roles[role] };
          
          // Add custom log entry for this modification
          const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: 'المهندس خالد',
            role: 'مدير نظام',
            action: 'تعديل هرمية الصلاحيات',
            category: 'users',
            ipAddress: '197.82.16.42',
            status: 'نجاح',
            details: `تحديث حالة الصلاحية (${p.label}) لدور (${role}) إلى: ${!p.roles[role] ? 'نشطة' : 'ملغاة'}`
          };
          setAuditLogs(logs => [newLog, ...logs]);

          return { ...p, roles: updatedRoles };
        }
        return p;
      });
      localStorage.setItem('saas_matrix_permissions', JSON.stringify(updated));
      return updated;
    });
  };

  // Preview Mode State
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [selectedPreviewRole, setSelectedPreviewRole] = useState<'admin' | 'fleet_manager' | 'technician' | 'viewer'>('technician');
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<string>('dashboard');
  const [showLockedInPreview, setShowLockedInPreview] = useState<boolean>(false);

  // Simulated Granular Permissions (صلاحيات إضافية تفصيلية للعمليات الصغرى)
  const [granularPermissions, setGranularPermissions] = useState(() => {
    const saved = localStorage.getItem('saas_granular_permissions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      { id: 'delete-maintenance-record', label: 'حذف سجل أو أمر صيانة نهائياً من الأرشيف', roles: { admin: true, fleet_manager: false, technician: false, viewer: false } },
      { id: 'edit-vehicle-data', label: 'تعديل حقول مواصفات المركبات الأساسية (رقم الهيكل، الموديل)', roles: { admin: true, fleet_manager: true, technician: false, viewer: false } },
      { id: 'bypass-safety-checklist', label: 'تجاوز وإعفاء أمر صيانة من قائمة فحص السلامة الإلزامية', roles: { admin: true, fleet_manager: false, technician: false, viewer: false } },
      { id: 'approve-parts-issuance', label: 'اعتماد وموافقة طلبات صرف قطع الغيار والمستلزمات المكلفة', roles: { admin: true, fleet_manager: true, technician: false, viewer: false } },
      { id: 'edit-completed-orders', label: 'إعادة فتح وتعديل فواتير أوامر صيانة مغلقة ومرحلة مالياً', roles: { admin: true, fleet_manager: false, technician: false, viewer: false } },
      { id: 'assign-external-contractor', label: 'إسناد وتفويض عمليات الصيانة لورش عمل وجهات خارجية', roles: { admin: true, fleet_manager: true, technician: false, viewer: false } },
      { id: 'force-reset-password', label: 'إعادة تعيين كلمة مرور موظف قسرياً من لوحة التحكم', roles: { admin: true, fleet_manager: false, technician: false, viewer: false } },
    ];
  });

  const [granularSearchQuery, setGranularSearchQuery] = useState('');
  const [showAddGranularModal, setShowAddGranularModal] = useState(false);
  const [newGranularLabel, setNewGranularLabel] = useState('');

  // Handle toggling granular permission dynamically
  const handleToggleGranularPermission = (permissionId: string, role: 'admin' | 'fleet_manager' | 'technician' | 'viewer') => {
    setGranularPermissions(prev => {
      const updated = prev.map(p => {
        if (p.id === permissionId) {
          const updatedRoles = { ...p.roles, [role]: !p.roles[role] };
          
          // Add log entry for this modification
          const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: 'المهندس خالد',
            role: 'مدير نظام',
            action: 'تعديل صلاحية تفصيلية',
            category: 'users',
            ipAddress: '197.82.16.42',
            status: 'نجاح',
            details: `تحديث الصلاحية التفصيلية لعملية (${p.label}) لدور (${role}) لتصبح: ${!p.roles[role] ? 'نشطة' : 'معطلة'}`
          };
          setAuditLogs(logs => [newLog, ...logs]);

          return { ...p, roles: updatedRoles };
        }
        return p;
      });
      localStorage.setItem('saas_granular_permissions', JSON.stringify(updated));
      return updated;
    });
  };

  // Handle team status change
  const handleToggleMemberStatus = (memberId: string) => {
    setTeamMembers(prev => 
      prev.map(m => {
        if (m.id === memberId) {
          const updatedStatus = m.status === 'active' ? 'suspended' : 'active';
          
          // Log it
          const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: 'المهندس خالد',
            role: 'مدير نظام',
            action: 'تعديل حالة حساب فريق العمل',
            category: 'users',
            ipAddress: '197.82.16.42',
            status: 'تنبيه',
            details: `تعديل حالة حساب العضو (${m.name}) إلى: ${updatedStatus === 'active' ? 'نشط ومصرح لة' : 'موقوف وممنوع الدخول'}`
          };
          setAuditLogs(logs => [newLog, ...logs]);

          return { ...m, status: updatedStatus };
        }
        return m;
      })
    );
  };

  // Form submit to invite team member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;

    const newTm: TeamMember = {
      id: `tm-${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      status: 'active',
      lastActive: 'الآن'
    };

    setTeamMembers(prev => [...prev, newTm]);

    // Log the invitation event to compliance logs
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'المهندس خالد',
      role: 'مدير نظام',
      action: 'إرسال دعوة انضمام للمؤسسة',
      category: 'users',
      ipAddress: '197.82.16.42',
      status: 'نجاح',
      details: `تمت دعوة البريد الإلكتروني (${newMember.email}) بنجاح كعضو بالدور (${newMember.role === 'admin' ? 'مدير نظام' : newMember.role === 'fleet_manager' ? 'مدير الحركة' : newMember.role === 'technician' ? 'فني صيانة' : 'مسؤول جودة'}).`
    };
    setAuditLogs(logs => [newLog, ...logs]);

    // Form Reset
    setNewMember({
      name: '',
      email: '',
      role: 'technician'
    });

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3500);
  };

  // Filter logs reactively
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch = 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchCategory = categoryFilter === 'all' || log.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || log.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [auditLogs, searchTerm, categoryFilter, statusFilter]);

  // Translation map for permission labels
  const permissionTranslations = useMemo(() => ({
    'write-vehicles': {
      ar: 'إضافة وتعديل بيانات مركبات ومعدات الأسطول',
      en: 'Add & modify fleet vehicles & equipment data'
    },
    'delete-vehicles': {
      ar: 'حذف مركبات الأسطول تماماً',
      en: 'Permanently delete fleet vehicles'
    },
    'write-orders': {
      ar: 'إنشاء وإسناد أوامر الصيانة للفنيين بالورشة',
      en: 'Create & assign workshop repair orders'
    },
    'issue-inventory': {
      ar: 'صرف قطع غيار ومستلزمات من المخزن',
      en: 'Issue spare parts & materials from stock'
    },
    'view-reports': {
      ar: 'الاطلاع على التقارير المالية والإحصاءات',
      en: 'Access financial analytics & statistics reports'
    },
    'manage-saas': {
      ar: 'إدارة الفوترة والتحكم باشتراك SaaS',
      en: 'Manage organization billing & SaaS subscription'
    },
  }), []);

  // Compute active permission stats per role
  const stats = useMemo(() => {
    const roles = { admin: 0, fleet_manager: 0, technician: 0, viewer: 0 };
    permissions.forEach((p: any) => {
      if (p.roles.admin) roles.admin++;
      if (p.roles.fleet_manager) roles.fleet_manager++;
      if (p.roles.technician) roles.technician++;
      if (p.roles.viewer) roles.viewer++;
    });
    return roles;
  }, [permissions]);

  return (
    <div className="space-y-6 text-right pb-12 font-sans" dir="rtl" id="security-audit-container">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{language === 'ar' ? 'هرمية الرقابة وصلاحيات الموظفين والامتثال الأمني' : 'Governance & Operational Security Compliance'}</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-black border border-emerald-500/15 shrink-0">
              {language === 'ar' ? 'بوابة الامتثال والرقابة' : 'Security Board'}
            </span>
          </h1>
          <ContextualHelp 
            id="security-audit"
            titleAr="هرمية الرقابة والامتثال الأمني"
            titleEn="Governance & Operational Security Compliance"
            explanationAr="فضاء حوكمة شامل لإعداد مصفوفة الصلاحيات والحقوق للمهندسين والسائقين، وجرد الموظفين النشطين ومطابقة الحسابات، مع سجل لوغريتمي كامل لتتبع النشاطات لمنع الهجمات أو الهدر."
            explanationEn="An enterprise-grade security desk to customize role-based matrices, call internal account activations, and audit full audit logs trail records."
            benefitsAr={[
              "تحديد دقيق ومحكم لما يمكن للفني والمراقب والمشاهد فعله لتفادي الهفوات والعبث بالبيانات.",
              "سجل تتبع كامل (Audit Trail Logging) يرصد توقيت وهوية العمليات والـ IPs المرافقة لها.",
              "لوحة تفاعلية فورية لدعوة موظف جديد وقبول أو تعليق حسابه."
            ]}
            benefitsEn={[
              "Enforces customized permissions limiting tech, viewer or administrator actions specifically.",
              "Maintains automated event logs including IP references for any system mutation or login.",
              "Provides immediate dynamic triggers to activate or suspend any registered employee instantly."
            ]}
            tipsAr={[
              "تأكد من تخصيص مصفوفة الصلاحيات بما يلبي رغبات الرقابة الميدانية ومطالعة سجل العمليات بشكل أسبوعي."
            ]}
            tipsEn={[
              "We recommend auditing the security trail once every week to check for unusual remote locations or IPs."
            ]}
            language={language}
          />
        </div>
        <p className="text-xs text-slate-505 dark:text-slate-400 mt-1 leading-relaxed">
          نظام رقابي أمان بأسلوب SaaS: تحكم بالصلاحيات وتوزيع الحقوق على الفنيين ومدراء الأسطول، مع رصد حي ومعير فوريّاً ضد الاختراقات الأمنية عبر سجلّ تعقبي كامل (Audit Logs).
        </p>
      </div>

      {/* Grid: Permissions Matrix alongside Teammate invitation lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Permission Matrix Toggles */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-5" id="interactive-matrix-grid">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-150/50 dark:border-slate-800/60 gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-violet-600 dark:text-violet-400" />
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? 'مصفوفة الصلاحيات والأدوار (Interactive RBAC Matrix Grid)' : 'Interactive RBAC Matrix Grid'}
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {language === 'ar' ? 'تحكم بالصلاحيات الدقيقة لكل دور وظيفي عبر مربعات الاختيار التفاعلية' : 'Control precise privileges for each job role via direct checkboxes'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsPreviewActive(!isPreviewActive)}
                className={`p-1.5 px-3 rounded-xl text-[10px] font-black flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isPreviewActive
                    ? 'bg-violet-600 hover:bg-violet-700 text-white border-violet-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                }`}
                title={language === 'ar' ? 'تفعيل وضع معاينة القائمة الجانبية للشاشات' : 'Toggle Sidebar Preview Mode'}
              >
                {isPreviewActive ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>
                  {language === 'ar' 
                    ? (isPreviewActive ? 'إخفاء المعاينة الحية' : 'وضع المعاينة (Preview)')
                    : (isPreviewActive ? 'Hide Live Preview' : 'Preview Mode')}
                </span>
              </button>
              <span className="text-[9px] bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 font-extrabold px-2.5 py-0.5 rounded-full border border-violet-150 dark:border-violet-850">
                {language === 'ar' ? 'تحديث فوري نشط' : 'Instant Cloud Sync'}
              </span>
            </div>
          </div>

          {/* Quick Stats Pill Dashboard for RBAC status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-2xl border border-slate-100/80 dark:border-slate-800/40">
            {[
              { key: 'admin', labelAr: 'مدير نظام', labelEn: 'Admin', count: stats.admin, color: 'text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/50 bg-emerald-50/30 dark:bg-emerald-950/10' },
              { key: 'fleet_manager', labelAr: 'مدير حركة', labelEn: 'Manager', count: stats.fleet_manager, color: 'text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-950/50 bg-indigo-50/30 dark:bg-indigo-950/10' },
              { key: 'technician', labelAr: 'فني صيانة', labelEn: 'Technician', count: stats.technician, color: 'text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-950/50 bg-amber-50/30 dark:bg-amber-950/10' },
              { key: 'viewer', labelAr: 'مشاهد', labelEn: 'Viewer', count: stats.viewer, color: 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-850 bg-slate-100/30 dark:bg-slate-950/10' }
            ].map((roleStat) => (
              <div key={roleStat.key} className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center ${roleStat.color}`}>
                <span className="text-[9px] font-black">{language === 'ar' ? roleStat.labelAr : roleStat.labelEn}</span>
                <span className="text-sm font-black mt-1">{roleStat.count} / {permissions.length}</span>
                <span className="text-[8px] opacity-75 mt-0.5">
                  {language === 'ar' ? 'رخص نشطة' : 'Active Privileges'}
                </span>
              </div>
            ))}
          </div>

          {/* Preview Mode Drawer/Panel */}
          {isPreviewActive && (
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 space-y-4 animate-fade-in" id="sidebar-preview-panel">
              {/* Simulator Header controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-[10px] font-mono text-slate-400 ml-2">mech360.net/dashboard?role={selectedPreviewRole}</span>
                </div>
                
                {/* Mode controls & Role select */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Lock Toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showLockedInPreview}
                      onChange={(e) => setShowLockedInPreview(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-violet-600 focus:ring-violet-500 text-xs w-3.5 h-3.5"
                    />
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                      {language === 'ar' ? 'إظهار المحجوب بقفل 🔒' : 'Show restricted items with locks 🔒'}
                    </span>
                  </label>

                  {/* Role Selector Tabs inside Simulator */}
                  <div className="bg-slate-200/70 dark:bg-slate-950 p-0.5 rounded-lg flex border border-slate-300/30 dark:border-slate-800">
                    {[
                      { key: 'admin', ar: 'مدير النظام', en: 'Admin' },
                      { key: 'fleet_manager', ar: 'مدير الحركة', en: 'Fleet Manager' },
                      { key: 'technician', ar: 'فني الصيانة', en: 'Technician' },
                      { key: 'viewer', ar: 'المراقب / المشاهد', en: 'Viewer' }
                    ].map((roleOpt) => (
                      <button
                        key={roleOpt.key}
                        onClick={() => {
                          setSelectedPreviewRole(roleOpt.key as any);
                          setSelectedPreviewItem('dashboard');
                        }}
                        className={`px-2 py-1 text-[9px] font-black rounded-md transition-all cursor-pointer ${
                          selectedPreviewRole === roleOpt.key
                            ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        {language === 'ar' ? roleOpt.ar : roleOpt.en}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SIMULATOR WORKSPACE */}
              <div className="grid grid-cols-1 md:grid-cols-4 min-h-[380px] bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner">
                {/* Sidebar mock */}
                <div className={`md:col-span-1 bg-slate-50 dark:bg-[#0c0f1d] border-slate-200 dark:border-slate-900 p-3 flex flex-col justify-between ${language === 'ar' ? 'border-l' : 'border-r'}`}>
                  <div className="space-y-4">
                    {/* Brand header */}
                    <div className="flex items-center gap-2 px-1.5 pb-2 border-b border-slate-150 dark:border-slate-900">
                      <div className="p-1.5 bg-violet-600 rounded-lg text-white">
                        <ShieldCheck size={12} />
                      </div>
                      <div className="text-right">
                        <h4 className="text-[10px] font-black text-slate-900 dark:text-white tracking-wide">ميكانيكي 360</h4>
                        <p className="text-[8px] text-violet-500 font-mono font-bold">PREVIEW MODE</p>
                      </div>
                    </div>

                    {/* Navigation Menu in Sidebar */}
                    <div className="space-y-3.5 text-right">
                      {[
                        {
                          group: 'command',
                          titleAr: 'القيادة والتحكم الإستراتيجي',
                          titleEn: 'Command & Control',
                          items: [
                            { id: 'dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: <LayoutDashboard size={13} /> },
                            { id: 'maintenance-bot', labelAr: 'مركز التحكم بوكلاء AI', labelEn: 'AI Bot Center', icon: <Bot size={13} /> },
                            { id: 'reports', labelAr: 'التقارير والإحصائيات', labelEn: 'Reports & Stats', icon: <BarChart3 size={13} />, perm: 'view-reports' }
                          ]
                        },
                        {
                          group: 'operations',
                          titleAr: 'إدارة الحركة والعمليات',
                          titleEn: 'Fleet Operations',
                          items: [
                            { id: 'vehicles', labelAr: 'إدارة المعدات والمركبات', labelEn: 'Manage Vehicles', icon: <Truck size={13} />, perm: 'write-vehicles' },
                            { id: 'drivers', labelAr: 'إدارة السائقين والتفويضات', labelEn: 'Manage Drivers', icon: <Users size={13} />, perm: 'write-vehicles' },
                            { id: 'driver-handover', labelAr: 'تسليم واستلام العجلات الفني', labelEn: 'Handover Checklists', icon: <FileText size={13} />, perm: 'write-vehicles' }
                          ]
                        },
                        {
                          group: 'engineering',
                          titleAr: 'إدارة الهندسة والصيانة الفنية',
                          titleEn: 'Mechanical & Workshops',
                          items: [
                            { id: 'workshops', labelAr: 'إدارة الورش والضغط الميداني', labelEn: 'Manage Workshops', icon: <Building2 size={13} />, perm: 'write-orders' },
                            { id: 'maintenance', labelAr: 'إدارة أوامر الصيانة', labelEn: 'Maintenance Orders', icon: <Wrench size={13} />, perm: 'write-orders' },
                            { id: 'periodic-maintenance', labelAr: 'إدارة الصيانة الدورية', labelEn: 'Periodic Schedules', icon: <Calendar size={13} />, perm: 'write-orders' },
                            { id: 'technicians', labelAr: 'إدارة الفنيين والعاملين', labelEn: 'Technician Roster', icon: <Users size={13} />, adminOnly: true }
                          ]
                        },
                        {
                          group: 'logistics',
                          titleAr: 'إدارة التموين وسلاسل الإمداد',
                          titleEn: 'Supply Chain & Parts',
                          items: [
                            { id: 'inventory', labelAr: 'إدارة المخزن والقطع', labelEn: 'Parts Inventory', icon: <Warehouse size={13} />, perm: 'issue-inventory' },
                            { id: 'vendors', labelAr: 'إدارة الموردين والتوريد', labelEn: 'Manage Vendors', icon: <Users size={13} />, perm: 'issue-inventory' }
                          ]
                        },
                        {
                          group: 'governance',
                          titleAr: 'الحوكمة والتفتيش والأمان',
                          titleEn: 'Compliance & SaaS',
                          items: [
                            { id: 'security-audit', labelAr: 'صلاحيات الموظفين والامتثال', labelEn: 'RBAC & Compliance', icon: <ShieldCheck size={13} />, perm: 'manage-saas' },
                            { id: 'firebase-sync', labelAr: 'بوابة المزامنة والربط السحابي', labelEn: 'Firebase Portal', icon: <Cloud size={13} />, perm: 'manage-saas' },
                            { id: 'saas-billing', labelAr: 'إدارة الاشتراك والفوترة', labelEn: 'SaaS Billing', icon: <CreditCard size={13} />, perm: 'manage-saas' }
                          ]
                        }
                      ].map((grp) => {
                        const itemsWithVisibility = grp.items.map(item => {
                          let isVisible = false;
                          if (item.id === 'dashboard' || item.id === 'maintenance-bot') {
                            isVisible = true;
                          } else if (item.adminOnly) {
                            isVisible = selectedPreviewRole === 'admin';
                          } else if (item.perm) {
                            const matrixPerm = permissions.find(p => p.id === item.perm);
                            isVisible = matrixPerm ? !!matrixPerm.roles[selectedPreviewRole] : false;
                          }
                          return { ...item, isVisible };
                        });

                        const hasAnyVisible = itemsWithVisibility.some(i => i.isVisible);
                        if (!hasAnyVisible && !showLockedInPreview) return null;

                        return (
                          <div key={grp.group} className="space-y-1">
                            <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-1 text-right">
                              {language === 'ar' ? grp.titleAr : grp.titleEn}
                            </span>
                            <div className="space-y-0.5">
                              {itemsWithVisibility.map((item) => {
                                if (!item.isVisible && !showLockedInPreview) return null;

                                const isActive = selectedPreviewItem === item.id;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    disabled={!item.isVisible}
                                    onClick={() => setSelectedPreviewItem(item.id)}
                                    className={`w-full text-right p-1.5 px-2 rounded-lg flex items-center justify-between transition-all ${
                                      !item.isVisible
                                        ? 'opacity-40 cursor-not-allowed bg-slate-100/50 dark:bg-slate-900/20 text-slate-400'
                                        : isActive
                                        ? 'bg-violet-500/10 text-violet-700 dark:text-violet-400 font-extrabold'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}>
                                        {item.icon}
                                      </div>
                                      <span className="text-[9px] font-bold">
                                        {language === 'ar' ? item.labelAr : item.labelEn}
                                      </span>
                                    </div>
                                    {!item.isVisible && <Lock size={9} className="text-amber-500 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sidebar Footer */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center text-[8px] font-black text-violet-700 dark:text-violet-400">
                        {selectedPreviewRole[0].toUpperCase()}
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-slate-800 dark:text-slate-200">
                          {selectedPreviewRole === 'admin' ? 'المهندس خالد' : selectedPreviewRole === 'fleet_manager' ? 'المدير سالم' : selectedPreviewRole === 'technician' ? 'الفني أحمد' : 'المراقب سالم'}
                        </p>
                        <p className="text-[7px] text-slate-400">
                          {selectedPreviewRole === 'admin' ? 'مدير نظام' : selectedPreviewRole === 'fleet_manager' ? 'مدير حركة' : selectedPreviewRole === 'technician' ? 'فني صيانة' : 'مشاهد'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Viewport content area */}
                <div className="md:col-span-3 p-4 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-4">
                    {/* Page header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-900">
                      <div>
                        <h5 className="text-[11px] font-extrabold text-slate-950 dark:text-white">
                          {selectedPreviewItem === 'dashboard' && (language === 'ar' ? 'لوحة التحكم الرئيسية' : 'Dashboard')}
                          {selectedPreviewItem === 'maintenance-bot' && (language === 'ar' ? 'مركز التحكم بوكلاء الذكاء الاصطناعي' : 'AI Bot Workspace')}
                          {selectedPreviewItem === 'reports' && (language === 'ar' ? 'التقارير المالية واللوجستية' : 'Reports & Analytical Desk')}
                          {selectedPreviewItem === 'vehicles' && (language === 'ar' ? 'بوابة المركبات والمعدات الثقيلة' : 'Vehicles Management')}
                          {selectedPreviewItem === 'drivers' && (language === 'ar' ? 'شؤون السائقين والتفويضات' : 'Drivers Board')}
                          {selectedPreviewItem === 'driver-handover' && (language === 'ar' ? 'تسليم واستلام العجلات' : 'Vehicle Handover')}
                          {selectedPreviewItem === 'workshops' && (language === 'ar' ? 'لوحة قيادة الورش والضغط' : 'Workshops Management')}
                          {selectedPreviewItem === 'maintenance' && (language === 'ar' ? 'أوامر الصيانة والتشخيص' : 'Maintenance Orders')}
                          {selectedPreviewItem === 'periodic-maintenance' && (language === 'ar' ? 'جدولة الصيانة الوقائية' : 'Periodic Maintenance')}
                          {selectedPreviewItem === 'technicians' && (language === 'ar' ? 'كادر المهندسين والفنيين' : 'Technicians Roster')}
                          {selectedPreviewItem === 'inventory' && (language === 'ar' ? 'المخزن وقطع الغيار' : 'Inventory & Warehouse')}
                          {selectedPreviewItem === 'vendors' && (language === 'ar' ? 'سجلات الموردين والمقاولين' : 'Vendors & Partners')}
                          {selectedPreviewItem === 'security-audit' && (language === 'ar' ? 'بوابة الامتثال وإعداد الرقابة' : 'RBAC Settings')}
                          {selectedPreviewItem === 'firebase-sync' && (language === 'ar' ? 'بوابة الربط السحابي والـ Cloud' : 'Firebase Sync')}
                          {selectedPreviewItem === 'saas-billing' && (language === 'ar' ? 'إدارة الاشتراك والـ SaaS' : 'SaaS Subscription')}
                        </h5>
                        <p className="text-[8px] text-slate-400 mt-0.5">
                          {language === 'ar' ? 'معاينة تفاعلية حية تابعة للترخيص الأمني الحالي' : 'Live simulator driven by active permissions matrix'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-[7.5px] bg-slate-200 dark:bg-slate-900 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase">
                          {selectedPreviewRole}
                        </span>
                        <span className="text-[7px] text-slate-400">mech360.net</span>
                      </div>
                    </div>

                    {/* MOCK DETAILS */}
                    {selectedPreviewItem === 'dashboard' && (
                      <div className="space-y-3 text-right">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[8px] text-slate-400 block font-bold">الشاحنات النشطة</span>
                            <span className="text-xs font-black text-slate-800 dark:text-white mt-0.5 block">12 مركبة</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[8px] text-slate-400 block font-bold">أوامر معلقة</span>
                            <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5 block">4 صيانة</span>
                          </div>
                          
                          <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            {permissions.find(p => p.id === 'view-reports')?.roles[selectedPreviewRole] ? (
                              <>
                                <span className="text-[8px] text-emerald-50 block font-bold text-emerald-500">إيرادات التشغيل</span>
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">$14,820</span>
                              </>
                            ) : (
                              <div className="absolute inset-0 bg-slate-50/90 dark:bg-slate-900/95 backdrop-blur-xs flex flex-col items-center justify-center p-1 text-center">
                                <Lock size={11} className="text-amber-500 mb-0.5" />
                                <span className="text-[7.5px] text-slate-500 font-extrabold">البيانات المالية مقفلة</span>
                                <span className="text-[6.5px] text-slate-400 leading-none mt-0.5">يتطلب صلاحية التقارير</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                          <span className="text-[8px] font-black text-slate-500 block">سجل الفعاليات الأخيرة</span>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[7.5px] py-1 border-b border-slate-100 dark:border-slate-800">
                              <span className="text-slate-700 dark:text-slate-300 font-bold">صيانة طقم فرامل (شاحنة فورد)</span>
                              <span className="text-emerald-500">مكتمل</span>
                            </div>
                            <div className="flex items-center justify-between text-[7.5px] py-1">
                              <span className="text-slate-700 dark:text-slate-300 font-bold">فحص السلامة الإلزامي (حافلة مرسيدس)</span>
                              <span className="text-amber-500">قيد التنفيذ</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedPreviewItem === 'maintenance-bot' && (
                      <div className="space-y-2 text-right">
                        {rolePolicies[selectedPreviewRole]?.aiBot ? (
                          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                            <div className="p-2 bg-violet-50 dark:bg-violet-950/20 rounded-lg text-[8px] text-slate-600 dark:text-slate-300 leading-relaxed flex gap-2">
                              <div className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center font-black">AI</div>
                              <div>
                                <strong>مرحباً بك! أنا مساعد الصيانة الذكي.</strong>
                                <p className="mt-0.5">يمكنني التنبؤ بمواعيد صيانة المحركات لأسطولك بناءً على معايير الجودة والمسافات المقطوعة.</p>
                              </div>
                            </div>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                placeholder="اسأل البوت عن أي تذكير صيانة معلق..."
                                disabled
                                className="w-full text-[8.5px] p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg outline-none"
                              />
                              <button type="button" className="p-1 px-3 bg-violet-600 text-white text-[8px] font-bold rounded-lg opacity-70">إرسال</button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                            <Lock size={16} className="text-amber-500 mb-1" />
                            <h6 className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300">مركز الذكاء الاصطناعي معطل لهذا الدور</h6>
                            <p className="text-[8px] text-slate-400 mt-0.5">الوصول لـ AI Bot ملغى ضمن إعدادات حوكمة السياسات المتقدمة (MFA & Controls).</p>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedPreviewItem === 'reports' && (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 text-right">
                        <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 block">مستندات التحليل المالي والتشغيلي للورشة</span>
                        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg text-[8px] text-slate-600 dark:text-slate-400">
                          تقرير مايو 2026: استهلاك وقود الديزل الإجمالي لشاحنات النقل الثقيل هو 4,200 لتر بتكلفة $8,400.
                        </div>
                        
                        <div className="flex items-center justify-end">
                          {rolePolicies[selectedPreviewRole]?.export ? (
                            <button type="button" className="p-1.5 px-3 bg-violet-600 text-white text-[8px] font-bold rounded-lg hover:bg-violet-700 cursor-pointer">
                              تصدير التقرير كملف Excel (متاح)
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-amber-500/5 border border-amber-500/10 p-1 px-2.5 rounded-lg">
                              <Lock size={10} className="text-amber-500" />
                              <span className="text-[7.5px] text-amber-600 font-extrabold">تصدير التقارير للخارج مقفل لسياسة الأمان</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedPreviewItem === 'vehicles' && (
                      <div className="space-y-2 text-right">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-800 dark:text-slate-200">سجل مركبات المنشأة</span>
                          
                          {permissions.find(p => p.id === 'write-vehicles')?.roles[selectedPreviewRole] ? (
                            <button type="button" className="p-1 px-2 bg-violet-600 hover:bg-violet-700 text-white text-[8px] font-black rounded-md cursor-pointer">
                              + إضافة مركبة للأسطول
                            </button>
                          ) : (
                            <span className="text-[7.5px] text-slate-400 italic">🔒 عرض فقط لعدم وجود صلاحية (write-vehicles)</span>
                          )}
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-[8px]">
                            <thead>
                              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black">
                                <th className="py-1">رمز اللوحة</th>
                                <th className="py-1">الموديل</th>
                                <th className="py-1">الحالة</th>
                                <th className="py-1 text-center">العمليات</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
                              <tr className="hover:bg-slate-50/50">
                                <td className="py-1.5 text-slate-900 dark:text-white font-bold">أ ص م 501</td>
                                <td className="py-1.5 text-slate-500 dark:text-slate-400">مرسيدس Actros 2024</td>
                                <td className="py-1.5"><span className="text-emerald-500 font-bold">ممتازة</span></td>
                                <td className="py-1.5 text-center">
                                  {permissions.find(p => p.id === 'delete-vehicles')?.roles[selectedPreviewRole] ? (
                                    <button type="button" className="text-red-500 font-bold hover:underline cursor-pointer">حذف نهائي</button>
                                  ) : (
                                    <span className="text-slate-400">🔒 مقيد</span>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {['drivers', 'driver-handover', 'workshops', 'technicians', 'inventory', 'vendors', 'security-audit', 'firebase-sync', 'saas-billing', 'maintenance', 'periodic-maintenance'].includes(selectedPreviewItem) && (
                      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 text-right">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 rounded-lg">
                            <Settings2 size={12} />
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-slate-800 dark:text-white block">إعداد ميزات الورشة والامتثال</span>
                            <span className="text-[7px] text-slate-400">فحص الصلاحيات التفصيلية والـ Granular للعمليات الصغرى</span>
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg space-y-1.5 text-right text-[8px] text-slate-600 dark:text-slate-400">
                          <p className="font-bold border-b border-slate-100 dark:border-slate-900 pb-1.5 text-slate-850 dark:text-white">الامتثال للعمليات الصغرى بالتبويب الحالي:</p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span>1. حذف سجل/أمر صيانة نهائياً من الأرشيف:</span>
                              <span className={granularPermissions.find(p => p.id === 'delete-maintenance-record')?.roles[selectedPreviewRole] ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                                {granularPermissions.find(p => p.id === 'delete-maintenance-record')?.roles[selectedPreviewRole] ? '✓ مصرح به' : '🔒 مقيد'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span>2. إعادة فتح وتعديل فواتير الصيانة المغلقة والمسواة مالياً:</span>
                              <span className={granularPermissions.find(p => p.id === 'edit-completed-orders')?.roles[selectedPreviewRole] ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                                {granularPermissions.find(p => p.id === 'edit-completed-orders')?.roles[selectedPreviewRole] ? '✓ مصرح به' : '🔒 مقيد'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span>3. تجاوز وإعفاء أمر صيانة من قائمة فحص السلامة الإلزامية:</span>
                              <span className={granularPermissions.find(p => p.id === 'bypass-safety-checklist')?.roles[selectedPreviewRole] ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                                {granularPermissions.find(p => p.id === 'bypass-safety-checklist')?.roles[selectedPreviewRole] ? '✓ مصرح به' : '🔒 إجباري (محجوب التجاوز)'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span>4. موافقة واعتماد طلبات صرف قطع الغيار المكلفة ($100+):</span>
                              <span className={granularPermissions.find(p => p.id === 'approve-parts-issuance')?.roles[selectedPreviewRole] ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                                {granularPermissions.find(p => p.id === 'approve-parts-issuance')?.roles[selectedPreviewRole] ? '✓ مصرح بالموافقة المباشرة' : '🔒 معلق بطلب اعتماد مدير الحركة'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Simulator footer */}
                  <div className="text-[7px] text-slate-400 mt-4 leading-relaxed border-t border-slate-100 dark:border-slate-900 pt-2 flex items-center justify-between">
                    <span>© ميكانيكي 360 - بوابة الامتثال الأمني</span>
                    <span>الدور النشط بالمعاينة: {selectedPreviewRole === 'admin' ? 'مدير نظام' : selectedPreviewRole === 'fleet_manager' ? 'مدير حركة' : selectedPreviewRole === 'technician' ? 'فني صيانة' : 'مشاهد ومراقب'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Matrix Grid Representation */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[11px] border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-black">
                  <th className="py-3 px-3 w-1/3 text-xs">
                    {language === 'ar' ? 'ميزة النظام / صلاحية الترخيص الفرعية' : 'System Feature / Sub-License Permission'}
                  </th>
                  {[
                    { key: 'admin', labelAr: 'مدير نظام (Admin)', labelEn: 'Super Admin' },
                    { key: 'fleet_manager', labelAr: 'مدير حركة (Manager)', labelEn: 'Fleet Manager' },
                    { key: 'technician', labelAr: 'فني صيانة (Technician)', labelEn: 'Tech/Mechanic' },
                    { key: 'viewer', labelAr: 'مشاهد (Viewer)', labelEn: 'Auditor/Viewer' }
                  ].map((roleHeader) => (
                    <th key={roleHeader.key} className="py-3 px-2 text-center w-1/6">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-800 dark:text-slate-200">
                          {language === 'ar' ? roleHeader.labelAr : roleHeader.labelEn}
                        </span>
                        <span className="text-[8px] text-slate-400 font-mono tracking-wider uppercase mt-0.5">
                          {roleHeader.key.replace('_', ' ')}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {permissions.map((p: any) => {
                  const translated = (permissionTranslations as any)[p.id];
                  const label = language === 'ar' 
                    ? (translated ? translated.ar : p.label)
                    : (translated ? translated.en : p.label);

                  return (
                    <tr 
                      key={p.id} 
                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all duration-150"
                    >
                      {/* Permission Description */}
                      <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 group-hover:scale-125 transition-transform" />
                          <div>
                            <p className="text-[11.5px] font-bold leading-normal">{label}</p>
                            <span className="text-[8.5px] font-mono text-slate-400 dark:text-slate-500 block mt-0.5 uppercase tracking-wide">
                              {p.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Checkboxes for Roles */}
                      {(['admin', 'fleet_manager', 'technician', 'viewer'] as const).map((roleKey) => {
                        const isChecked = !!p.roles[roleKey];
                        return (
                          <td key={roleKey} className="py-3.5 px-2 text-center">
                            <div className="flex items-center justify-center">
                              <label className="relative flex items-center justify-center cursor-pointer select-none group/box">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(p.id, roleKey)}
                                  className="sr-only" // Hide native checkbox to draw clean design
                                />
                                <div 
                                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 transform group-hover/box:scale-110 active:scale-95 ${
                                    isChecked 
                                      ? 'border-violet-600 bg-violet-600 dark:border-violet-500 dark:bg-violet-500 text-white shadow-xs' 
                                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-transparent hover:border-violet-450 dark:hover:border-violet-500'
                                  }`}
                                  title={language === 'ar' ? 'تعديل الصلاحية' : 'Toggle Permission'}
                                >
                                  <Check size={14} className={`stroke-[3.5] transition-transform duration-200 ${isChecked ? 'scale-100' : 'scale-0'}`} />
                                </div>
                              </label>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <AlertCircle size={14} className="text-violet-500 shrink-0" />
            <p className="leading-relaxed">
              {language === 'ar' 
                ? 'مربعات الاختيار أعلاه مربوطة بآلية حراسة المسارات (Route Guards) وعمليات قواعد البيانات. يؤدي إلغاء تحديد أي مربع إلى حجب الوظيفة فوراً عن جميع حسابات الموظفين المنضوين تحت هذا الدور.'
                : 'The interactive checkboxes above restrict active client sessions instantly. Deselecting any capability will lock the associated views and cloud resources for all matched role accounts.'}
            </p>
          </div>
        </div>

        {/* Invite Colleagues and Sub-Users Form */}
        <div className="bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-150/50 dark:border-slate-800/60">
              <UserPlus size={16} className="text-brand-blue-500" />
              <h2 className="text-sm font-black text-slate-900 dark:text-white">إضافة ودعوة موظفين جدد</h2>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">اسم الموظف / الفني كاملاً *</label>
                <input 
                  type="text"
                  required
                  placeholder="مثال: الفني مراد العمري"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 focus:border-brand-blue-500 rounded-xl transition-all outline-none dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">البريد الإلكتروني المعتمد *</label>
                <input 
                  type="email"
                  required
                  placeholder="mourad@mech360.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 focus:border-brand-blue-500 rounded-xl transition-all outline-none dark:text-white"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-slate-500">الدور الوظيفي والترخيص</label>
                <select 
                  value={newMember.role}
                  onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as TeamMember['role'] }))}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 focus:border-brand-blue-500 rounded-xl transition-all outline-none dark:text-white font-bold text-slate-800"
                >
                  <option value="admin">مدير نظام كامل (Super Admin)</option>
                  <option value="fleet_manager">مدير حركة المركبات واللوجستيات (Fleet Manager)</option>
                  <option value="technician">فني صيانة وتوجيه تقارير (Technician)</option>
                  <option value="viewer">مشاهد ومراقب جودة (Auditor/Viewer)</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 h-10 bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>أرسل رمز دعوة وترخيص الانضمام</span>
              </button>
            </form>
          </div>

          <div className="text-[9px] text-slate-400 mt-4 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            * سيتم إعلام الموظف تلقائياً بمرور يطابق السياسة الإدارية لتسجيل معايير دخوله.
          </div>
        </div>

      </div>

      {/* SECTION: GRANULAR PERMISSIONS (صلاحيات إضافية للعمليات الصغرى) */}
      <div className="bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-5" id="granular-permissions-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-150/50 dark:border-slate-800/60 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl">
              <Key size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                {language === 'ar' ? 'صلاحيات إضافية تفصيلية للعمليات (Granular Permissions)' : 'Granular Permissions & Operations Access'}
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {language === 'ar' 
                  ? 'تحكم دقيق بمستوى تنفيذ العمليات والقرارات التشغيلية الحساسة (مثل حذف سجلات الصيانة أو تعديل بيانات المركبات)' 
                  : 'Fine-tune authorization down to micro-level database and workshop actions'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder={language === 'ar' ? 'بحث في الصلاحيات التفصيلية...' : 'Search granular rules...'}
                value={granularSearchQuery}
                onChange={(e) => setGranularSearchQuery(e.target.value)}
                className="w-48 text-[11px] p-2 pr-8 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 focus:border-violet-500 rounded-xl transition-all outline-none dark:text-white"
              />
              <Search size={12} className="absolute right-2.5 top-3.5 text-slate-400" />
            </div>

            {/* Add Custom Button */}
            <button
              onClick={() => setShowAddGranularModal(true)}
              className="p-2 px-3 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-black rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Plus size={12} />
              <span>{language === 'ar' ? 'إضافة صلاحية تفصيلية' : 'Add Granular Rule'}</span>
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-2.5">
          <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {language === 'ar' 
              ? 'تتجاوز هذه الإعدادات القيود العامة للتبويبات؛ حيث تتيح تخصيص الإجراءات عالية الخطورة وتوثيق التخويل بالتبديل المباشر لمنع الحوادث وضمان امتثال السلامة في الورشة.'
              : 'These rules enforce strict row-level action constraints. Changes are audited with immediate cloud token updates.'}
          </div>
        </div>

        {/* Granular Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-[11px] border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold">
                <th className="py-2 px-3 text-right">
                  {language === 'ar' ? 'القرار التشغيلي / الإجراء الدقيق' : 'Granular Operational Decision / Action'}
                </th>
                <th className="py-2 px-2 text-center w-28">{language === 'ar' ? 'مدير نظام (Admin)' : 'Admin'}</th>
                <th className="py-2 px-2 text-center w-28">{language === 'ar' ? 'مدير حركة (Manager)' : 'Fleet Manager'}</th>
                <th className="py-2 px-2 text-center w-28">{language === 'ar' ? 'فني صيانة (Technician)' : 'Technician'}</th>
                <th className="py-2 px-2 text-center w-28">{language === 'ar' ? 'مشاهد ومراقب (Viewer)' : 'Viewer'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {granularPermissions
                .filter(p => p.label.includes(granularSearchQuery) || p.id.includes(granularSearchQuery))
                .map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-[11.5px]">{p.label}</div>
                        <span className="text-[8.5px] text-violet-500/80 font-mono tracking-wide uppercase mt-0.5 block">{p.id}</span>
                      </div>
                    </td>

                    {/* Checkboxes for each role */}
                    {(['admin', 'fleet_manager', 'technician', 'viewer'] as const).map((roleKey) => {
                      const isChecked = !!p.roles[roleKey];
                      return (
                        <td key={roleKey} className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center">
                            <label className="relative flex items-center justify-center cursor-pointer select-none group/gbox">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleGranularPermission(p.id, roleKey)}
                                className="sr-only"
                              />
                              <div
                                className={`w-5.5 h-5.5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 transform group-hover/gbox:scale-110 active:scale-95 ${
                                  isChecked
                                    ? 'border-violet-600 bg-violet-600 dark:border-violet-500 dark:bg-violet-500 text-white shadow-xs'
                                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-transparent hover:border-violet-400'
                                }`}
                              >
                                <Check size={12} className={`stroke-[3.5] transition-transform duration-200 ${isChecked ? 'scale-100' : 'scale-0'}`} />
                              </div>
                            </label>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADVANCED CUSTOM RBAC CONFIGURATION PANEL */}
      <div className="bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-6" id="rbac-advanced-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-150/50 dark:border-slate-800/60 gap-4">
          <div className="flex items-center gap-2">
            <Settings2 size={18} className="text-violet-600 dark:text-violet-400" />
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                {language === 'ar' ? 'منصة تخصيص صلاحيات الأدوار المتقدمة (RBAC Policy Studio)' : 'Advanced Role-Based Access Control Console (RBAC Policy Studio)'}
              </h2>
              <p className="text-[10px] text-slate-500">
                {language === 'ar' ? 'حدد دوراً وظيفياً لتعديل ميزاته الدقيقة، سياسات الأمان، وقيود العمليات الخاصة به.' : 'Select a system role to fine-tune active capabilities, operational guidelines and token scopes.'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddPermissionModal(true)}
            className="p-1.5 px-3 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/30 dark:hover:bg-violet-950/50 text-violet-600 dark:text-violet-400 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-violet-150 dark:border-violet-800/40"
          >
            <Plus size={13} />
            <span>{language === 'ar' ? 'إضافة صلاحية مخصصة جديدة' : 'Add New Custom Permission'}</span>
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['admin', 'fleet_manager', 'technician', 'viewer'] as const).map((roleKey) => {
            const isActive = selectedRbacRole === roleKey;
            const roleDetails = {
              admin: { labelAr: 'مدير نظام كامل', labelEn: 'Super Admin', descAr: 'كامل الصلاحيات الفنية والإدارية والمالية', descEn: 'Unrestricted system & cloud credentials' },
              fleet_manager: { labelAr: 'مدير حركة الأسطول', labelEn: 'Fleet Manager', descAr: 'توجيه المركبات وإدارة السائقين والعمليات', descEn: 'Oversees vehicles, schedules & logistics' },
              technician: { labelAr: 'فني صيانة الورشة', labelEn: 'Workshop Technician', descAr: 'تنفيذ أوامر الإصلاح وصرف قطع المستودع', descEn: 'Runs repair orders, updates job checklists' },
              viewer: { labelAr: 'مشاهد ومراقب جودة', labelEn: 'Quality Auditor', descAr: 'الاطلاع على التقارير والتدقيق دون تعديل', descEn: 'Read-only access to charts & compliance logs' }
            }[roleKey];

            return (
              <button
                key={roleKey}
                onClick={() => setSelectedRbacRole(roleKey)}
                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer relative flex flex-col justify-between h-24 ${
                  isActive 
                    ? 'border-violet-500 bg-violet-500/5 dark:bg-violet-500/10 shadow-sm' 
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/20'
                }`}
              >
                {isActive && (
                  <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                )}
                <div>
                  <h3 className={`text-[11.5px] font-black ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {language === 'ar' ? roleDetails.labelAr : roleDetails.labelEn}
                  </h3>
                  <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                    {language === 'ar' ? roleDetails.descAr : roleDetails.descEn}
                  </p>
                </div>
                <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 pt-1">
                  ROLE_{roleKey.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Core Policy Tuning Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Active Feature Capabilities */}
          <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/10 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-150/50 dark:border-slate-800/60">
              <ShieldAlert size={14} className="text-violet-500" />
              <span>{language === 'ar' ? 'صلاحيات ومميزات النظام المفعلة لهذا الدور' : 'Active Feature Privileges for this Role'}</span>
            </h4>

            <div className="space-y-3">
              {[
                { key: 'aiBot', labelAr: 'مساعد الصيانة بالذكاء الاصطناعي (Smart Assistant)', labelEn: 'Access AI Maintenance Bot & Tech Hub' },
                { key: 'billing', labelAr: 'إدارة الفوترة والاشتراكات السحابية للشركة (SaaS Billing)', labelEn: 'SaaS Plan Billing & Subscription settings' },
                { key: 'maps', labelAr: 'تتبع حركة ومواقع المركبات عبر الخرائط حياً', labelEn: 'Live GPS Fleet Location & Maps Tracking' },
                { key: 'export', labelAr: 'تصدير التقارير الإدارية والمالية بصيغة Excel/PDF', labelEn: 'Export executive reports and system stats' },
                { key: 'firebaseSync', labelAr: 'تشغيل المزامنة والنسخ السحابي لـ Firebase Console', labelEn: 'Direct Firebase Cloud Backup Synchronization' },
                { key: 'selfAssign', labelAr: 'إسناد المهام الذاتي والتعديل للفنيين (Self-Assign)', labelEn: 'Allow technicians to self-claim maintenance orders' },
              ].map((feat) => {
                const isEnabled = !!rolePolicies[selectedRbacRole]?.[feat.key as 'aiBot' | 'billing' | 'maps' | 'export' | 'firebaseSync' | 'selfAssign'];
                return (
                  <div key={feat.key} className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors">
                    <div className="space-y-0.5">
                      <span className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? feat.labelAr : feat.labelEn}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const updated = {
                          ...rolePolicies,
                          [selectedRbacRole]: {
                            ...rolePolicies[selectedRbacRole],
                            [feat.key]: !isEnabled
                          }
                        };
                        setRolePolicies(updated);
                        localStorage.setItem('saas_role_policies', JSON.stringify(updated));

                        // Log action
                        const newLog: AuditLog = {
                          id: `log-${Date.now()}`,
                          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                          user: 'المهندس خالد',
                          role: 'مدير نظام',
                          action: 'تحديث سياسة RBAC',
                          category: 'users',
                          ipAddress: '197.82.16.42',
                          status: 'نجاح',
                          details: `تعديل صلاحية ميزة (${feat.labelAr}) لدور (${selectedRbacRole}) إلى: ${!isEnabled ? 'مفعلة' : 'معطلة'}`
                        };
                        setAuditLogs(logs => [newLog, ...logs]);
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? '-translate-x-4' : 'translate-x-4'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operational & Security Policies */}
          <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/10 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-150/50 dark:border-slate-800/60">
              <Key size={14} className="text-violet-500" />
              <span>{language === 'ar' ? 'سياسات الأمان والتدابير التشغيلية للدور' : 'Operational Constraints & Password Policies'}</span>
            </h4>

            <div className="space-y-4 pt-1.5">
              {/* Password complexity policy */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 block">
                  {language === 'ar' ? 'معيار تعقيد كلمة المرور المطلوبة لمستخدمي هذا الدور:' : 'Required Password Complexity Standard:'}
                </label>
                <select
                  value={rolePolicies[selectedRbacRole]?.passStrength || 'medium'}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updated = {
                      ...rolePolicies,
                      [selectedRbacRole]: {
                        ...rolePolicies[selectedRbacRole],
                        passStrength: val
                      }
                    };
                    setRolePolicies(updated);
                    localStorage.setItem('saas_role_policies', JSON.stringify(updated));

                    // Log action
                    const newLog: AuditLog = {
                      id: `log-${Date.now()}`,
                      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                      user: 'المهندس خالد',
                      role: 'مدير نظام',
                      action: 'تحديث سياسة RBAC',
                      category: 'users',
                      ipAddress: '197.82.16.42',
                      status: 'نجاح',
                      details: `تعديل سياسة تعقيد المرور لدور (${selectedRbacRole}) إلى: ${val === 'strong' ? 'معقدة جداً' : val === 'medium' ? 'متوسطة' : 'أساسية'}`
                    };
                    setAuditLogs(logs => [newLog, ...logs]);
                  }}
                  className="w-full text-xs p-2 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 focus:border-violet-500 rounded-xl transition-all outline-none dark:text-white"
                >
                  <option value="basic">{language === 'ar' ? 'أساسي (أحرف وأرقام عادية)' : 'Basic (letters & numbers)'}</option>
                  <option value="medium">{language === 'ar' ? 'متوسط (يشمل أحرف كبيرة وصغيرة ورموز)' : 'Medium (uppercase, lowercase & symbol)'}</option>
                  <option value="strong">{language === 'ar' ? 'معقد جداً (يشمل تحديث إجباري كل 30 يوماً وتوثيق طارئ)' : 'Extreme (forced reset every 30 days + dual verification)'}</option>
                </select>
              </div>

              {/* Login Hours Policy */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 block">
                  {language === 'ar' ? 'ساعات الولوج والدخول المصرح بها للمنظومة:' : 'Permitted Login Hours / Working Shifts:'}
                </label>
                <select
                  value={rolePolicies[selectedRbacRole]?.workHours || 'anytime'}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updated = {
                      ...rolePolicies,
                      [selectedRbacRole]: {
                        ...rolePolicies[selectedRbacRole],
                        workHours: val
                      }
                    };
                    setRolePolicies(updated);
                    localStorage.setItem('saas_role_policies', JSON.stringify(updated));

                    // Log action
                    const newLog: AuditLog = {
                      id: `log-${Date.now()}`,
                      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                      user: 'المهندس خالد',
                      role: 'مدير نظام',
                      action: 'تحديث سياسة RBAC',
                      category: 'users',
                      ipAddress: '197.82.16.42',
                      status: 'نجاح',
                      details: `تعديل ساعات الولوج لدور (${selectedRbacRole}) إلى: ${val === 'shifts' ? 'ساعات الدوام الرسمي فقط (8ص - 5م)' : 'ولوج مفتوح على مدار 24 ساعة'}`
                    };
                    setAuditLogs(logs => [newLog, ...logs]);
                  }}
                  className="w-full text-xs p-2 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 focus:border-violet-500 rounded-xl transition-all outline-none dark:text-white"
                >
                  <option value="anytime">{language === 'ar' ? 'مفتوح بالكامل (24/7/365)' : 'Full Access (24/7/365)'}</option>
                  <option value="shifts">{language === 'ar' ? 'فترات المناوبة الرسمية فقط (8:00 ص إلى 5:00 م)' : 'Official Shift Hours only (8:00 AM - 5:00 PM)'}</option>
                  <option value="emergency">{language === 'ar' ? 'مغلق ومحمي إلا في حال حالات الطوارئ المعمدة' : 'Restricted (Emergency overrides only)'}</option>
                </select>
              </div>

              {/* Require MFA Switch */}
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors">
                <div className="space-y-0.5 text-right">
                  <span className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300">
                    {language === 'ar' ? 'فرض التحقق بخطوتين عبر الهاتف (MFA)' : 'Force Two-Factor Authentication (MFA)'}
                  </span>
                  <p className="text-[9px] text-slate-400">
                    {language === 'ar' ? 'يتطلب تأكيداً برمز SMS أو تطبيق Authenticator عند تسجيل الدخول.' : 'Requires OTP confirmation on login events.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    const isEnabled = !!rolePolicies[selectedRbacRole]?.mfa;
                    const updated = {
                      ...rolePolicies,
                      [selectedRbacRole]: {
                        ...rolePolicies[selectedRbacRole],
                        mfa: !isEnabled
                      }
                    };
                    setRolePolicies(updated);
                    localStorage.setItem('saas_role_policies', JSON.stringify(updated));

                    // Log action
                    const newLog: AuditLog = {
                      id: `log-${Date.now()}`,
                      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                      user: 'المهندس خالد',
                      role: 'مدير نظام',
                      action: 'تحديث سياسة RBAC',
                      category: 'users',
                      ipAddress: '197.82.16.42',
                      status: 'نجاح',
                      details: `تعديل سياسة التحقق الثنائي (MFA) لدور (${selectedRbacRole}) إلى: ${!isEnabled ? 'مفعلة إجبارياً' : 'اختيارية'}`
                    };
                    setAuditLogs(logs => [newLog, ...logs]);
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    rolePolicies[selectedRbacRole]?.mfa ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      rolePolicies[selectedRbacRole]?.mfa ? '-translate-x-4' : 'translate-x-4'
                    }`}
                  />
                </button>
              </div>

              {/* Dual manager approval */}
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors">
                <div className="space-y-0.5 text-right">
                  <span className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300">
                    {language === 'ar' ? 'طلب توثيق واعتماد ثنائي لصرف القطع الكبرى' : 'Require Dual Approval for High-Value Stock Issuing'}
                  </span>
                  <p className="text-[9px] text-slate-400">
                    {language === 'ar' ? 'يتطلب تفعيل رمز فحص إضافي من مدير الورشة عند الصرف من المستودع.' : 'Requires a secondary confirmation pin for valuable spare parts.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    const isEnabled = !!rolePolicies[selectedRbacRole]?.doubleAuth;
                    const updated = {
                      ...rolePolicies,
                      [selectedRbacRole]: {
                        ...rolePolicies[selectedRbacRole],
                        doubleAuth: !isEnabled
                      }
                    };
                    setRolePolicies(updated);
                    localStorage.setItem('saas_role_policies', JSON.stringify(updated));

                    // Log action
                    const newLog: AuditLog = {
                      id: `log-${Date.now()}`,
                      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                      user: 'المهندس خالد',
                      role: 'مدير نظام',
                      action: 'تحديث سياسة RBAC',
                      category: 'users',
                      ipAddress: '197.82.16.42',
                      status: 'نجاح',
                      details: `تعديل سياسة الاعتماد المزدوج للمستودع لدور (${selectedRbacRole}) إلى: ${!isEnabled ? 'مفعلة' : 'معطلة'}`
                    };
                    setAuditLogs(logs => [newLog, ...logs]);
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    rolePolicies[selectedRbacRole]?.doubleAuth ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      rolePolicies[selectedRbacRole]?.doubleAuth ? '-translate-x-4' : 'translate-x-4'
                    }`}
                  />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Global Policy Warning Box */}
        <div className="p-3.5 bg-violet-500/5 border border-violet-500/10 rounded-2xl text-[10.5px] text-violet-600 dark:text-violet-400 leading-relaxed flex items-start gap-2">
          <AlertCircle size={14} className="mt-0.5 text-violet-500 shrink-0" />
          <p>
            <strong>{language === 'ar' ? 'تأكيد الحفظ والأمان:' : 'RBAC Policy Assurance:'}</strong>{' '}
            {language === 'ar' 
              ? 'إن تعديل هذه الخيارات يحقن سياسات الوصول (Access Tokens) مباشرة لمتصفح العميل ولن يتمكن أي مستخدم مسجل بالدور المستهدف من تجاوز الحدود البرمجية المفروضة عليه. يتم تسجيل التغييرات تلقائياً في سجلات الامتثال والأمان (Audit Trail) لأسباب التفتيش الدوري.'
              : 'Applying modifications injects browser-level access token validations instantly. All active users matching the tuned role will immediately adhere to these new configurations. All revisions are securely archived in audit logs.'}
          </p>
        </div>
      </div>

      {/* Teammates management directory list (Interactive suspend/active actions) */}
      <div className="bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between font-sans pb-1">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-brand-blue-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">طاقم العمل المسجّل بالمنظمة ومستوى الوصول</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-500">إجمالي: {teamMembers.length} مستخدمين مؤهلين</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamMembers.map((tm) => (
            <div 
              key={tm.id} 
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 relative ${
                tm.status === 'suspended' 
                  ? 'border-rose-100 bg-rose-50/5 px-4 dark:border-rose-950/20 dark:bg-rose-950/5 text-slate-500' 
                  : 'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/10 hover:border-brand-blue-150'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">{tm.name}</h4>
                  <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded ${
                    tm.role === 'admin' 
                      ? 'bg-purple-105 text-purple-600' 
                      : tm.role === 'fleet_manager' 
                        ? 'bg-blue-105 text-blue-600' 
                        : tm.role === 'technician' 
                          ? 'bg-amber-105 text-amber-600' 
                          : 'bg-slate-105 text-slate-600'
                  }`}>
                    {tm.role === 'admin' ? 'مدير نظام' : tm.role === 'fleet_manager' ? 'مدير الحركة' : tm.role === 'technician' ? 'فني أول' : 'مسؤول جودة'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono" title={tm.email}>{tm.email}</p>
                <p className="text-[9px] text-slate-400 flex items-center gap-0.5 pt-1.5"><Clock size={9} /> آخر وصول: {tm.lastActive}</p>
              </div>

              {/* Suspend or Activate interactive button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[9.5px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${tm.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                  <span className="font-bold">{tm.status === 'active' ? 'حساب فعال' : 'حساب موقوف'}</span>
                </div>
                <button 
                  onClick={() => handleToggleMemberStatus(tm.id)}
                  className={`text-[9.5px] p-1.5 px-3 rounded-lg font-black transition-colors shrink-0 flex items-center gap-1 cursor-pointer ${
                    tm.status === 'active' 
                      ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white' 
                      : 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                  }`}
                >
                  {tm.status === 'active' ? (
                    <>
                      <Lock size={10} />
                      <span>تجميد الترخيص</span>
                    </>
                  ) : (
                    <>
                      <Unlock size={10} />
                      <span>تنشيط الترخيص</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs compliance Search and List module */}
      <div className="bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
        
        {/* Module Header with Live Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans border-b border-slate-150/50 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <History size={18} className="text-brand-blue-500 shrink-0" />
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">سلاسل الامتثال الأمني وملاحظات الدخول النشط (Audit Trail Logging)</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">سجل غير قابل للمسح أو التلاعب يراقب كافة تعديلات الصيانة والمستودع والماليات لأسباب التأمين والامتثال.</p>
            </div>
          </div>

          {/* Quick Stats of filtered logs */}
          <span className="text-[9.5px] font-black tracking-widest text-[#f59e0b] uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/10 select-none shrink-0 self-start">
            الأرشيف الميداني المتوافق مع معايير SOC2 & ISO 27001
          </span>
        </div>

        {/* Live Filter Control bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search text input */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
              <Search size={14} />
            </span>
            <input 
              type="text"
              placeholder="ابحث בסجل الأمان (الاسم، العملية، عنوان IP، التفاصيل)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-8 pl-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-brand-blue-500 rounded-xl transition-all outline-none text-xs font-semibold dark:text-white"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-105 dark:border-slate-800 px-2 rounded-xl">
            <Filter size={12} className="text-slate-400" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-transparent border-0 outline-none text-[11px] font-bold py-1.5 dark:text-white"
            >
              <option value="all">كل الأقسام 🛠️</option>
              <option value="vehicles">إدارة الأسطول 🚛</option>
              <option value="maintenance">أوامر الصيانة 🔧</option>
              <option value="inventory">مخزن القطع 📦</option>
              <option value="billing">الفوترة والـ SaaS 💳</option>
              <option value="users">المستخدمين والأمان 🔒</option>
            </select>
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-105 dark:border-slate-800 px-2 rounded-xl">
            <ShieldCheck size={12} className="text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent border-0 outline-none text-[11px] font-bold py-1.5 dark:text-white"
            >
              <option value="all">كل الحالات 🌐</option>
              <option value="نجاح">مكتمل بنجاح (نجاح) ✓</option>
              <option value="تنبيه">تنبيهات أمان (تنبيه) ⚠️</option>
              <option value="فشل">فشل محقق (فشل) ✕</option>
            </select>
          </div>
        </div>

        {/* Audit Trail List rendering */}
        <div className="pt-2">
          {filteredLogs.length > 0 ? (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-3 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/85 hover:border-slate-205 dark:hover:border-slate-700 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Status badge representing log severity */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      log.status === 'نجاح' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : log.status === 'تنبيه' 
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {log.status === 'نجاح' ? <Check size={14} /> : log.status === 'تنبيه' ? <AlertCircle size={14} /> : <Lock size={14} />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-800 dark:text-white">{log.action}</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-mono">
                          IP: {log.ipAddress}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-mono flex items-center gap-0.5">
                          <Clock size={9} /> {log.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-550 dark:text-slate-300 leading-relaxed font-sans">{log.details}</p>
                    </div>
                  </div>

                  {/* Actor details */}
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-950 p-1.5 px-3 rounded-xl border border-slate-100 dark:border-slate-850 shrink-0 select-none">
                    <span className="w-2 h-2 rounded-full bg-brand-blue-500" />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350">{log.user} ({log.role})</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-150 text-slate-405 italic text-xs">
              لا توجد عمليات امتثال أو سجلات أمان توافق المرشحات وعنوان البحث المدخل حالياً.
            </div>
          )}
        </div>
      </div>

      {/* Modal for adding custom permission */}
      {showAddPermissionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-right" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Settings2 size={16} className="text-violet-500" />
                <span>إضافة صلاحية/رخصة فرعية مخصصة</span>
              </h3>
              <button 
                onClick={() => {
                  setShowAddPermissionModal(false);
                  setNewPermissionLabel('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              قم بكتابة ميزة أو وظيفة فرعية بالورشة تود إدراجها ضمن جدول الصلاحيات للتحكم بتمكينها أو تعطيلها لكل دور.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">اسم الصلاحية أو الميزة بالكامل *</label>
              <input 
                type="text"
                required
                placeholder="مثال: السماح بإلغاء وإقفال الفواتير الكبرى"
                value={newPermissionLabel}
                onChange={(e) => setNewPermissionLabel(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 focus:border-brand-blue-500 rounded-xl transition-all outline-none dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowAddPermissionModal(false);
                  setNewPermissionLabel('');
                }}
                className="p-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (!newPermissionLabel.trim()) return;
                  const newId = `custom-perm-${Date.now()}`;
                  const newItem = {
                    id: newId,
                    label: newPermissionLabel,
                    roles: { admin: true, fleet_manager: false, technician: false, viewer: false }
                  };
                  const updatedPerms = [...permissions, newItem];
                  setPermissions(updatedPerms);
                  localStorage.setItem('saas_matrix_permissions', JSON.stringify(updatedPerms));

                  // Log action
                  const newLog: AuditLog = {
                    id: `log-${Date.now()}`,
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    user: 'المهندس خالد',
                    role: 'مدير نظام',
                    action: 'إضافة رخصة صلاحيات مخصصة',
                    category: 'users',
                    ipAddress: '197.82.16.42',
                    status: 'نجاح',
                    details: `تم حقن رخصة ترخيص فرعية جديدة بالنظام: (${newPermissionLabel}) مسندة لمدير النظام افتراضياً.`
                  };
                  setAuditLogs(logs => [newLog, ...logs]);

                  // Reset
                  setNewPermissionLabel('');
                  setShowAddPermissionModal(false);
                }}
                disabled={!newPermissionLabel.trim()}
                className="p-2 px-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-colors cursor-pointer"
              >
                تأكيد وإدراج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding granular permission */}
      {showAddGranularModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-right" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Key size={16} className="text-violet-500" />
                <span>إضافة صلاحية تفصيلية مخصصة (Granular)</span>
              </h3>
              <button 
                onClick={() => {
                  setShowAddGranularModal(false);
                  setNewGranularLabel('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              قم بكتابة قرار تشغيلي دقيق بالورشة تود فرض الرقابة عليه وتقييده لكل دور وظيفي (مثال: إذن السفر الخارجي بالمركبات).
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">اسم الإجراء أو القرار الدقيق *</label>
              <input 
                type="text"
                required
                placeholder="مثال: السماح بإلغاء أو تعديل الفواتير المكتملة"
                value={newGranularLabel}
                onChange={(e) => setNewGranularLabel(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 focus:border-violet-500 rounded-xl transition-all outline-none dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowAddGranularModal(false);
                  setNewGranularLabel('');
                }}
                className="p-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (!newGranularLabel.trim()) return;
                  const newId = `custom-granular-${Date.now()}`;
                  const newItem = {
                    id: newId,
                    label: newGranularLabel,
                    roles: { admin: true, fleet_manager: false, technician: false, viewer: false }
                  };
                  const updated = [...granularPermissions, newItem];
                  setGranularPermissions(updated);
                  localStorage.setItem('saas_granular_permissions', JSON.stringify(updated));

                  // Log action
                  const newLog: AuditLog = {
                    id: `log-${Date.now()}`,
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    user: 'المهندس خالد',
                    role: 'مدير نظام',
                    action: 'إضافة صلاحية تفصيلية مخصصة',
                    category: 'users',
                    ipAddress: '197.82.16.42',
                    status: 'نجاح',
                    details: `تم إدراج صلاحية تفصيلية جديدة بالنظام: (${newGranularLabel}) مسندة لمدير النظام افتراضياً.`
                  };
                  setAuditLogs(logs => [newLog, ...logs]);

                  setNewGranularLabel('');
                  setShowAddGranularModal(false);
                }}
                disabled={!newGranularLabel.trim()}
                className="p-2 px-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-colors cursor-pointer"
              >
                تأكيد وإدراج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
