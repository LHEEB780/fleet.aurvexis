import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Download, Copy, Check, QrCode as QrIcon } from 'lucide-react';
import { Vehicle } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface VehicleQrModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  language?: 'ar' | 'en';
}

export default function VehicleQrModal({ vehicle, isOpen, onClose, language = 'ar' }: VehicleQrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (vehicle) {
      const origin = window.location.origin + window.location.pathname;
      const qrUrl = `${origin}?plateNumber=${encodeURIComponent(vehicle.plateNumber)}`;
      QRCode.toDataURL(qrUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then((url) => {
          setQrDataUrl(url);
        })
        .catch((err) => {
          console.error('[QR Generation] Failed:', err);
        });
    }
  }, [vehicle]);

  if (!isOpen || !vehicle) return null;

  const origin = window.location.origin + window.location.pathname;
  const qrUrl = `${origin}?plateNumber=${encodeURIComponent(vehicle.plateNumber)}`;

  // Print function with custom stylesheet for absolute sticker scaling
  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!qrDataUrl) return;

    const printContainer = document.createElement('div');
    printContainer.className = 'm360-print-container-wrapper';
    
    printContainer.innerHTML = `
      <div style="direction: rtl; font-family: 'Inter', system-ui, sans-serif; text-align: center; padding: 25px; border: 4px double #1e293b; border-radius: 20px; max-width: 320px; margin: 30px auto; background: white; color: black; box-shadow: none;">
        <h2 style="font-size: 15px; margin: 0 0 4px 0; font-weight: 900; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-family: system-ui, sans-serif;">مجمع FleetAurvexis الذكي للأسطول</h2>
        <p style="font-size: 9.5px; color: #475569; margin: 5px 0 12px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">الرمز التعريفي السريع للصيانة • Operational QR Pass</p>
        
        <div style="margin: 15px auto; display: flex; justify-content: center; align-items: center; background: white; padding: 10px; border-radius: 12px; border: 1px dashed #cbd5e1; max-width: 200px;">
          <img src="${qrDataUrl}" style="width: 180px; height: 180px; object-fit: contain;" />
        </div>
        
        <div style="font-weight: 950; font-size: 16px; margin: 12px 0 4px 0; color: #0f172a; font-family: system-ui, sans-serif;">${vehicle.name}</div>
        <div style="font-size: 11px; margin-bottom: 15px; color: #64748b; font-weight: 700;">${vehicle.type}</div>
        
        <!-- Plate design -->
        <div style="display: flex; justify-content: center; margin: 10px 0;">
          <div style="border: 2.5px solid #0f172a; border-radius: 8px; overflow: hidden; display: flex; align-items: center; background: #f8fafc; font-family: monospace; font-size: 14px; font-weight: 900; min-width: 160px; height: 32px; box-sizing: border-box;">
            <div style="background: #1e3a8a; color: white; height: 100%; display: flex; align-items: center; justify-content: center; padding: 0 8px; font-size: 10px; border-left: 2px solid #0f172a;">KSA</div>
            <div style="flex: 1; text-align: center; padding: 0 10px; letter-spacing: 3px; color: #0f172a;">${vehicle.plateNumber}</div>
          </div>
        </div>
        
        <div style="margin-top: 15px; font-size: 9.5px; color: #475569; border-top: 1px dashed #e2e8f0; padding-top: 12px; font-weight: 600; line-height: 1.5;">
          امسح الرمز بواسطة كاميرا الجوال للوصول المباشر لسجل الصيانة والأعطال على مدار الساعة
        </div>
        <div style="font-size: 8px; color: #94a3b8; margin-top: 5px; font-weight: 500;">منظومة FleetAurvexis • هندسة الأسطول الفنية الذكية</div>
      </div>
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'm360-print-override-style';
    styleElement.innerHTML = `
      @media print {
        body > * {
          display: none !important;
        }
        html, body {
          background: white !important;
          color: black !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .m360-print-container-wrapper, .m360-print-container-wrapper * {
          display: block !important;
          visibility: visible !important;
        }
        .m360-print-container-wrapper {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          z-index: 9999999;
        }
      }
    `;

    document.head.appendChild(styleElement);
    document.body.appendChild(printContainer);

    // Give browser brief window to load base64 source frame
    setTimeout(() => {
      window.print();
      // Safe cleanup immediately
      if (document.body.contains(printContainer)) {
        document.body.removeChild(printContainer);
      }
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    }, 120);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `M360_QR_${vehicle.plateNumber.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div 
        id="vehicle-qr-modal-overlay"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[90] flex items-center justify-center p-4 text-right overflow-y-auto"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#0f1422] w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800/80 my-auto"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3 bg-white dark:bg-[#0f1422]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-brand-blue-50 dark:bg-brand-blue-900/10 text-brand-blue-650 dark:text-brand-blue-400 rounded-xl flex items-center justify-center">
                <QrIcon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-none">
                  {language === 'ar' ? 'بطاقة الرمز السريع QR وطباعته' : 'Vehicle QR Identifier Label'}
                </h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mt-1 leading-none">
                  {language === 'ar' ? 'توليد كود التتبع الفني والصيانة' : 'Generate mechanical tracking & inspection tags'}
                </span>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 rounded-lg transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body content */}
          <div className="p-6 flex flex-col items-center gap-5">
            
            {/* Real Graphic Label Frame preview */}
            <div className="w-full max-w-[310px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl flex flex-col items-center shadow-inner relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 left-0 h-1 bg-brand-blue-500" />
              
              <div className="text-[10.5px] font-black text-slate-700 dark:text-slate-350 tracking-wider">
                {language === 'ar' ? 'مجمع FleetAurvexis الذكي لإدارة الأسطول' : 'FleetAurvexis Fleet Support Network'}
              </div>
              <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5 tracking-wider">
                {language === 'ar' ? 'الرمز الميكانيكي السريع • Digital Maintenance ID' : 'Digital Active Fleet Pass'}
              </div>

              {/* Loader container for safe loading */}
              <div className="my-4 bg-white p-3.5 rounded-xl border border-slate-150 relative flex items-center justify-center w-[160px] h-[160px] shadow-sm select-none">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Vehicle QR" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-[10px] text-slate-400 font-bold animate-pulse">Generating...</div>
                )}
              </div>

              <div className="text-xs font-black text-slate-900 dark:text-white mt-1 leading-normal">
                {vehicle.name}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5 leading-none">
                {vehicle.type}
              </div>

              {/* Realistic Saudi Style Fleet Plate Design */}
              <div className="mt-3.5 flex justify-center">
                <div className="border-[2px] border-slate-800 dark:border-slate-700 rounded-lg overflow-hidden flex items-center bg-slate-50 dark:bg-slate-900 font-mono text-xs font-black min-w-[155px] h-7.5 box-border">
                  <div className="bg-brand-blue-900/10 text-brand-blue-600 dark:text-brand-blue-400 height-full h-full flex items-center justify-center px-2 text-[8.5px] font-black border-l border-slate-800 dark:border-slate-705">
                    KSA
                  </div>
                  <div className="flex-1 text-center font-bold tracking-[2px] text-slate-800 dark:text-slate-200 px-3">
                    {vehicle.plateNumber}
                  </div>
                </div>
              </div>

              <p className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 mt-4 leading-normal">
                {language === 'ar' 
                  ? 'امسح الرمز لقراءة قائمة سجلات الصيانة السابقة وحجز الصيانة الوقائية' 
                  : 'Scan with camera to retrieve complete engineering records & schedules'}
              </p>
            </div>

            {/* Direct Web link review */}
            <div className="w-full text-right bg-slate-55/70 dark:bg-slate-900/30 border border-slate-150/40 dark:border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 block">
                  {language === 'ar' ? 'رابط المسح المباشر المبرمج:' : 'Direct Scanned Action URL:'}
                </span>
                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate block mt-0.5 leading-none select-all font-semibold" dir="ltr">
                  {qrUrl}
                </span>
              </div>
              
              <button
                onClick={handleCopyLink}
                className={`p-2 rounded-lg shrink-0 transition-all border cursor-pointer ${
                  copied 
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200' 
                    : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 border-slate-200 dark:border-slate-700'
                }`}
                title={language === 'ar' ? 'نسخ الرابط للمشاريع' : 'Copy action link to clipboard'}
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            </div>

            {/* Action buttons list */}
            <div className="grid grid-cols-2 gap-3 w-full border-t border-slate-100 dark:border-slate-800 pt-4 shrink-0">
              <button
                type="button"
                onClick={handleDownload}
                className="h-10.5 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-all font-bold text-xs cursor-pointer border border-transparent"
              >
                <Download size={14} />
                <span>{language === 'ar' ? 'تحميل صورة PNG' : 'Save Image'}</span>
              </button>
              
              <button
                type="button"
                onClick={handlePrint}
                className="h-10.5 flex items-center justify-center gap-1.5 bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-xl transition-all font-bold text-xs cursor-pointer shadow-md active:scale-98"
              >
                <Printer size={14} />
                <span>{language === 'ar' ? 'طباعة ملصق الكود' : 'Print Label'}</span>
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
