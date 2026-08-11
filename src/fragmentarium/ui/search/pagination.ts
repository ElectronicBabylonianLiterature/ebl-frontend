import _ from 'lodash'
import { parse } from 'query-string'

export const paginationURLParam = 'paginationIndex'

export function getRequestedPaginationIndex(
  search: string,
): number | undefined {
  const query = parse(search, {
    parseNumbers: true,
  })
  const paginationIndex = _.isArray(query[paginationURLParam])
    ? query[paginationURLParam][0]
    : query[paginationURLParam]
  const parsedPaginationIndex = _.isNumber(paginationIndex)
    ? paginationIndex
    : Number(paginationIndex)

  return Number.isFinite(parsedPaginationIndex)
    ? Math.trunc(parsedPaginationIndex)
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
