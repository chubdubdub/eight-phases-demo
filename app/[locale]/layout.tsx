import type React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { Moon } from "lucide-react"
import { Inter } from "next/font/google"
import { locales } from "../../i18n/request"
import { LanguageSwitcher } from "../../components/language-switcher"
import "../globals.css"

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

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export function generateStaticParams() {
  return locales.map((locale) => ({locale}))
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: LocaleLayoutProps) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }

  const t = await getTranslations()

  return (
    <html lang={locale} className="dark">
      <body className={`${inter.variable} font-sans bg-gray-950 text-gray-100`}>
        <div className="flex flex-col min-h-screen">
          <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-800 sticky top-0 bg-gray-950/80 backdrop-blur-sm z-10">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <Link href={`/${locale}`} className="flex items-center gap-3 group">
                <Moon className="w-7 h-7 text-white group-hover:text-primary transition-colors" />
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  Eight Phases <span className="font-light text-gray-400">Press Room</span>
                </h1>
              </Link>
              
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
              </div>
            </div>
          </header>
          <main className="flex-grow">{children}</main>
          <footer className="py-8 px-4 md:px-8 border-t border-gray-800">
            <div className="max-w-5xl mx-auto text-center text-gray-500">
              <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}