import type { Metadata } from 'next'
import { Lexend } from 'next/font/google'
import { headers } from 'next/headers'

import './globals.css'
import { Providers } from '@/lib/providers'
import DefaultLayout from '@/components/DefaultLayout'

const appFont = Lexend({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Visionary',
  description: 'Assist creating feature ideas for the future of your product',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = headers()

  return (
    <html lang="en">
      <body
        style={{ backgroundColor: '#FFF' }}
        className={appFont.className}
      >
        <Providers cookies={headersList.get('cookie')}>
          <DefaultLayout>{children}</DefaultLayout>
        </Providers>
      </body>
    </html>
  )
}
