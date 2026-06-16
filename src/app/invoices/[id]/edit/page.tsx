'use client'
import React, { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Invoice } from '@/types'
import { getInvoiceById, saveInvoice } from '@/lib/localStorage'
import { useApp } from '@/app/providers'
import Header from '@/components/layout/Header'
import InvoiceForm from '@/components/invoice/InvoiceForm'
import Button from '@/components/ui/Button'

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { refresh } = useApp()
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    setInvoice(getInvoiceById(id) || null)
  }, [id])

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Invoice not found</p>
        <Link href="/invoices" className="text-blue-700 font-medium text-sm mt-2 inline-block">Back to Invoices</Link>
      </div>
    )
  }

  const handleSave = (invoice: Invoice) => {
    saveInvoice(invoice)
    refresh()
    router.push(`/invoices/${invoice.id}`)
  }

  return (
    <div>
      <Header
        title={`Edit Invoice ${invoice.invoiceNumber}`}
        action={
          <Link href={`/invoices/${id}`}>
            <Button variant="ghost"><ArrowLeft size={16} /> Back</Button>
          </Link>
        }
      />
      <InvoiceForm initialInvoice={invoice} onSave={handleSave} />
    </div>
  )
}
