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
      expect.any(AbortSignal),
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

it('reopens valid cached matches after a later incomplete batch and collapse', async () => {
  const pairs: [number, number][] = Array.from(
    { length: 24 },
    (_unused, line) => [line, 0],
  )
  textService.findChapterDisplay
    .mockResolvedValueOnce(chapterWithPairs(pairs.slice(3, 13)))
    .mockResolvedValueOnce(chapterWithPairs(pairs.slice(13, 22)))
  render(
    <MemoryRouter>
      <CorpusChapterMatches
        initialChapter={chapterWithPairs(pairs.slice(0, 3))}
        chapterId={baseChapterDisplay.id}
        pairs={pairs.map(([line, variant]) => ({ line, variant }))}
        initiallyVisible={3}
        textService={textService}
      />
    </MemoryRouter>,
  )
  const region = screen.getByTestId('chapter-matches')
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 10 more matches' }),
  )
  await screen.findByRole('button', { name: 'Collapse chapter matches' })
  expect(within(region).getAllByRole('link')).toHaveLength(13)
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 10 more matches' }),
  )
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Additional chapter matches are unavailable.',
  )
  expect(within(region).getAllByRole('link')).toHaveLength(13)
  await userEvent.click(
    screen.getByRole('button', { name: 'Collapse chapter matches' }),
  )
  expect(within(region).getAllByRole('link')).toHaveLength(3)
  await userEvent.click(
    screen.getByRole('button', { name: 'Show loaded chapter matches' }),
  )
  expect(within(region).getAllByRole('link')).toHaveLength(13)
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Additional chapter matches are unavailable.',
  )
  expect(
    screen.getByRole('button', { name: 'Collapse chapter matches' }),
  ).toHaveFocus()
  expect(textService.findChapterDisplay).toHaveBeenCalledTimes(2)
  expect(textService.findChapterDisplay).toHaveBeenLastCalledWith(
    baseChapterDisplay.id,
    pairs.slice(13, 23).map(([line]) => line),
    Array(10).fill(0),
    expect.any(AbortSignal),
  )
})
