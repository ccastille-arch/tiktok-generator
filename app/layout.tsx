import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Brayden's Archery — TikTok Generator",
  description: 'TikTok content generator for @braydens.archery',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: '#080d08' }}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#162216',
              color: '#f0faf0',
              border: '1px solid #1e3a1e',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#080d08' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#080d08' },
            },
          }}
        />
      </body>
    </html>
  )
}
