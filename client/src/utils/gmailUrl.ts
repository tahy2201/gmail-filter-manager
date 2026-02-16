import type { FilterCriteria } from '../types'

const URL_PARAM_MAP: Record<keyof FilterCriteria, string> = {
  from: 'from',
  to: 'to',
  subject: 'subject',
  hasTheWord: 'has',
  doesNotHaveTheWord: 'hasnot',
}

export function buildGmailSearchUrl(criteria: FilterCriteria): string {
  const params = Object.entries(URL_PARAM_MAP)
    .filter(([key]) => criteria[key as keyof FilterCriteria])
    .map(([key, param]) => `${param}=${encodeURIComponent(criteria[key as keyof FilterCriteria]!)}`)
    .join('&')

  return `https://mail.google.com/mail/u/0/#advanced-search/${params}`
}

export function buildSearchQuery(criteria: FilterCriteria): string {
  const parts: string[] = []
  if (criteria.from) parts.push(`from:(${criteria.from})`)
  if (criteria.to) parts.push(`to:(${criteria.to})`)
  if (criteria.subject) parts.push(`subject:(${criteria.subject})`)
  if (criteria.hasTheWord) parts.push(`(${criteria.hasTheWord})`)
  if (criteria.doesNotHaveTheWord) parts.push(`-(${criteria.doesNotHaveTheWord})`)
  return parts.join(' ')
}
