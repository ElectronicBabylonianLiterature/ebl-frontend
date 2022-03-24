import romans from 'romans'

export interface TextId {
  readonly genre: string
  readonly category: number
  readonly index: number
}

export function textIdToString(id: TextId): string {
  return `${id.category && romans.romanize(id.category)}.${id.index}`
}

export function textIdToDoiString(id: TextId): string {
  return `10.5282/ebl/${id.genre.toLowerCase()}/${id.category}/${id.index}`
}
