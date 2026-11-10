import { CorpusQueryItem, CorpusQueryResult } from 'query/QueryResult'
import {
  getLastPageIndex,
  hasNextPageAfter,
  RESULT_PAGE_SIZES,
  SearchPagination,
} from 'fragmentarium/ui/search/pagination'

export interface CorpusSearchPresentation {
  visibleChapters: CorpusQueryItem[]
  lastPageIndex: number | null
  hasNextPage: boolean
  summary: string
  showPaginationControls: boolean
}

function hasNextCorpusPage(
  data: CorpusQueryResult,
  { pageIndex, pageSize }: SearchPagination,
  lastPageIndex: number | null,
): boolean {
  if (lastPageIndex !== null) return pageIndex < lastPageIndex
  return hasNextPageAfter(data.items, pageSize, data.hasNextPage)
}

function withClientSidePagingWhenLimitIgnored(
  data: CorpusQueryResult,
  { pageIndex, pageSize }: SearchPagination,
): CorpusQueryResult {
  if (data.items.length <= pageSize + 1) return data
  const offset = pageIndex * pageSize
  return {
    ...data,
    items: data.items.slice(offset, offset + pageSize),
    totalChapters: data.items.length,
    hasNextPage: offset + pageSize < data.items.length,
  }
}

function formattedMatchCount(data: CorpusQueryResult): string | null {
  return typeof data.matchCountTotal === 'number'
    ? `${data.isMatchCountTotalExact === false ? 'about ' : ''}${data.matchCountTotal.toLocaleString()} matching line variant${data.matchCountTotal === 1 ? '' : 's'}`
    : null
}

function chapterRange(
  { pageIndex, pageSize }: SearchPagination,
  chapterCount: number,
  totalChapters: number | null,
): string {
  if (chapterCount === 0) {
    return pageIndex > 0 ? 'No chapters on this page' : ''
  }
  const first = (pageIndex * pageSize + 1).toLocaleString()
  const last = (pageIndex * pageSize + chapterCount).toLocaleString()
  const range = `Showing chapters ${first}-${last}`
  return totalChapters === null
    ? range
    : `${range} of ${totalChapters.toLocaleString()}`
}

function knownTotalSummary(
  count: string | null,
  totalChapters: number,
  range: string,
): string {
  const lineInfo = count === null ? '' : `${count} in `
  const chapters = `${totalChapters.toLocaleString()} chapter${totalChapters === 1 ? '' : 's'}`
  return `Found ${lineInfo}${chapters}${range ? `. ${range}` : ''}`
}

function unknownTotalSummary(
  count: string | null,
  chapterCount: number,
  range: string,
  hasNextPage: boolean,
): string {
  const chapterInfo =
    count === null
      ? `Found ${chapterCount.toLocaleString()} chapter${chapterCount === 1 ? '' : 's'}`
      : `Found ${count}. ${range || 'Showing 0 chapters'}`
  return `${chapterInfo}${hasNextPage ? '; more results are available' : ''}`
}

function corpusSummary(
  data: CorpusQueryResult,
  pagination: SearchPagination,
  chapterCount: number,
  totalChapters: number | null,
  hasNextPage: boolean,
): string {
  const count = formattedMatchCount(data)
  const range = chapterRange(pagination, chapterCount, totalChapters)
  if (totalChapters !== null) {
    return knownTotalSummary(count, totalChapters, range)
  }
  if (pagination.pageIndex > 0) {
    const lineInfo = count === null ? '' : `Found ${count}. `
    return `${lineInfo}${range}`
  }
  return unknownTotalSummary(count, chapterCount, range, hasNextPage)
}

export function getCorpusSearchPresentation(
  response: CorpusQueryResult,
  pagination: SearchPagination,
): CorpusSearchPresentation {
  const data = withClientSidePagingWhenLimitIgnored(response, pagination)
  const visibleChapters = data.items.slice(0, pagination.pageSize)
  const lastPageIndex = getLastPageIndex(
    data.totalChapters,
    pagination.pageSize,
  )
  const totalChapters =
    lastPageIndex === null ? null : (data.totalChapters as number)
  const chapterCount = visibleChapters.length
  const hasNextPage = hasNextCorpusPage(data, pagination, lastPageIndex)
  const showPaginationControls = !(
    pagination.pageIndex === 0 &&
    !hasNextPage &&
    chapterCount < RESULT_PAGE_SIZES[0]
  )
  return {
    visibleChapters,
    lastPageIndex,
    hasNextPage,
    summary: corpusSummary(
      data,
      pagination,
      chapterCount,
      totalChapters,
      hasNextPage,
    ),
    showPaginationControls,
  }
}
