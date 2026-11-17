import React from 'react'
import { screen, within } from '@testing-library/react'
import WordService from 'dictionary/application/WordService'
import RenderFragmentLines from 'dictionary/ui/search/RenderFragmentLines'
import {
  previewSubsetFragment,
  previewSubsetText,
  renderWithDictionary,
} from 'dictionary/ui/search/FragmentLemmaLines.testSupport'
import { Fragment } from 'fragmentarium/domain/fragment'
import { previewLine, valueToken } from 'test-support/fragment-query-preview'
import { TextLine } from 'transliteration/domain/text-line'
import { NoteLine } from 'transliteration/domain/note-line'
import { Text } from 'transliteration/domain/text'

jest.mock('dictionary/application/WordService')

const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

test('skips a selected raw NoteLine while preserving text row identities and source order', () => {
  const note = new NoteLine({
    content: [valueToken('selected-note')],
    parts: [],
  })
  const fragment = Fragment.create({
    ...previewSubsetFragment,
    text: new Text({
      lines: [
        previewSubsetText.allLines[0],
        note,
        new TextLine(previewLine(99, [])),
        previewSubsetText.allLines[1],
      ],
    }),
  })
  expect(fragment.text.allLines[1]).toBe(note)
  expect(fragment.text.allLines[1].type).toBe('NoteLine')

  renderWithDictionary(
    <RenderFragmentLines
      fragment={fragment}
      linesToShow={3}
      selectedLineIndexes={[0, 1, 3]}
      hideRemainingMessage={true}
    />,
    wordService,
  )

  const rows = within(screen.getByRole('table')).getAllByRole('row')
  expect(rows).toHaveLength(2)
  expect(
    rows.map((row) => within(row).getAllByRole('cell')[0].textContent),
  ).toEqual(['10', '2'])
  expect(screen.queryByText('selected-note')).not.toBeInTheDocument()
  expect(screen.queryByText('99')).not.toBeInTheDocument()
  expect(screen.queryByText(/^(More|And)\b/)).not.toBeInTheDocument()
})
