export interface BusinessProfile {
  name: string
  gstin: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
  bankName: string
  accountNumber: string
  ifscCode: string
  logoBase64?: string
  upiId?: string
  signatureBase64?: string
}

export interface Client {
  id: string
  name: string
  gstin?: string
  email?: string
  phone?: string
  address: string
  city: string
  state: string
  pincode: string
  createdAt: string
}

export interface LineItem {
  id: string
  description: string
  hsnCode: string
  quantity: number
  unit: string
  rate: number
  gstRate: number
  amount: number
  cgst: number
  sgst: number
  igst: number
  total: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  clientId: string
  client: Client
  lineItems: LineItem[]
  subtotal: number
  totalCGST: number
  totalSGST: number
  totalIGST: number
  totalGST: number
  grandTotal: number
  isInterstate: boolean
  notes?: string
  termsAndConditions?: string
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  invoicePrefix: string
  defaultDueDays: number
  defaultTerms: string
}

export const UNITS = ['Nos', 'Kg', 'Litre', 'Meter', 'Sq.Ft', 'Box', 'Pack', 'Dozen', 'Hour', 'Day', 'Month', 'Service']
export const GST_RATES = [0, 5, 12, 18, 28]
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
]
