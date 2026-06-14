import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { LOGO_PNG_BASE64 } from '../assets/logoBase64.js';

export function generateBillPDF(order, items, customerDetails) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Header with gradient-like styling
  doc.setFillColor(10, 14, 26);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Logo image
  try {
    doc.addImage(LOGO_PNG_BASE64, 'PNG', margin, 10, 20, 20);
  } catch (e) {
    console.debug('Logo image failed to load in PDF:', e);
  }

  // Brand text next to logo
  doc.setTextColor(249, 115, 22);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PrintMyMemory', margin + 24, 22);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('3D Printed Photo Keepsakes', margin + 24, 29);
  doc.text('Bangalore, India', margin + 24, 35);
  doc.text('printmymemory120626@gmail.com | +91-94717-25271', margin + 24, 41);

  // Bill title
  doc.setTextColor(248, 250, 252);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', pageWidth - margin, 25, { align: 'right' });

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order #${order.id?.slice(0, 8).toUpperCase()}`, pageWidth - margin, 32, { align: 'right' });
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, pageWidth - margin, 38, { align: 'right' });
  doc.text(`Payment: ${(order.payment_method || 'online').toUpperCase()}`, pageWidth - margin, 44, { align: 'right' });

  // Bill to section
  let y = 65;
  doc.setTextColor(248, 250, 252);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', margin, y);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  y += 8;
  doc.text(customerDetails.name || order.guest_name || 'Guest', margin, y);
  y += 6;
  doc.text(customerDetails.email || order.guest_email || '-', margin, y);
  y += 6;
  doc.text(customerDetails.phone || order.guest_phone || '-', margin, y);
  y += 6;
  if (customerDetails.address) {
    doc.text(customerDetails.address, margin, y);
    y += 6;
  }

  // Items table
  y += 10;
  const tableData = items.map((item) => [
    item.product?.name || 'Product',
    item.quantity?.toString() || '1',
    `₹${(item.price || 0).toLocaleString('en-IN')}`,
    `₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}`,
  ]);

  doc.autoTable({
    startY: y,
    head: [['Item', 'Qty', 'Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 31, 46],
      textColor: [248, 250, 252],
      fontStyle: 'bold',
    },
    bodyStyles: {
      fillColor: [17, 24, 39],
      textColor: [148, 163, 184],
    },
    alternateRowStyles: {
      fillColor: [26, 31, 46],
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = 0;
  const discount = order.discount_amount || 0;
  const total = order.total_amount || subtotal;

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  doc.text('Subtotal:', pageWidth - margin - 80, finalY);
  doc.text(`₹${subtotal.toLocaleString('en-IN')}`, pageWidth - margin, finalY, { align: 'right' });

  doc.text('Shipping:', pageWidth - margin - 80, finalY + 7);
  doc.text(shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`, pageWidth - margin, finalY + 7, { align: 'right' });

  if (discount > 0) {
    doc.text(`Discount${order.voucher_code ? ' (' + order.voucher_code + ')' : ''}:`, pageWidth - margin - 80, finalY + 14);
    doc.text(`-₹${discount.toLocaleString('en-IN')}`, pageWidth - margin, finalY + 14, { align: 'right' });
  }

  doc.setTextColor(249, 115, 22);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', pageWidth - margin - 80, finalY + 28);
  doc.text(`₹${total.toLocaleString('en-IN')}`, pageWidth - margin, finalY + 28, { align: 'right' });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setDrawColor(30, 41, 59);
  doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for shopping with PrintMyMemory!', margin, footerY);
  doc.text('Questions? Reach us on WhatsApp at +91-94717-25271', margin, footerY + 5);
  doc.text('Instagram: @print.my.memory | Email: printmymemory120626@gmail.com', margin, footerY + 10);

  if (order.payment_method === 'cod') {
    doc.setTextColor(248, 250, 252);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Please keep ₹${total.toLocaleString('en-IN')} ready as Cash on Delivery.`, margin, footerY + 20);
  }

  return doc;
}

export function downloadBill(order, items, customerDetails) {
  const doc = generateBillPDF(order, items, customerDetails);
  const fileName = `PrintMyMemory-Invoice-${order.id?.slice(0, 8).toUpperCase()}.pdf`;
  doc.save(fileName);
}
