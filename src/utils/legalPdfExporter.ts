import { LegalDocument, LegalSettings } from '../types/legal';

export function downloadLegalDocumentAsPDF(doc: LegalDocument, settings: LegalSettings, lang: 'ar' | 'en' = 'ar'): void {
  const isAr = lang === 'ar';
  const title = isAr ? doc.titleAr : doc.titleEn;
  const summary = isAr ? doc.summaryAr : doc.summaryEn;
  const companyName = isAr ? settings.legalEntityNameAr : settings.legalEntityNameEn;
  const dateFormatted = new Date(doc.lastUpdated || doc.effectiveDate).toLocaleDateString(
    isAr ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  // Build clean HTML print window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.warn('Popup blocked. Please allow popups to print/download PDF.');
    return;
  }

  const sectionsHtml = doc.sections.map(sec => {
    const secTitle = isAr ? sec.titleAr : sec.titleEn;
    const secContent = (isAr ? sec.contentAr : sec.contentEn).replace(/\n/g, '<br/>');
    return `
      <div class="legal-section">
        <h2 class="section-title">${secTitle}</h2>
        <div class="section-content">${secContent}</div>
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html dir="${isAr ? 'rtl' : 'ltr'}" lang="${lang}">
      <head>
        <meta charset="utf-8" />
        <title>${title} - ${companyName}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm 15mm 20mm 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1e293b;
            background: #ffffff;
            line-height: 1.7;
            font-size: 11.5pt;
            margin: 0;
            padding: 10px;
          }
          .header-box {
            border-bottom: 2px solid #7c3aed;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .company-badge {
            font-size: 10pt;
            font-weight: 700;
            color: #6d28d9;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          h1 {
            font-size: 18pt;
            font-weight: 800;
            color: #0f172a;
            margin: 8px 0;
          }
          .meta-row {
            display: flex;
            gap: 20px;
            font-size: 9.5pt;
            color: #64748b;
            margin-top: 6px;
          }
          .summary-box {
            background: #f8fafc;
            border-${isAr ? 'right' : 'left'}: 4px solid #7c3aed;
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 25px;
            font-size: 10.5pt;
            color: #334155;
          }
          .legal-section {
            margin-bottom: 22px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 13pt;
            font-weight: 700;
            color: #1e1b4b;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 10px;
          }
          .section-content {
            font-size: 11pt;
            color: #334155;
            text-align: justify;
          }
          .footer-box {
            margin-top: 40px;
            border-top: 1px solid #cbd5e1;
            padding-top: 15px;
            font-size: 8.5pt;
            color: #64748b;
            text-align: center;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="company-badge">${companyName}</div>
          <h1>${title}</h1>
          <div class="meta-row">
            <span><strong>${isAr ? 'الإصدار:' : 'Version:'}</strong> ${doc.version}</span>
            <span><strong>${isAr ? 'تاريخ السريان:' : 'Effective Date:'}</strong> ${dateFormatted}</span>
            <span><strong>${isAr ? 'المرجع التنظيمي:' : 'Jurisdiction:'}</strong> ${isAr ? settings.jurisdictionAr : settings.jurisdictionEn}</span>
          </div>
        </div>

        <div class="summary-box">
          <strong>${isAr ? 'ملخص الوثيقة التنفيذي:' : 'Executive Summary:'}</strong><br/>
          ${summary}
        </div>

        <div class="sections-container">
          ${sectionsHtml}
        </div>

        <div class="footer-box">
          <div>${companyName} — ${isAr ? settings.addressAr : settings.addressEn}</div>
          <div>${isAr ? 'السجل التجاري:' : 'CR No:'} ${settings.crNumber} | ${isAr ? 'الرقم الضريبي:' : 'VAT ID:'} ${settings.vatNumber} | ${settings.legalContactEmail}</div>
          <div style="margin-top: 4px; font-size: 8pt;">© ${new Date().getFullYear()} FleetAurvexis. ${isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export async function shareLegalDocument(doc: LegalDocument, lang: 'ar' | 'en' = 'ar'): Promise<boolean> {
  const isAr = lang === 'ar';
  const title = isAr ? doc.titleAr : doc.titleEn;
  const summary = isAr ? doc.summaryAr : doc.summaryEn;
  const url = window.location.origin + window.location.pathname + `?legalDoc=${doc.id}&lang=${lang}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: summary,
        url
      });
      return true;
    } catch (e) {
      // Ignore user cancellation
      if ((e as any)?.name === 'AbortError') return false;
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed', err);
    return false;
  }
}
