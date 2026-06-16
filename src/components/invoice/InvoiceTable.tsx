'use client'
import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ArrowUpDown, Trash2, CheckCircle, Eye, Edit3, FileText } from 'lucide-react'
import { Invoice } from '@/types'
import { formatINR, formatDate } from '@/lib/invoiceHelpers'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

interface InvoiceTableProps {
  invoices: Invoice[]
  onDelete: (id: string) => void
  onMarkPaid: (id: string) => void
}

type SortField = 'invoiceDate' | 'grandTotal' | 'dueDate'
type SortDir = 'asc' | 'desc'

export default function InvoiceTable({ invoices, onDelete, onMarkPaid }: InvoiceTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('invoiceDate')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = [...invoices]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.client.name.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter(inv => inv.status === statusFilter)
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortField === 'grandTotal') cmp = a.grandTotal - b.grandTotal
      else if (sortField === 'invoiceDate') cmp = new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime()
      else cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [invoices, search, statusFilter, sortField, sortDir])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search by invoice # or client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => toggleSort('invoiceDate')}>
                <span className="inline-flex items-center gap-1">Date <ArrowUpDown size={12} /></span>
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => toggleSort('dueDate')}>
                <span className="inline-flex items-center gap-1">Due Date <ArrowUpDown size={12} /></span>
              </th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => toggleSort('grandTotal')}>
                <span className="inline-flex items-center gap-1">Amount <ArrowUpDown size={12} /></span>
              </th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">GST</th>
              <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  <FileText size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No invoices found</p>
                  <Link href="/invoices/new" className="text-blue-700 text-sm font-medium mt-1 inline-block">
                    Create your first invoice
                  </Link>
                </td>
              </tr>
            ) : (
              filtered.map(inv => (
                <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link href={`/invoices/${inv.id}`} className="font-medium text-blue-700 hover:underline">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{inv.client.name}</td>
                  <td className="py-3 px-4 text-gray-600">{formatDate(inv.invoiceDate)}</td>
                  <td className="py-3 px-4 text-gray-600">{formatDate(inv.dueDate)}</td>
                  <td className="py-3 px-4 text-right font-mono font-medium">{formatINR(inv.grandTotal)}</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-500">{formatINR(inv.totalGST)}</td>
                  <td className="py-3 px-4 text-center"><Badge variant={inv.status}>{inv.status}</Badge></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/invoices/${inv.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600">
                        <Eye size={16} />
                      </Link>
                      <Link href={`/invoices/${inv.id}/edit`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                        <Edit3 size={16} />
                      </Link>
                      {inv.status !== 'paid' && (
                        <button onClick={() => onMarkPaid(inv.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-600">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button onClick={() => setDeleteId(inv.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Invoice">
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this invoice? This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { if (deleteId) { onDelete(deleteId); setDeleteId(null) } }}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
