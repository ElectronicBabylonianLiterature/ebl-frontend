import React from 'react'
import Chance from 'chance'
import { produce, castDraft } from 'immer'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import FragmentariumSearch from 'fragmentarium/ui/search/FragmentariumSearch'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'
import SessionContext from 'auth/SessionContext'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession, { Session } from 'auth/Session'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragment, lines } from 'test-support/test-fragment'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import FragmentService from 'fragmentarium/application/FragmentService'
import BibliographyService from 'bibliography/application/BibliographyService'
import { FragmentQuery } from 'query/FragmentQuery'
import TextService from 'corpus/application/TextService'
import DossiersService from 'dossiers/application/DossiersService'
import { Genre, Genres } from 'fragmentarium/domain/Genres'
import { MesopotamianDate } from 'chronology/domain/Date'
import { PeriodModifiers, Periods } from 'common/utils/period'
import { ResearchProjects } from 'research-projects/researchProject'
import { Text } from 'transliteration/domain/text'
import { TextLine } from 'transliteration/domain/text-line'
import { lineNumberFactory } from 'test-support/linenumber-factory'

export const chance = new Chance('fragmentarium-search-test')

export interface FragmentariumSearchTestContext {
  fragmentService: jest.Mocked<FragmentService>
  wordService: jest.Mocked<WordService>
  textService: jest.Mocked<TextService>
  bibliographyService: jest.Mocked<BibliographyService>
  dossiersService: jest.Mocked<DossiersService>
  fragmentSearchService: jest.Mocked<FragmentSearchService>
  session: Session
  container: HTMLElement
  createSearch: (
    query?: Partial<FragmentQuery>,
    activeTab?: string,
  ) => React.ReactElement
  renderSearch: (
    waitForText: string,
    query?: Partial<FragmentQuery>,
    activeTab?: string,
  ) => Promise<void>
}

export function createFragmentariumSearchTestContext(): FragmentariumSearchTestContext {
  const fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
  const bibliographyService = new (BibliographyService as jest.Mock<
    jest.Mocked<BibliographyService>
  >)()
  const dossiersService = new (DossiersService as jest.Mock<
    jest.Mocked<DossiersService>
  >)()
  const fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  const session: Session = new MemorySession(['read:fragments'])

  const createSearch = (
    query: Partial<FragmentQuery> = {},
    activeTab = 'library',
  ): React.ReactElement => (
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
    </MemoryRouter>
  )

  const context: FragmentariumSearchTestContext = {
    fragmentService: fragmentService,
    wordService: wordService,
    textService: textService,
    bibliographyService: bibliographyService,
    dossiersService: dossiersService,
    fragmentSearchService: fragmentSearchService,
    session: session,
    container: document.createElement('div'),
    createSearch: createSearch,
    renderSearch: async (
      waitForText: string,
      query: Partial<FragmentQuery> = {},
      activeTab = 'library',
    ): Promise<void> => {
      context.container = render(createSearch(query, activeTab)).container
      await screen.findByText(waitForText)
    },
  }

  fragmentService.fetchPeriods.mockReturnValueOnce(Promise.resolve([]))
  fragmentService.fetchGenres.mockReturnValueOnce(Promise.resolve([]))
  fragmentService.fetchProvenances.mockReturnValueOnce(Promise.resolve([]))
  fragmentService.findThumbnail.mockResolvedValue({ blob: null })
  dossiersService.fetchFilteredDossiers.mockReturnValue(Promise.resolve([]))

  return context
}

export function buildSummaryBackedFragment(): Fragment {
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
