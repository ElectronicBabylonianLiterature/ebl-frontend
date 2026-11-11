import React from 'react'
import { render, screen } from '@testing-library/react'
import { DisplayBibliographyPart } from 'transliteration/ui/markup'
import { referenceFactory } from 'test-support/bibliography-fixtures'

test('resolved references without pages remain formatted citations', () => {
  const reference = referenceFactory.build().setPages('')
  const { container } = render(
    <DisplayBibliographyPart part={{ type: 'BibliographyPart', reference }} />,
  )
  expect(container).toHaveTextContent(reference.document.primaryAuthor)
  expect(container).not.toHaveTextContent('@bib{')
})

test('resolved references with pages retain their page numbers', () => {
  const reference = referenceFactory.build().setPages('12–14')
  const { container } = render(
    <DisplayBibliographyPart part={{ type: 'BibliographyPart', reference }} />,
  )
  expect(container).toHaveTextContent('12–14')
  expect(container).not.toHaveTextContent('@bib{')
})

test('missing citations without pages omit the dangling page separator', () => {
  render(
    <DisplayBibliographyPart
      part={{
        type: 'BibliographyPart',
        reference: {
          id: 'missing-legacy-key',
          type: 'DISCUSSION',
          pages: '',
          notes: '',
          linesCited: [],
        },
      }}
    />,
  )
  expect(screen.getByText('@bib{missing-legacy-key}')).toBeVisible()
})
