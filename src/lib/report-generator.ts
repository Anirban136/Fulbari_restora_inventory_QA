import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper to draw a high-fidelity "Elite" pie chart on a canvas
function drawPieToDataUrl(
  data: { label: string, value: number, color: string }[], 
  centerLabel: string = "TOTAL",
  size: number = 400
) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let startAngle = -Math.PI / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  const donutRadius = radius * 0.65;

  // Clear background (Zinc-950 matched)
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, size, size);

  data.forEach(item => {
    if (item.value === 0) return;
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    
    // Draw slice with glow
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = item.color;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.fillStyle = item.color;
    ctx.fill();
    ctx.restore();

    // Draw Pie Text Labels (Intuitive Data)
    const midAngle = startAngle + sliceAngle / 2;
    const labelRadius = radius * 1.25;
    const lx = centerX + Math.cos(midAngle) * labelRadius;
    const ly = centerY + Math.sin(midAngle) * labelRadius;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.textAlign = midAngle > Math.PI / 2 || midAngle < -Math.PI / 2 ? 'right' : 'left';
    ctx.fillText(`${item.label}`, lx, ly - 5);
    
    ctx.fillStyle = item.color;
    ctx.font = 'black 16px Inter, system-ui, sans-serif';
    ctx.fillText(`${((item.value / total) * 100).toFixed(0)}%`, lx, ly + 15);

    // Draw connector line
    ctx.beginPath();
    ctx.moveTo(centerX + Math.cos(midAngle) * radius, centerY + Math.sin(midAngle) * radius);
    ctx.lineTo(lx, ly);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.stroke();

    startAngle += sliceAngle;
  });

  // Donut Hole
  ctx.beginPath();
  ctx.arc(centerX, centerY, donutRadius, 0, 2 * Math.PI);
  ctx.fillStyle = '#18181b'; // Zinc-900
  ctx.fill();
  
  // Center Label
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#71717a'; // Zinc-400
  ctx.font = 'bold 12px Inter, system-ui, sans-serif';
  ctx.fillText(centerLabel, centerX, centerY - 10);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'black 22px Inter, system-ui, sans-serif';
  ctx.fillText(`₹${total > 1000 ? (total/1000).toFixed(1) + 'K' : total}`, centerX, centerY + 12);

  return canvas.toDataURL('image/png');
}

export async function generateTransactionPDF(data: any, fromDate: string, toDate: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // --- 1. DARK ELITE BACKGROUND ---
  doc.setFillColor(9, 9, 11); // Zinc-950
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // --- 2. HEADER: WEB-STYLE ACCENT ---
  doc.setFillColor(16, 185, 129); // Emerald-500
  doc.rect(0, 0, pageWidth, 5, 'F'); // Top accent bar

  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("FULBARI", pageWidth / 2, 30, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text("OPERATIONS REPOSITORY • PERFORMANCE AUDIT", pageWidth / 2, 40, { align: "center", charSpace: 2 });

  // --- 3. ANALYTICS GRID ---
  const grandTotal = data.transactions.reduce((sum: number, t: any) => sum + t.totalAmount, 0);
  const totalCash = data.transactions.filter((t:any) => t.paymentMode === "CASH").reduce((s:number, t:any) => s+t.totalAmount, 0);
  const totalUPI = data.transactions.filter((t:any) => t.paymentMode === "ONLINE" || t.paymentMode === "UPI").reduce((s:number, t:any) => s+t.totalAmount, 0);
  const cafeTotal = data.transactions.filter((t:any) => t.Outlet.name.toUpperCase().includes("CAFE")).reduce((s:number, t:any) => s+t.totalAmount, 0);
  const chaiTotal = data.transactions.filter((t:any) => t.Outlet.name.toUpperCase().includes("CHAI")).reduce((s:number, t:any) => s+t.totalAmount, 0);

  // Summary Container (Semi-transparent feel)
  doc.setDrawColor(39, 39, 42); // Zinc-800
  doc.setFillColor(24, 24, 27); // Zinc-900
  doc.roundedRect(10, 50, pageWidth - 20, 115, 6, 6, 'FD');

  const paymentMixImg = drawPieToDataUrl([
    { label: 'CASH', value: totalCash, color: '#10b981' },
    { label: 'ONLINE', value: totalUPI, color: '#3b82f6' }
  ], "PAYMENTS");

  const outletMixImg = drawPieToDataUrl([
    { label: 'CAFE', value: cafeTotal, color: '#8b5cf6' },
    { label: 'CHAI', value: chaiTotal, color: '#f59e0b' }
  ], "OUTLETS");

  // Charts Position
  doc.addImage(paymentMixImg, 'PNG', 15, 65, 85, 85);
  doc.addImage(outletMixImg, 'PNG', pageWidth - 100, 65, 85, 85);

  // Big Callout
  doc.setFillColor(16, 185, 129, 0.1);
  doc.roundedRect(pageWidth/2 - 40, 150, 80, 10, 2, 2, 'F');
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(10);
  doc.text(`TOTAL REVENUE: ₹${grandTotal.toLocaleString()}`, pageWidth / 2, 157, { align: 'center' });

  // --- 4. DATA AUDIT TABLE (WEB-STYLE DARK) ---
  const dailyData: Record<string, any> = {};
  data.transactions.forEach((tab: any) => {
    const timestamp = new Date(tab.closedAt || tab.openedAt).getTime();
    const istOffset = 5.5 * 3600000;
    const logicalDate = new Date(timestamp + istOffset);
    if (logicalDate.getUTCHours() < 4) logicalDate.setUTCDate(logicalDate.getUTCDate() - 1);
    
    const bizDayStr = logicalDate.toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' 
    });

    if (!dailyData[bizDayStr]) {
      dailyData[bizDayStr] = {
        cafeCash: 0, cafeUPI: 0, chaiCash: 0, chaiUPI: 0,
        totalCash: 0, totalUPI: 0, total: 0
      };
    }

    const { paymentMode, totalAmount } = tab;
    const isCafe = tab.Outlet.name.toUpperCase().includes("CAFE");

    if (isCafe) {
      if (paymentMode === "CASH") dailyData[bizDayStr].cafeCash += totalAmount;
      else dailyData[bizDayStr].cafeUPI += totalAmount;
    } else {
      if (paymentMode === "CASH") dailyData[bizDayStr].chaiCash += totalAmount;
      else dailyData[bizDayStr].chaiUPI += totalAmount;
    }

    if (paymentMode === "CASH") dailyData[bizDayStr].totalCash += totalAmount;
    else dailyData[bizDayStr].totalUPI += totalAmount;
    
    dailyData[bizDayStr].total += totalAmount;
  });

  const tableRows = Object.entries(dailyData).map(([date, stats]: [string, any]) => [
    date,
    `₹${stats.cafeCash.toFixed(0)}`,
    `₹${stats.cafeUPI.toFixed(0)}`,
    `₹${stats.chaiCash.toFixed(0)}`,
    `₹${stats.chaiUPI.toFixed(0)}`,
    `₹${stats.totalCash.toFixed(0)}`,
    `₹${stats.totalUPI.toFixed(0)}`,
    `₹${stats.total.toFixed(0)}`
  ]);

  autoTable(doc, {
    startY: 175,
    head: [["DATE", "CAFE C", "CAFE U", "CHAI C", "CHAI U", "TOT CASH", "TOT UPI", "NET DAY"]],
    body: tableRows,
    theme: 'plain',
    headStyles: { 
      fillColor: [16, 185, 129], 
      textColor: [0, 0, 0],
      fontSize: 8, fontStyle: 'bold', halign: 'center'
    },
    styles: { 
      fontSize: 8, cellPadding: 5, textColor: [255, 255, 255], 
      lineColor: [39, 39, 42], lineWidth: 0.1 
    },
    alternateRowStyles: { 
      fillColor: [24, 24, 27] 
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      5: { textColor: [16, 185, 129], fontStyle: 'bold' }, // Emerald Cash
      6: { textColor: [59, 130, 246], fontStyle: 'bold' }, // Blue UPI
      7: { halign: 'right', fontStyle: 'bold', fontSize: 9 }
    }
  });

  // --- 5. ELITE FOOTER ---
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  doc.setDrawColor(63, 63, 70); // Zinc-700
  doc.line(20, finalY, 80, finalY);
  doc.line(pageWidth - 80, finalY, pageWidth - 20, finalY);
  
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122); // Zinc-400
  doc.text("MANAGER AUDIT", 50, finalY + 8, { align: "center" });
  doc.text("EXECUTIVE SIGN-OFF", pageWidth - 50, finalY + 8, { align: "center" });

  doc.setFontSize(6);
  doc.text("SECURE REPORT ID: " + Math.random().toString(36).substr(2, 12).toUpperCase(), pageWidth/2, pageHeight - 15, { align: 'center' });
  doc.text("FULBARI ECOSYSTEM • CONFIDENTIAL DATA", pageWidth/2, pageHeight - 10, { align: 'center' });

  doc.save(`FR_Elite_Audit_${fromDate}.pdf`);
}
