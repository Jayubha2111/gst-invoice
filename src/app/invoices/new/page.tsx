'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Invoice } from '@/types'
import { saveInvoice } from '@/lib/localStorage'
import { useApp } from '@/app/providers'
import Header from '@/components/layout/Header'
import InvoiceForm from '@/components/invoice/InvoiceForm'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function NewInvoicePage() {
  const router = useRouter()
  const { refresh } = useApp()

  const handleSave = (invoice: Invoice) => {
    saveInvoice(invoice)
    refresh()
    router.push(`/invoices/${invoice.id}`)
  }

  return (
    <div>
      <Header
        title="Create Invoice"
        subtitle="Fill in the details to generate a GST-compliant invoice"
        action={
          <Link href="/invoices">
            <Button variant="ghost"><ArrowLeft size={16} /> Back</Button>
          </Link>
        }
      />
      <InvoiceForm onSave={handleSave} />
    </div>
  )
}
