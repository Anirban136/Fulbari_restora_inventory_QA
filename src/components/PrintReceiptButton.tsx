"use client"

import { useState, useRef } from "react"
import { Printer, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

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

// ESC/POS receipt generator (returns Uint8Array for BLE, string for RawBT)
function generateEscPosBytes(data: {
  outletName: string
  tokenNumber: number
  customerName: string
  tabId: string
  items: Array<{ name: string; quantity: number; price: number }>
  totalAmount: number
  paymentMode: string
  closedAt: Date
  isKitchenCopy: boolean
}): Uint8Array {
  const ESC = 0x1B
  const GS = 0x1D
  const LF = 0x0A

  const parts: Uint8Array[] = []
  const encoder = new TextEncoder()

  const add = (bytes: Uint8Array) => parts.push(bytes)
  const addText = (text: string) => parts.push(encoder.encode(text + '\n'))
  const addCmd = (...bytes: number[]) => parts.push(new Uint8Array(bytes))

  const SEP = '--------------------------------'
  const DSEP = '================================'
  const W = 32

  function pad(left: string, right: string): string {
    const spaces = W - left.length - right.length
    return left + ' '.repeat(Math.max(1, spaces)) + right
  }

  const dateStr = data.closedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = data.closedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

  // Initialize
  addCmd(ESC, 0x40)
  // Center align
  addCmd(ESC, 0x61, 0x01)
  // Double size
  addCmd(ESC, 0x21, 0x30)
  addText(data.outletName.toUpperCase())
  // Normal size
  addCmd(ESC, 0x21, 0x00)

  if (data.isKitchenCopy) {
    addCmd(LF)
    addCmd(ESC, 0x45, 0x01) // Bold on
    addCmd(ESC, 0x21, 0x30) // Double size
    addText('** KITCHEN COPY **')
    addCmd(ESC, 0x21, 0x00) // Normal
    addCmd(ESC, 0x45, 0x00) // Bold off
  }

  addCmd(LF)
  addText(DSEP)

  addCmd(ESC, 0x45, 0x01) // Bold
  addCmd(ESC, 0x21, 0x30) // Double
  addText('TOKEN #' + data.tokenNumber)
  addCmd(ESC, 0x21, 0x00) // Normal
  addCmd(ESC, 0x45, 0x00) // Bold off
  addText(DSEP)

  // Left align
  addCmd(ESC, 0x61, 0x00)
  addText('Customer: ' + data.customerName)
  addText('Date: ' + dateStr + '  ' + timeStr)
  addText('Bill: #' + data.tabId.slice(-6))
  addText(SEP)

  if (data.isKitchenCopy) {
    addCmd(ESC, 0x45, 0x01)
    addText(pad('ITEM', 'QTY'))
    addCmd(ESC, 0x45, 0x00)
    addText(SEP)
    for (const item of data.items) {
      addCmd(ESC, 0x45, 0x01)
      addText(pad(item.name, '' + item.quantity))
      addCmd(ESC, 0x45, 0x00)
    }
    addText(DSEP)
    addCmd(ESC, 0x61, 0x01) // Center
    addCmd(ESC, 0x45, 0x01)
    addCmd(ESC, 0x21, 0x10) // Double height
    addText('PREPARE THIS ORDER')
    addCmd(ESC, 0x21, 0x00)
    addCmd(ESC, 0x45, 0x00)
  } else {
    addCmd(ESC, 0x45, 0x01)
    addText(pad('ITEM', 'AMOUNT'))
    addCmd(ESC, 0x45, 0x00)
    addText(SEP)
    for (const item of data.items) {
      const itemLine = item.quantity + 'x ' + item.name
      const priceLine = 'Rs.' + (item.quantity * item.price).toFixed(0)
      if (itemLine.length + priceLine.length + 1 > W) {
        addText(itemLine)
        addText(pad('', priceLine))
      } else {
        addText(pad(itemLine, priceLine))
      }
    }
    addText(SEP)
    addCmd(ESC, 0x45, 0x01)
    addCmd(ESC, 0x21, 0x10) // Double height
    addText(pad('TOTAL', 'Rs.' + data.totalAmount.toFixed(0)))
    addCmd(ESC, 0x21, 0x00)
    addCmd(ESC, 0x45, 0x00)
    addText(SEP)
    addText(pad('Payment:', data.paymentMode))
    addCmd(LF)
    addCmd(ESC, 0x61, 0x01) // Center
    addText('Thank you! Visit again.')
  }

  addCmd(LF, LF, LF)
  addCmd(GS, 0x56, 0x01) // Partial cut

  // Merge
  const total = parts.reduce((sum, p) => sum + p.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }
  return result
}

// Known service UUIDs for thermal printers
const PRINTER_SERVICES = [
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '000018f0-0000-1000-8000-00805f9b34fb',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '0000ffe0-0000-1000-8000-00805f9b34fb',
  '0000fee7-0000-1000-8000-00805f9b34fb',
]

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
  const [errorMsg, setErrorMsg] = useState("")
  // Cache the printer characteristic so user only pairs once
  const printerCharRef = useRef<any>(null)
  const printerDeviceRef = useRef<any>(null)

  async function sendViaBluetooth(data: Uint8Array): Promise<boolean> {
    let characteristic = printerCharRef.current

    // If we have a cached connection, check if it's still valid
    if (characteristic && printerDeviceRef.current?.gatt?.connected) {
      try {
        await sendChunks(characteristic, data)
        return true
      } catch (e) {
        console.log('[Printer] Cached connection failed, reconnecting...')
        printerCharRef.current = null
      }
    }

    // Connect to printer
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: PRINTER_SERVICES
    })

    if (!device.gatt) throw new Error('GATT not available')

    const server = await device.gatt.connect()
    console.log('[Printer] Connected to:', device.name || device.id)

    // Try known service UUIDs first
    for (const uuid of PRINTER_SERVICES) {
      try {
        const service = await server.getPrimaryService(uuid)
        const chars = await service.getCharacteristics()
        for (const char of chars) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            console.log('[Printer] Found writable char:', char.uuid, 'in service:', uuid)
            printerCharRef.current = char
            printerDeviceRef.current = device
            await sendChunks(char, data)
            return true
          }
        }
      } catch {
        continue
      }
    }

    // Fallback: discover all services
    try {
      const services = await server.getPrimaryServices()
      for (const service of services) {
        const chars = await service.getCharacteristics()
        for (const char of chars) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            console.log('[Printer] Fallback found:', char.uuid)
            printerCharRef.current = char
            printerDeviceRef.current = device
            await sendChunks(char, data)
            return true
          }
        }
      }
    } catch (e) {
      console.error('[Printer] Service discovery failed:', e)
    }

    throw new Error('No writable printer characteristic found')
  }

  async function sendChunks(char: any, data: Uint8Array) {
    const CHUNK = 100
    for (let i = 0; i < data.length; i += CHUNK) {
      const chunk = data.slice(i, i + CHUNK)
      if (char.properties.writeWithoutResponse) {
        await char.writeValueWithoutResponse(chunk)
      } else {
        await char.writeValueWithResponse(chunk)
      }
      await new Promise(r => setTimeout(r, 50))
    }
  }

  async function handlePrint() {
    setStatus("printing")
    setErrorMsg("")

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

    const isAndroid = /android/i.test(navigator.userAgent)

    if (isAndroid) {
      // Android: Use RawBT for direct printing
      const ESC_STR = '\x1B'
      const GS_STR = '\x1D'
      const LF_STR = '\n'

      function genString(isKitchen: boolean): string {
        const SEP = '--------------------------------'
        const DSEP = '================================'
        const W = 32
        const p = (l: string, r: string) => l + ' '.repeat(Math.max(1, W - l.length - r.length)) + r
        const dateStr = baseData.closedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        const timeStr = baseData.closedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

        let r = ESC_STR + '@'
        r += ESC_STR + 'a\x01' + ESC_STR + '!\x30' + baseData.outletName.toUpperCase() + LF_STR + ESC_STR + '!\x00'
        if (isKitchen) r += LF_STR + ESC_STR + 'E\x01' + ESC_STR + '!\x30' + '** KITCHEN COPY **' + LF_STR + ESC_STR + '!\x00' + ESC_STR + 'E\x00'
        r += LF_STR + DSEP + LF_STR + ESC_STR + 'E\x01' + ESC_STR + '!\x30' + 'TOKEN #' + baseData.tokenNumber + LF_STR + ESC_STR + '!\x00' + ESC_STR + 'E\x00' + DSEP + LF_STR
        r += ESC_STR + 'a\x00' + 'Customer: ' + baseData.customerName + LF_STR + 'Date: ' + dateStr + '  ' + timeStr + LF_STR + 'Bill: #' + baseData.tabId.slice(-6) + LF_STR + SEP + LF_STR

        if (isKitchen) {
          r += ESC_STR + 'E\x01' + p('ITEM', 'QTY') + LF_STR + ESC_STR + 'E\x00' + SEP + LF_STR
          for (const item of baseData.items) r += ESC_STR + 'E\x01' + p(item.name, '' + item.quantity) + LF_STR + ESC_STR + 'E\x00'
          r += DSEP + LF_STR + ESC_STR + 'a\x01' + ESC_STR + 'E\x01' + ESC_STR + '!\x10' + 'PREPARE THIS ORDER' + LF_STR + ESC_STR + '!\x00' + ESC_STR + 'E\x00'
        } else {
          r += ESC_STR + 'E\x01' + p('ITEM', 'AMOUNT') + LF_STR + ESC_STR + 'E\x00' + SEP + LF_STR
          for (const item of baseData.items) {
            const il = item.quantity + 'x ' + item.name, pr = 'Rs.' + (item.quantity * item.price).toFixed(0)
            r += (il.length + pr.length + 1 > W) ? il + LF_STR + p('', pr) + LF_STR : p(il, pr) + LF_STR
          }
          r += SEP + LF_STR + ESC_STR + 'E\x01' + ESC_STR + '!\x10' + p('TOTAL', 'Rs.' + baseData.totalAmount.toFixed(0)) + LF_STR + ESC_STR + '!\x00' + ESC_STR + 'E\x00'
          r += SEP + LF_STR + p('Payment:', baseData.paymentMode) + LF_STR + LF_STR + ESC_STR + 'a\x01' + 'Thank you! Visit again.' + LF_STR
        }
        r += LF_STR + LF_STR + LF_STR + GS_STR + 'V\x01'
        return r
      }

      const full = genString(false) + genString(true)
      const base64 = btoa(unescape(encodeURIComponent(full)))
      window.location.href = 'rawbt:base64,' + base64
      setStatus("success")
      setTimeout(() => setStatus("idle"), 3000)
      return
    }

    // Desktop/Laptop: Use Web Bluetooth
    try {
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth not available. Use Chrome browser.')
      }

      // Customer copy
      const customerBytes = generateEscPosBytes({ ...baseData, isKitchenCopy: false })
      await sendViaBluetooth(customerBytes)

      // Small pause
      await new Promise(r => setTimeout(r, 500))

      // Kitchen copy (reuse cached connection)
      const kitchenBytes = generateEscPosBytes({ ...baseData, isKitchenCopy: true })
      await sendChunks(printerCharRef.current, kitchenBytes)

      setStatus("success")
      setTimeout(() => setStatus("idle"), 4000)
    } catch (e: any) {
      console.error('[Printer] Error:', e)
      if (e.name === 'NotFoundError') {
        setStatus("idle") // User cancelled picker
      } else {
        setStatus("error")
        setErrorMsg(e.message || 'Print failed')
        setTimeout(() => setStatus("idle"), 5000)
      }
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
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting...</>
        ) : status === "success" ? (
          <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Printed!</>
        ) : status === "error" ? (
          <><AlertCircle className="w-3.5 h-3.5 text-red-400" /> Failed</>
        ) : (
          <><Printer className="w-3.5 h-3.5" /> Print Bill</>
        )}
      </button>
      {status === "error" && errorMsg && (
        <p className="text-[10px] text-red-400/80 mt-1 max-w-[220px] leading-tight">{errorMsg}</p>
      )}
      {tokenNumber && status === "idle" && (
        <span className="text-[10px] text-slate-500 mt-1">🖨️ Token #{tokenNumber} • 2 copies</span>
      )}
    </div>
  )
}
