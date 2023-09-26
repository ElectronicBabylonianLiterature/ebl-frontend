import { ChapterId } from 'transliteration/domain/chapter-id'

export type NgramScore = ChapterId & {
  score: number
  textName: string
}
