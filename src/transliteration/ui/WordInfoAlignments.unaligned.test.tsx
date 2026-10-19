import React from 'react'
import { render } from '@testing-library/react'
import WordService from 'dictionary/application/WordService'
import { Alignments } from 'transliteration/ui/WordInfoAlignments'
import { lineGroup, textServiceMock } from 'test-support/line-group-fixtures'

jest.mock('dictionary/application/WordService')

const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>

test('shows no alignments for a token without an index', () => {
  const { container } = render(
    <Alignments
      lemma={['ušurtu I']}
      lineGroup={lineGroup}
      dictionary={new MockWordService()}
    />,
  )

  expect(container).toBeEmptyDOMElement()
  expect(textServiceMock.findChapterLine).not.toHaveBeenCalled()
})
