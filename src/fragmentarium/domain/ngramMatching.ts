import { ChapterId } from 'transliteration/domain/chapter-id'

export type NgramScore = ChapterId & {
  overlap: number
}
