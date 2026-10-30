import React from 'react'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import { CorpusQuery } from 'query/CorpusQuery'
import { CorpusQueryItem, CorpusQueryResult } from 'query/QueryResult'
import { Col, Row } from 'react-bootstrap'
import _ from 'lodash'
import { chapterIdToString } from 'transliteration/domain/chapter-id'
import { CORPUS_MATCH_BATCH_SIZE } from 'corpus/ui/search/CorpusChapterMatches'
import LazyChapterResult from 'corpus/ui/search/CorpusChapterResult'
import PaginationItems, {
  PaginationPosition,
} from 'fragmentarium/ui/search/PaginationItems'
import {
  corpusPageSizeURLParam,
  corpusPaginationURLParam,
  parseSearchPagination,
  SearchPagination,
  updatePaginationSearchParam,
} from 'fragmentarium/ui/search/pagination'
import { useLocation } from 'react-router-dom'
import { useHistory } from 'router/compat'
import { stringify } from 'common/utils/queryString'
import { getCorpusSearchPresentation } from 'corpus/ui/search/CorpusSearchPresentation'
import 'corpus/ui/search/CorpusSearchResult.sass'
import 'fragmentarium/ui/search/FragmentariumSearchResult.sass'

function ResultPages({
  textService,
  chapters,
  variantsToShow,
  pageIndex,
  pageSize,
  lastPageIndex,
  hasNextPage,
  querySignature,
  showPaginationControls,
}: {
  textService: TextService
  chapters: readonly CorpusQueryItem[]
  variantsToShow: number
  pageIndex: number
  pageSize: number
  lastPageIndex: number | null
  hasNextPage: boolean
  querySignature: string
  showPaginationControls: boolean
}): JSX.Element {
  const pageButtons = (position: PaginationPosition) =>
    showPaginationControls ? (
      <Row>
        <Col className="d-flex justify-content-center">
          <PaginationItems
            activePage={pageIndex}
            pageSize={pageSize}
            hasNextPage={hasNextPage}
            lastPageIndex={lastPageIndex}
            paginationURLParam={corpusPaginationURLParam}
            pageSizeURLParam={corpusPageSizeURLParam}
            hash="#corpus"
            position={position}
          />
        </Col>
      </Row>
    ) : null

  return (
    <>
      {pageButtons('top')}
      {chapters.map((chapter, index) => {
        const chapterId = {
          textId: chapter.textId,
          name: chapter.name,
          stage: chapter.stage,
        }
        return (
          <LazyChapterResult
            key={`${querySignature}:${pageIndex}:${index}:${chapterIdToString(chapterId)}:${chapter.lines.join(',')}:${chapter.variants.join(',')}`}
            chapter={chapter}
            textService={textService}
            variantsToShow={variantsToShow}
            pageIndex={pageIndex}
          />
        )
      })}
      {pageButtons('bottom')}
    </>
  )
}

type CorpusSearchResultProps = {
  textService: TextService
  corpusQuery: CorpusQuery
  pagination: SearchPagination
}

export function createPagedCorpusQuery(
  corpusQuery: CorpusQuery,
  { pageIndex, pageSize }: SearchPagination,
): CorpusQuery {
  return { ...corpusQuery, limit: pageSize, offset: pageIndex * pageSize }
}

const PagedCorpusSearchResult = withData<
  CorpusSearchResultProps,
  unknown,
  CorpusQueryResult
>(
  ({ data, textService, corpusQuery, pagination }): JSX.Element => {
    const location = useLocation()
    const history = useHistory()
    const { pageIndex, pageSize } = pagination
    const {
      visibleChapters,
      lastPageIndex,
      hasNextPage,
      summary,
      showPaginationControls,
    } = getCorpusSearchPresentation(data, pagination)
    React.useEffect(() => {
      if (lastPageIndex !== null && pageIndex > lastPageIndex) {
        history.replace({
          pathname: location.pathname,
          search: updatePaginationSearchParam(
            location.search,
            corpusPaginationURLParam,
            lastPageIndex,
          ),
          hash: '#corpus',
        })
      }
    }, [history, lastPageIndex, location.pathname, location.search, pageIndex])

    if (lastPageIndex !== null && pageIndex > lastPageIndex) {
      return <></>
    }

    return (
      <>
        <Row>
          <Col className="justify-content-center fragment-result__match-info">
            {summary}
          </Col>
        </Row>

        {(visibleChapters.length > 0 || pageIndex > 0 || hasNextPage) && (
          <ResultPages
            chapters={visibleChapters}
            textService={textService}
            variantsToShow={Math.min(
              Math.max(
                _.trimEnd(corpusQuery.transliteration || '').split('\n').length,
                3,
              ),
              CORPUS_MATCH_BATCH_SIZE,
            )}
            pageIndex={pageIndex}
            pageSize={pageSize}
            lastPageIndex={lastPageIndex}
            hasNextPage={hasNextPage}
            querySignature={stringify(corpusQuery)}
            showPaginationControls={showPaginationControls}
          />
        )}
      </>
    )
  },
  ({ textService, corpusQuery, pagination }, signal) =>
    textService.query(createPagedCorpusQuery(corpusQuery, pagination), signal),
  {
    watch: ({ corpusQuery, pagination }) => [
      stringify(createPagedCorpusQuery(corpusQuery, pagination)),
    ],
  },
)

export function CorpusSearchResult({
  textService,
  corpusQuery,
}: Omit<CorpusSearchResultProps, 'pagination'>): JSX.Element {
  const location = useLocation()
  const pagination = parseSearchPagination(
    location.search,
    corpusPaginationURLParam,
    corpusPageSizeURLParam,
  )
  const requestKey = stringify(createPagedCorpusQuery(corpusQuery, pagination))
  return (
    <PagedCorpusSearchResult
      key={requestKey}
      textService={textService}
      corpusQuery={corpusQuery}
      pagination={pagination}
    />
  )
}
