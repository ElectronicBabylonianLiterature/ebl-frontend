import React, { FunctionComponent } from 'react'
import _ from 'lodash'
import AppContent from 'common/AppContent'
import SessionContext from 'auth/SessionContext'
import SearchGroup from 'fragmentarium/ui/SearchForm'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import TextService from 'corpus/application/TextService'

import 'fragmentarium/ui/search/FragmentariumSearch.css'
import FragmentariumSearchResults from 'fragmentarium/ui/search/FragmentariumSearchResultsPagination'
import WordService from 'dictionary/application/WordService'

interface Props {
  number: string | null | undefined
  id: string | null | undefined
  title: string | null | undefined
  primaryAuthor: string | null | undefined
  year: string | null | undefined
  pages: string | null | undefined
  transliteration: string | null | undefined
  paginationIndex: number
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  textService: TextService
  wordService: WordService
}

const FragmentariumSearch: FunctionComponent<Props> = ({
  number,
  id,
  title,
  primaryAuthor,
  year,
  pages,
  transliteration,
  paginationIndex,
  fragmentService,
  fragmentSearchService,
  textService,
  wordService,
}: Props) => {
  return (
    <AppContent
      crumbs={[new SectionCrumb('Fragmentarium'), new TextCrumb('Search')]}
    >
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadFragments() ? (
            <section className="Fragmentarium-search">
              <header className="Fragmentarium-search__header">
                <SearchGroup
                  key={`${_.uniqueId('transliteration')}-${transliteration}`}
                  number={number}
                  id={id}
                  primaryAuthor={primaryAuthor}
                  year={year}
                  title={title}
                  pages={pages}
                  paginationIndex={paginationIndex}
                  fragmentService={fragmentService}
                  transliteration={transliteration}
                  fragmentSearchService={fragmentSearchService}
                />
              </header>
              <FragmentariumSearchResults
                number={number || ''}
                bibliographyId={id || ''}
                pages={pages || ''}
                transliteration={transliteration || ''}
                paginationIndex={paginationIndex || 0}
                fragmentSearchService={fragmentSearchService}
                wordService={wordService}
              />
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
