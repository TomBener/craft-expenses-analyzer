import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Craft Expenses Analyzer',
  description: 'Analyze and visualize your expenses from Craft',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
