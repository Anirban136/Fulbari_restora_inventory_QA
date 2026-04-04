"use client"

import { useState, useRef, useCallback } from "react"
import { Printer, Loader2, CheckCircle2, AlertCircle, Bluetooth, BluetoothOff } from "lucide-react"

// Known service UUIDs for thermal printers
const PRINTER_SERVICES = [
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '000018f0-0000-1000-8000-00805f9b34fb',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '0000ffe0-0000-1000-8000-00805f9b34fb',
  '0000fee7-0000-1000-8000-00805f9b34fb',
]

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

// Generate ESC/POS bytes for printing
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
  const ESC = 0x1B, GS = 0x1D, LF = 0x0A
  const parts: Uint8Array[] = []
  const encoder = new TextEncoder()

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

  addCmd(ESC, 0x40) // Init
  addCmd(ESC, 0x61, 0x01) // Center
  addCmd(ESC, 0x21, 0x30) // Double size
  addText(data.outletName.toUpperCase())
  addCmd(ESC, 0x21, 0x00) // Normal

  if (data.isKitchenCopy) {
    addCmd(LF)
    addCmd(ESC, 0x45, 0x01, ESC, 0x21, 0x30)
    addText('** KITCHEN COPY **')
    addCmd(ESC, 0x21, 0x00, ESC, 0x45, 0x00)
  }

  addCmd(LF)
  addText(DSEP)
  addCmd(ESC, 0x45, 0x01, ESC, 0x21, 0x30)
  addText('TOKEN #' + data.tokenNumber)
  addCmd(ESC, 0x21, 0x00, ESC, 0x45, 0x00)
  addText(DSEP)

  addCmd(ESC, 0x61, 0x00) // Left
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
    addCmd(ESC, 0x61, 0x01, ESC, 0x45, 0x01, ESC, 0x21, 0x10)
    addText('PREPARE THIS ORDER')
    addCmd(ESC, 0x21, 0x00, ESC, 0x45, 0x00)
  } else {
    addCmd(ESC, 0x45, 0x01)
    addText(pad('ITEM', 'AMOUNT'))
    addCmd(ESC, 0x45, 0x00)
    addText(SEP)
    for (const item of data.items) {
      const il = item.quantity + 'x ' + item.name
      const pr = 'Rs.' + (item.quantity * item.price).toFixed(0)
      addText((il.length + pr.length + 1 > W) ? il + '\n' + pad('', pr) : pad(il, pr))
    }
    addText(SEP)
    addCmd(ESC, 0x45, 0x01, ESC, 0x21, 0x10)
    addText(pad('TOTAL', 'Rs.' + data.totalAmount.toFixed(0)))
    addCmd(ESC, 0x21, 0x00, ESC, 0x45, 0x00)
    addText(SEP)
    addText(pad('Payment:', data.paymentMode))
    addCmd(LF)
    addCmd(ESC, 0x61, 0x01)
    addText('Thank you! Visit again.')
  }

  addCmd(LF, LF, LF)
  addCmd(GS, 0x56, 0x01) // Cut

  const total = parts.reduce((s, p) => s + p.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const part of parts) { result.set(part, offset); offset += part.length }
  return result
}

export function PrintReceiptButton({
  outletName, tokenNumber, customerName, tabId,
  items, totalAmount, paymentMode, closedAt,
  accentColor = "amber"
}: PrintReceiptButtonProps) {
  const [btStatus, setBtStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected")
  const [printStatus, setPrintStatus] = useState<"idle" | "printing" | "success" | "error">("idle")
  const [deviceName, setDeviceName] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  
  const charRef = useRef<any>(null)
  const deviceRef = useRef<any>(null)

  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)

  // ---- CONNECT PRINTER ----
  async function handleConnect() {
    if (btStatus === "connected") return // Already connected

    setBtStatus("connecting")
    setErrorMsg("")

    try {
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth not supported. Use Chrome.')
      }

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: PRINTER_SERVICES
      })

      setDeviceName(device.name || device.id || 'Printer')

      if (!device.gatt) throw new Error('GATT not available')

      const server = await device.gatt.connect()

      // Find writable characteristic
      let foundChar: any = null

      for (const uuid of PRINTER_SERVICES) {
        try {
          const service = await server.getPrimaryService(uuid)
          const chars = await service.getCharacteristics()
          for (const c of chars) {
            if (c.properties.write || c.properties.writeWithoutResponse) {
              foundChar = c
              console.log('[OK] Found writable char:', c.uuid, 'in service:', uuid)
              break
            }
          }
          if (foundChar) break
        } catch { continue }
      }

      // Fallback: scan all services
      if (!foundChar) {
        try {
          const services = await server.getPrimaryServices()
          for (const service of services) {
            console.log('[Scan] Service:', service.uuid)
            try {
              const chars = await service.getCharacteristics()
              for (const c of chars) {
                console.log('[Scan] Char:', c.uuid, 'write:', c.properties.write, 'writeNoResp:', c.properties.writeWithoutResponse)
                if (c.properties.write || c.properties.writeWithoutResponse) {
                  foundChar = c
                  break
                }
              }
              if (foundChar) break
            } catch { continue }
          }
        } catch (e) {
          console.error('[Scan] Failed:', e)
        }
      }

      if (!foundChar) {
        throw new Error('Printer connected but no writable channel found. It may not support Bluetooth Low Energy (BLE).')
      }

      charRef.current = foundChar
      deviceRef.current = device

      // Listen for disconnection
      device.addEventListener('gattserverdisconnected', () => {
        setBtStatus("disconnected")
        setDeviceName("")
        charRef.current = null
        deviceRef.current = null
      })

      setBtStatus("connected")
    } catch (e: any) {
      console.error('[Connect]', e)
      if (e.name === 'NotFoundError') {
        setBtStatus("disconnected") // User cancelled
      } else {
        setBtStatus("error")
        setErrorMsg(e.message || 'Connection failed')
      }
    }
  }

  // ---- SEND TO PRINTER ----
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

  // ---- PRINT ----
  async function handlePrint() {
    setPrintStatus("printing")
    setErrorMsg("")

    const dateObj = closedAt ? (typeof closedAt === 'string' ? new Date(closedAt) : closedAt) : new Date()
    const receiptItems = items.map(item => ({
      name: item.MenuItem.name, quantity: item.quantity, price: item.priceAtTime
    }))
    const baseData = {
      outletName, tokenNumber: tokenNumber || 0, customerName: customerName || 'Walk-in',
      tabId, items: receiptItems, totalAmount, paymentMode: paymentMode || 'N/A', closedAt: dateObj,
    }

    // Android: RawBT
    if (isAndroid) {
      const E = '\x1B', G = '\x1D', L = '\n', S = '--------------------------------', D = '================================', W = 32
      const p = (l: string, r: string) => l + ' '.repeat(Math.max(1, W - l.length - r.length)) + r
      const ds = baseData.closedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      const ts = baseData.closedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      
      function gen(kitchen: boolean) {
        let r = E+'@'+E+'a\x01'+E+'!\x30'+baseData.outletName.toUpperCase()+L+E+'!\x00'
        if (kitchen) r += L+E+'E\x01'+E+'!\x30'+'** KITCHEN COPY **'+L+E+'!\x00'+E+'E\x00'
        r += L+D+L+E+'E\x01'+E+'!\x30'+'TOKEN #'+baseData.tokenNumber+L+E+'!\x00'+E+'E\x00'+D+L
        r += E+'a\x00'+'Customer: '+baseData.customerName+L+'Date: '+ds+'  '+ts+L+'Bill: #'+baseData.tabId.slice(-6)+L+S+L
        if (kitchen) {
          r += E+'E\x01'+p('ITEM','QTY')+L+E+'E\x00'+S+L
          for (const i of baseData.items) r += E+'E\x01'+p(i.name,''+i.quantity)+L+E+'E\x00'
          r += D+L+E+'a\x01'+E+'E\x01'+E+'!\x10'+'PREPARE THIS ORDER'+L+E+'!\x00'+E+'E\x00'
        } else {
          r += E+'E\x01'+p('ITEM','AMOUNT')+L+E+'E\x00'+S+L
          for (const i of baseData.items) { const il=i.quantity+'x '+i.name,pr='Rs.'+(i.quantity*i.price).toFixed(0); r+=(il.length+pr.length+1>W)?il+L+p('',pr)+L:p(il,pr)+L }
          r += S+L+E+'E\x01'+E+'!\x10'+p('TOTAL','Rs.'+baseData.totalAmount.toFixed(0))+L+E+'!\x00'+E+'E\x00'+S+L+p('Payment:',baseData.paymentMode)+L+L+E+'a\x01'+'Thank you! Visit again.'+L
        }
        return r+L+L+L+G+'V\x01'
      }
      const base64 = btoa(unescape(encodeURIComponent(gen(false)+gen(true))))
      window.location.href = 'rawbt:base64,' + base64
      setPrintStatus("success")
      setTimeout(() => setPrintStatus("idle"), 3000)
      return
    }

    // Desktop: Web Bluetooth (must be connected first)
    if (!charRef.current) {
      setPrintStatus("error")
      setErrorMsg("Connect printer first!")
      setTimeout(() => setPrintStatus("idle"), 3000)
      return
    }

    try {
      const customerBytes = generateEscPosBytes({ ...baseData, isKitchenCopy: false })
      await sendChunks(charRef.current, customerBytes)
      await new Promise(r => setTimeout(r, 500))
      const kitchenBytes = generateEscPosBytes({ ...baseData, isKitchenCopy: true })
      await sendChunks(charRef.current, kitchenBytes)
      setPrintStatus("success")
      setTimeout(() => setPrintStatus("idle"), 4000)
    } catch (e: any) {
      console.error('[Print]', e)
      setPrintStatus("error")
      setErrorMsg(e.message || 'Print failed')
      setBtStatus("disconnected")
      charRef.current = null
      setTimeout(() => setPrintStatus("idle"), 5000)
    }
  }

  const isAmber = accentColor === "amber"

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Connect Printer Button (desktop only) */}
      {!isAndroid && (
        <button
          onClick={handleConnect}
          disabled={btStatus === "connecting" || btStatus === "connected"}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.98] ${
            btStatus === "connected"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default"
              : btStatus === "connecting"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400 cursor-wait opacity-70"
              : btStatus === "error"
              ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
          }`}
        >
          {btStatus === "connected" ? (
            <>
              <Bluetooth className="w-4 h-4 text-emerald-400" />
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></span>
                {deviceName || "Printer"} Connected
              </span>
            </>
          ) : btStatus === "connecting" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching for printer...
            </>
          ) : btStatus === "error" ? (
            <>
              <BluetoothOff className="w-4 h-4" />
              Retry Connection
            </>
          ) : (
            <>
              <Bluetooth className="w-4 h-4" />
              Connect Printer
            </>
          )}
        </button>
      )}

      {/* Error message */}
      {btStatus === "error" && errorMsg && (
        <p className="text-[11px] text-red-400/80 text-center leading-tight px-2">{errorMsg}</p>
      )}

      {/* Print Bill Button */}
      <button
        onClick={handlePrint}
        disabled={printStatus === "printing" || (!isAndroid && btStatus !== "connected")}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed ${
          printStatus === "success"
            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
            : printStatus === "error"
            ? "bg-red-500/20 border-red-500/30 text-red-400"
            : isAmber
            ? "bg-orange-600 border-orange-500/50 text-white hover:bg-orange-500 shadow-[0_0_25px_-5px_rgba(249,115,22,0.4)]"
            : "bg-sky-600 border-sky-500/50 text-white hover:bg-sky-500 shadow-[0_0_25px_-5px_rgba(14,165,233,0.4)]"
        }`}
      >
        {printStatus === "printing" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Printing...</>
        ) : printStatus === "success" ? (
          <><CheckCircle2 className="w-4 h-4" /> Printed! ✓</>
        ) : printStatus === "error" ? (
          <><AlertCircle className="w-4 h-4" /> {errorMsg || "Failed"}</>
        ) : (
          <><Printer className="w-4 h-4" /> Print Bill</>
        )}
      </button>

      {tokenNumber && (
        <span className="text-[10px] text-slate-500">
          Token #{tokenNumber} • Customer + Kitchen copies
        </span>
      )}
    </div>
  )
}
