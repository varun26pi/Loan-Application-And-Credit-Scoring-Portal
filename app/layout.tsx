import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { AuthProvider } from '@/context/AuthContext'
import { AmplifyConfig } from '@/components/amplify-config'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'FinServe - Smart Loan Solutions',
  description: 'Get approved for loans in minutes. Personal, Home, Auto, and Education loans with competitive rates.',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        {/*
          AmplifyConfig: configures aws-amplify with Cognito User Pool and Client ID
          from env vars. Must render before AuthProvider to avoid race conditions.
          Placed here (server component renders first) then AuthProvider wraps the tree.
        */}
        <AmplifyConfig />
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-120px)]">
            {children}
          </main>
          <Footer />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
