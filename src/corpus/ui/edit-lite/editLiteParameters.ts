import _ from 'lodash'
import { parse, stringify } from 'common/utils/queryString'
import { ChapterEditSourceMode } from 'corpus/application/edit-lite/ChapterEditSource'
import { normalizePageSize } from 'corpus/ui/edit-lite/LinePager'

export const editLiteVariants = [
  'accordion',
  'pages',
  'split',
  'score',
] as const

export type EditLiteVariant = (typeof editLiteVariants)[number]

export const editLiteSourceModes: readonly ChapterEditSourceMode[] = [
  'auto',
  'legacy',
  'api',
]

export const defaultEditLiteVariant: EditLiteVariant = 'accordion'
export const defaultEditLiteSourceMode: ChapterEditSourceMode = 'auto'

export interface EditLiteParameters {
  readonly variant: EditLiteVariant
  readonly source: ChapterEditSourceMode
  readonly size: number
  readonly line: string | null
}

type Query = ReturnType<typeof parse>

const wholeNumber = /^\d+$/

function readParameter(query: Query, name: string): string {
  const value = query[name]
  return ((_.isArray(value) ? _.last(value) : value) ?? '').trim()
}

function readChoice<Choice extends string>(
  query: Query,
  name: string,
  choices: readonly Choice[],
  defaultChoice: Choice,
): Choice {
  const value = readParameter(query, name)
  return choices.find((choice) => choice === value) ?? defaultChoice
}

function readPageSize(query: Query): number {
  const value = readParameter(query, 'size')
  return normalizePageSize(wholeNumber.test(value) ? Number(value) : undefined)
}

export function parseEditLiteParameters(search: string): EditLiteParameters {
  const query = parse(search)
  return {
    variant: readChoice(
      query,
      'variant',
      editLiteVariants,
      defaultEditLiteVariant,
    ),
    source: readChoice(
      query,
      'source',
      editLiteSourceModes,
      defaultEditLiteSourceMode,
    ),
    size: readPageSize(query),
    line: readParameter(query, 'line') || null,
  }
}

export function withEditLiteVariant(
  search: string,
  variant: EditLiteVariant,
): string {
  return `?${stringify({ ...parse(search), variant })}`
}
