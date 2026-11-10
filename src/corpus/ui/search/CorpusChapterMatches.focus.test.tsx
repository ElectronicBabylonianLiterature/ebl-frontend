import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TextService from 'corpus/application/TextService'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { LineDetails } from 'corpus/domain/line-details'
import CorpusChapterMatches from 'corpus/ui/search/CorpusChapterMatches'
import {
  baseChapterDisplay,
  chapterWithPairs,
} from 'corpus/ui/search/CorpusChapterMatches.testSupport'
import { deferred } from 'test-support/concurrencyLimiterHelpers'

jest.mock('corpus/application/TextService')

const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()

beforeEach(() => {
  textService.findChapterDisplay.mockReset()
  textService.findChapterLine.mockResolvedValue(new LineDetails([], 0))
})

function renderMatches(additionalPairs: number): void {
  render(
    <MemoryRouter>
      <CorpusChapterMatches
        initialChapter={chapterWithPairs([[0, 0]])}
        chapterId={baseChapterDisplay.id}
        pairs={Array.from({ length: additionalPairs + 1 }, (_unused, line) => ({
          line,
          variant: 0,
        }))}
        initiallyVisible={1}
        textService={textService}
      />
      <button type="button">After chapter</button>
    </MemoryRouter>,
  )
}

it('announces loading and the visible match count', async () => {
  const pending = deferred<ChapterDisplay>()
  textService.findChapterDisplay.mockReturnValue(pending.promise)
  renderMatches(1)
  expect(screen.getByRole('status')).toBeEmptyDOMElement()

  await userEvent.click(
    screen.getByRole('button', { name: 'Show 1 more match' }),
  )
  expect(screen.getByRole('status')).toHaveTextContent('Loading more matches')

  await act(async () => pending.resolve(chapterWithPairs([[1, 0]])))
  expect(screen.getByRole('status')).toHaveTextContent('Showing 2 of 2 matches')
})

it('keeps keyboard focus on collapse after the final batch and on show after collapse', async () => {
  textService.findChapterDisplay.mockResolvedValue(chapterWithPairs([[1, 0]]))
  renderMatches(1)
  screen.getByRole('button', { name: 'Show 1 more match' }).focus()
  await userEvent.keyboard('{Enter}')
  const collapse = await screen.findByRole('button', {
    name: 'Collapse chapter matches',
  })
  expect(collapse).toHaveFocus()
  await userEvent.keyboard(' ')
  expect(
    screen.getByRole('button', { name: 'Show loaded chapter matches' }),
  ).toHaveFocus()
})

it('retains a focusable loading action while preventing repeated pointer and keyboard requests', async () => {
  const pending = deferred<ChapterDisplay>()
  textService.findChapterDisplay.mockReturnValue(pending.promise)
  renderMatches(1)
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 1 more match' }),
  )
  const loading = screen.getByRole('button', {
    name: 'Loading chapter matches…',
  })
  expect(loading).toHaveAttribute('aria-disabled', 'true')
  expect(loading).toBeEnabled()
  expect(loading).toHaveFocus()
  await userEvent.click(loading)
  await userEvent.keyboard('{Enter} ')
  expect(textService.findChapterDisplay).toHaveBeenCalledTimes(1)
  await act(async () => pending.resolve(chapterWithPairs([[1, 0]])))
  expect(
    screen.getByRole('button', { name: 'Collapse chapter matches' }),
  ).toHaveFocus()
})

it('moves focus from a disappearing Cancel action to Collapse when the final batch completes', async () => {
  const pending = deferred<ChapterDisplay>()
  textService.findChapterDisplay.mockReturnValue(pending.promise)
  renderMatches(1)
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 1 more match' }),
  )
  await userEvent.tab()
  expect(screen.getByRole('button', { name: 'Cancel loading' })).toHaveFocus()
  await act(async () => pending.resolve(chapterWithPairs([[1, 0]])))
  expect(
    screen.getByRole('button', { name: 'Collapse chapter matches' }),
  ).toHaveFocus()
})

it('returns focus to the surviving expansion control when collapsing a partial expansion', async () => {
  textService.findChapterDisplay.mockResolvedValue(
    chapterWithPairs(
      Array.from({ length: 10 }, (_unused, index) => [index + 1, 0]),
    ),
  )
  renderMatches(11)
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 10 more matches' }),
  )
  await userEvent.click(
    await screen.findByRole('button', { name: 'Collapse chapter matches' }),
  )
  expect(
    screen.getByRole('button', { name: 'Show loaded chapter matches' }),
  ).toHaveFocus()
})

it('restores focus on cancel and ignores the obsolete response', async () => {
  const pending = deferred<ChapterDisplay>()
  textService.findChapterDisplay.mockReturnValue(pending.promise)
  renderMatches(1)
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 1 more match' }),
  )
  await userEvent.click(screen.getByRole('button', { name: 'Cancel loading' }))
  expect(
    screen.getByRole('button', { name: 'Show 1 more match' }),
  ).toHaveFocus()
  await act(async () => pending.resolve(chapterWithPairs([[1, 0]])))
  expect(
    screen.getByRole('button', { name: 'Show 1 more match' }),
  ).toHaveFocus()
})

it.each([false, true])(
  'handles unavailable responses without losing or stealing focus (moved=%s)',
  async (moved) => {
    const pending = deferred<ChapterDisplay>()
    textService.findChapterDisplay.mockReturnValue(pending.promise)
    renderMatches(1)
    await userEvent.click(
      screen.getByRole('button', { name: 'Show 1 more match' }),
    )
    if (moved) {
      await userEvent.click(
        screen.getByRole('button', { name: 'After chapter' }),
      )
    }
    await act(async () => pending.resolve(chapterWithPairs([])))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Additional chapter matches are unavailable.',
    )
    expect(
      moved
        ? screen.getByRole('button', { name: 'After chapter' })
        : screen.getByRole('group', { name: 'Chapter match controls' }),
    ).toHaveFocus()
  },
)

function ChangingMatches(): JSX.Element {
  const [pairs, setPairs] = React.useState([
    { line: 0, variant: 0 },
    { line: 1, variant: 0 },
  ])
  const nextControl = React.useRef<HTMLButtonElement>(null)
  return (
    <div
      onClickCapture={(event) => {
        if (
          event.target instanceof HTMLElement &&
          event.target.textContent === 'Collapse chapter matches'
        ) {
          setPairs([])
          nextControl.current?.focus()
        }
      }}
    >
      <CorpusChapterMatches
        initialChapter={chapterWithPairs([[0, 0]])}
        chapterId={baseChapterDisplay.id}
        pairs={pairs}
        initiallyVisible={1}
        textService={textService}
      />
      <button ref={nextControl} type="button">
        Next result
      </button>
    </div>
  )
}

it('preserves external focus if refreshed result props remove every match control during collapse', async () => {
  textService.findChapterDisplay.mockResolvedValue(chapterWithPairs([[1, 0]]))
  render(
    <MemoryRouter>
      <ChangingMatches />
    </MemoryRouter>,
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 1 more match' }),
  )
  await userEvent.click(
    await screen.findByRole('button', { name: 'Collapse chapter matches' }),
  )
  expect(screen.queryByRole('group')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Next result' })).toHaveFocus()
})
