'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Save, Send, Eye, Edit3 } from 'lucide-react'
import { LineItem, Client, INDIAN_STATES, Invoice } from '@/types'
import { calculateLineItem, calculateInvoiceTotals, formatINR, isInterstateTransaction } from '@/lib/invoiceHelpers'
import { getClients, saveClient, getBusinessProfile, getSettings, getNextInvoiceNumber } from '@/lib/localStorage'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import LineItemRow from '@/components/invoice/LineItemRow'
import InvoicePreview from '@/components/invoice/InvoicePreview'
import Modal from '@/components/ui/Modal'

interface InvoiceFormProps {
  initialInvoice?: Invoice
  onSave: (invoice: Invoice, status: 'draft' | 'sent') => void
}

const emptyLineItem = (): LineItem => ({
  id: '',
  description: '',
  hsnCode: '',
  quantity: 0,
  unit: 'Nos',
  rate: 0,
  gstRate: 18,
  amount: 0,
  cgst: 0,
  sgst: 0,
  igst: 0,
  total: 0,
})

export default function InvoiceForm({ initialInvoice, onSave }: InvoiceFormProps) {
  const settings = getSettings()
  const profile = getBusinessProfile()
  const [clients, setClients] = useState<Client[]>([])
  const [showAddClient, setShowAddClient] = useState(false)
  const [tab, setTab] = useState<'form' | 'preview'>('form')

  const [invoiceNumber, setInvoiceNumber] = useState(initialInvoice?.invoiceNumber || getNextInvoiceNumber())
  const [invoiceDate, setInvoiceDate] = useState(initialInvoice?.invoiceDate || new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(initialInvoice?.dueDate || (() => {
    const d = new Date()
    d.setDate(d.getDate() + settings.defaultDueDays)
    return d.toISOString().split('T')[0]
  })())
  const [clientId, setClientId] = useState(initialInvoice?.clientId || '')
  const [isInterstate, setIsInterstate] = useState(initialInvoice?.isInterstate || false)
  const [notes, setNotes] = useState(initialInvoice?.notes || '')
  const [terms, setTerms] = useState(initialInvoice?.termsAndConditions || settings.defaultTerms)

  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialInvoice?.lineItems || [{ ...emptyLineItem(), id: crypto.randomUUID?.() || Math.random().toString(36).substr(2) }]
  )

  const [newClient, setNewClient] = useState({ name: '', gstin: '', phone: '', email: '', address: '', city: '', state: '', pincode: '' })

  useEffect(() => { setClients(getClients()) }, [])

  const selectedClient = clients.find(c => c.id === clientId)

  useEffect(() => {
    if (profile && selectedClient) {
      setIsInterstate(isInterstateTransaction(profile.state, selectedClient.state))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, profile])

  const handleLineItemChange = (index: number, field: string, value: string | number) => {
    setLineItems(prev => {
      const updated = [...prev]
      const item = { ...updated[index], [field]: value }
      const calculated = calculateLineItem(
        { description: item.description, hsnCode: item.hsnCode, quantity: item.quantity, unit: item.unit, rate: item.rate, gstRate: item.gstRate },
        isInterstate
      )
      if (field !== 'description' && field !== 'hsnCode' && field !== 'unit' && field !== 'gstRate') {
        updated[index] = { ...calculated, [field]: value }
      } else {
        updated[index] = calculated
      }
      return updated
    })
  }

  const addLineItem = () => {
    setLineItems(prev => [...prev, { ...emptyLineItem(), id: crypto.randomUUID?.() || Math.random().toString(36).substr(2) }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) setLineItems(prev => prev.filter((_, i) => i !== index))
  }

  const totals = calculateInvoiceTotals(lineItems, isInterstate)

  const buildInvoice = (status: 'draft' | 'sent'): Invoice => ({
    id: initialInvoice?.id || crypto.randomUUID?.() || Math.random().toString(36).substr(2),
    invoiceNumber,
    invoiceDate,
    dueDate,
    status,
    clientId,
    client: selectedClient!,
    lineItems: lineItems.filter(i => i.description.trim()),
    ...totals,
    isInterstate,
    notes,
    termsAndConditions: terms,
    createdAt: initialInvoice?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const handleSave = (status: 'draft' | 'sent') => {
    if (!selectedClient) return
    onSave(buildInvoice(status), status)
  }

  const handleAddClient = () => {
    if (!newClient.name.trim()) return
    const client: Client = {
      id: crypto.randomUUID?.() || Math.random().toString(36).substr(2),
      ...newClient,
      createdAt: new Date().toISOString(),
    }
    saveClient(client)
    setClients(getClients())
    setClientId(client.id)
    setShowAddClient(false)
    setNewClient({ name: '', gstin: '', phone: '', email: '', address: '', city: '', state: '', pincode: '' })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
        {/* Mobile tabs */}
        <div className="flex border-b border-gray-200 mb-4 lg:hidden">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'form' ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-500'}`}
            onClick={() => setTab('form')}
          >
            <Edit3 size={16} className="inline mr-1" /> Form
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'preview' ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-500'}`}
            onClick={() => setTab('preview')}
          >
            <Eye size={16} className="inline mr-1" /> Preview
          </button>
        </div>

        <div className={tab === 'preview' ? 'hidden lg:block' : ''}>
          {/* Invoice header fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Input
              label="Invoice Number"
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
            />
            <Input
              label="Invoice Date"
              type="date"
              value={invoiceDate}
              onChange={e => setInvoiceDate(e.target.value)}
            />
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          {/* Client selection */}
          <div className="mb-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Select
                  label="Bill To"
                  placeholder="Select a client"
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  options={clients.map(c => ({ value: c.id, label: `${c.name}${c.gstin ? ` (${c.gstin})` : ''} - ${c.city}` }))}
                />
              </div>
              <Button variant="secondary" size="sm" onClick={() => setShowAddClient(true)} className="mb-0.5">
                <Plus size={16} /> New
              </Button>
            </div>
            {selectedClient && (
              <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                {selectedClient.address}, {selectedClient.city}, {selectedClient.state} - {selectedClient.pincode}
                {selectedClient.gstin && <span className="ml-2">GST: {selectedClient.gstin}</span>}
              </div>
            )}
          </div>

          {/* Interstate toggle */}
          <div className="flex items-center gap-2 mb-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isInterstate}
                onChange={e => {
                  setIsInterstate(e.target.checked)
                  setLineItems(prev => prev.map(item => calculateLineItem(
                    { description: item.description, hsnCode: item.hsnCode, quantity: item.quantity, unit: item.unit, rate: item.rate, gstRate: item.gstRate },
                    e.target.checked
                  )))
                }}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-700" />
            </label>
            <span className="text-sm text-gray-700">
              {isInterstate ? 'Interstate (IGST)' : 'Intrastate (CGST + SGST)'}
            </span>
          </div>

          {/* Line items table */}
          <div className="mb-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 w-8">#</th>
                  <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Description</th>
                  <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">HSN</th>
                  <th className="py-2 px-2 text-right text-xs font-medium text-gray-500">Qty</th>
                  <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Unit</th>
                  <th className="py-2 px-2 text-right text-xs font-medium text-gray-500">Rate</th>
                  <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">GST%</th>
                  <th className="py-2 px-2 text-right text-xs font-medium text-gray-500">Amount</th>
                  <th className="py-2 px-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => (
                  <LineItemRow
                    key={idx}
                    item={item}
                    index={idx}
                    onChange={handleLineItemChange}
                    onRemove={removeLineItem}
                  />
                ))}
              </tbody>
            </table>
            <Button variant="ghost" size="sm" onClick={addLineItem} className="mt-2">
              <Plus size={16} /> Add Row
            </Button>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-4">
            <div className="w-full sm:w-72 space-y-1.5 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-mono">{formatINR(totals.subtotal)}</span>
              </div>
              {isInterstate ? (
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">IGST</span>
                  <span className="font-mono">{formatINR(totals.totalIGST)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">CGST</span>
                    <span className="font-mono">{formatINR(totals.totalCGST)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">SGST</span>
                    <span className="font-mono">{formatINR(totals.totalSGST)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-2 border-t-2 border-gray-800 text-base font-bold">
                <span>Grand Total</span>
                <span className="font-mono">{formatINR(totals.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any additional notes..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
                value={terms}
                onChange={e => setTerms(e.target.value)}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button onClick={() => handleSave('draft')}>
              <Save size={16} /> Save as Draft
            </Button>
            <Button variant="secondary" onClick={() => handleSave('sent')} disabled={!selectedClient}>
              <Send size={16} /> Save & Send
            </Button>
          </div>
        </div>

        {/* Mobile preview tab */}
        {tab === 'preview' && (
          <div className="lg:hidden">
            {selectedClient ? (
              <InvoicePreview
                invoice={{
                  id: '',
                  invoiceNumber,
                  invoiceDate,
                  dueDate,
                  status: 'draft',
                  clientId,
                  client: selectedClient,
                  lineItems: lineItems.filter(i => i.description.trim()),
                  ...totals,
                  isInterstate,
                  notes,
                  termsAndConditions: terms,
                  createdAt: '',
                  updatedAt: '',
                }}
                profile={profile}
              />
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">Select a client to see preview</p>
            )}
          </div>
        )}
      </div>

      {/* Desktop preview panel */}
      <div className="hidden lg:block w-[500px] xl:w-[580px] flex-shrink-0">
        <div className="sticky top-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Live Preview</h3>
          {selectedClient ? (
            <InvoicePreview
              invoice={{
                id: '',
                invoiceNumber,
                invoiceDate,
                dueDate,
                status: 'draft',
                clientId,
                client: selectedClient,
                lineItems: lineItems.filter(i => i.description.trim()),
                ...totals,
                isInterstate,
                notes,
                termsAndConditions: terms,
                createdAt: '',
                updatedAt: '',
              }}
              profile={profile}
            />
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
              <p className="text-sm text-gray-400">Select a client to see live preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      <Modal open={showAddClient} onClose={() => setShowAddClient(false)} title="Add New Client">
        <div className="space-y-3">
          <Input label="Client Name" value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="GSTIN" value={newClient.gstin} onChange={e => setNewClient(p => ({ ...p, gstin: e.target.value }))} />
            <Input label="Phone" value={newClient.phone} onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <Input label="Email" type="email" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} />
          <Input label="Address" value={newClient.address} onChange={e => setNewClient(p => ({ ...p, address: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={newClient.city} onChange={e => setNewClient(p => ({ ...p, city: e.target.value }))} />
            <Select
              label="State"
              value={newClient.state}
              onChange={e => setNewClient(p => ({ ...p, state: e.target.value }))}
              options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
              placeholder="Select state"
            />
          </div>
          <Input label="Pincode" value={newClient.pincode} onChange={e => setNewClient(p => ({ ...p, pincode: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAddClient(false)}>Cancel</Button>
            <Button onClick={handleAddClient}>Add Client</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
