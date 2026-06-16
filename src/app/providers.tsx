'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BusinessProfile } from '@/types'
import { getBusinessProfile, getInvoices, getClients } from '@/lib/localStorage'
import { Invoice, Client } from '@/types'

interface AppContextType {
  profile: BusinessProfile | null
  invoices: Invoice[]
  clients: Client[]
  refresh: () => void
}

const AppContext = createContext<AppContextType>({
  profile: null,
  invoices: [],
  clients: [],
  refresh: () => {},
})

export const useApp = () => useContext(AppContext)

export default function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [key, setKey] = useState(0)

  const refresh = () => setKey(k => k + 1)

  useEffect(() => {
    setProfile(getBusinessProfile())
    setInvoices(getInvoices())
    setClients(getClients())
  }, [key])

  return (
    <AppContext.Provider value={{ profile, invoices, clients, refresh }}>
      {children}
    </AppContext.Provider>
  )
}
