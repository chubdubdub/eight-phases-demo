"use client"

import { useState } from "react"
import { useLocale } from "next-intl"
import { useRouter, usePathname } from "next/navigation"
import { Globe, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { locales, localeNames, type Locale } from "../i18n/request"

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (newLocale: Locale) => {
    // Remove the current locale from the pathname and add the new one
    const segments = pathname.split('/').filter(Boolean)
    
    // Remove current locale if it exists
    if (locales.includes(segments[0] as Locale)) {
      segments.shift()
    }
    
    // Build new path with new locale
    const newPath = `/${newLocale}${segments.length > 0 ? '/' + segments.join('/') : ''}`
    
    router.push(newPath)
    setIsOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent, newLocale: Locale) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      switchLanguage(newLocale)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800"
        aria-label="Switch language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <span className="sm:hidden">{locale.toUpperCase()}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 z-50 bg-gray-900 border border-gray-700 rounded-md shadow-xl py-1">
            {locales.map((availableLocale) => (
              <button
                key={availableLocale}
                onClick={() => switchLanguage(availableLocale)}
                onKeyDown={(e) => handleKeyDown(e, availableLocale)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  locale === availableLocale
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                role="menuitem"
                aria-current={locale === availableLocale ? 'true' : 'false'}
              >
                <div className="flex items-center justify-between">
                  <span>{localeNames[availableLocale]}</span>
                  <span className="text-xs opacity-75">{availableLocale.toUpperCase()}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}