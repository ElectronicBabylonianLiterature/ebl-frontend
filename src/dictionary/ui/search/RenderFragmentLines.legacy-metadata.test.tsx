import React from 'react'
import { screen, within } from '@testing-library/react'
import WordService from 'dictionary/application/WordService'
import RenderFragmentLines from 'dictionary/ui/search/RenderFragmentLines'
import {
  previewSubsetFragment,
  previewSubsetText,
  renderWithDictionary,
} from 'dictionary/ui/search/FragmentLemmaLines.testSupport'

jest.mock('dictionary/application/WordService')

const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

test('renders every hydrated legacy matching line without inventing a remainder when metadata is absent', () => {
  renderWithDictionary(
    <RenderFragmentLines
      fragment={previewSubsetFragment}
      linesToShow={previewSubsetText.lines.length}
    />,
    wordService,
  )

  const table = screen.getByRole('table')
  expect(within(table).getAllByRole('row')).toHaveLength(2)
  expect(within(table).getByText('10')).toBeVisible()
  expect(within(table).getByText('2')).toBeVisible()
  expect(within(table).getByRole('button', { name: 'kur' })).toBeVisible()
  expect(screen.queryByText(/^(More|And)\b/)).not.toBeInTheDocument()
})
