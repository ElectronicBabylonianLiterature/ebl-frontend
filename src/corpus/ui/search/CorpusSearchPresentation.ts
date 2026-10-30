import { CorpusQueryItem, CorpusQueryResult } from 'query/QueryResult'
import {
  getLastPageIndex,
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
  return (
    data.hasNextPage === true ||
    data.items.length > pageSize ||
    (data.hasNextPage == null && data.items.length === pageSize)
  )
}

function formattedMatchCount(data: CorpusQueryResult): string | null {
  return typeof data.matchCountTotal === 'number'
    ? `${data.isMatchCountTotalExact === false ? 'about ' : ''}${data.matchCountTotal.toLocaleString()}`
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
    const lineInfo =
      count === null
        ? ''
        : `${count} matching line variant${data.matchCountTotal === 1 ? '' : 's'} in `
    const chapters = `${totalChapters.toLocaleString()} chapter${totalChapters === 1 ? '' : 's'}`
    return `Found ${lineInfo}${chapters}${range ? `. ${range}` : ''}`
  }
  if (pagination.pageIndex > 0) {
    const lineInfo =
      count === null ? '' : `Found ${count} matching line variants. `
    return `${lineInfo}${range}`
  }
  const lineInfo =
    count === null
      ? ''
      : `${count} line${data.matchCountTotal === 1 ? '' : 's'} in `
  const chapters = `${chapterCount.toLocaleString()} chapter${chapterCount === 1 ? '' : 's'}`
  return `Found ${lineInfo}${chapters}${hasNextPage ? '; more results are available' : ''}`
}

export function getCorpusSearchPresentation(
  data: CorpusQueryResult,
  pagination: SearchPagination,
): CorpusSearchPresentation {
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
