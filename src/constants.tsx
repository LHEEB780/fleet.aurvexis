import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Wrench, 
  Users, 
  Warehouse, 
  BarChart3,
  Building2,
  Calendar,
  CreditCard,
  ShieldCheck,
  Handshake,
  IdCard,
  Globe2,
  ClipboardCheck,
  Bot,
  Cloud,
  Briefcase,
  Video
} from 'lucide-react';
import { UserRole } from './types';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  group: 'command' | 'operations' | 'engineering' | 'logistics' | 'governance';
}

export const MENU_ITEMS: MenuItem[] = [
  // 1. القيادة والتحكم الإستراتيجي (Command & Control)
  { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={16} />, roles: ['admin', 'technician', 'viewer'], group: 'command' },
  { id: 'maintenance-bot', label: 'مركز التحكم بوكلاء الـ AI', icon: <Bot size={16} />, roles: ['admin', 'technician', 'viewer'], group: 'command' },
  { id: 'video-tutorials', label: 'مكتبة الفيديوهات والشروحات', icon: <Video size={16} />, roles: ['admin', 'technician', 'viewer'], group: 'command' },
  { id: 'reports', label: 'التقارير والإحصائيات', icon: <BarChart3 size={16} />, roles: ['admin', 'viewer'], group: 'command' },

  // 2. إدارة الحركة والعمليات (Fleet Operations)
  { id: 'projects', label: 'إدارة المشاريع والعمليات', icon: <Briefcase size={16} />, roles: ['admin', 'technician', 'viewer'], group: 'operations' },
  { id: 'vehicles', label: 'إدارة المعدات والمركبات', icon: <Truck size={16} />, roles: ['admin', 'technician', 'viewer'], group: 'operations' },
  { id: 'drivers', label: 'إدارة السائقين والتفويضات', icon: <IdCard size={16} />, roles: ['admin', 'technician', 'viewer'], group: 'operations' },
  { id: 'driver-handover', label: 'تسليم واستلام العجلات الفني', icon: <ClipboardCheck size={16} />, roles: ['admin', 'technician', 'viewer'], group: 'operations' },

  // 3. إدارة الهندسة والصيانة الفنية (Mechanical Engineering & Maintenance)
  { id: 'workshops', label: 'إدارة الورش والضغط الميداني', icon: <Building2 size={16} />, roles: ['admin', 'technician', 'viewer'], group: 'engineering' },
  { id: 'maintenance', label: 'إدارة أوامر الصيانة', icon: <Wrench size={16} />, roles: ['admin', 'technician', 'viewer'], group: 'engineering' },
  { id: 'external-maintenance', label: 'إدارة الصيانة الخارجية', icon: <Wrench size={16} />, roles: ['admin', 'technician', 'viewer'], group: 'engineering' },
  { id: 'periodic-maintenance', label: 'إدارة الصيانة الدورية', icon: <Calendar size={16} />, roles: ['admin', 'technician', 'viewer'], group: 'engineering' },
  { id: 'technicians', label: 'إدارة الفنيين والعاملين', icon: <Users size={16} />, roles: ['admin'], group: 'engineering' },

  // 4. إدارة التموين وسلاسل الإمداد (Supply Chain & Logistics)
  { id: 'inventory', label: 'إدارة المخزن والقطع', icon: <Warehouse size={16} />, roles: ['admin', 'technician'], group: 'logistics' },
  { id: 'vendors', label: 'إدارة الموردين والتوريد', icon: <Handshake size={16} />, roles: ['admin', 'technician'], group: 'logistics' },

  // 5. الحوكمة والتفتيش والأمان (Governance & Compliance)
  { id: 'security-audit', label: 'صلاحيات الموظفين والامتثال', icon: <ShieldCheck size={16} />, roles: ['admin'], group: 'governance' },
  { id: 'firebase-sync', label: 'بوابة المزامنة والربط السحابي (Firebase)', icon: <Cloud size={16} />, roles: ['admin'], group: 'governance' },
  { id: 'saas-billing', label: 'إدارة الاشتراك والفوترة', icon: <CreditCard size={16} />, roles: ['admin'], group: 'governance' },
];
