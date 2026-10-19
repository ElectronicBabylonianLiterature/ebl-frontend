import { stringify } from 'common/utils/queryString'

export function buildFragmentSearchLink(provenanceName: string): string {
  return `/library/search?${stringify({ site: provenanceName })}`
}
