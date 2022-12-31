import React, { useState } from 'react'
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
import WordService from 'dictionary/application/WordService'
import withData from 'http/withData'
import { QueryService } from 'query/QueryService'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { Pagination } from 'react-bootstrap'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'

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
  queryService: QueryService
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
  queryService,
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
                queryService={queryService}
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
  queryService: QueryService
}

function Paginate({
  fragments,
}: {
  fragments: readonly QueryItem[]
}): JSX.Element {
  const [active, setActive] = useState(0)
  const chunks = _.chunk(fragments, 10).slice(0, 5)
  return (
    <>
      <Pagination>
        {chunks.map((chunk, index) => {
          return (
            <Pagination.Item
              key={index}
              active={active === index}
              onClick={(event) => {
                event.preventDefault()
                setActive(index)
              }}
            >
              {index + 1}
            </Pagination.Item>
          )
        })}
      </Pagination>
      <ul>
        {chunks[active].map((fragment, index) => (
          <li key={index}>{museumNumberToString(fragment.museumNumber)}</li>
        ))}
      </ul>
    </>
  )
}

const TestFragmentarium = withData<
  unknown,
  { queryService: QueryService },
  QueryResult
>(
  ({ data }): JSX.Element => (
    <>
      <div>{data.matchCountTotal.toLocaleString()} matches</div>
      <Paginate fragments={data.items} />
    </>
  ),
  ({ queryService }) => queryService.query('ana I')
)

function SearchResultsTabs({
  queryService,
}: SearchResultsTabsProps): JSX.Element {
  return <TestFragmentarium queryService={queryService} />
}

export default FragmentariumSearch
