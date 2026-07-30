export const paginationURLParam = 'paginationIndex'
export const RESULTS_PER_PAGE = 50
export const RESULT_PAGE_SIZES = [25, 50, 100] as const

export function getRequestedPaginationIndex(
  search: string,
): number | undefined {
  const paginationIndex = new URLSearchParams(search).get(paginationURLParam)
  const parsedPaginationIndex =
    paginationIndex === null || paginationIndex.trim() === ''
      ? Number.NaN
      : Number(paginationIndex)

  return Number.isInteger(parsedPaginationIndex) && parsedPaginationIndex >= 0
    ? parsedPaginationIndex
    : undefined
}

export function updatePaginationSearchParam(
  search: string,
  param: string,
  index: number,
): string {
  const params = search.replace(/^\?/, '').split('&').filter(Boolean)
  const paginationParam = `${encodeURIComponent(param)}=${encodeURIComponent(
    index.toString(),
  )}`
  let updated = false

  const nextParams = params.flatMap((searchParam) => {
    const [key] = searchParam.split('=')

    if (key !== encodeURIComponent(param)) {
      return [searchParam]
    }

    if (!updated) {
      updated = true
      return [paginationParam]
    }

    return []
  })

  if (!updated) {
    nextParams.push(paginationParam)
  }

  return nextParams.join('&')
}

export function getPageIndex(search: string): number {
  return getRequestedPaginationIndex(search) ?? 0
}

export function getValidatedPageSize(value: unknown): number {
  const parsedValue = Number(value)
  return RESULT_PAGE_SIZES.includes(
    parsedValue as (typeof RESULT_PAGE_SIZES)[number],
  )
    ? parsedValue
    : RESULTS_PER_PAGE
}

export function getPageIndexForOffset(offset: unknown, limit: unknown): number {
  const parsedOffset = Number(offset ?? 0)
  const parsedLimit = getValidatedPageSize(limit)
  return Number.isInteger(parsedOffset) && parsedOffset >= 0
    ? Math.floor(parsedOffset / parsedLimit)
    : 0
}

export function updatePageSizeSearchParam(
  search: string,
  limit: number,
): string {
  const params = new URLSearchParams(search)
  params.set('limit', String(getValidatedPageSize(limit)))
  params.set(paginationURLParam, '0')
  return params.toString()
}
