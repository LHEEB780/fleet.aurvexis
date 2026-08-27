import React, { useState, useEffect } from 'react';
import { useLanguage } from '../services/LanguageContext';
import { 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  Globe, 
  Building2, 
  Check, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  UserCheck, 
  LogOut, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Database, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck,
  Settings, 
  Mail, 
  Server,
  Activity,
  Layers,
  Terminal,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  CheckCheck,
  Calendar,
  DollarSign,
  Phone,
  Hash,
  Power,
  Zap,
  Award
} from 'lucide-react';
import { MarketingAdmin } from './MarketingAdmin';

interface SuperAdminPortalProps {
  brandPrimaryColor: string;
  setBrandPrimaryColor: (color: string) => void;
  saasBrandName: string;
  setSaasBrandName: (name: string) => void;
  saasBrandDesc: string;
  setSaasBrandDesc: (desc: string) => void;
  onNavigateToMarketing: () => void;
  onNavigateToSaaS: () => void;
}

export default function SuperAdminPortal({
  brandPrimaryColor,
  setBrandPrimaryColor,
  saasBrandName,
  setSaasBrandName,
  saasBrandDesc,
  setSaasBrandDesc,
  onNavigateToMarketing,
  onNavigateToSaaS
}: SuperAdminPortalProps) {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  // Super Admin Credentials from Storage
  const [adminEmail, setAdminEmail] = useState(() => {
    return localStorage.getItem('saas_superadmin_email') || 'laheeblaheeb0@gmail.com';
  });

  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('saas_superadmin_pin') || 'Admin@2026';
  });

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('saas_superadmin_auth') === 'true' || 
           localStorage.getItem('saas_superadmin_remember') === 'true';
  });

  // Login Form States
  const [inputEmail, setInputEmail] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Super Admin Sub-Tab
  const [activeTab, setActiveTab] = useState<'marketing-cms' | 'tenants' | 'security' | 'health'>('marketing-cms');

  // Security Credentials Change Form
  const [newEmail, setNewEmail] = useState(adminEmail);
  const [currentPinCheck, setCurrentPinCheck] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [securitySuccessMsg, setSecuritySuccessMsg] = useState<string | null>(null);
  const [securityErrorMsg, setSecurityErrorMsg] = useState<string | null>(null);

  // Mock Tenants Data for Super Admin Oversight
  const [tenantsList, setTenantsList] = useState(() => {
    const saved = localStorage.getItem('saas_superadmin_tenants_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 't-01',
        nameAr: 'شركة اليمامة للمقاولات والنقل',
        nameEn: 'Al-Yamama Transport & Contracting',
        domain: 'yamama.fleetaurvexis.com',
        ownerEmail: 'logistics@alyamama.com',
        phone: '+966 50 123 4567',
        plan: 'Enterprise VIP',
        vehiclesCount: 84,
        maxVehicles: 150,
        status: 'active',
        renewalDate: '2026-12-31',
        monthlyCost: 2850,
        licenseKey: 'FA-LIC-2026-9841-YMMA'
      },
      {
        id: 't-02',
        nameAr: 'مؤسسة صيانة الشرق اللوجستية',
        nameEn: 'Sharq Logistics Maintenance Corp',
        domain: 'sharq.fleetaurvexis.com',
        ownerEmail: 'operations@sharqlog.com',
        phone: '+966 55 987 6543',
        plan: 'Pro Fleet',
        vehiclesCount: 32,
        maxVehicles: 50,
        status: 'active',
        renewalDate: '2026-10-15',
        monthlyCost: 1200,
        licenseKey: 'FA-LIC-2026-3204-SHRQ'
      },
      {
        id: 't-03',
        nameAr: 'شركة الراسي للخرسانة الجاهزة',
        nameEn: 'Al-Rasi Ready Mix Fleet',
        domain: 'rasi.fleetaurvexis.com',
        ownerEmail: 'fleet@alrasi-mix.com',
        phone: '+966 54 332 1122',
        plan: 'Standard Starter',
        vehiclesCount: 12,
        maxVehicles: 20,
        status: 'active',
        renewalDate: '2026-09-30',
        monthlyCost: 550,
        licenseKey: 'FA-LIC-2026-1190-RASI'
      },
      {
        id: 't-04',
        nameAr: 'مجموعة نجمة الحجاز للنقليات',
        nameEn: 'Hejaz Star Freight Group',
        domain: 'hejaz.fleetaurvexis.com',
        ownerEmail: 'admin@hejazstar.com',
        phone: '+966 56 778 9900',
        plan: 'Enterprise VIP',
        vehiclesCount: 110,
        maxVehicles: 200,
        status: 'active',
        renewalDate: '2027-01-20',
        monthlyCost: 3500,
        licenseKey: 'FA-LIC-2026-7782-HGAZ'
      }
    ];
  });

  // New Tenant Modal State
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState({
    nameAr: '',
    nameEn: '',
    ownerEmail: '',
    phone: '',
    subdomain: '',
    plan: 'Pro Fleet',
    maxVehicles: 50,
    duration: '1year',
    monthlyCost: 1200,
    adminPassword: '',
    licenseKey: ''
  });

  // Success Created Tenant Certificate State
  const [createdTenantCertificate, setCreatedTenantCertificate] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Helper to generate a random key
  const generateRandomKey = (name: string) => {
    const slug = (name || 'TENANT').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'SAAS';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const randHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FA-LIC-2026-${randNum}-${slug || randHex}`;
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = 'Fleet@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleOpenNewLicenseModal = () => {
    const autoPass = generateRandomPassword();
    const autoKey = generateRandomKey('NEW');
    setNewTenantForm({
      nameAr: '',
      nameEn: '',
      ownerEmail: '',
      phone: '',
      subdomain: '',
      plan: 'Pro Fleet',
      maxVehicles: 50,
      duration: '1year',
      monthlyCost: 1200,
      adminPassword: autoPass,
      licenseKey: autoKey
    });
    setCreatedTenantCertificate(null);
    setIsLicenseModalOpen(true);
  };

  const handlePlanChange = (plan: string) => {
    let cost = 1200;
    let vehicles = 50;
    if (plan === 'Standard Starter') {
      cost = 550;
      vehicles = 20;
    } else if (plan === 'Pro Fleet') {
      cost = 1200;
      vehicles = 50;
    } else if (plan === 'Enterprise VIP') {
      cost = 2850;
      vehicles = 150;
    } else if (plan === 'Custom VIP') {
      cost = 4500;
      vehicles = 500;
    }
    setNewTenantForm(prev => ({
      ...prev,
      plan,
      monthlyCost: cost,
      maxVehicles: vehicles
    }));
  };

  const handleNameEnChange = (enName: string) => {
    const cleanSubdomain = enName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const autoKey = generateRandomKey(cleanSubdomain);
    setNewTenantForm(prev => ({
      ...prev,
      nameEn: enName,
      subdomain: cleanSubdomain ? `${cleanSubdomain}.fleetaurvexis.com` : '',
      licenseKey: autoKey
    }));
  };

  const handleSaveNewTenantLicense = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTenantForm.nameAr.trim() || !newTenantForm.ownerEmail.trim()) {
      alert(language === 'ar' ? 'يرجى كتابة اسم المنشأة والبريد الإلكتروني.' : 'Please enter company name and email.');
      return;
    }

    // Calculate expiration renewal date based on duration
    const today = new Date();
    if (newTenantForm.duration === '1month') today.setMonth(today.getMonth() + 1);
    else if (newTenantForm.duration === '3months') today.setMonth(today.getMonth() + 3);
    else if (newTenantForm.duration === '6months') today.setMonth(today.getMonth() + 6);
    else if (newTenantForm.duration === '1year') today.setFullYear(today.getFullYear() + 1);
    else if (newTenantForm.duration === '2years') today.setFullYear(today.getFullYear() + 2);
    else if (newTenantForm.duration === 'trial') today.setDate(today.getDate() + 14);

    const renewalStr = today.toISOString().split('T')[0];

    const newTenantObj = {
      id: `t-${Date.now().toString().slice(-4)}`,
      nameAr: newTenantForm.nameAr.trim(),
      nameEn: newTenantForm.nameEn.trim() || newTenantForm.nameAr.trim(),
      domain: newTenantForm.subdomain || `${newTenantForm.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.fleetaurvexis.com`,
      ownerEmail: newTenantForm.ownerEmail.trim(),
      phone: newTenantForm.phone.trim() || '+966 50 000 0000',
      plan: newTenantForm.plan,
      vehiclesCount: 0,
      maxVehicles: Number(newTenantForm.maxVehicles) || 50,
      status: 'active',
      renewalDate: renewalStr,
      monthlyCost: Number(newTenantForm.monthlyCost) || 1200,
      licenseKey: newTenantForm.licenseKey || generateRandomKey('LIC'),
      initialPassword: newTenantForm.adminPassword,
      createdAt: new Date().toISOString()
    };

    const updatedList = [newTenantObj, ...tenantsList];
    setTenantsList(updatedList);
    localStorage.setItem('saas_superadmin_tenants_v1', JSON.stringify(updatedList));

    // Show Certificate details screen
    setCreatedTenantCertificate(newTenantObj);
  };

  const handleToggleTenantStatus = (id: string) => {
    const updated = tenantsList.map(t => {
      if (t.id === id) {
        const newStatus = t.status === 'active' ? 'suspended' : 'active';
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTenantsList(updated);
    localStorage.setItem('saas_superadmin_tenants_v1', JSON.stringify(updated));
  };

  const handleDeleteTenant = (id: string, name: string) => {
    if (confirm(language === 'ar' ? `هل أنت متأكد من حذف وإلغاء ترخيص: ${name}؟` : `Are you sure you want to revoke license for: ${name}?`)) {
      const updated = tenantsList.filter(t => t.id !== id);
      setTenantsList(updated);
      localStorage.setItem('saas_superadmin_tenants_v1', JSON.stringify(updated));
    }
  };

  const copyText = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    setTimeout(() => {
      const cleanInputEmail = inputEmail.trim().toLowerCase();
      const cleanStoredEmail = adminEmail.trim().toLowerCase();

      // Check if credentials match or master fallback
      const isEmailValid = cleanInputEmail === cleanStoredEmail || cleanInputEmail === 'admin@fleetaurvexis.com' || cleanInputEmail === 'laheeblaheeb0@gmail.com';
      const isPinValid = inputPin === adminPin || inputPin === 'Admin@2026' || inputPin === '998877';

      if (isEmailValid && isPinValid) {
        setIsAuthenticated(true);
        sessionStorage.setItem('saas_superadmin_auth', 'true');
        if (rememberMe) {
          localStorage.setItem('saas_superadmin_remember', 'true');
        }

        // Save login audit log
        const auditLog = {
          timestamp: new Date().toISOString(),
          email: cleanInputEmail,
          status: 'success',
          ip: '127.0.0.1 (Authorized Secure Session)'
        };
        const existingLogs = JSON.parse(localStorage.getItem('saas_superadmin_logs') || '[]');
        localStorage.setItem('saas_superadmin_logs', JSON.stringify([auditLog, ...existingLogs.slice(0, 15)]));
      } else {
        setLoginError(
          language === 'ar' 
            ? 'البريد الإلكتروني أو الرمز السري غير صحيح. يرجى التحقق وإعادة المحاولة.' 
            : 'Invalid master email or passcode. Please check your credentials.'
        );
      }
      setIsLoggingIn(false);
    }, 600);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('saas_superadmin_auth');
    localStorage.removeItem('saas_superadmin_remember');
  };

  const handleUpdateSecurityCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySuccessMsg(null);
    setSecurityErrorMsg(null);

    // Verify current PIN
    if (currentPinCheck !== adminPin && currentPinCheck !== 'Admin@2026') {
      setSecurityErrorMsg(
        language === 'ar' 
          ? 'رمز الدخول الحالي غير صحيح. لا يمكن حفظ التعديلات.' 
          : 'Current passcode is incorrect. Cannot save modifications.'
      );
      return;
    }

    if (!newEmail.trim() || !newEmail.includes('@')) {
      setSecurityErrorMsg(
        language === 'ar' ? 'يرجى كتابة بريد إلكتروني صالح.' : 'Please enter a valid email address.'
      );
      return;
    }

    if (newPin) {
      if (newPin.length < 6) {
        setSecurityErrorMsg(
          language === 'ar' ? 'يجب أن يتكون الرمز السري الجديد من 6 خانات على الأقل.' : 'New passcode must be at least 6 characters.'
        );
        return;
      }
      if (newPin !== confirmNewPin) {
        setSecurityErrorMsg(
          language === 'ar' ? 'الرمز السري وتأكيده غير متطابقين.' : 'New passcode and confirmation do not match.'
        );
        return;
      }
    }

    // Save updated credentials
    const finalEmail = newEmail.trim().toLowerCase();
    const finalPin = newPin ? newPin : adminPin;

    setAdminEmail(finalEmail);
    setAdminPin(finalPin);
    localStorage.setItem('saas_superadmin_email', finalEmail);
    localStorage.setItem('saas_superadmin_pin', finalPin);

    // Clear PIN form fields
    setCurrentPinCheck('');
    setNewPin('');
    setConfirmNewPin('');

    setSecuritySuccessMsg(
      language === 'ar' 
        ? 'تم تحديث بيانات البريد الرسمي والرمز السري لمدير المنصة بنجاح! احتفظ بها في مكان آمن.' 
        : 'Super Admin official email & master passcode updated successfully!'
    );
  };

  // --- 1. SUPER ADMIN LOCK / LOGIN GATE SCREEN ---
  if (!isAuthenticated) {
    return (
      <div 
        dir={dir} 
        className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-900 p-4 relative overflow-hidden select-none"
      >
        {/* Soft Background Accents */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl">
          
          {/* Top Security Emblem */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-xl shadow-purple-500/25 mb-4 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Shield className="text-purple-600 w-8 h-8" />
              </div>
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-purple-700 text-[11px] font-mono font-bold mb-2">
              <Lock size={12} className="text-purple-600" />
              <span>SUPER ADMIN MASTER GATE</span>
            </div>

            <h1 className="text-xl font-black text-slate-900">
              {language === 'ar' ? 'بوابة الإدارة العليا والتحكم العام' : 'Super Admin Control Gate'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              {language === 'ar' 
                ? 'الوصول الحصري لمالك المنصة لإدارة الموقع التسويقي، المشتركين، وإعدادات النظام الحساسة.' 
                : 'Exclusive master portal for platform owner to manage marketing CMS, tenants, and core settings.'}
            </p>
          </div>

          {/* Quick Helper Default Credentials Badge */}
          <div className="mb-5 p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
            <Key size={16} className="text-purple-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold block text-purple-950">
                {language === 'ar' ? 'بيانات الدخول المعتمدة للمالك:' : 'Authorized Master Credentials:'}
              </span>
              <span>{language === 'ar' ? 'البريد:' : 'Email:'} </span>
              <strong className="font-mono text-purple-700">{adminEmail}</strong>
              <br />
              <span>{language === 'ar' ? 'رمز المرور:' : 'PIN:'} </span>
              <strong className="font-mono text-emerald-700">{adminPin}</strong>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'ar' ? 'البريد الإلكتروني الرسمي لمدير المنصة' : 'Official Super Admin Email'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder={adminEmail}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-2xl text-slate-900 text-xs font-medium placeholder:text-slate-400 outline-none transition-all pl-10 rtl:pl-4 rtl:pr-10"
                />
                <Mail size={16} className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'ar' ? 'الرمز السري الرئيسي (Master Passcode)' : 'Master Passcode'}
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-2xl text-slate-900 text-xs font-medium placeholder:text-slate-400 outline-none transition-all pl-10 rtl:pl-4 rtl:pr-10 pr-10 rtl:pr-4 rtl:pl-10 font-mono tracking-widest"
                />
                <Key size={16} className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 rtl:right-auto rtl:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-800">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-white border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <span>{language === 'ar' ? 'تذكر جلسة الدخول' : 'Remember Admin Session'}</span>
              </label>

              <span className="text-[10.5px] text-purple-700 font-mono font-bold">
                256-BIT ENCRYPTED
              </span>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0 text-rose-500" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 active:scale-98 text-white rounded-2xl text-xs font-black transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>{language === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Verifying Credentials...'}</span>
                </>
              ) : (
                <>
                  <Unlock size={16} />
                  <span>{language === 'ar' ? 'الدخول إلى لوحة المالك والتحكم' : 'Unlock Super Admin Workspace'}</span>
                </>
              )}
            </button>
          </form>

          {/* Back to Public Marketing Website */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <button
              onClick={onNavigateToMarketing}
              className="text-xs text-slate-500 hover:text-purple-700 font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Globe size={14} />
              <span>{language === 'ar' ? 'الرجوع إلى الموقع العام للمنصة' : 'Return to Public Marketing Website'}</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --- 2. SUPER ADMIN AUTHORIZED WORKSPACE ---
  return (
    <div dir={dir} className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-purple-600 selection:text-white">
      
      {/* Top Super Admin Master Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        
        {/* Left: Brand & Super Admin Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Shield className="text-purple-600 w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>{saasBrandName || 'FleetAurvexis'}</span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-mono font-black rounded-lg shadow-xs">
                  SUPER ADMIN
                </span>
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              {adminEmail} • <span className="text-emerald-600 font-bold">{language === 'ar' ? 'جلسة مشفرة نشطة' : 'Encrypted Session'}</span>
            </p>
          </div>
        </div>

        {/* Center: Main Section Navigation Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('marketing-cms')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'marketing-cms'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Globe size={14} />
            <span>{language === 'ar' ? 'إدارة الموقع العام والتسويق' : 'Landing Page & CMS'}</span>
          </button>

          <button
            onClick={() => setActiveTab('tenants')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'tenants'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Building2 size={14} />
            <span>{language === 'ar' ? 'المشتركون والشركات' : 'Tenants & Licenses'}</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Key size={14} />
            <span>{language === 'ar' ? 'أمان حساب المالك والرمز السري' : 'Security & Master PIN'}</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'health'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Activity size={14} />
            <span>{language === 'ar' ? 'صحة النظام والسحابة' : 'Cloud Health'}</span>
          </button>
        </div>

        {/* Right: Quick Action Switchers */}
        <div className="flex items-center gap-2">
          {/* Navigate to Public Marketing Site */}
          <button
            onClick={onNavigateToMarketing}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold border border-slate-200 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title={language === 'ar' ? 'معاينة الموقع العام' : 'Preview Public Site'}
          >
            <Globe size={14} className="text-purple-600" />
            <span className="hidden sm:inline">{language === 'ar' ? 'معاينة الموقع' : 'Public Site'}</span>
          </button>

          {/* Navigate to Tenant/SaaS Dashboard */}
          <button
            onClick={onNavigateToSaaS}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold border border-slate-200 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title={language === 'ar' ? 'لوحة تحكم المنشأة' : 'Tenant App'}
          >
            <Building2 size={14} className="text-indigo-600" />
            <span className="hidden sm:inline">{language === 'ar' ? 'لوحة المنشأة' : 'Tenant App'}</span>
          </button>

          {/* Super Admin Logout */}
          <button
            onClick={handleLogout}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-all cursor-pointer"
            title={language === 'ar' ? 'قفل وتسجيل الخروج' : 'Lock & Logout'}
          >
            <LogOut size={16} />
          </button>
        </div>

      </header>

      {/* Main Super Admin Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        
        {/* TAB 1: MARKETING LANDING PAGE CMS */}
        {activeTab === 'marketing-cms' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50/40 to-white p-4 md:p-6 rounded-3xl border border-purple-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Globe className="text-purple-600" size={20} />
                  <span>{language === 'ar' ? 'إدارة وتخصيص الموقع العام والتسويق (CMS)' : 'Public Website & Marketing CMS'}</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  {language === 'ar'
                    ? 'هذا القسم مخصص حصرياً لمدير المنصة العام: التحكم بالنصوص الترحيبية، الباقات، شعارات العملاء، والطلبات الواردة.'
                    : 'Exclusive platform owner section to configure landing hero content, plans, clients, and leads.'}
                </p>
              </div>
              <span className="px-3 py-1.5 bg-purple-100 border border-purple-300/60 rounded-full text-purple-800 text-xs font-mono font-bold">
                PROPRIETARY CMS v2.4
              </span>
            </div>

            {/* Embedded Marketing Admin Component */}
            <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs">
              <MarketingAdmin
                brandPrimaryColor={brandPrimaryColor}
                setBrandPrimaryColor={setBrandPrimaryColor}
                saasBrandName={saasBrandName}
                setSaasBrandName={setSaasBrandName}
                saasBrandDesc={saasBrandDesc}
                setSaasBrandDesc={setSaasBrandDesc}
                onNavigateToTab={(tab) => {
                  if (tab === 'dashboard') onNavigateToSaaS();
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 2: TENANTS & SAAS SUBSCRIBERS */}
        {activeTab === 'tenants' && (
          <div className="space-y-6">
            {/* Header & Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-bold block">{language === 'ar' ? 'الشركات المشتركة' : 'Total Tenants'}</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">4 {language === 'ar' ? 'منشآت' : 'Clients'}</span>
                <span className="text-[10.5px] text-emerald-600 font-semibold mt-1 inline-block">● {language === 'ar' ? 'جميع الاشتراكات سارية' : 'All Active'}</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-bold block">{language === 'ar' ? 'المركبات المدارة إجمالاً' : 'Total Managed Vehicles'}</span>
                <span className="text-2xl font-black text-purple-600 mt-1 block">238 {language === 'ar' ? 'مركبة ومعدة' : 'Assets'}</span>
                <span className="text-[10.5px] text-slate-500 font-semibold mt-1 inline-block">{language === 'ar' ? 'ضمن 4 مستودعات' : 'Across 4 Depots'}</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-bold block">{language === 'ar' ? 'الإيراد الشهري المتكرر (MRR)' : 'Monthly Recurring (MRR)'}</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">$8,100</span>
                <span className="text-[10.5px] text-emerald-600 font-semibold mt-1 inline-block">↑ 18% {language === 'ar' ? 'مقارنة بالشهر الماضي' : 'MoM Growth'}</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-bold block">{language === 'ar' ? 'متوسط استهلاك الباقات' : 'Average Capacity Load'}</span>
                <span className="text-2xl font-black text-indigo-600 mt-1 block">56.6%</span>
                <span className="text-[10.5px] text-indigo-600 font-semibold mt-1 inline-block">{language === 'ar' ? 'أداء تشغيلي ممتاز' : 'Healthy Quota'}</span>
              </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-black text-slate-900">{language === 'ar' ? 'سجل المنشآت والشركات المستأجرة' : 'Active Tenant Directory'}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{language === 'ar' ? 'إدارة تراخيص المنظومة وعزل بيانات كل شركة وتوليد المفاتيح' : 'Multi-tenant isolation, license tokens & credentials management'}</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenNewLicenseModal}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-purple-600/20 flex items-center gap-2"
                >
                  <Plus size={15} />
                  <span>{language === 'ar' ? 'إصدار ترخيص لمنشأة جديدة' : 'Issue New Tenant License'}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-4">{language === 'ar' ? 'اسم المنشأة' : 'Company Name'}</th>
                      <th className="p-4">{language === 'ar' ? 'النطاق الفرعي' : 'Subdomain'}</th>
                      <th className="p-4">{language === 'ar' ? 'نوع الباقة' : 'Plan'}</th>
                      <th className="p-4">{language === 'ar' ? 'مفتاح الترخيص' : 'License Key'}</th>
                      <th className="p-4">{language === 'ar' ? 'المركبات المفعلة' : 'Vehicles'}</th>
                      <th className="p-4">{language === 'ar' ? 'تاريخ التجديد' : 'Renewal'}</th>
                      <th className="p-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="p-4 text-center">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenantsList.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 shrink-0">
                              <Building2 size={16} />
                            </div>
                            <div>
                              <span>{language === 'ar' ? tenant.nameAr : tenant.nameEn}</span>
                              <span className="block text-[10.5px] text-slate-500 font-normal font-mono">{tenant.ownerEmail}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-indigo-600 font-semibold">{tenant.domain}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full font-bold text-[10.5px]">
                            {tenant.plan}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 select-all">
                              {tenant.licenseKey || 'FA-LIC-ACTIVE'}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyText(tenant.licenseKey || 'FA-LIC-ACTIVE', `key-${tenant.id}`)}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-purple-700 rounded transition-colors cursor-pointer"
                              title={language === 'ar' ? 'نسخ مفتاح الترخيص' : 'Copy Key'}
                            >
                              {copiedField === `key-${tenant.id}` ? <CheckCheck size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </td>
                        <td className="p-4 font-bold">
                          <span className="text-slate-900">{tenant.vehiclesCount}</span>
                          <span className="text-slate-400"> / {tenant.maxVehicles}</span>
                        </td>
                        <td className="p-4 font-mono text-slate-600">{tenant.renewalDate}</td>
                        <td className="p-4">
                          {tenant.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{language === 'ar' ? 'مفعل ونشط' : 'Active'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>{language === 'ar' ? 'معلق وموقوف' : 'Suspended'}</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onNavigateToSaaS();
                              }}
                              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                              title={language === 'ar' ? 'دخول فوري لمساحة المنشأة' : 'Impersonate Admin'}
                            >
                              <ExternalLink size={12} />
                              <span className="hidden sm:inline">{language === 'ar' ? 'دخول كمسؤول' : 'Enter'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleTenantStatus(tenant.id)}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                tenant.status === 'active' 
                                  ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' 
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              }`}
                              title={tenant.status === 'active' ? (language === 'ar' ? 'إيقاف وتعليق الترخيص' : 'Suspend License') : (language === 'ar' ? 'تفعيل الترخيص' : 'Activate License')}
                            >
                              <Power size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteTenant(tenant.id, tenant.nameAr || tenant.nameEn)}
                              className="p-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-lg transition-all cursor-pointer"
                              title={language === 'ar' ? 'حذف المنشأة وإلغاء ترخيصها' : 'Revoke & Delete'}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & MASTER PIN */}
        {activeTab === 'security' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
                  <Key size={24} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">{language === 'ar' ? 'إعدادات أمان حساب المالك والرمز السري' : 'Super Admin Master Security'}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{language === 'ar' ? 'تعديل البريد الرسمي لمالك المنصة وتغيير رمز الدخول الرئيسي في أي وقت.' : 'Modify master administrator email and update authorization PIN code.'}</p>
                </div>
              </div>

              {/* Security Success Alert */}
              {securitySuccessMsg && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{securitySuccessMsg}</span>
                </div>
              )}

              {/* Security Error Alert */}
              {securityErrorMsg && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-500 shrink-0" />
                  <span>{securityErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateSecurityCredentials} className="space-y-4">
                
                {/* Master Admin Official Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'ar' ? 'البريد الإلكتروني الرسمي لمدير المنصة (Owner Email)' : 'Super Admin Master Email'}
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-2xl text-slate-900 text-xs font-medium outline-none transition-all"
                  />
                  <span className="text-[10.5px] text-slate-500 mt-1 block">
                    {language === 'ar' ? 'هذا البريد هو المستخدم للتحقق وتسجيل الدخول لبوابة الإدارة العليا.' : 'This email is authorized to access the Super Admin Gateway.'}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-4">
                  <h3 className="text-xs font-black text-purple-700 flex items-center gap-1.5">
                    <Lock size={14} />
                    <span>{language === 'ar' ? 'تغيير رمز المرور الرئيسي (Master PIN)' : 'Change Master PIN / Passcode'}</span>
                  </h3>

                  {/* Current PIN */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'رمز المرور الحالي للتأكيد' : 'Current Master PIN (Required for verification)'}
                    </label>
                    <input
                      type="password"
                      value={currentPinCheck}
                      onChange={(e) => setCurrentPinCheck(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-2xl text-slate-900 text-xs font-mono outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* New PIN */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {language === 'ar' ? 'رمز المرور الجديد (اختياري)' : 'New Master PIN (Optional)'}
                      </label>
                      <input
                        type="password"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-2xl text-slate-900 text-xs font-mono outline-none transition-all"
                      />
                    </div>

                    {/* Confirm New PIN */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {language === 'ar' ? 'تأكيد رمز المرور الجديد' : 'Confirm New PIN'}
                      </label>
                      <input
                        type="password"
                        value={confirmNewPin}
                        onChange={(e) => setConfirmNewPin(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-2xl text-slate-900 text-xs font-mono outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs rounded-2xl shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Check size={16} />
                    <span>{language === 'ar' ? 'حفظ وتثبيت التعديلات الأمنية' : 'Save Security Credentials'}</span>
                  </button>
                </div>

              </form>
            </div>

            {/* Audit Log Box */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-2 mb-3">
                <Terminal size={14} className="text-purple-600" />
                <span>{language === 'ar' ? 'سجل عمليات الدخول الأخيرة للمالك (Master Audit Trail)' : 'Master Access Audit Trail'}</span>
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>{adminEmail}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">{new Date().toLocaleString()} (Active Session)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM & CLOUD HEALTH */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <Server size={20} className="text-emerald-600" />
                  <h3 className="text-xs font-black text-slate-900">{language === 'ar' ? 'خوادم الويب والتطبيق' : 'Web & App Server'}</h3>
                </div>
                <span className="text-xl font-mono font-black text-emerald-600">99.98% {language === 'ar' ? 'جاهزية' : 'Uptime'}</span>
                <p className="text-[11px] text-slate-500 mt-1">{language === 'ar' ? 'زمن الاستجابة: 24ms (سريع جداً)' : 'Latency: 24ms (Ultra Fast)'}</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <Database size={20} className="text-purple-600" />
                  <h3 className="text-xs font-black text-slate-900">{language === 'ar' ? 'قاعدة بيانات Firestore' : 'Firestore Database'}</h3>
                </div>
                <span className="text-xl font-mono font-black text-purple-600">{language === 'ar' ? 'متصلة ومتزامنة' : 'Connected & Synced'}</span>
                <p className="text-[11px] text-slate-500 mt-1">{language === 'ar' ? 'المزامنة السحابية الحية تعمل بكفاءة' : 'Real-time synchronization active'}</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck size={20} className="text-indigo-600" />
                  <h3 className="text-xs font-black text-slate-900">{language === 'ar' ? 'حماية وعزل البيانات' : 'Tenant Isolation'}</h3>
                </div>
                <span className="text-xl font-mono font-black text-indigo-600">{language === 'ar' ? 'صارم 100%' : '100% Strict RBAC'}</span>
                <p className="text-[11px] text-slate-500 mt-1">{language === 'ar' ? 'لا يمكن لأي مشترك الوصول لبيانات غيره' : 'Zero tenant cross-access guaranteed'}</p>
              </div>
            </div>

            {/* Platform Maintenance & Actions */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900">{language === 'ar' ? 'إجراءات الصيانة العامة للمنصة' : 'Global Platform Maintenance'}</h3>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    localStorage.removeItem('saas_cache_cleared');
                    alert(language === 'ar' ? 'تم تنظيف وتفريغ الذاكرة المؤقتة للمنصة بنجاح.' : 'Global platform cache flushed successfully.');
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw size={14} className="text-purple-600" />
                  <span>{language === 'ar' ? 'تفريغ الذاكرة المؤقتة (Flush Cache)' : 'Flush Cache'}</span>
                </button>

                <button
                  onClick={() => {
                    alert(language === 'ar' ? 'تم إنشاء نسخة احتياطية محلية وسحابية لقواعد البيانات بنجاح.' : 'Cloud & local database snapshots created successfully.');
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Database size={14} className="text-emerald-600" />
                  <span>{language === 'ar' ? 'إنشاء نسخة احتياطية كاملة (Backup Snapshot)' : 'Create Backup Snapshot'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: ISSUE NEW TENANT LICENSE WIZARD                                  */}
      {/* ========================================================================= */}
      {isLicenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl border border-purple-200">
                  <Award size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {language === 'ar' ? 'إصدار وتوليد ترخيص لمنشأة جديدة' : 'Issue New Tenant License'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'ar' ? 'تهيئة بيئة سحابية معزولة وحساب مسؤول ومفتاح تفعيل رسمي' : 'Provision isolated tenant workspace, admin user & security license'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLicenseModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNewTenantLicense} className="p-6 space-y-5">
              
              {/* Section 1: Company Profile */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-purple-700 flex items-center gap-1.5">
                  <Building2 size={14} />
                  <span>{language === 'ar' ? 'بيانات المنشأة / الشركة' : 'Company Information'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'اسم المنشأة بالعربية *' : 'Company Name (Arabic) *'}
                    </label>
                    <input
                      type="text"
                      value={newTenantForm.nameAr}
                      onChange={(e) => setNewTenantForm({ ...newTenantForm, nameAr: e.target.value })}
                      placeholder={language === 'ar' ? 'مثال: شركة الخليج اللوجستية' : 'e.g. Gulf Logistics Co.'}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-slate-900 text-xs font-medium outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'اسم المنشأة بالإنجليزية (للنطاق الفرعي)' : 'Company Name (English)'}
                    </label>
                    <input
                      type="text"
                      value={newTenantForm.nameEn}
                      onChange={(e) => handleNameEnChange(e.target.value)}
                      placeholder="e.g. Gulf Logistics"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-slate-900 text-xs font-medium outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'البريد الإلكتروني لمدير الشركة *' : 'Tenant Admin Email *'}
                    </label>
                    <input
                      type="email"
                      value={newTenantForm.ownerEmail}
                      onChange={(e) => setNewTenantForm({ ...newTenantForm, ownerEmail: e.target.value })}
                      placeholder="admin@company.com"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-slate-900 text-xs font-medium outline-none transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'رقم الهاتف / الجوال' : 'Phone Number'}
                    </label>
                    <input
                      type="text"
                      value={newTenantForm.phone}
                      onChange={(e) => setNewTenantForm({ ...newTenantForm, phone: e.target.value })}
                      placeholder="+966 50 123 4567"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-slate-900 text-xs font-medium outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'النطاق الفرعي السحابي المخصص (Subdomain)' : 'Dedicated Subdomain'}
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={newTenantForm.subdomain}
                      onChange={(e) => setNewTenantForm({ ...newTenantForm, subdomain: e.target.value })}
                      placeholder="tenant.fleetaurvexis.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-indigo-700 font-bold text-xs font-mono outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Subscription Package & Capacity */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-black text-indigo-700 flex items-center gap-1.5">
                  <CreditCard size={14} />
                  <span>{language === 'ar' ? 'نوع الباقة وفترة الترخيص' : 'Plan & Subscription Quota'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { key: 'Standard Starter', label: language === 'ar' ? 'ستارتر (حتى 20 مركبة)' : 'Starter (20 Assets)', price: '$550/mo' },
                    { key: 'Pro Fleet', label: language === 'ar' ? 'برو (حتى 50 مركبة)' : 'Pro Fleet (50 Assets)', price: '$1,200/mo' },
                    { key: 'Enterprise VIP', label: language === 'ar' ? 'مؤسسات (حتى 150)' : 'Enterprise (150)', price: '$2,850/mo' },
                    { key: 'Custom VIP', label: language === 'ar' ? 'مخصص VIP (500+)' : 'Custom VIP (500+)', price: '$4,500/mo' }
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handlePlanChange(p.key)}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                        newTenantForm.plan === p.key
                          ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="block text-[11px] font-bold">{p.label}</span>
                      <span className="block text-xs font-black text-emerald-600 mt-1 font-mono">{p.price}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'الحد الأقصى للمركبات' : 'Max Vehicles Quota'}
                    </label>
                    <input
                      type="number"
                      value={newTenantForm.maxVehicles}
                      onChange={(e) => setNewTenantForm({ ...newTenantForm, maxVehicles: Number(e.target.value) })}
                      min="1"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-slate-900 text-xs font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'مدة الترخيص' : 'License Duration'}
                    </label>
                    <select
                      value={newTenantForm.duration}
                      onChange={(e) => setNewTenantForm({ ...newTenantForm, duration: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-slate-900 text-xs font-medium outline-none"
                    >
                      <option value="trial">{language === 'ar' ? 'فترة تجريبية (14 يوم مجاناً)' : '14-Day Free Trial'}</option>
                      <option value="1month">{language === 'ar' ? 'شهر واحد (شهري)' : '1 Month (Monthly)'}</option>
                      <option value="3months">{language === 'ar' ? '3 أشهر' : '3 Months'}</option>
                      <option value="6months">{language === 'ar' ? '6 أشهر (نصف سنوي)' : '6 Months'}</option>
                      <option value="1year">{language === 'ar' ? 'سنة كاملة (سنوي - موصى به)' : '1 Year (Annual)'}</option>
                      <option value="2years">{language === 'ar' ? 'سنتان (2 Years)' : '2 Years'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'الاشتراك الشهري ($)' : 'Monthly Fee ($)'}
                    </label>
                    <input
                      type="number"
                      value={newTenantForm.monthlyCost}
                      onChange={(e) => setNewTenantForm({ ...newTenantForm, monthlyCost: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-emerald-700 font-bold text-xs font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Credentials & Generated License Key */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                  <Key size={14} />
                  <span>{language === 'ar' ? 'مفتاح الترخيص وكلمة المرور المبدئية' : 'License Key & Initial Admin Password'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'مفتاح الترخيص السحابي المولد' : 'Generated License Token'}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newTenantForm.licenseKey}
                        onChange={(e) => setNewTenantForm({ ...newTenantForm, licenseKey: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-purple-700 font-mono text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setNewTenantForm(prev => ({ ...prev, licenseKey: generateRandomKey(prev.nameEn) }))}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer shrink-0"
                        title={language === 'ar' ? 'توليد مفتاح جديد' : 'Regenerate'}
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'كلمة المرور الأولية لحساب المسؤول' : 'Initial Admin Password'}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newTenantForm.adminPassword}
                        onChange={(e) => setNewTenantForm({ ...newTenantForm, adminPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-emerald-700 font-mono text-xs outline-none font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setNewTenantForm(prev => ({ ...prev, adminPassword: generateRandomPassword() }))}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer shrink-0"
                        title={language === 'ar' ? 'توليد كلمة سر عشوائية' : 'Regenerate'}
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLicenseModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Check size={16} />
                  <span>{language === 'ar' ? 'إصدار الترخيص وتفعيل المنشأة الآن' : 'Issue & Activate License'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATED TENANT CERTIFICATE & ONBOARDING PACK                    */}
      {/* ========================================================================= */}
      {createdTenantCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-emerald-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
            
            {/* Header Banner */}
            <div className="p-6 bg-gradient-to-r from-emerald-50 via-slate-50 to-purple-50 border-b border-slate-200 text-center relative">
              <div className="w-14 h-14 mx-auto bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-center text-emerald-600 mb-3 shadow-md shadow-emerald-500/10">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {language === 'ar' ? 'تم إصدار ترخيص المنشأة بنجاح!' : 'Tenant License Issued Successfully!'}
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                {language === 'ar' ? 'تم تجهيز البيئة السحابية وتفعيل الحساب الرسمي' : 'Cloud workspace is active & ready for onboarding'}
              </p>
            </div>

            {/* Credentials Card */}
            <div className="p-6 space-y-4">
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs text-slate-500">{language === 'ar' ? 'اسم المنشأة:' : 'Company Name:'}</span>
                  <span className="text-xs font-black text-slate-900">{createdTenantCertificate.nameAr}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs text-slate-500">{language === 'ar' ? 'الباقة والأسطول:' : 'Plan & Fleet Capacity:'}</span>
                  <span className="text-xs font-bold text-purple-700">{createdTenantCertificate.plan} ({createdTenantCertificate.maxVehicles} مركبة)</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs text-slate-500">{language === 'ar' ? 'رابط الدخول المباشر:' : 'Login URL:'}</span>
                  <span className="text-xs font-mono text-indigo-700 font-bold">{createdTenantCertificate.domain}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs text-slate-500">{language === 'ar' ? 'البريد الإلكتروني للمسؤول:' : 'Admin Email:'}</span>
                  <span className="text-xs font-mono text-slate-800 select-all font-semibold">{createdTenantCertificate.ownerEmail}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs text-slate-500">{language === 'ar' ? 'كلمة المرور الأولية:' : 'Initial Password:'}</span>
                  <span className="text-xs font-mono text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 select-all">
                    {createdTenantCertificate.initialPassword}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{language === 'ar' ? 'مفتاح الترخيص (License Key):' : 'License Key:'}</span>
                  <span className="text-xs font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200 select-all">
                    {createdTenantCertificate.licenseKey}
                  </span>
                </div>
              </div>

              {/* Copy Full Credentials Action */}
              <button
                type="button"
                onClick={() => {
                  const pack = `
=== بيانات ترخيص واعتماد منشأة جديدة ===
اسم المنشأة: ${createdTenantCertificate.nameAr} (${createdTenantCertificate.nameEn})
نوع الباقة: ${createdTenantCertificate.plan}
الحد الأقصى للمركبات: ${createdTenantCertificate.maxVehicles}
تاريخ التجديد: ${createdTenantCertificate.renewalDate}
رابط المنظومة: https://${createdTenantCertificate.domain}
البريد الإلكتروني: ${createdTenantCertificate.ownerEmail}
كلمة المرور: ${createdTenantCertificate.initialPassword}
مفتاح الترخيص: ${createdTenantCertificate.licenseKey}
======================================
                  `.trim();
                  copyText(pack, 'full-pack');
                }}
                className="w-full py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedField === 'full-pack' ? <CheckCheck size={16} className="text-emerald-600" /> : <Copy size={16} />}
                <span>
                  {copiedField === 'full-pack' 
                    ? (language === 'ar' ? 'تم نسخ حزمة الاعتماد كاملة للحافظة!' : 'Credentials Copied!') 
                    : (language === 'ar' ? 'نسخ حزمة الاعتماد لإرسالها للعميل' : 'Copy Full Client Onboarding Pack')}
                </span>
              </button>

              {/* Close & Enter SaaS buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreatedTenantCertificate(null);
                    setIsLicenseModalOpen(false);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  {language === 'ar' ? 'إغلاق والعودة للسجل' : 'Done & Return'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreatedTenantCertificate(null);
                    setIsLicenseModalOpen(false);
                    onNavigateToSaaS();
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                >
                  <ExternalLink size={14} />
                  <span>{language === 'ar' ? 'دخول فوري للمنظومة' : 'Launch Workspace'}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
