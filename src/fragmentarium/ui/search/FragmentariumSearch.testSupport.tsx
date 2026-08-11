import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import FragmentariumSearch from './FragmentariumSearch'
import SessionContext from 'auth/SessionContext'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession, { Session } from 'auth/Session'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import FragmentService from 'fragmentarium/application/FragmentService'
import BibliographyService from 'bibliography/application/BibliographyService'
import { FragmentQuery } from 'query/FragmentQuery'
import { CorpusQueryResult } from 'query/QueryResult'
import TextService from 'corpus/application/TextService'
import DossiersService from 'dossiers/application/DossiersService'
import PropTypes from 'prop-types'

jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('corpus/application/TextService')
jest.mock('bibliography/application/BibliographyService')
jest.mock('dossiers/application/DossiersService')

function MockCorpusSearchResult({
  textService,
  corpusQuery,
}: {
  textService: Pick<TextService, 'query'>
  corpusQuery: Record<string, unknown>
}) {
  const [result, setResult] = React.useState<CorpusQueryResult | null>(null)
  React.useEffect(() => {
    let isCurrent = true
    textService.query(corpusQuery).then((queryResult) => {
      if (isCurrent) setResult(queryResult)
    })
    return () => {
      isCurrent = false
    }
  }, [corpusQuery, textService])
  if (result === null) return <div>Loading Corpus</div>
  return (
    <div>
      <div>Found {result.items.length} chapters</div>
      {result.items.map((item) => (
        <div key={item.name}>{item.name}</div>
      ))}
    </div>
  )
}

MockCorpusSearchResult.propTypes = {
  textService: PropTypes.shape({
    query: PropTypes.func.isRequired,
  }).isRequired,
  corpusQuery: PropTypes.object.isRequired,
}

jest.mock('corpus/ui/search/CorpusSearchResult', () => ({
  CorpusSearchResult: MockCorpusSearchResult,
}))

export function queryResult(lines = 2, hasNextPage = false) {
  const fragment = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
  return {
    items: [
      {
        museumNumber: fragment.number,
        matchingLines: [1, 2],
        matchCount: lines,
        fragment,
        thumbnailPath: null,
      },
    ],
    matchCountTotal: lines,
    hasNextPage,
  }
}

export function createFragmentariumSearchHarness() {
  const fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
  const bibliographyService = new (BibliographyService as jest.Mock<
    jest.Mocked<BibliographyService>
  >)()
  const dossiersService = new (DossiersService as jest.Mock<
    jest.Mocked<DossiersService>
  >)()
  const fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  const session: Session = new MemorySession(['read:fragments'])

  fragmentService.fetchPeriods.mockResolvedValue([])
  fragmentService.fetchGenres.mockResolvedValue([])
  fragmentService.fetchProvenances.mockResolvedValue([])
  fragmentService.findThumbnail.mockResolvedValue({ blob: null })
  dossiersService.fetchFilteredDossiers.mockResolvedValue([])
  dossiersService.queryByIds.mockResolvedValue([])
  wordService.findAll.mockResolvedValue([])
  textService.query.mockResolvedValue({ items: [], matchCountTotal: 0 })

  function buildSearchElement(query: Partial<FragmentQuery> = {}): JSX.Element {
    return (
      <MemoryRouter>
        <DictionaryContext.Provider value={wordService}>
          <SessionContext.Provider value={session}>
            <FragmentariumSearch
              fragmentSearchService={fragmentSearchService}
              fragmentService={fragmentService}
              bibliographyService={bibliographyService}
              dossiersService={dossiersService}
              fragmentQuery={query}
              pagination={{ pageIndex: 0, pageSize: 50 }}
              wordService={wordService}
              textService={textService}
              activeTab="library"
            />
          </SessionContext.Provider>
        </DictionaryContext.Provider>
      </MemoryRouter>
    )
  }

  function renderSearch(
    query: Partial<FragmentQuery> = {},
  ): ReturnType<typeof render> {
    return render(buildSearchElement(query))
  }

  return {
    fragmentSearchService,
    wordService,
    textService,
    bibliographyService,
    dossiersService,
    fragmentService,
    session,
    renderSearch,
    buildSearchElement,
  }
}

export type FragmentariumSearchHarness = ReturnType<
  typeof createFragmentariumSearchHarness
>
