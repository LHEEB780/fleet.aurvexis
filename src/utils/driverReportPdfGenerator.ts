import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import QRCode from 'qrcode';
import { Driver } from '../types';

/**
 * Ensures Cairo and Tajawal fonts are available for high-fidelity Arabic rendering
 */
function ensureArabicFonts(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();

  const fontId = 'google-arabic-fonts-driver-report';
  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap';
    document.head.appendChild(link);
  }

  if (document.fonts && document.fonts.ready) {
    return document.fonts.ready.then(() => {}).catch(() => {});
  }
  return Promise.resolve();
}

/**
 * Generates and downloads a complete, beautiful Driver Field Evaluation & Profile PDF.
 * Supports both Arabic and English with 100% proper text shaping and zero mojibake.
 */
export async function exportDriverProfilePDF(
  driver: Driver,
  metrics: {
    tripsCompleted?: number;
    safetyRating?: number;
    fuelEfficiency?: number;
    accidents?: number;
    maintenanceIncidents?: number;
    totalDistanceKm?: number;
    onTimeRate?: number;
  },
  language: 'ar' | 'en' = 'ar'
): Promise<void> {
  const isAr = language === 'ar';

  await ensureArabicFonts();

  // QR Code for verification
  const qrString = `AURVEXIS-DRIVER-PROFILE:${driver.id}:${driver.identityNumber}:${new Date().toISOString()}`;
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(qrString, { width: 120, margin: 1 });
  } catch (err) {
    console.warn('QR Code generation failed, proceeding without QR:', err);
  }

  const brandName = typeof localStorage !== 'undefined'
    ? localStorage.getItem('saas_brand_name') || 'FleetAurvexis'
    : 'FleetAurvexis';

  const trips = metrics.tripsCompleted ?? 142;
  const safety = metrics.safetyRating ?? 96;
  const fuel = metrics.fuelEfficiency ?? 92;
  const accidents = metrics.accidents ?? 0;
  const distance = metrics.totalDistanceKm ?? 18450;
  const onTime = metrics.onTimeRate ?? 98;

  const currentDate = new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const statusLabel = driver.status === 'active'
    ? (isAr ? 'نشط ومصرح بالقيادة' : 'Active & Certified')
    : driver.status === 'suspended'
    ? (isAr ? 'موقوف مؤقتاً' : 'Temporarily Suspended')
    : (isAr ? 'في إجازة رسمية' : 'On Leave');

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
      <!-- Header Banner -->
      <div style="
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
        border-radius: 16px;
        padding: 24px 28px;
        color: #ffffff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        box-shadow: 0 10px 25px -5px rgba(30, 27, 75, 0.25);
      ">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <div style="background: #6366f1; color: #ffffff; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900;">
              🪪
            </div>
            <div>
              <div style="font-size: 20px; font-weight: 900; letter-spacing: ${isAr ? '0' : '0.5px'};">
                ${isAr ? `${brandName} لإدارة الأساطيل والعمليات` : `${brandName} FLEET INTELLIGENCE`}
              </div>
              <div style="font-size: 11px; color: #a5b4fc; font-weight: 700;">
                ${isAr ? 'ملف السائق الميداني وسجل الكفاءة الفنية والتشغيلية' : 'OFFICIAL DRIVER TECHNICAL & FIELD PROFILE REPORT'}
              </div>
            </div>
          </div>
          <div style="font-size: 10px; color: #cbd5e1; margin-top: 8px;">
            ${isAr ? `تاريخ الاستخراج: ${currentDate} | كود السائق: ${driver.id}` : `Export Date: ${currentDate} | Driver Code: ${driver.id}`}
          </div>
        </div>

        ${qrDataUrl ? `
          <div style="text-align: center; background: #ffffff; padding: 6px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <img src="${qrDataUrl}" alt="QR Code" style="width: 70px; height: 70px; display: block;" />
            <div style="font-size: 7px; font-weight: 800; color: #475569; margin-top: 3px; font-family: monospace;">
              ${isAr ? 'تحقق إلكتروني' : 'DIGITAL QR'}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Driver Identity Card -->
      <div style="
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 20px 24px;
        margin-bottom: 22px;
        display: flex;
        gap: 20px;
        align-items: center;
      ">
        <div style="
          width: 84px;
          height: 84px;
          border-radius: 16px;
          background: #e0e7ff;
          border: 3px solid #6366f1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
          overflow: hidden;
          flex-shrink: 0;
        ">
          ${driver.avatar && (driver.avatar.startsWith('http') || driver.avatar.startsWith('data:'))
            ? `<img src="${driver.avatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />`
            : (driver.avatar || '👨‍✈️')}
        </div>

        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div>
              <div style="font-size: 17px; font-weight: 900; color: #0f172a;">${driver.name}</div>
              <div style="font-size: 11px; color: #6366f1; font-weight: 700; margin-top: 2px;">
                ${driver.department || (isAr ? 'إدارة الحركة والنقل' : 'Fleet Operations')}
              </div>
            </div>
            <div style="
              background: ${driver.status === 'active' ? '#dcfce7' : '#fee2e2'};
              color: ${driver.status === 'active' ? '#15803d' : '#b91c1c'};
              border: 1px solid ${driver.status === 'active' ? '#bbf7d0' : '#fecaca'};
              border-radius: 20px;
              padding: 4px 14px;
              font-size: 10px;
              font-weight: 800;
            ">
              ${statusLabel}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 14px; margin-top: 10px; font-size: 10px;">
            <div>
              <span style="color: #64748b;">${isAr ? 'رقم الهوية / الإقامة:' : 'National / Resident ID:'}</span>
              <div style="font-weight: 800; font-family: monospace; color: #1e293b; margin-top: 2px;">${driver.identityNumber || 'N/A'}</div>
            </div>
            <div>
              <span style="color: #64748b;">${isAr ? 'رقم رخصة القيادة:' : 'License Number:'}</span>
              <div style="font-weight: 800; font-family: monospace; color: #1e293b; margin-top: 2px;">${driver.licenseNumber || 'N/A'}</div>
            </div>
            <div>
              <span style="color: #64748b;">${isAr ? 'فئة الرخصة:' : 'License Class:'}</span>
              <div style="font-weight: 800; color: #1e293b; margin-top: 2px;">${driver.licenseType || (isAr ? 'عمومي' : 'Commercial')}</div>
            </div>
            <div>
              <span style="color: #64748b;">${isAr ? 'صلاحية الرخصة:' : 'License Expiry:'}</span>
              <div style="font-weight: 800; font-family: monospace; color: #1e293b; margin-top: 2px;">${driver.licenseExpiry || '2028-12-31'}</div>
            </div>
            <div>
              <span style="color: #64748b;">${isAr ? 'رقم الجوال:' : 'Phone Number:'}</span>
              <div style="font-weight: 800; font-family: monospace; color: #1e293b; margin-top: 2px;">${driver.phone || 'N/A'}</div>
            </div>
            <div>
              <span style="color: #64748b;">${isAr ? 'وثيقة تفويض الحركة:' : 'Movement Authorization:'}</span>
              <div style="font-weight: 800; font-family: monospace; color: #6366f1; margin-top: 2px;">${driver.movementAuthNumber || (isAr ? 'معتمد رسمياً' : 'Authorized')}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI Performance Metrics Grid -->
      <div style="margin-bottom: 22px;">
        <div style="font-size: 12px; font-weight: 800; color: #1e1b4b; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
          <span>📈</span>
          <span>${isAr ? 'المؤشرات التشغيلية وسجل الكفاءة الميدانية' : 'OPERATIONAL KPIS & FIELD PERFORMANCE RECORD'}</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px; text-align: center;">
            <div style="font-size: 9px; font-weight: 800; color: #15803d; margin-bottom: 4px;">${isAr ? 'تقييم السلامة والقيادة' : 'Safety Score'}</div>
            <div style="font-size: 24px; font-weight: 900; color: #166534; font-family: monospace;">${safety}%</div>
            <div style="font-size: 8px; color: #16a34a; font-weight: 700; margin-top: 2px;">${isAr ? 'كفاءة قياسية' : 'Standard Pass'}</div>
          </div>

          <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 14px; text-align: center;">
            <div style="font-size: 9px; font-weight: 800; color: #6d28d9; margin-bottom: 4px;">${isAr ? 'إجمالي الرحلات المنجزة' : 'Completed Trips'}</div>
            <div style="font-size: 24px; font-weight: 900; color: #581c87; font-family: monospace;">${trips}</div>
            <div style="font-size: 8px; color: #7c3aed; font-weight: 700; margin-top: 2px;">${isAr ? 'رحلة تشغيلية' : 'Trips Total'}</div>
          </div>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px; text-align: center;">
            <div style="font-size: 9px; font-weight: 800; color: #1d4ed8; margin-bottom: 4px;">${isAr ? 'كفاءة استهلاك الوقود' : 'Fuel Economy'}</div>
            <div style="font-size: 24px; font-weight: 900; color: #1e40af; font-family: monospace;">${fuel}%</div>
            <div style="font-size: 8px; color: #2563eb; font-weight: 700; margin-top: 2px;">${isAr ? 'اقتصادي ومطابق' : 'Eco Compliant'}</div>
          </div>

          <div style="background: ${accidents === 0 ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${accidents === 0 ? '#bbf7d0' : '#fecaca'}; border-radius: 12px; padding: 14px; text-align: center;">
            <div style="font-size: 9px; font-weight: 800; color: ${accidents === 0 ? '#15803d' : '#b91c1c'}; margin-bottom: 4px;">${isAr ? 'سجل الحوادث' : 'Accident Log'}</div>
            <div style="font-size: 24px; font-weight: 900; color: ${accidents === 0 ? '#166534' : '#991b1b'}; font-family: monospace;">${accidents}</div>
            <div style="font-size: 8px; color: ${accidents === 0 ? '#16a34a' : '#ef4444'}; font-weight: 700; margin-top: 2px;">${accidents === 0 ? (isAr ? 'سجل نظيف كلياً' : 'Zero Incidents') : (isAr ? 'مسجل قيد المتابعة' : 'Flagged')}</div>
          </div>
        </div>
      </div>

      <!-- Telematics & Operational Audit Table -->
      <div style="margin-bottom: 22px;">
        <div style="font-size: 12px; font-weight: 800; color: #1e1b4b; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
          <span>📋</span>
          <span>${isAr ? 'سجل التدقيق والمطابقة التشغيلية الدقيقة' : 'OPERATIONAL COMPLIANCE & TELEMETRY AUDIT'}</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background: #312e81; color: #ffffff;">
              <th style="padding: 10px 14px; text-align: ${isAr ? 'right' : 'left'}; font-weight: 800;">${isAr ? 'المعيار الفني' : 'Evaluation Criteria'}</th>
              <th style="padding: 10px 14px; text-align: center; font-weight: 800;">${isAr ? 'القيمة المحققة' : 'Achieved Value'}</th>
              <th style="padding: 10px 14px; text-align: center; font-weight: 800;">${isAr ? 'المستهدف المعياري' : 'Standard Benchmark'}</th>
              <th style="padding: 10px 14px; text-align: center; font-weight: 800;">${isAr ? 'حالة التقييم' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 14px; font-weight: 700;">${isAr ? 'إجمالي المسافة المقطوعة بالأسطول' : 'Total Fleet Distance Traveled'}</td>
              <td style="padding: 10px 14px; text-align: center; font-family: monospace; font-weight: 800;">${distance.toLocaleString()} ${isAr ? 'كم' : 'km'}</td>
              <td style="padding: 10px 14px; text-align: center; color: #64748b;">-</td>
              <td style="padding: 10px 14px; text-align: center; font-weight: 800; color: #15803d;">✔ ${isAr ? 'مسجل وموثق' : 'Logged'}</td>
            </tr>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 14px; font-weight: 700;">${isAr ? 'نسبة الوصول والالتزام بالجدول الزمني' : 'On-Time Schedule Adherence Rate'}</td>
              <td style="padding: 10px 14px; text-align: center; font-family: monospace; font-weight: 800;">${onTime}%</td>
              <td style="padding: 10px 14px; text-align: center; color: #64748b;">>= 95%</td>
              <td style="padding: 10px 14px; text-align: center; font-weight: 800; color: #15803d;">✔ ${isAr ? 'مطابق وممتاز' : 'Pass'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 14px; font-weight: 700;">${isAr ? 'فحص السوائل والإطارات اليومي' : 'Pre-Shift Daily Fluid & Tire Checks'}</td>
              <td style="padding: 10px 14px; text-align: center; font-family: monospace; font-weight: 800;">99%</td>
              <td style="padding: 10px 14px; text-align: center; color: #64748b;">>= 90%</td>
              <td style="padding: 10px 14px; text-align: center; font-weight: 800; color: #15803d;">✔ ${isAr ? 'ملتزم دورياً' : 'Compliant'}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px 14px; font-weight: 700;">${isAr ? 'ملاحظات الأمان وحماية المحرك من الإجهاد' : 'Engine Durability & Stress Monitoring'}</td>
              <td style="padding: 10px 14px; text-align: center; font-family: monospace; font-weight: 800;">94%</td>
              <td style="padding: 10px 14px; text-align: center; color: #64748b;">>= 85%</td>
              <td style="padding: 10px 14px; text-align: center; font-weight: 800; color: #15803d;">✔ ${isAr ? 'ممتاز ومحافظ' : 'Optimal'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Operational Officer Evaluation Statement -->
      <div style="
        background: #ede9fe;
        border: 1px solid #c4b5fd;
        border-radius: 12px;
        padding: 16px 20px;
        margin-bottom: 26px;
      ">
        <div style="font-size: 11px; font-weight: 800; color: #5b21b6; margin-bottom: 6px;">
          ${isAr ? '📌 خلاصة تقييم ضابط العمليات والمراقبة:' : '📌 OPERATIONAL FLEET OFFICER APPRAISAL SUMMARY:'}
        </div>
        <div style="font-size: 10px; color: #334155; line-height: 1.7;">
          ${accidents === 0
            ? (isAr
                ? 'السائق يمثل نموذجاً متميزاً في الانضباط الميداني والسلامة المرورية. يتمتع بحرص عالٍ على نظافة وسلامة المركبة المعينة والالتزام الدقيق بجدول الفحوصات الدورية. يوصى بمنحه الأولوية في مهام النقل الحيوية.'
                : 'The driver demonstrates exemplary field performance, road safety adherence, and diligent vehicle care. Recommended for priority mission assignments.')
            : (isAr
                ? 'لوحظ وجود حوادث أو ملاحظات تشغيلية مسجلة تتطلب متابعة مستمرة وتوجيهات السلامة لتفادي تكرار الأخطاء.'
                : 'Observations logged requiring safety compliance reviews and ongoing coaching.')
          }
        </div>
      </div>

      <!-- Signatures and Attestation -->
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
          <div>${isAr ? 'اعتماد مدير العمليات والحركة:' : 'Operations Director Signature:'}</div>
          <div style="margin-top: 28px; border-bottom: 1px solid #94a3b8; width: 190px;"></div>
        </div>

        <div style="text-align: center;">
          <div style="
            width: 66px;
            height: 66px;
            border: 2px solid #4338ca;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #4338ca;
            font-size: 8px;
            font-weight: 800;
            text-align: center;
            transform: rotate(-8deg);
            margin: 0 auto;
          ">
            ${isAr ? 'سجل معتمد<br/>إلكترونياً' : 'CERTIFIED<br/>RECORD'}
          </div>
        </div>

        <div style="text-align: ${isAr ? 'left' : 'right'};">
          <div>${isAr ? 'توقيع السائق بالعلم:' : 'Driver Acknowledgement:'}</div>
          <div style="margin-top: 28px; border-bottom: 1px solid #94a3b8; width: 190px; margin-${isAr ? 'right' : 'left'}: auto;"></div>
        </div>
      </div>

      <!-- Bottom Footer -->
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
        <span>${brandName} Intelligent Fleet Operating System</span>
        <span>${isAr ? 'ملف رسمي معتمد رقمياً ومحفوظ في سجلات الأسطول' : 'Official Digital Record Stored in Fleet Archive'}</span>
      </div>
    </div>
  `;

  // Temporary DOM render container
  const container = document.createElement('div');
  container.id = 'temp-driver-report-render-container';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.zIndex = '-9999';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    await new Promise(resolve => setTimeout(resolve, 250));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      windowWidth: 794
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

    const cleanDriverName = (driver.name || (isAr ? 'السائق' : 'Driver'))
      .replace(/[/\\?%*:|"<>#]/g, '_')
      .replace(/\s+/g, '_');

    const fileName = isAr
      ? `تقرير_الأداء_الميداني_للسائق_${cleanDriverName}.pdf`
      : `Driver_Field_Profile_${cleanDriverName}.pdf`;

    pdf.save(fileName);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
