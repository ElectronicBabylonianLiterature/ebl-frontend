import _ from 'lodash'
import { parse } from 'common/utils/queryString'
import { FragmentQuery, FragmentSearchCriteria } from 'query/FragmentQuery'

export const paginationURLParam = 'paginationIndex'
export const pageSizeURLParam = 'limit'
export const RESULTS_PER_PAGE = 50
export const RESULT_PAGE_SIZES = [25, 50, 100] as const

export type SearchPagination = {
  readonly pageIndex: number
  readonly pageSize: number
}

export function getRequestedPaginationIndex(
  search: string,
): number | undefined {
  const paginationIndex = new URLSearchParams(search).get(paginationURLParam)
  const parsedPaginationIndex =
    paginationIndex === null || paginationIndex.trim() === ''
      ? Number.NaN
      : Number(paginationIndex)

  return Number.isSafeInteger(parsedPaginationIndex) &&
    parsedPaginationIndex >= 0
    ? parsedPaginationIndex
    : undefined
}

function updateRawSearchParams(
  search: string,
  updates: ReadonlyMap<string, string>,
): string {
  const params = search.replace(/^\?/, '').split('&').filter(Boolean)
  const usedKeys = new Set<string>()

  const nextParams = params.flatMap((searchParam) => {
    const [encodedKey] = searchParam.split('=')
    const updateKey = new URLSearchParams(`${encodedKey}=`).keys().next().value

    if (!updateKey || !updates.has(updateKey)) {
      return [searchParam]
    }

    if (usedKeys.has(updateKey)) {
      return []
    }

    usedKeys.add(updateKey)
    return [
      `${encodeURIComponent(updateKey)}=${encodeURIComponent(
        updates.get(updateKey) as string,
      )}`,
    ]
  })

  updates.forEach((value, key) => {
    if (!usedKeys.has(key)) {
      nextParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }
  })

  return nextParams.join('&')
}

export function updatePaginationSearchParam(
  search: string,
  param: string,
  index: number,
): string {
  return updateRawSearchParams(search, new Map([[param, index.toString()]]))
}

export function getPageIndex(search: string): number {
  return getRequestedPaginationIndex(search) ?? 0
}

export function getValidatedPageSize(
  value: number | string | null | undefined,
): number {
  const parsedValue = Number(value)
  return RESULT_PAGE_SIZES.includes(
    parsedValue as (typeof RESULT_PAGE_SIZES)[number],
  )
    ? parsedValue
    : RESULTS_PER_PAGE
}

export function parseSearchPagination(search: string): SearchPagination {
  const pageSize = getValidatedPageSize(
    new URLSearchParams(search).get(pageSizeURLParam),
  )
  const pageIndex = getPageIndex(search)
  return {
    pageIndex:
      pageIndex <=
      Math.floor((Number.MAX_SAFE_INTEGER - pageSize - 1) / pageSize)
        ? pageIndex
        : 0,
    pageSize,
  }
}

export function parseSearchCriteria(search: string): FragmentSearchCriteria {
  return _.omit(parse(search, { decode: true }), [
    paginationURLParam,
    pageSizeURLParam,
    'offset',
    'count',
  ]) as FragmentSearchCriteria
}

export function hasSearchCriteria(search: string): boolean {
  return !_.isEmpty(parseSearchCriteria(search))
}

export function isLineQuery(fragmentQuery: FragmentSearchCriteria): boolean {
  return Boolean(fragmentQuery.lemmas || fragmentQuery.transliteration)
}

export function createPagedFragmentQuery(
  fragmentQuery: FragmentSearchCriteria,
  { pageIndex, pageSize }: SearchPagination,
): FragmentQuery {
  return {
    ...fragmentQuery,
    limit: pageSize + 1,
    offset: pageIndex * pageSize,
    count: 'exact',
  }
}

export function hasNextPageAfter(
  items: readonly unknown[],
  pageSize: number,
  reportedHasNextPage: boolean | null | undefined,
): boolean {
  return reportedHasNextPage === true || items.length > pageSize
}

export function getLastPageIndex(
  totalDocuments: number | null | undefined,
  pageSize: number,
): number | null {
  return typeof totalDocuments === 'number' &&
    Number.isSafeInteger(totalDocuments) &&
    totalDocuments >= 0
    ? Math.max(0, Math.ceil(totalDocuments / pageSize) - 1)
    : null
}

export function getNumberedPageIndexes(
  activePage: number,
  lastPage: number,
): readonly (number | 'ellipsis')[] {
  const pages = new Set([0, lastPage])
  const start = Math.max(0, Math.min(activePage - 1, lastPage - 3))
  const end = Math.min(lastPage, Math.max(activePage + 1, 3))

  for (let page = start; page <= end; page += 1) {
    pages.add(page)
  }

  const sorted = [...pages].sort((first, second) => first - second)
  return sorted.flatMap((page, index) =>
    index > 0 && page - sorted[index - 1] > 1
      ? ['ellipsis' as const, page]
      : [page],
  )
}

export function updatePageSizeSearchParam(
  search: string,
  limit: number,
): string {
  return updateRawSearchParams(
    search,
    new Map([
      [pageSizeURLParam, String(getValidatedPageSize(limit))],
      [paginationURLParam, '0'],
    ]),
  )
}
