import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function generateTransactionPDF(data: any, fromDate: string, toDate: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // --- 1. PREMIUM BRANDED HEADER ---
  doc.setFillColor(5, 150, 105); // Emerald 600
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text("FULBARI RESTORA", pageWidth / 2, 22, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(200, 253, 222); 
  doc.text("EXECUTIVE OPERATIONS AUDIT & PERFORMANCE SETTLEMENT", pageWidth / 2, 30, { align: "center" });
  
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(60, 36, pageWidth - 60, 36);

  // --- 2. GRAPHICAL PERFORMANCE SUMMARY ---
  const grandTotal = data.transactions.reduce((sum: number, t: any) => sum + t.totalAmount, 0);
  const totalCash = data.transactions.filter((t:any) => t.paymentMode === "CASH").reduce((s:number, t:any) => s+t.totalAmount, 0);
  const totalUPI = data.transactions.filter((t:any) => t.paymentMode === "ONLINE" || t.paymentMode === "UPI").reduce((s:number, t:any) => s+t.totalAmount, 0);

  // Cafe vs Chai Breakdown
  const cafeTotal = data.transactions.filter((t:any) => t.Outlet.name.toUpperCase().includes("CAFE")).reduce((s:number, t:any) => s+t.totalAmount, 0);
  const chaiTotal = data.transactions.filter((t:any) => t.Outlet.name.toUpperCase().includes("CHAI")).reduce((s:number, t:any) => s+t.totalAmount, 0);

  // Summary box container
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 55, pageWidth - 30, 65, 3, 3, 'F');

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(10);
  doc.text("EXECUTIVE PERFORMANCE SNAPSHOT", 25, 68);

  // Graphical Bar Chart: Cash vs UPI
  const chartWidth = 70;
  const cashRatio = totalCash / (grandTotal || 1);
  const upiRatio = totalUPI / (grandTotal || 1);

  doc.setFontSize(8);
  doc.text("PAYMENT MIX (CASH vs UPI)", 25, 78);
  
  // Bar background
  doc.setFillColor(226, 232, 240);
  doc.rect(25, 80, chartWidth, 4, 'F');
  // Cash portion
  doc.setFillColor(16, 185, 129);
  doc.rect(25, 80, chartWidth * cashRatio, 4, 'F');
  // Legend
  doc.text(`CASH: Rs. ${totalCash.toLocaleString()} (${(cashRatio*100).toFixed(0)}%)`, 25, 88);
  doc.text(`UPI: Rs. ${totalUPI.toLocaleString()} (${(upiRatio*100).toFixed(0)}%)`, 25 + chartWidth, 88, { align: 'right' });

  // Graphical Bar Chart: Cafe vs Chai
  const cafeRatio = cafeTotal / (grandTotal || 1);
  const chaiRatio = chaiTotal / (grandTotal || 1);

  doc.text("OUTLET CONTRIBUTION (CAFE vs CHAI)", 115, 78);
  // Bar background
  doc.setFillColor(226, 232, 240);
  doc.rect(115, 80, chartWidth, 4, 'F');
  // Cafe portion
  doc.setFillColor(59, 130, 246);
  doc.rect(115, 80, chartWidth * cafeRatio, 4, 'F');
  // Legend
  doc.text(`CAFE: Rs. ${cafeTotal.toLocaleString()} (${(cafeRatio*100).toFixed(0)}%)`, 115, 88);
  doc.text(`CHAI: Rs. ${chaiTotal.toLocaleString()} (${(chaiRatio*100).toFixed(0)}%)`, 115 + chartWidth, 88, { align: 'right' });

  // Large Total Section
  doc.setFillColor(5, 150, 105);
  doc.roundedRect(25, 100, pageWidth - 50, 15, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(`NET INCOME AUDIT: Rs. ${grandTotal.toLocaleString()}`, pageWidth / 2, 110, { align: 'center' });

  // Meta Info Table-like
  doc.setTextColor(100);
  doc.setFontSize(8);
  doc.text(`AUDIT PERIOD: ${fromDate} TO ${toDate}`, 15, 128);
  doc.text(`REPORTING ID: FR-${Date.now().toString().slice(-6)}`, pageWidth / 2, 128, { align: 'center' });
  doc.text(`SETTLEMENT TIME: ${new Date().toLocaleString('en-IN')}`, pageWidth - 15, 128, { align: 'right' });

  // --- 3. BUSINESS DAY GROUPING (4 AM LOGIC) ---
  const dailyData: Record<string, any> = {};
  
  data.transactions.forEach((tab: any) => {
    const timestamp = new Date(tab.closedAt || tab.openedAt).getTime();
    const istOffset = 5.5 * 3600000;
    const logicalDate = new Date(timestamp + istOffset);
    if (logicalDate.getUTCHours() < 4) {
      logicalDate.setUTCDate(logicalDate.getUTCDate() - 1);
    }
    const bizDayStr = logicalDate.toLocaleString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      timeZone: 'UTC' 
    });

    const outletName = tab.Outlet.name.toUpperCase();
    const isCafe = outletName.includes("CAFE");
    const isChai = outletName.includes("CHAI");

    if (!dailyData[bizDayStr]) {
      dailyData[bizDayStr] = {
        cafeCash: 0, cafeUPI: 0,
        chaiCash: 0, chaiUPI: 0,
        totalCash: 0, totalUPI: 0,
        total: 0
      };
    }

    const { paymentMode, totalAmount } = tab;
    
    if (isCafe) {
      if (paymentMode === "CASH") dailyData[bizDayStr].cafeCash += totalAmount;
      else if (paymentMode === "ONLINE" || paymentMode === "UPI") dailyData[bizDayStr].cafeUPI += totalAmount;
      else if (paymentMode === "SPLIT") {
        dailyData[bizDayStr].cafeCash += totalAmount / 2;
        dailyData[bizDayStr].cafeUPI += totalAmount / 2;
      }
    } else if (isChai) {
      if (paymentMode === "CASH") dailyData[bizDayStr].chaiCash += totalAmount;
      else if (paymentMode === "ONLINE" || paymentMode === "UPI") dailyData[bizDayStr].chaiUPI += totalAmount;
      else if (paymentMode === "SPLIT") {
        dailyData[bizDayStr].chaiCash += totalAmount / 2;
        dailyData[bizDayStr].chaiUPI += totalAmount / 2;
      }
    }

    if (paymentMode === "CASH") dailyData[bizDayStr].totalCash += totalAmount;
    else if (paymentMode === "ONLINE" || paymentMode === "UPI") dailyData[bizDayStr].totalUPI += totalAmount;
    else if (paymentMode === "SPLIT") {
      dailyData[bizDayStr].totalCash += totalAmount/2;
      dailyData[bizDayStr].totalUPI += totalAmount/2;
    }
    
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

  // --- 4. DATA TABLE ---
  autoTable(doc, {
    startY: 135,
    head: [
      ["DATE", "CAFE CASH", "CAFE UPI", "CHAI CASH", "CHAI UPI", "TOTAL CASH", "TOTAL UPI", "NET DAY TOTAL"]
    ],
    body: tableRows,
    headStyles: { 
      fillColor: [31, 41, 55], 
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { 
      fontSize: 7,
      cellPadding: 4,
      valign: 'middle'
    },
    alternateRowStyles: { 
      fillColor: [248, 250, 252] 
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 25 },
      5: { fontStyle: 'bold', textColor: [16, 185, 129], halign: 'center' },
      6: { fontStyle: 'bold', textColor: [59, 130, 246], halign: 'center' },
      7: { fontStyle: 'bold', halign: 'right', textColor: [5, 150, 105], fontSize: 8 }
    }
  });

  // --- 5. AUTHORIZATION ---
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  
  doc.setDrawColor(200);
  doc.setLineWidth(0.2);
  doc.line(20, finalY, 70, finalY);
  doc.line(pageWidth - 70, finalY, pageWidth - 20, finalY);
  
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text("MANAGER AUTH", 45, finalY + 5, { align: "center" });
  doc.text("OWNER SIGN-OFF", pageWidth - 45, finalY + 5, { align: "center" });

  doc.text("Official Operations Unit Document - Fulbari Restora Inventory System", pageWidth / 2, doc.internal.pageSize.height - 10, { align: "center" });

  const filename = `FR_Executive_Audit_${fromDate}_to_${toDate}.pdf`;
  doc.save(filename);
}
