import { generateIds } from './GenerateIds'
import { CslData } from 'bibliography/domain/BibliographyEntry'

const testEntry: CslData = {
  author: [{ family: 'Doe', given: 'John' }],
  title: 'The Quick Brown Fox Jumps Over the Lazy Dog',
  issued: { 'date-parts': [[2023]] },
  language: 'en',
}

describe('generateIds', () => {
  test('basic ID generation', () => {
    const result = generateIds(testEntry)
    expect(result).toBe('doe2023quick')
  })

  test('ID generation with missing author', () => {
    const entryWithNoAuthor = { ...testEntry, author: undefined }
    const result = generateIds(entryWithNoAuthor)
    expect(result).toBe('unknownauthor2023quick')
  })

  test('ID generation with missing year', () => {
    const entryWithNoYear = { ...testEntry, issued: undefined }
    const result = generateIds(entryWithNoYear)
    expect(result).toBe('doe9999quick')
  })

  test('ID generation with missing title', () => {
    const entryWithNoTitle = { ...testEntry, title: undefined }
    const result = generateIds(entryWithNoTitle)
    expect(result).toBe('doe2023unknowntitle')
  })

  test('ID generation with all significant words as stop words', () => {
    const entryWithOnlyStopWords = {
      ...testEntry,
      title: 'The Of And But Or Nor For',
    }
    const result = generateIds(entryWithOnlyStopWords)
    expect(result).toBe('doe2023unknowntitle')
  })

  test('ID generation with different language (German)', () => {
    const germanEntry = {
      ...testEntry,
      language: 'de',
      title: 'Der Schnelle Braune Fuchs Springt Über den Faulen Hund',
    }
    const result = generateIds(germanEntry)
    expect(result).toBe('doe2023schnelle')
  })

  test('ID generation with language not supported', () => {
    const unsupportedLangEntry = {
      ...testEntry,
      language: 'ru',
      title: 'Быстрый Коричневый Лис Перепрыгивает Через Ленивую Собаку',
    }
    const result = generateIds(unsupportedLangEntry)
    expect(result).toBe('doe2023быстрый')
  })
})
