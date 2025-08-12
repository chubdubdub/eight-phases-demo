import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
 
export default getRequestConfig(async () => {
  // Get locale from cookie or use default
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('locale');
  let locale = localeCookie?.value as Locale | undefined;
  
  // Validate locale
  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }
 
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});