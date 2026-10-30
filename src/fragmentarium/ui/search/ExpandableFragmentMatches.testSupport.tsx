import { routerFutureFlags } from './routerFutureFlags.testSupport'
import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryItem } from 'query/QueryResult'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { FragmentLines } from 'fragmentarium/ui/search/FragmentariumSearchResultComponents'
import mockObjectUrl from 'test-support/mockObjectUrl'

export const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
export const dossiersService = new (DossiersService as jest.Mock<
  jest.Mocked<DossiersService>
>)()
export const wordService = new (WordService as jest.Mock<
  jest.Mocked<WordService>
>)()

mockObjectUrl('blob:url')

export function fragmentLinesElement(
  queryItem: QueryItem,
  linesToShow = 3,
  queryLemmas?: readonly string[],
): JSX.Element {
  return (
    <MemoryRouter future={routerFutureFlags}>
      <DictionaryContext.Provider value={wordService}>
        <FragmentLines
          fragmentService={fragmentService}
          dossiersService={dossiersService}
          queryItem={queryItem}
          linesToShow={linesToShow}
          queryLemmas={queryLemmas}
        />
      </DictionaryContext.Provider>
    </MemoryRouter>
  )
}

export function renderFragmentLines(
  queryItem: QueryItem,
  linesToShow = 3,
  queryLemmas?: readonly string[],
) {
  return render(fragmentLinesElement(queryItem, linesToShow, queryLemmas))
}

export function resetFragmentLineMocks(): void {
  jest.clearAllMocks()
  dossiersService.queryByIds.mockResolvedValue([])
}
