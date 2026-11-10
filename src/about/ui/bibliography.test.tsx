import { render, screen, waitFor } from '@testing-library/react'
import AboutBibliography from 'about/ui/bibliography'
import { indexedPublications } from 'about/ui/indexedPublications'
import { indexedPublicationsMarkup } from 'about/ui/indexedPublications/IndexedPublicationsSection'
import MarkupService from 'markup/application/MarkupService'
import { markupDtoSerialized } from 'test-support/markup-fixtures'

jest.mock('markup/application/MarkupService')

const markupServiceMock = new (MarkupService as jest.Mock<
  jest.Mocked<MarkupService>
>)()

test('renders a heading and references for every indexed letter', async () => {
  markupServiceMock.fromString.mockReturnValue(
    Promise.resolve(markupDtoSerialized),
  )

  render(AboutBibliography(markupServiceMock))
  await waitFor(() => {
    expect(screen.queryAllByLabelText('Spinner')).toHaveLength(0)
  })

  expect(
    screen
      .getAllByRole('heading', { level: 4 })
      .map(({ textContent }) => textContent),
  ).toEqual(indexedPublications.map(({ letter }) => letter))
  expect(markupServiceMock.fromString.mock.calls.map(([text]) => text)).toEqual(
    indexedPublications.map(indexedPublicationsMarkup),
  )
})

it('separates indexed publication references with a space', () => {
  expect(
    indexedPublicationsMarkup({
      letter: 'A',
      references: ['@bib{RN2544};', '@bib{RN108};'],
    }),
  ).toBe('@bib{RN2544}; @bib{RN108};')
})

describe('indexed publications data', () => {
  const bibliographyKeyPattern = /^@bib\{([^{}]+)\}/

  function bibliographyKey(reference: string): string {
    return reference.match(bibliographyKeyPattern)?.[1] ?? reference
  }

  test.each(indexedPublications.map((section) => [section.letter, section]))(
    'separates the references of %s with semicolons and ends without one',
    (_letter, { references }) => {
      expect(references.length).toBeGreaterThan(0)
      references.slice(0, -1).forEach((reference) => {
        expect(reference).toMatch(/^@bib\{[^{}]+\};$/)
      })
      expect(references[references.length - 1]).toMatch(/^@bib\{[^{}]+\}$/)
    },
  )

  it('lists every bibliography key only once', () => {
    const keys = indexedPublications.flatMap(({ references }) =>
      references.map(bibliographyKey),
    )
    const duplicateKeys = keys.filter(
      (key, index) => keys.indexOf(key) !== index,
    )

    expect(duplicateKeys).toEqual([])
  })

  it('lists unique letters in ascending order', () => {
    const letters = indexedPublications.map(({ letter }) => letter)

    expect(letters).toEqual([...new Set(letters)].sort())
  })
})
