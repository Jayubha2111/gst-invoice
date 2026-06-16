'use client'
import React, { useState, useMemo } from 'react'
import { Plus, Search, Edit3, Trash2, Mail, Phone, MapPin, FileText, Users } from 'lucide-react'
import Link from 'next/link'
import { Client } from '@/types'
import { saveClient, deleteClient } from '@/lib/localStorage'
import { useApp } from '@/app/providers'
import { formatINR } from '@/lib/invoiceHelpers'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import { INDIAN_STATES } from '@/types'

export default function ClientsPage() {
  const { clients, invoices, refresh } = useApp()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', gstin: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' })

  const filtered = useMemo(() => {
    if (!search) return clients
    const q = search.toLowerCase()
    return clients.filter(c => c.name.toLowerCase().includes(q) || c.phone?.includes(q) || c.city?.toLowerCase().includes(q))
  }, [clients, search])

  const clientTotals = useMemo(() => {
    const map: Record<string, number> = {}
    invoices.forEach(inv => {
      if (inv.status === 'paid') {
        map[inv.clientId] = (map[inv.clientId] || 0) + inv.grandTotal
      }
    })
    return map
  }, [invoices])

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', gstin: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' })
    setShowModal(true)
  }

  const openEdit = (client: Client) => {
    setEditing(client)
    setForm({ name: client.name, gstin: client.gstin || '', email: client.email || '', phone: client.phone || '', address: client.address, city: client.city, state: client.state, pincode: client.pincode })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    const client: Client = {
      id: editing?.id || crypto.randomUUID?.() || Math.random().toString(36).substr(2),
      ...form,
      createdAt: editing?.createdAt || new Date().toISOString(),
    }
    saveClient(client)
    refresh()
    setShowModal(false)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteClient(deleteId)
      refresh()
      setDeleteId(null)
    }
  }

  const clientInvoices = (clientId: string) => invoices.filter(inv => inv.clientId === clientId)

  return (
    <div>
      <Header
        title="Clients"
        subtitle={`${clients.length} total clients`}
        action={<Button onClick={openNew}><Plus size={16} /> Add Client</Button>}
      />

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Users size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">No clients found</p>
          <Button variant="primary" size="sm" className="mt-3" onClick={openNew}>
            <Plus size={16} /> Add First Client
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(client => {
            const invs = clientInvoices(client.id)
            const totalBilled = clientTotals[client.id] || 0
            return (
              <div key={client.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    {client.gstin && <p className="text-xs text-gray-500 mt-0.5">GST: {client.gstin}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(client)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => setDeleteId(client.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 mb-3">
                  {client.phone && <p className="flex items-center gap-1.5"><Phone size={12} /> {client.phone}</p>}
                  {client.email && <p className="flex items-center gap-1.5"><Mail size={12} /> {client.email}</p>}
                  <p className="flex items-center gap-1.5"><MapPin size={12} /> {client.city}, {client.state}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <Link href={`/invoices?client=${client.id}`} className="text-xs text-blue-700 font-medium hover:underline inline-flex items-center gap-1">
                    <FileText size={12} /> {invs.length} invoices
                  </Link>
                  <span className="text-xs font-semibold text-gray-900">{formatINR(totalBilled)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Client' : 'Add Client'}>
        <div className="space-y-3">
          <Input label="Client Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="GSTIN" value={form.gstin} onChange={e => setForm(p => ({ ...p, gstin: e.target.value }))} />
            <Input label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <Input label="Address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
            <Select
              label="State"
              value={form.state}
              onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
              options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
              placeholder="Select state"
            />
          </div>
          <Input label="Pincode" value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Add'} Client</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Client">
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this client?</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}


