'use client'
import React, { useState, useRef } from 'react'
import { Save, Upload } from 'lucide-react'
import { BusinessProfile } from '@/types'
import { getBusinessProfile, saveBusinessProfile, getSettings, saveSettings } from '@/lib/localStorage'
import { useApp } from '@/app/providers'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { INDIAN_STATES } from '@/types'

export default function SettingsPage() {
  const { refresh } = useApp()
  const profile = getBusinessProfile()
  const settings = getSettings()

  const [form, setForm] = useState<BusinessProfile>(
    profile || {
      name: '', gstin: '', address: '', city: '', state: '', pincode: '',
      phone: '', email: '', bankName: '', accountNumber: '', ifscCode: '',
      logoBase64: '', upiId: '', signatureBase64: '',
    }
  )
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix)
  const [defaultDueDays, setDefaultDueDays] = useState(settings.defaultDueDays)
  const [defaultTerms, setDefaultTerms] = useState(settings.defaultTerms)
  const [saved, setSaved] = useState(false)

  const logoRef = useRef<HTMLInputElement>(null)
  const sigRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (field: 'logoBase64' | 'signatureBase64') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm(p => ({ ...p, [field]: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    saveBusinessProfile(form)
    saveSettings({ invoicePrefix, defaultDueDays, defaultTerms })
    refresh()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <Header
        title="Settings"
        subtitle="Manage your business profile and preferences"
        action={
          <Button onClick={handleSave}>
            {saved ? 'Saved!' : <><Save size={16} /> Save Settings</>}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Profile */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Business Profile</h3>
          <div className="space-y-4">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
              <div className="flex items-center gap-4">
                {form.logoBase64 ? (
                  <img src={form.logoBase64} alt="Logo" className="w-16 h-16 object-contain rounded-lg border border-gray-200" />
                ) : (
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                    <Upload size={20} />
                  </div>
                )}
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload('logoBase64')} />
                <div>
                  <Button variant="secondary" size="sm" onClick={() => logoRef.current?.click()}>Upload Logo</Button>
                  {form.logoBase64 && (
                    <Button variant="ghost" size="sm" onClick={() => setForm(p => ({ ...p, logoBase64: '' }))}>Remove</Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Business Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              <Input label="GSTIN" value={form.gstin} onChange={e => setForm(p => ({ ...p, gstin: e.target.value }))} />
            </div>
            <Input label="Address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            <div className="grid grid-cols-3 gap-4">
              <Input label="City" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
              <Select
                label="State"
                value={form.state}
                onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
                placeholder="Select state"
              />
              <Input label="Pincode" value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Bank Details & Preferences */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Bank Details</h3>
            <div className="space-y-4">
              <Input label="Bank Name" value={form.bankName} onChange={e => setForm(p => ({ ...p, bankName: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Account Number" value={form.accountNumber} onChange={e => setForm(p => ({ ...p, accountNumber: e.target.value }))} />
                <Input label="IFSC Code" value={form.ifscCode} onChange={e => setForm(p => ({ ...p, ifscCode: e.target.value }))} />
              </div>
              <Input label="UPI ID (optional)" value={form.upiId || ''} onChange={e => setForm(p => ({ ...p, upiId: e.target.value }))} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Signature</h3>
            <div className="flex items-center gap-4">
              {form.signatureBase64 ? (
                <img src={form.signatureBase64} alt="Signature" className="h-14 object-contain rounded-lg border border-gray-200" />
              ) : (
                <div className="w-24 h-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                  Signature
                </div>
              )}
              <input ref={sigRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload('signatureBase64')} />
              <div>
                <Button variant="secondary" size="sm" onClick={() => sigRef.current?.click()}>Upload</Button>
                {form.signatureBase64 && (
                  <Button variant="ghost" size="sm" onClick={() => setForm(p => ({ ...p, signatureBase64: '' }))}>Remove</Button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Invoice Preferences</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Invoice Prefix"
                  value={invoicePrefix}
                  onChange={e => setInvoicePrefix(e.target.value)}
                  placeholder="INV"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Due Date</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={defaultDueDays}
                    onChange={e => setDefaultDueDays(parseInt(e.target.value))}
                  >
                    <option value={7}>7 Days</option>
                    <option value={15}>15 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={45}>45 Days</option>
                    <option value={60}>60 Days</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Terms & Conditions</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  value={defaultTerms}
                  onChange={e => setDefaultTerms(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
