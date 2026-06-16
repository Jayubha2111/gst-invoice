'use client'
import React, { useMemo } from 'react'
import Link from 'next/link'
import { IndianRupee, Users, AlertTriangle, Clock, Plus, TrendingUp } from 'lucide-react'
import { useApp } from './providers'
import { formatINR, formatDate } from '@/lib/invoiceHelpers'
import Header from '@/components/layout/Header'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

export default function Dashboard() {
  const { profile, invoices, clients } = useApp()

  const stats = useMemo(() => {
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.grandTotal, 0)
    const totalGST = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalGST, 0)
    const unpaid = invoices.filter(i => i.status === 'sent' || i.status === 'overdue')
    const overdue = invoices.filter(i => i.status === 'overdue')
    const unpaidTotal = unpaid.reduce((s, i) => s + i.grandTotal, 0)
    return { totalRevenue, totalGST, unpaid, overdue, unpaidTotal }
  }, [invoices])

  const recentInvoices = useMemo(() =>
    [...invoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  , [invoices])

  // Monthly revenue for last 6 months (simple CSS bars)
  const monthlyData = useMemo(() => {
    const months: { label: string; revenue: number; max: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
      const revenue = invoices
        .filter(inv => inv.status === 'paid' && new Date(inv.createdAt).getMonth() === d.getMonth() && new Date(inv.createdAt).getFullYear() === d.getFullYear())
        .reduce((s, inv) => s + inv.grandTotal, 0)
      months.push({ label, revenue, max: 0 })
    }
    const maxRevenue = Math.max(...months.map(m => m.revenue), 1)
    months.forEach(m => { m.max = maxRevenue })
    return months
  }, [invoices])

  if (!profile) {
    return (
      <div className="text-center py-20">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 max-w-lg mx-auto">
          <AlertTriangle size={40} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Business Profile</h2>
          <p className="text-sm text-gray-600 mb-4">Set up your business details to start creating GST-compliant invoices.</p>
          <Link href="/settings">
            <Button><Plus size={16} /> Set Up Profile</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header
        title={`Welcome back, ${profile.name}`}
        subtitle={`${invoices.length} invoices · ${clients.length} clients`}
        action={
          <div className="flex gap-2">
            <Link href="/invoices/new"><Button><Plus size={16} /> Create Invoice</Button></Link>
            <Link href="/clients"><Button variant="secondary"><Users size={16} /> Add Client</Button></Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={formatINR(stats.totalRevenue)}
          icon={<IndianRupee size={20} />}
          color="green"
        />
        <StatCard
          title="GST Collected"
          value={formatINR(stats.totalGST)}
          icon={<TrendingUp size={20} />}
          color="blue"
        />
        <StatCard
          title="Unpaid Invoices"
          value={stats.unpaid.length.toString()}
          icon={<Clock size={20} />}
          color="amber"
          subtext={`₹${stats.unpaidTotal.toLocaleString('en-IN')} pending`}
        />
        <StatCard
          title="Overdue"
          value={stats.overdue.length.toString()}
          icon={<AlertTriangle size={20} />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recent Invoices</h3>
            <Link href="/invoices" className="text-sm text-blue-700 font-medium hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">Invoice</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">Client</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500">Amount</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">No invoices yet</td>
                  </tr>
                ) : (
                  recentInvoices.map(inv => (
                    <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 px-4">
                        <Link href={`/invoices/${inv.id}`} className="font-medium text-blue-700 hover:underline">{inv.invoiceNumber}</Link>
                      </td>
                      <td className="py-2.5 px-4 text-gray-700">{inv.client.name}</td>
                      <td className="py-2.5 px-4 text-gray-500">{formatDate(inv.invoiceDate)}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-medium">{formatINR(inv.grandTotal)}</td>
                      <td className="py-2.5 px-4 text-center"><Badge variant={inv.status}>{inv.status}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {monthlyData.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-600 rounded-t-md transition-all hover:bg-blue-700"
                  style={{ height: `${(m.revenue / m.max) * 100}%`, minHeight: m.revenue > 0 ? '4px' : '0px' }}
                />
                <span className="text-[10px] text-gray-500 font-medium">{m.label}</span>
                <span className="text-[10px] font-mono text-gray-600">
                  {m.revenue > 0 ? '₹' + m.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
