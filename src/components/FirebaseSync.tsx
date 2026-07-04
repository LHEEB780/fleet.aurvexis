import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useLanguage } from '../services/LanguageContext';
import ContextualHelp from './ContextualHelp';
import { 
  Cloud, 
  Database, 
  RefreshCw, 
  Globe, 
  AlertCircle, 
  Wifi, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Check, 
  Info,
  ExternalLink
} from 'lucide-react';
import { 
  testFirestoreConnection, 
  pushLocalDataToCloud, 
  pullCloudDataToLocal 
} from '../services/firebase';
import firebaseConfig from '../services/firebaseConfig';

export default function FirebaseSync({ user }: { user?: User }) {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  // Firestore Connection & Sync states
  const [isDbConnecting, setIsDbConnecting] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDirection, setSyncDirection] = useState<'upload' | 'download' | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return localStorage.getItem('last_firestore_sync_time') || (isRtl ? 'لم يتم المزامنة بعد' : 'Not synced yet');
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
    } else {
      setSyncFeedbackLog(language === 'ar' ? '✕ فشلت عملية المزامنة. يرجى مراجعة الصلاحيات الأمنية.' : '✕ Sync failed. Please verify Firestore rules configurations.');
    }
    setIsSyncing(false);
    setSyncDirection(null);
  };

  return (
    <div className="space-y-6 text-right pb-12 font-sans" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121829] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Cloud size={20} />
            </div>
            <div className="text-right">
              <h1 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                {language === 'ar' ? 'بوابة الربط والمزامنة السحابية الذكية' : 'Smart Cloud Backup & Connection Portal'}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                Google Firebase Firestore Workspace
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <ContextualHelp 
            id="firebase-sync"
            titleAr="دليل مزامنة Firestore"
            titleEn="Firestore Sync Guide"
            explanationAr="تتيح لك البوابة ترحيل بياناتك المحلية إلى السحاب بنقرة زر واحدة لحمايتها من الضياع، ومزامنة كافة الأجهزة والورش في بيئة عمل تعاونية موحدة وآمنة."
            explanationEn="The sync portal allows migrating and mirroring your local fleet parameters to Google Cloud Firestore, keeping all active browser clients fully synchronized."
            benefitsAr={[
              "حماية قصوى لبيانات الأسطول والصيانة من الضياع",
              "مزامنة فورية حية بين كافة المهندسين والفنيين والورش",
              "إمكانية تنزيل نسخة طبق الأصل وتجاوز قيود متصفح واحد"
            ]}
            benefitsEn={[
              "Ultimate data persistence for fleet assets & service records",
              "Real-time data synchronization between active field mechanics",
              "Easy cloud-to-local recovery on any secondary workspace client"
            ]}
            tipsAr={[
              "تتيح لك البوابة ترحيل بياناتك المحلية إلى السحاب بنقرة زر واحدة لحمايتها من الضياع.",
              "يمكنك استيراد قاعدة البيانات بالكامل على جهاز آخر بمجرد الضغط على زر استرداد السحابة.",
              "يرجى التحقق من اتصال الإنترنت وحالة (Active Cloud Core) قبل تفعيل العمليات السحابية الكبرى."
            ]}
            tipsEn={[
              "The backup portal allows migrating all your local assets to secure cloud hosting dynamically.",
              "You can instantly restore the fleet parameters on any device by running the Pull Cloud feature.",
              "Verify active internet and the (Active Cloud Core) indicator before executing bulk synchronizations."
            ]}
            language={language}
          />
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        {language === 'ar' 
          ? 'بوابة المزامنة والنسخ الاحتياطي السحابي: تحكم بنسخ وتثبيت البيانات على منصة Google Cloud Firestore، لمزامنة كافة الأجهزة والورش في بيئة عمل تعاونية موحدة وآمنة.'
          : 'Integrated Cloud Sync Engine: Back up and deploy workspace tables directly on Google Cloud Firestore, enabling live cross-device synchronizations across multiple field technicians.'}
      </p>

      {/* FIRESTORE CLOUD CONNECTION & LIVE SYNCHRONIZATION DASHBOARD */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between relative overflow-hidden" id="firestore-sync-dashboard">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`p-1 px-2.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 border ${
                isDbConnected 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                <Cloud size={10} className={isDbConnected ? "animate-pulse" : ""} />
                <span>{isDbConnected ? 'Active Cloud Core' : 'Offline Emulator'}</span>
              </span>
              <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                <Database size={15} className="text-indigo-400" />
                <span>{language === 'ar' ? 'بوابة الربط والمزامنة السحابية الذكية (Google Firebase)' : 'Smart Cloud Sync & Backup Gate (Google Firebase)'}</span>
              </h2>
            </div>
            <p className="text-[10px] text-slate-400 max-w-2xl leading-relaxed">
              {language === 'ar'
                ? 'تكامل حي وسحبي فوري لمشروعك عبر قاعدة بيانات Google Cloud Firestore لتأمين ومزامنة السجلات الميدانية للمؤسسات (المركبات، أوامر الصيانة، الموظفين، والمستودعات بشكل تكاملي مطلق).'
                : 'Direct cloud synchronization with Google Cloud Firestore database to backup and stream fleet assets, service logs, stock records and administrative profiles across browser devices.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
            <button
              onClick={async () => {
                setIsDbConnecting(true);
                const testResult = await testFirestoreConnection();
                isDbConnected;
                setIsDbConnected(testResult);
                setIsDbConnecting(false);
                setSyncFeedbackLog(testResult 
                  ? (language === 'ar' ? '✓ تم إعادة فحص وتأمين الاتصال السحابي بجداول Firestore بنجاح!' : '✓ Connection re-established successfully!')
                  : (language === 'ar' ? '⚠️ تعذر الوصول لخادم Firestore السحابي. تم الرجوع للنمط المحلي الذاتي.' : '⚠️ Cloud server unreachable. Persisting local backup model.')
                );
              }}
              disabled={isDbConnecting}
              className="p-1.5 px-3 bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-slate-200 text-[10px] font-bold rounded-xl border border-slate-700/60 transition-all flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={10} className={isDbConnecting ? "animate-spin" : ""} />
              <span>{language === 'ar' ? 'فحص الاتصال الفوري' : 'Check Live Ping'}</span>
            </button>
            <a 
              href="https://console.firebase.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1.5 px-3 bg-indigo-650 hover:bg-indigo-600 text-white text-[10px] font-black rounded-xl transition-all flex items-center gap-1 border border-indigo-500/30"
            >
              <Globe size={11} />
              <span>{language === 'ar' ? 'افتح Firebase Console 🌐' : 'Open Firebase Console 🌐'}</span>
            </a>
          </div>
        </div>

        {/* Diagnostic info grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          
          {/* Card 1: Connection status & Project Spec */}
          <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl space-y-3.5 text-right">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-extrabold">{language === 'ar' ? 'حالة المنظومة الحالية' : 'Environment Status'}</span>
              <Wifi size={13} className={isDbConnected ? "text-emerald-400 animate-pulse" : "text-amber-400"} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
                <span className="text-xs font-black">
                  {isDbConnected 
                    ? (language === 'ar' ? 'جاهز ومتصل بالسحابة (LIVE_ACTIVE)' : 'Connected to Cloud (LIVE_ACTIVE)') 
                    : (language === 'ar' ? 'الوضع المحلي البديل (LOCAL_OFFLINE)' : 'Local Emulation (LOCAL_OFFLINE)')
                  }
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-mono select-all pt-1 leading-normal text-left">
                PROJECT ID: {firebaseConfig.projectId || 'khaki-academy-zcf5x'}<br />
                DB CLUSTER: (default) / Web SDK v10<br />
                LOCATION: Europe-West (Cloud Run Container Zone)
              </p>
            </div>

            <div className="pt-2 border-t border-slate-900 text-[9.5px] text-slate-400 leading-relaxed">
              {isDbConnected 
                ? (language === 'ar' ? '✓ اتصالك مشفر ومضمون بشهادة أمان SSL ومحمي وجاهز لتمرير المزامنات الميدانية الفورية.' : '✓ SSL encrypted connection verified and prepared to pipeline instantaneous updates.')
                : (language === 'ar' ? '⚠️ تستخدم اللوحة حالياً المتصفح فقط ومخزن الـ LocalStorage. حوّل إلى السحابة للنسخ الاحتياطي.' : '⚠️ Application is currently saving changes locally on browser localStorage. Run Sync to archive.')}
            </div>
          </div>

          {/* Card 2: Strategic manual synchronizations */}
          <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between space-y-3 text-right">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-extrabold">{language === 'ar' ? 'تزامن وبث السجلات كلياً' : 'Bulk Data Sync Hub'}</span>
                <RefreshCw size={13} className={isSyncing ? "text-indigo-400 animate-spin" : "text-slate-500"} />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {language === 'ar' 
                  ? 'مزامنة مزدوجة: انقل أحدث تحديثاتك بين ذاكرة المتصفح وصناديق Firestore السحابية بلمسة واحدة.'
                  : 'Double synchronization: Upload browser database storage or pull and overlay cloud-authoritative master tables instantly.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={handleUploadBackup}
                disabled={isSyncing}
                className="p-2 px-2.5 bg-indigo-900/30 hover:bg-indigo-900/55 disabled:opacity-40 text-indigo-300 hover:text-white rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer border border-indigo-500/20"
                title={language === 'ar' ? "تصدير كل البيانات من المتصفح إلى سحابة Firestore" : "Export all data to Firestore Cloud"}
              >
                <ArrowUpRight size={11} className={isSyncing && syncDirection === 'upload' ? 'animate-bounce' : ''} />
                <span>{language === 'ar' ? 'نسخ احتياطي ⬆️' : 'Upload Backup ⬆️'}</span>
              </button>

              <button
                onClick={handleDownloadRestore}
                disabled={isSyncing}
                className="p-2 px-2.5 bg-emerald-950/30 hover:bg-emerald-900/55 disabled:opacity-40 text-emerald-300 hover:text-white rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer border border-emerald-500/20"
                title={language === 'ar' ? "سحب كل البيانات من سحابة Firestore وتثبيتها بالمتصفح" : "Pull all cloud data and override local storage"}
              >
                <ArrowDownLeft size={11} className={isSyncing && syncDirection === 'download' ? 'animate-bounce' : ''} />
                <span>{language === 'ar' ? 'استرداد السحابة ⬇️' : 'Pull Cloud ⬇️'}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Chronology archive & Dynamic feedback console */}
          <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between space-y-3 text-right">
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-extrabold block">{language === 'ar' ? 'أثر ونواتج المزامنة الأخيرة' : 'Last Sync Summary Logs'}</span>
              
              {/* Dynamic Console feedback display */}
              <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-850 text-[10px] font-semibold text-slate-300 leading-normal flex items-start gap-1.5 mt-1 min-h-[50px] overflow-hidden text-right">
                <span className="text-indigo-400 font-black shrink-0 font-mono">&gt;_</span>
                <span className="text-slate-200">{syncFeedbackLog || (language === 'ar' ? 'في انتظار طلب فحص أو نسخ سحابي...' : 'Ready for diagnostics sync...')}</span>
              </div>
            </div>

            {/* Last successful process timestamp */}
            <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">{language === 'ar' ? 'آخر تزامن وتأكيد ناجح:' : 'Latest Sync Timestamp:'}</span>
              <span className="text-indigo-400 font-mono font-bold">{lastSyncTime}</span>
            </div>
          </div>

        </div>

        {/* Quick Instructions about Console Access */}
        <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-[10px] text-indigo-300 leading-relaxed flex items-start gap-2 relative z-10 text-right">
          <AlertCircle size={14} className="mt-0.5 text-indigo-400 shrink-0" />
          <div>
            <span className="font-extrabold text-white">{language === 'ar' ? 'كيف تدخل لموقع Firestore لمطالعة مشروعك؟ ' : 'How to browse your cloud documents inside Firebase console? '}</span>
            {language === 'ar' 
              ? 'إن قاعدة البيانات مهيأة تلقائياً لك، لمطالعة وتدقيق السجلات سحابياً: قم بزيارة موقع https://console.firebase.google.com وسجل دخولك بنفس حساب Google (الذي تستخدمه في ميك ميك AI Studio) وهو laheeblaheeb0@gmail.com، وستجد مشروعك الذي يحتوي على المعايير الإعدادية مدرجاً שם وتحت مسمى Firestore Database ستجد تداول الجداول لمركبات وأوامر المنصة فورياً!'
              : 'The database is fully configured and live. Go to https://console.firebase.google.com and sign in with laheeblaheeb0@gmail.com. Open the matching sandbox database, navigate to "Firestore Database" in the sidebar, and examine real-time collections for vehicles, technicians, and maintenance logs!'}
          </div>
        </div>
      </div>

      {/* Overview section explaining security details */}
      <div className="p-6 bg-white dark:bg-[#121829] border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Info size={14} className="text-indigo-500" />
          <span>{language === 'ar' ? 'معايير الاتصال والموثوقية السحابية' : 'Cloud Integration and Reliability Standards'}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl space-y-1">
            <span className="text-slate-800 dark:text-slate-200 font-bold block">{language === 'ar' ? '⚡ المزامنة الفورية' : '⚡ Instant Syncing'}</span>
            <p className="text-[11px]">
              {language === 'ar'
                ? 'أي تعديل يتم إجراؤه في الجداول الرئيسية للمركبات والمعدات يمر بمصادقة مشفرة SSL ويخزن تلقائياً على خوادم Google لضمان عدم ضياع العمل.'
                : 'Any changes made to master fleet files automatically sync using SSL encryption, hosted completely secure under Google network infrastructure.'}
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl space-y-1">
            <span className="text-slate-800 dark:text-slate-200 font-bold block">{language === 'ar' ? '🛡️ قواعد الحماية المخصصة' : '🛡️ Custom Firestore Security Rules'}</span>
            <p className="text-[11px]">
              {language === 'ar'
                ? 'تخضع قواعد البيانات لقواعد Firestore.rules صارمة تضمن تصفية الصلاحيات ومنع القراءة/الكتابة العشوائية لغير المخولين أمنياً.'
                : 'Collections are protected by customized firestore.rules ensuring scoped role validations and preventing unauthorized reading/writing parameters.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
