import { ChapterId } from 'transliteration/domain/chapter-id'

export type Dto = Record<string, unknown>

export class Expectation {
  method: 'POST' | 'GET' = 'GET'
  path = ''
  authenticate: boolean | undefined = false
  response: unknown = {}
  verify = false
  called = false
  body: unknown = null
  isBlob = false

  constructor(data: Partial<Expectation>) {
    Object.assign(this, data)
  }
}

export function leadingArguments(
  mock: jest.Mock,
  argumentCount: number,
): unknown[][] {
  return mock.mock.calls.map((call) => call.slice(0, argumentCount))
}

export interface TextUrlId {
  genre?: unknown
  category?: unknown
  index?: unknown
}

export function createTextUrl(id: TextUrlId): string {
  return `/texts/${id.genre}/${id.category}/${id.index}`
}

export function createChapterUrl(id: ChapterId): string {
  return `${createTextUrl(id.textId)}/chapters/${encodeURIComponent(
    id.stage,
  )}/${encodeURIComponent(id.name)}`
}
