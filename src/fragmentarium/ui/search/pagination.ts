export const paginationURLParam = 'paginationIndex'
export const RESULTS_PER_PAGE = 50

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
