import _ from 'lodash'
import { parse } from 'common/utils/queryString'
import { ChapterEditSourceMode } from 'corpus/application/edit-lite/ChapterEditSource'

export const editLiteSourceModes: readonly ChapterEditSourceMode[] = [
  'auto',
  'legacy',
  'api',
]

export const defaultEditLiteSourceMode: ChapterEditSourceMode = 'auto'

export interface EditLiteParameters {
  readonly source: ChapterEditSourceMode
  readonly line: string | null
}

type Query = ReturnType<typeof parse>

function readParameter(query: Query, name: string): string {
  const value = query[name]
  return ((_.isArray(value) ? _.last(value) : value) ?? '').trim()
}

function readSourceMode(query: Query): ChapterEditSourceMode {
  const value = readParameter(query, 'source')
  return (
    editLiteSourceModes.find((mode) => mode === value) ??
    defaultEditLiteSourceMode
  )
}

export function parseEditLiteParameters(search: string): EditLiteParameters {
  const query = parse(search)
  return {
    source: readSourceMode(query),
    line: readParameter(query, 'line') || null,
  }
}
