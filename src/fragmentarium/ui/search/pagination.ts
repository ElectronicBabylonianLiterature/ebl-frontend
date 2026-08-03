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

function updateRawSearchParams(
  search: string,
  updates: ReadonlyMap<string, string>,
): string {
  const encodedUpdateKeys = new Set(
    [...updates.keys()].map((key) => encodeURIComponent(key)),
  )
  const params = search.replace(/^\?/, '').split('&').filter(Boolean)
  const usedKeys = new Set<string>()

  const nextParams = params.flatMap((searchParam) => {
    const [key] = searchParam.split('=')

    if (!encodedUpdateKeys.has(key)) {
      return [searchParam]
    }

    const updateKey = [...updates.keys()].find(
      (candidate) => encodeURIComponent(candidate) === key,
    )

    if (!updateKey || usedKeys.has(updateKey)) {
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
  return updateRawSearchParams(
    search,
    new Map([
      ['limit', String(getValidatedPageSize(limit))],
      [paginationURLParam, '0'],
    ]),
  )
}
