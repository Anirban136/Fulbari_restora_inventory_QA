/**
 * Bluetooth Thermal Printer Utility (ESC/POS)
 * Compatible with Gobbler and similar 58mm/80mm thermal printers
 * Uses the Web Bluetooth API to communicate directly from the browser
 */

// Web Bluetooth API type declarations (not in default TS lib)
declare global {
  interface Navigator {
    bluetooth: any
  }
}

// ESC/POS Command Constants
const ESC = 0x1B
const GS = 0x1D
const LF = 0x0A

const COMMANDS = {
  INIT: new Uint8Array([ESC, 0x40]),                       // Initialize printer
  ALIGN_LEFT: new Uint8Array([ESC, 0x61, 0x00]),
  ALIGN_CENTER: new Uint8Array([ESC, 0x61, 0x01]),
  ALIGN_RIGHT: new Uint8Array([ESC, 0x61, 0x02]),
  BOLD_ON: new Uint8Array([ESC, 0x45, 0x01]),
  BOLD_OFF: new Uint8Array([ESC, 0x45, 0x00]),
  DOUBLE_HEIGHT: new Uint8Array([ESC, 0x21, 0x10]),        // Double height text
  DOUBLE_WIDTH: new Uint8Array([ESC, 0x21, 0x20]),         // Double width text
  DOUBLE_SIZE: new Uint8Array([ESC, 0x21, 0x30]),          // Double height + width
  NORMAL_SIZE: new Uint8Array([ESC, 0x21, 0x00]),          // Normal size
  UNDERLINE_ON: new Uint8Array([ESC, 0x2D, 0x01]),
  UNDERLINE_OFF: new Uint8Array([ESC, 0x2D, 0x00]),
  FEED_LINE: new Uint8Array([LF]),
  FEED_LINES: (n: number) => new Uint8Array([ESC, 0x64, n]),
  CUT_PAPER: new Uint8Array([GS, 0x56, 0x00]),            // Full cut
  PARTIAL_CUT: new Uint8Array([GS, 0x56, 0x01]),          // Partial cut
  SEPARATOR: '--------------------------------',
  SEPARATOR_DOUBLE: '================================',
}

const CHAR_WIDTH = 32 // Characters per line for 58mm paper

// Text encoder
const encoder = new TextEncoder()

function textToBytes(text: string): Uint8Array {
  return encoder.encode(text)
}

function padLine(left: string, right: string, width = CHAR_WIDTH): string {
  const spaces = width - left.length - right.length
  return left + ' '.repeat(Math.max(1, spaces)) + right
}

function centerText(text: string, width = CHAR_WIDTH): string {
  const spaces = Math.max(0, Math.floor((width - text.length) / 2))
  return ' '.repeat(spaces) + text
}

interface PrintItem {
  name: string
  quantity: number
  price: number
}

interface ReceiptData {
  outletName: string
  tokenNumber: number
  customerName: string
  tabId: string
  items: PrintItem[]
  totalAmount: number
  paymentMode: string
  closedAt: Date | string
  isKitchenCopy?: boolean
}

/**
 * Generate ESC/POS receipt bytes
 */
function generateReceipt(data: ReceiptData): Uint8Array {
  const parts: Uint8Array[] = []

  const add = (bytes: Uint8Array) => parts.push(bytes)
  const addText = (text: string) => parts.push(textToBytes(text + '\n'))
  const addLine = () => addText(COMMANDS.SEPARATOR)
  const addDoubleLine = () => addText(COMMANDS.SEPARATOR_DOUBLE)

  // Initialize
  add(COMMANDS.INIT)

  // Header
  add(COMMANDS.ALIGN_CENTER)
  add(COMMANDS.DOUBLE_SIZE)
  addText(data.outletName.toUpperCase())
  add(COMMANDS.NORMAL_SIZE)

  if (data.isKitchenCopy) {
    add(COMMANDS.FEED_LINES(1))
    add(COMMANDS.BOLD_ON)
    add(COMMANDS.DOUBLE_SIZE)
    addText('** KITCHEN COPY **')
    add(COMMANDS.NORMAL_SIZE)
    add(COMMANDS.BOLD_OFF)
  }

  add(COMMANDS.FEED_LINES(1))
  addDoubleLine()

  // Token Number - BIG and prominent
  add(COMMANDS.BOLD_ON)
  add(COMMANDS.DOUBLE_SIZE)
  addText(`TOKEN #${data.tokenNumber}`)
  add(COMMANDS.NORMAL_SIZE)
  add(COMMANDS.BOLD_OFF)

  addDoubleLine()

  // Customer & Date info
  add(COMMANDS.ALIGN_LEFT)
  const dateObj = typeof data.closedAt === 'string' ? new Date(data.closedAt) : data.closedAt
  const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

  addText(`Customer: ${data.customerName}`)
  addText(`Date: ${dateStr}  Time: ${timeStr}`)
  addText(`Bill: #${data.tabId.slice(-6)}`)

  addLine()

  // Items Header
  add(COMMANDS.BOLD_ON)
  addText(padLine('ITEM', 'AMOUNT'))
  add(COMMANDS.BOLD_OFF)
  addLine()

  // Items
  for (const item of data.items) {
    const itemLine = `${item.quantity}x ${item.name}`
    const priceLine = `Rs.${(item.quantity * item.price).toFixed(0)}`

    // If item name is too long, print on two lines
    if (itemLine.length + priceLine.length + 1 > CHAR_WIDTH) {
      addText(itemLine)
      add(COMMANDS.ALIGN_RIGHT)
      addText(priceLine)
      add(COMMANDS.ALIGN_LEFT)
    } else {
      addText(padLine(itemLine, priceLine))
    }
  }

  addLine()

  // Total
  add(COMMANDS.BOLD_ON)
  add(COMMANDS.DOUBLE_HEIGHT)
  addText(padLine('TOTAL', `Rs.${data.totalAmount.toFixed(0)}`))
  add(COMMANDS.NORMAL_SIZE)
  add(COMMANDS.BOLD_OFF)

  addLine()

  // Payment Mode
  addText(padLine('Payment:', data.paymentMode || 'N/A'))

  add(COMMANDS.FEED_LINES(1))

  // Footer
  add(COMMANDS.ALIGN_CENTER)

  if (!data.isKitchenCopy) {
    addText('Thank you! Visit again.')
  } else {
    add(COMMANDS.BOLD_ON)
    addText('PREPARE THIS ORDER')
    add(COMMANDS.BOLD_OFF)
  }

  add(COMMANDS.FEED_LINES(3))
  add(COMMANDS.PARTIAL_CUT)

  // Merge all parts
  const totalLength = parts.reduce((sum, p) => sum + p.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }

  return result
}

/**
 * Connect to a Bluetooth thermal printer and return the characteristic for writing
 */
async function connectPrinter(): Promise<any | null> {
  try {
    // Request Bluetooth device (user picks the printer from browser dialog)
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { namePrefix: 'Gobbler' },
        { namePrefix: 'BlueTooth Printer' },
        { namePrefix: 'Printer' },
        { namePrefix: 'BT' },
      ],
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', // Common printer service UUID
        '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Another common one
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Serial port service
      ]
    })

    if (!device.gatt) {
      throw new Error('GATT not available on this device')
    }

    const server = await device.gatt.connect()
    const services = await server.getPrimaryServices()

    // Find the writable characteristic
    for (const service of services) {
      const characteristics = await service.getCharacteristics()
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          return char
        }
      }
    }

    throw new Error('No writable characteristic found on printer')
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      // User cancelled the device picker
      return null
    }
    console.error('Bluetooth connection error:', error)
    throw error
  }
}

/**
 * Send data to printer in chunks (BLE has a max packet size ~512 bytes)
 */
async function sendToPrinter(characteristic: any, data: Uint8Array) {
  const CHUNK_SIZE = 100 // Safe chunk size for BLE
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE)
    if (characteristic.properties.writeWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk)
    } else {
      await characteristic.writeValueWithResponse(chunk)
    }
    // Small delay between chunks for printer to process
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

/**
 * Main print function: connects to printer and prints 2 copies
 * (1 customer copy + 1 kitchen copy)
 */
export async function printReceipt(data: ReceiptData): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if Web Bluetooth is available
    if (!navigator.bluetooth) {
      return { success: false, error: 'Bluetooth is not supported in this browser. Please use Chrome on Android or Desktop.' }
    }

    const characteristic = await connectPrinter()
    if (!characteristic) {
      return { success: false, error: 'Printer connection was cancelled.' }
    }

    // Print CUSTOMER COPY
    const customerReceipt = generateReceipt({ ...data, isKitchenCopy: false })
    await sendToPrinter(characteristic, customerReceipt)

    // Brief pause between prints
    await new Promise(resolve => setTimeout(resolve, 500))

    // Print KITCHEN COPY
    const kitchenReceipt = generateReceipt({ ...data, isKitchenCopy: true })
    await sendToPrinter(characteristic, kitchenReceipt)

    return { success: true }
  } catch (error: any) {
    console.error('Print error:', error)
    return { success: false, error: error.message || 'Failed to print receipt.' }
  }
}

export type { ReceiptData, PrintItem }
