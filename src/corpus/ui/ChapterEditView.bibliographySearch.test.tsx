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

jest.mock('corpus/application/TextService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('dictionary/application/WordService')

const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
const bibliographyService = { search: jest.fn() }
const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

beforeEach(() => {
  jest.clearAllMocks()
  bibliographyService.search.mockReturnValue(Promise.resolve(entries))
  textService.find.mockResolvedValue(text)
  textService.findChapter.mockResolvedValue(chapter)
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
