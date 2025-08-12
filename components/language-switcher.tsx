"use client"

import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const locales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
] as const

export function LanguageSwitcher() {
  const t = useTranslations('language')
  const currentLocale = useLocale()
  const [isPending, startTransition] = useTransition()

  const handleLocaleChange = (locale: string) => {
    startTransition(() => {
      // Set cookie and reload page to apply new locale
      document.cookie = `locale=${locale};path=/;max-age=31536000`
      window.location.reload()
    })
  }

  const currentLocaleName = locales.find(l => l.code === currentLocale)?.name || 'English'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          disabled={isPending}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLocaleName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => handleLocaleChange(locale.code)}
            className={`flex items-center gap-2 ${
              currentLocale === locale.code ? 'bg-gray-800' : ''
            }`}
          >
            <span>{locale.flag}</span>
            <span>{locale.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}