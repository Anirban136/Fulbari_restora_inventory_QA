"use client"

import { useState } from "react"
import { Printer, Loader2, CheckCircle2 } from "lucide-react"

interface PrintReceiptButtonProps {
  outletName: string
  tokenNumber: number | null
  customerName: string | null
  tabId: string
  items: Array<{
    quantity: number
    priceAtTime: number
    MenuItem: { name: string }
  }>
  totalAmount: number
  paymentMode: string | null
  closedAt: Date | string | null
  accentColor?: string
}

export function PrintReceiptButton({
  outletName,
  tokenNumber,
  customerName,
  tabId,
  items,
  totalAmount,
  paymentMode,
  closedAt,
  accentColor = "amber"
}: PrintReceiptButtonProps) {
  const [status, setStatus] = useState<"idle" | "printing" | "success">("idle")

  function handlePrint() {
    setStatus("printing")

    const dateObj = closedAt ? (typeof closedAt === 'string' ? new Date(closedAt) : closedAt) : new Date()
    const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

    const itemsHtml = items.map(item => `
      <tr>
        <td style="text-align:left;padding:2px 0;">${item.quantity}x ${item.MenuItem.name}</td>
        <td style="text-align:right;padding:2px 0;">Rs.${(item.quantity * item.priceAtTime).toFixed(0)}</td>
      </tr>
    `).join('')

    // Generate TWO receipts: Customer + Kitchen
    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - Token #${tokenNumber || ''}</title>
  <style>
    @media print {
      @page {
        size: 58mm auto;
        margin: 0;
      }
      body { margin: 0; padding: 0; }
      .page-break { page-break-after: always; }
    }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      width: 48mm;
      margin: 0 auto;
      padding: 4mm;
      color: #000;
      background: #fff;
    }
    .receipt { padding-bottom: 8mm; }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .big { font-size: 18px; font-weight: bold; }
    .huge { font-size: 24px; font-weight: bold; }
    .separator { border-top: 1px dashed #000; margin: 4px 0; }
    .double-separator { border-top: 2px solid #000; margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; }
    .kitchen-badge {
      border: 2px solid #000;
      padding: 4px 8px;
      font-size: 16px;
      font-weight: bold;
      display: inline-block;
      margin: 4px 0;
    }
    .token-box {
      border: 2px solid #000;
      padding: 4px 12px;
      font-size: 22px;
      font-weight: bold;
      display: inline-block;
      margin: 6px 0;
    }
  </style>
</head>
<body>
  <!-- CUSTOMER COPY -->
  <div class="receipt page-break">
    <div class="center">
      <div class="big">${outletName.toUpperCase()}</div>
    </div>
    <div class="double-separator"></div>
    <div class="center">
      <div class="token-box">TOKEN #${tokenNumber || '0'}</div>
    </div>
    <div class="double-separator"></div>
    <div>
      <div>Customer: ${customerName || 'Walk-in'}</div>
      <div>Date: ${dateStr}  ${timeStr}</div>
      <div>Bill: #${tabId.slice(-6)}</div>
    </div>
    <div class="separator"></div>
    <table>
      <tr class="bold">
        <td style="text-align:left">ITEM</td>
        <td style="text-align:right">AMOUNT</td>
      </tr>
    </table>
    <div class="separator"></div>
    <table>${itemsHtml}</table>
    <div class="separator"></div>
    <table>
      <tr class="bold">
        <td style="text-align:left;font-size:16px;">TOTAL</td>
        <td style="text-align:right;font-size:16px;">Rs.${totalAmount.toFixed(0)}</td>
      </tr>
    </table>
    <div class="separator"></div>
    <div>Payment: ${paymentMode || 'N/A'}</div>
    <br>
    <div class="center">Thank you! Visit again.</div>
    <br><br>
  </div>

  <!-- KITCHEN COPY -->
  <div class="receipt">
    <div class="center">
      <div class="big">${outletName.toUpperCase()}</div>
    </div>
    <div class="center">
      <div class="kitchen-badge">** KITCHEN COPY **</div>
    </div>
    <div class="double-separator"></div>
    <div class="center">
      <div class="token-box">TOKEN #${tokenNumber || '0'}</div>
    </div>
    <div class="double-separator"></div>
    <div>
      <div>Customer: ${customerName || 'Walk-in'}</div>
      <div>Time: ${timeStr}</div>
    </div>
    <div class="separator"></div>
    <table>
      <tr class="bold">
        <td style="text-align:left">ITEM</td>
        <td style="text-align:right">QTY</td>
      </tr>
    </table>
    <div class="separator"></div>
    <table>
      ${items.map(item => `
        <tr>
          <td style="text-align:left;padding:3px 0;font-size:14px;font-weight:bold;">${item.MenuItem.name}</td>
          <td style="text-align:right;padding:3px 0;font-size:16px;font-weight:bold;">${item.quantity}</td>
        </tr>
      `).join('')}
    </table>
    <div class="double-separator"></div>
    <div class="center bold" style="font-size:16px;">PREPARE THIS ORDER</div>
    <br><br><br>
  </div>

  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 1000);
    }
  </script>
</body>
</html>`

    // Open a popup window with the receipt
    const printWindow = window.open('', '_blank', 'width=300,height=600')
    if (printWindow) {
      printWindow.document.write(receiptHtml)
      printWindow.document.close()
      setStatus("success")
      setTimeout(() => setStatus("idle"), 3000)
    } else {
      // Popup was blocked, try inline
      const blob = new Blob([receiptHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.click()
      URL.revokeObjectURL(url)
      setStatus("success")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  const colorMap: Record<string, string> = {
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20",
    sky: "bg-sky-500/10 border-sky-500/20 text-sky-400 hover:bg-sky-500/20",
  }
  const colors = colorMap[accentColor] || colorMap.amber

  return (
    <div className="inline-flex flex-col items-start">
      <button
        onClick={handlePrint}
        disabled={status === "printing"}
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait ${colors}`}
      >
        {status === "printing" ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Preparing...
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Sent to Printer!
          </>
        ) : (
          <>
            <Printer className="w-3.5 h-3.5" />
            Print Bill
          </>
        )}
      </button>
      {tokenNumber && status === "idle" && (
        <span className="text-[10px] text-slate-500 mt-1">
          🖨️ Token #{tokenNumber} • 2 copies
        </span>
      )}
    </div>
  )
}
