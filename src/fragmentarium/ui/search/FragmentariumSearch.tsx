import React from 'react'
import _ from 'lodash'
import AppContent from 'common/ui/AppContent'
import AboutInlineLink from 'common/ui/AboutInlineLink'
import SessionContext from 'auth/SessionContext'
import SearchForm, {
  SearchFormProps,
  isValidNumber,
} from 'fragmentarium/ui/SearchForm'
import { SectionCrumb, TextCrumb } from 'common/ui/Breadcrumbs'
import { Session } from 'auth/Session'
import 'fragmentarium/ui/search/FragmentariumSearch.css'
import { FragmentQuery, FragmentSearchCriteria } from 'query/FragmentQuery'
import WordService from 'dictionary/application/WordService'
import { SearchResult } from 'fragmentarium/ui/search/FragmentariumSearchResult'
import { CorpusSearchResult } from 'corpus/ui/search/CorpusSearchResult'
import TextService from 'corpus/application/TextService'
import { Col, Row, Tab, Tabs } from 'react-bootstrap'
import { CorpusQuery } from 'query/CorpusQuery'
import DossiersService from 'dossiers/application/DossiersService'
import { SearchPagination } from 'fragmentarium/ui/search/pagination'
import { useLocation } from 'react-router-dom'
import { useHistory } from 'router/compat'

type Props = Pick<
  SearchFormProps,
  'fragmentService' | 'fragmentSearchService' | 'bibliographyService'
> & {
  fragmentQuery: FragmentSearchCriteria
  pagination: SearchPagination
  dossiersService: DossiersService
  wordService: WordService
  textService: TextService
  activeTab: string
}

export const linesToShow = 5

const transportPaginationFields = ['limit', 'offset', 'count'] as const

function hasNonDefaultValues(query: FragmentQuery | CorpusQuery) {
  return !_(query)
    .omit('lemmaOperator')
    .omit(transportPaginationFields)
    .omitBy((value) => !value)
    .isEmpty()
}

function FragmentariumSearch({
  fragmentService,
  dossiersService,
  fragmentSearchService,
  bibliographyService,
  fragmentQuery,
  pagination,
  wordService,
  textService,
  activeTab,
}: Props): JSX.Element {
  const location = useLocation()
  const history = useHistory()
  const selectedTab =
    (location.hash || `#${activeTab}`).toLowerCase() === '#corpus'
      ? 'corpus'
      : 'library'
  const corpusQuery: CorpusQuery = _.pick(
    fragmentQuery,
    'lemmas',
    'lemmaOperator',
    'transliteration',
  )
  const hasCorpusCriteria = hasNonDefaultValues(corpusQuery)

  const showResults =
    (isValidNumber(fragmentQuery.number) &&
      hasNonDefaultValues(fragmentQuery)) ||
    hasCorpusCriteria

  return (
    <AppContent
      crumbs={[new SectionCrumb('Library'), new TextCrumb('Search')]}
      breadcrumbsFullWidth={false}
    >
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadFragments() ? (
            <section className="Library-search">
              <header className="Library-search__header">
                <Row>
                  <Col className="mx-auto">
                    <div className="Library-search__search-header">
                      <SearchForm
                        fragmentSearchService={fragmentSearchService}
                        fragmentService={fragmentService}
                        dossiersService={dossiersService}
                        fragmentQuery={fragmentQuery}
                        wordService={wordService}
                        bibliographyService={bibliographyService}
                        showAdvancedSearch={true}
                      />
                      <AboutInlineLink
                        to="/about/library"
                        label="Library"
                        className="Library-search__about-link"
                      />
                    </div>
                  </Col>
                </Row>
              </header>
              {showResults ? (
                <Tabs
                  activeKey={selectedTab}
                  onSelect={(key) => {
                    if (key && key !== selectedTab) {
                      history.push({
                        pathname: location.pathname,
                        search: location.search,
                        hash: `#${key}`,
                      })
                    }
                  }}
                  justify
                >
                  <Tab eventKey="library" title="Library">
                    <SearchResult
                      fragmentService={fragmentService}
                      dossiersService={dossiersService}
                      fragmentQuery={fragmentQuery}
                      pagination={pagination}
                    />
                  </Tab>
                  <Tab eventKey="corpus" title="Corpus">
                    {hasCorpusCriteria ? (
                      <CorpusSearchResult
                        textService={textService}
                        corpusQuery={corpusQuery}
                      />
                    ) : (
                      <p>
                        Enter a transliteration or lemma search to search the
                        Corpus.
                      </p>
                    )}
                  </Tab>
                </Tabs>
              ) : (
                <Row>
                  <Col className="fragment-result__match-info">
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
