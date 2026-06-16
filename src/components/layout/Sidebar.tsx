'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, Settings, Menu, X, Receipt, ChevronRight } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-gray-200 shadow-sm lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} className="text-gray-700" />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 z-40 h-full w-60 bg-white border-r border-gray-200 transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Receipt className="text-blue-700" size={24} />
            <span className="font-semibold text-gray-900 text-lg">GST Invoice</span>
          </Link>
          <button className="lg:hidden p-1 rounded-lg hover:bg-gray-100" onClick={() => setOpen(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {active && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white">
            <p className="text-xs font-medium opacity-80">GST Invoice Pro</p>
            <p className="text-sm font-semibold mt-1">Upgrade to unlock</p>
            <p className="text-xs mt-1 opacity-80">Cloud backup & multi-user</p>
            <button className="mt-3 w-full py-1.5 text-xs font-medium bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
