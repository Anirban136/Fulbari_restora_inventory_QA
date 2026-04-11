import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper to draw a pie chart on a canvas and return a data URL
function drawPieToDataUrl(data: { label: string, value: number, color: string }[], size: number = 200) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let startAngle = -Math.PI / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;

  data.forEach(item => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.fillStyle = item.color;
    ctx.fill();
    
    // Subtle border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    startAngle += sliceAngle;
  });

  // White center circle for "Donut" style (more lucrative/modern)
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
  ctx.fillStyle = '#f8fafc'; // Matches summary box color
  ctx.fill();

  return canvas.toDataURL('image/png');
}

export async function generateTransactionPDF(data: any, fromDate: string, toDate: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // --- 1. PREMIUM BRANDED HEADER ---
  doc.setFillColor(5, 150, 105); // Emerald 600
  doc.rect(0, 0, pageWidth, 55, 'F');
  
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text("FULBARI RESTORA", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(200, 253, 222); 
  doc.text("EXECUTIVE OPERATIONS AUDIT & PERFORMANCE SETTLEMENT", pageWidth / 2, 35, { align: "center" });
  
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.line(70, 42, pageWidth - 70, 42);

  // --- 2. GRAPHICAL PERFORMANCE SUMMARY ---
  const grandTotal = data.transactions.reduce((sum: number, t: any) => sum + t.totalAmount, 0);
  const totalCash = data.transactions.filter((t:any) => t.paymentMode === "CASH").reduce((s:number, t:any) => s+t.totalAmount, 0);
  const totalUPI = data.transactions.filter((t:any) => t.paymentMode === "ONLINE" || t.paymentMode === "UPI").reduce((s:number, t:any) => s+t.totalAmount, 0);
  const cafeTotal = data.transactions.filter((t:any) => t.Outlet.name.toUpperCase().includes("CAFE")).reduce((s:number, t:any) => s+t.totalAmount, 0);
  const chaiTotal = data.transactions.filter((t:any) => t.Outlet.name.toUpperCase().includes("CHAI")).reduce((s:number, t:any) => s+t.totalAmount, 0);

  // Summary box container
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 60, pageWidth - 30, 95, 4, 4, 'F');

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(10);
  doc.text("EXECUTIVE PERFORMANCE ANALYTICS", pageWidth / 2, 75, { align: 'center' });

  // Generate Pie Charts
  const paymentMixImg = drawPieToDataUrl([
    { label: 'CASH', value: totalCash, color: '#10b981' },
    { label: 'UPI', value: totalUPI, color: '#3b82f6' }
  ]);
  const outletMixImg = drawPieToDataUrl([
    { label: 'CAFE', value: cafeTotal, color: '#6366f1' },
    { label: 'CHAI', value: chaiTotal, color: '#f59e0b' }
  ]);

  // Insert Charts
  doc.addImage(paymentMixImg, 'PNG', 25, 80, 50, 50);
  doc.addImage(outletMixImg, 'PNG', pageWidth - 75, 80, 50, 50);

  // Chart Labels
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("PAYMENT METHOD MIX", 50, 135, { align: 'center' });
  doc.text("OUTLET CONTRIBUTION", pageWidth - 50, 135, { align: 'center' });

  // Detailed Legend (Middle of Charts)
  const legendX = pageWidth / 2 - 20;
  doc.setFontSize(7);
  doc.text(`[ ] CASH: ${((totalCash/grandTotal)*100).toFixed(0)}%`, legendX, 90);
  doc.text(`[ ] UPI: ${((totalUPI/grandTotal)*100).toFixed(0)}%`, legendX, 98);
  doc.text(`[ ] CAFE: ${((cafeTotal/grandTotal)*100).toFixed(0)}%`, legendX, 108);
  doc.text(`[ ] CHAI: ${((chaiTotal/grandTotal)*100).toFixed(0)}%`, legendX, 116);

  // Large Total Section
  doc.setFillColor(15, 23, 42); // Navy Dark
  doc.roundedRect(25, 140, pageWidth - 50, 15, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(`NET INCOME AUDIT: Rs. ${grandTotal.toLocaleString()}`, pageWidth / 2, 150, { align: 'center' });

  // Meta Info
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text(`RANGE: ${fromDate} - ${toDate}`, 15, 165);
  doc.text(`ID: FR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, pageWidth / 2, 165, { align: 'center' });
  doc.text(`GENERATED: ${new Date().toLocaleString('en-IN')}`, pageWidth - 15, 165, { align: 'right' });

  // --- 3. BUSINESS DAY GROUPING (4 AM LOGIC) ---
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
    `Rs. ${stats.cafeCash.toFixed(0)}`,
    `Rs. ${stats.cafeUPI.toFixed(0)}`,
    `Rs. ${stats.chaiCash.toFixed(0)}`,
    `Rs. ${stats.chaiUPI.toFixed(0)}`,
    `Rs. ${stats.totalCash.toFixed(0)}`,
    `Rs. ${stats.totalUPI.toFixed(0)}`,
    `Rs. ${stats.total.toFixed(0)}`
  ]);

  // --- 4. LUCRATIVE DATA TABLE ---
  autoTable(doc, {
    startY: 175,
    head: [
      ["DATE", "CAFE CASH", "CAFE UPI", "CHAI CASH", "CHAI UPI", "TOT. CASH", "TOT. UPI", "NET DAY"]
    ],
    body: tableRows,
    headStyles: { 
      fillColor: [15, 23, 42], 
      textColor: [255, 255, 255],
      fontSize: 7, fontStyle: 'bold', halign: 'center'
    },
    styles: { 
      fontSize: 7, cellPadding: 4, valign: 'middle'
    },
    alternateRowStyles: { 
      fillColor: [248, 250, 252] 
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 25 },
      5: { fontStyle: 'bold', textColor: [5, 150, 105] }, // Emerald Total Cash
      6: { fontStyle: 'bold', textColor: [37, 99, 235] }, // Blue Total UPI
      7: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249], textColor: [15, 23, 42] } // Shaded Net Day
    }
  });

  // --- 5. AUTHORIZATION ---
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  doc.setDrawColor(226, 232, 240);
  doc.line(25, finalY, 75, finalY);
  doc.line(pageWidth - 75, finalY, pageWidth - 25, finalY);
  
  doc.setFontSize(7);
  doc.setTextColor(100);
  doc.text("MANAGER AUDIT SIGNATURE", 50, finalY + 5, { align: "center" });
  doc.text("EXECUTIVE OWNER SIGN-OFF", pageWidth - 50, finalY + 5, { align: "center" });

  doc.setFontSize(6);
  doc.text("CONFIDENTIAL | FULBARI RESTORA OPERATIONS SYSTEM", pageWidth / 2, doc.internal.pageSize.height - 10, { align: "center" });

  doc.save(`FR_Premium_Audit_${fromDate}.pdf`);
}
