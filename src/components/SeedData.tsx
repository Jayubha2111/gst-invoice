'use client'
import { useEffect } from 'react'
import { BusinessProfile, Client, Invoice } from '@/types'
import { saveBusinessProfile, saveClient, saveInvoice } from '@/lib/localStorage'

const sampleProfile: BusinessProfile = {
  name: 'Bhavani Motors',
  gstin: '29ABCDE1234F1Z5',
  address: '123, Industrial Area, MG Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560001',
  phone: '+91 98765 43210',
  email: 'info@bhavanimotors.com',
  bankName: 'State Bank of India',
  accountNumber: '12345678901234',
  ifscCode: 'SBIN0001234',
  upiId: 'bhavanimotors@upi',
}

const sampleClients: Client[] = [
  {
    id: 'client-1',
    name: 'Tech Solutions Pvt Ltd',
    gstin: '29FGHIJ5678K1Z3',
    email: 'accounts@techsolutions.com',
    phone: '+91 99887 76655',
    address: '456, Electronic City',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560100',
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'client-2',
    name: 'Mumbai Auto Parts',
    gstin: '27KLMNO9012P1Z7',
    email: 'purchase@mumbaiauto.in',
    phone: '+91 88776 65544',
    address: '789, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400093',
    createdAt: '2024-02-01T00:00:00.000Z',
  },
]

const sampleInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2024-001',
    invoiceDate: '2024-03-01',
    dueDate: '2024-03-16',
    status: 'paid',
    clientId: 'client-1',
    client: sampleClients[0],
    lineItems: [
      {
        id: 'li-1',
        description: 'Engine Oil Change Service',
        hsnCode: '998721',
        quantity: 2,
        unit: 'Service',
        rate: 2500,
        gstRate: 18,
        amount: 5000,
        cgst: 450,
        sgst: 450,
        igst: 0,
        total: 5900,
      },
      {
        id: 'li-2',
        description: 'Air Filter Replacement',
        hsnCode: '842131',
        quantity: 1,
        unit: 'Nos',
        rate: 1200,
        gstRate: 18,
        amount: 1200,
        cgst: 108,
        sgst: 108,
        igst: 0,
        total: 1416,
      },
    ],
    subtotal: 6200,
    totalCGST: 558,
    totalSGST: 558,
    totalIGST: 0,
    totalGST: 1116,
    grandTotal: 7316,
    isInterstate: false,
    notes: 'Thank you for your business!',
    termsAndConditions: 'Payment is due within 15 days.',
    createdAt: '2024-03-01T10:00:00.000Z',
    updatedAt: '2024-03-15T10:00:00.000Z',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2024-002',
    invoiceDate: '2024-03-10',
    dueDate: '2024-03-25',
    status: 'sent',
    clientId: 'client-2',
    client: sampleClients[1],
    lineItems: [
      {
        id: 'li-3',
        description: 'Brake Pad Set (4 wheels)',
        hsnCode: '870830',
        quantity: 2,
        unit: 'Set',
        rate: 3500,
        gstRate: 28,
        amount: 7000,
        cgst: 0,
        sgst: 0,
        igst: 1960,
        total: 8960,
      },
      {
        id: 'li-4',
        description: 'Coolant Refill',
        hsnCode: '382000',
        quantity: 3,
        unit: 'Litre',
        rate: 400,
        gstRate: 18,
        amount: 1200,
        cgst: 0,
        sgst: 0,
        igst: 216,
        total: 1416,
      },
    ],
    subtotal: 8200,
    totalCGST: 0,
    totalSGST: 0,
    totalIGST: 2176,
    totalGST: 2176,
    grandTotal: 10376,
    isInterstate: true,
    notes: '',
    termsAndConditions: 'Payment is due within 15 days.',
    createdAt: '2024-03-10T14:00:00.000Z',
    updatedAt: '2024-03-10T14:00:00.000Z',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2024-003',
    invoiceDate: '2024-02-01',
    dueDate: '2024-02-16',
    status: 'overdue',
    clientId: 'client-2',
    client: sampleClients[1],
    lineItems: [
      {
        id: 'li-5',
        description: 'Annual Maintenance Contract',
        hsnCode: '998713',
        quantity: 1,
        unit: 'Service',
        rate: 15000,
        gstRate: 18,
        amount: 15000,
        cgst: 0,
        sgst: 0,
        igst: 2700,
        total: 17700,
      },
    ],
    subtotal: 15000,
    totalCGST: 0,
    totalSGST: 0,
    totalIGST: 2700,
    totalGST: 2700,
    grandTotal: 17700,
    isInterstate: true,
    notes: 'AMC for fleet vehicles',
    termsAndConditions: 'Payment is due within 15 days.',
    createdAt: '2024-02-01T09:00:00.000Z',
    updatedAt: '2024-02-01T09:00:00.000Z',
  },
]

export default function SeedData() {
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('gst_business_profile')) {
      saveBusinessProfile(sampleProfile)
      sampleClients.forEach(c => saveClient(c))
      sampleInvoices.forEach(inv => saveInvoice(inv))
      console.log('Sample data seeded successfully!')
    }
  }, [])

  return null
}
