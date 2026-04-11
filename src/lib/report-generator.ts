import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("FULBARI", pageWidth / 2, 25, { align: "center" });
  
  doc.setFontSize(9);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text("EXECUTIVE PERFORMANCE SUMMARY", pageWidth / 2, 32, { align: "center", charSpace: 2 });
  doc.setTextColor(113, 113, 122); // Zinc-400
  doc.text(`AUDIT PERIOD: ${fromDate} TO ${toDate}`, pageWidth / 2, 38, { align: "center" });

  // --- 3. NUMERIC SUMMARY GRID (Replaces Pie Charts) ---
  const grandTotal = data.transactions.reduce((sum: number, t: any) => sum + t.totalAmount, 0);
  const totalCash = data.transactions.filter((t:any) => t.paymentMode === "CASH").reduce((s:number, t:any) => s+t.totalAmount, 0);
  const totalUPI = data.transactions.filter((t:any) => t.paymentMode === "ONLINE" || t.paymentMode === "UPI").reduce((s:number, t:any) => s+t.totalAmount, 0);
  const cafeTotal = data.transactions.filter((t:any) => t.Outlet.name.toUpperCase().includes("CAFE")).reduce((s:number, t:any) => s+t.totalAmount, 0);
  const chaiTotal = data.transactions.filter((t:any) => t.Outlet.name.toUpperCase().includes("CHAI")).reduce((s:number, t:any) => s+t.totalAmount, 0);

  // Centered Dashboard Box
  doc.setFillColor(24, 24, 27); // Zinc-900
  doc.roundedRect(10, 45, pageWidth - 20, 60, 4, 4, 'F');

  const drawMetric = (x: number, y: number, label: string, value: string, color: [number, number, number]) => {
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122); // Zinc-400
    doc.text(label, x, y, { align: 'center' });
    doc.setFontSize(18);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont("helvetica", "bold");
    doc.text(value, x, y + 10, { align: 'center' });
  };

  const colWidth = (pageWidth - 20) / 4;
  const startX = 10 + colWidth / 2;
  const metricsY = 65;

  drawMetric(startX, metricsY, "CAFE HUB", `₹${cafeTotal.toLocaleString()}`, [251, 191, 36]); // Amber
  drawMetric(startX + colWidth, metricsY, "TEA JOINT", `₹${chaiTotal.toLocaleString()}`, [45, 212, 191]); // Teal
  drawMetric(startX + colWidth * 2, metricsY, "CASH TALLY", `₹${totalCash.toLocaleString()}`, [16, 185, 129]); // Emerald
  drawMetric(startX + colWidth * 3, metricsY, "UPI/ONLINE", `₹${totalUPI.toLocaleString()}`, [59, 130, 246]); // Blue

  // Large Total Centerpiece
  doc.setFillColor(16, 185, 129, 0.1);
  doc.roundedRect(pageWidth/2 - 50, 85, 100, 15, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129);
  doc.text(`NET GENERATED REVENUE: ₹${grandTotal.toLocaleString()}`, pageWidth / 2, 94, { align: 'center' });

  // --- 4. HIGH-VISIBILITY AUDIT TABLE ---
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
    startY: 115,
    head: [["DATE", "CAFE C", "CAFE U", "CHAI C", "CHAI U", "TOT CASH", "TOT UPI", "NET DAY"]],
    body: tableRows,
    theme: 'plain',
    headStyles: { 
      fillColor: [16, 185, 129], 
      textColor: [0, 0, 0],
      fontSize: 8.5, fontStyle: 'bold', halign: 'center', cellPadding: 4
    },
    styles: { 
      fontSize: 8.5, cellPadding: 5, textColor: [255, 255, 255], 
      lineColor: [39, 39, 42], lineWidth: 0.1, font: "helvetica",
      valign: 'middle'
    },
    alternateRowStyles: { 
      fillColor: [18, 18, 20] 
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32 }, // Date
      1: { cellWidth: 18 }, // Cafe C
      2: { cellWidth: 18 }, // Cafe U
      3: { cellWidth: 18 }, // Chai C
      4: { cellWidth: 18 }, // Chai U
      5: { textColor: [16, 185, 129], fontStyle: 'bold', fontSize: 10, cellWidth: 25 }, // Tot Cash
      6: { textColor: [59, 130, 246], fontStyle: 'bold', fontSize: 10, cellWidth: 25 }, // Tot Online
      7: { halign: 'right', fontStyle: 'bold', fontSize: 11, textColor: [255, 255, 255], cellWidth: 32 } // Net Day
    }
  });

  // --- 5. ELITE FOOTER ---
  const finalY = (doc as any).lastAutoTable.finalY + 25;
  doc.setDrawColor(63, 63, 70); // Zinc-700
  doc.line(20, finalY, 80, finalY);
  doc.line(pageWidth - 80, finalY, pageWidth - 20, finalY);
  
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122); // Zinc-400
  doc.text("MANAGER AUDIT", 50, finalY + 8, { align: "center" });
  doc.text("EXECUTIVE SIGN-OFF", pageWidth - 50, finalY + 8, { align: "center" });

  doc.setFontSize(7);
  doc.text("RESOURCES GENERATED FROM FULBARI ECOSYSTEM HUB", pageWidth/2, pageHeight - 12, { align: 'center' });

  doc.save(`FR_Audit_${fromDate}.pdf`);
}
