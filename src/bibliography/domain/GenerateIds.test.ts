import { generateIds } from './GenerateIds'
import { CslData } from 'bibliography/domain/BibliographyEntry'

const testEntry: CslData = {
  author: [{ family: 'Doe', given: 'John' }],
  title: 'The Quick Brown Fox Jumps Over the Lazy Dog',
  issued: { 'date-parts': [[2023]] },
  language: 'en',
}

describe('generateIds', () => {
  const testIdGeneration = (
    name: string,
    modifiedEntry: Partial<CslData>,
    expectedId: string
  ) => {
    test(name, () => {
      const result = generateIds({ ...testEntry, ...modifiedEntry })
      expect(result).toBe(expectedId)
    })
  }

  test('basic ID generation', () => {
    const result = generateIds(testEntry)
    expect(result).toBe('doe2023quick')
  })

  testIdGeneration(
    'ID generation with missing author',
    { author: undefined },
    'unknownauthor2023quick'
  )
  testIdGeneration(
    'ID generation with missing year',
    { issued: undefined },
    'doe9999quick'
  )
  testIdGeneration(
    'ID generation with missing title',
    { title: undefined },
    'doe2023unknowntitle'
  )
  testIdGeneration(
    'ID generation with all significant words as stop words',
    { title: 'The Of And But Or Nor For' },
    'doe2023unknowntitle'
  )

  testIdGeneration(
    'ID generation with different language (German)',
    {
      language: 'de',
      title: 'Der Schnelle Braune Fuchs Springt Über den Faulen Hund',
    },
    'doe2023schnelle'
  )

  testIdGeneration(
    'ID generation with language not supported',
    {
      language: 'ru',
      title: 'Экс-граф? Плюш изъят. Бьём чуждый цен хвощ!',
    },
    'doe2023экс-граф?'
  )

  testIdGeneration(
    'ID generation removes punctuation from significant word',
    { title: 'The "Quick" Brown Fox' },
    'doe2023quick'
  )

  testIdGeneration(
    'ID generation handles punctuation-heavy title',
    { title: 'The (Great!) [Study]: A Review?' },
    'doe2023great'
  )
})
