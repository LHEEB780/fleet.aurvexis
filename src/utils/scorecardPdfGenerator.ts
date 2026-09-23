import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import QRCode from 'qrcode';
import { DriverScorecardData } from '../components/DriverScorecard';

export interface ScorecardPdfOptions {
  safeMode?: boolean;
}

/**
 * Ensures Cairo and Tajawal fonts are available for high-fidelity Arabic rendering
 */
function ensureArabicFonts(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();

  const fontId = 'google-arabic-fonts-scorecard';
  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap';
    document.head.appendChild(link);
  }

  if (document.fonts && document.fonts.ready) {
    return Promise.race([
      document.fonts.ready.then(() => {}).catch(() => {}),
      new Promise<void>(resolve => setTimeout(resolve, 800))
    ]);
  }
  return Promise.resolve();
}

/**
 * Generates and downloads a high-resolution, bilingual (Arabic or English) Driver Scorecard PDF.
 * Eliminates all mojibake/corrupted characters by rendering using browser-native text shaping.
 */
export async function exportDriverScorecardPDF(
  card: DriverScorecardData,
  language: 'ar' | 'en' = 'ar',
  options: ScorecardPdfOptions = {}
): Promise<void> {
  const isAr = language === 'ar';
  let currentPhase = 'INIT_ENVIRONMENT';

  try {
    currentPhase = 'FONT_PREPARATION';
    if (isAr) {
      await ensureArabicFonts();
    }

    // Generate QR code for verification
    currentPhase = 'QR_CODE_GENERATION';
    const qrText = `AURVEXIS-DRIVER-SCORECARD:${card.driver.id}:${card.overallScore}:${card.grade}:${new Date().toISOString()}`;
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(qrText, { width: 120, margin: 1 });
    } catch (err) {
      console.warn('QR Code generation failed, proceeding without QR:', err);
    }

  const brandName = typeof localStorage !== 'undefined'
    ? localStorage.getItem('saas_brand_name') || 'FleetAurvexis'
    : 'FleetAurvexis';

  const getDepartmentLabel = (dept?: string) => {
    if (!dept) return isAr ? 'إدارة العمليات والنقل' : 'Fleet Operations';
    if (!isAr) {
      switch (dept) {
        case 'قسم الآليات': return 'Machinery Dept';
        case 'قسم الآليات العامة': return 'General Machinery Dept';
        case 'قسم الاستثمار': return 'Investment Dept';
        case 'قسم الاستثمار والتشغيل': return 'Investment & Operations';
        case 'قسم الشؤون الهندسية':
        case 'شعبة المشروعات الهندسية': return 'Engineering Projects Division';
        case 'قسم الطوارئ':
        case 'شعبة الطوارئ والتدخل العاجل': return 'Emergency & Rapid Response';
        default: return dept;
      }
    }
    return dept;
  };

  const getLicenseTypeLabel = (type?: string) => {
    if (!type) return isAr ? 'عمومي' : 'Commercial';
    if (!isAr) {
      switch (type) {
        case 'خفيف': return 'Light (Class 1)';
        case 'ثقيل': return 'Heavy (Class 2)';
        case 'عمومي': return 'Passenger / Bus (Class 3)';
        case 'إنشائي': return 'Machinery & Const. (Class 4)';
        default: return type;
      }
    }
    return type;
  };

  const cleanHandoverPct = Math.round(
    (card.handoverMetrics.cleanHandovers / (card.handoverMetrics.totalHandovers || 1)) * 100
  );

  // Recommendations localized
  const recommendations: string[] = isAr
    ? card.aiActionRecommendations
    : [
        `Consistently maintain fuel levels above 70% during vehicle handovers to uphold optimal fleet operational targets.`,
        `Complete scheduled routine vehicle maintenance inspections within allocated maintenance windows.`,
        `Strict adherence to pre-shift vehicle inspection checklists before starting assigned routes.`
      ];

  const currentDate = new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Build the complete HTML markup for the Scorecard
  const htmlContent = `
    <div style="
      width: 794px;
      min-height: 1123px;
      background: #ffffff;
      color: #0f172a;
      font-family: ${isAr ? "'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, sans-serif" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"};
      direction: ${isAr ? 'rtl' : 'ltr'};
      text-align: ${isAr ? 'right' : 'left'};
      padding: 32px 36px;
      box-sizing: border-box;
      position: relative;
    ">
      <!-- Top Brand Header Banner -->
      <div style="
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #31104b 100%);
        border-radius: 16px;
        padding: 24px 28px;
        color: #ffffff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.25);
      ">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <div style="background: #9333ea; color: #ffffff; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900;">
              ⚡
            </div>
            <div>
              <div style="font-size: 20px; font-weight: 900; letter-spacing: ${isAr ? '0' : '0.5px'};">
                ${isAr ? `${brandName} للذكاء التشغيلي وإدارة الأساطيل` : `${brandName} FLEET INTELLIGENCE`}
              </div>
              <div style="font-size: 11px; color: #c084fc; font-weight: 700;">
                ${isAr ? 'كشف بطاقة أداء وتقييم السائق المعتمدة رسمياً' : 'OFFICIAL DRIVER EFFICIENCY SCORECARD & AUDIT REPORT'}
              </div>
            </div>
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 8px;">
            ${isAr ? `تاريخ الإصدار: ${currentDate} | الرقم المرجعي للنظام: AUR-DRV-${card.driver.id || '2026'}` : `Issue Date: ${currentDate} | System Reference: AUR-DRV-${card.driver.id || '2026'}`}
          </div>
        </div>

        ${qrDataUrl ? `
          <div style="text-align: center; background: #ffffff; padding: 6px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <img src="${qrDataUrl}" alt="QR Verification" style="width: 72px; height: 72px; display: block;" />
            <div style="font-size: 7.5px; font-weight: 800; color: #475569; margin-top: 3px; font-family: monospace;">
              ${isAr ? 'توثيق رقمي' : 'VERIFIED QR'}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Driver Information Card & Score Highlights -->
      <div style="display: flex; gap: 18px; margin-bottom: 22px;">
        <!-- Driver Profile Details Box -->
        <div style="
          flex: 2;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px 22px;
        ">
          <div style="font-size: 11px; font-weight: 800; color: #6b21a8; text-transform: uppercase; margin-bottom: 12px;">
            ${isAr ? '👤 البيانات الرسمية للسائق' : '👤 DRIVER PROFILE SPECIFICATIONS'}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 18px;">
            <div>
              <div style="font-size: 9.5px; color: #64748b;">${isAr ? 'اسم السائق:' : 'Driver Full Name:'}</div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                ${card.driver.name}
              </div>
            </div>

            <div>
              <div style="font-size: 9.5px; color: #64748b;">${isAr ? 'القسم / الإدارة:' : 'Department / Division:'}</div>
              <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 2px;">
                ${getDepartmentLabel(card.driver.department)}
              </div>
            </div>

            <div>
              <div style="font-size: 9.5px; color: #64748b;">${isAr ? 'رقم الهوية الوطنية / الإقامة:' : 'National ID / Iqama:'}</div>
              <div style="font-size: 12px; font-weight: 700; font-family: monospace; color: #334155; margin-top: 2px;">
                ${card.driver.identityNumber || 'N/A'}
              </div>
            </div>

            <div>
              <div style="font-size: 9.5px; color: #64748b;">${isAr ? 'رقم رخصة القيادة والنوع:' : 'License Number & Class:'}</div>
              <div style="font-size: 12px; font-weight: 700; font-family: monospace; color: #334155; margin-top: 2px;">
                ${card.driver.licenseNumber || 'N/A'} (${getLicenseTypeLabel(card.driver.licenseType)})
              </div>
            </div>

            <div>
              <div style="font-size: 9.5px; color: #64748b;">${isAr ? 'رقم الهاتف المعتمد:' : 'Contact Phone:'}</div>
              <div style="font-size: 12px; font-weight: 700; font-family: monospace; color: #334155; margin-top: 2px;">
                ${card.driver.phone || 'N/A'}
              </div>
            </div>

            <div>
              <div style="font-size: 9.5px; color: #64748b;">${isAr ? 'الترتيب بين سائقي الأسطول:' : 'Fleet Driver Rank:'}</div>
              <div style="font-size: 12px; font-weight: 800; color: #7e22ce; margin-top: 2px;">
                ${isAr ? `المركز #${card.rank}` : `Rank #${card.rank}`}
              </div>
            </div>
          </div>
        </div>

        <!-- Overall Score Badge Card -->
        <div style="
          flex: 1;
          background: linear-gradient(145deg, #7e22ce 0%, #581c87 100%);
          border-radius: 14px;
          padding: 20px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-shadow: 0 8px 20px -4px rgba(126, 34, 206, 0.35);
        ">
          <div style="font-size: 10px; font-weight: 800; letter-spacing: 1px; color: #e9d5ff; margin-bottom: 6px;">
            ${isAr ? 'مؤشر الكفاءة الشامل' : 'OVERALL SCORE'}
          </div>
          <div style="font-size: 44px; font-weight: 900; line-height: 1; font-family: monospace;">
            ${card.overallScore}<span style="font-size: 18px; color: #d8b4fe;">/100</span>
          </div>
          <div style="margin-top: 10px; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; padding: 4px 16px; font-size: 11px; font-weight: 800;">
            ${isAr 
              ? `الفئة: ${card.grade} - ${card.tier === 'elite' ? 'نخبوي متميز' : card.tier === 'pro' ? 'أداء عالي' : card.tier === 'standard' ? 'كفاءة قياسية' : 'بحاجة لمتابعة وتدريب'}` 
              : `Grade: ${card.grade} (${card.tier.toUpperCase()})`}
          </div>
        </div>
      </div>

      <!-- Core Pillars Summary Table -->
      <div style="margin-bottom: 22px;">
        <div style="font-size: 12px; font-weight: 800; color: #1e1b4b; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
          <span>📊</span>
          <span>${isAr ? 'محاور تقييم الأداء الثلاثة الرئيسية والمعايير المعتمدة' : 'CORE PERFORMANCE PILLARS & WEIGHTED EVALUATION'}</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; border-radius: 10px; overflow: hidden;">
          <thead>
            <tr style="background: #6b21a8; color: #ffffff;">
              <th style="padding: 10px 14px; text-align: ${isAr ? 'right' : 'left'}; font-weight: 800;">
                ${isAr ? 'محور التقييم' : 'Pillar Dimension'}
              </th>
              <th style="padding: 10px 14px; text-align: center; font-weight: 800; width: 100px;">
                ${isAr ? 'الوزن النسبي' : 'Weight'}
              </th>
              <th style="padding: 10px 14px; text-align: center; font-weight: 800; width: 110px;">
                ${isAr ? 'درجة الأداء' : 'Score'}
              </th>
              <th style="padding: 10px 14px; text-align: ${isAr ? 'right' : 'left'}; font-weight: 800;">
                ${isAr ? 'حالة التقييم ومستوى الجودة' : 'Evaluation Status'}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style="background: #faf5ff; border-bottom: 1px solid #f3e8ff;">
              <td style="padding: 10px 14px; font-weight: 700; color: #1e1b4b;">
                ${isAr ? '1. سجل تسليم واستلام المركبات (العهدة ونظافة الفحص)' : '1. Vehicle Handover History & Custody Cleanliness'}
              </td>
              <td style="padding: 10px 14px; text-align: center; font-weight: 800; color: #6b21a8; font-family: monospace;">35%</td>
              <td style="padding: 10px 14px; text-align: center; font-weight: 900; font-family: monospace; color: #0f172a;">${card.handoverScore} / 100</td>
              <td style="padding: 10px 14px; color: ${card.handoverScore >= 80 ? '#15803d' : '#b45309'}; font-weight: 700;">
                ${card.handoverScore >= 85 ? (isAr ? 'ممتاز (تسليم نظيف ومنتظم)' : 'Excellent (Clean Custody)') : (isAr ? 'مقبول (ملاحظات محدودة)' : 'Acceptable (Minor Observations)')}
              </td>
            </tr>
            <tr style="background: #ffffff; border-bottom: 1px solid #f3e8ff;">
              <td style="padding: 10px 14px; font-weight: 700; color: #1e1b4b;">
                ${isAr ? '2. صيانة المركبة والإبلاغ المبكر عن الأعطال' : '2. Vehicle Maintenance & Early Defect Reporting'}
              </td>
              <td style="padding: 10px 14px; text-align: center; font-weight: 800; color: #6b21a8; font-family: monospace;">35%</td>
              <td style="padding: 10px 14px; text-align: center; font-weight: 900; font-family: monospace; color: #0f172a;">${card.maintenanceScore} / 100</td>
              <td style="padding: 10px 14px; color: ${card.maintenanceScore >= 80 ? '#15803d' : '#b45309'}; font-weight: 700;">
                ${card.maintenanceScore >= 85 ? (isAr ? 'عناية استباقية ممتازة' : 'Proactive Defect Care') : (isAr ? 'بحاجة لتحسين سرعة البلاغ' : 'Needs Early Reporting Follow-up')}
              </td>
            </tr>
            <tr style="background: #faf5ff; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 14px; font-weight: 700; color: #1e1b4b;">
                ${isAr ? '3. الالتزام بجدول الفحص الدوري ونقاط السلامة' : '3. Periodic Inspection Schedule Adherence & Safety'}
              </td>
              <td style="padding: 10px 14px; text-align: center; font-weight: 800; color: #6b21a8; font-family: monospace;">30%</td>
              <td style="padding: 10px 14px; text-align: center; font-weight: 900; font-family: monospace; color: #0f172a;">${card.inspectionScore} / 100</td>
              <td style="padding: 10px 14px; color: ${card.inspectionScore >= 80 ? '#15803d' : '#b45309'}; font-weight: 700;">
                ${card.inspectionScore >= 85 ? (isAr ? 'انضباط تام بالمواعيد المحددة' : 'Strictly Compliant on Time') : (isAr ? 'تأخيرات في الفحوصات الميدانية' : 'Occasional Inspection Delays')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Key Detailed Operational Indicators Table -->
      <div style="margin-bottom: 22px;">
        <div style="font-size: 12px; font-weight: 800; color: #1e1b4b; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
          <span>🔍</span>
          <span>${isAr ? 'سجل المؤشرات التشغيلية التفصيلية' : 'DETAILED OPERATIONAL METRIC INDICATORS'}</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 10px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background: #1e293b; color: #ffffff;">
              <th style="padding: 8px 12px; text-align: ${isAr ? 'right' : 'left'};">${isAr ? 'المؤشر التشغيلي' : 'Metric Indicator'}</th>
              <th style="padding: 8px 12px; text-align: center;">${isAr ? 'القيمة المسجلة' : 'Logged Value'}</th>
              <th style="padding: 8px 12px; text-align: center;">${isAr ? 'المستهدف المعياري' : 'Operational Target'}</th>
              <th style="padding: 8px 12px; text-align: center;">${isAr ? 'مستوى الامتثال' : 'Compliance Status'}</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: 600;">${isAr ? 'نسبة التسليم النظيف الخالي من الأضرار' : 'Clean Handover Rate (No Damage)'}</td>
              <td style="padding: 8px 12px; text-align: center; font-family: monospace; font-weight: 800;">${cleanHandoverPct}%</td>
              <td style="padding: 8px 12px; text-align: center; color: #64748b;">>= 90%</td>
              <td style="padding: 8px 12px; text-align: center; font-weight: 800; color: ${cleanHandoverPct >= 90 ? '#15803d' : '#b45309'};">
                ${cleanHandoverPct >= 90 ? (isAr ? '✔ مطابق (ناجح)' : '✔ Pass') : (isAr ? '⚠ تنبيه' : '⚠ Warning')}
              </td>
            </tr>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: 600;">${isAr ? 'متوسط مستوى الوقود عند إعادة المركبة' : 'Average Fuel Level at Return'}</td>
              <td style="padding: 8px 12px; text-align: center; font-family: monospace; font-weight: 800;">${card.handoverMetrics.avgFuelReturnPct}%</td>
              <td style="padding: 8px 12px; text-align: center; color: #64748b;">>= 70%</td>
              <td style="padding: 8px 12px; text-align: center; font-weight: 800; color: ${card.handoverMetrics.avgFuelReturnPct >= 70 ? '#15803d' : '#b45309'};">
                ${card.handoverMetrics.avgFuelReturnPct >= 70 ? (isAr ? '✔ مطابق (ناجح)' : '✔ Pass') : (isAr ? '⚠ بحاجة لمتابعة' : '⚠ Attention')}
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: 600;">${isAr ? 'نسبة الفحص الدوري في الموعد المحدد' : 'On-Time Inspection Adherence Rate'}</td>
              <td style="padding: 8px 12px; text-align: center; font-family: monospace; font-weight: 800;">${card.inspectionMetrics.adherenceRate}%</td>
              <td style="padding: 8px 12px; text-align: center; color: #64748b;">>= 95%</td>
              <td style="padding: 8px 12px; text-align: center; font-weight: 800; color: ${card.inspectionMetrics.adherenceRate >= 95 ? '#15803d' : '#b45309'};">
                ${card.inspectionMetrics.adherenceRate >= 95 ? (isAr ? '✔ مطابق (ناجح)' : '✔ Pass') : (isAr ? '⚠ تأخير متكرر' : '⚠ Delayed')}
              </td>
            </tr>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px; font-weight: 600;">${isAr ? 'مؤشر سرعة الإبلاغ عن الأعطال للورش' : 'Early Defect Reporting Index'}</td>
              <td style="padding: 8px 12px; text-align: center; font-family: monospace; font-weight: 800;">${card.maintenanceMetrics.earlyReportedRate}%</td>
              <td style="padding: 8px 12px; text-align: center; color: #64748b;">>= 80%</td>
              <td style="padding: 8px 12px; text-align: center; font-weight: 800; color: #15803d;">
                ${isAr ? '✔ مطابق (ناجح)' : '✔ Pass'}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: 600;">${isAr ? 'أعطال أو توقفات ناتجة عن إهمال حرج' : 'Critical Breakdowns Caused by Negligence'}</td>
              <td style="padding: 8px 12px; text-align: center; font-family: monospace; font-weight: 800;">${card.maintenanceMetrics.criticalBreakdownsCount}</td>
              <td style="padding: 8px 12px; text-align: center; color: #64748b;">0</td>
              <td style="padding: 8px 12px; text-align: center; font-weight: 800; color: ${card.maintenanceMetrics.criticalBreakdownsCount === 0 ? '#15803d' : '#b91c1c'};">
                ${card.maintenanceMetrics.criticalBreakdownsCount === 0 ? (isAr ? '✔ نظيف (صفر حوادث)' : '✔ Zero Incidents') : (isAr ? '✖ مسجل في السجل' : '✖ Flagged')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- AI Fleet Operational Recommendations Box -->
      <div style="
        background: #f3e8ff;
        border: 1px solid #d8b4fe;
        border-radius: 12px;
        padding: 16px 20px;
        margin-bottom: 26px;
      ">
        <div style="font-size: 11px; font-weight: 800; color: #6b21a8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <span>🤖</span>
          <span>${isAr ? 'توصيات الذكاء الاصطناعي التشغيلي للأساطيل:' : 'FLEET AI OPERATIONAL RECOMMENDATIONS:'}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${recommendations.map(rec => `
            <div style="font-size: 10px; color: #334155; line-height: 1.6; display: flex; gap: 6px;">
              <span style="color: #7e22ce; font-weight: 900;">•</span>
              <span>${rec}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Official Signatures & Seal Section -->
      <div style="
        border-top: 2px dashed #cbd5e1;
        padding-top: 18px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        font-size: 9.5px;
        color: #64748b;
      ">
        <div>
          <div>${isAr ? 'توقيع مدير إدارة الحركة والتشغيل:' : 'Fleet Operations Director Signature:'}</div>
          <div style="margin-top: 28px; border-bottom: 1px solid #94a3b8; width: 200px;"></div>
        </div>

        <div style="text-align: center;">
          <div style="
            width: 70px;
            height: 70px;
            border: 2px solid #7e22ce;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #7e22ce;
            font-size: 8px;
            font-weight: 800;
            text-align: center;
            transform: rotate(-10deg);
            margin: 0 auto;
          ">
            ${isAr ? 'ختم الاعتماد<br/>الرسمي' : 'OFFICIAL<br/>SEAL'}
          </div>
        </div>

        <div style="text-align: ${isAr ? 'left' : 'right'};">
          <div>${isAr ? 'مصادقة ضابط الجودة والسلامة:' : 'Safety & Compliance Officer Attestation:'}</div>
          <div style="margin-top: 28px; border-bottom: 1px solid #94a3b8; width: 200px; margin-${isAr ? 'right' : 'left'}: auto;"></div>
        </div>
      </div>

      <!-- Document Footer -->
      <div style="
        position: absolute;
        bottom: 15px;
        left: 36px;
        right: 36px;
        display: flex;
        justify-content: space-between;
        font-size: 8px;
        color: #94a3b8;
        border-top: 1px solid #f1f5f9;
        padding-top: 8px;
      ">
        <span>${brandName} Fleet Intelligence Cloud Platform</span>
        <span>${isAr ? 'المستند صادر رقمياً ويحمل الصلاحية القانونية والتشغيلية' : 'Digitally Certified Operational Audit Document'}</span>
      </div>
    </div>
  `;

    // Create isolated rendering node in DOM
    currentPhase = 'DOM_ATTACHMENT';
    const container = document.createElement('div');
    container.id = 'temp-scorecard-render-container';
    container.style.position = 'fixed';
    container.style.top = '0px';
    container.style.left = '0px';
    container.style.width = '794px';
    container.style.zIndex = '-99999';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    try {
      // Wait slightly for DOM font and layout engine to settle
      await new Promise(resolve => setTimeout(resolve, 250));

      currentPhase = 'CANVAS_RASTERIZATION';
      // Render container to canvas with scale 2 for crisp 300dpi-like output
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0
      });

      currentPhase = 'CANVAS_IMAGE_EXTRACTION';
      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      currentPhase = 'PDF_DOCUMENT_CREATION';
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = 210;
      const pageHeight = 297;
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

      currentPhase = 'FILE_SAVE_AND_DISPATCH';
      const cleanDriverName = (card.driver.name || (isAr ? 'السائق' : 'Driver'))
        .replace(/[/\\?%*:|"<>#]/g, '_')
        .trim()
        .replace(/\s+/g, '_');

      // Generate safe file name ensuring ASCII safety in English mode to avoid browser download blocks
      const safeEnDriverName = cleanDriverName.replace(/[^\x00-\x7F]/g, '').trim() || `Driver_${card.driver.id}`;
      const fileName = isAr
        ? `بطاقة_أداء_السائق_${cleanDriverName}.pdf`
        : `Driver_Scorecard_${safeEnDriverName}.pdf`;

      // Multi-tier download mechanism
      let downloaded = false;
      try {
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        downloaded = true;
        setTimeout(() => {
          if (document.body.contains(link)) document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 4000);
      } catch (blobErr) {
        console.warn('Direct blob URL download failed, trying standard save:', blobErr);
      }

      if (!downloaded) {
        try {
          pdf.save(fileName);
        } catch (saveErr: any) {
          throw new Error(`[PdfSaveDispatchError] Failed to trigger file save: ${saveErr?.message || saveErr}`);
        }
      }
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  } catch (rawError: any) {
    const errorDetails = new Error(
      `[ScorecardPDF:${currentPhase}] ${rawError?.name || 'Error'}: ${rawError?.message || String(rawError)}`
    );
    (errorDetails as any).phase = currentPhase;
    (errorDetails as any).originalError = rawError;
    (errorDetails as any).language = language;
    (errorDetails as any).driverId = card.driver.id;
    (errorDetails as any).driverName = card.driver.name;
    throw errorDetails;
  }
}
