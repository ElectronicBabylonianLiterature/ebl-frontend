import React from 'react'
import _ from 'lodash'
import AppContent from 'common/AppContent'
import SessionContext from 'auth/SessionContext'
import SearchForm from 'fragmentarium/ui/SearchForm'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import 'fragmentarium/ui/search/FragmentariumSearch.css'
import { FragmentQuery } from 'query/FragmentQuery'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import WordService from 'dictionary/application/WordService'
import { SearchResult } from './FragmentariumSearchResult'

interface Props {
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  fragmentQuery: FragmentQuery
  wordService: WordService
}

export const linesToShow = 5

function FragmentariumSearch({
  fragmentService,
  fragmentSearchService,
  fragmentQuery,
  wordService,
}: Props): JSX.Element {
  return (
    <AppContent
      crumbs={[new SectionCrumb('Fragmentarium'), new TextCrumb('Search')]}
    >
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadFragments() ? (
            <section className="Fragmentarium-search">
              <header className="Fragmentarium-search__header">
                <SearchForm
                  fragmentSearchService={fragmentSearchService}
                  fragmentService={fragmentService}
                  fragmentQuery={fragmentQuery}
                  wordService={wordService}
                />
              </header>
              {!_.isEmpty(fragmentQuery) && (
                <SearchResult
                  fragmentService={fragmentService}
                  fragmentQuery={fragmentQuery}
                />
              )}
            </section>
          ) : (
            <p>Please log in to browse the Fragmentarium.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

export default FragmentariumSearch
