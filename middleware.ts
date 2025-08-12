import createMiddleware from "next-intl/middleware"
import { locales, defaultLocale } from "./i18n/request"

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always redirect to a locale-prefixed path, even for the default locale
  localePrefix: "always"
})

export const config = {
  matcher: ['/', '/(de|en|fr)/:path*', '/((?!_next|_vercel|.*\\..*).*)'
  ]
}