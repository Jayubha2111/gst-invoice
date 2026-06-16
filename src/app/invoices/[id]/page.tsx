'use client'
import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Printer, Edit3, Send } from 'lucide-react'
import { Invoice, BusinessProfile } from '@/types'
import { getInvoiceById, saveInvoice, getBusinessProfile } from '@/lib/localStorage'
import { downloadPDF, printElement } from '@/lib/pdfExport'
import { useApp } from '@/app/providers'
import { formatDate } from '@/lib/invoiceHelpers'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import InvoicePreview from '@/components/invoice/InvoicePreview'

export default function ViewInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { refresh } = useApp()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [profile, setProfile] = useState<BusinessProfile | null>(null)

  useEffect(() => {
    setInvoice(getInvoiceById(id) || null)
    setProfile(getBusinessProfile())
  }, [id])

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Invoice not found</p>
        <Link href="/invoices" className="text-blue-700 font-medium text-sm mt-2 inline-block">Back to Invoices</Link>
      </div>
    )
  }

  const handleStatusChange = (status: 'sent' | 'paid' | 'cancelled') => {
    saveInvoice({ ...invoice, status, updatedAt: new Date().toISOString() })
    setInvoice(getInvoiceById(id) || null)
    refresh()
  }

  return (
    <div>
      <Header
        title={`Invoice ${invoice.invoiceNumber}`}
        subtitle={`Created on ${formatDate(invoice.createdAt)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/invoices">
              <Button variant="ghost"><ArrowLeft size={16} /> Back</Button>
            </Link>
            <Link href={`/invoices/${id}/edit`}>
              <Button variant="secondary"><Edit3 size={16} /> Edit</Button>
            </Link>
            <Button variant="secondary" onClick={() => printElement('invoice-preview')}>
              <Printer size={16} /> Print
            </Button>
            <Button onClick={() => downloadPDF('invoice-preview', `invoice-${invoice.invoiceNumber}.pdf`)}>
              <Download size={16} /> Download PDF
            </Button>
          </div>
        }
      />

      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white rounded-xl border border-gray-200">
        <span className="text-sm text-gray-500">Status:</span>
        <Badge variant={invoice.status}>{invoice.status}</Badge>
        <div className="flex gap-2 ml-auto">
          {invoice.status === 'draft' && (
            <Button size="sm" onClick={() => handleStatusChange('sent')}>
              <Send size={14} /> Mark Sent
            </Button>
          )}
          {invoice.status === 'sent' && (
            <Button size="sm" variant="secondary" onClick={() => handleStatusChange('paid')}>
              Mark Paid
            </Button>
          )}
          {(invoice.status === 'draft' || invoice.status === 'sent' || invoice.status === 'overdue') && (
            <Button size="sm" variant="ghost" onClick={() => handleStatusChange('cancelled')}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <InvoicePreview invoice={invoice} profile={profile} />
    </div>
  )
}
