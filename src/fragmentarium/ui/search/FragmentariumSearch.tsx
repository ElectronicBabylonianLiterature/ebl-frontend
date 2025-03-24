import React, { useState } from 'react'
import _ from 'lodash'
import AppContent from 'common/AppContent'
import SessionContext from 'auth/SessionContext'
import SearchForm, {
  SearchFormProps,
  helpColSize,
  isValidNumber,
} from 'fragmentarium/ui/SearchForm'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import 'fragmentarium/ui/search/FragmentariumSearch.css'
import { FragmentQuery } from 'query/FragmentQuery'
import WordService from 'dictionary/application/WordService'
import { SearchResult } from './FragmentariumSearchResult'
import { CorpusSearchResult } from 'corpus/ui/search/CorpusSearchResult'
import TextService from 'corpus/application/TextService'
import { Col, Row, Tab, Tabs } from 'react-bootstrap'
import { CorpusQuery } from 'query/CorpusQuery'
import DossiersService from 'dossiers/application/DossiersService'
import { Location } from 'history'

type Props = Pick<
  SearchFormProps,
  'fragmentService' | 'fragmentSearchService' | 'bibliographyService'
> & {
  fragmentQuery: FragmentQuery
  dossiersService: DossiersService
  wordService: WordService
  textService: TextService
  activeTab: string
  location: Location & { state?: { isAdvancedSearchOpen?: boolean } }
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
  dossiersService,
  fragmentSearchService,
  bibliographyService,
  fragmentQuery,
  wordService,
  textService,
  activeTab,
  location,
}: Props): JSX.Element {
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(
    location.state?.isAdvancedSearchOpen || false
  )

  const corpusQuery: CorpusQuery = _.pick(
    fragmentQuery,
    'lemmas',
    'lemmaOperator',
    'transliteration'
  )

  const showResults =
    (isValidNumber(fragmentQuery.number) &&
      hasNonDefaultValues(fragmentQuery)) ||
    hasNonDefaultValues(corpusQuery)

  return (
    <AppContent crumbs={[new SectionCrumb('Library'), new TextCrumb('Search')]}>
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadFragments() ? (
            <section className="Library-search">
              <header className="Library-search__header">
                <Row>
                  <Col md={showAdvancedSearch ? 12 : 6} className="mx-auto">
                    <SearchForm
                      fragmentSearchService={fragmentSearchService}
                      fragmentService={fragmentService}
                      dossiersService={dossiersService}
                      fragmentQuery={fragmentQuery}
                      wordService={wordService}
                      bibliographyService={bibliographyService}
                      onToggleAdvancedSearch={setShowAdvancedSearch}
                      isAdvancedSearchOpen={showAdvancedSearch}
                    />
                  </Col>
                </Row>
              </header>
              {showResults ? (
                <Tabs defaultActiveKey={activeTab || 'library'} justify>
                  <Tab
                    eventKey="library"
                    title="Library"
                    onEnter={() =>
                      window.history.replaceState(null, '', '#library')
                    }
                  >
                    <SearchResult
                      fragmentService={fragmentService}
                      dossiersService={dossiersService}
                      fragmentQuery={fragmentQuery}
                    />
                  </Tab>
                  <Tab
                    eventKey="corpus"
                    title="Corpus"
                    onEnter={() =>
                      window.history.replaceState(null, '', '#corpus')
                    }
                  >
                    <CorpusSearchResult
                      textService={textService}
                      corpusQuery={corpusQuery}
                    />
                  </Tab>
                </Tabs>
              ) : (
                <Row>
                  <Col
                    sm={{ offset: 1, span: 12 - helpColSize }}
                    className="justify-content-center library-result__match-info"
                  >
                    Search for fragments and chapters in the Library.
                  </Col>
                </Row>
              )}
            </section>
          ) : (
            <p>Please log in to browse the Library.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

export default FragmentariumSearch
