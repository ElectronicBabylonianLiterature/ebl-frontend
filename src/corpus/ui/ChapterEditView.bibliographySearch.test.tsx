import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import ChapterEditView from 'corpus/ui/ChapterEditView'
import TextService from 'corpus/application/TextService'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { chapter, text } from 'test-support/test-corpus-text'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'

const query = 'Borger'
let searchBibliography: (query: string) => Promise<readonly BibliographyEntry[]>

jest.mock('corpus/ui/ChapterEditor', () => ({
  __esModule: true,
  default: (props: {
    searchBibliography: (query: string) => Promise<readonly BibliographyEntry[]>
  }): JSX.Element => {
    searchBibliography = props.searchBibliography
    return <div data-testid="chapter-editor" />
  },
}))

const entries = bibliographyEntryFactory.buildList(2)
const chapterId: ChapterId = {
  textId: text.id,
  stage: chapter.stage,
  name: chapter.name,
}

const textService = {
  find: jest.fn(),
  findChapter: jest.fn(),
} as unknown as TextService
const bibliographyService = { search: jest.fn() }
const fragmentService = {} as FragmentService
const wordService = {} as WordService

beforeEach(() => {
  jest.clearAllMocks()
  bibliographyService.search.mockReturnValue(Promise.resolve(entries))
  textService.find = jest.fn().mockReturnValue(Promise.resolve(text))
  textService.findChapter = jest.fn().mockReturnValue(Promise.resolve(chapter))
})

async function renderEditView(): Promise<void> {
  render(
    <MemoryRouter>
      <ChapterEditView
        id={chapterId}
        textService={textService}
        bibliographyService={bibliographyService}
        fragmentService={fragmentService}
        wordService={wordService}
      />
    </MemoryRouter>,
  )
  await screen.findByTestId('chapter-editor')
}

it('delegates the bibliography search to the bibliography service', async () => {
  await renderEditView()

  await expect(searchBibliography(query)).resolves.toEqual(entries)

  expect(bibliographyService.search).toHaveBeenCalledWith(query)
})
