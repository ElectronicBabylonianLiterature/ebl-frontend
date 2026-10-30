import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { routerFutureFlags } from 'fragmentarium/ui/search/routerFutureFlags.testSupport'
import { render } from '@testing-library/react'
import { QueryItem } from 'query/QueryResult'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import WordService from 'dictionary/application/WordService'
import { FragmentLines } from 'fragmentarium/ui/search/FragmentariumSearchResultComponents'
import mockObjectUrl from 'test-support/mockObjectUrl'

export const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
export const dossiersService = new (DossiersService as jest.Mock<
  jest.Mocked<DossiersService>
>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

mockObjectUrl('blob:url')

export function renderFragmentLines(
  queryItem: QueryItem,
  linesToShow = 3,
  queryLemmas?: readonly string[],
): ReturnType<typeof render> {
  return render(
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
    </MemoryRouter>,
  )
}
