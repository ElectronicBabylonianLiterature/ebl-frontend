import romans from 'romans'

export interface TextId {
  readonly genre: string
  readonly category: number
  readonly index: number
}

export function textIdToString(id: TextId): string {
  return `${id.category && romans.romanize(id.category)}.${id.index}`
}
