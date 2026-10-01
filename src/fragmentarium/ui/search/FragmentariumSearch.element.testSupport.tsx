import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import FragmentariumSearch from 'fragmentarium/ui/search/FragmentariumSearch'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import BibliographyService from 'bibliography/application/BibliographyService'
import TextService from 'corpus/application/TextService'
import DossiersService from 'dossiers/application/DossiersService'
import { FragmentQuery } from 'query/FragmentQuery'

export interface FragmentariumSearchServices {
  fragmentSearchService: FragmentSearchService
  fragmentService: FragmentService
  bibliographyService: BibliographyService
  dossiersService: DossiersService
  wordService: WordService
  textService: TextService
  session: Session
}

export function createSearchElement(
  services: FragmentariumSearchServices,
  query: Partial<FragmentQuery>,
  activeTab: string,
): JSX.Element {
  return (
    <MemoryRouter>
      <DictionaryContext.Provider value={services.wordService}>
        <SessionContext.Provider value={services.session}>
          <FragmentariumSearch
            fragmentSearchService={services.fragmentSearchService}
            fragmentService={services.fragmentService}
            bibliographyService={services.bibliographyService}
            dossiersService={services.dossiersService}
            fragmentQuery={query}
            pagination={{ pageIndex: 0, pageSize: 50 }}
            wordService={services.wordService}
            textService={services.textService}
            activeTab={activeTab}
          />
        </SessionContext.Provider>
      </DictionaryContext.Provider>
    </MemoryRouter>
  )
}
