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
  createPageRequest,
  parseSearchPagination,
  SearchPagination,
} from 'fragmentarium/ui/search/pagination'
import useClampPageIndex from 'fragmentarium/ui/search/useClampPageIndex'
import { useLocation, useNavigationType } from 'react-router-dom'
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
  pageChanged: React.MutableRefObject<boolean>
}

function usePageChanged(
  pageKey: string,
  querySignature: string,
): React.MutableRefObject<boolean> {
  const navigationType = useNavigationType()
  const previous = React.useRef({ pageKey, querySignature })
  const pageChanged = React.useRef(false)
  React.useEffect(() => {
    const { pageKey: lastPageKey, querySignature: lastQuery } = previous.current
    previous.current = { pageKey, querySignature }
    if (lastQuery !== querySignature) {
      pageChanged.current = false
    } else if (lastPageKey !== pageKey && navigationType !== 'REPLACE') {
      pageChanged.current = true
    }
  }, [navigationType, pageKey, querySignature])
  return pageChanged
}

export function createPagedCorpusQuery(
  corpusQuery: CorpusQuery,
  pagination: SearchPagination,
): CorpusQuery {
  return { ...corpusQuery, ...createPageRequest(pagination) }
}

const PagedCorpusSearchResult = withData<
  CorpusSearchResultProps,
  unknown,
  CorpusQueryResult
>(
  ({
    data,
    textService,
    corpusQuery,
    pagination,
    pageChanged,
  }): JSX.Element => {
    const summaryRef = React.useRef<HTMLDivElement>(null)
    const { pageIndex, pageSize } = pagination
    const {
      visibleChapters,
      lastPageIndex,
      hasNextPage,
      summary,
      showPaginationControls,
    } = getCorpusSearchPresentation(data, pagination)
    const isOutOfRange = useClampPageIndex(
      pageIndex,
      lastPageIndex,
      corpusPaginationURLParam,
    )
    React.useEffect(() => {
      if (pageChanged.current && !isOutOfRange) {
        pageChanged.current = false
        summaryRef.current?.focus()
      }
    }, [isOutOfRange, pageChanged])

    if (isOutOfRange) {
      return <></>
    }

    return (
      <>
        <Row>
          <Col
            ref={summaryRef}
            className="justify-content-center fragment-result__match-info"
            tabIndex={-1}
          >
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
    retry: true,
  },
)

export function CorpusSearchResult({
  textService,
  corpusQuery,
}: Omit<CorpusSearchResultProps, 'pagination' | 'pageChanged'>): JSX.Element {
  const location = useLocation()
  const pagination = parseSearchPagination(
    location.search,
    corpusPaginationURLParam,
    corpusPageSizeURLParam,
  )
  const requestKey = stringify(createPagedCorpusQuery(corpusQuery, pagination))
  const pageChanged = usePageChanged(
    `${pagination.pageIndex}:${pagination.pageSize}`,
    stringify(corpusQuery),
  )
  return (
    <PagedCorpusSearchResult
      key={requestKey}
      textService={textService}
      corpusQuery={corpusQuery}
      pagination={pagination}
      pageChanged={pageChanged}
    />
  )
}
