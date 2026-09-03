import 'server-only'

import { cookies, headers } from 'next/headers'
import Negotiator from 'negotiator'
import { match } from '@formatjs/intl-localematcher'
import type { Locale } from '.'
import { i18n } from '.'

export const getLocaleOnServer = (): Locale => {
  const locales: string[] = [...i18n.locales]

  const localeCookie = cookies().get('locale')?.value
  let languages: string[] = localeCookie ? [localeCookie] : []

  if (!languages.length) {
    const negotiatorHeaders: Record<string, string> = {}
    headers().forEach((value, key) => {
      negotiatorHeaders[key] = value
    })

    languages = new Negotiator({
      headers: negotiatorHeaders,
    }).languages()
  }

  // 过滤 "*"、空值和非法 locale，防止 Intl 报错
  const validLanguages = languages.filter((language) => {
    if (!language || language === '*')
      return false

    try {
      Intl.getCanonicalLocales(language)
      return true
    }
    catch {
      return false
    }
  })

  if (!validLanguages.length)
    return i18n.defaultLocale

  try {
    return match(
      validLanguages,
      locales,
      i18n.defaultLocale,
    ) as Locale
  }
  catch {
    return i18n.defaultLocale
  }
}
