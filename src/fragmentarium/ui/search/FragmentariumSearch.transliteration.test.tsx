import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { CorpusQueryResult, QueryResult } from 'query/QueryResult'
import {
  corpusQueryItemFactory,
  queryItemFactory,
} from 'test-support/query-item-factory'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import { LineDetails } from 'corpus/domain/line-details'
import { lineVariantDisplayFactory } from 'test-support/dictionary-line-fixtures'
import {
  chance,
  createFragmentariumSearchTestContext,
  FragmentariumSearchTestContext,
} from 'fragmentarium/ui/search/FragmentariumSearch.testSupport'

jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('corpus/application/TextService')
jest.mock('bibliography/application/BibliographyService')
jest.mock('dossiers/application/DossiersService')

let context: FragmentariumSearchTestContext

beforeEach(() => {
  context = createFragmentariumSearchTestContext()
})

describe('Searching fragments by transliteration', () => {
  let result: QueryResult
  let corpusResult: CorpusQueryResult
  let fragments: Fragment[]
  let chapters: ChapterDisplay[]
  const transliteration = 'LI₂₃ ši₂-ṣa-pel₃-ṭa₃'

  async function setupTransliterationSearch(): Promise<void> {
    const { fragmentService, wordService, textService } = context
    fragments = fragmentFactory.buildList(2, {}, { transient: { chance } })
    chapters = chapterDisplayFactory.buildList(2, {}, { transient: { chance } })
    result = {
      items: fragments.map((fragment) =>
        queryItemFactory.build({
          museumNumber: fragment.number,
        }),
      ),
      matchCountTotal: 2,
    }
    corpusResult = {
      items: chapters.map((chapter) =>
        corpusQueryItemFactory.build({
          textId: chapter.id.textId,
          stage: chapter.id.stage,
          name: chapter.id.name,
        }),
      ),
      matchCountTotal: 0,
    }
    fragmentService.query.mockReturnValueOnce(Promise.resolve(result))
    textService.query.mockReturnValueOnce(Promise.resolve(corpusResult))
    fragmentService.find
      .mockReturnValueOnce(Promise.resolve(fragments[0]))
      .mockReturnValueOnce(Promise.resolve(fragments[1]))
    fragmentService.findThumbnail
      .mockReturnValueOnce(
        Promise.resolve({
          blob: new Blob(['imagedata'], { type: 'image/jpeg' }),
        }),
      )
      .mockReturnValueOnce(Promise.resolve({ blob: null }))
    wordService.findAll.mockReturnValue(Promise.resolve([]))
    textService.findChapterDisplay
      .mockReturnValueOnce(Promise.resolve(chapters[0]))
      .mockReturnValueOnce(Promise.resolve(chapters[1]))
    textService.findChapterLine.mockReturnValue(
      Promise.resolve(
        new LineDetails(
          [
            lineVariantDisplayFactory.build({
              reconstruction: [],
              manuscripts: [],
            }),
          ],
          0,
        ),
      ),
    )

    await context.renderSearch(result.items[0].museumNumber, {
      transliteration,
    })
  }

  it('Fills in search form query', async () => {
    await setupTransliterationSearch()
    expect(screen.getByLabelText('Transliteration')).toHaveValue(
      transliteration,
    )
  })

  it('Displays Library result on successful query', async () => {
    await setupTransliterationSearch()
    expect(context.container).toHaveTextContent(result.items[1].museumNumber)
  })

  it('Displays corpus results when clicking corpus tab', async () => {
    await setupTransliterationSearch()
    await userEvent.click(screen.getByRole('tab', { name: 'Corpus' }))
    expect(context.container).toHaveTextContent(chapters[0].id.name)
  })

  it('Updates URL anchor when clicking tab', async () => {
    await setupTransliterationSearch()
    await userEvent.click(screen.getByRole('tab', { name: 'Corpus' }))
    expect(global.window.location.hash).toEqual('#corpus')

    await userEvent.click(screen.getByRole('tab', { name: 'Library' }))
    expect(global.window.location.hash).toEqual('#library')
  })
})
