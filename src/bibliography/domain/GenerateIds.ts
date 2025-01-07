import { CslData } from 'bibliography/domain/BibliographyEntry'
import stopwords from 'stopwords'

const STOPWORDS = {
  en: new Set(stopwords.english),
  de: new Set(stopwords.german),
  it: new Set(stopwords.italian),
  es: new Set(stopwords.spanish),
  fr: new Set(stopwords.french),
}

export function generateIds(entry: CslData): string {
  const language = entry.language || 'en'
  const stopwordSet = STOPWORDS[language] || STOPWORDS.en

  const author = entry.author?.[0]?.family || 'unknownauthor'
  const year = entry.issued?.['date-parts']?.[0]?.[0] || '9999'

  const titleWords = entry.title?.split(' ') || []
  const firstSignificantWord =
    titleWords.find((word) => !stopwordSet.has(word.toLowerCase())) ||
    'unknowntitle'

  return `${author}${year}${firstSignificantWord}`
    .replace(/\s+/g, '')
    .toLowerCase()
}
