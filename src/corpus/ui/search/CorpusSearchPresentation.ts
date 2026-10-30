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

export function getCorpusSearchPresentation(
  data: CorpusQueryResult,
  { pageIndex, pageSize }: SearchPagination,
): CorpusSearchPresentation {
  const visibleChapters = data.items.slice(0, pageSize)
  const lastPageIndex = getLastPageIndex(data.totalChapters, pageSize)
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
  return {
    visibleChapters,
    lastPageIndex,
    hasNextPage,
    summary,
    showPaginationControls,
  }
}
