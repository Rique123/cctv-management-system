import { jsPDF } from 'jspdf';
import { Quotation, ServiceRequest, Installation } from '../types';

export const PdfService = {
  // Generate and download a branded CCTV Quotation PDF
  generateQuotationPdf(quotation: Quotation): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // --- Header & Brand Banner ---
    // Primary Header Background Bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(14, y, pageWidth - 28, 28, 'F');

    // Accent line
    doc.setFillColor(37, 99, 235); // blue-600
    doc.rect(14, y + 26, pageWidth - 28, 2, 'F');

    // Company Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('RIQUE DELIVERIES & CCTV SOLUTIONS', 20, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('Professional CCTV Installation, Maintenance, Solar & Security Automation', 20, y + 16);
    doc.text('Phone / WhatsApp: 0792093927 | Nairobi, Kenya | info@rique.co.ke', 20, y + 21);

    y += 36;

    // --- Quotation Title & Metadata Box ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('OFFICIAL CCTV QUOTATION', 14, y);

    // Status Pill
    doc.setFontSize(10);
    const statusText = `STATUS: ${quotation.status.toUpperCase()}`;
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(59, 130, 246);
    doc.roundedRect(pageWidth - 65, y - 6, 51, 8, 2, 2, 'FD');
    doc.setTextColor(37, 99, 235);
    doc.text(statusText, pageWidth - 60, y);

    y += 8;

    // Two column Client / Quotation Details
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(14, y, (pageWidth - 32) / 2, 34, 2, 2, 'FD');
    doc.roundedRect(pageWidth / 2 + 2, y, (pageWidth - 32) / 2, 34, 2, 2, 'FD');

    // Left Column: Client
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('CLIENT DETAILS:', 18, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(quotation.customerName, 18, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Phone: ${quotation.customerPhone}`, 18, y + 18);
    doc.text(`Email: ${quotation.customerEmail || 'N/A'}`, 18, y + 23);
    const splitLoc = doc.splitTextToSize(`Site: ${quotation.customerLocation}`, 80);
    doc.text(splitLoc, 18, y + 28);

    // Right Column: Quote Meta
    const rightX = pageWidth / 2 + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('QUOTATION DETAILS:', rightX, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Quote Ref: ${quotation.quoteNumber}`, rightX, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Date Issued: ${quotation.date}`, rightX, y + 18);
    doc.text(`Valid Until: ${quotation.validUntil}`, rightX, y + 23);
    doc.text(`Payment Status: ${quotation.paymentStatus} (${quotation.paymentMethod || 'M-Pesa / Bank'})`, rightX, y + 28);

    y += 42;

    // --- Items Table Header ---
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(14, y, pageWidth - 28, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);

    doc.text('#', 17, y + 5.5);
    doc.text('Description / Equipment Specs', 26, y + 5.5);
    doc.text('Qty', 125, y + 5.5);
    doc.text('Unit Price (KSh)', 140, y + 5.5);
    doc.text('Total (KSh)', 175, y + 5.5);

    y += 8;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8.5);

    quotation.items.forEach((item, index) => {
      // Row alternating background
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, pageWidth - 28, 8, 'F');
      }

      doc.text(String(index + 1), 17, y + 5.5);

      const splitDesc = doc.splitTextToSize(item.description, 95);
      doc.text(splitDesc[0], 26, y + 5.5);

      doc.text(String(item.quantity), 128, y + 5.5);
      doc.text(item.unitPrice.toLocaleString('en-KE'), 144, y + 5.5);
      doc.text(item.total.toLocaleString('en-KE'), 175, y + 5.5);

      y += 8;
    });

    // Divider Line
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, pageWidth - 14, y);
    y += 5;

    // --- Totals Section (Right Aligned) ---
    const totalBoxX = pageWidth - 90;
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    // Subtotal
    doc.text('Subtotal:', totalBoxX, y);
    doc.text(`KSh ${quotation.subtotal.toLocaleString('en-KE')}`, pageWidth - 16, y, { align: 'right' });
    y += 5;

    // Discount if any
    if (quotation.discount > 0) {
      doc.setTextColor(22, 163, 74); // green-600
      doc.text('Special Discount:', totalBoxX, y);
      doc.text(`- KSh ${quotation.discount.toLocaleString('en-KE')}`, pageWidth - 16, y, { align: 'right' });
      y += 5;
    }

    // Tax / VAT
    if (quotation.taxRate > 0) {
      doc.setTextColor(71, 85, 105);
      doc.text(`VAT (${quotation.taxRate}%):`, totalBoxX, y);
      doc.text(`KSh ${quotation.taxAmount.toLocaleString('en-KE')}`, pageWidth - 16, y, { align: 'right' });
      y += 5;
    }

    // Grand Total Box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(totalBoxX - 4, y - 1, 78, 10, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Total Amount:', totalBoxX, y + 6);
    doc.text(`KSh ${quotation.totalAmount.toLocaleString('en-KE')}`, pageWidth - 16, y + 6, { align: 'right' });
    y += 14;

    // Payments & Balance
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Amount Paid:', totalBoxX, y);
    doc.text(`KSh ${quotation.amountPaid.toLocaleString('en-KE')}`, pageWidth - 16, y, { align: 'right' });
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(quotation.balance > 0 ? 220 : 22, quotation.balance > 0 ? 38 : 163, quotation.balance > 0 ? 38 : 74);
    doc.text('Outstanding Balance:', totalBoxX, y);
    doc.text(`KSh ${quotation.balance.toLocaleString('en-KE')}`, pageWidth - 16, y, { align: 'right' });
    y += 12;

    // --- Terms & Payment Details ---
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, pageWidth - 14, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('PAYMENT DETAILS & WARRANTY TERMS:', 14, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('• M-Pesa Buy Goods / Till / Direct: 0792093927 (Rique Deliveries & CCTV Solutions)', 14, y);
    y += 4;
    doc.text('• Bank Transfer: Details provided upon request. Cheques payable to Rique Deliveries & CCTV Solutions.', 14, y);
    y += 4;
    doc.text('• Warranty: 2 Years manufacturer warranty on Cameras & NVR, 3 Years on Surveillance Hard Drives.', 14, y);
    y += 4;
    doc.text('• Free Remote Phone App Configuration (Hik-Connect / DMSS) included for up to 4 mobile devices.', 14, y);

    y += 10;

    // --- Signatures block ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);

    doc.text('Prepared By:', 14, y);
    doc.text('Client Acceptance Signature:', pageWidth / 2 + 10, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Rique Deliveries & CCTV Solutions Authorized Rep', 14, y);
    doc.text('Sign: ____________________  Date: __________', pageWidth / 2 + 10, y);

    // Save PDF
    doc.save(`Quotation_${quotation.quoteNumber}_Rique_CCTV.pdf`);
  },

  // Generate Service Job Card / Maintenance Report PDF
  generateServiceJobCardPdf(service: ServiceRequest): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(14, y, pageWidth - 28, 26, 'F');
    doc.setFillColor(234, 88, 12); // orange-600 accent
    doc.rect(14, y + 24, pageWidth - 28, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('RIQUE DELIVERIES & CCTV SOLUTIONS', 20, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text('CCTV MAINTENANCE & TECHNICAL SERVICE JOB CARD | HELPLINE: 0792093927', 20, y + 17);

    y += 34;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(`SERVICE JOB CARD: ${service.ticketNumber}`, 14, y);

    y += 8;

    // Ticket overview box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 38, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('CUSTOMER / PREMISES:', 18, y + 7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(service.customerName, 18, y + 13);
    doc.setFont('helvetica', 'normal');
    doc.text(`Phone: ${service.customerPhone} | Site: ${service.location}`, 18, y + 19);

    doc.setFont('helvetica', 'bold');
    doc.text(`Issue Type: ${service.issueType}`, 18, y + 26);
    doc.setTextColor(220, 38, 38);
    doc.text(`Priority Level: ${service.priority.toUpperCase()}`, 18, y + 32);

    // Right details
    const rx = pageWidth / 2 + 10;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('ASSIGNED TECHNICIAN:', rx, y + 7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(service.technicianName || 'Unassigned', rx, y + 13);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date Logged: ${service.createdAt}`, rx, y + 19);
    doc.text(`Status: ${service.status.toUpperCase()}`, rx, y + 26);
    doc.text(`Total Job Cost: KSh ${service.totalCost.toLocaleString('en-KE')}`, rx, y + 32);

    y += 46;

    // Problem Description
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Reported Problem Description:', 14, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const descLines = doc.splitTextToSize(service.description, pageWidth - 28);
    doc.text(descLines, 14, y);
    y += (descLines.length * 5) + 6;

    // Technician Notes Log
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Technician Service & Diagnostic Logs:', 14, y);
    y += 5;

    if (service.serviceNotes && service.serviceNotes.length > 0) {
      service.serviceNotes.forEach(note => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(37, 99, 235);
        doc.text(`[${note.timestamp}] ${note.author}:`, 14, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const noteLines = doc.splitTextToSize(note.text, pageWidth - 32);
        doc.text(noteLines, 18, y);
        y += (noteLines.length * 4.5) + 3;
      });
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('No technical field notes entered yet.', 14, y);
      y += 8;
    }

    // Cost Breakdown
    y += 4;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('REPAIR COST SUMMARY (KSh):', 18, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.text(`Spare Parts: KSh ${service.partsCost.toLocaleString('en-KE')}`, 18, y + 13);
    doc.text(`Labor & Diagnostic: KSh ${service.laborCost.toLocaleString('en-KE')}`, 80, y + 13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(`Total Charge: KSh ${service.totalCost.toLocaleString('en-KE')}`, 145, y + 13);

    y += 32;

    // Signatures
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Technician Signature & Stamp:', 14, y);
    doc.text('Client Acceptance & Verification:', pageWidth / 2 + 10, y);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Sign: ____________________', 14, y);
    doc.text('Sign: ____________________  Date: __________', pageWidth / 2 + 10, y);

    doc.save(`JobCard_${service.ticketNumber}_Rique_CCTV.pdf`);
  }
};
