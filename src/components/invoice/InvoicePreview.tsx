'use client'
import React from 'react'
import { Invoice, BusinessProfile } from '@/types'
import { formatINR, formatDate, numberToWords } from '@/lib/invoiceHelpers'

interface InvoicePreviewProps {
  invoice: Invoice
  profile: BusinessProfile | null
}

export default function InvoicePreview({ invoice, profile }: InvoicePreviewProps) {
  const { client, lineItems, isInterstate } = invoice

  return (
    <div id="invoice-preview" className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm text-sm leading-relaxed">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-start gap-4">
          {profile?.logoBase64 && (
            <img
              src={profile.logoBase64}
              alt="Logo"
              className="w-16 h-16 object-contain rounded-lg"
            />
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.name || 'Business Name'}</h2>
            {profile?.gstin && <p className="text-xs text-gray-500 mt-0.5">GSTIN: {profile.gstin}</p>}
            <p className="text-xs text-gray-500 mt-1">
              {profile?.address}, {profile?.city}, {profile?.state} - {profile?.pincode}
            </p>
            {profile?.phone && <p className="text-xs text-gray-500">Phone: {profile.phone}</p>}
            {profile?.email && <p className="text-xs text-gray-500">Email: {profile.email}</p>}
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-blue-700 mb-1">TAX INVOICE</h1>
          <p className="text-sm text-gray-900 font-medium">#{invoice.invoiceNumber}</p>
          <p className="text-xs text-gray-500 mt-1">Date: {formatDate(invoice.invoiceDate)}</p>
          <p className="text-xs text-gray-500">Due Date: {formatDate(invoice.dueDate)}</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
        <p className="font-semibold text-gray-900">{client?.name}</p>
        {client?.gstin && <p className="text-xs text-gray-500">GSTIN: {client.gstin}</p>}
        <p className="text-xs text-gray-600 mt-0.5">
          {client?.address}, {client?.city}, {client?.state} - {client?.pincode}
        </p>
        {client?.phone && <p className="text-xs text-gray-500">Phone: {client.phone}</p>}
        {client?.email && <p className="text-xs text-gray-500">Email: {client.email}</p>}
        <p className="text-xs text-gray-500 mt-1">
          Supply: {isInterstate ? 'Interstate' : 'Intrastate'}
        </p>
      </div>

      {/* Line Items Table */}
      <table className="w-full text-xs mb-6">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="py-2 text-left font-semibold text-gray-700 w-8">#</th>
            <th className="py-2 text-left font-semibold text-gray-700">Description</th>
            <th className="py-2 text-center font-semibold text-gray-700">HSN</th>
            <th className="py-2 text-right font-semibold text-gray-700">Qty</th>
            <th className="py-2 text-right font-semibold text-gray-700">Rate</th>
            <th className="py-2 text-right font-semibold text-gray-700">GST%</th>
            <th className="py-2 text-right font-semibold text-gray-700">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-1.5 text-gray-500">{idx + 1}</td>
              <td className="py-1.5 text-gray-900">{item.description}</td>
              <td className="py-1.5 text-center text-gray-600">{item.hsnCode}</td>
              <td className="py-1.5 text-right text-gray-900">{item.quantity} {item.unit}</td>
              <td className="py-1.5 text-right font-mono">{formatINR(item.rate)}</td>
              <td className="py-1.5 text-right text-gray-700">{item.gstRate}%</td>
              <td className="py-1.5 text-right font-mono">{formatINR(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-1 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-mono">{formatINR(invoice.subtotal)}</span>
          </div>
          {isInterstate ? (
            <div className="flex justify-between py-1">
              <span className="text-gray-500">IGST</span>
              <span className="font-mono">{formatINR(invoice.totalIGST)}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">CGST</span>
                <span className="font-mono">{formatINR(invoice.totalCGST)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">SGST</span>
                <span className="font-mono">{formatINR(invoice.totalSGST)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between py-2 border-t-2 border-gray-800 text-base font-bold">
            <span>Grand Total</span>
            <span className="font-mono text-blue-700">{formatINR(invoice.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <span className="text-xs font-medium text-gray-500">Amount in Words: </span>
        <span className="text-sm font-semibold text-gray-900">{numberToWords(invoice.grandTotal)}</span>
      </div>

      {/* Notes & Terms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
        {invoice.notes && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</h4>
            <p className="text-xs text-gray-600">{invoice.notes}</p>
          </div>
        )}
        {invoice.termsAndConditions && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Terms & Conditions</h4>
            <p className="text-xs text-gray-600">{invoice.termsAndConditions}</p>
          </div>
        )}
      </div>

      {/* Bank Details & Signature */}
      <div className="flex flex-col sm:flex-row justify-between gap-6">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Bank Details</h4>
          {profile?.bankName && <p className="text-xs text-gray-700">Bank: {profile.bankName}</p>}
          {profile?.accountNumber && <p className="text-xs text-gray-700">A/C: {profile.accountNumber}</p>}
          {profile?.ifscCode && <p className="text-xs text-gray-700">IFSC: {profile.ifscCode}</p>}
          {profile?.upiId && <p className="text-xs text-gray-700">UPI: {profile.upiId}</p>}
        </div>
        <div className="text-right">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Authorized Signature</h4>
          {profile?.signatureBase64 ? (
            <img src={profile.signatureBase64} alt="Signature" className="h-12 ml-auto object-contain" />
          ) : (
            <div className="h-12 flex items-end justify-end">
              <div className="w-32 border-b border-gray-400 mb-1" />
            </div>
          )}
          <p className="text-xs text-gray-700 mt-1">{profile?.name || 'Authorized Signatory'}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 text-center border-t border-gray-200">
        <p className="text-xs text-gray-400">This is a computer-generated invoice</p>
      </div>
    </div>
  )
}
