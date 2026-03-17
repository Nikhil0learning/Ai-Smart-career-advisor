import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'AI Smart Career Advisor - Get Personalized Career Guidance',
  description: 'Your personal AI-powered career advisor powered by Groq. Get personalized career recommendations, skill progression tracking, and actionable advice to achieve your professional goals.',
  generator: 'v0.app',
  keywords: 'career advisor, AI career guidance, career planning, skill development, career growth',
  openGraph: {
    title: 'AI Smart Career Advisor',
    description: 'Your personal AI-powered career advisor to guide your professional growth',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
