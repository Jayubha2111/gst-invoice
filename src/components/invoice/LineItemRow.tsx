'use client'
import React from 'react'
import { Trash2 } from 'lucide-react'
import { GST_RATES, UNITS, LineItem } from '@/types'
import { formatINR } from '@/lib/invoiceHelpers'

interface LineItemRowProps {
  item: LineItem
  index: number
  onChange: (index: number, field: string, value: string | number) => void
  onRemove: (index: number) => void
}

export default function LineItemRow({ item, index, onChange, onRemove }: LineItemRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-2 px-2 text-center text-sm text-gray-400">{index + 1}</td>
      <td className="py-2 px-2">
        <input
          className="w-full bg-transparent border-0 text-sm text-gray-900 focus:outline-none focus:ring-0 p-1"
          placeholder="Description"
          value={item.description}
          onChange={e => onChange(index, 'description', e.target.value)}
        />
      </td>
      <td className="py-2 px-2">
        <input
          className="w-20 bg-transparent border-0 text-sm text-gray-900 focus:outline-none focus:ring-0 p-1"
          placeholder="HSN"
          value={item.hsnCode}
          onChange={e => onChange(index, 'hsnCode', e.target.value)}
        />
      </td>
      <td className="py-2 px-2">
        <input
          type="number"
          min="0"
          step="1"
          className="w-16 bg-transparent border-0 text-sm text-gray-900 focus:outline-none focus:ring-0 p-1"
          value={item.quantity || ''}
          onChange={e => onChange(index, 'quantity', parseFloat(e.target.value) || 0)}
        />
      </td>
      <td className="py-2 px-2">
        <select
          className="w-16 bg-transparent border-0 text-sm text-gray-900 focus:outline-none focus:ring-0 p-1"
          value={item.unit}
          onChange={e => onChange(index, 'unit', e.target.value)}
        >
          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </td>
      <td className="py-2 px-2">
        <input
          type="number"
          min="0"
          step="0.01"
          className="w-24 bg-transparent border-0 text-sm text-gray-900 focus:outline-none focus:ring-0 p-1"
          value={item.rate || ''}
          onChange={e => onChange(index, 'rate', parseFloat(e.target.value) || 0)}
        />
      </td>
      <td className="py-2 px-2">
        <select
          className="w-16 bg-transparent border-0 text-sm text-gray-900 focus:outline-none focus:ring-0 p-1"
          value={item.gstRate}
          onChange={e => onChange(index, 'gstRate', parseInt(e.target.value))}
        >
          {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
        </select>
      </td>
      <td className="py-2 px-2 text-sm text-gray-900 text-right font-mono">
        {formatINR(item.amount)}
      </td>
      <td className="py-2 px-2 text-center">
        <button
          onClick={() => onRemove(index)}
          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  )
}
