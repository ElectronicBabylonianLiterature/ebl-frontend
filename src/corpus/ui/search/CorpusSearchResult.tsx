import React from 'react'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import { CorpusQuery } from 'query/CorpusQuery'
import { CorpusQueryItem, CorpusQueryResult } from 'query/QueryResult'
import { Col, Row } from 'react-bootstrap'
import _ from 'lodash'
import { ChapterId, chapterIdToString } from 'transliteration/domain/chapter-id'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { Markdown } from 'common/ui/Markdown'
import { genreFromAbbr } from 'corpus/ui/Corpus'
import CorpusChapterMatches, {
  CORPUS_MATCH_BATCH_SIZE,
  CorpusMatchPair,
  uniqueCorpusMatchPairs,
} from 'corpus/ui/search/CorpusChapterMatches'
import PaginationItems, {
  PaginationPosition,
} from 'fragmentarium/ui/search/PaginationItems'
import {
  corpusPageSizeURLParam,
  corpusPaginationURLParam,
  getLastPageIndex,
  parseSearchPagination,
  RESULT_PAGE_SIZES,
  SearchPagination,
  updatePaginationSearchParam,
} from 'fragmentarium/ui/search/pagination'
import { useLocation } from 'react-router-dom'
import { useHistory } from 'router/compat'
import { stringify } from 'common/utils/queryString'
import useNearViewport from 'common/hooks/useNearViewport'
import 'corpus/ui/search/CorpusSearchResult.sass'
import 'fragmentarium/ui/search/FragmentariumSearchResult.sass'

function GenreInfoRow({
  chapterId,
  textName,
  url,
}: {
  chapterId: ChapterId
  textName: string
  url: string
}): JSX.Element {
  return (
    <Row>
      <Col className="justify-content-left fragment-result__match-info text-secondary">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <small>
            <Markdown text={genreFromAbbr(chapterId.textId.genre)} />
            {textName && (
              <>
                &nbsp;&gt;&nbsp;
                <Markdown text={textName} />
              </>
            )}
            {' > '}
            {`${chapterIdToString(chapterId)} `}
            <i className="fas fa-external-link-alt" aria-hidden="true" />
          </small>
        </a>
      </Col>
    </Row>
  )
}

const ChapterResult = withData<
  {
    chapterId: ChapterId
    textService: TextService
    pairs: readonly CorpusMatchPair[]
    variantsToShow: number
  },
  {
    textService: TextService
    active: number
  },
  ChapterDisplay
>(
  ({
    data: chapterDisplay,
    chapterId,
    pairs,
    textService,
    variantsToShow,
  }): JSX.Element => {
    return (
      <>
        <GenreInfoRow
          chapterId={chapterId}
          textName={chapterDisplay.textName}
          url={chapterDisplay.url}
        />
        <CorpusChapterMatches
          initialChapter={chapterDisplay}
          chapterId={chapterId}
          pairs={pairs}
          initiallyVisible={Math.min(pairs.length, variantsToShow)}
          textService={textService}
        />
        <hr />
      </>
    )
  },
  ({ textService, chapterId, pairs, variantsToShow }) =>
    textService.findChapterDisplay(
      chapterId,
      pairs.slice(0, variantsToShow).map((pair) => pair.line),
      pairs.slice(0, variantsToShow).map((pair) => pair.variant),
    ),
  {
    watch: ({ active }) => [active],
  },
)

function LazyChapterResult({
  chapter,
  textService,
  variantsToShow,
  pageIndex,
}: {
  chapter: CorpusQueryItem
  textService: TextService
  variantsToShow: number
  pageIndex: number
}): JSX.Element {
  const { containerRef, isNearViewport } = useNearViewport('400px')
  const chapterId: ChapterId = {
    textId: chapter.textId,
    name: chapter.name,
    stage: chapter.stage,
  }
  const pairs = uniqueCorpusMatchPairs(chapter.lines, chapter.variants)
  if (pairs.length === 0) {
    return (
      <div className="corpus-search__chapter-slot">
        <p>
          Matching lines are unavailable for {chapterIdToString(chapterId)}.
        </p>
      </div>
    )
  }
  return (
    <div className="corpus-search__chapter-slot" ref={containerRef}>
      {isNearViewport && (
        <ChapterResult
          textService={textService}
          chapterId={chapterId}
          active={pageIndex}
          pairs={pairs}
          variantsToShow={variantsToShow}
        />
      )}
      {!isNearViewport && (
        <p>Chapter {chapterIdToString(chapterId)} loads as you scroll.</p>
      )}
    </div>
  )
}

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
    const visibleChapters = data.items.slice(0, pageSize)
    const lastPageIndex = getLastPageIndex(data.totalChapters, pageSize)
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

    const chapterCount = visibleChapters.length
    const totalChapters =
      lastPageIndex === null ? null : (data.totalChapters as number)
    const hasNextPage =
      lastPageIndex === null
        ? data.hasNextPage === true ||
          data.items.length > pageSize ||
          (data.hasNextPage == null && data.items.length === pageSize)
        : pageIndex < lastPageIndex
    const matchCountTotal = data.matchCountTotal
    const hasLineCount = typeof matchCountTotal === 'number'
    const legacyLineCountInfo = hasLineCount
      ? `${data.isMatchCountTotalExact === false ? 'about ' : ''}${matchCountTotal.toLocaleString()} line${
          matchCountTotal === 1 ? '' : 's'
        } in `
      : ''
    const lineCountInfo = hasLineCount
      ? `${data.isMatchCountTotalExact === false ? 'about ' : ''}${matchCountTotal.toLocaleString()} matching line variant${
          matchCountTotal === 1 ? '' : 's'
        } in `
      : ''
    const chapterRange =
      chapterCount > 0
        ? `Showing chapters ${(pageIndex * pageSize + 1).toLocaleString()}-${(
            pageIndex * pageSize +
            chapterCount
          ).toLocaleString()} of ${totalChapters?.toLocaleString()}`
        : pageIndex > 0
          ? 'No chapters on this page'
          : ''
    const summary =
      totalChapters === null
        ? pageIndex > 0
          ? `${hasLineCount ? `Found ${data.isMatchCountTotalExact === false ? 'about ' : ''}${matchCountTotal.toLocaleString()} matching line variants. ` : ''}${
              chapterCount > 0
                ? `Showing chapters ${(pageIndex * pageSize + 1).toLocaleString()}-${(
                    pageIndex * pageSize +
                    chapterCount
                  ).toLocaleString()}`
                : 'No chapters on this page'
            }`
          : `Found ${legacyLineCountInfo}${chapterCount.toLocaleString()} chapter${
              chapterCount === 1 ? '' : 's'
            }${hasNextPage ? '; more results are available' : ''}`
        : `Found ${lineCountInfo}${totalChapters.toLocaleString()} chapter${
            totalChapters === 1 ? '' : 's'
          }${chapterRange ? `. ${chapterRange}` : ''}`
    const showPaginationControls = !(
      pageIndex === 0 &&
      !hasNextPage &&
      chapterCount < RESULT_PAGE_SIZES[0]
    )
    return (
      <>
        <Row>
          <Col className="justify-content-center fragment-result__match-info">
            {summary}
          </Col>
        </Row>

        {(chapterCount > 0 || pageIndex > 0 || hasNextPage) && (
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
