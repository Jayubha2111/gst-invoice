'use client'
import React from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useApp } from '../providers'
import { deleteInvoice, saveInvoice } from '@/lib/localStorage'
import Header from '@/components/layout/Header'
import InvoiceTable from '@/components/invoice/InvoiceTable'
import Button from '@/components/ui/Button'

export default function InvoicesPage() {
  const { invoices, refresh } = useApp()

  const handleDelete = (id: string) => {
    deleteInvoice(id)
    refresh()
  }

  const handleMarkPaid = (id: string) => {
    const inv = invoices.find(i => i.id === id)
    if (inv) {
      saveInvoice({ ...inv, status: 'paid', updatedAt: new Date().toISOString() })
      refresh()
    }
  }

  return (
    <div>
      <Header
        title="Invoices"
        subtitle={`${invoices.length} total invoices`}
        action={
          <Link href="/invoices/new">
            <Button><Plus size={16} /> New Invoice</Button>
          </Link>
        }
      />
      <InvoiceTable
        invoices={invoices}
        onDelete={handleDelete}
        onMarkPaid={handleMarkPaid}
      />
    </div>
  )
}
