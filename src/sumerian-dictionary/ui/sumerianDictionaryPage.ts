import { parse, stringify } from 'common/utils/queryString'
import {
  SumerianSourceFilter,
  SumerianWordKind,
} from 'sumerian-dictionary/domain/SumerianWordSummary'

export const sumerianDictionaryPath = '/tools/sumerian-dictionary'

export interface SumerianSearchState {
  readonly query: string
  readonly kind: SumerianWordKind
  readonly source: SumerianSourceFilter
}

const kinds: readonly SumerianWordKind[] = ['all', 'words', 'names']
const sources: readonly SumerianSourceFilter[] = ['any', 'attinger', 'epsd2']

function pick<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined {
  return allowed.find((candidate) => candidate === value)
}

export function getSumerianWordPageUrl(id: string): string {
  return `${sumerianDictionaryPath}/${encodeURIComponent(id)}`
}

export function parseSumerianSearch(search: string): SumerianSearchState {
  const parsed = parse(search)
  return {
    query: typeof parsed.query === 'string' ? parsed.query : '',
    kind: pick(parsed.kind, kinds) ?? 'all',
    source: pick(parsed.source, sources) ?? 'any',
  }
}

export function getSumerianSearchUrl(state: SumerianSearchState): string {
  const search = stringify(
    {
      query: state.query,
      kind: state.kind === 'all' ? '' : state.kind,
      source: state.source === 'any' ? '' : state.source,
    },
    { skipEmptyString: true },
  )
  return search ? `${sumerianDictionaryPath}?${search}` : sumerianDictionaryPath
}
