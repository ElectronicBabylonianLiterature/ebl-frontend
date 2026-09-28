import { stringify } from 'query-string'

export function buildFragmentSearchLink(provenanceName: string): string {
  return `/library/search?${stringify({ site: provenanceName })}`
}
