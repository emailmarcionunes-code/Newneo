export const locales = ['en', 'pt-BR', 'es', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Português',
  es: 'Español',
  fr: 'Français',
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
