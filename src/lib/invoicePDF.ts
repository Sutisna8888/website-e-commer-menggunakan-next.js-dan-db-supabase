import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { OrderHistoryItem } from '@/components/HistoryModal';

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
};

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

/**
 * Render satu halaman invoice ke dokumen jsPDF yang sudah ada
 */
function renderInvoicePage(doc: jsPDF, order: OrderHistoryItem) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // === HEADER: Brand & Invoice Title ===
  // Brand name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(234, 88, 12); // brand-orange
  doc.text('Rasa', margin, 25);
  const rasaWidth = doc.getTextWidth('Rasa');
  doc.setTextColor(26, 26, 26); // brand-dark
  doc.text('Nusantara', margin + rasaWidth, 25);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('Cita Rasa Autentik Nusantara', margin, 31);

  // Invoice title (right side)
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('INVOICE', pageWidth - margin, 25, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(`#${order.id.slice(0, 8).toUpperCase()}`, pageWidth - margin, 31, { align: 'right' });
  doc.text(formatDate(order.createdAt), pageWidth - margin, 36, { align: 'right' });

  // Orange line separator
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.8);
  doc.line(margin, 40, pageWidth - margin, 40);

  // === INFO BOXES ===
  let y = 48;
  const boxWidth = (contentWidth - 8) / 2;

  // Box 1: Alamat Pengiriman
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, y, boxWidth, 28, 3, 3, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(160, 160, 160);
  doc.text('ALAMAT PENGIRIMAN', margin + 5, y + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const addressLines = doc.splitTextToSize(order.address, boxWidth - 10);
  doc.text(addressLines, margin + 5, y + 14);

  // Box 2: Pembayaran & Status
  const box2X = margin + boxWidth + 8;
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(box2X, y, boxWidth, 28, 3, 3, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(160, 160, 160);
  doc.text('METODE PEMBAYARAN', box2X + 5, y + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(order.paymentMethod, box2X + 5, y + 14);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(160, 160, 160);
  doc.text('STATUS PESANAN', box2X + 5, y + 21);

  // Status badge
  const statusText = order.status === 'PENDING' ? 'Diproses' : order.status === 'DELIVERED' ? 'Selesai' : order.status;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  if (order.status === 'PENDING') {
    doc.setTextColor(146, 64, 14);
  } else if (order.status === 'DELIVERED') {
    doc.setTextColor(6, 95, 70);
  } else {
    doc.setTextColor(30, 64, 175);
  }
  doc.text(statusText, box2X + 5, y + 26);

  y += 36;

  // === TABLE: Item Pesanan ===
  const tableBody = order.orderItems.map(item => {
    const customizations: string[] = [];
    if (item.spiceLevel) {
      customizations.push(item.foodItem.category === 'Minuman' ? `Gula: ${item.spiceLevel}` : `Pedas: ${item.spiceLevel}`);
    }
    if (item.toppings) customizations.push(`Topping: ${item.toppings}`);
    if (item.notes) customizations.push(`Catatan: "${item.notes}"`);

    const menuName = customizations.length > 0
      ? `${item.foodItem.name}\n${customizations.join(' · ')}`
      : item.foodItem.name;

    return [
      menuName,
      String(item.quantity),
      formatPrice(item.price),
      formatPrice(item.price * item.quantity)
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Menu', 'Qty', 'Harga', 'Subtotal']],
    body: tableBody,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [249, 115, 22],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [50, 50, 50],
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'right', cellWidth: 32 },
      3: { halign: 'right', cellWidth: 35, fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    styles: {
      lineColor: [230, 230, 230],
      lineWidth: 0.3,
      overflow: 'linebreak',
    },
    theme: 'grid',
  });

  // === TOTALS ===
  const subtotal = order.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const pajak = Math.round(subtotal * 0.10);
  const ongkir = subtotal >= 50000 ? 0 : 12000;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY ?? y + 40;
  y = finalY + 8;

  const totalsX = pageWidth - margin - 75;
  const valuesX = pageWidth - margin;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);

  doc.text('Subtotal', totalsX, y);
  doc.text(formatPrice(subtotal), valuesX, y, { align: 'right' });
  y += 6;

  doc.text('Pajak Restoran (10%)', totalsX, y);
  doc.text(formatPrice(pajak), valuesX, y, { align: 'right' });
  y += 6;

  doc.text('Ongkos Kirim', totalsX, y);
  doc.text(ongkir === 0 ? 'GRATIS' : formatPrice(ongkir), valuesX, y, { align: 'right' });
  y += 4;

  // Grand total line
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.6);
  doc.line(totalsX, y, valuesX, y);
  y += 7;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(234, 88, 12);
  doc.text('Total Bayar', totalsX, y);
  doc.text(formatPrice(order.totalAmount), valuesX, y, { align: 'right' });

  // === FOOTER ===
  y += 20;
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 160, 160);
  doc.text('Terima kasih telah memesan di RasaNusantara!', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text('Dokumen ini dibuat secara otomatis dan sah tanpa tanda tangan.', pageWidth / 2, y, { align: 'center' });
}

/**
 * Generate invoice PDF untuk satu pesanan (langsung download)
 */
export function generateInvoicePDF(order: OrderHistoryItem) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  renderInvoicePage(doc, order);
  const fileName = `Invoice_RasaNusantara_${order.id.slice(0, 8).toUpperCase()}.pdf`;
  doc.save(fileName);
}

/**
 * Generate invoice PDF untuk semua pesanan dalam SATU file multi-halaman
 */
export function generateAllInvoicesPDF(orders: OrderHistoryItem[]) {
  if (orders.length === 0) return;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  orders.forEach((order, index) => {
    if (index > 0) {
      doc.addPage();
    }
    renderInvoicePage(doc, order);
  });

  const fileName = `Semua_Invoice_RasaNusantara_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}
