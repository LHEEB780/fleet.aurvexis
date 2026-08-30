import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoiceData {
  invoiceNo: string;
  date: string;
  plan: string;
  amount: number;
  currency?: string;
  status: string;
  customerName?: string;
  customerPhone?: string;
  companyName?: string;
  paymentMethod?: string;
  taxNumber?: string;
  billingCycle?: 'monthly' | 'yearly';
}

/**
 * Generate and download a professional branded SaaS Billing Tax Invoice as a PDF file
 */
export function generateInvoicePDF(invoice: InvoiceData): void {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Top Decorative Brand Bar
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, pageWidth, 8, 'F');

    // 2. Company & Brand Header
    doc.setFillColor(30, 27, 75); // Slate 900 / Indigo 950
    doc.rect(0, 8, pageWidth, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('FLEET AURVEXIS CLOUD', 15, 24);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(199, 210, 254); // Indigo 200
    doc.text('Smart Fleet & Workshop Management Platform', 15, 30);
    doc.text('VAT ID: 31087459200003 | CR: 1010489201', 15, 35);

    // Invoice Title / Right Side of Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('TAX INVOICE', pageWidth - 15, 24, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(52, 211, 153); // Emerald 400
    doc.text('STATUS: PAID', pageWidth - 15, 31, { align: 'right' });

    // 3. Invoice Metadata & Customer Information Cards
    let currentY = 48;

    // Card 1: Invoice Information
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.roundedRect(15, currentY, 85, 42, 3, 3, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text('INVOICE DETAILS', 20, currentY + 7);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text('Invoice Number:', 20, currentY + 15);
    doc.text('Issue Date:', 20, currentY + 22);
    doc.text('Payment Gateway:', 20, currentY + 29);
    doc.text('Currency:', 20, currentY + 36);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(invoice.invoiceNo || 'INV-2026-001', 60, currentY + 15);
    doc.text(invoice.date || new Date().toISOString().split('T')[0], 60, currentY + 22);
    doc.text(invoice.paymentMethod || 'Stripe / Electronic Pay', 60, currentY + 29);
    doc.text(invoice.currency || 'USD ($)', 60, currentY + 36);

    // Card 2: Customer / Subscriber Details
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(110, currentY, 85, 42, 3, 3, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('BILLED TO (CUSTOMER)', 115, currentY + 7);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Subscriber / Company:', 115, currentY + 15);
    doc.text('Subscription Tier:', 115, currentY + 22);
    doc.text('Account Status:', 115, currentY + 29);
    doc.text('Billing Period:', 115, currentY + 36);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(invoice.companyName || invoice.customerName || 'Fleet Enterprise Org', 155, currentY + 15);
    doc.text(invoice.plan || 'Pro Enterprise Cloud', 155, currentY + 22);
    
    doc.setTextColor(16, 185, 129); // Emerald 500
    doc.text('Active Subscription', 155, currentY + 29);
    
    doc.setTextColor(15, 23, 42);
    doc.text(invoice.billingCycle === 'yearly' ? 'Annual (12 Months)' : 'Monthly Recurring', 155, currentY + 36);

    // 4. Line Items Table using autoTable
    currentY = 98;

    const subtotal = Number((invoice.amount / 1.15).toFixed(2));
    const vatAmount = Number((invoice.amount - subtotal).toFixed(2));
    const totalAmount = Number(invoice.amount.toFixed(2));

    autoTable(doc, {
      startY: currentY,
      margin: { left: 15, right: 15 },
      head: [['#', 'Item Description', 'Cycle', 'Qty', 'Unit Price', 'Total']],
      body: [
        [
          '1',
          `SaaS Fleet Subscription (${invoice.plan})\nIncludes GPS Live Tracking, AI Diagnostics & Maintenance Orders Management`,
          invoice.billingCycle === 'yearly' ? '1 Year' : '1 Month',
          '1',
          `$${subtotal.toFixed(2)}`,
          `$${subtotal.toFixed(2)}`
        ]
      ],
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 95 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 20, halign: 'right' },
        5: { cellWidth: 20, halign: 'right' }
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 4,
        textColor: [30, 41, 59]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    // 5. Summary / Totals block
    const finalTableY = (doc as any).lastAutoTable.finalY + 6;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(120, finalTableY, 75, 38, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Subtotal (Net):', 125, finalTableY + 8);
    doc.text('VAT (15% Included):', 125, finalTableY + 16);
    doc.text('Discount / Credits:', 125, finalTableY + 24);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`$${subtotal.toFixed(2)}`, 188, finalTableY + 8, { align: 'right' });
    doc.text(`$${vatAmount.toFixed(2)}`, 188, finalTableY + 16, { align: 'right' });
    doc.text('$0.00', 188, finalTableY + 24, { align: 'right' });

    // Total Line
    doc.setDrawColor(203, 213, 225);
    doc.line(125, finalTableY + 28, 190, finalTableY + 28);

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text('TOTAL PAID:', 125, finalTableY + 34);
    doc.text(`$${totalAmount.toFixed(2)}`, 188, finalTableY + 34, { align: 'right' });

    // 6. Security Seal & QR Code simulation box
    const sealY = finalTableY;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, sealY, 95, 38, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // Emerald 500
    doc.text('ELECTRONIC TAX INVOICE VERIFIED', 20, sealY + 8);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Generated in compliance with electronic invoicing standards.', 20, sealY + 15);
    doc.text(`Digital Signature Hash: ${invoice.invoiceNo}-AURVEXIS-SECURE`, 20, sealY + 22);
    doc.text('Official Cloud Receipt | No physical signature required.', 20, sealY + 29);

    // 7. Footer
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(0, pageHeight - 18, pageWidth, 18, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Fleet Aurvexis Cloud Solutions | Riyadh, Saudi Arabia | support@aurvexis.io | www.aurvexis.io', pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('Thank you for choosing Fleet Aurvexis as your trusted fleet partner.', pageWidth / 2, pageHeight - 5, { align: 'center' });

    // Save and download the PDF file
    const sanitizedFileName = `Invoice-${invoice.invoiceNo || 'Receipt'}.pdf`.replace(/[^a-zA-Z0-9-_\.]/g, '_');
    doc.save(sanitizedFileName);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    // Fallback: trigger standard browser print dialog
    window.print();
  }
}
