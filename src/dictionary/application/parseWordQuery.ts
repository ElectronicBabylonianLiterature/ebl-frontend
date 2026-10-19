import { parse } from 'common/utils/queryString'
import { WordQuery } from 'dictionary/application/WordService'

type ParsedValue = string | null | readonly (string | null)[] | undefined

const textFields = ['word', 'meaning', 'root'] as const
const listFields = ['vowelClass', 'origin'] as const

function toTexts(value: ParsedValue): string[] {
  return ([] as (string | null | undefined)[])
    .concat(value)
    .filter((item): item is string => typeof item === 'string' && item !== '')
}

export default function parseWordQuery(search: string): WordQuery {
  const parsed = parse(search, { arrayFormat: 'none' })
  const query: WordQuery = {}
  textFields.forEach((field) => {
    const [text] = toTexts(parsed[field])
    if (text !== undefined) {
      query[field] = text
    }
  })
  listFields.forEach((field) => {
    const values = toTexts(parsed[field])
    if (values.length > 0) {
      query[field] = values
    }
  })
  return query
}
