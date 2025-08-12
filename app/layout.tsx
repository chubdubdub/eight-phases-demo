import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import "./globals.css"
import Link from "next/link"
import { Moon } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Eight Phases Press Room",
  description: "Latest news and press releases from Eight Phases Hotels.",
  generator: 'v0.dev',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  const t = await getTranslations('layout')

  return (
    <html lang={locale} className="dark">
      <body className={`${inter.variable} font-sans bg-gray-950 text-gray-100`}>
        <NextIntlClientProvider messages={messages}>
          <div className="flex flex-col min-h-screen">
            <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-800 sticky top-0 bg-gray-950/80 backdrop-blur-sm z-10">
              <div className="max-w-5xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                  <Moon className="w-7 h-7 text-white group-hover:text-primary transition-colors" />
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                    {t('header.brand')} <span className="font-light text-gray-400">{t('header.tagline')}</span>
                  </h1>
                </Link>
                <LanguageSwitcher />
              </div>
            </header>
            <main className="flex-grow">{children}</main>
            <footer className="py-8 px-4 md:px-8 border-t border-gray-800">
              <div className="max-w-5xl mx-auto text-center text-gray-500">
                <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
              </div>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
