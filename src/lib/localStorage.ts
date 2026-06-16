import { BusinessProfile, Invoice, Client, AppSettings } from '@/types'

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function getBusinessProfile(): BusinessProfile | null {
  return getItem<BusinessProfile | null>('gst_business_profile', null)
}

export function saveBusinessProfile(profile: BusinessProfile): void {
  setItem('gst_business_profile', profile)
}

export function getInvoices(): Invoice[] {
  const invoices = getItem<Invoice[]>('gst_invoices', [])
  const today = new Date()
  let changed = false
  const updated = invoices.map(inv => {
    if (inv.status === 'sent' && new Date(inv.dueDate) < today) {
      changed = true
      return { ...inv, status: 'overdue' as const, updatedAt: today.toISOString() }
    }
    return inv
  })
  if (changed) setItem('gst_invoices', updated)
  return updated
}

export function getInvoiceById(id: string): Invoice | undefined {
  return getInvoices().find(inv => inv.id === id)
}

export function saveInvoice(invoice: Invoice): void {
  const invoices = getItem<Invoice[]>('gst_invoices', [])
  const idx = invoices.findIndex(i => i.id === invoice.id)
  if (idx >= 0) {
    invoices[idx] = invoice
  } else {
    invoices.push(invoice)
  }
  setItem('gst_invoices', invoices)
}

export function deleteInvoice(id: string): void {
  const invoices = getItem<Invoice[]>('gst_invoices', [])
  setItem('gst_invoices', invoices.filter(i => i.id !== id))
}

export function getClients(): Client[] {
  return getItem<Client[]>('gst_clients', [])
}

export function getClientById(id: string): Client | undefined {
  return getClients().find(c => c.id === id)
}

export function saveClient(client: Client): void {
  const clients = getItem<Client[]>('gst_clients', [])
  const idx = clients.findIndex(c => c.id === client.id)
  if (idx >= 0) {
    clients[idx] = client
  } else {
    clients.push(client)
  }
  setItem('gst_clients', clients)
}

export function deleteClient(id: string): void {
  setItem('gst_clients', getClients().filter(c => c.id !== id))
}

export function getSettings(): AppSettings {
  return getItem<AppSettings>('gst_settings', {
    invoicePrefix: 'INV',
    defaultDueDays: 15,
    defaultTerms: 'Payment is due within the mentioned due date. Thank you for your business.',
  })
}

export function saveSettings(settings: AppSettings): void {
  setItem('gst_settings', settings)
}

export function getNextInvoiceNumber(): string {
  const invoices = getItem<Invoice[]>('gst_invoices', [])
  const settings = getSettings()
  const year = new Date().getFullYear()
  const prefix = settings.invoicePrefix
  const existing = invoices
    .map(i => i.invoiceNumber)
    .filter(n => n.startsWith(`${prefix}-${year}-`))
    .map(n => parseInt(n.split('-')[2] || '0', 10))
    .filter(n => !isNaN(n))
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1
  return `${prefix}-${year}-${String(next).padStart(3, '0')}`
}
