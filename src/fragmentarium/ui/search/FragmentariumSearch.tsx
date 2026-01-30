import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import _ from 'lodash'
import AppContent from 'common/AppContent'
import InfoBanner from 'common/InfoBanner'
import SessionContext from 'auth/SessionContext'
import SearchForm, {
  SearchFormProps,
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

type Props = Pick<
  SearchFormProps,
  'fragmentService' | 'fragmentSearchService' | 'bibliographyService'
> & {
  fragmentQuery: FragmentQuery
  dossiersService: DossiersService
  wordService: WordService
  textService: TextService
  activeTab: string
} & RouteComponentProps

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
}: Props): JSX.Element {
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
      <InfoBanner
        title="About the Library"
        description="The eBL Library (formerly Fragmentarium) addresses the fragmentariness of Babylonian literature by providing searchable transliterations of thousands of fragments. Over 1,200 joins have been discovered by the eBL team, helping to reunite texts scattered across museum collections."
        learnMorePath="/about/fragmentarium"
      />
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadFragments() ? (
            <section className="Library-search">
              <header className="Library-search__header">
                <Row>
                  <Col className="mx-auto">
                    <SearchForm
                      fragmentSearchService={fragmentSearchService}
                      fragmentService={fragmentService}
                      dossiersService={dossiersService}
                      fragmentQuery={fragmentQuery}
                      wordService={wordService}
                      bibliographyService={bibliographyService}
                      showAdvancedSearch={true}
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
