import type { Metadata } from 'next'
import '../styles/docs-interface.css'

export const metadata: Metadata = {
  title: 'Documentation Interface',
  description: 'View, edit, and manage your project documentation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

