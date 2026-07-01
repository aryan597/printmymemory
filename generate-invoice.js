import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';

// Read logo base64
const logoBase64 = fs.readFileSync('logo_base64.txt', 'utf8');

// Generate random order ID
function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Invoice data
const order = {
  id: generateOrderId(),
  created_at: new Date().toISOString(),
  payment_method: 'online',
  payment_status: 'paid',
  discount_amount: 0,
  total_amount: 1200
};

const items = [
  {
    name: '3D memorable pet dog miniature 10cm height',
    quantity: 1,
    price: 1150
  },
  {
    name: 'Free Coaster (Complimentary from PrintMyMemory)',
    quantity: 1,
    price: 0
  }
];

const customerDetails = {
  name: 'Prachee and Sunny',
  email: 'printmymemory120626@gmail.com',
  phone: '9871169579',
  address: 'B-101, Bhardwaj sky, Shankar nag\nBhawna nagar, Raipur, 492004'
};

function generateInvoice() {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // White background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top header bar with date and website title
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleString('en-IN'), margin, 12);
  doc.text('PrintMyMemory - Turn Your Memories Into Personalized 3D Gifts', pageWidth - margin, 12, { align: 'right' });

  // Light gray border box - starts at y=20
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin - 5, 20, contentWidth + 10, 255, 3, 3, 'S');

  // PrintMyMemory title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PrintMyMemory', margin + 5, 38);

  // Tax Invoice / Receipt subtitle
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Tax Invoice / Receipt', margin + 5, 48);

  // Order details on the right
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order  #${order.id.toUpperCase()}`, pageWidth - margin - 5, 38, { align: 'right' });
  
  doc.setTextColor(100, 100, 100);
  doc.text(new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), pageWidth - margin - 5, 48, { align: 'right' });
  doc.text(`Payment: ${order.payment_method.toUpperCase()}`, pageWidth - margin - 5, 56, { align: 'right' });
  doc.text(`Status: ${order.payment_status.toUpperCase()}`, pageWidth - margin - 5, 64, { align: 'right' });

  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin + 5, 72, pageWidth - margin - 5, 72);

  // FROM section
  let y = 82;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM', margin + 5, y);

  y += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PrintMyMemory', margin + 5, y);

  y += 8;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Bangalore, India', margin + 5, y);

  y += 8;
  doc.text('+91-94717-25271', margin + 12, y);
  // Phone icon placeholder
  doc.setDrawColor(150, 150, 150);
  doc.circle(margin + 6, y - 2, 1.5, 'S');

  y += 8;
  // Truncate email if too long
  const email = 'printmymemory120626@gmail.com';
  const maxEmailWidth = contentWidth / 2 - 15;
  let displayEmail = email;
  if (doc.getTextWidth(email) > maxEmailWidth) {
    displayEmail = email.substring(0, 22) + '...';
  }
  doc.text(displayEmail, margin + 12, y);
  // Email icon placeholder
  doc.setDrawColor(150, 150, 150);
  doc.circle(margin + 6, y - 2, 1.5, 'S');

  // SHIP TO section
  y = 82;
  const shipX = pageWidth / 2 + 10;
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('SHIP TO', shipX, y);

  y += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(customerDetails.name, shipX, y);

  y += 8;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Location icon
  doc.setDrawColor(150, 150, 150);
  doc.circle(shipX + 3, y - 2, 1.5, 'S');
  
  const addressLines = customerDetails.address.split('\n');
  doc.text(addressLines[0], shipX + 8, y);
  
  for (let i = 1; i < addressLines.length; i++) {
    y += 6;
    doc.text(addressLines[i], shipX + 8, y);
  }

  y += 8;
  doc.text(`Phone: ${customerDetails.phone}`, shipX, y);
  
  y += 8;
  // Truncate customer email if too long
  const custEmail = customerDetails.email.toUpperCase();
  let displayCustEmail = custEmail;
  if (doc.getTextWidth(custEmail) > maxEmailWidth) {
    displayCustEmail = custEmail.substring(0, 22) + '...';
  }
  doc.text(`Email: ${displayCustEmail}`, shipX, y);

  // Items table - with proper margins to fit inside border
  y += 12;
  
  const tableData = items.map((item) => [
    item.name,
    item.quantity.toString(),
    item.price > 0 ? `Rs. ${item.price}` : 'FREE',
    item.price > 0 ? `Rs. ${item.price * item.quantity}` : 'FREE',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Item', 'Qty', 'Price', 'Total']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 10,
      lineWidth: 0.5,
      lineColor: [100, 100, 100],
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 9,
      lineWidth: 0.3,
      lineColor: [200, 200, 200],
    },
    styles: {
      cellPadding: 4,
      font: 'helvetica',
    },
    columnStyles: {
      0: { cellWidth: 'auto', fontStyle: 'normal' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
    margin: { left: margin + 8, right: margin + 8 },
    tableWidth: contentWidth - 6,
    didDrawCell: function(data) {
      // Draw top border for header
      if (data.row.section === 'head') {
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      }
      // Draw bottom border for last row
      if (data.row.section === 'body' && data.row.index === data.table.body.length - 1) {
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      }
    }
  });

  // Totals section
  const finalY = doc.lastAutoTable.finalY + 10;
  const totalsX = pageWidth - margin - 8;
  
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = 50;
  const total = subtotal + shipping;

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal', totalsX - 60, finalY, { align: 'left' });
  doc.text(`Rs. ${subtotal}`, totalsX, finalY, { align: 'right' });

  doc.text('Shipping', totalsX - 60, finalY + 10, { align: 'left' });
  doc.text(`Rs. ${shipping}`, totalsX, finalY + 10, { align: 'right' });

  // Line above total
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.line(totalsX - 60, finalY + 16, totalsX, finalY + 16);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total', totalsX - 60, finalY + 28, { align: 'left' });
  doc.text(`Rs. ${total}`, totalsX, finalY + 28, { align: 'right' });

  // Footer line
  const footerY = finalY + 40;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin + 8, footerY, pageWidth - margin - 8, footerY);

  // Thank you message
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for shopping with PrintMyMemory!', pageWidth / 2, footerY + 10, { align: 'center' });
  
  doc.setFontSize(9);
  doc.text('Questions? Reach us on WhatsApp at +91-94717-25271 or email printmymemory120626@gmail.com', pageWidth / 2, footerY + 18, { align: 'center' });

  // Paid online message
  doc.setTextColor(0, 128, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PAID ONLINE', pageWidth / 2, footerY + 30, { align: 'center' });

  // Bottom URL - outside the border box
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('https://printmymemory.ind.in', margin + 5, 280);
  doc.text('1/1', pageWidth - margin - 5, 280, { align: 'right' });

  // Save the PDF
  const fileName = `PrintMyMemory - Invoice ${order.id.toUpperCase()}.pdf`;
  doc.save(fileName);
  console.log(`Invoice generated successfully: ${fileName}`);
  console.log(`Order ID: ${order.id.toUpperCase()}`);
}

// Run the generator
generateInvoice();
