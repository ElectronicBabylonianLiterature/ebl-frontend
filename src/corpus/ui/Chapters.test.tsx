import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Chapters from './Chapters'
import { text as corpusText } from 'test-support/test-corpus-text'
import TextService from 'corpus/application/TextService'
import FragmentService from 'fragmentarium/application/FragmentService'
import { manuscriptFactory } from 'test-support/manuscript-fixtures'
import { produce } from 'immer'

jest.mock('corpus/application/TextService')
jest.mock('fragmentarium/application/FragmentService')

const MockTextService = TextService as jest.Mock<jest.Mocked<TextService>>
const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>

const text = produce(corpusText, (draft) => {
  draft.chapters.forEach((chapter) => {
    chapter.uncertainFragments = []
  })
})
let textService: jest.Mocked<TextService>
let fragmentService: jest.Mocked<FragmentService>

async function renderAndExpandFirstChapter(): Promise<void> {
  render(
    <MemoryRouter>
      <Chapters
        text={text}
        textService={textService}
        fragmentService={fragmentService}
      />
    </MemoryRouter>,
  )
  await userEvent.click(screen.getAllByText(/List of Manuscripts/)[0])
}

beforeEach(() => {
  textService = new MockTextService()
  fragmentService = new MockFragmentService()
  fragmentService.isInFragmentarium.mockReturnValue(false)
  textService.findManuscripts.mockReturnValue(
    Promise.resolve(manuscriptFactory.buildList(1)),
  )
})

it('Passes an abort signal to the extant lines request', async () => {
  textService.findExtantLines.mockReturnValue(Promise.resolve({}))
  await renderAndExpandFirstChapter()

  await waitFor(() => expect(textService.findExtantLines).toHaveBeenCalled())
  expect(textService.findExtantLines).toHaveBeenCalledWith(
    expect.anything(),
    expect.any(AbortSignal),
  )
})

it('Shows an error when the extant lines cannot be loaded', async () => {
  textService.findExtantLines.mockImplementation(() =>
    Promise.reject(new Error('Extant lines failed')),
  )
  await renderAndExpandFirstChapter()

  expect(await screen.findByText('Extant lines failed')).toBeInTheDocument()
})

it('Ignores an extant lines failure after unmount', async () => {
  let rejectExtantLines: (error: Error) => void = () => undefined
  const pending = new Promise<never>((_resolve, reject) => {
    rejectExtantLines = reject
  })
  textService.findExtantLines.mockReturnValue(pending)
  const { unmount } = render(
    <MemoryRouter>
      <Chapters
        text={text}
        textService={textService}
        fragmentService={fragmentService}
      />
    </MemoryRouter>,
  )
  await userEvent.click(screen.getAllByText(/List of Manuscripts/)[0])
  await waitFor(() => expect(textService.findExtantLines).toHaveBeenCalled())
  unmount()
  rejectExtantLines(new Error('Extant lines failed'))

  await expect(pending).rejects.toThrow('Extant lines failed')
  expect(screen.queryByText('Extant lines failed')).not.toBeInTheDocument()
})

it('Ignores extant lines that arrive after unmount', async () => {
  let resolveExtantLines: (lines: Record<string, never>) => void = () =>
    undefined
  textService.findExtantLines.mockReturnValue(
    new Promise((resolve) => {
      resolveExtantLines = resolve
    }),
  )
  const { unmount } = render(
    <MemoryRouter>
      <Chapters
        text={text}
        textService={textService}
        fragmentService={fragmentService}
      />
    </MemoryRouter>,
  )
  await userEvent.click(screen.getAllByText(/List of Manuscripts/)[0])
  await waitFor(() => expect(textService.findExtantLines).toHaveBeenCalled())
  unmount()

  expect(() => resolveExtantLines({})).not.toThrow()
})
