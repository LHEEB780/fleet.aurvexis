import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ArticleForPDF {
  id?: string;
  title: string;
  titleEn?: string;
  category?: string;
  categoryEn?: string;
  readTime?: string;
  date?: string;
  author?: string;
  summary?: string;
  content: string;
  tags?: string[] | string;
  image?: string | null;
  imageUrl?: string | null;
}

/**
 * Parses basic Markdown syntax in article content into clean HTML for PDF rendering
 */
function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split(/\r?\n/);
  const htmlParts: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      continue;
    }

    // Markdown Headers
    if (trimmed.startsWith('#### ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      const text = formatInlineText(trimmed.slice(5));
      htmlParts.push(`<h4 style="font-size: 15px; font-weight: 800; color: #1e1b4b; margin: 18px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">${text}</h4>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      const text = formatInlineText(trimmed.slice(4));
      htmlParts.push(`<h3 style="font-size: 17px; font-weight: 800; color: #4338ca; margin: 24px 0 10px 0; border-right: 4px solid #6366f1; padding-right: 8px;">${text}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      const text = formatInlineText(trimmed.slice(3));
      htmlParts.push(`<h2 style="font-size: 19px; font-weight: 900; color: #1e1b4b; margin: 26px 0 12px 0;">${text}</h2>`);
      continue;
    }

    // Unordered List (- or * or •)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      if (!inList) {
        htmlParts.push('<ul style="margin: 8px 0 14px 0; padding-right: 22px; list-style-type: square; color: #334155;">');
        inList = true;
      }
      const text = formatInlineText(trimmed.slice(2));
      htmlParts.push(`<li style="margin-bottom: 6px; line-height: 1.7; font-size: 13.5px;">${text}</li>`);
      continue;
    }

    // Numbered lists (e.g. 1. or 2.)
    const numberMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberMatch) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      const num = numberMatch[1];
      const text = formatInlineText(numberMatch[2]);
      htmlParts.push(`
        <div style="display: flex; gap: 8px; margin-bottom: 7px; align-items: flex-start; line-height: 1.7; font-size: 13.5px; color: #334155;">
          <span style="background: #ede9fe; color: #6d28d9; border-radius: 6px; padding: 1px 7px; font-weight: 800; font-size: 12px; margin-top: 2px;">${num}</span>
          <div style="flex: 1;">${text}</div>
        </div>
      `);
      continue;
    }

    if (inList) {
      htmlParts.push('</ul>');
      inList = false;
    }

    // Regular paragraph
    const formattedParagraph = formatInlineText(trimmed);
    htmlParts.push(`<p style="font-size: 13.5px; line-height: 1.8; color: #334155; margin: 0 0 12px 0;">${formattedParagraph}</p>`);
  }

  if (inList) {
    htmlParts.push('</ul>');
  }

  return htmlParts.join('\n');
}

/**
 * Formats inline bold, italic, code, and links
 */
function formatInlineText(str: string): string {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 800; color: #0f172a;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="color: #475569;">$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #6d28d9;">$1</code>');
}

/**
 * Ensures Cairo and Tajawal fonts are loaded in document head
 */
function ensureArabicFontsLoaded(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();

  const fontId = 'google-arabic-fonts-pdf';
  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap';
    document.head.appendChild(link);
  }

  if (document.fonts && document.fonts.ready) {
    return document.fonts.ready.then(() => {}).catch(() => {});
  }
  return Promise.resolve();
}

/**
 * Builds clean HTML markup for the article document with full UTF-8 encoding
 */
export function buildArticleDocumentHtml(article: ArticleForPDF, isRtl: boolean = true): string {
  const coverImage = article.image || article.imageUrl;
  const brandName = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('saas_brand_name') || 'FleetAurvexis'
    : 'FleetAurvexis';

  const tagsArray = Array.isArray(article.tags)
    ? article.tags
    : typeof article.tags === 'string'
    ? article.tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const formattedContent = parseMarkdownToHtml(article.content || '');

  return `
    <div class="pdf-container" dir="${isRtl ? 'rtl' : 'ltr'}" style="
      width: 794px;
      min-height: 1123px;
      background-color: #ffffff;
      color: #0f172a;
      font-family: 'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif;
      padding: 44px 50px;
      box-sizing: border-box;
      direction: ${isRtl ? 'rtl' : 'ltr'};
      text-align: ${isRtl ? 'right' : 'left'};
      position: relative;
    ">
      <!-- Top Brand Header Bar -->
      <div style="border-bottom: 2px solid #7c3aed; padding-bottom: 18px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; direction: ${isRtl ? 'rtl' : 'ltr'};">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 46px; height: 46px; border-radius: 12px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; box-shadow: 0 4px 10px rgba(124, 58, 237, 0.25);">
            🚚
          </div>
          <div>
            <div style="font-size: 19px; font-weight: 900; color: #1e1b4b; letter-spacing: -0.5px;">${brandName}</div>
            <div style="font-size: 11px; color: #6d28d9; font-weight: 700;">منصة ذكاء الأساطيل وإدارة الورش والصيانة</div>
          </div>
        </div>

        <div style="text-align: ${isRtl ? 'left' : 'right'}; font-size: 10.5px; color: #64748b; line-height: 1.5;">
          <div style="display: inline-block; background: #ede9fe; color: #6d28d9; padding: 2px 10px; border-radius: 6px; font-weight: 800; margin-bottom: 3px;">
            نسخة رسمية معتمدة PDF
          </div>
          <div style="font-family: monospace; font-size: 10px; color: #94a3b8;">
            UTF-8 ENCODED • ARABIC SUPPORTED
          </div>
        </div>
      </div>

      <!-- Category & Meta Row -->
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 18px;">
        ${article.category ? `
          <span style="background: #f5f3ff; color: #6d28d9; padding: 4px 14px; border-radius: 9999px; font-size: 11.5px; font-weight: 800; border: 1px solid #ddd6fe;">
            🏷️ ${article.category}
          </span>
        ` : ''}
        ${article.readTime ? `
          <span style="background: #f8fafc; color: #475569; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 600; border: 1px solid #e2e8f0;">
            ⏱️ ${article.readTime}
          </span>
        ` : ''}
        ${article.date ? `
          <span style="background: #f8fafc; color: #475569; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 600; border: 1px solid #e2e8f0;">
            📅 ${article.date}
          </span>
        ` : ''}
        <span style="background: #ecfdf5; color: #065f46; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; border: 1px solid #a7f3d0; margin-right: auto;">
          ✓ مستند مدقق
        </span>
      </div>

      <!-- Article Main Title -->
      <h1 style="font-size: 24px; font-weight: 900; line-height: 1.45; color: #0f172a; margin: 0 0 20px 0; letter-spacing: -0.3px;">
        ${article.title}
      </h1>

      <!-- Cover Image (Optional) -->
      ${coverImage ? `
        <div style="margin-bottom: 24px; border-radius: 14px; overflow: hidden; max-height: 270px; border: 1px solid #e2e8f0; background: #f8fafc;">
          <img src="${coverImage}" style="width: 100%; height: 260px; object-fit: cover; display: block;" crossorigin="anonymous" />
        </div>
      ` : ''}

      <!-- Executive Summary Box -->
      ${article.summary ? `
        <div style="background: #fbfbfe; border-right: 4px solid #7c3aed; border-radius: 10px; padding: 18px 22px; margin-bottom: 24px; border: 1px solid #ede9fe; border-right-width: 4px;">
          <div style="font-weight: 900; color: #5b21b6; margin-bottom: 6px; font-size: 13px; display: flex; align-items: center; gap: 6px;">
            💡 ملخص ومستخلص المقال:
          </div>
          <div style="color: #334155; font-size: 13.5px; line-height: 1.8; font-weight: 500;">
            ${article.summary}
          </div>
        </div>
      ` : ''}

      <!-- Formatted Article Content -->
      <div class="pdf-body" style="margin-bottom: 30px;">
        ${formattedContent}
      </div>

      <!-- Tags Section -->
      ${tagsArray.length > 0 ? `
        <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 11px; font-weight: 800; color: #64748b;">الكلمات المفتاحية:</span>
          ${tagsArray.map(tag => `
            <span style="background: #f1f5f9; color: #475569; padding: 2px 10px; border-radius: 6px; font-size: 11px; font-family: monospace;">#${tag.replace(/^#/, '')}</span>
          `).join('')}
        </div>
      ` : ''}

      <!-- Official Footer -->
      <div style="margin-top: 36px; padding-top: 20px; border-top: 1.5px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; direction: ${isRtl ? 'rtl' : 'ltr'};">
        <div>
          <div>الجهة الناشرة: <strong style="color: #1e293b;">${article.author || `${brandName} AI Technical Editorial`}</strong></div>
          <div style="margin-top: 3px; font-size: 10px;">جميع الحقوق محفوظة لمنصة ${brandName} لإدارة وتشغيل الأساطيل © ${new Date().getFullYear()}</div>
        </div>
        <div style="text-align: ${isRtl ? 'left' : 'right'};">
          <div style="font-family: monospace; font-size: 10.5px; font-weight: bold; color: #7c3aed;">
            ART-REF-${(article.id || 'PUB').toUpperCase()}
          </div>
          <div style="font-size: 9.5px; color: #94a3b8; margin-top: 2px;">
            تم التوليد بتنسيق PDF بترميز UTF-8 سليم
          </div>
        </div>
      </div>
    </div>
  `;
}

export function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Triggers a completely silent, direct browser download to the user's computer or mobile device.
 * NO popups, NO target="_blank", NO intermediate pages.
 */
export function triggerDirectDownload(blobOrUrl: Blob | string, fileName: string): boolean {
  try {
    let url: string;
    let shouldRevoke = false;

    if (typeof blobOrUrl === 'string') {
      url = blobOrUrl;
    } else {
      url = URL.createObjectURL(blobOrUrl);
      shouldRevoke = true;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.position = 'fixed';
    a.style.left = '-9999px';
    a.style.top = '-9999px';
    a.style.opacity = '0';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      try {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        if (shouldRevoke) {
          URL.revokeObjectURL(url);
        }
      } catch {
        // ignore
      }
    }, 3000);

    return true;
  } catch (err) {
    console.error('Direct download trigger error:', err);
    return false;
  }
}

/**
 * Downloads the article directly as a Microsoft Word document (.doc).
 * Instant (0ms delay), 100% reliable across all computers and mobile devices (Android & iOS).
 * Fully formatted with Cairo font, Arabic RTL support, metadata, headings, and tables.
 */
export function downloadArticleAsWord(
  article: ArticleForPDF,
  language: string = 'ar'
): { success: boolean; fileName: string } {
  const isRtl = language === 'ar';
  const safeTitle = (article.title || 'مقال')
    .replace(/[/\\?%*:|"<>#]/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 45);
  const fileName = `مقال_${safeTitle}.doc`;

  const brandName = 'FleetAurvexis';
  const tagsArray = Array.isArray(article.tags) 
    ? article.tags 
    : (typeof article.tags === 'string' ? article.tags.split(',').map(t => t.trim()).filter(Boolean) : []);

  const htmlContent = parseMarkdownToHtml(article.content || '');

  const wordDocument = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${escapeXml(article.title || 'مقال')}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 595.3pt 841.9pt; /* A4 standard */
      margin: 50.0pt 50.0pt 50.0pt 50.0pt;
      mso-header-margin: 36.0pt;
      mso-footer-margin: 36.0pt;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
      font-size: 11.5pt;
      line-height: 1.7;
      direction: ${isRtl ? 'rtl' : 'ltr'};
      text-align: ${isRtl ? 'right' : 'left'};
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 20pt;
      font-weight: bold;
      color: #312e81;
      margin-top: 10pt;
      margin-bottom: 12pt;
      line-height: 1.35;
    }
    h2 {
      font-size: 15pt;
      font-weight: bold;
      color: #4338ca;
      margin-top: 16pt;
      margin-bottom: 8pt;
      border-bottom: 1.5pt solid #e0e7ff;
      padding-bottom: 4pt;
    }
    h3 {
      font-size: 13pt;
      font-weight: bold;
      color: #4f46e5;
      margin-top: 12pt;
      margin-bottom: 6pt;
    }
    h4 {
      font-size: 11.5pt;
      font-weight: bold;
      color: #1e1b4b;
      margin-top: 10pt;
      margin-bottom: 4pt;
    }
    p {
      margin-top: 0;
      margin-bottom: 8pt;
      line-height: 1.7;
    }
    ul, ol {
      margin-top: 4pt;
      margin-bottom: 10pt;
      padding-right: 20pt;
      padding-left: 20pt;
    }
    li {
      margin-bottom: 4pt;
      line-height: 1.6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12pt;
      margin-bottom: 14pt;
    }
    th, td {
      border: 1pt solid #cbd5e1;
      padding: 6pt 8pt;
      font-size: 10pt;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
      color: #1e293b;
    }
    .header-box {
      border-bottom: 2pt solid #6366f1;
      padding-bottom: 12pt;
      margin-bottom: 16pt;
    }
    .meta-table {
      width: 100%;
      border: none;
      margin-bottom: 12pt;
    }
    .meta-table td {
      border: none;
      padding: 3pt 6pt;
      font-size: 10pt;
      color: #64748b;
    }
    .summary-card {
      background-color: #f5f3ff;
      border-right: ${isRtl ? '4pt solid #7c3aed' : 'none'};
      border-left: ${isRtl ? 'none' : '4pt solid #7c3aed'};
      padding: 10pt 14pt;
      margin-top: 10pt;
      margin-bottom: 16pt;
      border-radius: 4pt;
    }
    .footer-box {
      border-top: 1pt dashed #cbd5e1;
      margin-top: 25pt;
      padding-top: 10pt;
      font-size: 9.5pt;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
<div class="Section1">
  <div class="header-box">
    <div style="font-size: 10.5pt; font-weight: bold; color: #6366f1; text-transform: uppercase; letter-spacing: 0.5pt;">
      ${brandName} Fleet & Equipment Technical Articles
    </div>
    <h1>${escapeXml(article.title)}</h1>
    
    <table class="meta-table">
      <tr>
        <td><strong>التصنيف:</strong> ${escapeXml(article.category || 'صيانة وتشغيل الأساطيل')}</td>
        <td><strong>تاريخ النشر:</strong> ${escapeXml(article.date || new Date().toISOString().split('T')[0])}</td>
        <td><strong>وقت القراءة:</strong> ${escapeXml(article.readTime || '3 دقائق')}</td>
        <td><strong>الكاتب:</strong> ${escapeXml(article.author || `${brandName} AI Technical Editorial`)}</td>
      </tr>
    </table>
  </div>

  ${article.summary ? `
    <div class="summary-card">
      <div style="font-size: 11pt; font-weight: bold; color: #5b21b6; margin-bottom: 4pt;">خلاصة المقال:</div>
      <p style="margin: 0; color: #334155;">${escapeXml(article.summary)}</p>
    </div>
  ` : ''}

  <div class="content-body">
    ${htmlContent}
  </div>

  ${tagsArray.length > 0 ? `
    <p style="margin-top: 15pt; font-size: 10pt; color: #64748b;">
      <strong>الكلمات المفتاحية:</strong> ${tagsArray.map(t => `#${t.replace(/^#/, '')}`).join('، ')}
    </p>
  ` : ''}

  <div class="footer-box">
    <p style="margin: 0;">جميع الحقوق محفوظة لمنصة ${brandName} لإدارة وتشغيل الأساطيل الذكية © ${new Date().getFullYear()}</p>
    <p style="margin: 3pt 0 0 0; font-size: 8.5pt;">تم التصدير بصيغة مستند Word متوافق مع ترميز UTF-8 لدعم اللغة العربية بدقة تامة.</p>
  </div>
</div>
</body>
</html>
  `.trim();

  // Create UTF-8 Blob with BOM for 100% Arabic compatibility
  const blob = new Blob(['\uFEFF' + wordDocument], { type: 'application/msword;charset=utf-8' });
  triggerDirectDownload(blob, fileName);

  return { success: true, fileName };
}

export interface PDFGenerationResult {
  success: boolean;
  method: 'direct-pdf' | 'print-fallback' | 'word-fallback';
  fileName: string;
  blob?: Blob;
  blobUrl?: string;
  error?: string;
}

/**
 * Downloads the article directly as a clean, high-resolution PDF file.
 * Triggers direct download immediately without opening any popup tabs or new pages.
 */
export async function downloadArticleAsPDF(
  article: ArticleForPDF,
  language: string = 'ar'
): Promise<PDFGenerationResult> {
  const isRtl = language === 'ar';
  const safeTitle = (article.title || 'مقال')
    .replace(/[/\\?%*:|"<>#]/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 45);
  const fileName = `مقال_${safeTitle}.pdf`;

  try {
    // 1. Ensure fonts are loaded
    await ensureArabicFontsLoaded();

    // 2. Create isolated container in DOM for html2canvas
    const renderDiv = document.createElement('div');
    renderDiv.id = 'temp-pdf-render-container';
    renderDiv.style.position = 'fixed';
    renderDiv.style.left = '-9999px';
    renderDiv.style.top = '0';
    renderDiv.style.zIndex = '-99999';
    renderDiv.style.width = '794px';
    renderDiv.style.backgroundColor = '#ffffff';

    renderDiv.innerHTML = buildArticleDocumentHtml(article, isRtl);
    document.body.appendChild(renderDiv);

    // Wait for any images or fonts to finish rendering in DOM
    await new Promise(resolve => setTimeout(resolve, 300));

    // 3. Render container to high-res canvas (scale 2 for crisp 300dpi-like output)
    const canvas = await html2canvas(renderDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794
    });

    // Clean up DOM immediately
    if (document.body.contains(renderDiv)) {
      document.body.removeChild(renderDiv);
    }

    // 4. Initialize jsPDF in A4 Portrait mode
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 8; // mm
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = (canvas.height * contentWidth) / canvas.width;
    const pageAvailableHeight = pageHeight - (margin * 2);

    // If single page
    if (contentHeight <= pageAvailableHeight) {
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight, undefined, 'FAST');
    } else {
      // Multi-page slicing for long articles
      const pxPerPage = Math.floor((canvas.width / contentWidth) * pageAvailableHeight);
      let renderedPx = 0;
      let pageIndex = 0;

      while (renderedPx < canvas.height) {
        const slicePx = Math.min(pxPerPage, canvas.height - renderedPx);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = slicePx;
        const ctx = sliceCanvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            renderedPx,
            canvas.width,
            slicePx,
            0,
            0,
            canvas.width,
            slicePx
          );

          const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.95);
          const sliceHeightMm = (slicePx * contentWidth) / canvas.width;

          if (pageIndex > 0) {
            pdf.addPage();
          }

          pdf.addImage(sliceImgData, 'JPEG', margin, margin, contentWidth, sliceHeightMm, undefined, 'FAST');
        }

        renderedPx += slicePx;
        pageIndex++;
      }
    }

    // 5. Generate actual PDF blob & trigger immediate direct download to device
    const pdfBlob = pdf.output('blob');
    
    // Direct download without target="_blank"
    triggerDirectDownload(pdfBlob, fileName);

    return { 
      success: true, 
      method: 'direct-pdf', 
      fileName, 
      blob: pdfBlob
    };
  } catch (error) {
    console.warn('Direct canvas PDF generation encountered an issue, falling back to instant Word document:', error);
    // Instant direct fallback to Word document which downloads directly without opening pages!
    downloadArticleAsWord(article, language);
    return { 
      success: true, 
      method: 'word-fallback', 
      fileName: `مقال_${safeTitle}.doc`, 
      error: String(error) 
    };
  }
}

/**
 * System Print-to-PDF Engine:
 * Creates an isolated iframe with complete UTF-8 HTML document, Cairo Google Font,
 * and triggers iframe.contentWindow.print(), where the user chooses "Save as PDF".
 * This is 100% immune to CORS restrictions and produces native vector text.
 */
export function printArticleToPDF(article: ArticleForPDF, language: string = 'ar'): void {
  const isRtl = language === 'ar';
  const safeTitle = (article.title || 'مقال')
    .replace(/[/\\?%*:|"<>#]/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 45);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    console.error('Unable to access print iframe document');
    return;
  }

  const printDocumentHtml = `
    <!DOCTYPE html>
    <html dir="${isRtl ? 'rtl' : 'ltr'}" lang="${isRtl ? 'ar' : 'en'}">
      <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>مقال_${safeTitle} - FleetAurvexis PDF</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap');

          @page {
            size: A4 portrait;
            margin: 12mm 14mm 16mm 14mm;
          }

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            font-family: 'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            color: #0f172a;
            direction: ${isRtl ? 'rtl' : 'ltr'};
            text-align: ${isRtl ? 'right' : 'left'};
          }

          .pdf-container {
            width: 100% !important;
            min-height: auto !important;
            padding: 10px !important;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        ${buildArticleDocumentHtml(article, isRtl)}
      </body>
    </html>
  `;

  doc.open();
  doc.write(printDocumentHtml);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Print trigger failed:', e);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }
  }, 600);
}
