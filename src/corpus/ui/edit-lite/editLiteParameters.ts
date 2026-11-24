import _ from 'lodash'
import { parse } from 'common/utils/queryString'

export interface EditLiteParameters {
  readonly line: string | null
}

type Query = ReturnType<typeof parse>

function readParameter(query: Query, name: string): string {
  const value = query[name]
  return ((_.isArray(value) ? _.last(value) : value) ?? '').trim()
}

export function parseEditLiteParameters(search: string): EditLiteParameters {
  return { line: readParameter(parse(search), 'line') || null }
}
