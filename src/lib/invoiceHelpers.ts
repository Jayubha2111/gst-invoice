import { LineItem } from '@/types'

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function convertBelow1000(n: number): string {
  if (n === 0) return ''
  const hundreds = Math.floor(n / 100)
  const remainder = n % 100
  let result = ''
  if (hundreds > 0) result += ONES[hundreds] + ' Hundred '
  if (remainder > 0) {
    if (remainder < 20) result += ONES[remainder]
    else result += TENS[Math.floor(remainder / 10)] + (remainder % 10 ? ' ' + ONES[remainder % 10] : '')
  }
  return result.trim()
}

export function numberToWords(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only'
  const num = Math.floor(amount)
  if (num <= 0) return 'Zero Rupees Only'

  const crore = Math.floor(num / 10000000)
  const lakh = Math.floor((num % 10000000) / 100000)
  const thousand = Math.floor((num % 100000) / 1000)
  const hundred = num % 1000

  const parts: string[] = []
  if (crore > 0) parts.push(convertBelow1000(crore) + ' Crore')
  if (lakh > 0) parts.push(convertBelow1000(lakh) + ' Lakh')
  if (thousand > 0) parts.push(convertBelow1000(thousand) + ' Thousand')
  if (hundred > 0) parts.push(convertBelow1000(hundred))

  return parts.join(' ') + ' Rupees Only'
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function calculateLineItem(
  item: { description: string; hsnCode: string; quantity: number; unit: string; rate: number; gstRate: number },
  isInterstate: boolean
): LineItem {
  const id = crypto.randomUUID?.() || Math.random().toString(36).substr(2)
  const amount = item.quantity * item.rate
  const gstAmount = (amount * item.gstRate) / 100

  if (isInterstate) {
    return {
      ...item,
      id,
      amount,
      igst: Math.round(gstAmount * 100) / 100,
      cgst: 0,
      sgst: 0,
      total: Math.round((amount + gstAmount) * 100) / 100,
    }
  } else {
    return {
      ...item,
      id,
      amount,
      cgst: Math.round((gstAmount / 2) * 100) / 100,
      sgst: Math.round((gstAmount / 2) * 100) / 100,
      igst: 0,
      total: Math.round((amount + gstAmount) * 100) / 100,
    }
  }
}

export function calculateInvoiceTotals(lineItems: LineItem[], isInterstate: boolean): {
  subtotal: number
  totalCGST: number
  totalSGST: number
  totalIGST: number
  totalGST: number
  grandTotal: number
} {
  const subtotal = Math.round(lineItems.reduce((s, item) => s + item.amount, 0) * 100) / 100
  const totalCGST = Math.round(lineItems.reduce((s, item) => s + item.cgst, 0) * 100) / 100
  const totalSGST = Math.round(lineItems.reduce((s, item) => s + item.sgst, 0) * 100) / 100
  const totalIGST = Math.round(lineItems.reduce((s, item) => s + item.igst, 0) * 100) / 100
  const totalGST = isInterstate ? totalIGST : totalCGST + totalSGST
  const grandTotal = Math.round((subtotal + totalGST) * 100) / 100

  return { subtotal, totalCGST, totalSGST, totalIGST, totalGST, grandTotal }
}

export function isInterstateTransaction(businessState: string, clientState: string): boolean {
  if (!businessState || !clientState) return false
  return businessState !== clientState
}
