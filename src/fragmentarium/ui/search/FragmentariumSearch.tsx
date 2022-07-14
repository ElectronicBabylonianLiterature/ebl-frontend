import React from 'react'
import _ from 'lodash'
import AppContent from 'common/AppContent'
import CorpusTransliterationSearch from 'corpus/ui/TransliterationSearch'
import SessionContext from 'auth/SessionContext'
import SearchGroup from 'fragmentarium/ui/SearchForm'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import TextService from 'corpus/application/TextService'

import 'fragmentarium/ui/search/FragmentariumSearch.css'
import FragmentariumSearchResultsPagination from 'fragmentarium/ui/search/FragmentariumSearchResults'
import WordService from 'dictionary/application/WordService'
import { Tab, Tabs } from 'react-bootstrap'

interface Props {
  number: string | null
  id: string | null
  title: string | null
  primaryAuthor: string | null
  year: string | null
  pages: string | null
  transliteration: string | null
  paginationIndexFragmentarium: number
  paginationIndexCorpus: number
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  textService: TextService
  wordService: WordService
}

function FragmentariumSearch({
  number,
  id,
  title,
  primaryAuthor,
  year,
  pages,
  transliteration,
  paginationIndexFragmentarium,
  paginationIndexCorpus,
  fragmentService,
  fragmentSearchService,
  textService,
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
                <SearchGroup
                  key={`${_.uniqueId('transliteration')}-${transliteration}`}
                  number={number}
                  id={id}
                  primaryAuthor={primaryAuthor}
                  year={year}
                  title={title}
                  pages={pages}
                  fragmentService={fragmentService}
                  transliteration={transliteration}
                  fragmentSearchService={fragmentSearchService}
                />
              </header>
              <SearchResultsTabs
                number={number}
                pages={pages}
                bibliographyId={id}
                paginationIndexFragmentarium={paginationIndexFragmentarium}
                paginationIndexCorpus={paginationIndexCorpus}
                transliteration={transliteration}
                fragmentSearchService={fragmentSearchService}
                textService={textService}
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

interface SearchResultsTabsProps {
  number: string | null
  pages: string | null
  bibliographyId: string | null
  transliteration: string | null
  paginationIndexCorpus: number
  paginationIndexFragmentarium: number
  fragmentSearchService: FragmentSearchService
  textService: TextService
}

function SearchResultsTabs({
  number,
  bibliographyId,
  pages,
  transliteration,
  paginationIndexFragmentarium,
  paginationIndexCorpus,
  fragmentSearchService,
  textService,
}: SearchResultsTabsProps): JSX.Element {
  return (
    <Tabs defaultActiveKey="fragmentarium" justify className="mb-4">
      <Tab eventKey="fragmentarium" title="Fragmentarium">
        <FragmentariumSearchResultsPagination
          number={number || ''}
          bibliographyId={bibliographyId || ''}
          pages={pages || ''}
          transliteration={transliteration || ''}
          paginationIndex={paginationIndexFragmentarium}
          fragmentSearchService={fragmentSearchService}
        />
      </Tab>
      <Tab eventKey="corpus" title="Corpus">
        <CorpusTransliterationSearch
          paginationIndex={paginationIndexCorpus}
          transliteration={transliteration || ''}
          textService={textService}
        />
      </Tab>
    </Tabs>
  )
}

export default FragmentariumSearch
