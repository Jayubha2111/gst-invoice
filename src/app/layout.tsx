import type { Metadata } from "next"
import "./globals.css"
import AppProvider from "./providers"
import Sidebar from "@/components/layout/Sidebar"
import SeedData from "@/components/SeedData"

export const metadata: Metadata = {
  title: "GST Invoice Generator",
  description: "Professional GST-compliant invoice generator for Indian businesses",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>
          <SeedData />
          <Sidebar />
          <main className="lg:ml-60 min-h-screen p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </AppProvider>
      </body>
    </html>
  )
}
