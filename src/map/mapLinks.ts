import { stringify } from 'common/utils/queryString'

export function buildFragmentSearchLink(provenanceName: string): string {
  return `/library/search?${stringify({ site: provenanceName })}`
}

export function buildFindspotFragmentSearchLink(findspotId: number): string {
  return `/library/search?${stringify({ findspotId })}`
}
