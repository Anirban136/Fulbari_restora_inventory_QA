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

// ESC/POS receipt generator
function generateEscPosReceipt(data: {
  outletName: string
  tokenNumber: number
  customerName: string
  tabId: string
  items: Array<{ name: string; quantity: number; price: number }>
  totalAmount: number
  paymentMode: string
  closedAt: Date
  isKitchenCopy: boolean
}): string {
  const ESC = '\x1B'
  const GS = '\x1D'
  const LF = '\n'

  const INIT = ESC + '@'
  const CENTER = ESC + 'a' + '\x01'
  const LEFT = ESC + 'a' + '\x00'
  const BOLD_ON = ESC + 'E' + '\x01'
  const BOLD_OFF = ESC + 'E' + '\x00'
  const DOUBLE_SIZE = ESC + '!' + '\x30'
  const DOUBLE_HEIGHT = ESC + '!' + '\x10'
  const NORMAL = ESC + '!' + '\x00'
  const CUT = GS + 'V' + '\x01'

  const SEP = '--------------------------------'
  const DSEP = '================================'
  const W = 32 // char width for 58mm

  function pad(left: string, right: string): string {
    const spaces = W - left.length - right.length
    return left + ' '.repeat(Math.max(1, spaces)) + right
  }

  const dateStr = data.closedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = data.closedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

  let r = ''
  r += INIT
  r += CENTER
  r += DOUBLE_SIZE + data.outletName.toUpperCase() + LF
  r += NORMAL

  if (data.isKitchenCopy) {
    r += LF
    r += BOLD_ON + DOUBLE_SIZE
    r += '** KITCHEN COPY **' + LF
    r += NORMAL + BOLD_OFF
  }

  r += LF + DSEP + LF

  r += BOLD_ON + DOUBLE_SIZE
  r += 'TOKEN #' + data.tokenNumber + LF
  r += NORMAL + BOLD_OFF

  r += DSEP + LF

  r += LEFT
  r += 'Customer: ' + data.customerName + LF
  r += 'Date: ' + dateStr + '  ' + timeStr + LF
  r += 'Bill: #' + data.tabId.slice(-6) + LF
  r += SEP + LF

  if (data.isKitchenCopy) {
    r += BOLD_ON + pad('ITEM', 'QTY') + LF + BOLD_OFF
    r += SEP + LF
    for (const item of data.items) {
      r += BOLD_ON + pad(item.name, '' + item.quantity) + LF + BOLD_OFF
    }
    r += DSEP + LF
    r += CENTER + BOLD_ON + DOUBLE_HEIGHT
    r += 'PREPARE THIS ORDER' + LF
    r += NORMAL + BOLD_OFF
  } else {
    r += BOLD_ON + pad('ITEM', 'AMOUNT') + LF + BOLD_OFF
    r += SEP + LF
    for (const item of data.items) {
      const itemLine = item.quantity + 'x ' + item.name
      const priceLine = 'Rs.' + (item.quantity * item.price).toFixed(0)
      if (itemLine.length + priceLine.length + 1 > W) {
        r += itemLine + LF
        r += pad('', priceLine) + LF
      } else {
        r += pad(itemLine, priceLine) + LF
      }
    }
    r += SEP + LF
    r += BOLD_ON + DOUBLE_HEIGHT
    r += pad('TOTAL', 'Rs.' + data.totalAmount.toFixed(0)) + LF
    r += NORMAL + BOLD_OFF
    r += SEP + LF
    r += pad('Payment:', data.paymentMode) + LF
    r += LF
    r += CENTER + 'Thank you! Visit again.' + LF
  }

  r += LF + LF + LF
  r += CUT

  return r
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
  const [status, setStatus] = useState<"idle" | "printing" | "success" | "error">("idle")

  function handlePrint() {
    setStatus("printing")

    const dateObj = closedAt ? (typeof closedAt === 'string' ? new Date(closedAt) : closedAt) : new Date()

    const receiptItems = items.map(item => ({
      name: item.MenuItem.name,
      quantity: item.quantity,
      price: item.priceAtTime
    }))

    const baseData = {
      outletName,
      tokenNumber: tokenNumber || 0,
      customerName: customerName || 'Walk-in',
      tabId,
      items: receiptItems,
      totalAmount,
      paymentMode: paymentMode || 'N/A',
      closedAt: dateObj,
    }

    // Generate both receipts (customer + kitchen)
    const customerReceipt = generateEscPosReceipt({ ...baseData, isKitchenCopy: false })
    const kitchenReceipt = generateEscPosReceipt({ ...baseData, isKitchenCopy: true })

    const fullReceipt = customerReceipt + kitchenReceipt

    // Convert to base64 for RawBT URL scheme
    const base64 = btoa(unescape(encodeURIComponent(fullReceipt)))

    // Try RawBT direct print (Android with RawBT app installed)
    // RawBT URL scheme sends ESC/POS directly to printer - no dialog!
    try {
      window.location.href = 'rawbt:base64,' + base64
      setStatus("success")
      setTimeout(() => setStatus("idle"), 3000)
    } catch (e) {
      // Fallback to window.print if RawBT is not available
      fallbackPrint(baseData)
      setStatus("success")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  function fallbackPrint(data: any) {
    const dateStr = data.closedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeStr = data.closedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

    const itemsHtml = data.items.map((item: any) => `
      <tr><td>${item.quantity}x ${item.name}</td><td style="text-align:right">Rs.${(item.quantity * item.price).toFixed(0)}</td></tr>
    `).join('')

    const kitchenHtml = data.items.map((item: any) => `
      <tr><td style="font-weight:bold;font-size:14px">${item.name}</td><td style="text-align:right;font-weight:bold;font-size:16px">${item.quantity}</td></tr>
    `).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt</title>
      <style>@media print{@page{size:58mm auto;margin:0}body{margin:0;padding:0}.page-break{page-break-after:always}}
      body{font-family:'Courier New',monospace;font-size:12px;width:48mm;margin:0 auto;padding:4mm;color:#000;background:#fff}
      .center{text-align:center}.bold{font-weight:bold}.big{font-size:18px;font-weight:bold}
      .separator{border-top:1px dashed #000;margin:4px 0}.double-separator{border-top:2px solid #000;margin:4px 0}
      table{width:100%;border-collapse:collapse}.token-box{border:2px solid #000;padding:4px 12px;font-size:22px;font-weight:bold;display:inline-block;margin:6px 0}
      .kitchen-badge{border:2px solid #000;padding:4px 8px;font-size:16px;font-weight:bold;display:inline-block;margin:4px 0}</style></head><body>
      <div class="page-break"><div class="center"><div class="big">${data.outletName.toUpperCase()}</div></div>
      <div class="double-separator"></div><div class="center"><div class="token-box">TOKEN #${data.tokenNumber}</div></div>
      <div class="double-separator"></div><div>Customer: ${data.customerName}<br>Date: ${dateStr} ${timeStr}<br>Bill: #${data.tabId.slice(-6)}</div>
      <div class="separator"></div><table><tr class="bold"><td>ITEM</td><td style="text-align:right">AMOUNT</td></tr></table>
      <div class="separator"></div><table>${itemsHtml}</table><div class="separator"></div>
      <table><tr class="bold"><td style="font-size:16px">TOTAL</td><td style="text-align:right;font-size:16px">Rs.${data.totalAmount.toFixed(0)}</td></tr></table>
      <div class="separator"></div><div>Payment: ${data.paymentMode}</div><br><div class="center">Thank you! Visit again.</div><br><br></div>
      <div><div class="center"><div class="big">${data.outletName.toUpperCase()}</div><div class="kitchen-badge">** KITCHEN COPY **</div></div>
      <div class="double-separator"></div><div class="center"><div class="token-box">TOKEN #${data.tokenNumber}</div></div>
      <div class="double-separator"></div><div>Customer: ${data.customerName}<br>Time: ${timeStr}</div>
      <div class="separator"></div><table><tr class="bold"><td>ITEM</td><td style="text-align:right">QTY</td></tr></table>
      <div class="separator"></div><table>${kitchenHtml}</table><div class="double-separator"></div>
      <div class="center bold" style="font-size:16px">PREPARE THIS ORDER</div><br><br><br></div>
      <script>window.onload=function(){window.print();setTimeout(function(){window.close()},1000)}</script></body></html>`

    const w = window.open('', '_blank', 'width=300,height=600')
    if (w) { w.document.write(html); w.document.close() }
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
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
        ) : status === "success" ? (
          <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Printed!</>
        ) : (
          <><Printer className="w-3.5 h-3.5" /> Print Bill</>
        )}
      </button>
      {tokenNumber && status === "idle" && (
        <span className="text-[10px] text-slate-500 mt-1">🖨️ Token #{tokenNumber} • 2 copies</span>
      )}
    </div>
  )
}
