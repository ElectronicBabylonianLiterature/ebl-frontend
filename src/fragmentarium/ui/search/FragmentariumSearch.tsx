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
import { CorpusSearchResult } from 'corpus/ui/search/CorpusSearchResult'
import TextService from 'corpus/application/TextService'
import { Tab, Tabs } from 'react-bootstrap'
import { CorpusQuery } from 'query/CorpusQuery'

interface Props {
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  fragmentQuery: FragmentQuery
  wordService: WordService
  textService: TextService
}

export const linesToShow = 5

function hasNonDefaultValues(query: FragmentQuery | CorpusQuery) {
  return !_(query)
    .omit('lemmaOperator')
    .omitBy((value) => !value)
    .isEmpty()
}

function FragmentariumSearch({
  fragmentService,
  fragmentSearchService,
  fragmentQuery,
  wordService,
  textService,
}: Props): JSX.Element {
  const corpusQuery: CorpusQuery = _.pick(
    fragmentQuery,
    'lemmas',
    'lemmaOperator',
    'transliteration'
  )
  const showResults =
    hasNonDefaultValues(fragmentQuery) || hasNonDefaultValues(corpusQuery)
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
              {showResults && (
                <Tabs defaultActiveKey={'fragmentarium'} justify>
                  <Tab eventKey={'fragmentarium'} title={'Fragmentarium'}>
                    <SearchResult
                      fragmentService={fragmentService}
                      fragmentQuery={fragmentQuery}
                    />
                  </Tab>
                  <Tab eventKey={'corpus'} title={'Corpus'}>
                    <CorpusSearchResult
                      textService={textService}
                      corpusQuery={corpusQuery}
                    />
                  </Tab>
                </Tabs>
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
