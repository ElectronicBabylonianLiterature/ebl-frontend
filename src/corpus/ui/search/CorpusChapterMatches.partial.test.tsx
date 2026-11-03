import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TextService from 'corpus/application/TextService'
import { LineDetails } from 'corpus/domain/line-details'
import CorpusChapterMatches from 'corpus/ui/search/CorpusChapterMatches'
import {
  baseChapterDisplay,
  chapterWithPairs,
} from 'corpus/ui/search/CorpusChapterMatches.testSupport'

jest.mock('corpus/application/TextService')

const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()

beforeEach(() => {
  textService.findChapterDisplay.mockReset()
  textService.findChapterLine.mockResolvedValue(new LineDetails([], 0))
})

it.each([false, true])(
  'accepts an additional selected chapter response only when every requested pair is present: complete=%s',
  async (complete) => {
    textService.findChapterDisplay.mockResolvedValueOnce(
      chapterWithPairs(
        complete
          ? [
              [0, 2],
              [0, 3],
              [1, 0],
            ]
          : [
              [0, 3],
              [1, 0],
            ],
      ),
    )
    const initialChapter = chapterWithPairs([[0, 0]])
    render(
      <MemoryRouter>
        <CorpusChapterMatches
          initialChapter={initialChapter}
          chapterId={baseChapterDisplay.id}
          pairs={[
            { line: 0, variant: 0 },
            { line: 0, variant: 2 },
            { line: 0, variant: 3 },
            { line: 1, variant: 0 },
          ]}
          initiallyVisible={1}
          textService={textService}
        />
      </MemoryRouter>,
    )
    const region = screen.getByTestId('chapter-matches')
    const initialLinks = within(region).getAllByRole('link')
    expect(initialLinks).toHaveLength(1)
    const more = screen.getByRole('button', { name: 'Show 3 more matches' })
    expect(more).toHaveAttribute('aria-controls', region.getAttribute('id'))
    await userEvent.click(more)

    expect(textService.findChapterDisplay).toHaveBeenCalledWith(
      baseChapterDisplay.id,
      [0, 0, 1],
      [2, 3, 0],
    )
    if (complete) {
      expect(
        await screen.findByRole('button', { name: 'Collapse chapter matches' }),
      ).toBeVisible()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(within(region).getAllByRole('link')).toHaveLength(2)
      expect(within(region).getByText('variant₂:')).toBeVisible()
      expect(within(region).getByText('variant₃:')).toBeVisible()
    } else {
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Additional chapter matches are unavailable.',
      )
      expect(within(region).getAllByRole('link')).toEqual(initialLinks)
      expect(initialLinks[0]).toBeVisible()
      expect(within(region).queryByText('variant₂:')).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Collapse chapter matches' }),
      ).not.toBeInTheDocument()
    }
    expect(
      screen.queryByRole('button', { name: 'Show 3 more matches' }),
    ).not.toBeInTheDocument()
    expect(textService.findChapterDisplay).toHaveBeenCalledTimes(1)
  },
)
