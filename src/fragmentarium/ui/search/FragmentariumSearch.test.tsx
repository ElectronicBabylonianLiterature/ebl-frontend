import React from 'react'
import Chance from 'chance'
import { produce, castDraft } from 'immer'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Promise from 'bluebird'
import FragmentariumSearch from './FragmentariumSearch'
import Citation from 'bibliography/domain/Citation'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'
import SessionContext from 'auth/SessionContext'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession, { Session } from 'auth/Session'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragment, lines } from 'test-support/test-fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import FragmentService from 'fragmentarium/application/FragmentService'
import BibliographyService from 'bibliography/application/BibliographyService'
import { FragmentQuery } from 'query/FragmentQuery'
import { CorpusQueryResult, QueryResult } from 'query/QueryResult'
import {
  corpusQueryItemFactory,
  queryItemFactory,
} from 'test-support/query-item-factory'
import TextService from 'corpus/application/TextService'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import userEvent from '@testing-library/user-event'
import { LineDetails } from 'corpus/domain/line-details'
import { lineVariantDisplayFactory } from 'test-support/dictionary-line-fixtures'
import { queryItemOf } from 'test-support/utils'
import DossiersService from 'dossiers/application/DossiersService'
import DossierRecord from 'dossiers/domain/DossierRecord'
import { Genre, Genres } from 'fragmentarium/domain/Genres'
import { MesopotamianDate } from 'chronology/domain/Date'
import { PeriodModifiers, Periods } from 'common/utils/period'
import { ResearchProjects } from 'research-projects/researchProject'
import { Text } from 'transliteration/domain/text'
import { TextLine } from 'transliteration/domain/text-line'
import { lineNumberFactory } from 'test-support/linenumber-factory'

const chance = new Chance('fragmentarium-search-test')

jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('corpus/application/TextService')
jest.mock('bibliography/application/BibliographyService')
jest.mock('dossiers/application/DossiersService')

let wordService: jest.Mocked<WordService>
let textService: jest.Mocked<TextService>
let bibliographyService: jest.Mocked<BibliographyService>
let dossiersService: jest.Mocked<DossiersService>
const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
let fragmentSearchService: jest.Mocked<FragmentSearchService>
let session: Session
let container: HTMLElement

const renderFragmentariumSearch = async (
  waitFor: string,
  query: Partial<FragmentQuery> = {},
  activeTab = 'library',
): Promise<void> => {
  container = render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <SessionContext.Provider value={session}>
          <FragmentariumSearch
            fragmentSearchService={fragmentSearchService}
            fragmentService={fragmentService}
            bibliographyService={bibliographyService}
            dossiersService={dossiersService}
            fragmentQuery={query}
            wordService={wordService}
            textService={textService}
            activeTab={activeTab}
          />
        </SessionContext.Provider>
      </DictionaryContext.Provider>
    </MemoryRouter>,
  ).container
  await screen.findByText(waitFor)
}

beforeEach(async () => {
  jest.clearAllMocks()
  fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
  bibliographyService = new (BibliographyService as jest.Mock<
    jest.Mocked<BibliographyService>
  >)()
  dossiersService = new (DossiersService as jest.Mock<
    jest.Mocked<DossiersService>
  >)()
  session = new MemorySession(['read:fragments'])
  fragmentService.fetchPeriods.mockReturnValueOnce(Promise.resolve([]))
  fragmentService.fetchGenres.mockReturnValueOnce(Promise.resolve([]))
  fragmentService.fetchProvenances.mockReturnValueOnce(Promise.resolve([]))
  fragmentService.findThumbnail.mockResolvedValue({ blob: null })
  dossiersService.fetchFilteredDossiers.mockReturnValue(Promise.resolve([]))
})

function buildSummaryBackedFragment(): Fragment {
  const reference = new Reference(
    'DISCUSSION',
    '12-13',
    '',
    [],
    new BibliographyEntry({
      id: 'RN-SUMMARY-1',
      title: 'Summary-backed source',
      type: 'article-journal',
      issued: {
        'date-parts': [[2024]],
      },
      author: [
        {
          given: 'T.',
          family: 'Tester',
        },
        {
          given: 'A.',
          family: 'Assistant',
        },
      ],
    }),
  )

  const previewLine = produce(lines[0], (draft) => {
    draft.content[1].uniqueLemma = ['test-lemma']
  })
  const secondPreviewLine = produce(lines[1], (draft) => {
    draft.lineNumber = lineNumberFactory.build({ number: 11 })
    draft.prefix = '11.'
  })

  return produce(fragment, (draft) => {
    draft.number = 'X.42'
    draft.accession = 'A.7'
    draft.script = {
      period: Periods['Neo-Assyrian'],
      periodModifier: PeriodModifiers.None,
      uncertain: false,
    }
    draft.genres = castDraft(
      new Genres([
        new Genre(['ARCHIVE', 'Administrative'], false),
        new Genre(['CANONICAL', 'Divination'], true),
      ]),
    )
    draft.projects = [ResearchProjects.CAIC, ResearchProjects.RECC]
    draft.references = castDraft([reference])
    draft.dossiers = [{ dossierId: 'D001', isUncertain: false }]
    draft.date = MesopotamianDate.fromJson({
      year: { value: '10' },
      month: { value: '5' },
      day: { value: '12' },
      isSeleucidEra: true,
    })
    draft.archaeology = {
      excavationNumber: 'BM.123',
      site: {
        name: 'Babylon',
        abbreviation: 'Bab',
        parent: null,
      },
      isRegularExcavation: true,
      isFindspotUncertain: false,
    }
    draft.text = castDraft(
      new Text({
        lines: [new TextLine(previewLine), new TextLine(secondPreviewLine)],
      }),
    )
    draft.hasPhoto = false
  })
}

describe('Search', () => {
  let fragments: Fragment[]

  describe('Searching fragments by number', () => {
    const museumNumber = 'K.2'

    async function setupSearchByNumber(): Promise<void> {
      fragments = fragmentFactory.buildList(2, {}, { transient: { chance } })
      fragmentService.query.mockReturnValueOnce(
        Promise.resolve({
          items: fragments.map(queryItemOf),
          matchCountTotal: 0,
        }),
      )
      fragmentService.find
        .mockReturnValueOnce(Promise.resolve(fragments[0]))
        .mockReturnValueOnce(Promise.resolve(fragments[1]))
      wordService.findAll.mockReturnValue(Promise.resolve([]))
      textService.query.mockReturnValueOnce(
        Promise.resolve({ items: [], matchCountTotal: 0 }),
      )
      await renderFragmentariumSearch(fragments[0].number, {
        number: museumNumber,
      })
    }

    it('Displays result on successful query', async () => {
      await setupSearchByNumber()
      expect(container).toHaveTextContent(fragments[1].number)
    })

    it('Fills in search form query', async () => {
      await setupSearchByNumber()
      expect(screen.getByLabelText('Number')).toHaveValue(museumNumber)
    })
  })

  it('Shows suggestion when entering wrong number format', async () => {
    fragmentService.query.mockReturnValueOnce(
      Promise.resolve({
        items: [],
        matchCountTotal: 0,
      }),
    )
    wordService.findAll.mockReturnValue(Promise.resolve([]))
    textService.query.mockReturnValueOnce(
      Promise.resolve({ items: [], matchCountTotal: 0 }),
    )
    await renderFragmentariumSearch('K.2', {
      number: 'K 2',
    })

    expect(container).toMatchSnapshot()
    expect(container).toHaveTextContent('Did you mean K.2?')
  })
})

describe('Searching fragments by transliteration', () => {
  let result: QueryResult
  let corpusResult: CorpusQueryResult
  let fragments: Fragment[]
  let chapters: ChapterDisplay[]
  const transliteration = 'LI₂₃ ši₂-ṣa-pel₃-ṭa₃'

  async function setupTransliterationSearch(): Promise<void> {
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

    await renderFragmentariumSearch(result.items[0].museumNumber, {
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
    expect(container).toHaveTextContent(result.items[1].museumNumber)
  })

  it('Displays corpus results when clicking corpus tab', async () => {
    await setupTransliterationSearch()
    await userEvent.click(screen.getByRole('tab', { name: 'Corpus' }))
    expect(container).toHaveTextContent(chapters[0].id.name)
  })

  it('Updates URL anchor when clicking tab', async () => {
    await setupTransliterationSearch()
    await userEvent.click(screen.getByRole('tab', { name: 'Corpus' }))
    expect(global.window.location.hash).toEqual('#corpus')

    await userEvent.click(screen.getByRole('tab', { name: 'Library' }))
    expect(global.window.location.hash).toEqual('#library')
  })
})

describe('Searching fragments from summary-backed results', () => {
  it('renders the prefetched summary row without hydrating the fragment', async () => {
    const summaryFragment = buildSummaryBackedFragment()
    const citation = Citation.for(summaryFragment.references[0]).getMarkdown()

    fragmentService.query.mockReturnValueOnce(
      Promise.resolve({
        items: [
          {
            museumNumber: summaryFragment.number,
            matchingLines: [1, 2, 3, 4, 5, 6, 7],
            matchCount: 7,
            fragment: summaryFragment,
          },
        ],
        matchCountTotal: 7,
      }),
    )
    wordService.findAll.mockReturnValue(Promise.resolve([]))
    textService.query.mockReturnValueOnce(
      Promise.resolve({ items: [], matchCountTotal: 0 }),
    )
    dossiersService.queryByIds.mockResolvedValue([
      new DossierRecord({
        _id: 'D001',
        description: 'Summary dossier',
      }),
    ])

    await renderFragmentariumSearch(summaryFragment.number, {
      lemmas: 'test-lemma',
    })

    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(screen.getByText('Found 7 lines in 1 document')).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: `${summaryFragment.number} (${summaryFragment.script.period.abbreviation})`,
      }),
    ).toBeVisible()
    expect(
      screen.getByText(`Accession no.: ${summaryFragment.accession}`),
    ).toBeVisible()
    expect(
      screen.getByText(
        `Excavation no.: ${summaryFragment.archaeology?.excavationNumber}`,
      ),
    ).toBeVisible()
    expect(
      screen.getByText(
        `Provenance: ${summaryFragment.archaeology?.site?.name}`,
      ),
    ).toBeVisible()
    expect(screen.getByText('ARCHIVE ➝ Administrative')).toBeVisible()
    expect(screen.getByText('CANONICAL ➝ Divination (?)')).toBeVisible()
    expect(screen.getByRole('time')).toHaveTextContent(
      summaryFragment.date!.toString().split(' (')[0],
    )
    expect(screen.getByRole('time')).toHaveTextContent('30 August 302 BCE PJC')
    expect(screen.getByText(citation)).toBeVisible()
    expect(screen.getByAltText(ResearchProjects.CAIC.name)).toBeVisible()
    expect(screen.getByAltText(ResearchProjects.RECC.name)).toBeVisible()
    expect(screen.getByRole('button', { name: 'D001' })).toBeVisible()
    expect(screen.getByText('And 2 more')).toBeVisible()
  })
})
